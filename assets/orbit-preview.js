/* USEFUL Acquisition Planner v2.8 — local two-body/J2 Earth subpoint PREVIEW.
   Not SGP4, telemetry, operational ephemeris, or acquisition-time prediction.
   Uses public OMM/TLE mean elements when a SGP4-capable library is unavailable.
   All output must be labeled Kepler/J2 PREVIEW and rejected for stale elements. */
(() => {
  'use strict';
  const D = Math.PI / 180, TAU = 2 * Math.PI;
  const MU = 398600.4418, RE = 6378.137, J2 = 1.08262668e-3;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const rad = d => d * D;
  const finite = (n) => Number.isFinite(n);

  function normalize(input) {
    if (!input || !Number.isFinite(Date.parse(input.epochISO))) throw Error('Missing orbit epoch');
    const e = Number(input.ecc), i = rad(Number(input.inc)), raan = rad(Number(input.raan));
    const argp = rad(Number(input.argp)), mean = rad(Number(input.mean)), motion = Number(input.motion);
    if (![e, i, raan, argp, mean, motion].every(finite) || e < 0 || e >= 0.2 || motion < 1 || motion > 18) {
      throw Error('Invalid orbital mean elements');
    }
    return {...input, e, i, raan, argp, mean, motion, epochMs: Date.parse(input.epochISO)};
  }
  function fromOMM(omm) {
    const o = Array.isArray(omm) ? omm[0] : omm;
    if (!o) throw Error('Missing OMM JSON');
    return normalize({
      epochISO: o.EPOCH, ecc: o.ECCENTRICITY, inc: o.INCLINATION,
      raan: o.RA_OF_ASC_NODE, argp: o.ARG_OF_PERICENTER,
      mean: o.MEAN_ANOMALY, motion: o.MEAN_MOTION, norad: String(o.NORAD_CAT_ID || '')
    });
  }
  function fromTLE(line1, line2) {
    const l1 = String(line1 || ''), l2 = String(line2 || '');
    if (!l1.startsWith('1 ') || !l2.startsWith('2 ') || l1.length < 68 || l2.length < 63) throw Error('Invalid TLE');
    if (l1.slice(2,7).trim() !== l2.slice(2,7).trim()) throw Error('TLE catalog mismatch');
    const yr = Number(l1.slice(18,20)), day = Number(l1.slice(20,32));
    if (!(day >= 1 && day < 367)) throw Error('Invalid TLE epoch');
    const epochISO = new Date(Date.UTC(yr >= 57 ? 1900+yr : 2000+yr, 0, 1) + (day-1)*86400000).toISOString();
    return normalize({
      epochISO, ecc: Number('0.'+l2.slice(26,33).trim()), inc: Number(l2.slice(8,16)),
      raan: Number(l2.slice(17,25)), argp: Number(l2.slice(34,42)),
      mean: Number(l2.slice(43,51)), motion: Number(l2.slice(52,63)), norad: l1.slice(2,7).trim()
    });
  }
  function fromElements(el) {
    if (el && el.omm) return fromOMM(el.omm);
    if (el && el.line1 && el.line2) return fromTLE(el.line1, el.line2);
    throw Error('No suitable TLE/OMM mean elements');
  }
  function at(orb, when) {
    const nowMs = typeof when === 'number' ? when : +when;
    if (!finite(nowMs)) throw Error('Invalid UTC timestamp');
    const dt = (nowMs - orb.epochMs) / 1000;
    const n = orb.motion * TAU / 86400;
    const a = Math.cbrt(MU / (n*n)), p = a*(1-orb.e*orb.e);
    const c = Math.cos(orb.i), sec = J2 * n * (RE/p)**2;
    // J2 secular approximations are only a visual fallback, not SGP4.
    const Omega = orb.raan - 1.5*sec*c*dt;
    const omega = orb.argp + .75*sec*(5*c*c-1)*dt;
    const M = orb.mean + (n + .75*sec*Math.sqrt(1-orb.e*orb.e)*(3*c*c-1))*dt;
    let E = ((M%TAU)+TAU)%TAU;
    for (let j=0;j<12;j++) {
      const dE = (E-orb.e*Math.sin(E)-M%TAU)/(1-orb.e*Math.cos(E));
      E -= dE;if(Math.abs(dE)<1e-12)break;
    }
    const nu = Math.atan2(Math.sqrt(1-orb.e*orb.e)*Math.sin(E),Math.cos(E)-orb.e);
    const r = a*(1-orb.e*Math.cos(E)), u = omega+nu;
    const x = r*(Math.cos(Omega)*Math.cos(u)-Math.sin(Omega)*Math.sin(u)*c);
    const y = r*(Math.sin(Omega)*Math.cos(u)+Math.cos(Omega)*Math.sin(u)*c);
    const z = r*Math.sin(u)*Math.sin(orb.i);
    const jd = nowMs/86400000 + 2440587.5;
    const T = (jd-2451545)/36525;
    const gmst = rad(((280.46061837+360.98564736629*(jd-2451545)+.000387933*T*T-T*T*T/38710000)%360+360)%360);
    const X = x*Math.cos(gmst)+y*Math.sin(gmst), Y = -x*Math.sin(gmst)+y*Math.cos(gmst);
    const longitude = Math.atan2(Y,X), rho = Math.hypot(X,Y);
    const e2 = .0066943799901413165;
    let latitude = Math.atan2(z,rho*(1-e2));
    for(let j=0;j<7;j++) {
      const N = RE / Math.sqrt(1-e2*Math.sin(latitude)**2);
      const height = rho/Math.max(.00001,Math.cos(latitude))-N;
      const next = Math.atan2(z,rho*(1-e2*N/(N+height)));
      if(Math.abs(next-latitude)<1e-13){latitude=next;break;}
      latitude=next;
    }
    const N = RE/Math.sqrt(1-e2*Math.sin(latitude)**2);
    const altKm = rho/Math.max(.00001,Math.cos(latitude))-N;
    const lat = latitude/D, lon = longitude/D;
    if(![lat,lon,altKm].every(finite) || altKm < 100 || altKm > 50000) throw Error('Invalid orbit geometry');
    return {lat:clamp(lat,-90,90),lon:((lon+540)%360)-180,altKm,utcISO:new Date(nowMs).toISOString()};
  }
  window.UsefulOrbitPreview={fromTLE,fromOMM,fromElements,at,method:'Kepler/J2 visual preview; not SGP4'};
})();
