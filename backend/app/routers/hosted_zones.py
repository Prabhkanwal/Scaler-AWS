import math
from typing import cast

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import DNSRecord, HostedZone, HostedZoneTag, HostedZoneVPC, User
from ..schemas import HostedZoneCreate, HostedZoneListResponse, HostedZoneResponse, HostedZoneUpdate
from ..services.validation import generate_default_ns_records, generate_default_soa_record, generate_zone_id, normalize_zone_name

router = APIRouter(prefix="/api/hosted-zones", tags=["Hosted Zones"], dependencies=[Depends(get_current_user)])


def _serialize_zone(zone: HostedZone) -> HostedZoneResponse:
    return HostedZoneResponse(
        id=zone.id,
        zone_id=zone.zone_id,
        name=zone.name,
        type=zone.type,
        comment=zone.comment,
        created_by=zone.created_by,
        record_count=db_record_count(zone.id),
        created_at=zone.created_at,
        updated_at=zone.updated_at,
        tags=[{"key": tag.key, "value": tag.value} for tag in zone.tags],
        vpcs=[{"vpc_region": vpc.vpc_region, "vpc_id": vpc.vpc_id} for vpc in zone.vpcs],
    )


def db_record_count(zone_id: int) -> int:
    from ..database import SessionLocal

    db = SessionLocal()
    try:
        return db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).count()
    finally:
        db.close()


@router.get("/", response_model=HostedZoneListResponse)
def get_hosted_zones(
    search: str | None = None,
    zone_type: str | None = Query(default=None, alias="type"),
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    query = db.query(HostedZone)
    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    if zone_type:
        query = query.filter(HostedZone.type == zone_type.lower())

    sort_column = getattr(HostedZone, sort_by, HostedZone.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    serialized = [_serialize_zone(zone) for zone in items]
    total_pages = math.ceil(total / page_size) if total else 0
    return {"items": serialized, "total": total, "page": page, "page_size": page_size, "total_pages": total_pages}


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(zone_id: int, db: Session = Depends(get_db)) -> HostedZoneResponse:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return _serialize_zone(zone)


@router.post("/", response_model=HostedZoneResponse, status_code=201)
def create_hosted_zone(zone_data: HostedZoneCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> HostedZoneResponse:
    try:
        normalized_name = normalize_zone_name(zone_data.name)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if db.query(HostedZone).filter(HostedZone.name == normalized_name, HostedZone.created_by == user.id).first():
        raise HTTPException(status_code=409, detail="A hosted zone with this name already exists")

    if zone_data.type == "private" and not zone_data.vpcs:
        raise HTTPException(status_code=400, detail="Private hosted zones require at least one VPC")

    zone = HostedZone(
        zone_id=generate_zone_id(),
        name=normalized_name,
        type=zone_data.type.value if hasattr(zone_data.type, "value") else str(zone_data.type),
        comment=zone_data.comment,
        created_by=user.id,
    )
    db.add(zone)
    db.flush()

    for tag in zone_data.tags[:50]:
        db.add(HostedZoneTag(hosted_zone_id=zone.id, key=tag.key, value=tag.value))

    for vpc in zone_data.vpcs:
        db.add(HostedZoneVPC(hosted_zone_id=zone.id, vpc_region=vpc.vpc_region, vpc_id=vpc.vpc_id))

    ns_record = generate_default_ns_records(normalized_name)[0]
    soa_record = generate_default_soa_record(normalized_name)
    db.add_all([
        DNSRecord(hosted_zone_id=zone.id, name=normalized_name, type="NS", ttl=ns_record["ttl"], values=ns_record["values"], is_default=True),
        DNSRecord(hosted_zone_id=zone.id, name=normalized_name, type="SOA", ttl=soa_record["ttl"], values=soa_record["values"], is_default=True),
    ])

    db.commit()
    db.refresh(zone)
    return _serialize_zone(zone)


@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone(zone_id: int, zone_data: HostedZoneUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> HostedZoneResponse:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    if zone.created_by != user.id:
        raise HTTPException(status_code=403, detail="You cannot edit another user\'s hosted zone")
    zone.comment = zone_data.comment
    if zone_data.tags is not None:
        for tag in list(zone.tags):
            db.delete(tag)
        db.flush()
        zone.tags.extend(HostedZoneTag(key=tag.key, value=tag.value) for tag in zone_data.tags)
    db.commit()
    db.refresh(zone)
    return _serialize_zone(zone)


@router.delete("/{zone_id}")
def delete_hosted_zone(zone_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id).all()
    non_default = [record for record in records if record.is_default is False]
    if non_default:
        raise HTTPException(status_code=409, detail="Cannot delete hosted zone while non-default records still exist")
    if zone.created_by != user.id:
        raise HTTPException(status_code=403, detail="You cannot delete another user\'s hosted zone")
    db.delete(zone)
    db.commit()
    return {"message": "Hosted zone deleted successfully"}


@router.post("/bulk-delete")
def bulk_delete_hosted_zones(ids: list[int], user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, object]:
    results = []
    success_count = 0
    for zone_id in ids:
        zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
        if not zone:
            results.append({"id": zone_id, "success": False, "message": "Zone not found"})
            continue
        if zone.created_by != user.id:
            results.append({"id": zone_id, "success": False, "message": "Forbidden"})
            continue
        records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id).all()
        if any(not record.is_default for record in records):
            results.append({"id": zone_id, "success": False, "message": "Zone still has non-default records"})
            continue
        db.delete(zone)
        success_count += 1
        results.append({"id": zone_id, "success": True, "message": "Deleted"})
    db.commit()
    return {"success": success_count, "failed": len(results) - success_count, "results": results}
