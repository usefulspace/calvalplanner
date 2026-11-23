'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const crypto=require('node:crypto');
const vm=require('node:vm');
const D=path.resolve(__dirname,'..');
const core=require('../assets/data-integrity.js');
const knownTLE='1 23455U 94089A   97320.90946019  .00000140  00000-0  10191-3 0  2621\n2 23455  99.0090 272.6745 0008546 223.1686 136.8816 14.11711747148495';
function fixChecksum(l){return l.slice(0,68)+String(core.tleChecksum(l.slice(0,68)+'0'));}
function tleFor(norad='58016', date=new Date()){
 const lines=knownTLE.split('\n').map(line=>line.replace('23455',norad.padStart(5,'0')));
 const year=date.getUTCFullYear()%100;
 const first=Date.UTC(date.getUTCFullYear(),0,1);
 const d=(date.getTime()-first)/86400000+1;
 const day=String(Math.floor(d)).padStart(3,'0')+'.'+String(Math.floor((d%1)*100000000)).padStart(8,'0');
 lines[0]=lines[0].slice(0,18)+String(year).padStart(2,'0')+day+lines[0].slice(32);
 return lines.map(fixChecksum).join('\n');
}
function ommFor(norad='58016',when=new Date()){
 return {NORAD_CAT_ID:Number(norad),EPOCH:when.toISOString().slice(0,-1),MEAN_MOTION:14.8,ECCENTRICITY:0.00014,
 INCLINATION:97.9,RA_OF_ASC_NODE:32.4,ARG_OF_PERICENTER:99.9,MEAN_ANOMALY:260.25};
}
test('TLE CelesTrak 69-column example validates both checksums',()=>{
 const x=core.parseTLE(knownTLE,'23455');
 assert.equal(x.epochISO,'1997-11-16T21:49:37.360Z');
 assert.equal(x.line1.length,69);
 assert.equal(x.line2.length,69);
});
test('TLE checksum corruption is rejected on each line independently',()=>{
 const [a,b]=knownTLE.split('\n');
 for (const bad of [[a.slice(0,68)+(a[68]==='0'?'1':'0'),b],[a,b.slice(0,68)+(b[68]==='0'?'1':'0')]])
   assert.throws(()=>core.parseTLE(bad.join('\n'),'23455'),/checksum mismatch/);
});
test('TLE catalog mismatch, missing checksum, and out-of-range fields are rejected',()=>{
 const [a,b]=knownTLE.split('\n');
 assert.throws(()=>core.parseTLE(knownTLE,'58016'),/NORAD/);
 assert.throws(()=>core.parseTLE(a.slice(0,-1)+'\n'+b,'23455'),/length\/format invalid/);
 const bad=fixChecksum(b.slice(0,52)+'00.00000000'+b.slice(63));
 assert.throws(()=>core.parseTLE(a+'\n'+bad,'23455'),/out of range/);
});
test('TLE rejects non-leap day 366 and accepts leap day 366',()=>{
 const lines=knownTLE.split('\n');
 const nonleap=fixChecksum(lines[0].slice(0,18)+'23366.12345678'+lines[0].slice(32));
 const leap=fixChecksum(lines[0].slice(0,18)+'24366.12345678'+lines[0].slice(32));
 assert.throws(()=>core.parseTLE(nonleap+'\n'+lines[1],'23455'),/epoch day invalid/);
 assert.match(core.parseTLE(leap+'\n'+lines[1],'23455').epochISO,/^2024-12-31T/);
});
test('OMM EPOCH without timezone is interpreted in UTC, never system local',()=>{
 const expected='2026-11-22T01:58:07.941Z';
 assert.equal(core.utcEpoch('2026-11-22T01:58:07.941'),expected);
 for (const tz of ['UTC','Asia/Bangkok','America/Los_Angeles']) {
   const cmd="const q=require(process.argv[1]); console.log(q.parseOMM(JSON.parse(process.argv[2]),'58016').epochISO)";
   const out=execFileSync(process.execPath,['-e',cmd,path.join(D,'assets/data-integrity.js'),JSON.stringify({...ommFor(),EPOCH:'2026-11-22T01:58:07.941'})],{env:{...process.env,TZ:tz}}).toString().trim();
   assert.equal(out,expected,'TZ='+tz);
 }
});
test('OMM parser provides normalized Z epoch to downstream satellite.js',()=>{
 const entry=core.parseOMM([{...ommFor('33396'),EPOCH:'2026-11-22T12:34:56.123456'}],'33396');
 assert.equal(entry.omm.EPOCH,'2026-11-22T12:34:56.123456Z');
 assert.equal(entry.norad,'33396');
 assert.equal(core.epochAgeHours(entry,Date.parse(entry.epochISO)),0);
});
test('OMM with a different NORAD or a non-UTC time system is rejected',()=>{
 assert.throws(()=>core.parseOMM([ommFor('33396')],'58016'),/NORAD/);
 assert.throws(()=>core.parseOMM({...ommFor(),TIME_SYSTEM:'TAI'},'58016'),/Only UTC/);
 assert.throws(()=>core.parseOMM({...ommFor(),MEAN_MOTION:null},'58016'),/MEAN_MOTION/);
});
test('OMM invalid calendar dates and offsets are rejected',()=>{
 for (const v of ['2026-02-30T01:00:00','2026-11-22T25:00:00','2026-11-22T01:00:60','2026-11-22T01:00:00+15:00'])
   assert.throws(()=>core.utcEpoch(v));
 assert.equal(core.utcEpoch('2026-11-22T08:58:07+07:00'),'2026-11-22T01:58:07.000Z');
});
test('CSV text is formula escaped including whitespace-prefixed payloads',()=>{
 const rows=[['Name','Latitude','Rule'],['=HYPERLINK("https://bad")',-13.1,'\t+cmd'],['  @SUM(1)','-1','ordinary']];
 const v=core.csvEncode(rows);
 assert.match(v,/"'=HYPERLINK\(""https:\/\/bad""\)"/);
 assert.match(v,/"'\t\+cmd"/);
 assert.match(v,/"'  @SUM\(1\)"/);
 assert.match(v,/"-13\.1"/);
 assert.match(v,/"'-1"/);
 assert.ok(v.startsWith('\ufeff'));
});
test('XLSX worksheet text is formula escaped but numeric coordinates are unchanged',()=>{
 const rows=core.sheetRows([['Site','Latitude','Longitude'],['=1+1',13.1019,100.9294]]);
 assert.equal(rows[1][0],"'=1+1");assert.equal(rows[1][1],13.1019);
});
test('satellite provenance recognizes THEOS/TH shorthand without guessing unspecified sources',()=>{
 assert.deepEqual(core.sourceSatellite('TH1'),{name:'THEOS-1',norad:'33396'});
 assert.deepEqual(core.sourceSatellite('THEOS_2'),{name:'THEOS-2',norad:'58016'});
 assert.deepEqual(core.sourceSatellite('','theos-2_scene_10'),{name:'THEOS-2',norad:'58016'});
 assert.deepEqual(core.sourceSatellite('','Rainforest Sites'),{name:'',norad:''});
 assert.deepEqual(core.sourceSatellite('Sentinel-2'),{name:'Sentinel-2',norad:''});
});
test('original v3.9.2 CSS is preserved byte-for-byte (locked SHA256 manifest)',()=>{
 const locked={
 'calendar-v31.css':'761477e58a79f3e709cc79b534cf2839f2e343495120eadd5649ab248c711ea9',
 'minimal-v3.css':'433e08325b7c4df32f74ce076d60daa23b9fd1ebc8dade64f56d0e215aed7c4d',
 'single-page-v32.css':'c48c6e5f00686cd9ce83ffcc1bf9d9934245b7d959c5b0be20898289047327f1',
 'styles.css':'4403a71b5dad5bbe54c628a93a8c53383a8ea89ee652f8d938da6f65bac23a8d',
 'ui-balance-v38.css':'ee342610116a8d1dbbf99b1c7f63548eb9b119a6b11c18f2756d559f659dbdbf',
 'ux-v39.css':'dea8972151818a2bf65d7f515cbcc21c61def4fe68195096b365ee8e20a5af5b'
 };
 const present=fs.readdirSync(path.join(D,'assets')).filter(f=>f.endsWith('.css')).sort();
 assert.deepEqual(present,Object.keys(locked).sort());
 for (const [f,digest] of Object.entries(locked)) {
   const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(D,'assets',f))).digest('hex');
   assert.equal(actual,digest,'CSS changed: '+f);
 }
});
function contextFor(js,fetch) {
 const local=new Map();
 const context={window:{UsefulIntegrity:core},document:{readyState:'loading',addEventListener(){}},
    Image:class {addEventListener(){} set src(v){this._src=v;} get src(){return this._src;}},
    localStorage:{getItem(key){return local.get(key)||null;},setItem(key,v){local.set(key,v);}},
    console,fetch,AbortSignal,AbortController,setTimeout,clearTimeout,Date,Number,Math,JSON,Map,Set,Promise};
 vm.runInNewContext(fs.readFileSync(path.join(D,'assets',js),'utf8'),vm.createContext(context),{filename:js});
 return context;
}
test('Fleet ignores stale mirrored elements and obtains fresh remote OMM epoch',async()=>{
 const stale=tleFor('58016',new Date('2025-02-22T01:00:00Z'));
 const fresh=ommFor('58016',new Date());
 const called=[];
 const fetch=async url=>{
   called.push(url);
   if(url.includes('FORMAT=JSON'))return {ok:true,json:async()=>[fresh]};
   if(url.endsWith('/58016.tle'))return {ok:true,text:async()=>stale};
   return {ok:false,status:404};
 };
 const ctx=contextFor('fleet.js',fetch);
 const elem=await ctx.window.UsefulFleet.getSelectedElements();
 assert.equal(elem.source,'CelesTrak live');
 assert.equal(elem.epochISO,core.utcEpoch(fresh.EPOCH));
 assert.ok(called.some(url=>url.includes('FORMAT=JSON')));
 const requests=called.length;
 await ctx.window.UsefulFleet.getSelectedElements();
 assert.equal(called.length,requests,'fresh elements should be cached');
});
test('Fleet honors valid fresh manual TLE and does not request network on regular load',async()=>{
 const fetch=async()=>{throw Error('Network should not be touched');};
 const ctx=contextFor('fleet.js',fetch);
 ctx.localStorage.setItem('useful:planner:v27:element:58016',JSON.stringify({text:tleFor('58016',new Date())}));
 const elem=await ctx.window.UsefulFleet.getSelectedElements();
 assert.equal(elem.source,'Manual TLE');
 assert.equal(elem.norad,'58016');
});
test('Orbit manual cache rejects corrupted TLE before it could be used for a pass',()=>{
 const ctx=contextFor('orbit.js',async()=>{throw Error('Unnecessary network');});
 const [l1,l2]=tleFor('58016',new Date()).split('\n');
 assert.throws(()=>ctx.window.PlannerOrbit.cacheManual(l1.slice(0,-1)+(l1[68]==='0'?'1':'0')+'\n'+l2),/checksum/);
});
test('Tracking CSV uses shared spreadsheet formula sanitization',()=>{
 const ctx=contextFor('tracking.js',async()=>{});
 assert.match(ctx.window.UsefulTracking.csv([['=1+1','Safe']]),/"'=1\+1"/);
});
