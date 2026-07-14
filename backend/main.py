from collections import Counter, defaultdict
from datetime import datetime, timezone

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config import get_settings
from database import Base, engine, get_db
from models import Insight, Project, Report, Task
from routes import auth, insights, projects, recommendations, reports, settings as settings_routes, tasks
from schemas import DashboardStats

app_settings = get_settings()

app = FastAPI(
    title=app_settings.app_name,
    description="AI-powered business insights SaaS MVP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if app_settings.app_env == "development" else app_settings.cors_origin_list,
    allow_credentials=False if app_settings.app_env == "development" else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(settings_routes.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": app_settings.app_name,
        "ai_enabled": app_settings.has_ai_key,
    }


@app.get("/api/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    projects_all = db.query(Project).all()
    tasks_all = db.query(Task).all()
    insights_all = db.query(Insight).order_by(Insight.created_at.desc()).all()
    reports_all = db.query(Report).order_by(Report.created_at.desc()).all()

    projects_by_status = Counter(p.status for p in projects_all)
    tasks_by_status = Counter(t.status for t in tasks_all)
    tasks_by_priority = Counter(t.priority for t in tasks_all)

    insights_by_day: dict[str, int] = defaultdict(int)
    for insight in insights_all:
        if insight.created_at:
            day = insight.created_at.strftime("%Y-%m-%d")
            insights_by_day[day] += 1

    insights_over_time = [
        {"date": day, "count": count}
        for day, count in sorted(insights_by_day.items())
    ]
    if not insights_over_time:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        insights_over_time = [{"date": today, "count": 0}]

    recent_activity: list[dict] = []
    for insight in insights_all[:5]:
        recent_activity.append(
            {
                "type": "insight",
                "title": insight.summary[:80] + ("..." if len(insight.summary) > 80 else ""),
                "created_at": insight.created_at.isoformat() if insight.created_at else None,
            }
        )
    for report in reports_all[:3]:
        recent_activity.append(
            {
                "type": "report",
                "title": report.title,
                "created_at": report.created_at.isoformat() if report.created_at else None,
            }
        )
    for task in sorted(tasks_all, key=lambda t: t.created_at or datetime.min, reverse=True)[:5]:
        recent_activity.append(
            {
                "type": "task",
                "title": task.title,
                "created_at": task.created_at.isoformat() if task.created_at else None,
            }
        )

    recent_activity.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    active_tasks = sum(1 for t in tasks_all if t.status in ("Pending", "In Progress"))

    return DashboardStats(
        total_projects=len(projects_all),
        total_insights=len(insights_all),
        active_tasks=active_tasks,
        completed_reports=len(reports_all),  # total saved reports (KPI label: Reports)
        projects_by_status=dict(projects_by_status),
        tasks_by_status=dict(tasks_by_status),
        tasks_by_priority=dict(tasks_by_priority),
        insights_over_time=insights_over_time,
        recent_activity=recent_activity[:12],
    )
