import os
from pathlib import Path

root = Path(__file__).resolve().parents[1]
test_database = root / "test_route53.db"
if test_database.exists():
    test_database.unlink()

os.environ["DATABASE_URL"] = "sqlite:///./test_route53.db"
os.environ["SEED_ON_START"] = "true"
