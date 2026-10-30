/* MOI LAB — barra «Sei in…» per telefono (bozza B).
   Compare solo nelle zone di acquisto: le stanze dei servizi e la pagina Sticker e oggetti (/custom/). Home, Iniziamo e Chi siamo: niente barra.
   Indietro · Sei in <servizio> (apre il menu) · Preventivo. Ogni servizio ha i suoi colori (assets/context-bar.css). */
(() => {
'use strict';
if (document.querySelector('.cb')) return;
const doc = document, html = doc.documentElement;
const PAGE = doc.currentScript?.dataset.cb || '';           // "custom" sulla pagina /custom/, vuoto nella home a stanze
const ON_HUB = !!doc.querySelector('.moi-room');
const base = ON_HUB ? '' : '/';
const WA = 'https://wa.me/393278815148?text=' + encodeURIComponent("Ciao MOI LAB, vorrei un'informazione: ");
const S = [
  ['apparel', 'Abbigliamento', 'Capi personalizzati'], ['custom', 'Sticker e oggetti', 'Sticker, biglietti, scatole'], ['automotive', 'Automotive', 'Veicoli e wrapping'],
  ['signage', 'Signage', 'Insegne e pannelli'], ['design', 'Design', 'Grafica e branding'], ['digital', 'Digital', 'Siti e automazioni']
];
const href = k => k === 'custom' ? '/custom/' : base + '#moi-showroom-' + k;
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
  <nav class="cb-pop" aria-label="Altri servizi">${S.map(s => `<a href="${href(s[0])}" data-cb-go="${s[0]}" class="cb-s cb-s-${s[0]}"><span class="cb-s-ic" aria-hidden="true">${window.MOI_SERVICE_ICONS?.[s[0]] || ''}</span><span class="cb-s-t">${s[1]}</span><i class="cb-fx" aria-hidden="true"></i></a>`).join('')}</nav>`;
doc.body.append(bar, sheet);
const where = bar.querySelector('.cb-where');

/* ---------- dove sono ---------- */
const current = () => PAGE || doc.querySelector('.moi-room.is-active')?.dataset.moiCategory || '';
let ctx = '';
function sync() {
  const k = current();
  if (k !== ctx) {
    ctx = k; bar.dataset.theme = sheet.dataset.theme = k; k ? (html.dataset.svc = k) : delete html.dataset.svc;
    const s = S.find(x => x[0] === k); where.querySelector('b').textContent = s ? s[1] : '';
    where.setAttribute('aria-label', s ? `Sei in ${s[1]}: apri il menu` : 'Apri il menu');
    sheet.querySelectorAll('[data-cb-go]').forEach(a => { a.hidden = a.dataset.cbGo === k; });
    html.classList.remove('cb-down');
  }
  html.classList.toggle('cb-on', !!k);
}

/* ---------- menu ---------- */
let lastFocus = null;
function openSheet(byKeyboard) {
  if (!sheet.hidden) return closeSheet();
  window.MoiDock?.close?.(); lastFocus = doc.activeElement;
  sheet.hidden = false; html.classList.add('cb-sheet-open'); where.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => sheet.classList.add('is-open'));
  if (byKeyboard) sheet.querySelector('.cb-pop a:not([hidden])')?.focus({ preventScroll: true });
}
function closeSheet(restore = true) {
  if (sheet.hidden) return;
  sheet.classList.remove('is-open'); html.classList.remove('cb-sheet-open'); where.setAttribute('aria-expanded', 'false');
  setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 260);
  if (restore) (lastFocus || where).focus?.({ preventScroll: true });
}
where.addEventListener('click', e => openSheet(e.detail === 0));
sheet.addEventListener('click', e => {
  if (e.target.closest('[data-cb-close]')) { closeSheet(); return; }
  const a = e.target.closest('a[href]'); if (a) { if (a.dataset.cbGo === ctx) { e.preventDefault(); closeSheet(); return; } closeSheet(false); }
});
doc.addEventListener('keydown', e => {
  if (sheet.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const f = [...sheet.querySelectorAll('.cb-pop a[href],.cb-pop button:not([hidden])')].filter(x => x.getClientRects().length); if (!f.length) return;
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
  else location.href = PAGE ? '/#servizi' : '#servizi';
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
