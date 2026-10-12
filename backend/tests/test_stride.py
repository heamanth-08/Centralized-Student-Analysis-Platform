from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.models import Student, StrideActivity, User
from app.services.stride_service import award_stride_points, reverse_stride_transaction, calculate_stride_balance

def test_stride_append_only_ledger_and_reversal():
    db = SessionLocal()
    try:
        student = db.query(Student).first()
        activity = db.query(StrideActivity).first()
        admin = db.query(User).filter(User.role == "admin").first()

        initial_balance, _ = calculate_stride_balance(db, student.id)

        # Award points
        tx = award_stride_points(
            db=db,
            student_id=student.id,
            activity_id=activity.id,
            awarded_by_id=admin.id,
            points=25,
            reason="Test Hackathon Award"
        )
        assert tx.id is not None
        assert tx.status == "approved"
        assert tx.points == 25

        new_balance, _ = calculate_stride_balance(db, student.id)
        assert new_balance == initial_balance + 25

        # Perform append-only reversal
        rev_tx = reverse_stride_transaction(
            db=db,
            transaction_id=tx.id,
            reason="Entered by mistake in test",
            user_id=admin.id
        )
        assert rev_tx.id is not None
        assert rev_tx.points == -25
        assert rev_tx.status == "reversed"
        assert rev_tx.original_tx_id == tx.id

        # Verify historical original tx was marked reversed, not deleted
        assert tx.status == "reversed"

        # Verify final balance is back to initial
        final_balance, _ = calculate_stride_balance(db, student.id)
        assert final_balance == initial_balance
    finally:
        db.close()
