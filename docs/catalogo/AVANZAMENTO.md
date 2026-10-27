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
- 16 generazioni eseguite con lo strumento integrato imagegen; 15 mockup selezionati, controllati e integrati, uno scartato prima dell'importazione perché le proporzioni indicate non coincidevano con il riferimento. La seconda versione del biglietto pieghevole usa il riferimento corretto.
- 30 file WebP finali: due risoluzioni per ciascuno dei 15 prodotti. Nomi contenenti codice MOI e nome prodotto; nessuna condivisione accidentale dell'immagine fra codici.
- Lotto 01: GC28FAA, GFC7832, GE9DA2C, GF7FF12 (biglietti lucidi, quadrati, standard, Kraft).
- Lotto 02: GD82566, G868CC6, G8BF630 (biglietti arrotondati, opachi, Soft Touch).
- Lotto 03: G26787E, GA9A0EF, G6AEAF8, G1EDAC9 (pieghevoli, scatole postali, astucci ovali, adesivi rotondi su foglio).
- Lotto 04: GAAED0B, GFE3104, G58A315, G18186A (roll up, striscioni, poster, cartelli in plastica ondulata).
- 3.106 prodotti ancora senza immagine specifica. Le illustrazioni precedenti restano per non nascondere/eliminare prodotti: NON valgono come completamento.
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
4. 3.106 immagini ancora da produrre, con descrizioni e verifica di corrispondenza individuale. Gadget molto simili richiedono prima il confronto con la specifica scheda reale.
5. Dieci coppie di nomi ripetuti con ID diversi: non unite o cancellate. Confrontare la corrispondenza privata per verificare le differenze prima di modificare l'assortimento.
6. Varianti tecniche/formati/materiali dei prodotti non sono presenti in modo strutturato nei tre JSON. Non aggiunti filtri che fingano di possedere quei dati.

## Ripresa
1. Rileggere questo registro e l'ultima versione di `anteprima`, controllare cosa ha cambiato Claude e non sovrascriverlo.
2. Eseguire audit, scegliere righe non completate dall'inventario, consultare privatamente il riferimento corretto e pianificare piccoli lotti omogenei.
3. Generare un originale per codice; esaminare ogni risultato prima dell'importazione. Non usare un'unica foto per prodotti diversi e non passare una semplice variazione di tinta per un modello diverso.
4. Importare con `tools/catalog_media.py`, aggiungere la descrizione e i campi nel manifest solo dopo il controllo. Aggiornare prompt, registro, versioni risorse e verifiche.
5. Completare il collaudo reale prima di segnare prodotti come interamente conclusi. Alla data di questo checkpoint: 15 contenuti visivi pronti, 0 prodotti collaudati online end-to-end.

Il file privato del fornitore, i suoi link e i prezzi di acquisto non sono inclusi nel nuovo materiale pubblico.
