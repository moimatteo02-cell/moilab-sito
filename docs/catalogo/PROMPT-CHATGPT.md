Continuiamo il catalogo MOI LAB nel repository moimatteo02-cell/moilab-sito, ramo `anteprima`.

Da oggi il lavoro sulle immagini dei prodotti è diviso in due metà:
- tu fai **solo i lotti A**: 1.520 prodotti, A01–A31;
- Claude fa i lotti B.

Prima di tutto:
1. `git pull --rebase origin anteprima`.
2. Leggi `docs/catalogo/DIVISIONE.md`: sono le regole comuni e valgono più di qualsiasi istruzione precedente.
3. Leggi `docs/catalogo/divisione.csv` e filtra `assegnato = chatgpt`. I lotti sono già in ordine di priorità: parti da **A01** e procedi in ordine.

Cosa fare per ogni lotto (50 prodotti):
- Per ogni codice genera **un mockup originale** dello stesso stile dei 52 già fatti, con i prompt di `docs/catalogo/prompts.json` come modello.
- Puoi guardare la scheda reale del prodotto per capirne forma e materiali, ma non copiare né pubblicare foto altrui.
- Controlla ogni immagine. Scartala se:
  - la forma non corrisponde;
  - c'è testo sbagliato;
  - c'è un marchio di terzi.
- Importa con `python3 tools/catalog_media.py import-image ID file --reviewed`.
- Registra le voci **solo in `data/catalogo/media.json`**, con `status: verified`, `alt`, `description` (solo ciò che risulta dal nome e dalla scheda, niente caratteristiche inventate), `provenance` e `batch` (es. `A01`).
- Lancia:
  - `python3 tools/catalog_media.py audit`
  - `node tools/check_catalog.cjs`

  Devono passare entrambi.
- Aggiungi una riga in `docs/catalogo/AVANZAMENTO.md`, poi fai commit «Catalogo: lotto A0X, N mockup» e push su `anteprima`.

Cosa NON fare:
- Non generare immagini per codici con `assegnato = claude`. Il controllo automatico fallisce se un codice B finisce in `media.json`.
- Non modificare `data/catalogo/media-claude.json`.
- Non modificare l'interfaccia del catalogo: `assets/gadget-catalog.*`, `assets/catalog-navigation.js`, `assets/door.js`, `index.html` (salvo il numero di versione `?v=` se serve), `assets/catalogo/categorie/`, `data/catalogo/immagini.json`. Se ti serve una modifica lì, scrivila in `AVANZAMENTO.md`: la fa Claude.
- Non cambiare prezzi, nomi, quantità minime, colori o assortimento nei JSON dei prodotti.
- Non pubblicare su `main`: lo fa solo il titolare scrivendo «pubblica».
- Non inserire nel repository link, nomi o prezzi d'acquisto del fornitore: il repository è pubblico.

Dopo ogni lotto rispondimi in breve:
- lotto fatto;
- quanti mockup;
- eventuali codici saltati e perché;
- totale completato della metà A.
