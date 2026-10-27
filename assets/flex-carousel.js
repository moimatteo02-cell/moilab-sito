/* FlexCarousel — React Bits (David Haz), MIT + Commons Clause.
   Porting vanilla per MOI LAB: stessi shader, stessa fisica, stesse intro; OGL sostituito da WebGL2 puro.
   Uso: MoiFlexCarousel.mount(contenitore, { items:[{src, alt, title, subtitle}], preset:'liquid', ... }) */
(() => {
const BEND_PRESETS = {
  liquid: { lensWidth: 0.74, lensHeight: 1.18, tilt: 62, roundness: 1, bend: 0.34, reach: 0.38, curl: 'twist', dispersion: 0.45, liquid: 0, followCursor: false },
  ribbon: { lensWidth: 0.8, lensHeight: 0.8, tilt: 0, roundness: 1, bend: 0.34, reach: 0.34, curl: 'twist', dispersion: 0.4, liquid: 0, followCursor: false },
  vortex: { lensWidth: 0.7, lensHeight: 0.95, tilt: 30, roundness: 1, bend: 0.46, reach: 0.3, curl: 'twist', dispersion: 0.5, liquid: 0, followCursor: false },
  arch: { lensWidth: 0.8, lensHeight: 0.8, tilt: 0, roundness: 1, bend: 0.3, reach: 0.36, curl: 'rise', dispersion: 0.4, liquid: 0, followCursor: false }
};
const FIT_ASPECT = { portrait: 0.75, square: 1, landscape: 4 / 3 };
const TAPS = 12;
const PIXEL_BUDGET = 4.5e6;
const INTRO_DURATION = { rise: 2.1, bloom: 1.6, spin: 2.2, deal: 1.5, fade: 0.35 };

const wrap = (value, size) => ((((value + size / 2) % size) + size) % size) - size / 2;
const clamp01 = value => Math.min(Math.max(value, 0), 1);
const easeOut = value => 1 - Math.pow(1 - clamp01(value), 3);
const easeOutQuint = value => 1 - Math.pow(1 - clamp01(value), 5);
const easeInOut = value => { const t = clamp01(value); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

const cardVertex = `#version 300 es
in vec3 position;
in vec2 uv;
uniform vec4 uRect;
uniform vec2 uResolution;
out vec2 vUv;
out vec2 vLocal;
void main() {
  vUv = uv;
  vLocal = vec2(position.x, -position.y) * uRect.zw;
  vec2 px = uRect.xy + vLocal;
  gl_Position = vec4(px.x / uResolution.x * 2.0 - 1.0, 1.0 - px.y / uResolution.y * 2.0, 0.0, 1.0);
}`;

const cardFragment = `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 uSize;
uniform vec2 uImage;
uniform float uRadius;
uniform float uAlpha;
uniform float uReady;
uniform float uShift;
uniform float uDpr;
uniform vec3 uPlaceholder;
in vec2 vUv;
in vec2 vLocal;
out vec4 fragColor;
float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  float sd = roundedBox(vLocal, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
  float mask = clamp(0.5 - sd * uDpr, 0.0, 1.0);
  vec2 local = vLocal / uSize + 0.5;
  float cardAspect = uSize.x / uSize.y;
  float imageAspect = uImage.x / max(uImage.y, 1.0);
  vec2 scale = imageAspect > cardAspect ? vec2(cardAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / cardAspect);
  scale /= 1.08;
  vec2 uv = vec2(local.x, 1.0 - local.y);
  uv = (uv - 0.5) * scale + 0.5;
  uv.x += uShift * (1.0 - scale.x) * 0.5;
  vec3 image = texture(tMap, uv).rgb;
  vec3 color = mix(uPlaceholder, image, uReady);
  float alpha = mask * uAlpha;
  fragColor = vec4(color * alpha, alpha);
}`;

const lensVertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const lensFragment = `#version 300 es
precision highp float;
uniform sampler2D tScene;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uAngle;
uniform float uExponent;
uniform float uInner;
uniform float uOuter;
uniform float uFlow;
uniform float uCurl;
uniform float uDispersion;
uniform float uStrength;
uniform float uSceneAlpha;
out vec4 fragColor;
void main() {
  vec2 frag = gl_FragCoord.xy / uDpr;
  vec2 uv = frag / uResolution;
  vec2 rel = frag - vec2(uCenter.x, uResolution.y - uCenter.y);
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  vec2 local = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y);
  vec2 k = max(abs(local) / uHalf, vec2(1e-5));
  float nd = pow(pow(k.x, uExponent) + pow(k.y, uExponent), 1.0 / uExponent);
  vec2 grad = pow(k, vec2(uExponent - 1.0)) * sign(local) / uHalf * pow(nd, 1.0 - uExponent);
  float glen = max(length(grad), 1e-6);
  float edge = (nd - 1.0) / glen;
  vec2 outward = grad / glen;
  vec2 normal = vec2(ca * outward.x - sa * outward.y, sa * outward.x + ca * outward.y);
  vec2 along = vec2(-normal.y, normal.x);
  float t = clamp((edge + uInner) / (uInner + uOuter), 0.0, 1.0);
  float ramp = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  float slope = 16.0 * t * t * (1.0 - t) * (1.0 - t);
  float reachX = rel.x / (uResolution.x * 0.5);
  float side = smoothstep(0.02, 0.3, abs(reachX)) * (uCurl == 0.0 ? sign(reachX) : uCurl);
  float lift = ramp * side * uFlow * uStrength;
  vec2 swirl = along * along.y * side * slope * uFlow * uStrength * 0.35;
  vec2 drift = vec2(0.0, -lift) - swirl;
  vec2 shifted = uv + drift / uResolution;
  vec2 texels = uResolution * uDpr;
  vec2 gx = dFdx(shifted);
  vec2 gy = dFdy(shifted);
  gx *= min(1.0, 3.0 / max(length(gx * texels), 1e-4));
  gy *= min(1.0, 3.0 / max(length(gy * texels), 1e-4));
  vec4 color = textureGrad(tScene, shifted, gx, gy);
  vec2 spread = vec2(0.0, side * slope * uFlow * uStrength) / uResolution * uDispersion;
  float spreadPx = length(spread * texels);
  if (color.a > 0.002 && spreadPx > 0.25) {
    vec3 base = color.rgb / color.a;
    vec3 sumColor = vec3(0.0);
    vec3 sumWeight = vec3(0.0);
    for (int i = 0; i < ${TAPS}; i++) {
      float s = (float(i) + 0.5) / float(${TAPS});
      vec4 c = textureGrad(tScene, shifted + spread * (s - 0.5), gx, gy);
      vec3 w = max(1.0 - abs(vec3(s) - vec3(0.15, 0.5, 0.85)) * 2.6, 0.0) * c.a;
      sumColor += c.rgb * (w / max(c.a, 0.002));
      sumWeight += w;
    }
    vec3 split = mix(base, sumColor / max(sumWeight, vec3(1e-4)), clamp(sumWeight * 2.0, 0.0, 1.0));
    color.rgb = mix(color.rgb, clamp(split, 0.0, 1.0) * color.a, smoothstep(0.25, 1.5, spreadPx));
  }
  fragColor = color * uSceneAlpha;
}`;

/* ---------- piccoli aiuti WebGL2 (al posto di OGL) ---------- */
function program(gl, vs, fs) {
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const loc = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i); loc[u.name] = gl.getUniformLocation(p, u.name); }
  return { p, loc };
}
function vao(gl, prog, attrs) {
  const v = gl.createVertexArray(); gl.bindVertexArray(v);
  for (const [name, size, data] of attrs) {
    const at = gl.getAttribLocation(prog.p, name); if (at < 0) continue;
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, size, gl.FLOAT, false, 0, 0);
  }
  gl.bindVertexArray(null); return v;
}

function mount(container, opts = {}) {
  const base = BEND_PRESETS[opts.preset] || BEND_PRESETS.liquid;
  const pick = key => (opts[key] === undefined || opts[key] === null ? base[key] : opts[key]);
  const s = {
    intro: opts.intro ?? 'rise', cardHeight: opts.cardHeight ?? 0.5, gap: opts.gap ?? 12, radius: opts.radius ?? 0, fit: opts.fit ?? 'natural',
    lensWidth: pick('lensWidth'), lensHeight: pick('lensHeight'), tilt: pick('tilt'), roundness: pick('roundness'), bend: pick('bend'),
    reach: pick('reach'), curl: pick('curl'), dispersion: pick('dispersion'), liquid: pick('liquid'), followCursor: pick('followCursor'),
    squeeze: opts.squeeze ?? 0.2, focusOnClick: opts.focusOnClick ?? true, autoplay: opts.autoplay ?? false, interval: opts.interval ?? 4,
    captureWheel: opts.captureWheel ?? true, captions: opts.captions ?? true
  };
  const items = (opts.items || []).filter(i => i && i.src);
  if (!items.length) return null;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
  if (!gl) return null;

  /* ---- DOM come nel componente originale ---- */
  container.classList.add('flex-carousel');
  container.style.setProperty('--flex-carousel-half', `${Math.min(Math.max(s.cardHeight, 0.05), 1) * 50}%`);
  container.setAttribute('role', 'region');
  container.setAttribute('aria-roledescription', 'carousel');
  container.setAttribute('aria-label', opts.label || 'Galleria di immagini');
  container.tabIndex = 0;
  canvas.style.display = 'block'; canvas.style.width = '100%'; canvas.style.height = '100%';
  canvas.setAttribute('aria-hidden', 'true');
  container.prepend(canvas);
  const live = document.createElement('div'); live.className = 'flex-carousel__live'; live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true');
  container.append(live);
  let captionEl = null, revealed = false, focusOpen = false, activeUi = 0;
  const pad2 = v => String(v).padStart(2, '0');
  const digits = v => `<span class="flex-carousel__digits">${pad2(v).split('').map(d => `<span class="flex-carousel__digit"><span class="flex-carousel__reel" style="transform:translateY(${-Number(d) * 10}%)">${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}</span></span>`).join('')}</span>`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const renderCaption = () => {
    const cur = items[activeUi] || items[0];
    live.textContent = `${cur.title || cur.alt || `Immagine ${activeUi + 1}`}, ${activeUi + 1} di ${items.length}`;
    if (!s.captions || !revealed) return;
    if (!captionEl) {
      captionEl = document.createElement('div'); captionEl.className = 'flex-carousel__caption'; captionEl.setAttribute('aria-hidden', 'true');
      captionEl.innerHTML = `<span class="flex-carousel__title"></span><span class="flex-carousel__count">${digits(1)}<span class="flex-carousel__slash">/</span><span>${pad2(items.length)}</span></span>`;
      container.insertBefore(captionEl, live);
    }
    const old = captionEl.querySelector('.flex-carousel__title'), t = document.createElement('span');
    t.className = 'flex-carousel__title'; t.innerHTML = esc(cur.title || cur.alt) + (cur.subtitle ? `<span class="flex-carousel__subtitle">${esc(cur.subtitle)}</span>` : '');
    old.replaceWith(t);
    const reels = captionEl.querySelectorAll('.flex-carousel__count .flex-carousel__digits');
    // aggiorna i rulli (stessi elementi → la transizione scorre)
    const want = pad2(activeUi + 1).split('');
    const rs = reels[0].querySelectorAll('.flex-carousel__reel');
    if (rs.length === want.length) rs.forEach((r, i) => { r.style.transform = `translateY(${-Number(want[i]) * 10}%)`; });
    else reels[0].outerHTML = digits(activeUi + 1);
  };
  const setActive = i => { activeUi = i; renderCaption(); };
  const setRevealed = v => { if (revealed === v) return; revealed = v; renderCaption(); };
  const setFocusOpen = v => { focusOpen = v; const c = captionEl?.querySelector('.flex-carousel__count'); if (c) c.toggleAttribute('data-hidden', v); };

  /* ---- programmi ---- */
  gl.clearColor(0, 0, 0, 0);
  const cardProg = program(gl, cardVertex, cardFragment);
  const lensProg = program(gl, lensVertex, lensFragment);
  // Plane di OGL: x,y in [-0.5,0.5]
  const cardVao = vao(gl, cardProg, [['position', 2, [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5]], ['uv', 2, [0, 1, 1, 1, 0, 0, 1, 0]]]);
  const lensVao = vao(gl, lensProg, [['position', 2, [-1, -1, 3, -1, -1, 3]]]);
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');

  // render target con mipmap
  const target = { tex: gl.createTexture(), fb: gl.createFramebuffer(), width: 2, height: 2 };
  const sizeTarget = (w, h) => {
    target.width = w; target.height = h;
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  sizeTarget(2, 2);

  const reducedMotion = matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let dpr = 1;
  let slots = [], width = 1, height = 1, pos = 0, vel = 0, goal = 0, mode = 'spring', wheelAt = 0, raf = 0, last = performance.now();
  let visible = true, alive = true, dirty = true, activeIndex = -1, interactedAt = -Infinity, autoplayAt = performance.now(), hasFocus = false;
  let deform = 0, deformVel = 0, layout = null, resnap = false, hover = '', lift = 1, energy = 0, lastPos = 0;
  const lens = { x: 0, y: 0, vx: 0, vy: 0, ready: false };
  const pointer = { x: 0, y: 0, over: false, down: false, id: -1, startX: 0, startY: 0, startPos: 0, dragging: false, touch: false, samples: [] };
  const introState = { kind: 'none', t: 0, running: false, done: false, readyAt: 0 };
  const focus = { index: -1, pending: -1, t: 0, v: 0, target: 0 };
  let instances = [];

  const loadSlot = (item, index) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
    const slot = { item, index, texture, aspect: 0.8, loaded: false, failed: false, ready: 0, color: [0.5, 0.5, 0.5], image: [1, 1], dispose: () => {} };
    const image = new Image();
    image.crossOrigin = 'anonymous'; image.decoding = 'async';
    image.onload = () => {
      if (!alive || !slots.includes(slot)) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
      slot.image = [image.naturalWidth || 1, image.naturalHeight || 1];
      slot.aspect = slot.image[0] / slot.image[1];
      try {
        const probe = document.createElement('canvas'); probe.width = 8; probe.height = 8;
        const ctx = probe.getContext('2d', { willReadFrequently: true });
        if (ctx) { ctx.drawImage(image, 0, 0, 8, 8); const data = ctx.getImageData(0, 0, 8, 8).data; const avg = [0, 0, 0];
          for (let i = 0; i < data.length; i += 4) { avg[0] += data[i]; avg[1] += data[i + 1]; avg[2] += data[i + 2]; }
          slot.color = avg.map(v => v / 64 / 255); }
      } catch { slot.color = [0.5, 0.5, 0.5]; }
      slot.loaded = true; dirty = true; start();
    };
    image.onerror = () => { if (!alive) return; slot.failed = true; dirty = true; start(); };
    image.src = item.src;
    slot.dispose = () => { image.onload = null; image.onerror = null; gl.deleteTexture(texture); };
    return slot;
  };

  const setItems = next => {
    slots.forEach(slot => slot.dispose());
    slots = next.map(loadSlot);
    activeIndex = -1; layout = null; resnap = true;
    focus.target = 0; focus.t = 0; focus.v = 0; focus.pending = -1;
    setFocusOpen(false);
    introState.readyAt = performance.now();
    dirty = true; start();
  };

  const metrics = () => {
    const cardH = Math.max(24, s.cardHeight * height);
    const fixed = FIT_ASPECT[s.fit];
    const widths = slots.map(slot => (fixed || slot.aspect) * cardH);
    const centers = []; let cursor = 0;
    for (let i = 0; i < widths.length; i++) { centers.push(cursor + widths[i] / 2); cursor += widths[i] + s.gap; }
    return { cardH, widths, centers, gap: s.gap, loop: Math.max(cursor, 1) };
  };
  const nearest = (m, at) => { let best = 0, bestDist = Infinity; for (let i = 0; i < m.centers.length; i++) { const d = Math.abs(wrap(m.centers[i] - at, m.loop)); if (d < bestDist) { bestDist = d; best = i; } } return best; };
  const snapPoint = (m, at) => { const i = nearest(m, at); return at + wrap(m.centers[i] - at, m.loop); };
  const remap = (from, to, at) => { const i = nearest(from, at); const offset = wrap(at - from.centers[i], from.loop); const cycles = Math.round((at - offset - from.centers[i]) / from.loop); return cycles * to.loop + to.centers[i] + offset * (to.widths[i] / from.widths[i]); };
  const step = (m, delta) => {
    let at = snapPoint(m, goal), index = nearest(m, at); const n = m.centers.length;
    for (let k = 0; k < Math.abs(delta); k++) {
      const next = (index + (delta > 0 ? 1 : n - 1)) % n;
      at += delta > 0 ? m.widths[index] / 2 + m.gap + m.widths[next] / 2 : -(m.widths[next] / 2 + m.gap + m.widths[index] / 2);
      index = next;
    }
    goal = at; mode = 'spring'; dirty = true; start();
  };
  const goTo = (m, index) => { const i = ((index % m.centers.length) + m.centers.length) % m.centers.length; goal = goal + wrap(m.centers[i] - goal, m.loop); mode = 'spring'; dirty = true; start(); };
  const openFocus = index => { focus.index = index; focus.pending = -1; focus.target = 1; setFocusOpen(true); dirty = true; start(); };
  const closeFocus = () => { focus.pending = -1; if (focus.target === 0) return false; focus.target = 0; setFocusOpen(false); dirty = true; start(); return true; };
  const skipIntro = () => { if (introState.running) introState.t = 1; };

  const introEffects = () => {
    const t = introState.running ? introState.t : introState.done ? 1 : 0;
    const e = { sceneAlpha: 1, strength: 1, card: null };
    if (!introState.done && !introState.running) { e.sceneAlpha = 0; e.strength = 0; return e; }
    if (t >= 1) return e;
    const kind = introState.kind;
    if (kind === 'rise') {
      e.strength = easeInOut((t - 0.3) / 0.65);
      e.card = rel => { const delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.34; const local = clamp01((t - delay) / 0.6);
        return { alpha: clamp01(local * 4), x: 0, y: (1 - easeOutQuint(local)) * height * 0.62, scale: 0.5 + 0.5 * easeInOut((local - 0.18) / 0.82) }; };
    } else if (kind === 'bloom') {
      e.strength = easeInOut((t - 0.2) / 0.8);
      e.card = rel => { const delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.25; const local = easeOut((t - delay) / 0.55); return { alpha: local, x: 0, y: 0, scale: 0.92 + 0.08 * local }; };
    } else if (kind === 'spin') {
      e.sceneAlpha = easeOut(t / 0.25); e.strength = easeOut((t - 0.55) / 0.45);
    } else if (kind === 'deal') {
      e.strength = easeOut((t - 0.45) / 0.5);
      e.card = rel => { const spread = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.3; const local = easeOut((t - 0.12 - spread) / 0.5); return { alpha: easeOut((t - spread) / 0.12), x: -rel * (1 - local), y: 0, scale: 1 }; };
    } else { e.sceneAlpha = easeOut(t); e.strength = easeOut(t); }
    return e;
  };
  const beginIntro = m => {
    const kind = reducedMotion && s.intro !== 'none' ? 'fade' : s.intro;
    introState.kind = INTRO_DURATION[kind] ? kind : 'none';
    introState.running = introState.kind !== 'none';
    introState.done = !introState.running;
    introState.t = 0;
    if (introState.done) setRevealed(true);
    if (introState.kind === 'spin') { const distance = m.loop * 1.6 + width; pos = goal + distance; vel = -distance * 3; mode = 'spring'; }
  };

  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (width * height)));
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    sizeTarget(Math.max(2, Math.round(width * dpr)), Math.max(2, Math.round(height * dpr)));
    dirty = true; start();
  };

  const u = (prog, name) => prog.loc[name];
  const frame = now => {
    raf = 0;
    if (!alive) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (!slots.length) { if (visible) raf = requestAnimationFrame(frame); return; }

    const m = metrics();
    const n = slots.length;
    let animating = false;

    if (resnap) { goal = snapPoint(m, goal); pos = goal; vel = 0; resnap = false; }
    else if (layout && layout.loop !== m.loop) { pos = remap(layout, m, pos); goal = remap(layout, m, goal); pointer.startPos = pos + (pointer.x - pointer.startX); animating = true; }
    layout = m;

    if (!introState.running && !introState.done) {
      const allSettled = slots.every(slot => slot.loaded || slot.failed);
      if (allSettled || now - introState.readyAt > 3500) { goal = snapPoint(m, goal); pos = goal; beginIntro(m); }
    }
    if (introState.running) {
      introState.t = Math.min(1, introState.t + dt / (INTRO_DURATION[introState.kind] || 1));
      if (introState.t >= 1) { introState.running = false; introState.done = true; setRevealed(true); }
      animating = true;
    }

    if (mode === 'wheel' && now - wheelAt > 150) { goal = snapPoint(m, goal); mode = 'spring'; }
    if (!pointer.dragging) {
      const spinning = introState.running && introState.kind === 'spin';
      const stiffness = spinning ? 9 : mode === 'wheel' ? 80 : 55;
      const damping = 2 * Math.sqrt(stiffness);
      const steps = Math.ceil(dt / (1 / 240)); const h = dt / steps;
      for (let i = 0; i < steps; i++) { const acc = stiffness * (goal - pos) - damping * vel; vel += acc * h; pos += vel * h; }
      if (Math.abs(goal - pos) < 0.05 && Math.abs(vel) < 0.5) { pos = goal; vel = 0; } else animating = true;
    } else animating = true;

    if (Math.abs(pos) > m.loop * 8) { const shift = Math.round(pos / m.loop) * m.loop; pos -= shift; goal -= shift; pointer.startPos -= shift; }

    const current = nearest(m, pos);
    if (current !== activeIndex) { activeIndex = current; setActive(current); opts.onChange?.(current, items[current]); }

    if (focus.pending >= 0 && mode === 'spring' && Math.abs(goal - pos) < 1.5 && Math.abs(vel) < 30) {
      if (current === focus.pending) openFocus(current); else focus.pending = -1;
    }

    if (s.autoplay && !reducedMotion && introState.done && focus.target === 0 && focus.t < 0.01 && !pointer.over && !pointer.down && !hasFocus &&
      mode === 'spring' && Math.abs(goal - pos) < 1 && now - interactedAt > 3000 && now - autoplayAt > s.interval * 1000) { autoplayAt = now; step(m, 1); }
    if (s.autoplay && !reducedMotion) animating = true;

    const travel = Math.abs(pos - lastPos) / dt; lastPos = pos;
    const energyTarget = reducedMotion ? 0 : Math.min(travel / 2600, 1);
    energy += (energyTarget - energy) * (1 - Math.exp(-dt / (energyTarget > energy ? 0.07 : 0.35)));
    if (energy > 0.001) animating = true;
    const liquidAmount = reducedMotion ? 0 : s.liquid;
    const push = Math.max(-1, Math.min(1, vel / 2200));
    const deformStiffness = 120, deformDamping = 2 * Math.sqrt(deformStiffness) * 0.32;
    deformVel += (deformStiffness * (push - deform) - deformDamping * deformVel) * dt;
    deform += deformVel * dt;
    if (Math.abs(deform) > 0.0005 || Math.abs(deformVel) > 0.005) animating = true;

    const focusStiffness = 64;
    focus.v += (focusStiffness * (focus.target - focus.t) - 2 * Math.sqrt(focusStiffness) * focus.v) * dt;
    focus.t += focus.v * dt;
    if (Math.abs(focus.target - focus.t) < 0.0005 && Math.abs(focus.v) < 0.001) { focus.t = focus.target; focus.v = 0; } else animating = true;
    const focusAmount = clamp01(focus.t), focusEase = easeInOut(focusAmount);
    const focusW = focus.index >= 0 && focus.index < n ? m.widths[focus.index] : m.cardH;
    const focusScale = Math.max(1, Math.min(1.3, (height * 0.84) / m.cardH, (width * 0.92) / focusW));
    const nextLift = 1 + (focusScale - 1) * focusEase;
    if (Math.abs(nextLift - lift) > 0.0005) { lift = nextLift; container.style.setProperty('--flex-carousel-lift', lift.toFixed(4)); }

    const effects = introEffects();
    const homeX = width / 2, homeY = height / 2;
    const follow = s.followCursor && pointer.over && !pointer.dragging && !pointer.touch && focus.target === 0;
    const aimX = follow ? pointer.x : homeX, aimY = follow ? pointer.y : homeY;
    if (!lens.ready) { lens.x = homeX; lens.y = homeY; lens.ready = true; }
    const lensK = 110, lensC = 2 * Math.sqrt(lensK) * 0.8;
    lens.vx += (lensK * (aimX - lens.x) - lensC * lens.vx) * dt; lens.vy += (lensK * (aimY - lens.y) - lensC * lens.vy) * dt;
    lens.x += lens.vx * dt; lens.y += lens.vy * dt;
    if (Math.abs(aimX - lens.x) + Math.abs(aimY - lens.y) > 0.2 || Math.abs(lens.vx) + Math.abs(lens.vy) > 0.5) animating = true;

    const cardH = m.cardH;
    let halfW = (s.lensWidth * width) / 2, halfH = (s.lensHeight * width) / 2;
    const squash = Math.abs(deform) * liquidAmount;
    halfW *= 1 + squash * 0.16; halfH *= 1 - squash * 0.08;
    const lensX = lens.x - deform * 14 * liquidAmount;

    for (let i = 0; i < n; i++) { const slot = slots[i]; if (slot.loaded && slot.ready < 1) { slot.ready = Math.min(1, slot.ready + dt / 0.45); animating = true; } }

    const waiting = !introState.done;
    if (dirty || animating || pointer.dragging) {
      dirty = false; instances = [];
      // 1) carte nel render target
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      gl.viewport(0, 0, target.width, target.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(cardProg.p); gl.bindVertexArray(cardVao);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform2f(u(cardProg, 'uResolution'), width, height);
      gl.uniform1f(u(cardProg, 'uDpr'), dpr);
      gl.uniform1f(u(cardProg, 'uRadius'), s.radius);
      gl.uniform1i(u(cardProg, 'tMap'), 0); gl.activeTexture(gl.TEXTURE0);
      const shrink = 1 - clamp01(s.squeeze) * energy;
      const draws = [];
      for (let i = 0; i < n; i++) {
        const w = m.widths[i], baseRel = wrap(m.centers[i] - pos, m.loop);
        for (let k = -3; k <= 3; k++) {
          const rel = baseRel + k * m.loop;
          if (Math.abs(rel) - w / 2 > width + 40) continue;
          const fx = effects.card ? effects.card(rel) : null;
          let x = homeX + rel + (fx ? fx.x : 0), scale = shrink * (fx ? fx.scale : 1), alpha = fx ? fx.alpha : 1;
          if (focusAmount > 0) {
            if (i === focus.index && Math.abs(rel) < w) scale *= 1 + (focusScale - 1) * focusEase;
            else { const order = Math.min(Math.abs(rel) / width, 1) * 0.25; const part = easeInOut(focusAmount * 1.25 - order); x += Math.sign(rel) * part * width * 0.7; alpha *= 1 - part; }
          }
          const cw = w * scale;
          if (alpha <= 0.001 || x + cw / 2 < -40 || x - cw / 2 > width + 40) continue;
          draws.push({ i, rel, x, y: homeY + (fx ? fx.y : 0), cw, ch: cardH * scale, alpha });
        }
      }
      draws.sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
      for (const d of draws) {
        const slot = slots[d.i];
        gl.bindTexture(gl.TEXTURE_2D, slot.texture);
        gl.uniform4f(u(cardProg, 'uRect'), d.x, d.y, d.cw + 2, d.ch + 2);
        gl.uniform2f(u(cardProg, 'uSize'), d.cw, d.ch);
        gl.uniform2f(u(cardProg, 'uImage'), slot.image[0], slot.image[1]);
        gl.uniform1f(u(cardProg, 'uAlpha'), d.alpha);
        gl.uniform1f(u(cardProg, 'uReady'), slot.ready);
        gl.uniform1f(u(cardProg, 'uShift'), reducedMotion ? 0 : Math.max(-1, Math.min(1, d.rel / (width * 0.75))));
        gl.uniform3f(u(cardProg, 'uPlaceholder'), slot.color[0], slot.color[1], slot.color[2]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        instances.push({ index: d.i, x0: d.x - d.cw / 2, x1: d.x + d.cw / 2, y0: d.y - d.ch / 2, y1: d.y + d.ch / 2 });
      }
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, target.tex);
      gl.generateMipmap(gl.TEXTURE_2D);

      // 2) lente sullo schermo
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(lensProg.p); gl.bindVertexArray(lensVao);
      gl.uniform1i(u(lensProg, 'tScene'), 0);
      gl.uniform2f(u(lensProg, 'uResolution'), width, height);
      gl.uniform1f(u(lensProg, 'uDpr'), dpr);
      gl.uniform2f(u(lensProg, 'uCenter'), lensX, lens.y);
      const spanW = Math.max(halfW, 1), spanH = Math.max(halfH, 1);
      gl.uniform2f(u(lensProg, 'uHalf'), spanW, spanH);
      gl.uniform1f(u(lensProg, 'uAngle'), (s.tilt * Math.PI) / 180);
      gl.uniform1f(u(lensProg, 'uExponent'), 2 + Math.pow(1 - clamp01(s.roundness), 1.5) * 10);
      const inner = Math.max(4, s.reach * (spanW + spanH) * 0.5);
      gl.uniform1f(u(lensProg, 'uInner'), inner);
      gl.uniform1f(u(lensProg, 'uOuter'), inner * 1.6);
      gl.uniform1f(u(lensProg, 'uFlow'), s.bend * (spanW + spanH) * 0.45);
      gl.uniform1f(u(lensProg, 'uCurl'), s.curl === 'rise' ? 1 : s.curl === 'fall' ? -1 : 0);
      gl.uniform1f(u(lensProg, 'uDispersion'), s.dispersion * 0.12 * (1 + Math.abs(deform) * liquidAmount * 1.2));
      gl.uniform1f(u(lensProg, 'uStrength'), effects.strength * (1 - focusEase));
      gl.uniform1f(u(lensProg, 'uSceneAlpha'), effects.sceneAlpha);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    }

    let nextHover = '';
    if (pointer.over && !pointer.dragging && introState.done && s.focusOnClick) {
      const hit = instances.find(inst => pointer.x >= inst.x0 && pointer.x <= inst.x1 && pointer.y >= inst.y0 && pointer.y <= inst.y1);
      if (focus.target > 0) nextHover = 'close'; else if (hit) nextHover = 'open';
    }
    if (nextHover !== hover) { hover = nextHover; if (hover) container.setAttribute('data-hover', hover); else container.removeAttribute('data-hover'); }

    if (visible && (animating || waiting || dirty || pointer.down)) raf = requestAnimationFrame(frame);
  };

  const start = () => { if (raf || !visible || !alive) return; last = performance.now(); raf = requestAnimationFrame(frame); };
  const localPoint = e => { const rect = container.getBoundingClientRect(); return [e.clientX - rect.left, e.clientY - rect.top]; };

  const onPointerDown = e => {
    if (e.button !== undefined && e.button > 0) return;
    skipIntro();
    const [x, y] = localPoint(e);
    Object.assign(pointer, { down: true, id: e.pointerId, touch: e.pointerType === 'touch', startX: x, startY: y, x, y, startPos: pos, dragging: false, samples: [{ x, t: performance.now() }] });
    interactedAt = performance.now();
    if (Math.abs(vel) > 40) { goal = pos; vel = 0; }
    dirty = true; start();
  };
  const onPointerMove = e => {
    const [x, y] = localPoint(e);
    pointer.x = x; pointer.y = y; pointer.over = true;
    if (pointer.down && e.pointerId === pointer.id) {
      const dx = x - pointer.startX, dy = y - pointer.startY, slop = pointer.touch ? 10 : 5;
      if (!pointer.dragging) {
        if (pointer.touch && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) { pointer.down = false; return; }
        if (Math.abs(dx) > slop) {
          pointer.dragging = true; pointer.startX = x; pointer.startPos = pos; closeFocus();
          try { container.setPointerCapture(e.pointerId); } catch { pointer.dragging = true; }
          container.setAttribute('data-dragging', '');
        }
      }
      if (pointer.dragging) {
        pos = pointer.startPos - (x - pointer.startX); goal = pos; vel = 0;
        const now = performance.now(); pointer.samples.push({ x, t: now });
        while (pointer.samples.length > 2 && now - pointer.samples[0].t > 100) pointer.samples.shift();
      }
    }
    dirty = true; start();
  };
  const onPointerUp = e => {
    if (!pointer.down || e.pointerId !== pointer.id) return;
    pointer.down = false;
    container.removeAttribute('data-dragging');
    const m = metrics();
    interactedAt = performance.now();
    if (pointer.dragging) {
      pointer.dragging = false;
      const now = performance.now(), first = pointer.samples[0], lastSample = pointer.samples[pointer.samples.length - 1];
      let velocity = 0;
      if (first && lastSample && lastSample.t > first.t && now - lastSample.t < 70) velocity = -((lastSample.x - first.x) / (lastSample.t - first.t)) * 1000;
      vel = velocity;
      const landing = snapPoint(m, pos + velocity * 0.32);
      goal = landing;
      if (Math.abs(velocity) > 400 && Math.abs(landing - pos) < 1) step(m, velocity > 0 ? 1 : -1);
      mode = 'spring'; start(); return;
    }
    if (closeFocus()) return;
    const [x, y] = localPoint(e);
    const hit = instances.find(inst => x >= inst.x0 && x <= inst.x1 && y >= inst.y0 && y <= inst.y1);
    if (!hit) return;
    if (hit.index === activeIndex && Math.abs(goal - pos) < 2) {
      opts.onSelect?.(hit.index, items[hit.index]);
      if (s.focusOnClick) openFocus(hit.index);
    } else {
      const rel = (hit.x0 + hit.x1) / 2 - width / 2;
      goal = snapPoint(m, pos + rel); mode = 'spring';
      if (s.focusOnClick) focus.pending = hit.index;
      start();
    }
  };
  const onPointerLeave = () => { pointer.over = false; dirty = true; start(); };
  const onPointerCancel = () => { pointer.down = false; pointer.dragging = false; container.removeAttribute('data-dragging'); goal = snapPoint(metrics(), pos); mode = 'spring'; start(); };
  const onWheel = e => {
    if (e.ctrlKey) return;
    let dx = e.deltaX, dy = e.deltaY;
    if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) { dx = dy; dy = 0; }
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    if (!horizontal && !s.captureWheel) return;
    e.preventDefault(); skipIntro(); interactedAt = performance.now();
    if (closeFocus()) return;
    const delta = Math.max(-120, Math.min(120, (horizontal ? dx : dy) * unit));
    goal += delta * 1.25; mode = 'wheel'; wheelAt = performance.now(); start();
  };
  const onKeyDown = e => {
    const m = metrics();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); skipIntro(); closeFocus(); interactedAt = performance.now(); step(m, 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); skipIntro(); closeFocus(); interactedAt = performance.now(); step(m, -1); }
    else if (e.key === 'Home') { e.preventDefault(); closeFocus(); goTo(m, 0); }
    else if (e.key === 'End') { e.preventDefault(); closeFocus(); goTo(m, slots.length - 1); }
    else if (e.key === 'Escape') { if (closeFocus()) e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (closeFocus() || activeIndex < 0) return; opts.onSelect?.(activeIndex, items[activeIndex]); if (s.focusOnClick) openFocus(activeIndex); }
  };
  const onFocus = () => { hasFocus = true; }, onBlur = () => { hasFocus = false; };
  const onVisibility = () => { if (!document.hidden) start(); };

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointerleave', onPointerLeave);
  container.addEventListener('pointercancel', onPointerCancel);
  container.addEventListener('wheel', onWheel, { passive: false });
  container.addEventListener('keydown', onKeyDown);
  container.addEventListener('focus', onFocus);
  container.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVisibility);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }); io.observe(container);

  resize();
  setItems(items);
  renderCaption();

  return {
    destroy() {
      alive = false; visible = false; cancelAnimationFrame(raf); resizeObserver.disconnect(); io.disconnect();
      container.removeEventListener('pointerdown', onPointerDown); container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp); container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointercancel', onPointerCancel); container.removeEventListener('wheel', onWheel);
      container.removeEventListener('keydown', onKeyDown); container.removeEventListener('focus', onFocus); container.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      slots.forEach(slot => slot.dispose()); slots = [];
      gl.getExtension('WEBGL_lose_context')?.loseContext(); canvas.remove();
    }
  };
}

window.MoiFlexCarousel = { mount };
})();
