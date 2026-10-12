from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SupportIntervention, Student, AuditLog
from app.schemas.schemas import SupportFlagOut, InterventionCreate, InterventionUpdate, SupportInterventionOut
from app.services.analytics_service import get_support_flags
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/support", tags=["Student Support"])

@router.get("/flags", response_model=List[SupportFlagOut])
def list_support_flags(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    flags = get_support_flags(db)
    # Coordinator scoping
    if current_user.role == "coordinator" and current_user.department_id:
        dept_name = current_user.department.name if current_user.department else None
        if dept_name:
            flags = [f for f in flags if f.get("department_name") == dept_name]
    return flags

@router.post("/interventions", response_model=SupportInterventionOut)
def record_intervention(
    payload: InterventionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "faculty", "coordinator"))
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Student not found"}})

    intervention = SupportIntervention(
        student_id=payload.student_id,
        flag_reason=payload.flag_reason,
        intervention_type=payload.intervention_type,
        status="open",
        notes=payload.notes,
        action_taken_by_id=current_user.id
    )
    db.add(intervention)
    db.flush()

    audit = AuditLog(
        user_id=current_user.id,
        action="intervention_create",
        entity_type="SupportIntervention",
        entity_id=str(intervention.id),
        details_json=f'{{"student_id": {payload.student_id}, "type": "{payload.intervention_type}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(intervention)

    return SupportInterventionOut(
        id=intervention.id,
        student_id=intervention.student_id,
        student_name=student.full_name,
        student_roll=student.roll_number,
        flag_reason=intervention.flag_reason,
        intervention_type=intervention.intervention_type,
        status=intervention.status,
        notes=intervention.notes,
        action_taken_by_name=current_user.full_name,
        created_at=intervention.created_at,
        updated_at=intervention.updated_at
    )

@router.patch("/interventions/{id}", response_model=SupportInterventionOut)
def update_intervention(
    id: int,
    payload: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "faculty", "coordinator"))
):
    intervention = db.query(SupportIntervention).filter(SupportIntervention.id == id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Intervention not found"}})

    if payload.status:
        intervention.status = payload.status
    if payload.notes:
        intervention.notes = payload.notes

    audit = AuditLog(
        user_id=current_user.id,
        action="intervention_update",
        entity_type="SupportIntervention",
        entity_id=str(intervention.id),
        details_json=f'{{"status": "{intervention.status}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(intervention)

    return SupportInterventionOut(
        id=intervention.id,
        student_id=intervention.student_id,
        student_name=intervention.student.full_name if intervention.student else "",
        student_roll=intervention.student.roll_number if intervention.student else "",
        flag_reason=intervention.flag_reason,
        intervention_type=intervention.intervention_type,
        status=intervention.status,
        notes=intervention.notes,
        action_taken_by_name=intervention.action_taken_by.full_name if intervention.action_taken_by else "Staff",
        created_at=intervention.created_at,
        updated_at=intervention.updated_at
    )
