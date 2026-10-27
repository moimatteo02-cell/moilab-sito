/* MOI LAB — freccia «Indietro» dentro ogni servizio (Hold Button di React Bits), al posto di «Torna ai servizi».
   Tocco = un passo indietro (in Abbigliamento: prodotto → elenco → catalogo, poi servizi). Tieni premuto = subito ai servizi. */
(() => {
const rooms = [...document.querySelectorAll('.moi-room')]; if (!rooms.length || !window.MoiHold) return;
const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
const GRID = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>';
const active = () => rooms.find(r => r.classList.contains('is-active'));
const deep = () => { const r = active(), s = history.state; return !!(r?.id === 'moi-showroom-apparel' && s && (s.acProduct || (s.acBrowse && s.acBrowse.view && s.acBrowse.view !== 'home'))); };
const services = () => { const r = active(), a = r && (r.querySelector('a.moi-back:not(.moi-room-brand)') || r.querySelector('a.moi-back')); if (a) a.click(); else location.hash = '#servizi'; };
const wrap = document.createElement('div'); wrap.className = 'rb-back'; wrap.hidden = true;
const btn = window.MoiHold.create({
  label: '<span class="rb-t">Indietro</span>', doneLabel: '<span class="rb-t">Servizi</span>', icon: ARROW, doneIcon: GRID, holdTime: 800, releaseTime: 220, resetAfter: 700, radius: 999, size: 'md',
  backgroundColor: '#151515', fillColor: '#c8aa77', textColor: '#f6f2ea', fillTextColor: '#15130f', ariaLabel: 'Indietro. Tieni premuto per tornare ai servizi',
  hint: 'Tocca per tornare indietro, tieni premuto per tornare ai servizi',
  onTap: () => { if (deep()) history.back(); else services(); },
  onHold: () => setTimeout(services, 250)
});
btn.classList.add('rb-btn');
wrap.append(btn);
document.body.append(wrap);
const sync = () => { const on = !!active(); if (on === !wrap.hidden) return; wrap.hidden = !on; if (on) document.dispatchEvent(new CustomEvent('moi:room-enter', { detail: active().id })); };
rooms.forEach(r => new MutationObserver(sync).observe(r, { attributes: true, attributeFilter: ['class'] })); sync();
window.MoiRoomBack = { button: btn };
})();
