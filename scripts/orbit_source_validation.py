"""Small dependency-free validation of CelesTrak public GP/OMM and TLE files.

This validates data integrity only; it cannot verify orbital ephemeris accuracy.
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
import math
import re


def _checksum(line: str) -> int:
    if len(line) != 69:
        raise ValueError("TLE line must contain exactly 69 characters")
    return sum(int(x) if x.isdigit() else 1 if x == "-" else 0 for x in line[:68]) % 10


def validated_tle(raw: str, expected_catid: str) -> str:
    if not re.fullmatch(r"[0-9]{1,5}", expected_catid):
        raise ValueError("TLE requires a five-digit-or-less numeric catalog ID")
    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    wanted = []
    for prefix in ("1 ", "2 "):
        matching = [line for line in lines if line.startswith(prefix) and
                    line[2:7].strip().isdigit() and int(line[2:7]) == int(expected_catid)]
        if len(matching) != 1:
            raise ValueError("Missing or ambiguous TLE line for NORAD " + expected_catid)
        line = matching[0]
        if len(line) != 69 or not line[68].isdigit() or _checksum(line) != int(line[68]):
            raise ValueError("Invalid TLE length or checksum")
        wanted.append(line)
    l1, l2 = wanted
    if l1[2:7] != l2[2:7]:
        raise ValueError("TLE line NORAD mismatch")
    year2 = int(l1[18:20]); year = 1900 + year2 if year2 >= 57 else 2000 + year2
    day = float(l1[20:32]); leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
    if not 1 <= day < (367 if leap else 366):
        raise ValueError("Invalid TLE epoch day")
    inclination = float(l2[8:16]); ecc = float("0." + l2[26:33]); motion = float(l2[52:63])
    if not (0 <= inclination <= 180 and 0 <= ecc < 1 and 0 < motion <= 20):
        raise ValueError("Invalid TLE orbital elements")
    return l1 + "\n" + l2 + "\n"


def validated_omm(entry: dict, expected_catid: str) -> dict:
    if not isinstance(entry, dict) or str(entry.get("NORAD_CAT_ID", "")) != expected_catid:
        raise ValueError("OMM catalog mismatch")
    if str(entry.get("TIME_SYSTEM", "UTC")).upper() != "UTC":
        raise ValueError("Only UTC OMM supported")
    raw = str(entry.get("EPOCH", ""))
    if not re.fullmatch(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?(?:Z)?", raw):
        raise ValueError("Unsupported OMM UTC epoch")
    try:
        moment = datetime.fromisoformat(raw.replace("Z", "+00:00") if raw.endswith("Z") else raw + "+00:00")
    except ValueError as exc:
        raise ValueError("Invalid OMM UTC epoch") from exc
    if moment.utcoffset() != timedelta(0):
        raise ValueError("OMM epoch must be UTC")
    for field, low, high in (
        ("MEAN_MOTION", 0.000001, 20), ("ECCENTRICITY", 0, 0.999999),
        ("INCLINATION", 0, 180), ("RA_OF_ASC_NODE", 0, 360),
        ("ARG_OF_PERICENTER", 0, 360), ("MEAN_ANOMALY", 0, 360),
    ):
        try:
            v = float(entry[field]); good = math.isfinite(v) and low <= v <= high
        except (ValueError, TypeError, KeyError):
            good = False
        if not good:
            raise ValueError("Invalid OMM field: " + field)
    return entry
