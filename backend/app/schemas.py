from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class HostedZoneType(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class RecordType(str, Enum):
    A = "A"
    AAAA = "AAAA"
    CNAME = "CNAME"
    TXT = "TXT"
    MX = "MX"
    NS = "NS"
    PTR = "PTR"
    SRV = "SRV"
    CAA = "CAA"


# Hosted Zone Table

class HostedZoneCreate(BaseModel):
    name: str = Field(min_length=1)
    type: HostedZoneType = HostedZoneType.PUBLIC
    comment: str | None = None


class HostedZoneUpdate(BaseModel):
    name: str = Field(min_length=1)
    type: HostedZoneType
    comment: str | None = None


class HostedZoneResponse(BaseModel):
    id: int
    name: str
    type: str
    comment: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class HostedZoneListResponse(BaseModel):
    items: list[HostedZoneResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# DNS Record Table

class DNSRecordCreate(BaseModel):
    name: str = Field(min_length=1)
    type: RecordType
    ttl: int = Field(default=300, ge=1)
    value: str = Field(min_length=1)


class DNSRecordUpdate(BaseModel):
    name: str = Field(min_length=1)
    type: RecordType
    ttl: int = Field(ge=1)
    value: str = Field(min_length=1)


class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    type: str
    ttl: int
    value: str
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class DNSRecordListResponse(BaseModel):
    items: list[DNSRecordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Authentication

class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)