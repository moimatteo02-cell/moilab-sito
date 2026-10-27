import {refreshPrivateTools} from '/digital/access.mjs';
import {initDigital,loadDigital,failDigital} from '/digital/page.mjs?v=20261027-1';
initDigital();
import {mountComparison} from '/automotive/comparison.mjs?v=20261021-1';
import {minimalIcon,presetIcons} from '/automotive/icons.mjs';
window.MOI_MINIMAL_ICONS=Object.fromEntries(presetIcons.map(([k])=>[k,minimalIcon(k)]));
import {categoryIcon} from '/sticker/icons.mjs';
import {startTranslations} from './i18n.mjs';
import {mountWizard} from '/automotive/wizard.mjs?v=20261027-1';
import {mountGallery} from '/automotive/gallery.mjs';
const entry=document.querySelector('.moi-sticker-entry');if(entry)entry.insertAdjacentHTML('afterbegin',categoryIcon('Sticker'));
document.getElementById('year').textContent=new Date().getFullYear();
startTranslations();
const wizard=document.querySelector('#moi-auto-form');if(wizard)mountWizard(wizard);
document.querySelector('[data-auto-start]')?.addEventListener('click',ev=>{ev.preventDefault();wizard.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
fetch('/api/sticker/catalog',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(({catalog:c})=>{
 mountComparison(document.querySelector('#moi-auto-comparison'),c.automotiveComparison);
 loadDigital(c.digitalSoftware);
 const defaults={mode:'default',imageUrl:'',fit:'contain',x:50,y:50,scale:100};window.MOI_VISUALS={custom:c.customVisual||defaults,automotive:c.automotiveVisual||defaults};
 const fallbackImages={apparel:'/assets/moi-lab-abbigliamento.webp',custom:'/assets/moi-lab-custom.webp',automotive:'/assets/moi-lab-automotive.webp',signage:'/assets/moi-lab-signage.webp',design:'/assets/moi-lab-design.webp',digital:'/assets/moi-lab-digital.webp'};
 for(const [k,v] of Object.entries(c.homeCards||{})){const card=document.querySelector(`.mlg-card[data-moi-category="${k}"]`);if(!card)continue;const photo=card.querySelector('.mlg-photo'),empty=card.querySelector('.mlg-placeholder');photo.hidden=v.mode!=='image'&&v.mode!=='default';if(empty)empty.hidden=v.mode==='image'||v.mode==='empty'||v.mode==='default';if(v.mode==='image'&&v.imageUrl)photo.src=v.imageUrl;else if(v.mode==='default'&&fallbackImages[k])photo.src=fallbackImages[k];photo.style.objectFit=v.fit;photo.style.objectPosition=v.x+'% '+v.y+'%';photo.style.transform=`scale(${v.scale/100})`;if(v.title)card.querySelector('h2').textContent=v.title;if(v.subtitle)card.querySelector('.mlg-caption p').textContent=v.subtitle;if(v.intro)card.dataset.moiIntro=v.intro;}
 document.dispatchEvent(new CustomEvent('moilab:contentchange'));mountGallery(document.querySelector('#moi-auto-gallery'),c.portfolio);
}).catch(()=>{failDigital();document.querySelector('#moi-auto-gallery').innerHTML='<h2>I nostri lavori</h2><p>La galleria non è disponibile in questo momento. Ricarica la pagina per riprovare.</p>';}).finally(()=>{window.MOI_ASSETS_RESOLVE?.();});
refreshPrivateTools();
window.addEventListener('focus',refreshPrivateTools);
window.addEventListener('pageshow',refreshPrivateTools);
