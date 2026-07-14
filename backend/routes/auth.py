"""JWT authentication with demo-friendly fallback for portfolio walkthroughs."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import get_settings
from database import get_db
from models import BusinessSettings, User
from schemas import Token, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)
settings = get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": subject, "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the authenticated user from JWT, falling back to the demo account."""
    if credentials and credentials.credentials:
        email = decode_token(credentials.credentials)
        if email:
            user = get_user_by_email(db, email)
            if user:
                return user

    demo = get_user_by_email(db, "demo@insightflow.ai")
    if demo:
        return demo

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Log in or run: python seed.py",
    )


@router.post("/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.flush()
    db.add(
        BusinessSettings(
            user_id=user.id,
            business_name=f"{payload.full_name.strip()}'s Business",
        )
    )
    db.commit()
    db.refresh(user)

    token = create_access_token(user.email)
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        if payload.email.lower() == "demo@insightflow.ai" and payload.password == "demo1234":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Demo user missing. Run: python seed.py",
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user.email)
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/mock-login", response_model=Token)
def mock_login(db: Session = Depends(get_db)):
    """One-click demo login for portfolio walkthroughs."""
    user = get_user_by_email(db, "demo@insightflow.ai")
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Run: python seed.py")
    token = create_access_token(user.email)
    return Token(access_token=token, user=UserOut.model_validate(user))
