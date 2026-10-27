/* MOI LAB — animazioni, quarto giro: tutte le idee rimaste del catalogo (React Bits, Magic UI, Codrops, Uiverse), riscritte in JavaScript semplice.
   H1 bordo di luce · H4 parola che ruota · H5 pulsanti che luccicano · H6 foto a tendina · H7 card impilate (telefono)
   G1 sipario oro · G2 barra di avanzamento e torna su · G4 notifiche · G5 indicatore che scivola
   A2 vola nei preferiti · A3 prezzo che rotola · A4 selezione "gelatina"
   C1 pila di foto · S2 display LED · D1 timbro circolare · D2 parola che cambia carattere · X2 icone che si ingrandiscono · X3 lettere sullo sfondo */
(() => {
  'use strict';
  const doc = document, root = doc.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = doc) => r.querySelector(s), $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const onRoom = (id, fn) => { const room = doc.getElementById(id); if (!room) return; let was = false; const check = () => { const now = room.classList.contains('is-active'); if (now && !was) fn(room); was = now; }; new MutationObserver(check).observe(room, { attributes: true, attributeFilter: ['class'] }); check(); };
  const hub = $('#moi-lab-hub');

  /* ================= G4 · notifiche che si scorrono via ================= */
  const toastBox = doc.createElement('div'); toastBox.className = 'mm-toasts'; toastBox.setAttribute('aria-live', 'polite'); doc.body.append(toastBox);
  const toast = (title, sub = '') => {
    const t = doc.createElement('div'); t.className = 'mm-toast'; t.setAttribute('role', 'status');
    t.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg><div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
    toastBox.append(t); while (toastBox.children.length > 3) toastBox.firstElementChild.remove();
    const kill = dx => { t.classList.add('is-out'); t.style.transform = `translateX(${dx}px)`; setTimeout(() => t.remove(), 300); };
    let sx = null, id = setTimeout(() => kill(0), 3200);
    t.addEventListener('pointerdown', e => { sx = e.clientX; try { t.setPointerCapture(e.pointerId); } catch {} clearTimeout(id); });
    t.addEventListener('pointermove', e => { if (sx == null) return; const dx = e.clientX - sx; t.style.transform = `translateX(${dx}px)`; t.style.opacity = String(1 - Math.min(1, Math.abs(dx) / 220)); });
    const up = e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 80) kill(dx * 3); else { t.style.transform = ''; t.style.opacity = ''; id = setTimeout(() => kill(0), 2200); } };
    t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
  };
  window.MOI_TOAST = toast;

  /* ================= A2 · il capo vola nei preferiti + elenco preferiti ================= */
  const favs = () => { try { return JSON.parse(localStorage.getItem('moi-preferiti') || '[]'); } catch { return []; } };
  const chip = doc.createElement('button'); chip.type = 'button'; chip.className = 'mm-favchip'; chip.setAttribute('aria-label', 'I tuoi preferiti');
  chip.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg><b>0</b>';
  doc.body.append(chip);
  const drawer = doc.createElement('div'); drawer.className = 'mm-favs'; drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-label', 'I tuoi preferiti'); drawer.hidden = true; doc.body.append(drawer);
  const apparel = $('#moi-showroom-apparel');
  const syncChip = () => { const n = favs().length; $('b', chip).textContent = n; chip.classList.toggle('is-on', n > 0 && !!apparel?.classList.contains('is-active')); };
  if (apparel) new MutationObserver(syncChip).observe(apparel, { attributes: true, attributeFilter: ['class'] });
  syncChip();
  window.MOI_FAV_SYNC = syncChip;
  let list = null;
  const openDrawer = async () => {
    list ??= await fetch('/data/apparel/elenco.json?v=20261026-3').then(r => r.json()).catch(() => []);
    const ids = favs(), items = ids.map(s => list.find(p => p.sku === s)).filter(Boolean);
    drawer.innerHTML = `<div class="mm-favs-head"><strong>I tuoi preferiti</strong><button type="button" class="mm-favs-x" aria-label="Chiudi">×</button></div>${items.length ? `<ul>${items.map(p => `<li><button type="button" class="mm-favs-open" data-open="${esc(p.sku)}"><img src="${esc(p.immagine_modello_fronte || p.immagine_principale)}" alt="" loading="lazy"><span><b>${esc(p.nome)}</b><small>${esc(p.tipo)}</small></span></button><button type="button" class="mm-favs-rm" data-rm="${esc(p.sku)}" aria-label="Rimuovi ${esc(p.nome)}">×</button></li>`).join('')}</ul>` : '<p class="mm-favs-empty">Nessun capo salvato. Tocca ♡ nella scheda di un prodotto.</p>'}<a class="mm-favs-wa" target="_blank" rel="noopener" href="https://wa.me/393278815148?text=${encodeURIComponent('Ciao MOI LAB, vorrei un preventivo per questi capi: ' + items.map(p => p.nome + ' (' + p.sku + ')').join(', '))}">Chiedi un preventivo per questi capi ↗</a>`;
    drawer.hidden = false; requestAnimationFrame(() => drawer.classList.add('is-open')); $('.mm-favs-x', drawer).focus();
  };
  const closeDrawer = () => { drawer.classList.remove('is-open'); setTimeout(() => { drawer.hidden = true; }, 300); };
  chip.addEventListener('click', openDrawer);
  drawer.addEventListener('click', e => {
    if (e.target.closest('.mm-favs-x')) return closeDrawer();
    const rm = e.target.closest('[data-rm]'); if (rm) { const f = favs().filter(x => x !== rm.dataset.rm); try { localStorage.setItem('moi-preferiti', JSON.stringify(f)); } catch {} syncChip(); openDrawer(); return; }
    const op = e.target.closest('[data-open]'); if (op) { closeDrawer(); const mount = $('#moi-apparel-catalog'); if (!mount) return; const b = doc.createElement('button'); b.type = 'button'; b.dataset.sku = op.dataset.open; b.hidden = true; mount.append(b); b.click(); b.remove(); }
  });
  doc.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) closeDrawer(); });
  doc.addEventListener('click', e => {
    const b = e.target.closest('.ac-pdp-fav'); if (!b) return;
    setTimeout(() => {
      const on = b.getAttribute('aria-pressed') === 'true', name = $('.ac-pdp h2, .ac-pdp-title')?.textContent?.trim() || '';
      syncChip(); chip.classList.add('is-on');
      toast(on ? 'Salvato nei preferiti' : 'Rimosso dai preferiti', name);
      if (!on || reduce) { if (!favs().length) chip.classList.remove('is-on'); return; }
      const src = $('.ac-pdp-stage .ac-main img, .ac-pdp-stage .ac-main video'), a = (src || b).getBoundingClientRect(), c = chip.getBoundingClientRect();
      const fl = doc.createElement('div'); fl.className = 'mm-flyer';
      const im = $('.ac-pdp .ac-thumbs img'); if (im) fl.style.backgroundImage = `url("${im.src}")`;
      const w = Math.min(a.width, 160), h = w * 1.25; Object.assign(fl.style, { left: a.left + a.width / 2 - w / 2 + 'px', top: a.top + a.height / 2 - h / 2 + 'px', width: w + 'px', height: h + 'px' }); doc.body.append(fl);
      const dx = c.left + c.width / 2 - (a.left + a.width / 2), dy = c.top + c.height / 2 - (a.top + a.height / 2);
      fl.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx * .5}px,${dy * .5 - 90}px) scale(.55)`, opacity: 1, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(.1)`, opacity: .3 }], { duration: 780, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { fl.remove(); chip.classList.remove('is-bump'); void chip.offsetWidth; chip.classList.add('is-bump'); };
    }, 30);
  });

  /* ================= A3 · prezzo che rotola ================= */
  const rollers = new WeakMap();
  const STRIP = '<span>' + '012345678901234567890123456789'.split('').map(d => `<i>${d}</i>`).join('') + '</span>';
  // slot machine: ogni cifra che cambia gira per un giro intero e si ferma sulla nuova, una dopo l'altra
  const spin = (s, from, to, k) => {
    if (from === to) { if (s.dataset.at !== to) { s.dataset.at = to; s.style.transition = 'none'; s.style.transform = `translateY(${-(20 + +to)}em)`; } return; }   // cifra uguale: resta ferma
    s.dataset.at = to;
    if (reduce) { s.style.transition = 'none'; s.style.transform = `translateY(${-(20 + +to)}em)`; return; }
    s.style.transition = 'none'; s.style.transform = `translateY(${-(+from)}em)`;
    requestAnimationFrame(() => requestAnimationFrame(() => { s.style.transition = ''; s.style.transitionDelay = (k * 70) + 'ms'; s.style.transform = `translateY(${-(20 + +to)}em)`; }));
  };
  const roll = (el, text, given) => {
    const prev = given ?? rollers.get(el) ?? '';
    const mo = el._mmMo; mo?.disconnect();
    el.setAttribute('aria-label', text);
    const prevDigits = prev.replace(/\D/g, ''), digits = text.replace(/\D/g, '');
    if (prev.replace(/\d/g, '0') !== text.replace(/\d/g, '0') || !el.querySelector('.mm-dg')) {
      el.innerHTML = [...text].map(c => /\d/.test(c) ? `<span class="mm-dg" aria-hidden="true">${STRIP}</span>` : `<span class="mm-ch" aria-hidden="true">${esc(c)}</span>`).join('');
    }
    let sr = el.querySelector(':scope > .mm-sr'); if (!sr) { sr = doc.createElement('span'); sr.className = 'mm-sr'; el.append(sr); } sr.textContent = text;   // testo vero per i lettori di schermo
    const ds = $$('.mm-dg > span', el), n = ds.length;
    ds.forEach((s, k) => spin(s, prevDigits[k - n + prevDigits.length] ?? (prev ? '0' : digits[k]), digits[k], n - 1 - k));
    if (prev && prev !== text && !reduce) { el.classList.remove('mm-pop'); void el.offsetWidth; el.classList.add('mm-pop'); }
    rollers.set(el, text);
    mo?.observe(el, { childList: true, characterData: true, subtree: true });
  };
  window.MOI_ROLL = roll;
  const watchPrice = el => {
    if (el._mmMo) return;
    const mo = new MutationObserver(() => { const t = el.textContent; if (el.querySelector('.mm-dg') && !el.querySelector(':scope > :not(.mm-dg):not(.mm-ch):not(.mm-sr)') && [...el.childNodes].every(n => n.nodeType === 1)) return; roll(el, t); });
    el._mmMo = mo; rollers.set(el, el.textContent); roll(el, el.textContent);
  };
  new MutationObserver(() => $$('.ac-pdp [data-unit-price], .ac-pdp [data-price], .ac-pdp [data-custom-price]').forEach(watchPrice)).observe(doc.body, { childList: true, subtree: true });

  /* ================= A4 · selezione "gelatina" (taglie e senza/con stampa) ================= */
  const jelly = box => {
    if (box.querySelector(':scope > .mm-blob')) return;
    const blob = doc.createElement('span'); blob.className = 'mm-blob'; blob.setAttribute('aria-hidden', 'true'); box.prepend(blob); box.classList.add('mm-jelly');
    let first = true;
    const place = () => { const b = box.querySelector('button[aria-pressed=true]'); if (!b) { blob.style.opacity = 0; return; } blob.style.opacity = 1; Object.assign(blob.style, { left: b.offsetLeft + 'px', top: b.offsetTop + 'px', width: b.offsetWidth + 'px', height: b.offsetHeight + 'px' }); if (!first && !reduce) { blob.classList.remove('is-squish'); void blob.offsetWidth; blob.classList.add('is-squish'); } first = false; };
    new MutationObserver(place).observe(box, { attributes: true, subtree: true, attributeFilter: ['aria-pressed'] });
    new ResizeObserver(() => { const f = first; first = true; place(); first = f; }).observe(box);
    blob.style.transition = 'none'; place(); requestAnimationFrame(() => { blob.style.transition = ''; });
  };
  new MutationObserver(() => $$('.ac-pdp .ac-pdp-sizes, .ac-pdp .ac-pdp-toggle').forEach(jelly)).observe(doc.body, { childList: true, subtree: true });

  /* ================= H1 · bordo di luce oro sulle card dei servizi ================= */
  if (hub) {
    const cards = $$('.mlg-card', hub);
    cards.forEach(c => c.insertAdjacentHTML('beforeend', '<span class="mm-beam" aria-hidden="true"></span>'));
    if (!fine) { const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('mm-beam-on', e.isIntersecting)), { rootMargin: '-40% 0px -40% 0px' }); cards.forEach(c => io.observe(c)); }
  }

  /* ================= H4 · l'ultima parola del titolo ruota ================= */
  const title = hub && $('.mlg-title', hub);
  if (title && !reduce) {
    const last = [...title.querySelectorAll('em')].pop();
    if (last) {
      const start = () => {
        if (!title.getAttribute('aria-label')) title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
        const words = ['diventare.', 'vendere.', 'mostrare.', 'raccontare.'];
        last.innerHTML = `<span class="mm-rot" aria-hidden="true">${words.map((w, i) => `<span class="${i ? '' : 'is-on'}">${w}</span>`).join('')}</span>`;
        const sp = $$('.mm-rot span', last); let i = 0;
        setInterval(() => { if (doc.hidden) return; const a = sp[i]; i = (i + 1) % sp.length; const b = sp[i]; a.classList.remove('is-on'); a.classList.add('is-out'); b.classList.remove('is-out'); b.classList.add('is-on'); setTimeout(() => a.classList.remove('is-out'), 700); }, 2600);
      };
      const wait = () => root.classList.contains('moi-loading') ? setTimeout(wait, 300) : setTimeout(start, 2400);
      wait();
    }
  }

  /* ================= H6 · foto delle card che si svelano a tendina ================= */
  if (hub && !reduce) {
    // osservo la card (non la foto: una foto ritagliata a zero non risulta "visibile")
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.querySelector('.mlg-photo-stage')?.classList.add('mm-clip-in'); io.unobserve(e.target); } }), { threshold: .25 });
    $$('.mlg-photo-stage', hub).forEach((s, i) => { s.classList.add('mm-clip'); s.style.setProperty('--mm-d', (i % 2) * 120 + 'ms'); const card = s.closest('.mlg-card'); if (card) io.observe(card); else s.classList.add('mm-clip-in'); });
  }

  /* ================= H7 · card dei servizi che si impilano (solo telefono) ================= */
  const grid = hub && $('#servizi', hub);
  if (grid && !reduce) {
    const mq = matchMedia('(max-width: 760px)'), wraps = $$('.mlg-card-wrap', grid);
    let raf = 0;
    const paint = () => { raf = 0; if (!mq.matches) return; wraps.forEach((w, i) => { const next = wraps[i + 1], card = $('.mlg-card', w); if (!next || !card) return; const d = next.getBoundingClientRect().top - w.getBoundingClientRect().top; const p = Math.max(0, Math.min(1, 1 - d / (w.offsetHeight + 24))); card.style.transform = p ? `scale(${(1 - p * .07).toFixed(3)})` : ''; card.style.filter = p ? `brightness(${(1 - p * .45).toFixed(2)})` : ''; }); };
    const apply = () => { grid.classList.toggle('mm-stack', mq.matches); wraps.forEach((w, i) => w.style.setProperty('--mm-i', i)); if (!mq.matches) wraps.forEach(w => { const c = $('.mlg-card', w); if (c) { c.style.transform = ''; c.style.filter = ''; } }); paint(); };
    mq.addEventListener('change', apply); apply();
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  }

  /* ================= G1 · sipario oro tra home e servizi ================= */
  if (!reduce) {
    const cur = doc.createElement('div'); cur.className = 'mm-curtain'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<i></i><i><svg viewBox="0 0 42 43" fill="none" stroke="#c8aa77" stroke-width="1.6"><path d="M4 34V9l17 18L38 9v25"/></svg></i>';
    doc.body.append(cur);
    let passing = false;
    doc.addEventListener('click', e => {
      if (passing || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a[data-moi-category], .moi-room .moi-back'); if (!link || link.classList.contains('mlg-card')) return;   // la card apre prima la sua scheda: il sipario parte da "Entra"
      if (link.dataset.moiCategory === 'digital' || $('#moi-showroom-digital')?.classList.contains('is-active')) return;   // Digital ha già la sua transizione a pixel
      if (link.dataset.moiCategory && $('#moi-showroom-' + link.dataset.moiCategory)?.classList.contains('is-active')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      cur.classList.remove('is-up', 'is-down'); void cur.offsetWidth; cur.classList.add('is-up');
      setTimeout(() => {
        passing = true; link.click(); passing = false;
        setTimeout(() => $('.moi-skip')?.click(), 30);
        setTimeout(() => { cur.classList.remove('is-up'); cur.classList.add('is-down'); setTimeout(() => cur.classList.remove('is-down'), 750); }, 260);
      }, 640);
    }, true);
  }

  /* ================= G2 · barra oro di avanzamento + "torna su" ================= */
  const bar = doc.createElement('div'); bar.className = 'mm-progress'; bar.setAttribute('aria-hidden', 'true'); doc.body.append(bar);
  const top = doc.createElement('button'); top.type = 'button'; top.className = 'mm-top'; top.setAttribute('aria-label', 'Torna su');
  top.innerHTML = '<svg class="mm-top-ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="25"/></svg><span aria-hidden="true">↑</span>'; doc.body.append(top);
  const scroller = () => $('.moi-room.is-active') || null;
  let praf = 0;
  const ppaint = () => { praf = 0; const r = scroller(); const y = r ? r.scrollTop : scrollY, max = r ? r.scrollHeight - r.clientHeight : doc.documentElement.scrollHeight - innerHeight; const p = max > 0 ? Math.min(1, y / max) : 0; bar.style.transform = `scaleX(${p.toFixed(4)})`; $('circle', top).style.strokeDashoffset = (157 * (1 - p)).toFixed(1); const show = y > innerHeight * .8; top.classList.toggle('is-on', show); bar.classList.toggle('is-on', max > innerHeight * .5); };
  const sched = () => { if (!praf) praf = requestAnimationFrame(ppaint); };
  addEventListener('scroll', sched, { passive: true }); doc.addEventListener('scroll', sched, { passive: true, capture: true }); addEventListener('resize', sched);
  $$('.moi-room').forEach(r => new MutationObserver(sched).observe(r, { attributes: true, attributeFilter: ['class'] }));
  top.addEventListener('click', () => { const r = scroller(); (r || window).scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  sched();

  /* ================= G5 · indicatore che scivola su "Esplora un altro mondo" ================= */
  $$('.moi-room-nav').forEach(nav => {
    const links = $$('a', nav); if (!links.length) return;
    const ind = doc.createElement('span'); ind.className = 'mm-pill'; ind.setAttribute('aria-hidden', 'true'); nav.prepend(ind); nav.classList.add('mm-pillnav');
    const curLink = () => links.find(a => a.getAttribute('aria-current') === 'page') || links[0];
    const go = a => { Object.assign(ind.style, { left: a.offsetLeft + 'px', top: a.offsetTop + 'px', width: a.offsetWidth + 'px', height: a.offsetHeight + 'px', opacity: 1 }); links.forEach(x => x.classList.toggle('mm-pill-on', x === a)); };
    links.forEach(a => { a.addEventListener('mouseenter', () => go(a)); a.addEventListener('focus', () => go(a)); });
    nav.addEventListener('mouseleave', () => go(curLink()));
    new ResizeObserver(() => go(curLink())).observe(nav);
  });

  /* ================= C1 · pila di foto dei lavori (Custom) ================= */
  onRoom('moi-showroom-custom', async room => {
    const copy = $('.moi-room-copy', room); if (!copy || $('.mm-pile', copy)) return;
    let imgs = [];
    try { const d = await fetch('/data/portfolio.json').then(r => r.json()); imgs = (d.custom?.progetti || []).filter(p => p.attivo !== false).map(p => ({ src: p.immagini?.[0], t: p.titolo })).filter(x => x.src).slice(0, 5); } catch {}
    if (imgs.length < 2) return;
    copy.querySelector('.moi-sticker-entry')?.insertAdjacentHTML('afterend', `<div class="mm-pile-wrap"><div class="mm-pile" role="group" aria-label="Foto dei nostri lavori: trascina o tocca per sfogliare">${imgs.map(x => `<div class="mm-pile-card"><img src="${esc(x.src)}" alt="${esc(x.t)}" draggable="false"><span>${esc(x.t)}</span></div>`).join('')}</div><p class="mm-pile-hint">TRASCINA O TOCCA PER SFOGLIARE</p></div>`);
    const pile = $('.mm-pile', copy); let cards = $$('.mm-pile-card', pile);
    const lay = () => cards.forEach((c, i) => { c.style.zIndex = 10 - i; c.style.transform = `translate(${i * 7}px,${i * -6}px) rotate(${i ? (i % 2 ? 3.5 : -3.5) * Math.min(i, 2) : 0}deg) scale(${1 - i * .04})`; });
    const toBack = () => { cards.push(cards.shift()); lay(); };
    let sx = 0, sy = 0, drag = null;
    pile.addEventListener('pointerdown', e => { const t = cards[0]; if (!t.contains(e.target)) return; drag = t; sx = e.clientX; sy = e.clientY; t.classList.add('is-drag'); try { t.setPointerCapture(e.pointerId); } catch {} });
    pile.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - sx, dy = e.clientY - sy; drag.style.transform = `translate(${dx}px,${dy}px) rotate(${dx / 12}deg)`; });
    const up = e => { if (!drag) return; const d = Math.hypot(e.clientX - sx, e.clientY - sy); drag.classList.remove('is-drag'); drag = null; if (d > 70 || d < 5) toBack(); else lay(); };
    pile.addEventListener('pointerup', up); pile.addEventListener('pointercancel', up);
    pile.tabIndex = 0; pile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); toBack(); } });
    lay();
  });

  /* ================= S2 · display LED (Signage) ================= */
  const signRoom = $('#moi-showroom-signage');
  if (signRoom) {
    const intro = $('.moi-room-intro', signRoom);
    intro?.insertAdjacentHTML('afterend', '<div class="mm-led" aria-hidden="true"><canvas width="520" height="84"></canvas></div>');
    const cv = $('.mm-led canvas', signRoom);
    if (cv) {
      const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, cell = 6, rows = H / cell | 0, cols = W / cell | 0;
      const off = doc.createElement('canvas'), oc = off.getContext('2d'), msg = '   MOI LAB · INSEGNE LUMINOSE · DISPLAY LED · PANNELLI · VETROFANIE   ';
      oc.font = 'bold 13px monospace'; const tw = Math.ceil(oc.measureText(msg).width); off.width = tw; off.height = rows; oc.font = 'bold 13px monospace'; oc.fillStyle = '#fff'; oc.textBaseline = 'middle'; oc.fillText(msg, 0, rows / 2 + 1);
      const data = oc.getImageData(0, 0, tw, rows).data; let x = 0, vis = false; new IntersectionObserver(es => vis = es[0].isIntersecting).observe(cv);
      const draw = () => { ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = data[(r * tw + (c + x) % tw) * 4 + 3]; ctx.fillStyle = a > 100 ? '#ffb347' : '#2a1d0e'; ctx.shadowBlur = a > 100 ? 6 : 0; ctx.shadowColor = '#ff9a1f'; ctx.beginPath(); ctx.arc(c * cell + cell / 2, r * cell + cell / 2, cell / 2 - .8, 0, 7); ctx.fill(); } };
      let lt = 0; const loop = t => { if (vis && !doc.hidden && t - lt > 70) { lt = t; if (!reduce) x = (x + 1) % tw; draw(); } requestAnimationFrame(loop); }; draw(); requestAnimationFrame(loop);
    }
  }

  /* ================= D1 timbro circolare + D2 parola che cambia carattere (Design) ================= */
  onRoom('moi-showroom-design', room => {
    const stage = $('.moi-room-stage', room);
    if (stage && !$('.mm-badge', stage)) stage.insertAdjacentHTML('beforeend', `<div class="mm-badge" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="mm-circ" d="M100 100m-76 0a76 76 0 1 1 152 0a76 76 0 1 1-152 0"/></defs><text><textPath href="#mm-circ">GRAFICA · BRANDING · IDENTITÀ · LOGO · </textPath></text></svg><span>M</span></div>`);
    const copy = $('.moi-room-copy', room), line = copy && $('.moi-room-line', copy);
    if (line && !$('.mm-fonts', copy)) {
      const F = [['Helvetica Neue, Helvetica, Arial, sans-serif', 'HELVETICA', 500, 'normal'], ['Playfair Display, Georgia, serif', 'PLAYFAIR', 700, 'italic'], ['Space Mono, monospace', 'SPACE MONO', 700, 'normal'], ['"Moi Editorial", Georgia, serif', 'MOI EDITORIAL', 400, 'italic'], ['Bebas Neue, Impact, sans-serif', 'BEBAS NEUE', 400, 'normal'], ['Caveat, cursive', 'CAVEAT', 700, 'normal'], ['DM Serif Display, Georgia, serif', 'DM SERIF', 400, 'normal']];
      if (!doc.getElementById('mm-fonts-css')) { const l = doc.createElement('link'); l.id = 'mm-fonts-css'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=Space+Mono:wght@700&family=Bebas+Neue&family=Caveat:wght@700&family=DM+Serif+Display&display=swap&text=' + encodeURIComponent('Brand'); doc.head.append(l); }
      line.insertAdjacentHTML('beforebegin', `<div class="mm-fonts"><p>Il tuo <span class="mm-fonts-w">Brand</span>, nello stile giusto.</p><small class="mm-fonts-n" aria-hidden="true">HELVETICA</small></div>`);
      const w = $('.mm-fonts-w', copy), n = $('.mm-fonts-n', copy); let i = 0;
      if (!reduce) setInterval(() => { if (doc.hidden || !room.classList.contains('is-active')) return; i = (i + 1) % F.length; const [f, name, wt, st] = F[i]; w.classList.add('is-swap'); setTimeout(() => { Object.assign(w.style, { fontFamily: f, fontWeight: wt, fontStyle: st }); n.textContent = name; w.classList.remove('is-swap'); }, 170); }, 1400);
    }
  });

  /* ================= X2 icone obiettivi che si ingrandiscono + X3 lettere sullo sfondo (Digital) ================= */
  const dig = $('#moi-showroom-digital');
  if (dig) {
    const objs = $('.md-objectives-grid', dig);
    if (objs && fine && !reduce) {
      const bs = $$('button', objs); let raf = 0, px = -1e4;
      const paint = () => { raf = 0; bs.forEach(b => { const r = b.getBoundingClientRect(), d = Math.abs(px - (r.left + r.width / 2)), k = Math.max(0, 1 - d / 260); b.style.transform = k ? `scale(${(1 + .1 * k * k).toFixed(3)})` : ''; b.style.zIndex = k > .5 ? 2 : ''; }); };
      objs.addEventListener('pointermove', e => { px = e.clientX; if (!raf) raf = requestAnimationFrame(paint); });
      objs.addEventListener('pointerleave', () => { px = -1e4; if (!raf) raf = requestAnimationFrame(paint); });
      objs.classList.add('mm-dock');
    }
    const hero = $('.md-hero', dig);
    if (hero && !reduce) {
      const cv = doc.createElement('canvas'); cv.className = 'mm-glitch'; cv.setAttribute('aria-hidden', 'true'); hero.prepend(cv); hero.classList.add('mm-glitch-host');
      const ctx = cv.getContext('2d'), CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]#$%&*+=', COL = ['#2f6f5e', '#b9b3a4', '#e0b84d', '#e86a6e'];
      let cols = 0, grid = [], vis = false;
      const size = () => { const r = hero.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); cols = Math.ceil(r.width / 16); const rows = Math.ceil(r.height / 22); grid = Array.from({ length: cols * rows }, () => ({ c: CH[Math.random() * CH.length | 0], k: COL[Math.random() * 4 | 0] })); draw(); };
      const draw = () => { ctx.clearRect(0, 0, cv.width, cv.height); ctx.font = '14px ui-monospace, Menlo, monospace'; grid.forEach((g, i) => { ctx.fillStyle = g.k; ctx.fillText(g.c, (i % cols) * 16, ((i / cols | 0) + 1) * 22); }); };
      new ResizeObserver(size).observe(hero); new IntersectionObserver(es => vis = es[0].isIntersecting).observe(hero);
      let lt = 0; const loop = t => { if (vis && !doc.hidden && t - lt > 110) { lt = t; for (let n = 0; n < grid.length * .04; n++) { const g = grid[Math.random() * grid.length | 0]; if (g) { g.c = CH[Math.random() * CH.length | 0]; g.k = COL[Math.random() * 4 | 0]; } } draw(); } requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }
})();
