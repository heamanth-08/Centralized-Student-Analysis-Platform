from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, AuditLog
from app.schemas.schemas import LoginRequest, RegisterRequest, Token, UserOut
from app.services.auth_service import verify_password, create_access_token, get_password_hash
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Public registration endpoint for new users. Defaults role to 'student'."""
    # Check for existing username
    existing_user = db.query(User).filter(User.username == payload.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "USERNAME_TAKEN", "message": "This username is already registered", "details": []}}
        )
    # Check for existing email
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "EMAIL_TAKEN", "message": "This email address is already registered", "details": []}}
        )

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="student",
        is_active=True,
    )
    db.add(user)
    db.flush()

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="register",
        entity_type="User",
        entity_id=str(user.id),
        details_json=f'{{"username": "{user.username}", "role": "student"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    # Auto-login: issue JWT so the user is signed in immediately
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 7200,
        "user": user
    }

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid username or password", "details": []}}
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": {"code": "USER_INACTIVE", "message": "Account has been deactivated", "details": []}}
        )

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="login",
        entity_type="User",
        entity_id=str(user.id),
        details_json=f'{{"username": "{user.username}", "role": "{user.role}"}}'
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 7200,
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}
