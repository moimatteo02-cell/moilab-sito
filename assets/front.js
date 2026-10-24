(() => {
 'use strict';
 document.querySelectorAll('.mlg').forEach(root => {
  if (root.dataset.ready) return;
  root.dataset.ready = '1';
  const fit = () => {
   if (root.dataset.fullWidth !== '1') return;
   root.style.width = ''; root.style.marginLeft = ''; root.style.marginRight = '';
   const left = root.getBoundingClientRect().left;
   root.style.width = document.documentElement.clientWidth + 'px';
   root.style.marginLeft = -left + 'px'; root.style.marginRight = '0';
  };
  fit();
  let resizeFrame;
  window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(fit); }, {passive:true});
  const menu = root.querySelector('.mlg-menu');
  if (menu) {
   const summary = menu.querySelector('summary');
   const close = focus => { menu.open = false; if (focus) summary.focus(); };
   menu.addEventListener('keydown', e => { if (e.key === 'Escape') { close(true); e.preventDefault(); } });
   menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(false)));
   document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) close(false); });
   menu.addEventListener('focusout', () => { setTimeout(() => { if (!menu.contains(document.activeElement)) close(false); },0); });
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const title = root.querySelector('.mlg-title');
  const line = title && title.querySelector('.mlg-type-line');
  if (title && line && !reduced.matches) {
   const original = line.textContent.trim();
   const rows = [original];
   line.textContent = '';
   title.setAttribute('aria-label', original);
   rows.forEach((text,index) => {
    const row = document.createElement('span');
    row.className = 'mlg-type-text';
    Array.from(text).forEach((character,characterIndex) => {
     const span = document.createElement('span');
     span.className = 'mlg-type-char';
     span.style.setProperty('--char-delay', (120 + index * 620 + characterIndex * 82) + 'ms');
     span.textContent = character === ' ' ? '\u00a0' : character;
     row.appendChild(span);
    });
    line.appendChild(row);
   });
   const caret = document.createElement('span');
   caret.className = 'mlg-type-caret';
   caret.setAttribute('aria-hidden','true');
   line.appendChild(caret);
   setTimeout(() => caret.remove(), 1800);
  }
  const hero = root.querySelector('.mlg-hero');
  const logoButton = root.querySelector('.mlg-hero-logo');
  if (hero && logoButton) {
   let animationTimer;
   logoButton.addEventListener('click', () => {
    if (reduced.matches) return;
    hero.classList.remove('mlg-playing');
    void hero.offsetWidth;
    hero.classList.add('mlg-playing');
    clearTimeout(animationTimer);
    animationTimer = setTimeout(() => hero.classList.remove('mlg-playing'), 1500);
   });
  }
  // Homepage scroll visibility is now managed bidirectionally by home-experience.js.
 });
})();
