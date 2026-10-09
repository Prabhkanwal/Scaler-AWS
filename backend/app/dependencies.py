from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import Session as DBSession
from .models import User, normalize_utc


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    session_token = request.cookies.get(settings.cookie_name)
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = db.query(DBSession).filter(DBSession.session_token == session_token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    if normalize_utc(session.expires_at) <= datetime.now(timezone.utc):
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=401, detail="Session expired")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user