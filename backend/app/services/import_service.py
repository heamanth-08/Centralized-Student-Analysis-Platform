import io
import json
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy.orm import Session
from app.models.models import (
    Student, Department, Course, AcademicPeriod, AcademicRecord, AttendanceRecord,
    ImportDataset, AuditLog
)

def sanitize_value(val: Any) -> Any:
    """
    Neutralizes formula injection vulnerability in spreadsheet data.
    Strips dangerous starting characters (=, +, -, @).
    """
    if isinstance(val, str):
        val = val.strip()
        if val.startswith(("=", "+", "-", "@")):
            val = "'" + val
    return val

def process_file_import(
    db: Session,
    file_bytes: bytes,
    filename: str,
    dataset_type: str,
    user_id: int
) -> Dict[str, Any]:
    """
    Reads CSV or Excel file, validates row-by-row, saves clean data in a transaction,
    and returns comprehensive row-level error log.
    """
    errors: List[Dict[str, Any]] = []
    
    # Read file using pandas
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(file_bytes))
        else:
            raise ValueError("Unsupported file format. Please upload .csv or .xlsx file.")
    except Exception as e:
        raise ValueError(f"Failed to read file: {str(e)}")

    total_rows = len(df)
    if total_rows == 0:
        raise ValueError("Uploaded file is empty.")

    success_count = 0

    # Ensure academic period exists for records
    current_period = db.query(AcademicPeriod).filter(AcademicPeriod.is_current == True).first()
    if not current_period:
        current_period = AcademicPeriod(name="Current Term 2026", is_current=True)
        db.add(current_period)
        db.flush()

    if dataset_type == "students":
        required_cols = ["roll_number", "full_name", "email", "department_code"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column '{col}'. Required columns: {', '.join(required_cols)}")

        for index, row in df.iterrows():
            row_num = index + 2 # 1-indexed plus header row
            try:
                roll = sanitize_value(str(row["roll_number"])).strip()
                name = sanitize_value(str(row["full_name"])).strip()
                email = sanitize_value(str(row["email"])).strip()
                dept_code = str(row["department_code"]).strip()
                sem = int(row.get("current_semester", 1))
                year = str(row.get("academic_year", "2025-2026")).strip()
                phone = str(row.get("phone", "")).strip() if pd.notna(row.get("phone")) else None

                if not roll or not name or not email:
                    errors.append({"row": row_num, "identifier": roll, "error": "Missing mandatory fields."})
                    continue

                dept = db.query(Department).filter(Department.code == dept_code).first()
                if not dept:
                    errors.append({"row": row_num, "identifier": roll, "error": f"Department '{dept_code}' not found."})
                    continue

                student = db.query(Student).filter(Student.roll_number == roll).first()
                if student:
                    # Update existing student
                    student.full_name = name
                    student.email = email
                    student.department_id = dept.id
                    student.current_semester = sem
                    student.academic_year = year
                    if phone:
                        student.phone = phone
                else:
                    # Create new student
                    student = Student(
                        roll_number=roll,
                        full_name=name,
                        email=email,
                        phone=phone,
                        department_id=dept.id,
                        current_semester=sem,
                        academic_year=year,
                        status="active"
                    )
                    db.add(student)

                db.flush()
                success_count += 1
            except Exception as ex:
                errors.append({"row": row_num, "identifier": str(row.get("roll_number", "")), "error": str(ex)})

    elif dataset_type == "attendance":
        required_cols = ["roll_number", "course_code", "classes_held", "classes_attended"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column '{col}'. Required: {', '.join(required_cols)}")

        for index, row in df.iterrows():
            row_num = index + 2
            try:
                roll = str(row["roll_number"]).strip()
                course_code = str(row["course_code"]).strip()
                held = int(row["classes_held"])
                attended = int(row["classes_attended"])

                if held < 0 or attended < 0:
                    errors.append({"row": row_num, "identifier": roll, "error": "Classes held/attended cannot be negative."})
                    continue
                if attended > held:
                    errors.append({"row": row_num, "identifier": roll, "error": "Classes attended cannot exceed classes held."})
                    continue

                student = db.query(Student).filter(Student.roll_number == roll).first()
                if not student:
                    errors.append({"row": row_num, "identifier": roll, "error": f"Student with roll number '{roll}' not found."})
                    continue

                course = db.query(Course).filter(Course.code == course_code).first()
                if not course:
                    errors.append({"row": row_num, "identifier": roll, "error": f"Course '{course_code}' not found."})
                    continue

                # Check if existing record exists
                rec = db.query(AttendanceRecord).filter(
                    AttendanceRecord.student_id == student.id,
                    AttendanceRecord.course_id == course.id,
                    AttendanceRecord.academic_period_id == current_period.id
                ).first()

                if rec:
                    rec.classes_held = held
                    rec.classes_attended = attended
                else:
                    rec = AttendanceRecord(
                        student_id=student.id,
                        course_id=course.id,
                        academic_period_id=current_period.id,
                        classes_held=held,
                        classes_attended=attended
                    )
                    db.add(rec)

                db.flush()
                success_count += 1
            except Exception as ex:
                errors.append({"row": row_num, "identifier": str(row.get("roll_number", "")), "error": str(ex)})

    elif dataset_type == "marks":
        required_cols = ["roll_number", "course_code", "internal_marks", "external_marks"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column '{col}'. Required: {', '.join(required_cols)}")

        for index, row in df.iterrows():
            row_num = index + 2
            try:
                roll = str(row["roll_number"]).strip()
                course_code = str(row["course_code"]).strip()
                internals = float(row["internal_marks"])
                externals = float(row["external_marks"])
                total = internals + externals

                if internals < 0 or externals < 0:
                    errors.append({"row": row_num, "identifier": roll, "error": "Marks cannot be negative."})
                    continue

                # Determine Grade & Grade Point
                if total >= 90:
                    grade, gp = "O", 10.0
                elif total >= 80:
                    grade, gp = "A+", 9.0
                elif total >= 70:
                    grade, gp = "A", 8.0
                elif total >= 60:
                    grade, gp = "B+", 7.0
                elif total >= 50:
                    grade, gp = "B", 6.0
                elif total >= 40:
                    grade, gp = "C", 5.0
                else:
                    grade, gp = "F", 0.0

                student = db.query(Student).filter(Student.roll_number == roll).first()
                if not student:
                    errors.append({"row": row_num, "identifier": roll, "error": f"Student '{roll}' not found."})
                    continue

                course = db.query(Course).filter(Course.code == course_code).first()
                if not course:
                    errors.append({"row": row_num, "identifier": roll, "error": f"Course '{course_code}' not found."})
                    continue

                rec = db.query(AcademicRecord).filter(
                    AcademicRecord.student_id == student.id,
                    AcademicRecord.course_id == course.id,
                    AcademicRecord.academic_period_id == current_period.id
                ).first()

                if rec:
                    rec.internal_marks = internals
                    rec.external_marks = externals
                    rec.total_marks = total
                    rec.grade = grade
                    rec.grade_point = gp
                    rec.is_passed = (gp > 0)
                else:
                    rec = AcademicRecord(
                        student_id=student.id,
                        course_id=course.id,
                        academic_period_id=current_period.id,
                        internal_marks=internals,
                        external_marks=externals,
                        total_marks=total,
                        grade=grade,
                        grade_point=gp,
                        is_passed=(gp > 0)
                    )
                    db.add(rec)

                db.flush()
                success_count += 1
            except Exception as ex:
                errors.append({"row": row_num, "identifier": str(row.get("roll_number", "")), "error": str(ex)})
    else:
        raise ValueError(f"Unknown dataset type: {dataset_type}")

    # Record Import Dataset log
    import_rec = ImportDataset(
        filename=filename,
        dataset_type=dataset_type,
        row_count=total_rows,
        success_count=success_count,
        error_count=len(errors),
        status="completed" if len(errors) == 0 else ("partial" if success_count > 0 else "failed"),
        error_log_json=json.dumps(errors) if errors else None
    )
    db.add(import_rec)

    # Log audit entry
    audit = AuditLog(
        user_id=user_id,
        action="data_import",
        entity_type="ImportDataset",
        entity_id=str(import_rec.id),
        details_json=json.dumps({"filename": filename, "type": dataset_type, "success": success_count, "errors": len(errors)})
    )
    db.add(audit)
    db.commit()

    return {
        "dataset_id": import_rec.id,
        "filename": filename,
        "dataset_type": dataset_type,
        "total_rows": total_rows,
        "success_count": success_count,
        "error_count": len(errors),
        "status": import_rec.status,
        "errors": errors
    }
