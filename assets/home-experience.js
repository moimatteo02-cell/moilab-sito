(() => {
 'use strict';
 const root = document.querySelector('#moi-lab-hub');
 if (!root) { window.MOI_RELEASE?.(); return; }
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const loader = document.querySelector('#moi-loader');
 // Draw the complete original M once, at a fixed pace unrelated to network progress.
 const stroke = loader?.querySelector('.moi-loader-gold');
 loader?.querySelector('.moi-loader-spark')?.remove();
 loader?.querySelector('.moi-loader-flare')?.remove();
 // Reuse the exact engraved M geometry already present in the homepage.
 const originalM = root.querySelector('.mlg-monolith path');
 const base = loader?.querySelector('.moi-loader-base');
 if (originalM && base && stroke) {
  const outline = originalM.getAttribute('d');
  base.setAttribute('d',outline);
  stroke.setAttribute('d',outline);
  const bevel=base.cloneNode(false);
  bevel.setAttribute('class','moi-loader-bevel');
  bevel.setAttribute('transform','translate(.14 .14)');
  base.before(bevel);
 }
 const drawing = new Promise(resolve => {
  if (!stroke) { resolve(); return; }
  const length = stroke.getTotalLength();
  // Short vector segments carry the same fading light as the horizontal rules,
  // following the M's bends instead of lighting the whole outline uniformly.
  const ns = 'http://www.w3.org/2000/svg';
  // Use the actual scroll-line light in CSS pixels: no scaled SVG glow.
  const light = document.createElement('i');
  light.className='moi-loader-light-point';
  light.setAttribute('aria-hidden','true');
  loader.append(light);
  let matrix;
  const measureLight=()=>{matrix=stroke.getScreenCTM();};
  addEventListener('resize',measureLight,{passive:true});
  const glow = document.createElementNS(ns,'g');
  glow.setAttribute('class','moi-loader-trail');
  stroke.after(glow);
  const segments = Array.from({length:64},(_,i) => {
   const a=stroke.getPointAtLength(length*i/64);
   const b=stroke.getPointAtLength(length*(i+.5)/64);
   const c=stroke.getPointAtLength(length*(i+1)/64);
   const path=document.createElementNS(ns,'path');
   path.setAttribute('d',`M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}`);
   path.setAttribute('pathLength','1');
   path.style.strokeDasharray='1';
   path.style.strokeDashoffset='1';
   glow.append(path);
   return path;
  });
  let start;
  function draw(now) {
   if(start === undefined) { start = now; measureLight(); }
   const progress = reduced.matches ? 1 : Math.min(1,(now-start)/1900);
   stroke.style.strokeDashoffset = String(100-progress*100);
   segments.forEach((segment,i) => {
    segment.style.strokeDashoffset=String(1-Math.max(0,Math.min(1,progress*64-i)));
    segment.style.opacity=String(.02+.98*Math.pow(Math.min(1,(i+1)/64/Math.max(progress,.001)),2));
   });
   const point = stroke.getPointAtLength(length*progress);
   if(matrix){
    const x=matrix.a*point.x+matrix.c*point.y+matrix.e;
    const y=matrix.b*point.x+matrix.d*point.y+matrix.f;
    light.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
   }
   if(progress < 1) requestAnimationFrame(draw);
   else {removeEventListener('resize',measureLight);resolve();}
  }
  requestAnimationFrame(draw);
 });
 let released = false;
 const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
 const release = async () => {
  if (released) return;
  released = true;
  await drawing;
  await delay(reduced.matches ? 0 : 250);
  clearTimeout(window.MOI_LOAD_FAILSAFE);
  window.MOI_RELEASE?.();
  setTimeout(() => loader?.remove(), reduced.matches ? 0 : 600);
 };
 const decode = async image => {
  image.loading = 'eager';
  if (image.decode) { try { await image.decode(); } catch {} }
  else if (!image.complete) await new Promise(resolve => {
   image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});
  });
 };
 async function prepare() {
  root.inert = true;
  // Catalog changes may replace a default image; wait before decoding the final sources.
  await Promise.race([window.MOI_ASSETS_READY || Promise.resolve(),delay(3500)]);
  const images = [...document.images].filter(image => image.getAttribute('src'));
  const fonts = document.fonts ? Promise.all([
   document.fonts.load('400 80px "Moi Calligraphy"'),
   document.fonts.load('italic 400 40px "Moi Editorial"')
  ]) : Promise.resolve();
  const jobs = [...images.map(image => () => decode(image)), () => fonts];
  await Promise.allSettled(jobs.map(job => job()));
  await release();
 }
 prepare().catch(release);
 window.addEventListener('pageshow',event => {if(event.persisted) release();});
 // Read geometry only after resize/content changes. Each scroll writes small
 // opacity/transform values once per animation frame, with no permanent loop.
 const items = [...root.querySelectorAll('.mlg-kicker,.mlg-title,.mlg-section-label,.mlg-subtitle,.mlg-intro,.mlg-discover,.mlg-card-wrap,.moi-copy-line')].filter(element => !element.querySelector('.moi-copy-line'));
 const lines = [...root.querySelectorAll('.moi-gold-line')];
 let frame=0, geometry=[], lineGeometry=[], viewport=innerHeight, smoothY=scrollY, lastTime=0;
 const clamp = value => Math.max(0,Math.min(1,value));
 function measure() {
  viewport = innerHeight;
  const y = scrollY;
  geometry = items.map(element => {
   element.removeAttribute('data-scroll-reveal');
   const rect=element.getBoundingClientRect();
   element.setAttribute('data-scroll-reveal','');
   return {element,top:rect.top+y,height:rect.height};
  });
  lineGeometry = lines.map(element => {
   const rect=element.getBoundingClientRect();return {element,top:rect.top+y};
  });
  schedule();
 }
 function render(time) {
  frame=0;
  const dt=lastTime ? Math.min(64,time-lastTime) : 16;
  lastTime=time;
  smoothY += (scrollY-smoothY)*(1-Math.exp(-dt/160));
  if(reduced.matches || Math.abs(scrollY-smoothY)<.1) smoothY=scrollY;
  const y=smoothY;
  geometry.forEach(({element,top,height}) => {
   const screenTop=top-y;
   // Fade only as content leaves the upper edge or enters the lower edge.
   const entering=clamp((viewport-screenTop)/Math.min(150,viewport*.2));
   const leaving=clamp((screenTop+height*.7)/Math.max(60,height*.5));
   const opacity=reduced.matches ? 1 : Math.min(entering,leaving);
   element.style.setProperty('--scroll-opacity',opacity.toFixed(3));
   element.style.setProperty('--scroll-blur',((1-opacity)*3).toFixed(2)+'px');
   element.style.setProperty('--scroll-shift',((1-opacity)*(entering<leaving ? 12 : -8)).toFixed(2)+'px');
  });
  lineGeometry.forEach(({element,top}) => {
   const travel=clamp((y+viewport*.7-top)/(viewport*.75));
   element.style.setProperty('--gold-progress',String(reduced.matches ? 1 : .15+.85*travel));
  });
  if(Math.abs(scrollY-smoothY)>.1) schedule();
  else lastTime=0;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(render);}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',measure,{passive:true});
 addEventListener('moi:revealed',measure);
 document.addEventListener('moilab:contentchange',measure);
 document.addEventListener('moi:service-layout',measure);
 reduced.addEventListener?.('change',measure);
 if('ResizeObserver' in window)new ResizeObserver(measure).observe(root.querySelector('.mlg-shell'));
 document.fonts?.ready.then(measure);
 measure();
})();
