from datetime import timedelta

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import Session as DBSession, normalize_utc


client = TestClient(app)


def test_login_and_zone_creation():
    login = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert login.status_code == 200, login.text
    assert login.cookies.get("route53_session")

    create_zone = client.post(
        "/api/hosted-zones/",
        json={"name": "example.com", "type": "public", "comment": "Production"},
    )
    assert create_zone.status_code == 201, create_zone.text
    zone = create_zone.json()
    assert zone["name"] == "example.com."
    assert zone["zone_id"].startswith("Z")
    assert zone["record_count"] >= 2

    records = client.get("/api/hosted-zones/" + str(zone["id"]) + "/records/")
    assert records.status_code == 200, records.text
    payload = records.json()
    assert payload["total"] >= 2
    names = {item["name"] for item in payload["items"]}
    assert any(name.endswith("example.com.") for name in names)


def test_default_ns_soa_are_protected():
    login = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert login.status_code == 200

    zone = client.post(
        "/api/hosted-zones/",
        json={"name": "demo.example.com", "type": "public"},
    ).json()
    records = client.get(f"/api/hosted-zones/{zone['id']}/records/").json()["items"]
    default_ns = [r for r in records if r["type"] == "NS" and r["is_default"] is True]
    default_soa = [r for r in records if r["type"] == "SOA" and r["is_default"] is True]
    assert len(default_ns) == 1
    assert len(default_soa) == 1

    delete_ns = client.delete(f"/api/hosted-zones/{zone['id']}/records/{default_ns[0]['id']}")
    delete_soa = client.delete(f"/api/hosted-zones/{zone['id']}/records/{default_soa[0]['id']}")
    assert delete_ns.status_code == 400 or delete_ns.status_code == 409
    assert delete_soa.status_code == 400 or delete_soa.status_code == 409


def test_record_type_validation():
    login = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert login.status_code == 200

    zone = client.post(
        "/api/hosted-zones/",
        json={"name": "bad.example.com", "type": "public"},
    ).json()

    invalid = client.post(
        f"/api/hosted-zones/{zone['id']}/records/",
        json={
            "name": "www",
            "type": "A",
            "ttl": 300,
            "values": ["not-an-ip"],
        },
    )
    assert invalid.status_code == 422


def test_session_expiration_uses_utc_timezone():
    login = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert login.status_code == 200, login.text

    token = login.cookies.get("route53_session")
    assert token

    db = SessionLocal()
    try:
        session = db.query(DBSession).filter(DBSession.session_token == token).one()
        normalized = normalize_utc(session.expires_at)
        assert normalized.tzinfo is not None
        assert normalized.utcoffset() == timedelta(0)
    finally:
        db.close()
