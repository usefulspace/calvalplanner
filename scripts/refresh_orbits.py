#!/usr/bin/env python3
"""Refresh per-satellite public CelesTrak OMM and legacy TLE for GitHub Pages.
No secrets or backend. Each satellite is fetched every 6 hours at most by Actions.
Only satellite IDs in satellites.json are fetched; local-only additions need export/commit.
"""
from __future__ import annotations
import json
import pathlib
import re
import time
import urllib.error
import urllib.request
from orbit_source_validation import validated_omm, validated_tle

ROOT = pathlib.Path(__file__).resolve().parent.parent
CATALOG = json.loads((ROOT / "satellites.json").read_text(encoding="utf-8"))
OUT = ROOT / "data" / "satellites"
OUT.mkdir(parents=True, exist_ok=True)
SATELLITES = CATALOG.get("satellites", [])
if not isinstance(SATELLITES, list) or len(SATELLITES) > 60:
    raise ValueError("Invalid satellite registry or too many satellites (>60)")

def fetch(catid: str, format_: str) -> bytes:
    url = f"https://celestrak.org/NORAD/elements/gp.php?CATNR={catid}&FORMAT={format_}"
    req = urllib.request.Request(url, headers={"User-Agent": "USEFULAcquisitionPlanner/2.8 (GitHub Actions satellite catalog refresh)", "Accept": "application/json, text/plain"})
    with urllib.request.urlopen(req, timeout=35) as resp:
        return resp.read(1024 * 1024)

errors = []
for i, sat in enumerate(SATELLITES):
    catid = str(sat.get("norad", ""))
    if not re.fullmatch(r"[0-9]{1,9}", catid):
        raise ValueError(f"Invalid NORAD ID in registry: {catid!r}")
    print(f"Updating {catid} ({sat.get('name', '')})", flush=True)
    try:
        raw = fetch(catid, "JSON")
        records = json.loads(raw)
        if not isinstance(records, list) or not records:
            raise ValueError("No public GP record")
        entry = validated_omm(records[0], catid)
        (OUT / f"{catid}.json").write_text(json.dumps(entry, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        if int(catid) <= 99999:
            try:
                tle = fetch(catid, "TLE").decode("utf-8")
                tle = validated_tle(tle, catid)
                (OUT / f"{catid}.tle").write_text(tle, encoding="utf-8")
                if catid == "58016":
                    (ROOT / "data" / "theos2.tle").write_text(tle, encoding="utf-8")
            except Exception as error:
                print("TLE format unavailable, OMM remains usable:", error)
    except Exception as error:
        errors.append(f"{catid}: {error}")
        print("Could not update", catid, error)
    if i + 1 < len(SATELLITES):
        time.sleep(1.0)  # Avoid burst requests to volunteer-maintained services.

if errors:
    print("Some satellite updates failed. Existing files were retained:")
    for e in errors:
        print("  -", e)
if not any(OUT.glob("*.json")):
    raise SystemExit("No orbital data available; no files updated")
