# Design — anteprima

Pagina statica, isolata in `#moi-showroom-design`. Nessuna dipendenza aggiunta.

## Direzione e riferimenti
- Aurora https://reactbits.dev/backgrounds/aurora: riuso di `aurora.js`, palette oliva/oro, velocità ridotta, limitato alla hero. Fallback CSS senza WebGL; movimento ridotto fermo, rendering sospeso fuori viewport.
- FadeContent https://reactbits.dev/animations/fade-content: riuso del porting locale con IntersectionObserver sul contenitore stanza.
- SpotlightCard https://reactbits.dev/components/spotlight-card: riuso del pattern nativo di `assets/moi-motion.js`, coordinate del puntatore e gradiente CSS solo sulle schede Design.
- Conservati gli avvisi di licenza dei porting. Nessun componente Pro. La composizione editoriale e la costruzione SVG del monogramma sono specifiche MOI LAB.

## Funzioni preservate
Brief con domande condizionali, esempi illustrativi con nome, ritorno e salto, riepilogo, WhatsApp precompilato e MoiCart. Il sito non genera un logo personalizzato: la tavola lo dichiara. L'indirizzo del sito viene ora inserito prima della conferma della risposta.

Cinque immagini del processo, selezionabili tramite pulsanti accessibili. I segnaposto del portfolio non vengono presentati come lavori reali. FAQ native con tastiera. Nessun cambio alle altre stanze o ai file condivisi.
