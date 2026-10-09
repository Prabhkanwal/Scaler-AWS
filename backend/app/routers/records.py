import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import DNSRecord, HostedZone
from ..schemas import DNSRecordCreate, DNSRecordListResponse, DNSRecordResponse, DNSRecordUpdate
from ..services.validation import ensure_policy_fields, normalize_record_name, normalize_zone_name, validate_dns_values

router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["DNS Records"], dependencies=[Depends(get_current_user)])


def _serialize_record(record: DNSRecord) -> DNSRecordResponse:
    return DNSRecordResponse(
        id=record.id,
        hosted_zone_id=record.hosted_zone_id,
        name=record.name,
        type=record.type,
        ttl=record.ttl,
        values=list(record.values or []),
        routing_policy=record.routing_policy,
        set_identifier=record.set_identifier,
        weight=record.weight,
        region=record.region,
        failover_role=record.failover_role,
        geo_location=record.geo_location,
        health_check_id=record.health_check_id,
        is_alias=record.is_alias,
        alias_target=record.alias_target,
        alias_hosted_zone_id=record.alias_hosted_zone_id,
        evaluate_target_health=record.evaluate_target_health,
        comment=record.comment,
        is_default=record.is_default,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.get("/", response_model=DNSRecordListResponse)
def list_records(
    zone_id: int,
    search: str | None = None,
    record_type: str | None = Query(default=None, alias="type"),
    routing_policy: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "asc",
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    allowed_page_sizes = {10, 20, 50, 100}
    if page_size not in allowed_page_sizes:
        page_size = 20
    query = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id)
    if search:
        query = query.filter(DNSRecord.name.ilike(f"%{search}%"))
    if record_type:
        query = query.filter(DNSRecord.type == record_type.upper())
    if routing_policy:
        query = query.filter(DNSRecord.routing_policy == routing_policy)

    sort_column = getattr(DNSRecord, sort_by, DNSRecord.created_at)
    query = query.order_by((sort_column.asc() if sort_order.lower() == "asc" else sort_column.desc()))
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_serialize_record(item) for item in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 0,
    }


@router.get("/{record_id}", response_model=DNSRecordResponse)
def get_record(zone_id: int, record_id: int, db: Session = Depends(get_db)) -> DNSRecordResponse:
    record = db.query(DNSRecord).filter(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="DNS record not found")
    return _serialize_record(record)


@router.post("/", response_model=DNSRecordResponse, status_code=201)
def create_record(zone_id: int, record_data: DNSRecordCreate, db: Session = Depends(get_db)) -> DNSRecordResponse:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    try:
        normalized_name = normalize_record_name(record_data.name or "", zone.name)
        if record_data.type != "TXT" and record_data.type != "SOA":
            validate_dns_values(record_data.type.value if hasattr(record_data.type, "value") else str(record_data.type), list(record_data.values), zone.name)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    ensure_policy_fields(
        str(record_data.type),
        record_data.routing_policy.value if hasattr(record_data.routing_policy, "value") else str(record_data.routing_policy),
        record_data.set_identifier,
        record_data.weight,
        record_data.region,
        record_data.failover_role,
    )

    if record_data.is_alias:
        if not record_data.alias_target:
            raise HTTPException(status_code=422, detail="Alias target is required")
        if record_data.ttl is not None:
            raise HTTPException(status_code=422, detail="Alias records do not use a TTL")

    duplicate = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.name == normalized_name,
        DNSRecord.type == (record_data.type.value if hasattr(record_data.type, "value") else str(record_data.type)),
        DNSRecord.set_identifier == record_data.set_identifier,
    ).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="A record with this type, name, and set identifier already exists")

    record = DNSRecord(
        hosted_zone_id=zone_id,
        name=normalized_name,
        type=(record_data.type.value if hasattr(record_data.type, "value") else str(record_data.type)),
        ttl=record_data.ttl,
        values=list(record_data.values),
        routing_policy=(record_data.routing_policy.value if hasattr(record_data.routing_policy, "value") else str(record_data.routing_policy)),
        set_identifier=record_data.set_identifier,
        weight=record_data.weight,
        region=record_data.region,
        failover_role=record_data.failover_role,
        geo_location=record_data.geo_location,
        health_check_id=record_data.health_check_id,
        is_alias=record_data.is_alias,
        alias_target=record_data.alias_target,
        alias_hosted_zone_id=record_data.alias_hosted_zone_id,
        evaluate_target_health=record_data.evaluate_target_health,
        comment=record_data.comment,
        is_default=False,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _serialize_record(record)


@router.put("/{record_id}", response_model=DNSRecordResponse)
def update_record(zone_id: int, record_id: int, record_data: DNSRecordUpdate, db: Session = Depends(get_db)) -> DNSRecordResponse:
    record = db.query(DNSRecord).filter(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="DNS record not found")
    if record.is_default and record.type in {"NS", "SOA"}:
        raise HTTPException(status_code=400, detail="Default NS and SOA records are protected")

    try:
        normalized_name = normalize_record_name(record_data.name or "", db.query(HostedZone).filter(HostedZone.id == zone_id).one().name)
        validate_dns_values(record_data.type.value if hasattr(record_data.type, "value") else str(record_data.type), list(record_data.values), db.query(HostedZone).filter(HostedZone.id == zone_id).one().name)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    ensure_policy_fields(
        str(record_data.type),
        record_data.routing_policy.value if hasattr(record_data.routing_policy, "value") else str(record_data.routing_policy),
        record_data.set_identifier,
        record_data.weight,
        record_data.region,
        record_data.failover_role,
    )

    record.name = normalized_name
    record.type = record_data.type.value if hasattr(record_data.type, "value") else str(record_data.type)
    record.ttl = record_data.ttl
    record.values = list(record_data.values)
    record.routing_policy = record_data.routing_policy.value if hasattr(record_data.routing_policy, "value") else str(record_data.routing_policy)
    record.set_identifier = record_data.set_identifier
    record.weight = record_data.weight
    record.region = record_data.region
    record.failover_role = record_data.failover_role
    record.geo_location = record_data.geo_location
    record.health_check_id = record_data.health_check_id
    record.is_alias = record_data.is_alias
    record.alias_target = record_data.alias_target
    record.alias_hosted_zone_id = record_data.alias_hosted_zone_id
    record.evaluate_target_health = record_data.evaluate_target_health
    record.comment = record_data.comment
    db.commit()
    db.refresh(record)
    return _serialize_record(record)


@router.delete("/{record_id}")
def delete_record(zone_id: int, record_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    record = db.query(DNSRecord).filter(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="DNS record not found")
    if record.is_default and record.type in {"NS", "SOA"}:
        raise HTTPException(status_code=400, detail="Protected default record cannot be deleted")
    db.delete(record)
    db.commit()
    return {"message": "DNS record deleted successfully"}


@router.post("/bulk", response_model=list[DNSRecordResponse])
def bulk_create_records(zone_id: int, records: list[DNSRecordCreate], db: Session = Depends(get_db)) -> list[DNSRecordResponse]:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    created: list[DNSRecordResponse] = []
    for record_data in records:
        try:
            normalized_name = normalize_record_name(record_data.name or "", zone.name)
            validate_dns_values(record_data.type.value if hasattr(record_data.type, "value") else str(record_data.type), list(record_data.values), zone.name)
            ensure_policy_fields(str(record_data.type), record_data.routing_policy.value if hasattr(record_data.routing_policy, "value") else str(record_data.routing_policy), record_data.set_identifier, record_data.weight, record_data.region, record_data.failover_role)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=f"Invalid record payload: {exc}") from exc
        record = DNSRecord(hosted_zone_id=zone_id, name=normalized_name, type=(record_data.type.value if hasattr(record_data.type, "value") else str(record_data.type)), ttl=record_data.ttl or 300, values=list(record_data.values), routing_policy=(record_data.routing_policy.value if hasattr(record_data.routing_policy, "value") else str(record_data.routing_policy)), set_identifier=record_data.set_identifier, weight=record_data.weight, region=record_data.region, failover_role=record_data.failover_role, geo_location=record_data.geo_location, health_check_id=record_data.health_check_id, is_alias=record_data.is_alias, alias_target=record_data.alias_target, alias_hosted_zone_id=record_data.alias_hosted_zone_id, evaluate_target_health=record_data.evaluate_target_health, comment=record_data.comment)
        db.add(record)
        db.flush()
        created.append(_serialize_record(record))
    db.commit()
    return created


@router.post("/bulk-delete")
def bulk_delete_records(zone_id: int, ids: list[int], db: Session = Depends(get_db)) -> dict[str, object]:
    results = []
    for record_id in ids:
        record = db.query(DNSRecord).filter(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id).first()
        if not record:
            results.append({"id": record_id, "success": False, "message": "Record not found"})
            continue
        if record.is_default and record.type in {"NS", "SOA"}:
            results.append({"id": record_id, "success": False, "message": "Protected default record"})
            continue
        db.delete(record)
        results.append({"id": record_id, "success": True, "message": "Deleted"})
    db.commit()
    return {"success": sum(1 for item in results if item["success"]), "failed": sum(1 for item in results if not item["success"]), "results": results}
