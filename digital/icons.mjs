import {serviceIcon} from './service-icons.mjs';
export function pixelIcon(key='blocks'){if(key==='moi')return `<img class="md-pixel md-brand-icon" src="${new URL('./moi-pixel.svg',import.meta.url).href}" alt="">`;return serviceIcon(key);}
export const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
