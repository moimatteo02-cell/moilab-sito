import {validateSoftware,publicSoftware} from '../digital/core.mjs';
import {presetIcons} from '../automotive/icons.mjs';
export const sections=['apparel','custom','automotive','signage','design','digital'];
export const visualDefaults={mode:'default',imageUrl:'',fit:'contain',x:50,y:50,scale:100};
const clean=(v,max=160)=>typeof v==='string'?v.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):'';
export function validateContent(raw,allowImage){
 const visual=v=>{v=v||{};const url=clean(v.imageUrl,500);if(url&&!allowImage(url))throw Error('Immagine non valida: scegli dalla libreria.');const mode=['image','empty','default','icon'].includes(v.mode)?v.mode:'default';if(mode==='image'&&!url)throw Error('Scegli un’immagine prima di pubblicare.');const n=(k,d,min,max)=>Number.isFinite(Number(v[k]))?Math.max(min,Math.min(max,Number(v[k]))):d;return {mode,icon:presetIcons.some(([k])=>k===v.icon)?v.icon:'car',imageUrl:url,fit:v.fit==='cover'?'cover':'contain',x:n('x',50,0,100),y:n('y',50,0,100),scale:n('scale',100,50,160)};};
 const homeCards={};for(const k of sections){const c=raw.homeCards?.[k];if(c)homeCards[k]={...visual(c),title:clean(c.title,32),subtitle:clean(c.subtitle,64),intro:clean(c.intro,600)};}
 const automotiveVisual=visual(raw.automotiveVisual);
 const cmp=raw.automotiveComparison||{};const before=clean(cmp.before,500),after=clean(cmp.after,500);if([before,after].some(u=>u&&!allowImage(u)))throw Error('Foto Prima/Dopo non valida: scegli dalla libreria.');
 const position=k=>Number.isFinite(Number(cmp[k]))?Math.max(0,Math.min(100,Number(cmp[k]))):50;
 const automotiveComparison={before,after,enabled:cmp.enabled!==false,demonstration:cmp.demonstration!==false,fit:cmp.fit==='cover'?'cover':'contain',x:position('x'),y:position('y')};
 const portfolio=raw.portfolio||{categories:[],projects:[]};if(!Array.isArray(portfolio.categories)||!Array.isArray(portfolio.projects)||portfolio.projects.length>100||portfolio.categories.length>40)throw Error('Galleria troppo grande.');
 const categories=[...new Set(portfolio.categories.map(c=>clean(c,60)).filter(Boolean))];
 const seen=new Set();const projects=portfolio.projects.map(p=>{const id=clean(p.id,80);if(!/^[a-zA-Z0-9_-]+$/.test(id)||seen.has(id))throw Error('Identificativo progetto non valido.');seen.add(id);const images=Array.isArray(p.images)?p.images.map(u=>clean(u,500)):[];if(images.length>20||images.some(u=>!allowImage(u)))throw Error('Immagini della galleria non valide.');const category=clean(p.category,60),title=clean(p.title,120);if(category&&!categories.includes(category))throw Error('Categoria progetto non valida.');if(p.active&&(!title||!images.length))throw Error('Per pubblicare un progetto servono titolo e almeno una foto.');return {id,title,description:clean(p.description,1000),category,images,active:p.active===true};});
 const lim=raw.uploadSettings||{};const bounded=(v,d,max)=>{if(v===undefined)return d;if(!Number.isInteger(Number(v))||Number(v)<1||Number(v)>max)throw Error('Controlla i limiti degli allegati.');return Number(v);};
 return {digitalSoftware:validateSoftware(raw.digitalSoftware,allowImage),homeCards,automotiveVisual,automotiveComparison,portfolio:{categories,projects},uploadSettings:{maxFiles:bounded(lim.maxFiles,6,10),maxMB:bounded(lim.maxMB,10,15)}};
}
export function publicContent(c){return {digitalSoftware:publicSoftware(c.digitalSoftware),automotiveComparison:c.automotiveComparison,homeCards:c.homeCards,automotiveVisual:c.automotiveVisual,uploadSettings:c.uploadSettings||{maxFiles:6,maxMB:10},portfolio:{categories:c.portfolio?.categories||[],projects:(c.portfolio?.projects||[]).filter(p=>p.active&&p.images.length)}};}
