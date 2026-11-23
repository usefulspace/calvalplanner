/* USEFUL v3.1 calendar UX: labels and cross-tab refresh. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function localize(){
 const en=window.PlannerI18N?.current?.()==='en';
 document.querySelectorAll('[data-th][data-en]').forEach(n=>{n.textContent=n.getAttribute(en?'data-en':'data-th')});
 const sel=$('calendarSiteScope');if(sel){
  const options=sel.options;
  if(options.length){options[0].textContent=en?'All Active Sites':'ทุกพื้นที่ Active';}
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',localize,{once:true});else localize();
window.addEventListener('planner-language-changed',()=>{localize();window.THEOS2Planner?.renderCalendar?.();window.THEOS2Planner?.renderDaily?.()});
})();