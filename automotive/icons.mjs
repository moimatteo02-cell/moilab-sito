// One consistent line-icon family for choices and administrator presets.
const paths={
 car:'<path d="m5 17 3-8h16l3 8M3 17h26v9H3zM7 26v3m18-3v3M7 21h3m12 0h3M10 9l2-4h8l2 4"/>',
 moto:'<circle cx="7" cy="24" r="5"/><circle cx="26" cy="24" r="5"/><path d="m7 24 7-12h8l4 12M12 16h9l-5 8H7m14-12-2-5h5M9 11h6"/>',
 scooter:'<circle cx="7" cy="25" r="4"/><circle cx="26" cy="25" r="4"/><path d="M7 21v-6h8v10h7M26 21l-4-15h-5M5 15h11m5-5h5"/>',
 van:'<path d="M3 8h17l9 10v9H3zM20 8v11h9M5 13h10v7H5M18 23h2"/><circle cx="8" cy="27" r="3"/><circle cx="24" cy="27" r="3"/>',
 truck:'<path d="M2 6h18v19H2zM20 13h6l5 8v4H20M24 14v7h6"/><circle cx="8" cy="27" r="3"/><circle cx="25" cy="27" r="3"/>',
 camper:'<path d="M3 8h21v6h3l4 8v5H3zM7 12h7v6H7M18 14h5v13M26 17v5h5"/><circle cx="8" cy="27" r="3"/><circle cx="26" cy="27" r="3"/>',
 question:'<circle cx="16" cy="16" r="12"/><path d="M12 12a4 4 0 0 1 8 0c0 3-4 3-4 6m0 4v1"/>',
 wrap:'<path d="M5 5h21v15L15 29H5zM15 29V20h11M9 10h12M9 14h8"/>',
 sticker:'<path d="M27 18A12 12 0 1 0 18 28l10-10h-7a3 3 0 0 0-3 3v7"/><path d="M10 12h.1M20 12h.1M11 18q4 4 8 0"/>',
 logo:'<rect x="3" y="6" width="26" height="21" rx="3"/><path d="m8 22 5-11 5 11m-8-4h6m5-5h4m-4 5h4"/>',
 pen:'<path d="m7 24 2-7L23 3l6 6-14 14-8 1zM19 7l6 6M5 29h23"/>',
 window:'<path d="M5 6h22l3 20H2zM16 6v20M7 19l6-7m5 9 6-7"/>',
 seat:'<path d="M10 4h8v8h-8zM10 12v10h14v6H7V12m17 10 3-5"/>',
 ruler:'<path d="m3 23 20-20 7 7-20 20zM18 8l4 4m-8 0 3 3m-7 1 4 4M6 20l3 3"/>',
 approx:'<path d="M2 16q14-19 28 0Q16 35 2 16Z" fill="#e5ede8"/><circle cx="16" cy="16" r="6" fill="#83b69b"/><circle cx="16" cy="16" r="2" fill="#365347"/>',
 help:'<path d="M5 18v-3a11 11 0 0 1 22 0v3M5 16H2v9h6v-9zm22 0h3v9h-6v-9zM27 25q0 5-10 5"/>',
 mono:'<circle cx="16" cy="16" r="11" fill="#518ab2" stroke="#35617f"/>',
 palette:'<circle cx="11" cy="12" r="8" fill="#de8069" stroke="#ad5946"/><circle cx="22" cy="12" r="8" fill="#e6bc58" stroke="#b58d34"/><circle cx="16" cy="22" r="8" fill="#659dc1" stroke="#437896"/>',
 print:'<path d="M8 12V3h16v9M8 25H3V12h26v13h-5M8 20h16v10H8zM24 16h1"/>',
 shine:'<path d="m16 3 3 10 10 3-10 3-3 10-3-10-10-3 10-3z"/>',
 matte:'<rect x="5" y="5" width="22" height="22" rx="4"/><path d="M10 10h1m5 0h1m5 0h1M10 16h1m5 0h1m5 0h1M10 22h1m5 0h1m5 0h1"/>',
 satin:'<path d="M4 8q6-5 12 0t12 0M4 16q6-5 12 0t12 0M4 24q6-5 12 0t12 0"/>',
 metal:'<path d="m16 3 12 7v13l-12 7-12-7V10zM4 10l12 7 12-7M16 17v13"/>',
 reflect:'<path d="M16 5v22M5 10l8 6-8 6M20 10l8 6-8 6"/>',
 file:'<path d="M7 3h12l7 7v20H7zM19 3v8h7M11 18l4 4 7-7"/>',
 images:'<rect x="8" y="8" width="22" height="21" rx="2"/><path d="M24 5V2H2v22h3M10 25l6-7 5 5 4-4 4 6"/><circle cx="23" cy="14" r="2"/>',
 hood:'<path d="m8 5-4 22h24L24 5zM8 10h16M10 15h12v8H10z"/>',
 roof:'<path d="M7 4h18v25H7zM10 10h12v12H10zM10 7h12m-12 18h12"/>',
 side:'<path d="M3 17 8 9h13l8 8v9H3zM11 10v14m9-14v14M13 18h4"/>',
 door:'<path d="M7 4h15l5 12v13H7zM10 8h10l3 8H10zM19 21h4"/>',
 bumper:'<path d="M4 8h24v8H4zM2 19h28v8H2zM7 23h18"/>',
 boot:'<path d="M7 4h18l4 23H3zM9 8h14l2 10H7zM13 23h6"/>',
 plus:'<circle cx="16" cy="16" r="12"/><path d="M16 9v14M9 16h14"/>'
};
export const presetIcons=[['car','Automobile'],['moto','Moto'],['scooter','Scooter'],['van','Furgone'],['truck','Camion'],['camper','Camper'],['sticker','Sticker'],['logo','Logo e scritte'],['pen','Grafica']];
export function minimalIcon(key){if(vehicleArt[key])return vehicleIcon(key);return `<svg data-icon="${key}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key]||paths.question}</svg>`;}
const choiceKeys={services:['wrap','sticker','logo','pen','window','seat','question'],vehicle:['car','moto','scooter','van','truck','camper','other'],measurement:['ruler','approx','help'],colorMode:['mono','palette','print','question'],graphics:['file','images','pen']};
const zones={'Cofano':'hood','Tetto':'roof','Fiancate':'side','Portiere':'door','Paraurti':'bumper','Baule / Portellone':'boot','Vetri laterali':'window','Lunotto':'window','Cruscotto / Interni':'seat','Intero veicolo':'car','Altra zona':'plus'};
const finishes={'Lucido':'shine','Opaco':'matte','Satinato':'satin','Metallizzato':'metal','Rifrangente':'reflect','Altro':'plus','Consigliatemi voi':'help'};
export function choiceIcon(name,value,index){if(name==='zones')return zoneIcon(value);if(name==='finish')return finishIcon(value);return minimalIcon(name==='zones'?zones[value]:name==='finish'?finishes[value]:choiceKeys[name]?.[index]);}

// Filled silhouettes give small vehicle icons a recognizable body, not a bicycle frame.
const vehicleArt={
 moto:'<circle cx="13" cy="46" r="10" fill="#eff3f1"/><circle cx="51" cy="46" r="10" fill="#eff3f1"/><path d="M13 46 24 32l12 14H13m38 0-9-25-6-3m5 4 8-1"/><path d="m20 28 8-6 11 3 4 8-12 4-12-5Z" fill="#589476"/><path d="m8 27 13 1 5 5H12Z" fill="#33463d"/><path d="m26 37 9-1 4 8-10 2Z" fill="#8d9b94"/><path d="m33 48 11-1M8 35q7-5 14 1M44 35q9-3 14 3"/><circle cx="46" cy="25" r="3" fill="#f4d080"/>',
 scooter:'<circle cx="13" cy="47" r="9" fill="#eff3f1"/><circle cx="51" cy="47" r="9" fill="#eff3f1"/><path d="M5 39q0-13 13-13h7v13h13l3-10-4-10 7-2 8 28H24q-3-11-19-6Z" fill="#77a991"/><path d="M12 24h16v4H12Z" fill="#33463d"/><path d="M39 18v-7h8m-2 9 6 27M34 39h9M5 40q9-6 17 2M44 38q8-4 14 3"/><ellipse cx="45" cy="13" rx="5" ry="3" fill="#f4d080"/>',
 car:'<path d="M6 35 10 24l13-3 10-11h22l14 13 13 4 5 9v14H6Z" fill="#e0ebe4"/><path d="m28 22 8-8h17l10 9H28Z" fill="#a7c7ce"/><path d="M46 14v9m1 4v16M12 31h8m53 1h8M33 29h6"/><circle cx="23" cy="48" r="9" fill="#f5f6f2"/><circle cx="69" cy="48" r="9" fill="#f5f6f2"/><circle cx="23" cy="48" r="3" fill="#61786a"/><circle cx="69" cy="48" r="3" fill="#61786a"/>'
};
function svg(body,box='0 0 64 64'){return `<svg viewBox="${box}" fill="none" stroke="#365347" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;}
function zoneIcon(value){
 if(value==='Altra zona')return minimalIcon('plus');
 if(value==='Cruscotto / Interni')return svg('<path d="M5 41V22q27-14 54 0v19Z" fill="#dbe7df"/><path d="M9 28h16m14-4h13v10H39z"/><circle cx="23" cy="40" r="13" fill="#83b69b"/><circle cx="23" cy="40" r="4"/><path d="m11 36 12 4 11-4m-11 4v12M43 40h12"/>');
 const panels={
 'Cofano':'<path d="M20 11q12-5 24 0v9H20Z"/>',
 'Tetto':'<rect x="23" y="27" width="18" height="16" rx="3"/>',
 'Fiancate':'<path d="M15 23h5v25h-5zm29 0h5v25h-5Z"/>',
 'Portiere':'<path d="M16 27h5v16h-5zm27 0h5v16h-5Z"/>',
 'Paraurti':'<path d="M20 7q12-5 24 0v5H20Zm0 43h24v6H20Z"/>',
 'Baule / Portellone':'<path d="M21 47h22v8H21Z"/>',
 'Vetri laterali':'<path d="m18 25 3 2v13l-3 3Zm28 0-3 2v13l3 3Z"/>',
 'Lunotto':'<path d="m23 43 18 0 3 5H20Z"/>',
 'Intero veicolo':'<path d="M19 9q13-7 26 0l4 15v24q0 10-17 10T15 48V24Z"/>'
 };
 return svg('<path d="M19 9q13-7 26 0l4 15v24q0 10-17 10T15 48V24Z" fill="#e6ece8"/><path d="m21 21 22 0-3 6H24Zm3 22h16l4 5H20ZM21 28v13m22-13v13" stroke="#9aaa9f"/><g fill="#dfad54" stroke="#91652a" stroke-width="1.7">'+(panels[value]||'')+'</g><path d="M12 26h3m34 0h3"/>');
}
let swatchSequence=0;
function finishIcon(value){
 if(!['Lucido','Opaco','Satinato','Metallizzato','Rifrangente'].includes(value))return minimalIcon(finishes[value]);
 const id='ma-swatch-'+(++swatchSequence);
 const stops=value==='Lucido'?'#204c71;#79c7ed;#f3fbff;#367ca9':value==='Satinato'?'#637e9b;#a6b8ca;#748ea9':value==='Metallizzato'?'#545f6a;#e3e8ed;#8b98a5;#d9e2e9':'#647c96;#647c96';
 let body=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stops.split(';').map((c,i,a)=>`<stop offset="${i/(a.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs><rect x="8" y="8" width="48" height="48" rx="12" fill="url(#${id})" stroke="#596f81"/>`;
 if(value==='Lucido')body+='<path d="m17 30 16-15m-9 24 18-18" stroke="#fff" stroke-width="3"/>';
 if(value==='Satinato')body+='<path d="M16 20h32M16 26h32M16 32h32M16 38h32M16 44h32" stroke="#d7e1ed" opacity=".45" stroke-width="1"/>';
 if(value==='Metallizzato')body+='<g fill="#fff" stroke="none"><circle cx="19" cy="20" r="1.5"/><circle cx="39" cy="17" r="1"/><circle cx="27" cy="40" r="1.5"/><circle cx="45" cy="33" r="1.5"/><circle cx="41" cy="47" r="1"/><circle cx="18" cy="47" r="1"/></g>';
 if(value==='Rifrangente')body+='<path d="m12 35 18-14 9 12 13-10v14L38 49l-9-12-17 13Z" fill="#e9ee9c" stroke="#faffc5"/><path d="m43 5 1 7m11-3-5 6m10 4-7 1" stroke="#c29c38"/>';
 return svg(body).replace('<svg ',`<svg data-icon="${finishes[value]}" `);
}
export function vehicleSketch(vehicle){const key=vehicle==='Moto'?'moto':vehicle==='Scooter'?'scooter':vehicle==='Automobile'?'car':presetIcons.find(([,label])=>label===vehicle)?.[0]||'other';return minimalIcon(key);}

function vehicleIcon(key){
 const wide=['car','van','truck','camper','other'].includes(key);
 const body=vehicleArt[key].replace(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"([^>]*)\/>/g,(all,x,y,r,rest)=>Number(y)>=40&&Number(r)>=8?`<g class="ma-wheel">${all}<path d="M${Number(x)-5} ${y}h10m-5-5v10" stroke="#75877d" stroke-width="1.4"/></g>`:all);
 return svg(`<g class="ma-road" stroke="#93aa9a"><path d="M4 60h12m9 0h12m9 0h12${wide?'m9 0h12':''}"/></g><g class="ma-vehicle-body">${body}</g>`,wide?'0 0 94 68':'0 0 64 68').replace('<svg ',`<svg data-icon="vehicle" data-vehicle="${key}" `);
}
const fleetWheels='<circle cx="22" cy="48" r="9" fill="#f5f6f2"/><circle cx="73" cy="48" r="9" fill="#f5f6f2"/>';
vehicleArt.van='<path d="M5 48V14q0-4 5-4h48l17 16 12 5v17Z" fill="#c9ded1"/><path d="M60 15v14h18L65 15Z" fill="#a7c7ce"/><path d="M14 18h30v15H14Z" fill="#a7c7ce"/><path d="M51 14v30m8-9h5"/>'+fleetWheels;
vehicleArt.truck='<path d="M5 7h51v39H5Z" fill="#c9ded1"/><path d="M56 21h19l13 15v12H56Z" fill="#7fa58d"/><path d="M62 25h10l9 12H62Z" fill="#b8d2d5"/><path d="M12 15h37m-37 7h37m-37 7h37" stroke="#9bb9a6"/>'+fleetWheels;
vehicleArt.camper='<path d="M5 48V11h65v10h-9v8h18l9 9v10Z" fill="#dce5db"/><path d="M13 18h19v13H13Z" fill="#a7c7ce"/><path d="M39 19h14v29M64 32h11l7 8H64Z" fill="#b7ced1"/><path d="M8 37h26m9-4h3"/>'+fleetWheels;
vehicleArt.other='<path d="M6 29h16l11-14h25l15 14h13v19H6Z" fill="#c9ded1"/><path d="m29 28 8-9h18l10 9Z" fill="#a7c7ce"/><path d="M44 33h9m-5-4v9"/>'+fleetWheels;
paths.pen='<path class="ma-ink" pathLength="1" d="M3 28q5-7 10-2t15-2" stroke="#4b8e76"/><g class="ma-pencil"><path d="m8 23 2-7L23 3l6 6-14 14-7 0Z" fill="#e3be73"/><path d="m19 7 6 6M8 23l2-7 5 7Z" fill="#6c9581"/></g>';
paths.wrap='<rect x="5" y="5" width="23" height="23" rx="5" fill="#d3e5da"/><path class="ma-film" d="M5 5h23v13L17 28H5Z" fill="#7fb397"/><path d="M17 28V18h11" fill="#f0d8a8"/>';
paths.sticker='<path d="M27 18A12 12 0 1 0 18 28l10-10" fill="#eed39a"/><path class="ma-peel" d="M28 18h-7a3 3 0 0 0-3 3v7Z" fill="#fff5df"/><path d="M10 12h.1M20 12h.1M11 18q4 4 8 0"/>';
paths.logo='<rect x="3" y="6" width="26" height="21" rx="4" fill="#d6e7de"/><g class="ma-letter"><path d="m8 22 5-11 5 11m-8-4h6m5-5h4m-4 5h4"/></g>';
paths.window='<path d="M5 6h22l3 20H2Z" fill="#bad4dd"/><path d="M16 6v20"/><path class="ma-glint" d="m7 19 6-7m5 9 6-7" stroke="#fff" stroke-width="2.5"/>';
paths.seat='<g class="ma-seat"><path d="M10 4h8v8h-8Z" fill="#c6dcca"/><path d="M10 12v10h14v6H7V12Z" fill="#8cb49c"/><path d="m24 22 3-5"/></g>';
paths.print='<path d="M8 12V3h16v9M8 25H3V12h26v13h-5" fill="#cee0d6"/><g class="ma-paper"><path d="M8 20h16v10H8Z" fill="#fff"/><path d="M11 24h3" stroke="#dc896a"/><path d="M17 24h4" stroke="#668dbb"/><path d="M11 27h10" stroke="#b59b48"/></g><path d="M24 16h1"/>';
