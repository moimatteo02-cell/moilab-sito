/* SlideCommit — React Bits (David Haz), MIT + Commons Clause. Porting vanilla per MOI LAB (molle al posto di motion/react):
   trascina la maniglia fino in fondo per confermare; la capsula si allarga e mostra la conferma.
   Uso: MoiSlide.create({ label, doneLabel, onConfirm, height, trackColor, handleColor, successColor }) → elemento */
(() => {
const PAD = 4, SWELL = 1.03, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduceQ = matchMedia('(prefers-reduced-motion: reduce)');
const onColor = hex => { const raw = hex.replace('#', ''), full = raw.length === 3 ? [...raw].map(c => c + c).join('') : raw.slice(0, 6), n = parseInt(full, 16); if (Number.isNaN(n)) return '#fff'; return (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 >= 128 ? '#111111' : '#ffffff'; };
const ARROW = s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const TICK = s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

function create(o = {}) {
  const height = o.height ?? 56, speed = o.speed ?? 50, returnBounce = o.returnBounce ?? 0.38, holdMs = o.holdMs ?? 1500;
  const handle = o.handleColor || '#f5f5f5', ok = o.successColor || '#22c55e';
  const root = document.createElement('div'); root.className = 'slide-commit' + (o.className ? ' ' + o.className : ''); root.dataset.phase = 'idle';
  const r = clamp(o.radius ?? height / 2, 0, height / 2), gripR = Math.max(0, r - PAD), G = height - PAD * 2;
  Object.entries({ '--sc-track': o.trackColor || '#262626', '--sc-ink': handle, '--sc-ok': ok, '--sc-on-ink': onColor(handle), '--sc-on-ok': onColor(ok),
    '--sc-radius': r + 'px', '--sc-grip-r': gripR + 'px', '--sc-pad': PAD + 'px', '--sc-font': clamp(Math.round(height * 0.27), 13, 17) + 'px' }).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.width = '100%'; root.style.height = height + 'px';
  const label = o.label || 'Scorri per confermare';
  root.innerHTML = `<div class="slide-commit__track"><span class="slide-commit__label" aria-hidden="true"><span class="slide-commit__text slide-commit__text--plain">${label}</span></span>
    <div class="slide-commit__capsule" role="slider" tabindex="0" aria-label="${label.replace(/"/g, '&quot;')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="slide-commit__content"><span class="slide-commit__arrow" aria-hidden="true">${ARROW(Math.round(G * .42))}</span>
      <span class="slide-commit__done" aria-hidden="true">${TICK(Math.round(G * .38))}${o.doneLabel || 'Fatto'}</span></div></div>
    <span class="slide-commit__sr" aria-live="polite"></span></div>`;
  const track = root.querySelector('.slide-commit__track'), cap = root.querySelector('.slide-commit__capsule'), content = root.querySelector('.slide-commit__content'),
    lab = root.querySelector('.slide-commit__label'), arrow = root.querySelector('.slide-commit__arrow'), done = root.querySelector('.slide-commit__done'), sr = root.querySelector('.slide-commit__sr');
  let W = 300, INNER = W - PAD * 2, T = Math.max(1, INNER - G);
  let x = 0, anchor = 0, shown = 1, pulse = 1, hot = false, held = false, phase = 'idle', anim = {}, timer = 0;
  const k = 260 + (clamp(speed, 0, 100) / 100) * 640, mass = .9, crit = 2 * Math.sqrt(k * mass);
  const paint = () => {
    const seen = clamp(x, 0, T), edge = seen + G + clamp(anchor - seen, 0, T);
    cap.style.clipPath = `inset(0 ${(INNER - edge).toFixed(2)}px 0 0 round ${gripR}px)`;
    content.style.transform = `translateX(${((seen + edge) / 2 - INNER / 2).toFixed(2)}px)`;
    const sw = hot && !held && phase === 'idle' && !reduceQ.matches ? SWELL : 1, q = 1 - Math.min(.08, Math.max(0, -x) / 110);
    cap.style.transform = `scale(${q * sw},${sw / q})`; cap.style.transformOrigin = `${seen}px 50%`;
    lab.style.opacity = String(clamp(1 - seen / (T * .55), 0, 1));
    arrow.style.opacity = String(shown * clamp(1 - (seen - T * .55) / (T * .4), 0, 1));
    track.style.transform = `scale(${pulse})`;
    const pc = Math.round(seen / T * 100); cap.setAttribute('aria-valuenow', pc);
  };
  // molla semplice (al posto di motion): anima una proprietà verso «to»
  const spring = (key, to, { damping = crit, v0 = 0, onEnd } = {}) => {
    cancelAnimationFrame(anim[key]); let v = v0, last = performance.now();
    const get = () => ({ x, anchor, shown, pulse })[key], set = val => { if (key === 'x') x = val; else if (key === 'anchor') anchor = val; else if (key === 'shown') shown = val; else pulse = val; };
    if (reduceQ.matches) { set(to); paint(); onEnd?.(); return; }
    const step = now => { const dt = Math.min(.032, (now - last) / 1000); last = now; let p = get();
      for (let i = 0; i < 4; i++) { const a = (-k * (p - to) - damping * v) / mass; v += a * dt / 4; p += v * dt / 4; }
      set(p); paint(); if (Math.abs(p - to) < .3 && Math.abs(v) < 2) { set(to); paint(); onEnd?.(); return; } anim[key] = requestAnimationFrame(step); };
    anim[key] = requestAnimationFrame(step);
  };
  const tween = (key, to, ms) => { cancelAnimationFrame(anim[key]); const from = ({ x, anchor, shown, pulse })[key], t0 = performance.now();
    const set = val => { if (key === 'shown') shown = val; else if (key === 'pulse') pulse = val; };
    const step = now => { const t = Math.min(1, (now - t0) / ms); set(from + (to - from) * (1 - Math.pow(1 - t, 3))); paint(); if (t < 1) anim[key] = requestAnimationFrame(step); }; anim[key] = requestAnimationFrame(step); };
  const goHome = vel => spring('x', 0, { damping: crit * (1 - clamp(returnBounce, 0, .5)), v0: Math.min(0, vel) });
  const settle = () => { phase = 'idle'; root.dataset.phase = 'idle'; done.style.opacity = '0'; tween('shown', 1, 200); spring('anchor', 0); sr.textContent = ''; };
  const commit = () => {
    clearTimeout(timer); x = T; paint();
    try { o.onConfirm?.(); } catch (e) { console.warn(e); }
    phase = 'done'; root.dataset.phase = 'done'; anchor = x; shown = 0; done.style.opacity = '1'; sr.textContent = o.doneLabel || 'Fatto';
    spring('x', 0);
    if (!reduceQ.matches) { const t0 = performance.now(); const dip = now => { const t = (now - t0) / 460; pulse = t < .62 ? 1 - .026 * (t / .62) : 1 - .026 * (1 - (t - .62) / .38); if (t >= 1) pulse = 1; paint(); if (t < 1) requestAnimationFrame(dip); }; setTimeout(() => requestAnimationFrame(dip), 100); }
    if (holdMs > 0) timer = setTimeout(settle, holdMs);
  };
  let g = null;
  const local = cx => { const rc = track.getBoundingClientRect(); return (cx - rc.left) / (rc.width / W || 1); };
  track.addEventListener('pointerdown', e => {
    if (g || phase !== 'idle' || e.button !== 0) return;
    cancelAnimationFrame(anim.x); g = { id: e.pointerId, grab: null, moved: false, hist: [] }; held = true; root.dataset.held = '';
    try { track.setPointerCapture(e.pointerId); } catch {}
  });
  track.addEventListener('pointermove', e => {
    if (!g || g.id !== e.pointerId) return; const at = local(e.clientX);
    if (g.grab === null) { g.grab = at - x; return; }
    const next = clamp(at - g.grab, 0, T); if (Math.abs(next - x) > .5) g.moved = true;
    g.hist.push([e.timeStamp, next]); if (g.hist.length > 4) g.hist.shift(); x = next; paint();
  });
  const up = e => {
    if (!g || g.id !== e.pointerId) return; const hist = g.hist, moved = g.moved; g = null; held = false; delete root.dataset.held;
    try { track.releasePointerCapture(e.pointerId); } catch {}
    if (x >= T - 1) commit(); else if (moved) { const v = hist.length > 1 ? (hist.at(-1)[1] - hist[0][1]) / Math.max(1, hist.at(-1)[0] - hist[0][0]) * 1000 : 0; goHome(v); }
    else { o.onTapHint?.(); x = Math.min(T * .18, T); paint(); goHome(0); }   // tocco senza trascinare: la maniglia accenna il gesto
  };
  track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
  cap.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hot = true; paint(); } });
  cap.addEventListener('pointerleave', () => { hot = false; paint(); });
  cap.addEventListener('keydown', e => {
    if (phase !== 'idle') return; const step = T / 10;
    if (e.key === 'End' || e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); x = Math.min(T, x + step); paint(); if (x >= T) commit(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); x = Math.max(0, x - step); paint(); }
    else if (e.key === 'Home' || e.key === 'Escape') { e.preventDefault(); x = 0; paint(); }
  });
  const measure = () => { W = root.clientWidth || 300; INNER = W - PAD * 2; T = Math.max(1, INNER - G); cap.style.width = INNER + 'px'; paint(); };
  new ResizeObserver(measure).observe(root); done.style.opacity = '0'; done.style.transition = 'opacity .2s';
  requestAnimationFrame(measure);
  return root;
}
window.MoiSlide = { create };
})();
