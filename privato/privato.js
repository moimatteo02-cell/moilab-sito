/* MOI LAB — area privata: legge le richieste di preventivo (link #q=… generato dal carrello),
   le mostra in ordine e le tiene in un archivio locale con lo stato di lavorazione. */
(() => {
const KEY = 'moilab-private-quotes-v1';
const SERVICES = { apparel: ['01', 'Abbigliamento'], custom: ['02', 'Custom · Gadget e sticker'], automotive: ['03', 'Automotive'], signage: ['04', 'Insegne'], design: ['05', 'Grafica e branding'], digital: ['06', 'Digital'] };
const ORDER = Object.keys(SERVICES);
const STATUS = ['Nuova', 'In lavorazione', 'Preventivo inviato', 'Accettata', 'Archiviata'];
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const euro = n => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const date = t => new Date(t).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
const store = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; } };
let list = load(), current = null;

/* ---------- decodifica del link ---------- */
const unb64 = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
async function decode(enc) {
  const kind = enc[0], bytes = unb64(enc.slice(1));
  let raw = bytes;
  if (kind === 'z') raw = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  else if (kind !== 'j') throw Error('Formato non riconosciuto');
  const p = JSON.parse(new TextDecoder().decode(raw));
  if (!p || !p.c || !Array.isArray(p.i)) throw Error('Richiesta non valida');
  return p;
}
const fromInput = v => { const m = String(v).match(/#q=([A-Za-z0-9_-]+)/); return m ? m[1] : (/^[zj][A-Za-z0-9_-]{20,}$/.test(v.trim()) ? v.trim() : ''); };

/* ---------- archivio ---------- */
function save(p) {
  const i = list.findIndex(x => x.code === p.c);
  if (i >= 0) { list[i].payload = p; } else list.unshift({ code: p.c, saved: Date.now(), status: 'Nuova', payload: p });
  store(list); renderList();
}
function setStatus(code, st) { const x = list.find(x => x.code === code); if (!x) return; x.status = st; store(list); renderList(); }
function del(code) { if (!confirm(`Eliminare ${code} dall’archivio di questo dispositivo?`)) return; list = list.filter(x => x.code !== code); store(list); if (current?.c === code) { current = null; $('.pv-detail').hidden = true; } renderList(); }

/* ---------- dettaglio ---------- */
function text(p) {
  const lines = [`Richiesta ${p.c} · ${date(p.t)}`, ''];
  let n = 0;
  ORDER.forEach(s => { const g = p.i.filter(i => i.s === s); if (!g.length) return; lines.push('— ' + SERVICES[s][1].toUpperCase() + ' —');
    g.forEach(i => { n++; lines.push(`${n}) ${i.t}`); (i.d || []).forEach(([k, v]) => lines.push(`   ${k}: ${v}`)); if (i.q) lines.push(`   Quantità: ${i.q}`); }); lines.push(''); });
  if (p.n) lines.push('Nome / Azienda: ' + p.n); if (p.o) lines.push('Note: ' + p.o);
  return lines.join('\n');
}
function showDetail(p) {
  current = p;
  const rec = list.find(x => x.code === p.c);
  const priced = p.i.filter(i => i.p && i.q), tot = priced.reduce((a, i) => a + i.p * i.q, 0), from = priced.some(i => i.f);
  const box = $('.pv-detail');
  box.innerHTML = `<div class="pv-d-head"><div><p class="pv-k">RICHIESTA</p><h2>${esc(p.c)}</h2><p class="pv-meta">${date(p.t)} · ${p.i.length} ${p.i.length === 1 ? 'voce' : 'voci'}${p.n ? ' · <b>' + esc(p.n) + '</b>' : ''}</p></div>
    <div class="pv-d-act"><label class="pv-st">Stato<select data-status>${STATUS.map(s => `<option ${rec?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
    <button type="button" data-copy>Copia riepilogo</button><button type="button" data-print>Stampa</button><button type="button" data-close aria-label="Chiudi">×</button></div></div>
    ${p.o ? `<p class="pv-notes"><em>Note del cliente</em>${esc(p.o)}</p>` : ''}
    ${ORDER.filter(s => p.i.some(i => i.s === s)).map(s => `<section class="pv-g"><p class="pv-gk"><span>${SERVICES[s][0]}</span>${SERVICES[s][1]}</p>
      ${p.i.filter(i => i.s === s).map(i => `<article class="pv-item"><div><h3>${esc(i.t)}</h3><dl>${(i.d || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
        <div class="pv-q">${i.q ? `<b>${i.q}</b><small>pz</small>` : '<small>—</small>'}${i.p && i.q ? `<span>${i.f ? 'da ' : ''}${euro(i.p * i.q)}</span>` : ''}</div></article>`).join('')}</section>`).join('')}
    ${priced.length ? `<div class="pv-tot"><span>Stima dei capi con prezzo</span><b>${from ? 'da ' : ''}${euro(Math.round(tot * 100) / 100)}</b></div>` : ''}`;
  box.hidden = false;
  box.querySelector('[data-status]').onchange = e => { if (!list.find(x => x.code === p.c)) save(p); setStatus(p.c, e.target.value); };
  box.querySelector('[data-close]').onclick = () => { box.hidden = true; current = null; history.replaceState(null, '', location.pathname); };
  box.querySelector('[data-print]').onclick = () => print();
  box.querySelector('[data-copy]').onclick = async e => { try { await navigator.clipboard.writeText(text(p)); e.target.textContent = 'Copiato ✓'; } catch { e.target.textContent = 'Non riuscito'; } };
  box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

/* ---------- elenco ---------- */
function renderList() {
  const q = ($('[data-search]').value || '').trim().toLowerCase(), f = $('[data-filter]').value;
  const rows = list.filter(x => (!f || x.status === f) && (!q || x.code.toLowerCase().includes(q) || (x.payload.n || '').toLowerCase().includes(q)));
  $('.pv-list').innerHTML = rows.length ? rows.map(x => { const p = x.payload, svc = ORDER.filter(s => p.i.some(i => i.s === s)).map(s => SERVICES[s][1].split(' ')[0]).join(' · ');
    return `<article class="pv-row" data-code="${esc(x.code)}"><button type="button" class="pv-row-main" data-open="${esc(x.code)}"><b>${esc(x.code)}</b><span>${esc(p.n || 'Senza nome')}</span><small>${date(p.t)} · ${p.i.length} voci · ${esc(svc)}</small></button>
      <span class="pv-pill" data-s="${STATUS.indexOf(x.status)}">${esc(x.status)}</span><button type="button" class="pv-del" data-del="${esc(x.code)}" aria-label="Elimina ${esc(x.code)}">Elimina</button></article>`; }).join('')
    : `<p class="pv-empty">${list.length ? 'Nessuna richiesta con questi filtri.' : 'Ancora nessuna richiesta salvata. Apri un link “Riepilogo” ricevuto su WhatsApp.'}</p>`;
}
$('.pv-list').addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) { const x = list.find(x => x.code === o.dataset.open); if (x) showDetail(x.payload); } const d = e.target.closest('[data-del]'); if (d) del(d.dataset.del); });
$('[data-filter]').insertAdjacentHTML('beforeend', STATUS.map(s => `<option>${s}</option>`).join(''));
$('[data-search]').addEventListener('input', renderList); $('[data-filter]').addEventListener('change', renderList);

/* ---------- apertura ---------- */
const msg = t => { $('.pv-msg').textContent = t; };
async function openEnc(enc) { try { const p = await decode(enc); save(p); showDetail(p); msg(`Richiesta ${p.c} aperta e salvata nell’archivio.`); } catch (e) { msg('Questo link non è valido o è incompleto: copialo per intero da WhatsApp.'); } }
$('.pv-open').addEventListener('submit', e => {
  e.preventDefault(); const v = e.target.q.value.trim(); if (!v) return;
  const enc = fromInput(v); if (enc) { openEnc(enc); return; }
  const code = v.toUpperCase().replace(/\s/g, ''), x = list.find(x => x.code === code || x.code === 'MOI-' + code);
  if (x) { showDetail(x.payload); msg(''); } else msg(`${code} non è nell’archivio di questo dispositivo: apri il link “Riepilogo” del messaggio WhatsApp con quel codice.`);
});
renderList();
const h = location.hash.match(/^#q=([A-Za-z0-9_-]+)/); if (h) openEnc(h[1]);
addEventListener('hashchange', () => { const m = location.hash.match(/^#q=([A-Za-z0-9_-]+)/); if (m) openEnc(m[1]); });
})();
