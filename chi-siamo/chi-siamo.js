/* MOI LAB — Chi siamo: raggi di luce, scritte che rispondono al tocco, sezioni che entrano, fionda per tornare su. */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = ['#e2c28e', '#c8aa77', '#49a58c', '#df6650'], CODE = '01<>/{}[]#$%&*+=ABXYZ';
  // arrivo dalla tendina dell'apertura: la tendina è chiusa e sfuma
  try { if (sessionStorage.getItem('moi-curtain')) { sessionStorage.removeItem('moi-curtain');
    const c = document.createElement('div'); c.className = 'sa-curtain is-in no-anim'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<i class="l1"></i><i class="l2"></i><div class="sa-curtain-in"><span class="sa-curtain-ic"><svg viewBox="0 0 42 43" fill="none" stroke="#efd4a7" stroke-width="2.2"><path d="M4 34V9l17 18L38 9v25"/></svg></span><b>CHI SIAMO</b><small>La nostra storia</small></div>';
    document.body.append(c); document.documentElement.classList.remove('moi-cover'); void c.offsetWidth; c.classList.remove('no-anim');
    setTimeout(() => { c.classList.add('is-out'); c.classList.remove('is-in'); }, 250); setTimeout(() => c.remove(), 1100); } } catch {}
  document.documentElement.classList.remove('moi-cover');
  document.getElementById('y').textContent = new Date().getFullYear();

  const rays = document.querySelector('.cs-rays');
  if (rays && window.MoiLightRays) try { MoiLightRays.mount(rays, { raysOrigin: 'top-center', raysColor: '#f3e2bf' }); } catch {}

  // scritte che rispondono al tocco
  $$('.cs-play').forEach(el => {
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = el.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) ? ' ' : `<span class="cs-wd" aria-hidden="true">${[...w].map(c => `<span class="cs-ch" data-c="${c}">${c}</span>`).join('')}</span>`).join('');
    el.addEventListener('click', e => { if (!calm) FX[el.dataset.fx]?.(el, e); });
  });
  const burst = (x, y) => { for (let i = 0; i < 16; i++) { const p = document.createElement('i'); p.className = 'cs-burst'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = COLS[i % 4]; document.body.append(p); const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70; p.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d + 30}px)) scale(.3)`, opacity: 0 }], { duration: 800, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => p.remove(); } };
  const FX = {
    code(el) { const cs = $$('.cs-ch', el); let f = 0; clearInterval(el._t); el._t = setInterval(() => { f++; cs.forEach((c, i) => { const d = f > i * 1.2 + 6; c.textContent = d ? c.dataset.c : CODE[Math.random() * CODE.length | 0]; c.classList.toggle('code', !d); }); if (f > cs.length * 1.2 + 7) { clearInterval(el._t); cs.forEach(c => { c.textContent = c.dataset.c; c.classList.remove('code'); }); } }, 35); },
    pixel(el, e) { $$('.cs-ch', el).forEach((c, i) => c.animate([{ transform: 'none' }, { transform: `translateY(${-18 - Math.random() * 22}px) rotate(${(Math.random() - .5) * 40}deg) scale(1.15)`, color: COLS[i % 4], offset: .35 }, { transform: 'none' }], { duration: 750, delay: i * 18, easing: 'cubic-bezier(.3,1.5,.5,1)' })); burst(e.clientX, e.clientY); },
    wave(el) { $$('.cs-ch', el).forEach((c, i) => c.animate([{ transform: 'none' }, { transform: 'translateY(-.28em) scale(1.12)', color: '#e2c28e', offset: .4 }, { transform: 'none' }], { duration: 620, delay: i * 32 })); },
  };
  // lettere che si sollevano vicino al dito / mouse
  if (!calm) { let near = [], pp = null, raf = 0; const lift = () => { raf = 0; near.forEach(c => { const r = c.getBoundingClientRect(), d = Math.hypot(pp.x - (r.left + r.width / 2), pp.y - (r.top + r.height / 2)), k = Math.max(0, 1 - d / 90); c.style.transform = k ? `translateY(${-k * 12}px) scale(${1 + k * .18})` : ''; }); };
    addEventListener('pointermove', e => { const h = e.target.closest?.('.cs-play-host'); if (!h) { near.forEach(c => c.style.transform = ''); near = []; return; } near = $$('.cs-ch', h); pp = { x: e.clientX, y: e.clientY }; if (!raf) raf = requestAnimationFrame(lift); }, { passive: true }); }
  // luce che segue il dito sui mondi
  $$('.cs-worlds a').forEach(a => a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect(); a.style.setProperty('--x', (e.clientX - r.left) / r.width * 100 + '%'); a.style.setProperty('--y', (e.clientY - r.top) / r.height * 100 + '%'); }));
  // sezioni che entrano
  if (!calm) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 }); $$('.cs-sec > *, .cs-end > *').forEach(el => { el.classList.add('cs-rv'); io.observe(el); }); }
  // fionda in fondo: tirala giù per tornare su
  const foot = document.querySelector('.cs-foot');
  if (foot && window.MoiSling) {
    const box = document.createElement('div'); box.className = 'sling-end sling-end-dark'; box.innerHTML = '<span class="sling-end-slot"></span><p><b>Tirami giù</b><span>e lasciami andare: torni in cima.</span></p>'; foot.before(box);
    MoiSling.mount(box.querySelector('.sling-end-slot'), { axis: 'down', ariaLabel: 'Torna in cima alla pagina', onSend: () => setTimeout(() => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }), 140) });
  }
})();
