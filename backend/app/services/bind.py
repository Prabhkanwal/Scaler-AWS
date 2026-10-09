import re
from collections.abc import Iterable

from .validation import normalize_zone_name


class BindImportError(ValueError):
    pass


def parse_bind_zone(zone_text: str, zone_name: str) -> list[dict[str, object]]:
    zone_name = normalize_zone_name(zone_name)
    lines = zone_text.splitlines()
    normalized_lines: list[str] = []
    buffer: list[str] = []
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith(";"):
            continue
        if line.startswith("$"):
            continue
        if line.startswith("(") or buffer:
            if buffer:
                buffer.append(line)
            else:
                buffer = [line]
            if line.endswith(")"):
                normalized_lines.append(" ".join(buffer).replace("(", "").replace(")", "").strip())
                buffer = []
            continue
        normalized_lines.append(line)

    records: list[dict[str, object]] = []
    for idx, line in enumerate(normalized_lines, start=1):
        pieces = line.split()
        if len(pieces) < 3:
            continue
        owner, ttl_text, rtype = pieces[0], pieces[1], pieces[2]
        if owner == "@":
            owner = zone_name
        if rtype.upper() not in {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}:
            continue
        value_parts = pieces[3:]
        values = [" ".join(value_parts)] if value_parts else [""]
        if rtype.upper() == "TXT":
            values = [" ".join(value_parts)]
        records.append({
            "line": idx,
            "name": owner if owner.endswith(".") else owner + ".",
            "type": rtype.upper(),
            "ttl": int(ttl_text) if ttl_text.isdigit() else 300,
            "values": values,
            "is_default": rtype.upper() in {"NS", "SOA"},
        })
    return records


def export_zone_as_bind(zone_name: str, records: Iterable[dict[str, object]]) -> str:
    zone_name = normalize_zone_name(zone_name)
    lines = [f"$ORIGIN {zone_name}", f"$TTL 300", ""]
    for record in records:
        name = str(record.get("name") or zone_name)
        rtype = str(record.get("type") or "A").upper()
        ttl = int(record.get("ttl") or 300)
        values = record.get("values") or []
        value_string = " ".join(str(v) for v in values)
        lines.append(f"{name.rstrip('.')} {ttl} {rtype} {value_string}")
    return "\n".join(lines) + "\n"
