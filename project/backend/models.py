from __future__ import annotations
from typing import Annotated, Any, Optional, List
from pydantic import BaseModel, BeforeValidator, Field
from datetime import datetime
from enum import Enum

# ── ObjectId handling ──────────────────────────────────────────────────────────
def _coerce_objectid(v: Any) -> str:
    """Accept a MongoDB ObjectId or plain string and return a string."""
    if hasattr(v, "__str__"):
        return str(v)
    raise ValueError(f"Cannot coerce {type(v)} to str")

PyObjectId = Annotated[str, BeforeValidator(_coerce_objectid)]


# ── Enumerations ───────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    Admin = "Admin"
    HR = "HR"
    Manager = "Manager"
    Employee = "Employee"


class ReviewStatus(str, Enum):
    Draft = "Draft"
    InProgress = "In Progress"
    Completed = "Completed"
    Acknowledged = "Acknowledged"


class GoalStatus(str, Enum):
    NotStarted = "Not Started"
    InProgress = "In Progress"
    Completed = "Completed"
    AtRisk = "At Risk"


class PlanStatus(str, Enum):
    Active = "Active"
    Completed = "Completed"
    OnHold = "On Hold"


class TrainingType(str, Enum):
    Course = "Course"
    Certification = "Certification"
    Workshop = "Workshop"
    Mentoring = "Mentoring"


class TrainingStatus(str, Enum):
    Planned = "Planned"
    InProgress = "In Progress"
    Completed = "Completed"


# ── Sub-models ─────────────────────────────────────────────────────────────────
class Goal(BaseModel):
    id: str
    title: str
    description: str
    progress: int = Field(ge=0, le=100, default=0)
    due_date: str
    status: GoalStatus = GoalStatus.NotStarted
    weight: int = Field(ge=0, le=100, default=0)


class CompetencyScore(BaseModel):
    competency_id: str
    name: str
    current: float = Field(ge=0, le=4)
    target: float = Field(ge=0, le=4)


class CompetencyLevel(BaseModel):
    level: int = Field(ge=1, le=4)
    label: str
    description: str


class Milestone(BaseModel):
    id: str
    title: str
    due_date: str
    completed: bool = False


class TrainingRecord(BaseModel):
    id: str
    title: str
    provider: str
    type: TrainingType
    status: TrainingStatus = TrainingStatus.Planned
    completed_date: Optional[str] = None
    score: Optional[int] = None
    credential_url: Optional[str] = None


# ── User ───────────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole
    department: str
    title: str
    manager_id: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    role: Optional[UserRole] = None
    manager_id: Optional[str] = None


class UserResponse(UserBase):
    id: PyObjectId = Field(alias="_id")

    model_config = {"populate_by_name": True}


# ── Review ─────────────────────────────────────────────────────────────────────
class ReviewBase(BaseModel):
    employee_id: str
    employee_name: str
    reviewer_id: str
    reviewer_name: str
    period: str
    status: ReviewStatus = ReviewStatus.Completed
    overall_score: float = Field(ge=0, le=5, default=0)
    goals: List[Goal] = []
    competency_scores: List[CompetencyScore] = []
    notes: str = ""


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    status: Optional[ReviewStatus] = None
    overall_score: Optional[float] = None
    goals: Optional[List[Goal]] = None
    competency_scores: Optional[List[CompetencyScore]] = None
    submitted_at: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: PyObjectId = Field(alias="_id")
    submitted_at: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


# ── Competency ─────────────────────────────────────────────────────────────────
class CompetencyBase(BaseModel):
    name: str
    category: str
    description: str
    levels: List[CompetencyLevel] = []
    applicable_roles: List[str] = []


class CompetencyCreate(CompetencyBase):
    pass


class CompetencyUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    levels: Optional[List[CompetencyLevel]] = None
    applicable_roles: Optional[List[str]] = None


class CompetencyResponse(CompetencyBase):
    id: PyObjectId = Field(alias="_id")

    model_config = {"populate_by_name": True}


# ── Development Plan ───────────────────────────────────────────────────────────
class DevelopmentPlanBase(BaseModel):
    employee_id: str
    employee_name: str
    title: str
    target_role: str
    start_date: str
    end_date: str
    status: PlanStatus = PlanStatus.Active
    overall_progress: int = Field(ge=0, le=100, default=0)
    milestones: List[Milestone] = []
    trainings: List[TrainingRecord] = []


class DevelopmentPlanCreate(DevelopmentPlanBase):
    pass


class DevelopmentPlanUpdate(BaseModel):
    title: Optional[str] = None
    target_role: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[PlanStatus] = None
    overall_progress: Optional[int] = None
    milestones: Optional[List[Milestone]] = None
    trainings: Optional[List[TrainingRecord]] = None


class DevelopmentPlanResponse(DevelopmentPlanBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


# ── Auth ───────────────────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class LoginRequest(BaseModel):
    email: str
    password: str


# ── Pagination wrapper ─────────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: list
    total: int
    skip: int
    limit: int
