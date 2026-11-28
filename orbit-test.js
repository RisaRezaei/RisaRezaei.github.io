/* ORBIT — motion engine for the site.
   One rotating dotted Earth in the hero, and one satellite that travels with the scroll
   and links every section: ground track → skill constellation → lake scan → project sweep →
   tool table scan → peer-review orbit → timeline pass → degree orbit → downlink. */
(function(){
'use strict';
var TEAL='#4fd1c5',BLUE='#60a5fa',INK='#e7edf7',SUB='#c3cddd',MUTED='#8d9bb3',NAVY='#05080f';
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var DPR=Math.min(2,window.devicePixelRatio||1);
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function clamp(v,a,b){a=a==null?0:a;b=b==null?1:b;return Math.max(a,Math.min(b,v))}
function ease(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2}
function lerp(a,b,t){return a+(b-a)*t}
var T0=performance.now();function now(){return (performance.now()-T0)/1000}
function mobile(){return innerWidth<=900}
/* a canvas's size is read once and again only after it changes, not every frame (reading layout every frame is slow, above all in Firefox) */
var RO=window.ResizeObserver?new ResizeObserver(function(es){es.forEach(function(e){e.target._r=null})}):null;
function fit(cv){var r=cv._r;if(!r){var b=cv.getBoundingClientRect();r={width:b.width,height:b.height};if(RO){cv._r=r;if(!cv._ro){cv._ro=1;RO.observe(cv)}}}
  var k=cv._dpr||DPR,w=Math.max(1,Math.round(r.width*k)),h=Math.max(1,Math.round(r.height*k));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}var c=cv._c||(cv._c=cv.getContext('2d'));c.setTransform(k,0,0,k,0,0);cv._k=k;return {c:c,w:r.width,h:r.height}}
var SC=true,lastSY=-1,DIRTY=true,lastSC=0;   /* SC: the page scrolled or its layout changed (or 0.3 s passed) since the last check */
var seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
function inView(el,m){var r=el.getBoundingClientRect();m=m||0;return r.bottom>-m&&r.top<innerHeight+m}

/* ---------------- tiny line icons ---------------- */
function glyph(c,k,cx,cy,s,col){c.save();c.strokeStyle=col||TEAL;c.fillStyle=col||TEAL;c.lineWidth=Math.max(1.4,s/7);c.lineCap='round';c.lineJoin='round';
  function P(a,b){return [cx+a*s,cy+b*s]}function L(pts){c.beginPath();pts.forEach(function(q,i){var p=P(q[0],q[1]);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.stroke()}
  function A(x,y,r,a0,a1,ccw){var p=P(x,y);c.beginPath();c.arc(p[0],p[1],r*s,a0==null?0:a0,a1==null?7:a1,ccw);c.stroke()}
  if(k==='drop'){var a=P(0,-1),b=P(.7,-.1),d=P(.75,.75),e=P(0,.8),f=P(-.75,.75),g=P(-.7,-.1);c.beginPath();c.moveTo(a[0],a[1]);c.bezierCurveTo(b[0],b[1],d[0],d[1],e[0],e[1]);c.bezierCurveTo(f[0],f[1],g[0],g[1],a[0],a[1]);c.stroke()}
  if(k==='leaf'){var p0=P(-.8,.8),p1=P(-.8,-.8),p2=P(.8,-.8),p3=P(.8,.8);c.beginPath();c.moveTo(p0[0],p0[1]);c.quadraticCurveTo(p1[0],p1[1],p2[0],p2[1]);c.quadraticCurveTo(p3[0],p3[1],p0[0],p0[1]);c.stroke();L([[-.8,.8],[.3,-.3]])}
  if(k==='wind'){L([[-.9,-.4],[.4,-.4]]);A(.4,-.62,.22,1.57,-1.2,true);L([[-.9,.05],[.7,.05]]);L([[-.9,.5],[.2,.5]]);A(.2,.72,.22,-1.57,1.2)}
  if(k==='cloud'){var q1=P(-.35,-.1),q2=P(.1,-.35),q3=P(.5,-.05);c.beginPath();c.arc(q1[0],q1[1],s*.35,1.6,4.7);c.arc(q2[0],q2[1],s*.42,3.4,6.1);c.arc(q3[0],q3[1],s*.32,4.6,1.6);c.closePath();c.stroke();L([[-.3,.5],[-.42,.85]]);L([[.1,.5],[-.02,.85]]);L([[.5,.5],[.38,.85]])}
  if(k==='film'){var r0=P(-.85,-.6);c.strokeRect(r0[0],r0[1],s*1.7,s*1.2);for(var i=0;i<4;i++){var u=P(-.75+i*.45,-.5),v=P(-.75+i*.45,.36);c.fillRect(u[0],u[1],s*.2,s*.14);c.fillRect(v[0],v[1],s*.2,s*.14)}}
  if(k==='book'){L([[0,-.6],[0,.8]]);L([[0,-.6],[-.85,-.8],[-.85,.6],[0,.8],[.85,.6],[.85,-.8],[0,-.6]])}
  if(k==='molecule'){A(-.5,.4,.26);A(.5,.4,.26);A(0,-.5,.26);L([[-.3,.2],[-.1,-.28]]);L([[.3,.2],[.1,-.28]])}
  if(k==='field'){var ga=c.globalAlpha;for(var i2=0;i2<3;i2++)for(var j=0;j<3;j++){c.globalAlpha=ga*((i2+j)%2?.35:1);var w0=P(-.85+i2*.6,-.85+j*.6);c.fillRect(w0[0],w0[1],s*.5,s*.5)}c.globalAlpha=ga}
  if(k==='thermo'){A(0,.55,.32);L([[-.16,.3],[-.16,-.8],[.16,-.8],[.16,.3]]);L([[.4,-.5],[.7,-.5]]);L([[.4,-.15],[.7,-.15]])}
  if(k==='mountain'){L([[-.95,.6],[-.35,-.4],[0,.1],[.35,-.7],[.95,.6]])}
  if(k==='term'){var t0=P(-.9,-.7);c.strokeRect(t0[0],t0[1],s*1.8,s*1.4);L([[-.55,-.25],[-.2,.05],[-.55,.35]]);L([[0,.35],[.5,.35]])}
  if(k==='pin'){for(var m=-1;m<=1;m++){L([[m*.5,-.9],[m*.5,.9]]);L([[-.9,m*.5],[.9,m*.5]])}var pc=P(.25,-.25);c.beginPath();c.arc(pc[0],pc[1],s*.22,0,7);c.fill()}
  if(k==='sat'){var b0=P(-.22,-.22),b1=P(-.95,-.16),b2=P(.4,-.16);c.strokeRect(b0[0],b0[1],s*.44,s*.44);c.strokeRect(b1[0],b1[1],s*.55,s*.32);c.strokeRect(b2[0],b2[1],s*.55,s*.32);L([[0,.22],[0,.55]]);A(0,.72,.18,3.6,5.8)}
  if(k==='star'){c.beginPath();for(var n=0;n<10;n++){var an=-Math.PI/2+n*Math.PI/5,rr=n%2?s*.4:s*.95;n?c.lineTo(cx+rr*Math.cos(an),cy+rr*Math.sin(an)):c.moveTo(cx+rr*Math.cos(an),cy+rr*Math.sin(an))}c.closePath();c.stroke()}
  if(k==='mic'){var mm=P(-.28,-.9);c.beginPath();c.roundRect(mm[0],mm[1],s*.56,s*1.1,s*.28);c.stroke();A(0,.05,.6,0,3.14);L([[0,.65],[0,.95]])}
  if(k==='code'){L([[-.35,-.55],[-.85,0],[-.35,.55]]);L([[.35,-.55],[.85,0],[.35,.55]])}
  if(k==='check'){L([[-.7,0],[-.2,.5],[.75,-.55]])}
  if(k==='cap'){L([[-.95,-.2],[0,-.65],[.95,-.2],[0,.25],[-.95,-.2]]);L([[-.5,.02],[-.5,.5],[0,.75],[.5,.5],[.5,.02]])}
  if(k==='flask'){L([[-.25,-.85],[-.25,-.2],[-.75,.75],[.75,.75],[.25,-.2],[.25,-.85]]);L([[-.4,-.85],[.4,-.85]])}
  if(k==='layers'){L([[-.9,-.3],[0,-.75],[.9,-.3],[0,.15],[-.9,-.3]]);L([[-.9,.15],[0,.6],[.9,.15]])}
  if(k==='chat'){var ch=P(-.9,-.7);c.beginPath();c.roundRect(ch[0],ch[1],s*1.8,s*1.15,s*.3);c.stroke();L([[-.4,.45],[-.6,.85],[0,.45]])}
  c.restore()}
$$('canvas.ico').forEach(function(cv){var f=fit(cv);glyph(f.c,cv.dataset.g,f.w/2,f.h/2,Math.min(f.w,f.h)*.42,cv.dataset.c||TEAL)});

/* ---------------- rotating dotted Earth ---------------- */
var LAND=null;
var LAKES={'LAKE URMIA':[37.7,45.4],'CASPIAN SEA':[42.0,50.5],'ARAL SEA':[45.0,59.6],'LAKE RAZAZAH':[32.7,43.6],'LAKE CHAD':[13.2,14.3]};
var OFF={'ARAL SEA':[60,-40],'CASPIAN SEA':[70,10],'LAKE URMIA':[-60,-46],'LAKE RAZAZAH':[-60,40],'LAKE CHAD':[30,60]};
var D=Math.PI/180;
function P3(la,lo,la0,lo0){var f=la*D,l=(lo-lo0)*D,f0=la0*D,cf=Math.cos(f),sf=Math.sin(f),c0=Math.cos(f0),s0=Math.sin(f0),cl=Math.cos(l);return [cf*Math.sin(l),-(c0*sf-s0*cf*cl),s0*sf+c0*cf*cl]}
function v3(a){var f=a[0]*D,l=a[1]*D;return [Math.cos(f)*Math.cos(l),Math.cos(f)*Math.sin(l),Math.sin(f)]}
function arcPts(a,b,n){var A=v3(a),B=v3(b),om=Math.acos(clamp(A[0]*B[0]+A[1]*B[1]+A[2]*B[2],-1,1)),h=.05+.22*om,out=[];
  for(var i=0;i<=n;i++){var f=i/n,s1=Math.sin((1-f)*om)/Math.sin(om),s2=Math.sin(f*om)/Math.sin(om),v=[A[0]*s1+B[0]*s2,A[1]*s1+B[1]*s2,A[2]*s1+B[2]*s2],nn=Math.hypot(v[0],v[1],v[2]);out.push([Math.asin(v[2]/nn)/D,Math.atan2(v[1],v[0])/D,1+h*Math.sin(Math.PI*f)])}return out}
var ARCS=[['LAKE URMIA','CASPIAN SEA'],['LAKE URMIA','ARAL SEA'],['LAKE URMIA','LAKE RAZAZAH'],['LAKE URMIA','LAKE CHAD']].map(function(p){return arcPts(LAKES[p[0]],LAKES[p[1]],60)});
/* glow, sphere and rim: they never move, so they are drawn once into a buffer (again only after a resize) and copied each frame */
function baseDraw(c,cx,cy,R){
  var g=c.createRadialGradient(cx,cy,R*.92,cx,cy,R*1.22);g.addColorStop(0,'rgba(79,209,197,0)');g.addColorStop(.28,'rgba(79,209,197,.28)');g.addColorStop(1,'rgba(96,165,250,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,R*1.22,0,7);c.fill();
  g=c.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);g.addColorStop(0,'#0b1a2b');g.addColorStop(1,'#02050a');c.fillStyle=g;c.beginPath();c.arc(cx,cy,R,0,7);c.fill();
  c.save();c.beginPath();c.arc(cx,cy,R,0,7);c.clip();g=c.createLinearGradient(cx-R,cy-R,cx+R*.3,cy+R);g.addColorStop(0,'#5ff2e3');g.addColorStop(.55,'#2f8cff');g.addColorStop(1,'#1747c9');
  var ga=c.globalAlpha;for(var k=0;k<26;k++){c.strokeStyle=g;c.globalAlpha=ga*(0.05+0.03*(26-k)/26);c.lineWidth=2+k*1.6*Math.max(.25,R/560);c.beginPath();c.arc(cx,cy,R,0,7);c.stroke()}c.restore();
  c.strokeStyle=g;c.lineWidth=2.2;c.shadowColor=TEAL;c.shadowBlur=24;c.beginPath();c.arc(cx,cy,R,0,7);c.stroke();c.shadowBlur=0;
}
function globeBase(c,cx,cy,R){var m=c.getTransform?c.getTransform():null,k=c.canvas._k||DPR;
  if(!m||m.b||m.c||m.e||m.f||Math.abs(m.a-k)>1e-9||Math.abs(m.d-k)>1e-9){baseDraw(c,cx,cy,R);return}
  var ga=c.globalAlpha,ext=Math.max(R*1.22,R+30)+2,X0=Math.max(0,Math.floor((cx-ext)*k)),Y0=Math.max(0,Math.floor((cy-ext)*k)),
      X1=Math.min(c.canvas.width,Math.ceil((cx+ext)*k)),Y1=Math.min(c.canvas.height,Math.ceil((cy+ext)*k));if(X1<=X0||Y1<=Y0)return;
  var key=[cx,cy,R,ga,k,X0,Y0,X1,Y1].join(),B=c.canvas._gb;
  if(!B||B.key!==key){var bc=B?B.cv:document.createElement('canvas');bc.width=X1-X0;bc.height=Y1-Y0;var x=bc.getContext('2d');x.setTransform(k,0,0,k,-X0*1,-Y0*1);x.globalAlpha=ga;baseDraw(x,cx,cy,R);c.canvas._gb=B={key:key,cv:bc}}
  c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.drawImage(B.cv,X0,Y0);c.restore()}
var ACOL={};function acol(dim,q){var k=dim+'_'+q;return ACOL[k]||(ACOL[k]='rgba(210,240,245,'+((0.15+0.85*q/20)*dim).toFixed(3)+')')}
/* land dots: positions from sines and cosines worked out once, and one fill per brightness level instead of one per dot */
var LT=null,LB=[];
function landDots(c,W,H,cx,cy,R,la0,lo0,dim,ds){var n=LAND.length>>1,i,q;
  if(!LT||LT.n!==n){LT=new Float64Array(n*4);LT.n=n;for(i=0;i<n;i++){var f=LAND[2*i]*D,l=LAND[2*i+1]*D;LT[4*i]=Math.cos(f);LT[4*i+1]=Math.sin(f);LT[4*i+2]=Math.cos(l);LT[4*i+3]=Math.sin(l)}}
  var f0=la0*D,c0=Math.cos(f0),s0=Math.sin(f0),l0=lo0*D,cl0=Math.cos(l0),sl0=Math.sin(l0);
  for(q=0;q<21;q++)(LB[q]||(LB[q]=[])).length=0;
  for(i=0;i<n;i++){var j=4*i,cf=LT[j],sf=LT[j+1],cl=LT[j+2]*cl0+LT[j+3]*sl0,z=s0*sf+c0*cf*cl;if(z<=0)continue;
    var py=cy-(c0*sf-s0*cf*cl)*R;if(py<-4||py>H+4)continue;var px=cx+cf*(LT[j+3]*cl0-LT[j+2]*sl0)*R;if(px<-4||px>W+4)continue;LB[Math.round(z*20)].push(px,py)}
  for(q=0;q<21;q++){var A=LB[q];if(!A.length)continue;c.fillStyle=acol(dim,q);c.beginPath();for(var m=0;m<A.length;m+=2)c.rect(A[m],A[m+1],ds,ds);c.fill()}}
function globe(c,W,H,cx,cy,R,o,t){var la0=o.lat0==null?24:o.lat0,lo0=o.lon0==null?38:o.lon0,dim=o.dim||1;
  globeBase(c,cx,cy,R);
  if(LAND)landDots(c,W,H,cx,cy,R,la0,lo0,dim,Math.max(1.1,R/380));
  if(o.arcs){var AP=o.arcP==null?1:o.arcP;ARCS.forEach(function(Ar,ai){var pi=clamp(AP*1.6-ai*.2);if(pi<=0)return;var n=Math.floor(pi*Ar.length);c.strokeStyle='rgba(79,209,197,.9)';c.lineWidth=Math.max(1.4,R/320);c.shadowColor=TEAL;c.shadowBlur=10;c.beginPath();var st=false;
    for(var q=0;q<n;q++){var a=Ar[q],pp=P3(a[0],a[1],la0,lo0);if(pp[2]<-.12){st=false;continue}var X=cx+pp[0]*R*a[2],Y=cy+pp[1]*R*a[2];st?c.lineTo(X,Y):c.moveTo(X,Y);st=true}c.stroke();c.shadowBlur=0;
    if(pi>=1){var f=(t*.42+ai*.27)%1,a2=Ar[Math.floor(f*(Ar.length-1))],p2=P3(a2[0],a2[1],la0,lo0);if(p2[2]>-.1){c.fillStyle='#e8fffb';c.shadowColor=TEAL;c.shadowBlur=16;c.beginPath();c.arc(cx+p2[0]*R*a2[2],cy+p2[1]*R*a2[2],Math.max(2.2,R/200),0,7);c.fill();c.shadowBlur=0}}})}
  if(o.lakes){Object.keys(LAKES).forEach(function(name,idx){var ll=LAKES[name],p=P3(ll[0],ll[1],la0,lo0);if(p[2]<.06)return;var px=cx+p[0]*R,py=cy+p[1]*R,a=clamp((p[2]-.06)/.2);
    c.save();c.globalAlpha*=a;c.fillStyle=TEAL;c.shadowColor=TEAL;c.shadowBlur=18;c.beginPath();c.arc(px,py,Math.max(4,R/90),0,7);c.fill();c.shadowBlur=0;var r0=Math.max(9,R/40);
    c.strokeStyle='rgba(79,209,197,.5)';c.lineWidth=1.2;c.beginPath();c.arc(px,py,r0,0,7);c.stroke();var ph=(t*.7+idx*.31)%1;c.strokeStyle='rgba(79,209,197,'+(.6*(1-ph))+')';c.beginPath();c.arc(px,py,r0*(1+1.6*ph),0,7);c.stroke();
    if(o.labA>0){c.globalAlpha*=o.labA;var nm=name.toLowerCase().replace(/\b\w/g,function(ch){return ch.toUpperCase()});c.font='italic 500 14px Inter,sans-serif';var tw=c.measureText(nm).width,off=OFF[name],lx=px+(off[0]<0?off[0]-tw:off[0]),ly=py+off[1];
      c.strokeStyle='rgba(79,209,197,.45)';c.lineWidth=1;c.beginPath();c.moveTo(px,py);c.lineTo(off[0]<0?lx+tw+6:lx-6,ly-4);c.stroke();c.shadowColor='#02050a';c.shadowBlur=6;c.fillStyle=INK;c.fillText(nm,lx,ly);c.fillText(nm,lx,ly);c.shadowBlur=0}
    c.restore()})}}
function satIcon(c,x,y,s,a){c.save();c.globalAlpha*=a==null?1:a;var g=c.createRadialGradient(x,y,1,x,y,s*2.6);g.addColorStop(0,'rgba(79,209,197,.45)');g.addColorStop(1,'rgba(79,209,197,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,s*2.6,0,7);c.fill();
  c.fillStyle='rgba(5,8,15,.92)';c.beginPath();c.arc(x,y,s*1.15,0,7);c.fill();c.strokeStyle='rgba(79,209,197,.85)';c.lineWidth=1.4;c.stroke();c.shadowColor=TEAL;c.shadowBlur=10;glyph(c,'sat',x,y,s*.8,INK);c.shadowBlur=0;c.restore()}

/* ---------------- star field ---------------- */
function stars(){var cv=$('#stars'),f=fit(cv),c=f.c;seed=11;c.clearRect(0,0,f.w,f.h);for(var i=0;i<Math.round(f.w*f.h/2600);i++){c.fillStyle='rgba(200,220,255,'+(.55*rnd())+')';var s=rnd()<.93?1:1.8;c.fillRect(rnd()*f.w,rnd()*f.h,s,s)}}

/* ---------------- hero ---------------- */
var hero=$('#top'),gcv=$('#globe');
function heroGeom(w,h){if(mobile()){var Rm=Math.min(w*.5,h*.23);return {cx:w*.5,cy:122+Rm,R:Rm}}   /* phones: globe sits below the name, not under it */
  var R=Math.min(w*.35,h*.62);return {cx:w*.806,cy:h*.61,R:R}}
function orbGeom(g){return {cx:g.cx,cy:g.cy,rx:g.R*1.25,ry:g.R*.366,rot:-.35}}
function orbPt(o,a){var c=Math.cos(o.rot),s=Math.sin(o.rot),x=o.rx*Math.cos(a),y=o.ry*Math.sin(a);return [o.cx+x*c-y*s,o.cy+x*s+y*c]}
var heroLon=38;
function drawHero(t){var f=fit(gcv),c=f.c,g=heroGeom(f.w,f.h),o=orbGeom(g);c.clearRect(0,0,f.w,f.h);
  heroLon=38-(reduce?0:3.4*t);
  c.save();c.translate(o.cx,o.cy);c.rotate(o.rot);c.setLineDash([5,9]);c.lineDashOffset=-t*18;c.strokeStyle='rgba(96,165,250,'+(.4*clamp((t-.2)/1))+')';c.lineWidth=1.2;c.beginPath();c.ellipse(0,0,o.rx,o.ry,0,0,7);c.stroke();c.restore();
  var sat=K.length&&!mobile()&&sy<K[1].s&&hist.length;
  if(GLH&&GLH.lost()){GLH.cv.remove();GLH.fg.remove();GLH=null}
  if(GLH){globeBase(c,g.cx,g.cy,g.R);GLH.frame(f.w,f.h,g.cx,g.cy,g.R,heroLon);
    /* the satellite is drawn on a canvas above the streaks, so it still passes in front of them and behind the headline */
    var ff=fit(GLH.fg),fc=ff.c;if(GLH.fg._on){fc.clearRect(0,0,ff.w,ff.h);GLH.fg._on=false}
    if(sat){var hp0=pg(hero);fc.save();fc.translate(-hp0.x,-hp0.y);drawTrail(fc);var s0=hist[0];if(s0[2]>.01)satIcon(fc,s0[0],s0[1],13,s0[2]);fc.restore();GLH.fg._on=true}
    return}
  globe(c,f.w,f.h,g.cx,g.cy,g.R,{lon0:heroLon,dim:.95},t);
  drawWind(c,f.w,f.h,g.cx,g.cy,g.R,24,heroLon)
  /* in the hero phase the satellite lives on this canvas, so it passes behind the headline and buttons */
  if(sat){var hp=pg(hero);c.save();c.translate(-hp.x,-hp.y);drawTrail(c);var h0=hist[0];if(h0[2]>.01)satIcon(c,h0[0],h0[1],13,h0[2]);c.restore()}}
/* ---------------- wind flow on the hero globe ----------------
   wind.png holds an illustrative wind field (R = eastward, G = northward, 1 degree grid), not observed data.
   Until it loads the globe shows only its land dots. */
var WIND=null,WRAW='assets/orbit/';
(function(){var bust='?v=1';
  fetch(WRAW+'wind.json'+bust).then(function(r){if(!r.ok)throw r.status;return r.json()}).then(function(m){var im=new Image();im.crossOrigin='anonymous';
    im.onload=function(){var cv=document.createElement('canvas');cv.width=m.w;cv.height=m.h;var cx=cv.getContext('2d');cx.drawImage(im,0,0);var d=cx.getImageData(0,0,m.w,m.h).data,n=m.w*m.h,u=new Float32Array(n),v=new Float32Array(n);
      for(var i=0;i<n;i++){u[i]=d[4*i]/255*2*m.lim-m.lim;v[i]=d[4*i+1]/255*2*m.lim-m.lim}WIND={m:m,u:u,v:v}};im.src=WRAW+'wind.png'+bust}).catch(function(){})})();
function windAt(la,lo){var m=WIND.m,x=(((lo-m.lon_left)%360)+360)%360/m.dlon,y=(m.lat_top-la)/m.dlat;if(y<0)y=0;if(y>m.h-1.001)y=m.h-1.001;
  var x0=Math.floor(x)%m.w,y0=Math.floor(y),x1=(x0+1)%m.w,fx=x-Math.floor(x),fy=y-y0,a=y0*m.w,b=a+m.w,U=WIND.u,V=WIND.v;
  return [(U[a+x0]*(1-fx)+U[a+x1]*fx)*(1-fy)+(U[b+x0]*(1-fx)+U[b+x1]*fx)*fy,(V[a+x0]*(1-fx)+V[a+x1]*fx)*(1-fy)+(V[b+x0]*(1-fx)+V[b+x1]*fx)*fy]}
var PT=[],wtr=document.createElement('canvas'),WCOL=['rgba(64,120,214,.8)','rgba(80,168,222,.9)','rgba(79,209,197,.95)','rgba(228,255,251,1)'];
function seedP(p,la0,lo0){for(var k=0;k<24;k++){var z=Math.random()*2-1,la=Math.asin(z)/D,lo=Math.random()*360-180;if(P3(la,lo,la0,lo0)[2]>.08){p.la=la;p.lo=lo;p.age=Math.random()*90|0;p.max=70+Math.random()*80|0;return}}p.age=1e9}
var wDone=false;
/* streaks float a little above the surface (faster wind = higher), fade towards the limb and cast a faint shadow, for a slight 3D feel */
/* one step of the wind: moves the streak particles and collects this frame's segments in CSS px.
   WS = faint shadow segments; WP[12] = streaks by speed (4 colours) x depth (3 brightness levels) */
var WS=[],WP=[],QW=1;for(var q0=0;q0<12;q0++)WP.push([]);
var WCOLN=[[64,120,214,.8],[80,168,222,.9],[79,209,197,.95],[228,255,251,1]],WGA=[.42,.72,1],WLW=[.75,1,1.3];
function windSim(cx,cy,R,la0,lo0){
  var N=Math.round((mobile()?1500:4500)*QW),grow=0;if(PT.length>N)PT.length=N;while(PT.length<N&&grow++<(reduce?1e9:500)){var p0={};seedP(p0,la0,lo0);PT.push(p0)}
  WS.length=0;for(var j=0;j<12;j++)WP[j].length=0;var steps=reduce?14:1,so=Math.max(1.2,R/300);
  for(var i=0;i<PT.length;i++){var p=PT[i];for(var st=0;st<steps;st++){if(p.age++>p.max){seedP(p,la0,lo0);break}var A=P3(p.la,p.lo,la0,lo0);if(A[2]<.04){seedP(p,la0,lo0);break}
      var uv=windAt(p.la,p.lo),sp=Math.hypot(uv[0],uv[1]),cl=Math.max(.2,Math.cos(p.la*D));p.lo+=uv[0]*.016/cl;p.la+=uv[1]*.016;if(p.la>88||p.la<-88){seedP(p,la0,lo0);break}
      var B=P3(p.la,p.lo,la0,lo0),hR=R*(1.012+.032*Math.min(sp,20)/20),z=(A[2]+B[2])/2,db=z<.35?0:z<.7?1:2;
      WS.push(cx+A[0]*R+so,cy+A[1]*R+so,cx+B[0]*R+so,cy+B[1]*R+so);
      WP[(sp<3?0:sp<6?1:sp<10?2:3)*3+db].push(cx+A[0]*hR,cy+A[1]*hR,cx+B[0]*hR,cy+B[1]*hR)}}}
/* the part of the canvas the streaks can reach: the globe's square, cut to the canvas, in device pixels */
function windBox(w,h,cx,cy,R,k){var e=R*1.06+3;return [Math.max(0,Math.floor((cx-e)*k)),Math.max(0,Math.floor((cy-e)*k)),Math.min(Math.round(w*k),Math.ceil((cx+e)*k)),Math.min(Math.round(h*k),Math.ceil((cy+e)*k))]}

/* 2D drawing of the streaks, for browsers without WebGL2 */
var WB='',WG=null;
function drawWind(c,w,h,cx,cy,R,la0,lo0){if(!WIND)return;var k=c.canvas._k||DPR,bx=windBox(w,h,cx,cy,R,k),X0=bx[0],Y0=bx[1],X1=bx[2],Y1=bx[3];
  if(X1<=X0||Y1<=Y0)return;var key=bx.concat(k).join();
  /* streaks stay within 1.05 R (shadows within R + 3 px), so no round clip is needed when the trail is copied in */
  function put(){c.drawImage(wtr,X0/k,Y0/k,(X1-X0)/k,(Y1-Y0)/k)}
  if(reduce&&wDone&&WB===key){put();return}wDone=true;
  if(WB!==key){var old=null;if(WB&&WG&&wtr.width&&wtr.height){old=document.createElement('canvas');old.width=wtr.width;old.height=wtr.height;old.getContext('2d').drawImage(wtr,0,0)}
    WB=key;wtr.width=X1-X0;wtr.height=Y1-Y0;
    /* after a resize the streaks already drawn are carried over onto the globe's new place and size, so nothing starts over */
    if(old){var q=wtr.getContext('2d'),sc=R/WG[2];q.setTransform(k,0,0,k,-X0,-Y0);q.translate(cx,cy);q.scale(sc,sc);q.translate(-WG[0],-WG[1]);q.drawImage(old,WG[3]/WG[5],WG[4]/WG[5],old.width/WG[5],old.height/WG[5]);q.setTransform(1,0,0,1,0,0)}}
  WG=[cx,cy,R,X0,Y0,k];var t=wtr.getContext('2d');
  t.setTransform(1,0,0,1,0,0);t.globalCompositeOperation='destination-in';t.fillStyle='rgba(0,0,0,'+(reduce?0:.9)+')';t.fillRect(0,0,wtr.width,wtr.height);t.globalCompositeOperation='source-over';t.setTransform(k,0,0,k,-X0,-Y0);
  windSim(cx,cy,R,la0,lo0);var shadow=WS,paths=WP;
  var lw=Math.max(1,R/400);
  t.lineCap='square';t.strokeStyle='rgba(0,4,10,.32)';t.lineWidth=lw*1.3;t.beginPath();for(var m=0;m<shadow.length;m+=4){t.moveTo(shadow[m],shadow[m+1]);t.lineTo(shadow[m+2],shadow[m+3])}t.stroke();t.lineCap='round';
  for(var j=0;j<12;j++){var q=paths[j];if(!q.length)continue;var dbin=j%3;t.globalAlpha=WGA[dbin];t.lineWidth=lw*WLW[dbin];t.strokeStyle=WCOL[(j/3)|0];t.beginPath();for(var m2=0;m2<q.length;m2+=4){t.moveTo(q[m2],q[m2+1]);t.lineTo(q[m2+2],q[m2+3])}t.stroke()}
  t.globalAlpha=1;put()}

/* ---------------- hero globe on the graphics card ----------------
   The land dots and the wind streaks of the hero globe are drawn with WebGL2 on a canvas laid just above
   #globe (glow, sphere and rim stay on #globe; the satellite is drawn on a canvas above both). Thousands of
   tiny dots and streaks per frame are what kept the hero slow in Firefox; the graphics card draws them in a
   fraction of a millisecond. Without WebGL2 the hero keeps drawing everything on #globe. */
var GLH=(function(){
  if(!window.WebGL2RenderingContext||!gcv)return null;
  try{
    var cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    /* only with a real graphics card: where WebGL would run in software (no usable GPU), the 2D drawing is faster */
    var gl=cv.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,failIfMajorPerformanceCaveat:true});if(!gl)return null;
    var ri=gl.getExtension('WEBGL_debug_renderer_info');if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gl.getParameter(gl.RENDERER)+' '+(ri?gl.getParameter(ri.UNMASKED_RENDERER_WEBGL):'')))return null;
    var V='#version 300 es\n',F='#version 300 es\nprecision highp float;\n';
    function prog(vs,fs){function sh(t,src){var o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
      var p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,V+vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,F+fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
      var u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(var i=0;i<n;i++){var a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name)}return {p:p,u:u}}
    /* land dots: positions worked out on the graphics card from each dot's sines and cosines; each dot is a small
       square with the same edge smoothing as the 2D canvas gives a fractional-pixel rectangle */
    var PD=prog(
      'layout(location=0) in vec4 a_t;uniform vec4 u_rot;uniform vec3 u_g;uniform vec2 u_res;uniform float u_ds,u_dim;out vec2 v_o;out float v_a;'+
      'void main(){float cl=a_t.z*u_rot.z+a_t.w*u_rot.w,sl=a_t.w*u_rot.z-a_t.z*u_rot.w,z=u_rot.y*a_t.y+u_rot.x*a_t.x*cl;'+
      'if(z<=0.0){gl_Position=vec4(2.0,2.0,2.0,1.0);gl_PointSize=1.0;v_o=vec2(0.0);v_a=0.0;return;}'+
      'vec2 p=vec2(u_g.x+a_t.x*sl*u_g.z,u_g.y-(u_rot.x*a_t.y-u_rot.y*a_t.x*cl)*u_g.z);v_o=p;v_a=(0.15+0.85*floor(z*20.0+0.5)/20.0)*u_dim;'+
      'vec2 c=p+0.5*u_ds;gl_Position=vec4(c.x/u_res.x*2.0-1.0,1.0-c.y/u_res.y*2.0,0.0,1.0);gl_PointSize=ceil(u_ds)+2.0;}',
      'in vec2 v_o;in float v_a;uniform float u_ds;out vec4 o;'+
      'void main(){float sz=ceil(u_ds)+2.0;vec2 p=v_o+0.5*u_ds-0.5*sz+gl_PointCoord*sz;vec2 w=max(min(p+0.5,v_o+u_ds)-max(p-0.5,v_o),0.0);float a=v_a*w.x*w.y;'+
      'if(a<=0.0)discard;o=vec4(vec3(210.0,240.0,245.0)/255.0*a,a);}');
    /* streak segments: one small quad each, shaded as a stroke with round (or square) ends and smooth edges */
    var PS=prog(
      'layout(location=0) in vec2 a_k;layout(location=1) in vec4 a_s;layout(location=2) in vec2 a_w;layout(location=3) in vec4 a_c;uniform vec2 u_res;'+
      'out vec2 v_p;flat out vec4 v_s;flat out vec2 v_w;flat out vec4 v_c;'+
      'void main(){vec2 A=a_s.xy,B=a_s.zw,d=B-A;float L=length(d);vec2 u=L>1e-4?d/L:vec2(1.0,0.0),n=vec2(-u.y,u.x);float e=a_w.x+1.0;'+
      'vec2 p=(a_k.x<0.0?A:B)+u*a_k.x*e+n*a_k.y*e;v_p=p;v_s=a_s;v_w=a_w;v_c=a_c;gl_Position=vec4(p.x/u_res.x*2.0-1.0,1.0-p.y/u_res.y*2.0,0.0,1.0);}',
      'in vec2 v_p;flat in vec4 v_s;flat in vec2 v_w;flat in vec4 v_c;out vec4 o;'+
      'void main(){vec2 A=v_s.xy,B=v_s.zw,d=B-A;float L=length(d);vec2 u=L>1e-4?d/L:vec2(1.0,0.0),n=vec2(-u.y,u.x),q=v_p-A;float t=dot(q,u),s=abs(dot(q,n)),cov;'+
      'if(v_w.y<0.5){float tc=clamp(t,0.0,L);cov=clamp(v_w.x+0.5-length(vec2(t-tc,s)),0.0,1.0);}'+
      'else{cov=clamp(v_w.x+0.5-s,0.0,1.0)*clamp(min(t+v_w.x,L+v_w.x-t)+0.5,0.0,1.0);}'+
      'if(cov<=0.0)discard;o=v_c*cov;}');
    /* a textured rectangle: fading the trail, carrying it over after a resize, and putting it on screen */
    var PQ=prog(
      'layout(location=0) in vec2 a_k;uniform vec4 u_r;uniform vec2 u_res;out vec2 v_uv;'+
      'void main(){vec2 s=(a_k+1.0)*0.5;vec2 p=u_r.xy+vec2(s.x,1.0-s.y)*u_r.zw;v_uv=s;gl_Position=vec4(p.x/u_res.x*2.0-1.0,1.0-p.y/u_res.y*2.0,0.0,1.0);}',
      'in vec2 v_uv;uniform sampler2D u_t;uniform float u_f;out vec4 o;void main(){o=texture(u_t,v_uv)*u_f;}');
    var quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    var vq=gl.createVertexArray();gl.bindVertexArray(vq);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    var vs=gl.createVertexArray(),ib=gl.createBuffer();gl.bindVertexArray(vs);gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,ib);[[1,4,0],[2,2,16],[3,4,24]].forEach(function(a){gl.enableVertexAttribArray(a[0]);gl.vertexAttribPointer(a[0],a[1],gl.FLOAT,false,40,a[2]);gl.vertexAttribDivisor(a[0],1)});
    var vd=gl.createVertexArray(),db=gl.createBuffer(),nd=0;gl.bindVertexArray(vd);gl.bindBuffer(gl.ARRAY_BUFFER,db);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,4,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null);gl.disable(gl.DEPTH_TEST);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    var T=null,A=0,key='',G=null,wdone=false,buf=new Float32Array(0),lost=false;
    cv.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true});
    function tex(w,h){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      var f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);return {t:t,f:f}}
    function rect(src,r,w,h,f){gl.useProgram(PQ.p);gl.bindVertexArray(vq);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,src);gl.uniform1i(PQ.u.u_t,0);gl.uniform1f(PQ.u.u_f,f);gl.uniform4f(PQ.u.u_r,r[0],r[1],r[2],r[3]);gl.uniform2f(PQ.u.u_res,w,h);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
    function frame(w,h,cx,cy,R,lo0){var k=gcv._k||DPR,W=Math.max(1,Math.round(w*k)),H=Math.max(1,Math.round(h*k));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
      if(WIND){var bx=windBox(w,h,cx,cy,R,k),X0=bx[0],Y0=bx[1],TW=bx[2]-X0,TH=bx[3]-Y0;
        if(TW>0&&TH>0){var ky=bx.concat(k).join();
          if(ky!==key){var nt=[tex(TW,TH),tex(TW,TH)];
            /* after a resize the streaks already drawn are carried over onto the globe's new place and size */
            if(T&&G){var sc=R/G[2];gl.bindTexture(gl.TEXTURE_2D,T[A].t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
              gl.bindFramebuffer(gl.FRAMEBUFFER,nt[0].f);gl.viewport(0,0,TW,TH);gl.disable(gl.BLEND);
              rect(T[A].t,[(cx+sc*(G[3]/G[5]-G[0]))*k-X0,(cy+sc*(G[4]/G[5]-G[1]))*k-Y0,G[6]/G[5]*sc*k,G[7]/G[5]*sc*k],TW,TH,1);
              T.forEach(function(o){gl.deleteTexture(o.t);gl.deleteFramebuffer(o.f)})}
            T=nt;A=0;key=ky;wdone=false}
          G=[cx,cy,R,X0,Y0,k,TW,TH];
          if(!(reduce&&wdone)){wdone=true;windSim(cx/1,cy/1,R,24,lo0);
            var lw=Math.max(1,R/400)*k,n=WS.length/4,j,m,o=0;for(j=0;j<12;j++)n+=WP[j].length/4;if(buf.length<n*10)buf=new Float32Array(Math.ceil(n*1.3)*10);
            function put(a,hw,cap,c){for(var i=0;i<a.length;i+=4){buf[o]=a[i]*k-X0;buf[o+1]=a[i+1]*k-Y0;buf[o+2]=a[i+2]*k-X0;buf[o+3]=a[i+3]*k-Y0;buf[o+4]=hw;buf[o+5]=cap;buf[o+6]=c[0];buf[o+7]=c[1];buf[o+8]=c[2];buf[o+9]=c[3];o+=10}}
            put(WS,lw*1.3/2,1,[0,4/255*.32,10/255*.32,.32]);
            for(j=0;j<12;j++){if(!WP[j].length)continue;var cc=WCOLN[(j/3)|0],al=cc[3]*WGA[j%3];put(WP[j],lw*WLW[j%3]/2,0,[cc[0]/255*al,cc[1]/255*al,cc[2]/255*al,al])}
            /* fade the old trail into the other buffer, then draw this frame's segments on top */
            var B=1-A;gl.bindFramebuffer(gl.FRAMEBUFFER,T[B].f);gl.viewport(0,0,TW,TH);gl.disable(gl.BLEND);rect(T[A].t,[0,0,TW,TH],TW,TH,reduce?0:.9);
            if(o){gl.enable(gl.BLEND);gl.useProgram(PS.p);gl.uniform2f(PS.u.u_res,TW,TH);gl.bindVertexArray(vs);gl.bindBuffer(gl.ARRAY_BUFFER,ib);gl.bufferData(gl.ARRAY_BUFFER,buf.subarray(0,o),gl.STREAM_DRAW);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,o/10)}
            A=B}}}
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);
      if(LAND){if(!nd){var L2=LAND.length>>1,tr=new Float32Array(L2*4);for(var i=0;i<L2;i++){var f2=LAND[2*i]*D,l2=LAND[2*i+1]*D;tr[4*i]=Math.cos(f2);tr[4*i+1]=Math.sin(f2);tr[4*i+2]=Math.cos(l2);tr[4*i+3]=Math.sin(l2)}
          gl.bindBuffer(gl.ARRAY_BUFFER,db);gl.bufferData(gl.ARRAY_BUFFER,tr,gl.STATIC_DRAW);nd=L2}
        var f0=24*D,l0=lo0*D;gl.useProgram(PD.p);gl.uniform4f(PD.u.u_rot,Math.cos(f0),Math.sin(f0),Math.cos(l0),Math.sin(l0));gl.uniform3f(PD.u.u_g,cx*k,cy*k,R*k);gl.uniform2f(PD.u.u_res,W,H);
        gl.uniform1f(PD.u.u_ds,Math.max(1.1,R/380)*k);gl.uniform1f(PD.u.u_dim,.95);gl.bindVertexArray(vd);gl.drawArrays(gl.POINTS,0,nd)}
      if(WIND&&T)rect(T[A].t,[G[3],G[4],G[6],G[7]],W,H,1);
      gl.bindVertexArray(null)}
    gcv.parentNode.insertBefore(cv,gcv.nextSibling);
    var fg=document.createElement('canvas');fg.setAttribute('aria-hidden','true');fg.style.cssText=cv.style.cssText;cv.parentNode.insertBefore(fg,cv.nextSibling);
    return {frame:frame,fg:fg,cv:cv,lost:function(){return lost||gl.isContextLost()}};
  }catch(e){return null}})();

function drawTrail(c){for(var h=1;h<hist.length;h++){var a2=(1-h/hist.length)*Math.min(hist[h][2],hist[h-1][2]);if(Math.hypot(hist[h][0]-hist[h-1][0],hist[h][1]-hist[h-1][1])>120)continue;c.strokeStyle='rgba(79,209,197,'+(.55*a2)+')';c.lineWidth=3*a2+.4;c.beginPath();c.moveTo(hist[h-1][0],hist[h-1][1]);c.lineTo(hist[h][0],hist[h][1]);c.stroke()}}
/* typed eyebrow, scan date, HUD */
(function(){var el=$('.hero .typed');if(!el)return;var txt=el.dataset.text,i=0;if(reduce){el.textContent=txt;return}setTimeout(function step(){el.textContent=txt.slice(0,++i);if(i<txt.length)setTimeout(step,16)},300)})();
(function(){var d=new Date(),m=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];var sl=$('#scanline');if(sl)sl.textContent='SCAN · LANDSAT-9 · PASS '+d.getDate()+' '+m[d.getMonth()]+' '+d.getFullYear()+' · NDWI 0.42';$('#yr').textContent=d.getFullYear()})();

/* ---------------- reveals & counters ---------------- */
function runCount(el){if(el._done)return;el._done=1;var to=parseFloat(el.dataset.to),dec=+(el.dataset.dec||0),pre=el.dataset.pre||'',suf=el.dataset.suf||'';
  function fmt(v){return pre+(dec?v.toFixed(dec):Math.round(v).toLocaleString('en-US'))+suf}if(reduce){el.textContent=fmt(to);return}
  var t0=performance.now();(function step(){var p=clamp((performance.now()-t0)/1400),e=1-Math.pow(1-p,3);el.textContent=fmt(to*e);if(p<1)requestAnimationFrame(step)})()}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('in');$$('.cnt',el).forEach(runCount);if(el.classList.contains('cnt'))runCount(el);io.unobserve(el)})},{rootMargin:'0px 0px -8% 0px'});
$$('.rv,.cnt,.eyebrow,#contact h2,.contact').forEach(function(el){io.observe(el)});

/* ---------------- skills constellation ---------------- */
var SK=[['Remote sensing','sat',8,[]],['Machine learning and data','code',11,[10]],['Hydrology and groundwater','drop',6,[]],['GIS and data','layers',6,[5]],['Water quality','flask',5,[]],['Languages','chat',3,[2]]];
var ccv=$('#const'),SEL=0,constT=-1,hubs=[];
function constGeom(w,h){var k=Math.min(w/960,h/740,1);return {cx:w*.5,cy:h*.5,k:k}}
function drawConst(t){var f=fit(ccv),c=f.c,G=constGeom(f.w,f.h),k=G.k,cx=G.cx,cy=G.cy,RH=150*k,RL1=228*k,RL2=262*k,RT=300*k;c.clearRect(0,0,f.w,f.h);
  var lt=reduce?99:t;function ap(s,d){return ease(clamp((lt-s)/(d||.7)))}
  c.save();c.globalAlpha=ap(0,.8);c.setLineDash([3,5]);c.lineDashOffset=-t*10;c.strokeStyle='rgba(96,165,250,.3)';[86*k,RH,RL1+18*k].forEach(function(r){c.beginPath();c.arc(cx,cy,r,0,7);c.stroke()});c.setLineDash([]);c.restore();hubs=[];
  SK.forEach(function(b,bi){var a=-Math.PI/2+bi*Math.PI/3,sel=bi===SEL,hx=cx+RH*Math.cos(a),hy=cy+RH*Math.sin(a),pb=ap(.3+bi*.18,.7);hubs.push([hx,hy,bi]);
    c.save();c.globalAlpha=clamp(pb*3);c.strokeStyle=sel?'rgba(79,209,197,.85)':'rgba(79,209,197,.35)';c.lineWidth=sel?2:1.2;var x0=cx+62*k*Math.cos(a),y0=cy+62*k*Math.sin(a);c.beginPath();c.moveTo(x0,y0);c.lineTo(lerp(x0,hx,pb),lerp(y0,hy,pb));c.stroke();c.restore();
    var n=b[2],spread=Math.min(.95,.1*(n-1));for(var q=0;q<n;q++){var pk=ap(.3+bi*.18+.45+q*.05,.45),aa=a-spread/2+(n>1?spread*q/(n-1):0),r=q%2?RL2:RL1,lx=cx+r*Math.cos(aa),ly=cy+r*Math.sin(aa),isB=b[3].indexOf(q)>=0;
      c.save();c.globalAlpha=clamp(pk*4);c.strokeStyle=sel?'rgba(79,209,197,.6)':'rgba(141,165,205,.25)';c.lineWidth=1;c.beginPath();c.moveTo(hx,hy);c.lineTo(lerp(hx,lx,pk),lerp(hy,ly,pk));c.stroke();c.restore();
      c.save();c.globalAlpha=pk;c.beginPath();c.arc(lx,ly,(sel?6:5)*k*(pk<1?1+1.2*(1-pk):1),0,7);if(isB){c.fillStyle=NAVY;c.fill();c.setLineDash([2,2]);c.strokeStyle=TEAL;c.stroke();c.setLineDash([])}else{c.fillStyle=sel?TEAL:'rgba(79,209,197,.55)';if(sel){c.shadowColor=TEAL;c.shadowBlur=12+6*Math.sin(t*3+q)}c.fill();c.shadowBlur=0}c.restore()}
    c.save();c.globalAlpha=pb;c.translate(hx,hy);var sc=(.6+.4*pb)*k;c.scale(sc,sc);c.beginPath();for(var h=0;h<6;h++){var ha=Math.PI/3*h+Math.PI/6;h?c.lineTo(25*Math.cos(ha),25*Math.sin(ha)):c.moveTo(25*Math.cos(ha),25*Math.sin(ha))}c.closePath();c.fillStyle=sel?'#0c2a33':'#0b1424';c.fill();c.strokeStyle=sel?TEAL:'rgba(79,209,197,.5)';c.lineWidth=sel?2:1.2;if(sel){c.shadowColor=TEAL;c.shadowBlur=18}c.stroke();c.shadowBlur=0;glyph(c,b[1],0,0,11,sel?TEAL:SUB);c.restore();
    var lx2=cx+RT*Math.cos(a),ly2=cy+RT*Math.sin(a)+(Math.sin(a)<-.5?-14:Math.sin(a)>.5?20:0),al=Math.cos(a)>.3?'left':Math.cos(a)<-.3?'right':'center';
    c.save();c.globalAlpha=ap(.7+bi*.18,.6);c.textAlign=al;c.font='600 '+(f.w<600?13:16)+'px Inter,sans-serif';c.fillStyle=sel?TEAL:INK;
    /* wrap the branch name when the canvas is narrow so labels stay inside it */
    var room=al==='left'?f.w-8-lx2:al==='right'?lx2-8:f.w-16,lines=[],cur='';b[0].split(' ').forEach(function(w){var tr=cur?cur+' '+w:w;if(cur&&c.measureText(tr).width>room){lines.push(cur);cur=w}else cur=tr});lines.push(cur);
    var lh=f.w<600?16:19,mw=Math.max.apply(null,lines.map(function(l){return c.measureText(l).width}));
    if(al==='left'&&lx2+mw>f.w-6)lx2=f.w-6-mw;if(al==='right'&&lx2-mw<6)lx2=6+mw;
    if(Math.sin(a)<-.5)ly2-=(lines.length-1)*lh;lines.forEach(function(l,li){c.fillText(l,lx2,ly2+li*lh)});c.restore()});
  globe(c,f.w,f.h,cx,cy,52*k,{lon0:38-(reduce?0:30*t)},t);
  if(mobile()||reduce){var a2=-Math.PI/2+1.25*t;satIcon(c,cx+86*k*Math.cos(a2),cy+86*k*Math.sin(a2),10)}}
function select(i){SEL=i;$$('.grp').forEach(function(g){g.classList.toggle('on',+g.dataset.b===i);g.setAttribute('aria-pressed',+g.dataset.b===i)});var sn=$('#selname');if(sn)sn.textContent=SK[i][0]}
$$('.grp').forEach(function(g){g.addEventListener('click',function(){select(+g.dataset.b)});g.addEventListener('mouseenter',function(){select(+g.dataset.b)})});
ccv.addEventListener('click',function(e){var r=ccv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;hubs.forEach(function(h){if(Math.hypot(h[0]-x,h[1]-y)<34)select(h[2])})});

/* ---------------- lens: change detection on Lake Razazah ---------------- */
var lcv=$('#lens'),lensT0=-1,lensP=0,lensOff=false;
function blob(c,cx,cy,r,s,n,amp,sx,sy){var sv=seed;seed=s;var K=[];for(var i=0;i<5;i++)K.push([rnd()*amp,rnd()*6.28]);seed=sv;c.beginPath();for(var j=0;j<=n;j++){var a=j/n*6.283,rr=1;K.forEach(function(q,qi){rr+=q[0]*Math.sin((qi+2)*a+q[1])});var X=cx+r*rr*Math.cos(a)*sx,Y=cy+r*rr*Math.sin(a)*sy;j?c.lineTo(X,Y):c.moveTo(X,Y)}c.closePath()}
function noiseF(x,y){return .5+.25*Math.sin(x*.09+y*.05)+.18*Math.sin(x*.21-y*.17+1.3)+.12*Math.sin(x*.5+y*.43+2.1)}
function drawLens(){if(lensOff||!lcv)return;var f=fit(lcv),c=f.c,cx=f.w*.255,cy=f.h*.5,r=f.h*.34;c.clearRect(0,0,f.w,f.h);
  c.save();c.beginPath();c.arc(cx,cy,r,0,7);c.clip();seed=5;for(var i=-r;i<r;i+=5)for(var j=-r;j<r;j+=5){var v=noiseF(cx+i,cy+j)*.6+rnd()*.4,L=12+v*26;c.fillStyle='rgb('+(L*.75|0)+','+(L*.95|0)+','+(L*1.25|0)+')';c.fillRect(cx+i,cy+j,5.5,5.5)}
  blob(c,cx+4,cy,r*.62,17,140,.13,1.25,.95);c.setLineDash([6,5]);c.strokeStyle='rgba(231,237,247,.7)';c.lineWidth=1.6;c.stroke();c.setLineDash([]);
  blob(c,cx+4-r*.16*lensP,cy+r*.1*lensP,r*(.62-.32*lensP),17,140,.13,1.25,.95);c.fillStyle='rgba(79,209,197,.78)';c.shadowColor=TEAL;c.shadowBlur=18;c.fill();c.shadowBlur=0;
  c.font='600 20px "Chakra Petch",sans-serif';c.fillStyle=INK;c.textAlign='center';c.fillText(String(Math.round(1984+37*lensP)),cx,cy+r*.8);c.restore();
  c.strokeStyle='rgba(79,209,197,.6)';c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();c.strokeStyle='rgba(79,209,197,.25)';c.beginPath();c.arc(cx,cy,r+10,0,7);c.stroke();
  for(var k=0;k<72;k++){var a=k/72*6.283,l=k%6===0?10:4;c.strokeStyle='rgba(79,209,197,.45)';c.beginPath();c.moveTo(cx+(r+10)*Math.cos(a),cy+(r+10)*Math.sin(a));c.lineTo(cx+(r+10+l)*Math.cos(a),cy+(r+10+l)*Math.sin(a));c.stroke()}
  $('#decbar').style.width=(100*(1-.75*lensP))+'%';$('#lensq').classList.toggle('in',lensP>.97)}
$('#runapp').addEventListener('click',function(){lensOff=true;this.hidden=true;var box=$('#lensbox');box.innerHTML='<iframe src="https://risarezaei.projects.earthengine.app/view/gsw-lake-explorer" title="GSW Lake Explorer" allow="fullscreen"></iframe>'});
/* lake video: plays only while on screen, stays still for reduced motion */
(function(){var v=$('#lakevid');if(!v)return;if(reduce){v.removeAttribute('autoplay');v.pause();v.controls=true;return}
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.15}).observe(v)})();

/* ---------------- project schematics ---------------- */
function schem(cv){var f=fit(cv),c=f.c,w=f.w,h=f.h,S=w/150,kind=cv.dataset.s;seed=kind.length*7+3;function m(v){return v*S}var fnt='500 '+Math.round(10*S)+'px Inter,sans-serif';
  c.fillStyle='#08101d';c.fillRect(0,0,w,h);c.save();c.beginPath();c.rect(0,0,w,h);c.clip();
  function T(t,x,y,col,al){c.font=fnt;c.fillStyle=col||SUB;c.textAlign=al||'left';c.fillText(t,x,y)}
  function box(bx,by,bw,bh,t,on){c.beginPath();c.rect(m(bx),m(by),m(bw),m(bh));c.fillStyle=on?'rgba(79,209,197,.85)':'rgba(30,42,64,.9)';c.fill();c.strokeStyle='rgba(79,209,197,.35)';c.stroke();T(t,m(bx+bw/2),m(by+bh/2+3.2),on?'#04121a':SUB,'center')}
  function arrow(x1,y1,x2,y2,col,hs){c.strokeStyle=col;c.fillStyle=col;c.lineWidth=1.3;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();var a=Math.atan2(y2-y1,x2-x1);hs=hs||5;c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-hs*Math.cos(a-.45),y2-hs*Math.sin(a-.45));c.lineTo(x2-hs*Math.cos(a+.45),y2-hs*Math.sin(a+.45));c.closePath();c.fill()}
  if(kind==='flow'){['Inflow','Demands','WEAP daily','MOEA + AHP'].forEach(function(t,i){box(22,14+i*32,106,20,t,i===3);if(i<3)arrow(m(75),m(35+i*32),m(75),m(45+i*32),TEAL,4)})}
  if(kind==='mosaic'||kind==='watershed'){var n=13,cs=m(150/n);for(var i=0;i<n;i++)for(var j=0;j<n;j++){var v=noiseF(i*9*1.4,j*9*1.4)+rnd()*.12;c.fillStyle=v<.42?'rgba(79,209,197,.85)':v<.55?'rgba(96,165,250,.55)':v<.7?'#16314a':'#0d1d30';c.fillRect(i*cs,j*cs,cs-1,cs-1)}
    if(kind!=='mosaic'){c.fillStyle='rgba(5,8,15,.45)';c.fillRect(0,0,w,h);blob(c,m(75),m(75),m(52),3,90,.14,1,1);c.strokeStyle=TEAL;c.lineWidth=2;c.stroke();c.strokeStyle=BLUE;c.lineWidth=1.5;c.beginPath();c.moveTo(m(75),m(128));c.lineTo(m(72),m(90));c.lineTo(m(50),m(55));c.moveTo(m(72),m(90));c.lineTo(m(98),m(60));c.lineTo(m(105),m(38));c.stroke()}}
  if(kind==='bands'){['B03','B08','B11'].forEach(function(t,i){c.save();c.translate(m(28+i*10),m(18+i*16));c.transform(1,0,-.5,1,0,0);c.fillStyle=['rgba(96,165,250,.35)','rgba(79,209,197,.35)','rgba(141,165,205,.3)'][i];c.fillRect(m(20),0,m(80),m(44));c.strokeStyle='rgba(231,237,247,.4)';c.strokeRect(m(20),0,m(80),m(44));c.restore();T(t,m(122),m(30+i*16))});
    arrow(m(75),m(96),m(75),m(112),TEAL,4);box(40,114,70,22,'NDWI, RF',true)}
  if(kind==='section'){c.fillStyle='#132036';c.fillRect(0,m(70),w,h);for(var q=0;q<4;q++){c.fillStyle='rgba(141,165,205,'+(.05+q*.03)+')';c.fillRect(0,m(85+q*16),w,m(8))}
    c.fillStyle='rgba(96,165,250,.75)';c.beginPath();c.moveTo(0,m(50));c.lineTo(m(48),m(50));c.lineTo(m(30),m(80));c.lineTo(0,m(80));c.fill();c.fillStyle=MUTED;c.fillRect(m(46),m(40),m(8),m(42));c.fillStyle='rgba(96,165,250,.8)';c.fillRect(m(120),m(68),m(18),m(8));
    c.setLineDash([4,3]);c.strokeStyle=TEAL;c.lineWidth=1.6;c.beginPath();c.moveTo(m(54),m(78));c.quadraticCurveTo(m(90),m(80),m(120),m(76));c.stroke();c.setLineDash([]);[70,90,108].forEach(function(v){arrow(m(v),m(98),m(v+10),m(92),TEAL,4)});T('MODFLOW',m(8),m(144),MUTED)}
  if(kind==='balance'){blob(c,m(75),m(82),m(42),9,90,.12,1.2,.9);c.fillStyle='rgba(79,209,197,.14)';c.fill();c.strokeStyle=TEAL;c.lineWidth=1.6;c.stroke();
    arrow(m(60),m(14),m(60),m(46),BLUE,5);T('P',m(66),m(26),BLUE);arrow(m(95),m(60),m(95),m(22),TEAL,5);T('ET',m(101),m(30),TEAL);arrow(m(118),m(96),m(146),m(112),INK,5);T('Q',m(130),m(132),INK);T('ΔS',m(68),m(88),INK)}
  if(kind==='tanks'){c.beginPath();c.rect(m(12),m(40),m(70),m(70));c.fillStyle='rgba(96,165,250,.25)';c.fill();c.strokeStyle='rgba(96,165,250,.6)';c.stroke();
    for(var b=0;b<26;b++){c.fillStyle='rgba(231,237,247,.5)';c.beginPath();c.arc(m(18+rnd()*58),m(46+rnd()*58),m(1.4),0,7);c.fill()}
    [[110,52],[110,98]].forEach(function(p){c.beginPath();c.arc(m(p[0]),m(p[1]),m(20),0,7);c.fillStyle='rgba(79,209,197,.2)';c.fill();c.strokeStyle=TEAL;c.stroke();c.beginPath();c.arc(m(p[0]),m(p[1]),m(5),0,7);c.stroke()});arrow(m(82),m(75),m(90),m(62),SUB,4);T('SV30',m(14),m(134),MUTED)}
  if(kind==='slick'){blob(c,m(75),m(75),m(58),21,90,.1,1.1,.8);c.fillStyle='#0f2a4a';c.fill();c.strokeStyle='rgba(96,165,250,.5)';c.stroke();
    [[52,62,8,.9,'t₀'],[74,74,16,.5,'t₁'],[98,86,25,.25,'t₂']].forEach(function(q){c.fillStyle='rgba(231,237,247,'+q[3]+')';c.beginPath();c.ellipse(m(q[0]),m(q[1]),m(q[2]),m(q[2]*.6),.4,0,7);c.fill();T(q[4],m(q[0]-4),m(q[1]-q[2]*.6-5))})}
  if(kind==='wells'){c.strokeStyle='rgba(96,165,250,.55)';c.lineWidth=1.2;for(var l=0;l<7;l++){c.beginPath();c.moveTo(0,m(16+l*20));c.bezierCurveTo(m(50),m(16+l*20),m(80),m(75+(l-3)*6),m(104),m(75));c.stroke()}
    c.fillStyle=INK;c.beginPath();c.arc(m(106),m(75),m(4.5),0,7);c.fill();T('town well',m(80),m(98));var g=c.createRadialGradient(m(40),m(118),1,m(40),m(118),m(26));g.addColorStop(0,'rgba(79,209,197,.8)');g.addColorStop(1,'rgba(79,209,197,0)');c.fillStyle=g;c.beginPath();c.ellipse(m(48),m(118),m(34),m(18),0,0,7);c.fill();
    c.fillStyle=TEAL;c.beginPath();c.arc(m(40),m(118),m(4.5),0,7);c.fill();T('brine',m(10),m(142),TEAL)}
  c.restore()}
function cover(cv){var f=fit(cv),c=f.c;c.lineWidth=1;for(var k=0;k<26;k++){c.strokeStyle='rgba(79,209,197,'+(.12*(k%5===0?1.8:1))+')';c.beginPath();for(var i=0;i<=60;i++){var X=i/60*f.w,Y=f.h*(k/26)+28*Math.sin(i/60*7+k*.7)+18*Math.sin(i/60*17+k*1.9);i?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke()}}

/* ---------------- tools manifest ---------------- */
var TOOLS=[['gee-gsw-lake-explorer','GSW Lake Explorer: Any Lake on Earth, 1984–2021','EE · LIVE APP','JRC GSW · HydroLAKES','9','drop','water',1],
 ['gee-wetland-water-rf','Wetland Water Mapping with Random Forest','EE · MACHINE LEARNING','Landsat 5–9','9','leaf','water ml'],
 ['gee-air-quality-toolkit','Air-Quality Toolkit','EE · ATMOSPHERE','Sentinel-5P · MODIS AOD','7','wind','air'],
 ['gee-lake-chlorophyll','Lake Chlorophyll-a Monitor','EE · WATER QUALITY','Sentinel-2 · Cloud Score+','8','flask','water'],
 ['gee-basin-hydroclimate','Basin Hydroclimate Time Series','EE · HYDROLOGY','ERA5-Land · GRACE','7','cloud','water climate'],
 ['gee-landsat-timelapse','Landsat Timelapse for Lakes and Wetlands','EE · VISUALIZATION','Landsat','5','film','water'],
 ['gee-water-resources-course','Earth Engine for Water Resources: a Short Course','EE · TEACHING','6 lessons','35','book','teaching water ml'],
 ['gee-no2-station-tracker','NO₂ Tracking at Air-Quality Stations','EE · ATMOSPHERE','Sentinel-5P TROPOMI','6','molecule','air'],
 ['gee-cropland-dynamics','Global Cropland Dynamics, 2003–2019','EE · LAND COVER','GLAD cropland','6','field','land'],
 ['gee-station-temperature-timeseries','Daily Temperature at Multiple Stations','EE · CLIMATE','ERA5-Land','6','thermo','climate'],
 ['gee-elevation-cross-section','Elevation Along a Cross-Section','EE · TERRAIN','SRTM · Copernicus DEM','6','mountain','land'],
 ['era5-pressure-level-downloader','ERA5 Pressure-Level Downloads via CDS API','PYTHON · CLI','ERA5 · CDS API · NetCDF','7','term','climate python'],
 ['raster-point-sampler','Raster Values at Point Locations','PYTHON · CLI','rasterio · GeoPandas','6','pin','land python']];
function tyLabel(x){var p=x.split(' · '),s=p[0]==='PYTHON'?'Python command line':p[p.length-1].toLowerCase();if(s==='live app')s='live Earth Engine app';return s.charAt(0).toUpperCase()+s.slice(1)}
var THUMB={'era5-pressure-level-downloader':0,'raster-point-sampler':0};
var tb=$('#manifest tbody');
TOOLS.forEach(function(t,i){var py=t[2].indexOf('PY')===0,tr=document.createElement('tr');tr.className='row'+(t[7]?' feat':'');tr.dataset.cat=t[6];tr.dataset.repo=t[0];
  tr.innerHTML='<td class="n">'+String(i+1).padStart(2,'0')+'</td><td><a class="tool" href="tool.html?r='+t[0]+'"><canvas class="g"></canvas>'+t[1]+'</a></td><td class="ty'+(py?' py':'')+'">'+tyLabel(t[2])+'</td><td>'+t[3]+'</td><td class="st">'+t[4]+'</td><td class="lk">'+(t[7]?'<a href="https://risarezaei.projects.earthengine.app/view/gsw-lake-explorer" target="_blank" rel="noopener">App ↗</a>':'')+'<a href="tool.html?r='+t[0]+'">Tutorial →</a><a href="https://github.com/RisaRezaei/'+t[0]+'" target="_blank" rel="noopener">GitHub ↗</a></td>';
  tb.appendChild(tr);var cv=$('canvas',tr);cv.style.width='18px';cv.style.height='18px';var f=fit(cv);glyph(f.c,t[5],9,9,8,py?BLUE:TEAL)});
var peek=$('#peek'),pimg=$('img',peek);
$$('#manifest tr.row').forEach(function(tr){var repo=tr.dataset.repo;if(THUMB[repo]===0)return;
  tr.addEventListener('mouseenter',function(){pimg.src='assets/tools/'+repo+'.jpg';peek.classList.add('on')});tr.addEventListener('mouseleave',function(){peek.classList.remove('on')});
  tr.addEventListener('mousemove',function(e){peek.style.left=Math.min(innerWidth-320,e.clientX+24)+'px';peek.style.top=(e.clientY-100)+'px'})});
function filt(btns,items,attr){btns.forEach(function(b){b.addEventListener('click',function(){var f=b.dataset.f;btns.forEach(function(x){x.classList.toggle('on',x===b)});
  items().forEach(function(it){var ok=f==='all'||(' '+it.dataset.cat+' ').indexOf(' '+f+' ')>=0;it.classList.toggle('hide',!ok)});layout()})})}
filt($$('.layers button'),function(){return $$('#manifest tr.row')});
filt($$('.tabs button'),function(){return $$('.pcard')});

/* ---------------- DOIs ---------------- */
var DOIS=[['Wetland Water Mapping with Random Forest','23646350'],['Air-Quality Toolkit (Sentinel-5P and MODIS MAIAC)','23646371'],['Lake Chlorophyll-a Monitor','23646373'],['Basin Hydroclimate Time Series','23646375'],['Landsat Timelapse for Lakes and Wetlands','23646377'],['Earth Engine for Water Resources: a Short Course','23646381'],['NO₂ Tracking at Air-Quality Stations','23646385'],['Global Cropland Dynamics, 2003–2019','23646395'],['Daily Temperature at Multiple Stations','23646400'],['Elevation Along a Cross-Section','23646404'],['ERA5 Pressure-Level Downloader','23646410'],['Raster Point Sampler','23646412']];
var dbox=$('#dois');DOIS.forEach(function(d,i){var a=document.createElement('a');a.href='https://doi.org/10.5281/zenodo.'+d[1];a.target='_blank';a.rel='noopener';a.title=d[0]+' · 10.5281/zenodo.'+d[1];a.textContent=String(i+1).padStart(2,'0');dbox.appendChild(a)});
new IntersectionObserver(function(es,o){es.forEach(function(e){if(!e.isIntersecting)return;$$('a',dbox).forEach(function(a,i){setTimeout(function(){a.classList.add('in')},reduce?0:300+i*90)});$$('.ach .bar i').forEach(function(b){b.style.width=b.style.getPropertyValue('--w')});o.disconnect()})},{rootMargin:'0px 0px -10% 0px'}).observe(dbox);

/* ---------------- education orbits & contact globe ---------------- */
var orbs=$$('canvas[data-orb]'),cg=$('#cglobe');
function drawOrb(cv,t){var f=fit(cv),c=f.c,i=+cv.dataset.orb,ox=f.w/2,oy=f.h/2;c.clearRect(0,0,f.w,f.h);c.save();c.translate(ox,oy);c.rotate(-.35);c.strokeStyle='rgba(79,209,197,.35)';c.lineWidth=1;c.setLineDash([4,5]);c.lineDashOffset=-t*12;
  [70,46].slice(0,2-i).forEach(function(r){c.beginPath();c.ellipse(0,0,r,r*.42,0,0,7);c.stroke()});c.setLineDash([]);c.restore();globe(c,f.w,f.h,ox,oy,26,{lon0:38-40*t-i*90},t);
  if(i===1||mobile()||reduce){var a=2.4+1.8*t,o=orbPt({cx:ox,cy:oy,rx:70,ry:29.4,rot:-.35},a);c.fillStyle=INK;c.shadowColor=TEAL;c.shadowBlur=10;c.beginPath();c.arc(o[0],o[1],4,0,7);c.fill();c.shadowBlur=0}}
function cgeom(w,h){var R=mobile()?w*.9:Math.max(w*.39,620*Math.min(1,w/1600));return {cx:mobile()?w*.5:w*.75,cy:h+R*.48,R:R}}
function drawContact(t){var f=fit(cg),c=f.c,g=cgeom(f.w,f.h);c.clearRect(0,0,f.w,f.h);globe(c,f.w,f.h,g.cx,g.cy,g.R,{lon0:38-(reduce?0:4*t)},t)}

/* ---------------- satellite layer (scroll-linked) ---------------- */
var scv=$('#sat'),L={},K=[],sy=scrollY,hist=[],trackS=[0,0],gridS=[0,0],tabS=[0,0],lensS=[0,0],tlS=[0,0],contS=0,lensArrive=-1;
function pg(el){var r=el.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height}}
function layout(){DIRTY=true;if(mobile())return;var vh=innerHeight,H=pg(hero),g=heroGeom(H.w,H.h),max=document.documentElement.scrollHeight-vh;
  L.orb=orbGeom({cx:H.x+g.cx,cy:H.y+g.cy,R:g.R});
  var tr=pg($('#track'));L.track={x0:Math.min(innerWidth-30,tr.x+tr.w+20),x1:tr.x+10,y:tr.y+tr.h*.42};
  var cc=pg(ccv),G=constGeom(cc.w,cc.h);L.sk={cx:cc.x+G.cx,cy:cc.y+G.cy,r:86*G.k};
  var lb=pg($('#lensbox'));L.lens={x:lb.x+lb.w*.3125,y:lb.y+lb.h*.5,r:lb.h*.4,sy:lb.y-34};
  var pv=$$('.pcard').filter(function(p){return !p.classList.contains('hide')});var gg=pg($('#pgrid'));L.grid={x0:gg.x+gg.w+30,x1:gg.x-30,y:gg.y-22,top:gg.y,bot:gg.y+gg.h,cards:pv.map(function(p){var q=pg(p);return [p,q.x+q.w/2]})};
  var rows=$$('#manifest tr.row').filter(function(r){return !r.classList.contains('hide')}),mt=pg($('#manifest'));L.tab={x:mt.x-34,y0:mt.y+40,y1:mt.y+mt.h-24,rows:rows.map(function(r){return [r,pg(r).y]})};
  var b45=pg($('.peer .big b'));L.p45={cx:b45.x+b45.w/2,cy:b45.y+b45.h/2,rx:Math.max(70,b45.w*.75),ry:58};
  var ax=pg($('.lane .axis')),th=pg($('.tl-head'));var lanes=$$('.lane'),lb2=pg(lanes[lanes.length-1]);L.tl={x0:ax.x,x1:ax.x+ax.w,y:th.y+th.h-2,yb:lb2.y+lb2.h,bars:$$('.bar2'),ms:$$('.ms,.ms-l')};
  var ob=pg(orbs[0]);L.edu={cx:ob.x+ob.w/2,cy:ob.y+ob.h/2};
  var dl=pg($('#dlabel')),ct=pg($('#contact'));L.dl={x:dl.x-26,y:dl.y+dl.h/2};var cgg=cgeom(ct.w,ct.h);L.cg={cx:ct.x+cgg.cx,cy:ct.y+cgg.cy,R:cgg.R};
  L.stages=$$('[data-stage]').slice(1).map(function(s,i){return {y:pg(s).y,n:i+2,name:s.dataset.stage}});
  function F(fn){return {f:fn}}
  /* hero orbit: find the arc that leaves the viewport and cross it quickly, so the satellite is on screen most of the time */
  var o1=0,o2=0,N=720,off=[];for(var i=0;i<N;i++){var aa=i/N*Math.PI*2,pp=orbPt(L.orb,aa);off.push(pp[0]>innerWidth+40||(Math.sin(aa)<0&&Math.hypot(pp[0]-L.orb.cx,pp[1]-L.orb.cy)<g.R-8))}
  if(off.some(Boolean)&&!off.every(Boolean)){var st=off.findIndex(function(v,i){return v&&!off[(i+N-1)%N]}),n=0;while(off[(st+n)%N])n++;o1=st/N*Math.PI*2;o2=o1+n/N*Math.PI*2}
  L.hid=[o1,o2];L.gR=g.R;
  var orbF=function(t){var a=heroAng(t),p=orbPt(L.orb,a),al=1;if(Math.sin(a)<0){var d=Math.hypot(p[0]-L.orb.cx,p[1]-L.orb.cy);al=clamp((d-L.gR+6)/18)}p.push(al);return p},skF=function(t){var a=-Math.PI/2+1.25*t;return [L.sk.cx+L.sk.r*Math.cos(a),L.sk.cy+L.sk.r*Math.sin(a)]},
      p45F=function(t){var a=-2.3+t;return [L.p45.cx+L.p45.rx*Math.cos(a),L.p45.cy+L.p45.ry*Math.sin(a)]},eduF=function(t){return orbPt({cx:L.edu.cx,cy:L.edu.cy,rx:70,ry:29.4,rot:-.35},2.4+1.8*t)};
  K=[];function add(s,o){o.s=s;K.push(o);return s}
  add(0,F(orbF));add(H.h*.22,F(orbF));
  trackS=[add(L.track.y-vh*.66,{p:[L.track.x0,ty(L.track.x0)],track:1}),add(L.track.y-vh*.3,{p:[L.track.x1,ty(L.track.x1)]})];
  add(L.sk.cy-vh*.56,F(skF));add(L.sk.cy-vh*.4,F(skF));
  lensS=[add(L.lens.y-vh*.58,{p:[L.lens.x,L.lens.sy]}),add(L.lens.y-vh*.38,{p:[L.lens.x,L.lens.sy]})];
  gridS=[add(L.grid.top-vh*.55,{p:[L.grid.x0,L.grid.y]}),add(L.grid.top-vh*.12,{p:[L.grid.x1,L.grid.y]})];
  tabS=[add(L.tab.y0-vh*.5,{p:[L.tab.x,L.tab.y0]}),add(L.tab.y1-vh*.62,{p:[L.tab.x,L.tab.y1]})];
  add(L.p45.cy-vh*.5,F(p45F));add(L.p45.cy-vh*.32,F(p45F));
  tlS=[add(L.tl.y-vh*.55,{p:[L.tl.x0,L.tl.y]}),add(L.tl.y-vh*.25,{p:[L.tl.x0+(L.tl.x1-L.tl.x0)*(5.45/6),L.tl.y]})];
  add(L.edu.cy-vh*.56,F(eduF));add(L.edu.cy-vh*.36,F(eduF));
  contS=add(L.dl.y-vh*.5,{p:[L.dl.x,L.dl.y]});add(1e9,{p:[L.dl.x,L.dl.y]});
  for(var i=1;i<K.length;i++){if(K[i].s>max-4*(K.length-i)&&K[i].s<1e8)K[i].s=max-4*(K.length-i);K[i].s=Math.max(K[i].s,K[i-1].s+2)}
  trackS=[K[2].s,K[3].s];lensS=[K[6].s,K[7].s];gridS=[K[8].s,K[9].s];tabS=[K[10].s,K[11].s];tlS=[K[14].s,K[15].s];contS=K[18].s}
function heroAng(t){var o1=L.hid[0],o2=L.hid[1],W=.42,a0=2.15;if(o2<=o1)return a0+W*t;
  var Lv=Math.PI*2-(o2-o1),Tv=Lv/W,Th=2.2,T=Tv+Th,v0=((a0-o2)%(Math.PI*2)+Math.PI*2)%(Math.PI*2),u=(v0/W+t)%T;
  return u<Tv?o2+W*u:o1+(o2-o1)*((u-Tv)/Th)}
function ty(x){return L.track.y+22*Math.sin(x/innerWidth*9.4+.6)}
function kpos(k,t){return k.f?k.f(t):k.p}
function satAt(s,t){if(!K.length)return null;for(var i=0;i<K.length-1;i++){if(s<K[i+1].s){var a=K[i],b=K[i+1],q=clamp((s-a.s)/(b.s-a.s));var A=kpos(a,t),B=kpos(b,t);
      if(a.f&&b.f&&a.f===b.f)return A;var al=A.length>2?lerp(A[2],1,clamp(q*5)):1;if(a.track){var x=lerp(A[0],B[0],q);return [x,ty(x)]}var e=ease(q),dx=B[0]-A[0],dy=B[1]-A[1],d=Math.hypot(dx,dy),bul=Math.min(260,d*.3)*(i%2?1:-1),mx=(A[0]+B[0])/2-dy/(d||1)*bul,my=(A[1]+B[1])/2+dx/(d||1)*bul,m=1-e;
      return [m*m*A[0]+2*m*e*mx+e*e*B[0],m*m*A[1]+2*m*e*my+e*e*B[1],al]}}return kpos(K[K.length-1],t)}
var heroNav=$('.hero-nav'),navEl=$('#nav'),prog=$('#prog'),links=$$('.nav ul a'),secs=$$('main section,.contact');
function frameSat(t){var vh=innerHeight;sy+=(scrollY-sy)*(reduce?1:.14);if(Math.abs(scrollY-sy)<.3)sy=scrollY;
  /* nav: only after a scroll or a layout change, all reads first and then the writes */
  if(SC){var max=document.documentElement.scrollHeight-vh,show=scrollY>hero.offsetHeight*.7||(!mobile()&&getComputedStyle(heroNav).display==='none'),mid=scrollY+vh*.45,act=null;
    secs.forEach(function(s){var r=s.getBoundingClientRect();if(r.top+scrollY<=mid)act=s.id});
    navEl.classList.toggle('show',show);var pw=(100*clamp(scrollY/max))+'%';if(prog._w!==pw){prog._w=pw;prog.style.width=pw}links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+act)})}
  if(mobile()){if(SC){$$('.pcard,#manifest tr.row').forEach(function(e){e.classList.add('in')});$$('.bar2').forEach(function(b){b.style.setProperty('--s',1);b.style.setProperty('--e',1)});$$('.ms,.ms-l').forEach(function(m){m.style.setProperty('--m',1)});if(lensArrive<0&&inView($('#lensbox')))lensArrive=t}lensP=clamp((t-lensArrive-.4)/2.6);return}
  var f=fit(scv),c=f.c;c.clearRect(0,0,f.w,f.h);if(!K.length)return;var s=sy,P=satAt(s,t);
  c.save();c.translate(0,-sy);
  /* section boundary scan lines */
  L.stages.forEach(function(st){var yy=st.y-sy,d=Math.abs(yy-vh*.5)/(vh*.5),a=clamp(1-d)*.9;if(a<=.02)return;var g=c.createLinearGradient(0,st.y-70,0,st.y+70);g.addColorStop(0,'rgba(79,209,197,0)');g.addColorStop(.5,'rgba(79,209,197,'+(.07*a)+')');g.addColorStop(1,'rgba(79,209,197,0)');c.fillStyle=g;c.fillRect(0,st.y-70,f.w,140);
    c.fillStyle='rgba(160,255,245,'+(.35*a)+')';c.fillRect(0,st.y,f.w,1);});
  /* about ground track drawn behind the satellite */
  if(s>trackS[0]){var tx=s>=trackS[1]?L.track.x1:P[0];c.setLineDash([3,6]);c.strokeStyle='rgba(79,209,197,.5)';c.lineWidth=1.4;c.beginPath();var st0=false;for(var x=L.track.x0;x>=tx;x-=6){var Y=ty(x);st0?c.lineTo(x,Y):c.moveTo(x,Y);st0=true}c.stroke();c.setLineDash([])}
  $('#tracklab').classList.toggle('in',s>trackS[0]+(trackS[1]-trackS[0])*.35);
  /* lens scan beam + change detection */
  var lensOn=s>=lensS[0]-40&&s<gridS[0];if(s>=lensS[0]){if(lensArrive<0)lensArrive=t}else lensArrive=-1;lensP=lensArrive<0?0:clamp((t-lensArrive-.3)/2.6);
  if(lensOn&&!lensOff){var la=clamp((s-(lensS[0]-40))/60)*clamp(1-(Math.hypot(P[0]-L.lens.x,P[1]-L.lens.sy)-20)/90);c.save();c.globalAlpha=la;var g2=c.createLinearGradient(0,P[1],0,L.lens.y);g2.addColorStop(0,'rgba(79,209,197,.35)');g2.addColorStop(1,'rgba(79,209,197,.04)');c.fillStyle=g2;c.beginPath();c.moveTo(P[0]-8,P[1]+14);c.lineTo(L.lens.x-L.lens.r,L.lens.y);c.lineTo(L.lens.x+L.lens.r,L.lens.y);c.lineTo(P[0]+8,P[1]+14);c.closePath();c.fill();
    c.strokeStyle='rgba(79,209,197,.5)';c.setLineDash([3,5]);c.lineDashOffset=-t*30;c.beginPath();c.moveTo(P[0],P[1]+14);c.lineTo(L.lens.x-L.lens.r,L.lens.y);c.moveTo(P[0],P[1]+14);c.lineTo(L.lens.x+L.lens.r,L.lens.y);c.stroke();c.setLineDash([]);c.restore()}
  /* project sweep */
  var sw=s<gridS[0]?1e9:s>=gridS[1]?-1e9:P[0];L.grid.cards.forEach(function(q){q[0].classList.toggle('in',s>=gridS[1]||sw<q[1])});
  if(s>gridS[0]&&s<gridS[1]){var ba=clamp((s-gridS[0])/40)*clamp((gridS[1]-s)/40);c.save();c.globalAlpha=ba;var g3=c.createLinearGradient(P[0]-90,0,P[0]+30,0);g3.addColorStop(0,'rgba(79,209,197,0)');g3.addColorStop(.85,'rgba(79,209,197,.12)');g3.addColorStop(1,'rgba(79,209,197,0)');c.fillStyle=g3;c.fillRect(P[0]-90,L.grid.top-8,120,L.grid.bot-L.grid.top+16);c.fillStyle='rgba(79,209,197,.7)';c.shadowColor=TEAL;c.shadowBlur=14;c.fillRect(P[0],L.grid.top-8,1.5,L.grid.bot-L.grid.top+16);c.shadowBlur=0;c.restore()}
  /* table scan */
  L.tab.rows.forEach(function(q){q[0].classList.toggle('in',s>=tabS[1]||(s>=tabS[0]&&P[1]>q[1]+4))});
  if(s>tabS[0]&&s<tabS[1]){c.fillStyle='rgba(79,209,197,.6)';c.shadowColor=TEAL;c.shadowBlur=12;c.fillRect(L.tab.x+34,P[1],f.w-2*(L.tab.x+34)+0,1.5);c.shadowBlur=0}
  /* timeline pass */
  var cur=s<tlS[0]?2020:s>=tlS[1]?2030:2021+(P[0]-L.tl.x0)/(L.tl.x1-L.tl.x0)*6;
  L.tl.bars.forEach(function(b){var a=+b.dataset.s,e=+b.dataset.e;b.style.setProperty('--s',clamp((cur-a)/(e-a)));b.style.setProperty('--e',cur>=e?1:0);b.style.opacity=cur>a?1:0});
  L.tl.ms.forEach(function(m){var tt=+m.dataset.t;m.style.setProperty('--m',clamp((cur-tt)/.25))});
  if(s>tlS[0]&&s<tlS[1]){c.fillStyle='rgba(79,209,197,.5)';c.shadowColor=TEAL;c.shadowBlur=10;c.fillRect(P[0],L.tl.y+6,1.5,L.tl.yb-L.tl.y-12);c.shadowBlur=0}
  /* downlink */
  if(s>=contS-vh*.3){var da=clamp((s-(contS-vh*.3))/(vh*.3)),gx=L.cg.cx,gy=L.cg.cy-L.cg.R,pts=[[gx-L.cg.R*.32,gy+L.cg.R*.06],[gx+L.cg.R*.29,gy+L.cg.R*.05],[gx-L.cg.R*.02,gy+.5]];c.save();c.globalAlpha=da;
    c.fillStyle='rgba(79,209,197,'+(.06+.03*Math.sin(t*4))+')';c.beginPath();c.moveTo(P[0],P[1]);c.lineTo(pts[0][0],pts[0][1]);c.lineTo(pts[1][0],pts[1][1]);c.closePath();c.fill();
    c.setLineDash([4,6]);c.lineDashOffset=-t*40;c.strokeStyle='rgba(79,209,197,.6)';c.lineWidth=1.2;pts.forEach(function(p){c.beginPath();c.moveTo(P[0],P[1]);c.lineTo(p[0],p[1]);c.stroke()});c.setLineDash([]);
    for(var k=0;k<3;k++){var fr=(t*.8+k/3)%1;c.fillStyle='rgba(232,255,251,'+(1-fr)+')';c.shadowColor=TEAL;c.shadowBlur=12;c.beginPath();c.arc(lerp(P[0],pts[2][0],fr),lerp(P[1],pts[2][1],fr),3,0,7);c.fill();c.shadowBlur=0}c.restore()}
  /* satellite + trail */
  var PA=P.length>2?P[2]:1;hist.unshift([P[0],P[1],PA]);if(hist.length>22)hist.length=22;
  if(s>=K[1].s){drawTrail(c);if(PA>.01)satIcon(c,P[0],P[1],13,PA)}c.restore()}

/* ---------------- main loop ---------------- */
var visible={hero:true,const:false,lens:false,orb:false,cg:false};
new IntersectionObserver(function(es){es.forEach(function(e){var k=e.target===hero?'hero':e.target===ccv?'const':e.target===$('#lensbox')?'lens':e.target===cg?'cg':'orb';visible[k]=e.isIntersecting;if(k==='const'&&e.isIntersecting&&constT<0)constT=now()})}).observe(hero);
var vio=new IntersectionObserver(function(es){es.forEach(function(e){var t=e.target;if(t===ccv){visible.const=e.isIntersecting;if(e.isIntersecting&&constT<0)constT=now()}else if(t===cg)visible.cg=e.isIntersecting;else if(t.id==='lensbox')visible.lens=e.isIntersecting;else visible.orb=e.isIntersecting})});
[ccv,cg,$('#lensbox'),$('.deg')].forEach(function(el){vio.observe(el)});
var lastHud=0,words=$$('.sec-word');
/* giant section words drift sideways with the scroll */
function frameWords(){if(reduce||!SC)return;var vh=innerHeight,rs=words.map(function(w){return w.getBoundingClientRect()});
  words.forEach(function(w,i){var r=rs[i];if(r.bottom<-300||r.top>vh+300)return;var v='translateX('+((r.top-vh*.5)*.18).toFixed(1)+'px)';if(w._tx!==v){w._tx=v;w.style.transform=v}})}
/* if this computer still can't keep the hero smooth, draw fewer wind streaks, then use a lower canvas resolution */
var QL=0,QT=[],QP=0;
function quality(){var n=performance.now();if(reduce||!visible.hero||document.hidden||n-T0<1500){QP=0;QT.length=0;return}
  if(QP){var d=n-QP;if(d<250)QT.push(d)}QP=n;var sum=QT.reduce(function(a,b){return a+b},0);if(sum<1200||QT.length<8)return;
  var m=sum/QT.length;QT.length=0;if(m<24||QL>=2)return;QL++;
  QW=QL===1?.6:.45}
function loop(){var t=now();SC=scrollY!==lastSY||DIRTY||t-lastSC>.3;if(SC)lastSC=t;lastSY=scrollY;DIRTY=false;quality();frameWords();
  if(visible.hero){drawHero(t);if(t-lastHud>.2){lastHud=t;var lon=((-heroLon%360)+540)%360-180;var hud=$('#hud');if(hud)hud.innerHTML='EO-SAT · nadir scan &nbsp; LAT 24.00 &nbsp;LON '+(-lon).toFixed(2)}}
  if(visible.const)drawConst(t-(constT<0?t:constT));
  if(visible.lens)drawLens();
  if(visible.orb)orbs.forEach(function(o){drawOrb(o,t)});
  if(visible.cg)drawContact(t);
  frameSat(t);
  requestAnimationFrame(loop)}

/* the lake map is a whole page of its own: it loads only when it comes near the screen, so it doesn't stall the globe at start */
$$('iframe[data-src]').forEach(function(f){if(!window.IntersectionObserver){f.src=f.dataset.src;return}var io2=new IntersectionObserver(function(es){if(es[0].isIntersecting){f.src=f.dataset.src;io2.disconnect()}},{rootMargin:'900px 0px'});io2.observe(f)});

/* ---------------- live data: ORCID & GitHub ---------------- */
(function(){var API='https://pub.orcid.org/v3.0/0009-0009-5708-7673/',ADD={'0378-3774':2};
  fetch(API+'peer-reviews',{headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw r.status;return r.json()}).then(function(d){var rows={},orgs={},total=0;
    (d.group||[]).forEach(function(g){var id=(((g['external-ids']||{})['external-id']||[]).map(function(e){return e['external-id-value']})[0]||'').replace(/^issn:/i,''),n=(g['peer-review-group']||[]).length;
      (g['peer-review-group']||[]).forEach(function(x){(x['peer-review-summary']||[]).forEach(function(s){var o=s['convening-organization'];if(o&&o.name)orgs[o.name.replace(/,?\s*(Inc|Ltd|B\.?V|GmbH|LLC)\.?$/i,'')]=1})});if(n){total+=n;rows[id]=(rows[id]||0)+n}});
    if(!total)return;Object.keys(ADD).forEach(function(k){rows[k]=(rows[k]||0)+ADD[k];total+=ADD[k]});var on=Object.keys(orgs),pub=on.length===1?on[0]:'';
    $$('[data-orcid="reviews"]').forEach(function(e){e.dataset.to=total;if(e._done)e.textContent=total});
    $$('[data-orcid="reviews-label"]').forEach(function(e){e.textContent='Peer reviews for '+(pub?pub+' ':'')+'journals'});$$('[data-orcid="reviews-for"]').forEach(function(e){e.textContent=pub?'for '+pub+' journals':'for journals'});
    $$('.ach[data-issn]').forEach(function(a){var n=rows[a.dataset.issn]||0;$$('.n',a).forEach(function(x){x.textContent=n});$$('.t',a).forEach(function(x){x.textContent=total});var b=$('.bar i',a),w=(100*n/total).toFixed(1)+'%';b.style.setProperty('--w',w);if(b.style.width)b.style.width=w})}).catch(function(){})})();
fetch('https://api.github.com/users/RisaRezaei').then(function(r){return r.ok?r.json():null}).then(function(u){if(!u)return;var el=$('#gh-repos');el.dataset.to=u.public_repos;if(el._done)el.textContent=u.public_repos}).catch(function(){});

/* ---------------- video player ---------------- */
(function(){var m=$('.ytm'),v=$('.ytm-v',m),cap=$('.ytm-cap b',m),lk=$('.ytm-cap a',m),last=null;
  function open(b){last=b;var id=b.dataset.yt,t=b.dataset.t;v.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';v.firstChild.title=t;cap.textContent=t;lk.href='https://www.youtube.com/watch?v='+id;m.classList.add('on');m.setAttribute('aria-hidden','false');$('.ytm-x',m).focus()}
  function close(){m.classList.remove('on');m.setAttribute('aria-hidden','true');setTimeout(function(){v.innerHTML=''},260);if(last)last.focus()}
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.ytc-frame');if(b)open(b)});m.addEventListener('click',function(e){if(e.target===m||e.target.closest('.ytm-x'))close()});addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('on'))close()})})();

/* ---------------- videos: the newest uploads from the YouTube channel ----------------
   A GitHub Action (.github/workflows/youtube-videos.yml) checks the channel every 30 minutes and keeps
   assets/yt/videos.json at the 10 newest videos. The page reads that file straight from the repository, so a
   new upload shows up without waiting for the site to be rebuilt; the cards written in the page are the fallback.
   Videos uploaded in the last 14 days carry a "New" tag. */
(function(){var grid=$('.ytgrid'),nav=$('.yt-nav');if(!grid)return;var RAW='https://raw.githubusercontent.com/RisaRezaei/RisaRezaei.github.io/main/';
  function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
  function mmss(n){n=Math.round(+n||0);return n>0?Math.floor(n/60)+':'+('0'+n%60).slice(-2):''}
  function gap(){return parseFloat(getComputedStyle(grid).columnGap)||0}
  function step(){var c=grid.firstElementChild;return c?c.getBoundingClientRect().width+gap():grid.clientWidth}
  function arrows(){if(!nav)return;var max=grid.scrollWidth-grid.clientWidth;nav.hidden=max<4;nav.children[0].disabled=grid.scrollLeft<4;nav.children[1].disabled=grid.scrollLeft>max-4}
  function show(d){var vs=d&&d.videos;if(!vs||!vs.length)return;vs=vs.slice(0,10);var now=Date.now();
    grid.innerHTML=vs.map(function(v,i){var t=esc(v.title),fresh=now-Date.parse(v.published)<14*864e5,len=mmss(v.len);
      return '<article class="ytc rv" style="--d:'+(i%3*.15).toFixed(2)+'s"><button class="ytc-frame" type="button" data-yt="'+esc(v.id)+'" data-t="'+t+'" aria-label="Play video: '+t+'">'+
        '<img src="assets/yt/'+esc(v.id)+'-640.jpg" alt="" loading="lazy" decoding="async"><span class="ytc-play" aria-hidden="true"></span>'+
        (fresh?'<span class="ytc-new">New</span>':'')+(len?'<span class="ytc-len">'+len+'</span>':'')+'</button>'+
        '<div class="ytc-meta"><b>'+t+'</b>'+(v.sub?'<span>'+esc(v.sub)+'</span>':'')+'</div></article>'}).join('');
    /* a thumbnail the site hasn't published yet comes from the repository, or else from YouTube */
    $$('img',grid).forEach(function(im){var id=im.parentNode.dataset.yt,k=0;im.addEventListener('error',function(){k++;if(k===1)im.src=RAW+'assets/yt/'+id+'-640.jpg';else if(k===2)im.src='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg'})});
    $$('.ytc',grid).forEach(function(c){io.observe(c)});grid.scrollLeft=0;arrows()}
  if(nav){nav.children[0].addEventListener('click',function(){grid.scrollBy({left:-step(),behavior:'smooth'})});nav.children[1].addEventListener('click',function(){grid.scrollBy({left:step(),behavior:'smooth'})})}
  grid.addEventListener('scroll',arrows,{passive:true});addEventListener('resize',arrows);arrows();
  var b=Math.floor(Date.now()/3e5);   /* changes every 5 minutes, so a fresh list is fetched at most that often */
  fetch(RAW+'assets/yt/videos.json?v='+b).then(function(r){if(!r.ok)throw r.status;return r.json()})
    .catch(function(){return fetch('assets/yt/videos.json?v='+b).then(function(r){return r.ok?r.json():null})}).then(show).catch(function(){})})();

/* ---------------- boot ---------------- */
function refresh(){stars();$$('.pcard canvas').forEach(schem);$$('canvas[data-cover]').forEach(cover);layout()}
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(refresh,120)});
fetch('assets/orbit/land.json').then(function(r){return r.json()}).then(function(d){var a=new Float32Array(d.length*2);d.forEach(function(p,i){a[2*i]=p[0];a[2*i+1]=p[1]});LAND=a}).catch(function(){});
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){refresh();setTimeout(layout,600);addEventListener('load',layout)});
requestAnimationFrame(function(){requestAnimationFrame(function(){$('.hero h1').classList.add('in')})});
$$('.bar2').forEach(function(b){var s=+b.dataset.s,e=+b.dataset.e;b.style.left=((s-2021)/6*100)+'%';b.style.width=((e-s)/6*100)+'%'});
$$('.ms').forEach(function(m){m.style.left=((+m.dataset.t-2021)/6*100)+'%'});
$$('.ms-l').forEach(function(m){var x=(+m.dataset.t-2021)/6*100;if(+m.dataset.side<0)m.style.right='calc('+(100-x)+'% + 16px)';else m.style.left='calc('+x+'% + 16px)'});
refresh();requestAnimationFrame(loop);
})();
