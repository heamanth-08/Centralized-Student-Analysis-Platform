from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Course, Department, AcademicRecord, AttendanceRecord, Student
from app.services.analytics_service import get_dashboard_analytics, calculate_attendance_percentage
from app.api.deps import get_current_user
import pandas as pd
import numpy as np

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def dashboard_analytics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_dashboard_analytics(db)

@router.get("/academic")
def academic_analytics(
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(AcademicRecord)
    if department_id:
        query = query.join(Course).filter(Course.department_id == department_id)
    if semester:
        query = query.join(Course).filter(Course.semester == semester)

    records = query.all()
    if not records:
        return {
            "total_records": 0,
            "overall_average": None,
            "pass_rate": None,
            "courses_analysis": [],
            "grade_distribution": []
        }

    df = pd.DataFrame([
        {
            "course_id": r.course_id,
            "course_code": r.course.code if r.course else "",
            "course_title": r.course.title if r.course else "",
            "total_marks": r.total_marks,
            "grade": r.grade,
            "grade_point": r.grade_point,
            "is_passed": r.is_passed
        }
        for r in records
    ])

    overall_avg = round(float(df["total_marks"].mean()), 2)
    pass_rate = round(float((df["is_passed"].sum() / len(df)) * 100.0), 2)

    # Grade distribution
    grade_counts = df["grade"].value_counts().to_dict()
    grade_dist = [
        {"grade": g, "count": int(grade_counts.get(g, 0))}
        for g in ["O", "A+", "A", "B+", "B", "C", "F"]
    ]

    # Course-wise breakdown
    courses_analysis = []
    for (cid, ccode, ctitle), group in df.groupby(["course_id", "course_code", "course_title"]):
        courses_analysis.append({
            "course_id": int(cid),
            "course_code": ccode,
            "course_title": ctitle,
            "student_count": len(group),
            "average_marks": round(float(group["total_marks"].mean()), 2),
            "pass_rate": round(float((group["is_passed"].sum() / len(group)) * 100.0), 2),
            "average_grade_point": round(float(group["grade_point"].mean()), 2)
        })

    return {
        "total_records": len(df),
        "overall_average": overall_avg,
        "pass_rate": pass_rate,
        "courses_analysis": courses_analysis,
        "grade_distribution": grade_dist
    }

@router.get("/attendance")
def attendance_analytics(
    department_id: Optional[int] = None,
    threshold: float = Query(75.0, ge=0.0, le=100.0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(AttendanceRecord).filter(AttendanceRecord.classes_held > 0)
    if department_id:
        query = query.join(Course).filter(Course.department_id == department_id)

    records = query.all()
    if not records:
        return {
            "total_records": 0,
            "average_attendance": None,
            "below_threshold_count": 0,
            "threshold": threshold,
            "courses_attendance": []
        }

    df = pd.DataFrame([
        {
            "student_id": r.student_id,
            "roll_number": r.student.roll_number if r.student else "",
            "student_name": r.student.full_name if r.student else "",
            "course_id": r.course_id,
            "course_code": r.course.code if r.course else "",
            "course_title": r.course.title if r.course else "",
            "held": r.classes_held,
            "attended": r.classes_attended,
            "pct": (r.classes_attended / r.classes_held) * 100.0
        }
        for r in records
    ])

    avg_att = round(float(df["pct"].mean()), 2)
    below_thresh = df[df["pct"] < threshold]

    # Course breakdown
    courses_att = []
    for (cid, ccode, ctitle), group in df.groupby(["course_id", "course_code", "course_title"]):
        courses_att.append({
            "course_id": int(cid),
            "course_code": ccode,
            "course_title": ctitle,
            "total_classes_held": int(group["held"].sum()),
            "average_attendance": round(float(group["pct"].mean()), 2),
            "below_threshold_students": int((group["pct"] < threshold).sum())
        })

    return {
        "total_records": len(df),
        "average_attendance": avg_att,
        "below_threshold_count": len(below_thresh),
        "threshold": threshold,
        "courses_attendance": courses_att
    }

@router.get("/departments")
def departments_analytics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    departments = db.query(Department).all()
    result = []
    for dept in departments:
        students = db.query(Student).filter(Student.department_id == dept.id, Student.status == "active").all()
        student_ids = [s.id for s in students]

        avg_cgpa = None
        avg_att = None

        if student_ids:
            acad = db.query(AcademicRecord).filter(AcademicRecord.student_id.in_(student_ids)).all()
            if acad:
                avg_cgpa = round(float(np.mean([r.grade_point for r in acad])), 2)

            att = db.query(AttendanceRecord).filter(
                AttendanceRecord.student_id.in_(student_ids),
                AttendanceRecord.classes_held > 0
            ).all()
            if att:
                avg_att = round(float(np.mean([(r.classes_attended / r.classes_held * 100.0) for r in att])), 2)

        result.append({
            "department_id": dept.id,
            "department_code": dept.code,
            "department_name": dept.name,
            "total_students": len(students),
            "total_courses": len(dept.courses),
            "average_cgpa": avg_cgpa,
            "average_attendance": avg_att
        })

    return result
