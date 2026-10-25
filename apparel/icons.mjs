// Icone MOI LAB — tratto sottile, 24x24, colore = currentColor (disegni originali).
const s = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;

export const ICONS = {
  // capi
  tshirt: s('M8.5 3 4 5 2 9.5l3 1.6 1-.8V21h12V10.3l1 .8 3-1.6L20 5l-4.5-2a3.5 3.5 0 0 1-7 0Z'),
  hoodie: s('M8.5 4.5C6.5 5.5 6 7 6 8.5L3 10.5l2 4 1-.7V21h12v-7.2l1 .7 2-4-3-2c0-1.5-.5-3-2.5-4M8.5 4.5a3.5 3.5 0 0 0 7 0M8.5 4.5 12 9l3.5-4.5M10 13v3M14 13v3M9 17h6'),
  polo: s('M8.5 3 4 5 2 9.5l3 1.6 1-.8V21h12V10.3l1 .8 3-1.6L20 5l-4.5-2M8.5 3 10 6l2-1.5L14 6l1.5-3M12 4.5V10M12 7.5h.01'),
  shirt: s('M8 3 4 5v16h16V5l-4-2M8 3l4 5 4-5M12 8v13M4 10h4M16 10h4M12 11h.01M12 14h.01M12 17h.01'),
  jacket: s('M8 3 4 6v15h7.5V8M16 3l4 3v15h-7.5V8M8 3l3.5 5M16 3l-3.5 5M6 14h3M15 14h3M4 10h3M17 10h3'),
  vest: s('M8.5 3 5.5 6v15h6V9.5M15.5 3l3 3v15h-6V9.5M8.5 3l3 6.5M15.5 3l-3 6.5M7.5 15h2M14.5 15h2'),
  pants: s('M6 3h12l1.5 18H14l-2-11-2 11H4.5ZM6 7h12M9 3v4M15 3v4'),
  cap: s('M3.5 15.5a8.5 8.5 0 0 1 17 0ZM12 7v1.5M20.5 15.5l2.5 1.2-5 .8M9 8.5c-.8 2-1.2 4.3-1 7M15 8.5c.8 2 1.2 4.3 1 7'),
  shoe: s('M2 17.5 3 10l5 1 3 3 8.5 1a2.5 2.5 0 0 1 2.5 2.5v1H2ZM2 19.5h20M8 11l-1 3M11 14l-2 2'),
  coat: s('M8 3 5 5v16h5v-7h4v7h5V5l-3-2M8 3l4 6 4-6M12 9v5M7 12h2M15 12h2'),
  uniform: s('M8.5 3 4 5 2 9.5l3 1.6 1-.8V21h12V10.3l1 .8 3-1.6L20 5l-4.5-2a3.5 3.5 0 0 1-7 0ZM10 12h4v5h-4Z'),
  baby: s('M8.5 3 4.5 6l2 3 1.5-1v6l-1 4h3.5l1.5-2 1.5 2h3.5l-1-4V8l1.5 1 2-3-4-3a3.5 3.5 0 0 1-7 0Z'),
  swim: s('M4 6h16l-1 12h-5.5L12 12l-1.5 6H5ZM4 9.5h16'),
  // settori
  health: s('M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z'),
  chef: s('M7 14.5h10V20H7ZM7 14.5a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 11 0 4 4 0 0 1-.5 8M7 17.5h10'),
  helmet: s('M3 17.5h18M5 17.5v-3a7 7 0 0 1 14 0v3M10 7.8V12M14 7.8V12M9 7.5a7 7 0 0 1 6 0'),
  tools: s('M3 9h18v11H3ZM8.5 9V6h7v3M3 13.5h18M10 13.5v2h4v-2'),
  ball: s('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 3v18M3 12h18M5.6 5.6c2.6 3.6 2.6 9.2 0 12.8M18.4 5.6c-2.6 3.6-2.6 9.2 0 12.8'),
  star: s('M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z'),
  glasses: s('M2.5 10h8v2.5a4 4 0 0 1-8 0ZM13.5 10h8v2.5a4 4 0 0 1-8 0ZM10.5 11h3M2.5 10l1-3M21.5 10l-1-3'),
  briefcase: s('M3 8h18v12H3ZM9 8V5.5h6V8M3 13h18M11 13v1.5h2V13'),
  // esigenze
  breath: s('M12 3c3 4 5.5 6.5 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 9.5 9 7 12 3ZM12 10v6M9.8 12.2 12 10l2.2 2.2'),
  stretch: s('M3 12h18M6.5 8.5 3 12l3.5 3.5M17.5 8.5 21 12l-3.5 3.5M9 9v6M15 9v6'),
  hiviz: s('M8.5 3 5 6v15h14V6l-3.5-3M8.5 3 12 8l3.5-5M5 12.5h14M5 16.5h14'),
  wind: s('M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8'),
  umbrella: s('M3 12a9 9 0 0 1 18 0ZM12 12v6.5a2 2 0 0 0 4 0M12 3v-.5'),
  sun: s('M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8'),
  shield: s('M12 3 5 6v5.5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5V6ZM12 9v6M9 12h6'),
  flame: s('M12 3c1 4 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-3 2-4.5 2-6.5 1 1 2 2 2 3.5 1.5-2 1.5-4.5 1.5-7.5Z'),
  bolt: s('M13.5 2 4 14h7l-1 8 9.5-12.5h-7Z'),
  leaf: s('M5 19.5C5 10.5 11 5 20 5c0 9-5.5 15-14.5 14.5M5 19.5l7.5-7.5'),
  tag: s('M3 12V4h8l10 10-8 8ZM7.5 7.5h.01'),
  // interfaccia
  grid: s('M4 4h7v7H4ZM13 4h7v7h-7ZM4 13h7v7H4ZM13 13h7v7h-7Z'),
  filter: s('M3 5h18M6 12h12M10 19h4'),
};

export const CAT_ICON = {
  'Magliette': 'tshirt', 'Felpe': 'hoodie', 'Polo': 'polo', 'Camicie': 'shirt', 'Cappotti e giacche': 'jacket',
  'Gilet': 'vest', 'Pantaloni': 'pants', 'Cappellini e accessori': 'cap', 'Calzature': 'shoe',
  'Tute da lavoro e camici': 'coat', 'Tute e divise': 'uniform', 'Body per neonati': 'baby', 'Costumi da bagno': 'swim',
};
export const SET_ICON = { sanita: 'health', ristorazione: 'chef', edilizia: 'helmet', lavoro: 'tools', sport: 'ball', eventi: 'star', casual: 'glasses', corporate: 'briefcase' };
export const ES_ICON = {
  traspirante: 'breath', elasticizzato: 'stretch', 'alta-visibilita': 'hiviz', antivento: 'wind', idrorepellente: 'umbrella',
  'protezione-uv': 'sun', antibatterico: 'shield', ignifugo: 'flame', antistatico: 'bolt', sostenibile: 'leaf', 'etichetta-removibile': 'tag',
};
export const icon = (map, key, fallback = 'grid') => ICONS[map[key]] || ICONS[fallback];
