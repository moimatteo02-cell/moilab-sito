/* MOI LAB — bottom navigation mobile. Non duplica i comandi: usa il carrello e l'assistente esistenti. */
(() => {
  'use strict';
  if (document.querySelector('.mnav-nav')) return;
  const doc = document, html = doc.documentElement;
  const icon = body => '<svg viewBox="0 0 24 24" aria-hidden="true">' + body + '</svg>';
  const I = {
    home: icon('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'),
    shirt: icon('<path d="M8 3 3 6 1 11l4 2 2-3v11h10V10l2 3 4-2-2-5-5-3c-.4 2-7.6 2-8 0Z"/>'),
    search: icon('<circle cx="10.8" cy="10.8" r="6.9"/><path d="m16.2 16.2 5 5"/>'),
    bag: icon('<path d="M4 8h16l-1.2 13H5.2L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>')
  };
  const nav = doc.createElement('nav');
  nav.className = 'mnav-nav';
  nav.setAttribute('aria-label', 'Navigazione rapida MOI LAB');
  nav.innerHTML =
    '<a class="mnav-action" data-mnav-tab="home" href="#servizi"><span class="mnav-icon">' + I.home + '</span><span class="mnav-label">Home</span></a>' +
    '<a class="mnav-action" data-mnav-tab="catalog" href="#moi-showroom-apparel"><span class="mnav-icon">' + I.shirt + '</span><span class="mnav-label">Catalogo</span></a>' +
    '<button type="button" class="mnav-action mnav-special" data-mnav-menu aria-haspopup="dialog" aria-expanded="false" aria-controls="mnav-sheet"><span class="mnav-icon" aria-hidden="true">✦</span><span class="mnav-label">Servizi</span></button>' +
    '<button type="button" class="mnav-action" data-mnav-search><span class="mnav-icon">' + I.search + '</span><span class="mnav-label">Cerca</span></button>' +
    '<button type="button" class="mnav-action" data-mnav-quote><span class="mnav-icon">' + I.bag + '</span><span class="mnav-label">Preventivo</span><b class="mnav-count" hidden>0</b></button>';
  const services = [
    ['apparel','Abbigliamento','Capi personalizzati'],['custom','Gadget e sticker','Oggetti e stampa'],
    ['automotive','Automotive','Veicoli e wrapping'],['signage','Insegne','Pannelli e segnaletica'],
    ['design','Design','Grafica e branding'],['digital','Digital','Siti e automazioni']
  ];
  const sheet = doc.createElement('div');
  sheet.id = 'mnav-sheet';
  sheet.className = 'mnav-sheet';
  sheet.hidden = true;
  sheet.innerHTML = '<div class="mnav-veil" data-mnav-close></div><section class="mnav-panel" role="dialog" aria-modal="true" aria-labelledby="mnav-title">' +
    '<header class="mnav-head"><div><p class="mnav-eyebrow">MOI LAB / ESPLORA</p><h2 id="mnav-title">Cosa vuoi realizzare?</h2></div><button class="mnav-close" type="button" data-mnav-close aria-label="Chiudi il menu">×</button></header>' +
    '<div class="mnav-services">' + services.map(s => '<a class="mnav-service" href="#moi-showroom-' + s[0] + '" data-mnav-service><span>' + s[1] + '</span><small>' + s[2] + ' ↗</small></a>').join('') + '</div>' +
    '<div class="mnav-tools"><button type="button" data-mnav-assist hidden>Ti aiuto a scegliere</button><a href="https://wa.me/393278815148?text=Ciao%20MOI%20LAB%2C%20vorrei%20un%27informazione%3A%20" target="_blank" rel="noopener">Scrivici su WhatsApp ↗</a></div>' +
    '</section>';
  doc.body.append(nav,sheet);
  const menuButton = nav.querySelector('[data-mnav-menu]');
  let wasFocused = null;
  const close = restore => {
    if (sheet.hidden) return;
    sheet.hidden = true;
    html.classList.remove('mnav-sheet-open');
    menuButton.setAttribute('aria-expanded','false');
    if (restore !== false) (wasFocused || menuButton).focus({preventScroll:true});
  };
  const open = () => {
    if (!sheet.hidden) return close();
    window.MoiDock?.close();
    wasFocused = doc.activeElement;
    const as = sheet.querySelector('[data-mnav-assist]');
    as.hidden = !(window.MoiAssist && typeof window.MoiAssist.visible === 'function' && window.MoiAssist.visible());
    sheet.hidden = false;
    html.classList.add('mnav-sheet-open');
    menuButton.setAttribute('aria-expanded','true');
    sheet.querySelector('.mnav-close').focus({preventScroll:true});
  };
  const activeRoom = () => doc.querySelector('.moi-room.is-active')?.dataset.moiCategory || '';
  let searchSelected = false;
  const syncActive = () => {
    const room = activeRoom() || (location.hash.startsWith('#moi-showroom-') ? location.hash.slice(14) : '');
    nav.querySelectorAll('[data-mnav-tab]').forEach(a => {
      const active = a.dataset.mnavTab === (room === 'apparel' ? 'catalog' : !room ? 'home' : '');
      a.classList.toggle('is-current',active); if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    const activeServices = !!room && room !== 'apparel';
    menuButton.classList.toggle('is-current',activeServices && !searchSelected);
    nav.querySelector('[data-mnav-search]').classList.toggle('is-current', searchSelected && room === 'apparel');
  };
  function syncCount() {
    const n = typeof window.MoiCart?.count === 'function' ? window.MoiCart.count() : 0;
    const b = nav.querySelector('.mnav-count');
    b.hidden = !n;
    b.textContent = n > 99 ? '99+' : String(n);
    nav.querySelector('[data-mnav-quote]').setAttribute('aria-label',n ? 'Preventivo, ' + n + (n === 1 ? ' elemento' : ' elementi') : 'Apri il preventivo');
  }
  nav.querySelector('[data-mnav-quote]').addEventListener('click',() => { close(false); window.MoiCart?.open(); });
  menuButton.addEventListener('click',open);
  nav.querySelector('[data-mnav-search]').addEventListener('click',() => {
    close(false); searchSelected = true;
    if (location.hash !== '#moi-showroom-apparel') location.hash = '#moi-showroom-apparel';
    let tries = 0;
    const focusSearch = () => {
      const room = doc.getElementById('moi-showroom-apparel');
      const el = room?.querySelector('#br-q');
      if (room?.classList.contains('is-active') && el) {
        room.scrollTop = 0;
        el.focus({preventScroll:true});
        el.scrollIntoView({behavior:'smooth',block:'center'});
        syncActive();
      } else if (++tries < 25) setTimeout(focusSearch,100);
    };
    setTimeout(focusSearch,80);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { close(false);searchSelected=false;setTimeout(syncActive,50); }));
  sheet.addEventListener('click',e => {
    if(e.target.closest('[data-mnav-close]')) close();
    if(e.target.closest('[data-mnav-service]')) {close(false);searchSelected=false;setTimeout(syncActive,50);}
    if(e.target.closest('[data-mnav-assist]')) {close(false);window.MoiAssist?.open();}
  });
  doc.addEventListener('keydown', e => {
    if(sheet.hidden) return;
    if(e.key === 'Escape'){e.preventDefault();close();return;}
    if(e.key !== 'Tab')return;
    const list=[...sheet.querySelectorAll('button:not([hidden]),a[href]')].filter(el=>el.getClientRects().length);
    if(!list.length)return;
    const first=list[0],last=list[list.length-1];
    if(e.shiftKey && doc.activeElement === first){e.preventDefault();last.focus();}
    else if(!e.shiftKey && doc.activeElement === last){e.preventDefault();first.focus();}
  });
  doc.addEventListener('focusin',e => {
    if(e.target.matches('input,textarea,[contenteditable="true"]'))html.classList.add('mnav-typing');
  });
  doc.addEventListener('focusout',e => {
    if(e.target.matches('input,textarea,[contenteditable="true"]'))setTimeout(() => {
      if(!doc.activeElement?.matches('input,textarea,[contenteditable="true"]'))html.classList.remove('mnav-typing');
    },50);
  });
  addEventListener('hashchange',()=>{searchSelected=false;close(false);setTimeout(syncActive,40);});
  addEventListener('popstate',()=>{searchSelected=false;close(false);setTimeout(syncActive,40);});
  const rooms=doc.querySelectorAll('.moi-room');
  rooms.forEach(room=>new MutationObserver(syncActive).observe(room,{attributes:true,attributeFilter:['class']}));
  const cartCount=doc.querySelector('.qc-count');
  if(cartCount)new MutationObserver(syncCount).observe(cartCount,{childList:true,subtree:true,characterData:true});
  addEventListener('storage',syncCount);
  syncCount();syncActive();
  html.classList.add('mnav-ready');
})();