/* MOI LAB — APPAREL: assistente guidato "Ti aiuto a scegliere".
   Fase 1, senza AI: poche domande e consigli calcolati SOLO sui dati del catalogo
   (prezzi, settori, caratteristiche, materiali). Nessun prezzo o dato inventato.
   Regola stampa a quantità (uguale alla scheda prodotto): 1–9 pz prezzo col logo, 10–49 pz capo +7 €, 50+ pz capo +5 € (mai sopra il prezzo 1–9). */
(() => {
  const doc = document, $ = (s, r = doc) => r.querySelector(s), $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const room = $('#moi-showroom-apparel'), mount = $('#moi-apparel-catalog'); if (!room || !mount) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V = '?v=20261027-2', WA = '393278815148';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = n => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
  const r2 = n => Math.round(n * 100) / 100;
  let data = null;
  let loading = null;
  const load = () => loading ??= Promise.all(['elenco.json', 'percorsi-indice.json', 'meta.json'].map(f => fetch('/data/apparel/' + f + V).then(r => r.json()))).then(([list, idx, meta]) => (data = { list, idx, meta }));

  /* ---------- prezzi ---------- */
  const unit = (p, qty, logo) => {
    const n = p.prezzo_da, pp = p.prezzo_personalizzato_da;
    if (!logo) return n;
    if (pp == null) return null;
    if (n == null) return pp;
    return r2(qty >= 50 ? Math.min(pp, n + 5) : qty >= 10 ? Math.min(pp, n + 7) : pp);
  };
  const from = p => p.prezzo_fino_a != null && p.prezzo_da != null && p.prezzo_fino_a > p.prezzo_da;

  /* ---------- stato ---------- */
  let st = { step: 0, set: '', cats: [], qty: 10, logo: true, prio: 'equilibrio' };
  const STEPS = 5;

  /* ---------- pulsante e pannello ---------- */
  const pill = doc.createElement('button'); pill.type = 'button'; pill.className = 'as-pill';
  pill.innerHTML = '<span class="as-spark" aria-hidden="true">✦</span><span>Ti aiuto a scegliere</span>';
  const panel = doc.createElement('div'); panel.className = 'as-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Assistente: ti aiuto a scegliere'); panel.hidden = true;
  const shade = doc.createElement('div'); shade.className = 'as-shade'; shade.hidden = true;
  doc.body.append(pill, shade, panel);

  const sync = () => {
    const on = room.classList.contains('is-active') && !room.classList.contains('ac-detail-mode') && !doc.documentElement.classList.contains('br-lock') && panel.hidden;
    pill.classList.toggle('is-on', on);
  };
  new MutationObserver(sync).observe(room, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(sync).observe(doc.documentElement, { attributes: true, attributeFilter: ['class'] });
  sync();

  const open = async () => {
    panel.hidden = false; shade.hidden = false; doc.documentElement.classList.add('as-open'); sync();
    requestAnimationFrame(() => { panel.classList.add('is-in'); shade.classList.add('is-in'); });
    panel.innerHTML = '<p class="as-wait">Un attimo…</p>';
    await load(); render(); $('.as-x', panel)?.focus();
  };
  const close = () => {
    panel.classList.remove('is-in'); shade.classList.remove('is-in'); doc.documentElement.classList.remove('as-open');
    setTimeout(() => { panel.hidden = true; shade.hidden = true; sync(); }, calm ? 0 : 320);
    pill.focus({ preventScroll: true });
  };
  pill.addEventListener('click', open);
  shade.addEventListener('click', close);
  doc.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });

  /* ---------- schermate ---------- */
  const head = (title, sub) => `<div class="as-head"><div class="as-prog" aria-hidden="true">${Array.from({ length: STEPS }, (_, i) => `<i class="${i < st.step ? 'is-done' : i === st.step ? 'is-now' : ''}"></i>`).join('')}</div><button type="button" class="as-x" aria-label="Chiudi">×</button></div>
    <p class="as-k">${st.step < STEPS ? `Domanda ${st.step + 1} di ${STEPS}` : 'I nostri consigli'}</p><h3>${title}</h3>${sub ? `<p class="as-sub">${sub}</p>` : ''}`;
  const nav = (canNext = true, nextLabel = 'Avanti') => `<div class="as-nav">${st.step ? '<button type="button" class="as-back" data-as="back">← Indietro</button>' : '<span></span>'}<button type="button" class="as-next" data-as="next" ${canNext ? '' : 'disabled'}>${nextLabel} →</button></div>`;

  function render() {
    const { list, idx, meta } = data;
    let html = '';
    if (st.step === 0) {
      html = head('Chi vuoi vestire?', 'Scegli il settore: ti mostro i capi più adatti a quel lavoro.')
        + `<div class="as-grid">${idx.settori.map(s => `<button type="button" class="as-opt" data-set="${esc(s.id)}" aria-pressed="${st.set === s.id}"><b>${esc(s.nome)}</b><small>${s.conteggio} modelli</small></button>`).join('')}
           <button type="button" class="as-opt" data-set="altro" aria-pressed="${st.set === 'altro'}"><b>Altro</b><small>Privato, regalo, gruppo di amici…</small></button></div>` + nav(!!st.set);
    } else if (st.step === 1) {
      const pool = list.filter(p => st.set === 'altro' || p.s.includes(st.set));
      const cats = meta.categories.map(c => ({ ...c, n: pool.filter(p => p.categoria === c.nome).length })).filter(c => c.n);
      html = head('Cosa ti serve?', 'Puoi sceglierne più di uno.')
        + `<div class="as-grid as-grid-3">${cats.map(c => `<button type="button" class="as-opt" data-cat="${esc(c.nome)}" aria-pressed="${st.cats.includes(c.nome)}"><b>${esc(c.nome)}</b><small>${c.n} ${c.n === 1 ? "modello" : "modelli"}</small></button>`).join('')}</div>` + nav(st.cats.length > 0);
    } else if (st.step === 2) {
      html = head('Quanti pezzi, più o meno?', 'Per ogni tipo di capo. Il prezzo della stampa scende da 10 e da 50 pezzi.')
        + `<div class="as-qty"><button type="button" data-q="-1" aria-label="Meno">−</button><input type="number" inputmode="numeric" min="1" max="9999" value="${st.qty}" aria-label="Numero di pezzi"><button type="button" data-q="1" aria-label="Più">+</button></div>
           <div class="as-chips">${[5, 10, 20, 50, 100, 250].map(n => `<button type="button" data-qv="${n}" aria-pressed="${st.qty === n}">${n}</button>`).join('')}</div>` + nav(st.qty >= 1);
    } else if (st.step === 3) {
      html = head('Con il tuo logo?', '')
        + `<div class="as-grid as-grid-2"><button type="button" class="as-opt" data-logo="1" aria-pressed="${st.logo}"><b>Sì, col mio logo</b><small>Una stampa fino a 40 cm inclusa nel prezzo</small></button><button type="button" class="as-opt" data-logo="0" aria-pressed="${!st.logo}"><b>No, capi neutri</b><small>Solo il capo</small></button></div>` + nav(true);
    } else if (st.step === 4) {
      html = head('Cosa conta di più per te?', '')
        + `<div class="as-grid as-grid-1">${[['risparmio', 'Spendere il giusto', 'Ti mostro prima l’opzione che costa meno, con cosa cambia rispetto alle altre.'], ['equilibrio', 'Il miglior rapporto qualità/prezzo', 'I capi più adatti al tuo settore, senza spendere più del necessario.'], ['top', 'Il capo più completo', 'Prima i capi con più caratteristiche tecniche.']].map(([k, t, d]) => `<button type="button" class="as-opt" data-prio="${k}" aria-pressed="${st.prio === k}"><b>${t}</b><small>${d}</small></button>`).join('')}</div>` + nav(true, 'Vedi i consigli');
    } else html = results();
    panel.innerHTML = `<div class="as-body${calm ? '' : ' as-anim'}">${html}</div>`;
    panel.scrollTop = 0;
  }

  /* ---------- consigli ---------- */
  function pickFor(cat) {
    const { list } = data, S = st.set === 'altro' ? '' : st.set;
    const pool = list.map((p, i) => ({ p, i, u: unit(p, st.qty, st.logo) })).filter(x => x.p.categoria === cat && x.u != null && (!S || x.p.s.includes(S)));
    if (!pool.length) return null;
    const rel = x => S ? (x.p.rk?.[S] ?? 9999) - ((x.p.p1 || []).includes(S) ? 1000 : 0) : x.i;
    const byRel = [...pool].sort((a, b) => rel(a) - rel(b));
    const best = byRel[0];
    // più conveniente: tra i capi pertinenti (prima metà per pertinenza), preferendo la stessa tipologia del consigliato
    const top = byRel.slice(0, Math.max(3, Math.ceil(byRel.length / 2)));
    const same = top.filter(x => x.p.sottocategoria === best.p.sottocategoria);
    const cheap = [...(same.length > 1 ? same : top)].sort((a, b) => a.u - b.u || rel(a) - rel(b))[0];
    const rich = [...top].sort((a, b) => b.p.x.length - a.p.x.length || rel(a) - rel(b))[0];
    return { best, cheap, rich, n: pool.length };
  }
  const featNames = ids => ids.map(id => data.idx.esigenze.find(x => x.id === id)?.nome || id);
  function diff(a, b) {               // cosa ha "a" rispetto a "b": solo dati veri
    const out = [];
    const plus = a.p.x.filter(x => !b.p.x.includes(x)), minus = b.p.x.filter(x => !a.p.x.includes(x));
    if (a.p.m && b.p.m && a.p.m !== b.p.m) out.push(`${a.p.m.toLowerCase()} invece di ${b.p.m.toLowerCase()}`);
    if (plus.length) out.push('in più: ' + featNames(plus).join(', ').toLowerCase());
    if (minus.length) out.push('senza: ' + featNames(minus).join(', ').toLowerCase());
    if (a.p.sottocategoria !== b.p.sottocategoria) out.push(a.p.sottocategoria.toLowerCase());
    return out;
  }
  const card = (x, tag, note) => `<div class="as-card"><button type="button" class="as-card-open" data-sku="${esc(x.p.sku)}"><img src="${esc(x.p.immagine_modello_fronte || x.p.immagine_principale)}" alt="" loading="lazy"><span class="as-card-t"><em>${tag}</em><b>${esc(x.p.nome)}</b><small>${esc(x.p.tipo)}</small></span><span class="as-card-p"><b>${from(x.p) ? '<small>da</small> ' : ''}${euro(x.u)}</b><small>al pezzo</small></span></button>${note ? `<p class="as-note">${note}</p>` : ''}</div>`;

  function results() {
    const Q = st.qty, lines = [];
    let html = head('Ecco cosa ti consiglio', `${st.set === 'altro' ? '' : esc(data.idx.settori.find(s => s.id === st.set)?.nome || '') + ' · '}${Q} pezzi per capo · ${st.logo ? 'col tuo logo' : 'senza logo'}`);
    let tot = 0, totCheap = 0;
    st.cats.forEach(cat => {
      const r = pickFor(cat); if (!r) { html += `<section class="as-sec"><h4>${esc(cat)}</h4><p class="as-sub">Nessun capo con prezzo disponibile: chiedicelo su WhatsApp.</p></section>`; return; }
      const { best, cheap, rich } = r;
      const order = st.prio === 'risparmio' ? [[cheap, 'Il più conveniente'], [best, 'Il più adatto'], [rich, 'Il più completo']]
        : st.prio === 'top' ? [[rich, 'Il più completo'], [best, 'Il più adatto'], [cheap, 'Il più conveniente']]
        : [[best, 'Il più adatto'], [cheap, 'Il più conveniente'], [rich, 'Il più completo']];
      const seen = new Set(), shown = order.filter(([x]) => !seen.has(x.p.sku) && seen.add(x.p.sku));
      const main = shown[0][0];
      tot += main.u * Q; totCheap += cheap.u * Q; lines.push(`${main.p.nome} (${main.p.sku}) × ${Q}`);
      html += `<section class="as-sec"><h4>${esc(cat)} <small>${r.n} ${r.n === 1 ? "modello adatto" : "modelli adatti"}</small></h4>`;
      shown.forEach(([x, tag], i) => {
        let note = '';
        if (x !== main) {
          const d = r2((x.u - main.u) * Q);
          const what = diff(x, main);
          note = d < 0 ? `<b class="as-save">Risparmi ${euro(-d)}</b> su ${Q} pezzi.${what.length ? ' Cosa cambia: ' + esc(what.join('; ')) + '.' : ' Stessa tipologia di capo.'}`
            : d > 0 ? `${euro(d)} in più su ${Q} pezzi.${what.length ? ' Cosa ottieni: ' + esc(what.join('; ')) + '.' : ''}` : (what.length ? 'Stesso prezzo. ' + esc(what.join('; ')) + '.' : '');
        } else if (x.p.x.length) note = 'Caratteristiche: ' + esc(featNames(x.p.x).join(', ').toLowerCase()) + '.';
        html += card(x, tag, note);
      });
      html += '</section>';
    });
    // consiglio quantità: soglie della stampa
    if (st.logo) {
      const next = Q < 10 && Q >= 6 ? 10 : Q < 50 && Q >= 40 ? 50 : 0;
      if (next) {
        const now = st.cats.map(c => pickFor(c)).filter(Boolean).map(r => r[st.prio === 'risparmio' ? 'cheap' : st.prio === 'top' ? 'rich' : 'best'].p);
        const a = r2(now.reduce((s, p) => s + unit(p, Q, true) * Q, 0)), b = r2(now.reduce((s, p) => s + unit(p, next, true) * next, 0));
        const per = r2(now.reduce((s, p) => s + unit(p, Q, true) - unit(p, next, true), 0));
        if (per > 0) html += `<div class="as-tip"><b>Consiglio sulla quantità</b><p>Con ${next} pezzi invece di ${Q} la stampa costa meno: ${euro(per)} in meno a pezzo. ${b <= a ? `<b class="as-tip-hl">Spendi meno (${euro(b)} invece di ${euro(a)}) e hai ${next - Q === 1 ? 'un capo' : (next - Q) + ' capi'} in più per tipo.</b>` : `Spenderesti ${euro(b)} invece di ${euro(a)}, con ${next - Q === 1 ? 'un capo' : (next - Q) + ' capi'} in più per tipo.`}</p><button type="button" class="as-link" data-qv2="${next}">Usa ${next} pezzi</button></div>`;
      }
    }
    const wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(`Ciao MOI LAB, ho usato l'assistente del sito. ${st.set !== 'altro' ? 'Settore: ' + (data.idx.settori.find(s => s.id === st.set)?.nome || '') + '. ' : ''}${st.logo ? 'Con il nostro logo' : 'Senza logo'}. Vorrei un preventivo per: ${lines.join(', ')}.`);
    html += `<div class="as-total"><span><small>Stima per la tua selezione</small><b>${euro(r2(tot))}</b></span>${totCheap < tot ? `<small>Con le opzioni più convenienti: ${euro(r2(totCheap))}</small>` : ''}</div>
      <a class="as-wa" href="${wa}" target="_blank" rel="noopener">Chiedi il preventivo per questa selezione →</a>
      <p class="as-fine">Prezzi finali, nessuna IVA da aggiungere, presi dal listino del catalogo (prezzo di partenza del capo). Disponibilità e tempi li confermiamo nel preventivo.</p>
      <div class="as-nav"><button type="button" class="as-back" data-as="back">← Modifica le risposte</button><button type="button" class="as-back" data-as="restart">Ricomincia</button></div>`;
    return html;
  }

  /* ---------- interazioni ---------- */
  panel.addEventListener('click', e => {
    const b = e.target.closest('button,a'); if (!b) return;
    const d = b.dataset;
    if (b.classList.contains('as-x')) return close();
    if (d.as === 'back') { st.step = Math.max(0, st.step - 1); return render(); }
    if (d.as === 'next') { st.step++; return render(); }
    if (d.as === 'restart') { st = { step: 0, set: '', cats: [], qty: 10, logo: true, prio: 'equilibrio' }; return render(); }
    if ('set' in d) { if (st.set !== d.set) st.cats = []; st.set = d.set; st.step = 1; return render(); }
    if ('cat' in d) { st.cats = st.cats.includes(d.cat) ? st.cats.filter(c => c !== d.cat) : [...st.cats, d.cat]; b.setAttribute('aria-pressed', String(st.cats.includes(d.cat))); $('[data-as="next"]', panel).disabled = !st.cats.length; return; }
    if ('qv' in d) { st.qty = +d.qv; const i = $('.as-qty input', panel); if (i) i.value = st.qty; $$('[data-qv]', panel).forEach(x => x.setAttribute('aria-pressed', String(x === b))); return; }
    if ('qv2' in d) { st.qty = +d.qv2; return render(); }
    if ('q' in d) { st.qty = Math.max(1, Math.min(9999, st.qty + +d.q)); const i = $('.as-qty input', panel); if (i) i.value = st.qty; $$('[data-qv]', panel).forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.qv === st.qty))); return; }
    if ('logo' in d) { st.logo = d.logo === '1'; st.step = 4; return render(); }
    if ('prio' in d) { st.prio = d.prio; st.step = 5; return render(); }
    if (b.classList.contains('as-card-open')) {
      close();
      const t = doc.createElement('button'); t.type = 'button'; t.dataset.sku = d.sku; t.hidden = true; mount.append(t); t.click(); t.remove();
    }
  });
  panel.addEventListener('input', e => { if (e.target.matches('.as-qty input')) { const n = Math.floor(+e.target.value); if (n >= 1) st.qty = Math.min(9999, n); $$('[data-qv]', panel).forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.qv === st.qty))); } });
  panel.addEventListener('keydown', e => {             // il focus resta dentro il pannello
    if (e.key !== 'Tab') return; const f = $$('button:not([disabled]),a,input', panel); if (!f.length) return;
    if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); } else if (!e.shiftKey && doc.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  });
})();
