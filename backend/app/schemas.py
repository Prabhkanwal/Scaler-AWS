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
    SOA = "SOA"


class RoutingPolicy(str, Enum):
    SIMPLE = "simple"
    WEIGHTED = "weighted"
    LATENCY = "latency"
    FAILOVER = "failover"
    GEOLOCATION = "geolocation"
    MULTIVALUE = "multivalue"


class VPCRequest(BaseModel):
    vpc_region: str = Field(..., min_length=1)
    vpc_id: str = Field(..., min_length=1)


class TagRequest(BaseModel):
    key: str = Field(..., min_length=1, max_length=64)
    value: str = Field(..., min_length=1, max_length=255)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: str | None = None
    account_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthMeResponse(BaseModel):
    user: UserResponse
    account_id: str | None = None
    region: str = "us-east-1"


class HostedZoneCreate(BaseModel):
    name: str = Field(..., min_length=1)
    type: HostedZoneType = HostedZoneType.PUBLIC
    comment: str | None = Field(default=None, max_length=256)
    tags: list[TagRequest] = Field(default_factory=list)
    vpcs: list[VPCRequest] = Field(default_factory=list)


class HostedZoneUpdate(BaseModel):
    comment: str | None = Field(default=None, max_length=256)


class HostedZoneResponse(BaseModel):
    id: int
    zone_id: str
    name: str
    type: str
    comment: str | None
    created_by: str | int
    record_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None
    tags: list[dict[str, str]] = Field(default_factory=list)
    vpcs: list[dict[str, str]] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class HostedZoneListResponse(BaseModel):
    items: list[HostedZoneResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DNSRecordCreate(BaseModel):
    name: str = Field(default="", min_length=0)
    type: RecordType
    ttl: int | None = Field(default=300, ge=0, le=2147483647)
    values: list[str] = Field(default_factory=list)
    routing_policy: RoutingPolicy = RoutingPolicy.SIMPLE
    set_identifier: str | None = None
    weight: int | None = Field(default=None, ge=0, le=255)
    region: str | None = None
    failover_role: str | None = None
    geo_location: dict | None = None
    health_check_id: str | None = None
    is_alias: bool = False
    alias_target: str | None = None
    alias_hosted_zone_id: str | None = None
    evaluate_target_health: bool = False
    comment: str | None = Field(default=None, max_length=255)


class DNSRecordUpdate(BaseModel):
    name: str = Field(default="", min_length=0)
    type: RecordType
    ttl: int | None = Field(default=300, ge=0, le=2147483647)
    values: list[str] = Field(default_factory=list)
    routing_policy: RoutingPolicy = RoutingPolicy.SIMPLE
    set_identifier: str | None = None
    weight: int | None = Field(default=None, ge=0, le=255)
    region: str | None = None
    failover_role: str | None = None
    geo_location: dict | None = None
    health_check_id: str | None = None
    is_alias: bool = False
    alias_target: str | None = None
    alias_hosted_zone_id: str | None = None
    evaluate_target_health: bool = False
    comment: str | None = Field(default=None, max_length=255)


class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    type: str
    ttl: int | None
    values: list[str]
    routing_policy: str
    set_identifier: str | None = None
    weight: int | None = None
    region: str | None = None
    failover_role: str | None = None
    geo_location: dict | None = None
    health_check_id: str | None = None
    is_alias: bool = False
    alias_target: str | None = None
    alias_hosted_zone_id: str | None = None
    evaluate_target_health: bool = False
    comment: str | None = None
    is_default: bool = False
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class DNSRecordListResponse(BaseModel):
    items: list[DNSRecordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class BulkDeleteItem(BaseModel):
    id: int
    success: bool = True
    message: str | None = None


class BulkDeleteResponse(BaseModel):
    success: int
    failed: int
    results: list[BulkDeleteItem]


class BINDImportResult(BaseModel):
    created: int
    skipped: int
    errors: list[dict[str, str]]


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list[dict[str, object]] = Field(default_factory=list)


class ErrorEnvelope(BaseModel):
    error: ErrorDetail