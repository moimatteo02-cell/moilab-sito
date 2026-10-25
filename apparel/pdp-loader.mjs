// Caricamento della scheda prodotto: M di MOI LAB su sfondo bianco + barra di avanzamento.
// Aspetta che il video del capo sia pronto (o la foto principale se non c'e' video), poi apre la scheda.
const PATH = 'M4 34V9l17 18L38 9v25';
const MAX_WAIT = 9000, MIN_SHOW = 900;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function overlay(name) {
  const el = document.createElement('div');
  el.className = 'pdp-loader'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', `Caricamento di ${name}`);
  el.innerHTML = `<div class="pdp-loader-inner">
    <svg viewBox="0 0 42 43" aria-hidden="true"><path class="pdp-loader-base" d="${PATH}"/><path class="pdp-loader-gold" pathLength="100" d="${PATH}"/><circle class="pdp-loader-spark" r=".55" cx="4" cy="34"/></svg>
    <p class="pdp-loader-brand">MOI LAB</p>
    <p class="pdp-loader-name">${esc(name)}</p>
    <div class="pdp-loader-bar"><i></i></div>
    <span class="pdp-loader-pct">0%</span>
  </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-on'));
  return el;
}

/** Mostra il caricamento e risolve con { video } (elemento gia' bufferizzato, o null). */
export function prepareProduct(product) {
  const el = overlay(product.nome || 'MOI LAB');
  const gold = el.querySelector('.pdp-loader-gold'), spark = el.querySelector('.pdp-loader-spark');
  const bar = el.querySelector('.pdp-loader-bar i'), pct = el.querySelector('.pdp-loader-pct');
  const len = 100, t0 = performance.now();
  let target = 0, shown = 0, done = false, raf = 0, finish;
  const pathEl = el.querySelector('.pdp-loader-base'), total = pathEl.getTotalLength();

  const paint = () => {
    // avanza in modo morbido verso il valore reale; un minimo di avanzamento "vivo" anche se il video tarda
    const elapsed = performance.now() - t0, floor = Math.min(85, elapsed / MAX_WAIT * 85);
    const goal = Math.max(target, floor);
    shown += (goal - shown) * (reduce() ? 1 : .12);
    const v = Math.min(100, shown);
    gold.style.strokeDashoffset = String(len - v);
    const pt = pathEl.getPointAtLength(total * v / 100); spark.setAttribute('cx', pt.x); spark.setAttribute('cy', pt.y);
    bar.style.transform = `scaleX(${v / 100})`; pct.textContent = Math.round(v) + '%';
    if (done && v > 99.4 && elapsed > MIN_SHOW) return finish();
    raf = requestAnimationFrame(paint);
  };

  return new Promise(resolve => {
    let video = null, img = null;
    const complete = () => { if (done) return; done = true; target = 100; };
    finish = () => {
      cancelAnimationFrame(raf);
      el.classList.remove('is-on'); el.classList.add('is-off');
      setTimeout(() => el.remove(), reduce() ? 0 : 450);
      resolve({ video });
    };
    const timer = setTimeout(complete, MAX_WAIT);   // non bloccare mai il cliente

    if (product.video) {
      video = document.createElement('video');
      video.muted = true; video.defaultMuted = true; video.loop = true; video.playsInline = true; video.preload = 'auto';
      video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
      const upd = () => {
        try { if (video.duration && video.buffered.length) target = Math.max(target, Math.min(95, video.buffered.end(video.buffered.length - 1) / Math.min(video.duration, 6) * 95)); } catch {}
      };
      video.addEventListener('progress', upd);
      video.addEventListener('loadedmetadata', () => { target = Math.max(target, 20); upd(); });
      video.addEventListener('canplaythrough', () => { clearTimeout(timer); complete(); }, { once: true });
      video.addEventListener('error', () => { clearTimeout(timer); video = null; complete(); }, { once: true });
      video.src = product.video; video.load();
    } else {
      const src = (product.galleria && product.galleria[0]) || product.immagine_principale;
      if (!src) { clearTimeout(timer); complete(); }
      else {
        img = new Image(); img.decoding = 'async';
        img.onload = img.onerror = () => { clearTimeout(timer); complete(); };
        img.src = src; target = 30;
      }
    }
    raf = requestAnimationFrame(paint);
  });
}
