import {bindPreviews} from './preview.mjs?v=20261024-2';
const mount=document.querySelector('#moi-apparel-catalog');
if(mount){
 const room=mount.closest('.moi-room');
 const euro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeURL=v=>{try{const u=new URL(v,location.origin);return u.protocol==='https:'||u.origin===location.origin?u.href:'';}catch{return '';}};
 let meta,started=false,category='',sub='',q='',page=1,product=null,color='',size='',personalized=false,request=0;
 const primary=['Magliette','Felpe','Polo','Camicie','Cappotti e giacche','Gilet','Pantaloni','Cappellini e accessori'];
 const image=(src,alt,extra='')=>`<img src="${e(safeURL(src))}" alt="${e(alt)}" loading="${extra.includes('data-main-photo')?'eager':'lazy'}" decoding="async" ${extra}>`;
 // Catalogo statico (dati in /data/apparel/, generati da data/apparel di ChatGPT Sites): sostituisce l'API /api/apparel
 const PER_PAGE=24,DATA='/data/apparel/',DV='?v=20261025-3';let _meta,_list;
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
 function paint(body){disposePreviews();mount.innerHTML=frame(body);bindFallbacks();ownerLink();disposePreviews=bindPreviews(mount);}
 function home(){
  category='';sub='';q='';page=1;product=null;
  paint(`<h2 tabindex="-1">Scegli il capo.<br><em>Al resto pensiamo noi.</em></h2><p class="ac-lead">400 modelli. Colori, taglie e possibilità da esplorare.</p><p class="ac-note">Scegli il capo senza personalizzazione oppure con una stampa fino a 40 cm inclusa. Entrambi i prezzi sono finali.</p><div class="ac-categories">${meta.categories.filter(c=>primary.includes(c.nome)).map(c=>`<button class="ac-category" data-category="${e(c.nome)}"><div class="ac-picture">${image(c.image,c.nome)}</div><div><h3>${e(c.nome)} <span>↗</span></h3><p>${c.modelli} modelli · da ${euro(c.prezzo_da)}</p></div></button>`).join('')}</div><p class="ac-overline">Anche:</p><div class="ac-filters">${meta.categories.filter(c=>!primary.includes(c.nome)).map(c=>`<button data-category="${e(c.nome)}">${e(c.nome)} · ${c.modelli}</button>`).join('')}</div><button class="ac-all" data-all>Esplora tutti i 400 modelli →</button><p class="ac-note">Disponibilità, quantità e tempi vengono confermati nel preventivo. Foto e video del catalogo sono forniti da Emme Customs.</p>`);
 }
 function previewAttrs(p){return `data-preview-card data-preview-video="${e(p.video?safeURL(p.video):'')}"`;}
 function cardPhoto(p){return `<div class="ac-picture ac-preview">${image(p.immagine_modello_fronte||p.immagine_principale,p.nome,'class="ac-model-photo"')}${p.immagine_modello_retro?image(p.immagine_modello_retro,p.nome+' · modello di spalle','class="ac-back-photo"'):''}${p.linea_premium?'<span class="ac-badge">PREMIUM</span>':''}</div>`;}

 function special(){return `<article class="ac-special"><button class="ac-special-photo" ${previewAttrs(meta.special)} data-sku="${e(meta.special.sku)}" aria-label="Scopri Atomic 150">${cardPhoto({...meta.special,nome:'Atomic 150'})}</button><div><span class="ac-overline">IL NOSTRO MUST</span><h3>Atomic 150</h3><p>T-shirt base · con o senza personalizzazione</p><p>Senza personalizzazione: ${meta.special.prezzo==null?'prezzo da confermare':euro(meta.special.prezzo)}</p><strong>Con personalizzazione: ${euro(meta.special.prezzo_personalizzato)}</strong></div><button class="ac-cta" data-sku="${e(meta.special.sku)}">Scopri il capo →</button></article>`;}

 async function listing(scroll=false){
  product=null;const id=++request;
  mount.setAttribute('aria-busy','true');
  try{
   const data=await api({category,sub,q,page:String(page)});if(id!==request)return;
   const c=meta.categories.find(c=>c.nome===category);
   paint(`<button class="ac-back" data-home>← Tutte le categorie</button><h2 tabindex="-1">${e(category||'Tutti i capi.')}</h2><form class="ac-search"><label for="ac-search">Cerca un modello o un codice</label><div><input id="ac-search" name="q" value="${e(q)}" placeholder="Nome, tipo o SKU"><button>Cerca</button></div></form>${c?`<div class="ac-filters"><button data-sub="" aria-pressed="${!sub}">Tutti</button>${c.sottocategorie.map(s=>`<button data-sub="${e(s.nome)}" aria-pressed="${sub===s.nome}">${e(s.nome)}</button>`).join('')}</div>`:''}${category==='Magliette'&&!sub&&!q&&page===1?special():''}<p class="ac-count" role="status">${data.total} modelli · pagina ${data.page} di ${Math.max(1,data.pages)}</p><p class="ac-note">Passa il cursore per vedere il modello di spalle, dove disponibile. Restando sulla scheda parte il video appena pronto. Su mobile: primo tocco per l’anteprima, secondo per aprire.</p><div class="ac-products">${data.products.map(p=>`<button class="ac-product" ${previewAttrs(p)} data-sku="${e(p.sku)}">${cardPhoto(p)}<span class="ac-product-name">${e(p.nome)} <b>↗</b></span><span class="ac-type">${e(p.tipo)}</span><span class="ac-colors">${p.colori} colori</span><span class="ac-card-price">Senza personalizzazione<strong>da ${euro(p.prezzo_da)}</strong></span><span class="ac-card-price">Con personalizzazione<strong>da ${euro(p.prezzo_personalizzato_da)}</strong></span></button>`).join('')}</div>${!data.total?'<p>Nessun capo trovato. Prova un altro nome o rimuovi il filtro.</p>':''}<div class="ac-pagination">${page>1?'<button data-page="-1">← Precedenti</button>':''}${page<data.pages?'<button data-page="1">Altri modelli →</button>':''}</div><p class="ac-note">Con personalizzazione: una stampa fino a 40 cm inclusa. Prezzi finali; disponibilità e tempi da confermare.</p>`);
   if(scroll)scrollCatalog();
  }catch(err){if(id===request)paint(`<p role="alert">${e(err.message)}</p><button data-retry>Riprova</button>`);}
  finally{if(id===request)mount.removeAttribute('aria-busy');}
 }
 async function detail(sku){
  const id=++request;mount.setAttribute('aria-busy','true');
  try{const data=await api({sku});if(id!==request)return;product=data.product;color=product.colori[0]?.nome||'';size='';personalized=false;showProduct();scrollCatalog();}
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
 function quote(){const amount=personalized?customPrice():price();return 'https://wa.me/393278815148?text='+encodeURIComponent(`Ciao MOI LAB, vorrei un preventivo per ${product.nome} (${product.sku}), colore ${color||'da definire'}, taglia ${size||'da definire'}. Prezzo indicato: ${amount!=null?euro(amount):'da confermare'}, ${personalized?'con personalizzazione (una stampa fino a 40 cm inclusa)':'capo senza personalizzazione'}. Quantità: da definire.`);}
 function showProduct(){
  const p=product,c=p.colori.find(c=>c.nome===color),photos=[...new Set([p.immagine_principale,...p.immagini,c?.immagine].filter(Boolean))];
  paint(`<button class="ac-back" data-list>← ${e(category||'Tutti i capi')}</button><div class="ac-detail"><div class="ac-gallery"><div class="ac-picture ac-main" data-media-stage></div><div class="ac-thumbs">${p.video?'<button data-video aria-label="Video del capo">Video</button>':''}${photos.map((src,i)=>`<button data-photo="${e(src)}" aria-label="Foto ${i+1} di ${e(p.nome)}">${image(src,'Dettaglio '+(i+1))}</button>`).join('')}</div><div class="ac-gallery-nav"><button data-gallery-step="-1" aria-label="Contenuto precedente">←</button><span data-gallery-position aria-live="polite"></span><button data-gallery-step="1" aria-label="Contenuto successivo">→</button></div></div><div class="ac-info"><p class="ac-overline">${e(p.marca)} / ${e(p.sku)} ${p.linea_premium?' / PREMIUM':''}</p><h2 tabindex="-1">${e(p.nome)}</h2><p class="ac-lead">${e(p.tipo)}</p><div class="ac-dual-prices" aria-live="polite"><div><span>Senza personalizzazione</span><strong data-price>${priceLabel('prezzo')}</strong></div><div><span>Con personalizzazione</span><strong data-custom-price>${priceLabel('prezzo_personalizzato')}</strong></div></div><div class="ac-qty" data-qty>${qtyTable()}</div><p class="ac-note">Prezzi finali, nessuna IVA da aggiungere. Con personalizzazione: una stampa fino a 40 cm inclusa.</p><fieldset><legend>Come desideri il capo?</legend><div class="ac-sizes"><button type="button" data-personalization="no" aria-pressed="true">Senza personalizzazione</button><button type="button" data-personalization="yes" aria-pressed="false">Con personalizzazione</button></div></fieldset><fieldset><legend>Colore: <span data-color-label>${e(color)}</span></legend><div class="ac-swatches">${p.colori.map(c=>{const hex=/^#[0-9a-f]{3,8}$/i.test(c.hex||'')?c.hex:null;return `<button type="button" data-color="${e(c.nome)}" aria-label="${e(c.nome)}" aria-pressed="${color===c.nome}" title="${e(c.nome)}">${hex?`<i style="background:${hex}"></i>`:''}<span>${e(c.nome)}</span></button>`;}).join('')}</div></fieldset><fieldset><legend>Taglia: <span data-size-label>da scegliere</span></legend><div class="ac-sizes">${p.taglie.map(s=>`<button type="button" data-size="${e(s)}" aria-pressed="false">${e(s)}</button>`).join('')}</div></fieldset><a class="ac-cta" data-quote href="${e(quote())}" target="_blank" rel="noopener noreferrer">Richiedi preventivo su WhatsApp ↗</a><p class="ac-note">Quantità, disponibilità e tempi da concordare. Le taglie elencate non costituiscono disponibilità in tempo reale.</p><details open><summary>Il capo, nel dettaglio</summary><p class="ac-description">${e(p.descrizione)}</p></details></div></div>`);
  mediaItems=[...(p.video?[{type:'video',src:p.video}]:[]),...photos.map(src=>({type:'image',src}))];showMedia(0);
 }
 let mediaItems=[],mediaIndex=0;
 function showMedia(index){
  mediaIndex=(index+mediaItems.length)%mediaItems.length;
  const stage=mount.querySelector('[data-media-stage]'),item=mediaItems[mediaIndex];
  stage.querySelector('video')?.pause();stage.classList.remove('ac-no-image');
  stage.innerHTML=item.type==='video'?`<video autoplay muted loop playsinline preload="auto" poster="${e(safeURL(product.immagine_principale))}" aria-label="Video di ${e(product.nome)}" src="${e(safeURL(item.src))}"></video>`:image(item.src,product.nome,'data-main-photo');
  mount.querySelector('[data-gallery-position]').textContent=`${mediaIndex+1} / ${mediaItems.length}`;
  mount.querySelectorAll('.ac-thumbs button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===mediaIndex)));
  const video=stage.querySelector('video');if(video){video.muted=true;video.play().catch(()=>{stage.innerHTML=image(product.immagine_principale,product.nome,'data-main-photo');bindFallbacks();});video.addEventListener('error',()=>{stage.innerHTML=image(product.immagine_principale,product.nome,'data-main-photo');bindFallbacks();},{once:true});}bindFallbacks();
 }
 function updateSelection(){
  mount.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===color)));
  mount.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.size===size)));
  mount.querySelector('[data-color-label]').textContent=color;mount.querySelector('[data-size-label]').textContent=size||'da scegliere';
  mount.querySelector('[data-price]').textContent=priceLabel('prezzo');
  mount.querySelector('[data-custom-price]').textContent=priceLabel('prezzo_personalizzato');const qt=mount.querySelector('[data-qty]');if(qt)qt.innerHTML=qtyTable();
  mount.querySelectorAll('[data-personalization]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.personalization==='yes')===personalized)));
  mount.querySelector('[data-quote]').href=quote();
 }
 let swipeStart=null;
 mount.addEventListener('pointerdown',ev=>{
  if(ev.target.closest('[data-media-stage]'))swipeStart={x:ev.clientX,y:ev.clientY};
 },{passive:true});
 mount.addEventListener('pointerup',ev=>{
  if(swipeStart&&ev.target.closest('[data-media-stage]')){const dx=ev.clientX-swipeStart.x,dy=ev.clientY-swipeStart.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)showMedia(mediaIndex+(dx<0?1:-1));}swipeStart=null;
 },{passive:true});
 mount.addEventListener('pointercancel',()=>{swipeStart=null;},{passive:true});
 mount.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-home')){++request;home();scrollCatalog();}
  else if(b.hasAttribute('data-category')){category=b.dataset.category;sub='';q='';page=1;listing(true);}
  else if(b.hasAttribute('data-all')){category='';sub='';q='';page=1;listing(true);}
  else if(b.hasAttribute('data-sub')){sub=b.dataset.sub;page=1;listing();}
  else if(b.hasAttribute('data-page')){page+=Number(b.dataset.page);listing(true);}
  else if(b.hasAttribute('data-sku'))detail(b.dataset.sku);
  else if(b.hasAttribute('data-list')||b.hasAttribute('data-retry'))listing(true);
  else if(b.hasAttribute('data-video'))showMedia(0);
  else if(b.hasAttribute('data-gallery-step'))showMedia(mediaIndex+Number(b.dataset.galleryStep));
  else if(b.hasAttribute('data-photo'))showMedia(mediaItems.findIndex(x=>x.src===b.dataset.photo));
  else if(b.hasAttribute('data-color')){color=b.dataset.color;updateSelection();const c=product.colori.find(c=>c.nome===color);if(c?.immagine){let i=mediaItems.findIndex(x=>x.src===c.immagine);if(i>=0)showMedia(i);}}
  else if(b.hasAttribute('data-size')){size=b.dataset.size;updateSelection();}
  else if(b.hasAttribute('data-personalization')){personalized=b.dataset.personalization==='yes';updateSelection();}
 });
 mount.addEventListener('submit',ev=>{ev.preventDefault();q=new FormData(ev.target).get('q')||'';page=1;if(/^(atomic(?:\s*150)?|ca6424)$/i.test(q.trim()))detail(meta.special.sku);else listing();});
 async function start(){if(started)return;started=true;mount.innerHTML='<p role="status">Prepariamo il tuo catalogo…</p>';try{meta=await api();home();}catch{started=false;mount.innerHTML='<p role="alert">Catalogo non disponibile.</p><button data-init>Riprova</button>';}}
 mount.addEventListener('click',e=>{if(e.target.closest('[data-init]'))start();});
 const observer=new MutationObserver(()=>{if(room.classList.contains('is-active'))start();});observer.observe(room,{attributes:true,attributeFilter:['class']});
 if(room.classList.contains('is-active'))start();
}
