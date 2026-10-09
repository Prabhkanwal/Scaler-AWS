from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    account_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    sessions: Mapped[list["Session"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped[User] = relationship(back_populates="sessions")


class HostedZone(Base):
    __tablename__ = "hosted_zones"
    __table_args__ = (
        UniqueConstraint("zone_id", name="uq_hosted_zone_zone_id"),
        UniqueConstraint("name", "created_by", name="uq_hosted_zone_name_owner"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    zone_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(16), nullable=False, default="public")
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=True)

    records: Mapped[list["DNSRecord"]] = relationship(back_populates="hosted_zone", cascade="all, delete-orphan")
    tags: Mapped[list["HostedZoneTag"]] = relationship(back_populates="hosted_zone", cascade="all, delete-orphan")
    vpcs: Mapped[list["HostedZoneVPC"]] = relationship(back_populates="hosted_zone", cascade="all, delete-orphan")


class HostedZoneTag(Base):
    __tablename__ = "hosted_zone_tags"
    __table_args__ = (UniqueConstraint("hosted_zone_id", "key", name="uq_hosted_zone_tag_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hosted_zone_id: Mapped[int] = mapped_column(ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    key: Mapped[str] = mapped_column(String(64), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)

    hosted_zone: Mapped[HostedZone] = relationship(back_populates="tags")


class HostedZoneVPC(Base):
    __tablename__ = "hosted_zone_vpcs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hosted_zone_id: Mapped[int] = mapped_column(ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    vpc_region: Mapped[str] = mapped_column(String(64), nullable=False)
    vpc_id: Mapped[str] = mapped_column(String(120), nullable=False)

    hosted_zone: Mapped[HostedZone] = relationship(back_populates="vpcs")


class DNSRecord(Base):
    __tablename__ = "dns_records"
    __table_args__ = (
        UniqueConstraint("hosted_zone_id", "name", "type", "set_identifier", name="uq_zone_record_name_type_set_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hosted_zone_id: Mapped[int] = mapped_column(ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    ttl: Mapped[int | None] = mapped_column(Integer, nullable=True, default=300)
    values: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    routing_policy: Mapped[str] = mapped_column(String(20), nullable=False, default="simple")
    set_identifier: Mapped[str | None] = mapped_column(String(128), nullable=True)
    weight: Mapped[int | None] = mapped_column(Integer, nullable=True)
    region: Mapped[str | None] = mapped_column(String(64), nullable=True)
    failover_role: Mapped[str | None] = mapped_column(String(20), nullable=True)
    geo_location: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    health_check_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_alias: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    alias_target: Mapped[str | None] = mapped_column(String(255), nullable=True)
    alias_hosted_zone_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    evaluate_target_health: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=True)

    hosted_zone: Mapped[HostedZone] = relationship(back_populates="records")