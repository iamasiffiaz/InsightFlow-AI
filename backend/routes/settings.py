from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import BusinessSettings, User
from routes.auth import get_current_user
from schemas import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    settings = db.query(BusinessSettings).filter(BusinessSettings.user_id == user.id).first()
    if not settings:
        settings = BusinessSettings(user_id=user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("", response_model=SettingsOut)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    settings = db.query(BusinessSettings).filter(BusinessSettings.user_id == user.id).first()
    if not settings:
        settings = BusinessSettings(user_id=user.id)
        db.add(settings)
        db.flush()

    for key, value in payload.model_dump(exclude_unset=True).items():
        if isinstance(value, str):
            value = value.strip()
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings
