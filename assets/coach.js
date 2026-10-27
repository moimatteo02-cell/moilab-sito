/* MOI LAB — mini tutorial: un «dito» fantasma mostra come si usano i pulsanti a pressione lunga.
   Tocco → spiega il tocco; pressione lunga → il pulsante si riempie e spiega cosa succede tenendolo premuto.
   Parte le prime 2 volte; basta toccare lo schermo per chiuderlo. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAX = 2;
const seen = k => { try { return +localStorage.getItem('moi-coach-' + k) || 0; } catch { return MAX; } };
const mark = k => { try { localStorage.setItem('moi-coach-' + k, seen(k) + 1); } catch {} };
const wait = ms => new Promise(r => setTimeout(r, ms));
let running = null;

function stopAll() { if (!running) return; running.abort = true; running.cleanup(); running = null; }
['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, e => { if (running && !e.isTrusted) return; stopAll(); }, { capture: true, passive: true }));

async function play(steps) {
  if (running) return;
  const finger = document.createElement('div'); finger.className = 'cx-finger'; finger.setAttribute('aria-hidden', 'true');
  const bubble = document.createElement('div'); bubble.className = 'cx-bubble'; bubble.setAttribute('role', 'status');
  document.body.append(finger, bubble);
  const touched = [];
  const run = running = { abort: false, cleanup: () => { finger.remove(); bubble.remove(); touched.forEach(b => { b.style.removeProperty('--hb-p'); b.dataset.phase = 'idle'; }); } };
  const place = (el, text) => {
    const r = el.getBoundingClientRect();
    bubble.textContent = text; bubble.classList.remove('is-on'); void bubble.offsetWidth;
    const left = Math.min(Math.max(12, r.left), innerWidth - bubble.offsetWidth - 12);
    bubble.style.left = left + 'px'; bubble.style.top = Math.max(12, r.top - bubble.offsetHeight - 14) + 'px';
    bubble.classList.add('is-on');
  };
  const moveTo = async el => { const r = el.getBoundingClientRect(); finger.style.transform = `translate(${r.left + r.width / 2 - 17}px,${r.top + r.height / 2 - 17}px)`; await wait(reduce ? 0 : 750); };
  if (!reduce) { finger.style.transform = `translate(${innerWidth / 2 - 17}px,${innerHeight + 40}px)`; await wait(30); finger.classList.add('is-on'); }
  for (const s of steps) {
    if (run.abort) return;
    const el = s.target(); if (!el || !el.getClientRects().length) continue;
    s.done?.();
    if (!reduce) await moveTo(el); if (run.abort) return;
    // tocco
    finger.classList.add('is-tap'); place(el, s.tap); await wait(380); finger.classList.remove('is-tap');
    await wait(1700); if (run.abort) return;
    // pressione lunga: il pulsante si riempie
    place(el, s.hold); finger.classList.add('is-hold');
    const btn = el.matches('.hold-button') ? el : el.querySelector('.hold-button');
    if (btn && !reduce) {
      touched.push(btn); btn.dataset.phase = 'holding'; const t0 = performance.now(), dur = 1300;
      await new Promise(res => { const f = now => { if (run.abort) return res(); const p = Math.min(1, (now - t0) / dur); btn.style.setProperty('--hb-p', (p * .92).toFixed(3)); p < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
    } else await wait(1300);
    await wait(900); if (run.abort) return;
    finger.classList.remove('is-hold');
    if (btn) { btn.dataset.phase = 'idle'; btn.style.setProperty('--hb-p', '0'); }
    await wait(400);
  }
  if (run.abort) return;
  bubble.classList.remove('is-on'); finger.classList.remove('is-on'); await wait(400);
  if (running === run) { run.cleanup(); running = null; }
}

/* quando entri in un servizio */
document.addEventListener('moi:room-enter', e => {
  setTimeout(() => {
    if (running || !document.querySelector('.moi-room.is-active')) return;
    const steps = [];
    if (seen('back') < MAX) steps.push({ target: () => document.querySelector('.rb-back:not([hidden]) .hold-button'), tap: 'Tocca: torni indietro di un passo', hold: 'Tieni premuto: torni subito ai servizi', done: () => mark('back') });
    if (e.detail === 'moi-showroom-apparel' && seen('assist') < MAX) steps.push({ target: () => document.querySelector('.as-fab.is-on .hold-button'), tap: 'Tocca: ti aiuto a scegliere il capo giusto', hold: 'Tieni premuto: lo nascondi', done: () => mark('assist') });
    if (steps.length) play(steps);
  }, 1900);
});
window.MoiCoach = { play, stop: stopAll };
})();
