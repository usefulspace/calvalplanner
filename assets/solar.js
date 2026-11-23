/* NOAA solar geometry approximation, UTC; not surface measured radiation. */
(() => { 'use strict';
 const rad = Math.PI/180, deg=180/Math.PI;
 function at(date,lat,lon){
   const d=date instanceof Date?date:new Date(date);if(!Number.isFinite(d.getTime()))return null;
   const year=d.getUTCFullYear(),leap=new Date(Date.UTC(year,1,29)).getUTCMonth()===1;
   const day=1+Math.floor((Date.UTC(year,d.getUTCMonth(),d.getUTCDate())-Date.UTC(year,0,1))/86400000);
   const minutes=d.getUTCHours()*60+d.getUTCMinutes()+d.getUTCSeconds()/60;
   const gamma=2*Math.PI/(leap?366:365)*(day-1+(minutes/60-12)/24);
   const eqtime=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
   const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
   const hourAngle=(minutes+eqtime+4*lon)/4-180;
   const cosZ=Math.min(1,Math.max(-1,Math.sin(lat*rad)*Math.sin(decl)+Math.cos(lat*rad)*Math.cos(decl)*Math.cos(hourAngle*rad)));
   const elevation=90-Math.acos(cosZ)*deg;
   const distCorrection=1+.033*Math.cos(2*Math.PI*day/(leap?366:365));
   const toa=1361*distCorrection*Math.max(0,cosZ);
   const month=d.getUTCMonth()+1,hemisphere=lat>=0?'Northern':'Southern';
   let season='Tropical / equatorial';
   if(Math.abs(lat)>=23.5){
     const seasonN=month===12||month<=2?'Winter':month<=5?'Spring':month<=8?'Summer':'Autumn';
     const opp={Winter:'Summer',Spring:'Autumn',Summer:'Winter',Autumn:'Spring'};
     season=(lat>=0?seasonN:opp[seasonN])+' ('+hemisphere+')';
   }
   return {elevationDeg:elevation,zenithDeg:90-elevation,declinationDeg:decl*deg,toaHorizontalWm2:toa,season,dayOfYear:day,utcISO:d.toISOString()};
 }
 window.UsefulSolar={at};
})();
