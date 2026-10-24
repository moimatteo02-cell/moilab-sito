export function categoryIcon(name=''){
const n=name.toLowerCase();
let shape='<rect x="5" y="5" width="30" height="30" rx="7"/><path d="M26 35V26h9M13 15h13M13 21h7"/>';
if(n==='all')shape='<rect x="5" y="5" width="12" height="12" rx="3"/><rect x="23" y="5" width="12" height="12" rx="3"/><rect x="5" y="23" width="12" height="12" rx="3"/><rect x="23" y="23" width="12" height="12" rx="3"/>';
else if(n.includes('etichett'))shape='<path d="M5 8h17l13 13-14 14L5 19Z"/><circle cx="13" cy="15" r="2.5"/><path d="m20 21 7 7"/>';
else if(n.includes('decal'))shape='<path d="M6 12h26v22H6zM11 6h25v22"/><path d="m19 16 2.5 5 5.5.8-4 4 1 5.2-5-2.5-5 2.5 1-5.2-4-4 5.5-.8Z"/>';
else if(n.includes('adesiv'))shape='<path d="M34 23a15 15 0 1 0-11 11Z"/><path d="M23 34V23h11M14 15h.1M24 15h.1M14 21q5 6 10 0"/>';
return '<svg class="moi-category-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+shape+'</svg>';
}
