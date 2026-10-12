import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class UserRole(str):
    ADMIN = "admin"
    FACULTY = "faculty"
    COORDINATOR = "coordinator"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default=UserRole.FACULTY, nullable=False) # admin, faculty, coordinator, student
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    department = relationship("Department", back_populates="users")
    stride_awards = relationship("StrideTransaction", foreign_keys="[StrideTransaction.awarded_by_id]", back_populates="awarded_by")
    stride_approvals = relationship("StrideTransaction", foreign_keys="[StrideTransaction.approved_by_id]", back_populates="approved_by")
    interventions = relationship("SupportIntervention", back_populates="action_taken_by")
    notifications = relationship("Notification", back_populates="user")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False) # e.g., CSE, ECE, ME
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="department")
    students = relationship("Student", back_populates="department")
    courses = relationship("Course", back_populates="department")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False) # e.g., CS101, EC202
    title = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    semester = Column(Integer, nullable=False) # 1 through 8
    credits = Column(Integer, default=3, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    department = relationship("Department", back_populates="courses")
    academic_records = relationship("AcademicRecord", back_populates="course")
    attendance_records = relationship("AttendanceRecord", back_populates="course")

class AcademicPeriod(Base):
    __tablename__ = "academic_periods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False) # e.g. "Fall 2026", "Spring 2026"
    is_current = Column(Boolean, default=False, nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    academic_records = relationship("AcademicRecord", back_populates="academic_period")
    attendance_records = relationship("AttendanceRecord", back_populates="academic_period")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    current_semester = Column(Integer, default=1, nullable=False)
    academic_year = Column(String(20), default="2025-2026", nullable=False)
    status = Column(String(20), default="active", nullable=False) # active, inactive
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    department = relationship("Department", back_populates="students")
    academic_records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")
    stride_transactions = relationship("StrideTransaction", back_populates="student", cascade="all, delete-orphan")
    support_interventions = relationship("SupportIntervention", back_populates="student", cascade="all, delete-orphan")

class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    academic_period_id = Column(Integer, ForeignKey("academic_periods.id"), nullable=False)
    internal_marks = Column(Float, default=0.0, nullable=False)
    external_marks = Column(Float, default=0.0, nullable=False)
    total_marks = Column(Float, default=0.0, nullable=False)
    grade = Column(String(5), default="F", nullable=False) # O, A+, A, B+, B, C, F
    grade_point = Column(Float, default=0.0, nullable=False)
    is_passed = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    student = relationship("Student", back_populates="academic_records")
    course = relationship("Course", back_populates="academic_records")
    academic_period = relationship("AcademicPeriod", back_populates="academic_records")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    academic_period_id = Column(Integer, ForeignKey("academic_periods.id"), nullable=False)
    classes_held = Column(Integer, default=0, nullable=False)
    classes_attended = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    student = relationship("Student", back_populates="attendance_records")
    course = relationship("Course", back_populates="attendance_records")
    academic_period = relationship("AcademicPeriod", back_populates="attendance_records")

class StrideActivity(Base):
    __tablename__ = "stride_activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # Workshops, Skill Development, Campus Events, Extracurricular, Institutional Contributions
    default_points = Column(Integer, default=10, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    transactions = relationship("StrideTransaction", back_populates="activity")

class StrideTransaction(Base):
    __tablename__ = "stride_transactions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("stride_activities.id"), nullable=False)
    points = Column(Integer, nullable=False)
    status = Column(String(20), default="approved", nullable=False) # approved, pending, rejected, reversed
    reason = Column(String(255), nullable=False)
    reference_doc = Column(String(255), nullable=True)
    awarded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    original_tx_id = Column(Integer, ForeignKey("stride_transactions.id"), nullable=True) # for reversals
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    student = relationship("Student", back_populates="stride_transactions")
    activity = relationship("StrideActivity", back_populates="transactions")
    awarded_by = relationship("User", foreign_keys=[awarded_by_id], back_populates="stride_awards")
    approved_by = relationship("User", foreign_keys=[approved_by_id], back_populates="stride_approvals")

class SupportIntervention(Base):
    __tablename__ = "support_interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    flag_reason = Column(String(255), nullable=False) # e.g., "Attendance below 75%", "CGPA below 5.0"
    intervention_type = Column(String(50), default="Academic Mentoring", nullable=False) # Mentoring, Counseling, Remedial Class, Parent Meeting
    status = Column(String(20), default="open", nullable=False) # open, in_progress, resolved, dismissed
    notes = Column(Text, nullable=True)
    action_taken_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    student = relationship("Student", back_populates="support_interventions")
    action_taken_by = relationship("User", back_populates="interventions")

class ImportDataset(Base):
    __tablename__ = "import_datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    dataset_type = Column(String(50), nullable=False) # students, attendance, marks
    row_count = Column(Integer, default=0, nullable=False)
    success_count = Column(Integer, default=0, nullable=False)
    error_count = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="completed", nullable=False) # completed, failed, partial
    error_log_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # None = system broadcast
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(20), default="info", nullable=False) # info, warning, success, error
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, index=True, nullable=False)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False) # login, import, export, stride_award, stride_reversal, student_update
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
