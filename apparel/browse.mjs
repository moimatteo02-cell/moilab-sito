// MOI LAB — APPAREL: ricerca, percorsi (categoria / settore / esigenza) e catalogo con filtri.
// Dati: /data/apparel/elenco.json (400 modelli, con campi filtro) + /data/apparel/percorsi-indice.json.
// Tutti i filtri usano solo dati presenti nei file (nessun dato inventato).

import { ICONS, CAT_ICON, SET_ICON, ES_ICON, icon } from './icons.mjs?v=20261025-30';
const V = '?v=20261027-1';
const PER_PAGE = 24;
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', '4XL', '5XL', '6XL', 'TAGLIA UNICA', 'TAGLIA UNICA ADULTO', 'UNICO'];
const GENERI = [['uomo', 'Uomo'], ['donna', 'Donna'], ['unisex', 'Unisex'], ['bambino', 'Bambino']];
const SORTS = [['', 'Consigliati'], ['prezzo', 'Prezzo crescente'], ['-prezzo', 'Prezzo decrescente'], ['nome', 'Nome A–Z']];
const SWATCH = { Bianco: '#ffffff', Nero: '#111111', Grigio: '#9a9a9a', Marrone: '#6b4a2f', Beige: '#d9c7a5', Rosso: '#d22630', Arancione: '#f08927', Giallo: '#f5d10c', Verde: '#2e9b4f', Azzurro: '#47b5e6', Blu: '#1f3f8f', Viola: '#6a3d9a', Rosa: '#ec6aa0' };

export const norm = t => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const empty = () => ({ q: '', cat: [], sub: '', set: [], es: [], g: [], tg: [], cf: [], m: [], sort: '', n: PER_PAGE });

export function createBrowser(mount, h) {
  const { e, euro, image, previewAttrs, cardPhoto, special, paint, onProduct } = h;
  let list = null, idx = null, meta = null, S = empty(), view = 'home', tab = 'categoria', drawer = false, staggerFrom = -1;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ready = Promise.all([
    fetch('/data/apparel/elenco.json' + V).then(r => r.json()),
    fetch('/data/apparel/percorsi-indice.json' + V).then(r => r.json()),
    fetch('/data/apparel/meta.json' + V).then(r => r.json()),
  ]).then(([a, b, c]) => { list = a; idx = b; meta = c; });

  /* ---------- ricerca con sinonimi ---------- */
  function interpret(q) {
    const n = norm(q); if (!n) return { n, sect: [], cats: [] };
    const sect = Object.entries(idx.sinonimi).filter(([, ws]) => ws.some(w => n.includes(w) || (w.length > 4 && w.includes(n)))).map(([k]) => k);
    idx.settori.forEach(s => { if (norm(s.nome).includes(n) && !sect.includes(s.id)) sect.push(s.id); });
    const cats = Object.entries(idx.tipi).filter(([, ws]) => ws.some(w => n.split(' ').includes(w) || n.includes(w))).map(([k]) => k);
    const both = sect.length > 0 && cats.length > 0 && list.some(p => sect.some(x => p.s.includes(x)) && cats.includes(p.categoria));
    return { n, sect, cats, both };
  }
  function score(p, I) {
    if (!I.n) return 1;
    const toks = I.n.split(' ').filter(t => t.length > 1);
    let s = p.kw.includes(I.n) ? 12 : 0;
    toks.forEach(t => { if (p.kw.includes(t)) s += 3; });
    if (I.sect.some(x => p.s.includes(x))) s += p.gen ? 2 : 7;   // prima i capi specifici del settore, poi i basic
    if (I.sect.some(x => p.s.includes(x) && (idx.sinonimi[x] || []).some(w => w.length > 3 && norm(p.tipo + ' ' + p.nome).includes(w)))) s += 5;   // capi tipici del mestiere
    if (I.sect.some(x => (p.p1 || []).includes(x))) s += 6;   // capo tipico del settore (scelto guardando le foto)
    if (I.cats.includes(p.categoria)) s += 6;
    // se la ricerca e' "capo + professione" (es. "felpa palestra") servono entrambe
    if (I.both && !(I.sect.some(x => p.s.includes(x)) && I.cats.includes(p.categoria))) return 0;
    return s;
  }

  /* ---------- filtri ---------- */
  const passes = (p, st, skip) =>
    (skip === 'cat' || !st.cat.length || st.cat.includes(p.categoria)) &&
    (skip === 'sub' || !st.sub || p.sottocategoria === st.sub) &&
    (skip === 'set' || !st.set.length || st.set.some(x => p.s.includes(x))) &&
    (skip === 'es' || !st.es.length || st.es.every(x => p.x.includes(x))) &&
    (skip === 'g' || !st.g.length || st.g.some(x => x === 'bambino' ? p.b : p.g === x)) &&
    (skip === 'tg' || !st.tg.length || st.tg.some(x => p.tg.includes(x))) &&
    (skip === 'cf' || !st.cf.length || st.cf.some(x => p.cf.includes(x))) &&
    (skip === 'm' || !st.m.length || st.m.includes(p.m));
  const rank = (p, sets) => Math.min(...sets.map(x => p.rk?.[x] ?? 9999));   // pertinenza nel settore (capi tipici prima, basic in fondo)
  function results(st = S, skip) {
    const I = interpret(st.q);
    let r = list.map((p, i) => ({ p, i, sc: score(p, I) })).filter(x => x.sc > 0 && passes(x.p, st, skip));
    const by = { prezzo: (a, b) => (a.p.prezzo_da ?? 1e9) - (b.p.prezzo_da ?? 1e9), '-prezzo': (a, b) => (b.p.prezzo_da ?? -1) - (a.p.prezzo_da ?? -1), nome: (a, b) => a.p.nome.localeCompare(b.p.nome, 'it') };
    r.sort(by[st.sort] || ((a, b) => (I.n ? b.sc - a.sc : 0) || (st.set.length ? rank(a.p, st.set) - rank(b.p, st.set) : 0) || a.i - b.i));
    return r.map(x => x.p);
  }
  function facet(key, vals) {       // conteggi coerenti: tutti gli altri filtri applicati, non il proprio
    const base = results(S, key), c = new Map(vals.map(v => [v, 0]));
    base.forEach(p => vals.forEach(v => {
      const hit = key === 'cat' ? p.categoria === v : key === 'sub' ? p.sottocategoria === v : key === 'set' ? p.s.includes(v) : key === 'es' ? p.x.includes(v)
        : key === 'g' ? (v === 'bambino' ? p.b : p.g === v) : key === 'tg' ? p.tg.includes(v) : key === 'cf' ? p.cf.includes(v) : p.m === v;
      if (hit) c.set(v, c.get(v) + 1);
    }));
    return c;
  }
  const sizeRank = s => { const i = SIZE_ORDER.indexOf(String(s).toUpperCase()); if (i >= 0) return i; const n = parseFloat(s); return isNaN(n) ? 900 : 100 + n; };

  /* ---------- stato nella cronologia (avanti/indietro) ---------- */
  const roomEl = () => mount.closest('.moi-room');
  function push(replace) {
    const st = { acBrowse: { view, tab, S, y: replace ? roomEl()?.scrollTop || 0 : 0 } };
    try { (replace ? history.replaceState : history.pushState).call(history, st, '', location.href); } catch {}
  }
  addEventListener('popstate', ev => {
    const b = ev.state?.acBrowse; if (!b || !list) return;
    view = b.view; tab = b.tab || 'categoria'; S = { ...empty(), ...b.S }; drawer = false;
    view === 'home' ? renderHome() : renderList();
    const y = b.y || 0; requestAnimationFrame(() => requestAnimationFrame(() => { const r = roomEl(); if (r) r.scrollTop = y; }));
  });

  /* ---------- testata con ricerca ---------- */
  const searchBox = (big) => `<form class="br-search${big ? ' br-search-big' : ''}" role="search" data-br-search>
      <label class="br-sr" for="br-q">Cerca nel catalogo</label>
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="br-q" name="q" type="search" autocomplete="off" value="${e(S.q)}" placeholder="Cerca un prodotto, un settore o una professione…" aria-autocomplete="list" aria-controls="br-sugg" aria-expanded="false">
      <button type="submit">Cerca</button>
      <div class="br-sugg" id="br-sugg" role="listbox" hidden></div>
    </form>`;
  function suggest(input) {
    const box = mount.querySelector('#br-sugg'); if (!box) return;
    const n = norm(input.value); if (n.length < 2) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    const I = interpret(n), out = [];
    Object.entries(idx.sinonimi).forEach(([k, ws]) => { const w = ws.find(w => w.startsWith(n) || (n.length > 3 && w.includes(n))); const s = idx.settori.find(s => s.id === k); if (w && s) out.push({ t: 'set', v: k, label: `${w[0].toUpperCase() + w.slice(1)} → ${s.nome}`, n: s.conteggio }); });
    idx.settori.filter(s => norm(s.nome).includes(n) && !out.some(o => o.v === s.id)).forEach(s => out.push({ t: 'set', v: s.id, label: s.nome, n: s.conteggio }));
    meta.categories.filter(c => norm(c.nome).includes(n) || I.cats.includes(c.nome)).forEach(c => out.push({ t: 'cat', v: c.nome, label: c.nome, n: c.modelli }));
    idx.esigenze.filter(x => norm(x.nome).includes(n)).forEach(x => out.push({ t: 'es', v: x.id, label: x.nome, n: x.conteggio }));
    const prods = list.filter(p => norm(p.nome).startsWith(n) || norm(p.sku).startsWith(n) || norm(p.nome).includes(n)).slice(0, 5);
    const rows = [...out.slice(0, 6).map(o => `<button type="button" role="option" data-br-pick="${o.t}" data-v="${e(o.v)}"><span>${e(o.label)}</span><small>${o.n} modelli</small></button>`),
      ...prods.map(p => `<button type="button" role="option" data-sku="${e(p.sku)}"><span>${e(p.nome)} <em>${e(p.tipo)}</em></span><small>${p.prezzo_da != null ? 'senza logo da ' + euro(p.prezzo_da) : ''}${p.prezzo_personalizzato_da != null ? ' · col logo da ' + euro(p.prezzo_personalizzato_da) : ''}</small></button>`)];
    box.innerHTML = rows.length ? rows.join('') + `<button type="button" class="br-sugg-all" data-br-submit>Vedi tutti i risultati per «${e(input.value.trim())}»</button>` : `<p class="br-sugg-none">Nessun suggerimento. Premi Invio per cercare ovunque.</p>`;
    box.hidden = false; input.setAttribute('aria-expanded', 'true');
  }

  /* numero che sale (Count Up), una volta per visita */
  let counted = false;
  function countUp(el) {
    if (!el || counted || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    counted = true; const to = +el.dataset.to, t0 = performance.now(), dur = 1600;
    const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  }

  /* ---------- HOME: testata + tre percorsi ---------- */
  function renderHome() {
    view = 'home';
    const cats = meta.categories, prim = cats.filter(c => c.modelli >= 15), rest = cats.filter(c => c.modelli < 15);
    const catPrice = c => { const ps = list.filter(p => p.categoria === c.nome), m = k => { const v = ps.map(p => p[k]).filter(x => x != null); return v.length ? Math.min(...v) : null; };
      const lg = m('prezzo_personalizzato_da'), nt = m('prezzo_da'); return lg == null && nt == null ? '' : `<span class="br-card-prices es-cp">${nt != null ? `<span class="es-cp-row"><span>Senza logo da</span><b>${euro(nt)}</b></span>` : ''}${lg != null ? `<span class="es-cp-row"><span>Col tuo logo da</span><b>${euro(lg)}</b></span>` : ''}</span>`; };
    const big = [...prim].sort((a, b) => b.modelli - a.modelli).slice(0, 2).map(c => c.nome);
    const ci = n => icon(CAT_ICON, n), si = id => icon(SET_ICON, id), ei = id => icon(ES_ICON, id, 'tag');
    const tabs = [['categoria', 'Per categoria', ICONS.grid], ['settore', 'Per settore<span class="es-tl"> o professione</span>', ICONS.briefcase], ['esigenza', 'Per esigenza', ICONS.tag]];
    const body = {
      categoria: `<div class="br-cards">${prim.map(c => `<button class="br-card${big.includes(c.nome) ? ' es-big es-big-' + big.indexOf(c.nome) : ''}" data-br-cat="${e(c.nome)}"><span class="br-card-img">${image(c.image, c.nome)}<span class="br-badge es-badge">${ci(c.nome)}<em>${c.modelli} modelli</em></span><span class="es-go" aria-hidden="true">Scopri →</span></span><span class="br-card-txt"><strong><span class="br-ico">${ci(c.nome)}</span>${e(c.nome)}</strong>${catPrice(c)}</span></button>`).join('')}</div>
        ${rest.length ? `<div class="br-chips es-more"><span>Anche:</span>${rest.map(c => `<button data-br-cat="${e(c.nome)}"><span class="br-ico">${ci(c.nome)}</span>${e(c.nome)} <small>${c.modelli}</small></button>`).join('')}</div>` : ''}`,
      settore: `<div class="br-cards br-cards-sect">${idx.settori.map(s => `<button class="br-card" data-br-set="${e(s.id)}"><span class="br-card-img">${s.immagine ? image(s.immagine, s.nome) : ''}<span class="br-badge">${si(s.id)}</span></span><span class="br-card-txt"><strong><span class="br-ico">${si(s.id)}</span>${e(s.nome)}</strong><small>${e(s.descrizione)}</small><small class="br-count">${s.conteggio} modelli</small></span></button>`).join('')}</div>
        <p class="br-hint">Cerchi per professione? Prova «dentista», «chef», «muratore», «palestra»: la ricerca capisce il settore.</p>`,
      esigenza: `<div class="br-needs">${idx.esigenze.map(x => `<button data-br-es="${e(x.id)}"><span class="br-need-ico">${ei(x.id)}</span><span class="br-need-txt"><strong>${e(x.nome)}</strong><small>${x.conteggio} modelli</small></span><span class="br-need-go" aria-hidden="true">→</span></button>`).join('')}</div>
        <p class="br-hint">Le caratteristiche vengono dalle schede tecniche del produttore.</p>`,
    };
    paint(`<section class="br-hero">
        <div class="br-hero-copy">
          <div class="br-hero-t"><p class="br-eyebrow"><span class="br-dot"></span>MOI LAB / APPAREL</p>
          <h2 tabindex="-1">Abbigliamento personalizzato.<br><em>Per ogni lavoro, squadra e brand.</em></h2></div>
          <div class="br-hero-s"><p class="es-stat"><span class="br-count-up" data-to="${list.length}">${list.length}</span><span class="es-stat-l">modelli<br>da personalizzare</span></p><p class="br-lead">Con il tuo logo o senza. Cerca per capo, per settore o per professione, oppure scegli un percorso qui sotto.</p>
          ${searchBox(true)}</div>
        </div>
      </section>
      <div class="es-trust" role="list" aria-label="Perché sceglierci"><div class="es-trust-in"><span role="listitem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/></svg>Prezzi finali, nessuna IVA da aggiungere</span><span role="listitem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M7 14h10v7H7z"/></svg>Stampa fino a 40 cm inclusa</span><span role="listitem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>Risposta su WhatsApp</span><span role="listitem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/></svg>Più ne ordini, meno paghi</span></div></div>
      <div class="br-tabs" role="tablist" aria-label="Come vuoi cercare">${tabs.map(([k, l, ic]) => `<button role="tab" data-br-tab="${k}" aria-selected="${tab === k}" id="br-tab-${k}" aria-controls="br-panel"><span class="br-ico">${ic}</span><span>${l}</span></button>`).join('')}</div>
      <div class="br-panel" id="br-panel" role="tabpanel" aria-labelledby="br-tab-${tab}">${body[tab]}</div>
      ${window.MOI_LOGO_TRY_HTML ? window.MOI_LOGO_TRY_HTML() : ''}
      ${special()}
      <button class="br-all" data-br-all>Esplora tutti i ${list.length} modelli <span aria-hidden="true">→</span></button>
      <p class="ac-note">Prezzi finali, nessuna IVA da aggiungere. Disponibilità, quantità e tempi confermati nel preventivo.</p>`);
      countUp(mount.querySelector('.br-count-up'));
  }

  /* ---------- LISTA: filtri + griglia ---------- */
  const setName = id => idx.settori.find(s => s.id === id)?.nome || id;
  const esName = id => idx.esigenze.find(x => x.id === id)?.nome || id;
  function title() {
    if (S.q) return `Risultati per «${S.q}»`;
    const parts = [...(S.sub ? [S.sub] : S.cat), ...S.set.map(setName), ...S.es.map(esName)];
    if (parts.length && parts.length <= 3) return parts.join(' · ');
    return parts.length ? 'Selezione filtrata' : 'Tutti i capi';
  }
  function group(key, label, opts, open, render) {
    const c = facet(key, opts.map(o => o[0])), sel = key === 'sub' ? [S.sub] : S[key];
    const items = opts.map(([v, l]) => ({ v, l, n: c.get(v) || 0, on: sel.includes(v) })).filter(o => o.n || o.on);
    if (!items.length) return '';
    return `<details class="br-f" ${open || items.some(o => o.on) ? 'open' : ''}><summary>${label}${sel.filter(Boolean).length ? ` <b>${sel.filter(Boolean).length}</b>` : ''}</summary><div class="br-f-opts${render ? ' br-f-' + render : ''}">${items.map(o =>
      `<label class="br-opt${o.n ? '' : ' is-zero'}"><input type="${key === 'sub' ? 'radio' : 'checkbox'}" name="br-${key}" data-br-f="${key}" value="${e(o.v)}" ${o.on ? 'checked' : ''}>${render === 'swatch' ? `<i style="background:${SWATCH[o.v] || '#ccc'}"></i>` : ''}${key === 'cat' ? `<span class="br-ico">${icon(CAT_ICON, o.v)}</span>` : key === 'set' ? `<span class="br-ico">${icon(SET_ICON, o.v)}</span>` : key === 'es' ? `<span class="br-ico">${icon(ES_ICON, o.v, 'tag')}</span>` : ''}<span>${e(o.l)}</span><small>${o.n}</small></label>`).join('')}</div></details>`;
  }
  function filtersHTML() {
    const cats = meta.categories.map(c => [c.nome, c.nome]);
    const subs = S.cat.length === 1 ? (meta.categories.find(c => c.nome === S.cat[0])?.sottocategorie || []).map(s => [s.nome, s.nome]) : [];
    const sizes = [...new Set(results(S, 'tg').flatMap(p => p.tg))].sort((a, b) => sizeRank(a) - sizeRank(b) || String(a).localeCompare(b, 'it', { numeric: true }));
    return [
      group('cat', 'Categoria', cats, !S.cat.length),
      subs.length ? group('sub', 'Tipologia', subs, true) : '',
      group('set', 'Settore', idx.settori.map(s => [s.id, s.nome]), true),
      group('es', 'Caratteristiche', idx.esigenze.map(x => [x.id, x.nome]), false),
      group('g', 'Per chi', GENERI, false),
      group('tg', 'Taglia', sizes.map(s => [s, s]), false, 'grid'),
      group('cf', 'Colore', idx.colori.map(c => [c.nome, c.nome]), false, 'swatch'),
      group('m', 'Materiale principale', idx.materiali.map(c => [c.nome, c.nome]), false),
    ].join('');
  }
  function chips() {
    const c = [];
    if (S.q) c.push(['q', '', `«${S.q}»`]);
    S.cat.forEach(v => c.push(['cat', v, v])); if (S.sub) c.push(['sub', S.sub, S.sub]);
    S.set.forEach(v => c.push(['set', v, setName(v)])); S.es.forEach(v => c.push(['es', v, esName(v)]));
    S.g.forEach(v => c.push(['g', v, GENERI.find(g => g[0] === v)?.[1] || v])); S.tg.forEach(v => c.push(['tg', v, 'Taglia ' + v]));
    S.cf.forEach(v => c.push(['cf', v, v])); S.m.forEach(v => c.push(['m', v, v]));
    return c.length ? `<div class="br-active" aria-label="Filtri attivi">${c.map(([k, v, l]) => `<button data-br-rm="${k}" data-v="${e(v)}" aria-label="Rimuovi filtro ${e(l)}">${e(l)} <span aria-hidden="true">×</span></button>`).join('')}<button class="br-clear" data-br-clear>Cancella tutto</button></div>` : '';
  }
  const fill = h => { const [a, b] = String(h).split('/'); return b ? `linear-gradient(135deg,${a} 50%,${b} 50%)` : a; };
  const card = p => {
    const dots = (p.hx || []).slice(0, 4), more = Math.max(0, (p.colori || 0) - dots.length);
    const pp = p.prezzo_personalizzato_da, pn = p.prezzo_da;
    const from = p.prezzo_fino_a != null && pn != null && p.prezzo_fino_a > pn ? '<small class="es-da">da</small>' : '<small class="es-da"></small>';
    const price = pp != null || pn != null
      ? `<span class="br-pc-prices"><span class="br-pc-row"><span class="br-pc-label">Senza logo</span><strong>${pn != null ? from + '<span class="es-n">' + euro(pn) + '</span>' : 'su richiesta'}</strong></span><span class="br-pc-row"><span class="br-pc-label">Col tuo logo</span><strong>${pp != null ? from + '<span class="es-n">' + euro(pp) + '</span>' : 'su richiesta'}</strong></span></span>`
      : '<span class="br-pc-prices"><strong class="br-pc-ask">Prezzo su richiesta</strong></span>';
    return `<button class="ac-product br-pc" ${previewAttrs(p)} data-sku="${e(p.sku)}">${cardPhoto(p).replace(/<\/div>$/, tags(p) + '</div>')}<span class="br-pc-body"><span class="br-pc-name">${e(p.nome)}</span><span class="br-pc-type">${e(p.tipo)}</span>${p.colori ? `<span class="br-pc-dots" aria-label="${p.colori} ${p.colori === 1 ? 'colore' : 'colori'}">${dots.map(h => `<i data-hx="${e(h)}" style="background:${fill(h)}"></i>`).join('')}${more ? `<small>+${more}</small>` : ''}</span>` : ''}${price}</span></button>`;
  };
  // etichette sulla foto: solo da dati già presenti (genere, bambino, parole del tipo di capo)
  const TAGW = [['alta visibilit', 'Alta visibilità'], ['ignifug', 'Ignifugo'], ['tecnic', 'Tecnica'], ['manica lunga', 'Manica lunga'], ['impermeabil', 'Impermeabile'], ['softshell', 'Softshell'], ['pile', 'Pile'], ['sublimazione', 'Per sublimazione']];
  const tags = p => {
    const t = [], tipo = norm(p.tipo);
    if (/bambin|neonat|junior/.test(tipo)) t.push('Bambino'); else { if (p.g === 'donna') t.push('Donna'); else if (p.g === 'uomo') t.push('Uomo'); }
    const w = TAGW.find(([k]) => tipo.includes(k)); if (w) t.push(w[1]);
    if (p.b && !t.includes('Bambino')) t.push('Anche bambino');
    return t.length ? `<span class="es-tags">${t.slice(0, 2).map(x => `<i>${e(x)}</i>`).join('')}</span>` : '';
  };
  function emptyHTML() {
    const last = chips() ? 'Prova a togliere l’ultimo filtro o' : 'Prova';
    return `<div class="br-empty"><h3>Nessun capo con questi criteri.</h3><p>${last} a cercare con parole diverse (es. «maglietta», «polo», «felpa»).</p>
      <div class="br-chips">${meta.categories.slice(0, 6).map(c => `<button data-br-cat="${e(c.nome)}">${e(c.nome)}</button>`).join('')}</div>
      <p>Non trovi quello che ti serve? <a href="https://wa.me/393278815148?text=${encodeURIComponent('Ciao MOI LAB, cerco un capo che non trovo nel catalogo: ')}" target="_blank" rel="noopener">Scrivici su WhatsApp</a>: lo cerchiamo noi.</p></div>`;
  }
  function renderList(focusResults) {
    view = 'list';
    const all = results(), shown = all.slice(0, S.n), nF = S.cat.length + (S.sub ? 1 : 0) + S.set.length + S.es.length + S.g.length + S.tg.length + S.cf.length + S.m.length;
    const crumbs = `<nav class="ac-pdp-crumbs br-crumbs" aria-label="Percorso"><button type="button" data-br-home>Catalogo</button><span>/</span><span>${e(title())}</span></nav>`;
    paint(`${crumbs}
      <div class="br-top">${searchBox(false)}</div>
      <div class="br-layout${drawer ? ' is-drawer' : ''}">
        <aside class="br-side" aria-label="Filtri" ${drawer ? 'role="dialog" aria-modal="true"' : ''}>
          <div class="br-side-head"><strong>Filtri</strong><button type="button" class="br-side-x" data-br-drawer="0" aria-label="Chiudi filtri">×</button></div>
          <div class="br-side-body">${filtersHTML()}</div>
          <div class="br-side-foot"><button type="button" data-br-clear>Cancella</button><button type="button" class="br-show" data-br-drawer="0">Mostra ${all.length} risultati</button></div>
        </aside>
        <div class="br-main">
          <div class="br-bar">
            <div><h2 tabindex="-1">${e(title())}</h2><p class="ac-count" role="status" aria-live="polite">${all.length} ${all.length === 1 ? 'modello' : 'modelli'}</p></div>
            <div class="br-bar-r"><button type="button" class="br-open-f" data-br-drawer="1">Filtri${nF ? ` <b>${nF}</b>` : ''}</button>
              <label class="br-sort"><span>Ordina</span><select data-br-sort>${SORTS.map(([v, l]) => `<option value="${v}" ${S.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
          </div>
          ${chips()}
          ${S.cat.length === 1 && S.cat[0] === 'Magliette' && !S.q && nF === 1 ? special() : ''}
          ${all.length ? `<div class="ac-products">${shown.map(card).join('')}</div>` : emptyHTML()}
          ${all.length > shown.length ? `<div class="ac-pagination"><button data-br-more>Mostra altri ${Math.min(PER_PAGE, all.length - shown.length)} <small>(${shown.length} di ${all.length})</small></button></div>` : ''}
          <p class="ac-note">«Senza logo»: il capo neutro. «Col tuo logo»: una stampa fino a 40 cm inclusa, prezzo per 1–9 pezzi. Capo neutro e dettagli nella scheda di ogni prodotto. Prezzi finali; disponibilità e tempi da confermare.</p>
        </div>
      </div>`);
    document.documentElement.classList.toggle('br-lock', drawer);
    // card che entrano in sequenza dopo un filtro, una ricerca o "Mostra altri"
    if (staggerFrom >= 0 && !calm) [...mount.querySelectorAll('.ac-products > .ac-product')].slice(staggerFrom).forEach((c, i) => { c.style.setProperty('--k', Math.min(i, 12)); c.classList.add('mm-card-in'); });
    staggerFrom = -1;
    if (focusResults) mount.querySelector('.br-main h2')?.focus({ preventScroll: true });
  }

  /* ---------- eventi ---------- */
  function go(patch, opts = {}) {
    S = { ...S, ...patch, n: patch.n ?? PER_PAGE }; drawer = opts.keepDrawer ? drawer : false; staggerFrom = 0;
    push(); renderList(true); if (!opts.keepDrawer) mount.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  const toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  mount.addEventListener('click', ev => {
    const b = ev.target.closest('button,a'); if (!b || !mount.contains(b)) return;
    const d = b.dataset;
    if ('brTab' in d) { tab = d.brTab; push(true); renderHome(); mount.querySelector(`[data-br-tab="${tab}"]`)?.focus(); return; }
    if ('brCat' in d) return go({ ...empty(), cat: [d.brCat] });
    if ('brSet' in d) return go({ ...empty(), set: [d.brSet] });
    if ('brEs' in d) return go({ ...empty(), es: [d.brEs] });
    if ('brAll' in d) return go(empty());
    if ('brHome' in d) { S = empty(); push(); renderHome(); mount.scrollIntoView({ behavior: 'instant', block: 'start' }); return; }
    if ('brMore' in d) { staggerFrom = S.n; S = { ...S, n: S.n + PER_PAGE }; push(true); const y = mount.closest('.moi-room')?.scrollTop; renderList(); const r = mount.closest('.moi-room'); if (r && y != null) r.scrollTop = y; return; }
    if ('brClear' in d) return go({ ...empty(), q: '', sort: S.sort }, { keepDrawer: drawer });
    if ('brRm' in d) { const k = d.brRm, v = d.v; return go(k === 'q' ? { q: '' } : k === 'sub' ? { sub: '' } : { [k]: S[k].filter(x => x !== v), ...(k === 'cat' ? { sub: '' } : {}) }); }
    if ('brDrawer' in d) { drawer = d.brDrawer === '1'; renderList(); if (drawer) mount.querySelector('.br-side-x')?.focus(); return; }
    if ('brPick' in d) { const t = d.brPick, v = d.v; return go({ ...empty(), ...(t === 'set' ? { set: [v] } : t === 'cat' ? { cat: [v] } : { es: [v] }) }); }
    if ('brSubmit' in d) { const f = mount.querySelector('[data-br-search]'); f?.requestSubmit(); return; }
    if (d.sku) { push(true); }   // lascia aprire la scheda prodotto (gestita dal catalogo)
  });
  mount.addEventListener('change', ev => {
    const t = ev.target;
    if (t.matches('[data-br-f]')) {
      const k = t.dataset.brF, v = t.value;
      const patch = k === 'sub' ? { sub: S.sub === v ? '' : v } : { [k]: toggle(S[k], v), ...(k === 'cat' ? { sub: '' } : {}) };
      return go(patch, { keepDrawer: drawer });
    }
    if (t.matches('[data-br-sort]')) return go({ sort: t.value }, { keepDrawer: drawer });
  });
  mount.addEventListener('submit', ev => {
    const f = ev.target.closest('[data-br-search]'); if (!f) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    const q = new FormData(f).get('q')?.toString().trim() || '';
    if (/^(atomic(?:\s*150)?|ca6424)$/i.test(q)) return onProduct(meta.special.sku);
    go({ ...empty(), q, sort: S.sort });
  }, true);
  let tmr; mount.addEventListener('input', ev => { if (ev.target.id === 'br-q') { clearTimeout(tmr); tmr = setTimeout(() => suggest(ev.target), 90); } });
  mount.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { const box = mount.querySelector('#br-sugg'); if (box && !box.hidden) { box.hidden = true; return; } if (drawer) { drawer = false; renderList(); } }
    if (ev.key === 'ArrowDown' && ev.target.id === 'br-q') { mount.querySelector('#br-sugg:not([hidden]) button')?.focus(); ev.preventDefault(); }
  });
  document.addEventListener('pointerdown', ev => { const box = mount.querySelector('#br-sugg'); if (box && !box.hidden && !ev.target.closest('[data-br-search]')) box.hidden = true; }, { passive: true });

  return {
    ready,
    home: () => ready.then(() => { S = empty(); renderHome(); push(true); }),
    back: () => ready.then(() => (view === 'home' ? renderHome() : renderList())),
    reset: () => ready.then(() => { S = empty(); renderHome(); }),
  };
}
