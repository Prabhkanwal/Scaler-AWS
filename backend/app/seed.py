import bcrypt

from .database import SessionLocal
from .models import User


def create_mock_user():
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.username == "admin")
            .first()
        )

        if existing_user:
            return

        password = "admin123"

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

        user = User(
            username="admin",
            password_hash=password_hash,
        )

        db.add(user)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()