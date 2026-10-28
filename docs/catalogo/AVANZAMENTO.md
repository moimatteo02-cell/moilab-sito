# Catalogo MOI LAB — stato di avanzamento

Checkpoint del 27/10/2026. Progetto IN CORSO, non completato.

## Ambito e inventario
- 3.121 prodotti nel catalogo gadget/packaging (2.855), insegne (163), stampa (103).
- Altri 400 prodotti Apparel esistenti, tutti con URL immagine: inventariati separatamente in `apparel-esistente.csv`, preservati. Raggiungibilità delle loro immagini e diritti non riverificati in questo intervento.
- Totale cataloghi esaminati: 3.521 prodotti. Nessun prodotto aggiunto o eliminato.
- `inventario.csv` traccia individualmente tutti i 3.121 codici del catalogo in lavorazione. Le descrizioni non disponibili sono segnalate come mancanti, non inventate.
- Categorie originali: 23; sottocategorie distinte per servizio/categoria: 47. Sei macroaree di navigazione aggiunte sopra la classificazione originale.

## Produzione immagini
- Immagini specifiche iniziali nei tre cataloghi: 0 (46 illustrazioni condivise).
- 53 generazioni eseguite con lo strumento integrato imagegen; 52 mockup selezionati, controllati e integrati, uno scartato prima dell'importazione perché le proporzioni indicate non coincidevano con il riferimento. La seconda versione del biglietto pieghevole usa il riferimento corretto.
- 104 file WebP finali: due risoluzioni per ciascuno dei 52 prodotti. Nomi contenenti codice MOI e nome prodotto; nessuna condivisione accidentale dell'immagine fra codici.
- Lotto 01: GC28FAA, GFC7832, GE9DA2C, GF7FF12 (biglietti lucidi, quadrati, standard, Kraft).
- Lotto 02: GD82566, G868CC6, G8BF630 (biglietti arrotondati, opachi, Soft Touch).
- Lotto 03: G26787E, GA9A0EF, G6AEAF8, G1EDAC9 (pieghevoli, scatole postali, astucci ovali, adesivi rotondi su foglio).
- Lotto 04: GAAED0B, GFE3104, G58A315, G18186A (roll up, striscioni, poster, cartelli in plastica ondulata).
- 3.069 prodotti ancora senza immagine specifica. Le illustrazioni precedenti restano per non nascondere/eliminare prodotti: NON valgono come completamento.
- I mockup sono esempi di personalizzazione originali, non fotografie del prodotto consegnato. Materiali, dimensioni e finiture da confermare nel preventivo; nessuna promessa di caratteristiche non documentate.
- Nessuna fotografia di terzi scaricata o modificata, nessun nuovo asset con licenza esterna. Prompt dei file selezionati: `prompts.json`.

## Navigazione e integrazione
- Ricerca per sinonimi (es. sticker/adesivi/etichette, mug/tazze), codice MOI e intenzione semplice (ristorante, negozio, evento, azienda).
- Percorsi per utilizzo basati su nomi e categorie realmente presenti. Sono suggerimenti commerciali, non certificazioni tecniche.
- Opzione per cercare contemporaneamente nei tre cataloghi. Un prodotto trovato da un altro servizio conserva il servizio corretto nel carrello; i dati prodotto non vengono duplicati.
- Card e scheda usano immagini responsive, alt, dimensioni dichiarate e caricamento differito delle card. Immagine mantenuta anche nel carrello.
- Filtri azzerabili, riprova caricamento in caso di errore; gestione delle richieste concorrenti quando si cambia ambito; focus contenuto nella scheda e ripristinato alla chiusura.
- Versioni CSS/JS aggiornate nel caricamento HTML. Nessun framework o servizio a pagamento introdotto; Pillow serve soltanto all'importazione offline.

## Verifiche eseguite
- `python3 tools/catalog_media.py audit`: tutti gli ID unici, riferimenti a file esistenti, immagini finali sotto 250 KB, hash non duplicati, registro rigenerato.
- `node tools/check_catalog.cjs`: copertura di tutti i prodotti nelle macroaree, sinonimi equivalenti, ricerca codice, risultato vuoto, percorsi non vuoti, ordine script e versioni, riferimenti immagini.
- Controlli di sintassi JavaScript/Python e `git diff --check`.
- Confronto visivo delle immagini selezionate: forma, testo dimostrativo, fondo, differenza fra le famiglie. Non è una garanzia di resa industriale o equivalenza esatta a un campione fisico.
- I tre JSON prodotto originali restano invariati: nessuna modifica a prezzi, quantità minime, colori, codici o assortimento.

## Verifiche NON completate e problemi aperti
1. Anteprima Netlify protetta con Team protection: verifica online non eseguita; nessuna protezione disattivata.
2. Il browser remoto non accede al server locale; il runtime locale non ha il binario Chromium. Nessuno screenshot desktop/mobile del sito modificato e nessuna dichiarazione di collaudo browser completo.
3. Da verificare a 390 e 1440 px: nessun overflow orizzontale, immagini caricate, interazioni touch, tastiera, riduzione movimento, scheda e carrello fra servizi. Gli stili responsive sono predisposti ma non equivalgono a queste prove.
4. 3.098 immagini ancora da produrre, con descrizioni e verifica di corrispondenza individuale. Gadget molto simili richiedono prima il confronto con la specifica scheda reale.
5. Dieci coppie di nomi ripetuti con ID diversi: non unite o cancellate. Confrontare la corrispondenza privata per verificare le differenze prima di modificare l'assortimento.
6. Varianti tecniche/formati/materiali dei prodotti non sono presenti in modo strutturato nei tre JSON. Non aggiunti filtri che fingano di possedere quei dati.

## Ripresa
1. Rileggere questo registro e l'ultima versione di `anteprima`, controllare cosa ha cambiato Claude e non sovrascriverlo.
2. Eseguire audit, scegliere righe non completate dall'inventario, consultare privatamente il riferimento corretto e pianificare piccoli lotti omogenei.
3. Generare un originale per codice; esaminare ogni risultato prima dell'importazione. Non usare un'unica foto per prodotti diversi e non passare una semplice variazione di tinta per un modello diverso.
4. Importare con `tools/catalog_media.py`, aggiungere la descrizione e i campi nel manifest solo dopo il controllo. Aggiornare prompt, registro, versioni risorse e verifiche.
5. Completare il collaudo reale prima di segnare prodotti come interamente conclusi. Alla data di questo checkpoint: 52 contenuti visivi pronti, 0 prodotti collaudati online end-to-end.

Il file privato del fornitore, i suoi link e i prezzi di acquisto non sono inclusi nel nuovo materiale pubblico.

## Lotti 05 e 06 — screenshot come riferimento strutturale
- Otto schede reali osservate nel browser e relativi screenshot usati direttamente come riferimento nella generazione. Gli screenshot non sono pubblicati e nessuna foto originale è distribuita come asset del sito.
- Lotto 05: GB8E91B (MOI BURGER, box hamburger), G01DA1E (MOI COFFEE, bicchieri), G313A6E (MOI BURGER, sacchetti con manici piatti), G65FC08 (MOI PIZZA, vassoi triangolari).
- Lotto 06: G1C9806 (MOI GELATO, coppette), GEF0E79 (MOI BAKERY, contenitori take-away), GA2CDF2 (MOI STREET FOOD, coni), G3B9EBA (MOI LAB, adesivi rotondi singoli).
- Otto nuove immagini originali, sedici file responsive, otto descrizioni. Grafica dimostrativa adatta al settore, interni dei contenitori senza alimenti per renderne leggibile la costruzione.
- Verificati forma generale, manici piatti, coperchi incernierati, bordi delle coppette e differenza fra adesivi singoli e su foglio. I mockup non sostituiscono la verifica su campioni fisici.
- Per articoli neutri o non personalizzabili: non mostrare stampe o opzioni che non risultino disponibili nella scheda reale.
- Versione manifest e caricamento catalogo aggiornata a 20261027-5.

## Checkpoint 31 immagini specifiche
- Aggiunti 8 mockup originali, dopo verifica dei riferimenti e del risultato. Codici: GBC4055, G0A7C37, G69C1EB, G49D5D8, G6421D4, GEF696D, GDE7624, GB6F998.
- Totale: 31 immagini integrate, 3090 ancora da produrre; verifica online end-to-end ancora in attesa.

## Checkpoint 41 immagini specifiche
- Aggiunti 10 mockup originali, dopo verifica dei riferimenti e del risultato. Codici: G843FF6, G382E86, G5110C8, G92B84E, G18644D, G822116, GA47AB4, G637137, G03A976, G871DF9.
- Totale: 41 immagini integrate, 3080 ancora da produrre; verifica online end-to-end ancora in attesa.

## Checkpoint 52 immagini specifiche
- Aggiunti 11 mockup originali, dopo verifica dei riferimenti e del risultato. Codici: GCEC902, GE3C817, G45372A, G2C109F, GD1D116, G3A65CF, G9127AA, G4E395B, G60408C, G9B5A6F, G8249FB.
- Totale: 52 immagini integrate, 3069 ancora da produrre; verifica online end-to-end ancora in attesa.

- 28/10/2026 — Lotto A01: 50 mockup verificati (48 nuovi, 2 recuperati); nessun codice saltato. Totale metà A: 50/1.520. Codici: G58144B, G9DB847, GD2B3DD, G695C27, G424444, G2FB50E, G9C4D21, G04B7CF, GF93C05, G94E26D, G6F5584, G4AC9E9, G272876, GC40BA8, G10BA02, GF9EFE5, G9A06C1, G334CB3, G6459A9, G808C3E, GF4C96C, G56D0F4, G50B659, G2C8BD5, GA18840, G2EF191, G3FD4BC, G3CF381, GD0045A, GBF1BF9, G6ECFCD, G4FDF02, GEE043B, GB3FDA6, G2C3B06, GAF23F2, G79D699, G8C61D7, G5789BF, G88BF20, G47925E, G323293, GD211BB, G546065, GB9FF6A, G45141F, G9A68FD, G573E6F, GFE5A5E, G7DBC27. Audit e check_catalog superati. QR in G45141F solo dimostrativo. Nessuna modifica a interfaccia, prodotti o registro Claude.
