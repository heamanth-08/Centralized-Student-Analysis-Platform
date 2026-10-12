from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, AuditLog
from app.schemas.schemas import UserOut, UserCreate, UserUpdate
from app.services.auth_service import get_password_hash
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), current_user = Depends(require_roles("admin"))):
    return db.query(User).order_by(User.id.asc()).all()

@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail={"error": {"code": "ALREADY_EXISTS", "message": "Username or email in use"}})

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        department_id=payload.department_id,
        is_active=payload.is_active
    )
    db.add(user)
    db.flush()

    audit = AuditLog(
        user_id=current_user.id,
        action="user_create",
        entity_type="User",
        entity_id=str(user.id),
        details_json=f'{{"username": "{user.username}", "role": "{user.role}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{id}", response_model=UserOut)
def update_user(
    id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Protection rule: Admin cannot remove their own last administrator role or deactivate themselves
    if user.id == current_user.id:
        if payload.role and payload.role != "admin":
            raise HTTPException(status_code=400, detail="Cannot demote your own administrator account")
        if payload.is_active is False:
            raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account")

    if payload.full_name:
        user.full_name = payload.full_name
    if payload.email:
        user.email = payload.email
    if payload.role:
        user.role = payload.role
    if payload.department_id is not None:
        user.department_id = payload.department_id
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    audit = AuditLog(
        user_id=current_user.id,
        action="user_update",
        entity_type="User",
        entity_id=str(user.id),
        details_json=f'{{"username": "{user.username}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user
