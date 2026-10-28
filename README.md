# MOI LAB — sito

Sito vetrina di MOI LAB, migrato da ChatGPT Sites (ottobre 2026). Sito statico: HTML, CSS, JavaScript, nessuna build.

## Avvio in locale
    python3 -m http.server 8000   # poi apri http://localhost:8000

## Struttura
- `index.html` — homepage con gli showroom (Apparel, Custom, Automotive, Signage, Design, Digital)
- `assets/` — stili, script, font e immagini condivise
- `apparel/` — catalogo abbigliamento (legge da `data/apparel/`)
- `automotive/`, `digital/`, `sticker/` — pagine e logiche dei singoli servizi
- `data/apparel/` — catalogo: `meta.json` (categorie), `elenco.json` (400 modelli), `prodotti/<SKU>.json` (varianti e prezzi)
- `api/` — copie statiche dei dati che prima arrivavano dal server di ChatGPT

## Cosa NON funziona ancora (serviva il server di ChatGPT)
- Pannello admin (`/admin/sticker`): salvataggio di portfolio, ordini, catalogo sticker
- Area privata (`/area-privata`) e accesso
- Invio ordini/richieste automotive al server
Da ricostruire con un backend (es. Supabase o funzioni Netlify). Le richieste via WhatsApp funzionano.

## Regole di lavoro (Claude + ChatGPT)
- Un solo agente per volta sulla stessa pagina: lavora, salva (commit), poi passa la mano.
- Ogni modifica con un messaggio di commit chiaro.

## Galleria "I nostri lavori" (anello 3D)
Presente in Apparel, Custom, Automotive, Signage e Design (non in Digital).
- Codice: `assets/portfolio-ring.js` + `assets/portfolio-ring.css`
- Foto: `portfolio/<servizio>/` (meglio .webp o .jpg, verticali 3:4, max ~1600 px di lato lungo)
- Elenco lavori: `data/portfolio.json`, per ogni servizio una lista `progetti`:

      { "titolo": "Divise staff Hotel X", "cliente": "Hotel X", "anno": "2026",
        "descrizione": "…", "immagini": ["/portfolio/apparel/hotel-x-1.webp", "/portfolio/apparel/hotel-x-2.webp"] }

  La prima immagine è quella che appare sull'anello; le altre si vedono aprendo il lavoro.
  `"attivo": false` nasconde un lavoro senza cancellarlo. I file `esempio-XX.webp` e i progetti con `"esempio": true` sono segnaposto da sostituire.

## Catalogo APPAREL: ricerca, percorsi e filtri
- Codice: `apparel/browse.mjs` (testata con ricerca, percorsi Per categoria / Per settore / Per esigenza, lista con filtri) + `apparel/browse.css`.
  La scheda prodotto resta in `apparel/catalog.mjs`.
- Dati: `data/apparel/elenco.json` (400 modelli con campi filtro), `data/apparel/percorsi-indice.json` (card e conteggi).
- **Configurazione modificabile**: `data/apparel/percorsi.json`
  - `settori`: nome, descrizione, immagine (vuota = foto automatica), ordine, `visibile`,
    `regole` (solo dati ufficiali Gorfactory: collezioni, icone tecniche, categorie, sottocategorie),
    `includi` / `escludi` (SKU scelti a mano). Un settore senza prodotti non viene mostrato.
  - `esigenze`: caratteristiche tecniche, ricavate dalle icone delle schede Gorfactory.
  - `sinonimi`: parole/professioni che la ricerca collega a un settore (es. dentista → sanità).
  - `tipi`: sinonimi dei tipi di capo (es. hoodie → Felpe).
- Dopo ogni modifica: `python3 tools/build_percorsi.py` (da eseguire anche dopo ogni ricalcolo prezzi).
- Controllo: `data/apparel/mappatura-settori.csv` spiega perché ogni prodotto è in un settore.
- Fonte attributi: `data/apparel/fonte/gorfactory-attributi.json` (collezioni, tag, genere, icone tecniche).

## Animazioni (26/10/2026)
- `assets/moi-motion.js` + `assets/moi-motion.css`: animazioni ispirate a React Bits (licenza MIT + Commons Clause), riscritte in JavaScript semplice. Ogni effetto è legato a un servizio: menu a tendina, titolo home parola per parola, riflesso oro, luce sulle card, grana; comparsa allo scorrimento nei servizi; pulsanti magnetici; cuore preferiti; adesivo che si stacca (Custom); configuratore a passi e riflesso (Automotive); neon (Signage); titolo che reagisce al mouse (Design); testo che si decodifica, card a pixel, scintille e "tieni premuto" (Digital).
- `assets/sticker-peel.js`: porting WebGL di Sticker Peel, caricato solo quando si apre Custom.
- Con "riduci animazioni" attivo nel sistema restano solo gli stati finali.
- Terzo giro (`assets/moi-motion-extra.js` + `.css`): pulsante WhatsApp fisso, monolite con polvere d'oro e scritta "CREATIVE SOLUTIONS" che corre con lo scroll (home), "Prova il tuo logo" e colore dai pallini (catalogo), "Prova la tua insegna" (Signage), pellicola sull'auto (Automotive), terminale (Digital).

## Estetica del catalogo APPAREL (27/10/2026)
- `apparel/estetica.css` + `apparel/estetica.js` (caricati dopo `browse.css` e dopo `moi-motion-more.js`): 36 ritocchi di presentazione.
- Testata: titolo a parole, sfondo che respira, esempi di ricerca che si scrivono, "400" grande, striscia di fiducia.
- Percorsi: evidenziatore che scivola, barra fissa in alto; categorie a mosaico (le due con più modelli in grande da 1100 px), prezzi su due righe, etichetta vetro con il numero di modelli.
- Elenco: fondo da studio, colonna del "da", etichette dalla tipologia (solo genere, "anche bambino" e parole del tipo di capo: nessun dato inventato), cuore e "Vedi il capo", caselle filtro su misura, vista 4/2, caricamento automatico, sagome di caricamento.
- Scheda: nome nello stile del sito, prezzi grandi cliccabili (Senza logo / Col tuo logo), lente, linee della galleria, nome in alto e barra fissa su telefono, conferma del preventivo, foto che vola dall'elenco alla scheda.
- Tutto rispetta "riduci movimento". I preferiti delle schede usano la stessa chiave `moi-preferiti` della scheda prodotto.

## Assistente "Ti aiuto a scegliere" (27/10/2026, fase 1 senza AI)
- `apparel/assistente.js` + `.css`: pulsante fisso nel catalogo APPAREL (nascosto nella scheda prodotto).
- 5 domande: settore, capi, quantità, logo sì/no, priorità (risparmio / equilibrio / il più completo).
- Consigli calcolati solo sui dati del catalogo: "il più adatto" (pertinenza `rk`/`p1` del settore), "il più conveniente" (tra i capi pertinenti, stessa tipologia se possibile), "il più completo" (più caratteristiche `x`). Le differenze mostrate sono solo materiale, caratteristiche e tipologia reali.
- Consiglio quantità: se mancano pochi pezzi a 10 o 50, mostra quanto costa davvero con la soglia (regola stampa: 10–49 capo +7 €, 50+ capo +5 €).
- Fase 2 (da fare): chat AI tramite funzione Netlify; la chiave API va messa dall'utente nelle variabili di Netlify, mai nel repository.

## Sling Button (27/10/2026)
- `assets/sling-button.js` + `.css`: porting vanilla del componente React Bits "Sling Button" (David Haz, licenza MIT + Commons Clause: uso nel sito consentito, non si rivende il componente). CSS originale invariato.
- Usato nella chiusura della pagina Digital (lancia → apre il modulo progetto) e nell'ultimo passo del modulo progetto (lancia → apre WhatsApp col messaggio pronto).
- `assets/servizi-accordion.js` + `.css`: scelta dei servizi in home a fisarmonica (effetto "Accordion Gallery" di React Bits, rifatto sulle card esistenti senza React/GSAP). Il servizio aperto è a colori con bordo dorato che gira; primo tocco apre, secondo entra.
- Apertura home: `assets/intro.js/.css` (porting di "Scroll Expand" di React Bits) con `assets/galaxy.js/.css` (porting di "Galaxy", stesso shader WebGL2) e la M del caricamento. Entrambi MIT + Commons Clause.
- Nuova apertura: Light Rays + M → la cornice si allarga (Scroll Expand) → interfaccia con Swarm Cursor ("Iniziamo" → servizi, "Chi siamo" → `/chi-siamo/`). Porting vanilla in `assets/light-rays.js`, `assets/swarm-cursor.js`, `assets/intro.js`. Il racconto della vecchia home ora vive in `/chi-siamo/` (nella home è nascosto con `.mi-split`).
- Pulsante «Iniziamo»: Specular Button di React Bits (porting in `assets/specular-button.js`, stesso shader), colori dorati.

## Flex Carousel — «I nostri lavori» in Abbigliamento
- `assets/flex-carousel.js` + `assets/flex-carousel.css`: porting vanilla (WebGL2 puro, senza OGL) del Flex Carousel di React Bits (MIT + Commons Clause). API: `MoiFlexCarousel.mount(el, { items, preset, intro, ... })`.
- Si attiva con `data-style="flex"` sulla sezione `.mp-teaser` (oggi solo `data-portfolio="apparel"`); immagini e titoli da `data/portfolio.json`. Niente pulsante «Entra nella galleria»: tocco = ingrandisce la foto. La rotella verticale scorre la pagina (captureWheel:false).
- Senza WebGL2 torna la galleria 3D di prima. In Abbigliamento «Esplora un altro mondo» è centrato, con la scritta sopra.

## Menu a ruota (Option Wheel)
- `assets/option-wheel.js/.css`: porting vanilla dell'Option Wheel di React Bits (MIT + Commons Clause) + `MoiOptionWheel.menu()` (ruota + pulsante «Vai»).
- `assets/wheel-menu.js`: nella home dei servizi la ruota sostituisce l'elenco nel menu delle tre lineette (Chi siamo / Inizio / Scrivici; lingua e link di gestione restano). In Chi siamo aggiunge le tre lineette con tutti i servizi.
- Scorri o trascina per scegliere; tocca di nuovo l'opzione scelta o il pulsante per entrare.

## Carrello unico del preventivo
- `assets/quote-cart.js/.css`: un solo carrello (localStorage `moilab-quote-cart-v1`) per tutti i servizi; pulsante fisso «Preventivo» con il numero, pannello laterale, stima indicativa dei capi, «Aggiungi anche», annulla rimozione, invio unico su WhatsApp (+ copia testo).
- Aggiungono al carrello: Abbigliamento (scheda prodotto, barra mobile, «Ti aiuto a scegliere»), Sticker (sincronizzati dal loro carrello), Automotive (ultimo passo del configuratore), Insegna al neon, «Cosa ti serve?» in Custom/Insegne/Grafica (`assets/quick-request.js`), Digital (ultimo passo del progetto).
- API: `MoiCart.add({service,title,details,qty,image,key,price})`, `MoiCart.open()`, oppure `data-cart-item='{json}'` su qualsiasi pulsante.
- Nota: il configuratore Automotive prima inviava a `/api/automotive/orders`, che sul sito statico non esiste: ora passa dal carrello e i file si allegano su WhatsApp.

## Codice richiesta + area privata
- Il carrello genera un codice (es. `MOI-7KQ2X`). Il messaggio WhatsApp è corto: codice, contenuto per servizio, nome/note e un link «Riepilogo» → `/privato/#q=…` (i dati stanno compressi nel link, dopo il `#`: non passano da nessun server).
- `/privato/` (privato.js/.css): apre il link o il codice, mostra la richiesta ordinata per servizio con quantità e stima, stato (Nuova → In lavorazione → Preventivo inviato → Accettata → Archiviata), copia, stampa; archivio locale nel browser. Non indicizzata (meta + header `X-Robots-Tag`). Per ora raggiungibile anche dal menu (voce «Privato»).
- Copia di sicurezza: all'invio il carrello manda anche il modulo Netlify `preventivo` (form nascosto in index.html). Funziona solo se in Netlify è attiva la rilevazione dei moduli (Forms).
- `assets/hold-button.js/.css` (Hold Button di React Bits) + `assets/room-back.js`: in Abbigliamento «Indietro» (tocco = un passo indietro nel catalogo, tieni premuto = servizi).

## Indietro in tutti i servizi + assistente compatto + mini tutorial
- «Torna ai servizi» in alto è nascosto (resta nel codice per la tendina): in ogni servizio c'è la freccia Indietro (Hold Button) in basso a sinistra.
- «Ti aiuto a scegliere» è un pulsante compatto sopra la freccia (solo ✦ su telefono): tocco = apre, tieni premuto = lo nascondi fino alla prossima visita di Abbigliamento.
- `assets/coach.js`: le prime 2 volte un dito fantasma mostra tocco e pressione lunga di questi pulsanti; si chiude toccando lo schermo.

## Scorri per richiedere + tieni premuto per togliere
- `assets/slide-commit.js/.css`: porting vanilla di Slide Commit (React Bits): nel carrello «Scorri per richiedere il preventivo» → apre WhatsApp (tocco senza trascinare = suggerimento).
- Nel carrello «Rimuovi» è un Hold Button rosso «Tieni premuto per togliere» (tocco = suggerimento, poi Annulla nel messaggio).

## Pulsantino ✦ dentro i servizi (dock)
- `assets/dock.js/.css`: dentro un servizio c'è solo il pulsante dorato ✦ (+ il carrello, sempre visibile). Tocco → si aprono Indietro (Hold Button: tocco = indietro, tieni premuto = servizi), Ti aiuto a scegliere (solo Abbigliamento, `window.MoiAssist.open`), WhatsApp. Il WhatsApp fisso e i pulsanti separati sono nascosti nei servizi.
- Il mini tutorial (coach.js) ora mostra: tocca ✦ → si apre → tieni premuto Indietro.

## Catalogo gadget / insegne / stampa (fornitore esterno)
- Dati: `data/catalogo/custom.json` (2.855), `signage.json` (163), `design.json` (103). Campi: id (codice MOI `G…`), n nome (senza il marchio del fornitore), cat/sub (categorie MOI), ic (illustrazione), q quantità minima, p prezzo «da» al pezzo IVA inclusa, col colori, o ordine consigliato.
- Interfaccia: `assets/gadget-catalog.js/.css` + illustrazioni `assets/gadget-icons.js` (disegnate per MOI LAB: niente foto del fornitore). Cerca, categorie, sottocategorie, ordina, «anche 1 pezzo», scheda con colore/quantità/stima/dettagli → carrello del preventivo.
- Il nome del fornitore e i suoi link NON sono nel repository (repository pubblico): la tabella codice MOI → prodotto/link/prezzo del fornitore è un file privato fuori dal sito.
- Prezzi: per ora uguali a quelli del fornitore (IVA inclusa). Da rivedere con il ricarico.

## Completamento visuale del catalogo (27/10/2026, in corso)
- `assets/catalog-navigation.js`: sei macroaree sopra le categorie originali, quattro percorsi per utilizzo e sinonimi. La ricerca trova anche un codice MOI esatto. «Cerca anche negli altri servizi» unisce Custom, Signage e Design senza duplicare i dati e mantiene il servizio corretto nel preventivo. Apparel resta indipendente e invariato.
- `data/catalogo/media.json`: associazioni esplicite codice → immagini responsive e descrizione. Solo record con `status: verified` sono mostrati come foto. Le illustrazioni precedenti rimangono sugli articoli non ancora lavorati, che NON sono considerati completati.
- `assets/catalogo/<servizio>/`: mockup originali in WebP, 960 px per la scheda e 480 px per le card. L'avvertenza nella scheda distingue la grafica dimostrativa dal prodotto da confermare nel preventivo. Nessuna fotografia di terzi riutilizzata.
- `docs/catalogo/inventario.csv`: tutti i 3.121 codici, stato individuale e file previsto. `stato.json` riporta i conteggi effettivi. `prompts.json` conserva i prompt dei mockup integrati; `AVANZAMENTO.md` spiega le verifiche e ciò che resta.
- Aggiornare il registro: `python3 tools/catalog_media.py audit`. Controlli ricerca e copertura: `node tools/check_catalog.cjs`.
- Importare un'immagine già esaminata: `python3 tools/catalog_media.py import-image CODICE /percorso/immagine.png --reviewed`, poi compilare il record in `media.json` e rieseguire i controlli. Pillow serve solo a questo strumento, non al sito. Non sovrascrive immagini esistenti.
- Non copiare mai nel repository il CSV privato di corrispondenza con il fornitore. Non aggiungere automaticamente formati, materiali o certificazioni mancanti nei dati.
### Catalogo: navigazione a scaffali (28/10/2026)
- Il catalogo (`assets/gadget-catalog.js/.css`) non mostra più tutti i prodotti insieme: **categorie → sottocategorie → listino**. La ricerca resta sempre in alto e cerca in tutto il catalogo, con scorciatoie verso le sottocategorie.
- Ogni passaggio crea una voce nella cronologia: il tasto indietro del telefono torna al livello precedente del catalogo. `door.js` non riapre da capo una stanza già aperta.
- Immagini delle sottocategorie: file `assets/catalogo/<servizio>-<sottocategoria>.webp` (es. `custom-tazze.webp`), elencati in `data/catalogo/immagini.json` (es. `["custom-tazze"]`). Senza immagine compare l'illustrazione a linea.
- La scheda prodotto mostra l'immagine della sottocategoria, se c'è, con la dicitura «Immagine indicativa della categoria».
- Unione con il lavoro dell'altra sessione: restano i mockup per prodotto (`data/catalogo/media.json`, priorità sulla foto di categoria), ricerca con sinonimi e codice (`assets/catalog-navigation.js`), percorsi «Per esigenza» (ora chip nella prima schermata, con prodotti di tutti i servizi), «Cerca anche in tutti i servizi» (chip nei risultati), macroaree (titoli sopra i riquadri), riprova al caricamento, focus nella scheda, immagine nel carrello. Le immagini di sottocategoria stanno in `assets/catalogo/categorie/`.

### Immagini prodotti divise in due metà (28/10/2026)
- `docs/catalogo/DIVISIONE.md`: regole comuni.
- `docs/catalogo/divisione.csv`: chi fa cosa, con lotti A (ChatGPT) e B (Claude) in ordine di priorità.
- `docs/catalogo/PROMPT-CHATGPT.md`: istruzioni da dare a ChatGPT.
- I registri sono due: `data/catalogo/media.json` (A) e `data/catalogo/media-claude.json` (B). Il sito li unisce; `tools/check_catalog.cjs` blocca i codici nel registro sbagliato.

### Catalogo Custom ridotto (28/10/2026)
- La stanza Custom mostra solo la vetrina di `data/catalogo/vetrina.json`: 29 prodotti in 3 scaffali (Sticker, Biglietti da visita, Scatole), con i biglietti presi dal catalogo Stampa (nel carrello restano servizio «design»). Ricerca limitata alla vetrina, niente percorsi per esigenza né ricerca negli altri servizi. Nessun prodotto cancellato: per tornare al catalogo completo basta togliere `custom` da `vetrina.json`.
- Blocco «Ti serve un formato diverso?» aggiornato alle tre linee.
- Lavoro immagini a lotti sospeso: vedi `docs/catalogo/STOP-LOTTI.md` (restano 10 mockup).
- Listino a scaglioni (28/10/2026, sera): in `vetrina.json` ogni prodotto ha `tiers` = [[quantità, totale IVA inclusa]], con le stesse quantità e gli stessi minimi del fornitore. Nella scheda si sceglie uno scaglione, si vede il totale e il prezzo cadauno. Nel carrello la quantità è fissa (`fixedQty`): per cambiarla si torna alla scheda. Tolti «Biglietti da visita Premium» e «Campione scatole postali», non più disponibili. La tabella d'acquisto resta fuori dal repository.
- Prezzi presi con la configurazione base di ogni prodotto (misura, carta e opzioni predefinite); per varianti diverse il prezzo si conferma nel preventivo.
- Stanza Custom (28/10/2026, 19:00): nascosta via CSS l'intestazione «CUSTOM / Gadget e oggetti» (testo, link Sticker, mazzo di carte, adesivo 3D). La pagina si apre direttamente sul catalogo; il titolo resta nel codice per l'accessibilità. Nella vetrina i prodotti sono schede grandi con foto (`.gk-pcard`) invece delle righe con miniatura. Per ripristinare l'intestazione basta togliere il blocco «stanza Custom» in fondo a `gadget-catalog.css`.
- Pagina iniziale della vetrina Custom (28/10/2026, 19:30), costruita sul layout di riferimento del titolare (`landing()` in `gadget-catalog.js`, classi `.gl-*`), in quest'ordine:
  1. eroe con schede, titolo, foto, punti chiave e prodotto in evidenza;
  2. fascia scura «Stampa UV, in arrivo» (aggiunge una richiesta al carrello);
  3. due riquadri «Non c'è nel sito? Chiedi, lo cerchiamo noi» (porta al blocco «Dicci cosa ti serve»);
  4. «Scegli cosa stampare» con i 3 scaffali;
  5. «Come funziona» con il pulsante del carrello.

  Galleria «I nostri lavori» nascosta nella stanza Custom. Nella pagina iniziale la ricerca è nascosta; resta visibile nelle liste.
- 28/10/2026, 20:00: pagina iniziale Custom rifatta fedele al layout di riferimento.
  - Un unico telaio scuro con le sezioni attaccate, in quest'ordine: eroe a linguette con titolo grande in grassetto, angolo ritagliato con la mini scheda e nastro che scorre; prodotti subito dopo; «Molti prodotti non sono in vista» con la richiesta particolare; stampa UV in arrivo; chiusura a tre colonne con la barra del carrello.
  - Animazioni: comparsa allo scorrere, titolo che sale, etichette che oscillano, quadrati che fluttuano, foto con zoom lento. Sono tutte disattivate con «riduci movimento».
