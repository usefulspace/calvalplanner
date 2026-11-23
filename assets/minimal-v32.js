/* USEFUL v3.2: lightweight ONE-PAGE workflow. Engine remains in app.js. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const en=()=>window.PlannerI18N?.current?.()==='en';
 const tr=(th,english)=>en()?english:th;
 function status(msg,level=''){
  const x=$('uxJobState');if(x){x.textContent=msg;x.dataset.level=level;}
 }
 function localize(){
  const language=en()?'en':'th';
  document.querySelectorAll('[data-v3-en][data-v3-th]').forEach(el=>{
   el.textContent=el.getAttribute('data-v3-'+language);
  });
  const sub=document.querySelector('#overview .hero-header p');
  if(sub)sub.textContent=tr('ข้อมูลโอกาสผ่านเหนือพื้นที่ Cal/Val | เวลา UTC','Cal/Val acquisition opportunities | UTC');
  const title=document.querySelector('#results .panel-head h2');
  if(title)title.textContent=tr('สรุปโอกาสถ่ายภาพ','Acquisition Summary');
 }
 function scrollToSection(id){
  const target=$(id);
  target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  if(id==='mapping')requestAnimationFrame(()=>{
   dispatchEvent(new Event('resize'));window.THEOS2Planner?.redrawMaps?.();
  });
  if(id==='calendar'){
   window.THEOS2Planner?.calculateCalendarScope?.();
  }
 }
 async function calculate(){
  const engine=window.THEOS2Planner;
  const go=$('uxCompute'),exportBtn=$('uxExport');
  if(!engine?.ensureTLEForSites){status(tr('ระบบคำนวณยังไม่พร้อม','Planner engine not ready'),'error');return;}
  if(go.disabled)return;
  const value=$('filterSite')?.value||'all';
  const active=engine.getVisibleSites().filter(s=>s.active!==false&&s.lat!==null&&s.lon!==null&&Number.isFinite(Number(s.lat))&&Number.isFinite(Number(s.lon)));
  const sites=value==='all'?active:active.filter(s=>s.id===value);
  if(!sites.length){status(tr('ไม่มีพื้นที่ Active ที่มีพิกัดครบ','No active sites with valid coordinates'),'error');return;}
  const days=engine.selectedHorizonDays();go.disabled=true;exportBtn.disabled=true;
  status(tr('กำลังคำนวณ '+sites.length+' พื้นที่...','Calculating '+sites.length+' site(s)...'));
  try{
   await engine.ensureTLEForSites(sites,{horizonDays:days});
   engine.renderCompactResults();engine.renderCalendar();engine.renderDaily();
   const count=engine.getCompactRows(days,sites).filter(r=>($('resultsMethod')?.value||'all')==='all'||r.method===$('resultsMethod').value).length;
   status(tr('ประเมินแล้ว '+count+' โอกาสผ่าน | UTC','Calculated '+count+' opportunities | UTC'),'good');
  }catch(error){status(tr('ไม่สามารถคำนวณได้: ','Unable to calculate: ')+(error?.message||String(error)),'error');}
  finally{go.disabled=false;exportBtn.disabled=false;}
 }
 function onFilter(){
  const engine=window.THEOS2Planner;
  engine?.renderCompactResults?.();engine?.renderCalendar?.();engine?.renderDaily?.();
  status(tr('ปรับตัวกรองแล้ว | กดคำนวณหากต้องการอัปเดตวงโคจร','Filter changed | Calculate to update orbit estimates'));
 }
 function initialize(){
  document.querySelectorAll('[data-ux-pane]').forEach(x=>x.hidden=false);
  document.body.dataset.uxView='single';
  localize();
  document.querySelectorAll('[data-v32-anchor]').forEach(link=>link.addEventListener('click',e=>{
   e.preventDefault();scrollToSection(link.dataset.v32Anchor);
  }));
  $('uxSettings')?.addEventListener('click',()=>window.USEFULSettings?.open('sites'));
  $('uxCompute')?.addEventListener('click',calculate);
  $('uxExport')?.addEventListener('click',()=>{
   const days=window.THEOS2Planner?.selectedHorizonDays?.()||30;
   window.THEOS2Planner?.exportHorizon?.(days);
  });
  ['resultsRange','tleMaxOff','filterSite','resultsMethod','passDirection'].forEach(id=>$(id)?.addEventListener('change',onFilter));
  $('fleetSelected')?.addEventListener('change',onFilter);
  $('sitesTable')?.addEventListener('click',event=>{if(event.target.closest('button[data-selectsite]'))setTimeout(()=>scrollToSection('mapping'),10);});
  window.addEventListener('planner-language-changed',()=>{localize();});
  // Keep legacy user selection when still valid, otherwise SKP first.
  const site=$('filterSite');
  let restored=false;
  const restore=()=>{
   if(restored||!site||site.options.length<2)return;
   const ids=[...site.options].map(x=>x.value);
   let v='';try{v=localStorage.getItem('useful:v3:last-site')||'';}catch(e){}
   v=ids.includes(v)&&v!=='default5'?v:(ids.includes('skp-sriracha')?'skp-sriracha':'all');
   restored=true;if(v!==site.value){site.value=v;site.dispatchEvent(new Event('change',{bubbles:true}));}
  };
  if(site){const observer=new MutationObserver(()=>{restore();if(restored)observer.disconnect();});observer.observe(site,{childList:true,subtree:true});restore();}
  site?.addEventListener('change',()=>{try{localStorage.setItem('useful:v3:last-site',site.value)}catch(e){}});
  status(tr('เลือกเงื่อนไข แล้วกดคำนวณ','Select filters, then Calculate'));
  window.USEFULV32={calculate,scrollToSection};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
