import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Session as DBSession
from ..models import User, normalize_utc
from ..schemas import AuthMeResponse, LoginRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse)
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not bcrypt.checkpw(login_data.password.encode("utf-8"), user.password_hash.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    session_token = secrets.token_urlsafe(32)
    expires_at = normalize_utc(datetime.now(timezone.utc) + timedelta(hours=settings.session_ttl_hours))
    db_session = DBSession(user_id=user.id, session_token=session_token, expires_at=expires_at)
    db.add(db_session)
    db.commit()

    response.set_cookie(
        key=settings.cookie_name,
        value=session_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=int(timedelta(hours=settings.session_ttl_hours).total_seconds()),
    )
    return user


@router.get("/me", response_model=AuthMeResponse)
def get_current_user(request: Request, db: Session = Depends(get_db)) -> dict[str, object]:
    session_token = request.cookies.get(settings.cookie_name)
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_session = db.query(DBSession).filter(DBSession.session_token == session_token).first()
    if not db_session:
        raise HTTPException(status_code=401, detail="Invalid session")

    if normalize_utc(db_session.expires_at) <= datetime.now(timezone.utc):
        db.delete(db_session)
        db.commit()
        raise HTTPException(status_code=401, detail="Session expired")

    user = db.query(User).filter(User.id == db_session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {"user": user, "account_id": user.account_id, "region": "us-east-1"}


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)) -> dict[str, str]:
    session_token = request.cookies.get(settings.cookie_name)
    if session_token:
        session = db.query(DBSession).filter(DBSession.session_token == session_token).first()
        if session:
            db.delete(session)
            db.commit()
    response.delete_cookie(key=settings.cookie_name)
    return {"message": "Logged out successfully"}

