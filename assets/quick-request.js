/* MOI LAB — «Cosa ti serve?»: richiesta veloce da mettere nel carrello del preventivo
   (Custom, Insegne, Grafica: i servizi senza un configuratore completo). */
(() => {
const BLOCKS = {
  custom: { room: 'moi-showroom-custom', title: 'Gadget e oggetti personalizzati', k: 'Cosa vuoi personalizzare?',
    p: 'Scegli uno o più oggetti, indica la quantità e aggiungili al carrello. Prezzi e campioni li vediamo nel preventivo.',
    chips: ['Tazze', 'Borracce e thermos', 'Penne', 'Shopper e borse', 'Portachiavi', 'Calendari', 'Gadget aziendali', 'Altro'], qty: true },
  signage: { room: 'moi-showroom-signage', title: 'Insegne e pannelli', k: 'Ti serve qualcos’altro?',
    p: 'Oltre al neon: scegli cosa ti serve e aggiungilo al carrello. Misure e materiali li definiamo insieme.',
    chips: ['Insegna per negozio', 'Insegna a bandiera', 'Pannelli e cartelli', 'Vetrofanie', 'Totem', 'Targhe', 'Roll-up', 'Altro'], qty: true },
  design: { room: 'moi-showroom-design', title: 'Grafica e branding', k: 'Cosa ti serve?',
    p: 'Scegli i lavori grafici che ti servono e aggiungili al carrello: li mettiamo nello stesso preventivo.',
    chips: ['Logo', 'Biglietti da visita', 'Volantini e flyer', 'Menu', 'Grafiche per i social', 'Packaging ed etichette', 'Brand identity completa', 'Altro'], qty: false }
};
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function mount(service, b) {
  const room = document.getElementById(b.room); if (!room || room.querySelector('.qc-quick')) return;
  const anchor = room.querySelector('.mm-sign') || room.querySelector('.moi-room-content'); if (!anchor) return;
  const box = document.createElement('section'); box.className = 'qc-quick'; box.setAttribute('aria-label', b.k);
  box.innerHTML = `<p class="mm-sign-k">MOI LAB / CARRELLO</p><h3>${esc(b.k)}</h3><p>${esc(b.p)}</p>
    <div class="qc-chips" role="group" aria-label="${esc(b.k)}">${b.chips.map(c => `<button type="button" aria-pressed="false">${esc(c)}</button>`).join('')}</div>
    <div class="qc-quick-row"><input type="text" maxlength="300" placeholder="Dettagli · facoltativo (colori, misure, idea…)" aria-label="Dettagli">${b.qty ? '<input class="qc-qty" type="number" min="1" max="100000" inputmode="numeric" placeholder="Quantità" aria-label="Quantità">' : ''}<button type="button" class="qc-add" disabled>Aggiungi al carrello +</button></div><p class="qc-quick-err" role="status"></p>`;
  anchor.after(box);
  const chips = [...box.querySelectorAll('.qc-chips button')], add = box.querySelector('.qc-add'), note = box.querySelector('input[type=text]'), qty = box.querySelector('.qc-qty'), err = box.querySelector('.qc-quick-err');
  const picked = () => chips.filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.textContent);
  chips.forEach(c => c.addEventListener('click', () => { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); add.disabled = !picked().length; err.textContent = ''; }));
  add.addEventListener('click', () => {
    const list = picked(); if (!list.length) { err.textContent = 'Scegli almeno una voce.'; return; }
    if (!window.MoiCart) { err.textContent = 'Carrello non disponibile: ricarica la pagina.'; return; }
    const q = qty && Number(qty.value) > 0 ? Math.round(Number(qty.value)) : null;
    window.MoiCart.add({ service, title: `${b.title}: ${list.join(', ')}`, qty: q, details: [['Dettagli', note.value.trim() || 'da definire insieme']] });
    chips.forEach(c => c.setAttribute('aria-pressed', 'false')); note.value = ''; if (qty) qty.value = ''; add.disabled = true;
  });
}
const start = () => Object.entries(BLOCKS).forEach(([k, b]) => mount(k, b));
// le insegne al neon vengono create da moi-motion-extra.js: aspetto che ci siano
const go = () => { start(); setTimeout(start, 800); };
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
