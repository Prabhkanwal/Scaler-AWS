import math

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import DNSRecord, HostedZone
from ..schemas import (
    DNSRecordCreate,
    DNSRecordListResponse,
    DNSRecordResponse,
    DNSRecordUpdate,
)


router = APIRouter(
    prefix="/api/hosted-zones/{zone_id}/records",
    tags=["DNS Records"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=DNSRecordListResponse)
def get_records(
    zone_id: int,
    search: str | None = None,
    type: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    zone = (
        db.query(HostedZone)
        .filter(HostedZone.id == zone_id)
        .first()
    )

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Hosted zone not found",
        )

    query = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id
    )

    if search:
        query = query.filter(
            (DNSRecord.name.ilike(f"%{search}%"))
            | (DNSRecord.value.ilike(f"%{search}%"))
        )

    if type:
        query = query.filter(
            DNSRecord.type == type.upper()
        )

    total = query.count()

    offset = (page - 1) * page_size

    items = (
        query
        .offset(offset)
        .limit(page_size)
        .all()
    )

    total_pages = math.ceil(total / page_size) if total else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get(
    "/{record_id}",
    response_model=DNSRecordResponse,
)
def get_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
):
    record = (
        db.query(DNSRecord)
        .filter(
            DNSRecord.id == record_id,
            DNSRecord.hosted_zone_id == zone_id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS record not found",
        )

    return record


@router.post(
    "/",
    response_model=DNSRecordResponse,
    status_code=201,
)
def create_record(
    zone_id: int,
    record_data: DNSRecordCreate,
    db: Session = Depends(get_db),
):
    zone = (
        db.query(HostedZone)
        .filter(HostedZone.id == zone_id)
        .first()
    )

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Hosted zone not found",
        )

    record = DNSRecord(
        hosted_zone_id=zone_id,
        name=record_data.name,
        type=record_data.type,
        ttl=record_data.ttl,
        value=record_data.value,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.put(
    "/{record_id}",
    response_model=DNSRecordResponse,
)
def update_record(
    zone_id: int,
    record_id: int,
    record_data: DNSRecordUpdate,
    db: Session = Depends(get_db),
):
    record = (
        db.query(DNSRecord)
        .filter(
            DNSRecord.id == record_id,
            DNSRecord.hosted_zone_id == zone_id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS record not found",
        )

    record.name = record_data.name
    record.type = record_data.type
    record.ttl = record_data.ttl
    record.value = record_data.value

    db.commit()
    db.refresh(record)

    return record


@router.delete("/{record_id}")
def delete_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
):
    record = (
        db.query(DNSRecord)
        .filter(
            DNSRecord.id == record_id,
            DNSRecord.hosted_zone_id == zone_id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="DNS record not found",
        )

    db.delete(record)
    db.commit()

    return {
        "message": "DNS record deleted successfully"
    }