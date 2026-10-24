import {startTranslations} from '/assets/i18n.mjs';
import {config} from './ui.mjs';
const root=document.getElementById('moi-sticker-app');
const run=config.mode==='admin'?import('./admin.mjs').then(m=>m.startAdmin(root)):import('./shop.mjs').then(m=>m.startShop(root));
run.catch(()=>{root.innerHTML='<p class="ms-loading">Impossibile aprire il catalogo. Ricarica la pagina.</p>';});

if(config.mode!=='admin')startTranslations();
