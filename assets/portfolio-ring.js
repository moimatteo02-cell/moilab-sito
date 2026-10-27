// MOI LAB — "I nostri lavori": galleria ad anello 3D
// Dati: /data/portfolio.json  →  { "<servizio>": { "progetti": [ { titolo, cliente, anno, descrizione, immagini:[...], esempio? , attivo? } ] } }
// Uso nell'HTML: <section class="mp-teaser" data-portfolio="apparel"></section>

const DATA_URL = '/data/portfolio.json?v=20261024-1';
const NAMES = { apparel: 'Apparel', custom: 'Custom', automotive: 'Automotive', signage: 'Signage', design: 'Design' };
const WHATSAPP = '393278815148';
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut = t => 1 - Math.pow(1 - t, 4);
const wrap180 = a => ((a + 180) % 360 + 360) % 360 - 180;

let dataPromise;
const getData = () => dataPromise ??= fetch(DATA_URL).then(r => r.ok ? r.json() : {}).catch(() => ({}));
const projectsOf = (data, key) => (data?.[key]?.progetti || []).filter(p => p && p.attivo !== false && Array.isArray(p.immagini) && p.immagini.length);

/* ---------------- Anteprima dentro lo showroom ---------------- */

function renderTeaser(el, data) {
  const key = el.dataset.portfolio, name = NAMES[key] || key, list = projectsOf(data, key);
  el.innerHTML = `
    <div class="mp-teaser-copy">
      <p class="mp-eyebrow">MOI LAB / ${esc(name.toUpperCase())} / LAVORI</p>
      <h2>I nostri lavori.<br><em>Guardali da vicino.</em></h2>
      <p class="mp-lead">${list.length ? (list.every(p => p.esempio) ? 'Qui arriveranno i nostri lavori. Intanto prova la galleria: sfoglia, gira, apri.' : `${list.length} ${list.length === 1 ? 'progetto realizzato' : 'progetti realizzati'}. Sfogliali, girali, aprili uno per uno.`) : 'La galleria si sta preparando. Presto qui troverai i nostri lavori.'}</p>
      ${list.length ? `<button class="mp-open" type="button">Entra nella galleria <span aria-hidden="true">→</span></button>` : ''}
    </div>
    ${list.length ? `<div class="mp-helix" role="group" aria-label="Lavori ${esc(name)} in 3D: trascina per girare, tocca una foto per aprire la galleria">
      <span class="mp-helix-axis" aria-hidden="true"></span><div class="mp-helix-stage"></div>
      <span class="mp-fan-hint">Trascina · Tocca per aprire</span>
    </div>` : ''}`;
  el.querySelector('.mp-open')?.addEventListener('click', e => openGallery(key, list, e.currentTarget));
  const hx = el.querySelector('.mp-helix'); if (hx) helix(hx, list, () => openGallery(key, list, el.querySelector('.mp-open')));
}

/* ---------------- Elica 3D (anteprima) ----------------
   Le foto salgono a spirale come una vite: girano da sole, si trascinano con inerzia,
   lo scorrimento della pagina le fa girare un po' più veloci. Le foto dietro sono più scure. */
function helix(box, list, onOpen) {
  const stage = box.querySelector('.mp-helix-stage');
  const COUNT = Math.max(14, list.length), STEP = 360 / 7, TURN = 7 * STEP;     // 7 foto per giro, 2 giri visibili
  const cards = Array.from({ length: COUNT }, (_, i) => {
    const p = list[i % list.length], c = document.createElement('button');
    c.type = 'button'; c.className = 'mp-helix-card'; c.tabIndex = -1; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = `<img src="${esc(p.immagini[0])}" alt="" loading="lazy" decoding="async" draggable="false">`;
    stage.append(c); return c;
  });
  const scroller = box.closest('.moi-room'), sy = () => scroller ? scroller.scrollTop : scrollY;
  let a = 0, v = 0, drag = null, vis = false, raf = 0, lastY = sy();
  const reduce = reduceMQ.matches;
  box.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, lx: e.clientX, moved: 0 }; v = 0; box.setPointerCapture?.(e.pointerId); });
  box.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.lx; drag.lx = e.clientX; drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.x)); a += dx * .35; v = dx * .35; kick(); });
  const up = () => { if (!drag) return; const moved = drag.moved; drag = null; if (moved < 8) onOpen(); };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', () => { drag = null; });
  box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } });
  box.tabIndex = 0;
  const frame = () => {
    raf = 0; if (!vis) return;
    const now = sy(), dy = now - lastY; lastY = now;
    if (!drag) { a += v + (reduce ? 0 : .22) + (reduce ? 0 : Math.max(-6, Math.min(6, dy * .12))); v *= .94; }
    const W = box.clientWidth, H = box.clientHeight, R = Math.min(240, W * .36), pitch = H * .62;   // altezza di un giro
    cards.forEach((c, i) => {
      const t = ((i * STEP - a) % (2 * TURN) + 2 * TURN) % (2 * TURN) - TURN;   // -TURN..TURN: posizione lungo la vite
      const th = t * Math.PI / 180, z = Math.cos(th), y = -t / 360 * pitch;
      const edge = Math.max(0, Math.min(1, (H * .62 - Math.abs(y)) / (H * .16)));  // sfuma in alto e in basso
      c.style.transform = `translate3d(${Math.sin(th) * R}px,${y}px,${z * R}px) rotateY(${t}deg)`;
      c.style.opacity = (edge * (.35 + .65 * (z + 1) / 2)).toFixed(3);
      c.style.filter = `brightness(${(.45 + .55 * (z + 1) / 2).toFixed(3)})`;
      c.style.zIndex = Math.round(100 + z * 100);
    });
    if (!reduce || drag) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && vis) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) { lastY = sy(); kick(); } }, { rootMargin: '100px' }).observe(box);
  addEventListener('resize', kick);
}

/* ---------------- Galleria a tutto schermo ---------------- */

let current = null;

function openGallery(key, list, opener) {
  if (current || !list.length) return;
  current = new Ring(key, list, opener);
}

class Ring {
  constructor(key, list, opener) {
    this.key = key; this.name = NAMES[key] || key; this.list = list; this.opener = opener;
    this.reduce = reduceMQ.matches;
    this.rot = 0; this.vel = 0; this.target = null; this.tilt = 0; this.tiltTarget = 0;
    this.drag = null; this.intro = this.reduce ? null : { start: 0 }; this.ready = false;
    this.lastInteract = performance.now(); this.active = -1; this.raf = 0; this.viewer = null;
    this.build(); this.layout(); this.bind(); this.preload();
  }

  build() {
    const el = this.el = document.createElement('div');
    el.className = 'mp'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', `I nostri lavori — ${this.name}`);
    el.innerHTML = `
      <div class="mp-bg" aria-hidden="true"></div>
      <header class="mp-top">
        <span class="mp-brand">MOI LAB <i>/</i> ${esc(this.name.toUpperCase())} <i>/</i> I NOSTRI LAVORI</span>
        <span class="mp-count" aria-hidden="true"><b>01</b><span> / ${pad(this.list.length)}</span></span>
        <button class="mp-close" type="button">Chiudi <span aria-hidden="true">✕</span></button>
      </header>
      <div class="mp-loader" aria-hidden="true"><span class="mp-loader-num">000</span><span class="mp-loader-label">Prepariamo i lavori</span></div>
      <div class="mp-viewport"><div class="mp-scene"></div></div>
      <footer class="mp-bottom">
        <div class="mp-caption" aria-live="polite"><small></small><strong></strong></div>
        <p class="mp-help">Trascina per ruotare · Clicca per aprire</p>
        <div class="mp-arrows">
          <button type="button" data-step="-1" aria-label="Lavoro precedente">←</button>
          <button type="button" data-step="1" aria-label="Lavoro successivo">→</button>
        </div>
      </footer>`;
    this.viewport = el.querySelector('.mp-viewport'); this.scene = el.querySelector('.mp-scene');
    this.loaderNum = el.querySelector('.mp-loader-num');
    this.countEl = el.querySelector('.mp-count b');
    this.capSmall = el.querySelector('.mp-caption small'); this.capTitle = el.querySelector('.mp-caption strong');
    document.body.appendChild(el);
    document.documentElement.classList.add('mp-lock');
    requestAnimationFrame(() => el.classList.add('is-open'));
    el.querySelector('.mp-close').focus({ preventScroll: true });
  }

  /* Geometria: anello visto dall'interno — le carte ai lati sono più vicine e più grandi */
  layout() {
    const vw = innerWidth, vh = innerHeight, mobile = vw < 720;
    const cw = this.cw = Math.round(mobile ? clamp(vw * .46, 140, 230) : clamp(Math.min(vw * .16, vh * .3), 150, 290));
    const ch = this.ch = Math.round(cw * 4 / 3);
    const gap = 1.1, R0 = clamp(vw * (mobile ? .95 : .62), 380, 1200);
    const S0 = clamp(Math.round(2 * Math.PI * R0 / (cw * gap)), 12, 44);
    const S = this.S = Math.max(S0, this.list.length);
    const R = this.R = S * cw * gap / (2 * Math.PI);
    this.step = 360 / S;
    this.D = R * (mobile ? .46 : .3);                 // distanza della camera dal centro dell'anello
    this.P = (R + this.D) * (mobile ? .8 : .74);
    this.baseTilt = mobile ? -4 : -7;   // arco ad arcobaleno       // prospettiva: scala della carta frontale
    this.viewport.style.perspective = `${this.P}px`;
    this.degPerPx = this.step / (cw * (mobile ? .9 : .7));
    if (!this.cards || this.cards.length !== S) {
      this.scene.innerHTML = '';
      this.cards = Array.from({ length: S }, (_, k) => {
        const p = this.list[k % this.list.length], b = document.createElement('button');
        b.type = 'button'; b.className = 'mp-card'; b.dataset.slot = k; b.tabIndex = -1;
        b.setAttribute('aria-label', `Apri: ${p.titolo || 'lavoro'}`);
        b.innerHTML = `<img src="${esc(p.immagini[0])}" alt="" draggable="false" decoding="async">${p.esempio ? '<span class="mp-tag">Esempio</span>' : ''}`;
        this.scene.appendChild(b); return b;
      });
    }
    this.cards.forEach(c => { c.style.width = cw + 'px'; c.style.height = ch + 'px'; c.style.margin = `${-ch / 2}px 0 0 ${-cw / 2}px`; });
    this.kick();
  }

  preload() {
    const urls = [...new Set(this.list.map(p => p.immagini[0]))], t0 = performance.now();
    let done = 0, shown = 0;
    const tick = () => {
      const goal = Math.round(done / urls.length * 100), minT = clamp((performance.now() - t0) / (this.reduce ? 1 : 900), 0, 1) * 100;
      shown = Math.min(goal, Math.max(shown + 3, Math.round(minT * goal / 100)));
      this.loaderNum.textContent = String(Math.min(shown, 100)).padStart(3, '0');
      if (shown >= 100) return this.start();
      requestAnimationFrame(tick);
    };
    urls.forEach(u => { const i = new Image(); i.decoding = 'async'; i.onload = i.onerror = () => done++; i.src = u; });
    setTimeout(() => { done = urls.length; }, 6000); // non bloccare mai l'apertura
    tick();
  }

  start() {
    this.el.classList.add('is-ready'); this.ready = true;
    if (this.intro) this.intro.start = performance.now();
    this.lastInteract = performance.now(); this.kick();
  }

  bind() {
    const vp = this.viewport;
    this.on = [];
    const add = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); this.on.push([t, ev, fn, o]); };
    add(this.el.querySelector('.mp-close'), 'click', () => this.close());
    this.el.querySelectorAll('[data-step]').forEach(b => add(b, 'click', () => this.go(+b.dataset.step)));

    add(vp, 'pointerdown', e => {
      if (!this.ready || (e.pointerType === 'mouse' && e.button !== 0)) return;
      this.drag = { x: e.clientX, y: e.clientY, rot: this.rot, lx: e.clientX, lt: performance.now(), moved: false, id: e.pointerId };
      this.target = null; this.vel = 0; this.interact();
    });
    add(window, 'pointermove', e => {
      if (!this.drag) { // leggera parallasse col mouse
        if (e.pointerType === 'mouse' && !this.viewer) { this.tiltTarget = (e.clientY / innerHeight - .5) * -5; this.kick(); }
        return;
      }
      const d = this.drag, dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) > 6) { d.moved = true; vp.setPointerCapture?.(d.id); this.el.classList.add('is-dragging'); }
      if (!d.moved) return;
      const now = performance.now(), dt = Math.max(1, now - d.lt);
      this.rot = d.rot - dx * this.degPerPx;
      this.vel = clamp(-(e.clientX - d.lx) * this.degPerPx / dt * 16, -this.step * 1.6, this.step * 1.6);
      d.lx = e.clientX; d.lt = now;
      this.tiltTarget = clamp(dy * -.04, -12, 12);
      this.interact();
    });
    const up = e => {
      const d = this.drag; if (!d) return; this.drag = null; this.el.classList.remove('is-dragging');
      if (performance.now() - d.lt > 90) this.vel = 0;
      this.tiltTarget = 0;
      if (!d.moved) { const card = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.mp-card'); if (card) this.cardClick(card); }
      if (this.reduce) { this.vel = 0; this.snap(); }
      this.interact();
    };
    add(window, 'pointerup', up); add(window, 'pointercancel', up);

    add(vp, 'wheel', e => {
      if (!this.ready) return; e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      this.target = null; this.vel = clamp(this.vel + delta * .012 * this.step / 10, -this.step * 1.4, this.step * 1.4);
      if (this.reduce) { this.go(Math.sign(delta)); return; }
      this.interact();
    }, { passive: false });

    add(document, 'keydown', e => {
      if (this.viewer) return this.viewerKey(e);
      if (e.key === 'Escape') { e.preventDefault(); this.close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
      else if ((e.key === 'Enter' || e.key === ' ') && !document.activeElement?.closest?.('button,a')) { e.preventDefault(); this.openViewer(); }
      else if (e.key === 'Tab') this.trap(e, this.el);
    });
    add(window, 'resize', () => this.layout());
  }

  trap(e, root) {
    const f = [...root.querySelectorAll('button:not([disabled]):not([tabindex="-1"]),a[href]')].filter(x => x.offsetParent !== null && !x.closest('[hidden]'));
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  interact() { this.lastInteract = performance.now(); this.kick(); }
  kick() { if (!this.raf) this.raf = requestAnimationFrame(t => this.frame(t)); }

  frontSlot() { return Math.round(this.rot / this.step); }
  go(d) { this.vel = 0; this.target = (this.frontSlot() + d) * this.step; if (this.reduce) { this.rot = this.target; this.target = null; } this.interact(); }
  snap() { this.target = this.frontSlot() * this.step; }

  cardClick(card) {
    const k = +card.dataset.slot, diff = wrap180(k * this.step - this.rot);
    if (Math.abs(diff) < this.step / 2) return this.openViewer(card);
    this.vel = 0; this.target = this.rot + diff; if (this.reduce) { this.rot = this.target; this.target = null; }
    this.interact();
  }

  frame(now) {
    this.raf = 0;
    let moving = false;
    if (!this.drag && this.ready) {
      if (this.target != null) {
        const d = this.target - this.rot; this.rot += d * .14;
        if (Math.abs(d) < .01) { this.rot = this.target; this.target = null; } else moving = true;
      } else if (Math.abs(this.vel) > .01) {
        this.rot += this.vel; this.vel *= .94; moving = true;
        if (Math.abs(this.vel) < .06) { this.vel = 0; this.snap(); }
      } else if (!this.reduce && !this.viewer && now - this.lastInteract > 4500) {
        this.rot += .025; moving = true;            // rotazione lenta quando nessuno tocca
      }
    }
    this.tilt += (this.tiltTarget - this.tilt) * .08;
    if (Math.abs(this.tiltTarget - this.tilt) > .02) moving = true;

    // animazione d'ingresso: le carte partono impilate al centro e si aprono a ventaglio
    let introT = 1;
    if (this.intro) {
      if (!this.ready) introT = 0;
      else { introT = (now - this.intro.start) / (1400 + this.S * 28); if (introT >= 1) { this.intro = null; introT = 1; this.lastInteract = now; } else moving = true; }
    }

    const { R, D, P, step, S, ch } = this;
    const zc = P - D, lift = R * Math.sin(-(this.tilt + this.baseTilt) * Math.PI / 180) * .55;
    for (let k = 0; k < S; k++) {
      const c = this.cards[k];
      let a = this.rot - k * step, ty = 0, rz = 0, sc = 1, op;
      if (introT < 1) {
        const order = Math.abs(wrap180(a)) / 180;                       // dal centro verso i lati
        const t = clamp((introT * (1 + .55) - order * .55), 0, 1), e = easeOut(t);
        const seed = Math.sin(k * 12.9898) * 43758.5453 % 1;
        a = wrap180(a) * e; ty = (1 - e) * ch * .35; rz = (1 - e) * seed * 14; sc = .55 + .45 * e;
        op = this.ready ? clamp(t * 3, 0, 1) : 0;
      }
      const ra = a * Math.PI / 180, cos = Math.cos(ra);
      // nascondi le carte che finirebbero dietro la camera
      const vis = clamp((cos + .32) / .3, 0, 1);
      op = op == null ? vis : Math.min(op, vis);
      c.style.transform = `translate3d(0,${ty + lift}px,${zc}px) rotateX(${this.tilt + this.baseTilt}deg) rotateY(${a}deg) translateZ(${-R}px) rotateZ(${rz}deg) scale(${sc})`;
      c.style.opacity = op.toFixed(3);
      c.style.visibility = op < .01 ? 'hidden' : 'visible';
      c.style.pointerEvents = op > .5 ? 'auto' : 'none';
      c.classList.toggle('is-front', Math.abs(wrap180(a)) < step / 2 && introT >= 1);
    }

    const front = ((this.frontSlot() % S) + S) % S, idx = front % this.list.length;
    if (idx !== this.active && introT >= 1) this.setActive(idx);
    if (moving || this.drag) this.kick();
    else if (!this.reduce && !this.viewer) setTimeout(() => this.kick(), 600); // controlla di nuovo per la rotazione lenta
  }

  setActive(i) {
    this.active = i; const p = this.list[i];
    this.countEl.textContent = pad(i + 1);
    this.capSmall.textContent = [p.esempio ? 'Esempio' : '', p.cliente, p.anno].filter(Boolean).join(' · ') || this.name;
    this.capTitle.textContent = p.titolo || '';
  }

  /* ---------------- Scheda del singolo lavoro ---------------- */

  openViewer(fromCard) {
    if (this.viewer || this.active < 0) return;
    const card = fromCard || this.el.querySelector('.mp-card.is-front');
    const v = this.viewer = document.createElement('div');
    v.className = 'mp-viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true');
    v.innerHTML = `
      <button class="mp-v-back" type="button"><span aria-hidden="true">←</span> Torna ai lavori</button>
      <div class="mp-v-stage"><img class="mp-v-img" alt=""></div>
      <aside class="mp-v-info">
        <p class="mp-v-meta"></p><h3></h3><p class="mp-v-desc"></p>
        <div class="mp-v-thumbs"></div>
        <a class="mp-v-cta" target="_blank" rel="noopener">Voglio qualcosa di simile <span aria-hidden="true">↗</span></a>
        <div class="mp-v-nav"><button type="button" data-v="-1" aria-label="Lavoro precedente">←</button><span class="mp-v-count"></span><button type="button" data-v="1" aria-label="Lavoro successivo">→</button></div>
      </aside>`;
    this.el.appendChild(v); this.el.classList.add('has-viewer');
    v.querySelector('.mp-v-back').onclick = () => this.closeViewer();
    v.querySelectorAll('[data-v]').forEach(b => b.onclick = () => this.viewerStep(+b.dataset.v));
    v.addEventListener('click', e => { if (e.target === v || e.target.classList.contains('mp-v-stage')) this.closeViewer(); });
    // swipe sulla foto
    let sx = null;
    v.querySelector('.mp-v-stage').addEventListener('pointerdown', e => { sx = e.clientX; });
    v.querySelector('.mp-v-stage').addEventListener('pointerup', e => { if (sx != null && Math.abs(e.clientX - sx) > 50) this.viewerStep(e.clientX < sx ? 1 : -1); sx = null; });
    this.fillViewer(0);
    // animazione: la foto "esce" dalla carta e si allarga
    const img = v.querySelector('.mp-v-img');
    if (card && !this.reduce) {
      const from = card.getBoundingClientRect();
      const run = () => {
        const to = img.getBoundingClientRect(); if (!to.width) return;
        img.animate([
          { transform: `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px,${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.width / to.width})`, opacity: .6 },
          { transform: 'none', opacity: 1 }], { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' });
      };
      img.complete ? requestAnimationFrame(run) : img.addEventListener('load', run, { once: true });
    }
    requestAnimationFrame(() => v.classList.add('is-open'));
    v.querySelector('.mp-v-back').focus({ preventScroll: true });
  }

  fillViewer(imgIndex) {
    const v = this.viewer, p = this.list[this.active]; this.vImg = imgIndex;
    const img = v.querySelector('.mp-v-img');
    img.src = p.immagini[imgIndex]; img.alt = p.titolo || `Lavoro ${this.name}`;
    v.setAttribute('aria-label', p.titolo || 'Lavoro');
    v.querySelector('.mp-v-meta').textContent = [this.name, p.esempio ? 'Esempio' : '', p.cliente, p.anno].filter(Boolean).join(' · ');
    v.querySelector('h3').textContent = p.titolo || '';
    v.querySelector('.mp-v-desc').textContent = p.descrizione || '';
    v.querySelector('.mp-v-count').textContent = `${pad(this.active + 1)} / ${pad(this.list.length)}`;
    const th = v.querySelector('.mp-v-thumbs');
    th.innerHTML = p.immagini.length > 1 ? p.immagini.map((u, i) => `<button type="button" data-i="${i}" aria-label="Foto ${i + 1}" aria-pressed="${i === imgIndex}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join('') : '';
    th.querySelectorAll('[data-i]').forEach(b => b.onclick = () => this.fillViewer(+b.dataset.i));
    const msg = `Ciao MOI LAB! Ho visto il lavoro "${p.titolo || ''}" (${this.name}) sul sito e vorrei qualcosa di simile.`;
    v.querySelector('.mp-v-cta').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    if (!this.reduce) img.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
  }

  viewerStep(d) {
    const p = this.list[this.active];
    if (p.immagini.length > 1 && this.vImg + d >= 0 && this.vImg + d < p.immagini.length) return this.fillViewer(this.vImg + d);
    // passa al lavoro successivo e fa girare l'anello di conseguenza
    this.go(d); this.rot = this.target ?? this.rot; this.target = null;
    this.active = ((this.active + d) % this.list.length + this.list.length) % this.list.length;
    this.setActive(this.active); this.fillViewer(d > 0 ? 0 : this.list[this.active].immagini.length - 1);
    this.kick();
  }

  viewerKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); this.closeViewer(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); this.viewerStep(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this.viewerStep(-1); }
    else if (e.key === 'Tab') this.trap(e, this.viewer);
  }

  closeViewer() {
    const v = this.viewer; if (!v) return; this.viewer = null;
    v.classList.remove('is-open'); this.el.classList.remove('has-viewer');
    setTimeout(() => v.remove(), this.reduce ? 0 : 320);
    this.el.querySelector('.mp-close').focus({ preventScroll: true });
    this.interact();
  }

  close() {
    this.closeViewer();
    this.on.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
    cancelAnimationFrame(this.raf); this.raf = -1; this.kick = () => {};
    this.el.classList.remove('is-open'); this.el.classList.add('is-closing');
    setTimeout(() => { this.el.remove(); document.documentElement.classList.remove('mp-lock'); }, this.reduce ? 0 : 420);
    this.opener?.focus?.({ preventScroll: true });
    current = null;
  }
}

/* ---------------- Avvio ---------------- */
async function init() {
  const els = document.querySelectorAll('[data-portfolio]');
  if (!els.length) return;
  const data = await getData();
  els.forEach(el => renderTeaser(el, data));
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
