import secrets

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Session as DBSession
from ..models import User
from ..schemas import LoginRequest, UserResponse


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=UserResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.username == login_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    password_valid = bcrypt.checkpw(
        login_data.password.encode("utf-8"),
        user.password_hash.encode("utf-8"),
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    session_token = secrets.token_urlsafe(32)

    db_session = DBSession(
        user_id=user.id,
        session_token=session_token,
    )

    db.add(db_session)
    db.commit()

    # Create a secure cross-site session cookie
    response.set_cookie(
        key="route53_session",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
    )

    return user


@router.get("/me", response_model=UserResponse)
def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    session_token = request.cookies.get("route53_session")

    if not session_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    db_session = (
        db.query(DBSession)
        .filter(DBSession.session_token == session_token)
        .first()
    )

    if not db_session:
        raise HTTPException(
            status_code=401,
            detail="Invalid session",
        )

    user = (
        db.query(User)
        .filter(User.id == db_session.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    session_token = request.cookies.get("route53_session")

    if session_token:
        db_session = (
            db.query(DBSession)
            .filter(DBSession.session_token == session_token)
            .first()
        )

        if db_session:
            db.delete(db_session)
            db.commit()

    response.delete_cookie(
        key="route53_session",
    )

    return {
        "message": "Logged out successfully"
    }