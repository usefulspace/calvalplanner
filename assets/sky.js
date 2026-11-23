/* USEFUL Planner v3.6 — low-precision celestial reference for map overlays.
 * Points on map are subsolar/sublunar ground projections, not actual body positions.
 * Sun: NOAA-style geometry; Moon: low-order geocentric ecliptic elements.
 */
(()=>{'use strict';
const R=Math.PI/180,D=180/Math.PI;
const $=id=>document.getElementById(id);
const settingsKey='useful:v36:sky';
const settings={sun:false,moon:false};
const norm=x=>((x%360)+360)%360;
const lon180=x=>((x+180)%360+360)%360-180;
const sin=x=>Math.sin(x*R),cos=x=>Math.cos(x*R);
function jd(date){return date.getTime()/86400000+2440587.5;}
function gmst(date){const j=jd(date),t=(j-2451545)/36525;return norm(280.46061837+360.98564736629*(j-2451545)+0.000387933*t*t-t*t*t/38710000);}
function solar(date){
 const y=date.getUTCFullYear(),leap=new Date(Date.UTC(y,1,29)).getUTCMonth()===1;
 const day=1+Math.floor((Date.UTC(y,date.getUTCMonth(),date.getUTCDate())-Date.UTC(y,0,1))/86400000);
 const minutes=date.getUTCHours()*60+date.getUTCMinutes()+date.getUTCSeconds()/60;
 const g=2*Math.PI/(leap?366:365)*(day-1+(minutes/60-12)/24);
 const eq=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const dec=(.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g))*D;
 return {lat:dec,lon:lon180((720-minutes-eq)/4),eqtime:eq};
}
function moon(date){
 const days=jd(date)-2451543.5;
 const N=norm(125.1228-0.0529538083*days), i=5.1454,w=norm(318.0634+0.1643573223*days);
 const e=0.054900,M=norm(115.3654+13.0649929509*days);
 const ecc=M+e*D*sin(M)*(1+e*cos(M));
 const xv=Math.cos(ecc*R)-e,yv=Math.sqrt(1-e*e)*Math.sin(ecc*R);
 const v=Math.atan2(yv,xv)*D,u=v+w;
 const x=cos(N)*cos(u)-sin(N)*sin(u)*cos(i);
 const y=sin(N)*cos(u)+cos(N)*sin(u)*cos(i);
 const z=sin(u)*sin(i),eps=23.4393-3.563e-7*days;
 const ye=y*cos(eps)-z*sin(eps),ze=y*sin(eps)+z*cos(eps);
 const ra=norm(Math.atan2(ye,x)*D),dec=Math.atan2(ze,Math.hypot(x,ye))*D;
 return {lat:dec,lon:lon180(ra-gmst(date)),ra,dec};
}
function angles(subpoint,lat,lon){
 const H=lon180(lon-subpoint.lon), phi=lat,dec=subpoint.lat;
 const s=sin(phi)*sin(dec)+cos(phi)*cos(dec)*cos(H);
 const elevation=Math.asin(Math.max(-1,Math.min(1,s)))*D;
 const az=norm(Math.atan2(sin(H),cos(H)*sin(phi)-Math.tan(dec*R)*cos(phi))*D+180);
 return {azimuth:az,elevation};
}
function skyAt(date,lat,lon){
 const time=date instanceof Date?date:new Date(date);
 const sun=angles(solar(time),lat,lon),m=angles(moon(time),lat,lon);
 return {sun,moon:m};
}
function drawPoint(ctx,x,y,kind){
 const isSun=kind==='sun',color=isSun?'#ffce6e':'#d1c5ff',glyph=isSun?'☀':'☾',label=isSun?'SUN':'MOON';
 ctx.save();ctx.font='bold 16px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.shadowColor=color;ctx.shadowBlur=9;ctx.fillStyle=color;ctx.fillText(glyph,x,y);
 ctx.shadowBlur=0;ctx.font='bold 9px Inter, sans-serif';ctx.textAlign='left';
 const px=x+13,py=y+11;ctx.fillStyle='rgba(6,26,43,.88)';ctx.fillRect(px-4,py-12,39,16);
 ctx.fillStyle=color;ctx.fillText(label,px,py-4);ctx.restore();
}
function draw2D(ctx,toXY,w,h){const when=new Date();
 for(const kind of ['sun','moon']){if(!settings[kind])continue;const p=kind==='sun'?solar(when):moon(when),xy=toXY(p.lat,p.lon);
  if(xy.x>=-15&&xy.y>=-15&&xy.x<w+15&&xy.y<h+15)drawPoint(ctx,xy.x,xy.y,kind);}
}
function draw3D(ctx,project){const when=new Date();
 for(const kind of ['sun','moon']){if(!settings[kind])continue;const p=kind==='sun'?solar(when):moon(when),xy=project(p.lat,p.lon);
  if(xy.depth>0)drawPoint(ctx,xy.x,xy.y,kind);}
}
function init(){
 try{const saved=JSON.parse(localStorage.getItem(settingsKey)||'{}');settings.sun=saved.sun===true;settings.moon=saved.moon===true;}catch{}
 for(const kind of ['sun','moon']){const input=$(kind==='sun'?'mapShowSun':'mapShowMoon');if(!input)continue;
  input.checked=settings[kind];input.addEventListener('change',()=>{settings[kind]=input.checked;
   try{localStorage.setItem(settingsKey,JSON.stringify(settings))}catch{}
   window.THEOS2Planner?.redrawMaps?.();});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.UsefulSky={solar,moon,skyAt,draw2D,draw3D,getSettings:()=>({...settings})};
})();
