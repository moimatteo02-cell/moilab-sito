/* A single, bounded canvas turns the visible homepage into falling pixel tiles.
   The painter reads the current DOM once; animation never reads layout or fetches. */
(() => {
  'use strict';
  const svgImages = new WeakMap();
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const visible = (r, w, h) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
  const rectPath = (ctx, r, radius = 0) => {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(r.left, r.top, r.width, r.height, radius);
    else ctx.rect(r.left, r.top, r.width, r.height);
  };

  function svgImage(node) {
    if (svgImages.has(node)) return svgImages.get(node);
    const clone = node.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const bounds = node.getBoundingClientRect();
    clone.setAttribute('width', Math.max(1, bounds.width));
    clone.setAttribute('height', Math.max(1, bounds.height));
    const targets = [clone, ...clone.querySelectorAll('*')];
    [node, ...node.querySelectorAll('*')].forEach((original, index) => {
      const target = targets[index];
      const style = getComputedStyle(original);
      ['color', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity'].forEach(key => {
        if (style.getPropertyValue(key)) target.setAttribute(key, style.getPropertyValue(key));
      });
      target.removeAttribute('class');
      target.removeAttribute('id');
    });
    const image = new Image();
    const record = {image, ready: false};
    record.loaded = new Promise(resolve => {
      image.onload = () => {record.ready = true; resolve();};
      image.onerror = resolve;
    });
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    svgImages.set(node, record);
    return record;
  }

  function opacityOf(node, root) {
    let alpha = 1;
    for (let el = node; el && el !== root.parentElement; el = el.parentElement) {
      const style = getComputedStyle(el);
      if (el.hidden || style.display === 'none' || style.visibility === 'hidden') return 0;
      alpha *= Number(style.opacity || 1);
    }
    return alpha;
  }

  // Draw an image with the same cover/contain geometry used by the existing card.
  function paintImage(ctx, image, r, fit = 'contain', position = '50% 50%') {
    const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
    if (!iw || !ih) return;
    const scale = fit === 'cover' ? Math.max(r.width / iw, r.height / ih) : Math.min(r.width / iw, r.height / ih);
    const [px, py = '50%'] = position.split(' ');
    const fraction = v => v.endsWith('%') ? clamp(parseFloat(v) / 100) : .5;
    const width = iw * scale, height = ih * scale;
    ctx.drawImage(image, r.left + (r.width - width) * fraction(px), r.top + (r.height - height) * fraction(py), width, height);
  }

  function paintHomepage(source, canvas, width, height) {
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / width;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = '#080808';ctx.fillRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(width * .82, 0, 0, width * .82, 0, width * .75);
    glow.addColorStop(0, '#1b1a18');glow.addColorStop(1, '#080808');
    ctx.fillStyle = glow;ctx.fillRect(0, 0, width, height);
    source.querySelectorAll('.mlg-card').forEach(card => {
      const r = card.getBoundingClientRect();if (!visible(r, width, height)) return;
      const style = getComputedStyle(card);ctx.save();ctx.globalAlpha = opacityOf(card, source);
      rectPath(ctx, r, parseFloat(style.borderRadius) || 0);ctx.clip();
      const gradient = ctx.createLinearGradient(r.left, r.top, r.right, r.bottom);
      gradient.addColorStop(0, '#191919');gradient.addColorStop(1, '#090909');
      ctx.fillStyle = gradient;ctx.fillRect(r.left, r.top, r.width, r.height);
      const photo = card.querySelector('.mlg-photo');
      if (photo && !photo.hidden && photo.complete && photo.naturalWidth) {
        const ps = getComputedStyle(photo);ctx.save();ctx.globalAlpha *= .8;
        paintImage(ctx, photo, photo.getBoundingClientRect(), ps.objectFit, ps.objectPosition);ctx.restore();
        const shade = ctx.createLinearGradient(r.left, r.top, r.right, r.top);
        shade.addColorStop(0, '#0b0b0bea');shade.addColorStop(1, '#00000005');
        ctx.fillStyle = shade;ctx.fillRect(r.left, r.top, r.width, r.height);
      }
      ctx.restore();ctx.save();rectPath(ctx, r, parseFloat(style.borderRadius) || 0);
      ctx.strokeStyle = '#ffffff20';ctx.lineWidth = 1;ctx.stroke();ctx.restore();
    });
    source.querySelectorAll('img:not(.mlg-photo), svg').forEach(node => {
      const r = node.getBoundingClientRect();const alpha = opacityOf(node, source);
      if (!visible(r, width, height) || alpha < .01) return;
      const record = node.localName === 'svg' ? svgImage(node) : null;
      const image = record ? record.image : node;
      if (record ? !record.ready : !image.complete || !image.naturalWidth) return;
      ctx.save();ctx.globalAlpha = alpha;
      const clip = node.closest('.mlg-card');if (clip) {rectPath(ctx, clip.getBoundingClientRect(), 12);ctx.clip();}
      const s = getComputedStyle(node);paintImage(ctx, image, r, s.objectFit, s.objectPosition);ctx.restore();
    });
    source.querySelectorAll('.mlg-rule, .mlg-menu summary, .mlg-menu summary span, .mlg-arrow').forEach(node => {
      const r = node.getBoundingClientRect();if (!visible(r, width, height)) return;
      const s = getComputedStyle(node);ctx.save();ctx.globalAlpha = opacityOf(node, source);
      rectPath(ctx, r, Math.min(parseFloat(s.borderRadius) || 0, r.width / 2));
      ctx.fillStyle = s.backgroundColor;ctx.fill();
      if (parseFloat(s.borderWidth)) {ctx.lineWidth = 1;ctx.strokeStyle = s.borderColor;ctx.stroke();}ctx.restore();
    });
    const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT), range = document.createRange();
    let node, glyphs = 0;
    while ((node = walker.nextNode()) && glyphs < 3000) {
      const parent = node.parentElement;
      if (!node.textContent.trim() || parent.closest('svg,script,style,nav') || !visible(parent.getBoundingClientRect(), width, height)) continue;
      const alpha = opacityOf(parent, source);if (alpha < .01) continue;
      const s = getComputedStyle(parent), size = parseFloat(s.fontSize) || 16;
      ctx.save();ctx.globalAlpha = alpha;ctx.fillStyle = s.color;
      ctx.font = `${s.fontStyle || 'normal'} ${s.fontWeight || '400'} ${size}px ${s.fontFamily}`;
      ctx.textBaseline = 'alphabetic';let offset = 0;
      for (const character of node.textContent) {
        range.setStart(node, offset);offset += character.length;range.setEnd(node, offset);
        const r = range.getBoundingClientRect();
        if (!character.trim() || !visible(r, width, height)) continue;
        const text = s.textTransform === 'uppercase' ? character.toUpperCase() : character;
        ctx.fillText(text, r.left, r.top + (r.height - size) / 2 + size * .8);glyphs++;
      }
      ctx.restore();
    }
    range.detach();
  }

  function start({source, host, onCovered, onDone, compact = false}) {
    const width = innerWidth, height = innerHeight;
    const scale = Math.min(1, 1600 / width, 1100 / height);
    const canvas = document.createElement('canvas');canvas.className = 'md-transition-canvas';canvas.setAttribute('aria-hidden', 'true');
    canvas.width = Math.ceil(width * scale);canvas.height = Math.ceil(height * scale);canvas.style.opacity = '0';
    const context = canvas.getContext('2d', {alpha: true});
    if (!context) throw new Error('Canvas unavailable');
    const sourceCanvas = document.createElement('canvas');sourceCanvas.width = canvas.width;sourceCanvas.height = canvas.height;
    const tiny = document.createElement('canvas'), frozen = document.createElement('canvas');
    frozen.width = canvas.width;frozen.height = canvas.height;
    const smallContext = tiny.getContext('2d'), frozenContext = frozen.getContext('2d');
    if (!smallContext || !frozenContext) throw new Error('Canvas unavailable');
    host.append(canvas);host.dataset.pixelPhase = 'prepare';
    let disposed = false, raf = 0, started, covered = false, lastPixel = -1, prepared = false, loadTimer;
    const pixelTime = compact ? 340 : 420, hold = 100, fall = compact ? 470 : 610;
    const cell = Math.ceil(Math.max(width / (compact ? 12 : 24), height / (compact ? 16 : 15)));
    const columns = Math.ceil(width / cell), rows = Math.ceil(height / cell);
    const rowDelay = compact ? 13 : 15;
    const tiles = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      const noise = ((x * 73 + y * 41) % 101) / 101;
      tiles.push({x: x * cell, y: y * cell, w: Math.min(cell, width - x * cell), h: Math.min(cell, height - y * cell),
        delay: (rows - 1 - y) * rowDelay + noise * 75, drift: (noise - .5) * cell * .8, angle: (noise - .5) * .22});
    }
    const duration = pixelTime + hold + (rows - 1) * rowDelay + 75 + fall;
    host.style.setProperty('--md-tile-size', cell + 'px');
    function pixelate(pixel) {
      tiny.width = Math.max(1, Math.ceil(width / pixel));tiny.height = Math.max(1, Math.ceil(height / pixel));
      smallContext.imageSmoothingEnabled = true;smallContext.drawImage(sourceCanvas, 0, 0, tiny.width, tiny.height);
      frozenContext.imageSmoothingEnabled = false;frozenContext.clearRect(0, 0, frozen.width, frozen.height);
      frozenContext.drawImage(tiny, 0, 0, frozen.width, frozen.height);
    }
    function frame(now) {
      if (disposed) return;
      try {
        started ??= now;const elapsed = now - started;
        context.setTransform(scale, 0, 0, scale, 0, 0);context.clearRect(0, 0, width, height);context.imageSmoothingEnabled = false;
        canvas.style.opacity = String(clamp(elapsed / 110));
        if (!covered && elapsed >= 120) {covered = true;onCovered();}
        if (elapsed < pixelTime + hold) {
          host.dataset.pixelPhase = 'pixelize';
          const pixel = 1 + Math.floor(clamp(elapsed / pixelTime) * (compact ? 5 : 8));
          if (pixel !== lastPixel) {lastPixel = pixel;pixelate(pixel);}
          context.drawImage(frozen, 0, 0, width, height);
          const lines = clamp((elapsed - pixelTime * .4) / (pixelTime * .6));
          context.strokeStyle = `rgba(174,211,188,${lines * .2})`;context.lineWidth = 1;
          context.beginPath();
          for (let x = 0; x < width; x += cell) {context.moveTo(x, 0);context.lineTo(x, height);}
          for (let y = 0; y < height; y += cell) {context.moveTo(0, y);context.lineTo(width, y);}context.stroke();
        } else {
          host.dataset.pixelPhase = 'collapse';
          if (!prepared) {pixelate(compact ? 6 : 9);prepared = true;}
          const time = elapsed - pixelTime - hold;
          for (const tile of tiles) {
            const p = clamp((time - tile.delay) / fall);if (p >= 1) continue;
            const distance = (height - tile.y + cell * 2) * p * p;
            const fade = 1 - clamp((p - .68) / .32);
            context.save();context.globalAlpha = fade;
            context.translate(Math.round(tile.x + tile.w / 2 + tile.drift * p), Math.round(tile.y + tile.h / 2 + distance));
            context.rotate(tile.angle * p);
            const inset = p > 0 ? Math.min(3, p * 12) : 0;
            const w = tile.w - inset, h = tile.h - inset;
            if (p > 0) {context.fillStyle = '#586d69';context.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);}
            context.drawImage(frozen, tile.x * scale, tile.y * scale, tile.w * scale, tile.h * scale, -w / 2, -h / 2, w, h);
            if (p > 0) {context.strokeStyle = '#a8d0c34d';context.lineWidth = 1;context.strokeRect(-w / 2, -h / 2, w, h);}
            context.restore();
          }
        }
        if (elapsed >= duration) {host.dataset.pixelPhase = 'complete';onDone();return;}
        raf = requestAnimationFrame(frame);
      } catch {onDone();}
    }
    const ready = () => {
      if (disposed || started !== undefined || raf) return;
      clearTimeout(loadTimer);
      try {paintHomepage(source, sourceCanvas, width, height);raf = requestAnimationFrame(frame);} catch {onDone();}
    };
    const images = [...source.querySelectorAll('svg')].map(svg => svgImage(svg).loaded);
    Promise.allSettled(images).then(ready);loadTimer = setTimeout(ready, 120);
    return () => {
      if (disposed) return;disposed = true;cancelAnimationFrame(raf);clearTimeout(loadTimer);canvas.remove();
      for (const buffer of [canvas, sourceCanvas, tiny, frozen]) {buffer.width = 1;buffer.height = 1;}
      delete host.dataset.pixelPhase;host.style.removeProperty('--md-tile-size');
    };
  }
  window.MOI_DIGITAL_TRANSITION = {start};
  // Decode the existing SVG artwork ahead of the first click, without a network request.
  const warm = () => document.querySelectorAll('#moi-lab-hub svg').forEach(svgImage);
  if ('requestIdleCallback' in window) requestIdleCallback(warm, {timeout: 1200});else setTimeout(warm, 250);
})();
