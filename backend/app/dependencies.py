from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .database import get_db
from .models import Session as DBSession
from .models import User


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