from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Project, Recommendation, Report, Task
from schemas import RecommendationGenerateRequest, RecommendationOut
from services import ai_service

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=list[RecommendationOut])
def list_recommendations(db: Session = Depends(get_db)):
    return db.query(Recommendation).order_by(Recommendation.created_at.desc()).all()


@router.post("/generate", response_model=list[RecommendationOut])
async def generate_recommendations(
    payload: RecommendationGenerateRequest | None = None,
    db: Session = Depends(get_db),
):
    projects = db.query(Project).all()
    tasks = db.query(Task).all()
    reports = db.query(Report).all()

    project_data = [
        {
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "goal": p.goal,
            "business_type": p.business_type,
        }
        for p in projects
    ]
    task_data = [
        {"title": t.title, "status": t.status, "priority": t.priority, "project_id": t.project_id}
        for t in tasks
    ]
    report_data = [{"id": r.id, "title": r.title, "project_id": r.project_id} for r in reports]

    generated = await ai_service.generate_recommendations(project_data, task_data, report_data)

    if payload is None or payload.refresh:
        db.query(Recommendation).delete()
        db.commit()

    saved: list[Recommendation] = []
    for item in generated:
        rec = Recommendation(
            title=item.get("title", "Recommendation"),
            description=item.get("description", ""),
            category=item.get("category", "Strategy"),
            priority=item.get("priority", "Medium"),
            related_project_id=item.get("related_project_id"),
            status="New",
        )
        db.add(rec)
        saved.append(rec)

    db.commit()
    for rec in saved:
        db.refresh(rec)
    return saved
