/* "Tirami giù per tornare su": il Sling Button (React Bits) in fondo a ogni pagina.
   Quando è visibile, il pulsante tondo "torna su" in basso a sinistra sparisce. */
(() => {
  if (!window.MoiSling) return;
  const doc = document, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LIGHT = { padColor: '#18181b', iconColor: '#ffffff', accentColor: '#18181b', wellColor: '#f6f6f6', bandColor: '#a1a1aa' };
  const shown = new Set();
  const sync = () => doc.documentElement.classList.toggle('sling-end-on', [...shown].some(b => b.isConnected && (!b.closest('.moi-room') || b.closest('.moi-room').classList.contains('is-active'))));
  // risalita veloce: parte piano, accelera, frena in cima
  const fly = scroller => {
    const el = scroller || doc.scrollingElement, from = el.scrollTop; if (!from) return;
    if (reduce) { el.scrollTop = 0; return; }
    const dur = Math.min(900, 380 + from / 12), t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; el.scrollTop = from * (1 - e); if (p < 1) requestAnimationFrame(step); };
    setTimeout(() => requestAnimationFrame(step), 140);   // il tempo di vedere il lancio
  };
  const make = (where, scroller, dark) => {
    const box = doc.createElement('div'); box.className = 'sling-end' + (dark ? ' sling-end-dark' : '');
    box.innerHTML = '<span class="sling-end-slot"></span><p><b>Tirami giù</b><span>e lasciami andare: torni in cima.</span></p>';
    where(box);
    MoiSling.mount(box.querySelector('.sling-end-slot'), { ...(dark ? {} : LIGHT), axis: 'down', ariaLabel: 'Torna in cima alla pagina', hint: 'Premi Invio per tornare in cima, oppure tira giù e rilascia.', onSend: () => fly(scroller) });
    new IntersectionObserver(es => { es[0].isIntersecting ? shown.add(box) : shown.delete(box); sync(); }, { root: scroller || null }).observe(box);
  };
  doc.querySelectorAll('.moi-room').forEach(room => {
    const shell = room.querySelector('.moi-room-shell') || room;
    make(b => shell.append(b), room);
    new MutationObserver(sync).observe(room, { attributes: true, attributeFilter: ['class'] });
  });
  const foot = doc.querySelector('.mlg-footer');
  if (foot) make(b => foot.before(b), null, true);
})();
