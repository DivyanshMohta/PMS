from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from bson import ObjectId

from database import (
    users_collection, reviews_collection,
    competencies_collection, development_plans_collection,
    goals_collection,
)
from models import (
    UserCreate, UserUpdate, UserResponse,
    ReviewCreate, ReviewUpdate, ReviewResponse,
    CompetencyCreate, CompetencyUpdate, CompetencyResponse,
    DevelopmentPlanCreate, DevelopmentPlanUpdate, DevelopmentPlanResponse,
    EmployeeGoalCreate, EmployeeGoalUpdate, EmployeeGoalResponse,
    LoginRequest, TokenResponse, PaginatedResponse,
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, hr_only, hr_manager, all_roles,
)

router = APIRouter()


# ── Utility ────────────────────────────────────────────────────────────────────
def _serialize(doc: dict) -> dict:
    """Convert ObjectId fields to strings for JSON serialization."""
    doc["_id"] = str(doc["_id"])
    return doc


async def _get_or_404(collection, object_id: str) -> dict:
    try:
        oid = ObjectId(object_id)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid ID format")
    doc = await collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _serialize(doc)


# ══════════════════════════════════════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════════════════════════════════════
@router.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
async def login(body: LoginRequest):
    collection = users_collection()
    user = await collection.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user["_id"] = str(user["_id"])
    token = create_access_token({"sub": user["_id"], "role": user["role"]})
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


@router.get("/auth/me", tags=["Auth"])
async def me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password_hash"}


# ══════════════════════════════════════════════════════════════════════════════
# PROFILE (self-service)
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/profile/me", tags=["Profile"])
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's own profile (no password hash)."""
    return {k: v for k, v in current_user.items() if k != "password_hash"}


@router.patch("/profile/me", tags=["Profile"])
async def update_my_profile(
    body: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Allow any authenticated user to update their own name, email, or title."""
    allowed_fields = {"name", "email", "title"}
    updates = {k: v for k, v in body.items() if k in allowed_fields and v is not None}

    if not updates:
        raise HTTPException(status_code=422, detail="No valid fields to update")

    collection = users_collection()

    # If email is being changed, ensure it's not already taken
    if "email" in updates and updates["email"] != current_user.get("email"):
        existing = await collection.find_one({"email": updates["email"]})
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use by another account")

    user_oid = ObjectId(current_user["_id"])
    await collection.find_one_and_update({"_id": user_oid}, {"$set": updates})
    updated = await collection.find_one({"_id": user_oid}, {"password_hash": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="User record not found in database — please re-seed.")
    return _serialize(updated)  # type: ignore


# ══════════════════════════════════════════════════════════════════════════════
# USERS
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/users", tags=["Users"])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    department: Optional[str] = None,
    role: Optional[str] = None,
    _: dict = Depends(hr_manager),
):
    collection = users_collection()
    query: dict = {}
    if department:
        query["department"] = department
    if role:
        query["role"] = role

    total = await collection.count_documents(query)
    cursor = collection.find(query, {"password_hash": 0}).skip(skip).limit(limit)
    items = [_serialize(doc) async for doc in cursor]
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/users", status_code=201, tags=["Users"])
async def create_user(body: UserCreate, _: dict = Depends(hr_only)):
    collection = users_collection()
    existing = await collection.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    doc = body.model_dump()
    doc["password_hash"] = hash_password(doc.pop("password"))
    result = await collection.insert_one(doc)
    created = await collection.find_one({"_id": result.inserted_id}, {"password_hash": 0})
    return _serialize(created)  # type: ignore


@router.get("/users/{user_id}", tags=["Users"])
async def get_user(user_id: str, current_user: dict = Depends(all_roles)):
    if current_user["_id"] != user_id and current_user["role"] not in ("HR", "Manager"):
        raise HTTPException(status_code=403, detail="Forbidden")
    collection = users_collection()
    doc = await _get_or_404(collection, user_id)
    doc.pop("password_hash", None)
    return doc


@router.patch("/users/{user_id}", tags=["Users"])
async def update_user(user_id: str, body: UserUpdate, _: dict = Depends(hr_only)):
    collection = users_collection()
    await _get_or_404(collection, user_id)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=422, detail="No fields to update")
    await collection.find_one_and_update({"_id": ObjectId(user_id)}, {"$set": updates})
    updated = await collection.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    return _serialize(updated)  # type: ignore


@router.delete("/users/{user_id}", status_code=204, tags=["Users"])
async def delete_user(user_id: str, _: dict = Depends(hr_only)):
    collection = users_collection()
    await _get_or_404(collection, user_id)
    await collection.delete_one({"_id": ObjectId(user_id)})


# ══════════════════════════════════════════════════════════════════════════════
# REVIEWS
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/reviews", tags=["Reviews"])
async def list_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    period: Optional[str] = None,
    current_user: dict = Depends(all_roles),
):
    collection = reviews_collection()
    query: dict = {}

    if current_user["role"] == "Employee":
        query["employee_id"] = current_user["_id"]
    else:
        if employee_id:
            query["employee_id"] = employee_id

    if status:
        query["status"] = status
    if period:
        query["period"] = period

    total = await collection.count_documents(query)
    cursor = collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    items = [_serialize(doc) async for doc in cursor]
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/reviews", status_code=201, tags=["Reviews"])
async def create_review(body: ReviewCreate, current_user: dict = Depends(hr_manager)):
    from datetime import datetime
    collection = reviews_collection()
    doc = body.model_dump()
    doc["created_at"] = datetime.utcnow()
    print(f"[REVIEWS] Creating review for employee={doc.get('employee_id')} period={doc.get('period')} by user={current_user.get('_id')}")
    result = await collection.insert_one(doc)
    created = await collection.find_one({"_id": result.inserted_id})
    print(f"[REVIEWS] Saved with _id={result.inserted_id}")
    return _serialize(created)  # type: ignore


@router.get("/reviews/{review_id}", tags=["Reviews"])
async def get_review(review_id: str, current_user: dict = Depends(all_roles)):
    collection = reviews_collection()
    doc = await _get_or_404(collection, review_id)
    if current_user["role"] == "Employee" and doc["employee_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return doc


@router.patch("/reviews/{review_id}", tags=["Reviews"])
async def update_review(review_id: str, body: ReviewUpdate, _: dict = Depends(hr_manager)):
    collection = reviews_collection()
    await _get_or_404(collection, review_id)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates.get("goals"):
        updates["goals"] = [g.model_dump() if hasattr(g, "model_dump") else g for g in updates["goals"]]
    if updates.get("competency_scores"):
        updates["competency_scores"] = [c.model_dump() if hasattr(c, "model_dump") else c for c in updates["competency_scores"]]
    await collection.find_one_and_update({"_id": ObjectId(review_id)}, {"$set": updates})
    updated = await collection.find_one({"_id": ObjectId(review_id)})
    return _serialize(updated)  # type: ignore


@router.delete("/reviews/{review_id}", status_code=204, tags=["Reviews"])
async def delete_review(review_id: str, _: dict = Depends(hr_manager)):
    collection = reviews_collection()
    await _get_or_404(collection, review_id)
    await collection.delete_one({"_id": ObjectId(review_id)})


# ══════════════════════════════════════════════════════════════════════════════
# COMPETENCIES
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/competencies", tags=["Competencies"])
async def list_competencies(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = None,
    search: Optional[str] = None,
    _: dict = Depends(all_roles),
):
    collection = competencies_collection()
    query: dict = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    total = await collection.count_documents(query)
    cursor = collection.find(query).skip(skip).limit(limit)
    items = [_serialize(doc) async for doc in cursor]
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/competencies", status_code=201, tags=["Competencies"])
async def create_competency(body: CompetencyCreate, _: dict = Depends(hr_only)):
    collection = competencies_collection()
    result = await collection.insert_one(body.model_dump())
    created = await collection.find_one({"_id": result.inserted_id})
    return _serialize(created)  # type: ignore


@router.get("/competencies/{competency_id}", tags=["Competencies"])
async def get_competency(competency_id: str, _: dict = Depends(all_roles)):
    return await _get_or_404(competencies_collection(), competency_id)


@router.patch("/competencies/{competency_id}", tags=["Competencies"])
async def update_competency(competency_id: str, body: CompetencyUpdate, _: dict = Depends(hr_only)):
    collection = competencies_collection()
    await _get_or_404(collection, competency_id)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    await collection.find_one_and_update({"_id": ObjectId(competency_id)}, {"$set": updates})
    updated = await collection.find_one({"_id": ObjectId(competency_id)})
    return _serialize(updated)  # type: ignore


@router.delete("/competencies/{competency_id}", status_code=204, tags=["Competencies"])
async def delete_competency(competency_id: str, _: dict = Depends(hr_only)):
    collection = competencies_collection()
    await _get_or_404(collection, competency_id)
    await collection.delete_one({"_id": ObjectId(competency_id)})


# ══════════════════════════════════════════════════════════════════════════════
# DEVELOPMENT PLANS
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/development-plans", tags=["Development Plans"])
async def list_development_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    employee_id: Optional[str] = None,
    plan_status: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(all_roles),
):
    collection = development_plans_collection()
    query: dict = {}

    if current_user["role"] == "Employee":
        query["employee_id"] = current_user["_id"]
    else:
        if employee_id:
            query["employee_id"] = employee_id

    if plan_status:
        query["status"] = plan_status

    total = await collection.count_documents(query)
    cursor = collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    items = [_serialize(doc) async for doc in cursor]
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/development-plans", status_code=201, tags=["Development Plans"])
async def create_development_plan(body: DevelopmentPlanCreate, _: dict = Depends(hr_manager)):
    from datetime import datetime
    collection = development_plans_collection()
    doc = body.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await collection.insert_one(doc)
    created = await collection.find_one({"_id": result.inserted_id})
    return _serialize(created)  # type: ignore


@router.get("/development-plans/{plan_id}", tags=["Development Plans"])
async def get_development_plan(plan_id: str, current_user: dict = Depends(all_roles)):
    collection = development_plans_collection()
    doc = await _get_or_404(collection, plan_id)
    if current_user["role"] == "Employee" and doc["employee_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return doc


@router.patch("/development-plans/{plan_id}", tags=["Development Plans"])
async def update_development_plan(plan_id: str, body: DevelopmentPlanUpdate, _: dict = Depends(hr_manager)):
    collection = development_plans_collection()
    await _get_or_404(collection, plan_id)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    await collection.find_one_and_update({"_id": ObjectId(plan_id)}, {"$set": updates})
    updated = await collection.find_one({"_id": ObjectId(plan_id)})
    return _serialize(updated)  # type: ignore


@router.delete("/development-plans/{plan_id}", status_code=204, tags=["Development Plans"])
async def delete_development_plan(plan_id: str, _: dict = Depends(hr_manager)):
    collection = development_plans_collection()
    await _get_or_404(collection, plan_id)
    await collection.delete_one({"_id": ObjectId(plan_id)})


# ══════════════════════════════════════════════════════════════════════════════
# EMPLOYEE GOALS
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/goals", tags=["Goals"])
async def list_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    employee_id: Optional[str] = None,
    current_user: dict = Depends(all_roles),
):
    """List goals for the authenticated user by default.

    Managers and HR can request a specific employee's goals for review
    workflows, but employees are always limited to their own goals.
    """
    collection = goals_collection()
    query: dict = {}

    if employee_id:
        if current_user["role"] == "Employee":
            query["employee_id"] = current_user["_id"]
        elif current_user["role"] == "Manager":
            if employee_id == current_user["_id"]:
                query["employee_id"] = employee_id
            else:
                target_user = await users_collection().find_one({"_id": ObjectId(employee_id)})
                if not target_user or target_user.get("manager_id") != current_user["_id"]:
                    raise HTTPException(status_code=403, detail="Forbidden")
                query["employee_id"] = employee_id
        else:
            query["employee_id"] = employee_id
    else:
        query["employee_id"] = current_user["_id"]

    total = await collection.count_documents(query)
    cursor = collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
    items = [_serialize(doc) async for doc in cursor]
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/goals", status_code=201, tags=["Goals"])
async def create_goal(body: EmployeeGoalCreate, current_user: dict = Depends(all_roles)):
    """Create a goal for the authenticated user only."""
    from datetime import datetime

    if body.employee_id != current_user["_id"]:
        raise HTTPException(status_code=403, detail="You can only create goals for your own profile")
    
    collection = goals_collection()
    doc = body.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await collection.insert_one(doc)
    created = await collection.find_one({"_id": result.inserted_id})
    print(f"[GOALS] Created goal for {body.employee_name}: {body.title}")
    return _serialize(created)  # type: ignore


@router.get("/goals/{goal_id}", tags=["Goals"])
async def get_goal(goal_id: str, current_user: dict = Depends(all_roles)):
    collection = goals_collection()
    doc = await _get_or_404(collection, goal_id)
    if current_user["role"] == "Employee" and doc["employee_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return doc


@router.patch("/goals/{goal_id}", tags=["Goals"])
async def update_goal(goal_id: str, body: EmployeeGoalUpdate, current_user: dict = Depends(all_roles)):
    """Update a goal only if it belongs to the authenticated user.

    Manager ratings are still written through this endpoint, but the goal owner
    must match the authenticated user for direct edits.
    """
    collection = goals_collection()
    doc = await _get_or_404(collection, goal_id)
    
    if doc["employee_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="You can only update your own goals")
    
    from datetime import datetime
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if "manager_rating" in updates and updates["manager_rating"] is not None:
        updates["manager_id"] = current_user["_id"]
        updates["rated_at"] = datetime.utcnow().isoformat()
    
    await collection.find_one_and_update({"_id": ObjectId(goal_id)}, {"$set": updates})
    updated = await collection.find_one({"_id": ObjectId(goal_id)})
    return _serialize(updated)  # type: ignore


@router.delete("/goals/{goal_id}", status_code=204, tags=["Goals"])
async def delete_goal(goal_id: str, current_user: dict = Depends(all_roles)):
    """Delete a goal only if it belongs to the authenticated user."""
    collection = goals_collection()
    doc = await _get_or_404(collection, goal_id)
    
    if doc["employee_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own goals")
    
    await collection.delete_one({"_id": ObjectId(goal_id)})
