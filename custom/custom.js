/* MOI LAB — Sticker e oggetti (/custom/): catalogo a schede, configuratore su listino reale, animazioni, recensioni.
   Prezzi: data/catalogo/vetrina.json (scaglioni reali, IVA inclusa). Nessun prezzo scritto qui. */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const euro = n => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WA = '393278815148';
const C = n => `/assets/catalogo/custom/${n}-480.webp`, D = n => `/assets/catalogo/design/${n}-480.webp`;
const big = src => src ? src.replace('-480.webp', '.webp') : '';

/* ---------- listino: codici di vetrina.json ---------- */
const NAME = { G3CF381: 'Adesivi sagomati', G3B9EBA: 'Adesivi rotondi', GC62CF1: 'Adesivi quadrati', G2AA7EB: 'Adesivi rettangolari', GA14C9D: 'Adesivi con angoli arrotondati', GF595FB: 'Adesivi ovali', G871094: 'Adesivi trasparenti', G6F5E88: 'Adesivi impermeabili personalizzati', G1EDAC9: 'Adesivi rotondi su foglio', G9DB847: 'Etichette per prodotti su foglio', GD0045A: 'Rotoli di adesivi' };
const BIGLIETTI = [
  ['Standard', 'GE9DA2C', D('ge9da2c-biglietti-da-visita-standard')], ['Carta opaca', 'G868CC6', D('g868cc6-biglietti-da-visita-carta-opaca')],
  ['Carta lucida', 'GC28FAA', D('gc28faa-biglietti-da-visita-su-carta-lucida')], ['Effetto soft touch', 'G8BF630', D('g8bf630-biglietti-da-visita-effetto-soft-touch')],
  ['Quadrati', 'GFC7832', D('gfc7832-biglietti-da-visita-quadrati')], ['Angoli arrotondati', 'GD82566', D('gd82566-biglietti-da-visita-con-angoli-arrotondati')],
  ['Carta kraft', 'GF7FF12', D('gf7ff12-biglietti-da-visita-carta-kraft')], ['Extra spessi', 'G5110C8', D('g5110c8-biglietti-da-visita-extra-spessi')],
  ['Con codice QR', 'G45141F', D('g45141f-biglietti-da-visita-con-codice-qr')]
];
const SCATOLE = [
  ['Scatole postali', 'GA9A0EF', C('ga9a0ef-scatole-postali')], ['Postali, stampa monocromatica', 'GA316EC', ''],
  ['Economiche per spedizioni', 'G3845F6', ''], ['Per spedizioni, stampa monocromatica', 'G22E721', ''],
  ['Scatole per prodotti', 'GEF3ED9', ''], ['Scatole regalo', 'G695C27', C('g695c27-scatole-regalo')], ['Astucci guaina', 'G6ECFCD', C('g6ecfcd-astucci-guaina')]
];
BIGLIETTI.forEach(t => NAME[t[1]] = 'Biglietti da visita · ' + t[0]); SCATOLE.forEach(t => NAME[t[1]] = t[0]);
const STD_MAT = [['Standard', null], ['Trasparente', 0], ['Impermeabile', 0], ['Consigliatemi voi', null]];
const CATS = [
 { id: 'sagomati', fam: 'sticker', name: 'Sticker sagomati', desc: 'Forme su misura, massima personalità.', img: C('g3cf381-adesivi-sagomati'), base: 'G3CF381',
   shape: [['Sagomata sulla grafica', 'G3CF381'], ['Rotonda', 'G3B9EBA'], ['Quadrata', 'GC62CF1'], ['Rettangolare', 'G2AA7EB'], ['Angoli arrotondati', 'GA14C9D'], ['Ovale', 'GF595FB']],
   mat: [['Standard', null], ['Trasparente', 'G871094'], ['Impermeabile', 'G6F5E88'], ['Consigliatemi voi', null]] },
 { id: 'foglio', fam: 'sticker', name: 'Sticker su foglio', desc: 'Tanti sticker su un foglio, pronti da staccare.', img: C('g1edac9-adesivi-rotondi-su-foglio'), base: 'G1EDAC9', shape: [['Rotonda', null], ['Altra forma', 0]], mat: STD_MAT },
 { id: 'etichette', fam: 'sticker', name: 'Etichette personalizzate', desc: 'Per prodotti, barattoli e confezioni del tuo marchio.', img: C('g9db847-etichette-per-prodotti-su-foglio'), base: 'G9DB847', shape: [['Standard', null], ['Altra forma', 0]], mat: STD_MAT },
 { id: 'packaging', fam: 'sticker', name: 'Sticker per packaging', desc: 'In rotolo, per chiudere e firmare ordini e spedizioni.', img: C('gd0045a-rotoli-di-adesivi'), base: 'GD0045A', shape: [['Standard', null], ['Altra forma', 0]], mat: STD_MAT },
 { id: 'biglietti', fam: 'biglietti', name: 'Biglietti da visita', img: BIGLIETTI[0][2], types: BIGLIETTI, typeLabel: 'Carta e formato' },
 { id: 'scatole', fam: 'scatole', name: 'Scatole', img: SCATOLE[0][2], types: SCATOLE, typeLabel: 'Tipo di scatola' }
];
/* card del catalogo: 4 per scheda */
const CARDS = {
  sticker: CATS.slice(0, 4).map(c => ({ cfg: c.id, name: c.name, desc: c.desc, img: c.img, pid: c.base })),
  biglietti: [[0, 'Il classico: carta standard, stampa a colori.'], [3, 'Effetto vellutato al tatto.'], [6, 'Carta naturale, aspetto artigianale.'], [8, 'Con il tuo codice QR stampato.']]
    .map(([k, d]) => ({ cfg: 'biglietti', type: k, name: BIGLIETTI[k][0] === 'Standard' ? 'Biglietti standard' : 'Biglietti ' + BIGLIETTI[k][0].toLowerCase().replace(/ qr$/, ' QR'), desc: d, img: BIGLIETTI[k][2], pid: BIGLIETTI[k][1] })),
  scatole: [[0, 'Per spedire con il tuo marchio.'], [5, 'Per confezioni speciali, anche da 1 pezzo.'], [6, 'Per presentare prodotti piccoli.']]
    .map(([k, d]) => ({ cfg: 'scatole', type: k, name: SCATOLE[k][0], desc: d, img: SCATOLE[k][2], pid: SCATOLE[k][1] }))
    .concat([{ cfg: 'scatole', type: 0, name: 'Tutti i formati', desc: 'Postali con stampa, per spedizioni, per prodotti: 7 formati.', img: '', label: '7 FORMATI', pid: null }])
};
const FINISH = ['Lucida', 'Opaca', 'Consigliatemi voi'], USE = ['Interno', 'Esterno'];
const ART = [['have', 'Ho già la grafica'], ['help', 'Mi serve aiuto con la grafica'], ['idea', 'Ho solo un’idea']];
let TIERS = {};
const ready = fetch('/data/catalogo/vetrina.json?v=2026-10-28-2').then(r => r.json()).then(v => { (v.custom || []).forEach(sh => Object.assign(TIERS, sh.tiers || {})); }).catch(() => {});

/* ---------- catalogo a schede ---------- */
let fam = 'sticker';
function cards() {
  const box = $('[data-cards]'); if (!box) return;
  box.innerHTML = CARDS[fam].map((c, i) => {
    const t = c.pid && TIERS[c.pid]?.[0];
    const price = t ? `Da ${euro(t[1])} <small>· ${t[0]} pz</small>` : c.pid ? 'Richiedi il prezzo' : 'Scegli il formato';
    const at = `data-config="${c.cfg}"${c.type != null ? ` data-type="${c.type}"` : ''}`;
    const img = c.img ? `<img src="${c.img}" alt="" width="480" height="384" loading="lazy" decoding="async">` : '';
    return `<article class="sk-card" style="--d:${i * 0.08}s">
      <button class="sk-card-add" type="button" ${at} aria-label="Configura ${esc(c.name)}"><svg><use href="#s-plus"/></svg></button>
      <a class="sk-card-img${c.img ? '' : ' ph-none'}" href="#catalogo" ${at} tabindex="-1" aria-hidden="true">${img || esc(c.label || '')}</a>
      <h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p>
      <button class="sk-price" type="button" ${at}>${price} <svg aria-hidden="true"><use href="#s-arrow"/></svg></button>
    </article>`;
  }).join('');
  $$('.sk-tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === fam));
}
function setFam(f, scroll) {
  if (!CARDS[f]) return; fam = f; const box = $('[data-cards]');
  box.classList.remove('in'); cards(); requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('in')));
  if (scroll) $('#catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
document.addEventListener('click', e => {
  const t = e.target.closest('.sk-tabs [data-tab]'); if (t) { setFam(t.dataset.tab); return; }
  const g = e.target.closest('[data-tabgo]'); if (g) { e.preventDefault(); setFam(g.dataset.tabgo, true); }
});

/* ---------- configuratore ---------- */
const dlg = $('.skc'); let st = null;
function openConfig(catId, preset = {}) {
  const c = CATS.find(x => x.id === catId) || CATS[0];
  if (!st || st.cat !== c.id) st = { cat: c.id, shape: 0, mat: 0, type: 0, qty: null, size: 'std', w: '', h: '', fin: 2, use: 0, art: 'have', file: '', idea: '', notes: '' };
  if (preset.mat) { const k = (c.mat || []).findIndex(m => m[1] === preset.mat); if (k >= 0) st.mat = k; }
  if (preset.type != null && c.types) { const k = typeof preset.type === 'number' ? preset.type : c.types.findIndex(t => t[1] === preset.type); if (k >= 0) st.type = k; }
  $('.skc-tabs', dlg).innerHTML = CATS.map(x => `<button type="button" role="tab" aria-selected="${x.id === c.id}" data-tab="${x.id}">${esc(x.name)}</button>`).join('');
  paint();
  if (!dlg.open) { dlg.showModal(); document.documentElement.style.overflow = 'hidden'; }
  history.replaceState(null, '', '#configura-' + c.id);
}
function closeConfig() { if (dlg.open) dlg.close(); }
dlg?.addEventListener('close', () => { document.documentElement.style.overflow = ''; if (location.hash.startsWith('#configura-')) history.replaceState(null, '', location.pathname + location.search); });
dlg?.addEventListener('click', e => { if (e.target === dlg) closeConfig(); const t = e.target.closest('.skc-tabs [data-tab]'); if (t) openConfig(t.dataset.tab); });
$('[data-close]', dlg)?.addEventListener('click', closeConfig);

function resolve() {
  const c = CATS.find(x => x.id === st.cat); let pid, tbd = [], img = c.img;
  if (c.types) { const t = c.types[st.type]; pid = t[1]; if (t[2]) img = t[2]; }
  else {
    pid = c.base;
    const sh = c.shape[st.shape]; if (sh[1] === 0) tbd.push('forma'); else if (sh[1]) pid = sh[1];
    const m = c.mat[st.mat]; if (m[1] === 0) tbd.push('materiale'); else if (m[1]) pid = m[1];
  }
  if (st.size === 'custom') tbd.push('misura');
  const tiers = TIERS[pid] || [];
  if (!tiers.length) tbd.push('prezzo');
  if (!tiers.some(t => t[0] === st.qty)) st.qty = tiers[0]?.[0] ?? null;
  return { c, pid, tiers, tier: tiers.find(t => t[0] === st.qty), tbd, img };
}
const chips = (name, list, sel) => `<div class="skc-chips">${list.map((l, i) => `<label><input type="radio" name="${name}" value="${i}"${i === sel ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>`;
function paint() {
  const r = resolve(), c = r.c, sticker = !c.types;
  $('#skc-t').textContent = c.name;
  const img = $('.skc-img img', dlg), src = big(r.img); if (img.dataset.src !== src) { img.dataset.src = src; img.src = src; img.alt = NAME[r.pid] || c.name; }
  const outdoorTip = sticker && USE[st.use] === 'Esterno' && c.mat[st.mat][0] === 'Standard';
  $('.skc-fields', dlg).innerHTML = `
   ${c.types ? `<fieldset class="skc-f"><legend>${esc(c.typeLabel)}</legend>${chips('type', c.types.map(t => t[0]), st.type)}</fieldset>` : ''}
   <fieldset class="skc-f"><legend>Quantità <small>· scaglioni del listino</small></legend>
    ${r.tiers.length ? `<select class="skc-sel" name="qty" aria-label="Quantità">${r.tiers.map(t => `<option value="${t[0]}"${t[0] === st.qty ? ' selected' : ''}>${t[0].toLocaleString('it-IT')} pz${r.tbd.length ? '' : ' — ' + euro(t[1])}</option>`).join('')}</select>` : '<p class="skc-hint">Indicala nelle note.</p>'}</fieldset>
   ${sticker ? `<fieldset class="skc-f"><legend>Forma</legend>${chips('shape', c.shape.map(s => s[0]), st.shape)}${c.shape[st.shape][1] === 0 ? '<p class="skc-hint">Descrivila nelle note: la confermiamo nel preventivo.</p>' : ''}</fieldset>` : ''}
   <fieldset class="skc-f"><legend>Dimensioni</legend>${chips('size', ['Formato standard', 'Su misura'], st.size === 'custom' ? 1 : 0)}
    ${st.size === 'custom' ? `<div class="skc-size"><input type="number" name="w" min="1" max="200" step="0.5" inputmode="decimal" placeholder="Larghezza" value="${esc(st.w)}" aria-label="Larghezza in cm"><span>×</span><input type="number" name="h" min="1" max="200" step="0.5" inputmode="decimal" placeholder="Altezza" value="${esc(st.h)}" aria-label="Altezza in cm"><span>cm</span></div>` : ''}</fieldset>
   ${sticker ? `<fieldset class="skc-f"><legend>Materiale</legend>${chips('mat', c.mat.map(m => m[0]), st.mat)}</fieldset>
   <fieldset class="skc-f"><legend>Finitura <small>· la confermiamo nel preventivo</small></legend>${chips('fin', FINISH, st.fin)}</fieldset>
   <fieldset class="skc-f"><legend>Utilizzo</legend>${chips('use', USE, st.use)}${outdoorTip ? '<p class="skc-hint warn">Per l’esterno ti consigliamo un materiale impermeabile: sceglilo qui sopra.</p>' : ''}</fieldset>` : ''}
   <fieldset class="skc-f"><legend>Grafica</legend>${chips('art', ART.map(a => a[1]), ART.findIndex(a => a[0] === st.art))}
    ${st.art === 'have' ? `<div class="skc-file"><label>Scegli il file<input type="file" name="file" accept=".png,.jpg,.jpeg,.webp,.pdf,.svg,.ai,.eps,.psd"></label><em>${st.file ? esc(st.file) : 'Nessun file scelto'}</em></div><p class="skc-hint">Il file non viene caricato sul sito: lo alleghi su WhatsApp quando invii la richiesta.</p>` : ''}
    ${st.art === 'help' ? '<p class="skc-hint">Ti aiutiamo noi a preparare la grafica: ne parliamo nel preventivo.</p>' : ''}
    ${st.art === 'idea' ? `<textarea name="idea" maxlength="800" placeholder="Raccontaci la tua idea: soggetto, colori, testo…" aria-label="La tua idea">${esc(st.idea)}</textarea>` : ''}</fieldset>
   <fieldset class="skc-f"><legend>Note <small>· facoltative</small></legend><textarea name="notes" maxlength="800" placeholder="Scadenze, fronte e retro, dove li userai…" aria-label="Note">${esc(st.notes)}</textarea></fieldset>`;
  price(r);
}
function price(r = resolve()) {
  const box = $('.skc-price', dlg), basis = `Base di prezzo: ${esc(NAME[r.pid] || r.c.name)}, formato standard.`;
  if (r.tier && !r.tbd.length) {
    box.innerHTML = `<span class="tot">${euro(r.tier[1])}</span><span class="unit">${r.tier[0].toLocaleString('it-IT')} pz · ${euro(r.tier[1] / r.tier[0])} al pezzo · IVA inclusa</span><p>${basis} Dettagli e finiture li confermiamo nel preventivo.</p>`;
  } else {
    const why = r.tbd.filter(x => x !== 'prezzo').map(x => ({ forma: 'una forma diversa', materiale: 'un materiale diverso', misura: 'una misura personalizzata' })[x]);
    const ref = r.tiers.length ? ` Il formato standard parte da ${euro(r.tiers[0][1])}.` : '';
    box.innerHTML = `<span class="tbd">Prezzo da confermare</span><span class="unit">${why.length ? 'Hai scelto ' + esc(why.join(', ')) + '.' : 'Questo prodotto lo quotiamo su richiesta.'}</span><p>Te lo diciamo nel preventivo.${ref}</p>`;
  }
  const c = r.c, bits = [c.name, st.qty ? `${st.qty.toLocaleString('it-IT')} pz` : '', c.types ? c.types[st.type][0] : c.shape[st.shape][0], c.types ? '' : c.mat[st.mat][0]];
  $('.skc-sum', dlg).textContent = bits.filter(Boolean).join(' · ');
}
dlg?.addEventListener('change', e => {
  const el = e.target, n = el.name; if (!st) return;
  if (n === 'qty') { st.qty = Number(el.value); price(); return; }
  if (n === 'file') { st.file = el.files?.[0]?.name || ''; const em = $('.skc-file em', dlg); if (em) em.textContent = st.file || 'Nessun file scelto'; return; }
  if (['shape', 'mat', 'fin', 'use', 'type'].includes(n)) st[n] = +el.value;
  else if (n === 'size') st.size = el.value === '1' ? 'custom' : 'std';
  else if (n === 'art') st.art = ART[+el.value][0];
  else return;
  const body = $('.skc-body', dlg), y = body.scrollTop; paint(); body.scrollTop = y;
  $(`[name="${n}"]:checked`, dlg)?.focus({ preventScroll: true });
});
dlg?.addEventListener('input', e => { const n = e.target.name; if (['w', 'h', 'idea', 'notes'].includes(n)) st[n] = e.target.value; });
dlg?.addEventListener('submit', e => {
  e.preventDefault(); if (!st || !window.MoiCart) return;
  const r = resolve(), c = r.c, priced = r.tier && !r.tbd.length, sticker = !c.types;
  const size = st.size === 'custom' ? (st.w && st.h ? `${st.w} × ${st.h} cm` : 'Su misura (da definire)') : 'Formato standard';
  const art = ART.find(a => a[0] === st.art)[1];
  window.MoiCart.add({
    service: 'custom', title: c.types ? NAME[r.pid] : 'Sticker · ' + c.name, qty: st.qty, image: r.img,
    price: priced ? r.tier[1] / r.tier[0] : null, priceFrom: false, fixedQty: true,
    key: ['skl', c.id, r.pid, st.qty, st.shape, st.mat, size, st.fin, st.use, st.art].join('|'),
    details: [...(sticker ? [['Forma', c.shape[st.shape][0]]] : []), ['Dimensioni', size],
      ...(sticker ? [['Materiale', c.mat[st.mat][0]], ['Finitura', FINISH[st.fin]], ['Utilizzo', USE[st.use]]] : []),
      ['Grafica', art], ['File', st.art === 'have' && st.file ? st.file + ' (lo allego su WhatsApp)' : ''], ['Idea', st.art === 'idea' ? st.idea.trim() : ''], ['Note', st.notes.trim()],
      ['Prezzo', priced ? `listino ${NAME[r.pid]}, formato standard` : 'da confermare']]
  });
  window.MoiCart.fly?.($('.skc-add', dlg), r.img);
  st = null; closeConfig();
  setTimeout(() => window.MoiCart.open?.(), reduce ? 0 : 650);
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-config]'); if (!b || b.closest('.skc')) return;
  e.preventDefault(); ready.then(() => openConfig(b.dataset.config, { mat: b.dataset.mat, type: b.dataset.type != null ? +b.dataset.type : undefined }));
});
$('[data-cart-open]')?.addEventListener('click', () => window.MoiCart?.open());
const bagN = $('.sk-bag-n');
const syncBag = () => { const n = window.MoiCart?.count?.() || 0; if (bagN) { bagN.hidden = !n; bagN.textContent = n; } };
setInterval(() => { if (!document.hidden) syncBag(); }, 1200); syncBag();

/* ---------- recensioni ---------- */
fetch('/data/recensioni.json?v=20261030-1').then(r => r.json()).then(d => {
  const items = (d.items || []).filter(x => x && x.testo); const box = $('[data-car] .sk-car-v'); if (!box || !items.length) return;
  const stars = n => `<span class="sk-q-stars${n ? ' on' : ''}" aria-label="${n ? n + ' stelle su 5' : 'Nessuna valutazione'}">${[1, 2, 3, 4, 5].map(i => `<svg aria-hidden="true" style="${n && i > n ? 'color:#e9dcc6' : ''}"><use href="#s-star"/></svg>`).join('')}</span>`;
  box.innerHTML = items.map((x, i) => { const real = x.tipo === 'recensione';
    return `<figure class="sk-q${i ? '' : ' is-on'}">${real ? '' : '<span class="sk-q-lab">IN ARRIVO · NON È UNA RECENSIONE</span>'}<blockquote>“${esc(x.testo)}”</blockquote>${stars(real ? Math.max(1, Math.min(5, +x.stelle || 0)) : 0)}<figcaption><b>${esc(x.nome)}</b><br><small>${esc(x.ruolo)}</small></figcaption>${real ? '' : `<a href="https://wa.me/${WA}?text=${encodeURIComponent('Ciao MOI LAB, vorrei lasciare una recensione: ')}" target="_blank" rel="noopener">Lascia una recensione →</a>`}</figure>`; }).join('');
  const qs = $$('.sk-q', box); let k = 0;
  const go = dir => { const prev = qs[k]; k = (k + dir + qs.length) % qs.length; prev.classList.remove('is-on'); prev.classList.add('is-out'); setTimeout(() => prev.classList.remove('is-out'), 450); qs[k].classList.add('is-on'); };
  $('[data-car] .prev').onclick = () => go(-1); $('[data-car] .next').onclick = () => go(1);
  let x0 = null; box.addEventListener('pointerdown', e => { x0 = e.clientX; }); box.addEventListener('pointerup', e => { if (x0 != null && Math.abs(e.clientX - x0) > 40) go(e.clientX < x0 ? 1 : -1); x0 = null; });
}).catch(() => {});

/* ---------- animazioni ---------- */
const hero = $('.sk-hero');
$$('.st').forEach((s, i) => { s.style.setProperty('--d0', (0.2 + i * 0.1).toFixed(2) + 's'); s.style.setProperty('--fd', (6 + (i % 3) * 1.1).toFixed(1) + 's'); });
const startHero = () => hero?.classList.add('go');
(document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(startHero)); setTimeout(startHero, 1200);
if (!reduce && fine && hero) {
  const layers = $$('[data-d]', hero); let raf = 0, mx = 0, my = 0;
  hero.addEventListener('pointermove', e => { const b = hero.getBoundingClientRect(); mx = (e.clientX - b.left) / b.width - .5; my = (e.clientY - b.top) / b.height - .5; if (!raf) raf = requestAnimationFrame(() => { raf = 0; layers.forEach(l => { const d = +l.dataset.d; l.style.translate = `${(mx * d * 1.2).toFixed(1)}px ${(my * d).toFixed(1)}px`; }); }); });
  hero.addEventListener('pointerleave', () => layers.forEach(l => { l.style.translate = ''; }));
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .12 }) : null;
const watch = () => $$('[data-r]:not(.in),[data-cards]:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
if (!reduce) {
  const px = $$('[data-px]'); let ticking = false;
  const run = () => { ticking = false; const vh = innerHeight; px.forEach(el => { const b = el.getBoundingClientRect(); if (b.bottom < -200 || b.top > vh + 200) return; el.style.translate = `0 ${((b.top + b.height / 2 - vh / 2) * +el.dataset.px).toFixed(1)}px`; }); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true }); run();
}
/* titoli: se il carattere di riserva è più largo di Anton, riduco finché ci stanno */
function fit() { $$('.sk-h1,.sk-big,.sk-intro-c .sk-h2,.sk-rev-t').forEach(h => { h.style.fontSize = ''; if (getComputedStyle(h).whiteSpace !== 'nowrap' && !h.matches('.sk-h1')) return; const max = h.matches('.sk-intro-c .sk-h2') ? h.parentElement.clientWidth : h.clientWidth; const wide = () => h.matches('.sk-h1') ? Math.max(...[...h.children].map(c => c.scrollWidth)) : h.scrollWidth; let f = parseFloat(getComputedStyle(h).fontSize), i = 0; while (wide() > max + 1 && i++ < 40) { f *= .97; h.style.fontSize = f + 'px'; } }); }
(document.fonts?.ready || Promise.resolve()).then(fit); addEventListener('resize', () => { clearTimeout(fit.t); fit.t = setTimeout(fit, 150); });
const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
ready.then(() => {
  cards(); watch();
  const fromHash = () => { const m = location.hash.match(/^#configura-([a-z]+)(?:-(G[0-9A-F]{6}))?/); if (!m) return; st = null; const c = CATS.find(x => x.id === m[1]); openConfig(m[1], c?.types ? { type: m[2] } : { mat: m[2] }); if (c && c.fam !== fam) setFam(c.fam); };
  fromHash(); addEventListener('hashchange', fromHash);
});
})();
