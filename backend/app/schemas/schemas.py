from typing import List, Optional, Any, Generic, TypeVar
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

T = TypeVar("T")

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str

class APIError(BaseModel):
    code: str
    message: str
    details: Optional[List[ErrorDetail]] = []

class ErrorResponse(BaseModel):
    error: APIError

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=72)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserOut"

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str = "faculty"
    department_id: Optional[int] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Course Schemas
class CourseBase(BaseModel):
    code: str
    title: str
    department_id: int
    semester: int
    credits: int = 3

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: int
    created_at: datetime
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

# Academic Period Schemas
class AcademicPeriodOut(BaseModel):
    id: int
    name: str
    is_current: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    class Config:
        from_attributes = True

# Student Schemas
class StudentBase(BaseModel):
    roll_number: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: int
    current_semester: int = 1
    academic_year: str = "2025-2026"
    status: str = "active"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    current_semester: Optional[int] = None
    academic_year: Optional[str] = None
    status: Optional[str] = None

class StudentStatusUpdate(BaseModel):
    status: str # 'active' or 'inactive'

class StudentOut(StudentBase):
    id: int
    department_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AcademicRecordOut(BaseModel):
    id: int
    course_id: int
    course_code: str
    course_title: str
    credits: int
    internal_marks: float
    external_marks: float
    total_marks: float
    grade: str
    grade_point: float
    is_passed: bool

    class Config:
        from_attributes = True

class AttendanceRecordOut(BaseModel):
    id: int
    course_id: int
    course_code: str
    course_title: str
    classes_held: int
    classes_attended: int
    percentage: Optional[float] = None # None if classes_held == 0

    class Config:
        from_attributes = True

class StrideTransactionOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    student_roll: Optional[str] = None
    activity_id: int
    activity_name: str
    activity_category: str
    points: int
    status: str # approved, pending, rejected, reversed
    reason: str
    reference_doc: Optional[str] = None
    awarded_by_name: Optional[str] = None
    approved_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SupportInterventionOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    student_roll: Optional[str] = None
    flag_reason: str
    intervention_type: str
    status: str
    notes: Optional[str] = None
    action_taken_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentDetailOut(StudentOut):
    cgpa: Optional[float] = None
    attendance_percentage: Optional[float] = None
    stride_balance: int = 0
    stride_total_earned: int = 0
    academic_records: List[AcademicRecordOut] = []
    attendance_records: List[AttendanceRecordOut] = []
    stride_transactions: List[StrideTransactionOut] = []
    support_interventions: List[SupportInterventionOut] = []

# Stride Activity Schemas
class StrideActivityBase(BaseModel):
    name: str
    category: str
    default_points: int = 10
    description: Optional[str] = None
    is_active: bool = True

class StrideActivityCreate(StrideActivityBase):
    pass

class StrideActivityOut(StrideActivityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StrideTransactionCreate(BaseModel):
    student_id: int
    activity_id: int
    points: Optional[int] = None # uses activity default if omitted
    reason: str
    reference_doc: Optional[str] = None

class StrideReversalRequest(BaseModel):
    reason: str

# Support Schemas
class SupportFlagOut(BaseModel):
    student_id: int
    roll_number: str
    full_name: str
    department_name: str
    semester: int
    flag_type: str # 'Low Attendance', 'Low CGPA', 'Incomplete Records'
    reason: str
    metric_value: Optional[float] = None
    threshold: Optional[float] = None
    existing_interventions_count: int = 0

class InterventionCreate(BaseModel):
    student_id: int
    flag_reason: str
    intervention_type: str = "Academic Mentoring"
    notes: Optional[str] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None # open, in_progress, resolved, dismissed
    notes: Optional[str] = None

# Analytics Schemas
class DashboardMetricsOut(BaseModel):
    total_students: int
    total_departments: int
    total_courses: int
    average_cgpa: Optional[float] = None
    average_attendance: Optional[float] = None
    students_at_risk_count: int
    total_stride_points_awarded: int
    active_interventions_count: int
    department_performance: List[dict] = []
    attendance_trend: List[dict] = []
    grade_distribution: List[dict] = []
    recent_stride_activity: List[StrideTransactionOut] = []

# Notifications
class NotificationOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# System Settings
class SystemSettingOut(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemSettingUpdate(BaseModel):
    value: str
