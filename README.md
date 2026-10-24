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
