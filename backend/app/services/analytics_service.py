from typing import List, Optional, Dict, Any, Tuple
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import (
    Student, Department, Course, AcademicRecord, AttendanceRecord,
    StrideTransaction, SupportIntervention
)
from app.config import settings

def calculate_attendance_percentage(classes_attended: int, classes_held: int) -> Optional[float]:
    """
    Computes attendance percentage according to institutional formula:
    Attendance Percentage = (Classes Attended / Total Classes Held) * 100
    
    Rule: If classes_held <= 0 or missing, returns None (Never 0%).
    """
    if classes_held is None or classes_attended is None or classes_held <= 0:
        return None
    # Ensure attended cannot exceed held
    capped_attended = min(classes_attended, classes_held)
    pct = (capped_attended / classes_held) * 100.0
    return round(pct, 2)

def calculate_student_cgpa(academic_records: List[AcademicRecord]) -> Optional[float]:
    """
    Computes student CGPA based on credits and grade points:
    CGPA = Sum(grade_point * credits) / Sum(credits)
    Returns None if no records or total credits == 0.
    """
    if not academic_records:
        return None
    
    total_credit_points = 0.0
    total_credits = 0
    for r in academic_records:
        credits = r.course.credits if r.course else 3
        total_credit_points += (r.grade_point * credits)
        total_credits += credits
    
    if total_credits == 0:
        return None
    return round(total_credit_points / total_credits, 2)

def get_student_aggregate_attendance(attendance_records: List[AttendanceRecord]) -> Tuple[int, int, Optional[float]]:
    """
    Aggregates total held, total attended, and overall attendance percentage across all courses for a student.
    """
    if not attendance_records:
        return 0, 0, None
    
    total_held = sum(r.classes_held for r in attendance_records)
    total_attended = sum(r.classes_attended for r in attendance_records)
    pct = calculate_attendance_percentage(total_attended, total_held)
    return total_held, total_attended, pct

def get_dashboard_analytics(db: Session) -> Dict[str, Any]:
    """
    Computes institution-wide key metrics and aggregate distributions using Pandas.
    """
    total_students = db.query(Student).filter(Student.status == "active").count()
    total_departments = db.query(Department).count()
    total_courses = db.query(Course).count()

    # Active interventions
    active_interventions_count = db.query(SupportIntervention).filter(
        SupportIntervention.status.in_(["open", "in_progress"])
    ).count()

    # Total stride points awarded from valid approved transactions
    stride_pts = db.query(func.sum(StrideTransaction.points)).filter(
        StrideTransaction.status == "approved"
    ).scalar() or 0

    # Fetch academic records for analytics
    academic_records = db.query(AcademicRecord).all()
    avg_cgpa = None
    grade_distribution = []
    if academic_records:
        acad_df = pd.DataFrame([
            {"grade": r.grade, "grade_point": r.grade_point, "is_passed": r.is_passed}
            for r in academic_records
        ])
        if not acad_df.empty:
            avg_cgpa = round(float(acad_df["grade_point"].mean()), 2)
            grade_counts = acad_df["grade"].value_counts().to_dict()
            for g in ["O", "A+", "A", "B+", "B", "C", "F"]:
                grade_distribution.append({
                    "grade": g,
                    "count": int(grade_counts.get(g, 0))
                })

    # Fetch attendance records for analytics
    attendance_records = db.query(AttendanceRecord).all()
    avg_attendance = None
    attendance_trend = []
    if attendance_records:
        att_df = pd.DataFrame([
            {"held": r.classes_held, "attended": r.classes_attended}
            for r in attendance_records if r.classes_held > 0
        ])
        if not att_df.empty:
            att_df["pct"] = (att_df["attended"] / att_df["held"]) * 100.0
            avg_attendance = round(float(att_df["pct"].mean()), 2)
            
            # Bucket attendance into ranges
            ranges = [
                ("<60%", (att_df["pct"] < 60).sum()),
                ("60-74%", ((att_df["pct"] >= 60) & (att_df["pct"] < 75)).sum()),
                ("75-84%", ((att_df["pct"] >= 75) & (att_df["pct"] < 85)).sum()),
                ("85-100%", (att_df["pct"] >= 85).sum())
            ]
            for label, count in ranges:
                attendance_trend.append({"range": label, "count": int(count)})

    # Department performance comparisons
    departments = db.query(Department).all()
    department_performance = []
    for dept in departments:
        dept_students = db.query(Student).filter(
            Student.department_id == dept.id,
            Student.status == "active"
        ).all()
        student_count = len(dept_students)

        # Average CGPA in dept
        student_ids = [s.id for s in dept_students]
        dept_avg_cgpa = None
        dept_avg_att = None

        if student_ids:
            dept_acad = db.query(AcademicRecord).filter(AcademicRecord.student_id.in_(student_ids)).all()
            if dept_acad:
                pts = [r.grade_point for r in dept_acad]
                dept_avg_cgpa = round(float(np.mean(pts)), 2)

            dept_att = db.query(AttendanceRecord).filter(
                AttendanceRecord.student_id.in_(student_ids),
                AttendanceRecord.classes_held > 0
            ).all()
            if dept_att:
                att_pcts = [(r.classes_attended / r.classes_held) * 100.0 for r in dept_att]
                dept_avg_att = round(float(np.mean(att_pcts)), 2)

        department_performance.append({
            "department_id": dept.id,
            "department_code": dept.code,
            "department_name": dept.name,
            "student_count": student_count,
            "average_cgpa": dept_avg_cgpa,
            "average_attendance": dept_avg_att
        })

    # Students at risk count
    flags = get_support_flags(db)
    students_at_risk_count = len(flags)

    return {
        "total_students": total_students,
        "total_departments": total_departments,
        "total_courses": total_courses,
        "average_cgpa": avg_cgpa,
        "average_attendance": avg_attendance,
        "students_at_risk_count": students_at_risk_count,
        "total_stride_points_awarded": stride_pts,
        "active_interventions_count": active_interventions_count,
        "department_performance": department_performance,
        "attendance_trend": attendance_trend,
        "grade_distribution": grade_distribution
    }

def get_support_flags(
    db: Session,
    attendance_thresh: float = settings.ATTENDANCE_THRESHOLD,
    gpa_thresh: float = settings.AT_RISK_GPA_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Identifies students who may require academic or attendance intervention.
    Flags are transparent, explainable, and never automated disciplinary judgments.
    """
    active_students = db.query(Student).filter(Student.status == "active").all()
    flags = []

    for s in active_students:
        # Check Attendance
        held, attended, att_pct = get_student_aggregate_attendance(s.attendance_records)
        if att_pct is not None and att_pct < attendance_thresh:
            existing_count = len([i for i in s.support_interventions if i.status in ["open", "in_progress"]])
            flags.append({
                "student_id": s.id,
                "roll_number": s.roll_number,
                "full_name": s.full_name,
                "department_name": s.department.name if s.department else "N/A",
                "semester": s.current_semester,
                "flag_type": "Low Attendance",
                "reason": f"Overall attendance ({att_pct}%) is below configured threshold of {attendance_thresh}%.",
                "metric_value": att_pct,
                "threshold": attendance_thresh,
                "existing_interventions_count": existing_count
            })

        # Check CGPA
        cgpa = calculate_student_cgpa(s.academic_records)
        if cgpa is not None and cgpa < gpa_thresh:
            existing_count = len([i for i in s.support_interventions if i.status in ["open", "in_progress"]])
            flags.append({
                "student_id": s.id,
                "roll_number": s.roll_number,
                "full_name": s.full_name,
                "department_name": s.department.name if s.department else "N/A",
                "semester": s.current_semester,
                "flag_type": "Low Academic Performance",
                "reason": f"Current CGPA ({cgpa}) is below academic review threshold of {gpa_thresh}.",
                "metric_value": cgpa,
                "threshold": gpa_thresh,
                "existing_interventions_count": existing_count
            })

        # Check incomplete/missing records
        if not s.academic_records and not s.attendance_records:
            flags.append({
                "student_id": s.id,
                "roll_number": s.roll_number,
                "full_name": s.full_name,
                "department_name": s.department.name if s.department else "N/A",
                "semester": s.current_semester,
                "flag_type": "Incomplete Records",
                "reason": "No academic or attendance records logged for current academic term.",
                "metric_value": None,
                "threshold": None,
                "existing_interventions_count": 0
            })

    return flags
