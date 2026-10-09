import os
from pathlib import Path

root = Path(__file__).resolve().parents[1]
for filename in ("route53.db", "test_route53.db"):
    db_file = root / filename
    if db_file.exists():
        db_file.unlink()

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_route53.db")
os.environ.setdefault("SEED_ON_START", "true")
