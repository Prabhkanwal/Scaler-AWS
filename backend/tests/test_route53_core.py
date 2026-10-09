from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import Session as DBSession, normalize_utc


client = TestClient(app)


def login() -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200, response.text


def create_zone(name: str = "acceptance.example.com", **extra: object) -> dict[str, object]:
    response = client.post(
        "/api/hosted-zones/",
        json={"name": name, "type": "public", **extra},
    )
    assert response.status_code == 201, response.text
    return response.json()


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


def test_unauthed_hosted_zone_and_record_requests_are_rejected():
    client.post("/api/auth/logout")
    assert client.get("/api/hosted-zones/").status_code == 401
    assert client.post("/api/hosted-zones/1/records/", json={}).status_code == 401


def test_session_restores_across_requests_and_logout_invalidates_it():
    login()
    assert client.get("/api/auth/me").status_code == 200
    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/hosted-zones/").status_code == 401


def test_private_zone_tags_vpc_and_zone_crud():
    login()
    response = client.post(
        "/api/hosted-zones/",
        json={
            "name": "private.acceptance.example",
            "type": "private",
            "comment": "private zone",
            "tags": [{"key": "Environment", "value": "test"}],
            "vpcs": [{"vpc_id": "vpc-0123456789abcdef0", "vpc_region": "us-east-1"}],
        },
    )
    assert response.status_code == 201, response.text
    zone = response.json()
    assert zone["type"] == "private"
    assert zone["tags"] == [{"key": "Environment", "value": "test"}]
    assert zone["vpcs"] == [{"vpc_id": "vpc-0123456789abcdef0", "vpc_region": "us-east-1"}]

    updated = client.put(f"/api/hosted-zones/{zone['id']}", json={"comment": "updated"})
    assert updated.status_code == 200, updated.text
    assert updated.json()["comment"] == "updated"
    assert updated.json()["tags"] == [{"key": "Environment", "value": "test"}]
    updated_tags = client.put(
        f"/api/hosted-zones/{zone['id']}",
        json={"comment": "updated", "tags": [{"key": "Owner", "value": "QA"}]},
    )
    assert updated_tags.status_code == 200, updated_tags.text
    assert updated_tags.json()["tags"] == [{"key": "Owner", "value": "QA"}]
    deleted = client.delete(f"/api/hosted-zones/{zone['id']}")
    assert deleted.status_code == 200, deleted.text
    assert client.get(f"/api/hosted-zones/{zone['id']}").status_code == 404


def test_hosted_zone_search_pagination_and_real_zone_id():
    login()
    first = create_zone("page-one.acceptance.example")
    create_zone("page-two.acceptance.example")

    first_page = client.get("/api/hosted-zones/?search=page-&page=1&page_size=1")
    assert first_page.status_code == 200, first_page.text
    payload = first_page.json()
    assert payload["total"] == 2
    assert payload["page"] == 1
    assert payload["total_pages"] == 2
    assert payload["items"][0]["zone_id"].startswith("Z")

    second_page = client.get("/api/hosted-zones/?search=page-&page=2&page_size=1")
    assert second_page.status_code == 200, second_page.text
    assert second_page.json()["items"][0]["id"] != payload["items"][0]["id"]
    assert client.get("/api/hosted-zones/?page=0").status_code == 422
    assert first["zone_id"] != ""


@pytest.mark.parametrize(
    ("record_type", "values"),
    [
        ("A", ["192.0.2.44"]),
        ("AAAA", ["2001:db8::44"]),
        ("CNAME", ["target.example.net."]),
        ("TXT", ['"verification=ok"']),
        ("MX", ["10 mail.example.net."]),
        ("NS", ["ns1.example.net."]),
        ("PTR", ["host.example.net."]),
        ("SRV", ["1 2 443 service.example.net."]),
        ("CAA", ['0 issue "ca.example"']),
    ],
)
def test_required_record_types_create_and_persist(record_type: str, values: list[str]):
    login()
    zone = create_zone(f"{record_type.lower()}.records.example")
    response = client.post(
        f"/api/hosted-zones/{zone['id']}/records/",
        json={"name": f"_{record_type.lower()}", "type": record_type, "ttl": 300, "values": values},
    )
    assert response.status_code == 201, response.text
    record_id = response.json()["id"]
    persisted = client.get(f"/api/hosted-zones/{zone['id']}/records/{record_id}")
    assert persisted.status_code == 200, persisted.text
    assert persisted.json()["type"] == record_type
    assert persisted.json()["values"] == values


def test_record_crud_search_filter_and_pagination():
    login()
    zone = create_zone("crud.records.example")
    created = client.post(
        f"/api/hosted-zones/{zone['id']}/records/",
        json={"name": "www", "type": "A", "ttl": 120, "values": ["192.0.2.80"]},
    )
    assert created.status_code == 201, created.text
    record = created.json()
    second = client.post(
        f"/api/hosted-zones/{zone['id']}/records/",
        json={"name": "mail", "type": "MX", "ttl": 300, "values": ["10 mail.example.net."]},
    )
    assert second.status_code == 201, second.text
    for index in range(7):
        response = client.post(
            f"/api/hosted-zones/{zone['id']}/records/",
            json={"name": f"host-{index}", "type": "A", "ttl": 300, "values": [f"192.0.2.{100 + index}"]},
        )
        assert response.status_code == 201, response.text

    filtered = client.get(f"/api/hosted-zones/{zone['id']}/records/?search=192.0.2.80&type=A")
    assert filtered.status_code == 200, filtered.text
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["id"] == record["id"]

    page = client.get(f"/api/hosted-zones/{zone['id']}/records/?page=1&page_size=10")
    assert page.status_code == 200, page.text
    assert page.json()["total"] == 11
    assert page.json()["total_pages"] == 2

    updated = client.put(
        f"/api/hosted-zones/{zone['id']}/records/{record['id']}",
        json={"name": "www", "type": "A", "ttl": 600, "values": ["192.0.2.81"]},
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["values"] == ["192.0.2.81"]
    assert updated.json()["ttl"] == 600

    deleted = client.delete(f"/api/hosted-zones/{zone['id']}/records/{record['id']}")
    assert deleted.status_code == 200, deleted.text
    assert client.get(f"/api/hosted-zones/{zone['id']}/records/{record['id']}").status_code == 404


def test_record_validation_rejects_out_of_zone_names_and_invalid_policy():
    login()
    zone = create_zone("boundary.records.example")
    outside = client.post(
        f"/api/hosted-zones/{zone['id']}/records/",
        json={"name": "notboundary.records.example.", "type": "A", "values": ["192.0.2.1"]},
    )
    assert outside.status_code == 422, outside.text

    bad_policy = client.post(
        f"/api/hosted-zones/{zone['id']}/records/",
        json={"name": "www", "type": "A", "values": ["192.0.2.1"], "routing_policy": "weighted"},
    )
    assert bad_policy.status_code == 422, bad_policy.text

    invalid_txt = client.post(
        f"/api/hosted-zones/{zone['id']}/records/",
        json={"name": "empty", "type": "TXT", "values": []},
    )
    assert invalid_txt.status_code == 422, invalid_txt.text
