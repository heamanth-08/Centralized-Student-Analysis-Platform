import io
import csv
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Student, AcademicRecord, AttendanceRecord, StrideTransaction, SupportIntervention
from app.services.analytics_service import calculate_student_cgpa, get_student_aggregate_attendance

def sanitize_csv_cell(val: Any) -> str:
    """
    Prevents spreadsheet formula injection by prepending a quote if cell begins with =, +, -, @
    """
    if val is None:
        return ""
    s = str(val).strip()
    if s.startswith(("=", "+", "-", "@")):
        return "'" + s
    return s

def export_students_csv(db: Session) -> str:
    students = db.query(Student).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Roll Number", "Full Name", "Email", "Department", "Semester", "Academic Year", "CGPA", "Attendance %", "Status"])
    
    for s in students:
        cgpa = calculate_student_cgpa(s.academic_records)
        _, _, att = get_student_aggregate_attendance(s.attendance_records)
        writer.writerow([
            sanitize_csv_cell(s.roll_number),
            sanitize_csv_cell(s.full_name),
            sanitize_csv_cell(s.email),
            sanitize_csv_cell(s.department.code if s.department else ""),
            s.current_semester,
            sanitize_csv_cell(s.academic_year),
            cgpa if cgpa is not None else "N/A",
            f"{att}%" if att is not None else "N/A",
            s.status
        ])
    return output.getvalue()

def export_attendance_csv(db: Session) -> str:
    records = db.query(AttendanceRecord).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Roll Number", "Student Name", "Course Code", "Course Title", "Classes Held", "Classes Attended", "Attendance %"])

    for r in records:
        pct = (r.classes_attended / r.classes_held * 100.0) if r.classes_held > 0 else None
        writer.writerow([
            sanitize_csv_cell(r.student.roll_number if r.student else ""),
            sanitize_csv_cell(r.student.full_name if r.student else ""),
            sanitize_csv_cell(r.course.code if r.course else ""),
            sanitize_csv_cell(r.course.title if r.course else ""),
            r.classes_held,
            r.classes_attended,
            f"{round(pct, 2)}%" if pct is not None else "N/A"
        ])
    return output.getvalue()

def export_stride_csv(db: Session) -> str:
    txs = db.query(StrideTransaction).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Transaction ID", "Roll Number", "Student Name", "Activity", "Category", "Points", "Status", "Reason", "Awarded Date"])

    for tx in txs:
        writer.writerow([
            tx.id,
            sanitize_csv_cell(tx.student.roll_number if tx.student else ""),
            sanitize_csv_cell(tx.student.full_name if tx.student else ""),
            sanitize_csv_cell(tx.activity.name if tx.activity else ""),
            sanitize_csv_cell(tx.activity.category if tx.activity else ""),
            tx.points,
            tx.status,
            sanitize_csv_cell(tx.reason),
            tx.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])
    return output.getvalue()
