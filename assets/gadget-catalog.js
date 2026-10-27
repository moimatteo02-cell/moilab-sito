/* MOI LAB — catalogo «Gadget e oggetti», «Insegne» e «Stampa e grafica» (data/catalogo/*.json).
   Cerca, filtra per categoria, apri la scheda, scegli colore e quantità, aggiungi al carrello del preventivo.
   Prezzi «da … al pezzo» IVA inclusa: il prezzo finale lo confermiamo nel preventivo. */
(() => {
const ROOMS = {
  custom: { room: 'moi-showroom-custom', k: 'MOI LAB / GADGET E OGGETTI / CATALOGO', h: 'Tutti i gadget,', em: 'con il tuo logo.', lead: 'Penne, borracce, tazze, tecnologia, packaging e regali: scegli il prodotto, il colore e la quantità, poi chiedi il preventivo.', ph: 'Cerca: penna, borraccia, tazza…' },
  signage: { room: 'moi-showroom-signage', k: 'MOI LAB / INSEGNE / CATALOGO', h: 'Striscioni, cartelli', em: 'e allestimenti.', lead: 'Roll-up, bandiere, poster, pannelli e tutto per fiere ed eventi.', ph: 'Cerca: roll-up, bandiera, pannello…' },
  design: { room: 'moi-showroom-design', k: 'MOI LAB / GRAFICA / STAMPA', h: 'La tua grafica,', em: 'stampata bene.', lead: 'Biglietti da visita, volantini, opuscoli, menu, inviti: la grafica la curiamo noi, se vuoi.', ph: 'Cerca: biglietti, volantini, menu…' }
};
const PAGE = 24;
const NAV = window.MoiCatalogNavigation;
const VERSION = '20261027-8';
const catalogCache = new Map();
let mediaPromise;
const getMedia = () => mediaPromise ||= fetch(`/data/catalogo/media.json?v=${VERSION}`).then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).catch(() => ({items:{}}));
function getCatalog(key) {
  if (!catalogCache.has(key)) catalogCache.set(key, Promise.all([
    fetch(`/data/catalogo/${key}.json?v=${VERSION}`).then(r => { if (!r.ok) throw Error(r.status); return r.json(); }), getMedia()
  ]).then(([d, m]) => d.items.map(x => ({...x, _service:key, _media:m.items[x.id]}))).catch(e => { catalogCache.delete(key); throw e; }));
  return catalogCache.get(key);
}
function picture(x, hero = false) {
  const m = x._media;
  if (!m || m.status !== 'verified') return icon(x.ic, hero ? 'gk-ic-big' : '');
  return `<img class="gk-photo" src="${esc(m.src)}" srcset="${esc(m.small)} 480w, ${esc(m.src)} 960w" sizes="${hero ? '(max-width:640px) 100vw, 520px' : '(max-width:640px) 48vw, (max-width:1100px) 30vw, 240px'}" width="960" height="768" alt="${esc(m.alt)}" loading="${hero ? 'eager' : 'lazy'}" decoding="async">`;
}
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const euro = n => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 3 : 2 });
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const TINTS = ['#efe6d6', '#e3ebe6', '#e6e9f0', '#f0e5e3', '#ece6f1', '#e8eee0', '#f2ecdc', '#e2ecef'];
const COLORS = { nero: '#1b1b1b', bianco: '#f7f7f5', white: '#f7f7f5', black: '#1b1b1b', grigio: '#9a9a9a', antracite: '#3a3d40', argento: '#c7c9cc', silver: '#c7c9cc', blu: '#2b5bd7', navy: '#1f2b4d', 'blu navy': '#1f2b4d', 'blu reale': '#2a49b8', azzurro: '#7cc0ea', rosso: '#d23b33', bordeaux: '#6d1f2a', verde: '#2f8a4c', giallo: '#f2c230', arancione: '#f08a24', rosa: '#f2a2bd', viola: '#7b4bb5', marrone: '#6e4a2f', beige: '#d9c89e', oro: '#c9a24c', trasparente: '#e9eef2', titanio: '#7c7f84', naturale: '#e2d3b5', legno: '#b98a5a', kraft: '#b88c5a', tortora: '#a8998a' };
const colorHex = name => { const n = norm(name); if (COLORS[n]) return COLORS[n]; const k = Object.keys(COLORS).sort((a, b) => b.length - a.length).find(x => n.includes(x)); return k ? COLORS[k] : '#cfcac0'; };
const icon = (ic, cls = '') => `<svg class="gk-ic ${cls}" viewBox="0 0 48 48" aria-hidden="true">${(window.MoiGadgetIcons || {})[ic] || ''}</svg>`;

function mount(key, cfg) {
  const room = document.getElementById(cfg.room); if (!room) return;
  const anchor = room.querySelector('.mm-sign') || room.querySelector('.moi-room-content'); if (!anchor) return;
  const sec = document.createElement('section'); sec.className = 'gk'; sec.id = 'gk-' + key; sec.setAttribute('aria-label', 'Catalogo');
  sec.innerHTML = `<header class="gk-head"><p class="gk-k">${cfg.k}</p><h2>${esc(cfg.h)} <em>${esc(cfg.em)}</em></h2><p class="gk-lead">${esc(cfg.lead)}</p></header>
    <div class="gk-tools"><label class="gk-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="gk-sr">Cerca nel catalogo</span><input type="search" placeholder="${esc(cfg.ph)}" autocomplete="off"></label>
      <select class="gk-sort" aria-label="Ordina"><option value="">Consigliati</option><option value="pa">Prezzo: dal più basso</option><option value="pd">Prezzo: dal più alto</option><option value="q">Quantità minima più bassa</option></select>
      <label class="gk-nomin"><input type="checkbox"> Anche 1 pezzo</label></div>
    <div class="gk-discover"><label>Esplora per esigenza<select class="gk-path"><option value="">Tutti gli utilizzi</option>${NAV.paths.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></label>
      <label>Macroarea<select class="gk-family"><option value="">Tutte le macroaree</option></select></label>
      <label class="gk-global"><input type="checkbox"> Cerca anche negli altri servizi</label>
      <button class="gk-reset" type="button">Azzera filtri</button></div>
    <div class="gk-cats" role="tablist" aria-label="Categorie"></div><div class="gk-subs" aria-label="Sottocategorie"></div>
    <p class="gk-count" aria-live="polite">Carico il catalogo…</p><div class="gk-grid"></div><div class="gk-more-wrap"><button type="button" class="gk-more" hidden>Mostra altri</button></div>`;
  anchor.after(sec);
  let data = null, loading = false, generation = 0, st = { q: '', cat: '', sub: '', sort: '', one: false, family:'', path:'', global:false, shown: PAGE };
  const $ = s => sec.querySelector(s);
  const load = async (reload = false) => {
    if (!reload && (data || loading)) return;
    const token = ++generation; loading = true;
    $('.gk-count').textContent = 'Carico il catalogo…';
    sec.setAttribute('aria-busy','true');
    try {
      const catalogs = await Promise.all((st.global ? Object.keys(ROOMS) : [key]).map(getCatalog));
      if (token !== generation) return;
      data = catalogs.flat();
      data.forEach((x, i) => { x._i = i; });
      const cats = [...new Set(data.map(x => x.cat))];
      sec._tint = Object.fromEntries(cats.map((c, i) => [c, TINTS[i % TINTS.length]]));
      const families = [...new Set(data.map(NAV.family))];
      $('.gk-family').innerHTML = '<option value="">Tutte le macroaree</option>' + families.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('');
      $('.gk-family').value = st.family;
      render();
    } catch {
      if (token !== generation) return;
      data = null; $('.gk-grid').innerHTML = ''; $('.gk-more').hidden = true;
      $('.gk-count').innerHTML = 'Catalogo non disponibile. <button type="button" class="gk-retry">Riprova</button>';
      $('.gk-retry').addEventListener('click', () => load(true));
    } finally { if (token === generation) { loading = false; sec.removeAttribute('aria-busy'); } }
  };
  const filtered = () => {
    let l = data.filter(x => (!st.cat || x.cat === st.cat) && (!st.sub || x.sub === st.sub) && (!st.one || x.q === 1) && (!st.family || NAV.family(x) === st.family) && NAV.inPath(x, st.path) && NAV.matches(x, st.q));
    if (!st.sort) l = l.slice().sort((a, b) => (a.o ?? 0) - (b.o ?? 0)); else if (st.sort === 'pa') l = l.slice().sort((a, b) => a.p - b.p); else if (st.sort === 'pd') l = l.slice().sort((a, b) => b.p - a.p); else if (st.sort === 'q') l = l.slice().sort((a, b) => a.q - b.q || a.p - b.p);
    return l;
  };
  const card = x => `<button type="button" class="gk-card" data-id="${x.id}"><span class="gk-pic" style="--gk-t:${sec._tint[x.cat]};--gk-c:${x.col && x.col.length ? colorHex(x.col[0]) : 'transparent'}"><span class="gk-blob"></span>${picture(x)}${x.col && x.col.length > 1 ? `<span class="gk-dots">${x.col.slice(0, 5).map(c => `<i style="background:${colorHex(c)}"></i>`).join('')}${x.col.length > 5 ? `<b>+${x.col.length - 5}</b>` : ''}</span>` : ''}</span>
    <span class="gk-sub">${st.global ? esc(ROOMS[x._service].k.split(' / ')[1]) + ' · ' : ''}${esc(x.sub)}</span><span class="gk-n">${esc(x.n)}</span><span class="gk-p">da <b>${euro(x.p)}</b> al pezzo</span><span class="gk-q">${x.q > 1 ? `Minimo ${x.q} pezzi` : 'Anche 1 pezzo'}</span></button>`;
  function render() {
    if (!data) return;
    const all = data.filter(x => (!st.one || x.q === 1) && (!st.family || NAV.family(x) === st.family) && NAV.inPath(x,st.path));
    const cats = {}; all.forEach(x => { cats[x.cat] = (cats[x.cat] || 0) + 1; });
    if (st.cat && !cats[st.cat]) { st.cat = ''; st.sub = ''; }
    $('.gk-cats').innerHTML = `<button type="button" role="tab" aria-selected="${!st.cat}" data-cat="">Tutto <small>${all.length}</small></button>` + Object.entries(cats).map(([c, n]) => `<button type="button" role="tab" aria-selected="${st.cat === c}" data-cat="${esc(c)}">${esc(c)} <small>${n}</small></button>`).join('');
    const subs = {}; if (st.cat) all.filter(x => x.cat === st.cat).forEach(x => { subs[x.sub] = (subs[x.sub] || 0) + 1; });
    const subList = Object.entries(subs);
    $('.gk-subs').innerHTML = subList.length > 1 ? `<button type="button" aria-pressed="${!st.sub}" data-sub="">Tutte</button>` + subList.map(([s, n]) => `<button type="button" aria-pressed="${st.sub === s}" data-sub="${esc(s)}">${esc(s)} <small>${n}</small></button>`).join('') : '';
    const l = filtered();
    $('.gk-count').textContent = l.length ? `${l.length.toLocaleString('it-IT')} ${l.length === 1 ? 'prodotto' : 'prodotti'}` : 'Nessun prodotto: prova un’altra parola o togli i filtri.';
    $('.gk-grid').innerHTML = l.slice(0, st.shown).map(card).join('');
    const more = $('.gk-more'), rest = l.length - st.shown; more.hidden = rest <= 0; more.textContent = `Mostra altri ${Math.min(PAGE, rest)} · ne restano ${rest.toLocaleString('it-IT')}`;
  }
  const resetNavigation = () => { st.cat = ''; st.sub = ''; st.shown = PAGE; };
  $('.gk-family').addEventListener('change', e => { st.family = e.target.value; resetNavigation(); render(); });
  $('.gk-path').addEventListener('change', e => { st.path = e.target.value; resetNavigation(); render(); });
  $('.gk-global input').addEventListener('change', e => { st.global = e.target.checked; st.family = ''; resetNavigation(); load(true); });
  $('.gk-reset').addEventListener('click', () => {
    st.q = ''; st.family = ''; st.path = ''; st.one = false; st.sort = ''; resetNavigation();
    $('.gk-search input').value = ''; $('.gk-family').value = ''; $('.gk-path').value = '';
    $('.gk-nomin input').checked = false; $('.gk-sort').value = ''; render();
  });
  let t = 0;
  $('.gk-search input').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value; st.shown = PAGE; render(); }, 180); });
  $('.gk-sort').addEventListener('change', e => { st.sort = e.target.value; st.shown = PAGE; render(); });
  $('.gk-nomin input').addEventListener('change', e => { st.one = e.target.checked; st.shown = PAGE; render(); });
  $('.gk-cats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; st.cat = b.dataset.cat; st.sub = ''; st.shown = PAGE; render(); });
  $('.gk-subs').addEventListener('click', e => { const b = e.target.closest('[data-sub]'); if (!b) return; st.sub = b.dataset.sub; st.shown = PAGE; render(); });
  $('.gk-more').addEventListener('click', () => { st.shown += PAGE; render(); });
  $('.gk-grid').addEventListener('click', e => { const b = e.target.closest('.gk-card'); if (!b) return; const x = data.find(x => x.id === b.dataset.id); if (x) sheet(x, sec._tint[x.cat], b); });
  // il catalogo si carica quando entri nel servizio (o quando lo vedi)
  const io = new IntersectionObserver(en => { if (en.some(x => x.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '600px' }); io.observe(sec);
  new MutationObserver(() => { if (room.classList.contains('is-active')) load(); }).observe(room, { attributes: true, attributeFilter: ['class'] });
  if (room.classList.contains('is-active')) load();
}

/* ---------- scheda prodotto ---------- */
let sh = null;
function sheet(x, tint, opener) {
  if (!sh) {
    sh = document.createElement('div'); sh.className = 'gk-sheet'; sh.innerHTML = '<div class="gk-veil" data-x></div><div class="gk-panel" role="dialog" aria-modal="true" aria-labelledby="gk-t"></div>';
    document.body.append(sh);
    sh.addEventListener('click', e => { if (e.target.closest('[data-x]')) closeSheet(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && sh.classList.contains('is-open')) closeSheet(); });
  }
  sh._opener = opener;
  const qs = [x.q, 10, 25, 50, 100, 250, 500, 1000].filter((v, i, a) => v >= x.q && a.indexOf(v) === i).slice(0, 5);
  let qty = x.q, color = x.col && x.col.length ? x.col[0] : '';
  const p = sh.querySelector('.gk-panel');
  p.innerHTML = `<button type="button" class="gk-x" data-x aria-label="Chiudi">×</button>
    <div class="gk-hero" style="--gk-t:${tint};--gk-c:${color ? colorHex(color) : 'transparent'}"><span class="gk-blob"></span>${picture(x, true)}</div>
    <div class="gk-body"><p class="gk-crumb">${esc(x.cat)} · ${esc(x.sub)}</p><h3 id="gk-t">${esc(x.n)}</h3>
    ${x._media?.description ? `<p class="gk-description">${esc(x._media.description)}</p>` : ''}
    ${x._media?.status === 'verified' ? '<p class="gk-disclaimer">Esempio di personalizzazione MOI · mockup illustrativo. Grafica, colori e opzioni vengono confermati nel preventivo.</p>' : ''}
    <p class="gk-price">da <b>${euro(x.p)}</b> al pezzo <small>IVA inclusa · più ne prendi, meno costa</small></p>
    ${x.col && x.col.length ? `<div class="gk-f"><p>Colore <b data-cn>${esc(color)}</b></p><div class="gk-colors">${x.col.map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-c="${esc(c)}" title="${esc(c)}" style="--c:${colorHex(c)}"><span class="gk-sr">${esc(c)}</span></button>`).join('')}</div></div>` : ''}
    <div class="gk-f"><p>Quantità <small>${x.q > 1 ? `minimo ${x.q} pezzi` : 'anche 1 pezzo'}</small></p>
      <div class="gk-qty"><button type="button" data-d="-1" aria-label="Meno">−</button><input type="number" inputmode="numeric" min="${x.q}" value="${x.q}" aria-label="Quantità"><button type="button" data-d="1" aria-label="Più">+</button></div>
      <div class="gk-qs">${qs.map(v => `<button type="button" data-q="${v}">${v}</button>`).join('')}</div></div>
    <p class="gk-est">Stima: <b data-est></b> <small>prezzo finale nel preventivo, con la stampa del tuo logo</small></p>
    <label class="gk-f gk-note">Dettagli · facoltativo<textarea rows="2" maxlength="400" placeholder="Es. logo a 1 colore, scritta, data di consegna…"></textarea></label>
    <button type="button" class="gk-add">Aggiungi al carrello +</button><p class="gk-code">Codice ${esc(x.id)}</p></div>`;
  const inp = p.querySelector('.gk-qty input'), est = p.querySelector('[data-est]');
  const upd = () => { qty = Math.max(x.q, Math.round(+inp.value || x.q)); est.textContent = 'da ' + euro(Math.round(x.p * qty * 100) / 100); p.querySelectorAll('[data-q]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.q === qty))); };
  p.querySelector('.gk-qty').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; const step = qty >= 100 ? 10 : 1; inp.value = Math.max(x.q, qty + step * +b.dataset.d); upd(); });
  inp.addEventListener('change', () => { inp.value = Math.max(x.q, Math.round(+inp.value || x.q)); upd(); });
  inp.addEventListener('input', upd);
  p.querySelector('.gk-qs').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (!b) return; inp.value = b.dataset.q; upd(); });
  p.querySelector('.gk-colors')?.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; color = b.dataset.c; p.querySelectorAll('[data-c]').forEach(z => z.setAttribute('aria-pressed', String(z === b))); p.querySelector('[data-cn]').textContent = color; p.querySelector('.gk-hero').style.setProperty('--gk-c', colorHex(color)); });
  p.onkeydown = e => {
    if (e.key !== 'Tab') return;
    const focusable = [...p.querySelectorAll('button,input,textarea,select,a[href]')].filter(el => !el.disabled && el.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length-1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  p.querySelector('.gk-add').addEventListener('click', e => {
    if (!window.MoiCart) return; upd();
    const note = p.querySelector('textarea').value.trim(), svc = sh._svc;
    window.MoiCart.fly(e.currentTarget);
    window.MoiCart.add({ service: svc, image: x._media?.src || '', title: x.n, qty, price: x.p, priceFrom: true, key: ['gk', x.id, color].join('|'),
      details: [['Codice', x.id], ['Categoria', x.cat + ' · ' + x.sub], color ? ['Colore', color] : null, ['Prezzo indicativo', 'da ' + euro(x.p) + ' al pezzo'], note ? ['Dettagli', note] : null].filter(Boolean) });
    setTimeout(closeSheet, 450);
  });
  sh._svc = x._service || opener.closest('.gk')?.id.replace('gk-', '') || 'custom';
  upd(); sh.classList.add('is-open'); document.documentElement.classList.add('gk-lock');
  setTimeout(() => p.querySelector('.gk-x').focus({ preventScroll: true }), 60);
}
function closeSheet() { sh.classList.remove('is-open'); document.documentElement.classList.remove('gk-lock'); sh._opener?.focus?.({ preventScroll: true }); }

const start = () => Object.entries(ROOMS).forEach(([k, c]) => mount(k, c));
// le insegne al neon le crea moi-motion-extra.js: aspetto un attimo per mettermi sotto di loro
const go = () => setTimeout(start, 300);
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
