/* USEFUL Acquisition Planner 2.8
   THEOS-2 TLE / SGP4 geometric closest approach candidates.
   Approximate orbital geometry only. NOT tasking, attitude or guaranteed imaging time.
   Library: satellite.js 6.0.2 (MIT) bundled by GitHub Actions; legacy v4 CDN fallback supports only TLE.
   Day 0-15: SGP4/TLE screening; day 16+: 26-day ground-track repeat heuristic.
   To populate repeat-cycle phases 17-26, a 10-day TLE BACKCAST is used as a
   LOW-CONFIDENCE template. Repeated angles and UTC times are PROXIES, not
   forward-propagated spacecraft pointing predictions.
*/
(() => {
 'use strict';
 const NORAD='58016', LIVE_URL='https://celestrak.org/NORAD/elements/gp.php?CATNR=58016&FORMAT=TLE';
 const KEY='theos2:planner:v24:tle', TTL_MS=2*3600000;
 const MAX_AGE_MS=72*3600000, MAX_FUTURE_MS=16*86400000;
 const TLE_DAYS=16, REPEAT_DAYS=26, BACKCAST_DAYS=10;
 const STEP_MS=60000; // Coarse local-minimum scan; refine ±60s to one-second numerical resolution.
 let libraryLoading=null;
 const cacheGet=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
 const cachePut=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
 const clamp=(x,l,h)=>Math.min(h,Math.max(l,x));
 // Shared checksum, NORAD and UTC validation; browser-only, no heavy dependencies.
 function parseTLE(input){return window.UsefulIntegrity.parseTLE(input,NORAD);}
 async function script(src){
  await new Promise((resolve,reject)=>{
   const s=document.createElement('script');s.async=true;s.src=src;
   const timer=setTimeout(()=>{s.remove();reject(new Error('SGP4 script timed out'));},12000);
   s.onload=()=>{clearTimeout(timer);resolve();};
   s.onerror=()=>{clearTimeout(timer);s.remove();reject(new Error('SGP4 script unavailable'));};
   document.head.appendChild(s);
  });
 }
 async function sgp4Library(){
  // Do not treat an older TLE-only satellite.js v4 global as compatible OMM v6.
  if(window.satellite?.json2satrec&&window.satellite?.twoline2satrec&&window.satellite?.propagate)return window.satellite;
  if(libraryLoading)return libraryLoading;
  const previousTleOnly=window.satellite?.twoline2satrec&&window.satellite?.propagate?window.satellite:null;
  libraryLoading=(async()=>{
  try{await script('./assets/vendor/satellite.min.js');
     if(window.satellite?.json2satrec&&window.satellite?.propagate)return window.satellite;}
   catch(e){console.info('Local SGP4 v6 not yet installed',e.message)}
   // GitHub Actions provides the local bundle; these public ESMs are secondary fallbacks.
   for(const url of ['https://cdn.jsdelivr.net/npm/satellite.js@6.0.2/+esm',
                     'https://esm.sh/satellite.js@6.0.2']){
    try{const mod=await Promise.race([import(url),new Promise((_,reject)=>setTimeout(()=>reject(Error('Timeout')),5000))]);
      if(mod?.json2satrec&&mod?.twoline2satrec){window.satellite=mod;return mod;}}
    catch(e){console.info('SGP4 v6 CDN unavailable',e.message)}
   }
   // Legacy library can propagate TLE only. Never pretend that it supports OMM.
   if(previousTleOnly)return previousTleOnly;
   try{await script('https://cdnjs.cloudflare.com/ajax/libs/satellite.js/4.1.4/satellite.min.js');
     if(window.satellite?.twoline2satrec&&window.satellite?.propagate)return window.satellite;}
   catch(e){console.info('Legacy TLE-only SGP4 unavailable',e.message)}
   throw new Error('SGP4 v6 unavailable. Run GitHub Actions orbit updater; map-only Kepler/J2 preview can use current OMM/TLE.');
  })();
  try{return await libraryLoading}finally{libraryLoading=null}
 }
 async function fetchLive(){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{const r=await fetch(LIVE_URL,{cache:'no-store',signal:controller.signal});
   if(!r.ok)throw new Error('CelesTrak HTTP '+r.status);return parseTLE(await r.text());
  }finally{clearTimeout(timeout)}
 }
 async function loadTLE({refresh=false}={}){
  const cache=cacheGet();
  if(!refresh&&cache?.text&&Date.now()-cache.downloadedAt<TTL_MS){
   try{const parsed=parseTLE(cache.text);
    if(window.UsefulIntegrity.epochAgeHours(parsed)<=72)
     return {...parsed,source:cache.source||'Browser cache',downloadedAt:cache.downloadedAt,cached:true};
   }catch(e){console.warn('Invalid browser TLE ignored:',e.message);}
  }
  try{
   const tle=await fetchLive(),entry={text:tle.text,source:'CelesTrak live',downloadedAt:Date.now()};cachePut(entry);
   return {...tle,...entry,cached:false};
  }catch(err){
   for(const path of ['./data/theos2.tle']){
    try{const r=await fetch(path,{cache:'no-store'});if(r.ok){
     const t=parseTLE(await r.text());return {...t,source:'GitHub TLE cache',cached:true,downloadedAt:Date.now()};
    }}catch(e){console.info('Repository TLE unavailable:',e.message)}
   }
   if(cache?.text){try{const parsed=parseTLE(cache.text);
    return {...parsed,source:(cache.source||'Stored')+' (browser cache)',downloadedAt:cache.downloadedAt,cached:true};
   }catch(e){console.warn('Invalid browser TLE ignored:',e.message)}}
   throw new Error('TLE unavailable from CelesTrak/GitHub: '+err.message);
  }
 }
 function cacheManual(raw){const tle=parseTLE(raw),entry={text:tle.text,source:'Manual TLE',downloadedAt:Date.now()};cachePut(entry);
  try{window.dispatchEvent(new CustomEvent('useful-manual-theos2-tle',{detail:{text:tle.text}}));}catch{}
  return {...tle,...entry,cached:false}}

 const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
 const mag=a=>Math.hypot(a.x,a.y,a.z);
 const degToRad=Math.PI/180;
 const clampCos=x=>Math.max(-1,Math.min(1,x));
 const utcDay=ms=>Math.floor(ms/86400000)*86400000;
 const dateString=ms=>new Date(ms).toISOString().slice(0,10);
 const dateISO=ms=>new Date(ms).toISOString();
 function locate(lib,satrec,time,site){
  const propagated=lib.propagate(satrec,time);
  if(!propagated?.position||!Number.isFinite(propagated.position.x))return null;
  const gmst=lib.gstime(time),sat=lib.eciToEcf(propagated.position,gmst);
  const lat=site.lat*degToRad,lon=site.lon*degToRad;
  const obs={latitude:lat,longitude:lon,height:0},ground=lib.geodeticToEcf(obs);
  const view={x:ground.x-sat.x,y:ground.y-sat.y,z:ground.z-sat.z};
  const nadir={x:-sat.x,y:-sat.y,z:-sat.z};
  const angle=Math.acos(clampCos(dot(view,nadir)/mag(view)/mag(nadir)))/degToRad;
  const outward={x:Math.cos(lat)*Math.cos(lon),y:Math.cos(lat)*Math.sin(lon),z:Math.sin(lat)};
  const toSat={x:-view.x,y:-view.y,z:-view.z};
  const elevation=Math.asin(clampCos(dot(toSat,outward)/mag(toSat)))/degToRad;
  if(!Number.isFinite(angle)||!Number.isFinite(elevation))return null;
  const sub=lib.eciToGeodetic(propagated.position,gmst);
  const subLat=lib.degreesLat(sub.latitude),subLon=lib.degreesLong(sub.longitude);
  const psi=Math.acos(clampCos(Math.sin(lat)*Math.sin(sub.latitude)+Math.cos(lat)*Math.cos(sub.latitude)*Math.cos(lon-sub.longitude)));
  return {angle,elevation,groundDistanceKm:6371.0*psi,satLat:subLat,satLon:subLon};
 }
 function refineMinimum(lib,satrec,site,roughMs){
  let left=roughMs-STEP_MS,right=roughMs+STEP_MS;
  const value=ms=>{const g=locate(lib,satrec,new Date(ms),site);return g?.elevation>0?g.angle:180};
  const ratio=(Math.sqrt(5)-1)/2;
  let c=right-ratio*(right-left),d=left+ratio*(right-left),fc=value(c),fd=value(d);
  for(let it=0;it<23;it++){
   if(fc<fd){right=d;d=c;fd=fc;c=right-ratio*(right-left);fc=value(c)}
   else{left=c;c=d;fc=fd;d=left+ratio*(right-left);fd=value(d)}
  }
  const ms=Math.round((left+right)/2000)*1000;
  const g=locate(lib,satrec,new Date(ms),site);
  return g&&g.elevation>0?{...g,ms}:null;
 }
 function validity(tle,{nowMs=Date.now(),days=TLE_DAYS}={}){
  const epoch=Date.parse(tle?.epochISO||'');
  if(!Number.isFinite(epoch))throw new Error('Bad TLE epoch');
  const ageHours=(nowMs-epoch)/3600000;
  const start=utcDay(nowMs),end=start+Math.min(Math.max(days,0),TLE_DAYS)*86400000;
  const reason=Math.abs(nowMs-epoch)>MAX_AGE_MS?'STALE':end<=start?'OUTSIDE_VALIDITY':'OK';
  return {start,end,epoch,ageHours,reason,windowStart:dateISO(start),windowEnd:dateISO(end),maxTleDays:TLE_DAYS};
 }
 function fastAngle(siteData,satellite){
  if(!satellite)return null;
  const dx=siteData.ground.x-satellite.x,dy=siteData.ground.y-satellite.y,dz=siteData.ground.z-satellite.z;
  const v=Math.hypot(dx,dy,dz),r=Math.hypot(satellite.x,satellite.y,satellite.z);
  if(!v||!r)return null;
  const nadirDot=-(dx*satellite.x+dy*satellite.y+dz*satellite.z)/(v*r);
  const elev=-(dx*siteData.up.x+dy*siteData.up.y+dz*siteData.up.z)/v;
  if(elev<=0)return null;
  return Math.acos(clampCos(nadirDot))/degToRad;
 }
 async function sampleTrack(lib,satrec,start,end,shouldCancel,onProgress){
  const out=[];let i=0;
  for(let ms=start-STEP_MS;ms<=end+STEP_MS;ms+=STEP_MS){
   if(shouldCancel?.())throw new Error('CANCELLED');
   const when=new Date(ms),state=lib.propagate(satrec,when);
   const sat=state?.position&&Number.isFinite(state.position.x)?lib.eciToEcf(state.position,lib.gstime(when)):null;
   out.push({ms,sat});
   if(++i%2500===0){onProgress?.(`Preparing shared SGP4 trajectory: ${Math.min(100,Math.round((ms-start)/(end-start)*100))}%`);await new Promise(resolve=>setTimeout(resolve,0))}
  }
  return out;
 }
 function orbitDirection(lib,satrec,utcMs){
  const geolat=ms=>{
   const time=new Date(ms),p=lib.propagate(satrec,time)?.position;
   if(!p||!Number.isFinite(p.x))return NaN;
   return lib.degreesLat(lib.eciToGeodetic(p,lib.gstime(time)).latitude);
  };
  // Direction is based on the sign of sub-satellite geodetic latitude change,
  // NOT target bearing, off-nadir sign or map line slope.
  const a=geolat(utcMs-15000),b=geolat(utcMs+15000),d=b-a;
  return !Number.isFinite(d)||Math.abs(d)<0.005?'UNKNOWN':d>0?'ASCENDING':'DESCENDING';
 }
 function sgp4Event(site,nearest,tle,maxOff,nowStart){
  const ms=nearest.ms,iso=dateISO(ms),age=Math.abs((ms-Date.parse(tle.epochISO))/3600000);
  const confidence=age<=72?'TLE_NEAR_TERM':age<=168?'TLE_3_TO_7_DAYS_LOWER_CONFIDENCE':'TLE_7_TO_16_DAYS_EXPLORATORY';
  return {id:`sgp4-${site.id}-${ms}`,siteId:site.id,siteName:site.name,file:'',date:iso.slice(0,10),time:iso.slice(11,19),utcISO:iso,timeBasis:'UTC',
   off:+nearest.angle.toFixed(2),orbit:`${tle.norad||'58016'}-${iso.replace(/[-:]/g,'').slice(0,13)}Z`,passId:`${tle.norad||'58016'}-${iso.replace(/[-:]/g,'').slice(0,13)}Z`,
   groundDistanceKm:+nearest.groundDistanceKm.toFixed(2),tleEpochISO:tle.epochISO,source:'tle',origin:'sgp4',status:confidence,
   model:'SGP4 / TLE (Day 1-16)',direction:nearest.direction||'UNKNOWN',confidence,estimated:true,referenceUtcISO:iso,repeatCycles:0,fromBackcast:false,
   fileCloud:null,angleLimit:maxOff,notes:`TLE geometric closest approach; ${confidence}; not confirmed acquisition / attitude.`};
 }
 function repeatEvent(site,anchor,ms,cycle,repeatDays){
  const iso=dateISO(ms),fromBackcast=anchor.ms<anchor.nowStart;
  return {id:`repeat26-${site.id}-${anchor.ms}-${cycle}`,siteId:site.id,siteName:site.name,date:iso.slice(0,10),time:iso.slice(11,19),
   utcISO:iso,timeBasis:'UTC',off:+anchor.angle.toFixed(1),orbit:`R26-${cycle}`,passId:`R26-${cycle}-${site.id}`,file:'',
   tleEpochISO:anchor.tleEpochISO,groundDistanceKm:+anchor.groundDistanceKm.toFixed(1),source:'repeat26',origin:'heuristic',
   status:fromBackcast?'REPEAT26_BACKCAST_ANCHOR_LOW_CONFIDENCE':'REPEAT26_HEURISTIC_LOW_CONFIDENCE',
   model:`${repeatDays}-day ground-track repeat heuristic`,repeatDays,confidence:'LOW — NOT A PRECISE TIME OR ANGLE',estimated:true,
   referenceUtcISO:dateISO(anchor.ms),repeatCycles:cycle,direction:anchor.direction||'UNKNOWN',fromBackcast,angleLimit:anchor.maxOff,fileCloud:null,
   notes:`${repeatDays}-day repeat-cycle proxy ×${cycle} from ${dateISO(anchor.ms)}. Reference angle/time not newly propagated; not tasking.`};
 }
 /**
  * One shared SGP4 propagation over a 26-day template for ALL sites:
  *   UTC days -10..-1: historical TLE backcast solely to seed days 17..26;
  *   UTC days 0..15: TLE forward screening (reported as TLE estimates);
  *   UTC day 16 onward: 26-day repetition of the phase template.
  * The backcast is not historical measured ephemeris, and all future repeats are
  * LOW-CONFIDENCE geometry/time proxies. They are NEVER confirmed tasking.
  */
 async function predictBatchHybrid(tle,sites,maxOff=15,opts={}){
  const nowMs=opts.nowMs??Date.now(),days=opts.days??30,valid=validity(tle,{nowMs});
  const start=valid.start,end=start+Math.max(1,Math.floor(days))*86400000;
  const isTHEOS2=String(tle.norad||'58016')==='58016';
  const configured=Number(opts.repeatCycleDays);
  const repeatDays=Number.isInteger(configured)&&configured>=1&&configured<=365?configured:(isTHEOS2?REPEAT_DAYS:null);
  const backDays=repeatDays?Math.max(0,repeatDays-TLE_DAYS):0;
  const base={epochISO:tle.epochISO,windowStart:valid.windowStart,windowEnd:valid.windowEnd,
   backcastStart:dateISO(start-backDays*86400000),repeatDays,maxTleDays:TLE_DAYS,
   ageHours:+valid.ageHours.toFixed(1)};
  const results=new Map();
  if(valid.reason!=='OK'){
   for(const site of sites)results.set(site.id,{...base,siteId:site.id,events:[],nearestByDay:{},reason:valid.reason});
   return results;
  }
  const lib=await sgp4Library(),satrec=tle.omm?(typeof lib.json2satrec==='function'?lib.json2satrec(tle.omm):null):lib.twoline2satrec(tle.line1,tle.line2);
  if(tle.omm&&!satrec)throw new Error('Satellite OMM requires satellite.js 6+; run GitHub Actions updater');
  if(!satrec||satrec.error)throw new Error('SGP4 initialization failed');
  const templateStart=start-backDays*86400000;
  const templateEnd=start+TLE_DAYS*86400000;
  const sharedTrack=await sampleTrack(lib,satrec,templateStart,templateEnd,opts.shouldCancel,opts.onProgress);
  const tLEEnd=templateEnd;
  for(let siteIndex=0;siteIndex<sites.length;siteIndex++){
   if(opts.shouldCancel?.())throw new Error('CANCELLED');
   const site=sites[siteIndex],lat=site.lat*degToRad,lon=site.lon*degToRad;
   const obs={latitude:lat,longitude:lon,height:0};
   const sd={ground:lib.geodeticToEcf(obs),up:{x:Math.cos(lat)*Math.cos(lon),y:Math.cos(lat)*Math.sin(lon),z:Math.sin(lat)}};
   let prevprev=null,prev=null;
   const anchors=[],near={};
   for(const frame of sharedTrack){
    const next={ms:frame.ms,angle:fastAngle(sd,frame.sat)};
    if(prev&&prevprev&&prev.angle!=null&&prevprev.angle!=null&&next.angle!=null&&prev.angle<=prevprev.angle&&prev.angle<=next.angle){
     const refined=refineMinimum(lib,satrec,site,prev.ms);
     if(refined&&refined.ms>=templateStart&&refined.ms<templateEnd){
      refined.direction=orbitDirection(lib,satrec,refined.ms);
      const key=dateString(refined.ms);
      if(refined.ms>=start&&refined.ms<tLEEnd){
       const record={utcISO:dateISO(refined.ms),time:dateISO(refined.ms).slice(11,19),angle:+refined.angle.toFixed(2),groundDistanceKm:+refined.groundDistanceKm.toFixed(2),direction:refined.direction,withinLimit:refined.angle<=maxOff};
       if(!near[key]||record.angle<near[key].angle)near[key]=record;
      }
      if(refined.angle<=maxOff)anchors.push({...refined,tleEpochISO:tle.epochISO,maxOff,nowStart:start});
     }
    }
    prevprev=prev;prev=next;
   }
   const events=[];
   for(const a of anchors){
    if(a.ms>=start&&a.ms<tLEEnd)events.push(sgp4Event(site,a,tle,maxOff,start));
    for(let cycle=1;repeatDays&&cycle<=Math.ceil((end-a.ms)/(repeatDays*86400000));cycle++){
     const ms=a.ms+cycle*repeatDays*86400000;
     if(ms<tLEEnd||ms>=end)continue;
     events.push(repeatEvent(site,a,ms,cycle,repeatDays));
    }
   }
   events.sort((a,b)=>a.utcISO.localeCompare(b.utcISO));
   results.set(site.id,{...base,siteId:site.id,events,nearestByDay:near,reason:'OK',
    source:'HYBRID_TLE16_REPEAT26',tleCount:events.filter(e=>e.source==='tle').length,
    repeatCount:events.filter(e=>e.source==='repeat26').length,
    templateBackcastDays:backDays,numericalResolutionSeconds:1});
   if((siteIndex+1)%4===0||siteIndex+1===sites.length){
    opts.onProgress?.(`Site geometry & 26-day repeat: ${siteIndex+1}/${sites.length}`);
    await new Promise(resolve=>setTimeout(resolve,0));
   }
  }
  return results;
 }
 async function predict(tle,site,maxOff=15,opts={}){
  const result=await predictBatchHybrid(tle,[site],maxOff,{...opts,days:opts.days||365});
  return result.get(site.id);
 }
 window.PlannerOrbit={NORAD,parseTLE,loadTLE,cacheManual,predict,validity,locate,sgp4Library,predictBatchHybrid,
  MAX_AGE_MS,MAX_FUTURE_MS,TLE_DAYS,REPEAT_DAYS,BACKCAST_DAYS,directionAt:orbitDirection};
})();
