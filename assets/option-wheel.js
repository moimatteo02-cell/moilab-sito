/* OptionWheel — React Bits (David Haz), MIT + Commons Clause. Porting vanilla per MOI LAB: stessa curva, stessa fisica.
   + menu a ruota (MoiWheelMenu): tocca/scorri per scegliere, tocca di nuovo (o «Vai») per entrare. */
(() => {
function mount(root, o = {}) {
  const items = o.items || [];
  const cfg = {
    count: items.length, items, curve: o.curve ?? 1, tilt: o.tilt ?? 6, blur: o.blur ?? 2, fade: o.fade ?? 0.25, minOpacity: o.minOpacity ?? 0.05,
    side: o.side || 'left', loop: o.loop ?? false, smoothing: o.smoothing ?? 200, draggable: o.draggable ?? true
  };
  const fontSize = o.fontSize ?? 3, spacing = o.spacing ?? 1.4, inset = o.inset ?? 80;
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  cfg.rowH = Math.max(fontSize * spacing * remPx, 1);
  let pos = o.defaultSelected ?? 0, target = pos, selected = pos, raf = null, last = 0, wheelTimer = null, drag = null, dragMoved = false;

  root.classList.add('option-wheel'); if (cfg.side === 'right') root.classList.add('option-wheel--right');
  root.setAttribute('role', 'listbox'); root.tabIndex = 0; root.setAttribute('aria-label', o.label || 'Scegli');
  root.style.setProperty('--ow-text-color', o.textColor || '#a6a6a6');
  root.style.setProperty('--ow-active-color', o.activeColor || '#ffffff');
  root.style.setProperty('--ow-font-size', `${fontSize}rem`);
  root.style.setProperty('--ow-inset', `${inset}px`);
  const els = items.map((label, i) => {
    const el = document.createElement('div'); el.className = 'option-wheel__item'; el.setAttribute('role', 'option'); el.textContent = label;
    el.addEventListener('click', () => itemClick(i)); root.append(el); return el;
  });
  const mark = () => els.forEach((el, i) => { el.classList.toggle('option-wheel__item--selected', i === selected); el.setAttribute('aria-selected', String(i === selected)); });

  const frame = now => {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const k = 1 - Math.exp(-dt / (Math.max(cfg.smoothing, 1) / 1000));
    let next = pos + (target - pos) * k; const settled = Math.abs(target - next) < 0.001; if (settled) next = target; pos = next;
    const n = cfg.count, mirror = cfg.side === 'right' ? -1 : 1, tiltRad = (cfg.tilt * Math.PI) / 180, R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;
    for (let i = 0; i < n; i++) {
      const el = els[i]; let d = i - next;
      if (cfg.loop && n > 1) { d = ((d % n) + n) % n; if (d > n / 2) d -= n; }
      const dist = Math.abs(d); let x = 0, y = d * cfg.rowH, rot = 0;
      if (R > 0) { const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad)); y = R * Math.sin(ang); x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve; rot = (mirror * ang * 180) / Math.PI; }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
    }
    raf = settled ? null : requestAnimationFrame(frame);
  };
  const startLoop = () => { if (raf != null) cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); };
  const applyTarget = (value, snap) => {
    let v = value; if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0)); if (snap) v = Math.round(v);
    target = v; const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
    if (idx !== selected) { selected = idx; mark(); o.onChange?.(idx, items[idx]); }
    startLoop();
  };
  const itemClick = index => {
    if (dragMoved) return;
    const cur = target; let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
    if (cfg.loop && cfg.count > 1) { if (d > cfg.count / 2) d -= cfg.count; else if (d < -cfg.count / 2) d += cfg.count; }
    if (d === 0) { o.onPick?.(index, items[index]); return; }   // MOI LAB: tocco sull'opzione già scelta = entra
    applyTarget(cur + d, true);
  };
  root.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
    const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
    applyTarget(target + step, false);
    if (wheelTimer) clearTimeout(wheelTimer); wheelTimer = setTimeout(() => applyTarget(target, true), 140);
  }, { passive: false });
  root.addEventListener('pointerdown', e => { if (!cfg.draggable) return; drag = { y: e.clientY, start: target, id: e.pointerId }; dragMoved = false; root.classList.add('option-wheel--dragging'); });
  root.addEventListener('pointermove', e => {
    if (!drag) return; const dy = e.clientY - drag.y;
    if (!dragMoved && Math.abs(dy) > 4) { dragMoved = true; try { root.setPointerCapture(drag.id); } catch {} }
    if (dragMoved) applyTarget(drag.start - dy / cfg.rowH, false);
  });
  const end = () => { if (!drag) return; drag = null; root.classList.remove('option-wheel--dragging'); if (dragMoved) applyTarget(target, true); setTimeout(() => { dragMoved = false; }, 0); };
  root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
  root.addEventListener('keydown', e => {
    let delta = null;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1; else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onPick?.(selected, items[selected]); return; }
    if (delta == null) return; e.preventDefault(); applyTarget(Math.round(target) + delta, true);
  });
  mark(); applyTarget(target, false);
  return { get selected() { return selected; }, set: i => applyTarget(i, true), refresh: () => startLoop() };
}

/* ---- menu a ruota: dentro un contenitore, con il pulsante «Vai» ---- */
function menu(host, links, opts = {}) {
  const mob = matchMedia('(max-width:640px)').matches;
  host.classList.add('ow-menu');
  host.innerHTML = `<p class="ow-menu-k">${opts.kicker || 'Menu'}</p><div class="ow-menu-wheel"></div>
    <a class="ow-menu-go" href="#"><span></span><i aria-hidden="true">→</i></a><p class="ow-menu-hint">Scorri per scegliere · tocca per entrare</p>`;
  const go = host.querySelector('.ow-menu-go'), label = go.querySelector('span');
  const sync = i => { const l = links[i]; go.href = l.href; label.textContent = l.go || `Vai a ${l.label}`; if (l.target) go.target = l.target; else go.removeAttribute('target'); };
  const pick = i => { const l = links[i]; (opts.onPick || (() => { if (l.target) open(l.href, l.target); else location.href = l.href; }))(l, i); };
  go.addEventListener('click', e => { e.preventDefault(); pick(wheel.selected); });
  const wheel = mount(host.querySelector('.ow-menu-wheel'), {
    items: links.map(l => l.label), defaultSelected: opts.defaultSelected ?? 0, fontSize: opts.fontSize ?? (mob ? 2.1 : 2.6), spacing: 1.45,
    inset: opts.inset ?? (mob ? 26 : 40), textColor: '#77736b', activeColor: '#f6e7c8', tilt: 7, blur: 2, fade: 0.28, label: opts.label || 'Menu',
    onChange: sync, onPick: pick
  });
  sync(wheel.selected);
  return wheel;
}

window.MoiOptionWheel = { mount, menu };
})();
