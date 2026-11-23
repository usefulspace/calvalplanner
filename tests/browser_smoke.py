#!/usr/bin/env python3
"""Offline UI regression test for unmodified v3.9.2 layout and patched v3.9.3.
Runs without a local server or remote services. Does not assert orbital precision.
"""
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,base64,mimetypes
ROOT=Path(__file__).resolve().parents[1]
ORIGINAL=ROOT.parent/'USEFUL_Acquisition_Planner_v3.9.2'

def html_for(root):
 soup=BeautifulSoup((root/'index.html').read_text(encoding='utf8'),'html.parser')
 for item in list(soup.select('link[rel=stylesheet]')):
  href=item.get('href','').split('?')[0]
  if href.startswith('assets/'):
   css=soup.new_tag('style');css.string=(root/href).read_text(encoding='utf8');item.replace_with(css)
  else:item.decompose()
 for item in list(soup.select('script')):
  src=item.get('src','').split('?')[0]
  if src.startswith('assets/'):
   js=(root/src).read_text(encoding='utf8').replace('</script','<\\/script')
   item.attrs={};item.string=js
  elif src:item.decompose()
 for img in list(soup.select('img[src^="assets/"]')):
  f=root/img['src']
  if f.exists():
   med=mimetypes.guess_type(str(f))[0] or 'application/octet-stream'
   img['src']='data:'+med+';base64,'+base64.b64encode(f.read_bytes()).decode()
 fixtures={f:json.loads((root/f).read_text('utf8')) for f in ['sites.json','satellites.json','data/T2V_2026_sites.json','data/site_types.json']}
 js='''<script>
 const entries=new Map([['theos2:planner:v23:autoTLE','0']]);
 Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>entries.has(k)?entries.get(k):null,setItem:(k,v)=>entries.set(k,String(v)),removeItem:k=>entries.delete(k),clear:()=>entries.clear()}});
 const fixture=__FIXTURE__;
 window.fetch=async (url)=>{
  const u=String(url).replace(/^\\.\\//,'').split('?')[0];
  if(Object.hasOwn(fixture,u))return {ok:true,status:200,json:async()=>fixture[u],text:async()=>JSON.stringify(fixture[u])};
  if(u==='xlsx/index.json')return {ok:true,json:async()=>[],status:200};
  throw new Error('Offline QA, no network: '+u);
 };
 window.__QA_OFFLINE__=true;
 </script>'''.replace('__FIXTURE__',json.dumps(fixtures,ensure_ascii=False))
 soup.head.insert(0,BeautifulSoup(js,'html.parser'))
 return str(soup)

def inspect(page):
 return page.evaluate('''() => {
  const list=['#mapping','#calendar','#results','.sidebar','.topbar','#calendarSiteScope'];
  const rects=Object.fromEntries(list.map(sel=>{const b=document.querySelector(sel)?.getBoundingClientRect();return [sel,b?{x:b.x,y:b.y,w:b.width,h:b.height}:null]}));
  return {rects,siteCount:window.THEOS2Planner?.getState()?.sites.length,
    scope:document.querySelector('#calendarSiteScope')?.value,
    mainDirection:[...document.querySelectorAll('#passDirection option')].map(x=>x.value),
    horizontalOverflow:document.body.scrollWidth-window.innerWidth};
 }''')

def run():
 old=html_for(ORIGINAL);new=html_for(ROOT)
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for w,h in ((1440,900),(390,844)):
   rect=[]
   for ver,html in [('original',old),('patched',new)]:
    page=browser.new_page(viewport={'width':w,'height':h},timezone_id='Asia/Bangkok')
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded',timeout=80000)
    page.wait_for_timeout(1400)
    info=inspect(page)
    print('BROWSER',ver,w,h,'sites',info['siteCount'],'scope',info['scope'],'overflow',info['horizontalOverflow'],'errors',errors[:3])
    assert not errors,errors
    assert info['siteCount']==100,info
    assert info['scope']=='all',info
    assert info['horizontalOverflow']<=3,info
    before=page.locator('#monthTitle').inner_text()
    page.locator('#nextMonth').click(force=True,timeout=10000)
    mid=page.locator('#monthTitle').inner_text()
    page.locator('#prevMonth').click(force=True,timeout=10000)
    assert mid!=before and page.locator('#monthTitle').inner_text()==before
    assert info['mainDirection']==['all','ASCENDING','DESCENDING']
    if ver=='patched':
     assert '"\'=1+1"' in page.evaluate("window.THEOS2Planner.buildCSV([['Test Site'],['=1+1']])")
     # Import an Excel-compatible CSV with a per-row source satellite and preserve attribution.
     today=page.evaluate('new Date().toISOString().slice(0,10)')
     data='UTC Time,Off-nadir,Satellite\n'+today+' 05:40,12,THEOS-1\n'
     page.locator('#inputExcel').set_input_files({'name':'White Sands.csv','mimeType':'text/csv','buffer':data.encode()})
     page.wait_for_timeout(350)
     ev=page.evaluate('window.THEOS2Planner.getState().events.filter(x=>x.source==="excel").at(-1)')
     assert ev and ev['satelliteName']=='THEOS-1',ev
     # Regression: selecting another spacecraft must not rebrand an imported pass.
     page.evaluate('''() => {
       const s=document.querySelector('#fleetSelected');s.value='theos-1';s.dispatchEvent(new Event('change',{bubbles:true}));
     }''')
     page.wait_for_timeout(150)
     ev2=page.evaluate('window.THEOS2Planner.getState().events.filter(x=>x.source==="excel").at(-1)')
     assert ev2['satelliteName']=='THEOS-1'
     # The displayed/export-ready result must keep the original source satellite.
     page.evaluate('''() => { const s=document.querySelector('#filterSite'); s.value='all'; s.dispatchEvent(new Event('change',{bubbles:true})); }''')
     imported=page.evaluate('window.THEOS2Planner.getCompactRows(30).filter(r=>r.source==="excel")')
     assert imported and imported[-1]['satellite']=='THEOS-1',imported
     rect.append(info)
    else:rect.append(info)
    page.close()
   # Only script references changed in the document; the core layout must remain unchanged.
   for k in ['#mapping','#calendar','#results','.sidebar','.topbar']:
    a=rect[0]['rects'][k];b=rect[1]['rects'][k]
    assert a and b,(k,a,b)
    for key in ('x','y','w','h'):
     assert abs(a[key]-b[key])<=3,(w,k,key,a[key],b[key])
   print('LAYOUT PASS',w,h)
  browser.close()

if __name__=='__main__':run()
