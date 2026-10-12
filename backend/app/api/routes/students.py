import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.models import Student, Department, AuditLog
from app.schemas.schemas import (
    StudentOut, StudentDetailOut, StudentCreate, StudentUpdate, StudentStatusUpdate,
    PaginatedResponse, AcademicRecordOut, AttendanceRecordOut, StrideTransactionOut,
    SupportInterventionOut
)
from app.services.analytics_service import calculate_student_cgpa, get_student_aggregate_attendance
from app.services.stride_service import calculate_stride_balance
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=PaginatedResponse[StudentOut])
def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Student)

    # Coordinator role scoping: view only own department
    if current_user.role == "coordinator" and current_user.department_id:
        query = query.filter(Student.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(Student.department_id == department_id)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(Student.roll_number.ilike(s), Student.full_name.ilike(s), Student.email.ilike(s)))

    if semester:
        query = query.filter(Student.current_semester == semester)

    if status:
        query = query.filter(Student.status == status)

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(Student.roll_number.asc()).offset(offset).limit(page_size).all()

    # Populate department_name
    student_outs = []
    for s in items:
        out = StudentOut.model_validate(s)
        out.department_name = s.department.name if s.department else None
        student_outs.append(out)

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return {
        "items": student_outs,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{student_id}", response_model=StudentDetailOut)
def get_student_detail(
    student_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "NOT_FOUND", "message": f"Student with ID {student_id} not found", "details": []}}
        )

    # Enforce coordinator scoping
    if current_user.role == "coordinator" and current_user.department_id and student.department_id != current_user.department_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": {"code": "FORBIDDEN", "message": "Cannot view students outside your department", "details": []}}
        )

    cgpa = calculate_student_cgpa(student.academic_records)
    _, _, att_pct = get_student_aggregate_attendance(student.attendance_records)
    stride_balance, stride_earned = calculate_stride_balance(db, student.id)

    # Format academic records
    acad_outs = []
    for r in student.academic_records:
        acad_outs.append(AcademicRecordOut(
            id=r.id,
            course_id=r.course_id,
            course_code=r.course.code if r.course else "",
            course_title=r.course.title if r.course else "",
            credits=r.course.credits if r.course else 3,
            internal_marks=r.internal_marks,
            external_marks=r.external_marks,
            total_marks=r.total_marks,
            grade=r.grade,
            grade_point=r.grade_point,
            is_passed=r.is_passed
        ))

    # Format attendance records
    att_outs = []
    for a in student.attendance_records:
        pct = (a.classes_attended / a.classes_held * 100.0) if a.classes_held > 0 else None
        att_outs.append(AttendanceRecordOut(
            id=a.id,
            course_id=a.course_id,
            course_code=a.course.code if a.course else "",
            course_title=a.course.title if a.course else "",
            classes_held=a.classes_held,
            classes_attended=a.classes_attended,
            percentage=round(pct, 2) if pct is not None else None
        ))

    # Format stride transactions
    stride_outs = []
    for tx in student.stride_transactions:
        stride_outs.append(StrideTransactionOut(
            id=tx.id,
            student_id=tx.student_id,
            student_name=student.full_name,
            student_roll=student.roll_number,
            activity_id=tx.activity_id,
            activity_name=tx.activity.name if tx.activity else "",
            activity_category=tx.activity.category if tx.activity else "",
            points=tx.points,
            status=tx.status,
            reason=tx.reason,
            reference_doc=tx.reference_doc,
            awarded_by_name=tx.awarded_by.full_name if tx.awarded_by else "System",
            approved_by_name=tx.approved_by.full_name if tx.approved_by else None,
            created_at=tx.created_at
        ))

    # Format support interventions
    interv_outs = []
    for i in student.support_interventions:
        interv_outs.append(SupportInterventionOut(
            id=i.id,
            student_id=i.student_id,
            student_name=student.full_name,
            student_roll=student.roll_number,
            flag_reason=i.flag_reason,
            intervention_type=i.intervention_type,
            status=i.status,
            notes=i.notes,
            action_taken_by_name=i.action_taken_by.full_name if i.action_taken_by else "Staff",
            created_at=i.created_at,
            updated_at=i.updated_at
        ))

    detail = StudentDetailOut(
        id=student.id,
        roll_number=student.roll_number,
        full_name=student.full_name,
        email=student.email,
        phone=student.phone,
        department_id=student.department_id,
        department_name=student.department.name if student.department else None,
        current_semester=student.current_semester,
        academic_year=student.academic_year,
        status=student.status,
        created_at=student.created_at,
        updated_at=student.updated_at,
        cgpa=cgpa,
        attendance_percentage=att_pct,
        stride_balance=stride_balance,
        stride_total_earned=stride_earned,
        academic_records=acad_outs,
        attendance_records=att_outs,
        stride_transactions=stride_outs,
        support_interventions=interv_outs
    )
    return detail

@router.post("", response_model=StudentOut)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    existing = db.query(Student).filter(
        or_(Student.roll_number == payload.roll_number, Student.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "ALREADY_EXISTS", "message": "Roll number or email already in use", "details": []}}
        )

    student = Student(**payload.model_dump())
    db.add(student)
    db.flush()

    audit = AuditLog(
        user_id=current_user.id,
        action="student_create",
        entity_type="Student",
        entity_id=str(student.id),
        details_json=f'{{"roll_number": "{student.roll_number}", "name": "{student.full_name}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(student)
    
    out = StudentOut.model_validate(student)
    out.department_name = student.department.name if student.department else None
    return out

@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Student not found"}})

    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(student, k, v)

    audit = AuditLog(
        user_id=current_user.id,
        action="student_update",
        entity_type="Student",
        entity_id=str(student.id),
        details_json=f'{{"updated_fields": {list(update_data.keys())}}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(student)

    out = StudentOut.model_validate(student)
    out.department_name = student.department.name if student.department else None
    return out

@router.patch("/{student_id}/status", response_model=StudentOut)
def toggle_student_status(
    student_id: int,
    payload: StudentStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Student not found"}})

    student.status = payload.status
    audit = AuditLog(
        user_id=current_user.id,
        action="student_status_change",
        entity_type="Student",
        entity_id=str(student.id),
        details_json=f'{{"new_status": "{payload.status}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(student)

    out = StudentOut.model_validate(student)
    out.department_name = student.department.name if student.department else None
    return out
