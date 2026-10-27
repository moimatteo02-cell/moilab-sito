/* MOI LAB — menu delle tre lineette con la ruota (Option Wheel di React Bits).
   Home dei servizi: solo Chi siamo / Inizio / Scrivici (i servizi sono già sulla pagina).
   Chi siamo: tre lineette nuove, con tutti i servizi. */
(() => {
const W = () => window.MoiOptionWheel;
const WA = 'https://wa.me/393278815148?text=Ciao%20MOI%20LAB%2C%20vorrei%20un%27informazione%3A%20';

/* ---------- home dei servizi: la ruota dentro il menu che c'è già ---------- */
function home() {
  if (!document.querySelector('#moi-lab-hub')) return true;
  const nav = document.querySelector('.mm-sm-host nav'); if (!nav || nav.querySelector('.ow-menu') || !W()) return !!nav;
  const box = document.createElement('div');
  nav.querySelector('.mm-sm-close')?.after(box);
  nav.classList.add('has-wheel');
  const close = () => nav.querySelector('.mm-sm-close')?.click();
  const links = [
    { label: 'Chi siamo', href: '/chi-siamo/', go: 'Scopri chi siamo' },
    { label: 'Inizio', href: '#inizio', go: "Torna all'inizio" },
    { label: 'Scrivici', href: WA, target: '_blank', go: 'Scrivici su WhatsApp' },
    { label: 'Privato', href: '/privato/', go: 'Apri l’area privata' }   // provvisorio: poi solo dal link diretto
  ];
  W().menu(box, links, {
    kicker: 'MOI LAB', label: 'Menu',
    onPick: l => {
      close();
      if (l.target) { open(l.href, l.target, 'noopener'); return; }
      if (l.href === '/chi-siamo/' && window.MoiCurtain) { setTimeout(() => window.MoiCurtain.play(null, 'CHI SIAMO', 'La nostra storia', '/chi-siamo/'), 250); return; }
      setTimeout(() => { location.href = l.href; }, 250);
    }
  });
  return true;
}

/* ---------- Chi siamo: tre lineette + pannello con la ruota ---------- */
function about() {
  const top = document.querySelector('.cs-top'); if (!top || !W()) return;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'owm-burger'; btn.setAttribute('aria-label', 'Apri menu'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  top.append(btn);
  const panel = document.createElement('div');
  panel.className = 'owm'; panel.inert = true;
  panel.innerHTML = '<i class="owm-l1" aria-hidden="true"></i><i class="owm-l2" aria-hidden="true"></i><div class="owm-panel" role="dialog" aria-label="Menu"><button type="button" class="owm-close"><span aria-hidden="true"></span>Chiudi</button><div class="owm-wheel"></div></div>';
  document.body.append(panel);
  const links = [
    { label: 'Tutti i servizi', href: '/#servizi', go: 'Vedi tutti i servizi' },
    { label: 'Digital', href: '/#moi-showroom-digital', go: 'Entra in Digital' },
    { label: 'Abbigliamento', href: '/#moi-showroom-apparel', go: 'Entra in Abbigliamento' },
    { label: 'Gadget e oggetti', href: '/#moi-showroom-custom', go: 'Entra in Gadget' },
    { label: 'Veicoli e wrapping', href: '/#moi-showroom-automotive', go: 'Entra in Veicoli' },
    { label: 'Insegne e pannelli', href: '/#moi-showroom-signage', go: 'Entra in Insegne' },
    { label: 'Grafica e branding', href: '/#moi-showroom-design', go: 'Entra in Grafica' },
    { label: 'Inizio', href: '/', go: "Torna all'inizio" }
  ];
  let wheel = null, t = 0;
  const set = on => {
    clearTimeout(t);
    panel.classList.toggle('is-open', on); panel.classList.toggle('is-closing', !on);
    panel.inert = !on; btn.setAttribute('aria-expanded', String(on));
    document.documentElement.classList.toggle('owm-open', on);
    if (on) {
      if (!wheel) wheel = W().menu(panel.querySelector('.owm-wheel'), links, { kicker: 'I nostri servizi', label: 'Servizi' });
      else wheel.refresh();
      setTimeout(() => panel.querySelector('.option-wheel')?.focus({ preventScroll: true }), 500);
    } else t = setTimeout(() => panel.classList.remove('is-closing'), 900);
  };
  btn.addEventListener('click', () => set(!panel.classList.contains('is-open')));
  panel.querySelector('.owm-close').addEventListener('click', () => { set(false); btn.focus(); });
  panel.addEventListener('click', e => { if (e.target === panel) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) { set(false); btn.focus(); } });
}

const start = () => {
  about();
  if (!home()) { let n = 0; const iv = setInterval(() => { if (home() || ++n > 40) clearInterval(iv); }, 100); }
};
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
})();
