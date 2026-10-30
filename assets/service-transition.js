/* MOI LAB — passaggio tra servizi (stesse regole su ogni pagina).
   MoiST.play(key, mid) : copre coi colori del servizio, esegue mid() sotto la tenda, poi scopre.
   MoiST.go(key, url)   : copre e cambia pagina; la pagina di arrivo scopre da sola.
   key: apparel · custom · automotive · signage · design · digital · hub (la pagina dei servizi). */
(() => {
'use strict';
if (window.MoiST) return;
const doc = document, html = doc.documentElement;
const NAMES = { hub: 'Servizi', apparel: 'Abbigliamento', custom: 'Sticker e oggetti', automotive: 'Automotive', signage: 'Signage', design: 'Design', digital: 'Digital' };
const SUBS = { hub: 'Torna a tutti i servizi', apparel: 'Capi personalizzati', custom: 'Sticker, biglietti, scatole', automotive: 'Veicoli e wrapping', signage: 'Insegne e pannelli', design: 'Grafica e branding', digital: 'Siti e automazioni' };
const MARK = '<svg viewBox="0 0 42 43" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 34V9l17 18L38 9v25"/></svg>';
const iconOf = key => key === 'hub' ? MARK : (doc.querySelector(`[data-card="${key}"] .mlg-caption .mlg-service-icon`)?.outerHTML || window.MOI_SERVICE_ICONS?.[key] || '');
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const COVER = 950, HOLD = 380, LEAVE = 480, SCENE = 1050;
/* una scena per servizio (CSS in service-transition.css): parte quando la tenda si chiude */
const ic = k => window.MOI_SERVICE_ICONS?.[k] || '';
const SCENES = {
  apparel: () => `<div class="sc sc-apparel"><svg viewBox="0 0 260 110" aria-hidden="true"><defs><pattern id="sc-wv" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 2.5h5M2.5 0v5" stroke="#181818" stroke-opacity=".08"/></pattern><mask id="sc-mk"><path class="mk" pathLength="1" d="M104 14L84 22 64 40 79 54 92 45V100H168V45L181 54 196 40 176 22 156 14Q148 27 130 27T104 14Z" fill="none" stroke="#fff" stroke-width="9"/></mask></defs><g class="fab"><path d="M104 14L84 22 64 40 79 54 92 45V100H168V45L181 54 196 40 176 22 156 14Q148 27 130 27T104 14Z" fill="#e7e0d3"/><path d="M104 14L84 22 64 40 79 54 92 45V100H168V45L181 54 196 40 176 22 156 14Q148 27 130 27T104 14Z" fill="url(#sc-wv)"/><path d="M118 27Q130 33 142 27" fill="none" stroke="#cfc4b2" stroke-width="2"/></g><path class="seam" d="M104 14L84 22 64 40 79 54 92 45V100H168V45L181 54 196 40 176 22 156 14Q148 27 130 27T104 14Z" fill="none" stroke="#8a2d2d" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="5 4" mask="url(#sc-mk)"/></svg><span class="sc-needle"><i></i></span></div>`,
  automotive: () => `<div class="sc sc-auto"><i class="sk sk1"></i><i class="sk sk2"></i><i class="pf p1"></i><i class="pf p2"></i><i class="pf p3"></i><span class="car">${ic('automotive')}</span></div>`,
  signage: () => `<div class="sc sc-sign">${ic('signage')}</div>`,
  design: () => `<div class="sc sc-design"><svg viewBox="0 0 260 110" aria-hidden="true"><path class="dr" pathLength="1" d="M90 92V22l40 44 40-44v70"/><circle class="dot" cx="186" cy="18" r="5"/></svg><span class="pen">${ic('design')}</span></div>`,
  digital: () => `<div class="sc sc-dig">${Array.from({ length: 60 }, () => `<i style="--d:${(Math.random() * .75).toFixed(2)}s" class="${['g', 'c', 's', 'g', ''][Math.floor(Math.random() * 5)]}"></i>`).join('')}</div>`,
  custom: () => `<div class="sc sc-stk"><div class="stk"><div class="stk-face">${ic('custom')}<b>MOI LAB</b></div><i class="curl"></i></div></div>`
};
let el = null, busy = false;
function node() {
  if (el) return el;
  el = doc.createElement('div'); el.className = 'st'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<i class="st-a"></i><i class="st-b"></i><div class="st-in"><span class="st-sc"></span><span class="st-ic"></span><b class="st-t"></b><small class="st-s"></small></div>';
  doc.body.append(el); return el;
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
function fill(s, key, o = {}, scene = true) {
  s.dataset.st = key;
  const sc = scene && o.icon == null && SCENES[key] && !reduce() ? SCENES[key]() : '';
  s.querySelector('.st-sc').innerHTML = sc; s.dataset.scene = sc ? '1' : '';
  s.querySelector('.st-ic').innerHTML = sc ? '' : (o.icon ?? iconOf(key));
  const t = s.querySelector('.st-t'); if (!o.title && key === 'design') t.innerHTML = '<span class="st-moi">MOI</span> Design'; else t.textContent = o.title || NAMES[key] || '';
  s.querySelector('.st-s').textContent = o.sub ?? SUBS[key] ?? '';
}
async function cover(key, o) {
  const s = node(); fill(s, key, o);
  s.className = 'st on'; await frame(); s.classList.add('cover'); await wait(COVER);
}
async function uncover() {
  const s = node(); s.classList.add('leave'); await wait(LEAVE);
  s.className = 'st snap'; delete s.dataset.st; void s.offsetWidth; s.className = 'st';
}
async function play(key, mid, o) {
  if (reduce() || busy) { mid?.(); return; }
  busy = true;
  try { await cover(key, o); await mid?.(); await wait(el.dataset.scene ? (el.dataset.st === 'custom' ? SCENE + 250 : SCENE) : HOLD); await uncover(); } finally { busy = false; }
}
async function go(key, url, replace, o) {
  const nav = () => replace ? location.replace(url) : (location.href = url);
  if (reduce()) { nav(); return; }
  const s0 = node(); fill(s0, key, o);
  try { sessionStorage.setItem('moi-st', JSON.stringify({ key, icon: o?.icon ?? iconOf(key), title: s0.querySelector('.st-t').textContent, sub: s0.querySelector('.st-s').textContent })); } catch {}
  busy = true; await cover(key, o); if (s0.dataset.scene) await wait(SCENE - 250); nav();
  setTimeout(() => { busy = false; }, 3000);
}
/* arrivo da un'altra pagina: la tenda è già chiusa (html.st-pre), la apro */
function arrive() {
  let d = null; try { d = JSON.parse(sessionStorage.getItem('moi-st') || 'null'); sessionStorage.removeItem('moi-st'); } catch {}
  if (!d || !d.key || reduce()) { html.classList.remove('st-pre'); return; }
  const key = d.key, s = node(); fill(s, key, d, false);
  s.className = 'st on snap cover'; html.classList.remove('st-pre');
  const open = () => { s.classList.remove('snap'); setTimeout(uncover, 300); };
  (doc.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(open));
}
/* tornando indietro col browser la pagina può riapparire ancora coperta */
addEventListener('pageshow', e => { if (e.persisted && el && el.classList.contains('on')) { busy = false; uncover(); } });

/* link verso un altro servizio su un'altra pagina */
const keyOf = url => {
  if (url.origin !== location.origin) return null;
  if (url.pathname.startsWith('/custom')) return 'custom';
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const m = url.hash.match(/^#moi-showroom-([a-z]+)/); if (m) return m[1] === 'custom' ? 'custom' : m[1];
    if (!url.hash || url.hash === '#servizi') return 'hub';
  }
  return null;
};
doc.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[href]'); if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  const samePage = url.pathname === location.pathname;
  let key = keyOf(url);
  if (samePage && key === 'custom' && url.pathname === '/') { e.preventDefault(); e.stopImmediatePropagation(); go('custom', '/custom/'); return; }
  if (!key || samePage) return;
  e.preventDefault(); e.stopImmediatePropagation();
  go(key, key === 'custom' ? '/custom/' + (url.pathname.startsWith('/custom') ? url.hash : '') : url.pathname + url.search + url.hash);
}, true);

window.MoiST = { play, go, cover, uncover, names: NAMES };
doc.readyState === 'loading' ? doc.addEventListener('DOMContentLoaded', arrive) : arrive();
})();
