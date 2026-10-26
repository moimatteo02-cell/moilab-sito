/* MOI LAB — animazioni, terzo giro (idee da React Bits, Magic UI, Codrops, Uiverse; riscritte in JavaScript semplice).
   A5 prova il tuo logo · A1 colore dai pallini · S1 prova la tua insegna · M1 pellicola sull'auto
   G3 WhatsApp · H2 monolite vivo · H3 scritta che corre · X1 terminale */
(() => {
  'use strict';
  const doc = document, root = doc.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = doc) => r.querySelector(s), $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const WA = '393278815148';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const onView = (el, fn, t = .35) => { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: t }); io.observe(el); };
  const onRoom = (id, fn) => { const room = doc.getElementById(id); if (!room) return; let was = false; const check = () => { const now = room.classList.contains('is-active'); if (now && !was) fn(room); was = now; }; new MutationObserver(check).observe(room, { attributes: true, attributeFilter: ['class'] }); check(); };
  const TEE = '<svg viewBox="0 0 240 230" aria-hidden="true"><path class="mm-tee-body" fill="#f4f4f2" stroke="#0000001f" stroke-width="1.5" d="M82 18q10 22 38 22t38-22l52 24-18 44-22-10v128H70V76L48 86 30 42Z"/><path fill="none" stroke="#0000001a" stroke-width="1.5" d="M82 18q10 22 38 22t38-22"/></svg>';

  /* ============ G3 · WhatsApp che "respira" (tutte le pagine) ============ */
  const wa = doc.createElement('div');
  wa.className = 'mm-wa';
  wa.innerHTML = `<span class="mm-wa-tip" role="status">Hai una domanda? Scrivici</span><a class="mm-wa-btn" href="https://wa.me/${WA}?text=${encodeURIComponent('Ciao MOI LAB, vorrei un\'informazione: ')}" target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2l-.6-.3Z"/></svg></a>`;
  doc.body.append(wa);
  let tipShown = false; try { tipShown = sessionStorage.getItem('mm-wa-tip') === '1'; } catch {}
  if (!tipShown) setTimeout(() => { if (root.classList.contains('moi-loading')) return; wa.classList.add('is-tip'); try { sessionStorage.setItem('mm-wa-tip', '1'); } catch {} setTimeout(() => wa.classList.remove('is-tip'), 5000); }, 9000);
  if (fine) { wa.addEventListener('mouseenter', () => wa.classList.add('is-tip')); wa.addEventListener('mouseleave', () => wa.classList.remove('is-tip')); }

  /* ============ H2 · Il monolite "M" che vive (home) ============ */
  const hero = $('#moi-lab-hub .mlg-hero'), mono = hero && $('.mlg-monolith', hero);
  if (hero && mono && !reduce) {
    const cv = doc.createElement('canvas'); cv.className = 'mm-dust'; cv.setAttribute('aria-hidden', 'true'); hero.prepend(cv);
    const ctx = cv.getContext('2d'); let parts = [], vis = true, W = 0, H = 0;
    const size = () => { const r = hero.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); parts = Array.from({ length: Math.round(W / 28) }, () => ({ x: W * (.45 + Math.random() * .55), y: Math.random() * H, r: Math.random() * 1.4 + .4, v: Math.random() * .22 + .06, a: Math.random() })); };
    size(); addEventListener('resize', size);
    new IntersectionObserver(es => vis = es[0].isIntersecting).observe(hero);
    const loop = () => {
      if (vis && !doc.hidden) { ctx.clearRect(0, 0, W, H); parts.forEach(p => { p.y -= p.v; p.x += Math.sin((p.y + p.a * 100) / 50) * .12; if (p.y < -5) { p.y = H + 5; p.x = W * (.45 + Math.random() * .55); } ctx.globalAlpha = .18 + .45 * Math.sin(p.y / 40 + p.a * 6) ** 2; ctx.fillStyle = '#d6bd8e'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    if (fine) {
      let raf = 0, nx = 0, ny = 0;
      const paint = () => { raf = 0; mono.style.translate = `${(nx * 14).toFixed(1)}px ${(ny * 10).toFixed(1)}px`; mono.style.setProperty('--mm-lx', (50 + nx * 60).toFixed(0) + '%'); mono.style.setProperty('--mm-ly', (35 + ny * 50).toFixed(0) + '%'); };
      hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); nx = (e.clientX - r.left) / r.width - .5; ny = (e.clientY - r.top) / r.height - .5; if (!raf) raf = requestAnimationFrame(paint); });
      hero.addEventListener('pointerleave', () => { nx = ny = 0; if (!raf) raf = requestAnimationFrame(paint); });
      mono.classList.add('mm-mono');
    }
  }

  /* ============ H3 · Scritta gigante che corre con lo scroll (home) ============ */
  const grid = $('#moi-lab-hub #servizi');
  if (grid) {
    grid.insertAdjacentHTML('beforebegin', `<div class="mm-vel" aria-hidden="true"><div class="mm-vel-row" data-dir="1"><span>CREATIVE SOLUTIONS · <em>for real business</em> · CREATIVE SOLUTIONS · <em>for real business</em> · </span></div><div class="mm-vel-row mm-vel-o" data-dir="-1"><span>APPAREL · CUSTOM · AUTOMOTIVE · SIGNAGE · DESIGN · DIGITAL · APPAREL · CUSTOM · AUTOMOTIVE · SIGNAGE · DESIGN · DIGITAL · </span></div></div>`);
    const box = grid.previousElementSibling, rows = $$('.mm-vel-row', box);
    rows.forEach(r => { const s = r.firstElementChild; s.innerHTML += s.innerHTML; });
    let last = scrollY, vel = 0, off = rows.map(() => 0), lt = performance.now(), vis = false;
    new IntersectionObserver(es => vis = es[0].isIntersecting).observe(box);
    const loop = t => {
      const dt = Math.min(64, t - lt) / 16; lt = t; const d = scrollY - last; last = scrollY; vel += (d - vel) * .1;
      if (vis && !reduce) rows.forEach((r, i) => { const s = r.firstElementChild, w = s.scrollWidth / 2, dir = +r.dataset.dir; off[i] -= dir * (.5 + Math.min(Math.abs(vel), 60) * .4) * dt; if (off[i] < -w) off[i] += w; if (off[i] > 0) off[i] -= w; s.style.transform = `translate3d(${off[i].toFixed(1)}px,0,0)`; });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ============ A5 · Prova il tuo logo sul capo (catalogo) ============ */
  const COLS = [['Bianco', '#f4f4f2'], ['Nero', '#1a1a1a'], ['Blu navy', '#1f2b4d'], ['Rosso', '#c0272d'], ['Verde bottiglia', '#1f4d3a'], ['Grigio', '#9a9a9a']];
  const DARK = ['#1a1a1a', '#1f2b4d', '#1f4d3a', '#c0272d'];
  let ltState = { text: '', img: '', col: 0 };
  window.MOI_LOGO_TRY_HTML = () => `<section class="mm-lt" data-mm-lt aria-label="Prova il tuo logo">
    <div class="mm-lt-pic">${TEE}<div class="mm-lt-print"></div></div>
    <div class="mm-lt-form"><p class="mm-lt-k">PROVALO SUBITO</p><h3>Prova il tuo logo sul capo</h3>
      <input type="text" maxlength="24" placeholder="Scrivi il nome della tua azienda" aria-label="Nome della tua azienda">
      <label class="mm-lt-up"><input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp">⬆ oppure carica il tuo logo</label>
      <div class="mm-lt-dots" role="group" aria-label="Colore del capo">${COLS.map(([n, c], i) => `<button type="button" style="background:${c}" aria-label="${n}" aria-pressed="${i === 0}" data-i="${i}"></button>`).join('')}</div>
      <small>Anteprima indicativa: il file resta sul tuo dispositivo, non viene caricato da nessuna parte.</small>
      <button type="button" class="mm-lt-cta" data-br-all>Scegli il capo da personalizzare →</button></div></section>`;
  const ltPaint = (box, animate) => {
    const pr = $('.mm-lt-print', box), col = COLS[ltState.col][1];
    $('.mm-tee-body', box).style.fill = col;
    $$('.mm-lt-dots button', box).forEach((b, i) => b.setAttribute('aria-pressed', String(i === ltState.col)));
    const ink = DARK.includes(col) ? '#f3efe7' : '#151515';
    const html = ltState.img ? `<img src="${ltState.img}" alt="Il tuo logo">` : `<span style="color:${ink}">${esc(ltState.text || 'LA TUA AZIENDA')}</span>`;
    if (pr.innerHTML !== html) { pr.innerHTML = html; if (animate && !reduce) { pr.classList.remove('is-on'); void pr.offsetWidth; } }
    pr.classList.add('is-on');
  };
  const ltInit = box => { if (box.dataset.ready) return; box.dataset.ready = '1'; const inp = $('input[type=text]', box); inp.value = ltState.text; ltPaint(box, false); };
  new MutationObserver(() => $$('[data-mm-lt]').forEach(ltInit)).observe(doc.body, { childList: true, subtree: true });
  $$('[data-mm-lt]').forEach(ltInit);
  let ltT = 0;
  doc.addEventListener('input', e => { const box = e.target.closest('[data-mm-lt]'); if (!box || e.target.type !== 'text') return; clearTimeout(ltT); ltT = setTimeout(() => { ltState.text = e.target.value.trim(); ltState.img = ''; ltPaint(box, true); }, 250); });
  doc.addEventListener('change', e => { const box = e.target.closest('[data-mm-lt]'); if (!box || e.target.type !== 'file') return; const f = e.target.files[0]; if (!f) return; if (ltState.img) URL.revokeObjectURL(ltState.img); ltState.img = URL.createObjectURL(f); ltPaint(box, true); });
  doc.addEventListener('click', e => { const b = e.target.closest('[data-mm-lt] .mm-lt-dots button'); if (!b) return; ltState.col = +b.dataset.i; ltPaint(b.closest('[data-mm-lt]'), false); });

  /* ============ A1 · La foto cambia colore passando sui pallini (catalogo, solo mouse) ============ */
  if (fine) {
    const cache = new Map();
    const product = sku => { if (!cache.has(sku)) cache.set(sku, fetch('/data/apparel/prodotti/' + encodeURIComponent(sku) + '.json').then(r => r.ok ? r.json() : null).then(d => d?.product || null).catch(() => null)); return cache.get(sku); };
    const norm = h => String(h || '').trim().toLowerCase();
    doc.addEventListener('pointerover', async e => {
      const dot = e.target.closest('#moi-apparel-catalog .br-pc-dots i[data-hx]'); if (!dot) return;
      const card = dot.closest('.ac-product'), img = card && $('.ac-model-photo', card); if (!img) return;
      if (!img.dataset.mmOrig) img.dataset.mmOrig = img.getAttribute('src');
      $$('.br-pc-dots i', card).forEach(i => i.classList.toggle('is-on', i === dot));
      const p = await product(card.dataset.sku); if (!p) return;
      const c = (p.colori || []).find(c => norm(c.hex) === norm(dot.dataset.hx)); const src = c && ((c.foto && c.foto[0]) || c.immagine);
      if (!src || !dot.classList.contains('is-on')) return;
      const pre = new Image(); pre.onload = () => { if (!dot.classList.contains('is-on')) return; img.classList.add('mm-swap'); setTimeout(() => { img.src = src; img.classList.remove('mm-swap'); }, 160); }; pre.src = src;
    });
    doc.addEventListener('pointerout', e => {
      const dots = e.target.closest('#moi-apparel-catalog .br-pc-dots'); if (!dots || dots.contains(e.relatedTarget)) return;
      const card = dots.closest('.ac-product'), img = card && $('.ac-model-photo', card); if (!img?.dataset.mmOrig) return;
      $$('.br-pc-dots i', card).forEach(i => i.classList.remove('is-on'));
      if (img.getAttribute('src') !== img.dataset.mmOrig) { img.classList.add('mm-swap'); setTimeout(() => { img.src = img.dataset.mmOrig; img.classList.remove('mm-swap'); }, 160); }
    });
  }

  /* ============ S1 · Prova la tua insegna al neon (Signage) ============ */
  const sign = $('#moi-showroom-signage');
  if (sign) {
    const after = $('.moi-room-content', sign);
    after.insertAdjacentHTML('afterend', `<section class="mm-sign" aria-label="Prova la tua insegna">
      <div class="mm-sign-head"><p class="mm-sign-k">MOI LAB / SIGNAGE / PROVALO</p><h2>Prova la tua <em>insegna.</em></h2><p>Scrivi il nome della tua attività e scegli la luce: ecco come potrebbe apparire.</p></div>
      <div class="mm-sign-wall"><div class="mm-sign-out" aria-live="polite">IL TUO NOME</div></div>
      <div class="mm-sign-ctl"><input type="text" maxlength="22" placeholder="Nome della tua attività" aria-label="Nome della tua attività">
        <div class="mm-sign-cols" role="group" aria-label="Colore della luce"><button type="button" aria-pressed="true" data-c="">Caldo</button><button type="button" aria-pressed="false" data-c="mm-c-bianco">Bianco</button><button type="button" aria-pressed="false" data-c="mm-c-blu">Blu</button><button type="button" aria-pressed="false" data-c="mm-c-rosa">Rosa</button></div>
        <a class="mm-sign-cta" target="_blank" rel="noopener" href="#">Chiedi un preventivo per questa insegna ↗</a></div>
      <small class="mm-sign-note">Anteprima indicativa: forma, materiali e dimensioni li definiamo insieme.</small></section>`);
    const box = $('.mm-sign', sign), out = $('.mm-sign-out', box), inp = $('input', box), cta = $('.mm-sign-cta', box), bs = $$('.mm-sign-cols button', box);
    let colName = 'Caldo';
    const link = () => { cta.href = `https://wa.me/${WA}?text=${encodeURIComponent(`Ciao MOI LAB, vorrei un preventivo per un'insegna luminosa con la scritta "${out.textContent}" (luce: ${colName}).`)}`; };
    const flick = () => { if (reduce) return; out.classList.remove('is-flick'); void out.offsetWidth; out.classList.add('is-flick'); };
    let t = 0; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { out.textContent = (inp.value.trim() || 'IL TUO NOME').toUpperCase(); link(); flick(); }, 300); });
    bs.forEach(b => b.addEventListener('click', () => { bs.forEach(x => x.setAttribute('aria-pressed', String(x === b))); out.className = 'mm-sign-out ' + b.dataset.c; colName = b.textContent; link(); flick(); }));
    link(); onView(box, flick);
  }

  /* ============ M1 · La pellicola avvolge l'auto (Automotive) ============ */
  onRoom('moi-showroom-automotive', room => {
    const stage = $('.moi-room-stage', room); if (!stage || $('.mm-car', stage)) return;
    const body = 'M30 120c0-14 6-22 20-26l46-10 40-34c10-8 20-12 34-12h80c16 0 28 6 38 16l34 30 40 8c14 3 22 12 22 26v14H30z';
    const CC = [['Verde', '#2f5a46'], ['Nero opaco', '#1b1b1b'], ['Oro', '#c8aa77'], ['Rosso', '#b3261e'], ['Blu', '#1f4e8c'], ['Bianco', '#f2f2ee']];
    stage.insertAdjacentHTML('beforeend', `<div class="mm-car"><svg viewBox="0 0 400 170" role="img" aria-label="Anteprima colore della pellicola">
      <defs><clipPath id="mm-carbody"><path d="${body}"/></clipPath><pattern id="mm-carstripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="16" height="40" fill="#ffffff26"/></pattern></defs>
      <g clip-path="url(#mm-carbody)"><rect class="mm-car-base" x="-20" y="0" width="440" height="170" fill="#e7ece8"/><rect class="mm-car-paint" x="-20" y="0" width="0" height="170"/><rect class="mm-car-sheen" x="-20" y="0" width="0" height="170" fill="url(#mm-carstripes)"/></g>
      <path class="mm-car-line" d="${body}"/><path class="mm-car-line" d="M110 84l36-30h60v30zM222 54h40c10 0 18 4 24 10l20 20h-84z"/>
      <circle cx="104" cy="134" r="22" fill="#151515"/><circle cx="104" cy="134" r="9" fill="#9aa59e"/><circle cx="300" cy="134" r="22" fill="#151515"/><circle cx="300" cy="134" r="9" fill="#9aa59e"/></svg>
      <div class="mm-car-sw" role="group" aria-label="Colore della pellicola">${CC.map(([n, c]) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="${n}" title="${n}"></button>`).join('')}</div><span class="mm-car-hint">SCEGLI IL COLORE DELLA PELLICOLA</span></div>`);
    stage.classList.add('mm-car-ready');
    const svg = $('.mm-car svg', stage), base = $('.mm-car-base', svg), paint = $('.mm-car-paint', svg), sheen = $('.mm-car-sheen', svg); let busy = false;
    const wrap = c => { if (busy) return; busy = true; paint.setAttribute('fill', c); const t0 = performance.now(), dur = reduce ? 1 : 1100;
      const step = t => { const p = Math.min(1, Math.max(0, (t - t0) / dur)), e = p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2; paint.setAttribute('width', 440 * e); sheen.setAttribute('width', 440 * e); if (p < 1) requestAnimationFrame(step); else { base.setAttribute('fill', c); paint.setAttribute('width', 0); sheen.setAttribute('width', 440); busy = false; } };
      requestAnimationFrame(step); };
    $$('.mm-car-sw button', stage).forEach(b => b.addEventListener('click', () => { $$('.mm-car-sw button', stage).forEach(x => x.setAttribute('aria-pressed', String(x === b))); wrap(b.dataset.c); }));
    onView(stage, () => setTimeout(() => wrap('#2f5a46'), 500));
  });

  /* ============ X1 · Terminale che "costruisce" il sito (Digital) ============ */
  const services = $('#moi-showroom-digital .md-services');
  if (services) {
    services.insertAdjacentHTML('beforeend', `<div class="mm-term" aria-label="Esempio: come costruiamo un sito"><div class="mm-term-bar"><i></i><i></i><i></i><span>moi-lab — terminale</span></div><pre aria-hidden="true"></pre><p class="mm-sr">Creiamo il tuo sito con grafica su misura, versione per telefono, pagine veloci e trovabili su Google, modulo contatti e WhatsApp, poi lo pubblichiamo.</p></div>`);
    const term = $('.mm-term', services), pre = $('pre', term), tryBox = $('.mm-try', services);
    if (tryBox) { const row = doc.createElement('div'); row.className = 'mm-dig-row'; term.before(row); row.append(term, tryBox); }
    const L = [['$ ', 'moi-lab crea --sito "la-tua-attività"'], ['', '<b class="ok">✓</b> grafica su misura'], ['', '<b class="ok">✓</b> versione per telefono'], ['', '<b class="ok">✓</b> pagine veloci e trovabili su Google'], ['', '<b class="ok">✓</b> modulo contatti e WhatsApp'], ['$ ', 'moi-lab pubblica'], ['', '<b class="y">★</b> online: www.la-tua-attività.it']];
    const full = L.map(([p, t]) => p + t).join('\n');
    if (reduce) pre.innerHTML = full;
    else {
      let runId = 0;
      const run = () => { const id = ++runId; let out = '', li = 0; pre.innerHTML = '<span class="cur"></span>';
        const next = () => { if (id !== runId) return; if (li >= L.length) { setTimeout(() => { if (term.isConnected && id === runId) run(); }, 5000); return; } const [p, txt] = L[li++];
          if (p) { let k = 0; const typ = setInterval(() => { if (id !== runId) return clearInterval(typ); k++; pre.innerHTML = out + p + esc(txt.slice(0, k)) + '<span class="cur"></span>'; if (k >= txt.length) { clearInterval(typ); out += p + esc(txt) + '\n'; setTimeout(next, 350); } }, 38); }
          else { out += txt + '\n'; pre.innerHTML = out + '<span class="cur"></span>'; setTimeout(next, 280); } };
        next(); };
      let started = false; new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; run(); } }).observe(term);
    }
  }
})();
