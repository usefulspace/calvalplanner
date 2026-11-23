/* USEFUL Acquisition Planner v3.6
 * Ground-station line-of-sight tracking report: SGP4 near-epoch passes ONLY.
 * AOS/LOS are geometric horizon crossings, NOT received-signal/antenna guarantees.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id),R=Math.PI/180,D=180/Math.PI;
const MAX_EPOCH_HOURS=72,SEARCH_WINDOW_MS=40*60000,COARSE_STEP_MS=30000;
const SPEED_LIGHT_KM_S=299792.458;
const two=v=>Number.isFinite(v)?v.toFixed(2):'';
const sec=v=>Number.isFinite(v)?Math.round(v):'';
const iso=ms=>new Date(ms).toISOString();
const safeText=x=>String(x??'');
function look(lib,satrec,site,ms){
 const d=new Date(ms),p=lib.propagate(satrec,d);
 if(!p?.position||!Number.isFinite(p.position.x))return null;
 const ecef=lib.eciToEcf(p.position,lib.gstime(d));
 const observer={latitude:site.lat*R,longitude:site.lon*R,height:Math.max(0,Number(site.altitudeMeters)||0)/1000};
 const lookAngles=lib.ecfToLookAngles(observer,ecef);
 const az=(lookAngles.azimuth*D+360)%360,el=lookAngles.elevation*D;
 const range=lookAngles.rangeSat;
 return [az,el,range].every(Number.isFinite)?{az,el,range,utcISO:iso(ms)}:null;
}
function crossing(lib,satrec,site,a,b,minElevation){
 let f0=look(lib,satrec,site,a)?.el;
 if(!Number.isFinite(f0))return null;
 for(let i=0;i<17;i++){
  const mid=Math.round((a+b)/2),val=look(lib,satrec,site,mid)?.el;
  if(!Number.isFinite(val))return null;
  if((f0-minElevation)*(val-minElevation)<=0)b=mid;else {a=mid;f0=val;}
 }
 return Math.round((a+b)/2000)*1000;
}
function derivePass(lib,satrec,site,referenceMs,minElevation){
 const center=look(lib,satrec,site,referenceMs);
 if(!center||center.el<minElevation)return null;
 let entry=null,exit=null,prevMs=referenceMs,prevEl=center.el;
 for(let t=referenceMs-COARSE_STEP_MS;t>=referenceMs-SEARCH_WINDOW_MS;t-=COARSE_STEP_MS){
  const el=look(lib,satrec,site,t)?.el;
  if(!Number.isFinite(el))break;
  if(el<minElevation && prevEl>=minElevation){entry=crossing(lib,satrec,site,t,prevMs,minElevation);break;}
  prevMs=t;prevEl=el;
 }
 prevMs=referenceMs;prevEl=center.el;
 for(let t=referenceMs+COARSE_STEP_MS;t<=referenceMs+SEARCH_WINDOW_MS;t+=COARSE_STEP_MS){
  const el=look(lib,satrec,site,t)?.el;
  if(!Number.isFinite(el))break;
  if(el<minElevation && prevEl>=minElevation){exit=crossing(lib,satrec,site,prevMs,t,minElevation);break;}
  prevMs=t;prevEl=el;
 }
 if(entry===null||exit===null||exit<=entry)return null;
 let peakMs=referenceMs,peak=center;
 for(let ms=entry;ms<=exit;ms+=10000){const q=look(lib,satrec,site,ms);if(q&&q.el>peak.el){peak=q;peakMs=ms;}}
 const endpoints=[entry,exit,peakMs,referenceMs];
 return {aos:entry,los:exit,peakMs,peak,referenceMs,sampleTimes:endpoints};
}
function angularSep(az1,el1,az2,el2){
 const c=Math.sin(el1*R)*Math.sin(el2*R)+Math.cos(el1*R)*Math.cos(el2*R)*Math.cos((az1-az2)*R);
 return Math.acos(Math.min(1,Math.max(-1,c)))*D;
}
function sampleRow(lib,satrec,site,pass,ms,satellite,record,tle){
 const lookAt=look(lib,satrec,site,ms);
 if(!lookAt)return null;
 const before=look(lib,satrec,site,ms-1000),after=look(lib,satrec,site,ms+1000);
 const rangeRate=before&&after?(after.range-before.range)/2:null; // km/s
 const freqMHz=Number(satellite.downlinkMHz);
 const doppler=Number.isFinite(freqMHz)&&freqMHz>0&&rangeRate!==null ? -(freqMHz*1e6)*rangeRate/SPEED_LIGHT_KM_S : null;
 const sky=window.UsefulSky?.skyAt(new Date(ms),site.lat,site.lon);
 const sun=sky?.sun,moon=sky?.moon;
 const sep=sun?angularSep(lookAt.az,lookAt.el,sun.azimuth,sun.elevation):null;
 const epochHours=Math.abs(ms-Date.parse(tle.epochISO))/3600000;
 return [satellite.name,satellite.norad,site.name,site.lat.toFixed(6),site.lon.toFixed(6),record.direction||'UNKNOWN',
  record.utcISO,iso(pass.aos),iso(pass.los),two((pass.los-pass.aos)/1000),iso(pass.peakMs),two(pass.peak.el),
  iso(ms),two((ms-pass.aos)/1000),two(lookAt.az),two(lookAt.el),two(lookAt.range),
  rangeRate===null?'':rangeRate.toFixed(5),doppler===null?'':doppler.toFixed(1),
  sun?two(sun.azimuth):'',sun?two(sun.elevation):'',sep===null?'':two(sep),
  moon?two(moon.azimuth):'',moon?two(moon.elevation):'',record.cloud==null?'':Math.round(record.cloud),
  tle.epochISO,two(epochHours),'SGP4_NEAR_EPOCH_72H',two(record.off),freqMHz>0?two(freqMHz):'',
  'Geometric line of sight; assumes flat 0° horizon; no refraction/terrain/link budget/attitude'];
}
const HEADERS=['Satellite','NORAD','Test Site','Latitude (deg)','Longitude (deg)','Direction',
 'Estimated Closest Approach UTC','AOS UTC (geometric threshold)','LOS UTC (geometric threshold)',
 'Above-threshold duration (s)','Peak elevation UTC','Peak elevation (deg)',
 'Tracking sample UTC','Elapsed from AOS (s)','Satellite azimuth (deg clockwise N)',
 'Satellite elevation (deg)','Slant range (km)','Range rate (km/s)',
 'Doppler shift at downlink (Hz)','Sun azimuth (deg clockwise N)','Sun elevation (deg)',
 'Sun–satellite angular separation (deg)','Moon azimuth approx (deg clockwise N)',
 'Moon elevation approx (deg)','Cloud forecast (%)','TLE epoch UTC',
 'TLE epoch separation (hours)','Method/validity','Geometric off-nadir at approach (deg)',
 'Downlink frequency (MHz)','Model limitations'];
async function generate(lib,tle,records,sites,satellite,opts={}){
 const stepSec=opts.intervalSeconds||30,minEl=opts.minElevation??0;
 if(![10,30,60].includes(stepSec))throw Error('Invalid sample interval');
 if(!Number.isFinite(minEl)||minEl<0||minEl>45)throw Error('Invalid horizon elevation threshold');
 const epoch=Date.parse(tle.epochISO);if(!Number.isFinite(epoch))throw Error('Missing orbital epoch');
 const satrec=tle.omm?(typeof lib.json2satrec==='function'?lib.json2satrec(tle.omm):null):lib.twoline2satrec(tle.line1,tle.line2);
 if(!satrec||satrec.error)throw Error('SGP4 could not initialize the satellite');
 const siteById=new Map(sites.map(x=>[x.id,x]));
 const rows=[HEADERS],reasons={outOfEpoch:0,noVisibility:0,missingSite:0,nonTle:0},passes=[];
 const seen=new Set();
 const candidates=records.filter(r=>r.method==='tle'&&r.utcISO&&Number.isFinite(Date.parse(r.utcISO)));
 for(let k=0;k<candidates.length;k++){
  const r=candidates[k],site=siteById.get(r.siteId)||sites.find(x=>x.name===r.site);
  if(!site||!Number.isFinite(site.lat)||!Number.isFinite(site.lon)){reasons.missingSite++;continue;}
  const timestamp=Date.parse(r.utcISO);
  if(Math.abs(timestamp-epoch)>MAX_EPOCH_HOURS*3600000){reasons.outOfEpoch++;continue;}
  const pass=derivePass(lib,satrec,site,timestamp,minEl);
  if(!pass){reasons.noVisibility++;continue;}
  const key=`${site.id}:${Math.round(pass.aos/10000)}`;if(seen.has(key))continue;seen.add(key);
  const times=new Set(pass.sampleTimes.map(x=>Math.round(x/1000)*1000));
  for(let ms=pass.aos;ms<=pass.los;ms+=stepSec*1000)times.add(ms);
  times.add(pass.los);
  for(const ms of [...times].sort((a,b)=>a-b)){
   const row=sampleRow(lib,satrec,site,pass,ms,satellite,r,tle);if(row)rows.push(row);
  }
  passes.push({site:site.name,aos:iso(pass.aos),los:iso(pass.los),peakElevation:pass.peak.el,samples:times.size});
  if(opts.onProgress)opts.onProgress(k+1,candidates.length);
  if(k%6===5)await new Promise(resolve=>setTimeout(resolve,0));
 }
 reasons.nonTle=records.length-candidates.length;
 return {rows,passes,reasons,epochISO:tle.epochISO};
}
function csv(rows){return window.UsefulIntegrity.csvEncode(rows);}
function download(name,data){const blob=new Blob([data],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);}

// Imaging look geometry at an EXPLICIT or TLE-estimated shutter-open UTC.
// SGP4 gives spacecraft position, not the actual commanded camera boresight.
function siteOptions(){
 const list=$('captureSite'),planner=window.THEOS2Planner;if(!list||!planner)return;
 const sites=planner.getVisibleSites?.()||[];
 const existing=list.value,requested=$('filterSite')?.value;
 if(list.options.length!==sites.length||sites.some((s,i)=>list.options[i]?.value!==s.id)){
  list.replaceChildren(...sites.map(site=>new Option(site.name.replace(/_/g,' '),site.id)));
  list.value=sites.some(site=>site.id===existing)?existing:(sites.some(site=>site.id===requested)?requested:(sites.find(s=>s.id==='skp-sriracha')||sites[0])?.id||'');
 }
}
function vectorDot(a,b){return a.x*b.x+a.y*b.y+a.z*b.z}
function vectorNorm(a){return Math.hypot(a.x,a.y,a.z)}
function angleDeg(a,b){
 const dot=vectorDot(a,b)/(vectorNorm(a)*vectorNorm(b));
 return Math.acos(Math.max(-1,Math.min(1,dot)))*D;
}
function imagingSnapshot(lib,rec,site,ms){
 const t=new Date(ms),pv=lib.propagate(rec,t);
 if(!pv?.position||![pv.position.x,pv.position.y,pv.position.z].every(Number.isFinite))return null;
 const gmst=lib.gstime(t),sat=lib.eciToEcf(pv.position,gmst);
 const l=look(lib,rec,site,ms);if(!l)return null;
 const geoSite={latitude:site.lat*R,longitude:site.lon*R,height:Math.max(0,Number(site.altitudeMeters)||0)/1000};
 let ground;
 if(typeof lib.geodeticToEcf==='function')ground=lib.geodeticToEcf(geoSite);
 else {const a=6378.137,e2=.00669437999014,sin=Math.sin(geoSite.latitude),cos=Math.cos(geoSite.latitude),N=a/Math.sqrt(1-e2*sin*sin),h=geoSite.height;
  ground={x:(N+h)*cos*Math.cos(geoSite.longitude),y:(N+h)*cos*Math.sin(geoSite.longitude),z:(N*(1-e2)+h)*sin};}
 const satToGround={x:ground.x-sat.x,y:ground.y-sat.y,z:ground.z-sat.z};
 const groundToSat={x:-satToGround.x,y:-satToGround.y,z:-satToGround.z};
 const nadir={x:-sat.x,y:-sat.y,z:-sat.z};
 const normal={x:Math.cos(geoSite.latitude)*Math.cos(geoSite.longitude),y:Math.cos(geoSite.latitude)*Math.sin(geoSite.longitude),z:Math.sin(geoSite.latitude)};
 const g=lib.eciToGeodetic(pv.position,gmst);
 const sky=window.UsefulSky?.skyAt(t,site.lat,site.lon);
 const before=look(lib,rec,site,ms-1000),after=look(lib,rec,site,ms+1000);
 const rangeRate=before&&after?(after.range-before.range)/2:null;
 return {utcISO:t.toISOString(),az:l.az,el:l.el,range:l.range,rangeRate,offNadir:angleDeg(nadir,satToGround),incidence:angleDeg(normal,groundToSat),
  satelliteLat:lib.degreesLat(g.latitude),satelliteLon:lib.degreesLong(g.longitude),altitudeKm:g.height,
  sun:sky?.sun||null,moon:sky?.moon||null,sep:sky?.sun?angularSep(l.az,l.el,sky.sun.azimuth,sky.sun.elevation):null};
}
async function exportCaptureGeometry(){
 const btn=$('exportCaptureGeometry'),dest=$('captureStatus'),fleet=window.UsefulFleet,planner=window.THEOS2Planner;
 const say=(str,bad=false)=>{if(dest){dest.textContent=str;dest.dataset.level=bad?'warn':'ok';}};
 if(!fleet||!planner){say('Planner is not ready',true);return;}
 siteOptions();const sat=fleet.selectedSatellite();
 const site=planner.getVisibleSites().find(s=>s.id===$('captureSite')?.value);
 if(!sat?.active||!site){say('Select an active satellite and a site with coordinates',true);return;}
 btn.disabled=true;
 try{
  say('Reading TLE/OMM...');
  const [tle,lib]=await Promise.all([fleet.getSelectedElements(),window.PlannerOrbit.sgp4Library()]);
  if(!Number.isFinite(Date.parse(tle.epochISO)))throw Error('Missing TLE epoch');
  let ms,source='USER_SUPPLIED_UTC_NOT_VERIFIED',mode=$('captureTimeMode')?.value||'estimated';
  if(mode==='manual'){
   const raw=$('captureUtc')?.value||'';
   if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(raw))throw Error('Enter the shutter-open date and time (UTC).');
   ms=Date.parse(raw+'Z');if(!Number.isFinite(ms))throw Error('Invalid UTC date/time');
  }else{
   say('Estimating a closest-approach UTC from SGP4...');
   const prediction=await planner.ensureTLEForSites([site],{horizonDays:3});
   const eligible=planner.getCompactRows(3,[site],prediction).filter(x=>x.method==='tle'&&Number.isFinite(Date.parse(x.utcISO))&&Math.abs(Date.parse(x.utcISO)-Date.parse(tle.epochISO))<=MAX_EPOCH_HOURS*3600000);
   if(!eligible.length)throw Error('No near-epoch TLE imaging candidate at this site. Select Specified UTC if you have an acquisition log.');
   ms=Date.parse(eligible[0].utcISO);source='SGP4_ESTIMATED_CLOSEST_APPROACH_NOT_CONFIRMED_EXPOSURE';
  }
  const age=Math.abs(ms-Date.parse(tle.epochISO))/3600000;
  if(age>MAX_EPOCH_HOURS)throw Error(`Acquisition time ${age.toFixed(1)} h from TLE epoch exceeds ±72 h. Load an appropriate orbit solution.`);
  const rec=tle.omm?(typeof lib.json2satrec==='function'?lib.json2satrec(tle.omm):null):lib.twoline2satrec(tle.line1,tle.line2);
  if(!rec||rec.error)throw Error('SGP4 cannot parse this satellite TLE/OMM');
  const duration=Number($('captureDuration')?.value||0);
  if(!Number.isInteger(duration)||duration<0||duration>300)throw Error('Exposure duration must be between 0 and 300 seconds');
  const timestamps=duration>0?[['OPEN',ms],['MID',ms+Math.round(duration*500)],['CLOSE',ms+duration*1000]]:[['OPEN',ms]];
  const header=['Satellite','NORAD','Test Site','Latitude (deg)','Longitude (deg)','Capture geometry source','Exposure phase','UTC','Elapsed from shutter open (s)',
   'Required off-nadir (deg; geometric LOS vs nadir)','Ground incidence angle (deg; ellipsoid normal)','Satellite azimuth (deg from N)','Satellite elevation (deg)',
   'Slant range (km)','Range rate (km/s)','Satellite subpoint latitude (deg)','Satellite subpoint longitude (deg)','Satellite altitude (km)',
   'Sun azimuth (deg)','Sun elevation (deg)','Sun-satellite angular separation (deg)','Moon azimuth (deg)','Moon elevation (deg)',
   'AOS UTC (0deg geometric)','LOS UTC (0deg geometric)','Direction (SGP4)','Visibility / pointing status','TLE epoch UTC','TLE epoch separation (h)','Limitations'];
  const geom=imagingSnapshot(lib,rec,site,ms);if(!geom)throw Error('SGP4 propagation failed at exposure UTC');
  const pass=geom.el>=0?derivePass(lib,rec,site,ms,0):null;
  const direction=window.PlannerOrbit?.directionAt?.(lib,rec,ms)||'UNKNOWN';
  const rows=[header];
  for(const [phase,time] of timestamps){
   if(Math.abs(time-Date.parse(tle.epochISO))>MAX_EPOCH_HOURS*3600000)throw Error("Exposure interval exceeds ±72 h TLE validity window");
   const val=imagingSnapshot(lib,rec,site,time);if(!val)continue;
   const valid=val.el>=0&&val.offNadir<=Number($('tleMaxOff')?.value||15);
   rows.push([sat.name,sat.norad,site.name,site.lat.toFixed(6),site.lon.toFixed(6),source,phase,val.utcISO,(time-ms)/1000,
    two(val.offNadir),two(val.incidence),two(val.az),two(val.el),two(val.range),val.rangeRate?.toFixed(5)||'',
    two(val.satelliteLat),two(val.satelliteLon),two(val.altitudeKm),val.sun?two(val.sun.azimuth):'',val.sun?two(val.sun.elevation):'',
    val.sep!==null?two(val.sep):'',val.moon?two(val.moon.azimuth):'',val.moon?two(val.moon.elevation):'',
    pass?iso(pass.aos):'',pass?iso(pass.los):'',direction,! (val.el>=0)?'BELOW_GEOMETRIC_HORIZON':valid?'WITHIN_SCREENING_ANGLE':'OUTSIDE_SCREENING_ANGLE',
    tle.epochISO,two(Math.abs(time-Date.parse(tle.epochISO))/3600000),
    'Modeled geometry only; TLE is not imaging tasking or actual spacecraft attitude; no camera boresight, DEM, terrain mask, atmospheric refraction or pointing command; site elevation assumed 0 m unless defined']);
  }
  download(`USEFUL_Exposure_Geometry_${sat.norad}_${site.name.replace(/[^A-Za-z0-9_-]/g,'_')}_${new Date(ms).toISOString().slice(0,10)}.csv`,csv(rows));
  say(`Exported ${rows.length-1} exposure geometry record(s) · ${mode==='manual'?'operator-supplied UTC':'estimated closest-approach UTC'} · NOT verified tasking`);
 }catch(err){say(err.message||String(err),true);}finally{btn.disabled=false;}
}
function initCaptureControls(){
 const mode=$('captureTimeMode'),time=$('captureUtc');
 const toggle=()=>{time.disabled=mode.value!=='manual';if(!time.value)time.value=new Date().toISOString().slice(0,19);};
 mode?.addEventListener('change',toggle);toggle();
 $('captureGeometryPanel')?.addEventListener('toggle',siteOptions);
 $('captureSite')?.addEventListener('focus',siteOptions);
 $('exportCaptureGeometry')?.addEventListener('click',exportCaptureGeometry);
 $('siteTypeFilters')?.addEventListener('change',()=>setTimeout(siteOptions,0));
 $('filterSite')?.addEventListener('change',()=>{const v=$('filterSite').value;siteOptions();if(v!=='all'&&[...$('captureSite').options].some(o=>o.value===v))$('captureSite').value=v;});
 siteOptions();
}
async function exportTracking(){
 const btn=$('exportTracking'),status=$('trackingStatus');if(btn?.disabled)return;
 const planner=window.THEOS2Planner,fleet=window.UsefulFleet,sat=fleet?.selectedSatellite();
 const say=(message,bad=false)=>{if(status){status.textContent=message;status.dataset.level=bad?'warn':'info';}};
 if(!planner||!fleet||!sat||!sat.active){say('Select an active satellite first',true);return;}
 const selectedSite=$('filterSite')?.value||'all';
 const sites=planner.getState().sites.filter(s=>(selectedSite==='all'||s.id===selectedSite)&&planner.siteTypeAllowed(s)&&s.active!==false&&Number.isFinite(s.lat)&&Number.isFinite(s.lon));
 if(!sites.length){say('No active sites with coordinates',true);return;}
 btn.disabled=true;
 try{
  say('Reading near-term TLE/OMM...');
  const [tle,lib]=await Promise.all([fleet.getSelectedElements(),window.PlannerOrbit.sgp4Library()]);
  const age=Math.abs(Date.now()-Date.parse(tle.epochISO))/3600000;
  if(!Number.isFinite(age)||age>MAX_EPOCH_HOURS)throw Error('TLE/OMM older than 72 hours. Refresh orbit assets before ground-station pointing.');
  const horizon=planner.selectedHorizonDays();
  // Recompute only the first 16 days; downstream filters restrict tracking to 72 h from epoch.
  const data=await planner.ensureTLEForSites(sites,{horizonDays:Math.min(16,horizon)});
  const records=planner.getCompactRows(Math.min(16,horizon),sites,data).filter(r=>r.method==='tle');
  say('Computing geometric AOS/LOS, azimuth, elevation and line-of-sight samples...');
  const minElevation=Math.max(0,Math.min(45,Number($('trackingMinElevation')?.value||0)));
  const intervalSeconds=Number($('trackingSampleInterval')?.value||30);
  const result=await generate(lib,tle,records,sites,sat,{minElevation,intervalSeconds});
  if(result.passes.length===0){say(`No SGP4 tracking passes within ±72 h of TLE epoch. ${result.reasons.outOfEpoch} candidates outside reliable window; ${result.reasons.noVisibility} below horizon threshold.`,true);return;}
  const stamp=new Date().toISOString().slice(0,10);
  download(`USEFUL_Ground_Track_${sat.name.replace(/[^A-Za-z0-9_-]/g,'_')}_${stamp}_UTC.csv`,csv(result.rows));
  say(`Exported ${result.passes.length} visible passes / ${result.rows.length-1} pointing samples, ${intervalSeconds}s interval · Geometric AOS/LOS · UTC.`);
 }catch(e){say('Tracking CSV unavailable: '+(e?.message||String(e)),true);}
 finally{btn.disabled=false;}
}
function init(){$('exportTracking')?.addEventListener('click',exportTracking);initCaptureControls();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.UsefulTracking={HEADERS,look,derivePass,generate,exportTracking,imagingSnapshot,exportCaptureGeometry,csv};
})();
