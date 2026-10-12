from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.export_service import export_students_csv, export_attendance_csv, export_stride_csv
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/students")
def export_students_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    csv_content = export_students_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campusiq_students_report.csv"}
    )

@router.get("/attendance")
def export_attendance_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    csv_content = export_attendance_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campusiq_attendance_report.csv"}
    )

@router.get("/stride")
def export_stride_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    csv_content = export_stride_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campusiq_stride_report.csv"}
    )
