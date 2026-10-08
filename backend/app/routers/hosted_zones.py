import math

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import HostedZone
from ..schemas import (
    HostedZoneCreate,
    HostedZoneListResponse,
    HostedZoneResponse,
    HostedZoneUpdate,
)


router = APIRouter(
    prefix="/api/hosted-zones",
    tags=["Hosted Zones"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=HostedZoneListResponse)
def get_hosted_zones(
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(HostedZone)

    if search:
        query = query.filter(
            HostedZone.name.ilike(f"%{search}%")
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


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(
    zone_id: int,
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

    return zone


@router.post(
    "/",
    response_model=HostedZoneResponse,
    status_code=201,
)
def create_hosted_zone(
    zone_data: HostedZoneCreate,
    db: Session = Depends(get_db),
):
    existing_zone = (
        db.query(HostedZone)
        .filter(HostedZone.name == zone_data.name)
        .first()
    )

    if existing_zone:
        raise HTTPException(
            status_code=400,
            detail="A hosted zone with this name already exists",
        )

    zone = HostedZone(
        name=zone_data.name,
        type=zone_data.type,
        comment=zone_data.comment,
    )

    db.add(zone)
    db.commit()
    db.refresh(zone)

    return zone


@router.put(
    "/{zone_id}",
    response_model=HostedZoneResponse,
)
def update_hosted_zone(
    zone_id: int,
    zone_data: HostedZoneUpdate,
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

    existing_zone = (
        db.query(HostedZone)
        .filter(
            HostedZone.name == zone_data.name,
            HostedZone.id != zone_id,
        )
        .first()
    )

    if existing_zone:
        raise HTTPException(
            status_code=400,
            detail="A hosted zone with this name already exists",
        )

    zone.name = zone_data.name
    zone.type = zone_data.type
    zone.comment = zone_data.comment

    db.commit()
    db.refresh(zone)

    return zone


@router.delete("/{zone_id}")
def delete_hosted_zone(
    zone_id: int,
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

    db.delete(zone)
    db.commit()

    return {
        "message": "Hosted zone deleted successfully"
    }