/* MOI LAB — nomi dei servizi:
   · titolo = «Masked Heading» di React Bits: le lettere sono finestre su un Galaxy (clip-path SVG come l'originale),
     e salgono dal basso quando compaiono;
   · sottotitolo = «Gradient Text» di React Bits (bianco → grigio ardesia, che scorre piano).
   Componenti di React Bits (David Haz, MIT + Commons Clause), rifatti in vanilla. Il Galaxy gira solo sul titolo visibile. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut4 = t => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);
const SVGNS = 'http://www.w3.org/2000/svg';
const GALAXY = { transparent: true, mouseInteraction: false, clickWarp: false, intro: false, density: 2.2, glowIntensity: 0.45,
  saturation: 0, hueShift: 140, starSpeed: 0.6, twinkleIntensity: 0.5, rotationSpeed: 0.06, starSize: 1.4, dpr: 1, layers: 3 };
let uid = 0;

/* ---------- Masked Heading ---------- */
const heads = [];
function masked(el, isActive) {
  if (!el || el.dataset.mh) return; el.dataset.mh = '1';
  const id = `moi-mh-${++uid}`;
  el.classList.add('mh');
  el.dataset.label = el.textContent.trim();   // il testo vero, senza le copie dentro gli SVG
  const h = { el, isActive, id, on: false, t0: 0, glyphs: [], lines: [], gx: false, size: 40, key: '' };
  h.svg = document.createElementNS(SVGNS, 'svg'); h.svg.setAttribute('class', 'mh-defs'); h.svg.setAttribute('aria-hidden', 'true');
  h.svg.innerHTML = `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"></clipPath></defs>`;
  h.clipPath = h.svg.querySelector('clipPath');
  h.clip = document.createElement('span'); h.clip.className = 'mh-clip'; h.clip.setAttribute('aria-hidden', 'true');
  h.clip.style.clipPath = `url(#${id})`; h.clip.style.webkitClipPath = `url(#${id})`;
  h.media = document.createElement('span'); h.media.className = 'mh-media'; h.media.style.display = 'none'; h.clip.append(h.media);
  h.outline = document.createElementNS(SVGNS, 'svg'); h.outline.setAttribute('class', 'mh-outline'); h.outline.setAttribute('aria-hidden', 'true');
  heads.push(h);
  attach(h);
  loop();
}
function attach(h) { if (h.svg.parentNode !== h.el) { h.el.append(h.svg, h.clip, h.outline); h.key = ''; } }
function layout(h) {
  attach(h);   // la tendina riscrive il testo: rimetto i livelli
  const node = [...h.el.childNodes].find(n => n.nodeType === 3 && n.data.trim());
  if (!node) return;
  const text = node.data;
  const cs = getComputedStyle(h.el), er = h.el.getBoundingClientRect(), range = document.createRange();
  const font = { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle, letterSpacing: cs.letterSpacing };
  const size = parseFloat(cs.fontSize) || 40;
  const glyphs = []; let off = 0;
  for (const ch of Array.from(text)) {
    range.setStart(node, off); range.setEnd(node, off + ch.length); off += ch.length;
    if (!ch.trim()) continue;
    const r = range.getBoundingClientRect();
    glyphs.push({ ch, x: r.left - er.left, y: r.bottom - er.top - size * 0.21 });
  }
  const key = text + '|' + glyphs.map(g => g.x.toFixed(1) + ',' + g.y.toFixed(1)).join(';') + font.fontSize;
  if (key === h.key) return; h.key = key;
  const mk = () => glyphs.map(g => { const t = document.createElementNS(SVGNS, 'text'); t.textContent = g.ch; t.setAttribute('x', g.x.toFixed(2)); t.setAttribute('y', g.y.toFixed(2)); Object.assign(t.style, font); return t; });
  h.clipPath.replaceChildren(...(h.glyphs = mk()));
  h.outline.replaceChildren(...(h.lines = mk()));
  h.size = size;
}
function paint(h, now) {
  const t = reduce ? 9 : (now - h.t0) / 1000;
  let moving = false;
  h.glyphs.forEach((g, i) => {
    const p = easeOut4((t - i * 0.035) / 1.1), dy = (1 - p) * h.size * 1.15;
    if (p < 1) moving = true;
    const line = h.lines[i];
    if (dy > 0.05) { const tr = `translate(0 ${dy.toFixed(2)})`; g.setAttribute('transform', tr); line?.setAttribute('transform', tr); }
    else { g.removeAttribute('transform'); line?.removeAttribute('transform'); }
  });
  return moving;
}
function galaxyOn(h, on) {
  if (on && !h.gx && window.MoiGalaxy) { try { window.MoiGalaxy.mount(h.media, GALAXY); } catch (e) { console.warn('Galaxy non disponibile', e); } h.gx = true; }
  h.media.style.display = on ? '' : 'none';   // nascosto → il Galaxy si ferma da solo
}

/* ---------- Gradient Text (lineare, avanti e indietro) ---------- */
const grads = [];
const COLORS = ['#ffffff', '#94a3b8'], SPEED = 8, SCALE = 3, ANGLE = 90;
function gradient(el) {
  if (!el || el.dataset.gt) return; el.dataset.gt = '1';
  el.classList.add('gt-text'); grads.push(el); loop();
}
function gradImage(time) {
  const cycle = time / SPEED, loopC = [...COLORS, COLORS[0]], period = 100 * SCALE;
  const swing = cycle % 2, tt = swing < 1 ? swing : 2 - swing;
  const offset = (0.5 - Math.cos(Math.PI * tt) / 2) * (period - 100);
  return `repeating-linear-gradient(${ANGLE}deg, ${loopC.map((c, i) => `${c} ${((i / (loopC.length - 1)) * period - offset).toFixed(2)}%`).join(', ')})`;
}

/* ---------- un solo ciclo leggero ---------- */
let raf = 0, timer = 0, lastGrad = 0;
const start = performance.now();
const inView = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
function frame(now) {
  raf = 0;
  let busy = false;
  const covered = document.querySelector('.sa-curtain.is-in');   // tendina chiusa: le schede sotto non si vedono
  for (const h of heads) {
    const on = h.isActive() && inView(h.el) && (!covered || covered.contains(h.el));
    if (on && !h.on) { h.t0 = now; h.key = ''; }
    if (on !== h.on) galaxyOn(h, on);
    h.on = on;
    if (on) { layout(h); if (paint(h, now)) busy = true; }
  }
  // il gradiente si muove piano: basta aggiornarlo ~20 volte al secondo
  let grad = false;
  if (now - lastGrad > 50) {
    lastGrad = now;
    const img = gradImage(reduce ? 0 : (now - start) / 1000);
    for (const el of grads) if (inView(el)) { el.style.setProperty('--gt-gradient', img); grad = true; }
  } else grad = grads.length > 0;
  if (busy) raf = requestAnimationFrame(frame);
  else { clearTimeout(timer); timer = setTimeout(loop, grad && !reduce ? 50 : 250); }
}
function loop() { if (!raf) raf = requestAnimationFrame(frame); }

/* ---------- collegamento: schede dei servizi + tendina ---------- */
function wire() {
  if (!CSS.supports('clip-path', 'url(#a)')) return;
  document.querySelectorAll('#servizi .mlg-card-wrap').forEach(w => {
    masked(w.querySelector('.mlg-caption h2'), () => w.classList.contains('sa-on'));
    gradient(w.querySelector('.mlg-caption p'));
  });
  const cur = document.querySelector('.sa-curtain');
  if (cur) { masked(cur.querySelector('b'), () => cur.classList.contains('is-in')); gradient(cur.querySelector('small')); }
  else setTimeout(wire, 300);
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', wire) : wire();
window.MoiMasked = { masked, gradient };
})();
