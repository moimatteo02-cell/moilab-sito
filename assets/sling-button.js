/* Sling Button — porting vanilla (senza React) del componente React Bits "Sling Button" di David Haz.
   Licenza MIT + Commons Clause: uso consentito dentro un sito; non si rivende il componente.
   Stessa logica dell'originale: tiri il pulsante indietro come una fionda, superata la soglia
   l'arco si carica, al rilascio parte e lancia le particelle; un tocco semplice invia subito.
   Uso: MoiSling.mount(elemento, { onSend, ...opzioni }) → restituisce lo <span class="sling-button">. */
(() => {
  const GAP = 4, SLOP = { fine: 4, coarse: 8 }, FINGER_MAX = 3000, HAND_MAX = 6000, CANCEL = 0.5, POWER_CAP = 1.5, DOT_MS = 300;
  const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const rubberband = (o, dim, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  // freccia in su (come ArrowUp02 di Hugeicons, tratto 2.2)
  const ARROW = s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v16"/><path d="M17 9s-3.68-5-5-5-5 5-5 5"/></svg>`;
  let uid = 0;

  // molla come animate(..., {type:'spring', duration:.4, bounce, velocity}) di Motion
  function spring(get, set, v0, bounce, done) {
    const zeta = 1 - clamp(bounce, 0, .95), w = 4 / (Math.max(zeta, .2) * .4) * (zeta < .5 ? .6 : 1);
    let x = get(), v = v0, last = performance.now(), stop = false, raf;
    const step = t => {
      if (stop) return;
      let dt = Math.min(.032, (t - last) / 1000); last = t;
      for (let i = 0; i < 4; i++) { const h = dt / 4, a = -w * w * x - 2 * zeta * w * v; v += a * h; x += v * h; }
      set(x);
      if (Math.abs(x) < .05 && Math.abs(v) < 2) { set(0); done?.(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return { stop() { stop = true; cancelAnimationFrame(raf); } };
  }

  function mount(host, o = {}) {
    const opt = Object.assign({ padColor: '#f5f5f5', iconColor: '#18181b', accentColor: '#f5f5f5', wellColor: '#27272a', bandColor: '#52525b', size: 56, strokeWidth: 3, armAt: 48, maxPull: 160, launchSpeed: 2600, recoil: 0.2, flight: 120, particles: 14, spread: 60, axis: 'any', tapSends: true, disabled: false, ariaLabel: 'Invia', icon: null, onSend: null, hint: 'Premi Invio per inviare, oppure trascina indietro e rilascia.' }, o);
    const reduce = reduceMQ.matches;
    const { size, strokeWidth, maxPull: R } = opt;
    const ARM = Math.min(opt.armAt, 0.8 * R);
    const wellR = size / 2 + GAP + strokeWidth, padR = size / 2 - strokeWidth / 2, arcR = wellR, H = wellR + strokeWidth + 2;
    const DOT = Math.max(6, Math.round(size / 7)), count = Math.max(0, Math.round(opt.particles));
    const hintId = 'sling-hint-' + (++uid);

    const root = document.createElement('span');
    root.className = 'sling-button' + (opt.className ? ' ' + opt.className : '');
    Object.entries({ '--sl-size': size + 'px', '--sl-svg': 2 * H + 'px', '--sl-pad': opt.padColor, '--sl-icon': opt.iconColor, '--sl-accent': opt.accentColor, '--sl-well': opt.wellColor, '--sl-band': opt.bandColor, '--sl-stroke': strokeWidth + 'px', '--sl-dot': DOT + 'px' }).forEach(([k, v]) => root.style.setProperty(k, v));
    root.innerHTML = `<svg class="sling-button__fx" viewBox="${-H} ${-H} ${2 * H} ${2 * H}" aria-hidden="true"><g class="sling-button__tension" style="opacity:0"><path class="sling-button__band"/><path class="sling-button__band sling-button__band--hot"/></g><circle class="sling-button__well" r="${wellR}"/><circle class="sling-button__arc" r="${arcR}" pathLength="1" stroke-dasharray="0 1" style="opacity:0"/></svg>`
      + Array.from({ length: count }, () => '<span class="sling-button__dot" aria-hidden="true"></span>').join('')
      + `<span class="sling-button__move"><button type="button" class="sling-button__pad" aria-label="${opt.ariaLabel}" aria-describedby="${hintId}"${opt.disabled ? ' aria-disabled="true"' : ''}><span class="sling-button__face"><span class="sling-button__icon">${opt.icon || ARROW(Math.round(size * 0.4))}</span></span></button></span><span id="${hintId}" class="sling-button__sr">${opt.hint}</span>`;
    host.append(root);

    const fx = root.querySelector('.sling-button__tension'), [band, hot] = fx.querySelectorAll('path'), arc = root.querySelector('.sling-button__arc');
    const dots = [...root.querySelectorAll('.sling-button__dot')], move = root.querySelector('.sling-button__move'), pad = root.querySelector('.sling-button__pad'), icon = root.querySelector('.sling-button__icon');
    let px = 0, py = 0, grip = null, dir = { ux: 0, uy: -1 }, animX = null, animY = null, armed = false, dotPending = false, dotTimer, paintQueued = false, skipClick = false, power = 0;
    const send = () => { try { opt.onSend?.(); } catch (e) { console.error(e); } };

    const relaxIcon = () => { icon.style.transition = reduce ? 'none' : `transform 360ms ${EASE_OUT}`; icon.style.transform = 'rotate(0deg)'; };
    const aimIcon = (ux, uy, dist) => { const angle = (Math.atan2(-uy, -ux) * 180) / Math.PI + 90; icon.style.transition = 'none'; icon.style.transform = `rotate(${angle * clamp(dist / 12, 0, 1)}deg)`; };
    const launchDot = () => {
      dotPending = false; clearTimeout(dotTimer);
      const { ux, uy } = dir; relaxIcon();
      const base = Math.atan2(-uy, -ux), cone = (opt.spread * Math.PI) / 180, push = 0.85 + 0.35 * power;
      dots.forEach((dot, i) => {
        const lead = i === 0;
        const angle = base + (lead ? 0 : (Math.random() + Math.random() - 1) * (cone / 2));
        const cx = Math.cos(angle), cy = Math.sin(angle);
        const reach = (lead ? opt.flight : opt.flight * (0.3 + Math.random())) * push;
        const drift = lead ? 0 : (Math.random() - 0.5) * opt.flight * 0.4;
        const scale = lead ? 1 : 0.3 + Math.random() * 0.6, shrink = lead ? 0.6 : scale * (0.2 + Math.random() * 0.4);
        const duration = lead ? DOT_MS : DOT_MS * (0.7 + Math.random()), delay = lead ? 0 : Math.random() * 70, to = wellR + reach;
        dot.animate([{ transform: `translate(${cx * wellR}px, ${cy * wellR}px) scale(${scale})` }, { transform: `translate(${cx * to - cy * drift}px, ${cy * to + cx * drift}px) scale(${shrink})` }], { duration, delay, easing: EASE_OUT, fill: 'none' });
        dot.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.55 }, { opacity: 0, offset: 1 }], { duration, delay, easing: 'linear', fill: 'none' });
      });
    };
    const paint = () => {
      paintQueued = false;
      const x = px, y = py, { ux, uy } = dir;
      const proj = x * ux + y * uy, p = clamp(proj / ARM, 0, 1), dist = Math.hypot(x, y);
      let d = '';
      if (dist > 0.5) {
        const a = Math.atan2(y, x), b = Math.acos(clamp((wellR - padR) / dist, -1, 1));
        d = [a + b, a - b].map(t => { const cx = Math.cos(t), cy = Math.sin(t); return `M${(wellR * cx).toFixed(2)},${(wellR * cy).toFixed(2)}L${(x + padR * cx).toFixed(2)},${(y + padR * cy).toFixed(2)}`; }).join('');
      }
      band.setAttribute('d', d); hot.setAttribute('d', d); hot.style.opacity = String(p);
      fx.style.opacity = String(clamp(proj / 6, 0, 1));
      arc.setAttribute('stroke-dasharray', `${p} ${1 - p}`); arc.setAttribute('stroke-dashoffset', String(p / 2)); arc.style.opacity = p > 0.01 ? '1' : '0';
      if (grip) aimIcon(ux, uy, dist);
      arc.setAttribute('transform', `rotate(${(Math.atan2(-uy, -ux) * 180) / Math.PI})`);
      if (dotPending && proj <= size / 4) launchDot();
    };
    const setPos = (x, y) => { px = x; py = y; move.style.transform = `translate(${x}px, ${y}px)`; if (!paintQueued) { paintQueued = true; requestAnimationFrame(paint); } };
    const setArmed = v => { armed = v; if (v) { root.setAttribute('data-armed', ''); pad.setAttribute('data-armed', ''); } else { root.removeAttribute('data-armed'); pad.removeAttribute('data-armed'); } };
    const setHeld = v => v ? pad.setAttribute('data-held', '') : pad.removeAttribute('data-held');
    const settle = v0 => {
      if (reduce) { fx.style.transition = 'opacity 200ms ease'; fx.style.opacity = '0'; setTimeout(() => { setPos(0, 0); fx.style.transition = ''; }, 200); return; }
      animX = spring(() => px, v => setPos(v, py), v0.x, opt.recoil);
      animY = spring(() => py, v => setPos(px, v), v0.y, opt.recoil);
    };
    setPos(0, 0); paint();

    pad.addEventListener('pointerdown', e => {
      if (opt.disabled || grip || e.button !== 0) return;
      const rect = root.getBoundingClientRect(), scale = rect.width / (root.offsetWidth || rect.width) || 1;
      animX?.stop(); animY?.stop();
      const x = px, y = py, dNow = Math.hypot(x, y), dClamped = Math.min(dNow, 0.95 * R), rawNow = dNow > 0.5 ? (R * dClamped) / (R - dClamped) : 0;
      grip = { id: e.pointerId, startX: e.clientX, startY: e.clientY, scale, moved: false, hist: [], rawOrigin: dNow > 0.5 ? { x: (rawNow * x) / dNow, y: (rawNow * y) / dNow } : { x: 0, y: 0 }, slop: e.pointerType === 'touch' ? SLOP.coarse : SLOP.fine };
      try { pad.setPointerCapture(e.pointerId); } catch {}
      setHeld(true);
    });
    pad.addEventListener('pointermove', e => {
      const g = grip; if (!g || g.id !== e.pointerId) return;
      const dx = (e.clientX - g.startX) / g.scale, dy = (e.clientY - g.startY) / g.scale;
      let rx = g.rawOrigin.x + dx, ry = g.rawOrigin.y + dy;
      if (opt.axis === 'horizontal') ry = rubberband(ry, size / 4); else if (opt.axis === 'vertical') rx = rubberband(rx, size / 4);
      if (!g.moved && Math.hypot(dx, dy) > g.slop) g.moved = true;
      const raw = Math.hypot(rx, ry); if (raw < 0.01) return;
      const d = (R * raw) / (R + raw), ux = rx / raw, uy = ry / raw;
      dir = { ux, uy }; setPos(d * ux, d * uy);
      const t = performance.now(); g.hist.push({ x: d * ux, y: d * uy, t });
      while (g.hist.length > 4 || t - g.hist[0].t > 80) g.hist.shift();
      const isArmed = d >= ARM; if (isArmed !== armed) setArmed(isArmed);
    });
    const release = (pointerId, cancelled) => {
      const g = grip; if (!g || g.id !== pointerId) return;
      grip = null; skipClick = true;
      try { pad.releasePointerCapture(pointerId); } catch {}
      const d = Math.hypot(px, py), p = d / ARM, { ux, uy } = dir;
      let vx = 0, vy = 0;
      if (!cancelled && g.hist.length > 1) { const a = g.hist[0], b = g.hist[g.hist.length - 1], dt = b.t - a.t; if (dt > 0 && performance.now() - b.t < 50) { vx = ((b.x - a.x) / dt) * 1000; vy = ((b.y - a.y) / dt) * 1000; } }
      const fm = Math.hypot(vx, vy); if (fm > FINGER_MAX) { vx *= FINGER_MAX / fm; vy *= FINGER_MAX / fm; }
      if (!g.moved) { relaxIcon(); if (opt.tapSends && !cancelled) send(); }
      else {
        const fire = armed && !cancelled;
        const launch = fire ? opt.launchSpeed * Math.min(p, POWER_CAP) : CANCEL * opt.launchSpeed * Math.min(p, 1);
        let v0x = vx - ux * launch, v0y = vy - uy * launch; const m = Math.hypot(v0x, v0y);
        if (m > HAND_MAX) { v0x *= HAND_MAX / m; v0y *= HAND_MAX / m; }
        if (!fire) relaxIcon();
        if (fire) {
          send();
          if (reduce) { root.setAttribute('data-sent', ''); setTimeout(() => root.removeAttribute('data-sent'), 200); }
          else { power = clamp((Math.min(p, POWER_CAP) - 1) / (POWER_CAP - 1), 0, 1); dotPending = true; dotTimer = setTimeout(launchDot, 150); }
        }
        settle({ x: v0x, y: v0y });
      }
      setArmed(false); setHeld(false);
    };
    pad.addEventListener('pointerup', e => release(e.pointerId, false));
    pad.addEventListener('pointercancel', e => release(e.pointerId, true));
    pad.addEventListener('lostpointercapture', e => release(e.pointerId, true));
    pad.addEventListener('keydown', e => { if (e.key === 'Escape' && grip) release(grip.id, true); });
    pad.addEventListener('click', () => { if (skipClick) { skipClick = false; return; } if (!opt.disabled) send(); });
    return root;
  }
  window.MoiSling = { mount };
})();
