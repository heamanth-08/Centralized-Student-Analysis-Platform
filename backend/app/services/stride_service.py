from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import StrideTransaction, StrideActivity, Student, AuditLog

def calculate_stride_balance(db: Session, student_id: int) -> Tuple[int, int]:
    """
    Computes (current_balance, total_earned) from append-only transactions.
    - Current balance: sum of points from all approved non-reversed transactions.
    - Total earned: sum of positive points from approved transactions.
    """
    transactions = db.query(StrideTransaction).filter(
        StrideTransaction.student_id == student_id,
        StrideTransaction.status == "approved"
    ).all()

    total_points = sum(tx.points for tx in transactions)
    total_earned = sum(tx.points for tx in transactions if tx.points > 0)
    return max(0, total_points), total_earned

def award_stride_points(
    db: Session,
    student_id: int,
    activity_id: int,
    awarded_by_id: int,
    points: Optional[int] = None,
    reason: str = "",
    reference_doc: Optional[str] = None
) -> StrideTransaction:
    """
    Records an append-only Stride Point award transaction.
    """
    activity = db.query(StrideActivity).filter(StrideActivity.id == activity_id).first()
    if not activity:
        raise ValueError("Invalid activity ID")
    
    award_pts = points if points is not None else activity.default_points

    tx = StrideTransaction(
        student_id=student_id,
        activity_id=activity_id,
        points=award_pts,
        status="approved", # By default approved when awarded by staff/admin
        reason=reason or f"Awarded for {activity.name}",
        reference_doc=reference_doc,
        awarded_by_id=awarded_by_id,
        approved_by_id=awarded_by_id
    )
    db.add(tx)
    db.flush()

    # Log audit entry
    audit = AuditLog(
        user_id=awarded_by_id,
        action="stride_award",
        entity_type="StrideTransaction",
        entity_id=str(tx.id),
        details_json=f'{{"student_id": {student_id}, "points": {award_pts}, "activity": "{activity.name}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(tx)
    return tx

def reverse_stride_transaction(
    db: Session,
    transaction_id: int,
    reason: str,
    user_id: int
) -> StrideTransaction:
    """
    Reverses an existing transaction by creating a new offsetting reversal transaction.
    Never alters historical records directly.
    """
    orig_tx = db.query(StrideTransaction).filter(StrideTransaction.id == transaction_id).first()
    if not orig_tx:
        raise ValueError("Transaction not found")
    if orig_tx.status == "reversed":
        raise ValueError("Transaction has already been reversed")

    # Mark original transaction as reversed
    orig_tx.status = "reversed"

    # Create new offsetting reversal transaction
    reversal_tx = StrideTransaction(
        student_id=orig_tx.student_id,
        activity_id=orig_tx.activity_id,
        points=-orig_tx.points,
        status="reversed",
        reason=f"Correction/Reversal of TX#{orig_tx.id}: {reason}",
        reference_doc=orig_tx.reference_doc,
        awarded_by_id=user_id,
        approved_by_id=user_id,
        original_tx_id=orig_tx.id
    )
    db.add(reversal_tx)
    db.flush()

    audit = AuditLog(
        user_id=user_id,
        action="stride_reversal",
        entity_type="StrideTransaction",
        entity_id=str(reversal_tx.id),
        details_json=f'{{"reversed_tx_id": {orig_tx.id}, "points": {-orig_tx.points}, "reason": "{reason}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(reversal_tx)
    return reversal_tx
