/* MOI LAB — APPAREL: estetica del catalogo (giro "36 modifiche").
   Solo ritocchi di presentazione: nessun dato inventato, nessun prezzo calcolato qui.
   Rispetta "riduci movimento": senza animazioni la pagina funziona uguale. */
(() => {
  const doc = document, $ = (s, r = doc) => r.querySelector(s), $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const mount = $('#moi-apparel-catalog'); if (!mount) return;
  const room = mount.closest('.moi-room');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const locked = () => matchMedia('(min-width:1024px) and (min-height:640px)').matches;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
  const favs = () => { try { return JSON.parse(store.get('moi-preferiti') || '[]'); } catch { return []; } };
  let heroPlayed = false, tabFrom = null, raf = 0;

  /* ---------- 1 · titolo che entra a parole + riga corsiva che si scrive ---------- */
  function heroTitle() {
    const h = $('.br-hero h2', mount); if (!h || h.dataset.es) return; h.dataset.es = '1';
    const play = !heroPlayed && !calm; heroPlayed = true; let i = 0;
    [...h.childNodes].forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const f = doc.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) return f.append(w); const s = doc.createElement('span'); s.className = 'es-w'; s.textContent = w; s.style.setProperty('--i', i++); f.append(s); });
        n.replaceWith(f);
      } else if (n.nodeName === 'EM') { n.classList.add('es-write'); n.style.setProperty('--i', i + 1); }
    });
    if (play) h.classList.add('es-play');
  }

  /* ---------- 2 · sfondo che respira ---------- */
  function aurora() {
    const hero = $('.br-hero', mount); if (!hero || $('.es-aurora', hero)) return;
    hero.insertAdjacentHTML('afterbegin', '<div class="es-aurora" aria-hidden="true"><i></i><i></i><i></i></div>');
  }

  /* ---------- 3 · esempi di ricerca che si scrivono da soli ---------- */
  const EX = ['polo per ristorante', 'felpa per palestra', 'maglietta per un evento', 'giacca da lavoro', 'divisa per dentista', 'cappellino col logo', 'pantaloni da cantiere'];
  function typer() {
    $$('.br-search input', mount).forEach(i => { if (!i.closest('.br-search-big')) i.placeholder = 'Cerca un capo o un mestiere…'; });
    const inp = $('.br-search-big input', mount); if (!inp || inp.dataset.es) return; inp.dataset.es = '1';
    inp.placeholder = 'Cerca un capo o un mestiere…';
    if (calm) return;
    let w = 0, c = 0, dir = 1, pause = 0;
    const tick = () => {
      if (!inp.isConnected) return;
      if (doc.activeElement !== inp && !inp.value) {
        if (pause > 0) pause--;
        else {
          const word = EX[w]; c += dir;
          if (c > word.length) { dir = -1; pause = 24; c = word.length; }
          else if (c < 0) { dir = 1; c = 0; w = (w + 1) % EX.length; pause = 4; }
          inp.placeholder = 'Cerca: ' + word.slice(0, c) + (c % 2 ? '|' : ' ');
        }
      } else inp.placeholder = 'Cerca un capo o un mestiere…';
      setTimeout(tick, dir > 0 ? 75 : 35);
    };
    setTimeout(tick, 1400);
  }

  /* ---------- 5 · striscia di fiducia che scorre (telefono) ---------- */
  function trust() {
    const ul = $('.es-trust-in', mount); if (!ul || ul.dataset.es) return; ul.dataset.es = '1';
    $$('[role=listitem]', ul).forEach(li => { const c = li.cloneNode(true); c.removeAttribute('role'); c.setAttribute('aria-hidden', 'true'); c.classList.add('es-dup'); ul.append(c); });
  }

  /* ---------- 6 · evidenziatore che scivola tra i percorsi ---------- */
  function tabs() {
    const t = $('.br-tabs', mount); if (!t || $('.es-ind', t)) return;
    const ind = doc.createElement('span'); ind.className = 'es-ind'; ind.setAttribute('aria-hidden', 'true'); t.prepend(ind); t.classList.add('es-has-ind');
    const place = (r, anim) => { ind.style.transition = anim ? '' : 'none'; Object.assign(ind.style, { width: r.w + 'px', height: r.h + 'px', transform: `translate(${r.x}px,${r.y}px)` }); };
    const sel = $('[aria-selected="true"]', t); if (!sel) return;
    const to = { x: sel.offsetLeft, y: sel.offsetTop, w: sel.offsetWidth, h: sel.offsetHeight };
    if (tabFrom && !calm) { place(tabFrom, false); void ind.offsetWidth; requestAnimationFrame(() => place(to, true)); } else place(to, false);
    tabFrom = null;
  }
  doc.addEventListener('click', e => { const b = e.target.closest('#moi-apparel-catalog [data-br-tab]'); if (!b) return; const s = $('.br-tabs [aria-selected="true"]', mount); if (s) tabFrom = { x: s.offsetLeft, y: s.offsetTop, w: s.offsetWidth, h: s.offsetHeight }; }, true);
  addEventListener('resize', () => { const t = $('.br-tabs', mount), ind = t && $('.es-ind', t), s = t && $('[aria-selected="true"]', t); if (ind && s) { ind.style.transition = 'none'; Object.assign(ind.style, { width: s.offsetWidth + 'px', height: s.offsetHeight + 'px', transform: `translate(${s.offsetLeft}px,${s.offsetTop}px)` }); } });

  /* ---------- 13 · maglietta più vera: pieghe, ombra, inclinazione 3D ---------- */
  const FOLDS = '<svg class="es-folds" viewBox="0 0 240 230" aria-hidden="true"><defs><clipPath id="es-tee-clip"><path d="M82 18q10 22 38 22t38-22l52 24-18 44-22-10v128H70V76L48 86 30 42Z"/></clipPath><linearGradient id="es-tee-l" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".25" stop-color="#fff" stop-opacity=".10"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient><filter id="es-tee-b"><feGaussianBlur stdDeviation="5"/></filter></defs><g clip-path="url(#es-tee-clip)"><rect width="240" height="230" fill="url(#es-tee-l)"/><g filter="url(#es-tee-b)" fill="none" stroke-linecap="round"><path d="M74 150q20 10 30 40" stroke="#000" stroke-opacity=".05" stroke-width="9"/><path d="M168 120q-14 30-10 72" stroke="#000" stroke-opacity=".045" stroke-width="10"/><path d="M96 96q24 10 52-4" stroke="#fff" stroke-opacity=".16" stroke-width="6"/><path d="M60 70l-10 14M182 70l10 14" stroke="#000" stroke-opacity=".06" stroke-width="6"/></g></g></svg>';
  function tee() {
    const pic = $('.mm-lt-pic', mount); if (!pic || pic.dataset.es) return; pic.dataset.es = '1';
    pic.insertAdjacentHTML('beforeend', FOLDS); pic.classList.add('es-tee');
    if (!fine || calm) return;
    pic.addEventListener('pointermove', e => { const r = pic.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; pic.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); pic.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg'); pic.style.setProperty('--gx', (x * 100 + 50).toFixed(1) + '%'); });
    pic.addEventListener('pointerleave', () => { pic.style.setProperty('--ry', '0deg'); pic.style.setProperty('--rx', '0deg'); });
  }

  /* ---------- 16 · Atomic 150 e parallasse leggera ---------- */
  function parallax() {
    if (calm || !room) return;
    const els = $$('.br-sp-ph img', mount); if (!els.length) return;
    const vh = innerHeight;
    els.forEach((img, i) => { const r = img.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const p = (r.top + r.height / 2 - vh / 2) / vh; img.style.setProperty('--py', (p * (i ? -18 : 26)).toFixed(1) + 'px'); });
  }
  let pr = 0; room?.addEventListener('scroll', () => { if (!pr) pr = requestAnimationFrame(() => { pr = 0; parallax(); }); }, { passive: true });

  /* ---------- 21 · cuore e "Vedi il capo" su ogni scheda ---------- */
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>';
  function cards() {
    const f = favs();
    $$('.ac-products .ac-product', mount).forEach(c => {
      if (c.dataset.es) return; c.dataset.es = '1';
      const pic = $('.ac-picture', c); if (!pic) return;
      const on = f.includes(c.dataset.sku);
      pic.insertAdjacentHTML('beforeend', `<span class="es-heart" role="button" tabindex="0" aria-pressed="${on}" aria-label="${on ? 'Togli dai preferiti' : 'Salva nei preferiti'}">${HEART}</span><span class="es-see" aria-hidden="true">Vedi il capo →</span>`);
    });
  }
  function heart(h) {
    const card = h.closest('.ac-product'), sku = card?.dataset.sku; if (!sku) return;
    let f = favs(); const on = !f.includes(sku); f = on ? [...f, sku] : f.filter(x => x !== sku); store.set('moi-preferiti', JSON.stringify(f));
    h.setAttribute('aria-pressed', String(on)); h.setAttribute('aria-label', on ? 'Togli dai preferiti' : 'Salva nei preferiti');
    if (!calm) { h.classList.remove('es-pop'); void h.offsetWidth; h.classList.add('es-pop'); }
    window.MOI_FAV_SYNC?.();
    const name = $('.br-pc-name', card)?.textContent || '';
    window.MOI_TOAST?.(on ? 'Salvato nei preferiti' : 'Tolto dai preferiti', name);
  }
  doc.addEventListener('click', e => { const h = e.target.closest('#moi-apparel-catalog .es-heart'); if (!h) return; e.preventDefault(); e.stopImmediatePropagation(); heart(h); }, true);
  doc.addEventListener('pointerdown', e => { if (e.target.closest('#moi-apparel-catalog .es-heart')) e.stopPropagation(); }, true);
  doc.addEventListener('keydown', e => { const h = e.target.closest?.('#moi-apparel-catalog .es-heart'); if (!h || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault(); e.stopImmediatePropagation(); heart(h); }, true);

  /* ---------- 19 · nome del colore passando sui pallini ---------- */
  const pcache = new Map();
  const product = sku => { if (!pcache.has(sku)) pcache.set(sku, fetch('/data/apparel/prodotti/' + encodeURIComponent(sku) + '.json').then(r => r.ok ? r.json() : null).then(d => d?.product || null).catch(() => null)); return pcache.get(sku); };
  if (fine) doc.addEventListener('pointerover', async e => {
    const dot = e.target.closest('#moi-apparel-catalog .br-pc-dots i[data-hx]'); if (!dot || dot.dataset.name) return;
    const sku = dot.closest('.ac-product')?.dataset.sku; const p = sku && await product(sku); if (!p) return;
    const n = h => String(h || '').trim().toLowerCase(), c = (p.colori || []).find(c => n(c.hex) === n(dot.dataset.hx));
    if (c) { dot.dataset.name = c.nome; dot.setAttribute('title', c.nome); }
  });

  /* ---------- 24 · vista 4 o 2 per riga ---------- */
  const VIEW_ICONS = { 4: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="6.5" height="6.5" rx="1"/><rect x="11.5" y="2" width="6.5" height="6.5" rx="1"/><rect x="2" y="11.5" width="6.5" height="6.5" rx="1"/><rect x="11.5" y="11.5" width="6.5" height="6.5" rx="1"/></svg>', 2: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="1.5"/></svg>' };
  const setView = v => { mount.classList.toggle('es-v2', v === '2'); $$('[data-es-view]', mount).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.esView === v))); };
  function viewToggle() {
    const bar = $('.br-bar-r', mount); if (!bar || $('.es-view', bar)) return;
    bar.insertAdjacentHTML('afterbegin', `<div class="es-view" role="group" aria-label="Grandezza delle schede"><button type="button" data-es-view="4" aria-label="Schede piccole">${VIEW_ICONS[4]}</button><button type="button" data-es-view="2" aria-label="Schede grandi">${VIEW_ICONS[2]}</button></div>`);
    setView(store.get('es-vista') || '4');
  }
  mount.addEventListener('click', e => { const b = e.target.closest('[data-es-view]'); if (!b) return; store.set('es-vista', b.dataset.esView); setView(b.dataset.esView); });

  /* ---------- 25 · caricamento automatico arrivando in fondo ---------- */
  let moreIO = null;
  function autoMore() {
    const b = $('.ac-pagination [data-br-more]', mount); if (!b || b.dataset.es) return; b.dataset.es = '1';
    const m = b.textContent.match(/\((\d+) di (\d+)\)/); if (m) {
      const seen = +m[1], all = +m[2];
      b.innerHTML = `<span class="es-more-t">Hai visto ${seen} di ${all}</span><span class="es-more-bar" aria-hidden="true"><i style="width:${(seen / all * 100).toFixed(1)}%"></i></span><span class="es-more-c">Mostra altri</span>`;
    }
    moreIO?.disconnect();
    moreIO = new IntersectionObserver(en => { if (en.some(x => x.isIntersecting || x.boundingClientRect.bottom < (x.rootBounds?.top ?? 0)) && b.isConnected && !b.dataset.go) { b.dataset.go = '1'; b.classList.add('is-loading'); setTimeout(() => b.isConnected && b.click(), calm ? 0 : 260); } }, { root: room, rootMargin: '0px 0px 240px 0px' });
    moreIO.observe(b);
  }

  /* ---------- 29 · i colori nella scheda: nome intero + sfumatura se scorrono ---------- */
  function colors() {
    const box = $('.ac-pdp-colors', mount); if (!box || box.dataset.es) return; box.dataset.es = '1';
    const n = $$('button', box).length, lg = box.closest('fieldset')?.querySelector('legend');
    if (lg && n > 1) lg.insertAdjacentHTML('beforeend', `<small class="es-ncol">${n} colori</small>`);
    const fade = () => box.classList.toggle('es-more-below', box.scrollHeight - box.scrollTop - box.clientHeight > 6);
    box.addEventListener('scroll', fade, { passive: true }); requestAnimationFrame(fade);
  }

  /* ---------- 30 · lente: passando col mouse (computer) o a tutto schermo (telefono) ---------- */
  function zoom() {
    const st = $('.ac-pdp-stage', mount); if (!st || st.dataset.es) return; st.dataset.es = '1';
    if (fine) {
      let t = 0;
      st.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse' || st.classList.contains('is-dragging')) return;
        const r = st.getBoundingClientRect(); st.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); st.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        if (!st.classList.contains('es-zoom') && !t) t = setTimeout(() => { t = 0; if (st.matches(':hover') && !$('video', st)) st.classList.add('es-zoom'); }, 380);
      });
      st.addEventListener('pointerleave', () => { clearTimeout(t); t = 0; st.classList.remove('es-zoom'); });
      st.addEventListener('pointerdown', () => { clearTimeout(t); t = 0; st.classList.remove('es-zoom'); });
    }
    st.insertAdjacentHTML('beforeend', '<button type="button" class="es-lens" aria-label="Ingrandisci la foto"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3M11 8v6M8 11h6"/></svg></button>');
  }
  doc.addEventListener('pointerdown', e => { if (e.target.closest('#moi-apparel-catalog .es-lens')) e.stopPropagation(); }, true);
  doc.addEventListener('click', e => {
    const l = e.target.closest('#moi-apparel-catalog .es-lens'); if (!l) return; e.stopPropagation();
    const img = $('[data-media-stage] img', mount); if (!img) return;
    const v = doc.createElement('div'); v.className = 'es-viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Foto ingrandita');
    v.innerHTML = `<button type="button" class="es-viewer-x" aria-label="Chiudi">×</button><div class="es-viewer-sc"><img src="${esc(img.currentSrc || img.src)}" alt="${esc(img.alt)}"></div><p>Scorri per muoverti nella foto</p>`;
    doc.body.append(v); doc.documentElement.classList.add('es-viewer-on');
    const sc = $('.es-viewer-sc', v); const im = $('img', v);
    const center = () => { sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2; sc.scrollTop = (sc.scrollHeight - sc.clientHeight) / 3; };
    im.complete ? center() : im.addEventListener('load', center, { once: true });
    const close = () => { v.remove(); doc.documentElement.classList.remove('es-viewer-on'); l.focus(); };
    $('.es-viewer-x', v).addEventListener('click', close); $('.es-viewer-x', v).focus();
    v.addEventListener('keydown', k => { if (k.key === 'Escape') close(); });
  }, true);

  /* ---------- 31 · linee al posto di "1 / 7" ---------- */
  function segs() {
    const pos = $('[data-gallery-position]', mount), st = $('.ac-pdp-stage', mount); if (!pos || !st || pos.dataset.es) return; pos.dataset.es = '1';
    const box = doc.createElement('div'); box.className = 'es-segs'; box.setAttribute('aria-hidden', 'true'); st.append(box);
    const draw = () => {
      const m = pos.textContent.match(/(\d+)\s*\/\s*(\d+)/); if (!m) return; const cur = +m[1], n = +m[2];
      if (box.children.length !== n) box.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" tabindex="-1" data-es-seg="${i}"><i></i></button>`).join('');
      [...box.children].forEach((b, i) => b.classList.toggle('is-on', i === cur - 1));
      box.hidden = n < 2; box.classList.toggle('es-light', locked());
    };
    draw(); new MutationObserver(draw).observe(pos, { childList: true, characterData: true, subtree: true });
  }
  doc.addEventListener('pointerdown', e => { if (e.target.closest('#moi-apparel-catalog .es-segs')) e.stopPropagation(); }, true);
  doc.addEventListener('click', e => { const b = e.target.closest('#moi-apparel-catalog [data-es-seg]'); if (!b) return; e.stopPropagation(); $$('.ac-thumbs button', mount)[+b.dataset.esSeg]?.click(); }, true);

  /* ---------- 32 · nome del capo subito visibile su telefono ---------- */
  function mobileHead() {
    const pdp = $('.ac-pdp', mount); if (!pdp || $('.es-mhead', mount)) return;
    const ov = $('.ac-pdp-info .ac-overline', pdp)?.textContent || '', h = $('.ac-pdp-info h2', pdp)?.textContent || '', ty = $('.ac-pdp-type', pdp)?.textContent || '';
    pdp.insertAdjacentHTML('beforebegin', `<div class="es-mhead" aria-hidden="true"><p>${esc(ov)}</p><strong>${esc(h)}</strong><em>${esc(ty)}</em></div>`);
  }

  /* ---------- 33 · barra fissa su telefono con prezzo e preventivo ---------- */
  const bar = doc.createElement('div'); bar.className = 'es-bar'; bar.hidden = true;
  bar.innerHTML = '<span class="es-bar-p"><small data-es-m></small><b data-es-p></b></span><a class="es-bar-cta" target="_blank" rel="noopener noreferrer">Richiedi il preventivo <span aria-hidden="true">→</span></a>';
  doc.body.append(bar);
  let ctaIO = null, ctaSeen = true, pdpIn = false, barMO = null;
  const syncBar = () => {
    const u = $('[data-unit-price]', mount), m = $('[data-unit-mode]', mount), q = $('[data-quote]', mount); if (!u || !q) return;
    $('[data-es-p]', bar).textContent = u.getAttribute('aria-label') || u.textContent; $('[data-es-m]', bar).textContent = (/^con/.test(m?.textContent || '') ? 'Col tuo logo' : 'Senza logo') + ' · al pezzo';
    $('.es-bar-cta', bar).href = q.href;
  };
  const showBar = () => { const on = !!$('.ac-pdp', mount) && pdpIn && !locked() && !ctaSeen && room?.classList.contains('is-active'); bar.hidden = !on; doc.documentElement.classList.toggle('es-bar-on', on); };
  function stickyBar() {
    const cta = $('.ac-pdp-cta', mount);
    ctaIO?.disconnect(); barMO?.disconnect();
    if (!cta) { ctaSeen = true; showBar(); return; }
    syncBar(); ctaSeen = true;
    const pdp = $('.ac-pdp', mount); pdpIn = true;
    ctaIO = new IntersectionObserver(en => { en.forEach(x => { if (x.target === cta) ctaSeen = x.isIntersecting; else pdpIn = x.isIntersecting; }); showBar(); }, { root: room, rootMargin: '0px 0px -30% 0px' });
    ctaIO.observe(cta); ctaIO.observe(pdp);
    barMO = new MutationObserver(syncBar); barMO.observe($('.ac-pdp', mount), { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['href', 'aria-label'] });
  }
  addEventListener('resize', showBar);
  if (room) new MutationObserver(showBar).observe(room, { attributes: true, attributeFilter: ['class'] });

  /* ---------- 34 · conferma del preventivo ---------- */
  doc.addEventListener('click', e => {
    const a = e.target.closest('#moi-apparel-catalog .ac-pdp-cta, .es-bar-cta'); if (!a) return;
    [$('.ac-pdp-cta', mount), $('.es-bar-cta', bar)].forEach(x => { if (!x) return; x.classList.add('es-sent'); clearTimeout(x._es); x._es = setTimeout(() => x.classList.remove('es-sent'), 2600); });
  });

  /* ---------- 35 · la foto della scheda si allarga fino alla scheda prodotto ---------- */
  let fly = null;
  const killFly = () => { fly?.remove(); fly = null; };
  doc.addEventListener('click', e => {
    if (calm) return;
    const card = e.target.closest('#moi-apparel-catalog .ac-products .ac-product, #moi-apparel-catalog .br-sp-media'); if (!card || e.target.closest('.es-heart')) return;
    if (mount.getAttribute('aria-busy') !== 'true') return;          // la scheda si apre davvero (non è il primo tocco di anteprima)
    const img = $('.ac-model-photo, img', card); if (!img) return;
    const r = img.getBoundingClientRect(); if (!r.width) return;
    killFly(); fly = doc.createElement('img'); fly.className = 'es-fly'; fly.src = img.currentSrc || img.src; fly.alt = '';
    Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    doc.body.append(fly);
    fly.animate([{ transform: 'none' }, { transform: 'scale(1.04)' }], { duration: 260, fill: 'forwards', easing: 'ease-out' });
    const t0 = performance.now(), me = fly;
    const wait = () => {
      if (me !== fly) return;
      const st = $('.ac-pdp [data-media-stage]', mount);
      if (st && !mount.hasAttribute('aria-busy')) {
        requestAnimationFrame(() => {
          const s = st.getBoundingClientRect(); if (!s.width || s.bottom < 0 || s.top > innerHeight) return killFly();
          const sc = Math.min(s.width / r.width, s.height / r.height), x = s.left + s.width / 2 - (r.left + r.width / 2), y = s.top + s.height / 2 - (r.top + r.height / 2);
          me.animate([{ transform: 'scale(1.04)', opacity: 1 }, { transform: `translate(${x}px,${y}px) scale(${sc})`, opacity: 1, offset: .82 }, { transform: `translate(${x}px,${y}px) scale(${sc})`, opacity: 0 }], { duration: 640, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).onfinish = () => me === fly && killFly();
        });
      } else if (performance.now() - t0 < 6000) requestAnimationFrame(wait); else killFly();
    };
    requestAnimationFrame(wait);
  });

  /* ---------- quantità: il numero scorre come un contachilometri + "+1" che vola ---------- */
  let qOld = null;
  doc.addEventListener('click', e => { const b = e.target.closest('#moi-apparel-catalog [data-qty-step]'); if (b) qOld = $('[data-qty-input]', mount)?.value ?? null; }, true);
  doc.addEventListener('click', e => {
    const b = e.target.closest('#moi-apparel-catalog [data-qty-step]'); if (!b || qOld == null) return;
    const inp = $('[data-qty-input]', mount), from = qOld; qOld = null; if (!inp || inp.value === from || calm) return;
    const up = +inp.value > +from, box = inp.parentElement;
    box.classList.add('es-qbox'); box.querySelector('.es-qfx')?.remove();
    const fx = doc.createElement('span'); fx.className = 'es-qfx'; fx.setAttribute('aria-hidden', 'true');
    Object.assign(fx.style, { left: inp.offsetLeft + 'px', top: inp.offsetTop + 'px', width: inp.offsetWidth + 'px', height: inp.offsetHeight + 'px' });
    fx.style.fontSize = getComputedStyle(inp).fontSize; fx.innerHTML = `<b>${esc(from)}</b><b>${esc(inp.value)}</b>`; box.append(fx); inp.classList.add('es-qhide');
    const [o, n] = fx.children, d = up ? 1 : -1, opt = { duration: 420, easing: 'cubic-bezier(.2,.9,.25,1.25)', fill: 'forwards' };
    o.animate([{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: `translateY(${-d * 110}%) scale(.7)`, opacity: 0, filter: 'blur(3px)' }], opt);
    n.animate([{ transform: `translateY(${d * 110}%) scale(.7)`, opacity: 0, filter: 'blur(3px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], opt).onfinish = () => { inp.classList.remove('es-qhide'); fx.remove(); };
    const chip = doc.createElement('span'); chip.className = 'es-qchip'; chip.textContent = (up ? '+' : '−') + Math.abs(+inp.value - +from); chip.setAttribute('aria-hidden', 'true');
    chip.style.left = (b.offsetLeft + b.offsetWidth / 2) + 'px'; box.append(chip);
    chip.animate([{ transform: 'translate(-50%,0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-26px) scale(1.1)', opacity: 1, offset: .35 }, { transform: 'translate(-50%,-46px) scale(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => chip.remove();
    b.animate([{ transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
  });

  /* ---------- prezzo scelto (senza logo / col tuo logo): le cifre fanno un giro da slot machine ---------- */
  doc.addEventListener('click', e => {
    const b = e.target.closest('#moi-apparel-catalog [data-personalization]'); if (!b || calm || !window.MOI_ROLL) return;
    requestAnimationFrame(() => {
      const on = $(`.es-prices [data-personalization="${b.dataset.personalization}"]`, mount), el = on && $('[data-price],[data-custom-price]', on); if (!el) return;
      const txt = el.getAttribute('aria-label') || el.textContent; window.MOI_ROLL(el, txt, txt.replace(/\d/g, '0'));
    });
  });

  /* ---------- totale "1 × 28,90 € = 28,90 €": tutte le cifre girano ---------- */
  function total() {
    const t = $('[data-total]', mount); if (!t || t.dataset.es) return; t.dataset.es = '1';
    let last = { q: '', u: '', tot: '' };
    const build = () => {
      if (t.querySelector('.es-tt')) return;                      // già nostro
      const txt = t.textContent, m = txt.match(/^\s*(\d+)\s*×\s*(.+?)\s*=\s*(.+)$/); if (!m) return;
      mo.disconnect();
      t.innerHTML = '<span aria-hidden="true"><span class="es-tq"></span> × <span class="es-tu"></span> = <strong class="es-tt"></strong></span><span class="br-sr"></span>';
      $('.br-sr', t).textContent = txt.trim();
      const roll = window.MOI_ROLL;
      const put = (sel, v, k) => { const el = $(sel, t); if (roll && !calm) roll(el, v, last[k] || v); else el.textContent = v; };
      put('.es-tq', m[1], 'q'); put('.es-tu', m[2], 'u'); put('.es-tt', m[3], 'tot');
      if (last.tot && last.tot !== m[3] && !calm) { t.classList.remove('es-tflash'); void t.offsetWidth; t.classList.add('es-tflash'); }
      last = { q: m[1], u: m[2], tot: m[3] };
      mo.observe(t, { childList: true });
    };
    const mo = new MutationObserver(build); build(); mo.observe(t, { childList: true });
  }

  /* ---------- 36 · le sezioni entrano mentre scorri ---------- */
  let rvIO = null;
  function reveal() {
    if (calm || !room) return;
    rvIO?.disconnect();
    rvIO = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('es-in'); rvIO.unobserve(x.target); } }), { root: room, threshold: .12 });
    const h = room.clientHeight;
    $$('.es-trust, .br-panel, .mm-lt, .br-special, .br-all, .ac > .ac-note', mount).concat($$('.mp-teaser', room)).forEach(el => {
      if (el.dataset.esRv) return; el.dataset.esRv = '1';
      if (el.getBoundingClientRect().top < h * .92) return;      // già sullo schermo: niente animazione
      el.classList.add('es-rv'); rvIO.observe(el);
    });
  }

  /* ---------- tutto insieme, a ogni cambio di vista ---------- */
  function enhance() {
    raf = 0;
    if ($('.br-hero', mount) && !$('.mm-lt', mount) && window.MOI_LOGO_TRY_HTML) $('.br-special', mount)?.insertAdjacentHTML('beforebegin', window.MOI_LOGO_TRY_HTML());   // la prova logo arriva anche se il catalogo si è disegnato prima
    if ($('.br-hero', mount)) { heroTitle(); aurora(); typer(); trust(); tee(); parallax(); }
    tabs();
    cards();
    if ($('.br-layout', mount)) { viewToggle(); autoMore(); typer(); }
    if ($('.ac-pdp', mount)) { colors(); zoom(); segs(); mobileHead(); total(); }
    stickyBar();
    reveal();
  }
  new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(enhance); }).observe(mount, { childList: true });
  enhance();
})();
