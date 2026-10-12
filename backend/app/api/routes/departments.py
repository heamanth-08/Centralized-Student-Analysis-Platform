from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Department, Course, AcademicPeriod
from app.schemas.schemas import DepartmentOut, DepartmentCreate, CourseOut, CourseCreate, AcademicPeriodOut
from app.api.deps import get_current_user, require_roles

router = APIRouter(tags=["Departments & Courses"])

@router.get("/departments", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Department).order_by(Department.code.asc()).all()

@router.post("/departments", response_model=DepartmentOut)
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    existing = db.query(Department).filter(Department.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail={"error": {"code": "ALREADY_EXISTS", "message": "Department code exists"}})
    dept = Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.get("/courses", response_model=List[CourseOut])
def list_courses(
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Course)
    if department_id:
        query = query.filter(Course.department_id == department_id)
    if semester:
        query = query.filter(Course.semester == semester)
    courses = query.order_by(Course.code.asc()).all()

    outs = []
    for c in courses:
        out = CourseOut.model_validate(c)
        out.department_name = c.department.name if c.department else None
        outs.append(out)
    return outs

@router.post("/courses", response_model=CourseOut)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    existing = db.query(Course).filter(Course.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail={"error": {"code": "ALREADY_EXISTS", "message": "Course code exists"}})
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    out = CourseOut.model_validate(course)
    out.department_name = course.department.name if course.department else None
    return out

@router.get("/academic-periods", response_model=List[AcademicPeriodOut])
def list_academic_periods(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(AcademicPeriod).order_by(AcademicPeriod.id.desc()).all()
