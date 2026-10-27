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
