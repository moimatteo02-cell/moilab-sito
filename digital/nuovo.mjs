// MOI LAB — DIGITAL, nuova pagina: interazioni.
// Scritte che rispondono al tocco (.dx-play), pixel che si accendono, terminale che costruisce,
// obiettivi con risposta, carte che si girano, sito che si costruisce scorrendo.
import { openProjectWizard } from './project-wizard.mjs?v=20261027-1';
import { serviceIcon } from './service-icons.mjs';

const room = document.querySelector('#moi-showroom-digital'), dx = room?.querySelector('.dx');
if (dx) {
  const $ = (s, r = dx) => r.querySelector(s), $$ = (s, r = dx) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = ['#df6650', '#49a58c', '#c5bda6', '#e3b341'];
  const CODE = '01<>/{}[]#$%&*+=_;:ABCDEFXYZ';
  const vis = new WeakMap(), io = new IntersectionObserver(es => es.forEach(e => vis.set(e.target, e.isIntersecting)), { root: room });
  const shown = el => vis.get(el) && room.classList.contains('is-active') && !document.hidden;

  /* ========== scritte che rispondono al tocco ========== */
  function split(el) {
    if (el.dataset.dxSplit) return; el.dataset.dxSplit = '1';
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = el.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) ? ' ' : `<span class="dx-wd" aria-hidden="true">${[...w].map(c => `<span class="dx-ch" data-c="${c.replace(/"/g, '&quot;')}">${c}</span>`).join('')}</span>`).join('');
  }
  const chars = el => $$('.dx-ch', el);
  function burst(x, y, n = 14) {
    if (calm) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i'); p.className = 'dx-burst'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = COLS[i % 4]; document.body.append(p);
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
      p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d + 30}px)) scale(.4) rotate(${a * 90}deg)`, opacity: 0 }], { duration: 650 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => p.remove();
    }
  }
  const FX = {
    code(el) {                          // si "decodifica": lettere di codice che si risolvono una alla volta
      const cs = chars(el); let f = 0;
      clearInterval(el._t); el._t = setInterval(() => {
        f++; cs.forEach((c, i) => { const done = f > i * 1.2 + 6; c.textContent = done ? c.dataset.c : CODE[Math.random() * CODE.length | 0]; c.classList.toggle('is-code', !done); });
        if (f > cs.length * 1.2 + 7) { clearInterval(el._t); cs.forEach(c => { c.textContent = c.dataset.c; c.classList.remove('is-code'); }); }
      }, 35);
    },
    pixel(el, e) {                      // le lettere saltano e partono pixel colorati
      chars(el).forEach((c, i) => { const r = (Math.random() - .5) * 40; c.animate([{ transform: 'none' }, { transform: `translateY(${-18 - Math.random() * 22}px) rotate(${r}deg) scale(1.15)`, color: COLS[i % 4], offset: .35 }, { transform: 'none' }], { duration: 750, delay: i * 18, easing: 'cubic-bezier(.3,1.5,.5,1)' }); });
      burst(e.clientX, e.clientY, 18);
    },
    wave(el) {                          // un'onda attraversa la frase
      chars(el).forEach((c, i) => c.animate([{ transform: 'none' }, { transform: 'translateY(-.28em) scale(1.12)', color: '#df6650', offset: .4 }, { transform: 'none' }], { duration: 620, delay: i * 32, easing: 'ease-in-out' }));
    },
  };
  $$('.dx-play').forEach(el => {
    split(el);
    el.addEventListener('click', e => { if (!calm) (FX[el.dataset.fx] || FX.wave)(el, e); });
  });
  // le lettere si sollevano vicino al dito / al mouse
  let near = [], praf = 0, pp = null;
  const lift = () => {
    praf = 0; if (!pp) return;
    near.forEach(c => { const r = c.getBoundingClientRect(), d = Math.hypot(pp.x - (r.left + r.width / 2), pp.y - (r.top + r.height / 2)), k = Math.max(0, 1 - d / 90); c.style.transform = k ? `translateY(${-k * 12}px) scale(${1 + k * .18})` : ''; });
  };
  if (!calm) {
    room.addEventListener('pointermove', e => {
      const host = e.target.closest?.('.dx-title, .dx-h2, .dx-end-t');
      if (!host) { if (near.length) { near.forEach(c => c.style.transform = ''); near = []; } return; }
      near = $$('.dx-ch', host); pp = { x: e.clientX, y: e.clientY }; if (!praf) praf = requestAnimationFrame(lift);
    }, { passive: true });
    room.addEventListener('pointerleave', () => { near.forEach(c => c.style.transform = ''); near = []; });
  }

  /* ========== pixel che si accendono (apertura e chiusura) ========== */
  $$('.dx-px').forEach(cv => {
    const host = cv.parentElement, ctx = cv.getContext('2d'), S = 26; let cells = [], cols = 0, rows = 0, raf = 0, last = 0;
    io.observe(host);
    const size = () => { const r = host.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); cols = Math.ceil(r.width / S); rows = Math.ceil(r.height / S); cells = new Float32Array(cols * rows); };
    new ResizeObserver(size).observe(host); size();
    const hit = (x, y, rad = 1, k = 1) => { const c0 = Math.floor(x / S), r0 = Math.floor(y / S); for (let r = r0 - rad; r <= r0 + rad; r++) for (let c = c0 - rad; c <= c0 + rad; c++) { if (c < 0 || r < 0 || c >= cols || r >= rows) continue; const d = Math.hypot(c - c0, r - r0); if (d <= rad) cells[r * cols + c] = Math.max(cells[r * cols + c], k * (1 - d / (rad + 1))); } kick(); };
    const draw = t => {
      raf = 0; if (!shown(host)) return;
      if (!calm && t - last > 140) { last = t; for (let i = 0; i < 3; i++) cells[Math.random() * cells.length | 0] = .55; }
      ctx.clearRect(0, 0, cv.width, cv.height); let any = false;
      for (let i = 0; i < cells.length; i++) { const v = cells[i]; if (v < .02) continue; any = true; const c = i % cols, r = (i / cols) | 0; ctx.globalAlpha = v * .85; ctx.fillStyle = COLS[(c * 7 + r * 3) % 4]; ctx.fillRect(c * S + 1, r * S + 1, S - 2, S - 2); cells[i] = v * .955; }
      ctx.globalAlpha = .06; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); for (let c = 0; c <= cols; c++) { ctx.moveTo(c * S + .5, 0); ctx.lineTo(c * S + .5, rows * S); } for (let r = 0; r <= rows; r++) { ctx.moveTo(0, r * S + .5); ctx.lineTo(cols * S, r * S + .5); } ctx.stroke(); ctx.globalAlpha = 1;
      if (any || !calm) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    host.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); hit(e.clientX - r.left, e.clientY - r.top, 1, .9); }, { passive: true });
    host.addEventListener('pointerdown', e => {          // tocco: onda di pixel che si allarga
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (calm) return hit(x, y, 2, 1);
      [0, 1, 2, 3, 4].forEach(k => setTimeout(() => { const c0 = x / S, r0 = y / S; for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; const c = Math.round(c0 + Math.cos(t) * k * 1.6), rr = Math.round(r0 + Math.sin(t) * k * 1.6); if (c >= 0 && rr >= 0 && c < cols && rr < rows) cells[rr * cols + c] = 1 - k * .15; } kick(); }, k * 70));
    });
    new MutationObserver(kick).observe(room, { attributes: true, attributeFilter: ['class'] });
    setInterval(kick, 1000); kick();
  });

  /* ========== terminale che costruisce (4 modalità) ========== */
  const PREV = {
    web: ['<div style="left:0;right:0;top:0;height:13%;background:#263d43"></div>', '<div style="left:6%;top:22%;width:52%;height:9%;border-radius:4px;background:#151515"></div>', '<div style="left:6%;top:35%;width:38%;height:6%;border-radius:4px;background:#c5bda6"></div>', '<div style="left:6%;top:48%;width:24%;height:12%;border-radius:999px;background:#df6650"></div>', '<div style="left:6%;right:6%;top:68%;height:24%;display:grid;grid-template-columns:repeat(3,1fr);gap:4%"><i style="background:#e2ddd2;border-radius:6px"></i><i style="background:#e2ddd2;border-radius:6px"></i><i style="background:#e2ddd2;border-radius:6px"></i></div>'],
    app: ['<div style="left:0;top:0;bottom:0;width:20%;background:#263d43"></div>', '<div style="left:25%;right:5%;top:7%;height:10%;border-radius:4px;background:#e2ddd2"></div>', '<div style="left:25%;width:33%;top:24%;height:30%;border-radius:8px;background:#49a58c"></div>', '<div style="left:62%;right:5%;top:24%;height:30%;border-radius:8px;background:#df6650"></div>', '<div style="left:25%;right:5%;top:60%;bottom:7%;border-radius:8px;background:repeating-linear-gradient(#e2ddd2 0 14%,transparent 14% 25%)"></div>'],
    shop: ['<div style="left:0;right:0;top:0;height:13%;background:#151515"></div>', '<div style="left:6%;width:40%;top:20%;bottom:8%;border-radius:8px;background:#e2ddd2"></div>', '<div style="left:52%;top:22%;width:40%;height:9%;border-radius:4px;background:#151515"></div>', '<div style="left:52%;top:36%;width:22%;height:8%;border-radius:4px;background:#8a7552"></div>', '<div style="left:52%;top:62%;width:40%;height:14%;border-radius:999px;background:#df6650"></div>'],
    auto: ['<div style="left:6%;top:38%;width:18%;height:24%;border-radius:8px;background:#263d43"></div>', '<div style="left:41%;top:12%;width:18%;height:24%;border-radius:8px;background:#49a58c"></div>', '<div style="left:41%;top:64%;width:18%;height:24%;border-radius:8px;background:#e3b341"></div>', '<div style="left:24%;right:41%;top:23%;bottom:23%;border:2px dashed #8a7552;border-right:0;border-radius:12px 0 0 12px"></div>', '<div style="left:76%;top:38%;width:18%;height:24%;border-radius:8px;background:#df6650"></div>'],
  };
  const LINES = {
    web: ['moi-lab crea --sito "la-tua-attività"', 'struttura delle pagine', 'titolo e messaggio', 'pulsante WhatsApp', 'servizi e foto', 'online · trovato su Google'],
    app: ['moi-lab crea --app "gestione"', 'menu e accessi', 'agenda prenotazioni', 'ordini e preventivi', 'clienti e statistiche', 'pronta su telefono e computer'],
    shop: ['moi-lab crea --negozio "i-tuoi-prodotti"', 'intestazione e carrello', 'scheda prodotto', 'prezzi e varianti', 'pagamento sicuro', 'negozio aperto 24/7'],
    auto: ['moi-lab collega --automazione', 'nuovo ordine ricevuto', 'aggiorna il foglio', 'manda la conferma', 'ti avvisa su WhatsApp', 'fatto. Senza muovere un dito'],
  };
  const term = $('.dx-term');
  if (term) {
    const pre = $('pre', term), prev = $('.dx-prev', term); let mode = 'web', run = 0, auto = true;
    io.observe(term);
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const play = () => {
      const id = ++run, L = LINES[mode];
      prev.innerHTML = PREV[mode].join(''); const parts = [...prev.children];
      if (calm) { pre.innerHTML = `<span class="p">$</span> ${esc(L[0])}\n` + L.slice(1).map(l => `<span class="ok">✓</span> ${esc(l)}`).join('\n'); parts.forEach(p => p.classList.add('on')); return; }
      let out = '', i = 0;
      const step = () => {
        if (id !== run) return;
        if (!shown(term)) return setTimeout(step, 400);
        if (i === 0) {                                      // il comando si scrive lettera per lettera
          let k = 0; const t = setInterval(() => { if (id !== run) return clearInterval(t); k++; pre.innerHTML = `<span class="p">$</span> ${esc(L[0].slice(0, k))}<span class="dx-cur"></span>`; if (k >= L[0].length) { clearInterval(t); out = `<span class="p">$</span> ${esc(L[0])}\n`; i = 1; setTimeout(step, 300); } }, 28);
          return;
        }
        if (i < L.length) { out += `<span class="ok">${i === L.length - 1 ? '●' : '✓'}</span> ${esc(L[i])}\n`; pre.innerHTML = out + '<span class="dx-cur"></span>'; parts[i - 1]?.classList.add('on'); i++; return setTimeout(step, 520); }
        setTimeout(() => { if (id !== run) return; if (auto) { const ks = Object.keys(LINES); select(ks[(ks.indexOf(mode) + 1) % ks.length], false); } else play(); }, 2600);
      };
      step();
    };
    const select = (m, user) => { mode = m; if (user) auto = false; $$('[data-build]', term).forEach(b => b.setAttribute('aria-selected', String(b.dataset.build === m))); play(); };
    $$('[data-build]', term).forEach(b => b.addEventListener('click', () => select(b.dataset.build, true)));
    play();
  }

  /* ========== obiettivi: risposta immediata ========== */
  const ans = $('.dx-ans');
  $$('[data-digital-objective]').forEach(b => {
    if (!b.querySelector('.md-service-icon')) b.insertAdjacentHTML('afterbegin', serviceIcon(b.dataset.digitalObjective));
    b.setAttribute('aria-pressed', 'false');
    b.onclick = e => {
      $$('[data-digital-objective]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      ans.hidden = false;
      ans.innerHTML = `<div><small class="dx-mono">Cosa costruiremmo</small><p>${b.dataset.dxAns}</p></div><button type="button" class="dx-btn dx-btn-light">Parliamone <span aria-hidden="true">→</span></button>`;
      $('button', ans).onclick = ev => openProjectWizard(ev.currentTarget, '', b.dataset.digitalObjective);
      if (!calm) { ans.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' }); b.animate([{ transform: 'scale(.96)' }, { transform: 'scale(1.03)' }, { transform: 'none' }], { duration: 400 }); burst(e.clientX, e.clientY, 10); }
    };
  });

  /* ========== carte dei servizi: luce che segue il dito, si girano ========== */
  $$('.dx-card').forEach(card => {
    const f = $('.dx-card-f', card); f.insertAdjacentHTML('afterbegin', serviceIcon(card.dataset.icon));
    const inner = $('.dx-card-in', card);
    inner.addEventListener('click', () => { card.classList.toggle('is-flip'); inner.setAttribute('aria-expanded', String(card.classList.contains('is-flip'))); });
    inner.addEventListener('pointermove', e => { const r = inner.getBoundingClientRect(); f.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); f.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); if (!calm && !card.classList.contains('is-flip')) inner.style.transform = `rotateX(${((e.clientY - r.top) / r.height - .5) * -10}deg) rotateY(${((e.clientX - r.left) / r.width - .5) * 12}deg)`; });
    inner.addEventListener('pointerleave', () => { inner.style.transform = ''; });
    $('.dx-card-cta', card).addEventListener('click', e => openProjectWizard(e.currentTarget, card.dataset.svc));
  });
  // quando la carta si gira, la rotazione 3D del dito non deve bloccarla
  new MutationObserver(ms => ms.forEach(m => { if (m.target.classList.contains('is-flip')) $('.dx-card-in', m.target).style.transform = ''; })).observe(dx, { subtree: true, attributes: true, attributeFilter: ['class'] });

  /* ========== il sito si costruisce scorrendo ========== */
  const build = $('.dx-build'), site = $('.dx-site'), steps = $$('.dx-steps li');
  if (build) {
    let cur = -1;
    const up = () => {
      const r = build.getBoundingClientRect(), h = build.offsetHeight - room.clientHeight;
      const p = Math.min(.999, Math.max(0, -r.top / Math.max(1, h))), k = calm ? 4 : Math.floor(p * 5);
      if (k === cur) return; cur = k;
      site.className = 'dx-site' + Array.from({ length: k + 1 }, (_, j) => ' s' + (j + 1)).join('');
      steps.forEach((s, j) => { s.classList.toggle('on', j <= k); s.classList.toggle('now', j === k); });
    };
    room.addEventListener('scroll', up, { passive: true }); up();
  }

  /* ========== software pronti (in attesa dei software reali) ========== */
  const sw = $('#moi-digital-software-new');
  if (sw) sw.innerHTML = [['Prenotazioni', 'Agenda online per chi lavora su appuntamento.', '#263d43'], ['Gestionale ordini', 'Ordini, clienti e preventivi in un posto.', '#49a58c'], ['Configuratore', 'Il cliente sceglie e riceve il preventivo.', '#df6650']].map(([t, d, c], i) => `<article class="dx-sw-card"><div class="dx-sw-scr" style="background:linear-gradient(135deg,${c},#152225)"><span class="dx-soon dx-mono">IN ARRIVO</span>${[[8, 10, 40, 10], [8, 28, 84, 40], [8, 74, 30, 12]].map(([l, t2, w, h], j) => `<i style="left:${l + i * 3}%;top:${t2}%;width:${w - i * 6}%;height:${h}%"></i>`).join('')}</div><div class="dx-sw-b"><h3>${t}</h3><p>${d}</p></div></article>`).join('');

  /* ========== pulsanti ========== */
  $$('[data-digital-project]').forEach(b => { b.onclick = () => openProjectWizard(b); });
  const go = id => { const t = id === 'software' ? $('#dx-software') : $('#dx-' + id); if (t) room.scrollTo({ top: t.getBoundingClientRect().top - room.getBoundingClientRect().top + room.scrollTop - 10, behavior: calm ? 'instant' : 'smooth' }); };
  $$('[data-dx-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.dxGo)));
  const ex = $('[data-digital-explore]'); if (ex) setTimeout(() => { ex.disabled = false; }, 0);

  /* ========== Sling Button (React Bits): tira indietro e lancia ========== */
  const SL_DARK = {}, SL_LIGHT = { padColor: '#18181b', iconColor: '#ffffff', accentColor: '#18181b', wellColor: '#f6f6f6', bandColor: '#a1a1aa' };
  const endSling = $('.dx-sling');
  if (endSling && window.MoiSling) window.MoiSling.mount(endSling, { ...SL_DARK, ariaLabel: 'Lancia la tua idea', onSend: () => setTimeout(() => openProjectWizard(endSling.querySelector('button')), calm ? 0 : 420) });
  // nell'ultimo passo del modulo progetto: lanci il messaggio e si apre WhatsApp
  new MutationObserver(() => {
    const a = document.querySelector('.mdq-send:not([data-sling])'); if (!a || !window.MoiSling) return;
    a.dataset.sling = '1';
    const box = document.createElement('div'); box.className = 'dx-sling-send';
    box.innerHTML = '<span class="dx-sling-slot"></span><p><b>Lancia il messaggio</b><span>Tira indietro il pulsante e lascialo andare, oppure toccalo.</span></p>';
    a.before(box);
    window.MoiSling.mount(box.querySelector('.dx-sling-slot'), { ...SL_LIGHT, ariaLabel: 'Invia il progetto su WhatsApp', onSend: () => window.open(a.href, '_blank', 'noopener') });
  }).observe(document.body, { childList: true, subtree: true });

  /* ========== le sezioni entrano mentre scorri ========== */
  if (!calm) {
    const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { root: room, threshold: .12 });
    $$('.dx-sec > *, .dx-end > *').forEach(el => { el.classList.add('dx-rv'); rio.observe(el); });
  }
}
