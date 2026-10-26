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
