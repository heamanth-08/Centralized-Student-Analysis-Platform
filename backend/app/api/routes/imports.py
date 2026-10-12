from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import ImportDataset
from app.services.import_service import process_file_import
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/imports", tags=["Data Import"])

@router.post("")
async def upload_dataset(
    file: UploadFile = File(...),
    dataset_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    if not file.filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_FILE_TYPE", "message": "Only .csv and .xlsx files are supported", "details": []}}
        )

    content = await file.read()
    try:
        result = process_file_import(
            db=db,
            file_bytes=content,
            filename=file.filename,
            dataset_type=dataset_type,
            user_id=current_user.id
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "IMPORT_VALIDATION_ERROR", "message": str(e), "details": []}}
        )

@router.get("")
def list_import_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    imports = db.query(ImportDataset).order_by(ImportDataset.created_at.desc()).limit(limit).all()
    return imports

@router.get("/templates/{template_type}")
def download_template(template_type: str):
    if template_type == "students":
        csv_data = "roll_number,full_name,email,phone,department_code,current_semester,academic_year\nCS2026001,John Doe,john.doe@campus.edu,9876543210,CSE,4,2025-2026\nCS2026002,Jane Smith,jane.smith@campus.edu,9876543211,CSE,4,2025-2026"
        filename = "students_import_template.csv"
    elif template_type == "attendance":
        csv_data = "roll_number,course_code,classes_held,classes_attended\nCS2026001,CS101,45,40\nCS2026002,CS101,45,30"
        filename = "attendance_import_template.csv"
    elif template_type == "marks":
        csv_data = "roll_number,course_code,internal_marks,external_marks\nCS2026001,CS101,38.5,52.0\nCS2026002,CS101,32.0,41.5"
        filename = "marks_import_template.csv"
    else:
        raise HTTPException(status_code=404, detail="Template type not found. Use students, attendance, or marks.")

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
