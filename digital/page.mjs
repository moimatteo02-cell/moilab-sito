import {openProjectWizard} from './project-wizard.mjs?v=20261027-1';
import {projectObjectives} from './project-core.mjs';
import {serviceIcon} from './service-icons.mjs';
import {mountSoftware} from './library.mjs';
import {pixelIcon,escapeHTML as e} from './icons.mjs';
let browser;
const descriptions={'Siti web':'Presenta la tua attività con un sito chiaro, curato e semplice da utilizzare.','Applicazioni':'Strumenti costruiti intorno al tuo modo di lavorare: prenotazioni, configuratori e gestione delle richieste.','E-commerce':'Un percorso di acquisto pensato per i tuoi prodotti, dalle varianti al carrello.','Automazioni':'Colleghiamo strumenti e passaggi ripetitivi per semplificare il lavoro della tua attività.'};
export function initDigital(){
 const room=document.querySelector('#moi-showroom-digital');if(!room)return;
 room.querySelector('[data-digital-explore]').disabled=true;
 const project=room.querySelector('[data-digital-project]');if(project)project.onclick=()=>openProjectWizard(project);
 room.querySelectorAll('[data-digital-icon]').forEach(b=>{
  if(!b.querySelector('.md-service-icon'))b.insertAdjacentHTML('afterbegin',serviceIcon(b.dataset.digitalIcon));
  b.setAttribute('aria-expanded','false');
  b.onclick=()=>{
   b.classList.remove('md-selected-motion');void b.offsetWidth;b.classList.add('md-selected-motion');
   const name=b.dataset.digitalService;
   room.querySelectorAll('[data-digital-service]').forEach(x=>x.setAttribute('aria-expanded',String(x===b)));
   const detail=room.querySelector('[data-digital-detail]');detail.hidden=false;
   detail.innerHTML=`<div><h3>${e(name)}</h3><p>${e(descriptions[name])}</p></div><button type="button" class="md-primary md-project-cta" data-service-project>Raccontaci il progetto ↗</button>`;
   const action=detail.querySelector('[data-service-project]');action.onclick=()=>openProjectWizard(action,name);
  };
 });
 room.querySelectorAll('[data-digital-objective]').forEach(button=>{
  const objective=projectObjectives.find(o=>o.key===button.dataset.digitalObjective);if(!objective)return;
  if(!button.querySelector('.md-service-icon'))button.insertAdjacentHTML('afterbegin',serviceIcon(objective.key));
  button.onclick=()=>{
   button.classList.remove('md-choice-pulse');void button.offsetWidth;button.classList.add('md-choice-pulse');
   const service=room.querySelector('[data-digital-service][aria-expanded="true"]')?.dataset.digitalService;
   openProjectWizard(button,service,objective.key);
  };
 });
}
export function loadDigital(data){const root=document.querySelector('#moi-digital-software');browser=mountSoftware(root,data);const b=document.querySelector('[data-digital-explore]');if(b){b.disabled=false;b.onclick=()=>browser.showAll()}}
export function failDigital(){const root=document.querySelector('#moi-digital-software');if(root){root.innerHTML='<div class="md-load-error"><h2>I software non sono disponibili in questo momento.</h2><p>Riprova a caricare la raccolta.</p><button type="button">Riprova</button></div>';root.querySelector('button').onclick=async()=>{try{const r=await fetch(window.MOI_STICKER_CONFIG?.digitalApiBase?window.MOI_STICKER_CONFIG.digitalApiBase+'/catalog':'/api/sticker/catalog');if(!r.ok)throw Error();loadDigital((await r.json()).catalog.digitalSoftware)}catch{failDigital()}}}}
