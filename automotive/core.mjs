import {imageType} from '../sticker/core.mjs';
export const services=['Wrapping parziale','Adesivi e decalcomanie','Loghi e scritte aziendali','Grafiche personalizzate','Adesivi per vetri e lunotto','Decorazioni interne','Altro / Non sono sicuro'];
export const vehicles=['Automobile','Moto','Scooter','Furgone','Camion','Camper','Altro'];
export const zones=['Cofano','Tetto','Fiancate','Portiere','Paraurti','Baule / Portellone','Vetri laterali','Lunotto','Cruscotto / Interni','Intero veicolo','Altra zona'];
export const finishes=['Lucido','Opaco','Satinato','Metallizzato','Rifrangente','Altro','Consigliatemi voi'];
export const measures=['Sì, conosco le misure','Più o meno','No, ho bisogno di assistenza'];
export const colors=['Un solo colore','Due o più colori','Grafica stampata a colori','Non sono sicuro'];
export const graphics=['Sì, ho già il file pronto','Ho alcune immagini di ispirazione','No, vorrei che MOI LAB sviluppasse la grafica'];
export function relevantZones(d){if(d.services?.length===1&&d.services[0]==='Decorazioni interne')return ['Cruscotto / Interni','Altra zona'];if(d.services?.length===1&&d.services[0]==='Adesivi per vetri e lunotto')return ['Vetri laterali','Lunotto','Altra zona'];if(['Moto','Scooter'].includes(d.vehicle))return ['Fiancate','Paraurti','Intero veicolo','Altra zona'];return zones;}
export function relevantFinishes(d){if(d.services?.length===1&&d.services[0]==='Altro / Non sono sicuro')return ['Consigliatemi voi'];return finishes.filter(f=>f!=='Rifrangente'||d.services?.some(s=>['Adesivi e decalcomanie','Loghi e scritte aziendali','Grafiche personalizzate'].includes(s)));}
export function normalize(raw){
 const s=(v,n=200)=>typeof v==='string'?v.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n):'';
 const one=(v,options)=>options.includes(v)?v:'';
 const many=(v,options)=>Array.isArray(v)?[...new Set(v.filter(x=>options.includes(x)))]:[];
 const number=v=>v===''||v===null||v===undefined?null:Number(v);
 const d={services:many(raw.services,services),vehicle:one(raw.vehicle,vehicles),brand:s(raw.brand,80),model:s(raw.model,100),year:s(raw.year,4),currentColor:s(raw.currentColor,80),vehicleCount:number(raw.vehicleCount),zones:many(raw.zones,zones),zoneOther:s(raw.zoneOther),measurement:one(raw.measurement,measures),width:number(raw.width),height:number(raw.height),stickerCount:number(raw.stickerCount),colorMode:one(raw.colorMode,colors),desiredColors:s(raw.desiredColors),finish:one(raw.finish,finishes),graphics:one(raw.graphics,graphics),notes:s(raw.notes,2000),name:s(raw.name,120),phone:s(raw.phone,40)};
 d.zones=d.zones.filter(z=>relevantZones(d).includes(z));
 if(d.measurement===measures[2])d.width=d.height=null;
 if(!relevantFinishes(d).includes(d.finish))d.finish='Consigliatemi voi';
 if(!d.services.some(s=>['Adesivi e decalcomanie','Loghi e scritte aziendali','Adesivi per vetri e lunotto'].includes(s)))d.stickerCount=null;
 return d;
}
export function validate(raw){const d=normalize(raw);if(!d.services.length)throw Error('Seleziona almeno un servizio.');if(!d.vehicle||!d.brand||!d.model||!Number.isInteger(d.vehicleCount)||d.vehicleCount<1||d.vehicleCount>1000)throw Error('Completa tipo, marca, modello e numero di veicoli.');if(d.year&&!/^(19|20)\d{2}$/.test(d.year))throw Error('Controlla l’anno.');if(!d.zones.length)throw Error('Seleziona almeno una zona.');if(!d.measurement)throw Error('Indica se conosci le misure.');if(d.measurement!==measures[2]&&(!(d.width>0&&d.width<=3000)||!(d.height>0&&d.height<=3000)))throw Error('Inserisci misure valide oppure richiedi assistenza.');if(d.stickerCount!==null&&(!Number.isInteger(d.stickerCount)||d.stickerCount<1||d.stickerCount>100000))throw Error('Controlla la quantità degli adesivi.');if(!d.colorMode||!d.graphics)throw Error('Completa colori e grafica.');if(!d.name||!/^\+?[0-9 ()-]{6,30}$/.test(d.phone))throw Error('Inserisci nome e recapito telefonico validi.');return d;}
export function summary(d){return [['Servizi',d.services.join(', ')],['Veicolo',[d.vehicle,d.brand,d.model,d.year].filter(Boolean).join(' ')],['Colore attuale',d.currentColor||'Da definire'],['Numero veicoli',d.vehicleCount],['Zone',d.zones.join(', ')+(d.zoneOther?' · '+d.zoneOther:'')],['Misure',d.measurement+(d.width?' · '+d.width+' × '+d.height+' cm':'')],['Quantità adesivi',d.stickerCount||'Da definire'],['Colori',d.colorMode+(d.desiredColors?' · '+d.desiredColors:'')],['Finitura richiesta',d.finish+' (da verificare)'],['Grafica',d.graphics],['Note',d.notes||'—'],['Nome',d.name],['Telefono',d.phone]];}
export function whatsapp(id,d,names){const text=['Buongiorno MOI LAB!','Richiesta Automotive #'+id,'',...summary(d).map(([k,v])=>k+': '+v),'','Allegati salvati nella richiesta: '+(names.join(', ')||'nessuno'),'Vorrei conoscere fattibilità, prezzo e tempi. Grazie!'].join('\n');return 'https://wa.me/393278815148?text='+encodeURIComponent(text);}
export function validSVG(source){
 // Accept a strict static SVG subset; no script, CSS, references to external resources or entities.
 source=source.replace(/^\s*<\?xml\s+version=["']1\.0["'](?:\s+encoding=["']UTF-8["'])?\s*\?>/i,'');
 if(source.length>2000000||/<!|&|<\?|url\(\s*(?!#[a-zA-Z0-9_-]+\s*\))/i.test(source))return false;
 const tags=new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','defs','linearGradient','radialGradient','stop','clipPath']);
 const allowed=new Set('xmlns viewBox width height x y x1 x2 y1 y2 cx cy r rx ry d points fill stroke stroke-width stroke-linecap stroke-linejoin stroke-miterlimit opacity fill-opacity stroke-opacity transform id offset stop-color stop-opacity gradientUnits gradientTransform spreadMethod fx fy clip-path fill-rule clip-rule preserveAspectRatio version'.split(' '));
 const stack=[];let pos=0,roots=0;const re=/<(\/?)([a-zA-Z]+)([^<>]*?)(\/?)>/g;let m;
 while(m=re.exec(source)){if(source.slice(pos,m.index).trim())return false;pos=re.lastIndex;const [,close,tag,attrs,self]=m;if(!tags.has(tag))return false;if(close){if(attrs.trim()||self||stack.pop()!==tag)return false;continue;}if(!stack.length){if(tag!=='svg'||roots++)return false;}let rest=attrs;const seen=new Set();while(rest.trim()){const a=rest.match(/^\s+([\w:-]+)\s*=\s*(["'])([^"'<>]*)\2/);if(!a||!allowed.has(a[1])||seen.has(a[1]))return false;seen.add(a[1]);if(a[1]==='xmlns'&&a[3]!=='http://www.w3.org/2000/svg')return false;if(/(?:https?:|data:|javascript:)/i.test(a[3])&&a[1]!=='xmlns')return false;rest=rest.slice(a[0].length);}if(!self)stack.push(tag);}
 return roots===1&&!stack.length&&!source.slice(pos).trim();
}
export function fileType(bytes,name){const image=imageType(bytes);if(image)return image;if(/\.pdf$/i.test(name)&&new TextDecoder().decode(bytes.slice(0,5))==='%PDF-')return ['pdf','application/pdf'];if(/\.svg$/i.test(name)&&validSVG(new TextDecoder().decode(bytes)))return ['svg','image/svg+xml'];throw Error('File non valido. SVG: usa solo forme statiche, senza script, stili o risorse esterne.');}
