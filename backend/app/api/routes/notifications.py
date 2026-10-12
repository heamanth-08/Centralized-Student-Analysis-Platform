from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_user_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notes = db.query(Notification).filter(
        or_(Notification.user_id == current_user.id, Notification.user_id == None)
    ).order_by(Notification.created_at.desc()).limit(30).all()
    return notes

@router.patch("/{id}/read", response_model=NotificationOut)
def mark_notification_read(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    note = db.query(Notification).filter(Notification.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    note.is_read = True
    db.commit()
    db.refresh(note)
    return note
