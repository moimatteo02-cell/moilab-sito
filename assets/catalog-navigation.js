/* MOI LAB — navigation derived only from names/categories, no technical claims. */
(() => {
  const norm = v => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const groups = [
    ['Scrittura e ufficio', ['Penne e scrittura', 'Quaderni e blocchi', 'Ufficio']],
    ['Gadget e regali', ['Borracce', 'Tazze e bicchieri', 'Tecnologia', 'Casa', 'Portachiavi', 'Tempo libero', 'Dolci e snack', 'Regali con foto']],
    ['Packaging ed etichette', ['Adesivi ed etichette', 'Packaging', 'Packaging per alimenti']],
    ['Insegne ed eventi', ['Striscioni e roll-up', 'Poster e cartelli', 'Adesivi e magneti per vetrine e veicoli', 'Bandiere', 'Fiere ed eventi', 'Accessori']],
    ['Stampa per la tua attività', ['Biglietti da visita', 'Volantini e stampa per il marketing']],
    ['Inviti e cancelleria', ['Inviti e cancelleria']]
  ];
  const synonyms = [
    ['etichette', 'etichetta', 'sticker', 'stickers', 'adesivi', 'adesivo'],
    ['borraccia', 'borracce', 'bottiglia', 'bottiglie'],
    ['tazza', 'tazze', 'mug'], ['shopper', 'shopping', 'sacchetto', 'sacchetti'],
    ['rollup', 'roll-up', 'roll up'], ['volantino', 'volantini', 'flyer', 'flyers'],
    ['penna', 'penne'], ['menu', 'menù'], ['quaderno', 'quaderni', 'taccuino', 'taccuini'],
    ['packaging', 'confezione', 'confezioni', 'imballaggio', 'imballaggi'],
    ['chiavetta', 'chiavette', 'pendrive'], ['biglietto', 'biglietti']
  ].map(g => g.map(norm));
  const paths = [
    { id: 'ristorante', name: 'Per il mio ristorante', pattern: /menu|tovagli|aliment|asporto|bicchier|tazz|bottigl|borracc|sottobicchier|ristoran|caffe|pizza|etichette|adesivi|packaging/ },
    { id: 'negozio', name: 'Per il mio negozio', pattern: /packaging|sacchett|bors[ae]|shopper|etichette|adesivi|cartell|vetrin|biglietti da visita|fedelta|timbri|timbro/ },
    { id: 'evento', name: 'Per un evento', pattern: /event|fier[ae]|roll.?up|striscion|bandier|inviti|badge|braccialett|laccett|espositor/ },
    { id: 'azienda', name: 'Per la mia azienda', pattern: /ufficio|scrittura|quaderni|tecnologia|biglietti da visita|volantini|cartellin|badge|portachiavi/ }
  ];
  const family = x => groups.find(([, cats]) => cats.includes(x.cat))?.[0] || x.cat;
  const haystack = x => norm([x.id, x.n, x.cat, x.sub].join(' '));
  const matches = (x, query) => {
    const text = haystack(x);
    const intent = { ristorante:'ristorante', ristoranti:'ristorante', negozio:'negozio', negozi:'negozio', evento:'evento', eventi:'evento', azienda:'azienda', aziende:'azienda' }[norm(query).trim()];
    if (intent) return inPath(x, intent);
    return norm(query).trim().split(/\s+/).filter(Boolean).every(word => {
      const group = synonyms.find(g => g.includes(word));
      return (group || [word]).some(w => text.includes(w));
    });
  };
  const inPath = (x, id) => !id || !!paths.find(p => p.id === id)?.pattern.test(haystack(x));
  const api = { norm, groups, paths, family, matches, inPath };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.MoiCatalogNavigation = api;
})();
