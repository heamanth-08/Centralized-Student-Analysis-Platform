from fastapi import APIRouter
from app.api.routes import (
    auth, students, analytics, stride, support, departments,
    imports, reports, notifications, users, settings
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(analytics.router)
api_router.include_router(stride.router)
api_router.include_router(support.router)
api_router.include_router(departments.router)
api_router.include_router(imports.router)
api_router.include_router(reports.router)
api_router.include_router(notifications.router)
api_router.include_router(users.router)
api_router.include_router(settings.router)
