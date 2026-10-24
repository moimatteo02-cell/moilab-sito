(() => {
 'use strict';
 const root = document.querySelector('#moi-lab-hub');
 if (!root) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const lightPeriod = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--moi-light-period')) || 5.6) * 1000;
 const syncLight = element => element.style.setProperty('--moi-light-delay', -(performance.now() % lightPeriod) + 'ms');
 const setLight = (state, lit) => {
  if (lit) syncLight(state.wrap);
  state.wrap.classList.toggle('moi-light-active', lit);
 };
 const descriptions = {
  apparel:'Abbigliamento personalizzato per brand, team e idee da indossare.',
  custom:'Gadget e oggetti che danno forma alla tua identità.',
  automotive:'Grafiche e wrapping per portare il tuo stile in movimento.',
  signage:'Insegne e pannelli per rendere riconoscibile ogni spazio.',
  design:'Grafica e branding: dall’intuizione a un’identità visiva.',
  digital:'Siti, applicazioni e automazioni per dare spazio alle tue idee.'
 };
 let active = null, previouslyFocused = null;
 const feature = document.createElement('div');
 feature.className = 'moi-feature';
 feature.hidden = true;
 feature.innerHTML = '<div class="moi-feature-backdrop" aria-hidden="true"></div><section class="moi-feature-panel" id="moi-feature-panel" role="dialog" aria-modal="true" aria-labelledby="moi-feature-title" tabindex="-1"><div class="moi-feature-photo"><img alt=""><div class="moi-feature-light" aria-hidden="true"></div></div><div class="moi-feature-copy"><div class="moi-feature-icon" aria-hidden="true"></div><span class="moi-feature-number"></span><h2 id="moi-feature-title"></h2><p class="moi-feature-subtitle"></p><p class="moi-feature-description"></p><a class="moi-feature-enter">Esplora il servizio <span aria-hidden="true">↗</span></a></div><button class="moi-feature-close" type="button" aria-label="Chiudi anteprima">×</button></section>';
 document.body.append(feature);
 const panel = feature.querySelector('.moi-feature-panel');
 const photo = feature.querySelector('.moi-feature-photo img');
 const enter = feature.querySelector('.moi-feature-enter');
 const close = (restore = true) => {
  if (!active) return;
  active.wrap.classList.remove('service-selected');
  active.card.setAttribute('aria-expanded','false');
  setLight(active, false);
  active = null;
  feature.classList.remove('is-visible');
  feature.hidden = true;
  document.body.classList.remove('moi-feature-active');
  root.inert = false;
  if (restore && previouslyFocused?.isConnected) previouslyFocused.focus({preventScroll:true});
 };
 const open = state => {
  if (active === state) { close(); return; }
  if (active) close(false);
  active = state;
  setLight(state, true);
  syncLight(feature);
  previouslyFocused = state.card;
  const source = state.card.querySelector('img');
  // Show the exact current catalog image, including any owner customization.
  photo.src = source.currentSrc || source.src;
  photo.alt = source.alt;
  photo.style.objectFit = source.style.objectFit;
  photo.style.objectPosition = source.style.objectPosition;
  photo.style.transform = source.style.transform;
  feature.querySelector('.moi-feature-icon').replaceChildren(state.card.querySelector('.mlg-service-icon').cloneNode(true));
  feature.querySelector('.moi-feature-number').textContent = state.card.querySelector('.mlg-number').textContent;
  feature.querySelector('#moi-feature-title').textContent = state.card.querySelector('h2').textContent;
  feature.querySelector('.moi-feature-subtitle').textContent = state.card.querySelector('.mlg-caption p').textContent;
  feature.querySelector('.moi-feature-description').textContent = state.card.dataset.moiIntro || descriptions[state.key];
  enter.href = state.card.getAttribute('href');
  enter.dataset.moiCategory = state.key;
  state.card.setAttribute('aria-expanded','true');
  state.wrap.classList.add('service-selected');
  feature.hidden = false;
  document.body.classList.add('moi-feature-active');
  root.inert = true;
  requestAnimationFrame(() => {feature.classList.add('is-visible');panel.focus({preventScroll:true});});
 };
 feature.querySelector('.moi-feature-backdrop').addEventListener('click',() => close());
 feature.querySelector('.moi-feature-close').addEventListener('click',() => close());
 enter.addEventListener('click',() => close(false));
 document.addEventListener('keydown',event => {
  if (!active) return;
  if (event.key === 'Escape') {event.preventDefault();close();}
  if (event.key !== 'Tab') return;
  const controls = [enter,feature.querySelector('.moi-feature-close')];
  if (event.shiftKey && document.activeElement === controls[0]) {event.preventDefault();controls[1].focus();}
  else if (!event.shiftKey && document.activeElement === controls[1]) {event.preventDefault();controls[0].focus();}
  else if (document.activeElement === panel) {event.preventDefault();(event.shiftKey ? controls[1] : controls[0]).focus();}
 });
 addEventListener('hashchange',() => close(false));
 addEventListener('pageshow',event => {if(event.persisted) close(false);});
 root.querySelectorAll('.mlg-grid > .mlg-card-wrap').forEach(wrap => {
  const card = wrap.querySelector('a.mlg-card');
  const key = card?.dataset.moiCategory;
  if (!descriptions[key]) return;
  const state = {wrap,card,key,frame:0};
  card.setAttribute('aria-haspopup','dialog');
  card.setAttribute('aria-expanded','false');
  card.setAttribute('aria-controls','moi-feature-panel');
  wrap.classList.add('mlg-service-reveal');
  card.addEventListener('pointerenter',event => {if(event.pointerType === 'mouse') setLight(state, true);});
  card.addEventListener('focus',() => {if(card.matches(':focus-visible')) setLight(state, true);});
  card.addEventListener('blur',() => {if(active !== state) setLight(state, false);});
  card.addEventListener('pointermove',event => {
   if (event.pointerType !== 'mouse' || reduced.matches) return;
   state.cursor={x:event.clientX,y:event.clientY};
   if (state.frame) return;
   state.frame=requestAnimationFrame(() => {
    state.frame=0;
    const rect=wrap.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,(state.cursor.x-rect.left)/rect.width*2-1));
    const y=Math.max(-1,Math.min(1,(state.cursor.y-rect.top)/rect.height*2-1));
    wrap.style.setProperty('--service-rx',(-y*3).toFixed(2)+'deg');
    wrap.style.setProperty('--service-ry',(x*4).toFixed(2)+'deg');
   });
  },{passive:true});
  card.addEventListener('pointerleave',() => {
   if(active !== state) setLight(state, false);
   cancelAnimationFrame(state.frame);state.frame=0;
   wrap.style.removeProperty('--service-rx');wrap.style.removeProperty('--service-ry');
  });
  card.addEventListener('click',event => {
   if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
   event.preventDefault();
   event.stopImmediatePropagation();
   open(state);
  });
 });
})();
