/* v3.9 field sheet export: column-aligned with on-site operator worksheet.
 * Position/angles are ONLY geometric estimates from current near-epoch SGP4.
 * Never substitute unsigned off-nadir for actual commanded roll.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const MAX_AGE_MS=72*3600000;
const TIMEZONES=new Set(['UTC','Asia/Bangkok','America/Los_Angeles','Europe/Paris']);
function localTime(iso,zone){
 try{return new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(iso));}
 catch(_){return '';}
}
const val=x=>Number.isFinite(Number(x))?Number(x).toFixed(2):'';
async function buildFieldSheet({engine,fleet,days,zone,notice}){
 const filter=$('filterSite')?.value||'all';
 const sites=engine.getVisibleSites().filter(s=>(filter==='all'||s.id===filter)&&s.active!==false&&Number.isFinite(s.lat)&&Number.isFinite(s.lon));
 if(!sites.length)throw Error('No Active sites with valid coordinates.');
 notice('Calculating candidate passes...');
 // The original engine excludes actual/invalid geometric candidates and retains source tags.
 let computed=new Map(),orbitError='';
 try{computed=await engine.ensureTLEForSites(sites,{horizonDays:days});}
 catch(e){orbitError=String(e.message||e);}
 const candidates=engine.getCompactRows(days,sites,computed).filter(r=>($('resultsMethod')?.value||'all')==='all'||r.method===$('resultsMethod')?.value);
 const sat=fleet.selectedSatellite();
 let tle=null,lib=null,rec=null,epochMs=NaN;
 try{
   [tle,lib]=await Promise.all([fleet.getSelectedElements(),window.PlannerOrbit.sgp4Library()]);
   epochMs=Date.parse(tle.epochISO);
   rec=tle.omm?lib.json2satrec?.(tle.omm):lib.twoline2satrec?.(tle.line1,tle.line2);
   if(!rec||rec.error)rec=null;
 }catch(e){orbitError=orbitError||String(e.message||e);}
 const localHeader=zone==='America/Los_Angeles'?'Nevada Time (America/Los_Angeles)':`Local Time (${zone})`;
 const header=['Date','Test Site','Satellite','UTC Time',localHeader,
   'Roll Angle (actual, deg)','Required Off-nadir (geometric, deg)','Azimuth (satellite, deg)',
   'Elevation (satellite, deg)','S.Azimuth (sun, deg)','S.Elevation (sun, deg)',
   'Status','Remark','Follow-Up','Direction','Prediction source','TLE epoch UTC'];
 const out=[header];let nearEpoch=0,uncertain=0;
 for(const row of candidates){
   const ms=Date.parse(row.utcISO),site=sites.find(s=>s.id===row.siteId);
   const suitable=row.method==='tle'&&Number.isFinite(ms)&&Number.isFinite(epochMs)&&Math.abs(ms-epochMs)<=MAX_AGE_MS;
   let snapshot=null;
   if(suitable&&rec&&site&&window.UsefulTracking?.imagingSnapshot){
     try{snapshot=window.UsefulTracking.imagingSnapshot(lib,rec,site,ms);}catch(_){snapshot=null;}
   }
   if(snapshot)nearEpoch++;else uncertain++;
   let status=row.method==='repeat26'?'Repeat proxy (LOW confidence)':row.method==='tle'?'Estimated TLE':'Proposed / Imported';
   const remark=snapshot?'Geometric az/el only; roll and tasking not confirmed':row.method==='repeat26'?'No valid az/el from 26-day repeat':'Orbit geometry unavailable or outside ±72h from epoch';
   out.push([row.date,row.site,row.satellite,row.time,localTime(row.utcISO,zone),
     '',Number(row.off).toFixed(2),snapshot?val(snapshot.az):'',snapshot?val(snapshot.el):'',
     snapshot?.sun?val(snapshot.sun.azimuth):'',snapshot?.sun?val(snapshot.sun.elevation):'',
     status,remark,'',row.direction||'UNKNOWN',row.method,row.method==='tle'&&sat?.name===row.satellite?tle?.epochISO||'':'']);
 }
 return {rows:out,nearEpoch,uncertain,orbitError};
}
function download(name,text){const blob=new Blob([text],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);}
async function exportFieldSheet(){
 const button=$('exportFieldSheet'),status=$('fieldSheetStatus');
 const say=str=>{if(status)status.textContent=str;};
 if(button.disabled)return;
 const engine=window.THEOS2Planner,fleet=window.UsefulFleet;
 if(!engine||!fleet){say('Planner not ready.');return;}
 let zone=$('fieldSheetZone')?.value||'UTC';if(!TIMEZONES.has(zone))zone='UTC';
 button.disabled=true;
 try{
   const data=await buildFieldSheet({engine,fleet,days:engine.selectedHorizonDays(),zone,notice:say});
   const stamp=new Date().toISOString().slice(0,10);
   download(`USEFUL_Field_Planning_${stamp}_${zone.replace(/\W+/g,'_')}_UTC.csv`,engine.buildCSV(data.rows));
   say(`${data.rows.length-1} rows · ${data.nearEpoch} with near-epoch satellite/Sun geometry · ${data.uncertain} without az/el. Actual Roll/Confirmed left blank.${data.orbitError?' Orbit notice: '+data.orbitError:''}`);
 }catch(e){say('Field Sheet failed: '+String(e?.message||e));}
 finally{button.disabled=false;}
}
function init(){ $('exportFieldSheet')?.addEventListener('click',exportFieldSheet); }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.USEFULFieldSheet={buildFieldSheet,exportFieldSheet,localTime};
})();
