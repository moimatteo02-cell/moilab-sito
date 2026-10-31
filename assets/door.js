(() => {
  'use strict';
  const root = document.querySelector('.mlg[data-moi-experience]');
  if (!root) return;
  const cards = new Map([...root.querySelectorAll('.mlg-card[data-moi-category]')].map(card => [card.dataset.moiCategory, card]));
  const rooms = new Map([...document.querySelectorAll('.moi-room')].filter(room => room.dataset.moiOwner === root.id).map(room => [room.dataset.moiCategory, room]));
  if (!cards.size || cards.size !== rooms.size || [...cards.keys()].some(key => !rooms.has(key))) return;
  document.documentElement.classList.add('moi-experience-ready');
  rooms.forEach(room => document.body.appendChild(room));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageTitle = document.title;
  const theme = document.querySelector('meta[name="theme-color"]');
  const originalTheme = theme && theme.content;
  let homeScroll = window.scrollY, homeFocus = null, current = null, task = null;
  const cinema = document.createElement('div');
  cinema.className = 'moi-cinema';
  cinema.setAttribute('aria-hidden', 'true');
  cinema.setAttribute('role', 'dialog');
  cinema.setAttribute('aria-label', 'Ingresso nello showroom');
  cinema.setAttribute('aria-modal', 'true');
  cinema.innerHTML = '<div class="moi-cinema-scene" aria-hidden="true"><div class="moi-glass-panel"><div class="moi-portal-card mlg" inert></div><div class="moi-glass-destination" inert></div><div class="moi-glass-reflection"></div><div class="moi-glass-edge"></div></div></div><span class="moi-cinema-status" role="status" aria-live="polite"></span><button class="moi-skip" type="button">Salta animazione <span aria-hidden="true">↗</span></button>';
  document.body.appendChild(cinema);
  const skip = cinema.querySelector('.moi-skip');
  const status = cinema.querySelector('.moi-cinema-status');
  const panel = cinema.querySelector('.moi-glass-panel');
  const snapshot = cinema.querySelector('.moi-portal-card');
  const destinationView = cinema.querySelector('.moi-glass-destination');

  function decorativeClone(source) {
    const clone = source.cloneNode(true);
    clone.removeAttribute('id'); clone.removeAttribute('href'); clone.removeAttribute('aria-labelledby');
    clone.removeAttribute('data-moi-category'); clone.inert = true;
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    return clone;
  }
  function markCurrentLinks(room, key) {
    room.querySelectorAll('.moi-room-nav a').forEach(link => {
      if (link.dataset.moiCategory === key) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function syncRooms() {
    cards.forEach((card, key) => {
      const room = rooms.get(key), title = card.querySelector('h2'), subtitle = card.querySelector('.mlg-caption p');
      if(!['automotive','digital','design'].includes(key))room.querySelector('.moi-room-title').textContent = title.textContent;
      if(!['automotive','digital','design'].includes(key))room.querySelector('.moi-room-subtitle').textContent = subtitle.textContent;
      if (!['automotive','digital','design'].includes(key) && card.dataset.moiIntro) room.querySelector('.moi-room-intro').textContent = card.dataset.moiIntro;
      const source = card.querySelector('.mlg-photo'), photo = room.querySelector('.moi-room-image'), empty = room.querySelector('.moi-room-art');
      if (!photo || !empty) return;
      const stage = photo.closest('.moi-room-stage');
      if(window.MOI_VISUALS?.[key]) {
        const v=window.MOI_VISUALS[key];
        photo.hidden=v.mode!=='image';empty.hidden=!['default','icon'].includes(v.mode);
        if(key==='automotive'&&window.MOI_MINIMAL_ICONS)empty.innerHTML=window.MOI_MINIMAL_ICONS[v.mode==='icon'?v.icon:'car']||window.MOI_MINIMAL_ICONS.car;
        if(v.mode==='image'){photo.src=v.imageUrl;photo.alt='MOI LAB / '+key;}else photo.removeAttribute('src');
        photo.style.objectFit=v.fit;photo.style.objectPosition=v.x+'% '+v.y+'%';
        photo.style.width='100%';photo.style.height='100%';photo.style.transform='scale('+v.scale/100+')';
      } else if (source && !source.hidden && source.getAttribute('src')) {
        photo.src = source.getAttribute('src');
        photo.hidden = false; empty.hidden = true;
      } else {
        photo.removeAttribute('src'); photo.hidden = true; empty.hidden = false;
      }
      if(stage)stage.classList.toggle('has-photo',!photo.hidden);
      document.querySelectorAll('.moi-room-nav a[data-moi-category="' + key + '"]').forEach(link => { link.textContent = title.textContent; });
    });
  }
  function lock(on) {
    document.documentElement.classList.toggle('moi-scroll-lock', on);
    root.inert = on;
  }
  function clearSelection() {
    root.classList.remove('moi-selecting');
    root.querySelectorAll('.moi-selected').forEach(el => el.classList.remove('moi-selected'));
  }
  function changeURL(hash) {
    if (location.hash !== hash) history.pushState(history.state, '', location.pathname + location.search + hash);
  }
  function clearTask() {
    if (task) { const previous = task; task = null; previous.timers.forEach(clearTimeout); previous.cleanup?.(); }
    cinema.className = 'moi-cinema'; cinema.setAttribute('aria-hidden', 'true');
    cinema.style.cssText = ''; snapshot.replaceChildren(); destinationView.replaceChildren();
    cinema.querySelectorAll('.md-transition-canvas').forEach(canvas => canvas.remove());
    delete cinema.dataset.pixelPhase;
    rooms.forEach((room, key) => {
      room.classList.remove('is-preview', 'md-awaiting-entry');
      room.inert = key !== current;
      room.setAttribute('aria-hidden', String(key !== current));
    });
    clearSelection();
  }
  function showRoom(key, push, focus, prepared = false) {
    const room = rooms.get(key);
    if (!room) return;
    syncRooms();
    if (push) changeURL('#' + room.id);
    rooms.forEach((r, k) => {
      const active = k === key;
      r.classList.toggle('is-active', active); r.inert = !active;
      r.classList.toggle('has-arrived', active && prepared);
      r.setAttribute('aria-hidden', String(!active));
      markCurrentLinks(r, key);
    });
    current = key; lock(true); room.scrollTop = 0;
    if (!homeFocus) homeFocus = cards.get(key);
    { const t = room.querySelector('.moi-room-title'); document.title = (t.dataset.docTitle || t.textContent) + ' — MOI LAB'; }
    if (theme) theme.content = '#f6f5f2';
    if (focus) room.querySelector('.moi-room-title').focus({preventScroll: true});
  }
  function showHome(push, focus) {
    if (push) changeURL(root.dataset.moiHome || '#servizi');
    rooms.forEach(room => { room.classList.remove('is-active'); room.inert = true; room.setAttribute('aria-hidden', 'true'); });
    current = null; lock(false); clearSelection(); document.title = pageTitle;
    if (theme) theme.content = originalTheme;
    document.documentElement.classList.add('moi-scroll-return');
    window.scrollTo({top: homeScroll, behavior: 'instant'});
    requestAnimationFrame(() => document.documentElement.classList.remove('moi-scroll-return'));
    if (focus) (homeFocus || cards.values().next().value).focus({preventScroll: true});
  }
  let stTarget = null;
  function route(focus) {
    clearTask();
    const match = [...rooms].find(([, room]) => '#' + room.id === location.hash);
    // già dentro questa stanza (es. indietro tra le pagine del catalogo): non ricominciare da capo
    if (match && match[0] === current && rooms.get(current).classList.contains('is-active')) return;
    if (match && match[0] === 'custom') return; // Sticker e oggetti è una pagina a parte (/custom/)
    const target = match ? match[0] : 'hub';
    if (focus && window.MoiST && (match || current)) {
      if (stTarget === target) return; stTarget = target;
      window.MoiST.play(target, () => match ? showRoom(match[0], false, focus) : showHome(false, focus)).finally(() => { stTarget = null; });
      return;
    }
    if (match) showRoom(match[0], false, focus);
    else showHome(false, focus);
  }
  function finish() {
    if (!task) return;
    const key = task.key;
    const prepared = key !== 'digital' && rooms.get(key).classList.contains('is-preview');
    clearTask(); showRoom(key, true, true, prepared);
  }
  function enterDigital(trigger) {
    const room = rooms.get('digital');
    const pending = {key: 'digital', trigger, timers: [], cleanup: null};
    task = pending;
    lock(true);
    cinema.classList.add('is-active', 'is-pixel');
    cinema.setAttribute('aria-hidden', 'false');
    status.textContent = 'Ingresso nel mondo Digital';
    room.classList.add('md-awaiting-entry');
    rooms.forEach(r => {r.inert = true; r.setAttribute('aria-hidden', 'true');});
    pending.timers.push(setTimeout(() => {if (task === pending) finish();}, 2400));
    try {
      pending.cleanup = window.MOI_DIGITAL_TRANSITION.start({
        source: root, host: cinema, compact: window.matchMedia('(max-width: 620px)').matches,
        onCovered: () => {
          if (task !== pending) return;
          room.scrollTop = 0;markCurrentLinks(room, 'digital');room.classList.add('is-preview');
        },
        onDone: () => {if (task === pending) finish();}
      });
      skip.focus({preventScroll: true});
    } catch {clearTask();showRoom('digital', true, true);}
  }
  function enter(key, trigger) {
    if (task || key === current || !rooms.has(key)) return;
    const card = cards.get(key);
    if (!current) { homeScroll = window.scrollY; homeFocus = card; }
    root.querySelectorAll('.mlg-menu').forEach(menu => { menu.open = false; });
    syncRooms();
    if (reduced.matches) { showRoom(key, true, true); return; }
    /* passaggio unico per tutti i servizi: tenda coi colori del servizio (assets/service-transition.js) */
    if (window.MoiST) { window.MoiST.play(key, () => showRoom(key, true, true)); return; }
    if (key === 'digital' && !current && window.MOI_DIGITAL_TRANSITION) {enterDigital(trigger || card);return;}
    try {
      const short = window.matchMedia('(max-width: 620px)').matches;
      const title = card.querySelector('h2').textContent;
      const source = !current ? card : (trigger || card);
      const rect = source.getBoundingClientRect();
      const hasCard = !current && rect.width > 0 && rect.height > 0;
      if (rect.width <= 0 || rect.height <= 0) { showRoom(key, true, true); return; }
      cinema.style.setProperty('--moi-source-left', rect.left + 'px');
      cinema.style.setProperty('--moi-source-top', rect.top + 'px');
      cinema.style.setProperty('--moi-source-width', rect.width + 'px');
      cinema.style.setProperty('--moi-source-height', rect.height + 'px');
      cinema.style.setProperty('--moi-source-radius', hasCard ? getComputedStyle(card).borderRadius : '12px');
      if (hasCard) {
        snapshot.replaceChildren(decorativeClone(card));
        cinema.classList.add('has-card');
      } else {
        snapshot.textContent = title;
      }
      // A decorative copy keeps the existing page visible inside the growing glass.
      // The real showroom becomes interactive only after the transition finishes.
      const roomClone = decorativeClone(rooms.get(key));
      roomClone.classList.remove('is-active', 'is-preview', 'has-arrived');
      if(key==='automotive')roomClone.classList.add('ma-transition-preview');
      markCurrentLinks(roomClone, key);
      destinationView.replaceChildren(roomClone);
      status.textContent = 'Apertura dello showroom ' + title;
      root.classList.add('moi-selecting'); card.closest('.mlg-card-wrap').classList.add('moi-selected');
      lock(true);
      rooms.forEach(room => { room.inert = true; room.setAttribute('aria-hidden', 'true'); });
      cinema.classList.add('is-active'); cinema.setAttribute('aria-hidden', 'false');
      if (getComputedStyle(panel).position !== 'absolute') {
        clearTask(); showRoom(key, true, true); return;
      }
      const pending = {key, trigger: trigger || card, timers: []};
      task = pending;
      const schedule = (delay, callback) => pending.timers.push(setTimeout(() => {
        if (task === pending) callback();
      }, delay));
      // Flush the source geometry once so the snapshot starts at the clicked card.
      void panel.offsetWidth;
      schedule(16, () => cinema.classList.add('is-expanding'));
      schedule(short ? 80 : 140, () => cinema.classList.add('is-morphing'));
      schedule(short ? 130 : 220, () => cinema.classList.add('is-content'));
      schedule(short ? 430 : 650, () => {
        rooms.get(key).scrollTop = 0;
        markCurrentLinks(rooms.get(key), key);
        rooms.get(key).classList.add('is-preview');
        cinema.classList.add('is-revealing');
      });
      schedule(short ? 560 : 820, finish);
      skip.focus({preventScroll: true});
    } catch (error) {
      // An unsupported effect must never prevent the original destination opening.
      clearTask(); showRoom(key, true, true);
    }
  }
  function plainClick(event, link) {
    return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey &&
      !event.shiftKey && !event.altKey && !link.hasAttribute('download') &&
      (!link.target || link.target.toLowerCase() === '_self');
  }
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-moi-category]');
    if (link && rooms.has(link.dataset.moiCategory) && (root.contains(link) || [...rooms.values()].some(room => room.contains(link)))) {
      if (!plainClick(event, link)) return;
      const destination = rooms.get(link.dataset.moiCategory);
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || url.hash !== '#' + destination.id) return;
      event.preventDefault();
      if (root.contains(link) && document.body.classList.contains('mlg-demo-editing')) return;
      enter(link.dataset.moiCategory, link);
    }
    const back = event.target.closest('.moi-back');
    if (back && [...rooms.values()].some(room => room.contains(back)) && plainClick(event, back)) {
      event.preventDefault(); clearTask(); window.MoiST ? window.MoiST.play('hub', () => showHome(true, true)) : showHome(true, true);
    }
  });
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && task) {
      event.preventDefault(); skip.focus({preventScroll: true});
    }
    if (event.key === 'Escape' && task) {
      const trigger = task.trigger;
      clearTask(); if (!current) lock(false);
      if (trigger) trigger.focus({preventScroll: true});
      event.preventDefault();
    }
  });
  window.addEventListener('popstate', () => route(true));
  window.addEventListener('hashchange', () => route(true));
  window.addEventListener('pageshow', event => { if (event.persisted) route(false); });
  window.addEventListener('pagehide', clearTask);
  window.addEventListener('resize', () => { if (task) finish(); }, {passive: true});
  document.addEventListener('visibilitychange', () => { if (document.hidden && task) finish(); });
  document.addEventListener('moilab:contentchange', syncRooms);
  if (reduced.addEventListener) reduced.addEventListener('change', event => { if (event.matches && task) finish(); });
  syncRooms(); route(false);
})();
