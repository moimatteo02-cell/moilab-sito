/* Scelta dei servizi a fisarmonica — effetto "Accordion Gallery" di React Bits (David Haz, MIT + Commons Clause),
   rifatto senza React/GSAP sulle card esistenti: stessi link, stesse scritte, stesse foto, stesso pannello che si apre.
   Servizio chiuso: foto in bianco e nero, leggermente inclinata. Servizio aperto: a colori, bordo dorato che gira,
   tutte le scritte. Primo tocco su un servizio chiuso = lo apre; tocco sul servizio aperto = entra. */
(() => {
  const grid = document.querySelector('#moi-lab-hub #servizi'); if (!grid) return;
  const wraps = [...grid.querySelectorAll(':scope > .mlg-card-wrap')]; if (wraps.length < 2) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  grid.classList.add('sa'); grid.classList.remove('mm-stack');
  let active = 2, lastDown = 0;
  grid.addEventListener('pointerdown', () => { lastDown = performance.now(); }, true);
  wraps.forEach((w, i) => {
    const a = w.querySelector('a.mlg-card'), name = w.querySelector('h2')?.textContent || '', intro = a?.dataset.moiIntro || '';
    a?.insertAdjacentHTML('beforeend', `<span class="sa-side" aria-hidden="true">${name}</span><span class="sa-intro">${intro}</span><span class="sa-enter" aria-hidden="true">Entra →</span>`);
    w.style.setProperty('--sa-i', i);
    w.addEventListener('mouseenter', () => { if (fine.matches) set(i); });
    a?.addEventListener('focus', () => { if (performance.now() - lastDown > 600) set(i); });   // solo da tastiera
  });
  // il primo tocco su un servizio chiuso lo apre soltanto (prima che parta il pannello del servizio)
  document.addEventListener('click', e => {
    const a = e.target.closest?.('#servizi.sa a.mlg-card'); if (!a) return;
    const i = wraps.indexOf(a.closest('.mlg-card-wrap'));
    if (i !== active) { e.preventDefault(); e.stopImmediatePropagation(); set(i); }
  }, true);
  grid.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return;
    e.preventDefault(); const n = (active + k + wraps.length) % wraps.length; wraps[n].querySelector('a.mlg-card')?.focus();
  });
  function set(i) {
    if (i === active && grid.dataset.ready) return; active = i; grid.dataset.ready = '1';
    wraps.forEach((w, j) => {
      w.classList.toggle('sa-on', j === i);
      w.style.setProperty('--sa-side', j === i ? 0 : j < i ? 1 : -1);            // inclinazione verso il servizio aperto
      w.style.setProperty('--sa-drift', Math.max(-1.5, Math.min(1.5, i - j)));   // la foto scorre un po' (parallasse)
      w.querySelector('a.mlg-card')?.setAttribute('aria-current', j === i ? 'true' : 'false');
    });
  }
  set(active);
})();
