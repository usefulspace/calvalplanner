/* USEFUL Acquisition Planner 3.3: satellite fleet, SGP4 live subpoints, categories.
   This is independent of tasking. No orbital elements => no satellite marker.
   Works on GitHub Pages; user edits are browser-local until JSON is committed.
*/
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const KEY_S='useful:planner:v27:satellites', KEY_T='useful:planner:v27:siteTypes', KEY_OPTIONS='useful:planner:v27:fleetOptions';
 const DEFAULT_SAT=[{id:'theos-2',name:'THEOS-2',norad:'58016',color:'#5dd7e9',active:true,revisitDays:null,repeatCycleDays:26,downlinkMHz:null,imageData:''},{id:'theos-1',name:'THEOS-1',norad:'33396',color:'#dba85d',active:true,revisitDays:null,repeatCycleDays:null,downlinkMHz:null,imageData:''}];
 const DEFAULT_TYPES=[
  {name:'Radiometric',color:'#38dfc9'},{name:'Geometric',color:'#75b7ff'},
  {name:'Spatial / MTF',color:'#ae93ff'},{name:'Atmospheric',color:'#f2c66e'},
  {name:'DSNU / Dark',color:'#e58ae4'},{name:'Other',color:'#a1b4c4'}];
 const model={satellites:DEFAULT_SAT.map(x=>({...x})),types:DEFAULT_TYPES.map(x=>({...x})),
  selected:'theos-2',showTracks:true,live:false,initialized:false,elements:new Map(),
  calculated:new Map(),status:new Map(),refreshing:false,renderTimer:0,work:0,
  lastTick:0,pendingRefresh:false,notice:'',selectedType:null};
 const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const language=()=>window.PlannerI18N?.current?.()||'th';
 const t=(th,en)=>language()==='en'?en:th;
 const storage=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
 const persist=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
 const colorOK=v=>/^#[0-9a-fA-F]{6}$/.test(v);
 const rgb=(hex,a)=>{const v=hex.slice(1);return `rgba(${parseInt(v.slice(0,2),16)},${parseInt(v.slice(2,4),16)},${parseInt(v.slice(4,6),16)},${a})`};
 const digits=v=>String(v??'').trim();
 const numberOrNull=(v,min,max)=>{if(v==null||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:null;};
 const validDataImage=source=>typeof source==='string'&&source.length<180000&&/^data:image\/(webp|png);base64,[a-zA-Z0-9+/=]+$/.test(source);
 let pendingImageData=null;
 const customIconCache=new Map();
 function validSat(s){
  if(!s||!String(s.name||'').trim()||!/^[0-9]{1,9}$/.test(digits(s.norad)))return null;
  return {id:String(s.id||`sat-${digits(s.norad)}`),name:String(s.name).trim().slice(0,70),
   norad:digits(s.norad),color:colorOK(s.color)?s.color:'#5dd7e9',active:s.active!==false,
   revisitDays:numberOrNull(s.revisitDays,1,365),
   repeatCycleDays:numberOrNull(s.repeatCycleDays,1,365),
   downlinkMHz:numberOrNull(s.downlinkMHz,0.001,100000),
   imageData:validDataImage(s.imageData)?s.imageData:''};
 }
 function validType(a){
  if(!a||!String(a.name||'').trim())return null;
  return {name:String(a.name).trim().slice(0,40),color:colorOK(a.color)?a.color:'#a1b4c4'};
 }
 const unique=(arr,key)=>{const seen=new Set();return arr.filter(x=>{const k=key(x);if(seen.has(k))return false;seen.add(k);return true})};
 function saveSats(){persist(KEY_S,{version:1,satellites:model.satellites});}
 function saveTypes(){persist(KEY_T,{version:1,types:model.types});}
 function getSatellites(){return model.satellites.map(x=>({...x}));}
 function selectedSatellite(){return model.satellites.find(s=>s.id===model.selected)||model.satellites[0]||null;}
 function typeColor(name){return model.types.find(x=>x.name===name)?.color||'#92a5b6';}
 function getTypes(){return model.types.map(t=>({...t}));}
 function satellitePosition(norad){return model.calculated.get(String(norad))?.position||null;}
 function timeString(d){return d.toISOString().replace('T',' ').replace('.000Z','Z');}
 function tell(message,level='info'){
  const target=$('fleetStatus');if(target){target.textContent=message;target.dataset.level=level;}
  model.notice=message;
 }
 function setStatus(norad,text){model.status.set(String(norad),text);}
 function parseTLE(content,norad){return window.UsefulIntegrity.parseTLE(content,norad);}
 function parseOMM(raw,norad){return window.UsefulIntegrity.parseOMM(raw,norad);}
 const STALE_RETRY_MS=15*60*1000;
 const lastElementAttempt=new Map();
 // Manual elements override mirrored data only while their epoch remains usable.
 // Stale local/browser data must not silently block a newer published element set.
 async function loadOne(sat,{force=false}={}){
  const n=sat.norad,now=Date.now();
  const known=model.elements.get(n);
  if(!force && known){
   if(window.UsefulIntegrity.epochAgeHours(known,now)<=72)return known;
   if(now-(lastElementAttempt.get(n)||0)<STALE_RETRY_MS)return known;
  }
  lastElementAttempt.set(n,now);
  const legacy=n==='58016'?storage('theos2:planner:v24:tle'):null;
  const savedManual=storage(`useful:planner:v27:element:${n}`)||
   (legacy?.text?{text:legacy.text}:null);
  let manual=null;
  if(savedManual){
   try{const parsed=savedManual.omm?parseOMM(savedManual.omm,n):parseTLE(savedManual.text,n);
    manual={...parsed,name:sat.name,source:savedManual.omm?'Manual OMM':'Manual TLE'};
   }catch(err){console.warn('Invalid manual orbit elements ignored:',err.message);}
  }
  if(!force && manual && window.UsefulIntegrity.epochAgeHours(manual,now)<=72){
   model.elements.set(n,manual);return manual;
  }
  const supportOMM=typeof window.satellite?.json2satrec==='function';
  const mirror=n==='58016'?
   (supportOMM?[`./data/satellites/${n}.json`,`./data/satellites/${n}.tle`,'./data/theos2.tle']:
    [`./data/satellites/${n}.tle`,'./data/theos2.tle',`./data/satellites/${n}.json`]):
   (supportOMM?[`./data/satellites/${n}.json`,...(Number(n)<=99999?[`./data/satellites/${n}.tle`]:[])]:
    [...(Number(n)<=99999?[`./data/satellites/${n}.tle`]:[]),`./data/satellites/${n}.json`]);
  const remote=`https://celestrak.org/NORAD/elements/gp.php?CATNR=${encodeURIComponent(n)}&FORMAT=JSON`;
  const paths=force?[remote,...mirror]:[...mirror,remote];
  let best=known||manual||null;
  const fresher=candidate=>!best || Date.parse(candidate.epochISO)>Date.parse(best.epochISO);
  for(const url of paths){
   try{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
    let res;
    try{res=await fetch(url,{cache:'no-store',signal:controller.signal});}finally{clearTimeout(timer)}
    if(!res.ok)throw Error('HTTP '+res.status);
    const parsed=url.endsWith('.json')||url.includes('FORMAT=JSON')?parseOMM(await res.json(),n):parseTLE(await res.text(),n);
    const candidate={...parsed,name:sat.name,source:url.includes('celestrak.org')?'CelesTrak live':'GitHub repository mirror'};
    if(fresher(candidate))best=candidate;
    // A fresh mirror avoids unnecessary traffic; a stale mirror triggers live refresh.
    if(!force && window.UsefulIntegrity.epochAgeHours(best,now)<=72)break;
    if(force && url===remote && window.UsefulIntegrity.epochAgeHours(best,now)<=72)break;
   }catch(err){console.info('Orbit source unavailable',url,err.message);}
  }
  if(manual && fresher(manual))best=manual;
  if(!best)throw Error('No valid TLE/OMM (run Actions or paste orbital elements)');
  model.elements.set(n,best);return best;
 }
 async function getSelectedElements({force=false}={}){
  const sat=selectedSatellite();if(!sat||!sat.active)throw Error('Select an active satellite first');
  return await loadOne(sat,{force});
 }
 async function sgp4(){
  const lib=await window.PlannerOrbit.sgp4Library();return lib;
 }
 function satrecFor(lib,element){
  if(element.omm){if(typeof lib.json2satrec!=='function')throw Error('OMM requires satellite.js 6+; run GitHub Actions to build local library');return lib.json2satrec(element.omm)}
  return lib.twoline2satrec(element.line1,element.line2);
 }
 function calculateAt(lib,satrec,ms){
  const d=new Date(ms),pv=lib.propagate(satrec,d);
  if(!pv?.position||!Number.isFinite(pv.position.x))return null;
  const gmst=lib.gstime(d),geo=lib.eciToGeodetic(pv.position,gmst);
  const lat=lib.degreesLat(geo.latitude),lon=lib.degreesLong(geo.longitude);
  return Number.isFinite(lat)&&Number.isFinite(lon)?{lat,lon,altKm:geo.height,utcISO:d.toISOString()}:null;
 }
 async function updateOrbit({force=false}={}){
  if(model.refreshing){model.pendingRefresh=true;return;}
  if(force)model.elements.clear();
  const job=++model.work;model.refreshing=true;
  const active=model.satellites.filter(s=>s.active);
  if(!active.length){tell(t('ไม่มีดาวเทียม Active','No active satellites'));model.refreshing=false;return;}
  const now=Date.now(),res=new Map(),inputs=[];
  tell(t('กำลังอ่านข้อมูลวงโคจรและตรวจความใหม่ของ TLE/OMM...','Checking orbital data and TLE/OMM freshness...'));
  try{
   // Step 1: plot immediately with local Kepler/J2 preview if valid elements exist.
   // This step does not require satellite.js, network/CDN, GitHub Actions library build.
   for(const sat of active){
    if(job!==model.work)break;
    try{
     const elem=await loadOne(sat,{force});
     const age=Math.abs(now-Date.parse(elem.epochISO))/3600000;
     if(!Number.isFinite(age)||age>72){setStatus(sat.norad,`STALE TLE/OMM (${Number.isFinite(age)?age.toFixed(1):'?'} h) · no current position shown`);continue;}
     inputs.push({sat,elem,age});
     try{
      const el=window.UsefulOrbitPreview.fromElements(elem);
      const position=window.UsefulOrbitPreview.at(el,now);
      const track=[];
      if(model.showTracks)for(let k=-45;k<=45;k++){
       try{track.push({...window.UsefulOrbitPreview.at(el,now+k*60000),offsetMin:k});}catch{}
      }
      res.set(sat.norad,{position,track,sat,ageHours:age,epochISO:elem.epochISO,source:elem.source,
        method:'Kepler/J2 preview',approximate:true});
      setStatus(sat.norad,`PREVIEW · UTC ${timeString(new Date(now))} · ${position.lat.toFixed(2)}°, ${position.lon.toFixed(2)}° · Epoch ${elem.epochISO}`);
     }catch(err){setStatus(sat.norad,`Orbit preview unavailable: ${err.message}`);}
    }catch(err){setStatus(sat.norad,`No current TLE/OMM: ${err.message}`);}
   }
   model.calculated=res;model.lastTick=now;
   const n=res.size;
   tell(n?`${n}/${active.length} · ${t('ดาวเทียมปรากฏบนแผนที่ (Kepler/J2 แสดงภาพคร่าว ๆ)','satellite(s) plotted (Kepler/J2 visual PREVIEW)')} · ${timeString(new Date(now))} · ${t('ไม่ใช่ SGP4 หรือ Telemetry','Not SGP4 or telemetry')}`:
     t('ไม่พบ TLE/OMM ที่ใหม่พอสำหรับแสดงตำแหน่ง (อายุไม่เกิน 72 ชม.) ตรวจ GitHub Actions หรือวาง TLE','No current TLE/OMM (age must be ≤72 h). Run GitHub Actions or paste TLE.'),n?'warn':'warn');
   renderSatellites();redrawMaps();

   // Step 2: upgrade to full SGP4 only if a compatible library is actually available.
   // OMM is never sent to satellite.js 4.x; the preview remains visible instead.
   if(inputs.length){
    try{
     const lib=await sgp4();let sgp4Count=0;
     for(const {sat,elem,age} of inputs){
      if(job!==model.work)break;
      try{
       if(elem.omm&&typeof lib.json2satrec!=='function')continue;
       const satrec=satrecFor(lib,elem);
       if(!satrec||satrec.error)throw Error('Invalid SGP4 satellite record');
       const position=calculateAt(lib,satrec,now);
       if(!position)throw Error('SGP4 returned no position');
       const track=[];
       if(model.showTracks)for(let k=-45;k<=45;k++){
        const p=calculateAt(lib,satrec,now+k*60000);
        if(p)track.push({...p,offsetMin:k});
       }
       res.set(sat.norad,{position,track,sat,ageHours:age,epochISO:elem.epochISO,source:elem.source,method:'SGP4',approximate:false});
       setStatus(sat.norad,`SGP4 · ${position.lat.toFixed(2)}°, ${position.lon.toFixed(2)}° · ${position.altKm.toFixed(0)} km · UTC ${timeString(new Date(now))}`);
       sgp4Count++;
      }catch(err){console.info('SGP4 could not refine satellite',sat.norad,err.message);}
     }
     model.calculated=res;
     const previews=[...res.values()].filter(x=>x.approximate).length;
     tell(res.size?`${res.size}/${active.length} ${t('ดาวเทียมที่แสดง','visible')} · SGP4 ${sgp4Count} · Kepler/J2 ${previews} ${t('(คร่าว ๆ)','(preview)')} · ${timeString(new Date(now))}`:
       t('ไม่พบดาวเทียมที่แสดงได้','No displayable satellite'),previews?'warn':sgp4Count?'ok':'warn');
     renderSatellites();redrawMaps();
    }catch(err){
     // Do not wipe displayed positions because a CDN / vendor library is absent.
     if(res.size)tell(`${res.size}/${active.length} · Kepler/J2 VISUAL PREVIEW only · ${t('SGP4 ไม่พร้อม แต่แผนที่ยังแสดงได้','SGP4 unavailable; map still displays')} · ${timeString(new Date(now))}`,'warn');
     else tell(t('ยังไม่มีตำแหน่งดาวเทียม: '+err.message,'No satellite position: '+err.message),'warn');
     renderSatellites();redrawMaps();
    }
   }
  }catch(err){tell('Orbital map: '+err.message,'warn');renderSatellites();redrawMaps();}
  finally{model.refreshing=false;
    if(model.pendingRefresh){model.pendingRefresh=false;queueMicrotask(()=>updateOrbit());}
  }
 }
 function drawTrack2D(ctx,toXY,m){
  if(!model.showTracks)return;
  for(const {sat,track} of model.calculated.values()){
   for(const part of ['past','future']){
    ctx.beginPath();ctx.lineWidth=1.8;ctx.strokeStyle=rgb(sat.color,part==='past'?.52:.94);
    ctx.setLineDash(part==='past'?[5,5]:[]);
    let prev=null;
    for(const p of track){if((part==='past'&&p.offsetMin>0)||(part==='future'&&p.offsetMin<0))continue;
     const xy=toXY(p.lat,p.lon);
     if(!prev||Math.abs(p.lon-prev.lon)>150||Math.abs(xy.x-prev.xy.x)>m.width*.7)ctx.moveTo(xy.x,xy.y);else ctx.lineTo(xy.x,xy.y);
     prev={lon:p.lon,xy};
    }
    ctx.stroke();ctx.setLineDash([]);
   }
  }
 }
 // User-supplied transparent THEOS-2 model image. Use it only for NORAD 58016.
 // Other satellites retain the neutral vector symbol; no invented spacecraft photos.
 const theos1Marker = new Image();
 theos1Marker.decoding='async';
 theos1Marker.addEventListener('load',()=>redrawMaps());
 theos1Marker.src='./assets/theos1-map-marker.webp';
 const theos2Marker = new Image();
 theos2Marker.decoding='async';
 theos2Marker.addEventListener('load',()=>redrawMaps());
 theos2Marker.addEventListener('error',()=>console.warn('THEOS-2 marker image unavailable; vector fallback active.'));
 theos2Marker.src='./assets/theos2-map-marker.webp';
 function drawSpacecraftIcon(ctx,x,y,color,norad,sat){
  const image=sat?customImage(sat):null;
  if(image){
   const width=28,height=width*image.naturalHeight/image.naturalWidth;
   ctx.save();ctx.shadowColor='rgba(6,20,35,.88)';ctx.shadowBlur=6;
   ctx.drawImage(image,x-width/2,y-height/2,width,height);ctx.restore();return;
  }
  if(String(norad)==='33396' && theos1Marker.complete && theos1Marker.naturalWidth>0){
   const width=29,height=width*theos1Marker.naturalHeight/theos1Marker.naturalWidth;
   ctx.save();ctx.shadowColor='rgba(8,15,35,.8)';ctx.shadowBlur=5;
   ctx.drawImage(theos1Marker,x-width/2,y-height/2,width,height);ctx.restore();return;
  }
  if(String(norad)==='58016' && theos2Marker.complete && theos2Marker.naturalWidth>0){
   // Small crisp image, centered at the calculated sub-satellite position.
   const width=28,height=width*theos2Marker.naturalHeight/theos2Marker.naturalWidth; // 50% of v3.4; 2D + 3D
   ctx.save();
   ctx.shadowColor='rgba(6,20,35,.88)';ctx.shadowBlur=7;
   ctx.drawImage(theos2Marker,x-width/2,y-height/2,width,height);
   ctx.restore();
   return;
  }

  // Stylized spacecraft icon (bus + paired solar arrays), not a ground marker.
  ctx.save();ctx.translate(x,y);ctx.rotate(-Math.PI/7);
  ctx.shadowColor=color;ctx.shadowBlur=8;
  ctx.fillStyle='#123249';ctx.strokeStyle=color;ctx.lineWidth=1.4;
  ctx.fillRect(-17,-5,10,10);ctx.strokeRect(-17,-5,10,10);
  ctx.fillRect(7,-5,10,10);ctx.strokeRect(7,-5,10,10);
  ctx.shadowBlur=0;ctx.strokeStyle='#9be8ef';ctx.lineWidth=1;
  [-13,-10,10,13].forEach(px=>{ctx.beginPath();ctx.moveTo(px,-5);ctx.lineTo(px,5);ctx.stroke();});
  ctx.fillStyle='#fff4d1';ctx.strokeStyle='#10263d';ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(8,0);ctx.lineTo(0,8);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
 }
 function drawMarkers2D(ctx,toXY,w,h){
  for(const {sat,position,approximate} of model.calculated.values()){
   const p=toXY(position.lat,position.lon);
   if(p.x<-20||p.x>w+20||p.y<-20||p.y>h+20)continue;
   drawSpacecraftIcon(ctx,p.x,p.y,sat.color,sat.norad,sat);
   const label=(approximate?'≈ ':'')+sat.name;ctx.font='bold 11px Inter,sans-serif';
   const labelW=ctx.measureText(label).width, lx=Math.max(6,Math.min(w-labelW-14,p.x+(String(sat.norad)==="58016"?16:23))),ly=Math.min(h-10,p.y+(String(sat.norad)==="58016"?22:33));
   ctx.fillStyle='rgba(6,28,47,.94)';ctx.fillRect(lx-5,ly-14,labelW+10,19);
   ctx.fillStyle='#eafcf8';ctx.fillText(label,lx,ly);
  }
 }
 function drawTrack3D(ctx,project){
  if(!model.showTracks)return;
  for(const {sat,track} of model.calculated.values()){
   for(const part of ['past','future']){
    ctx.beginPath();ctx.lineWidth=2;ctx.strokeStyle=rgb(sat.color,part==='past'?.54:.94);
    ctx.setLineDash(part==='past'?[4,5]:[]);let prev=null;
    for(const pos of track){if((part==='past'&&pos.offsetMin>0)||(part==='future'&&pos.offsetMin<0))continue;
     const p=project(pos.lat,pos.lon);
     if(p.depth<=0||!prev||prev.depth<=0||Math.abs(pos.lon-prev.lon)>150)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
     prev={...p,lon:pos.lon};
    }
    ctx.stroke();ctx.setLineDash([]);
   }
  }
 }
 function drawMarkers3D(ctx,project,w,h){
  for(const {sat,position,approximate} of model.calculated.values()){
   const p=project(position.lat,position.lon);if(p.depth<=0)continue;
   drawSpacecraftIcon(ctx,p.x,p.y,sat.color,sat.norad,sat);
   const label=(approximate?'≈ ':'')+sat.name;ctx.font='bold 11px Inter,sans-serif';
   const labelW=ctx.measureText(label).width,lx=Math.max(6,Math.min(w-labelW-14,p.x+(String(sat.norad)==="58016"?16:23))),ly=Math.min(h-9,p.y+(String(sat.norad)==="58016"?22:32));
   ctx.fillStyle='rgba(6,28,47,.93)';ctx.fillRect(lx-5,ly-14,labelW+10,19);
   ctx.fillStyle='#eafcf8';ctx.fillText(label,lx,ly);
  }
 }
 function redrawMaps(){window.THEOS2Planner?.redrawMaps?.();}
 function refreshTypeOptions(){
  const select=$('siteType');if(!select)return;
  const old=select.value;
  select.replaceChildren(...model.types.map(c=>new Option(c.name,c.name)));
  if(model.types.some(c=>c.name===old))select.value=old;
 }
 function renderTypes(){
  refreshTypeOptions();const dest=$('siteTypeRows');if(!dest)return;
  dest.innerHTML=model.types.map(c=>`<div class="type-manager-row" data-typename="${safe(c.name)}"><span class="category-chip" style="--category-color:${c.color}">${safe(c.name)}</span><input class="category-color" data-typecolor="${safe(c.name)}" type="color" value="${c.color}" title="Marker color"><button class="button button-outline button-sm" data-deltype="${safe(c.name)}" type="button" ${c.name==='Other'?'disabled title="The Other fallback cannot be removed"':''}>${t('ลบ','Delete')}</button></div>`).join('');
  const legend=$('siteTypeLegend');if(legend)legend.innerHTML=model.types.map(c=>`<span class="category-legend-item"><i style="background:${c.color}"></i>${safe(c.name)}</span>`).join('');
 }
 function renderSatellites(){
  const selector=$('fleetSelected');if(selector){const old=model.selected;selector.replaceChildren(...model.satellites.map(s=>new Option(`${s.name} · ${s.norad}`,s.id)));selector.value=model.satellites.some(s=>s.id===old)?old:model.satellites[0]?.id||'';}
  const auto=$('tleSatellite');if(auto){const old=model.selected;auto.replaceChildren(...model.satellites.filter(s=>s.active).map(s=>new Option(`${s.name} (NORAD ${s.norad})`,s.id)));auto.value=old;}
  const dest=$('fleetRows');if(!dest)return;
  dest.innerHTML=model.satellites.map(s=>{
   const calculated=model.calculated.get(s.norad),p=calculated?.position,status=model.status.get(s.norad)||t('รอข้อมูล TLE/OMM','Awaiting orbital elements');
   return `<div class="fleet-row"><input type="checkbox" data-fleetactive="${safe(s.id)}" ${s.active?'checked':''} title="Enable/disable satellite"><span class="fleet-sat-icon" style="background:${s.color}"></span><div class="fleet-row-copy"><strong>${safe(s.name)}</strong><span class="fleet-status-pill ${!s.active?'fleet-inactive':p?'fleet-available':'fleet-unavailable'}">${!s.active?'INACTIVE':p?'POSITION AVAILABLE':'ACTIVE · NO POSITION'}</span><span>NORAD ${safe(s.norad)} · ${safe(status)}</span><small>Revisit: ${s.revisitDays==null?'not defined':s.revisitDays+' d'} · Repeat cycle: ${s.repeatCycleDays==null?'not defined':s.repeatCycleDays+' d'}</small></div><button type="button" class="fleet-mini" data-fleetedit="${safe(s.id)}" title="Add image / TLE / revisit">${t('แก้ไข','Edit')}</button><button type="button" class="fleet-mini" data-fleetdelete="${safe(s.id)}" title="Delete">×</button></div>`;
  }).join('');
  const count=$('fleetCount');if(count)count.textContent=`${model.calculated.size} / ${model.satellites.filter(s=>s.active).length}`;
  const now=$('fleetNow');if(now)now.textContent=model.lastTick?timeString(new Date(model.lastTick))+' UTC':'No fresh orbit data';
 }
 function showSatModal(id=''){
  const sat=model.satellites.find(s=>s.id===id)||null;
  $('fleetId').value=sat?.id||'';
  $('fleetName').value=sat?.name||'';
  $('fleetNorad').value=sat?.norad||'';
  $('fleetColor').value=sat?.color||'#5dd7e9';
  $('fleetActive').checked=sat?.active!==false;
  $('fleetElements').value='';
  $('fleetRevisit').value=sat?.revisitDays??'';
  $('fleetRepeatCycle').value=sat?.repeatCycleDays??'';
  $('fleetDownlink').value=sat?.downlinkMHz??'';
  $('fleetPhoto').value='';pendingImageData=null;
  showPhotoPreview(sat?.imageData||(sat?.norad==='58016'?'./assets/theos2-map-marker.webp':sat?.norad==='33396'?'./assets/theos1-map-marker.webp':''));
  $('fleetModal').hidden=false;$('fleetName').focus();
 }
 function closeSatModal(){$('fleetModal').hidden=true;}
 function showPhotoPreview(src){const img=$('fleetPhotoPreview');if(!img)return;img.hidden=!src;img.src=src||'';}
 async function handlePhotoFile(file){
  if(!file)return;
  if(!['image/webp','image/png'].includes(file.type)||file.size>1048576){alert('Use a PNG or WebP image, 1 MB maximum. Transparent background and 128×128 px recommended.');return;}
  const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
  const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src;});
  const scale=Math.min(1,128/Math.max(img.width,img.height));
  const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
  const can=document.createElement('canvas');can.width=w;can.height=h;
  can.getContext('2d').drawImage(img,0,0,w,h);
  const output=can.toDataURL('image/webp',.84);
  if(!validDataImage(output)){alert('Image too large after conversion. Use a simpler PNG/WebP image.');return;}
  pendingImageData=output;showPhotoPreview(output);
 }
 const iconSource=sat=>sat.imageData||(sat.norad==='58016'?'./assets/theos2-map-marker.webp':sat.norad==='33396'?'./assets/theos1-map-marker.webp':'');
 function customImage(sat){
  const src=iconSource(sat);if(!src)return null;
  let image=customIconCache.get(src);
  if(!image){image=new Image();image.src=src;image.onload=()=>redrawMaps();image.onerror=()=>console.info('Satellite image failed to load');customIconCache.set(src,image);}
  return image.complete&&image.naturalWidth>0?image:null;
 }
 async function saveSat(e){
  e.preventDefault();const id=$('fleetId').value.trim(),n=digits($('fleetNorad').value);
  const prior=model.satellites.find(s=>s.id===id);
  const incoming=validSat({id:id||`sat-${n}`,name:$('fleetName').value,norad:n,color:$('fleetColor').value,active:$('fleetActive').checked,
   revisitDays:$('fleetRevisit').value,repeatCycleDays:$('fleetRepeatCycle').value,
   downlinkMHz:$('fleetDownlink').value,imageData:pendingImageData===null?(prior?.imageData||''):pendingImageData});
  if(!incoming){alert(t('กรุณากรอกชื่อและ NORAD ID 1-9 หลัก','Please supply a name and 1-9 digit NORAD ID'));return;}
  if(model.satellites.some(s=>s.norad===n&&s.id!==id)){alert('Duplicate NORAD catalog ID');return;}
  let manual=$('fleetElements').value.trim();
  if(manual){
   try{const elem=manual.startsWith('{')||manual.startsWith('[')?{omm:parseOMM(JSON.parse(manual),n).omm}:{text:parseTLE(manual,n).text};
    persist(`useful:planner:v27:element:${n}`,elem);model.elements.delete(n);
   }catch(err){alert('Invalid TLE/OMM: '+err.message);return;}
  }
  const at=model.satellites.findIndex(s=>s.id===id);
  if(at>=0){const old=model.satellites[at];if(old.norad!==n){model.elements.delete(old.norad);model.calculated.delete(old.norad)}model.satellites[at]=incoming;}
  else model.satellites.push(incoming);
  model.selected=incoming.id;saveSats();closeSatModal();renderSatellites();redrawMaps();window.dispatchEvent(new Event('useful-fleet-selection'));updateOrbit({force:false});
 }
 function removeSat(id){const sat=model.satellites.find(s=>s.id===id);if(!sat||!confirm(`Delete ${sat.name}?`))return;
  model.satellites=model.satellites.filter(s=>s.id!==id);model.elements.delete(sat.norad);model.calculated.delete(sat.norad);
  model.selected=model.satellites[0]?.id||'';saveSats();renderSatellites();updateOrbit();}
 function exportSatellites(){const blob=new Blob([JSON.stringify({version:1,satellites:model.satellites},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='satellites.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
 function exportTypes(){const blob=new Blob([JSON.stringify({version:1,types:model.types},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='site_types.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
 function addType(e){e.preventDefault();const name=$('newTypeName').value.trim(),color=$('newTypeColor').value;
  if(!name||model.types.some(t=>t.name.toLowerCase()===name.toLowerCase())){alert('Invalid or duplicate type');return;}
  const entry=validType({name,color});if(!entry)return;
  model.types.push(entry);saveTypes();renderTypes();$('newTypeName').value='';window.THEOS2Planner?.renderSiteVisuals?.();
 }
 function deleteType(name){if(name==='Other')return;
  const sites=window.THEOS2Planner?.getState?.().sites||[];
  const used=sites.filter(s=>s.type===name).length;
  if(!confirm(`Remove ${name}? ${used} site(s) will be assigned to Other.`))return;
  model.types=model.types.filter(c=>c.name!==name);
  saveTypes();renderTypes();window.THEOS2Planner?.reassignSiteType?.(name,'Other');
 }
 function onUI(){
  $('fleetAdd')?.addEventListener('click',()=>showSatModal());
  $('fleetRefresh')?.addEventListener('click',()=>updateOrbit({force:true}));
  $('fleetExport')?.addEventListener('click',exportSatellites);
  $('fleetShowTrack')?.addEventListener('change',e=>{model.showTracks=e.target.checked;persist(KEY_OPTIONS,{showTracks:model.showTracks,selected:model.selected});redrawMaps();updateOrbit()});
  $('fleetSelected')?.addEventListener('change',e=>{model.selected=e.target.value;persist(KEY_OPTIONS,{showTracks:model.showTracks,selected:model.selected});renderSatellites();window.dispatchEvent(new Event('useful-fleet-selection'));});
  $('tleSatellite')?.addEventListener('change',e=>{model.selected=e.target.value;persist(KEY_OPTIONS,{showTracks:model.showTracks,selected:model.selected});renderSatellites();window.dispatchEvent(new Event('useful-fleet-selection'));});
  $('fleetRows')?.addEventListener('click',e=>{const edit=e.target.closest('[data-fleetedit]'),del=e.target.closest('[data-fleetdelete]');if(edit)showSatModal(edit.dataset.fleetedit);if(del)removeSat(del.dataset.fleetdelete);});
  $('fleetRows')?.addEventListener('change',e=>{const check=e.target.closest('[data-fleetactive]');if(!check)return;
   const sat=model.satellites.find(s=>s.id===check.dataset.fleetactive);if(!sat)return;
   sat.active=check.checked;saveSats();if(!sat.active)model.calculated.delete(sat.norad);
   renderSatellites();updateOrbit();});
  $('fleetForm')?.addEventListener('submit',saveSat);
  $('fleetModalClose')?.addEventListener('click',closeSatModal);
  $('fleetCancel')?.addEventListener('click',closeSatModal);
  $('fleetModal')?.addEventListener('click',e=>{if(e.target.id==='fleetModal')closeSatModal();});
  $('fleetPhoto')?.addEventListener('change',async e=>{try{await handlePhotoFile(e.target.files?.[0]);}catch(err){alert('Image conversion failed: '+err.message)}});
  $('fleetPhotoRemove')?.addEventListener('click',()=>{pendingImageData='';$('fleetPhoto').value='';showPhotoPreview('');});
  $('typeAddForm')?.addEventListener('submit',addType);
  $('typeExport')?.addEventListener('click',exportTypes);
  $('siteTypeRows')?.addEventListener('change',e=>{const c=e.target.closest('[data-typecolor]');if(!c)return;
   const tpe=model.types.find(a=>a.name===c.dataset.typecolor);if(!tpe)return;
   tpe.color=c.value;saveTypes();renderTypes();window.THEOS2Planner?.renderSiteVisuals?.();});
  $('siteTypeRows')?.addEventListener('click',e=>{const b=e.target.closest('[data-deltype]');if(b)deleteType(b.dataset.deltype);});
   window.addEventListener('useful-manual-theos2-tle',event=>{
     const text=event.detail?.text;
     if(!text)return;
     try{const parsed=parseTLE(text,'58016');
       persist('useful:planner:v27:element:58016',{text:parsed.text});
       model.elements.delete('58016');updateOrbit();
     }catch(err){console.warn('Manual TLE not shared with map:',err.message);}
   });
  window.addEventListener('planner-language-changed',()=>{renderTypes();renderSatellites();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSatModal()});
 }
 async function loadInit(){
  const localTypes=storage(KEY_T)?.types;
  let baseTypes=DEFAULT_TYPES;
  try{const r=await fetch('./data/site_types.json',{cache:'no-store'});if(r.ok){const dat=await r.json();if(Array.isArray(dat.types))baseTypes=dat.types}}catch{}
  model.types=unique((Array.isArray(localTypes)&&localTypes.length?localTypes:baseTypes).map(validType).filter(Boolean),x=>x.name.toLowerCase());
  if(!model.types.some(x=>x.name==='Other'))model.types.push({...DEFAULT_TYPES.at(-1)});
  const localSats=storage(KEY_S)?.satellites;
  let shared=DEFAULT_SAT;
  try{const r=await fetch('./satellites.json',{cache:'no-store'});if(r.ok){const dat=await r.json();if(Array.isArray(dat.satellites))shared=dat.satellites}}catch{}
  model.satellites=unique((Array.isArray(localSats)?localSats:shared).map(validSat).filter(Boolean),s=>s.norad);
  if(!model.satellites.length)model.satellites=DEFAULT_SAT.map(s=>({...s}));
  const opts=storage(KEY_OPTIONS)||{};model.showTracks=opts.showTracks!==false;
  model.selected=model.satellites.find(s=>s.id===opts.selected)?.id||model.satellites[0].id;
  if($('fleetShowTrack'))$('fleetShowTrack').checked=model.showTracks;
  onUI();renderTypes();renderSatellites();model.initialized=true;
  await updateOrbit();
  setInterval(()=>{if(!document.hidden&&model.initialized&&Date.now()-model.lastTick>60000)updateOrbit();},60000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadInit,{once:true});else loadInit();
 window.UsefulFleet={getSatellites,getTypes,typeColor,selectedSatellite,getSelectedElements,updateOrbit,iconSource,
  drawTrack2D,drawMarkers2D,drawTrack3D,drawMarkers3D,renderTypes,renderSatellites,
  showSatModal,getState:()=>({satellites:getSatellites(),types:getTypes(),selected:model.selected,showTracks:model.showTracks,positions:[...model.calculated.values()]})};
})();
