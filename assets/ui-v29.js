/* v2.9 Workspace settings navigation: existing controls moved, not rewritten. */
(() => { 'use strict';
 const $=id=>document.getElementById(id), hub=$('settings');
 if(!hub)return;
 function selectTab(name='sites'){
   hub.hidden=false;
   document.querySelectorAll('[data-settings-tab]').forEach(b=>{const on=b.dataset.settingsTab===name;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});
   document.querySelectorAll('[data-settings-pane]').forEach(p=>p.hidden=p.dataset.settingsPane!==name);
   hub.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function close(){hub.hidden=true;$('overview')?.scrollIntoView({behavior:'smooth',block:'start'});}
 document.querySelectorAll('[data-open-settings]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.openSettings||'sites')));
 $('sidebarSettings')?.addEventListener('click',()=>selectTab('sites'));
 $('resultsSettingsShortcut')?.addEventListener('click',()=>selectTab('orbit'));
 $('closeSettings')?.addEventListener('click',close);
 document.querySelectorAll('[data-settings-tab]').forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.settingsTab)));
 window.USEFULSettings={open:selectTab,close};
})();
