from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Insight, Project
from schemas import InsightGenerateRequest, InsightOut
from services import ai_service

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=list[InsightOut])
def list_insights(project_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Insight)
    if project_id is not None:
        query = query.filter(Insight.project_id == project_id)
    return query.order_by(Insight.created_at.desc()).all()


@router.get("/{insight_id}", response_model=InsightOut)
def get_insight(insight_id: int, db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    return insight


@router.post("/generate", response_model=InsightOut, status_code=201)
async def generate_insight(payload: InsightGenerateRequest, db: Session = Depends(get_db)):
    project_context = None
    if payload.project_id:
        project = db.query(Project).filter(Project.id == payload.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        project_context = {
            "name": project.name,
            "business_type": project.business_type,
            "goal": project.goal,
            "description": project.description,
        }

    generated = await ai_service.generate_business_insight(payload.input_text, project_context)
    insight = Insight(
        project_id=payload.project_id,
        input_text=payload.input_text,
        **generated,
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


@router.delete("/{insight_id}", status_code=204)
def delete_insight(insight_id: int, db: Session = Depends(get_db)):
    insight = db.query(Insight).filter(Insight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    db.delete(insight)
    db.commit()
    return None
