/* MOI LAB — dentro un servizio resta un solo pulsantino dorato ✦.
   Tocco → si apre e mostra: Indietro (tocco = un passo indietro, tieni premuto = servizi), Ti aiuto a scegliere (Abbigliamento), WhatsApp.
   Tocco di nuovo, tocco fuori o Esc → si richiude. Il carrello resta sempre a parte. */
(() => {
const rooms = [...document.querySelectorAll('.moi-room')]; if (!rooms.length) return;
const doc = document, html = doc.documentElement;
const WA = 'https://wa.me/393278815148?text=' + encodeURIComponent("Ciao MOI LAB, vorrei un'informazione: ");
const ICON = {
  wa: '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg>',
  spark: '<span aria-hidden="true" class="dk-spark">✦</span>'
};
const active = () => rooms.find(r => r.classList.contains('is-active'));

const dock = doc.createElement('div'); dock.className = 'dk'; dock.hidden = true;
dock.innerHTML = `<div class="dk-items" id="dk-items" role="group" aria-label="Comandi">
    <a class="dk-item dk-wa" href="${WA}" target="_blank" rel="noopener"><span class="dk-ic">${ICON.wa}</span><span class="dk-l">Scrivici su WhatsApp</span></a>
    <button type="button" class="dk-item dk-as"><span class="dk-ic">${ICON.spark}</span><span class="dk-l">Ti aiuto a scegliere</span></button>
    <div class="dk-back"><span class="dk-hint">tieni premuto: servizi</span></div>
  </div>
  <button type="button" class="dk-main" aria-expanded="false" aria-controls="dk-items" aria-label="Apri i comandi: indietro, assistente, WhatsApp"><span class="dk-star" aria-hidden="true">✦</span><span class="dk-x" aria-hidden="true">×</span></button>`;
doc.body.append(dock);
const main = dock.querySelector('.dk-main'), asBtn = dock.querySelector('.dk-as'), backBox = dock.querySelector('.dk-back');

// la freccia Indietro (Hold Button) entra nel menu
const adopt = () => { const b = window.MoiRoomBack?.button; if (b && !backBox.contains(b)) backBox.prepend(b); return !!b; };
if (!adopt()) { let n = 0; const iv = setInterval(() => { if (adopt() || ++n > 30) clearInterval(iv); }, 100); }

const setOpen = on => {
  dock.classList.toggle('is-open', on); main.setAttribute('aria-expanded', String(on));
  main.setAttribute('aria-label', on ? 'Chiudi i comandi' : 'Apri i comandi: indietro, assistente, WhatsApp');
  dock.querySelector('.dk-items').inert = !on;
  if (on) asBtn.hidden = !(window.MoiAssist && window.MoiAssist.visible());
};
main.addEventListener('click', () => setOpen(!dock.classList.contains('is-open')));
asBtn.addEventListener('click', () => { setOpen(false); window.MoiAssist?.open(); });
dock.querySelector('.dk-wa').addEventListener('click', () => setTimeout(() => setOpen(false), 200));
backBox.addEventListener('click', () => setTimeout(() => setOpen(false), 900));
doc.addEventListener('pointerdown', e => { if (dock.classList.contains('is-open') && !dock.contains(e.target)) setOpen(false); }, true);
doc.addEventListener('keydown', e => { if (e.key === 'Escape' && dock.classList.contains('is-open')) { setOpen(false); main.focus(); } });
dock.querySelector('.dk-items').inert = true;

const sync = () => {
  const r = active(), on = !!r;
  html.classList.toggle('dk-on', on);
  if (dock.hidden === !on) return;
  dock.hidden = !on; if (!on) setOpen(false);
  if (on) doc.dispatchEvent(new CustomEvent('moi:room-enter', { detail: r.id }));
};
rooms.forEach(r => new MutationObserver(sync).observe(r, { attributes: true, attributeFilter: ['class'] }));
html.classList.add('dk-ready');
sync();
window.MoiDock = { open: () => setOpen(true), close: () => setOpen(false), main };
})();
