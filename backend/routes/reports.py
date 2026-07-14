from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Insight, Project, Report, Task
from schemas import ReportGenerateRequest, ReportOut
from services.report_service import build_project_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportOut])
def list_reports(project_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if project_id is not None:
        query = query.filter(Report.project_id == project_id)
    return query.order_by(Report.created_at.desc()).all()


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/generate", response_model=ReportOut, status_code=201)
async def generate_report(payload: ReportGenerateRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = db.query(Task).filter(Task.project_id == project.id).all()
    insights = db.query(Insight).filter(Insight.project_id == project.id).all()

    project_data = {
        "id": project.id,
        "name": project.name,
        "business_type": project.business_type,
        "description": project.description,
        "goal": project.goal,
        "status": project.status,
    }
    task_data = [
        {"title": t.title, "status": t.status, "priority": t.priority, "description": t.description}
        for t in tasks
    ]
    insight_data = [
        {"summary": i.summary, "priority_level": i.priority_level, "key_insights": i.key_insights}
        for i in insights
    ]

    generated = await build_project_report(project_data, task_data, insight_data)
    report = Report(project_id=project.id, **generated)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}", status_code=204)
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return None
