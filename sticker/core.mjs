import {validateContent,publicContent} from './content-core.mjs';
export const PHONE = "393278815148";
export const CART_KEY = "moilab-sticker-request-v2";
export const MAX_ITEMS = 30;
const fail = msg => {throw new Error(msg)};
const text = (v,max=120) => typeof v === "string" ? v.replace(/[\u0000-\u001f]/g," ").trim().slice(0,max) : "";
const id = v => typeof v === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(v) ? v : fail("Identificativo non valido.");
const bool = v => v === true;
const list = (v,max=80) => Array.isArray(v) ? [...new Set(v.map(x=>text(x,max)).filter(Boolean))].slice(0,50) : [];
export function ready(p){return p.materials.length>0 && (p.sizes.length>0||p.allowCustomSize) && (p.quantities.length>0||p.allowCustomQuantity);}
export function validateCatalog(raw, allowImage = url=>/^\/api\/sticker\/media\/[a-f0-9-]+\.(png|jpg|webp)$/.test(url)){
 if(!raw||!Array.isArray(raw.categories)||!Array.isArray(raw.products)||raw.categories.length>100||raw.products.length>500)fail("Catalogo non valido o troppo grande.");
 const categories=raw.categories.map(c=>({id:id(c.id),parentId:c.parentId?id(c.parentId):null,name:text(c.name,90),description:text(c.description,600),active:bool(c.active)}));
 const products=raw.products.map(p=>{
 const minQuantity=Number(p.minQuantity);if(!Number.isInteger(minQuantity)||minQuantity<1||minQuantity>1000000)fail("La quantità minima deve essere un intero positivo.");
 const quantities=Array.isArray(p.quantities)?[...new Set(p.quantities.map(Number))]:[];
 if(quantities.length>50||quantities.some(q=>!Number.isInteger(q)||q<minQuantity||q>1000000))fail("Controlla le quantità: devono essere interi almeno pari al minimo.");
 const imageUrl=text(p.imageUrl,500);if(imageUrl&&!allowImage(imageUrl))fail("Immagine prodotto non valida: caricala dal pannello.");
 return {id:id(p.id),categoryId:id(p.categoryId),name:text(p.name,120),description:text(p.description,1600),active:bool(p.active),imageUrl,sizes:list(p.sizes),materials:list(p.materials),quantities,allowCustomSize:bool(p.allowCustomSize),allowCustomQuantity:bool(p.allowCustomQuantity),minQuantity};
 });
 if(new Set(categories.map(x=>x.id)).size!==categories.length||new Set(products.map(x=>x.id)).size!==products.length)fail("Identificativi duplicati.");
 const map=new Map(categories.map(c=>[c.id,c]));
 for(const c of categories){if(!c.name)fail("Ogni categoria deve avere un nome.");let x=c,seen=new Set();while(x){if(seen.has(x.id))fail("Una categoria non può contenere se stessa.");seen.add(x.id);if(x.parentId&&!map.has(x.parentId))fail("Categoria superiore inesistente.");x=map.get(x.parentId);}}
 for(const p of products){if(!p.name||!map.has(p.categoryId))fail("Ogni prodotto deve avere nome e categoria validi.");if(p.active&&!ready(p))fail(p.name+": configura materiali, dimensioni e quantità prima di attivarlo.");}
 const visual=raw.customVisual||{};
 const imageUrl=text(visual.imageUrl,500);if(imageUrl&&!allowImage(imageUrl))fail("Immagine showroom non valida.");
 const clamp=(v,d,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):d;
 const customVisual={imageUrl,mode:["default","image","empty"].includes(visual.mode)?visual.mode:"default",fit:visual.fit==="cover"?"cover":"contain",x:clamp(visual.x,50,0,100),y:clamp(visual.y,50,0,100),scale:clamp(visual.scale,100,50,160)};
 if(customVisual.mode==="image"&&!imageUrl)fail("Carica un’immagine prima di pubblicarla.");
 return {categories,products,customVisual,...validateContent(raw,allowImage)};
}
export function visibleCategory(c,catalog){const seen=new Set();while(c){if(!c.active||seen.has(c.id))return false;seen.add(c.id);c=catalog.categories.find(x=>x.id===c.parentId);}return true;}
export function publicCatalog(catalog){const categories=catalog.categories.filter(c=>visibleCategory(c,catalog)),ids=new Set(categories.map(c=>c.id));return {...publicContent(catalog),customVisual:catalog.customVisual,categories,products:catalog.products.filter(p=>p.active&&ready(p)&&ids.has(p.categoryId))};}
export function categoryPath(id,catalog){const parts=[],seen=new Set();let c=catalog.categories.find(x=>x.id===id);while(c&&!seen.has(c.id)){seen.add(c.id);parts.unshift(c.name);c=catalog.categories.find(x=>x.id===c.parentId);}return parts.join(" / ");}
export function checkLine(line,catalog){
 const p=publicCatalog(catalog).products.find(x=>x.id===line.productId);
 if(!p)return "Prodotto non più disponibile. Rimuovilo dalla richiesta.";
 if(!p.materials.includes(line.material))return "Il materiale è cambiato: modifica la configurazione.";
 const custom=String(line.size).match(/^(\d+(?:\.\d+)?) × (\d+(?:\.\d+)?) cm$/);
 const validCustom=p.allowCustomSize&&custom&&Number(custom[1])>0&&Number(custom[2])>0&&Number(custom[1])<=1000&&Number(custom[2])<=1000;
 if(!p.sizes.includes(line.size)&&!validCustom)return "Le dimensioni sono cambiate: modifica la configurazione.";
 const q=Number(line.quantity);
 if(!Number.isInteger(q)||q<p.minQuantity||q>1000000||(!p.allowCustomQuantity&&!p.quantities.includes(q)))return "La quantità non è disponibile: modifica la configurazione.";
 return "";
}
export function whatsappText(cart,catalog){return ["Buongiorno MoiLab!","","Vorrei richiedere un preventivo per questi prodotti:","",...cart.flatMap((line,i)=>{const p=catalog.products.find(x=>x.id===line.productId);return ["PRODOTTO "+(i+1),"Categoria: "+categoryPath(p.categoryId,catalog),"Tipo: "+p.name,"Dimensioni: "+line.size,"Materiale: "+line.material,"Quantità: "+line.quantity+" pezzi","Design: "+(text(line.fileName,180)||"Da definire"),""];}),"Vorrei conoscere prezzo, tempi di realizzazione ed eventuali opzioni disponibili.","Allegherò manualmente i design in questa conversazione.","","Grazie!"].join("\n");}
export function whatsappURL(cart,catalog){if(!cart.length||cart.some(l=>checkLine(l,catalog)))return "";return "https://wa.me/"+PHONE+"?text="+encodeURIComponent(whatsappText(cart,catalog));}
export function cleanCart(value){if(!Array.isArray(value))return [];return value.slice(0,MAX_ITEMS).filter(x=>x&&typeof x.productId==="string").map(x=>({id:text(x.id,80)||Math.random().toString(36).slice(2),productId:text(x.productId,80),name:text(x.name),size:text(x.size,80),material:text(x.material,80),quantity:Number(x.quantity)||1,fileName:text(x.fileName,180)}));}
export function imageType(bytes){if(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10)return ["png","image/png"];if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return ["jpg","image/jpeg"];if(String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP")return ["webp","image/webp"];return null;}

