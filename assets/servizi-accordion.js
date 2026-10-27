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
    const ic = w.querySelector('.mlg-service-icon')?.outerHTML || '';
    a?.insertAdjacentHTML('beforeend', `<span class="sa-side" aria-hidden="true"><span class="sa-ic">${ic}</span><span class="sa-name">${name}</span></span><span class="sa-intro">${intro}</span><span class="sa-enter" aria-hidden="true">Entra →</span>`);
    w.style.setProperty('--sa-i', i);
    w.addEventListener('mouseenter', () => { if (fine.matches) set(i); });
    a?.addEventListener('focus', () => { if (performance.now() - lastDown > 600) set(i); });   // solo da tastiera
  });
  // il primo tocco su un servizio chiuso lo apre soltanto (prima che parta il pannello del servizio)
  document.addEventListener('click', e => {
    const a = e.target.closest?.('#servizi.sa a.mlg-card'); if (!a) return;
    const i = wraps.indexOf(a.closest('.mlg-card-wrap'));
    e.preventDefault(); e.stopImmediatePropagation();
    if (i !== active) set(i); else go(a);
  }, true);
  // secondo tocco: si entra nel servizio con la tendina del menu (strati oro e scuro che scorrono)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const curtain = document.createElement('div'); curtain.className = 'sa-curtain'; curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<i class="l1"></i><i class="l2"></i><div class="sa-curtain-in"><span class="sa-curtain-ic"></span><b></b><small></small></div>';
  document.body.append(curtain);
  let busy = false;
  function go(a) {
    if (busy) return; busy = true;
    const hash = a.getAttribute('href'), w = a.closest('.mlg-card-wrap');
    if (reduce) { location.hash = hash; busy = false; return; }
    curtain.querySelector('.sa-curtain-ic').innerHTML = w.querySelector('.mlg-caption .mlg-service-icon')?.outerHTML || '';
    curtain.querySelector('b').textContent = w.querySelector('h2')?.textContent || '';
    curtain.querySelector('small').textContent = w.querySelector('.mlg-caption p')?.textContent || '';
    curtain.classList.remove('is-out'); void curtain.offsetWidth; curtain.classList.add('is-in');
    setTimeout(() => { location.hash = hash; }, 950);
    setTimeout(() => { curtain.classList.add('is-out'); curtain.classList.remove('is-in'); }, 1350);
    setTimeout(() => { curtain.classList.remove('is-out'); busy = false; }, 2300);
  }
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
