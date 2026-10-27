/* Apertura della home — porting vanilla di "Scroll Expand" (React Bits, David Haz, MIT + Commons Clause).
   Prima: raggi di luce (Light Rays) e la M del caricamento. Scorrendo, la cornice si allarga e diventa
   l'interfaccia con lo sciame di particelle (Swarm Cursor): "Iniziamo" → servizi, "Chi siamo" → pagina su di noi. */
(() => {
  const root = document.querySelector('.mi-intro'); if (!root) return;
  const $ = s => root.querySelector(s);
  const ui = $('.mi-ui'), track = $('.mi-track'), stage = $('.mi-stage'), frame = $('.mi-frame'), media = $('.mi-media'), title = $('.mi-title'), hint = $('.mi-hint'), mark = $('.mi-m'), skip = $('.mi-skip');
  const mob = matchMedia('(max-width:640px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { startWidth: 42, startHeight: 58, startRadius: 24, endRadius: 0, mediaZoom: 1.35, scrollDistance: 1.2, holdDistance: 0.35, smoothing: 0.1 };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1); return t * t * (3 - 2 * t); };
  const apply = p => {
    const e = smoothstep(0, 1, p), sw = mob.matches ? 80 : C.startWidth, sh = mob.matches ? 46 : C.startHeight;
    const w = sw + (100 - sw) * e, h = sh + (100 - sh) * e, ix = Math.max(0, (100 - w) / 2), iy = Math.max(0, (100 - h) / 2), r = C.startRadius + (C.endRadius - C.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
    media.style.transform = `scale(${C.mediaZoom + (1 - C.mediaZoom) * e})`;
    const out = smoothstep(0.4, 0.88, p); title.style.opacity = `${1 - out}`; title.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    const gone = smoothstep(0, 0.12, p); hint.style.opacity = `${1 - gone}`; hint.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    const m = smoothstep(0.2, 0.7, p); mark.style.opacity = `${1 - m}`; mark.style.transform = `translateX(-50%) translateY(${-30 * m}px) scale(${1 - .2 * m})`;
    const u = smoothstep(.55, .95, p); ui.style.opacity = `${u}`; ui.style.transform = `translate3d(0, ${20 * (1 - u)}px, 0)`;
    skip.style.opacity = `${1 - smoothstep(.8, 1, p)}`;
    frame.style.pointerEvents = p > .97 ? 'auto' : 'none';
    document.documentElement.classList.toggle('mi-on', p < .97 && track.getBoundingClientRect().bottom > 0);
  };
  let raf = 0, current = 0, target = 0, stageH = 0, running = false;
  const measure = () => { stageH = innerHeight; track.style.height = `${stageH * (1 + C.scrollDistance + C.holdDistance)}px`; stage.style.setProperty('--mi-title-size', `${clamp((root.clientWidth || stageH) * 0.075, 30, 84)}px`); };
  const read = () => clamp(-track.getBoundingClientRect().top / (stageH * C.scrollDistance), 0, 1);
  const tick = () => { const k = 1 - Math.exp(-1 / (60 * C.smoothing)); current += (target - current) * k; if (Math.abs(target - current) < 0.0004) { current = target; running = false; } apply(current); raf = running ? requestAnimationFrame(tick) : 0; };
  const kick = () => { if (running) return; running = true; if (!raf) raf = requestAnimationFrame(tick); };
  const onScroll = () => { target = read(); if (reduce) { current = target; apply(current); return; } kick(); };
  const onResize = () => { measure(); target = read(); current = target; apply(current); };
  measure(); target = read(); current = target; apply(current);
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onResize);

  const toOpen = () => scrollTo({ top: track.offsetTop + root.offsetTop + stageH * C.scrollDistance, behavior: reduce ? 'auto' : 'smooth' });
  skip.addEventListener('click', toOpen);
  // due pagine separate: l'apertura (senza hash) e i servizi (#servizi o una stanza). "Iniziamo" porta ai servizi,
  // il logo MOI LAB in alto riporta all'apertura.
  const html = document.documentElement;
  const mode = () => {
    const h = location.hash, intro = !h || h === '#inizio' || h === '#moi-lab-hub';
    const was = html.classList.contains('mi-gate');
    html.classList.toggle('mi-gate', intro); html.classList.toggle('mi-done', !intro);
    if (!intro) html.classList.remove('mi-on');
    if (intro !== was) { requestAnimationFrame(() => scrollTo({ top: 0, behavior: 'instant' })); measure(); target = read(); current = target; apply(current); }
    if (!intro && !was && h === '#servizi' && mode.first) requestAnimationFrame(() => scrollTo({ top: 0, behavior: 'instant' }));
  };
  addEventListener('hashchange', mode); addEventListener('popstate', mode); mode();

  // raggi di luce (impostazioni predefinite di React Bits, colore caldo MOI LAB)
  const rays = $('.mi-rays');
  if (rays && window.MoiLightRays) { try { window.MoiLightRays.mount(rays, { raysOrigin: 'top-center', raysColor: '#f3e2bf', followMouse: true, mouseInfluence: 0.1 }); } catch (e) { console.warn('Light Rays non disponibile', e); } }
  // sciame di particelle dentro l'interfaccia
  const sw = $('.mi-swarm');
  if (sw && window.MoiSwarm) { try { window.MoiSwarm.mount(sw, { count: 800, size: 2.6, color: '#ffffff', accentColor: '#e2c28e', clickEffect: 'burst', idle: 'roam' }); } catch (e) { console.warn('Swarm Cursor non disponibile', e); } }
})();
