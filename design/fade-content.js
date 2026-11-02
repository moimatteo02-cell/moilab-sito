/* MOI LAB — «Fade Content» nella stanza Design: i blocchi compaiono in dissolvenza quando arrivano sullo schermo.
   Adattato in JavaScript semplice (senza GSAP) dal componente FadeContent di React Bits (reactbits.dev),
   con le sue impostazioni predefinite: dissolvenza da 0 a 1, 1 secondo, power2.out, soglia 10%, una volta sola.

   MIT + Commons Clause License Condition v1.0 — Copyright (c) 2026 David Haz
   Permission is hereby granted, free of charge, to use, copy, modify, merge, publish, and distribute the Software
   as part of an application, website, or product. The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software. Commons Clause: you may not sell, sublicense,
   or redistribute the components themselves - whether alone, in a bundle, or as a ported version.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. */
(() => {
'use strict';
const room = document.getElementById('moi-showroom-design');
if (!room || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const SEL = '.dz-brief-side, .dz-chat, .dz-story, .dz-svs-head, .dz-sv, .moi-room-nav';
const items = [...room.querySelectorAll(SEL)];
items.forEach(el => el.classList.add('fc'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('fc-in'); io.unobserve(e.target);
}), { root: room, rootMargin: '0px 0px -10% 0px', threshold: 0 });
items.forEach(el => io.observe(el));
})();
