from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

ProjectStatus = Literal["Planning", "Active", "Paused", "Completed"]
TaskPriority = Literal["Low", "Medium", "High"]
TaskStatus = Literal["Pending", "In Progress", "Completed"]


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Projects ──────────────────────────────────────────────────────────────────
class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    business_type: str = Field(min_length=1, max_length=120)
    description: str
    goal: str
    status: ProjectStatus = "Planning"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    business_type: str | None = None
    description: str | None = None
    goal: str | None = None
    status: ProjectStatus | None = None


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None


# ── Tasks ─────────────────────────────────────────────────────────────────────
class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    project_id: int | None = None
    priority: TaskPriority = "Medium"
    status: TaskStatus = "Pending"
    due_date: date | None = None
    source: str = "manual"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    project_id: int | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    due_date: date | None = None


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None


# ── Insights ──────────────────────────────────────────────────────────────────
class InsightGenerateRequest(BaseModel):
    input_text: str = Field(min_length=10)
    project_id: int | None = None


class InsightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int | None
    input_text: str
    summary: str
    key_insights: str
    opportunities: str
    risks: str
    next_actions: str
    priority_level: str
    created_at: datetime | None = None


# ── Reports ───────────────────────────────────────────────────────────────────
class ReportGenerateRequest(BaseModel):
    project_id: int


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    executive_summary: str
    market_opportunity: str
    product_recommendations: str
    growth_suggestions: str
    operational_improvements: str
    next_steps: str
    created_at: datetime | None = None


# ── Recommendations ───────────────────────────────────────────────────────────
class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: str
    priority: str
    related_project_id: int | None
    status: str
    created_at: datetime | None = None


class RecommendationGenerateRequest(BaseModel):
    refresh: bool = True


# ── Settings ──────────────────────────────────────────────────────────────────
class SettingsUpdate(BaseModel):
    business_name: str | None = None
    industry: str | None = None
    default_project_type: str | None = None
    ai_provider: str | None = None
    api_key_placeholder: str | None = None
    theme: str | None = None


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    business_name: str
    industry: str
    default_project_type: str
    ai_provider: str
    api_key_placeholder: str
    theme: str
    updated_at: datetime | None = None


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_projects: int
    total_insights: int
    active_tasks: int
    completed_reports: int
    projects_by_status: dict[str, int]
    tasks_by_status: dict[str, int]
    tasks_by_priority: dict[str, int]
    insights_over_time: list[dict]
    recent_activity: list[dict]
