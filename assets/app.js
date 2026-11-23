/* USEFUL Acquisition Planner v3.9 — static GitHub Pages application.
   UTC planning with optional SGP4 candidates; never confirmed tasking. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  function directionScope(){return $('passDirection')?.value||'all';}
  function selectedHorizonDays(){
    const v=$('resultsRange')?.value||'30';
    if(v==='3m'){
      const today=new Date();
      const dayStart=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()));
      const target=new Date(dayStart);
      const originalDay=target.getUTCDate();
      target.setUTCDate(1);
      target.setUTCMonth(target.getUTCMonth()+3);
      const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
      target.setUTCDate(Math.min(originalDay,last));
      return Math.round((target-dayStart)/86400000);
    }
    return Math.max(1,Math.min(365,Number(v)||30));
  }

  // Bundled Natural Earth world texture: portable even if earth-map.jpg was not uploaded.
  const EMBEDDED_EARTH_MAP = "data:image/webp;base64,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";
  const STORAGE = { sites: 'theos2:planner:v2:sites', events: 'theos2:planner:v2:events', view: 'theos2:planner:v2:view', offset:'theos2:planner:v23:excelOffset', tle:'theos2:planner:v23:autoTLE' };
  const isEnglish=()=>window.PlannerI18N?.current()==='en';
  const DEFAULT_SITES = [
    {id:'skp-sriracha',name:'SKP Site',lat:13.101936678812182,lon:100.92942261357479,country:'Thailand',type:'Radiometric',active:true,defaultOrder:1,notes:'GISTDA SKP Sriracha · user-provided WGS84 coordinate'},
    {id:'tuz-golu',name:'Tuz_Golu',lat:38.83,lon:33.33,country:'Türkiye',type:'Radiometric',active:true,defaultOrder:2,notes:'USGS ECCOE reference center'},
    {id:'uyuni',name:'Uyuni_Salt_Flats',lat:-20.38,lon:-66.95,country:'Bolivia',type:'Radiometric',active:true,defaultOrder:3,notes:'USGS ECCOE reference center'},
    {id:'white-sands',name:'White_Sands',lat:32.92,lon:-106.35,country:'United States',type:'Radiometric',active:true,defaultOrder:4,notes:'USGS ECCOE reference center'},
    {id:'yemen-desert',name:'Yemen_Desert',lat:16.87,lon:47.55,country:'Yemen',type:'Radiometric',active:true,defaultOrder:5,notes:'USGS ECCOE reference center'}
  ];
  // These are clearly labeled DISPLAY EXAMPLES from the original public page (Nov–Dec 2026),
  // never operationally confirmed. They disappear once actual Excel data are loaded.
  const DEMO = [
    ['tuz-golu','Tuz_Golu','2026-11-21','15:31',7.65,'#361',37],
    ['tuz-golu','Tuz_Golu','2026-11-26','15:27',0.86,'#360',57],
    ['tuz-golu','Tuz_Golu','2026-12-01','15:24',6.16,'#359',86],
    ['uyuni','Uyuni_Salt_Flats','2026-11-24','21:35',9.63,'#69',49],
    ['uyuni','Uyuni_Salt_Flats','2026-11-29','21:31',1.31,'#68',38],
    ['white-sands','White_Sands','2026-11-20','00:42',4.51,'#122',15],
    ['white-sands','White_Sands','2026-11-25','00:39',11.69,'#121',54],
    ['yemen-desert','Yemen_Desert','2026-11-22','14:18',10.02,'#340',0],
    ['yemen-desert','Yemen_Desert','2026-11-27','14:15',1.63,'#339',0],
    ['yemen-desert','Yemen_Desert','2026-12-02','14:11',7.03,'#338',1]
  ].map((r,i) => ({id:'demo-'+i,siteId:r[0],siteName:r[1],file:'Example (from original page)',date:r[2],time:'',legacyLocalTime:r[3],timeBasis:'LEGACY_UNVERIFIED',off:r[4],orbit:r[5],fileCloud:r[6],source:'demo',origin:'example'}));
  const state = {
    sites:[], opportunities:[], selectedSiteId:null, selectedDate:null,
    month: null, mapMode:'2d', map:null, globe:null, globeReady:false,
    pickMode:true, angleFilter:'all', siteFilter:'all', calendarScope:'all', cycle:true, visibleSiteTypes:null,
    threshold:10, sharedSites:DEFAULT_SITES, registryFilter:'all', registryQuery:'', sidebarQuery:'', sidebarStatus:'all', weather:new Map(), weatherLoading:null,
    importStatus:'', toastTimers:[], moonMethod: 'astronomical',
    tle:{enabled:false,loading:false,events:[],data:null,status:'off',job:0,maxOff:15,results:new Map(),batchJob:0,exportBusy:false,lastError:''},excelOffset:7
  };
  const MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const WEEKDAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสฯ','ศุกร์','เสาร์'];
  const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WEEKDAYS_EN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const moonNames = ['เดือนดับ','ข้างขึ้นเสี้ยว','ขึ้นครึ่งดวง','ข้างขึ้นเกือบเต็ม','วันเพ็ญ','ข้างแรมเกือบเต็ม','แรมครึ่งดวง','ข้างแรมเสี้ยว'];
  const moonIcons = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const pad2 = n => String(n).padStart(2,'0');
  const keyUTC = (y,m,d) => `${y}-${pad2(m)}-${pad2(d)}`;
  const parseDate = key => { const [y,m,d]=String(key).split('-').map(Number); return {y,m,d}; };
  const isoDate = d => keyUTC(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate());
  const todayKey = () => new Date().toISOString().slice(0,10); // Calendar reference is UTC.
  const shortDate = key => { const d=parseDate(key); return `${d.d} ${(isEnglish()?MONTHS_EN:MONTHS)[d.m-1]} ${d.y} UTC`; };
  function utcFromOffset(date,time,hours){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return null;
    const [y,mo,day]=date.split('-').map(Number),[h,m]=time.split(':').map(Number);
    if(h>23||m>59||mo<1||mo>12||day<1||day>31)return null;
    const dateObj=new Date(Date.UTC(y,mo-1,day,h,m)-hours*3600000);
    // Protect against malformed calendar dates (Date.UTC normalizes 2026-02-30).
    const verify=new Date(Date.UTC(y,mo-1,day,h,m));
    if(verify.getUTCFullYear()!==y||verify.getUTCMonth()!==mo-1||verify.getUTCDate()!==day)return null;
    return Number.isFinite(dateObj.getTime())?dateObj.toISOString():null;
  }
  const fromISO=iso=>({date:iso.slice(0,10),time:iso.slice(11,16),utcISO:iso,timeBasis:'UTC'});
  const formatLat = v => `${Math.abs(v).toFixed(4)}°${v<0?'S':'N'}`;
  const formatLon = v => `${Math.abs(v).toFixed(4)}°${v<0?'W':'E'}`;
  const nameKey = s => String(s||'').toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g,'');
  const esc = s => String(s == null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => Number.isFinite(Number(v)) ? Number(v) : null;
  const hexAlpha=(hex,alpha)=>{const h=/^#[0-9a-f]{6}$/i.test(hex)?hex:'#46dfcf';return `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${alpha})`};
  const storageGet = key => {try{return JSON.parse(localStorage.getItem(key));}catch(e){return null}};
  const storageSet = (key,val) => {try{localStorage.setItem(key,JSON.stringify(val));return true;}catch(e){toast('พื้นที่จัดเก็บของเบราว์เซอร์ไม่พอ กรุณา Export JSON ก่อน','warn');return false}};
  const makeId = () => window.crypto && crypto.randomUUID ? crypto.randomUUID() : 'id-'+Date.now()+'-'+Math.floor(Math.random()*1e6);
  const siteForId = id => state.sites.find(s=>s.id===id);
  const hasCoords = site => Boolean(site && Number.isFinite(site.lat) && Number.isFinite(site.lon));
  const isSiteActive = site => Boolean(site && site.active !== false);
  // A shared category selection drives map, calendar, daily details, results and exports.
  const siteTypeName=site=>String(site?.type||'Other');
  const typeIsVisible=site=>Boolean(site?.quickPreview)||state.visibleSiteTypes===null||state.visibleSiteTypes.has(siteTypeName(site));
  const plannableSites=()=>state.sites.filter(site=>isSiteActive(site)&&hasCoords(site)&&typeIsVisible(site));
  const mapVisibleSites=plannableSites;
  const typeLabel=type=>({'Radiometric':'Rad','Geometric':'Geo','Spatial / MTF':'Spatial','Atmospheric':'Atmo','DSNU / Dark':'DSNU','Other':'Other'})[type]||String(type||'Other').slice(0,10);
  function siteTypeList(){
    const defs=window.UsefulFleet?.getTypes?.()||[];
    const seen=new Set(),all=[];
    for(const item of defs){if(!seen.has(item.name)){seen.add(item.name);all.push({name:item.name,color:item.color});}}
    for(const site of state.sites){const name=siteTypeName(site);if(!seen.has(name)){seen.add(name);all.push({name,color:window.UsefulFleet?.typeColor(name)||'#8bb2c4'});}}
    return all;
  }
  function renderSiteTypeFilters(){
    const target=$('siteTypeFilters');if(!target)return;
    const definitions=siteTypeList();
    target.innerHTML=definitions.map(type=>`<label class="cal-type-option" style="--site-color:${esc(type.color)}"><input type="checkbox" data-site-type="${esc(type.name)}" ${state.visibleSiteTypes===null||state.visibleSiteTypes.has(type.name)?'checked':''}><i class="cal-type-dot"></i>${esc(type.name)}</label>`).join('');
    const text=$('typeFilterCount');if(text){const selected=definitions.filter(type=>state.visibleSiteTypes===null||state.visibleSiteTypes.has(type.name));text.textContent=`${selected.length}/${definitions.length} ${isEnglish()?'types':'ประเภท'} · ${plannableSites().length} ${isEnglish()?'sites':'พื้นที่'}`;}
  }

  const selectedSite = () => siteForId(state.selectedSiteId) || plannableSites()[0] || state.sites[0] || null;
  const siteForEvent = e => siteForId(e.siteId) || state.sites.find(s=>nameKey(s.name)===nameKey(e.siteName||e.file));
  const viewKey = key => `${parseDate(key).y}-${pad2(parseDate(key).m)}`;
  const eventIsObserved = e => e.source!=='cycle' && e.source!=='demo';
  const isDemoOnly = () => state.opportunities.length > 0 && state.opportunities.every(e=>e.source==='demo');

  function toast(message, level='info') {
    const node=document.createElement('div');node.className='toast'+(level==='info'?'':' '+level);node.textContent=message;
    $('toastRegion').appendChild(node);const t=setTimeout(()=>node.remove(),4800);state.toastTimers.push(t);
    if($('toastRegion').children.length>4) $('toastRegion').firstElementChild.remove();
  }
  function saveSites(){storageSet(STORAGE.sites,{version:2,datasetVersion:'T2V-2026-11-21-v2.9',sites:state.sites.filter(s=>!s.quickPreview)});}
  function saveEvents(){
    // Never store data auto-loaded from the repository; re-load it from GitHub on each visit.
    const records=state.opportunities.filter(e=>e.source==='manual'||(e.source==='excel'&&e.origin==='browser'));
    storageSet(STORAGE.events,{version:1,events:records.slice(-5000)});
  }
  function downloadFile(name,contents,mime='application/json') {
    const blob = contents instanceof Blob ? contents : new Blob([contents],{type:mime+';charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),30000);
  }
  function validateSite(r) {
    if(!r || typeof r.name!=='string' || !r.name.trim()) return null;
    // The inventory may contain a site with genuinely missing coordinates. Preserve it
    // in the registry, but never plot or propagate it as if it were at (0, 0).
    const missingLat=r.lat==null || String(r.lat).trim()==='';
    const missingLon=r.lon==null || String(r.lon).trim()==='';
    if(missingLat!==missingLon)return null;
    const lat=missingLat?null:Number(r.lat),lon=missingLon?null:Number(r.lon);
    if(!missingLat&&(!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat > 90||lon < -180||lon > 180))return null;
    const active=typeof r.active==='boolean'?r.active:!missingLat;
    return {id:String(r.id||makeId()),name:r.name.trim().slice(0,90),lat,lon,country:String(r.country||'').slice(0,80),
      type:String(r.type||'Other').slice(0,40),notes:String(r.notes||'').slice(0,400),active,
      sourceValidate:typeof r.sourceValidate==='boolean'?r.sourceValidate:null,
      sourceSheet:String(r.sourceSheet||'').slice(0,80),sourceRow:Number(r.sourceRow)||null,sourceNo:Number(r.sourceNo)||null,
      sourceCoordinates:String(r.sourceCoordinates||'').slice(0,120),sourcePurpose:String(r.sourcePurpose||'').slice(0,60),
      sourceStatusReview:String(r.sourceStatusReview||'').slice(0,200),defaultOrder:Math.max(0,Math.min(5,Number(r.defaultOrder)||0)),
      referenceUrl:String(r.referenceUrl||'').slice(0,300),network:String(r.network||'').slice(0,60)};
  }
  function validateEvent(e) {
    if(!e || !/^\d{4}-\d{2}-\d{2}$/.test(e.date||''))return null;
    if(!e.siteId&&!e.siteName&&!e.file) return null;
    const off=e.off==null||e.off===''?null:Number(e.off);
    if(off!=null&&(!Number.isFinite(off)||off<0||off>90))return null;
    const source=['manual','excel'].includes(e.source)?e.source:'manual';
    let utcISO=null;
    if(e.timeBasis==='UTC' && e.utcISO){
      try{utcISO=window.UsefulIntegrity.utcEpoch(String(e.utcISO).replace(/Z$/i,'Z'));}catch{}
    }
    const provenance=window.UsefulIntegrity.sourceSatellite(e.satelliteName||e.satellite||e.satelliteNorad||'',e.file||'');
    // Previous versions saved Local Time without the source zone. Preserve, but do not relabel as UTC.
    return {id:String(e.id||makeId()),siteId:String(e.siteId||''),siteName:String(e.siteName||''),file:String(e.file||''),
      date:utcISO?utcISO.slice(0,10):e.date,time:utcISO?utcISO.slice(11,16):'',
      originalLocalTime:utcISO?'':String(e.originalLocalTime||e.legacyLocalTime||e.time||''),
      utcISO:utcISO||'',timeBasis:utcISO?'UTC':'LEGACY_UNVERIFIED',sourceOffsetHours:e.sourceOffsetHours??null,
      off,orbit:String(e.orbit||''),notes:String(e.notes||''),fileCloud:e.fileCloud==null?null:Number(e.fileCloud),source,origin:'browser',
      satelliteName:provenance.name,satelliteNorad:provenance.norad};
  }
  function mergeSharedWithLocal(shared,existing){
    // v2.4 kept a 4-site local snapshot. Include the newly shipped catalog without
    // losing the user's old edits or manually created sites. Match by id OR name.
    const used=new Set(), byId=new Map(existing.map(x=>[x.id,x]));
    const byName=new Map(existing.map(x=>[nameKey(x.name),x]));
    const updated=shared.map(base=>{
      const prev=byId.get(base.id)||byName.get(nameKey(base.name))||(base.id==='skp-sriracha'?existing.find(x=>hasCoords(x)&&Math.abs(x.lat-base.lat)<0.0001&&Math.abs(x.lon-base.lon)<0.0001&&/skp|sriracha/i.test(x.name)):null);
      if(!prev)return {...base};
      used.add(prev.id);
      const preserved={...base,...prev,id:base.id,active:typeof prev.active==='boolean'?prev.active:base.active};
      // Keep audited provenance even if the previous browser version had none.
      for(const k of ['sourceValidate','sourceSheet','sourceRow','sourceNo','sourceCoordinates','sourcePurpose','sourceStatusReview','referenceUrl','network'])
        if(base[k]!==undefined)preserved[k]=base[k];
      return preserved;
    });
    const seen=new Set(updated.map(x=>nameKey(x.name)));
    existing.forEach(s=>{if(!used.has(s.id)&&!seen.has(nameKey(s.name))){updated.push(s);seen.add(nameKey(s.name));}});
    return updated;
  }
  // Keep the original four program sites plus SKP as five pinned defaults without
  // overwriting user-edited coordinates/status or duplicating T2V catalog entries.
  function pinFiveDefaults(input){
    const sites=input.map(x=>({...x,defaultOrder:0}));
    for(const base of DEFAULT_SITES){
      const idx=sites.findIndex(x=>x.id===base.id || nameKey(x.name)===nameKey(base.name) ||
        (base.id==='skp-sriracha'&&hasCoords(x)&&Math.abs(x.lat-base.lat)<0.0001&&Math.abs(x.lon-base.lon)<0.0001));
      if(idx<0){sites.push({...base});continue;}
      sites[idx].defaultOrder=base.defaultOrder;
      if(base.id==='skp-sriracha'&&sites[idx].id!=='skp-sriracha')sites[idx].isSKPSite=true;
    }
    return sites.sort((a,b)=>(a.defaultOrder||999)-(b.defaultOrder||999)||a.name.localeCompare(b.name));
  }
  async function loadSharedSites(force=false){
    // The T2V dataset is separate from sites.json. Updating GitHub Pages therefore
    // does NOT overwrite a repository's existing shared/custom site registry.
    let catalog=null,shared=null;
    for(const [url,save] of [['./data/T2V_2026_sites.json',x=>{catalog=x}],['./sites.json',x=>{shared=x}]]){
      try{const r=await fetch(url,{cache:'no-store'});if(r.ok){const dat=await r.json();const valid=(dat.sites||[]).map(validateSite).filter(Boolean);if(valid.length)save(valid)}}catch(e){ /* offline fallback */ }
    }
    const embedded=(window.USEFUL_CALVAL_DEFAULTS?.sites||[]).map(validateSite).filter(Boolean);
    const registry=catalog?.length ? catalog : embedded;
    state.sharedSites=pinFiveDefaults(registry.length ? (shared?mergeSharedWithLocal(registry,shared):registry) : (shared||DEFAULT_SITES));
    const local=storageGet(STORAGE.sites);
    const locSites=local&&Array.isArray(local.sites)?local.sites.map(validateSite).filter(Boolean):null;
    state.sites=pinFiveDefaults((!force&&locSites)?mergeSharedWithLocal(state.sharedSites,locSites):state.sharedSites.map(s=>({...s})));
    if(force||locSites)saveSites();
    if(!siteForId(state.selectedSiteId))state.selectedSiteId=state.sites.find(s=>s.id==='skp-sriracha'&&isSiteActive(s))?.id||plannableSites()[0]?.id||state.sites[0]?.id||null;
  }
  function loadLocalEvents(){
    const local=storageGet(STORAGE.events);
    if(local&&Array.isArray(local.events))state.opportunities=local.events.map(validateEvent).filter(Boolean);
    else state.opportunities=[];
    // No unverified demo events in operational default view.
  }
  function refreshDemoState(){
    if(state.opportunities.some(e=>e.source==='excel'||e.source==='manual'))state.opportunities=state.opportunities.filter(e=>e.source!=='demo');
  }
  function setSite(id, {filter=false,center=false,fetchCloud=true}={}){
    if(!siteForId(id))return;
    state.selectedSiteId=id;
    if(!isSiteActive(siteForId(id))||!hasCoords(siteForId(id))){state.tle.events=[];state.siteFilter='all';}
    if(filter){state.siteFilter=id;$('filterSite').value=id}
    renderSidebar();renderFocus();renderSiteTable();update2DMarkers();update3DMarkers();
    if(center)centerSite();
    if(fetchCloud)updateWeather(false);
    if(state.tle.enabled&&state.tle.data)computeTLECandidates();
    renderCalendar();renderDaily();renderStats();renderCompactResults();renderSolarContext();
  }
  function buildSiteOptions(){
    const previous=state.siteFilter;
    $('filterSite').innerHTML='<option value="all">★ All Active Sites / ทุกพื้นที่</option>'+plannableSites().map(s=>`<option value="${esc(s.id)}">${esc(s.name.replace(/_/g,' '))}</option>`).join('');
    if(previous!=='all'&&!plannableSites().find(s=>s.id===previous))state.siteFilter='all';
    $('filterSite').value=state.siteFilter;
    // Calendar scope is independent from the result-table site filter. The default
    // is All Active Sites, even when the main planner opens with SKP selected.
    const calScope=$('calendarSiteScope');
    if(calScope){
      const oldScope=state.calendarScope;
      calScope.innerHTML='<option value="all">★ All Active Sites / ทุกพื้นที่</option>'+
        plannableSites().map(s=>`<option value="${esc(s.id)}">${esc(s.name.replace(/_/g,' '))}</option>`).join('');
      if(oldScope!=='all' && !plannableSites().some(s=>s.id===oldScope))state.calendarScope='all';
      calScope.value=state.calendarScope;
    }
    $('eventSite').innerHTML=plannableSites().map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
    const preview=$('tlePreviewSiteFilter');if(preview){const old=preview.value;preview.innerHTML='<option value="all">All Sites / ทุกพื้นที่</option>'+plannableSites().map(s=>`<option value="${esc(s.id)}">${s.defaultOrder?'★ ':''}${esc(s.name)}</option>`).join('');preview.value=plannableSites().some(s=>s.id===old)?old:'all';}
  }
  function renderSidebar(){
    const total=state.sites.length, active=state.sites.filter(isSiteActive).length, inactive=total-active, mappable=plannableSites().length;
    $('sideSiteCount').textContent=total;
    $('quickSiteSummary').textContent=`${active} Active · ${inactive} Inactive · ${mappable} mapped`;
    const q=state.sidebarQuery.toLocaleLowerCase().trim();
    const results=state.sites.filter(site=>
      typeIsVisible(site) && (state.sidebarStatus==='all'||(state.sidebarStatus==='active'?isSiteActive(site):!isSiteActive(site))) &&
      (!q||[site.name,site.country,site.network,site.type].some(v=>String(v||'').toLocaleLowerCase().includes(q)))
    );
    const grouped=results.slice().sort((a,b)=>(a.defaultOrder||999)-(b.defaultOrder||999)||a.name.localeCompare(b.name));
    $('sidebarSites').innerHTML=grouped.map(site=>`<button type="button" class="sidebar-site ${site.id===state.selectedSiteId?'active':''} ${isSiteActive(site)?'':'inactive'}" data-site="${esc(site.id)}" ${hasCoords(site)?'':'disabled title="Add coordinates in the registry"'}><span class="site-dot"></span><span><b>${site.defaultOrder?`<span class="site-default-number">${site.defaultOrder}</span> `:''}${esc(site.name.replace(/_/g,' '))}</b><small>${esc(site.country||site.type)} · ${isSiteActive(site)?'Active':'Inactive'}${hasCoords(site)?'':' · No coordinates'}</small></span></button>`).join('')||'<p class="sidebar-loading">No matching sites</p>';
  }
  function renderSiteTable(){
    const q=state.registryQuery.toLocaleLowerCase().trim();
    const shown=state.sites.filter(site=>
      (state.registryFilter==='all'||(state.registryFilter==='active'?isSiteActive(site):state.registryFilter==='inactive'?!isSiteActive(site):!hasCoords(site))) &&
      (!q||[site.name,site.country,site.network,site.type].some(v=>String(v||'').toLocaleLowerCase().includes(q)))
    );
    $('siteListCount').textContent=`${shown.length} / ${state.sites.length} sites · ${plannableSites().length} active with coordinates`;
    $('sitesTable').innerHTML=shown.map(site=>{
      const cloudy=getCloudDay(site.id,todayKey());
      const cloudText=cloudy==null?'—':Math.round(cloudy)+'%';
      const coordsOK=hasCoords(site);
      const disabled="";
      return `<tr class="${isSiteActive(site)?'':'inactive-row'}"><td><div class="site-name-cell"><div class="site-avatar">⌖</div><div><strong>${esc(site.name.replace(/_/g,' '))}</strong><small>${esc(site.country||'—')}${site.network?' · '+esc(site.network):''}</small><button type="button" class="mobile-site-toggle ${isSiteActive(site)?'is-active':''}" role="switch" aria-checked="${isSiteActive(site)}" data-mobile-toggleactive="${esc(site.id)}" ${disabled}>${isSiteActive(site)?'● ACTIVE':'○ INACTIVE'}</button></div></div></td><td><span class="type-pill" style="border-color:${esc(window.UsefulFleet?.typeColor(site.type)||'#3b6573')};color:${esc(window.UsefulFleet?.typeColor(site.type)||'#b4dbd9')}">${esc(site.type)}</span></td><td class="mono">${coordsOK?site.lat.toFixed(5):'<span class="missing-coordinate">MISSING</span>'}</td><td class="mono">${coordsOK?site.lon.toFixed(5):'<span class="missing-coordinate">MISSING</span>'}</td><td class="mono">${cloudText}</td><td><label class="site-active-switch"><input type="checkbox" data-toggleactive="${esc(site.id)}" ${isSiteActive(site)?'checked':''} ${disabled} aria-label="Active: ${esc(site.name)}"><span class="site-switch-track"></span><span class="site-active-text">${isSiteActive(site)?'ACTIVE':'INACTIVE'}</span></label></td><td><div class="table-actions"><button class="icon-action" type="button" data-selectsite="${esc(site.id)}" ${coordsOK?'':'disabled'} title="Map">◎</button><button class="icon-action" type="button" data-editsite="${esc(site.id)}" title="Edit">✎</button><button class="icon-action delete" type="button" data-deletesite="${esc(site.id)}" title="Delete">✕</button></div></td></tr>`;
    }).join('')||'<tr><td colspan="7" style="text-align:center;padding:26px">No matching Cal/Val sites</td></tr>';
  }
  function renderFocus(){
    const s=selectedSite();
    $('focusName').textContent=s?s.name.replace(/_/g,' '):'ยังไม่มีพื้นที่';
    $('focusMeta').textContent=s?(s.type+' · '+(s.country||'ไม่ระบุประเทศ')+(s.network?' · '+s.network:'')):'กดเพิ่มพื้นที่เพื่อเริ่มต้น';
    $('focusLat').textContent=hasCoords(s)?formatLat(s.lat):'—';$('focusLon').textContent=hasCoords(s)?formatLon(s.lon):'—';
    $('focusEdit').disabled=!s;$('focusCenter').disabled=!hasCoords(s);
    const status=$('selectedSiteStatus');if(status){status.textContent=isSiteActive(s)?'● ACTIVE':'● INACTIVE';status.classList.toggle('inactive',!isSiteActive(s));}
    const forecast=s?state.weather.get(s.id):null;
    const todayForecast=s?getCloudDay(s.id,todayKey()):null;
    const badge=$('weatherBadge');
    if(forecast?.loading){badge.textContent='LOADING';badge.className='weather-badge';}
    else if(todayForecast==null){badge.textContent=forecast?.error?'UNAVAILABLE':'NO FORECAST';badge.className='weather-badge';}
    else{badge.textContent=todayForecast<=25?'LOW CLOUD':todayForecast<=65?'VARIABLE':'HIGH CLOUD';badge.className='weather-badge '+(todayForecast<=25?'low':todayForecast<=65?'med':'high');}
    $('focusCloudValue').textContent=todayForecast==null?'—':Math.round(todayForecast)+'%';
    $('focusCloudText').textContent=todayForecast==null?'ไม่มีข้อมูลสำหรับวันปัจจุบัน':todayForecast<=25?'ท้องฟ้ามีเมฆน้อย (model)':todayForecast<=65?'อาจมีเมฆบางส่วน':'เมฆค่อนข้างมาก (model)';
    $('cloudProgress').style.width=(todayForecast==null?0:todayForecast)+'%';
    $('cloudProgress').style.background=todayForecast==null?'#7595a6':todayForecast<=25?'#43dac9':todayForecast<=65?'#f4c477':'#f08a88';
    $('cloudStatus').textContent=forecast?.loading?'กำลังติดต่อ Open-Meteo...':forecast?.error?'เชื่อมต่อ Open-Meteo ไม่สำเร็จ · ตรวจอินเทอร์เน็ต แล้วลองอีกครั้ง':forecast?.days?.size?`อัปเดต ${new Date(forecast.fetchedAt).toLocaleString('th-TH')} · ${forecast.days.size} วัน · เวลาท้องถิ่น ${forecast.timezone||''}`:'ใช้ค่าพยากรณ์รายชั่วโมงจาก Open-Meteo (10:00–15:00 น. เวลาของพื้นที่)';
  }
  function renderStats(){
    const {y,m}=parseDate(state.month+'-01');
    const rows=state.opportunities.concat(state.tle.enabled?state.tle.events:[]).filter(e=>e.date.startsWith(state.month));
    const real=rows.filter(e=>e.source!=='demo'&&e.source!=='repeat26');
    $('kpiSites').textContent=state.sites.length;
    if($('kpiActiveSummary'))$('kpiActiveSummary').textContent=`${state.sites.filter(isSiteActive).length} Active · ${state.sites.filter(s=>!isSiteActive(s)).length} Inactive · ${state.sites.filter(s=>isSiteActive(s)&&!hasCoords(s)).length} need coordinates`;
    $('kpiPasses').textContent=real.length|| (isDemoOnly()?rows.length:0);
    $('kpiPassesNote').textContent=real.length?(state.tle.enabled&&state.tle.events.length?'Excel / Proposed / TLE16; repeat26 is a heuristic':'รายการจาก Excel / แผนที่เพิ่มเอง'):isDemoOnly()?'รายการสาธิต ไม่ใช่ข้อมูลที่ยืนยัน':'ยังไม่มีแผนถ่ายภาพในเดือนนี้';
    let dark=0,days=new Date(Date.UTC(y,m,0)).getUTCDate();
    for(let d=1;d<=days;d++){if(getMoon(keyUTC(y,m,d)).pct<=state.threshold)dark++;}
    $('kpiDsnu').textContent=dark;
    $('kpiDsnuLimit').textContent=state.threshold;
    const s=selectedSite();const c=s?getCloudDay(s.id,todayKey()):null;
    $('kpiCloud').textContent=c==null?'—':Math.round(c)+'%';
    $('kpiCloudNote').textContent=c==null?'พยากรณ์มีเฉพาะช่วง 16 วัน':'วันนี้ · '+(s?.name.replace(/_/g,' ')||'พื้นที่ที่เลือก');
  }
  function weatherKey(site){return `${site.id}:${site.lat.toFixed(4)}:${site.lon.toFixed(4)}`}
  function getCloudDay(siteId,date){
    const forecast=state.weather.get(siteId);return forecast?.days?.get(date)??null;
  }
  function getCloudHour(siteId,date,time){
    const forecast=state.weather.get(siteId);
    if(!forecast?.hours||!time||!/^\d{2}:\d{2}(?::\d{2})?$/.test(time))return getCloudDay(siteId,date);
    const d=new Date(date+'T'+(time.length===5?time+':00':time)+'Z');
    if(!Number.isFinite(d.getTime()))return getCloudDay(siteId,date);
    try{
      const ts=new Intl.DateTimeFormat('en-CA',{timeZone:forecast.timezone||'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(d);
      const obj=Object.fromEntries(ts.map(x=>[x.type,x.value]));
      const k=`${obj.year}-${obj.month}-${obj.day}T${obj.hour}`;
      return forecast.hours.get(k)??getCloudDay(siteId,obj.year+'-'+obj.month+'-'+obj.day);
    }catch{return getCloudDay(siteId,date);}
  }
  function getRadiationHour(siteId,date,time){
    const forecast=state.weather.get(siteId);
    if(!forecast?.radiationHours||!time)return null;
    const hhmmss=/^\d{2}:\d{2}(?::\d{2})?$/.test(time)?(time.length===5?time+':00':time):null;
    if(!hhmmss)return null;
    const d=new Date(date+'T'+hhmmss+'Z');
    if(!Number.isFinite(d.getTime()))return null;
    try{
      const parts=new Intl.DateTimeFormat('en-CA',{timeZone:forecast.timezone||'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(d);
      const o=Object.fromEntries(parts.map(p=>[p.type,p.value]));
      return forecast.radiationHours.get(`${o.year}-${o.month}-${o.day}T${o.hour}`)??null;
    }catch{return null;}
  }
  function renderSolarContext(){
    const el=$('solarContext');if(!el||!window.UsefulSolar)return;
    const site=selectedSite();if(!hasCoords(site)){el.textContent='Add coordinates to view solar geometry.';return;}
    const date=state.selectedDate||todayKey();
    // Reference solar noon, which is site-dependent; not a proposed satellite pass.
    const noon=new Date(Date.parse(date+'T12:00:00Z')-site.lon*240000);
    const sun=window.UsefulSolar.at(noon,site.lat,site.lon);
    // Compare solar geometry across seasons using mid-month solar noon at this location.
    const annual=Array.from({length:12},(_,index)=>{
      const day=keyUTC(parseDate(date).y,index+1,15);
      const when=new Date(Date.parse(day+'T12:00:00Z')-site.lon*240000);
      const v=window.UsefulSolar.at(when,site.lat,site.lon);
      return {month:index+1,w:v.toaHorizontalWm2,elev:v.elevationDeg};
    });
    const annualBars=annual.map(item=>`<div class="solar-month"><span class="solar-bar" style="height:${Math.max(4,Math.round(item.w/1450*90))}px" title="${(isEnglish()?MONTHS_EN:MONTHS)[item.month-1]} · TOA ${Math.round(item.w)} W/m² · Sun elevation ${item.elev.toFixed(1)}°"></span><small>${(isEnglish()?MONTHS_EN:MONTHS)[item.month-1].slice(0,3)}</small></div>`).join('');
    el.innerHTML=`<div class="solar-context-kpis"><span><small>${isEnglish()?'Reference solar elevation':'มุมดวงอาทิตย์ใกล้เที่ยงสุริยะ'}</small><b>${sun.elevationDeg.toFixed(1)}°</b></span><span><small>TOA horizontal · W/m²</small><b>${Math.round(sun.toaHorizontalWm2)}</b></span><span><small>${isEnglish()?'Astronomical context':'บริบทฤดูกาลเชิงดาราศาสตร์'}</small><b>${esc(sun.season)}</b></span></div><p>${isEnglish()?'Solar-noon geometrical reference, not surface measured irradiance or a satellite pass time.':'ค่าคำนวณเรขาคณิตดวงอาทิตย์ ณ เที่ยงสุริยะโดยประมาณ ไม่ใช่รังสีตรวจวัดภาคพื้นหรือเวลาผ่านของดาวเทียม'}</p><div class="solar-annual-title">${isEnglish()?'Annual sunlight geometry · mid-month local solar noon':'เปรียบเทียบแสงอาทิตย์ตลอด 12 เดือน · อ้างอิงเที่ยงสุริยะวันที่ 15'}</div><div class="solar-annual-chart" role="img" aria-label="12 monthly solar reference values">${annualBars}</div><small class="solar-warning">TOA top-of-atmosphere reference only · Surface irradiance also depends on clouds, aerosols and atmospheric conditions.</small>`;
  }
  async function updateWeather(force=false){
    const s=selectedSite();if(!s || !hasCoords(s) || !isSiteActive(s)){renderFocus();return;}
    const existing=state.weather.get(s.id);
    if(existing?.loading)return;
    if(!force&&existing&&Date.now()-existing.fetchedAt<45*60*1000&&existing.coords===weatherKey(s)) {renderFocus();renderStats();return;}
    const requestKey=weatherKey(s);
    state.weather.set(s.id,{loading:true,days:new Map(),hours:new Map(),fetchedAt:Date.now(),coords:requestKey});renderFocus();
    try{
      const p=new URLSearchParams({latitude:String(s.lat),longitude:String(s.lon),hourly:'cloud_cover,shortwave_radiation',forecast_days:'16',timezone:'auto'});
      const controller=new AbortController();const t=setTimeout(()=>controller.abort(),12000);
      let response;try{response=await fetch('https://api.open-meteo.com/v1/forecast?'+p.toString(),{signal:controller.signal})}finally{clearTimeout(t)}
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      if(!data.hourly?.time||!data.hourly?.cloud_cover)throw new Error('No hourly cloud data');
      const byDay=new Map(),hours=new Map(),radiationHours=new Map();
      data.hourly.time.forEach((ts,i)=>{
        const c=Number(data.hourly.cloud_cover[i]);if(!Number.isFinite(c))return;
        const date=ts.slice(0,10),hh=Number(ts.slice(11,13));
        hours.set(ts.slice(0,13),c);
        const ghi=data.hourly.shortwave_radiation?.[i];if(ghi!=null&&Number.isFinite(Number(ghi)))radiationHours.set(ts.slice(0,13),Number(ghi));
        if(hh>=10&&hh<=15){if(!byDay.has(date))byDay.set(date,[]);byDay.get(date).push(c)}
      });
      const days=new Map([...byDay.entries()].map(([date,v])=>[date,v.reduce((a,b)=>a+b,0)/v.length]));
      // The location may have moved/been deleted before the request completed.
      if(siteForId(s.id)?.lat!==s.lat || siteForId(s.id)?.lon!==s.lon)return;
      state.weather.set(s.id,{days,hours,radiationHours,timezone:data.timezone||'auto',fetchedAt:Date.now(),coords:requestKey,error:false});
      if(force)toast(`อัปเดตพยากรณ์เมฆสำหรับ ${s.name.replace(/_/g,' ')} แล้ว`);
    }catch(err){
      state.weather.set(s.id,{days:new Map(),hours:new Map(),error:String(err.message||err),fetchedAt:Date.now(),coords:requestKey});
      if(force)toast('ดึงเมฆไม่สำเร็จ: '+String(err.message||err),'warn');
    }
    renderFocus();renderStats();renderCalendar();renderDaily();renderSiteTable();renderSolarContext();
  }
  // SunCalc's illumination is a physically based calculation; the fallback is a
  // rough synodic cycle used only if the CDN is unavailable (explicitly marked).
  function getMoon(dateKey){
    const t=new Date(dateKey+'T12:00:00Z');let phase,fraction;
    if(window.SunCalc && typeof window.SunCalc.getMoonIllumination==='function') {
      const a=window.SunCalc.getMoonIllumination(t);
      phase=((a.phase%1)+1)%1;fraction=a.fraction;state.moonMethod='SunCalc';
    }else{
      const synodic=29.530588853,epoch=Date.parse('2000-01-06T18:14:00Z');
      phase=((((t.getTime()-epoch)/86400000/synodic)%1)+1)%1;
      fraction=(1-Math.cos(phase*2*Math.PI))/2;state.moonMethod='approximate fallback';
    }
    const index=Math.round(phase*8)%8;
    let thai;
    if(phase<.5){const n=Math.min(15,Math.max(1,Math.round(phase*29.5306)+1));thai=`ขึ้น ${n} ค่ำ (ประมาณ)`}
    else{const n=Math.min(15,Math.max(1,Math.round((phase-.5)*29.5306)+1));thai=`แรม ${n} ค่ำ (ประมาณ)`}
    return {phase,fraction,pct:Math.round(fraction*100),name:moonNames[index],emoji:moonIcons[index],thai};
  }
  function addDays(k,n){const {y,m,d}=parseDate(k);return isoDate(new Date(Date.UTC(y,m-1,d+n)))}
  function effectiveEvents(){
    const original=state.opportunities.concat(state.tle.enabled?state.tle.events:[]);if(!state.cycle)return original;
    const existing=new Set(original.map(e=>[nameKey(e.siteName||e.file||siteForEvent(e)?.name),e.orbit,e.date].join('|')));
    const projected=[],seen=new Set();
    original.filter(e=>e.source==='excel'||e.source==='demo').forEach(e=>{
      for(const diff of [-26,26]){
        const date=addDays(e.date,diff),key=[nameKey(e.siteName||e.file),e.orbit,date].join('|');
        if(existing.has(key)||seen.has(key))continue;
        seen.add(key);
        projected.push({id:e.id+'-cycle-'+diff,date,siteId:e.siteId,siteName:e.siteName,file:e.file,off:null,time:'',orbit:e.orbit,notes:'Estimated repeat only: no orbit propagation, acquisition time or off-nadir confirmation',fileCloud:null,source:'cycle',origin:'estimate'});
      }
    });
    return original.concat(projected);
  }
  function groupedAngle(off){if(off==null)return 'none';const rounded=Math.round(Number(off));return rounded<=10?'0-10':rounded<=20?'11-20':rounded<=30?'21-30':'31+'}
  // Aggregate all batch predictions, not just t.events (the currently selected site).
  // Only sufficiently described opportunities with valid UTC + geometric off-nadir
  // contribute to calendar counts; unverified legacy local-time and demo data do not.
  function calendarScopeSites(){
    if(state.calendarScope==='all')return plannableSites();
    const site=siteForId(state.calendarScope);
    return site&&isSiteActive(site)&&hasCoords(site)?[site]:[];
  }
  function calendarEvents(){
    const keys=new Set(),out=[];
    const selected=new Set(calendarScopeSites().map(s=>s.id));
    const include=e=>{
      if(e.source==='repeat26'&&!state.cycle)return;
      const site=siteForEvent(e);
      if(!site||!selected.has(site.id)||!isSiteActive(site)||!hasCoords(site))return;
      if(e.timeBasis!=='UTC'||!e.utcISO||!Number.isFinite(Date.parse(e.utcISO)))return;
      if(e.off==null||e.off===''||!Number.isFinite(Number(e.off))||Number(e.off)>state.tle.maxOff)return;
      if(state.angleFilter!=='all'&&groupedAngle(e.off)!==state.angleFilter)return;
      if(directionScope()!=='all'&&calendarDirection(e)!==directionScope())return;
      // key includes source to avoid mixing confirmed or manually proposed schedules
      // with an independent orbit estimate. Identical batch/selected-site entries dedup.
      const key=[site.id,e.utcISO,e.source].join('|');if(keys.has(key))return;
      keys.add(key);out.push({...e,siteId:site.id,siteName:site.name});
    };
    state.opportunities.forEach(include);
    for(const [id,result] of state.tle.results){
      if(!selected.has(id))continue;
      (result?.events||[]).forEach(include);
    }
    // The legacy single-site cache may have results before a batch completes.
    state.tle.events.forEach(include);
    return out.sort((a,b)=>a.utcISO.localeCompare(b.utcISO)||a.siteName.localeCompare(b.siteName));
  }
  function visibleEvents(){return calendarEvents();}
  function calendarDirection(e){
    const d=String(e.direction||e.passDirection||'').toUpperCase();
    return d==='ASCENDING'||d==='DESCENDING'?d:'UNKNOWN';
  }
  function directionShort(d){return d==='ASCENDING'?'ASC':d==='DESCENDING'?'DESC':'—';}
  function calendarStatus(){
    const el=$('calendarCoverage');if(!el)return;
    const sites=calendarScopeSites(),count=sites.length;
    const [y,m]=state.month.split('-').map(Number),monthStart=Date.UTC(y,m-1,1);
    const lastDay=Date.UTC(y,m,1),today=Date.parse(todayKey()+'T00:00:00Z');
    const horizon=Math.min(365,Math.max(30,Math.ceil((lastDay-today)/86400000)));
    const computed=sites.filter(site=>{
      const r=state.tle.results.get(site.id);
      return r?.reason==='OK'&&r?.horizonDays>=horizon&&Date.now()-r.computedAt<15*60*1000;
    }).length;
    const scope=state.calendarScope==='all'?(isEnglish()?'All Active Sites':'ทุกพื้นที่ Active'):
      (sites[0]?.name||'Site');
    const prefix=`${scope} · ${count} ${isEnglish()?'site(s)':'พื้นที่'}`;
    const warn=state.tle.lastError;
    if(monthStart<today-32*86400000){el.textContent=prefix+' · '+(isEnglish()?'Historical dates: imported UTC records only; no historic TLE reconstruction':'เดือนย้อนหลัง: แสดงข้อมูลนำเข้าที่มี UTC เท่านั้น ไม่ได้คำนวณ TLE ย้อนหลัง');el.dataset.level='info';return;}
    if(!count){el.textContent=isEnglish()?'No Active sites with coordinates':'ไม่มีพื้นที่ Active ที่มีพิกัด';el.dataset.level='warn';return;}
    if(computed===count){el.textContent=prefix+' · '+(isEnglish()?'orbit screening ready · UTC · estimates only':'ประเมินวงโคจรแล้ว · UTC · ผลประมาณเท่านั้น');el.dataset.level='good';}
    else {el.textContent=prefix+' · '+(isEnglish()?`computed ${computed}/${count}; press Calculate calendar`:`คำนวณแล้ว ${computed}/${count} พื้นที่ · กดคำนวณปฏิทิน`) +(warn?' · TLE unavailable':'');el.dataset.level='warn';}
  }
  let calendarComputeTimer=null;
  function scheduleCalendarCompute(){
    if(calendarComputeTimer!==null)clearTimeout(calendarComputeTimer);
    calendarComputeTimer=window.setTimeout(()=>{calendarComputeTimer=null;calculateCalendarScope();},300);
  }
  // UTC-safe calendar navigation; preserve selected day when changing month.
  function moveMonth(delta){
    const [year,month]=String(state.month||todayKey().slice(0,7)).split('-').map(Number);
    if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12)return;
    const target=new Date(Date.UTC(year,month-1+delta,1));
    const maxDay=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
    const oldDay=parseDate(state.selectedDate||todayKey()).d;
    state.month=keyUTC(target.getUTCFullYear(),target.getUTCMonth()+1,1).slice(0,7);
    state.selectedDate=keyUTC(target.getUTCFullYear(),target.getUTCMonth()+1,Math.min(oldDay,maxDay));
    renderStats();renderCalendar();renderDaily();renderSolarContext();
    // Calendar is a dedicated view: independently calculate the selected scope.
    scheduleCalendarCompute();
  }
  function renderCalendar(){
    const [year,month]=state.month.split('-').map(Number);
    $('monthTitle').textContent=`${(isEnglish()?MONTHS_EN:MONTHS)[month-1]} ${year} · UTC`;
    const startDow=new Date(Date.UTC(year,month-1,1)).getUTCDay();
    const start=new Date(Date.UTC(year,month-1,1-startDow));
    const events=calendarEvents(),byDay=new Map();
    events.forEach(e=>{if(!byDay.has(e.date))byDay.set(e.date,[]);byDay.get(e.date).push(e)});
    const weekdayNodes=(isEnglish()?WEEKDAYS_EN:WEEKDAYS).map((w,i)=>`<div class="weekday ${i===0||i===6?'weekend':''}" role="columnheader">${w}</div>`).join('');
    const today=todayKey();const sites=calendarScopeSites();const single=sites.length===1?sites[0]:null;
    const scopeTitle=state.calendarScope==='all'?(isEnglish()?`All Active Sites (${sites.length})`:`ทุกพื้นที่ Active (${sites.length} พื้นที่)`):(sites[0]?.name||'Selected Site');
    const scopeHeading=$('calendarScopeHeading');if(scopeHeading)scopeHeading.textContent=(isEnglish()?'Calendar coverage: ':'ขอบเขตโอกาสผ่านในปฏิทิน: ')+scopeTitle;
    let html=weekdayNodes;
    for(let i=0;i<42;i++){
      const date=isoDate(new Date(start.getTime()+i*86400000)),a=parseDate(date),outside=a.m!==month;
      const moon=getMoon(date),isDark=moon.pct<=state.threshold;
      const ev=byDay.get(date)||[];
      const uniqueSites=new Set(ev.map(e=>e.siteId)).size;
      const asc=ev.filter(e=>calendarDirection(e)==='ASCENDING').length;
      const desc=ev.filter(e=>calendarDirection(e)==='DESCENDING').length;
      const unknown=ev.length-asc-desc;
      const repeats=ev.filter(e=>e.source==='repeat26').length;
      const byType=new Map();const countedSites=new Set();
      for(const event of ev){
        if(countedSites.has(event.siteId))continue; countedSites.add(event.siteId);
        const site=siteForId(event.siteId),type=siteTypeName(site);
        byType.set(type,(byType.get(type)||0)+1);
      }
      const typeDesc=[...byType].map(([t,n])=>`${typeLabel(t)} ${n}`).join(' · ');
      const typeChips=[...byType].map(([t,n])=>`<span class="cal-type-chip" style="--site-color:${esc(window.UsefulFleet?.typeColor(t)||'#92a5b6')}">${esc(typeLabel(t))} ${n}</span>`).join('');
      const cloud=single?getCloudDay(single.id,date):null;
      const names=ev.slice(0,5).map(e=>siteForEvent(e)?.name||e.siteName).join(', ');
      const aria=esc(`${shortDate(date)} · ${ev.length} pass candidates · ${uniqueSites} sites · ascending ${asc} · descending ${desc}. ${names}`);
      const coverage=sites.length>0&&sites.every(s=>state.tle.results.has(s.id));
      html+=`<button type="button" class="cal-day cal-count-day ${outside?'outside':''} ${date===today?'today':''} ${date===state.selectedDate?'selected':''} ${isDark?'dsnu':''} ${ev.length?'has-passes':''}" data-date="${date}" aria-label="${aria}" title="${aria}">
        <div class="cal-day-head"><span class="day-num">${a.d}</span><span class="moon-phase"><span class="moon-emoji">${moon.emoji}</span><span>${moon.pct}%</span></span></div>
        ${isDark?'<span class="dsnu-chip">☾ DSNU*</span>':''}
        ${cloud!=null?`<span class="cloud-mini">☁ ${Math.round(cloud)}%</span>`:''}
        ${ev.length?`<span class="cal-passes"><b>${ev.length}</b><span>${isEnglish()?'pass candidates':'โอกาสผ่าน'}</span></span>
         <span class="cal-site-count">${uniqueSites} ${isEnglish()?'sites':'พื้นที่'}</span>${ev.length===1?`<span class="cal-single-site" title="${esc(ev[0].siteName||siteForEvent(ev[0])?.name||'')}">${esc(ev[0].siteName||siteForEvent(ev[0])?.name||'Site')}</span>`:''}
         <span class="cal-type-chips" title="${esc(typeDesc)}">${typeChips}</span>`:
         (coverage?'<span class="cal-no-pass">—</span>':'<span class="cal-pending">·</span>')}
        </button>`;
    }
    $('calendarGrid').innerHTML=html;
    if($('showCycle'))$('showCycle').checked=state.cycle;
    calendarStatus();
  }
  function renderDaily(){
    // Single source of truth: Daily Inspection, calendar, main results and CSV
    // all use #passDirection. Highlight the selected daily filter on every render.
    const activeDirection=directionScope();
    document.querySelectorAll('[data-daily-direction]').forEach(button=>{
      const active=button.dataset.dailyDirection===activeDirection;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const date=state.selectedDate||todayKey(),moon=getMoon(date),rows=calendarEvents().filter(e=>e.date===date);
    const scopedSites=calendarScopeSites();
    const activeScope=state.calendarScope==='all'
       ?(isEnglish()?`All Active Sites (${scopedSites.length} sites)`:`ทุกพื้นที่ Active (${scopedSites.length} พื้นที่)`)
       :(scopedSites[0]?.name||'Selected Site');
    $('detailTitle').textContent=(isEnglish()?'Pass opportunities · ':'โอกาสผ่านพื้นที่ · ')+shortDate(date);
    const scopeTag=$('calendarScopeLabel');if(scopeTag)scopeTag.textContent=(isEnglish()?'Showing: ':'กำลังแสดงโอกาสผ่านของ: ')+activeScope;
    $('detailDateBadge').textContent=date+' UTC';
    $('dailyMoonText').textContent=moon.emoji+' '+moon.thai;
    $('dailyMoonPct').textContent=moon.pct+'%'+(moon.pct<=state.threshold?' · DSNU*':'');
    const single=calendarScopeSites().length===1?calendarScopeSites()[0]:null;
    const c=single?getCloudDay(single.id,date):null;
    $('dailyCloud').textContent=single?(c==null?'ไม่มีข้อมูลพยากรณ์':Math.round(c)+'% (model)'):
      (isEnglish()?'Per-site cloud (when available)':'แสดงเมฆแยกรายพื้นที่ เมื่อมีข้อมูล');
    const asc=rows.filter(e=>calendarDirection(e)==='ASCENDING').length;
    const desc=rows.filter(e=>calendarDirection(e)==='DESCENDING').length;
    const uniqueSites=new Set(rows.map(e=>e.siteId)).size;
    const summary=$('calendarDailySummary');
    if(summary){
      const byType=new Map(),seenSites=new Set();for(const event of rows){
        if(seenSites.has(event.siteId))continue;seenSites.add(event.siteId);
        const name=siteTypeName(siteForId(event.siteId));byType.set(name,(byType.get(name)||0)+1);
      }
      const labels=[...byType].map(([type,n])=>`<span class="cal-type-chip" style="--site-color:${esc(window.UsefulFleet?.typeColor(type)||'#92a5b6')}">${esc(typeLabel(type))} ${n}</span>`).join('');
      summary.innerHTML=rows.length?`<strong>${rows.length} ${isEnglish()?'pass candidates':'โอกาสผ่าน'}</strong><span>${esc(activeScope)}</span><span>${uniqueSites} ${isEnglish()?'sites':'พื้นที่'}</span><span class="cal-type-chips">${labels}</span><span class="cal-pass-dir is-asc">↑ ASC ${asc}</span><span class="cal-pass-dir is-desc">↓ DESC ${desc}</span>`:'';
    }
    if(!rows.length){$('dailyEntries').innerHTML=`<div class="empty-list">${isEnglish()?'No calculated pass candidates for this date. If the calendar has not been calculated, choose Calculate calendar.':'ยังไม่มีโอกาสผ่านที่ประเมินได้ในวันนี้ หากยังไม่ได้คำนวณให้กด “คำนวณปฏิทิน”'}<br><small>${isEnglish()?'No candidate does not guarantee the satellite cannot image the site.':'ไม่มีผลคำนวณไม่ใช่การยืนยันว่าดาวเทียมถ่ายภาพไม่ได้'}</small></div>`;return;}
    $('dailyEntries').innerHTML=rows.map(e=>{
      const s=siteForEvent(e),dir=calendarDirection(e),direction=directionShort(dir);
      const source=e.source==='tle'?'TLE/SGP4 · estimate':e.source==='repeat26'?`≈ ${e.repeatDays||26}-day repeat proxy · low confidence`:e.source==='manual'?'Manual proposal':'Imported Excel';
      const cl=s?getCloudHour(s.id,date,e.time||''):null;
      const cloud=cl??e.fileCloud??null;
      const coords=s&&hasCoords(s)?`${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}`:'—';
      const off=Number(e.off);
      const current=window.UsefulFleet?.selectedSatellite()?.name||'THEOS-2';
      const satellite=['tle','repeat26'].includes(e.source)?current:
        (window.UsefulIntegrity.sourceSatellite(e.satelliteName||e.satelliteNorad||'',e.file||'').name||'Not specified');
      const id=e.source==='manual'?`<button class="op-delete" type="button" data-deleteevent="${esc(e.id)}" title="Remove proposed event">✕</button>`:'';
      const category=String(s?.type||'Other');
      const categoryAccent=esc(window.UsefulFleet?.typeColor(category)||'#89a9b9');
      return `<div class="op-entry cal-pass-row"><span class="op-icon ${e.source==='tle'?'tle':'predicted'} ${dir==='ASCENDING'?'dir-asc':dir==='DESCENDING'?'dir-desc':''}" aria-hidden="true"></span>
        <div class="op-content"><strong class="pass-card-title">${esc((s?.name||e.siteName||'Test Site').replace(/_/g,' '))}</strong>
          <div class="pass-card-meta"><span class="site-category" style="--site-color:${categoryAccent}"><i class="site-category-dot" aria-hidden="true"></i>${esc(category)}</span>
            <span class="pass-card-context">${esc(satellite)} <span class="meta-separator">·</span> ${esc(source)}</span></div>
          <div class="pass-card-coords">WGS84 ${esc(coords)} <span class="meta-separator">·</span> ${cloud==null?'Cloud —':'Cloud '+Math.round(cloud)+'%'}</div>
        </div>
        <div class="op-right"><span class="orbit-tag ${dir==='ASCENDING'?'is-asc':dir==='DESCENDING'?'is-desc':'is-unknown'}">${dir==='ASCENDING'?'↑ ASC':dir==='DESCENDING'?'↓ DESC':'— direction'}</span>
        <strong class="pass-card-angle">${e.source==='repeat26'?'≈ ':''}${off.toFixed(2)}°</strong><small class="pass-card-time">${e.source==='repeat26'?'≈ ':''}${esc(e.time||e.utcISO.slice(11,19))} UTC</small></div>${id}</div>`;
    }).join('');
  }
  async function calculateCalendarScope({force=false}={}){
    const target=$('calendarCalculate'),sites=calendarScopeSites();
    if(!sites.length){calendarStatus();return;}
    const [y,m]=state.month.split('-').map(Number);
    const now=Date.parse(todayKey()+'T00:00:00Z');
    const end=Date.UTC(y,m,1),start=Date.UTC(y,m-1,1);
    if(end<=now){calendarStatus();renderCalendar();return;}
    if(start>now+365*86400000){const el=$('calendarCoverage');if(el){el.textContent=isEnglish()?'Beyond one-year planning horizon':'เกินช่วงคำนวณ 1 ปี';el.dataset.level='warn';}return;}
    const days=Math.min(365,Math.max(30,Math.ceil((end-now)/86400000)));
    const ready=!force&&sites.every(s=>{const r=state.tle.results.get(s.id);return r?.reason==='OK'&&r?.horizonDays>=days&&Date.now()-r.computedAt<15*60*1000});
    if(ready){renderCalendar();renderDaily();return;}
    const el=$('calendarCoverage');if(target)target.disabled=true;
    if(el){el.textContent=(isEnglish()?'Calculating ':'กำลังคำนวณ ')+sites.length+(isEnglish()?' site(s)…':' พื้นที่…');el.dataset.level='pending';}
    try{
      await ensureTLEForSites(sites,{force,horizonDays:days});
      renderCalendar();renderDaily();
    }catch(error){
      renderCalendar();renderDaily();
      if(el){el.textContent=(isEnglish()?'Orbit calculation unavailable: ':'ไม่สามารถคำนวณวงโคจรได้: ')+(error?.message||String(error));el.dataset.level='warn';}
    }finally{if(target)target.disabled=false;}
  }
  function renderImportedFiles(){
    const byFile=new Map();
    state.opportunities.filter(e=>e.source==='excel').forEach(e=>{
      const k=e.file||'unnamed';const o=byFile.get(k)||{n:0,origin:e.origin};o.n++;byFile.set(k,o);
    });
    $('importedCount').textContent=byFile.size+' file(s)';
    $('importedFiles').innerHTML=[...byFile.entries()].map(([name,o])=>`<span class="source-chip">▤ ${esc(name)} (${o.n}) · ${o.origin==='repo'?'GitHub':'Browser'}</span>`).join('') || '<span class="empty-hint">ยังไม่มีไฟล์ Excel · แสดงตัวอย่างเฉพาะเมื่อไม่มีไฟล์จริง</span>';
    $('syncStatus').textContent=state.importStatus||'Data: Browser storage + GitHub Excel (when available)';
  }
  function renderAll({map=true}={}){
    buildSiteOptions();renderSiteTypeFilters();renderSidebar();renderSiteTable();renderFocus();renderStats();renderCalendar();renderDaily();renderImportedFiles();renderSolarContext();renderCompactResults();
    if(map){update2DMarkers();update3DMarkers();$('mapMarkerCount').textContent=mapVisibleSites().length;}
  }
  // 2D map deliberately uses a LOCAL Natural Earth texture, not public OSM tile servers.
  // This makes worldwide site overview stable on static GitHub Pages, without API keys,
  // rate limits, Referrer requirements, or external map services.
  function clampMapCenter(){
    const m=state.map;if(!m||!m.width||!m.height)return;
    const s=mapScale(m);
    const halfLon=m.width/(2*s),halfLat=m.height/(2*s);
    const lonMax=Math.max(0,180-halfLon),latMax=Math.max(0,90-halfLat);
    m.centerLon=Math.max(-lonMax,Math.min(lonMax,m.centerLon));
    m.centerLat=Math.max(-latMax,Math.min(latMax,m.centerLat));
  }
  function mapScale(m){return Math.min(m.width/360,m.height/180)*m.zoom;}
  function toMapXY(lat,lon){
    const m=state.map,s=mapScale(m);
    return {x:m.width/2+(lon-m.centerLon)*s,y:m.height/2-(lat-m.centerLat)*s};
  }
  function fromMapXY(x,y){
    const m=state.map,s=mapScale(m);
    return {lat:m.centerLat-(y-m.height/2)/s,lon:m.centerLon+(x-m.width/2)/s};
  }
  function draw2DMap(){
    const m=state.map;if(!m||!m.width||!m.height||state.mapMode!=='2d')return;
    const {ctx,width:w,height:h}=m,s=mapScale(m);
    ctx.clearRect(0,0,w,h);
    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#071a2d');bg.addColorStop(1,'#102d42');
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    const west=toMapXY(90,-180),east=toMapXY(-90,180);
    const x=west.x,y=west.y,worldW=east.x-x,worldH=east.y-y;
    if(m.imageLoaded){
      ctx.drawImage(m.image,x,y,worldW,worldH);
    }else{
      // Error-safe geographic grid, so coordinates/markers remain usable even
      // if the checked-in assets/earth-map.jpg is accidentally omitted.
      ctx.fillStyle='#123c50';ctx.fillRect(x,y,worldW,worldH);
      ctx.strokeStyle='rgba(153,201,224,.17)';ctx.lineWidth=1;
      for(let lon=-150;lon<=150;lon+=30){let p=toMapXY(0,lon);ctx.beginPath();ctx.moveTo(p.x,y);ctx.lineTo(p.x,y+worldH);ctx.stroke()}
      for(let lat=-60;lat<=60;lat+=30){let p=toMapXY(lat,0);ctx.beginPath();ctx.moveTo(x,p.y);ctx.lineTo(x+worldW,p.y);ctx.stroke()}
      ctx.fillStyle='#a4c1cd';ctx.font='12px Inter, sans-serif';ctx.fillText('Embedded map unavailable — geographic grid remains active',Math.max(16,x+15),Math.max(62,y+30));
    }
    ctx.strokeStyle='rgba(88,167,193,.48)';ctx.lineWidth=1;
    ctx.strokeRect(x+.5,y+.5,worldW-1,worldH-1);
    // Show minimal, readable latitude/longitude graticule labels.
    if(s>=1.5){
      ctx.save();ctx.beginPath();ctx.rect(x,y,worldW,worldH);ctx.clip();
      ctx.fillStyle='rgba(203,232,239,.67)';ctx.font='10px IBM Plex Mono, monospace';
      for(let lon=-150;lon<=150;lon+=30){const p=toMapXY(0,lon);ctx.fillText(`${Math.abs(lon)}°${lon<0?'W':lon>0?'E':''}`,p.x+3,Math.max(y+15,16))}
      for(let lat=-60;lat<=60;lat+=30){const p=toMapXY(lat,0);ctx.fillText(`${Math.abs(lat)}°${lat<0?'S':lat>0?'N':''}`,Math.max(x+5,6),p.y-5)}
      ctx.restore();
    }
    window.UsefulFleet?.drawTrack2D?.(ctx,toMapXY,m);
    const markers=mapVisibleSites().slice().sort((a,b)=>Number(a.id===state.selectedSiteId)-Number(b.id===state.selectedSiteId));
    for(const site of markers){
      const p=toMapXY(site.lat,site.lon),selected=site.id===state.selectedSiteId,hover=site.id===m.hoverId;
      if(p.x < -24 || p.x > w+24 || p.y < -24 || p.y > h+24)continue;
      const size=selected?4.8:3.0;
      ctx.beginPath();ctx.arc(p.x,p.y,selected?8:5.2,0,Math.PI*2);
      ctx.fillStyle=selected?'rgba(255,194,102,.17)':hexAlpha(window.UsefulFleet?.typeColor(site.type)||'#46dfcf',.12);ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);
      ctx.fillStyle=selected?'#ffc875':(window.UsefulFleet?.typeColor(site.type)||'#46dfcf');ctx.fill();
      ctx.lineWidth=2;ctx.strokeStyle='#10283a';ctx.stroke();
      if(selected||hover||m.zoom>3.7){
        const label=site.name.replace(/_/g,' ');
        ctx.font='600 11px Inter, sans-serif';
        const textW=ctx.measureText(label).width;
        const lblX=Math.max(7,Math.min(w-textW-17,p.x+13)),lblY=Math.max(25,Math.min(h-8,p.y-10));
        ctx.fillStyle='rgba(8,25,41,.92)';ctx.fillRect(lblX-6,lblY-14,textW+12,20);
        ctx.fillStyle=selected?'#ffe5b5':'#daeee9';ctx.fillText(label,lblX,lblY);
      }
    }
    window.UsefulFleet?.drawMarkers2D?.(ctx,toMapXY,w,h);
    window.UsefulSky?.draw2D?.(ctx,toMapXY,w,h);
    // Fixed compass and overview scale to communicate this is a geographic map.
    ctx.fillStyle='rgba(217,238,244,.66)';ctx.font='700 11px Inter, sans-serif';
    ctx.fillText('N ↑',w-44,Math.max(73,h*.18));
  }
  function resize2DMap(){
    const m=state.map;if(!m)return;
    const box=m.canvas.getBoundingClientRect(),w=Math.max(1,box.width),h=Math.max(1,box.height);
    if(w<2||h<2)return;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    m.canvas.width=Math.round(w*dpr);m.canvas.height=Math.round(h*dpr);
    m.ctx.setTransform(dpr,0,0,dpr,0,0);m.width=w;m.height=h;
    clampMapCenter();draw2DMap();
  }
  function set2DZoom(zoom,anchor){
    const m=state.map;if(!m)return;
    const px=anchor?.x??m.width/2,py=anchor?.y??m.height/2;
    const geo=fromMapXY(px,py);
    m.zoom=Math.max(1,Math.min(14,zoom));
    const s=mapScale(m);
    m.centerLon=geo.lon-(px-m.width/2)/s;
    m.centerLat=geo.lat+(py-m.height/2)/s;
    clampMapCenter();draw2DMap();
  }
  function reset2DMap(){
    const m=state.map;if(!m)return;
    m.zoom=1;m.centerLon=0;m.centerLat=0;draw2DMap();
  }
  function setup2DMap(){
    const canvas=$('map2d');if(!canvas?.getContext)return;
    const m={canvas,ctx:canvas.getContext('2d'),image:new Image(),imageLoaded:false,
      width:0,height:0,zoom:1,centerLon:0,centerLat:0,hoverId:null,
      drag:null,pointers:new Map(),pinch:null};
    state.map=m;
    m.image.onload=()=>{m.imageLoaded=true;draw2DMap();draw3DMap()};
    m.image.onerror=()=>{m.imageLoaded=false;draw2DMap();toast('ไม่สามารถถอดรหัสแผนที่โลกที่ฝังมากับระบบได้','warn')};
    m.image.src=EMBEDDED_EARTH_MAP;
    resize2DMap();
    const coords=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
    canvas.addEventListener('pointerdown',e=>{
      const p=coords(e);canvas.setPointerCapture(e.pointerId);m.pointers.set(e.pointerId,p);
      if(m.pointers.size===1){m.drag={id:e.pointerId,startX:p.x,startY:p.y,lastX:p.x,lastY:p.y,moved:false}}
      if(m.pointers.size===2){
        const [a,b]=[...m.pointers.values()];m.pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:m.zoom};m.drag=null;
      }
    });
    canvas.addEventListener('pointermove',e=>{
      const p=coords(e);
      if(m.pointers.has(e.pointerId))m.pointers.set(e.pointerId,p);
      if(m.pointers.size===2 && m.pinch){
        const [a,b]=[...m.pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);
        const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
        set2DZoom(m.pinch.zoom*distance/Math.max(1,m.pinch.distance),mid);return;
      }
      if(m.drag&&m.drag.id===e.pointerId){
        const dx=p.x-m.drag.lastX,dy=p.y-m.drag.lastY;
        if(Math.hypot(p.x-m.drag.startX,p.y-m.drag.startY)>5)m.drag.moved=true;
        if(m.drag.moved){const s=mapScale(m);m.centerLon-=dx/s;m.centerLat+=dy/s;clampMapCenter();draw2DMap()}
        m.drag.lastX=p.x;m.drag.lastY=p.y;return;
      }
      let newHover=null;
      for(const site of mapVisibleSites()){const mark=toMapXY(site.lat,site.lon);if(Math.hypot(p.x-mark.x,p.y-mark.y)<14){newHover=site.id;break;}}
      if(m.hoverId!==newHover){m.hoverId=newHover;draw2DMap()}
      const geo=fromMapXY(p.x,p.y);
      const inside=Math.abs(geo.lat)<=90&&Math.abs(geo.lon)<=180;
      canvas.style.cursor=newHover?'pointer':(state.pickMode&&inside?'crosshair':'grab');
      $('mapBottomNote').textContent=inside?`${geo.lat.toFixed(5)}°, ${geo.lon.toFixed(5)}° · ${newHover?'คลิกเพื่อเลือกพื้นที่':state.pickMode?'คลิกเพื่อเพิ่มพิกัด':'ลากเพื่อเลื่อนแผนที่'}`:'เลือกจุดบนแผนที่เพื่อจัดการพิกัด';
    });
    function finishPointer(e){
      const p=coords(e),drag=m.drag,clicked=drag&&drag.id===e.pointerId&&!drag.moved;
      m.pointers.delete(e.pointerId);m.drag=null;m.pinch=null;
      if(!clicked)return;
      // Prefer an existing marker over site creation, even when pick mode is on.
      const mark=mapVisibleSites().map(site=>({site,xy:toMapXY(site.lat,site.lon)})).find(q=>Math.hypot(q.xy.x-p.x,q.xy.y-p.y)<16);
      if(mark){setSite(mark.site.id,{fetchCloud:true});return;}
      const geo=fromMapXY(p.x,p.y);
      if(state.pickMode&&Math.abs(geo.lat)<=90&&Math.abs(geo.lon)<=180)openSiteModal(null,geo);
    }
    canvas.addEventListener('pointerup',finishPointer);
    canvas.addEventListener('pointercancel',e=>{m.pointers.delete(e.pointerId);m.drag=null;m.pinch=null});
    canvas.addEventListener('pointerleave',()=>{m.hoverId=null;draw2DMap()});
    canvas.addEventListener('wheel',e=>{e.preventDefault();set2DZoom(m.zoom*Math.exp(-e.deltaY*.0012),coords(e))},{passive:false});
    canvas.addEventListener('dblclick',e=>{e.preventDefault();set2DZoom(m.zoom*1.6,coords(e))});
    canvas.addEventListener('keydown',e=>{
      if(e.key==='+'||e.key==='='){set2DZoom(m.zoom*1.4);e.preventDefault()}
      else if(e.key==='-'){set2DZoom(m.zoom/1.4);e.preventDefault()}
      else if(e.key==='0'){reset2DMap();e.preventDefault()}
      else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        const step=18/mapScale(m);if(e.key==='ArrowLeft')m.centerLon-=step;if(e.key==='ArrowRight')m.centerLon+=step;
        if(e.key==='ArrowUp')m.centerLat+=step;if(e.key==='ArrowDown')m.centerLat-=step;
        clampMapCenter();draw2DMap();e.preventDefault();
      }
    });
  }
  function update2DMarkers(){draw2DMap();}
  // Fully self-contained 3D globe. No Globe.GL / Three.js / external tile/CDN dependency.
  // GPU: tiny WebGL shader; CPU fallback: canvas software orthographic sphere.
  // Both reuse the same embedded, public-domain Natural Earth basemap as 2D.
  const globeClamp = (v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const globeLon = lon=>((lon+540)%360+360)%360-180;
  const rad = d=>d*Math.PI/180;
  const deg = r=>r*180/Math.PI;
  function globeGeometry(g){
    const w=g.w||350,h=g.h||350;
    return {cx:w*.5,cy:h*.52,r:Math.min(w*.43,h*.435)*g.zoom};
  }
  function projectOnGlobe(g,lat,lon){
    const lat0=rad(g.lat),d=rad(globeLon(lon-g.lon)),phi=rad(lat),q=globeGeometry(g);
    const x=Math.cos(phi)*Math.sin(d),
      y=Math.sin(phi)*Math.cos(lat0)-Math.cos(phi)*Math.sin(lat0)*Math.cos(d),
      depth=Math.sin(phi)*Math.sin(lat0)+Math.cos(phi)*Math.cos(lat0)*Math.cos(d);
    return {x:q.cx+x*q.r,y:q.cy-y*q.r,depth};
  }
  function geoFromGlobe(g,x,y){
    const q=globeGeometry(g),u=(x-q.cx)/q.r,v=(q.cy-y)/q.r,d2=u*u+v*v;
    if(d2>1)return null;
    const z=Math.sqrt(1-d2),phi=rad(g.lat),lam=rad(g.lon),
      X=u*(-Math.sin(lam))+v*(-Math.sin(phi)*Math.cos(lam))+z*Math.cos(phi)*Math.cos(lam),
      Y=u*Math.cos(lam)+v*(-Math.sin(phi)*Math.sin(lam))+z*Math.cos(phi)*Math.sin(lam),
      Z=v*Math.cos(phi)+z*Math.sin(phi);
    return {lat:deg(Math.asin(globeClamp(Z,-1,1))),lon:globeLon(deg(Math.atan2(Y,X)))};
  }
  function initGlobeWebGL(g){
    // WebGL is optional: the fallback below does not need GPU acceleration.
    let gl;
    try{gl=g.canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:false})||g.canvas.getContext('experimental-webgl');}
    catch(e){return false;}
    if(!gl)return false;
    try{
      const vertex=`attribute vec2 a_xy; void main(){gl_Position=vec4(a_xy,0.0,1.0);}`;
      const fragment=`precision highp float;
        uniform vec2 u_size;
        uniform vec2 u_center;  // radians (latitude, longitude)
        uniform float u_radius;
        uniform sampler2D u_earth;
        const float PI=3.141592653589793;
        void main(){
          vec2 uv=(gl_FragCoord.xy-vec2(u_size.x*0.5,u_size.y*0.48))/u_radius;
          float rr=dot(uv,uv);
          if(rr>1.0){
            vec3 space=vec3(0.028,0.091,0.145);
            float halo=exp(-30.0*pow(sqrt(rr)-1.0,2.0))*0.14;
            float gridSeed=fract(sin(dot(floor(gl_FragCoord.xy/17.0),vec2(12.9898,78.233)))*43758.5453);
            float star=step(0.996,gridSeed)*0.38;
            gl_FragColor=vec4(space+vec3(halo*0.25,halo*0.66,halo)+vec3(star),1.0);
            return;
          }
          float z=sqrt(max(0.0,1.0-rr));
          float sl=sin(u_center.x),cl=cos(u_center.x);
          float sn=sin(u_center.y),cn=cos(u_center.y);
          vec3 p=uv.x*vec3(-sn,cn,0.0)+uv.y*vec3(-sl*cn,-sl*sn,cl)+z*vec3(cl*cn,cl*sn,sl);
          float latitude=asin(clamp(p.z,-1.0,1.0));
          float longitude=atan(p.y,p.x);
          vec2 tex=vec2((longitude+PI)/(2.0*PI),(latitude+PI*0.5)/PI);
          vec3 earth=texture2D(u_earth,tex).rgb;
          float diffuse=max(0.0,dot(normalize(vec3(-0.45,0.48,0.82)),normalize(vec3(uv,z))));
          float rim=pow(1.0-z,3.4);
          vec3 col=earth*(0.43+0.60*diffuse)+vec3(0.012,0.12,0.16)*rim;
          gl_FragColor=vec4(col,1.0);
        }`;
      const compile=(type,source)=>{
        const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
        if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));
        return sh;
      };
      const program=gl.createProgram();
      gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
      gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const attr=gl.getAttribLocation(program,'a_xy');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
      const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([26,88,107,255]));
      gl.uniform1i(gl.getUniformLocation(program,'u_earth'),0);
      g.gl={gl,program,texture,uploaded:false,locations:{size:gl.getUniformLocation(program,'u_size'),center:gl.getUniformLocation(program,'u_center'),radius:gl.getUniformLocation(program,'u_radius')}};
      g.canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault();g.gl=null;activateGlobeCPU(g);draw3DMap();
      },{once:true});
      return true;
    }catch(err){console.warn('WebGL initialization failed, using software globe:',err);g.gl=null;return false;}
  }
  function activateGlobeCPU(g){
    if(g.gl)return;
    // A canvas that had a WebGL context cannot be reused for 2D: replace it.
    const old=g.canvas,next=document.createElement('canvas');next.className='globe-render';
    old.replaceWith(next);g.canvas=next;g.cpuCtx=next.getContext('2d');g.texturePixels=null;g.cpuBuffer=null;
    g.canvas.width=Math.round(g.w*g.dpr);g.canvas.height=Math.round(g.h*g.dpr);
    g.cpuCtx.setTransform(g.dpr,0,0,g.dpr,0,0);
  }
  function drawGlobeGPU(g){
    const obj=g.gl;if(!obj)return false;
    const gl=obj.gl,img=state.map?.image;
    try{
      if(img?.complete&&img.naturalWidth&&!obj.uploaded){
        gl.bindTexture(gl.TEXTURE_2D,obj.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
        obj.uploaded=true;
      }
      const q=globeGeometry(g);
      gl.viewport(0,0,g.canvas.width,g.canvas.height);
      gl.useProgram(obj.program);
      gl.uniform2f(obj.locations.size,g.canvas.width,g.canvas.height);
      gl.uniform2f(obj.locations.center,rad(g.lat),rad(g.lon));
      gl.uniform1f(obj.locations.radius,q.r*g.dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      return true;
    }catch(err){console.warn('WebGL rendering failed; switching to software globe:',err);g.gl=null;activateGlobeCPU(g);return false;}
  }
  function drawGlobeCPU(g){
    const ctx=g.cpuCtx,q=globeGeometry(g);
    if(!ctx)return;
    ctx.clearRect(0,0,g.w,g.h);
    const bg=ctx.createLinearGradient(0,0,0,g.h);
    bg.addColorStop(0,'#07182a');bg.addColorStop(1,'#0b2b42');
    ctx.fillStyle=bg;ctx.fillRect(0,0,g.w,g.h);
    if(!state.map?.imageLoaded){
      ctx.strokeStyle='#2d7a91';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.cx,q.cy,q.r,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#91bdc9';ctx.font='13px Inter, sans-serif';ctx.fillText('Loading embedded Earth map…',20,g.h/2);return;
    }
    if(!g.texturePixels){
      const src=document.createElement('canvas');src.width=900;src.height=450;
      const sourceCtx=src.getContext('2d',{willReadFrequently:true});
      sourceCtx.drawImage(state.map.image,0,0,900,450);
      g.texturePixels=sourceCtx.getImageData(0,0,900,450);
    }
    // Render the orthographic globe in a fixed-size buffer for consistent performance.
    const N=Math.min(440,Math.max(240,Math.round(q.r*2)));
    if(!g.cpuBuffer||g.cpuBuffer.width!==N){g.cpuBuffer=document.createElement('canvas');g.cpuBuffer.width=N;g.cpuBuffer.height=N;}
    const target=g.cpuBuffer.getContext('2d',{willReadFrequently:true});
    const out=target.createImageData(N,N),pix=out.data,tex=g.texturePixels,original=tex.data;
    const half=N/2,lat0=rad(g.lat),lon0=rad(g.lon);
    const sl=Math.sin(lat0),cl=Math.cos(lat0),sn=Math.sin(lon0),cn=Math.cos(lon0);
    for(let yi=0;yi<N;yi++){
      const v=(half-yi)/half;
      for(let xi=0;xi<N;xi++){
        const u=(xi-half)/half,r2=u*u+v*v,oi=(yi*N+xi)*4;
        if(r2>1)continue;
        const z=Math.sqrt(1-r2),wx=u*(-sn)+v*(-sl*cn)+z*cl*cn,
          wy=u*cn+v*(-sl*sn)+z*cl*sn,wz=v*cl+z*sl;
        const lat=Math.asin(globeClamp(wz,-1,1)),lon=Math.atan2(wy,wx);
        const tx=globeClamp(Math.floor((lon+Math.PI)/(2*Math.PI)*tex.width),0,tex.width-1),
          ty=globeClamp(Math.floor((Math.PI/2-lat)/Math.PI*tex.height),0,tex.height-1);
        const si=(ty*tex.width+tx)*4,diffuse=Math.max(0,(-u*.45+v*.48+z*.82)/1.04),light=.43+.60*diffuse;
        pix[oi]=original[si]*light+3*(1-z);pix[oi+1]=original[si+1]*light+22*(1-z);
        pix[oi+2]=original[si+2]*light+29*(1-z);pix[oi+3]=255;
      }
    }
    target.putImageData(out,0,0);
    ctx.save();ctx.shadowColor='#2dbbce';ctx.shadowBlur=23;ctx.beginPath();ctx.arc(q.cx,q.cy,q.r+1,0,Math.PI*2);ctx.strokeStyle='#24718c';ctx.lineWidth=4;ctx.stroke();ctx.restore();
    ctx.drawImage(g.cpuBuffer,q.cx-q.r,q.cy-q.r,q.r*2,q.r*2);
  }
  function drawGlobeOverlay(g){
    if(!g.overlayCtx)return;
    const ctx=g.overlayCtx,q=globeGeometry(g);
    ctx.clearRect(0,0,g.w,g.h);
    // Subtle atmospheric edge, plus precise markers projected onto the sphere.
    ctx.beginPath();ctx.arc(q.cx,q.cy,q.r+.5,0,Math.PI*2);
    ctx.strokeStyle='rgba(111,223,238,.42)';ctx.lineWidth=1.5;ctx.stroke();
    window.UsefulFleet?.drawTrack3D?.(ctx,(lat,lon)=>projectOnGlobe(g,lat,lon));
    const markers=mapVisibleSites().slice().sort((a,b)=>Number(a.id===state.selectedSiteId)-Number(b.id===state.selectedSiteId));
    for(const site of markers){
      const p=projectOnGlobe(g,site.lat,site.lon);
      if(p.depth<=0)continue;
      const selected=site.id===state.selectedSiteId,hovered=site.id===g.hoverId;
      ctx.beginPath();ctx.arc(p.x,p.y,selected?8:5.2,0,Math.PI*2);ctx.fillStyle=selected?'rgba(255,197,104,.22)':hexAlpha(window.UsefulFleet?.typeColor(site.type)||'#49e3ce',.17);ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,selected?4.8:3.0,0,Math.PI*2);
      ctx.fillStyle=selected?'#ffc777':(window.UsefulFleet?.typeColor(site.type)||'#49e3ce');ctx.fill();ctx.strokeStyle='#083247';ctx.lineWidth=2;ctx.stroke();
      if(selected||hovered){
        const name=site.name.replace(/_/g,' ');ctx.font='600 11px Inter, sans-serif';
        const width=ctx.measureText(name).width;
        const px=globeClamp(p.x+14,8,g.w-width-19),py=globeClamp(p.y-13,24,g.h-8);
        ctx.fillStyle='rgba(5,24,41,.94)';ctx.fillRect(px-6,py-14,width+12,21);
        ctx.fillStyle=selected?'#ffe6b1':'#defbf4';ctx.fillText(name,px,py);
      }
    }
    window.UsefulFleet?.drawMarkers3D?.(ctx,(lat,lon)=>projectOnGlobe(g,lat,lon),g.w,g.h);
    window.UsefulSky?.draw3D?.(ctx,(lat,lon)=>projectOnGlobe(g,lat,lon));
    ctx.fillStyle='rgba(176,211,226,.72)';ctx.font='600 11px Inter,sans-serif';
    ctx.fillText('DRAG TO ROTATE  ·  SCROLL TO ZOOM',Math.max(12,g.w/2-130),g.h-14);
  }
  function draw3DMap(){
    const g=state.globe;if(!g||!g.w||!g.h)return;
    if(g.gl){if(!drawGlobeGPU(g))drawGlobeCPU(g);}else drawGlobeCPU(g);
    drawGlobeOverlay(g);
  }
  function setup3DMap(){
    if(state.globe)return true;
    const host=$('map3d');if(!host)return false;
    const canvas=document.createElement('canvas'),overlay=document.createElement('canvas');
    canvas.className='globe-render';overlay.className='globe-overlay';
    overlay.setAttribute('tabindex','0');overlay.setAttribute('aria-label','3D Earth globe. Drag to rotate, scroll to zoom, click marker to select test site.');
    host.replaceChildren(canvas,overlay);
    const g={host,canvas,overlay,overlayCtx:overlay.getContext('2d'),gl:null,cpuCtx:null,
      w:0,h:0,dpr:1,lat:15,lon:5,zoom:1,hoverId:null,pointers:new Map(),drag:null,texturePixels:null,cpuBuffer:null};
    state.globe=g;
    if(!initGlobeWebGL(g))activateGlobeCPU(g);
    const coords=e=>{const b=overlay.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top};};
    overlay.addEventListener('pointerdown',e=>{
      const pt=coords(e);overlay.setPointerCapture(e.pointerId);g.pointers.set(e.pointerId,pt);
      if(g.pointers.size===1)g.drag={id:e.pointerId,startX:pt.x,startY:pt.y,lastX:pt.x,lastY:pt.y,moved:false};
    });
    overlay.addEventListener('pointermove',e=>{
      const pt=coords(e);
      if(g.pointers.has(e.pointerId))g.pointers.set(e.pointerId,pt);
      if(g.drag?.id===e.pointerId){
        const deltaX=pt.x-g.drag.lastX,deltaY=pt.y-g.drag.lastY;
        if(Math.hypot(pt.x-g.drag.startX,pt.y-g.drag.startY)>5)g.drag.moved=true;
        if(g.drag.moved){
          const q=globeGeometry(g);
          g.lon=globeLon(g.lon-deltaX/q.r*60);
          g.lat=globeClamp(g.lat+deltaY/q.r*60,-86,86);
          draw3DMap();
        }
        g.drag.lastX=pt.x;g.drag.lastY=pt.y;
        return;
      }
      g.hoverId=null;
      for(const site of mapVisibleSites()){const p=projectOnGlobe(g,site.lat,site.lon);if(p.depth>0&&Math.hypot(p.x-pt.x,p.y-pt.y)<15){g.hoverId=site.id;break;}}
      const point=geoFromGlobe(g,pt.x,pt.y);
      overlay.style.cursor=g.hoverId?'pointer':(point?(state.pickMode?'crosshair':'grab'):'default');
      $('mapBottomNote').textContent=point?`${point.lat.toFixed(5)}°, ${point.lon.toFixed(5)}° · ${g.hoverId?'คลิกเพื่อเลือกพื้นที่':state.pickMode?'คลิกเพื่อเพิ่มพิกัด':'ลากเพื่อหมุนลูกโลก'}`:'ลากลูกโลกเพื่อหมุน · เลือกจุดเพื่อดูข้อมูล';
      drawGlobeOverlay(g);
    });
    function finishPointer(e){
      const pt=coords(e),drag=g.drag,clicked=drag?.id===e.pointerId&&!drag.moved;
      g.pointers.delete(e.pointerId);g.drag=null;
      if(!clicked)return;
      for(const site of mapVisibleSites()){
        const m=projectOnGlobe(g,site.lat,site.lon);
        if(m.depth>0&&Math.hypot(pt.x-m.x,pt.y-m.y)<16){setSite(site.id,{fetchCloud:true});return;}
      }
      const point=geoFromGlobe(g,pt.x,pt.y);
      if(point&&state.pickMode)openSiteModal(null,point);
    }
    overlay.addEventListener('pointerup',finishPointer);
    overlay.addEventListener('pointercancel',e=>{g.pointers.delete(e.pointerId);g.drag=null;});
    overlay.addEventListener('pointerleave',()=>{g.hoverId=null;drawGlobeOverlay(g)});
    overlay.addEventListener('wheel',e=>{e.preventDefault();g.zoom=globeClamp(g.zoom*Math.exp(-e.deltaY*.0011),.62,2.5);draw3DMap();},{passive:false});
    overlay.addEventListener('dblclick',e=>{e.preventDefault();g.zoom=globeClamp(g.zoom*1.4,.62,2.5);draw3DMap();});
    overlay.addEventListener('keydown',e=>{
      if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        if(e.key==='+'||e.key==='=')g.zoom=globeClamp(g.zoom*1.3,.62,2.5);
        else if(e.key==='-')g.zoom=globeClamp(g.zoom/1.3,.62,2.5);
        else if(e.key==='0'){g.lat=15;g.lon=5;g.zoom=1;}
        else if(e.key==='ArrowLeft')g.lon=globeLon(g.lon-10);
        else if(e.key==='ArrowRight')g.lon=globeLon(g.lon+10);
        else if(e.key==='ArrowUp')g.lat=globeClamp(g.lat+10,-86,86);
        else if(e.key==='ArrowDown')g.lat=globeClamp(g.lat-10,-86,86);
        draw3DMap();e.preventDefault();
      }
    });
    resize3D();
    return true;
  }
  function resize3D(){
    const g=state.globe;if(!g)return;
    const box=g.host.getBoundingClientRect();
    if(box.width<2||box.height<2)return;
    g.w=box.width;g.h=box.height;g.dpr=Math.min(2,window.devicePixelRatio||1);
    for(const c of [g.canvas,g.overlay]){c.width=Math.round(g.w*g.dpr);c.height=Math.round(g.h*g.dpr);}
    g.overlayCtx.setTransform(g.dpr,0,0,g.dpr,0,0);
    if(g.cpuCtx)g.cpuCtx.setTransform(g.dpr,0,0,g.dpr,0,0);
    draw3DMap();
  }
  function update3DMarkers(){drawGlobeOverlay(state.globe||{});}
  function mapMode(mode){
    if(mode==='3d'){
      $('map2d').classList.add('hidden');$('map3d').classList.remove('hidden');
      if(!setup3DMap()){
        toast('ไม่สามารถเริ่มตัวแสดงลูกโลกได้','warn');
        $('map3d').classList.add('hidden');mapMode('2d');return;
      }
      state.mapMode='3d';
      resize3D();centerSite();
    }else{
      $('map3d').classList.add('hidden');$('map2d').classList.remove('hidden');
      state.mapMode='2d';
      setTimeout(resize2DMap,70);
    }
    $('show2d').classList.toggle('active',mode==='2d');$('show3d').classList.toggle('active',mode==='3d');
    $('show2d').setAttribute('aria-pressed',mode==='2d'?'true':'false');$('show3d').setAttribute('aria-pressed',mode==='3d'?'true':'false');
    $('mapModeName').textContent=mode==='3d'?'3D Earth Globe · Local':'2D World Map · Local';
    $('mapAttribution').textContent=mode==='3d'?'3D globe · Natural Earth (embedded) · GPU or CPU':'2D map · Natural Earth (embedded) · no external tiles';
  }
  function centerSite(){
    const s=selectedSite();if(!hasCoords(s))return;
    if(state.mapMode==='3d'&&state.globe){
      const g=state.globe;g.lat=globeClamp(s.lat,-86,86);g.lon=s.lon;g.zoom=Math.max(g.zoom,1.05);draw3DMap();
    }else if(state.map){const m=state.map;m.centerLat=s.lat;m.centerLon=s.lon;m.zoom=Math.max(m.zoom,2.8);clampMapCenter();draw2DMap();}
  }
  function zoomAll(){
    if(state.mapMode==='3d'&&state.globe){
      const g=state.globe;g.lat=15;g.lon=5;g.zoom=1;draw3DMap();return;
    }
    const m=state.map;if(!m)return;
    const visible=mapVisibleSites();if(!visible.length){reset2DMap();return;}
    const lons=visible.map(s=>s.lon),lats=visible.map(s=>s.lat);
    const minLon=Math.min(...lons),maxLon=Math.max(...lons),minLat=Math.min(...lats),maxLat=Math.max(...lats);
    m.zoom=Math.min(10,Math.max(1,Math.min((m.width-85)/Math.max(8,maxLon-minLon),(m.height-85)/Math.max(8,maxLat-minLat))/mapScale({...m,zoom:1})));
    m.centerLon=(minLon+maxLon)/2;m.centerLat=(minLat+maxLat)/2;clampMapCenter();draw2DMap();
  }
  // Quick Planner holds ONE temporary target in memory. Nothing is saved until the user
  // explicitly opens the Add Site dialog and supplies a name.
  const QUICK_SITE_ID='__useful_quick_preview__';
  function previewQuickSite(lat,lon){
    lat=Number(lat);lon=Number(lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat > 90||lon < -180||lon > 180)
      throw new Error('Invalid WGS84 position (Latitude −90…90; Longitude −180…180).');
    const existing=state.sites.findIndex(s=>s.id===QUICK_SITE_ID);
    const site={id:QUICK_SITE_ID,name:`Quick Site ${lat.toFixed(5)}, ${lon.toFixed(5)}`,lat,lon,
      active:true,type:'Other',country:'Temporary preview',notes:'Quick Planner · browser session only · not saved',
      quickPreview:true,defaultOrder:0};
    if(existing===-1)state.sites.unshift(site);else state.sites[existing]=site;
    state.weather.delete(QUICK_SITE_ID);state.tle.results.delete(QUICK_SITE_ID);
    state.selectedSiteId=QUICK_SITE_ID;state.siteFilter=QUICK_SITE_ID;
    renderAll();centerSite();
    return {...site};
  }
  function openSiteModal(id=null,point=null){
    const s=id?siteForId(id):null;
    $('siteModalTitle').textContent=s?'แก้ไขพื้นที่ Cal/Val':'เพิ่มพื้นที่ Cal/Val';
    $('siteId').value=s?.id||'';
    $('siteName').value=s?.name||'';
    $('siteLat').value=point?point.lat.toFixed(6):s?.lat??'';
    $('siteLon').value=point?point.lon.toFixed(6):s?.lon??'';
    $('siteCountry').value=s?.country||'';
    window.UsefulFleet?.renderTypes?.();
    if(s?.type && !Array.from($('siteType').options).some(o=>o.value===s.type))$('siteType').add(new Option(s.type,s.type));
    $('siteType').value=s?.type||'Radiometric';$('siteNotes').value=s?.notes||'';
    $('siteActive').checked=s ? isSiteActive(s) : true;
    $('siteSourceNote').textContent=s?.sourceRow?`Source: T2V Calibration Sites.xlsx · 2026 Calibration Sites · row ${s.sourceRow} · Validate=${s.sourceValidate} (not an operational status)`:'New site · Active means enabled for planning only';
    $('siteModal').hidden=false;setTimeout(()=>$('siteName').focus(),40);
  }
  function closeModal(id){$(id).hidden=true;}
  function handleSiteSave(e){
    e.preventDefault();
    const oldId=$('siteId').value,original=siteForId(oldId);
    const lat=$('siteLat').value.trim()===''?null:Number($('siteLat').value),lon=$('siteLon').value.trim()===''?null:Number($('siteLon').value);
    const active=$('siteActive').checked;
    const item=validateSite({...original,id:oldId||makeId(),name:$('siteName').value,lat,lon,active,country:$('siteCountry').value,type:$('siteType').value,notes:$('siteNotes').value});
    if(!item){toast('พิกัดไม่ถูกต้อง: Latitude -90 ถึง 90, Longitude -180 ถึง 180','warn');return;}
    if(oldId){const ix=state.sites.findIndex(s=>s.id===oldId);if(ix>=0)state.sites[ix]=item;state.weather.delete(oldId);}
    else {state.sites=state.sites.filter(s=>!s.quickPreview);state.sites.push(item);state.siteFilter=item.id;}
    state.selectedSiteId=item.id;saveSites();closeModal('siteModal');renderAll();
    if(hasCoords(item))centerSite();if(isSiteActive(item)&&hasCoords(item))updateWeather(true);toast((oldId?'แก้ไข':'บันทึก')+'พื้นที่ '+item.name+' สำเร็จ · บันทึกในเบราว์เซอร์');
  }
  function deleteSite(id){
    const site=siteForId(id);if(!site)return;
    if(!confirm(`ลบพื้นที่ ${site.name} จากเบราว์เซอร์นี้?\n(ข้อมูล Excel จะยังอยู่ แต่ไม่จับคู่พิกัดจนกว่าจะเพิ่มพื้นที่อีกครั้ง)`))return;
    state.sites=state.sites.filter(s=>s.id!==id);state.weather.delete(id);
    if(state.selectedSiteId===id)state.selectedSiteId=plannableSites()[0]?.id||state.sites[0]?.id||null;
    if(state.siteFilter===id)state.siteFilter='all';
    saveSites();renderAll();updateWeather(false);toast('ลบพื้นที่แล้ว');
  }
  function openEventModal(){
    if(!plannableSites().length){toast('กรุณาเปิดใช้งานพื้นที่ Active ที่มีพิกัดก่อนสร้างแผน','warn');openSiteModal();return;}
    buildSiteOptions();$('eventSite').value=plannableSites().some(s=>s.id===state.selectedSiteId)?state.selectedSiteId:plannableSites()[0].id;
    $('eventDate').value=state.selectedDate||todayKey();$('eventTime').value='10:00';$('eventOff').value='';$('eventOrbit').value='';$('eventNotes').value='';$('eventModal').hidden=false;
  }
  function handleEventSave(e){
    e.preventDefault();
    const site=siteForId($('eventSite').value);if(!site||!isSiteActive(site)||!hasCoords(site)){toast('เลือกพื้นที่ Active ที่มีพิกัดก่อน','warn');return;}
    const off=$('eventOff').value.trim();
    const utcISO=utcFromOffset($('eventDate').value,$('eventTime').value||'00:00',0);
    const selectedSat=window.UsefulFleet?.selectedSatellite?.();
    const record=validateEvent({id:makeId(),siteId:site.id,siteName:site.name,file:'',date:$('eventDate').value,time:$('eventTime').value,utcISO:utcISO||'',timeBasis:'UTC',off:off===''?null:Number(off),orbit:$('eventOrbit').value,notes:$('eventNotes').value,source:'manual',satelliteName:selectedSat?.name||'',satelliteNorad:selectedSat?.norad||''});
    if(!record){toast('ข้อมูลแผนถ่ายภาพไม่ถูกต้อง','warn');return;}
    state.opportunities.push(record);refreshDemoState();saveEvents();
    state.month=viewKey(record.date);state.selectedDate=record.date;closeModal('eventModal');renderAll();toast('เพิ่มแผนถ่ายภาพแล้ว (สถานะ Proposed / Local)');
  }
  function deleteEvent(id){
    const e=state.opportunities.find(e=>e.id===id&&e.source==='manual');if(!e)return;
    if(!confirm('ลบรายการแผนถ่ายภาพนี้?'))return;
    state.opportunities=state.opportunities.filter(e=>e.id!==id);saveEvents();renderAll();toast('ลบรายการแล้ว');
  }
  function parseLocalTime(v){
    if(v==null||v==='')return null;
    if(typeof v==='number'&&window.XLSX?.SSF){const o=XLSX.SSF.parse_date_code(v);if(o)return {date:keyUTC(o.y,o.m,o.d),time:pad2(o.H)+':'+pad2(o.M)};}
    if(v instanceof Date&&!isNaN(v)){return {date:keyUTC(v.getFullYear(),v.getMonth()+1,v.getDate()),time:pad2(v.getHours())+':'+pad2(v.getMinutes())};}
    const s=String(v).trim();
    let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
    if(m)return{date:keyUTC(+m[1],+m[2],+m[3]),time:m[4]?pad2(+m[4])+':'+m[5]:''};
    m=s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[\s,]+(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
    if(m){let H=Number(m[4]);const ap=(m[6]||'').toUpperCase();if(ap==='PM'&&H<12)H+=12;if(ap==='AM'&&H===12)H=0;return{date:keyUTC(+m[3],+m[1],+m[2]),time:pad2(H)+':'+m[5]};}
    return null;
  }
  function csvParse(text){
    // CSV with quoted commas, doubled quotes, and CRLF; handles regular one-sheet exports.
    let rows=[],current=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted;}
      else if(!quoted&&c===','){current.push(field);field=''}
      else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;current.push(field);if(current.some(x=>x.trim()))rows.push(current);field='';current=[];}
      else field+=c;
    }
    current.push(field);if(current.some(x=>x.trim()))rows.push(current);
    const headings=rows.shift()||[];return rows.map(r=>Object.fromEntries(headings.map((h,i)=>[h,r[i]||''])));
  }
  async function importOneFile(file,origin='browser'){
    let data;
    const filename=file.name;
    if(/\.csv$/i.test(filename)){
      const raw=await file.text();data=window.XLSX?XLSX.utils.sheet_to_json(XLSX.read(raw,{type:'string'}).Sheets.Sheet1||Object.values(XLSX.read(raw,{type:'string'}).Sheets)[0],{defval:null}):csvParse(raw.replace(/^\ufeff/,''));
    }else{
      if(!window.XLSX)throw new Error('Excel library could not be loaded; connect to the internet');
      const buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array',cellDates:false});
      const ws=wb.Sheets[wb.SheetNames[0]];data=XLSX.utils.sheet_to_json(ws,{defval:null});
    }
    if(!data?.length)throw new Error('Empty file');
    const keys=Object.keys(data[0]);const find=re=>keys.find(k=>re.test(k));
    const kOff=find(/off.?nadir/i), kUTC=find(/(?:utc.*(?:time|date)|(?:time|date).*utc)/i),kLocal=find(/local\s*time/i),kTime=kUTC||kLocal,kOrbit=find(/orbit/i),kCity=find(/city/i),kCloud=find(/cloud\s*forecast/i),
      kSatellite=find(/^(?:satellite|sat(?:ellite)?[ _-]*(?:name|id)|platform|spacecraft|norad(?:[ _-]*id)?|mission)(?:\b|[ _-])/i);
    if(!kOff||!kTime)throw new Error('Missing required columns UTC Time or Local Time / Off-nadir');
    const rootName=filename.replace(/\.(xlsx|xls|csv)$/i,'');
    const matching=state.sites.find(s=>nameKey(s.name)===nameKey(rootName));
    const entries=[];
    for(const row of data){
      const t=parseLocalTime(row[kTime]);let utcISO=null;
      if(kUTC && typeof row[kTime]==='string' && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(row[kTime])){const parsed=new Date(row[kTime]);if(Number.isFinite(parsed.getTime()))utcISO=parsed.toISOString();}
      if(!utcISO && t?.date)utcISO=utcFromOffset(t.date,t.time||'00:00',kUTC?0:state.excelOffset);
      const off=row[kOff]===null||row[kOff]===''?null:Number(String(row[kOff]).replace('°',''));
      if(!utcISO||!Number.isFinite(off)||off<0||off>90)continue;
      const cv=kCloud&&row[kCloud]!=null&&row[kCloud]!==''?Number(row[kCloud]):null;
      const sat=window.UsefulIntegrity.sourceSatellite(kSatellite?row[kSatellite]:'',rootName);
      entries.push({id:makeId(),siteId:matching?.id||'',siteName:rootName,file:rootName,...fromISO(utcISO),sourceOffsetHours:kUTC?0:state.excelOffset,off,orbit:String(kOrbit?row[kOrbit]??'':''),notes:kCity&&row[kCity]?String(row[kCity]):'',fileCloud:Number.isFinite(cv)?cv:null,source:'excel',origin,satelliteName:sat.name,satelliteNorad:sat.norad});
    }
    if(!entries.length)throw new Error('No valid dates or off-nadir records');
    // Browser files take precedence over repository files of the same name.
    const hadBrowser=state.opportunities.some(e=>e.source==='excel'&&e.origin==='browser'&&e.file===rootName);
    if(origin==='repo'&&hadBrowser)return 0;
    state.opportunities=state.opportunities.filter(e=>!(e.source==='excel'&&e.file===rootName));
    state.opportunities.push(...entries);refreshDemoState();if(origin==='browser')saveEvents();
    return entries.length;
  }
  async function importFiles(files,origin='browser'){
    let total=0,fail=[];
    for(const f of files){try{total+=await importOneFile(f,origin)}catch(err){fail.push(`${f.name}: ${err.message}`)}}
    if(total){
      if(state.opportunities.filter(e=>e.source==='excel').length){
        const earliest=state.opportunities.filter(e=>e.source==='excel').map(e=>e.date).sort()[0];
        if(state.month&&earliest&&!state.opportunities.some(e=>e.date.startsWith(state.month))) {state.month=viewKey(earliest);state.selectedDate=earliest;}
      }
      renderAll();toast(`นำเข้าสำเร็จ ${total} รายการ จาก ${files.length} ไฟล์${origin==='repo'?' (GitHub)':''}`);
    }
    if(fail.length){console.warn('Import failures:',fail);toast(fail.slice(0,2).join('; '),'warn');}
    return total;
  }
  async function autoLoadExcel(){
    let urls=[];
    try{const r=await fetch('./xlsx/index.json',{cache:'no-store'});if(r.ok){const list=await r.json();if(Array.isArray(list))urls=list.filter(n=>/\.xlsx?$/i.test(n)).map(n=>({name:n,url:'./xlsx/'+encodeURIComponent(n)}));}}catch(e){}
    if(!urls.length){
      const match=location.hostname.match(/^([^.]+)\.github\.io$/i);
      if(match){
        const repo=location.pathname.split('/').filter(Boolean)[0]||match[1]+'.github.io';
        try{
          const r=await fetch('https://api.github.com/repos/'+encodeURIComponent(match[1])+'/'+encodeURIComponent(repo)+'/contents/xlsx');
          if(r.ok){const items=await r.json();if(Array.isArray(items))urls=items.filter(x=>x.type==='file'&&/\.xlsx?$/i.test(x.name)).map(x=>({name:x.name,url:x.download_url}));}
        }catch(e){/* optional auto import */}
      }
    }
    if(!urls.length){state.importStatus='GitHub Excel not found · manual import available';renderImportedFiles();return;}
    const files=[];
    for(const item of urls){
      try{const r=await fetch(item.url);if(!r.ok)continue;const buff=await r.arrayBuffer();files.push({name:item.name,arrayBuffer:async()=>buff,text:async()=>new TextDecoder().decode(buff)});}catch(e){console.warn('Could not load',item.name,e)}
    }
    if(files.length){await importFiles(files,'repo');state.importStatus=`GitHub xlsx/ · ${files.length} source file(s)`;renderImportedFiles();}
  }
  function csvEncode(rows){return window.UsefulIntegrity.csvEncode(rows);}
  function rowsForExport(){
    return visibleEvents().filter(e=>e.date.startsWith(state.month)&&e.timeBasis==='UTC'&&e.source!=='demo');
  }
  function exportCSV(){
    const rows=[['Date (UTC)','Time (UTC)','Site','Latitude','Longitude','Orbit','Off-nadir (deg)','Direction (ASC/DESC)','Status / Source','Cloud forecast from Excel (%)','Cloud cover from Open-Meteo (%)','Notes','Satellite (source)']];
    rowsForExport().forEach(e=>{
      const s=siteForEvent(e),c=s?getCloudHour(s.id,e.date,e.time):null;
      rows.push([e.date,e.time,e.siteName||s?.name||e.file,s?.lat??'',s?.lon??'',e.orbit,e.off??'',calendarDirection(e),e.source,e.fileCloud??'',c==null?'':Math.round(c),(e.timeBasis==='UTC'?'': '[UTC unverified: legacy local time] ')+(e.notes||''),
        ['tle','repeat26'].includes(e.source)?(window.UsefulFleet?.selectedSatellite()?.name||'THEOS-2'):(window.UsefulIntegrity.sourceSatellite(e.satelliteName||e.satelliteNorad||'',e.file||'').name||'Not specified')]);
    });
    downloadFile(`THEOS2_CalVal_${state.month}.csv`,csvEncode(rows),'text/csv');toast('ส่งออก CSV แล้ว');
  }
  function exportExcel(){
    if(!window.XLSX){toast('Excel library ไม่พร้อม — ใช้ CSV แทนได้','warn');exportCSV();return;}
    const rows=[['Date (UTC)','Time (UTC)','Site','Latitude','Longitude','Orbit','Off-nadir (deg)','Direction (ASC/DESC)','Status / Source','Cloud forecast Excel (%)','Cloud model (%)','Notes','Satellite (source)']];
    rowsForExport().forEach(e=>{
      const s=siteForEvent(e),c=s?getCloudHour(s.id,e.date,e.time):null;
      rows.push([e.date,e.time,e.siteName||s?.name||e.file,s?.lat??'',s?.lon??'',e.orbit,e.off??'',calendarDirection(e),e.source,e.fileCloud??'',c==null?'':+c.toFixed(1),(e.timeBasis==='UTC'?'': '[UTC unverified: legacy local time] ')+(e.notes||''),
        ['tle','repeat26'].includes(e.source)?(window.UsefulFleet?.selectedSatellite()?.name||'THEOS-2'):(window.UsefulIntegrity.sourceSatellite(e.satelliteName||e.satelliteNorad||'',e.file||'').name||'Not specified')]);
    });
    const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(window.UsefulIntegrity.sheetRows(rows));ws['!cols']=[{wch:14},{wch:12},{wch:24},{wch:13},{wch:13},{wch:15},{wch:19},{wch:15},{wch:16},{wch:18},{wch:15},{wch:40},{wch:22}];
    XLSX.utils.book_append_sheet(wb,ws,'Acquisition Planner');XLSX.writeFile(wb,'THEOS2_CalVal_Planning.xlsx');toast('ส่งออก Excel แล้ว');
  }
  function exportSites(){
    downloadFile('sites.json',JSON.stringify({version:1,description:'Shared Cal/Val site registry — coordinates WGS84',sites:state.sites.filter(s=>!s.quickPreview)},null,2));
    toast('ส่งออก sites.json — นำไฟล์ไป Commit ใน GitHub เพื่อแชร์พื้นที่ให้ทีม');
  }
  function exportEventsJSON(){
    const actual=state.opportunities.filter(e=>e.source!=='demo'&&e.source!=='cycle');
    downloadFile('theos2_planning_backup.json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),events:actual},null,2));toast('สำรองแผนงาน JSON แล้ว');
  }
  async function importJson(file){
    try{
      const data=JSON.parse(await file.text());
      if(Array.isArray(data.sites)){
        const valid=data.sites.map(validateSite).filter(Boolean);if(!valid.length)throw new Error('No valid sites');
        if(!confirm(`แทนที่ข้อมูลพื้นที่ในเบราว์เซอร์ด้วย ${valid.length} พื้นที่จาก JSON?`))return;
        state.sites=valid;state.selectedSiteId=valid[0].id;state.siteFilter='all';state.weather.clear();saveSites();renderAll();updateWeather();toast('นำเข้ารายการพื้นที่แล้ว '+valid.length+' แห่ง');return;
      }
      if(Array.isArray(data.events)){
        const valid=data.events.map(validateEvent).filter(Boolean);if(!valid.length)throw new Error('No valid events');
        if(!confirm(`นำเข้ารายการแผน ${valid.length} รายการ (เพิ่มหรือแทนที่ ID เดิม)?`))return;
        state.opportunities=state.opportunities.filter(e=>e.source!=='demo');
        const ids=new Set(valid.map(e=>e.id));state.opportunities=state.opportunities.filter(e=>!ids.has(e.id)).concat(valid);
        saveEvents();renderAll();toast('นำเข้าแผนงาน '+valid.length+' รายการ');return;
      }
      throw new Error('Expected {sites:[...]} or {events:[...]}');
    }catch(err){toast('เปิด JSON ไม่สำเร็จ: '+err.message,'error');}
  }
  function setTLEStatus(message,level=''){
    state.tle.status=message;
    $('tleStatus').textContent=message;
    $('tleStatus').className='tle-status'+(level?' '+level:'');
  }
  function renderTLE(){
    const t=state.tle;
    $('autoTleLabel').textContent=t.enabled?'Auto TLE: ON':'Auto TLE: OFF';
    $('autoTle').checked=t.enabled;
    $('tleSource').textContent=(window.UsefulFleet?.selectedSatellite()?.name||'THEOS-2')+' · '+(t.data?.source||'GitHub orbit cache');
    $('tleEpoch').textContent='Epoch UTC: '+(t.data?.epochISO||'—');
    $('tleSite').textContent=selectedSite()?.name.replace(/_/g,' ')||'—';
    const nr=t.events.filter(e=>e.source==='tle').length,rr=t.events.filter(e=>e.source==='repeat26').length;
    $('tleResults').textContent=`${nr} TLE (16d) · ${rr} repeat (26d) · selected site`;
    renderTLEPreview();
    if(t.status==='off')setTLEStatus('Auto TLE is off. Enable to estimate near-term orbital candidates and any configured repeat-cycle proxy.');
  }
  function renderTLEPreview(){
    const container=$('tlePreviewBody');if(!container)return;
    const filter=$('tlePreviewSiteFilter')?.value||'all';
    const method=$('tlePreviewMethod')?.value||'all';
    const all=state.tle.previewEvents?.length?state.tle.previewEvents:state.tle.events;
    const events=all.filter(e=>(filter==='all'||e.siteId===filter)&&(method==='all'||e.source===method)&&Boolean(e.utcISO)&&Number.isFinite(Number(e.off))&&e.off!==null&&e.off!==''&&Number.isFinite(Number(e.groundDistanceKm))).slice().sort((a,b)=>a.utcISO.localeCompare(b.utcISO));
    const result=state.tle.results.get(selectedSite()?.id);
    $('tleCoverage').textContent=state.tle.lastError||
      (result?.windowEnd?`SGP4 day 1–16: ${result.windowStart} → ${result.windowEnd} · ${result.repeatDays?`≥day 17: ${result.repeatDays}-day repeat proxy · LOW CONFIDENCE`:'No ground-track repeat cycle defined'}`:
       'No calculated orbit coverage yet · choose Refresh TLE');
    if(!events.length){container.innerHTML=`<tr><td colspan="5" class="tle-empty">${isEnglish()?'No candidate calculated. Check TLE or max angle.':'ยังไม่พบโอกาสผ่านพื้นที่ ตรวจ TLE หรือเพิ่มเกณฑ์มุม'}</td></tr>`;return;}
    container.innerHTML=events.slice(0,100).map(e=>{
      const repeat=e.source==='repeat26',meth=repeat?'≈ '+(e.repeatDays||26)+'-DAY REPEAT':'SGP4 · TLE16';
      return `<tr><td>${esc(e.siteName)}</td><td class="mono orbit-primary">${repeat?'≈ ':''}${esc(e.utcISO.replace('T',' ').slice(0,19))} UTC</td><td class="orbit-primary">${repeat?'≈ ':''}${e.off.toFixed(repeat?1:2)}°</td><td>${repeat?'≈ ':''}${e.groundDistanceKm.toFixed(repeat?1:2)} km</td><td><span class="orbit-tag ${repeat?'orbit-repeat':''}" title="${repeat?'Repeat-cycle reference angle/time; low confidence':'TLE-propagated geometric time/angle; may degrade after 72h'}">${meth}</span></td></tr>`;
    }).join('');
  }
  function tleCacheKey(site){
    return [state.tle.data?.norad||'58016',state.tle.data?.epochISO,state.tle.data?.text?.slice(0,30)||state.tle.data?.omm?.EPOCH,site.id,site.lat,site.lon,state.tle.maxOff,window.UsefulFleet?.selectedSatellite()?.repeatCycleDays||'none'].join('|');
  }
  async function ensureTLEForSites(sites,{force=false,horizonDays=30}={}){
    const t=state.tle;
    sites=sites.filter(s=>isSiteActive(s)&&hasCoords(s));
    if(!sites.length)throw new Error('No Active sites with valid coordinates');
    if(!t.enabled){t.enabled=true;localStorage.setItem(STORAGE.tle,'1');$('autoTle').checked=true;}
    const job=++t.batchJob;t.job++;t.exportBusy=true;t.lastError='';
    $('export30Days').disabled=true;$('export1Year').disabled=true;$('calculateAllSites').disabled=true;
    try{
      if(!t.data || force || window.PlannerOrbit.validity(t.data).reason!=='OK'){
        setTLEStatus('Loading current THEOS-2 TLE from CelesTrak / GitHub cache…');
        t.data=await (window.UsefulFleet?window.UsefulFleet.getSelectedElements({force:force||Boolean(t.data)}):window.PlannerOrbit.loadTLE({refresh:force||Boolean(t.data)}));
        t.results.clear();
      }
      const nowMs=Date.now(),valid=window.PlannerOrbit.validity(t.data,{nowMs});
      if(valid.reason!=='OK')throw new Error(`STALE TLE: Epoch ${t.data.epochISO}; ${Math.abs(valid.ageHours).toFixed(1)} hours from now. Refresh orbit elements.`);
      await window.PlannerOrbit.sgp4Library();
      const cached=sites.every(site=>{const x=t.results.get(site.id);return !force&&x?.cacheKey===tleCacheKey(site)&&x?.horizonDays>=horizonDays&&Date.now()-x.computedAt<5*60*1000});
      let resultMap;
      if(cached)resultMap=new Map(sites.map(site=>[site.id,t.results.get(site.id)]));
      else{
        resultMap=await window.PlannerOrbit.predictBatchHybrid(t.data,sites,t.maxOff,{
          nowMs,days:horizonDays,repeatCycleDays:window.UsefulFleet?.selectedSatellite()?.repeatCycleDays??null,shouldCancel:()=>job!==t.batchJob,
          onProgress:msg=>setTLEStatus(msg+' · Geometrical screening only')
        });
        for(const [id,result] of resultMap){resultMap.set(id,{...result,cacheKey:tleCacheKey(siteForId(id)),horizonDays,computedAt:Date.now()});}
      }
      if(job!==t.batchJob)throw new Error('Superseded');
      if(window.UsefulFleet?.selectedSatellite()?.norad && String(window.UsefulFleet.selectedSatellite().norad)!==String(t.data?.norad||''))
        throw new Error('Satellite selection changed during orbit calculation; refresh candidates');
      for(const [id,result] of resultMap)t.results.set(id,result);
      t.events=t.results.get(selectedSite()?.id)?.events||[];
      t.previewEvents=[...resultMap.values()].flatMap(r=>r.events||[]);
      const tleCount=t.previewEvents.filter(e=>e.source==='tle').length;
      const repeatCount=t.previewEvents.filter(e=>e.source==='repeat26').length;
      const cycle=window.UsefulFleet?.selectedSatellite()?.repeatCycleDays??null;
      setTLEStatus(`${sites.length} site(s) · ${tleCount} TLE candidates (days 1–16) + ${repeatCount} ${cycle||'no'}-day cycle proxy candidates. Repeated times/angles: LOW CONFIDENCE, NOT TASKING.`,'good');
      renderTLE();renderStats();renderCalendar();renderDaily();renderCompactResults();
      return resultMap;
    }catch(err){
      t.lastError='TLE/SGP4 unavailable: '+err.message;
      setTLEStatus(t.lastError,'warn');renderTLE();
      throw err;
    }finally{
      if(job===t.batchJob){t.exportBusy=false;
       $('export30Days').disabled=false;$('export1Year').disabled=false;$('calculateAllSites').disabled=false;}
    }
  }
  async function loadAutoTLE(forceRefresh=false){
    const t=state.tle;if(!t.enabled)return;
    const job=++t.job;t.loading=true;t.events=[];
    setTLEStatus('Retrieving orbital elements for '+(window.UsefulFleet?.selectedSatellite()?.name||'THEOS-2')+'; checking local repository first.');renderTLE();
    try{
      t.data=await (window.UsefulFleet?window.UsefulFleet.getSelectedElements({force:forceRefresh}):window.PlannerOrbit.loadTLE({refresh:forceRefresh}));
      if(job!==t.job||!t.enabled)return;
      t.loading=false;await computeTLECandidates();
    }catch(err){
      if(job!==t.job)return;
      t.loading=false;t.events=[];t.lastError='TLE unavailable: '+err.message;setTLEStatus('Auto TLE unavailable: '+err.message,'warn');renderTLE();renderCalendar();renderDaily();
    }
  }
  async function computeTLECandidates(){
    const t=state.tle,site=selectedSite();if(!t.enabled||!t.data||!hasCoords(site)||!isSiteActive(site))return;
    const job=++t.job;t.loading=true;
    setTLEStatus(`Computing near-term TLE and optional ground-track repeat for ${site.name.replace(/_/g,' ')} · max off-nadir ${t.maxOff}°`);
    try{
      const result=await window.PlannerOrbit.predict(t.data,site,t.maxOff,{days:365,shouldCancel:()=>job!==t.job});
      if(job!==t.job||!t.enabled)return;
      t.loading=false;t.lastError='';
      if(result.reason!=='OK'){
        t.events=[];setTLEStatus(`TLE ${result.reason} · Epoch ${result.epochISO}. Refresh current TLE before calculating 16-day candidates.`,'warn');
      }else{
        t.events=result.events;t.previewEvents=[];
        t.results.set(site.id,{...result,cacheKey:tleCacheKey(site),horizonDays:365,computedAt:Date.now()});
        setTLEStatus(`${site.name}: ${result.tleCount} TLE (first 16 days), ${result.repeatCount} repeat-cycle proxy candidates (${result.repeatDays||'undefined'} days) · Epoch ${result.epochISO} · Repeat times/angles are LOW CONFIDENCE.`,'good');
      }
      renderTLE();renderStats();renderCalendar();renderDaily();renderCompactResults();
    }catch(err){
      if(job!==t.job)return;
      t.loading=false;t.events=[];setTLEStatus('SGP4 prediction unavailable: '+err.message+' · Map Kepler/J2 preview is for visualization only; use current TLE and GitHub Actions to enable proper angle estimates.','warn');renderTLE();renderCalendar();renderDaily();
    }
  }
  function compactRows(days=30,siteSubset=null,predictions=null){
    const start=todayKey(),end=addDays(start,days);
    const sites=(siteSubset||((state.siteFilter==='all'?plannableSites():[siteForId(state.siteFilter)]))).filter(s=>isSiteActive(s)&&hasCoords(s)&&typeIsVisible(s));
    const predictionMap=predictions||state.tle.results;
    const rows=[],allowed=new Set(sites.map(s=>s.id));
    const selectedSat=window.UsefulFleet?.selectedSatellite?.()?.name||'THEOS-2';
    for(const site of sites){
      const orbit=predictionMap.get(site.id)?.events||[];
      for(const e of orbit){
        if(!['tle','repeat26'].includes(e.source))continue;
        if(!e.utcISO||e.off==null||e.off===''||!Number.isFinite(Number(e.off))||Number(e.off)>state.tle.maxOff||e.date<start||e.date>=end)continue;
        rows.push({satellite:selectedSat,date:e.date,time:e.utcISO.slice(11,19),site:site.name,lat:site.lat,lon:site.lon,
          off:Number(e.off),cloud:getCloudHour(site.id,e.date,e.utcISO.slice(11,19)),method:e.source,repeatDays:e.repeatDays||null,utcISO:e.utcISO,siteId:site.id,source:e.source,direction:e.direction||'UNKNOWN',
          epoch:e.tleEpochISO||state.tle.data?.epochISO||''});
      }
    }
    for(const e of state.opportunities){
      if(e.source==='demo'||e.source==='cycle'||e.timeBasis!=='UTC'||!e.utcISO||e.off==null)continue;
      const site=siteForEvent(e);if(!site||!allowed.has(site.id)||e.date<start||e.date>=end)continue;
      if(!Number.isFinite(Number(e.off))||Number(e.off)>state.tle.maxOff)continue;
      const origin=window.UsefulIntegrity.sourceSatellite(e.satelliteName||e.satelliteNorad||'',e.file||'');
      rows.push({satellite:origin.name||'Not specified',date:e.date,time:e.utcISO.slice(11,19),site:site.name,lat:site.lat,lon:site.lon,
        off:Number(e.off),direction:e.direction||'UNKNOWN',cloud:getCloudHour(site.id,e.date,e.utcISO.slice(11,19))??e.fileCloud??null,
        method:e.source,utcISO:e.utcISO,siteId:site.id,source:e.source,epoch:''});
    }
    const unique=new Map();for(const r of rows)unique.set([r.satellite,r.siteId,r.utcISO,r.method].join('|'),r);
    return [...unique.values()].filter(r=>directionScope()==='all'||r.direction===directionScope()).sort((a,b)=>a.utcISO.localeCompare(b.utcISO)||a.site.localeCompare(b.site));
  }
  function solarForRow(r){
    const sun=window.UsefulSolar?.at(new Date(r.utcISO),r.lat,r.lon);
    const surface=getRadiationHour(r.siteId,r.date,r.time);
    return {sun,surface};
  }
  function renderCompactResults(){
    const tbody=$('resultsBody');if(!tbody)return;
    const days=selectedHorizonDays(),includeSolar=Boolean($('resultsIncludeSolar')?.checked);
    const method=$('resultsMethod')?.value||'all';
    const requestedSites=state.siteFilter==='all'?plannableSites():[siteForId(state.siteFilter)].filter(x=>isSiteActive(x)&&hasCoords(x));
    const filtered=compactRows(days,requestedSites).filter(r=>method==='all'||r.method===method);
    const count=filtered.length;
    const summary=$('resultsSummary');if(summary)summary.textContent=count?
      `${count} ${isEnglish()?'qualified candidate rows':'รายการที่มีเวลาและมุมครบ'} · UTC · ${isEnglish()?'max off-nadir':'มุมสูงสุด'} ${state.tle.maxOff}° · ${isEnglish()?'forecast cloud only when available':'เมฆแสดงเฉพาะช่วงมีข้อมูล'}`:
      (isEnglish()?'No qualifying passes yet. Choose a site above and click Calculate.':'ยังไม่มีรายการที่ผ่านเกณฑ์ เลือกพื้นที่ด้านบนแล้วกดคำนวณ');
    document.querySelectorAll('[data-solar-column]').forEach(el=>el.hidden=!includeSolar);
    tbody.innerHTML=filtered.slice(0,250).map(r=>{
      const {sun,surface}=includeSolar?solarForRow(r):{sun:null,surface:null};
      const proxy=r.method==='repeat26';
      const category=String(siteForId(r.siteId)?.type||'Other');
      const categoryAccent=esc(window.UsefulFleet?.typeColor(category)||'#89a9b9');
      const orbitLabel=r.direction==='ASCENDING'?'<span class="orbit-tag is-asc">↑ ASC</span>':r.direction==='DESCENDING'?'<span class="orbit-tag is-desc">↓ DESC</span>':'';
      return `<tr><td><strong>${esc(r.satellite)}</strong><small class="report-method ${proxy?'proxy':''}">${proxy?'≈ '+(r.repeatDays||26)+'-day repeat':r.method==='tle'?'SGP4 / TLE':r.method==='manual'?'Manual / proposed':'Excel / imported'}</small></td><td class="mono">${esc(r.date)}</td><td class="mono">${esc(r.time)}</td>
        <td class="pass-site-td"><div class="pass-site-cell"><span class="pass-site-name" title="${esc(r.site)}">${esc(r.site)}</span>
          <div class="pass-site-meta"><span class="site-category" style="--site-color:${categoryAccent}"><i class="site-category-dot" aria-hidden="true"></i>${esc(category)}</span>${orbitLabel}</div></div></td>
        <td class="mono">${r.lat.toFixed(5)}</td><td class="mono">${r.lon.toFixed(5)}</td><td class="mono">${proxy?'≈ ':''}${r.off.toFixed(2)}°</td><td class="mono">${r.cloud==null?'—':Math.round(r.cloud)+'%'}</td>${includeSolar?`<td>${sun?.elevationDeg.toFixed(1)??'—'}°</td><td>${sun?Math.round(sun.toaHorizontalWm2):'—'}</td><td>${surface==null?'—':Math.round(surface)}</td>`:''}</tr>`;
    }).join('')||'<tr><td class="tle-empty" colspan="11">No eligible result with both UTC time and off-nadir angle. Missing and out-of-limit passes are excluded.</td></tr>';
    if($('resultsCoverage'))$('resultsCoverage').textContent=count>250?`Displaying first 250 of ${count} rows. CSV export includes all eligible rows.`:
      (isEnglish()?'TLE (≤16 days) and the configured repeat-cycle proxy have different uncertainty. Neither is confirmed tasking.':'TLE (ไม่เกิน 16 วัน) และแบบจำลองรอบซ้ำที่กำหนดมีความไม่แน่นอนต่างกัน ไม่ใช่แผนถ่ายจริง');
  }
  async function exportHorizon(days){
    if(state.tle.exportBusy){toast('Orbit processing is in progress','warn');return;}
    const sites=state.siteFilter==='all'?plannableSites():[siteForId(state.siteFilter)].filter(s=>isSiteActive(s)&&hasCoords(s));
    if(!sites.length){toast('No Active sites with coordinates','warn');return;}
    let pred=new Map(),error='';
    try{pred=await ensureTLEForSites(sites,{horizonDays:days});}catch(err){error=err.message;toast('TLE unavailable: '+error+' · exporting any verified manual/Excel entries','warn');}
    const method=$('resultsMethod')?.value||'all';
    const records=compactRows(days,sites,pred).filter(r=>method==='all'||r.method===method);
    const includeSolar=Boolean($('resultsIncludeSolar')?.checked);
    const headers=['Satellite','Date (UTC)','Time (UTC)','Test Site','Latitude (WGS84)','Longitude (WGS84)','Geometric Off-nadir (deg)','Cloud cover (%)'];
    if(includeSolar)headers.push('Solar elevation (deg)','TOA horizontal irradiance (W/m2, geometry)','Surface GHI (W/m2, model hourly mean)');
    const lines=[headers,...records.map(r=>{
      const base=[r.satellite,r.date,r.time,r.site,r.lat,r.lon,r.off.toFixed(2),r.cloud==null?'':Math.round(r.cloud)];
      if(includeSolar){const {sun,surface}=solarForRow(r);base.push(sun?sun.elevationDeg.toFixed(2):'',sun?sun.toaHorizontalWm2.toFixed(1):'',surface==null?'':surface.toFixed(1));}
      return base;
    })];
    const periodLabel=days===7?'7_Days':days===30?'30_Days':days===365?'1_Year':'3_Months';
    const fname=`USEFUL_Acquisition_${periodLabel}_${todayKey()}_v32.csv`;
    downloadFile(fname,csvEncode(lines),'text/csv');renderCompactResults();
    if($('orbitExportNotice'))$('orbitExportNotice').textContent=`v2.9 · ${records.length} eligible rows; out-of-angle, blank UTC, and missing-angle rows omitted. TLE first 16 days; THEOS-2 repeat proxy after day 16 (low confidence). ${error?'TLE warning: '+error:''}`;
    toast(`Exported ${records.length} complete estimated pass(es) · ${days} days · UTC${error?' · orbit source unavailable':''}`);
  }
  function exportOrbitPasses(){
    const rows=[['Site','UTC Timestamp (estimated / proxy)','UTC Time','Required geometric off-nadir (deg / proxy)',
      'Ground separation (km)','Pass ID (derived)','TLE epoch UTC','Prediction source','Confidence','Repeat-cycle anchor UTC','Repeat-cycle shifts','Status']];
    for(const result of state.tle.results.values())for(const e of result.events||[]){
      rows.push([e.siteName,e.utcISO,e.time,e.off,e.groundDistanceKm,e.passId,e.tleEpochISO,
        e.model,e.confidence||'',e.referenceUtcISO||'',e.repeatCycles||'',e.status]);
    }
    downloadFile(`USEFUL_Orbit_TLE16_Repeat26_${todayKey()}.csv`,csvEncode(rows),'text/csv');
    toast(`Exported ${rows.length-1} candidate(s). Repeat-cycle times/angles are heuristic proxies.`);
  }
  function bindUI(){
    $('siteTypeFilters')?.addEventListener('change',event=>{
      const checkbox=event.target.closest('input[data-site-type]');if(!checkbox)return;
      if(state.visibleSiteTypes===null)state.visibleSiteTypes=new Set(siteTypeList().map(type=>type.name));
      if(checkbox.checked)state.visibleSiteTypes.add(checkbox.dataset.siteType);
      else state.visibleSiteTypes.delete(checkbox.dataset.siteType);
      const available=siteTypeList();
      if(available.every(type=>state.visibleSiteTypes.has(type.name)))state.visibleSiteTypes=null;
      renderAll();
      const sites=plannableSites();if(state.selectedSiteId&&!sites.some(s=>s.id===state.selectedSiteId)&&sites.length)state.selectedSiteId=sites[0].id;
      renderFocus();
    });
    $('siteTypeSelectAll')?.addEventListener('click',()=>{state.visibleSiteTypes=null;renderAll();});
    document.querySelectorAll('[data-scroll]').forEach(el=>el.addEventListener('click',()=>{
      const target=$(el.dataset.scroll);if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
      document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('active',x===el));
    }));
    $('sidebarSites').addEventListener('click',e=>{const btn=e.target.closest('[data-site]');if(btn){setSite(btn.dataset.site,{filter:isSiteActive(siteForId(btn.dataset.site)),center:true});$('mapping').scrollIntoView({behavior:'smooth'});}});
    $('sidebarSiteSearch').addEventListener('input',e=>{state.sidebarQuery=e.target.value;renderSidebar();});
    $('sidebarStatusFilter').addEventListener('change',e=>{state.sidebarStatus=e.target.value;renderSidebar();});
    $('siteRegistrySearch').addEventListener('input',e=>{state.registryQuery=e.target.value;renderSiteTable();});
    $('siteRegistryFilter').addEventListener('change',e=>{state.registryFilter=e.target.value;renderSiteTable();});
    const showModal=()=>openSiteModal();
    ['addSiteTop','addSiteSection'].forEach(id=>$(id)?.addEventListener('click',showModal));
    $('focusEdit').addEventListener('click',()=>openSiteModal(state.selectedSiteId));
    $('focusAdd')?.addEventListener('click',()=>openSiteModal());
    $('focusCenter').addEventListener('click',()=>{centerSite();$('mapping').scrollIntoView({behavior:'smooth'});});
    $('show2d').addEventListener('click',()=>mapMode('2d'));$('show3d').addEventListener('click',()=>mapMode('3d'));
    $('zoomAll').addEventListener('click',zoomAll);
    $('togglePick').classList.toggle('active',state.pickMode);
    $('togglePick').addEventListener('click',()=>{state.pickMode=!state.pickMode;$('togglePick').classList.toggle('active',state.pickMode);toast(state.pickMode?'โหมดคลิกเพื่อเพิ่มพิกัด: เปิด':'โหมดคลิกเพื่อเพิ่มพิกัด: ปิด');});
    $('mapZoomIn').addEventListener('click',()=>{if(state.mapMode==='3d'&&state.globe){state.globe.zoom=globeClamp(state.globe.zoom*1.35,.62,2.5);draw3DMap();}else if(state.map)set2DZoom(state.map.zoom*1.5);});
    $('mapZoomOut').addEventListener('click',()=>{if(state.mapMode==='3d'&&state.globe){state.globe.zoom=globeClamp(state.globe.zoom/1.35,.62,2.5);draw3DMap();}else if(state.map)set2DZoom(state.map.zoom/1.5);});
    $('mapReset').addEventListener('click',()=>{if(state.mapMode==='3d')zoomAll();else reset2DMap();});
    $('refreshWeather').addEventListener('click',()=>updateWeather(true));$('refreshWeatherTop').addEventListener('click',()=>updateWeather(true));
    $('prevMonth').addEventListener('click',()=>moveMonth(-1));$('nextMonth').addEventListener('click',()=>moveMonth(1));
    $('goToday').addEventListener('click',()=>{const k=todayKey();state.month=k.slice(0,7);state.selectedDate=k;renderStats();renderCalendar();renderDaily();renderSolarContext();scheduleCalendarCompute();});
    $('filterSite').addEventListener('change',e=>{state.siteFilter=e.target.value;if(state.siteFilter!=='all')setSite(state.siteFilter,{filter:true});else{renderCompactResults();}});
    $('calendarSiteScope')?.addEventListener('change',e=>{state.calendarScope=e.target.value;renderCalendar();renderDaily();calculateCalendarScope();});
    $('calendarCalculate')?.addEventListener('click',()=>calculateCalendarScope({force:false}));
    $('filterAngle').addEventListener('change',e=>{state.angleFilter=e.target.value;renderCalendar();renderDaily();});
    $('showCycle').addEventListener('change',e=>{state.cycle=e.target.checked;renderCalendar();renderDaily();});
    $('moonThreshold').addEventListener('change',e=>{const v=Number(e.target.value);state.threshold=Number.isFinite(v)?Math.max(1,Math.min(30,Math.round(v))):10;e.target.value=state.threshold;renderStats();renderCalendar();renderDaily();});
    $('calendarGrid').addEventListener('click',e=>{const node=e.target.closest('[data-date]');if(!node)return;const before=state.month;state.selectedDate=node.dataset.date;state.month=node.dataset.date.slice(0,7);renderCalendar();renderDaily();renderSolarContext();if(before!==state.month)scheduleCalendarCompute();$('planningDetails')?.scrollIntoView({behavior:'smooth',block:'start'});});
    $('newOpportunity').addEventListener('click',openEventModal);
    $('dailyEntries').addEventListener('click',e=>{const node=e.target.closest('[data-deleteevent]');if(node)deleteEvent(node.dataset.deleteevent);});
    // Convenient pass-direction selection beside Daily Inspection. It updates
    // the existing top filter, which in turn updates Calendar, Results and CSV.
    $('dailyDirectionFilters')?.addEventListener('click',event=>{
      const button=event.target.closest('[data-daily-direction]');
      if(!button)return;
      const main=$('passDirection');
      const value=button.dataset.dailyDirection;
      if(!main || !['all','ASCENDING','DESCENDING'].includes(value))return;
      if(main.value!==value){
        main.value=value;
        main.dispatchEvent(new Event('change',{bubbles:true}));
      }else{
        renderDaily();
      }
    });
    $('sitesTable').addEventListener('change',e=>{
      const input=e.target.closest('input[data-toggleactive]');if(!input)return;
      const site=siteForId(input.dataset.toggleactive);if(!site)return;
      site.active=input.checked;if(site.active&&!hasCoords(site))toast("Active saved, but missing coordinates: this site will not appear on the map or in orbit predictions until its coordinates are entered.","warn");saveSites();state.tle.events=[];state.tle.previewEvents=[];state.tle.results.clear();
      if(!isSiteActive(selectedSite())||!hasCoords(selectedSite())){state.selectedSiteId=plannableSites()[0]?.id||state.sites[0]?.id||null;state.siteFilter='all';}
      renderAll();updateWeather(false);renderTLE();toast(`${site.name}: ${site.active?'Active':'Inactive'} (saved in this browser)`);
    });
    $('sitesTable').addEventListener('click',e=>{
      const mobileToggle=e.target.closest('button[data-mobile-toggleactive]');
      if(mobileToggle){
        const checkbox=[...$('sitesTable').querySelectorAll('input[data-toggleactive]')].find(x=>x.dataset.toggleactive===mobileToggle.dataset.mobileToggleactive);
        if(checkbox&&!checkbox.disabled){checkbox.checked=!checkbox.checked;checkbox.dispatchEvent(new Event('change',{bubbles:true}));}
        return;
      }
      const item=e.target.closest('button[data-selectsite],button[data-editsite],button[data-deletesite]');if(!item)return;
      if(item.dataset.selectsite){setSite(item.dataset.selectsite,{filter:true,center:true});$('mapping').scrollIntoView({behavior:'smooth'});}
      if(item.dataset.editsite)openSiteModal(item.dataset.editsite);
      if(item.dataset.deletesite)deleteSite(item.dataset.deletesite);
    });
    $('siteForm').addEventListener('submit',handleSiteSave);$('eventForm').addEventListener('submit',handleEventSave);
    document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
    document.querySelectorAll('.modal-backdrop').forEach(back=>back.addEventListener('mousedown',e=>{if(e.target===back)closeModal(back.id)}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('siteModal');closeModal('eventModal');}});
    ['importTop','dropZone'].forEach(id=>$(id)?.addEventListener('click',()=>{$('inputExcel').click()}));
    $('dropZone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('inputExcel').click()}});
    $('dropZone').addEventListener('dragover',e=>{e.preventDefault();e.currentTarget.classList.add('dragover')});
    $('dropZone').addEventListener('dragleave',e=>e.currentTarget.classList.remove('dragover'));
    $('dropZone').addEventListener('drop',e=>{e.preventDefault();e.currentTarget.classList.remove('dragover');importFiles(Array.from(e.dataTransfer.files).filter(f=>/\.(csv|xlsx|xls)$/i.test(f.name)));});
    $('inputExcel').addEventListener('change',e=>{const files=[...e.target.files];e.target.value='';if(files.length)importFiles(files);});
    $('importJsonBtn').addEventListener('click',()=>$('inputJson').click());
    $('inputJson').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)importJson(f);});
    $('exportCalendarCSV').addEventListener('click',exportCSV);
    $('export30Days').addEventListener('click',()=>exportHorizon(30));
    ['resultsRange','resultsMethod','resultsIncludeSolar'].forEach(id=>$(id)?.addEventListener('change',renderCompactResults));
    $('calculateAllSites').addEventListener('click',async()=>{try{await ensureTLEForSites(plannableSites(),{horizonDays:30})}catch(e){toast('TLE calculation not available: '+e.message,'warn')}});
    $('exportOrbitPasses').addEventListener('click',exportOrbitPasses);
    $('export1Year').addEventListener('click',()=>exportHorizon(365));
    $('excelOffset').addEventListener('change',e=>{state.excelOffset=Number(e.target.value);localStorage.setItem(STORAGE.offset,String(state.excelOffset));toast('Excel source offset selected: UTC'+(state.excelOffset>=0?'+':'')+state.excelOffset+'. Re-import files to apply.');});
    $('autoTle').addEventListener('change',e=>{state.tle.enabled=e.target.checked;localStorage.setItem(STORAGE.tle,state.tle.enabled?'1':'0');
      if(state.tle.enabled)loadAutoTLE();else{state.tle.job++;state.tle.batchJob++;state.tle.events=[];state.tle.previewEvents=[];state.tle.results.clear();state.tle.status='off';renderTLE();renderStats();renderCalendar();renderDaily();}});
    $('refreshTLE').addEventListener('click',()=>{if(!state.tle.enabled){$('autoTle').checked=true;state.tle.enabled=true;localStorage.setItem(STORAGE.tle,'1');}loadAutoTLE(true);});
    $('passDirection')?.addEventListener('change',()=>{renderCompactResults();renderCalendar();renderDaily();});
    $('tleMaxOff').addEventListener('change',e=>{state.tle.maxOff=Number(e.target.value);state.tle.results.clear();state.tle.previewEvents=[];if(state.tle.enabled&&state.tle.data)computeTLECandidates();});
    $('showTLEEntry').addEventListener('click',()=>{const details=$('tleManual');details.open=!details.open;});
    $('applyManualTLE').addEventListener('click',()=>{try{state.tle.data=window.PlannerOrbit.cacheManual($('tlePaste').value);state.tle.enabled=true;$('autoTle').checked=true;localStorage.setItem(STORAGE.tle,'1');computeTLECandidates();}catch(err){setTLEStatus(err.message,'warn');}});
    $('tlePreviewSiteFilter')?.addEventListener('change',renderTLEPreview);
    $('tlePreviewMethod')?.addEventListener('change',renderTLEPreview);
    window.addEventListener('useful-fleet-selection',()=>{state.tle.job++;state.tle.batchJob++;state.tle.data=null;state.tle.results.clear();state.tle.events=[];state.tle.previewEvents=[];renderTLE();if(state.tle.enabled)loadAutoTLE();});
    window.addEventListener('planner-language-changed',()=>{renderAll();renderTLE();});
    $('exportXLSX').addEventListener('click',exportExcel);
    $('exportSites').addEventListener('click',exportSites);
    $('exportPlanJSON').addEventListener('click',exportEventsJSON);
    $('printReport').addEventListener('click',()=>window.print());
    $('resetSites').addEventListener('click',async()=>{if(!confirm('คืนค่าพื้นที่จาก T2V 2026 + sites.json บน GitHub? ข้อมูลที่แก้เฉพาะในเบราว์เซอร์จะถูกแทนที่'))return;await loadSharedSites(true);state.weather.clear();renderAll();updateWeather();toast('คืนค่ารายการ Test Sites แล้ว')});
    $('clearManual').addEventListener('click',()=>{if(!confirm('ลบแผนที่เพิ่มเองในเบราว์เซอร์ทั้งหมด?'))return;state.opportunities=state.opportunities.filter(e=>e.source!=='manual');saveEvents();renderAll();toast('ลบรายการแผนที่เพิ่มเองแล้ว');});
    $('clearImports').addEventListener('click',()=>{if(!confirm('ลบข้อมูล Excel ที่นำเข้าจาก Browser ในเครื่องนี้? (ไฟล์ใน GitHub จะไม่ถูกลบ)'))return;state.opportunities=state.opportunities.filter(e=>!(e.source==='excel'&&e.origin==='browser'));saveEvents();renderAll();toast('ล้างข้อมูล Excel ที่นำเข้าจากเครื่องนี้แล้ว');});
    window.addEventListener('resize',()=>{resize2DMap();resize3D();});
  }
  async function init(){
    const today=todayKey();state.month=today.slice(0,7);state.selectedDate=today;
    // Default calendar to the complete Active registry on each fresh page load.
    state.calendarScope='all';if($('calendarSiteScope'))$('calendarSiteScope').value='all';
    $('todayLabel').textContent=shortDate(today);
    state.excelOffset=Number(localStorage.getItem(STORAGE.offset)??7);
    for(let x=-12;x<=14;x+=0.5){const v=Number(x.toFixed(1));const sign=v>=0?'+':'-';const h=Math.floor(Math.abs(v)),min=Math.round((Math.abs(v)-h)*60);
      const option=new Option(`UTC${sign}${pad2(h)}:${pad2(min)}`,String(v));$('excelOffset').appendChild(option);}
    $('excelOffset').value=String(state.excelOffset);
    state.tle.enabled=localStorage.getItem(STORAGE.tle)!=='0';$('autoTle').checked=state.tle.enabled;
    if($('copyrightYear'))$('copyrightYear').textContent=String(new Date().getFullYear());
    bindUI();await loadSharedSites();loadLocalEvents();renderAll({map:false});setup2DMap();renderAll();
    // Delay weather and auto-import a little so initial UI is responsive.
    updateWeather(false);autoLoadExcel();renderTLE();if(state.tle.enabled)loadAutoTLE();
    if(isDemoOnly())toast('แสดงข้อมูลตัวอย่างจากเว็บเดิม · Upload Excel หรือใช้ไฟล์ xlsx/ เพื่อแสดงข้อมูลของคุณ');
  }
  init().catch(err=>{console.error('Initialization error:',err);toast('เกิดปัญหาเริ่มระบบ: '+err.message,'error')});
  // Public test helpers, no write access or secrets.
  window.THEOS2Planner={previewQuickSite,openNewSiteAt:(lat,lon)=>openSiteModal(null,{lat,lon}),siteTypeAllowed:typeIsVisible,getVisibleSites:plannableSites,redrawMaps:()=>{draw2DMap();draw3DMap()},renderSiteVisuals:()=>{renderAll()},reassignSiteType:(oldName,newName)=>{let changed=false;state.sites.forEach(s=>{if(s.type===oldName){s.type=newName;changed=true;}});if(changed){saveSites();renderAll();}},getState:()=>({sites:state.sites.map(s=>({...s})),events:state.opportunities.map(e=>({...e})),month:state.month,selectedDate:state.selectedDate,calendarScope:state.calendarScope}),getMoon,parseLocalTime,utcFromOffset,groupedAngle,getTLE:()=>({...state.tle,events:state.tle.events.slice()}),getCompactRows:compactRows,selectedHorizonDays,renderCompactResults,getCalendarEvents:calendarEvents,renderCalendar,renderDaily,calculateCalendarScope,moveMonth,exportHorizon,ensureTLEForSites,exportOrbitPasses,buildCSV:csvEncode};
})();
