/* MOI LAB — freccia «Indietro» in Abbigliamento (Hold Button di React Bits):
   tocco = un passo indietro nel catalogo (prodotto → elenco → catalogo); tieni premuto = torna ai servizi. */
(() => {
const room = document.getElementById('moi-showroom-apparel'); if (!room || !window.MoiHold) return;
const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
const GRID = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>';
const deep = () => { const s = history.state; return !!(s && (s.acProduct || (s.acBrowse && s.acBrowse.view && s.acBrowse.view !== 'home'))); };
const services = () => { const a = room.querySelector('a.moi-back:not(.moi-room-brand)') || room.querySelector('a.moi-back'); if (a) a.click(); else location.hash = '#servizi'; };
const wrap = document.createElement('div'); wrap.className = 'rb-back'; wrap.hidden = true;
const btn = window.MoiHold.create({
  label: '<span class="rb-t">Indietro</span>', doneLabel: '<span class="rb-t">Servizi</span>', icon: ARROW, doneIcon: GRID, holdTime: 800, releaseTime: 220, resetAfter: 700, radius: 999, size: 'md',
  backgroundColor: '#151515', fillColor: '#c8aa77', textColor: '#f6f2ea', fillTextColor: '#15130f', ariaLabel: 'Indietro. Tieni premuto per tornare ai servizi',
  hint: 'Tocca per tornare indietro, tieni premuto per tornare ai servizi',
  onTap: () => { if (deep()) history.back(); else services(); },
  onHold: () => setTimeout(services, 250)
});
wrap.append(btn);
const tip = document.createElement('span'); tip.className = 'rb-tip'; tip.textContent = 'Tieni premuto: torni ai servizi'; wrap.append(tip);
document.body.append(wrap);
let shown = 0; try { shown = +localStorage.getItem('moi-rb-tip') || 0; } catch {}
const sync = () => {
  const on = room.classList.contains('is-active');
  if (on === !wrap.hidden) return;
  wrap.hidden = !on;
  if (on && shown < 3) { shown++; try { localStorage.setItem('moi-rb-tip', shown); } catch {} wrap.classList.add('rb-tip-on'); setTimeout(() => wrap.classList.remove('rb-tip-on'), 3200); }
};
new MutationObserver(sync).observe(room, { attributes: true, attributeFilter: ['class'] }); sync();
})();
