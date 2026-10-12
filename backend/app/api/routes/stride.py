import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import StrideActivity, StrideTransaction, Student
from app.schemas.schemas import (
    StrideActivityOut, StrideActivityCreate, StrideTransactionOut,
    StrideTransactionCreate, StrideReversalRequest, PaginatedResponse
)
from app.services.stride_service import award_stride_points, reverse_stride_transaction, calculate_stride_balance
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/stride", tags=["Stride Point"])

@router.get("/activities", response_model=list[StrideActivityOut])
def list_stride_activities(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(StrideActivity).filter(StrideActivity.is_active == True).all()

@router.post("/activities", response_model=StrideActivityOut)
def create_stride_activity(
    payload: StrideActivityCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    activity = StrideActivity(**payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@router.get("/transactions", response_model=PaginatedResponse[StrideTransactionOut])
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    student_id: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(StrideTransaction)
    if student_id:
        query = query.filter(StrideTransaction.student_id == student_id)
    if status:
        query = query.filter(StrideTransaction.status == status)
    if category:
        query = query.join(StrideActivity).filter(StrideActivity.category == category)

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(StrideTransaction.created_at.desc()).offset(offset).limit(page_size).all()

    outs = []
    for tx in items:
        outs.append(StrideTransactionOut(
            id=tx.id,
            student_id=tx.student_id,
            student_name=tx.student.full_name if tx.student else "",
            student_roll=tx.student.roll_number if tx.student else "",
            activity_id=tx.activity_id,
            activity_name=tx.activity.name if tx.activity else "",
            activity_category=tx.activity.category if tx.activity else "",
            points=tx.points,
            status=tx.status,
            reason=tx.reason,
            reference_doc=tx.reference_doc,
            awarded_by_name=tx.awarded_by.full_name if tx.awarded_by else "Staff",
            approved_by_name=tx.approved_by.full_name if tx.approved_by else None,
            created_at=tx.created_at
        ))

    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return {
        "items": outs,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.post("/transactions", response_model=StrideTransactionOut)
def record_stride_transaction(
    payload: StrideTransactionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin", "faculty", "coordinator"))
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail={"error": {"code": "NOT_FOUND", "message": "Student not found"}})

    try:
        tx = award_stride_points(
            db=db,
            student_id=payload.student_id,
            activity_id=payload.activity_id,
            awarded_by_id=current_user.id,
            points=payload.points,
            reason=payload.reason,
            reference_doc=payload.reference_doc
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "BAD_REQUEST", "message": str(e)}})

    return StrideTransactionOut(
        id=tx.id,
        student_id=tx.student_id,
        student_name=student.full_name,
        student_roll=student.roll_number,
        activity_id=tx.activity_id,
        activity_name=tx.activity.name,
        activity_category=tx.activity.category,
        points=tx.points,
        status=tx.status,
        reason=tx.reason,
        reference_doc=tx.reference_doc,
        awarded_by_name=current_user.full_name,
        approved_by_name=current_user.full_name,
        created_at=tx.created_at
    )

@router.post("/transactions/{id}/reverse", response_model=StrideTransactionOut)
def reverse_transaction_route(
    id: int,
    payload: StrideReversalRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    try:
        rev_tx = reverse_stride_transaction(
            db=db,
            transaction_id=id,
            reason=payload.reason,
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": {"code": "REVERSAL_ERROR", "message": str(e)}})

    return StrideTransactionOut(
        id=rev_tx.id,
        student_id=rev_tx.student_id,
        student_name=rev_tx.student.full_name if rev_tx.student else "",
        student_roll=rev_tx.student.roll_number if rev_tx.student else "",
        activity_id=rev_tx.activity_id,
        activity_name=rev_tx.activity.name if rev_tx.activity else "",
        activity_category=rev_tx.activity.category if rev_tx.activity else "",
        points=rev_tx.points,
        status=rev_tx.status,
        reason=rev_tx.reason,
        reference_doc=rev_tx.reference_doc,
        awarded_by_name=current_user.full_name,
        approved_by_name=current_user.full_name,
        created_at=rev_tx.created_at
    )

@router.get("/students/{student_id}")
def student_stride_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    balance, total_earned = calculate_stride_balance(db, student_id)
    txs = db.query(StrideTransaction).filter(StrideTransaction.student_id == student_id).order_by(StrideTransaction.created_at.desc()).all()
    
    return {
        "student_id": student_id,
        "balance": balance,
        "total_earned": total_earned,
        "transactions_count": len(txs),
        "policy_notice": "Stride Point policy pending institutional finalization. Append-only ledger enabled."
    }
