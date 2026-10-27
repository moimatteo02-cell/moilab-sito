/* Apertura della home — porting vanilla di "Scroll Expand" (React Bits, David Haz, MIT + Commons Clause):
   stessa logica (cornice che si allarga col clip-path, media che si riduce, titolo che sparisce, testo che entra),
   dentro: lo sfondo Galaxy (React Bits) e la M del caricamento. Scorrimento della pagina (finestra). */
(() => {
  const root = document.querySelector('.mi-intro'); if (!root) return;
  const track = root.querySelector('.mi-track'), stage = root.querySelector('.mi-stage'), frame = root.querySelector('.mi-frame'),
    media = root.querySelector('.mi-media'), title = root.querySelector('.mi-title'), overlay = root.querySelector('.mi-overlay'),
    scrim = root.querySelector('.mi-scrim'), hint = root.querySelector('.mi-hint');
  const mob = matchMedia('(max-width:640px)');
  const C = { startWidth: 42, startHeight: 58, startRadius: 24, endRadius: 0, mediaZoom: 1.35, scrollDistance: 1.2, holdDistance: 0.6, smoothing: 0.1, overlayScrim: 0.45 };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1); return t * t * (3 - 2 * t); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apply = p => {
    const e = smoothstep(0, 1, p), sw = mob.matches ? 72 : C.startWidth, sh = mob.matches ? 48 : C.startHeight;
    const w = sw + (100 - sw) * e, h = sh + (100 - sh) * e, ix = Math.max(0, (100 - w) / 2), iy = Math.max(0, (100 - h) / 2), r = C.startRadius + (C.endRadius - C.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
    media.style.transform = `scale(${C.mediaZoom + (1 - C.mediaZoom) * e})`;
    scrim.style.opacity = `${C.overlayScrim * e}`;
    const out = smoothstep(0.4, 0.88, p); title.style.opacity = `${1 - out}`; title.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    const gone = smoothstep(0, 0.12, p); hint.style.opacity = `${1 - gone}`; hint.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    const inn = smoothstep(0.68, 1, p); overlay.style.opacity = `${inn}`; overlay.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
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
  // salta l'apertura
  root.querySelector('.mi-skip')?.addEventListener('click', () => { const y = root.offsetTop + root.offsetHeight; scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); });
  // sfondo Galaxy (impostazioni predefinite di React Bits) dentro la cornice
  const gx = root.querySelector('.mi-galaxy');
  if (gx && window.MoiGalaxy) { try { window.MoiGalaxy.mount(gx, { transparent: true, mouseRepulsion: true, mouseInteraction: true, density: 1, glowIntensity: 0.3, saturation: 0, hueShift: 140, twinkleIntensity: 0.3, rotationSpeed: 0.1 }); } catch (e) { console.warn('Galaxy non disponibile', e); } }
})();
