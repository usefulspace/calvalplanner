#!/usr/bin/env python3
"""Build a public, non-authoritative freshness report for available GP elements.
No interpolation, no invented orbits. Valid elements are at most 72 hours old.
The browser independently validates orbital elements before plotting.
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from pathlib import Path
import json
import os
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from orbit_source_validation import validated_omm, validated_tle

MAX_AGE_HOURS = 72.0
now = datetime.now(timezone.utc)
registry = json.loads((ROOT / 'satellites.json').read_text(encoding='utf-8'))['satellites']
folder = ROOT / 'data' / 'satellites'
folder.mkdir(parents=True, exist_ok=True)

def get_epoch_tle(data):
    l1 = data.splitlines()[0]
    yy = int(l1[18:20])
    year = 1900 + yy if yy >= 57 else 2000 + yy
    day = float(l1[20:32])
    return datetime(year, 1, 1, tzinfo=timezone.utc) + timedelta(days=day - 1)

def available(sat):
    norad = str(sat['norad'])
    options = []
    for ext in ('json', 'tle'):
        path = folder / f'{norad}.{ext}'
        if not path.exists():
            continue
        try:
            if ext == 'json':
                raw = json.loads(path.read_text(encoding='utf-8'))
                if isinstance(raw, list):
                    raw = next((r for r in raw if str(r.get('NORAD_CAT_ID')) == norad), None)
                data = validated_omm(raw, norad)
                epoch_text = str(data['EPOCH']).replace('Z','+00:00')
                epoch = datetime.fromisoformat(epoch_text)
                if epoch.tzinfo is None:
                    epoch = epoch.replace(tzinfo=timezone.utc)
            else:
                data = validated_tle(path.read_text(encoding='utf-8'), norad)
                epoch = get_epoch_tle(data)
            hours = abs((now-epoch).total_seconds())/3600.0
            options.append((hours, ext.upper(), epoch))
        except (ValueError, TypeError, KeyError, AttributeError, StopIteration) as exc:
            print(f'Warning: {path} is invalid: {exc}', file=sys.stderr)
    options.sort(key=lambda x:x[0])
    if not options:
        return {'norad':norad,'name':sat.get('name',norad),'active':sat.get('active',True),
                'fresh':False,'source':None,'epoch_utc':None,'age_hours':None,
                'status':'missing'}
    age,source,epoch = options[0]
    return {'norad':norad,'name':sat.get('name',norad),'active':sat.get('active',True),
            'fresh':age <= MAX_AGE_HOURS,'source':source,
            'epoch_utc':epoch.astimezone(timezone.utc).isoformat().replace('+00:00','Z'),
            'age_hours':round(age,2),'status':'fresh' if age<=MAX_AGE_HOURS else 'stale'}

results=[available(s) for s in registry]
active=[s for s in results if s['active']]
fresh=sum(x['fresh'] for x in active)
report={'generated_utc':now.isoformat().replace('+00:00','Z'),
        'max_age_hours':MAX_AGE_HOURS, 'active_fresh':fresh,'active_total':len(active),
        'satellites':results,
        'notice':'Orbital elements are public preliminary GP data, not spacecraft telemetry.'}
(ROOT/'data/orbit_status.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
summary=['## USEFUL Planner: orbital element freshness',
         f'Active satellites with recent orbital elements: **{fresh}/{len(active)}**',
         '', '| Satellite | NORAD | Status | Element type | Epoch UTC | Age (h) |',
         '|---|---:|---|---|---|---:|']
for s in results:
    name=str(s['name']).replace('|','\\|').replace('\n',' ')
    summary.append(f"| {name} | {s['norad']} | {s['status']} | {s['source'] or '—'} | {s['epoch_utc'] or '—'} | {s['age_hours'] if s['age_hours'] is not None else '—'} |")
summary += ['', 'The website deploys even if orbital data is missing. Satellites with missing/stale TLE/OMM will be hidden; positions are never fabricated.',
            '', 'Public status URL after deployment: `data/orbit_status.json`.']
message='\n'.join(summary)+'\n'
print(message)
if os.environ.get('GITHUB_STEP_SUMMARY'):
    with open(os.environ['GITHUB_STEP_SUMMARY'],'a',encoding='utf-8') as out:
        out.write(message)
if not fresh:
    print('::warning::No satellite has fresh orbital data (<=72 h). Website can deploy, but satellite markers will remain hidden.')
