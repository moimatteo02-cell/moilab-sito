/* MOI LAB — Sticker e oggetti (/custom/): catalogo a schede, scheda prodotto/configuratore su listino reale, animazioni, recensione.
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

/* ---------- listino (codici di vetrina.json) ---------- */
const NAME = { G3CF381: 'Adesivi sagomati', G3B9EBA: 'Adesivi rotondi', GC62CF1: 'Adesivi quadrati', G2AA7EB: 'Adesivi rettangolari', GA14C9D: 'Adesivi con angoli arrotondati', GF595FB: 'Adesivi ovali', G871094: 'Adesivi trasparenti', G6F5E88: 'Adesivi impermeabili personalizzati', G1EDAC9: 'Adesivi rotondi su foglio', G9DB847: 'Etichette per prodotti su foglio', GD0045A: 'Rotoli di adesivi' };
const BIGLIETTI = [
  ['Standard', 'GE9DA2C', D('ge9da2c-biglietti-da-visita-standard')], ['Carta opaca', 'G868CC6', D('g868cc6-biglietti-da-visita-carta-opaca')],
  ['Carta lucida', 'GC28FAA', D('gc28faa-biglietti-da-visita-su-carta-lucida')], ['Soft touch', 'G8BF630', D('g8bf630-biglietti-da-visita-effetto-soft-touch')],
  ['Quadrati', 'GFC7832', D('gfc7832-biglietti-da-visita-quadrati')], ['Angoli arrotondati', 'GD82566', D('gd82566-biglietti-da-visita-con-angoli-arrotondati')],
  ['Carta kraft', 'GF7FF12', D('gf7ff12-biglietti-da-visita-carta-kraft')], ['Extra spessi', 'G5110C8', D('g5110c8-biglietti-da-visita-extra-spessi')],
  ['Con codice QR', 'G45141F', D('g45141f-biglietti-da-visita-con-codice-qr')]
];
const SCATOLE = [
  ['Scatole postali', 'GA9A0EF', C('ga9a0ef-scatole-postali')], ['Postali, stampa monocromatica', 'GA316EC', ''],
  ['Economiche per spedizioni', 'G3845F6', ''], ['Spedizioni, stampa monocromatica', 'G22E721', ''],
  ['Scatole per prodotti', 'GEF3ED9', ''], ['Scatole regalo', 'G695C27', C('g695c27-scatole-regalo')], ['Astucci guaina', 'G6ECFCD', C('g6ecfcd-astucci-guaina')]
];
BIGLIETTI.forEach(t => NAME[t[1]] = 'Biglietti da visita · ' + t[0]); SCATOLE.forEach(t => NAME[t[1]] = t[0]);
const SH = { blob: '<path d="M8 6c3-3 8-2 9 1 3 0 5 3 4 6 2 2 1 6-2 7-1 3-5 4-7 2-3 2-7 0-7-3-3-1-3-5-1-7-2-2-1-6 4-6Z"/>', circle: '<circle cx="12" cy="12" r="8.5"/>', square: '<rect x="4" y="4" width="16" height="16"/>', rect: '<rect x="2.5" y="6.5" width="19" height="11"/>', round: '<rect x="4" y="4" width="16" height="16" rx="5"/>', oval: '<ellipse cx="12" cy="12" rx="10" ry="7"/>', other: '<path d="M4 12h3m4 0h2m4 0h3" stroke-dasharray="2 3"/><circle cx="12" cy="12" r="8.5" stroke-dasharray="3 3"/>' };
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${SH[k]}</svg>`;
const STD_MAT = [['Standard', null], ['Trasparente', 0], ['Impermeabile', 0], ['Consigliatemi voi', null]];
const CATS = [
 { id: 'sagomati', fam: 'sticker', name: 'Sticker sagomati', title: 'Sticker personalizzati sagomati', desc: 'Sticker stampati e tagliati sulla forma che vuoi. Scegli forma, quantità e materiale e richiedi il preventivo.', gallery: [C('g3cf381-adesivi-sagomati'), C('g3b9eba-adesivi-rotondi'), C('g58144b-chiudilettera-adesivi')], base: 'G3CF381',
   shape: [['Sagomata', 'G3CF381', 'blob'], ['Rotonda', 'G3B9EBA', 'circle'], ['Quadrata', 'GC62CF1', 'square'], ['Rettangolare', 'G2AA7EB', 'rect'], ['Angoli arrotondati', 'GA14C9D', 'round'], ['Ovale', 'GF595FB', 'oval']],
   mat: [['Standard', null], ['Trasparente', 'G871094'], ['Impermeabile', 'G6F5E88'], ['Consigliatemi voi', null]] },
 { id: 'foglio', fam: 'sticker', name: 'Fogli adesivi', title: 'Fogli di sticker personalizzati', desc: 'Più sticker su un unico foglio, pronti da staccare: per eventi, promozioni e packaging.', gallery: [C('g1edac9-adesivi-rotondi-su-foglio'), C('g58144b-chiudilettera-adesivi')], base: 'G1EDAC9', shape: [['Rotonda', null, 'circle'], ['Altra forma', 0, 'other']], mat: STD_MAT },
 { id: 'etichette', fam: 'sticker', name: 'Etichette', title: 'Etichette personalizzate', desc: 'Etichette su foglio per prodotti, barattoli e confezioni del tuo marchio.', gallery: [C('g9db847-etichette-per-prodotti-su-foglio')], base: 'G9DB847', shape: [['Standard', null, 'rect'], ['Altra forma', 0, 'other']], mat: STD_MAT },
 { id: 'packaging', fam: 'sticker', name: 'Adesivi chiudi pacco', title: 'Adesivi chiudi pacco in rotolo', desc: 'Sticker in rotolo per chiudere e firmare pacchi, ordini e spedizioni.', gallery: [C('gd0045a-rotoli-di-adesivi')], base: 'GD0045A', shape: [['Standard', null, 'circle'], ['Altra forma', 0, 'other']], mat: STD_MAT },
 { id: 'biglietti', fam: 'biglietti', name: 'Biglietti da visita', title: 'Biglietti da visita personalizzati', desc: 'Scegli carta e formato: dal classico al soft touch, dalla kraft al codice QR.', types: BIGLIETTI, typeLabel: 'Carta e formato' },
 { id: 'scatole', fam: 'scatole', name: 'Scatole', title: 'Scatole personalizzate', desc: 'Scatole postali, per prodotti, regalo e astucci, con il tuo marchio.', types: SCATOLE, typeLabel: 'Tipo di scatola' }
];
const CARDS = {
  sticker: CATS.slice(0, 4).map(c => ({ cfg: c.id, name: c.name, desc: { sagomati: 'La forma che vuoi, sulla tua grafica.', foglio: 'Più sticker su un foglio, per eventi e packaging.', etichette: 'Per prodotti, barattoli e branding.', packaging: 'In rotolo, per chiudere pacchi e spedizioni.' }[c.id], img: c.gallery[0], pid: c.base })),
  biglietti: [[0, 'Il classico: carta standard, stampa a colori.'], [3, 'Effetto vellutato al tatto.'], [6, 'Carta naturale, aspetto artigianale.'], [8, 'Con il tuo codice QR stampato.']]
    .map(([k, d]) => ({ cfg: 'biglietti', type: k, name: k ? BIGLIETTI[k][0] : 'Biglietti standard', desc: d, img: BIGLIETTI[k][2], pid: BIGLIETTI[k][1] })),
  scatole: [[0, 'Per spedire con il tuo marchio.'], [5, 'Per confezioni speciali, anche da 1 pezzo.'], [6, 'Per presentare prodotti piccoli.']]
    .map(([k, d]) => ({ cfg: 'scatole', type: k, name: SCATOLE[k][0], desc: d, img: SCATOLE[k][2], pid: SCATOLE[k][1] }))
    .concat([{ cfg: 'scatole', type: 0, name: 'Tutti i formati', desc: 'Postali con stampa, per spedizioni, per prodotti: 7 formati.', img: '', label: '7 FORMATI', pid: null }])
};
const WORD = { sticker: 'sticker', biglietti: 'biglietti da visita', scatole: 'scatola' };
const FINISH = ['Opaca', 'Lucida', 'Consigliatemi voi'], USE = [['Interno', 'home'], ['Esterno', 'sun']];
const ART = [['have', 'Ho già la grafica'], ['help', 'Mi serve aiuto'], ['idea', 'Ho solo un’idea']];
let TIERS = {};
const ready = fetch('/data/catalogo/vetrina.json?v=2026-10-28-2').then(r => r.json()).then(v => { (v.custom || []).forEach(sh => Object.assign(TIERS, sh.tiers || {})); }).catch(() => {});

/* ---------- catalogo ---------- */
let fam = 'sticker';
function cards() {
  const box = $('[data-cards]'); if (!box) return;
  box.innerHTML = CARDS[fam].map((c, i) => {
    const t = c.pid && TIERS[c.pid]?.[0];
    const at = `data-config="${c.cfg}"${c.type != null ? ` data-type="${c.type}"` : ''}`;
    return `<article class="ml-item" style="--d:${i * 0.08}s">
      <a class="ml-item-img${c.img ? '' : ' none'}" href="#prodotti" ${at} tabindex="-1" aria-hidden="true">${c.img ? `<img src="${c.img}" alt="" width="480" height="384" loading="lazy" decoding="async">` : esc(c.label || '')}</a>
      <div class="ml-item-b"><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p>
       <div class="ml-item-f"><span>${t ? `da <strong>${euro(t[1])}</strong><br>${t[0].toLocaleString('it-IT')} pz minimo` : c.pid ? 'Prezzo su richiesta' : 'Scegli il formato'}</span><button class="ml-item-go" type="button" ${at} aria-label="Configura ${esc(c.name)}"><svg><use href="#i-arrow"/></svg></button></div></div>
    </article>`;
  }).join('');
  $$('.ml-fams [data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === fam));
  const w = $('[data-cat-word]'); if (w) w.textContent = WORD[fam];
}
function setFam(f) { if (!CARDS[f] || f === fam) return; fam = f; const box = $('[data-cards]'); box.classList.remove('in'); cards(); requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('in'))); }
document.addEventListener('click', e => {
  const t = e.target.closest('.ml-fams [data-tab]'); if (t) { setFam(t.dataset.tab); return; }
  const f = e.target.closest('[data-fam]'); if (f) { e.preventDefault(); setFam(f.dataset.fam); closeMenu?.(); $('#prodotti').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
});

/* ---------- scheda prodotto (configuratore) ---------- */
const dlg = $('.pd'); let st = null;
function openConfig(catId, preset = {}) {
  const c = CATS.find(x => x.id === catId) || CATS[0];
  if (!st || st.cat !== c.id) st = { cat: c.id, shape: 0, mat: 0, type: 0, qty: null, size: 'std', w: '', h: '', fin: 2, use: 0, art: 'have', file: '', idea: '', notes: '', pic: 0 };
  if (preset.mat) { const k = (c.mat || []).findIndex(m => m[1] === preset.mat); if (k >= 0) st.mat = k; }
  if (preset.type != null && c.types) { const k = typeof preset.type === 'number' ? preset.type : c.types.findIndex(t => t[1] === preset.type); if (k >= 0) { st.type = k; st.pic = 0; } }
  $('.pd-tabs', dlg).innerHTML = CATS.map(x => `<button type="button" data-tab="${x.id}" aria-current="${x.id === c.id}">${esc(x.name)}</button>`).join('');
  paint();
  if (!dlg.open) { dlg.showModal(); document.documentElement.style.overflow = 'hidden'; $('.pd-body', dlg).scrollTop = 0; }
  history.replaceState(null, '', '#configura-' + c.id);
}
function closeConfig() { if (dlg.open) dlg.close(); }
dlg?.addEventListener('close', () => { document.documentElement.style.overflow = ''; if (location.hash.startsWith('#configura-')) history.replaceState(null, '', location.pathname + location.search); });
dlg?.addEventListener('click', e => {
  if (e.target === dlg) { closeConfig(); return; }
  const t = e.target.closest('.pd-tabs [data-tab]'); if (t) { openConfig(t.dataset.tab); return; }
  const th = e.target.closest('[data-pic]'); if (th) { st.pic = +th.dataset.pic; paintGallery(resolve()); }
});
$('[data-close]', dlg)?.addEventListener('click', closeConfig);

function resolve() {
  const c = CATS.find(x => x.id === st.cat); let pid, tbd = [], gallery;
  if (c.types) { const t = c.types[st.type]; pid = t[1]; gallery = c.types.map(x => x[2]).filter(Boolean); if (t[2]) gallery = [t[2], ...gallery.filter(g => g !== t[2])]; }
  else {
    pid = c.base; gallery = c.gallery;
    const sh = c.shape[st.shape]; if (sh[1] === 0) tbd.push('forma'); else if (sh[1]) pid = sh[1];
    const m = c.mat[st.mat]; if (m[1] === 0) tbd.push('materiale'); else if (m[1]) pid = m[1];
  }
  if (st.size === 'custom') tbd.push('misura');
  const tiers = TIERS[pid] || [];
  if (!tiers.length) tbd.push('prezzo');
  if (!tiers.some(t => t[0] === st.qty)) st.qty = tiers[0]?.[0] ?? null;
  return { c, pid, tiers, tier: tiers.find(t => t[0] === st.qty), tbd, gallery: gallery.length ? gallery : [C('ga9a0ef-scatole-postali')] };
}
function paintGallery(r) {
  if (st.pic >= r.gallery.length) st.pic = 0;
  $('.pd-thumbs', dlg).innerHTML = r.gallery.length > 1 ? r.gallery.map((g, i) => `<button type="button" role="listitem" data-pic="${i}" aria-current="${i === st.pic}" aria-label="Foto ${i + 1}"><img src="${g}" alt="" width="480" height="384"></button>`).join('') : '';
  const img = $('.pd-main img', dlg), src = big(r.gallery[st.pic]); if (img.dataset.src !== src) { img.dataset.src = src; img.src = src; img.alt = NAME[r.pid] || r.c.name; }
}
const radios = (cls, name, list, sel, fn) => `<div class="${cls}">${list.map((l, i) => `<label><input type="radio" name="${name}" value="${i}"${i === sel ? ' checked' : ''}><span>${fn ? fn(l, i) : esc(l)}</span></label>`).join('')}</div>`;
function paint() {
  const r = resolve(), c = r.c, sticker = !c.types;
  $('#pd-t').textContent = c.types ? c.title : c.title;
  $('.pd-desc', dlg).textContent = c.desc;
  paintGallery(r);
  const tiers = r.tiers, first = tiers.slice(0, 6), rest = tiers.slice(6), inRest = rest.some(t => t[0] === st.qty);
  const outdoorTip = sticker && st.use === 1 && c.mat[st.mat][0] === 'Standard';
  $('.pd-fields', dlg).innerHTML = `
   ${c.types ? `<fieldset class="pd-f"><legend>${esc(c.typeLabel)}</legend>${radios('pd-seg', 'type', c.types.map(t => t[0]), st.type)}</fieldset>` : ''}
   <fieldset class="pd-f"><legend>Quantità <small>· pezzi</small></legend>
    ${tiers.length ? radios('pd-seg', 'qtyb', first.map(t => t[0].toLocaleString('it-IT')), first.findIndex(t => t[0] === st.qty))
      + (rest.length ? `<select class="pd-sel" name="qty" aria-label="Altre quantità" style="margin-top:8px"><option value="">Altre quantità…</option>${rest.map(t => `<option value="${t[0]}"${t[0] === st.qty ? ' selected' : ''}>${t[0].toLocaleString('it-IT')} pz</option>`).join('')}</select>` : '')
      : '<p class="pd-hint">Indicala nelle note.</p>'}</fieldset>
   <fieldset class="pd-f"><legend>Dimensioni</legend>${radios('pd-dots', 'size', ['Formato standard', 'Su misura'], st.size === 'custom' ? 1 : 0)}
    ${st.size === 'custom' ? `<div class="pd-row" style="margin-top:10px"><label><span class="pd-lab">Larghezza (cm)</span><input type="number" name="w" min="1" max="200" step="0.5" inputmode="decimal" value="${esc(st.w)}"></label><label><span class="pd-lab">Altezza (cm)</span><input type="number" name="h" min="1" max="200" step="0.5" inputmode="decimal" value="${esc(st.h)}"></label></div>` : ''}</fieldset>
   ${sticker ? `<fieldset class="pd-f"><legend>Forma</legend>${radios('pd-cards', 'shape', c.shape, st.shape, s => icon(s[2]) + esc(s[0]))}${c.shape[st.shape][1] === 0 ? '<p class="pd-hint">Descrivila nelle note: la confermiamo nel preventivo.</p>' : ''}</fieldset>
   <div class="pd-row"><label class="pd-f"><span class="pd-lab">Materiale</span><select class="pd-sel" name="mat">${c.mat.map((m, i) => `<option value="${i}"${i === st.mat ? ' selected' : ''}>${esc(m[0])}</option>`).join('')}</select></label>
    <fieldset class="pd-f"><legend>Finitura</legend>${radios('pd-dots', 'fin', FINISH.slice(0, 2), st.fin)}</fieldset></div>
   <fieldset class="pd-f"><legend>Uso</legend>${radios('pd-cards pd-use', 'use', USE, st.use, u => `<svg aria-hidden="true"><use href="#i-${u[1]}"/></svg>${u[0]}`)}${outdoorTip ? '<p class="pd-hint warn">Per l’esterno ti consigliamo il materiale impermeabile.</p>' : ''}</fieldset>` : ''}
   <fieldset class="pd-f"><legend>Grafica</legend>${radios('pd-seg', 'art', ART.map(a => a[1]), ART.findIndex(a => a[0] === st.art))}
    ${st.art === 'have' ? `<label class="pd-drop" style="margin-top:10px"><svg aria-hidden="true"><use href="#i-up"/></svg><span><b>${st.file ? esc(st.file) : 'Scegli il tuo file'}</b><small>PDF, AI, EPS, SVG, PNG, JPG · lo alleghi su WhatsApp all’invio</small></span><input type="file" name="file" accept=".png,.jpg,.jpeg,.webp,.pdf,.svg,.ai,.eps,.psd"></label>` : ''}
    ${st.art === 'help' ? '<p class="pd-hint">Ti aiutiamo noi a preparare la grafica: ne parliamo nel preventivo.</p>' : ''}
    ${st.art === 'idea' ? `<textarea name="idea" maxlength="800" placeholder="Raccontaci la tua idea: soggetto, colori, testo…" aria-label="La tua idea" style="margin-top:10px">${esc(st.idea)}</textarea>` : ''}</fieldset>
   <label class="pd-f"><span class="pd-lab">Note <small style="font-weight:500;color:#7a7167">· facoltative</small></span><textarea name="notes" maxlength="800" placeholder="Scadenze, fronte e retro, dove li userai…">${esc(st.notes)}</textarea></label>`;
  price(r);
}
function price(r = resolve()) {
  const box = $('.pd-price', dlg), basis = `Base di prezzo: ${esc(NAME[r.pid] || r.c.name)}, formato standard.`;
  if (r.tier && !r.tbd.length) box.innerHTML = `<span class="tot">${euro(r.tier[1])}</span><span class="unit">${r.tier[0].toLocaleString('it-IT')} pz · ${euro(r.tier[1] / r.tier[0])} al pezzo · IVA inclusa</span><p>${basis} Finiture e dettagli li confermiamo nel preventivo.</p>`;
  else {
    const why = r.tbd.filter(x => x !== 'prezzo').map(x => ({ forma: 'una forma diversa', materiale: 'un materiale diverso', misura: 'una misura personalizzata' })[x]);
    box.innerHTML = `<span class="tbd">Prezzo da confermare</span><span class="unit">${why.length ? 'Hai scelto ' + esc(why.join(', ')) + '.' : 'Questo prodotto lo quotiamo su richiesta.'}</span><p>Te lo diciamo nel preventivo.${r.tiers.length ? ` Il formato standard parte da ${euro(r.tiers[0][1])}.` : ''}</p>`;
  }
}
dlg?.addEventListener('change', e => {
  const el = e.target, n = el.name; if (!st) return;
  if (n === 'qtyb') { const r = resolve(); st.qty = r.tiers[+el.value][0]; const sel = $('[name=qty]', dlg); if (sel) sel.value = ''; price(); return; }
  if (n === 'qty') { if (!el.value) return; st.qty = +el.value; $$('[name=qtyb]', dlg).forEach(x => x.checked = false); price(); return; }
  if (n === 'file') { st.file = el.files?.[0]?.name || ''; const b = $('.pd-drop b', dlg); if (b) b.textContent = st.file || 'Scegli il tuo file'; return; }
  if (['shape', 'mat', 'fin', 'use', 'type'].includes(n)) { st[n] = +el.value; if (n === 'type') st.pic = 0; }
  else if (n === 'size') st.size = el.value === '1' ? 'custom' : 'std';
  else if (n === 'art') st.art = ART[+el.value][0];
  else return;
  const body = $('.pd-body', dlg), y = body.scrollTop; paint(); body.scrollTop = y;
  $(`[name="${n}"]${el.type === 'radio' ? ':checked' : ''}`, dlg)?.focus({ preventScroll: true });
});
dlg?.addEventListener('input', e => { const n = e.target.name; if (['w', 'h', 'idea', 'notes'].includes(n)) st[n] = e.target.value; });
dlg?.addEventListener('submit', e => {
  e.preventDefault(); if (!st || !window.MoiCart) return;
  const r = resolve(), c = r.c, priced = r.tier && !r.tbd.length, sticker = !c.types;
  const size = st.size === 'custom' ? (st.w && st.h ? `${st.w} × ${st.h} cm` : 'Su misura (da definire)') : 'Formato standard';
  const img = r.gallery[st.pic] || r.gallery[0];
  window.MoiCart.add({
    service: 'custom', title: c.types ? NAME[r.pid] : 'Sticker · ' + c.name, qty: st.qty, image: img,
    price: priced ? r.tier[1] / r.tier[0] : null, priceFrom: false, fixedQty: true,
    key: ['skl', c.id, r.pid, st.qty, st.shape, st.mat, size, st.fin, st.use, st.art].join('|'),
    details: [...(sticker ? [['Forma', c.shape[st.shape][0]]] : []), ['Dimensioni', size],
      ...(sticker ? [['Materiale', c.mat[st.mat][0]], ['Finitura', FINISH[st.fin] || 'Da consigliare'], ['Uso', USE[st.use][0]]] : []),
      ['Grafica', ART.find(a => a[0] === st.art)[1]], ['File', st.art === 'have' && st.file ? st.file + ' (lo allego su WhatsApp)' : ''], ['Idea', st.art === 'idea' ? st.idea.trim() : ''], ['Note', st.notes.trim()],
      ['Prezzo', priced ? `listino ${NAME[r.pid]}, formato standard` : 'da confermare']]
  });
  window.MoiCart.fly?.($('.pd-go', dlg), img);
  st = null; closeConfig();
  setTimeout(() => window.MoiCart.open?.(), reduce ? 0 : 650);
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-config]'); if (!b || b.closest('.pd')) return;
  e.preventDefault(); closeMenu(); ready.then(() => openConfig(b.dataset.config, { mat: b.dataset.mat, type: b.dataset.type != null ? +b.dataset.type : undefined }));
});

/* ---------- intestazione: menu, preventivo ---------- */
const burger = $('.ml-burger'), nav = $('#ml-nav');
function closeMenu() { nav?.classList.remove('is-open'); burger?.setAttribute('aria-expanded', 'false'); }
burger?.addEventListener('click', () => { const o = !nav.classList.contains('is-open'); nav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', o); });
nav?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
$('[data-cart-open]')?.addEventListener('click', () => window.MoiCart?.open());
$('[data-quote]')?.addEventListener('click', e => { if ((window.MoiCart?.count?.() || 0) > 0) { e.preventDefault(); window.MoiCart.open(); } });
const bagN = $('.ml-bag-n');
const syncBag = () => { const n = window.MoiCart?.count?.() || 0; if (bagN) { bagN.hidden = !n; bagN.textContent = n; } };
setInterval(() => { if (!document.hidden) syncBag(); }, 1200); syncBag();

/* ---------- richieste particolari: finiscono nello stesso preventivo ---------- */
const ask = $('[data-ask]');
if (ask) {
  const q = $('#ml-ask-q', ask), err = $('.ml-ask-err', ask), wa = $('[data-ask-wa]', ask);
  const waURL = () => `https://wa.me/${WA}?text=${encodeURIComponent('Ciao MOI LAB, ho una richiesta particolare: ' + (q.value.trim() || ''))}`;
  wa.href = waURL(); q.addEventListener('input', () => { wa.href = waURL(); err.textContent = ''; });
  ask.addEventListener('submit', e => {
    e.preventDefault(); const t = q.value.trim();
    if (t.length < 4) { err.classList.remove('ok'); err.textContent = 'Scrivi in poche parole cosa ti serve.'; q.focus(); return; }
    if (!window.MoiCart) return;
    window.MoiCart.add({ service: 'custom', title: 'Richiesta particolare', details: [['Richiesta', t]] });
    window.MoiCart.fly?.($('button[type=submit]', ask));
    q.value = ''; wa.href = waURL(); err.classList.add('ok'); err.textContent = 'Aggiunta al preventivo.';
    setTimeout(() => window.MoiCart.open?.(), reduce ? 0 : 600);
  });
}

/* ---------- recensione: la prima vera, altrimenti un invito dichiarato ---------- */
fetch('/data/recensioni.json?v=20261030-1').then(r => r.json()).then(d => {
  const items = (d.items || []).filter(x => x && x.testo), box = $('[data-review]'); if (!box || !items.length) return;
  const x = items.find(i => i.tipo === 'recensione') || items[0], real = x.tipo === 'recensione', n = real ? Math.max(1, Math.min(5, +x.stelle || 0)) : 0;
  box.insertAdjacentHTML('beforeend', `${real ? '' : '<span class="ml-tag-demo">IN ARRIVO · NON È UNA RECENSIONE</span>'}
    <div class="ml-stars${n ? ' on' : ''}" aria-label="${n ? n + ' stelle su 5' : 'Nessuna valutazione'}">${[1, 2, 3, 4, 5].map(i => `<svg aria-hidden="true" style="${n && i > n ? 'color:#ddd0bd' : ''}"><use href="#i-star"/></svg>`).join('')}</div>
    <p class="ml-quote">${real ? '“' + esc(x.titolo || x.testo.split('.')[0]) + '”' : 'La prima recensione può essere la tua.'}</p>
    <p>${esc(x.testo)}</p>
    <div class="ml-who"><i aria-hidden="true">${esc((x.nome || 'M')[0])}</i><div><b>${esc(x.nome)}</b><small>${esc(x.ruolo)}</small></div></div>
    ${real ? '' : `<a class="ml-btn ml-btn-wine" href="https://wa.me/${WA}?text=${encodeURIComponent('Ciao MOI LAB, vorrei lasciare una recensione: ')}" target="_blank" rel="noopener">Lascia una recensione <svg><use href="#i-arrow"/></svg></a>`}`);
}).catch(() => {});

/* ---------- animazioni ---------- */
const hero = $('.ml-hero');
const go = () => hero?.classList.add('go');
(document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(go)); setTimeout(go, 1200);
if (!reduce && fine && hero) {
  const layers = $$('[data-d]', hero); let raf = 0, mx = 0, my = 0;
  hero.addEventListener('pointermove', e => { const b = hero.getBoundingClientRect(); mx = (e.clientX - b.left) / b.width - .5; my = (e.clientY - b.top) / b.height - .5; if (!raf) raf = requestAnimationFrame(() => { raf = 0; layers.forEach(l => { const d = +l.dataset.d; l.style.translate = `${(-mx * d).toFixed(1)}px ${(-my * d * .8).toFixed(1)}px`; }); }); });
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
function fit() { $$('.ml-h1').forEach(h => { h.style.fontSize = ''; const max = h.clientWidth; let f = parseFloat(getComputedStyle(h).fontSize), i = 0; while (Math.max(...[...h.children].map(c => c.scrollWidth)) > max + 1 && i++ < 40) { f *= .97; h.style.fontSize = f + 'px'; } }); }
(document.fonts?.ready || Promise.resolve()).then(fit); addEventListener('resize', () => { clearTimeout(fit.t); fit.t = setTimeout(fit, 150); });
const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
ready.then(() => {
  cards(); watch();
  const sm = $('.ml-card small[data-from]'), t = sm && TIERS[sm.dataset.from]?.[0]; if (t) sm.textContent = `Da ${euro(t[1])} · forma, misura e materiale a scelta`;
  const fromHash = () => { const m = location.hash.match(/^#configura-([a-z]+)(?:-(G[0-9A-F]{6}))?/); if (!m) return; st = null; const c = CATS.find(x => x.id === m[1]); openConfig(m[1], c?.types ? { type: m[2] } : { mat: m[2] }); if (c) setFam(c.fam); };
  fromHash(); addEventListener('hashchange', fromHash);
});
})();
