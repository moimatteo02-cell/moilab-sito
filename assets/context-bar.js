/* MOI LAB — barra «Sei in…» per telefono (bozza B).
   Compare solo nelle zone di acquisto: le 6 stanze dei servizi e la pagina Sticker. Home, Iniziamo e Chi siamo: niente barra.
   Indietro · Sei in <servizio> (apre il menu) · Preventivo. Ogni servizio ha i suoi colori (assets/context-bar.css). */
(() => {
'use strict';
if (document.querySelector('.cb')) return;
const doc = document, html = doc.documentElement;
const PAGE = doc.currentScript?.dataset.cb || '';           // "sticker" sulla pagina sticker, vuoto nella home a stanze
const ON_HUB = !!doc.querySelector('.moi-room');
const base = ON_HUB ? '' : '/';
const WA = 'https://wa.me/393278815148?text=' + encodeURIComponent("Ciao MOI LAB, vorrei un'informazione: ");
const S = [
  ['apparel', 'Abbigliamento', 'Capi personalizzati'], ['custom', 'Custom', 'Biglietti, scatole, gadget'],
  ['sticker', 'Sticker', 'Configura i tuoi sticker'], ['automotive', 'Automotive', 'Veicoli e wrapping'],
  ['signage', 'Signage', 'Insegne e pannelli'], ['design', 'Design', 'Grafica e branding'], ['digital', 'Digital', 'Siti e automazioni']
];
const href = k => k === 'sticker' ? '/custom/sticker/' : base + '#moi-showroom-' + k;
const ic = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  back: ic('<path d="M15 5l-7 7 7 7"/>'), down: ic('<path d="M6 9l6 6 6-6"/>'),
  bag: ic('<path d="M5 8h14l-1.2 13H6.2L5 8z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>'),
  spark: ic('<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/>')
};

const bar = doc.createElement('nav');
bar.className = 'cb'; bar.setAttribute('aria-label', 'Navigazione rapida');
bar.innerHTML = `<button type="button" class="cb-back" aria-label="Indietro">${I.back}</button>
  <button type="button" class="cb-where" aria-haspopup="dialog" aria-expanded="false" aria-controls="cb-sheet"><small>SEI IN</small><b></b>${I.down}</button>
  <button type="button" class="cb-quote" data-cb-quote aria-label="Apri il preventivo">${I.bag}<span class="cb-n">0</span></button>`;
const sheet = doc.createElement('div');
sheet.id = 'cb-sheet'; sheet.className = 'cb-sheet'; sheet.hidden = true;
sheet.innerHTML = `<div class="cb-veil" data-cb-close></div>
  <section class="cb-panel" role="dialog" aria-modal="true" aria-labelledby="cb-title">
   <span class="cb-grip" aria-hidden="true"></span>
   <header class="cb-head"><div><p>MOI LAB / DOVE VUOI ANDARE</p><h2 id="cb-title">Cosa ti serve?</h2></div><button type="button" class="cb-x" data-cb-close aria-label="Chiudi il menu">×</button></header>
   <div class="cb-grid">${S.map(s => `<a href="${href(s[0])}" data-cb-go="${s[0]}"><b>${s[1]}</b><small>${s[2]}</small></a>`).join('')}</div>
   <div class="cb-acts"><button type="button" class="cb-assist" data-cb-assist hidden>${I.spark}Ti aiuto a scegliere</button>
    <div><a href="${WA}" target="_blank" rel="noopener">Scrivici su WhatsApp</a><a href="${base}#servizi" data-cb-home>Torna alla home</a></div></div>
  </section>`;
doc.body.append(bar, sheet);
const where = bar.querySelector('.cb-where');

/* ---------- dove sono ---------- */
const current = () => PAGE || doc.querySelector('.moi-room.is-active')?.dataset.moiCategory || '';
let ctx = '';
function sync() {
  const k = current();
  if (k !== ctx) {
    ctx = k; bar.dataset.theme = sheet.dataset.theme = k;
    const s = S.find(x => x[0] === k); where.querySelector('b').textContent = s ? s[1] : '';
    where.setAttribute('aria-label', s ? `Sei in ${s[1]}: apri il menu` : 'Apri il menu');
    sheet.querySelectorAll('[data-cb-go]').forEach(a => { const on = a.dataset.cbGo === k; a.classList.toggle('is-here', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    html.classList.remove('cb-down');
  }
  html.classList.toggle('cb-on', !!k);
}

/* ---------- menu ---------- */
let lastFocus = null;
function openSheet() {
  if (!sheet.hidden) return closeSheet();
  window.MoiDock?.close?.(); lastFocus = doc.activeElement;
  sheet.querySelector('[data-cb-assist]').hidden = !(window.MoiAssist?.visible?.());
  sheet.hidden = false; html.classList.add('cb-sheet-open'); where.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => sheet.classList.add('is-open'));
  sheet.querySelector('.cb-x').focus({ preventScroll: true });
}
function closeSheet(restore = true) {
  if (sheet.hidden) return;
  sheet.classList.remove('is-open'); html.classList.remove('cb-sheet-open'); where.setAttribute('aria-expanded', 'false');
  setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 260);
  if (restore) (lastFocus || where).focus?.({ preventScroll: true });
}
where.addEventListener('click', openSheet);
sheet.addEventListener('click', e => {
  if (e.target.closest('[data-cb-close]')) { closeSheet(); return; }
  if (e.target.closest('[data-cb-assist]')) { closeSheet(false); window.MoiAssist?.open?.(); return; }
  const a = e.target.closest('a[href]'); if (a) { if (a.dataset.cbGo === ctx) { e.preventDefault(); closeSheet(); return; } closeSheet(false); }
});
doc.addEventListener('keydown', e => {
  if (sheet.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const f = [...sheet.querySelectorAll('a[href],button:not([hidden])')].filter(x => x.getClientRects().length); if (!f.length) return;
  if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
});

/* ---------- indietro: un passo nel sito, altrimenti la pagina dei servizi ---------- */
let steps = 0;
addEventListener('hashchange', () => { steps++; closeSheet(false); setTimeout(sync, 40); });
addEventListener('popstate', () => { closeSheet(false); setTimeout(sync, 40); });
bar.querySelector('.cb-back').addEventListener('click', () => {
  const sameSite = doc.referrer && new URL(doc.referrer, location.href).origin === location.origin;
  if (steps > 0 || history.state || (PAGE && sameSite && history.length > 1)) history.back();
  else location.href = PAGE ? '/#moi-showroom-custom' : '#servizi';
});

/* ---------- preventivo ---------- */
bar.querySelector('.cb-quote').addEventListener('click', () => { closeSheet(false); window.MoiCart?.open?.(); });
function syncCount() {
  const n = window.MoiCart?.count?.() || 0, el = bar.querySelector('.cb-n');
  el.textContent = n > 99 ? '99+' : String(n); bar.classList.toggle('has-items', n > 0);
  bar.querySelector('.cb-quote').setAttribute('aria-label', n ? `Preventivo, ${n} ${n === 1 ? 'elemento' : 'elementi'}` : 'Apri il preventivo');
}
const qn = doc.querySelector('.qc-count'); if (qn) new MutationObserver(syncCount).observe(qn, { childList: true, characterData: true, subtree: true });
addEventListener('storage', syncCount); setInterval(() => { if (!doc.hidden) syncCount(); }, 1500);

/* ---------- si abbassa scorrendo in giù, torna scorrendo in su ---------- */
const last = new WeakMap();
doc.addEventListener('scroll', e => {
  const el = e.target === doc ? doc.scrollingElement : e.target; if (!el || el.nodeType !== 1) return;
  if (!(el === doc.scrollingElement || el.classList?.contains('moi-room'))) return;
  const y = el.scrollTop, p = last.get(el) ?? y; last.set(el, y);
  if (y < 80 || p - y > 6) html.classList.remove('cb-down'); else if (y - p > 8) html.classList.add('cb-down');
}, { capture: true, passive: true });

/* ---------- mentre scrivi, niente barra ---------- */
const typing = t => t?.matches?.('input:not([type=radio]):not([type=checkbox]):not([type=file]),textarea,select,[contenteditable="true"]');
doc.addEventListener('focusin', e => { if (typing(e.target)) html.classList.add('cb-typing'); });
doc.addEventListener('focusout', () => setTimeout(() => { if (!typing(doc.activeElement)) html.classList.remove('cb-typing'); }, 60));

doc.querySelectorAll('.moi-room').forEach(r => new MutationObserver(sync).observe(r, { attributes: true, attributeFilter: ['class'] }));
sync(); syncCount(); html.classList.add('cb-ready');
})();
