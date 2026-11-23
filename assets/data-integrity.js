/* USEFUL v3.9.3 - small, pure data validation shared by the original lightweight UI.
 * The planner is NOT a confirmed tasking or antenna-control system.
 * Browser: UsefulIntegrity; Node: module.exports. No dependencies or network calls.
 */
(function(root, factory) {
  'use strict';
  const api = Object.freeze(factory());
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root && typeof root === 'object') root.UsefulIntegrity = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const DAY_MS = 86400000;
  function utcEpoch(input) {
    if (typeof input !== 'string') throw new Error('Missing UTC OMM EPOCH');
    const raw = input.trim();
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:?\d{2})?$/i);
    if (!m) throw new Error('Invalid OMM UTC EPOCH format');
    const year=Number(m[1]), month=Number(m[2]), day=Number(m[3]);
    const hh=Number(m[4]), mm=Number(m[5]), ss=Number(m[6]);
    if (month<1 || month>12 || day<1 || hh>23 || mm>59 || ss>59 ||
        day>new Date(Date.UTC(year,month,0)).getUTCDate()) throw new Error('Invalid OMM UTC calendar date');
    const offset=m[8];
    if (offset && !/^Z$/i.test(offset)) {
      const o=offset.slice(1).replace(':','');
      if (Number(o.slice(0,2))>14 || Number(o.slice(2))>59 ||
          (Number(o.slice(0,2))===14 && Number(o.slice(2))!==0)) throw new Error('Invalid OMM UTC offset');
    }
    const zoned=offset ? raw.replace(/([+-]\d{2})(\d{2})$/, '$1:$2') : raw+'Z';
    const date=new Date(zoned);
    if (!Number.isFinite(date.getTime())) throw new Error('OMM UTC epoch could not be parsed');
    return date.toISOString();
  }
  function tleChecksum(line) {
    if (typeof line !== 'string' || line.length !== 69) throw new Error('TLE must contain exactly 69 characters per line');
    let sum=0;
    for (const c of line.slice(0,68)) {
      if (c>='0'&&c<='9') sum+=Number(c);
      else if (c==='-') sum++;
    }
    return sum%10;
  }
  function parseTLE(input, expectedNorad) {
    const expected=expectedNorad==null?null:String(expectedNorad).trim();
    const lines=String(input||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const line1=lines.find(s=>s.startsWith('1 ') && (expected===null || Number(s.slice(2,7))===Number(expected)));
    const line2=lines.find(s=>s.startsWith('2 ') && (expected===null || Number(s.slice(2,7))===Number(expected)));
    if (!line1||!line2) throw new Error('TLE lines 1/2 missing for requested NORAD');
    const id1=line1.slice(2,7).trim(), id2=line2.slice(2,7).trim();
    if (!/^\d{1,5}$/.test(id1)||id1!==id2 || (expected!==null && Number(expected)!==Number(id1)))
      throw new Error('TLE NORAD catalog mismatch');
    for (const [line,id] of [[line1,'1'],[line2,'2']]) {
      if (line.length!==69 || line[0]!==id || line[1]!==' ') throw new Error('TLE line '+id+' length/format invalid');
      if (!/\d/.test(line[68]) || Number(line[68])!==tleChecksum(line))
        throw new Error('TLE line '+id+' checksum mismatch');
    }
    const yy=Number(line1.slice(18,20)), doy=Number(line1.slice(20,32));
    const year=yy>=57?1900+yy:2000+yy;
    const leap=year%4===0&&(year%100!==0||year%400===0);
    if (!Number.isFinite(doy)||doy<1||doy>=(leap?367:366)) throw new Error('TLE epoch day invalid');
    const inclination=Number(line2.slice(8,16));
    const ecc=Number('0.'+line2.slice(26,33));
    const meanMotion=Number(line2.slice(52,63));
    if (!Number.isFinite(inclination)||inclination<0||inclination>180||
        !Number.isFinite(ecc)||ecc<0||ecc>=1||
        !Number.isFinite(meanMotion)||meanMotion<=0||meanMotion>20) throw new Error('TLE orbital elements out of range');
    const epochISO=new Date(Date.UTC(year,0,1)+(doy-1)*DAY_MS).toISOString();
    return {line1,line2,epochISO,text:line1+'\n'+line2,norad:id1};
  }
  function parseOMM(input, expectedNorad) {
    const records=Array.isArray(input)?input:[input];
    const record=records.find(x=>x&&typeof x==='object'&&
      (expectedNorad==null||Number(x.NORAD_CAT_ID)===Number(expectedNorad)));
    if (!record || !/^\d{1,9}$/.test(String(record.NORAD_CAT_ID??'')))
      throw new Error('Invalid OMM for requested NORAD');
    if (record.TIME_SYSTEM && String(record.TIME_SYSTEM).toUpperCase()!=='UTC')
      throw new Error('Only UTC GP/OMM elements supported');
    const epochISO=utcEpoch(record.EPOCH);
    const ranges=[['MEAN_MOTION',0.000001,20],['ECCENTRICITY',0,0.999999],
      ['INCLINATION',0,180],['RA_OF_ASC_NODE',0,360],
      ['ARG_OF_PERICENTER',0,360],['MEAN_ANOMALY',0,360]];
    for (const [key,lo,hi] of ranges) {
      const v=Number(record[key]);
      if (record[key]==null || record[key]==='' || !Number.isFinite(v)||v<lo||v>hi)
        throw new Error('OMM '+key+' missing or out of range');
    }
    // Preserve sub-millisecond digits when provided. satellite.js >= 6.0.1
    // understands Z, whereas the EPOCH string without a suffix is ambiguous in JS.
    const rawEpoch=String(record.EPOCH).trim();
    const orbitEpoch=/Z$/i.test(rawEpoch)?rawEpoch.replace(/z$/,'Z'):
      /[+-]\d{2}:?\d{2}$/.test(rawEpoch)?epochISO:rawEpoch+'Z';
    return {omm:{...record,EPOCH:orbitEpoch},epochISO,norad:String(record.NORAD_CAT_ID)};
  }
  function epochAgeHours(data, nowMs=Date.now()) {
    const epoch=Date.parse(data?.epochISO||'');
    return Number.isFinite(epoch)?Math.abs(nowMs-epoch)/3600000:Infinity;
  }
  function spreadsheetValue(v) {
    if (v==null) return '';
    if (typeof v==='number' || typeof v==='boolean') return v;
    const text=String(v);
    // Excel/Sheets may evaluate even quoted CSV fields starting with these tokens.
    return /^[\u0000-\u0020\u007f-\u009f\uFEFF]*[=+\-@]/u.test(text) ? "'"+text : text;
  }
  function csvEncode(rows) {
    return '\ufeff'+rows.map(row=>row.map(v=>'"'+String(spreadsheetValue(v)).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  }
  function sheetRows(rows) {return rows.map(row=>row.map(spreadsheetValue));}
  function sourceSatellite(value, filename='') {
    const raw=String(value??'').trim();
    const candidate=raw || String(filename||'');
    if (/\b(?:THEOS[ _-]*2|TH2)(?=$|[^a-z0-9])/i.test(candidate) || /\b58016\b/.test(candidate))return {name:'THEOS-2',norad:'58016'};
    if (/\b(?:THEOS[ _-]*1|TH1)(?=$|[^a-z0-9])/i.test(candidate) || /\b33396\b/.test(candidate))return {name:'THEOS-1',norad:'33396'};
    if (!raw)return {name:'',norad:''};
    return {name:raw.slice(0,90),norad:/^\d{1,9}$/.test(raw)?raw:''};
  }
  return {utcEpoch,tleChecksum,parseTLE,parseOMM,epochAgeHours,spreadsheetValue,csvEncode,sheetRows,sourceSatellite};
});
