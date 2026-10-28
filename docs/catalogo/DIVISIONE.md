# Divisione del lavoro sulle immagini del catalogo

Dal 28/10/2026 i 3.069 prodotti ancora senza immagine specifica sono divisi in due metà, per **categorie intere**, così le due sessioni non toccano mai gli stessi prodotti né gli stessi registri.

| | Chi | Prodotti | Lotti | Categorie |
|---|---|---|---|---|
| **A** | ChatGPT | 1.520 | A01–A31 | tutte le Insegne, tutta la Stampa (Design), Penne e scrittura, Quaderni e blocchi, Ufficio, Adesivi ed etichette, Packaging, Packaging per alimenti, Regali con foto |
| **B** | Claude (immagini generate dal titolare in Adobe) | 1.549 | B01–B31 | Tazze e bicchieri, Borracce, Tecnologia, Tempo libero, Casa, Dolci e snack, Portachiavi |

L'elenco completo è `docs/catalogo/divisione.csv`, con le colonne `id;assegnato;lotto;vetrina;priorita;servizio;categoria;sottocategoria;nome`.
- **I lotti sono già in ordine di priorità.** Il lotto 01 contiene il prodotto più consigliato di ogni sottocategoria, il lotto 02 il secondo, e così via. I primi lotti coprono tutte le sottocategorie, così il catalogo cresce in modo uniforme.
- `vetrina = sì` indica i primi 13 prodotti di ogni sottocategoria: è il catalogo "piccolo" da completare per primo.
- I 52 prodotti già fatti (lotti 01–10 della notte del 27/10) non sono nell'elenco.

## Regole (valgono per entrambi)
1. **Ognuno lavora solo sui codici della propria metà.** `tools/check_catalog.cjs` fallisce se un codice finisce nel registro sbagliato.
2. **Registri immagini separati:**
   - ChatGPT scrive solo `data/catalogo/media.json`;
   - Claude scrive solo `data/catalogo/media-claude.json`.

   Il sito li legge entrambi. Il formato delle voci è identico: `status`, `src`, `small`, `alt`, `description`, `provenance`, `batch`.
3. Le immagini vanno in `assets/catalogo/<servizio>/<id>-<slug>.webp` (+ `-480`), con `tools/catalog_media.py import-image`. I nomi contengono il codice, quindi non si scontrano.
4. **Prima di iniziare e prima di ogni push:** `git pull --rebase origin anteprima`. Commit piccoli, uno per lotto.
5. **File rigenerati** (`docs/catalogo/inventario.csv`, `stato.json`, `apparel-esistente.csv`): in caso di conflitto non si risolvono a mano. Si prende una delle due versioni e si rilancia `python3 tools/catalog_media.py audit`.
6. **Non si toccano i file dell'altro:**
   - navigazione e interfaccia del catalogo (`assets/gadget-catalog.*`, `assets/catalog-navigation.js`, `assets/door.js`) e immagini di categoria (`assets/catalogo/categorie/`, `data/catalogo/immagini.json`) sono di Claude;
   - chi ha bisogno di una modifica lì la scrive in `AVANZAMENTO.md` invece di farla.
7. **Stile unico** (lo stesso dei primi 52 mockup):
   - foto da e-commerce, un prodotto, formato 5:4;
   - superficie avorio caldo, luce morbida dall'alto a sinistra, prodotto al 70% del riquadro;
   - grafica dimostrativa solo «MOI …»;
   - nessun marchio di terzi, nessuna persona, nessuna scritta tecnica o certificazione.
8. **Niente foto del fornitore** pubblicate, copiate o modificate. Le schede del fornitore si possono leggere per capire forma e materiali, ma l'immagine resta un originale. Il file privato del fornitore non entra mai nel repository.
9. **Fine lotto:** `python3 tools/catalog_media.py audit`, `node tools/check_catalog.cjs`, una riga in `AVANZAMENTO.md` (lotto, codici, totale), commit e push su `anteprima`. **Mai su `main`.**
