/* HoldButton — React Bits (David Haz), MIT + Commons Clause. Porting vanilla per MOI LAB: stessa logica
   (tocco breve = onTap, pressione lunga = onHold con riempimento a onda).
   Uso: MoiHold.create({ label, doneLabel, icon, holdTime, onTap, onHold, ...colori }) → <button> */
(() => {
const TAP_MS = 250, HIT_PAD = 10;
const LINEAR = t => t, EASE_OUT = t => 1 - Math.pow(1 - t, 3);
let n = 0;
function create(o = {}) {
  const holdTime = o.holdTime ?? 2000, releaseTime = o.releaseTime ?? 200, resetAfter = o.resetAfter ?? 1200;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `hold-button hold-button--${o.size || 'md'}${o.className ? ' ' + o.className : ''}`;
  b.dataset.phase = 'idle'; b.dataset.direction = o.fillDirection === 'up' ? 'up' : 'right'; if (o.glow !== false) b.dataset.glow = 'true';
  const hint = `moi-hb-${++n}`; b.setAttribute('aria-describedby', hint);
  if (o.ariaLabel) b.setAttribute('aria-label', o.ariaLabel);
  const vars = { '--hb-radius': `${o.radius ?? 14}px`, '--hb-bg': o.backgroundColor || '#27272a', '--hb-fill': o.fillColor || '#5227FF', '--hb-text': o.textColor || '#f5f5f5',
    '--hb-fill-text': o.fillTextColor || '#ffffff', '--hb-hold': `${holdTime}ms`, '--hb-cycles': holdTime / 1100, '--hb-release': `${releaseTime}ms`, '--hb-press': o.pressScale ?? 0.97, '--hb-wave': `${o.wave === false ? 0 : (o.waveAmplitude ?? 6)}px` };
  Object.entries(vars).forEach(([k, v]) => b.style.setProperty(k, v));
  const icon = o.icon ? `<span class="hold-button__icon">${o.icon}</span>` : '', doneIcon = o.doneIcon ? `<span class="hold-button__icon">${o.doneIcon}</span>` : '';
  const labels = `<span class="hold-button__idle">${icon}${o.label ?? 'Hold'}</span><span class="hold-button__done" aria-hidden="true">${doneIcon}${o.doneLabel ?? 'Fatto'}</span>`;
  b.innerHTML = `<span class="hold-button__pulse" aria-hidden="true"></span><span class="hold-button__label">${labels}</span>
    <span class="hold-button__clip" aria-hidden="true"><span class="hold-button__fill"><span class="hold-button__label hold-button__label--fill">${labels}</span></span>
    <span class="hold-button__crest" aria-hidden="true"><span class="hold-button__label hold-button__label--fill">${labels}</span></span></span>
    <span id="${hint}" class="hold-button__sr">${o.hint || `Tieni premuto ${Math.round(holdTime / 100) / 10} secondi per confermare`}</span>`;

  let phase = 'idle', input = null; const g = { pointerId: null, start: 0, rect: null }, t = { complete: 0, reset: 0 }, m = { raf: 0, p: 0, from: 0, to: 0, start: 0 };
  const go = (next, kind = null) => { phase = next; input = kind; b.dataset.phase = next; if (kind) b.dataset.input = kind; else delete b.dataset.input;
    b.querySelector('.hold-button__label > .hold-button__idle').setAttribute('aria-hidden', String(next === 'done')); b.querySelector('.hold-button__label > .hold-button__done').setAttribute('aria-hidden', String(next !== 'done')); };
  const clear = () => { clearTimeout(t.complete); clearTimeout(t.reset); };
  const drive = (to, duration, ease) => {
    cancelAnimationFrame(m.raf); m.from = m.p; m.to = to; m.start = performance.now();
    const step = now => { const k = duration > 0 ? Math.min(1, (now - m.start) / duration) : 1; m.p = m.from + (m.to - m.from) * ease(k); b.style.setProperty('--hb-p', m.p.toFixed(4));
      if (k < 1) { m.raf = requestAnimationFrame(step); return; } m.raf = 0; if (m.to === 1) complete(); };
    m.raf = requestAnimationFrame(step);
  };
  const complete = () => {
    if (phase !== 'holding' || performance.now() - g.start < holdTime - 50) return;
    clear(); go('done', input); o.onHold?.();
    if (resetAfter > 0) t.reset = setTimeout(() => { go('idle'); drive(0, releaseTime, EASE_OUT); }, resetAfter);
  };
  const begin = kind => { if (b.disabled || phase !== 'idle') return false; g.start = performance.now(); g.rect = b.getBoundingClientRect(); go('holding', kind); drive(1, holdTime, LINEAR); t.complete = setTimeout(complete, holdTime + 100); return true; };
  const release = ({ drifted = false } = {}) => { if (phase !== 'holding') return; clear(); const held = performance.now() - g.start; go('idle'); drive(0, releaseTime, EASE_OUT); if (!drifted && held < TAP_MS) o.onTap?.(); };
  const end = (e, opt) => { if (e.pointerId !== g.pointerId) return; g.pointerId = null; try { if (b.hasPointerCapture(e.pointerId)) b.releasePointerCapture(e.pointerId); } catch {} release(opt); };
  b.addEventListener('pointerdown', e => { if (e.button !== 0 || !e.isPrimary || g.pointerId !== null) return; if (!begin('pointer')) return; g.pointerId = e.pointerId; try { b.setPointerCapture(e.pointerId); } catch {} });
  b.addEventListener('pointermove', e => { if (e.pointerId !== g.pointerId || !g.rect) return; const r = g.rect;
    if (e.clientX < r.left - HIT_PAD || e.clientX > r.right + HIT_PAD || e.clientY < r.top - HIT_PAD || e.clientY > r.bottom + HIT_PAD) end(e, { drifted: true }); });
  b.addEventListener('pointerup', e => end(e));
  b.addEventListener('pointercancel', e => end(e, { drifted: true }));
  b.addEventListener('lostpointercapture', e => end(e, { drifted: true }));
  b.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') end(e, { drifted: true }); });
  b.addEventListener('keydown', e => { if (e.key === 'Escape') { if (input === 'key') release({ drifted: true }); return; } if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) begin('key'); } });
  b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (input === 'key') release(); } });
  b.addEventListener('contextmenu', e => e.preventDefault());
  const cancel = () => { if (phase === 'holding') release({ drifted: true }); };
  addEventListener('blur', cancel); document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  const measure = () => { b.style.setProperty('--hb-w', `${b.offsetWidth}px`); b.style.setProperty('--hb-h', `${b.offsetHeight}px`); };
  new ResizeObserver(measure).observe(b);
  return b;
}
window.MoiHold = { create };
})();
