/* USEFUL v3.9 — Quick Planner and accessible panel collapsing. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function parseCoords(source){
 const input=String(source||'').trim();
 if(!input)throw Error('Paste Latitude, Longitude or a Google Maps URL.');
 if(/maps\.app\.goo\.gl\/|goo\.gl\/maps\//i.test(input))
   throw Error('Short Google Maps links need to be opened first. Copy the full coordinates or long URL.');
 let matches=null;
 // Long Google Maps link formats and ordinary coordinate pairs.
 const enc=(()=>{try{return decodeURIComponent(input)}catch(_){return input}})();
 const n='([+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+))';
 const patterns=[
   /!3d([+-]?\d+(?:\.\d+)?)!4d([+-]?\d+(?:\.\d+)?)/i,
   /@([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)/i,
   /(?:[?&](?:q|query|ll|center)=)([+-]?\d+(?:\.\d+)?)[,%20\s]+([+-]?\d+(?:\.\d+)?)/i,
   /^\s*([+-]?\d+(?:\.\d+)?)\s*[,;\s]+\s*([+-]?\d+(?:\.\d+)?)\s*$/
 ];
 for(const re of patterns){const m=enc.match(re);if(m){matches=m;break;}}
 if(!matches){ // Google sometimes copies 'Latitude:..., Longitude:...'
   matches=enc.match(/lat(?:itude)?\s*[:=]\s*([+-]?\d+(?:\.\d+)?)[,;\s]+lon(?:gitude)?\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);
 }
 if(!matches)throw Error('Coordinates not detected. Example: 13.101936, 100.929423');
 const lat=Number(matches[1]),lon=Number(matches[2]);
 if(!Number.isFinite(lat)||lat< -90||lat>90||!Number.isFinite(lon)||lon< -180||lon>180)
   throw Error('Latitude must be −90…90 and Longitude must be −180…180.');
 return {lat,lon};
}
function init(){
 const input=$('quickCoords'),go=$('quickPredict'),save=$('quickSave'),msg=$('quickPlannerStatus');
 if(!input||!go||!save)return;
 const say=(value,isError=false)=>{if(msg){msg.textContent=value;msg.dataset.level=isError?'error':'info';}};
 function parse(){return parseCoords(input.value);}
 const predict=async()=>{
   try{
     const coord=parse(),engine=window.THEOS2Planner;
     if(!engine?.previewQuickSite)throw Error('The planner is still loading.');
     engine.previewQuickSite(coord.lat,coord.lon);
     say(`Temporary target: ${coord.lat.toFixed(6)}°, ${coord.lon.toFixed(6)}° · calculating UTC opportunities…`);
     const calendar=$('calendarSiteScope'); // The calendar retains All Active by default.
     if(calendar && !calendar.value)calendar.value='all';
     if(window.USEFULV32?.calculate)await window.USEFULV32.calculate();
     say(`Temporary target ready: ${coord.lat.toFixed(6)}°, ${coord.lon.toFixed(6)}°. Results depend on current TLE/OMM; not saved.`);
   }catch(e){say(e.message||String(e),true);}
 };
 go.addEventListener('click',predict);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();predict();}});
 save.addEventListener('click',()=>{try{const c=parse();window.THEOS2Planner?.openNewSiteAt?.(c.lat,c.lon);say('Name and save the site in the dialog to keep it in this browser.');}catch(e){say(e.message||String(e),true);}});
 window.USEFULQuickPlanner={parseCoords};
 // Panels start expanded. Only user-chosen closed panels are remembered.
 const ids=[['#mapping .map-panel','map'],['#mapping .focus-panel','site'],['#calendar','calendar'],
            ['#planningDetails .details-panel','daily'],['#planningDetails .guidance-panel','guide'],['#results','results']];
 let saved={};try{saved=JSON.parse(localStorage.getItem('useful:v39:collapsed')||'{}')||{}}catch(_){saved={}};
 function persist(){try{localStorage.setItem('useful:v39:collapsed',JSON.stringify(saved))}catch(_){}}
 ids.forEach(([query,key])=>{
   const panel=document.querySelector(query),head=panel?.querySelector(':scope > .panel-head');
   if(!panel||!head)return;
   const button=document.createElement('button');button.type='button';button.className='v39-collapse-btn';
   button.setAttribute('aria-label',`Collapse or expand ${key}`);button.title='Collapse / Expand';
   // Inject beside any existing header action, without replacing the original controls.
   head.appendChild(button);
   const set=collapsed=>{
     panel.classList.toggle('v39-is-collapsed',Boolean(collapsed));
     button.textContent=collapsed?'＋':'−';button.setAttribute('aria-expanded',String(!collapsed));
     button.title=collapsed?'Expand':'Collapse';
     if(!collapsed && (key==='map'||key==='site')){
       requestAnimationFrame(()=>{window.dispatchEvent(new Event('resize'));window.THEOS2Planner?.redrawMaps?.();});
     }
   };
   set(saved[key]===true);
   button.addEventListener('click',()=>{const next=!panel.classList.contains('v39-is-collapsed');saved[key]=next;set(next);persist();});
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
