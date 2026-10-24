const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const comparisonDefaults={before:'',after:'',enabled:true,demonstration:true,fit:'contain',x:50,y:50};
export function comparisonHTML(raw={}){
 const v={...comparisonDefaults,...raw};
 return `<figure class="ma-comparison"><div class="ma-compare-frame" style="--split:50%;--compare-fit:${v.fit==='cover'?'cover':'contain'};--compare-position:${Number(v.x??50)}% ${Number(v.y??50)}%"><img class="ma-compare-after" src="${e(v.after||'/automotive/demo/after.png')}" alt="Veicolo dopo la personalizzazione" draggable="false"><img class="ma-compare-before" src="${e(v.before||'/automotive/demo/before.png')}" alt="Veicolo prima della personalizzazione" draggable="false"><span class="ma-compare-label ma-before-label">Prima</span><span class="ma-compare-label ma-after-label">Dopo</span><span class="ma-compare-divider" aria-hidden="true"><span>‹ ›</span></span><input type="range" min="0" max="100" value="50" step="1" aria-label="Confronto Prima e Dopo" aria-valuetext="50% Prima, 50% Dopo"><p class="ma-compare-error" role="status" hidden>Impossibile caricare una delle immagini.</p></div><figcaption>Trascina per scoprire la trasformazione${v.demonstration||!v.before||!v.after?' · Esempio dimostrativo generato con AI':''}</figcaption></figure>`;
}
export function wireComparison(root){root.querySelectorAll('.ma-compare-frame').forEach(frame=>{
 const input=frame.querySelector('input');const update=()=>{frame.style.setProperty('--split',input.value+'%');input.setAttribute('aria-valuetext',input.value+'% Prima, '+(100-input.value)+'% Dopo');};input.addEventListener('input',update);
 let active=null,dragging=false;
 const move=ev=>{const rect=frame.getBoundingClientRect();if(rect.width){input.value=Math.round(Math.max(0,Math.min(100,(ev.clientX-rect.left)/rect.width*100)));update();}};
 const capture=ev=>{try{input.setPointerCapture?.(ev.pointerId)}catch{}};
 input.addEventListener('pointerdown',ev=>{if(ev.pointerType==='mouse'&&ev.button!==0)return;active={id:ev.pointerId,x:ev.clientX,y:ev.clientY};dragging=false;if(ev.pointerType==='mouse')capture(ev);});
 input.addEventListener('pointermove',ev=>{if(!active||active.id!==ev.pointerId)return;const dx=ev.clientX-active.x,dy=ev.clientY-active.y;if(!dragging){if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;if(Math.abs(dx)<=Math.abs(dy)*1.15){if(Math.abs(dy)>Math.abs(dx)*1.15)active=null;return;}dragging=true;capture(ev);input.focus({preventScroll:true});}ev.preventDefault();move(ev);},{passive:false});
 input.addEventListener('pointerup',ev=>{if(!active||active.id!==ev.pointerId)return;if(!dragging)move(ev);active=null;dragging=false;});
 for(const type of ['pointercancel','lostpointercapture'])input.addEventListener(type,()=>{active=null;dragging=false;});
 frame.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{frame.querySelector('.ma-compare-error').hidden=false;input.disabled=true;}));
 });}
export function mountComparison(root,v){if(!root)return;root.hidden=v?.enabled===false;root.innerHTML=root.hidden?'':comparisonHTML(v);wireComparison(root);}
