from datetime import datetime, timedelta, timezone

import bcrypt

from .database import SessionLocal
from .models import DNSRecord, HostedZone, HostedZoneTag, HostedZoneVPC, User


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_mock_user() -> None:
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if existing:
            return

        user = User(
            username="admin",
            password_hash=_hash_password("admin123"),
            display_name="Admin User",
            account_id="123456789012",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        zone_1 = HostedZone(
            zone_id="Z1234567890ABCDEF1234",
            name="seed.example.com.",
            type="public",
            comment="Example public zone",
            created_by=user.id,
        )
        db.add(zone_1)
        db.commit()
        db.refresh(zone_1)

        zone_1.tags.append(HostedZoneTag(key="Environment", value="Demo"))

        db.add_all(
            [
                DNSRecord(
                    hosted_zone_id=zone_1.id,
                    name="seed.example.com.",
                    type="NS",
                    ttl=172800,
                    values=["ns-2048.awsdns-64.net."],
                    is_default=True,
                    comment="Default NS record",
                ),
                DNSRecord(
                    hosted_zone_id=zone_1.id,
                    name="seed.example.com.",
                    type="SOA",
                    ttl=900,
                    values=["ns-2048.awsdns-64.net. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"],
                    is_default=True,
                    comment="Default SOA record",
                ),
                DNSRecord(
                    hosted_zone_id=zone_1.id,
                    name="www.seed.example.com.",
                    type="A",
                    ttl=300,
                    values=["93.184.216.34"],
                ),
                DNSRecord(
                    hosted_zone_id=zone_1.id,
                    name="mail.seed.example.com.",
                    type="MX",
                    ttl=300,
                    values=["10 mail.seed.example.com."],
                ),
            ]
        )

        zone_2 = HostedZone(
            zone_id="ZABCDEF1234567890ABCD",
            name="internal.seed.example.com.",
            type="private",
            comment="Private zone",
            created_by=user.id,
        )
        db.add(zone_2)
        db.commit()
        db.refresh(zone_2)
        zone_2.vpcs.append(HostedZoneVPC(vpc_region="us-east-1", vpc_id="vpc-demo-01"))
        zone_2.tags.append(HostedZoneTag(key="Owner", value="Platform"))

        db.add(
            DNSRecord(
                hosted_zone_id=zone_2.id,
                name="internal.seed.example.com.",
                type="NS",
                ttl=172800,
                values=["ns-2048.awsdns-64.net."],
                is_default=True,
            )
        )
        db.add(
            DNSRecord(
                hosted_zone_id=zone_2.id,
                name="internal.seed.example.com.",
                type="SOA",
                ttl=900,
                values=["ns-2048.awsdns-64.net. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"],
                is_default=True,
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()