// Only the active card loads video. A canceled interaction cannot reveal late media.
export function bindPreviews(root){
 const cards=[...root.querySelectorAll('[data-preview-card]')];
 let active=null,disposeActive=()=>{},lastTouch=null;
 const stop=()=>{disposeActive();disposeActive=()=>{};active=null;};
 function start(card){
  if(active===card)return;
  stop();active=card;let live=true,elapsed=false,ready=false,video=null,playing=false;
  const box=card.querySelector('.ac-preview'),back=box.querySelector('.ac-back-photo');
  card.classList.add('ac-peek');
  const showBack=()=>{if(live)card.classList.add('ac-back-ready');};
  if(back){back.loading='eager';if(back.complete&&back.naturalWidth)showBack();else back.addEventListener('load',showBack,{once:true});}
  const play=()=>{if(!live||!elapsed||!ready||playing)return;playing=true;video.play().catch(()=>{playing=false;});};
  const timer=setTimeout(()=>{elapsed=true;play();},650);
  if(card.dataset.previewVideo){
   video=document.createElement('video');video.className='ac-preview-video';video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-hidden','true');video.setAttribute('playsinline','');
   video.addEventListener('canplay',()=>{ready=true;play();});
   video.addEventListener('playing',()=>{if(live)card.classList.add('ac-video-ready');else video.pause();});
   video.addEventListener('error',()=>{if(live)card.classList.remove('ac-video-ready');});
   box.append(video);video.src=card.dataset.previewVideo;video.load();
  }
  disposeActive=()=>{live=false;clearTimeout(timer);back?.removeEventListener('load',showBack);card.classList.remove('ac-peek','ac-back-ready','ac-video-ready');if(video){video.pause();video.removeAttribute('src');video.load();video.remove();}};
 }
 const listeners=[];
 function on(target,type,fn,opts){target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));}
 for(const card of cards){
  on(card,'pointerenter',ev=>{if(ev.pointerType==='mouse')start(card);});
  on(card,'pointerleave',ev=>{if(ev.pointerType==='mouse'&&active===card)stop();});
  on(card,'focus',()=>{if(card.matches(':focus-visible'))start(card);});
  on(card,'blur',()=>{if(active===card)stop();});
 }
 on(root,'pointerdown',ev=>{lastTouch=ev.pointerType==='touch'?ev.target.closest('[data-preview-card]'):null;},{passive:true});
 on(root,'pointercancel',()=>{lastTouch=null;},{passive:true});
 on(root,'click',ev=>{const card=ev.target.closest('[data-preview-card]');if(card&&lastTouch===card&&active!==card&&(card.dataset.previewVideo||card.querySelector('.ac-back-photo'))){ev.preventDefault();ev.stopImmediatePropagation();start(card);}lastTouch=null;},true);
 on(document,'pointerdown',ev=>{if(active&&!active.contains(ev.target))stop();},{passive:true});
 on(document,'visibilitychange',()=>{if(document.hidden)stop();});
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.target===active&&!e.isIntersecting)stop();});cards.forEach(c=>observer.observe(c));
 const room=root.closest('.moi-room');const roomObserver=new MutationObserver(()=>{if(!room.classList.contains('is-active'))stop();});if(room)roomObserver.observe(room,{attributes:true,attributeFilter:['class']});
 return ()=>{stop();observer.disconnect();roomObserver.disconnect();listeners.forEach(fn=>fn());};
}
