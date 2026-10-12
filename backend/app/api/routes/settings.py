from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SystemSetting, AuditLog
from app.schemas.schemas import SystemSettingOut, SystemSettingUpdate
from app.config import settings
from app.api.deps import require_roles, get_current_user

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("", response_model=Dict[str, str])
def get_system_settings(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_settings = db.query(SystemSetting).all()
    res = {
        "attendance_threshold": str(settings.ATTENDANCE_THRESHOLD),
        "at_risk_gpa_threshold": str(settings.AT_RISK_GPA_THRESHOLD),
        "project_name": settings.PROJECT_NAME,
        "project_short_name": settings.PROJECT_SHORT_NAME,
        "environment": settings.ENVIRONMENT
    }
    for s in db_settings:
        res[s.key] = s.value
    return res

@router.put("/{key}")
def update_system_setting(
    key: str,
    payload: SystemSettingUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("admin"))
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        setting = SystemSetting(key=key, value=payload.value, updated_by_id=current_user.id)
        db.add(setting)
    else:
        setting.value = payload.value
        setting.updated_by_id = current_user.id

    # If updating threshold, also reflect in settings object
    if key == "attendance_threshold":
        try:
            settings.ATTENDANCE_THRESHOLD = float(payload.value)
        except ValueError:
            pass
    elif key == "at_risk_gpa_threshold":
        try:
            settings.AT_RISK_GPA_THRESHOLD = float(payload.value)
        except ValueError:
            pass

    audit = AuditLog(
        user_id=current_user.id,
        action="setting_update",
        entity_type="SystemSetting",
        entity_id=key,
        details_json=f'{{"key": "{key}", "new_value": "{payload.value}"}}'
    )
    db.add(audit)
    db.commit()
    return {"message": "Setting updated successfully", "key": key, "value": payload.value}
