import {bindPreviews} from './preview.mjs?v=20261024-2';
import {prepareProduct} from './pdp-loader.mjs?v=20261025-13';
import {createBrowser} from './browse.mjs?v=20261026-2';
const mount=document.querySelector('#moi-apparel-catalog');
if(mount){
 const room=mount.closest('.moi-room');
 const euro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeURL=v=>{try{const u=new URL(v,location.origin);return u.protocol==='https:'||u.origin===location.origin?u.href:'';}catch{return '';}};
 let meta,started=false,category='',sub='',q='',page=1,product=null,color='',size='',personalized=false,request=0,qty=1;
 const primary=['Magliette','Felpe','Polo','Camicie','Cappotti e giacche','Gilet','Pantaloni','Cappellini e accessori'];
 const image=(src,alt,extra='')=>`<img src="${e(safeURL(src))}" alt="${e(alt)}" loading="${extra.includes('data-main-photo')?'eager':'lazy'}" decoding="async" ${extra}>`;
 // Catalogo statico (dati in /data/apparel/, generati da data/apparel di ChatGPT Sites): sostituisce l'API /api/apparel
 const PER_PAGE=24,DATA='/data/apparel/',DV='?v=20261025-50';let _meta,_list;
 async function load(f){const r=await fetch(DATA+f+DV);if(!r.ok)throw Error('Catalogo temporaneamente non disponibile.');return r.json();}
 async function api(params={}){
  if(params.sku)return load('prodotti/'+encodeURIComponent(params.sku)+'.json');
  _list??=await load('elenco.json');
  const qq=String(params.q??'').trim().toLocaleLowerCase('it');
  const items=_list.filter(p=>(!params.category||p.categoria===params.category)&&(!params.sub||p.sottocategoria===params.sub)&&(!qq||[p.nome,p.tipo,p.sku,p.categoria].join(' ').toLocaleLowerCase('it').includes(qq)));
  const pg=Math.max(1,Math.min(100,Math.floor(Number(params.page)||1)));
  const res={products:items.slice((pg-1)*PER_PAGE,pg*PER_PAGE),total:items.length,page:pg,pages:Math.ceil(items.length/PER_PAGE)};
  if(!Object.keys(params).length){_meta??=await load('meta.json');return {..._meta,...res};}
  return res;
 }
 const frame=body=>`<div class="ac-heading"><span>MOI LAB / IL CATALOGO</span><a class="ac-owner" href="/admin/abbigliamento" hidden>Il mio listino riservato ↗</a></div>${body}`;
 function scrollCatalog(){mount.scrollIntoView({behavior:'instant',block:'start'});mount.querySelector('h2')?.focus({preventScroll:true});}
 function bindFallbacks(){mount.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;if(!img.classList.contains('ac-back-photo'))img.parentElement?.classList.add('ac-no-image');},{once:true}));}
 async function ownerLink(){try{const r=await fetch('/api/sticker/session',{credentials:'same-origin'});if(r.ok&&(await r.json()).isAdmin)mount.querySelector('.ac-owner')?.removeAttribute('hidden');}catch{}}
 let disposePreviews=()=>{};
 function paint(body){room?.classList.remove('ac-detail-mode');try{readyVideo?.pause();}catch{}disposePreviews();mount.innerHTML=frame(body);bindFallbacks();ownerLink();disposePreviews=bindPreviews(mount);}
 let browser=null;
 function home(){
  category='';sub='';q='';page=1;product=null;browser.home();
 }
 function previewAttrs(p){return `data-preview-card data-preview-video="${e(p.video?safeURL(p.video):'')}"`;}
 function cardPhoto(p){return `<div class="ac-picture ac-preview">${image(p.immagine_modello_fronte||p.immagine_principale,p.nome,'class="ac-model-photo"')}${p.immagine_modello_retro?image(p.immagine_modello_retro,p.nome+' · modello di spalle','class="ac-back-photo"'):p.retro_capo?image(p.retro_capo,p.nome+' · retro','class="ac-back-photo ac-back-flat"'):''}${p.linea_premium?'<span class="ac-badge">PREMIUM</span>':''}</div>`;}

 function special(){const sp=meta.special,ph=sp.immagine_prodotto&&sp.immagine_prodotto!==sp.immagine_principale;return `<article class="ac-special br-special"><button class="br-sp-media${ph?' has-two':''}" data-sku="${e(sp.sku)}" aria-label="Scopri Atomic 150"><span class="br-sp-ph br-sp-model">${image(sp.immagine_principale,'Atomic 150 indossata')}</span>${ph?`<span class="br-sp-ph br-sp-flat">${image(sp.immagine_prodotto,'Atomic 150')}</span>`:''}</button><div class="br-sp-copy"><span class="ac-overline">IL NOSTRO MUST</span><h3>Atomic 150</h3><p class="br-sp-type">T-shirt base · con o senza personalizzazione</p><div class="br-sp-prices"><span class="br-sp-row"><span class="br-pc-label">Senza logo</span><strong>${sp.prezzo==null?'da confermare':'da '+euro(sp.prezzo)}</strong></span><span class="br-sp-row"><span class="br-pc-label">Col tuo logo</span><strong>${euro(sp.prezzo_personalizzato)}</strong></span></div><button class="ac-cta" data-sku="${e(sp.sku)}">Scopri il capo →</button></div></article>`;}

 async function listing(scroll=false){
  product=null;++request;await browser.back();
 }
 async function detail(sku,fromHistory=false){
  const id=++request;mount.setAttribute('aria-busy','true');
  try{const data=await api({sku});if(id!==request)return;product=data.product;color=product.colore_base||product.colori[0]?.nome||'';size='';personalized=false;qty=1;const ready=await prepareProduct(product);if(id!==request){ready.video?.removeAttribute('src');return;}readyVideo=ready.video;showProduct();if(!fromHistory)try{history.pushState({acProduct:sku},'',location.href);}catch{}if(!lockable())scrollCatalog();else mount.querySelector('h2')?.focus({preventScroll:true});}
  catch(err){if(id===request)paint(`<p role="alert">${e(err.message)}</p><button data-retry>Ritorna ai prodotti</button>`);}
  finally{if(id===request)mount.removeAttribute('aria-busy');}
 }
 // Prezzo per colore+taglia; senza taglia scelta mostra 'da X €' se le taglie hanno prezzi diversi
 function priceLabel(k){const vs=product.varianti.filter(v=>v.colore===color),x=vs.find(v=>v.taglia===size)||vs.find(v=>v.taglia==='tutte');if(x&&x[k]!=null)return euro(x[k]);if(!size){const ns=vs.map(v=>v[k]).filter(n=>n!=null);if(ns.length){const lo=Math.min(...ns),hi=Math.max(...ns);return (lo!==hi?'da ':'')+euro(lo);}}return 'Prezzo da confermare';}
 // Personalizzazione a quantita': 1-9 pz +10 EUR, 10-49 pz +7 EUR, 50+ pz +5 EUR (mai sopra il prezzo 1-9 pz)
 function qtyTable(){const vs=product.varianti.filter(v=>v.colore===color),x=vs.find(v=>v.taglia===size)||vs.find(v=>v.taglia==='tutte')||(!size&&vs.length?vs.reduce((a,b)=>a.prezzo<=b.prezzo?a:b):null);
  if(!x||x.prezzo==null||x.prezzo_personalizzato==null)return '';const from=!size&&!vs.find(v=>v.taglia==='tutte')&&new Set(vs.map(v=>v.prezzo)).size>1?'da ':'';
  const rows=[['1–9 pezzi',x.prezzo_personalizzato],['10–49 pezzi',Math.min(x.prezzo_personalizzato,x.prezzo+7)],['50+ pezzi',Math.min(x.prezzo_personalizzato,x.prezzo+5)]];
  return `<p class="ac-qty-title">Con personalizzazione, prezzo al pezzo</p><dl>${rows.map(([q,n])=>`<div><dt>${q}</dt><dd>${from}${euro(n)}</dd></div>`).join('')}</dl><p class="ac-qty-note">Più capi ordini, meno paghi la stampa.</p>`;}
 function price(){return product.varianti.find(v=>v.colore===color&&(v.taglia===size||v.taglia==='tutte'))?.prezzo;}
 function customPrice(){return product.varianti.find(v=>v.colore===color&&(v.taglia===size||v.taglia==='tutte'))?.prezzo_personalizzato;}
 function quote(){const u=unit();return 'https://wa.me/393278815148?text='+encodeURIComponent(`Ciao MOI LAB, vorrei un preventivo per ${product.nome} (${product.sku}), colore ${color||'da definire'}, taglia ${size||'da definire'}, quantità ${qty}. ${personalized?'Con personalizzazione (una stampa fino a 40 cm inclusa)':'Capo senza personalizzazione'}. Prezzo indicato: ${u?(u.from?'da ':'')+euro(u.n)+' al pezzo':'da confermare'}.`);}
 function showProduct(){
  const p=product;
  const short=String(p.descrizione_breve||p.descrizione||'').split('\n')[0];
  const ico={
   print:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M7 14h10v7H7z"/></svg>',
   tag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/></svg>',
   stack:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/></svg>',
   clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
   chat:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>',
   heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9-9a4.6 4.6 0 0 1 9-3 4.6 4.6 0 0 1 9 3c-2 4.6-9 9-9 9z"/></svg>',
   up:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>',down:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'};
  const swatch=c=>{const tile=(c.foto&&c.foto[0])||c.immagine;return `<button type="button" data-color="${e(c.nome)}" aria-pressed="${color===c.nome}" title="${e(c.nome)}"><span class="ac-pdp-swatch">${tile?image(tile,''):`<i style="background:${colorFill(c.hex)}"></i>`}</span><span class="ac-pdp-chip">${dot(c.hex)}<span>${e(c.nome)}</span></span></button>`;};
  paint(`<nav class="ac-pdp-crumbs" aria-label="Percorso"><button type="button" data-home>Catalogo</button><span>/</span><button type="button" data-list>${e(category||p.categoria||'Tutti i capi')}</button>${p.sottocategoria?`<span>/</span><span>${e(p.sottocategoria)}</span>`:''}</nav>
  <div class="ac-pdp">
   <div class="ac-pdp-info">
    <p class="ac-overline">${e(p.marca)} / ${e(p.sku)}${p.linea_premium?' / PREMIUM':''}</p>
    <h2 tabindex="-1">${e(p.nome)}</h2>
    <p class="ac-pdp-type">${e(p.tipo)}</p>
    <p class="ac-pdp-price"><strong data-unit-price>${unitLabel()}</strong><span data-unit-mode>${personalized?'con personalizzazione':'senza personalizzazione'}, al pezzo</span></p>
    <div class="ac-dual-prices" aria-live="polite"><div><span>Senza personalizzazione</span><strong data-price>${priceLabel('prezzo')}</strong></div><div><span>Con personalizzazione</span><strong data-custom-price>${priceLabel('prezzo_personalizzato')}</strong></div></div>
    <p class="ac-pdp-short">${e(short)}</p>
    <ul class="ac-pdp-features">
     <li>${ico.print}<div><strong>Stampa inclusa</strong><span>Una stampa fino a 40 cm nel prezzo personalizzato</span></div></li>
     <li>${ico.tag}<div><strong>Prezzi finali</strong><span>Nessuna IVA da aggiungere</span></div></li>
     <li>${ico.stack}<div><strong>Più ne ordini, meno paghi</strong><span>Stampa scontata da 10 e da 50 pezzi</span></div></li>
     <li>${ico.clock}<div><strong>Su ordinazione</strong><span>Tempi e disponibilità confermati nel preventivo</span></div></li>
    </ul>
    <div class="ac-pdp-acc">
     <details><summary>Descrizione e materiali</summary><p class="ac-description">${e(p.descrizione)}</p></details>
     <details><summary>Prezzi a quantità</summary><div class="ac-qty" data-qty>${qtyTable()}</div></details>
     <details data-size-guide><summary>Taglie disponibili</summary><p>${p.taglie.map(e).join(' · ')}</p><p class="ac-note">Le taglie elencate non indicano la disponibilità in tempo reale: la confermiamo nel preventivo.</p></details>
     <details><summary>Come funziona l'ordine</summary><p>Scegli colore, taglia e quantità e richiedi il preventivo: ti rispondiamo su WhatsApp con prezzo definitivo, tempi e bozza della stampa.</p></details>
    </div>
   </div>
   <div class="ac-pdp-gallery">
    <div class="ac-pdp-rail">
     <div class="ac-thumbs" data-rail></div>
    </div>
    <div class="ac-pdp-stage" title="Trascina, usa la rotellina o clicca per cambiare foto"><div class="ac-picture ac-main" data-media-stage></div><span class="ac-pdp-pos" data-gallery-position aria-live="polite"></span></div>
   </div>
   <aside class="ac-pdp-panel" aria-label="Scegli e richiedi il preventivo">
    <div class="ac-pdp-row"><span>${e(p.sku)}</span><span class="ac-pdp-stock"><i></i>Su ordinazione</span></div>
    <fieldset><legend>Colore <span data-color-label>${e(color)}</span></legend><div class="ac-pdp-colors">${p.colori.map(swatch).join('')}</div></fieldset>
    <fieldset><legend>Taglia <button type="button" class="ac-pdp-link" data-open-sizes>Guida alle taglie</button></legend><div class="ac-pdp-sizes">${p.taglie.map(s=>`<button type="button" data-size="${e(s)}" aria-pressed="false">${e(s)}</button>`).join('')}</div><p class="ac-pdp-hint" data-size-label>Seleziona una taglia</p></fieldset>
    <fieldset><legend>Come lo vuoi?</legend><div class="ac-pdp-toggle"><button type="button" data-personalization="no" aria-pressed="${!personalized}">Senza stampa</button><button type="button" data-personalization="yes" aria-pressed="${personalized}">Con stampa</button></div></fieldset>
    <fieldset><legend>Quantità</legend><div class="ac-pdp-qtyrow"><div class="ac-pdp-stepper"><button type="button" data-qty-step="-1" aria-label="Diminuisci quantità">−</button><input data-qty-input type="number" inputmode="numeric" min="1" max="9999" value="${qty}" aria-label="Quantità"><button type="button" data-qty-step="1" aria-label="Aumenta quantità">+</button></div><p class="ac-pdp-total" data-total aria-live="polite">${totalLabel()}</p></div></fieldset>
    <a class="ac-pdp-cta" data-quote href="${e(quote())}" target="_blank" rel="noopener noreferrer">Richiedi il preventivo <span aria-hidden="true">→</span></a>
    <button type="button" class="ac-pdp-fav" data-fav aria-pressed="${isFav()}">${ico.heart}<span data-fav-label>${isFav()?'Salvato nei preferiti':'Salva nei preferiti'}</span></button>
    <ul class="ac-pdp-trust">
     <li>${ico.print}<div><strong>Stampa fino a 40 cm inclusa</strong><span>Nel prezzo con personalizzazione</span></div></li>
     <li>${ico.tag}<div><strong>Prezzo finale</strong><span>Nessuna IVA da aggiungere</span></div></li>
     <li>${ico.chat}<div><strong>Risposta su WhatsApp</strong><span>Preventivo con bozza della stampa</span></div></li>
    </ul>
   </aside>
  </div>`);
  mount.querySelectorAll('.ac-pdp-colors img').forEach(i=>{i.loading='eager';});
  buildGallery();showMedia(0);
  room?.classList.add('ac-detail-mode');if(room)room.scrollTop=0;
 }
 // Colori: "#FFFFFF/#00A0D1" -> pallino diviso nei colori del capo
 function hexes(h){return String(h||'').split('/').map(x=>x.trim()).filter(x=>/^#[0-9a-f]{6}$/i.test(x)||/^#[0-9a-f]{3}$/i.test(x));}
 function colorFill(h){const l=hexes(h);if(!l.length)return '#e7e5df';if(l.length===1)return l[0];const st=100/l.length;return `linear-gradient(135deg,${l.map((c,i)=>`${c} ${i*st}% ${(i+1)*st}%`).join(',')})`;}
 function dot(h){return hexes(h).length?`<i class="ac-pdp-dot" style="background:${colorFill(h)}"></i>`:'';}
 // Galleria: prima la modella (e i suoi dettagli), poi il video, poi il capo nel colore scelto
 function buildGallery(){
  const p=product,c=p.colori.find(x=>x.nome===color),model=p.galleria||[p.immagine_principale].filter(Boolean),own=(c&&(c.foto&&c.foto.length?c.foto:[c.immagine]).filter(Boolean))||[];
  const seen=new Set(),imgs=u=>u.filter(x=>x&&!seen.has(x)&&seen.add(x)).map(src=>({type:'image',src}));
  const m=imgs(model);mediaItems=[...(p.video?[{type:'video',src:p.video}]:[]),...m,...imgs(own)];
  colorStart=mediaItems.findIndex(x=>x.type==='image'&&own.includes(x.src));
  const rail=mount.querySelector('[data-rail]');if(!rail)return;
  rail.innerHTML=mediaItems.map((it,i)=>it.type==='video'?'<button data-video aria-label="Video del capo"><span class="ac-pdp-play">▶</span><small>Video</small></button>':`<button data-photo="${e(it.src)}" aria-label="Foto ${i+1} di ${e(p.nome)}">${image(it.src,'Foto '+(i+1))}</button>`).join('');
  rail.querySelectorAll('img').forEach(i=>{i.loading='eager';});bindFallbacks();
 }
 let colorStart=-1,readyVideo=null;
 // Prezzo al pezzo per la selezione corrente; con stampa applica lo scaglione di quantita'
 function pick(k){const vs=product.varianti.filter(v=>v.colore===color),x=vs.find(v=>v.taglia===size)||vs.find(v=>v.taglia==='tutte');if(x)return {v:x,from:false};if(!size&&vs.length){const m=vs.reduce((a,b)=>(a[k]??1e9)<=(b[k]??1e9)?a:b);return {v:m,from:new Set(vs.map(v=>v[k])).size>1};}return null;}
 function unit(){const r=pick(personalized?'prezzo_personalizzato':'prezzo');if(!r)return null;const x=r.v;let n=personalized?x.prezzo_personalizzato:x.prezzo;if(n==null)return null;if(personalized&&x.prezzo!=null)n=qty>=50?Math.min(n,x.prezzo+5):qty>=10?Math.min(n,x.prezzo+7):n;return {n:Math.round(n*100)/100,from:r.from};}
 function unitLabel(){const u=unit();return u?(u.from?'da ':'')+euro(u.n):'Prezzo da confermare';}
 function totalLabel(){const u=unit();return u?`${qty} × ${euro(u.n)} = <strong>${u.from?'da ':''}${euro(Math.round(u.n*qty*100)/100)}</strong>`:'';}
 function favs(){try{return JSON.parse(localStorage.getItem('moi-preferiti')||'[]')}catch{return []}}
 function isFav(){return favs().includes(product.sku);}
 function toggleFav(){let f=favs();f=f.includes(product.sku)?f.filter(x=>x!==product.sku):[...f,product.sku];try{localStorage.setItem('moi-preferiti',JSON.stringify(f))}catch{}const b=mount.querySelector('[data-fav]');if(b){b.setAttribute('aria-pressed',String(isFav()));b.querySelector('[data-fav-label]').textContent=isFav()?'Salvato nei preferiti':'Salva nei preferiti';}}
 let mediaItems=[],mediaIndex=0;
 function lockable(){return matchMedia('(min-width:1024px) and (min-height:640px)').matches;}
 function showMedia(index,dir){
  const prev=mediaIndex;mediaIndex=(index+mediaItems.length)%mediaItems.length;if(dir==null)dir=mediaIndex>=prev?1:-1;
  const stage=mount.querySelector('[data-media-stage]'),item=mediaItems[mediaIndex];
  stage.querySelector('video')?.pause();stage.classList.remove('ac-no-image');
  const old=stage.firstElementChild;if(item.type==='video'&&readyVideo&&readyVideo.src===new URL(item.src,location.href).href){stage.innerHTML='';readyVideo.setAttribute('aria-label','Video di '+product.nome);readyVideo.autoplay=true;stage.append(readyVideo);}else stage.innerHTML=item.type==='video'?`<video autoplay muted loop playsinline preload="auto" poster="${e(safeURL(product.immagine_principale))}" aria-label="Video di ${e(product.nome)}" src="${e(safeURL(item.src))}"></video>`:image(item.src,product.nome,'data-main-photo');
  mount.querySelector('[data-gallery-position]').textContent=`${mediaIndex+1} / ${mediaItems.length}`;
  mount.querySelectorAll('.ac-thumbs button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===mediaIndex)));
  const rail=mount.querySelector('.ac-thumbs'),act=rail?.children[mediaIndex];if(rail&&act){const vertical=getComputedStyle(rail).flexDirection==='column';rail.scrollTo({top:vertical?act.offsetTop-rail.clientHeight/2+act.offsetHeight/2:0,left:vertical?0:act.offsetLeft-rail.clientWidth/2+act.offsetWidth/2,behavior:'smooth'});}
  const video=stage.querySelector('video');if(video){video.muted=true;video.play().catch(()=>{stage.innerHTML=image(product.immagine_principale,product.nome,'data-main-photo');bindFallbacks();});video.addEventListener('error',()=>{stage.innerHTML=image(product.immagine_principale,product.nome,'data-main-photo');bindFallbacks();},{once:true});}bindFallbacks();
  const fresh=stage.firstElementChild;if(fresh&&old&&old!==fresh&&!matchMedia('(prefers-reduced-motion: reduce)').matches){fresh.animate([{opacity:0,transform:`translateY(${dir*7}%) scale(1.015)`},{opacity:1,transform:'none'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'});}
 }
 function updateSelection(){
  mount.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===color)));
  mount.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.size===size)));
  mount.querySelector('[data-color-label]').textContent=color;mount.querySelector('[data-size-label]').textContent=size?'Taglia '+size:'Seleziona una taglia';const up=mount.querySelector('[data-unit-price]');if(up){up.textContent=unitLabel();mount.querySelector('[data-unit-mode]').textContent=(personalized?'con personalizzazione':'senza personalizzazione')+', al pezzo';mount.querySelector('[data-total]').innerHTML=totalLabel();const qi=mount.querySelector('[data-qty-input]');if(qi&&+qi.value!==qty)qi.value=qty;}
  mount.querySelector('[data-price]').textContent=priceLabel('prezzo');
  mount.querySelector('[data-custom-price]').textContent=priceLabel('prezzo_personalizzato');const qt=mount.querySelector('[data-qty]');if(qt)qt.innerHTML=qtyTable();
  mount.querySelectorAll('[data-personalization]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.personalization==='yes')===personalized)));
  mount.querySelector('[data-quote]').href=quote();
 }
 // Foto: trascina (su/giu' o destra/sinistra), rotellina o clic per cambiare
 let drag=null,wheelAcc=0,wheelLock=0;
 mount.addEventListener('pointerdown',ev=>{const st=ev.target.closest('[data-media-stage]');if(!st||(ev.pointerType==='mouse'&&ev.button!==0))return;drag={x:ev.clientX,y:ev.clientY,moved:false,el:st.firstElementChild,id:ev.pointerId,st};},{passive:true});
 mount.addEventListener('pointermove',ev=>{if(!drag)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)>6){drag.moved=true;drag.st.setPointerCapture?.(drag.id);drag.st.classList.add('is-dragging');}if(drag.moved&&drag.el){const v=Math.abs(dy)>=Math.abs(dx);drag.v=v;const d=v?dy:dx;drag.el.style.transition='none';drag.el.style.transform=v?`translateY(${d*.6}px)`:`translateX(${d*.6}px)`;drag.el.style.opacity=String(Math.max(.35,1-Math.abs(d)/600));}},{passive:true});
 const endDrag=ev=>{if(!drag)return;const d0=drag;drag=null;d0.st.classList.remove('is-dragging');const dx=ev.clientX-d0.x,dy=ev.clientY-d0.y,d=d0.v?dy:dx;
  if(d0.el){d0.el.style.transition='transform .35s cubic-bezier(.2,.8,.2,1),opacity .35s';d0.el.style.transform='';d0.el.style.opacity='';}
  if(!d0.moved){if(ev.type==='pointerup'&&mediaItems.length>1)showMedia(mediaIndex+1,1);return;}
  if(Math.abs(d)>60)showMedia(mediaIndex+(d<0?1:-1),d<0?1:-1);};
 mount.addEventListener('pointerup',endDrag,{passive:true});mount.addEventListener('pointercancel',endDrag,{passive:true});
 mount.addEventListener('wheel',ev=>{const st=ev.target.closest('.ac-pdp-stage');if(!st||mediaItems.length<2)return;ev.preventDefault();const now=performance.now();if(now<wheelLock)return;wheelAcc+=Math.abs(ev.deltaY)>Math.abs(ev.deltaX)?ev.deltaY:ev.deltaX;if(Math.abs(wheelAcc)>40){const dir=wheelAcc>0?1:-1;wheelAcc=0;wheelLock=now+420;showMedia(mediaIndex+dir,dir);}},{passive:false});
 mount.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-home')){++request;home();scrollCatalog();}
  else if(b.hasAttribute('data-category')){category=b.dataset.category;sub='';q='';page=1;listing(true);}
  else if(b.hasAttribute('data-all')){category='';sub='';q='';page=1;listing(true);}
  else if(b.hasAttribute('data-sub')){sub=b.dataset.sub;page=1;listing();}
  else if(b.hasAttribute('data-page')){page+=Number(b.dataset.page);listing(true);}
  else if(b.hasAttribute('data-sku'))detail(b.dataset.sku);
  else if(b.hasAttribute('data-list')||b.hasAttribute('data-retry'))listing(true);
  else if(b.hasAttribute('data-video'))showMedia(Math.max(0,mediaItems.findIndex(x=>x.type==='video')));
  else if(b.hasAttribute('data-gallery-step'))showMedia(mediaIndex+Number(b.dataset.galleryStep));
  else if(b.hasAttribute('data-photo'))showMedia(mediaItems.findIndex(x=>x.src===b.dataset.photo));
  else if(b.hasAttribute('data-color')){color=b.dataset.color;updateSelection();if(mount.querySelector('[data-rail]')){buildGallery();showMedia(colorStart>=0?colorStart:0);}else{const c=product.colori.find(c=>c.nome===color);if(c?.immagine){let i=mediaItems.findIndex(x=>x.src===c.immagine);if(i>=0)showMedia(i);}}}
  else if(b.hasAttribute('data-size')){size=b.dataset.size;updateSelection();}
  else if(b.hasAttribute('data-personalization')){personalized=b.dataset.personalization==='yes';updateSelection();}
  else if(b.hasAttribute('data-qty-step')){qty=Math.max(1,Math.min(9999,qty+Number(b.dataset.qtyStep)));updateSelection();}
  else if(b.hasAttribute('data-fav'))toggleFav();
  else if(b.hasAttribute('data-open-sizes')){const d=mount.querySelector('[data-size-guide]');if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'center'});}}
 });
 mount.addEventListener('input',ev=>{if(ev.target.matches('[data-qty-input]')){const n=Math.floor(Number(ev.target.value));if(n>=1){qty=Math.min(9999,n);updateSelection();}}});
 mount.addEventListener('submit',ev=>{if(ev.target.closest('[data-br-search]'))return;ev.preventDefault();q=new FormData(ev.target).get('q')||'';page=1;if(/^(atomic(?:\s*150)?|ca6424)$/i.test(q.trim()))detail(meta.special.sku);else listing();});
 addEventListener('popstate',ev=>{if(ev.state?.acProduct&&started)detail(ev.state.acProduct,true);});
 async function start(){if(started)return;started=true;browser??=createBrowser(mount,{e,euro,image,previewAttrs,cardPhoto,special,paint,onProduct:sku=>detail(sku)});mount.innerHTML='<p role="status">Prepariamo il tuo catalogo…</p>';try{meta=await api();home();}catch{started=false;mount.innerHTML='<p role="alert">Catalogo non disponibile.</p><button data-init>Riprova</button>';}}
 mount.addEventListener('click',e=>{if(e.target.closest('[data-init]'))start();});
 const observer=new MutationObserver(()=>{if(room.classList.contains('is-active'))start();});observer.observe(room,{attributes:true,attributeFilter:['class']});
 if(room.classList.contains('is-active'))start();
}
