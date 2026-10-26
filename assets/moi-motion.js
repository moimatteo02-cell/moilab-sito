/* MOI LAB — animazioni del sito (ispirate a React Bits, riscritte in JavaScript semplice).
   Ogni effetto è legato al suo servizio. Con "riduci animazioni" attivo restano solo gli stati finali.
   React Bits: licenza MIT + Commons Clause, (c) David Haz. */
(() => {
  'use strict';
  const doc = document, root = doc.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = doc) => r.querySelector(s), $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  root.classList.add('moi-motion');
  if (reduce) root.classList.add('moi-motion-reduced');

  /* quando una stanza (servizio) si apre */
  const roomHooks = {};
  const onRoom = (id, fn) => { (roomHooks[id] ||= []).push(fn); const el = doc.getElementById(id); if (el?.classList.contains('is-active')) fn(el); };
  $$('.moi-room').forEach(room => {
    let was = room.classList.contains('is-active');
    new MutationObserver(() => {
      const now = room.classList.contains('is-active');
      if (now && !was) (roomHooks[room.id] || []).forEach(fn => fn(room));
      was = now;
    }).observe(room, { attributes: true, attributeFilter: ['class'] });
  });

  /* ============ 1 · Comparsa allo scorrimento (nei servizi; la home ha già il suo sistema) ============ */
  if (!reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('mm-in'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -8% 0px' });
    $$('.moi-room .mp-teaser, .moi-room .ma-gallery, .moi-room .md-services, .moi-room .md-software-library, .moi-room .moi-room-nav, #moi-auto-form').forEach(el => { el.classList.add('mm-reveal'); io.observe(el); });
  }

  /* ============ 2 · Menu a tendina (Staggered Menu) ============ */
  const menu = $('#moi-lab-hub .mlg-menu');
  if (menu) {
    const nav = $('nav', menu), sum = $('summary', menu);
    menu.classList.add('mm-sm');
    menu.insertAdjacentHTML('beforeend', '<span class="mm-sm-layer mm-sm-l1" aria-hidden="true"></span><span class="mm-sm-layer mm-sm-l2" aria-hidden="true"></span>');
    // il pannello deve stare sopra tutto: lo sposto sul body mantenendo la logica del <details>
    const host = doc.createElement('div'); host.className = 'mm-sm-host'; doc.body.append(host);
    host.append(...$$('.mm-sm-layer', menu), nav);
    nav.insertAdjacentHTML('afterbegin', '<button type="button" class="mm-sm-close" aria-label="Chiudi menu"><span aria-hidden="true"></span>Chiudi</button>');
    let closing = 0;
    nav.inert = !menu.open;
    const sync = () => { const open = menu.open; host.classList.toggle('is-open', open); root.classList.toggle('mm-sm-open', open); nav.inert = !open; if (open) { clearTimeout(closing); host.classList.remove('is-closing'); } };
    // il pannello ora vive fuori dal <details>: evito che gli script esistenti lo chiudano quando il focus o un clic ci entrano
    menu.addEventListener('focusout', e => { if (e.relatedTarget && host.contains(e.relatedTarget)) e.stopPropagation(); }, true);
    host.addEventListener('click', e => { if (!e.target.closest('a')) e.stopPropagation(); });
    host.addEventListener('focusout', e => { if (menu.open && !host.contains(e.relatedTarget) && !menu.contains(e.relatedTarget) && e.relatedTarget) close(); });
    menu.addEventListener('toggle', sync);
    const close = () => { if (!menu.open) return; host.classList.add('is-closing'); host.classList.remove('is-open'); root.classList.remove('mm-sm-open'); nav.inert = true; closing = setTimeout(() => { menu.open = false; host.classList.remove('is-closing'); }, reduce ? 0 : 650); };
    sum.addEventListener('click', e => { if (menu.open) { e.preventDefault(); close(); } });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); if (e.target.closest('.mm-sm-close')) { close(); sum.focus({ preventScroll: true }); } });
    menu.addEventListener('toggle', () => { if (menu.open) setTimeout(() => $('.mm-sm-close', nav)?.focus({ preventScroll: true }), 450); });
    doc.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.open) { close(); sum.focus(); } });
    host.addEventListener('click', e => { if (e.target === host) close(); }, true);
  }

  /* ============ 3 · Pulsanti magnetici (solo mouse) ============ */
  if (fine && !reduce) {
    const SEL = '.md-project-cta, .ac-pdp-cta, #moi-auto-form .ma-primary';
    let raf = 0, px = 0, py = 0, active = new Set();
    const paint = () => {
      raf = 0;
      const now = new Set();
      $$(SEL).forEach(el => {
        if (!el.offsetParent) return;
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, pad = 70;
        if (Math.abs(px - cx) < r.width / 2 + pad && Math.abs(py - cy) < r.height / 2 + pad) {
          now.add(el); el.classList.add('mm-magnet-on');
          el.style.translate = `${((px - cx) / 4).toFixed(1)}px ${((py - cy) / 4).toFixed(1)}px`;
        }
      });
      active.forEach(el => { if (!now.has(el)) { el.classList.remove('mm-magnet-on'); el.style.translate = ''; } });
      active = now;
    };
    addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  }

  /* ============ 4 · Titolo home parola per parola (Split / Blur Text) ============ */
  const title = $('#moi-lab-hub .mlg-title');
  if (title && !reduce) {
    let i = 0;
    $$('.moi-copy-line', title).forEach(line => {
      [...line.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const f = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) f.append(t); else { const s = doc.createElement('span'); s.className = 'mm-w'; s.textContent = t; s.style.setProperty('--i', i++); f.append(s); } });
          n.replaceWith(f);
        } else if (n.nodeType === 1) { n.classList.add('mm-w'); n.style.setProperty('--i', i++); }
      });
    });
    title.classList.add('mm-split');
    const go = () => requestAnimationFrame(() => title.classList.add('mm-split-in'));
    if (!root.classList.contains('moi-loading')) go();
    else { const mo = new MutationObserver(() => { if (!root.classList.contains('moi-loading')) { mo.disconnect(); go(); } }); mo.observe(root, { attributes: true, attributeFilter: ['class'] }); setTimeout(go, 6000); }
  }

  /* ============ 5 · Riflesso oro sulla scritta (Shiny Text) ============ */
  $$('#moi-lab-hub .mlg-opening .mlg-kicker').forEach(k => k.classList.add('mm-shiny'));

  /* ============ 6 · Luce che segue il mouse sulle card dei servizi (Spotlight Card) ============ */
  if (fine) $$('#moi-lab-hub .mlg-card').forEach(card => {
    card.insertAdjacentHTML('beforeend', '<span class="mm-spot" aria-hidden="true"></span>');
    card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(); card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px'); card.classList.add('mm-spot-on'); });
    card.addEventListener('pointerleave', () => card.classList.remove('mm-spot-on'));
  });

  /* ============ 7 · Grana pellicola sullo sfondo nero della home (Noise) ============ */
  const hub = $('#moi-lab-hub');
  if (hub && !reduce) {
    const c = doc.createElement('canvas'); c.width = c.height = 220; const x = c.getContext('2d'), img = x.createImageData(220, 220);
    for (let p = 0; p < img.data.length; p += 4) { const v = Math.random() * 255 | 0; img.data[p] = img.data[p + 1] = img.data[p + 2] = v; img.data[p + 3] = 255; }
    x.putImageData(img, 0, 0);
    const grain = doc.createElement('div'); grain.className = 'mm-grain'; grain.setAttribute('aria-hidden', 'true');
    grain.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
    hub.prepend(grain);
  }

  /* ============ 9 · Cuore dei preferiti (Pulse Heart) ============ */
  doc.addEventListener('click', e => {
    const b = e.target.closest('.ac-pdp-fav'); if (!b) return;
    if (!b.querySelector('.mm-heart-fx')) b.insertAdjacentHTML('afterbegin', '<span class="mm-heart-fx" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><b></b></span>');
    b.classList.remove('mm-beat');
    if (b.getAttribute('aria-pressed') === 'true' && !reduce) { void b.offsetWidth; b.classList.add('mm-beat'); }
  });

  /* ============ 10 · Adesivo che si stacca (Sticker Peel) — CUSTOM ============ */
  onRoom('moi-showroom-custom', room => {
    const stage = $('.moi-room-stage', room); if (!stage || stage.querySelector('.mm-sticker-stage')) return;
    const box = doc.createElement('div'); box.className = 'mm-sticker-stage'; stage.append(box); stage.classList.add('mm-has-sticker');
    box.insertAdjacentHTML('beforeend', '<span class="mm-sticker-hint">PASSA SOPRA · TRASCINALO</span>');
    const start = () => {
      const holder = doc.createElement('div'); box.append(holder);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="340" viewBox="0 0 520 340"><rect x="6" y="6" width="508" height="328" rx="58" fill="#ffffff"/><rect x="22" y="22" width="476" height="296" rx="44" fill="#0e0e0f"/><g transform="translate(110 112)" fill="none" stroke="#d6bd8e" stroke-width="5" stroke-linecap="square"><path d="M4 34V9l17 18L38 9v25 M107 9v25 M171 9v25h25 M213 34l14-25 14 25 M261 9v25h15c16 0 16-13 0-13h-15m0-12h14c14 0 14 12 0 12"/><ellipse cx="73" cy="21.5" rx="14" ry="13"/></g><text x="260" y="228" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="22" letter-spacing="9" fill="#f3efe7">STICKER</text><circle cx="260" cy="268" r="4" fill="#d6bd8e"/></svg>`;
      try { window.stickerPeel(holder, { imageSrc: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), width: Math.min(260, box.clientWidth * .62), rotate: -7, initialPosition: { x: 0, y: -18 }, peelBackHoverPct: 30, peelBackActivePct: 45, curlRadius: 16, backColor: '#e8e6e1', lightingIntensity: .6, shadowIntensity: .55, intro: !reduce }); stage.classList.add('mm-sticker-ready'); }
      catch { box.remove(); stage.classList.remove('mm-has-sticker'); }
    };
    if (window.stickerPeel) return start();
    const s = doc.createElement('script'); s.src = '/assets/sticker-peel.js?v=20261026-1'; s.onload = start; s.onerror = () => { box.remove(); stage.classList.remove('mm-has-sticker'); }; doc.head.append(s);
  });

  /* ============ 11 · Configuratore automotive a passi (Stepper) ============ */
  const wiz = $('#moi-auto-form');
  if (wiz) {
    let lastStep = 0, lastW = '';
    const enhance = () => {
      const bar = $('[role=progressbar]', wiz); if (!bar) return;
      const step = +bar.getAttribute('aria-valuenow') || 1, fill = $('span', bar), form = $('form', wiz);
      if (form && !form.dataset.mm) { form.dataset.mm = '1'; form.classList.add(step < lastStep ? 'mm-step-back' : 'mm-step-fwd'); }
      if (fill && !fill.dataset.mm && !reduce) { fill.dataset.mm = '1'; const to = fill.style.width; if (lastW && lastW !== to) { fill.style.width = lastW; requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = to; })); } lastW = to; }
      lastStep = step;
    };
    new MutationObserver(enhance).observe(wiz, { childList: true, subtree: true }); enhance();
  }

  /* ============ 12 · Riflesso sulle foto automotive (Glare Hover) ============ */
  onRoom('moi-showroom-automotive', room => {
    $$('#moi-auto-comparison, .ma-gallery figure, .ma-gallery .ma-shot', room).forEach(el => {
      if (el.classList.contains('mm-glare')) return;
      el.classList.add('mm-glare');
      if (!fine && !reduce) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { el.classList.add('mm-glare-play'); setTimeout(() => el.classList.remove('mm-glare-play'), 1100); io.disconnect(); } }, { threshold: .5 }); io.observe(el); }
    });
  });

  /* ============ 13 · Insegna che si accende (neon) — SIGNAGE ============ */
  onRoom('moi-showroom-signage', room => {
    const t = $('.moi-room-title', room); if (!t || reduce) return;
    t.classList.remove('mm-neon'); void t.offsetWidth; setTimeout(() => t.classList.add('mm-neon'), 350);
  });

  /* ============ 14 · Titolo che reagisce al mouse (Variable Proximity) — DESIGN ============ */
  onRoom('moi-showroom-design', room => {
    const t = $('.moi-room-title', room); if (!t || t.dataset.mmVp || reduce) return;
    t.dataset.mmVp = '1';
    if (!doc.getElementById('mm-inter')) { const l = doc.createElement('link'); l.id = 'mm-inter'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@200..900&display=swap'; doc.head.append(l); }
    t.classList.add('mm-vp');
    let letters = [], raf = 0, px = -1e4, py = -1e4;
    // door.js riscrive il titolo a ogni apertura: lo ri-divido in lettere quando cambia
    const mo = new MutationObserver(() => split());
    function split() {
      if (t.querySelector(':scope > span[data-mm]') && !t.querySelector(':scope > :not(span)') && ![...t.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
      mo.disconnect();
      const text = t.textContent; t.setAttribute('aria-label', text);
      t.innerHTML = [...text].map(c => c === ' ' ? ' ' : `<span data-mm aria-hidden="true">${c}</span>`).join('');
      letters = $$('span', t); paint();
      mo.observe(t, { childList: true, characterData: true, subtree: true });
    }
    function paint() { raf = 0; const R = Math.max(150, t.getBoundingClientRect().height * 2.2); letters.forEach(l => { const r = l.getBoundingClientRect(), d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2)), k = Math.max(0, 1 - d / R), e = k * k * (3 - 2 * k), w = Math.round(500 + 400 * e); l.style.fontVariationSettings = `"wght" ${w}`; l.style.fontWeight = w; }); }
    split();
    room.addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    room.addEventListener('pointerleave', () => { px = py = -1e4; if (!raf) raf = requestAnimationFrame(paint); });
  });

  /* ============ 15 · Titolo digital che si decodifica (Decrypted Text) ============ */
  onRoom('moi-showroom-digital', room => {
    const t = $('.moi-room-title', room); if (!t || reduce) return;
    if (!t.dataset.mmText) { t.dataset.mmText = t.innerHTML; t.setAttribute('aria-label', t.textContent); }
    const html = t.dataset.mmText, parts = html.split(/<br\s*\/?>/i), finalTxt = parts.map(p => p.replace(/<[^>]+>/g, ''));
    const total = finalTxt.join('').length, CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$/*+=';
    clearInterval(t._mm); let frame = 0;
    setTimeout(() => {
      t._mm = setInterval(() => {
        frame++; const shown = Math.floor(frame / 1.5); let k = 0;
        t.innerHTML = finalTxt.map(line => [...line].map(c => { const idx = k++; return c === ' ' || idx < shown ? c.replace(/&/g, '&amp;').replace(/</g, '&lt;') : `<span class="mm-enc" aria-hidden="true">${CH[Math.random() * CH.length | 0]}</span>`; }).join('')).join('<br>');
        if (shown >= total) { clearInterval(t._mm); t.innerHTML = html; }
      }, 40);
    }, 450);
  });

  /* ============ 16 · Card dei servizi digital a pixel (Pixel Transition) ============ */
  const DESC = { 'Siti web': 'Vetrine veloci, pensate per farti trovare.', 'Applicazioni': 'Strumenti su misura per il tuo lavoro.', 'E-commerce': 'Vendi online, 24 ore su 24.', 'Automazioni': 'Il lavoro ripetitivo lo fa il software.' };
  $$('#moi-showroom-digital [data-digital-service]').forEach(card => {
    const name = card.dataset.digitalService, N = 9;
    card.classList.add('mm-px');
    card.insertAdjacentHTML('beforeend', `<span class="mm-px-back" aria-hidden="true"><strong>${name}</strong><small>${DESC[name] || ''}</small><em>Scopri →</em></span><span class="mm-px-grid" aria-hidden="true" style="grid-template-columns:repeat(${N},1fr)">${'<i></i>'.repeat(N * N)}</span>`);
    const cells = $$('.mm-px-grid i', card); let on = false, timer = 0, run = 0;
    const go = target => {
      if (on === target) return; on = target; clearTimeout(timer); const id = ++run;
      if (reduce) { card.classList.toggle('mm-px-on', target); return; }
      const order = cells.map(c => [c, Math.random()]).sort((a, b) => a[1] - b[1]).map(x => x[0]), step = 180 / order.length;
      order.forEach((c, i) => setTimeout(() => { if (id === run) c.style.opacity = 1; }, i * step));
      timer = setTimeout(() => { card.classList.toggle('mm-px-on', target); order.forEach((c, i) => setTimeout(() => { if (id === run) c.style.opacity = 0; }, i * step)); }, 210);
    };
    card.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') go(true); });
    card.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') go(false); });
    card.addEventListener('focus', () => { if (card.matches(':focus-visible')) go(true); });
    card.addEventListener('blur', () => go(false));
  });

  /* ============ 17 · Scintille pixel al clic (Click Spark) — DIGITAL ============ */
  const digital = $('#moi-showroom-digital');
  if (digital && !reduce) {
    const cv = doc.createElement('canvas'); cv.className = 'mm-spark'; cv.setAttribute('aria-hidden', 'true'); doc.body.append(cv);
    const ctx = cv.getContext('2d'); let sparks = [], raf = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    const COLS = ['#ff5a5f', '#ffd166', '#2f6f5e', '#1d1d1b'];
    const draw = t => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      sparks = sparks.filter(s => { const p = (t - s.t) / 420; if (p >= 1) return false; const e = p * (2 - p), d = 6 + e * 30, x = s.x + Math.cos(s.a) * d, y = s.y + Math.sin(s.a) * d; ctx.fillStyle = s.c; ctx.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 4, 4); if (p < .55) ctx.fillRect(Math.round((x - Math.cos(s.a) * 8) / 3) * 3, Math.round((y - Math.sin(s.a) * 8) / 3) * 3, 3, 3); return true; });
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };
    digital.addEventListener('pointerdown', e => {
      if (!e.target.closest('button, a, [role=button]')) return;
      const t = performance.now(); for (let i = 0; i < 10; i++) sparks.push({ x: e.clientX, y: e.clientY, a: i / 10 * Math.PI * 2, t, c: COLS[i % 4] });
      cv.classList.add('on'); if (!raf) raf = requestAnimationFrame(draw);
    });
  }

  /* ============ 18 · "Tieni premuto" — prova nella pagina Digital ============ */
  const services = $('#moi-showroom-digital .md-services');
  if (services && !$('.mm-try', services)) {
    services.insertAdjacentHTML('beforeend', `<div class="mm-try"><div><p class="mm-try-k">PROVALO</p><p class="mm-try-t">Ogni dettaglio conta.<br><span>Anche un pulsante.</span></p></div><div class="mm-try-act"><button type="button" class="mm-hold">Tieni premuto</button><p class="mm-hold-hint" aria-live="polite"></p></div></div>`);
    holdButton($('.mm-hold', services), { hold: 1600, done: '✓ Così curiamo i tuoi progetti', hint: $('.mm-hold-hint', services) });
  }

  function holdButton(btn, o) {
    const label = btn.innerHTML, labels = `<span class="mm-hb-idle">${label}</span><span class="mm-hb-done" aria-hidden="true">${o.done}</span>`;
    btn.classList.add('mm-hb'); btn.dataset.phase = 'idle'; btn.setAttribute('aria-description', `Tieni premuto ${o.hold / 1000} secondi`);
    btn.style.setProperty('--hb-hold', o.hold + 'ms'); btn.style.setProperty('--hb-cycles', o.hold / 1100);
    btn.innerHTML = `<span class="mm-hb-label">${labels}</span><span class="mm-hb-clip" aria-hidden="true"><span class="mm-hb-fill"><span class="mm-hb-label">${labels}</span></span><span class="mm-hb-crest"><span class="mm-hb-label">${labels}</span></span></span>`;
    let phase = 'idle', pid = null, start = 0, raf = 0, p = 0;
    const set = v => { p = v; btn.style.setProperty('--hb-p', v.toFixed(4)); };
    const say = m => { if (o.hint) o.hint.textContent = m; };
    const anim = (to, dur, lin) => { cancelAnimationFrame(raf); const from = p, t0 = performance.now(); const st = t => { const k = dur ? Math.min(1, (t - t0) / dur) : 1; set(from + (to - from) * (lin ? k : 1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(st); else if (to === 1 && phase === 'holding') { phase = 'done'; btn.dataset.phase = 'done'; say(''); setTimeout(() => { phase = 'idle'; btn.dataset.phase = 'idle'; anim(0, 220); }, 1600); } }; raf = requestAnimationFrame(st); };
    const begin = () => { if (phase !== 'idle') return false; start = performance.now(); phase = 'holding'; btn.dataset.phase = 'holding'; say(''); anim(1, o.hold * (1 - p), true); return true; };
    const end = drift => { if (phase !== 'holding') return; const held = performance.now() - start; phase = 'idle'; btn.dataset.phase = 'idle'; anim(0, 200); if (!drift) { say(held < 250 ? 'Tieni premuto finché non si riempie' : 'Lasciato prima: non è successo niente'); if (held < 250 && !reduce) { btn.classList.remove('mm-nudge'); void btn.offsetWidth; btn.classList.add('mm-nudge'); navigator.vibrate?.(12); } } };
    const m = () => { btn.style.setProperty('--hb-w', btn.offsetWidth + 'px'); btn.style.setProperty('--hb-h', btn.offsetHeight + 'px'); }; m(); new ResizeObserver(m).observe(btn);
    btn.addEventListener('pointerdown', e => { if (e.button || pid !== null || !begin()) return; pid = e.pointerId; try { btn.setPointerCapture(pid); } catch {} });
    btn.addEventListener('pointerup', e => { if (e.pointerId !== pid) return; pid = null; end(false); });
    btn.addEventListener('pointercancel', e => { if (e.pointerId !== pid) return; pid = null; end(true); });
    btn.addEventListener('lostpointercapture', e => { if (e.pointerId !== pid) return; pid = null; end(true); });
    btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); begin(); } });
    btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); end(false); } });
    btn.addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('blur', () => end(true));
  }
})();
