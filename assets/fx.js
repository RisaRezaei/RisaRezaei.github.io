/* fx layer: motion system for risarezaei.github.io
   Usage: <script src="assets/fx.js" data-fx="home|page|map" defer></script>
   home = boot sequence + hero choreography + everything below
   page = smooth scroll, cursor, tilt, reveals, transitions
   map  = transitions, grain and progress only (keeps native scrolling and cursor for the map) */
(function(){
  var me=document.currentScript||document.querySelector('script[src*="fx.js"]');
  var MODE=(me&&me.getAttribute('data-fx'))||'page';
  var D=document,R=D.documentElement,B=D.body;
  if(R.classList.contains('embed'))return;               // embedded map inside the homepage
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(pointer: fine)').matches&&!('ontouchstart' in window&&navigator.maxTouchPoints>0&&!matchMedia('(hover:hover)').matches);
  var full=MODE!=='map';
  function el(tag,cls,html){var e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
  function $$(s,r){return [].slice.call((r||D).querySelectorAll(s))}
  function clamp(v,a,b){return v<a?a:v>b?b:v}
  function lerp(a,b,t){return a+(b-a)*t}
  R.classList.add('fx-on');

  /* ---------- page transitions ---------- */
  var cur=el('div','fx-curtain','<span>DOWNLINKING</span>');B.appendChild(cur);
  function openCurtain(){requestAnimationFrame(function(){requestAnimationFrame(function(){cur.classList.remove('close');cur.classList.add('open')})})}
  if(reduce)cur.style.display='none';else openCurtain();
  addEventListener('pageshow',function(e){if(e.persisted){cur.classList.remove('close');cur.classList.add('open')}});
  D.addEventListener('click',function(e){
    if(reduce||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
    var u;try{u=new URL(a.getAttribute('href'),location.href)}catch(_){return}
    if(u.origin!==location.origin||!/\.html$|\/$/.test(u.pathname))return;
    if(u.pathname===location.pathname&&u.search===location.search)return;   // same-page anchors handled below
    e.preventDefault();
    var lab=a.textContent.replace(/[→↗←]/g,'').trim().slice(0,38).toUpperCase();
    cur.querySelector('span').textContent=lab?'DOWNLINKING · '+lab:'DOWNLINKING';
    cur.classList.remove('open');cur.classList.add('close');
    setTimeout(function(){location.href=u.href},520);
  },true);

  /* ---------- grain, spotlight, progress ---------- */
  if(!reduce)B.appendChild(el('div','fx-grain'));
  var spot=null;if(fine&&!reduce&&full){spot=el('div','fx-spot');B.insertBefore(spot,B.firstChild)}
  var prog=el('div','fx-progress');B.appendChild(prog);

  /* ---------- smooth scrolling (Lenis) ---------- */
  var lenis=null;
  function startLenis(){
    if(!window.Lenis)return;
    lenis=new Lenis({duration:1.15,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))},smoothWheel:true});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
    $$('iframe').forEach(function(f){f.setAttribute('data-lenis-prevent','')});
  }
  if(full&&fine&&!reduce){var ls=D.createElement('script');ls.src='https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';ls.onload=startLenis;D.head.appendChild(ls)}
  D.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
    var id=a.getAttribute('href');if(id.length<2)return;var t=D.querySelector(id);if(!t)return;
    e.preventDefault();
    if(lenis)lenis.scrollTo(t,{offset:-40,duration:1.4});else t.scrollIntoView({behavior:reduce?'auto':'smooth'});
    if(history.replaceState)history.replaceState(null,'',id);
  });

  /* ---------- decode effect for headings and section codes ---------- */
  var GLY='▮▯▰▱░▒01ABCDEFGHJKLMNPQRSTUVWXYZ·/';
  function decode(node,txt,dur,attr){
    if(reduce){attr?node.setAttribute(attr,txt):(node.textContent=txt);return}
    var t0=performance.now(),N=txt.length;
    (function f(now){var k=clamp((now-t0)/dur,0,1),fixed=Math.floor(k*N),s='';
      for(var i=0;i<N;i++){var c=txt[i];s+=(i<fixed||c===' ')?c:GLY[(Math.random()*GLY.length)|0]}
      attr?node.setAttribute(attr,s):(node.textContent=s);if(k<1)requestAnimationFrame(f)})(t0);
  }
  var decodeIO=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var h=e.target;decodeIO.unobserve(h);
    if(h.dataset.n)decode(h,h.dataset.n,700,'data-n');
    if(h.dataset.fxText)decode(h,h.dataset.fxText,900)})},{threshold:.6});
  $$('h2').forEach(function(h){
    if(h.children.length===0&&h.textContent.trim().length<48){h.dataset.fxText=h.textContent;}
    decodeIO.observe(h)});

  /* ---------- section reveals on pages without the homepage .rv system ---------- */
  if(MODE==='page'&&!reduce){
    var rvs=$$('section,.intro').filter(function(n){return !n.querySelector('.rv')&&!n.classList.contains('rv')});
    var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});
    rvs.forEach(function(n){n.classList.add('fx-rv');rio.observe(n)});
  }

  /* ---------- staggered reveals inside grids ---------- */
  $$('.pgrid,.tgrid,.stats,.ghproof,.design,.repos').forEach(function(g){$$(':scope>*',g).forEach(function(c,i){c.style.setProperty('--d',(i%3)*0.09+'s')})});

  /* ---------- number count-up ---------- */
  var numIO=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;numIO.unobserve(e.target);
    var b=e.target,raw=b.textContent,m=raw.match(/^([+\-]?)([\d,]+(?:\.\d+)?)(.*)$/);
    if(!m){decode(b,raw,900);return}
    var pre=m[1],num=parseFloat(m[2].replace(/,/g,'')),dec=(m[2].split('.')[1]||'').length,post=m[3],comma=/,/.test(m[2]),t0=performance.now(),dur=1400;
    if(reduce)return;
    (function f(now){var k=clamp((now-t0)/dur,0,1),v=num*(1-Math.pow(1-k,4)),s=v.toFixed(dec);if(comma)s=Number(s).toLocaleString('en-US',{minimumFractionDigits:dec});
      b.textContent=pre+s+post;if(k<1)requestAnimationFrame(f);else b.textContent=raw})(t0);
  })},{threshold:.7});
  $$('.stat b,.ghstat b').forEach(function(b){numIO.observe(b)});

  /* ---------- hero choreography + boot (homepage) ---------- */
  if(MODE==='home'){
    var h1=D.querySelector('.hero h1');
    if(h1&&!reduce){
      var sp=h1.querySelector('span'),first=h1.firstChild.textContent.trim(),last=sp?sp.textContent:'';
      h1.innerHTML='<b class="fx-line"><b>'+first+'</b></b><b class="fx-line"><span>'+last+'</span></b>';
      h1.querySelectorAll('.fx-line>*')[1].style.transitionDelay='.12s';
      var items=$$('.hero .eyebrow,.hero .lead,.hero .links>*,.hero .hud');
      items.forEach(function(it,i){it.classList.add('fx-hero-item');it.style.transitionDelay=(.25+i*.06)+'s'});
    }
    var seen=false;try{seen=sessionStorage.getItem('fx-boot')==='1'}catch(_){}
    function go(){setTimeout(function(){R.classList.add('fx-ready')},60)}
    if(reduce||seen){go()}
    else{
      try{sessionStorage.setItem('fx-boot','1')}catch(_){}
      var boot=el('div','fx-boot','<div class="grid"></div><div class="scan"></div><div class="box"><div class="log"></div><div class="bar"><i></i></div><div class="row"><span>ACQUISITION</span><span class="pct">000%</span></div></div><button class="skip" type="button">SKIP ↵</button>');
      B.appendChild(boot);cur.style.display='none';
      var lines=['<b>▸</b> LINK  ESTABLISHED · GROUND STATION HAMBURG','<b>▸</b> SENSORS  LANDSAT-8 OLI · SENTINEL-2 MSI','<b>▸</b> BANDS  B03 · B08 · B11 · NDWI','<b>▸</b> TARGET  PARISA ABBASALIZADEHREZAEI','<b>✓</b> LOCK  ACQUIRED'];
      var log=boot.querySelector('.log'),bar=boot.querySelector('.bar i'),pct=boot.querySelector('.pct'),t0=performance.now(),DUR=1700,done=false;
      function finish(){if(done)return;done=true;boot.classList.add('out');go();setTimeout(function(){boot.remove();cur.style.display=''},950)}
      boot.querySelector('.skip').onclick=finish;addEventListener('keydown',function k(e){if(e.key==='Enter'||e.key==='Escape'){finish();removeEventListener('keydown',k)}});
      (function f(now){var k=clamp((now-t0)/DUR,0,1),n=Math.min(lines.length,Math.floor(k*lines.length)+1);
        log.innerHTML=lines.slice(0,n).join('<br>');bar.style.width=(k*100)+'%';pct.textContent=('00'+Math.round(k*100)).slice(-3)+'%';
        if(k<1&&!done)requestAnimationFrame(f);else setTimeout(finish,260)})(t0);
    }
    /* hero drifts and fades as you scroll away */
    var ht=D.querySelector('.hero-text');
    if(ht&&!reduce){addEventListener('scroll',function(){var y=scrollY,h=innerHeight;if(y>h*1.2)return;
      ht.style.transform='translate3d(0,'+(y*.28)+'px,0)';ht.style.opacity=String(clamp(1-y/(h*.75),0,1))},{passive:true})}
  }

  /* ---------- sliding nav indicator ---------- */
  var tabs=D.querySelector('nav .tabs');
  if(tabs){tabs.classList.add('fx-tabs');var ind=el('i','fx-ind');tabs.appendChild(ind);
    var place=function(){var on=tabs.querySelector('.tab.on');if(!on){ind.style.width='0';return}ind.style.width=on.offsetWidth+'px';ind.style.transform='translateX('+on.offsetLeft+'px)'};
    new MutationObserver(place).observe(tabs,{subtree:true,attributes:true,attributeFilter:['class']});addEventListener('resize',place);place();}

  /* ---------- scroll-driven bits: progress + image parallax ---------- */
  var pars=$$('.pvis img,.thumb img').map(function(i){var p=i.parentElement;p.classList.add('fx-par');return i});
  if(reduce)pars=[];
  var ticking=false;
  function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;
    var max=R.scrollHeight-innerHeight;prog.style.setProperty('--p',max>0?(scrollY/max).toFixed(4):0);
    var vh=innerHeight;for(var i=0;i<pars.length;i++){var r=pars[i].parentElement.getBoundingClientRect();if(r.bottom<0||r.top>vh)continue;
      var k=((r.top+r.height/2)-vh/2)/vh;pars[i].style.setProperty('--py',(k*-26).toFixed(1)+'px')}})}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  if(!fine||reduce||!full)return;

  /* ---------- cursor, reticle, magnetic buttons, tilt ---------- */
  R.classList.add('fx-cur');
  var dot=el('div','fx-dot'),ring=el('div','fx-ring'),read=el('div','fx-read'),ret=el('div','fx-ret','<i></i><i></i><i></i><i></i><b>TARGET LOCK</b>');
  [ret,ring,dot,read].forEach(function(n){B.appendChild(n)});var retB=ret.querySelector('b');
  var mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,tgt=null,tr={x:0,y:0,w:0,h:0},TR={x:0,y:0,w:0,h:0};
  addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;
    dot.style.transform='translate('+mx+'px,'+my+'px)';
    read.style.transform='translate('+(mx+18)+'px,'+(my+14)+'px)';
    read.textContent='X '+('000'+Math.round(mx)).slice(-4)+'  Y '+('000'+Math.round(my+scrollY)).slice(-4);
    if(spot){spot.style.setProperty('--mx',mx+'px');spot.style.setProperty('--my',my+'px')}
  },{passive:true});
  D.addEventListener('mouseleave',function(){dot.classList.add('gone');ring.classList.add('gone');read.style.opacity=0});
  D.addEventListener('mouseenter',function(){dot.classList.remove('gone');ring.classList.remove('gone');read.style.opacity=''});
  var CARD='.pcard,.tcard,.stat,.ghproof>*,.mapcard,.col>.card,.timeline .card,.panel,.design>*';
  addEventListener('mousemove',function(){if(dot.classList.contains('gone')){dot.classList.remove('gone');ring.classList.remove('gone');read.style.opacity=''}},{passive:true});
  D.addEventListener('mouseover',function(e){
    var t=e.target;
    if(t.tagName==='IFRAME'){dot.classList.add('gone');ring.classList.add('gone');read.style.opacity=0;ret.classList.remove('on');tgt=null;return}ring.classList.toggle('big',!!(t.closest&&t.closest('a,button,input,.u,.hs,label,select')));
    var c=t.closest&&t.closest(CARD);if(c!==tgt){tgt=c;ret.classList.toggle('on',!!c);
      if(c){ret.querySelector('b').textContent=labelFor(c)}}
  });
  function labelFor(c){var k=c.querySelector('.kicker,h3,b');var s=k?k.textContent.trim():'';s=s.replace(/\s+/g,' ').toUpperCase();return 'LOCK · '+(s.length>28?s.slice(0,27)+'…':s||'TARGET')}
  (function loop(){
    rx=lerp(rx,mx,.18);ry=lerp(ry,my,.18);ring.style.transform='translate('+rx+'px,'+ry+'px)';
    if(tgt){var r=tgt.getBoundingClientRect();TR={x:r.left,y:r.top,w:r.width,h:r.height}}
    else{TR={x:mx-20,y:my-20,w:40,h:40}}
    tr.x=lerp(tr.x,TR.x,.2);tr.y=lerp(tr.y,TR.y,.2);tr.w=lerp(tr.w,TR.w,.2);tr.h=lerp(tr.h,TR.h,.2);
    ret.style.transform='translate('+tr.x+'px,'+tr.y+'px)';retB.style.top=tr.y<90?'calc(100% + 10px)':'-26px';ret.style.width=tr.w+'px';ret.style.height=tr.h+'px';
    requestAnimationFrame(loop)})();

  $$('.btn').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
      b.style.transform='translate('+(dx*.18).toFixed(1)+'px,'+(dy*.28).toFixed(1)+'px)'});
    b.addEventListener('mouseleave',function(){b.style.transform=''});
    b.style.transition=(b.style.transition?b.style.transition+',':'')+'transform .25s cubic-bezier(.2,.8,.2,1)';
  });

  $$('.pcard,.tcard,.stat,.ghproof>*').forEach(function(c){
    if(getComputedStyle(c).position==='static')c.style.position='relative';
    c.classList.add('fx-tilt');var gl=el('i','fx-glare');c.appendChild(gl);
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      c.classList.add('fx-hot');c.style.setProperty('--ry',((px-.5)*7).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-py)*6).toFixed(2)+'deg');c.style.setProperty('--ty','-3px');
      c.style.setProperty('--gx',(px*100)+'%');c.style.setProperty('--gy',(py*100)+'%')});
    c.addEventListener('mouseleave',function(){c.classList.remove('fx-hot');c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');c.style.setProperty('--ty','0px')});
  });
})();
