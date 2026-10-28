/* MOI LAB — catalogo «Gadget e oggetti», «Insegne» e «Stampa e grafica» (data/catalogo/*.json).
   Cerca, filtra per categoria, apri la scheda, scegli colore e quantità, aggiungi al carrello del preventivo.
   Prezzi «da … al pezzo» IVA inclusa: il prezzo finale lo confermiamo nel preventivo. */
(() => {
const ROOMS = {
  custom: { room: 'moi-showroom-custom', k: 'MOI LAB / CUSTOM / CATALOGO', h: 'Sticker, biglietti e scatole,', em: 'fatti bene.', lead: 'Pochi prodotti, scelti con cura: scegli il formato e la quantità, il prezzo finale con la tua grafica lo confermiamo nel preventivo.', ph: 'Cerca: adesivi rotondi, biglietti opachi, scatole…' },
  signage: { room: 'moi-showroom-signage', k: 'MOI LAB / INSEGNE / CATALOGO', h: 'Striscioni, cartelli', em: 'e allestimenti.', lead: 'Roll-up, bandiere, poster, pannelli e tutto per fiere ed eventi.', ph: 'Cerca: roll-up, bandiera, pannello…' },
  design: { room: 'moi-showroom-design', k: 'MOI LAB / GRAFICA / STAMPA', h: 'La tua grafica,', em: 'stampata bene.', lead: 'Biglietti da visita, volantini, opuscoli, menu, inviti: la grafica la curiamo noi, se vuoi.', ph: 'Cerca: biglietti, volantini, menu…' }
};
const PAGE = 30;
const NAV = window.MoiCatalogNavigation;
const VERSION = '20261028-4';
const catalogCache = new Map();
let mediaPromise;
// due registri immagini: media.json (lotti A, ChatGPT) e media-claude.json (lotti B, Claude). Nessuno dei due tocca l'altro.
const getManifest = f => fetch(`/data/catalogo/${f}?v=${VERSION}`).then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).catch(() => ({ items: {} }));
const getMedia = () => mediaPromise ||= Promise.all([getManifest('media.json'), getManifest('media-claude.json')]).then(([a, b]) => ({ items: { ...b.items, ...a.items } }));
function getCatalog(key) {
  if (!catalogCache.has(key)) catalogCache.set(key, Promise.all([
    fetch(`/data/catalogo/${key}.json?v=${VERSION}`).then(r => { if (!r.ok) throw Error(r.status); return r.json(); }), getMedia()
  ]).then(([d, m]) => d.items.map(x => ({ ...x, _service: key, _media: m.items[x.id] }))).catch(e => { catalogCache.delete(key); throw e; }));
  return catalogCache.get(key);
}
const getAll = () => Promise.all(Object.keys(ROOMS).map(getCatalog)).then(l => l.flat());
/* vetrina: per i servizi elencati in data/catalogo/vetrina.json il catalogo mostra solo i prodotti scelti, divisi in pochi scaffali */
let vetrinaP;
const getVetrina = () => vetrinaP ||= fetch(`/data/catalogo/vetrina.json?v=${VERSION}`).then(r => r.ok ? r.json() : {}).catch(() => ({}));
async function getShelves(key) {
  const v = (await getVetrina())[key]; if (!v) return null;
  const pool = new Map((await getAll()).map(x => [x.id, x]));
  // listino a scaglioni come dal fornitore: [[quantità, totale IVA inclusa], …]; minimo = primo scaglione
  return v.flatMap(sh => sh.ids.map((id, i) => { const x = pool.get(id); if (!x) return null; const t = sh.tiers && sh.tiers[id];
    return { ...x, cat: sh.name, sub: sh.name, o: i, ...(t ? { t, q: t[0][0], p: t[0][1] / t[0][0], from: t[0][1] } : {}) }; })).filter(Boolean);
}
const SVC = { custom: 'Gadget', signage: 'Insegne', design: 'Stampa' };
const ORDER = { custom: ['Tazze e bicchieri', 'Borracce', 'Penne e scrittura', 'Quaderni e blocchi', 'Tecnologia', 'Tempo libero', 'Casa', 'Ufficio', 'Portachiavi', 'Adesivi ed etichette', 'Regali con foto', 'Dolci e snack', 'Packaging', 'Packaging per alimenti'] };
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const euro = n => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 3 : 2 });
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const TINTS = ['#efe6d6', '#e3ebe6', '#e6e9f0', '#f0e5e3', '#ece6f1', '#e8eee0', '#f2ecdc', '#e2ecef'];
const COLORS = { nero: '#1b1b1b', bianco: '#f7f7f5', white: '#f7f7f5', black: '#1b1b1b', grigio: '#9a9a9a', antracite: '#3a3d40', argento: '#c7c9cc', silver: '#c7c9cc', blu: '#2b5bd7', navy: '#1f2b4d', 'blu navy': '#1f2b4d', 'blu reale': '#2a49b8', azzurro: '#7cc0ea', rosso: '#d23b33', bordeaux: '#6d1f2a', verde: '#2f8a4c', giallo: '#f2c230', arancione: '#f08a24', rosa: '#f2a2bd', viola: '#7b4bb5', marrone: '#6e4a2f', beige: '#d9c89e', oro: '#c9a24c', trasparente: '#e9eef2', titanio: '#7c7f84', naturale: '#e2d3b5', legno: '#b98a5a', kraft: '#b88c5a', tortora: '#a8998a' };
const colorHex = name => { const n = norm(name); if (COLORS[n]) return COLORS[n]; const k = Object.keys(COLORS).sort((a, b) => b.length - a.length).find(x => n.includes(x)); return k ? COLORS[k] : '#cfcac0'; };
const icon = (ic, cls = '') => `<svg class="gk-ic ${cls}" viewBox="0 0 48 48" aria-hidden="true">${(window.MoiGadgetIcons || {})[ic] || ''}</svg>`;
/* immagini delle sottocategorie: data/catalogo/immagini.json elenca i file presenti in /assets/catalogo/ */
let IMGS = null;
const imgsReady = fetch(`/data/catalogo/immagini.json?v=${VERSION}`).then(r => r.ok ? r.json() : []).catch(() => []).then(l => { IMGS = new Set(l); });
const imgOf = (key, sub) => IMGS && IMGS.has(key + '-' + slug(sub)) ? `/assets/catalogo/categorie/${key}-${slug(sub)}.webp` : '';
/* immagine di un prodotto: mockup specifico verificato → immagine della sottocategoria → illustrazione */
function picture(x, size = 'row') {
  const m = x._media;
  if (m && m.status === 'verified') return `<img class="gk-photo" src="${esc(size === 'hero' ? m.src : m.small)}" ${size === 'hero' ? `srcset="${esc(m.small)} 480w, ${esc(m.src)} 960w" sizes="(max-width:640px) 100vw, 520px"` : ''} width="960" height="768" alt="${esc(m.alt)}" loading="${size === 'hero' ? 'eager' : 'lazy'}" decoding="async">`;
  const c = size === 'hero' && imgOf(x._service, x.sub);
  if (c) return `<img class="gk-photo gk-photo-cat" src="${c}" alt="" loading="${size === 'hero' ? 'eager' : 'lazy'}" decoding="async">`;
  return icon(x.ic, size === 'hero' ? 'gk-ic-big' : '');
}
const dots = (col, max = 5) => col && col.length > 1 ? `<span class="gk-dots">${col.slice(0, max).map(c => `<i style="background:${colorHex(c)}"></i>`).join('')}${col.length > max ? `<b>+${col.length - max}</b>` : ''}</span>` : '';
const plural = n => `${n.toLocaleString('it-IT')} ${n === 1 ? 'prodotto' : 'prodotti'}`;

function mount(key, cfg) {
  const room = document.getElementById(cfg.room); if (!room) return;
  const anchor = room.querySelector('.mm-sign') || room.querySelector('.moi-room-content'); if (!anchor) return;
  const sec = document.createElement('section'); sec.className = 'gk'; sec.id = 'gk-' + key; sec.setAttribute('aria-label', 'Catalogo');
  sec.innerHTML = `<header class="gk-head"><p class="gk-k">${cfg.k}</p><h2>${esc(cfg.h)} <em>${esc(cfg.em)}</em></h2><p class="gk-lead">${esc(cfg.lead)}</p></header>
    <label class="gk-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="gk-sr">Cerca nel catalogo</span><input type="search" placeholder="${esc(cfg.ph)}" autocomplete="off"><button type="button" class="gk-clear" hidden aria-label="Cancella la ricerca">×</button></label>
    <div class="gk-view" aria-live="polite"><p class="gk-count">Carico il catalogo…</p></div>`;
  anchor.after(sec);
  const $ = s => sec.querySelector(s), view = $('.gk-view'), input = $('.gk-search input');
  let curated = false, data = null, all = null, loading = false, cats = [], tint = {};
  let st = { v: 'home', cat: '', sub: '', path: '', q: '', global: false, sort: '', one: false, shown: PAGE };

  const load = async () => {
    if (data || loading) return; loading = true; sec.setAttribute('aria-busy', 'true');
    try { const [shelf] = await Promise.all([getShelves(key), imgsReady]); curated = !!shelf; if (curated) sec.dataset.curated = '1'; data = shelf || await getCatalog(key); }
    catch { loading = false; sec.removeAttribute('aria-busy'); view.innerHTML = '<p class="gk-count">Catalogo non disponibile. <button type="button" class="gk-retry">Riprova</button></p>'; return; }
    loading = false; sec.removeAttribute('aria-busy');
    const by = {}; data.forEach(x => { const c = by[x.cat] || (by[x.cat] = { name: x.cat, n: 0, min: Infinity, ic: x.ic, subs: {} }); c.n++; c.min = Math.min(c.min, x.from ?? x.p);
      const s = c.subs[x.sub] || (c.subs[x.sub] = { name: x.sub, n: 0, min: Infinity, ic: x.ic }); s.n++; s.min = Math.min(s.min, x.from ?? x.p); });
    const ord = ORDER[key] || [];
    cats = Object.values(by).map(c => ({ ...c, subs: Object.values(c.subs).sort((a, b) => b.n - a.n) }))
      .sort((a, b) => curated ? 0 : ((ord.indexOf(a.name) + 1 || 99) - (ord.indexOf(b.name) + 1 || 99)) || b.n - a.n);
    const mock = (cat, sub) => data.find(x => x.cat === cat && (!sub || x.sub === sub) && x._media?.status === 'verified')?._media.small || '';
    cats.forEach((c, i) => { tint[c.name] = TINTS[i % TINTS.length]; c.subs.forEach(s => { s.img = imgOf(key, s.name) || mock(c.name, s.name); }); c.img = c.subs.map(s => imgOf(key, s.name)).find(Boolean) || mock(c.name) ; });
    // percorsi per esigenza e «cerca in tutti i servizi» usano anche gli altri cataloghi: li carico in background
    if (!curated) getAll().then(l => { all = l; let i = cats.length; l.forEach(x => { if (!tint[x.cat]) tint[x.cat] = TINTS[i++ % TINTS.length]; }); if (st.path || st.global) render(); }).catch(() => {});
    try { history.replaceState({ ...(history.state || {}), gk: key, st: { ...st }, y: room.scrollTop }, ''); } catch {}
    render();
  };

  /* ---------- pezzi ---------- */
  const tile = (t, attrs) => `<button type="button" class="gk-tile${t.img ? ' has-img' : ''}" ${attrs}>
      <span class="gk-tile-pic" style="--gk-t:${t.tint}">${t.img ? `<img src="${t.img}" alt="" loading="lazy" decoding="async">` : `<span class="gk-blob"></span>${icon(t.ic)}`}</span>
      <span class="gk-tile-txt"><b>${esc(t.name)}</b><small>${plural(t.n)} · da ${euro(t.min)}</small></span><span class="gk-tile-go" aria-hidden="true">→</span></button>`;
  const row = x => `<button type="button" class="gk-row" data-id="${x.id}" data-svc="${x._service}"><span class="gk-row-pic" style="--gk-t:${tint[x.cat] || TINTS[0]}">${picture(x)}</span>
      <span class="gk-row-main">${x._service !== key && !curated ? `<em class="gk-svc">${SVC[x._service]} · ${esc(x.sub)}</em>` : ''}<b>${esc(x.n)}</b><small>${dots(x.col)}${x.col && x.col.length > 1 ? `<span>${x.col.length} colori</span>` : ''}<span class="${x.q === 1 ? 'gk-one' : ''}">${x.q > 1 ? `minimo ${x.q} pezzi` : 'anche 1 pezzo'}</span></small></span>
      ${x.t ? `<span class="gk-row-p"><small>${x.q} pz</small><b>${euro(x.from)}</b><small>${euro(x.p)} cad.</small></span>` : `<span class="gk-row-p"><small>da</small><b>${euro(x.p)}</b><small>al pezzo</small></span>`}</button>`;
  // vetrina: schede grandi con immagine, leggibili anche da lontano
  const card = x => `<button type="button" class="gk-row gk-pcard" data-id="${x.id}" data-svc="${x._service}"><span class="gk-pcard-pic" style="--gk-t:${tint[x.cat] || TINTS[0]}">${x._media?.status === 'verified' ? `<img src="${esc(x._media.src)}" alt="" loading="lazy" decoding="async">` : `<span class="gk-blob"></span>${icon(x.ic)}`}</span>
      <span class="gk-pcard-txt"><b>${esc(x.n)}</b><span class="gk-pcard-q${x.q === 1 ? ' gk-one' : ''}">${x.q > 1 ? `minimo ${x.q} pezzi` : 'anche 1 pezzo'}</span>
      ${x.t ? `<span class="gk-pcard-p"><b>${euro(x.from)}</b><small>${x.q} pz · ${euro(x.p)} cad.</small></span>` : `<span class="gk-pcard-p"><small>da</small> <b>${euro(x.p)}</b><small>al pezzo</small></span>`}</span><span class="gk-pcard-go" aria-hidden="true">Scegli →</span></button>`;
  const crumbs = () => {
    const parts = [`<button type="button" data-go="home">Catalogo</button>`];
    const c = cats.find(c => c.name === st.cat);
    if (st.v === 'list' && st.sub && c && c.subs.length > 1) parts.push(`<button type="button" data-go="cat" data-cat="${esc(st.cat)}">${esc(st.cat)}</button>`);
    return `<nav class="gk-crumbs" aria-label="Sei in"><button type="button" class="gk-up" data-up aria-label="Indietro">←</button>${parts.join('<span>/</span>')}</nav>`;
  };
  const tools = n => `<div class="gk-tools"><p class="gk-count">${n ? plural(n) : 'Nessun prodotto'}</p>
      <label class="gk-nomin"><input type="checkbox" ${st.one ? 'checked' : ''}> Anche 1 pezzo</label>
      <select class="gk-sort" aria-label="Ordina"><option value="">Consigliati</option><option value="pa" ${st.sort === 'pa' ? 'selected' : ''}>Prezzo più basso</option><option value="pd" ${st.sort === 'pd' ? 'selected' : ''}>Prezzo più alto</option><option value="q" ${st.sort === 'q' ? 'selected' : ''}>Minimo più basso</option></select></div>`;
  const sortL = l => { if (!st.sort) return l.sort((a, b) => (a.o ?? 0) - (b.o ?? 0)); if (st.sort === 'pa') return l.sort((a, b) => a.p - b.p); if (st.sort === 'pd') return l.sort((a, b) => b.p - a.p); return l.sort((a, b) => a.q - b.q || a.p - b.p); };
  const listing = l => { const rest = l.length - st.shown;
    return `<div class="${curated ? 'gk-pcards' : 'gk-rows'}">${l.slice(0, st.shown).map(curated ? card : row).join('')}</div>${l.length ? '' : '<p class="gk-empty">Nessun prodotto con questi filtri. Togli «Anche 1 pezzo» o prova un’altra parola.</p>'}
      ${rest > 0 ? `<div class="gk-more-wrap"><button type="button" class="gk-more">Mostra altri ${Math.min(PAGE, rest)} <small>ne restano ${rest.toLocaleString('it-IT')}</small></button></div>` : ''}`; };

  /* ---------- vetrina: pagina iniziale (eroe, stampa UV, «non c'è nel sito», prodotti, come funziona) ---------- */
  const mediaOf = id => { const x = data.find(x => x.id === id); return x && x._media?.status === 'verified' ? x._media.src : ''; };
  function landing() {
    const feat = data.find(x => x.q === 1 && x._media?.status === 'verified') || data[0];
    const heroImg = mediaOf('G3B9EBA') || cats[0].img, endImg = mediaOf('GA9A0EF') || (cats[2] || cats[0]).img;
    const minAll = Math.min(...cats.map(c => c.min));
    const band = ['Sticker', 'Biglietti da visita', 'Scatole', 'Da 1 pezzo', 'Prezzi chiari', 'Stampa UV in arrivo'];
    return `<div class="gl">
      <section class="gl-hero" aria-label="Sticker, biglietti e scatole">
        <div class="gl-tabs"><span class="gl-tab gl-tab-brand">MOI LAB</span><span class="gl-tabs-r">${cats.map(c => `<button type="button" class="gl-tab" data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join('')}</span></div>
        <div class="gl-card">
          <div class="gl-hero-l"><h2 class="gl-h" data-r><span style="--d:0"><i>Sticker,</i></span><span style="--d:1"><i>biglietti e</i></span><span style="--d:2"><i>scatole,</i></span><span style="--d:3"><i><em>fatti bene.</em></i></span></h2>
            <button type="button" class="gl-cta" data-go-products data-r style="--d:4">Scegli il prodotto <i aria-hidden="true"></i></button></div>
          <div class="gl-hero-img" data-r style="--d:2">${heroImg ? `<img src="${heroImg}" alt="Adesivi rotondi personalizzati MOI LAB" decoding="async">` : ''}</div>
          <div class="gl-hero-r"><p data-r style="--d:3"><span class="gl-big">da ${euro(minAll)}</span><br>il primo ordine, IVA inclusa</p>
            <p data-r style="--d:4"><b>Da 1 pezzo</b>Adesivi sagomati anche singoli, per provare prima di ordinarne tanti.</p>
            <p data-r style="--d:5"><b>Prezzi chiari</b>Listino a scaglioni: scegli la quantità e vedi subito il totale.</p></div>
          ${feat ? `<div class="gl-notch"><button type="button" class="gl-mini" data-open="${feat.id}"><span class="gl-mini-pic">${feat._media?.status === 'verified' ? `<img src="${esc(feat._media.small || feat._media.src)}" alt="">` : icon(feat.ic)}</span><span><small>In evidenza</small><b>${esc(feat.n)}</b><em>${feat.t ? euro(feat.from) + ' · ' + feat.q + ' pz' : 'da ' + euro(feat.p)}</em></span></button></div>` : ''}
        </div>
        <div class="gl-band" aria-hidden="true"><div>${[...band, ...band].map(t => `<span>${t}</span>`).join('')}</div></div>
      </section>
      <section class="gl-prod" id="gk-${key}-prodotti" aria-label="Prodotti">
        <div class="gl-ttl" data-r><h3>Scegli cosa stampare</h3><span class="gl-tag">${plural(data.length)}</span></div>
        <div class="gl-cards">${cats.map((c, i) => `<button type="button" class="gl-pc" data-cat="${esc(c.name)}" data-r style="--d:${i}">
          <span class="gl-pc-pic">${c.img ? `<img src="${c.img}" alt="" loading="lazy" decoding="async">` : icon(c.ic)}<span class="gl-pc-dot">${c.n}</span></span>
          <span class="gl-pc-txt"><span style="all:unset"><b>${esc(c.name)}</b><small>${c.n} prodotti · ordini da ${euro(c.min)}</small></span><span>Scopri →</span></span>
          <span class="gl-pc-line" aria-hidden="true"></span></button>`).join('')}</div>
      </section>
      <section class="gl-split" aria-label="Richieste particolari">
        <div class="gl-split-l" data-r><span>Molti prodotti</span><span>non sono in vista</span></div>
        <div class="gl-split-r" data-r style="--d:1"><h3>Per non fare confusione.</h3>
          <p>Qui trovi solo le cose più richieste. Il resto non è esposto per tenere il sito semplice: per richieste particolari contattaci, ti diciamo se possiamo farlo o procurartelo.</p>
          <button type="button" class="gl-cta" data-ask>Fai una richiesta <i aria-hidden="true"></i></button></div>
      </section>
      <section class="gl-dark" aria-label="Stampa UV">
        <i class="gl-sq gl-sq1" aria-hidden="true"></i><i class="gl-sq gl-sq2" aria-hidden="true"></i>
        <div class="gl-ttl" data-r><h3>Stampa UV su qualsiasi superficie</h3><span class="gl-tag">In arrivo</span></div>
        <p data-r style="--d:1">Presto il tuo logo non solo su carta e adesivi: con la stampa UV lo mettiamo direttamente sugli oggetti. Se hai già un’idea, raccontacela.</p>
        <button type="button" class="gl-cta gl-cta-l" data-uv data-r style="--d:2">Chiedi informazioni <i aria-hidden="true"></i></button>
      </section>
      <section class="gl-foot" aria-label="Come funziona">
        <div class="gl-foot-box"><div class="gl-cols">
          <div><h4>Prodotti</h4>${cats.map(c => `<button type="button" data-cat="${esc(c.name)}">${esc(c.name)}</button>`).join('')}</div>
          <div><h4>Come funziona</h4><p>1 · Scegli prodotto e quantità</p><p>2 · Aggiungi al carrello</p><p>3 · Inviaci il riepilogo su WhatsApp</p></div>
          <div><h4>Serve altro?</h4><button type="button" data-ask>Richiesta particolare</button><button type="button" data-uv>Stampa UV, info</button><button type="button" data-cart>Il tuo carrello</button></div></div>
          <button type="button" class="gl-bar" data-cart>Apri il carrello e chiedi il preventivo</button></div>
        <div class="gl-foot-img">${endImg ? `<img src="${endImg}" alt="" loading="lazy" decoding="async">` : ''}</div>
      </section></div>`;
  }
  // comparsa degli elementi quando entrano in vista
  function reveal() {
    const els = [...view.querySelectorAll('[data-r]')]; if (!els.length) return;
    view.classList.add('gl-anim');
    const io = new IntersectionObserver(en => en.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
    els.forEach(el => io.observe(el));
    setTimeout(() => els.forEach(el => el.classList.add('in')), 4000);
  }

  /* ---------- viste ---------- */
  function render() {
    if (!data || !data.length) return;
    $('.gk-clear').hidden = !st.q;
    let h = '';
    if (st.q.trim()) {
      const words = norm(st.q).split(/\s+/).filter(Boolean);
      const src = st.global && all ? all : data;
      const l = sortL(src.filter(x => (!st.one || x.q === 1) && NAV.matches(x, st.q)));
      const subHits = []; cats.forEach(c => c.subs.forEach(s => { if (words.some(w => w.length > 2 && norm(s.name + ' ' + c.name).includes(w.slice(0, Math.max(4, w.length - 2))))) subHits.push([c, s]); }));
      h = `<div class="gk-v-head"><div><h3>Risultati per «${esc(st.q.trim())}»</h3></div></div>
        ${curated ? '' : `<div class="gk-chips"><button type="button" class="gk-glob" aria-pressed="${st.global}">${st.global ? 'In tutti i servizi ✓' : 'Cerca anche in tutti i servizi'}</button></div>`}
        ${subHits.length ? `<div class="gk-chips"><span>Vai a</span>${subHits.slice(0, 6).map(([c, s]) => `<button type="button" data-cat="${esc(c.name)}" data-sub="${esc(s.name)}">${esc(s.name)} <small>${s.n}</small></button>`).join('')}</div>` : ''}
        ${tools(l.length)}${listing(l)}`;
    } else if (st.v === 'home' && curated) {
      h = landing();
    } else if (st.v === 'home') {
      const groups = curated ? [''] : [...new Set(cats.map(c => NAV.family({ cat: c.name })))], fam = groups.length > 1;
      h = `${curated ? '' : `<div class="gk-chips gk-paths"><span>Per esigenza</span>${NAV.paths.map(p => `<button type="button" data-path="${p.id}">${esc(p.name)}</button>`).join('')}</div>`}
        ${groups.map(g => `${fam ? `<h3 class="gk-fam">${esc(g)}</h3>` : ''}<div class="gk-tiles${curated ? ' gk-tiles-few' : ''}">${cats.filter(c => curated || NAV.family({ cat: c.name }) === g).map(c => tile({ name: c.name, n: c.n, min: c.min, ic: c.ic, img: c.img, tint: tint[c.name] }, `data-cat="${esc(c.name)}"`)).join('')}</div>`).join('')}
        <p class="gk-foot">${plural(data.length)} in ${cats.length} categorie · prezzi IVA inclusa, stampa del logo confermata nel preventivo</p>`;
    } else if (st.v === 'path') {
      const pth = NAV.paths.find(p => p.id === st.path);
      if (!all) h = `${crumbs()}<p class="gk-count">Carico i prodotti di tutti i servizi…</p>`;
      else { const l = sortL(all.filter(x => NAV.inPath(x, st.path) && (!st.one || x.q === 1)));
        h = `${crumbs()}<div class="gk-v-head"><div><h3>${esc(pth.name)}</h3><p>Idee da gadget, insegne e stampa: tutto finisce nello stesso preventivo</p></div></div>
          <div class="gk-chips">${NAV.paths.map(p => `<button type="button" aria-pressed="${p.id === st.path}" data-path="${p.id}">${esc(p.name)}</button>`).join('')}</div>${tools(l.length)}${listing(l)}`; }
    } else if (st.v === 'cat') {
      const c = cats.find(c => c.name === st.cat);
      h = `${crumbs()}<div class="gk-v-head"><div><h3>${esc(c.name)}</h3><p>${plural(c.n)} · da ${euro(c.min)}${curated ? '' : ' al pezzo'}</p></div></div>
        <div class="gk-tiles">${c.subs.map(s => tile({ ...s, tint: tint[c.name] }, `data-cat="${esc(c.name)}" data-sub="${esc(s.name)}"`)).join('')}
        <button type="button" class="gk-tile gk-tile-all" data-cat="${esc(c.name)}" data-sub=""><span class="gk-tile-txt"><b>Vedi tutto</b><small>${plural(c.n)} di ${esc(c.name.toLowerCase())}</small></span><span class="gk-tile-go" aria-hidden="true">→</span></button></div>`;
    } else {
      const c = cats.find(c => c.name === st.cat);
      const l = sortL(data.filter(x => x.cat === st.cat && (!st.sub || x.sub === st.sub) && (!st.one || x.q === 1)));
      const img = st.sub ? (c.subs.find(s => s.name === st.sub) || {}).img : c.img;
      h = `${crumbs()}<div class="gk-v-head${img ? ' has-img' : ''}">${img ? `<img src="${img}" alt="" loading="lazy">` : ''}<div><h3>${esc(st.sub || c.name)}</h3><p>${st.sub && st.sub !== c.name ? esc(c.name) + ' · ' : ''}${curated ? 'ordini' : ''} da ${euro((st.sub ? c.subs.find(s => s.name === st.sub) : c).min)}${curated ? ', prezzi come da listino per quantità' : ' al pezzo'}</p></div></div>
        ${c.subs.length > 1 ? `<div class="gk-chips">${[{ name: '', n: c.n }, ...c.subs].map(s => `<button type="button" aria-pressed="${st.sub === s.name}" data-cat="${esc(c.name)}" data-sub="${esc(s.name)}">${s.name ? esc(s.name) : 'Tutto'} <small>${s.n}</small></button>`).join('')}</div>` : ''}
        ${tools(l.length)}${listing(l)}`;
    }
    view.innerHTML = h;
    sec.classList.toggle('gk-at-home', curated && st.v === 'home' && !st.q.trim());
    view.classList.remove('gl-anim'); if (sec.classList.contains('gk-at-home')) requestAnimationFrame(reveal);
  }

  /* ---------- navigazione (con il tasto indietro del telefono) ---------- */
  // dopo ogni scelta porto in vista la ricerca e il nuovo contenuto, non il titolo grande
const top = () => { const r = $('.gk-search').getBoundingClientRect(); if (Math.abs(r.top - 16) > 40) room.scrollBy({ top: r.top - 16, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  function go(next) {
    try { history.replaceState({ ...(history.state || {}), gk: key, st: { ...st }, y: room.scrollTop }, ''); history.pushState({ gk: key, st: { ...next } }, ''); } catch {}
    st = next; render(); top();
  }
  addEventListener('popstate', e => {
    const s = e.state; if (!s || s.gk !== key || !data) return;
    st = { ...s.st }; input.value = st.q || ''; render();
    if (typeof s.y === 'number') requestAnimationFrame(() => { room.scrollTop = s.y; });
  });
  const open = (cat, sub) => { const c = cats.find(c => c.name === cat); if (!c) return;
    if (sub === undefined && c.subs.length > 1) go({ ...st, v: 'cat', cat, sub: '', q: '', shown: PAGE });
    else go({ ...st, v: 'list', cat, sub: sub ?? (c.subs.length === 1 ? c.subs[0].name : ''), q: '', shown: PAGE });
    input.value = ''; };

  view.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('.gk-retry')) { load(); return; }
    if (t.closest('[data-go-products]')) { document.getElementById(`gk-${key}-prodotti`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); return; }
    const op = t.closest('[data-open]'); if (op) { const x = data.find(x => x.id === op.dataset.open); if (x) sheet(x, tint[x.cat], op); return; }
    if (t.closest('[data-uv]')) { window.MoiCart?.fly(t.closest('[data-uv]')); window.MoiCart?.add({ service: key, title: 'Stampa UV su oggetti: richiesta informazioni', details: [['Richiesta', 'Vorrei sapere quando parte la stampa UV e cosa si può stampare']] }); return; }
    if (t.closest('[data-ask]')) { const q = room.querySelector('.qc-quick'); if (q) { q.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => q.querySelector('.qc-chips button')?.focus({ preventScroll: true }), 500); } return; }
    if (t.closest('[data-cart]')) { window.MoiCart?.open(); return; }
    const pb = t.closest('[data-path]'); if (pb) { go({ ...st, v: 'path', path: pb.dataset.path, q: '', shown: PAGE }); input.value = ''; return; }
    if (t.closest('.gk-glob')) { st.global = !st.global; st.shown = PAGE; render(); return; }
    const b = t.closest('[data-cat]'); if (b) { open(b.dataset.cat, b.dataset.sub === undefined ? undefined : b.dataset.sub); return; }
    if (t.closest('[data-up]')) { history.state?.gk === key && st.v !== 'home' ? history.back() : go({ ...st, v: 'home', q: '' }); return; }
    const g = t.closest('[data-go]'); if (g) { go({ ...st, v: g.dataset.go, cat: g.dataset.cat || '', sub: '', q: '', shown: PAGE }); return; }
    if (t.closest('.gk-more')) { st.shown += PAGE; render(); return; }
    const r = t.closest('.gk-row'); if (r) { const x = (all || data).find(x => x.id === r.dataset.id); if (x) sheet(x, tint[x.cat], r); }
  });
  view.addEventListener('change', e => {
    if (e.target.matches('.gk-sort')) { st.sort = e.target.value; st.shown = PAGE; render(); }
    if (e.target.matches('.gk-nomin input')) { st.one = e.target.checked; st.shown = PAGE; render(); }
  });
  let t = 0;
  input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { st.q = input.value; st.shown = PAGE; render(); }, 180); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  $('.gk-clear').addEventListener('click', () => { input.value = ''; st.q = ''; render(); input.focus(); });
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
    <div class="gk-hero" style="--gk-t:${tint};--gk-c:${color ? colorHex(color) : 'transparent'}"><span class="gk-blob"></span>${picture(x, 'hero')}${!(x._media?.status === 'verified') && imgOf(x._service, x.sub) ? '<span class="gk-hero-note">Immagine indicativa della categoria</span>' : ''}</div>
    <div class="gk-body"><p class="gk-crumb">${esc(x.cat)}${x.cat === x.sub ? '' : ' · ' + esc(x.sub)}</p><h3 id="gk-t">${esc(x.n)}</h3>
    ${x._media?.description ? `<p class="gk-description">${esc(x._media.description)}</p>` : ''}
    ${x._media?.status === 'verified' ? '<p class="gk-disclaimer">Esempio di personalizzazione MOI · mockup illustrativo. Grafica, colori e opzioni vengono confermati nel preventivo.</p>' : ''}
    ${x.t ? `<p class="gk-price"><b data-tot>${euro(x.from)}</b> <span data-per>per ${x.q} pezzi · ${euro(x.p)} cad.</span><small>IVA inclusa · più ne prendi, meno costa</small></p>` : `<p class="gk-price">da <b>${euro(x.p)}</b> al pezzo <small>IVA inclusa · più ne prendi, meno costa</small></p>`}
    ${x.col && x.col.length ? `<div class="gk-f"><p>Colore <b data-cn>${esc(color)}</b></p><div class="gk-colors">${x.col.map((c, i) => `<button type="button" aria-pressed="${i === 0}" data-c="${esc(c)}" title="${esc(c)}" style="--c:${colorHex(c)}"><span class="gk-sr">${esc(c)}</span></button>`).join('')}</div></div>` : ''}
    ${x.t ? `<div class="gk-f"><p>Quantità <small>${x.q > 1 ? `minimo ${x.q} pezzi` : 'anche 1 pezzo'}</small></p>
      <div class="gk-tiers" role="radiogroup" aria-label="Quantità">${x.t.map(([q, t], i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-tier="${i}"><b>${q.toLocaleString('it-IT')}</b><span>${euro(t)}</span><small>${euro(t / q)} cad.</small></button>`).join('')}</div></div>` : `<div class="gk-f"><p>Quantità <small>${x.q > 1 ? `minimo ${x.q} pezzi` : 'anche 1 pezzo'}</small></p>
      <div class="gk-qty"><button type="button" data-d="-1" aria-label="Meno">−</button><input type="number" inputmode="numeric" min="${x.q}" value="${x.q}" aria-label="Quantità"><button type="button" data-d="1" aria-label="Più">+</button></div>
      <div class="gk-qs">${qs.map(v => `<button type="button" data-q="${v}">${v}</button>`).join('')}</div></div>
    <p class="gk-est">Stima: <b data-est></b> <small>prezzo finale nel preventivo, con la stampa del tuo logo</small></p>`}
    <label class="gk-f gk-note">Dettagli · facoltativo<textarea rows="2" maxlength="400" placeholder="Es. logo a 1 colore, scritta, data di consegna…"></textarea></label>
    <button type="button" class="gk-add">Aggiungi al carrello +</button><p class="gk-code">Codice ${esc(x.id)}</p></div>`;
  let tier = 0;
  const inp = p.querySelector('.gk-qty input'), est = p.querySelector('[data-est]');
  const upd = x.t ? () => { qty = x.t[tier][0]; const tot = x.t[tier][1]; p.querySelector('[data-tot]').textContent = euro(tot); p.querySelector('[data-per]').textContent = `per ${qty.toLocaleString('it-IT')} pezzi · ${euro(tot / qty)} cad.`; p.querySelectorAll('[data-tier]').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.tier === tier))); } : () => { qty = Math.max(x.q, Math.round(+inp.value || x.q)); est.textContent = 'da ' + euro(Math.round(x.p * qty * 100) / 100); p.querySelectorAll('[data-q]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.q === qty))); };
  p.querySelector('.gk-tiers')?.addEventListener('click', e => { const b = e.target.closest('[data-tier]'); if (!b) return; tier = +b.dataset.tier; upd(); });
  if (!x.t) {
  p.querySelector('.gk-qty').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; const step = qty >= 100 ? 10 : 1; inp.value = Math.max(x.q, qty + step * +b.dataset.d); upd(); });
  inp.addEventListener('change', () => { inp.value = Math.max(x.q, Math.round(+inp.value || x.q)); upd(); });
  inp.addEventListener('input', upd);
  p.querySelector('.gk-qs').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (!b) return; inp.value = b.dataset.q; upd(); });
  }
  p.querySelector('.gk-colors')?.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; color = b.dataset.c; p.querySelectorAll('[data-c]').forEach(z => z.setAttribute('aria-pressed', String(z === b))); p.querySelector('[data-cn]').textContent = color; p.querySelector('.gk-hero').style.setProperty('--gk-c', colorHex(color)); });
  p.onkeydown = e => {
    if (e.key !== 'Tab') return;
    const focusable = [...p.querySelectorAll('button,input,textarea,select,a[href]')].filter(el => !el.disabled && el.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  p.querySelector('.gk-add').addEventListener('click', e => {
    if (!window.MoiCart) return; upd();
    const note = p.querySelector('textarea').value.trim(), svc = sh._svc;
    window.MoiCart.fly(e.currentTarget);
    const tot = x.t && x.t[tier][1];
    window.MoiCart.add({ service: svc, image: x._media?.src || '', title: x.n, qty, price: x.t ? tot / qty : x.p, priceFrom: !x.t, fixedQty: !!x.t, key: ['gk', x.id, color, x.t ? qty : ''].join('|'),
      details: [['Codice', x.id], ['Categoria', x.cat === x.sub ? x.cat : x.cat + ' · ' + x.sub], color ? ['Colore', color] : null, x.t ? ['Prezzo', euro(tot) + ' per ' + qty.toLocaleString('it-IT') + ' pezzi, IVA inclusa'] : ['Prezzo indicativo', 'da ' + euro(x.p) + ' al pezzo'], note ? ['Dettagli', note] : null].filter(Boolean) });
    setTimeout(closeSheet, 450);
  });
  sh._svc = (opener.closest('.gk')?.dataset.curated ? opener.closest('.gk').id.replace('gk-', '') : '') || x._service || opener.closest('.gk')?.id.replace('gk-', '') || 'custom';
  upd(); sh.classList.add('is-open'); document.documentElement.classList.add('gk-lock');
  setTimeout(() => p.querySelector('.gk-x').focus({ preventScroll: true }), 60);
}
function closeSheet() { sh.classList.remove('is-open'); document.documentElement.classList.remove('gk-lock'); sh._opener?.focus?.({ preventScroll: true }); }

const start = () => Object.entries(ROOMS).forEach(([k, c]) => mount(k, c));
// le insegne al neon le crea moi-motion-extra.js: aspetto un attimo per mettermi sotto di loro
const go = () => setTimeout(start, 300);
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
