import ipaddress
import re
from datetime import datetime, timezone
from random import choices
from string import ascii_uppercase, digits

VALID_RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"]


def normalize_zone_name(name: str) -> str:
    if not name or not name.strip():
        raise ValueError("Zone name is required")
    cleaned = name.strip().lower()
    if not cleaned.endswith("."):
        cleaned += "."
    if len(cleaned) > 253:
        raise ValueError("Hosted zone name exceeds the maximum length")
    labels = cleaned[:-1].split(".")
    if any(not label for label in labels):
        raise ValueError("Hosted zone name contains invalid empty labels")
    if len(labels) < 2:
        raise ValueError("Hosted zone name must include at least two labels")
    for label in labels:
        if len(label) > 63:
            raise ValueError(f"Label '{label}' exceeds 63 characters")
        if not re.fullmatch(r"[a-z0-9*-]+", label):
            raise ValueError(f"Label '{label}' contains invalid characters")
    return cleaned


def generate_zone_id() -> str:
    chars = ascii_uppercase + digits
    return "Z" + "".join(choices(chars, k=20))


def normalize_record_name(name: str, zone_name: str) -> str:
    cleaned = (name or "").strip().lower()
    zone_name = normalize_zone_name(zone_name)
    zone_body = zone_name[:-1]
    if not cleaned or cleaned in {"@", "*"}:
        return zone_name

    if cleaned.endswith("."):
        candidate = cleaned
    elif cleaned == zone_body or cleaned.endswith("." + zone_body):
        candidate = cleaned + "."
    else:
        candidate = f"{cleaned}.{zone_body}."

    candidate_body = candidate[:-1]
    labels = candidate_body.split(".")
    if len(candidate_body) > 253 or any(
        not label or len(label) > 63 or not re.fullmatch(r"[a-z0-9_*_-]+", label)
        for label in labels
    ):
        raise ValueError("Record name contains invalid DNS labels")
    if candidate != zone_name and not candidate.endswith("." + zone_name):
        raise ValueError("Record name must be within the hosted zone")
    return candidate


def _normalize_relative_name(name: str, zone: str) -> str:
    value = name.strip().lower().rstrip(".")
    if not value:
        return zone + "."
    if value == zone:
        return zone + "."
    if value.endswith("." + zone):
        return value + "."
    return f"{value}.{zone}."


def is_valid_ipv4(value: str) -> bool:
    try:
        ipaddress.IPv4Address(value)
        return True
    except ValueError:
        return False


def is_valid_ipv6(value: str) -> bool:
    try:
        ipaddress.IPv6Address(value)
        return True
    except ValueError:
        return False


def is_valid_hostname(value: str) -> bool:
    if not value or value == ".":
        return False
    candidate = value.rstrip(".")
    if candidate.startswith("*."):
        candidate = candidate[2:]
    if not candidate:
        return False
    labels = candidate.split(".")
    if any(len(label) > 63 for label in labels):
        return False
    for label in labels:
        if not re.fullmatch(r"[A-Za-z0-9_-]+", label):
            return False
    return True


def validate_dns_values(record_type: str, values: list[str], zone_name: str | None = None) -> None:
    if not values:
        raise ValueError("At least one value is required")
    if record_type == "A":
        for item in values:
            if not is_valid_ipv4(item):
                raise ValueError(f"{item!r} is not a valid IPv4 address")
    elif record_type == "AAAA":
        for item in values:
            if not is_valid_ipv6(item):
                raise ValueError(f"{item!r} is not a valid IPv6 address")
    elif record_type == "CNAME":
        if len(values) != 1:
            raise ValueError("CNAME records accept exactly one value")
        candidate = values[0].rstrip(".")
        if zone_name and candidate.lower() == zone_name.rstrip(".").lower():
            raise ValueError("CNAME cannot be created at the zone apex")
        if not is_valid_hostname(candidate):
            raise ValueError(f"{candidate!r} is not a valid hostname")
    elif record_type == "TXT":
        for item in values:
            if not item:
                raise ValueError("Values cannot be empty")
    elif record_type == "CAA":
        for item in values:
            parts = item.split(maxsplit=2)
            if len(parts) != 3:
                raise ValueError("CAA values must be in the format 'flags tag value'")
            try:
                flags = int(parts[0])
            except ValueError as exc:
                raise ValueError("CAA flags must be an integer") from exc
            if not 0 <= flags <= 255 or not re.fullmatch(r"[a-z0-9-]+", parts[1], re.IGNORECASE) or not parts[2]:
                raise ValueError("CAA values must contain valid flags, tag, and value")
    elif record_type == "MX":
        for item in values:
            parts = item.split()
            if len(parts) != 2:
                raise ValueError("MX values must be in the format 'priority hostname'")
            try:
                priority = int(parts[0])
            except ValueError as exc:
                raise ValueError("MX priority must be an integer") from exc
            if not 0 <= priority <= 65535:
                raise ValueError("MX priority must be between 0 and 65535")
            if not is_valid_hostname(parts[1]):
                raise ValueError(f"{parts[1]!r} is not a valid MX hostname")
    elif record_type == "NS":
        for item in values:
            if not is_valid_hostname(item):
                raise ValueError(f"{item!r} is not a valid NS hostname")
    elif record_type == "PTR":
        for item in values:
            if not is_valid_hostname(item):
                raise ValueError(f"{item!r} is not a valid PTR hostname")
    elif record_type == "SRV":
        for item in values:
            parts = item.split()
            if len(parts) != 4:
                raise ValueError("SRV values must be in the format 'priority weight port target'")
            for index, field in enumerate(parts[:3]):
                try:
                    value = int(field)
                except ValueError as exc:
                    raise ValueError(f"SRV field {index + 1} must be an integer") from exc
                if not 0 <= value <= 65535:
                    raise ValueError("SRV values must be between 0 and 65535")
            if not is_valid_hostname(parts[3]):
                raise ValueError(f"{parts[3]!r} is not a valid SRV target")
    elif record_type == "SOA":
        if not values or len(values) != 1:
            raise ValueError("SOA values must contain exactly one value")


def ensure_policy_fields(record_type: str, routing_policy: str, set_identifier: str | None, weight: int | None, region: str | None, failover_role: str | None) -> None:
    if routing_policy == "simple":
        return
    if not set_identifier:
        raise ValueError("set_identifier is required for non-simple routing policies")
    if routing_policy == "weighted":
        if weight is None or not 0 <= weight <= 255:
            raise ValueError("Weight must be between 0 and 255 for weighted routing")
    elif routing_policy == "latency":
        if not region:
            raise ValueError("region is required for latency routing")
    elif routing_policy == "failover":
        if not failover_role or failover_role not in {"primary", "secondary"}:
            raise ValueError("failover_role must be 'primary' or 'secondary'")


def generate_default_ns_records(zone_name: str) -> list[dict[str, object]]:
    names = [
        "ns-2048.awsdns-64.net.",
        "ns-2048.awsdns-64.com.",
        "ns-2048.awsdns-64.org.",
        "ns-2048.awsdns-64.co.uk.",
    ]
    return [{"name": zone_name, "type": "NS", "ttl": 172800, "values": names, "is_default": True, "routing_policy": "simple"}]


def generate_default_soa_record(zone_name: str) -> dict[str, object]:
    return {"name": zone_name, "type": "SOA", "ttl": 900, "values": ["ns-2048.awsdns-64.net. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"], "is_default": True, "routing_policy": "simple"}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
