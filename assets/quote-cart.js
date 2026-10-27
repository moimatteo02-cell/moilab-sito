/* MOI LAB — carrello unico per il preventivo.
   Tutto quello che scegli in Abbigliamento, Custom/Sticker, Automotive, Insegne, Grafica e Digital finisce qui;
   dal carrello parte una sola richiesta di preventivo su WhatsApp. Il carrello vive nel browser (localStorage).
   API: MoiCart.add({ service, title, details:[[etichetta, valore]], qty, image, key, ref })  ·  MoiCart.open()
        MoiCart.syncGroup('sticker', items)  ·  MoiCart.items()  ·  MoiCart.count() */
(() => {
if (window.MoiCart) return;
const KEY = 'moilab-quote-cart-v1', STICKER_KEY = 'moilab-sticker-request-v2', WA = '393278815148', MAX = 60;
const SERVICES = {
  apparel: { short: 'Abbigliamento', label: 'Abbigliamento', n: '01' }, custom: { short: 'Gadget e sticker', label: 'Custom · Gadget e sticker', n: '02' },
  automotive: { short: 'Veicoli', label: 'Automotive', n: '03' }, signage: { short: 'Insegne', label: 'Insegne', n: '04' },
  design: { short: 'Grafica', label: 'Grafica e branding', n: '05' }, digital: { short: 'Digital', label: 'Digital', n: '06' }
};
const ROOMS = { apparel: 'moi-showroom-apparel', custom: 'moi-showroom-custom', automotive: 'moi-showroom-automotive', signage: 'moi-showroom-signage', design: 'moi-showroom-design', digital: 'moi-showroom-digital' };
const ORDER = ['apparel', 'custom', 'automotive', 'signage', 'design', 'digital'];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const clean = list => (Array.isArray(list) ? list : []).filter(i => i && typeof i.title === 'string' && SERVICES[i.service]).slice(0, MAX);
let state = { items: clean(read(KEY, {})?.items), name: read(KEY, {})?.name || '', notes: read(KEY, {})?.notes || '', sent: false };
const save = () => { write(KEY, { items: state.items, name: state.name, notes: state.notes }); paint(); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function add(item, silent) {
  const it = { id: uid(), service: item.service, title: String(item.title || '').slice(0, 160), details: (item.details || []).filter(d => d && d[1] != null && String(d[1]).trim() !== '').map(([k, v]) => [String(k).slice(0, 60), String(v).slice(0, 600)]),
    qty: Number(item.qty) > 0 ? Math.round(Number(item.qty)) : null, image: item.image || '', key: item.key || '', ref: item.ref || '', price: Number(item.price) > 0 ? Number(item.price) : null, priceFrom: !!item.priceFrom, at: Date.now() };
  if (!SERVICES[it.service] || !it.title) return false;
  const same = it.key && state.items.find(x => x.key === it.key);
  if (same) { if (it.qty && same.qty) same.qty += it.qty; same.details = it.details; same.price = it.price; same.priceFrom = it.priceFrom; }
  else { if (state.items.length >= MAX) { toast('Il carrello è pieno: invia la richiesta o togli qualcosa.'); return false; } state.items.push(it); }
  state.sent = false; save(); if (!silent) { bump(); toast(same ? `Quantità aggiornata: <b>${esc(it.title)}</b> · ${same.qty} pz` : `Aggiunto al carrello: <b>${esc(it.title)}</b>`, true); }
  return true;
}
function remove(id) {
  const it = state.items.find(x => x.id === id); if (!it) return;
  const at = state.items.indexOf(it);
  state.items = state.items.filter(x => x.id !== id);
  if (!it.ref) { lastRemoved = { it, at }; toast(`Rimosso: <b>${esc(it.title)}</b>`, false, true); }
  if (it.ref.startsWith('sticker:')) { const sc = read(STICKER_KEY, []); if (Array.isArray(sc)) write(STICKER_KEY, sc.filter(l => 'sticker:' + l.id !== it.ref)); dispatchEvent(new CustomEvent('moicart:sticker-changed')); }
  save();
}
let lastRemoved = null;
function undo() { if (!lastRemoved) return; state.items.splice(Math.min(lastRemoved.at, state.items.length), 0, lastRemoved.it); lastRemoved = null; save(); hideToast(); }
function setQty(id, q) { const it = state.items.find(x => x.id === id); if (!it || !it.qty) return; it.qty = Math.max(1, Math.min(100000, Math.round(q) || 1)); save(); }
function syncGroup(prefix, items) {
  const keep = state.items.filter(x => !x.ref.startsWith(prefix + ':'));
  const prev = Object.fromEntries(state.items.filter(x => x.ref.startsWith(prefix + ':')).map(x => [x.ref, x]));
  const next = items.map(i => ({ id: prev[i.ref]?.id || uid(), service: i.service, title: i.title, details: i.details || [], qty: i.qty || null, image: i.image || '', key: '', ref: i.ref, at: prev[i.ref]?.at || Date.now() }));
  const added = next.length > Object.keys(prev).length;
  state.items = [...keep, ...next].slice(0, MAX); save(); if (added) bump();
}
function clear() { state.items = []; state.notes = ''; state.sent = false; write(STICKER_KEY, []); dispatchEvent(new CustomEvent('moicart:sticker-changed')); save(); }

/* ---------- messaggio WhatsApp ---------- */
function message() {
  const lines = ['Buongiorno MOI LAB!', '', 'Vorrei un preventivo per:', ''];
  let n = 0;
  ORDER.forEach(s => {
    const group = state.items.filter(i => i.service === s); if (!group.length) return;
    lines.push(`— ${SERVICES[s].label.toUpperCase()} —`);
    group.forEach(i => {
      n++; lines.push(`${n}) ${i.title}`);
      i.details.forEach(([k, v]) => lines.push(`   ${k}: ${v}`));
      if (i.qty) lines.push(`   Quantità: ${i.qty}`);
    });
    lines.push('');
  });
  if (lines[lines.length - 1] === '' && !state.name.trim() && !state.notes.trim()) lines.pop();
  if (state.name.trim()) lines.push('Nome / Azienda: ' + state.name.trim());
  if (state.notes.trim()) lines.push('Note: ' + state.notes.trim());
  lines.push('', 'Se servono file o foto, li allego in questa chat. Grazie!');
  return lines.join('\n');
}
const euro = n => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
function estimate() {
  const priced = state.items.filter(i => i.price && i.qty); if (!priced.length) return '';
  const tot = priced.reduce((a, i) => a + i.price * i.qty, 0), from = priced.some(i => i.priceFrom), rest = state.items.length - priced.length;
  return `<div class="qc-est"><span>Stima indicativa${rest ? ' dei capi' : ''}</span><b>${from ? 'da ' : ''}${euro(Math.round(tot * 100) / 100)}</b>${rest ? `<small>+ ${rest} ${rest === 1 ? 'voce' : 'voci'} da quotare</small>` : '<small>Prezzi finali confermati nel preventivo</small>'}</div>`;
}
const waURL = () => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message());

/* ---------- interfaccia ---------- */
const BAG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
let btn, panel, toastEl, toastT = 0;
function build() {
  btn = document.createElement('button'); btn.type = 'button'; btn.className = 'qc-btn'; btn.hidden = true;
  btn.innerHTML = `${BAG}<span class="qc-btn-l">Preventivo</span><b class="qc-count">0</b>`;
  btn.addEventListener('click', open);
  panel = document.createElement('div'); panel.className = 'qc'; panel.inert = true;
  panel.innerHTML = `<div class="qc-veil" data-close></div><aside class="qc-panel" role="dialog" aria-modal="true" aria-labelledby="qc-title">
    <header class="qc-head"><div><p class="qc-k">MOI LAB / CARRELLO</p><h2 id="qc-title">Il tuo preventivo</h2></div><button type="button" class="qc-x" data-close aria-label="Chiudi il carrello">×</button></header>
    <div class="qc-body"></div></aside>`;
  panel.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) close();
    const rm = e.target.closest('[data-rm]'); if (rm) remove(rm.dataset.rm);
    const st = e.target.closest('[data-step]'); if (st) { const it = state.items.find(x => x.id === st.dataset.id); if (it) setQty(it.id, it.qty + Number(st.dataset.step)); }
    if (e.target.closest('[data-send]')) setTimeout(() => { state.sent = true; paint(); }, 400);
    if (e.target.closest('[data-clear]')) { clear(); }
    if (e.target.closest('[data-keep]')) { state.sent = false; paint(); }
    if (e.target.closest('[data-go]')) close();
    const cp = e.target.closest('[data-copy]'); if (cp) { const t = message(); (navigator.clipboard?.writeText(t) || Promise.reject()).then(() => { cp.textContent = 'Copiato ✓'; }, () => { cp.textContent = 'Copia non riuscita'; }); }
  });
  panel.addEventListener('input', e => {
    if (e.target.name === 'qc-name') { state.name = e.target.value.slice(0, 120); write(KEY, { items: state.items, name: state.name, notes: state.notes }); syncLink(); }
    if (e.target.name === 'qc-notes') { state.notes = e.target.value.slice(0, 1500); write(KEY, { items: state.items, name: state.name, notes: state.notes }); syncLink(); }
  });
  panel.addEventListener('change', e => { if (e.target.dataset.qty) setQty(e.target.dataset.qty, Number(e.target.value)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) close(); });
  toastEl = document.createElement('div'); toastEl.className = 'qc-toast'; toastEl.setAttribute('role', 'status'); toastEl.hidden = true;
  toastEl.addEventListener('click', e => { if (e.target.closest('[data-open]')) { open(); hideToast(); } if (e.target.closest('[data-undo]')) undo(); });
  document.body.append(btn, panel, toastEl);
  paint();
}
const syncLink = () => { const a = panel?.querySelector('[data-send]'); if (a) a.href = waURL(); };
function paint() {
  if (!btn) return;
  const n = state.items.length;
  btn.hidden = n === 0; btn.querySelector('.qc-count').textContent = n;
  btn.setAttribute('aria-label', `Apri il carrello del preventivo: ${n} ${n === 1 ? 'elemento' : 'elementi'}`);
  const body = panel.querySelector('.qc-body');
  if (!n) { body.innerHTML = `<div class="qc-empty">${BAG}<h3>Il carrello è vuoto.</h3><p>Aggiungi capi, gadget, sticker, insegne, grafiche o progetti digital: poi chiedi un unico preventivo per tutto.</p><button type="button" class="qc-ghost" data-close>Continua a scegliere</button></div>`; return; }
  if (state.sent) {
    body.innerHTML = `<div class="qc-done"><h3>Hai inviato il messaggio?</h3><p>Se la richiesta è partita su WhatsApp puoi svuotare il carrello. Altrimenti torna indietro: resta tutto salvato.</p>
      <button type="button" class="qc-cta" data-clear>Sì, svuota il carrello</button><button type="button" class="qc-ghost" data-keep>No, torna al carrello</button></div>`; return;
  }
  const groups = ORDER.filter(s => state.items.some(i => i.service === s));
  const missing = ORDER.filter(x => !groups.includes(x));
  body.innerHTML = `<div class="qc-list">${groups.map(s => `<section class="qc-group"><p class="qc-gk"><span>${SERVICES[s].n}</span>${esc(SERVICES[s].label)}</p>${state.items.filter(i => i.service === s).map(i => `
      <article class="qc-item">${i.image ? `<img src="${esc(i.image)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : `<span class="qc-ph">${SERVICES[s].n}</span>`}
        <div class="qc-it"><h3>${esc(i.title)}</h3>${i.details.length ? `<p>${i.details.map(([k, v]) => `<span><em>${esc(k)}</em> ${esc(v)}</span>`).join('')}</p>` : ''}
          <div class="qc-row">${i.qty ? (i.ref ? `<span class="qc-q">${i.qty} pz</span>` : `<span class="qc-stepper"><button type="button" data-step="-1" data-id="${i.id}" aria-label="Meno">−</button><input type="number" min="1" inputmode="numeric" value="${i.qty}" data-qty="${i.id}" aria-label="Quantità"><button type="button" data-step="1" data-id="${i.id}" aria-label="Più">+</button></span>`) : '<span></span>'}<button type="button" class="qc-rm" data-rm="${i.id}">Rimuovi</button></div></div>
      </article>`).join('')}</section>`).join('')}${missing.length ? `<div class="qc-more"><p class="qc-gk">Aggiungi anche</p><div>${missing.map(x => `<a href="/#${ROOMS[x]}" data-go>${esc(SERVICES[x].short)}</a>`).join('')}</div></div>` : ''}<div class="qc-fields"><label class="qc-f">Nome e azienda · facoltativo<input name="qc-name" maxlength="120" autocomplete="organization" value="${esc(state.name)}"></label>
      <label class="qc-f">Note per tutto il preventivo · facoltative<textarea name="qc-notes" rows="2" maxlength="1500">${esc(state.notes)}</textarea></label></div></div>
    <div class="qc-foot">${estimate()}<a class="qc-cta" data-send href="${esc(waURL())}" target="_blank" rel="noopener noreferrer">Richiedi il preventivo <span aria-hidden="true">→</span></a>
      <p class="qc-note">Si apre WhatsApp con tutto il riepilogo: premi Invia. File e foto li alleghi lì. Nessun pagamento. <button type="button" class="qc-copy" data-copy>Copia il testo</button></p></div>`;
}
function open() { if (!panel) return; hideToast(); paint(); panel.classList.add('is-open'); panel.inert = false; document.documentElement.classList.add('qc-open'); setTimeout(() => panel.querySelector('.qc-x')?.focus({ preventScroll: true }), 60); }
function close() { panel.classList.remove('is-open'); panel.inert = true; document.documentElement.classList.remove('qc-open'); btn?.focus?.({ preventScroll: true }); }
/* la cosa aggiunta «vola» nel pulsante del carrello: si vede dove è finita */
function fly(from, image) {
  if (!btn || !from || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = from.getBoundingClientRect(); if (!a.width) return;
  btn.hidden = false; const b = btn.getBoundingClientRect();
  const el = document.createElement('div'); el.className = 'qc-fly';
  if (image) el.style.backgroundImage = `url("${String(image).replace(/"/g, '%22')}")`;
  document.body.append(el);
  const x0 = a.left + a.width / 2 - 22, y0 = a.top + a.height / 2 - 22, x1 = b.left + b.width - 30, y1 = b.top + b.height / 2 - 22;
  const mid = { x: (x0 + x1) / 2, y: Math.min(y0, y1) - 120 };
  el.animate([{ transform: `translate(${x0}px,${y0}px) scale(1.2)`, opacity: 1 }, { transform: `translate(${mid.x}px,${mid.y}px) scale(.9)`, opacity: 1, offset: .5 }, { transform: `translate(${x1}px,${y1}px) scale(.35)`, opacity: .2 }], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { el.remove(); bump(); };
}
function bump() { if (!btn) return; btn.classList.remove('qc-bump'); void btn.offsetWidth; btn.classList.add('qc-bump'); }
function toast(html, withOpen, withUndo) {
  if (!toastEl) return;
  toastEl.innerHTML = `<span>${html}</span>${withOpen ? '<button type="button" data-open>Apri il carrello</button>' : ''}${withUndo ? '<button type="button" data-undo>Annulla</button>' : ''}`;
  toastEl.hidden = false; requestAnimationFrame(() => toastEl.classList.add('is-on'));
  clearTimeout(toastT); toastT = setTimeout(hideToast, 3800);
}
function hideToast() { toastEl.classList.remove('is-on'); setTimeout(() => { if (!toastEl.classList.contains('is-on')) toastEl.hidden = true; }, 350); }

/* altre schede del browser */
addEventListener('storage', e => { if (e.key === KEY) { const v = read(KEY, {}); state.items = clean(v?.items); state.name = v?.name || ''; state.notes = v?.notes || ''; paint(); } });
/* pulsanti «Aggiungi al carrello» generici: data-cart-item='{"service":...}' */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-cart-item]'); if (!el) return;
  e.preventDefault(); e.stopImmediatePropagation();
  try {
    const v = JSON.parse(el.dataset.cartItem);
    fly(el, Array.isArray(v) ? v[0]?.image : v.image);
    if (Array.isArray(v)) { let n = 0; v.forEach(x => { if (add(x, true)) n++; }); if (n) { bump(); toast(`Aggiunti al carrello: <b>${n} ${n === 1 ? 'elemento' : 'elementi'}</b>`, true); } }
    else add(v);
    el.classList.add('qc-added'); clearTimeout(el._qc); el._qc = setTimeout(() => el.classList.remove('qc-added'), 2600);
  } catch (err) { console.warn('Carrello: elemento non valido', err); }
}, true);

window.MoiCart = { fly, add, open, close, remove, syncGroup, clear, items: () => state.items.slice(), count: () => state.items.length, message };
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', build) : build();
})();
