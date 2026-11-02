# React Bits come libreria di riferimento

## Fonte canonica

- Catalogo per agenti: https://reactbits.dev/llms.txt
- Galleria: https://reactbits.dev/
- Le sezioni comprendono UI Components, Animations, Backgrounds, Text Animations e Micro.
- La raccolta e le sue varianti cambiano: ricontrollare il catalogo e la pagina del singolo elemento quando si avvia un nuovo intervento visivo. Non trattare questo file come copia completa o aggiornata dell'intera galleria.

## Quando consultarla

Per ogni richiesta che modifica o progetta il sito — soprattutto layout, hero, card, menu, gallerie, sfondi, transizioni, scroll, microinterazioni o animazioni — consultare il catalogo e individuare gli elementi React Bits pertinenti prima di scegliere un'implementazione. Considerare React Bits come una libreria di possibilità e una fonte di ispirazione concreta, non come un obbligo ad aggiungere un effetto a ogni sezione.

Quando si genera un'immagine destinata al sito, usare React Bits per orientare il comportamento e la presentazione dell'interfaccia che ospita l'immagine (per esempio reveal, parallax, frame o carousel) se è pertinente; non sostituire con un componente un'immagine statica che non richiede interazione.

## Procedura

1. Consultare `https://reactbits.dev/llms.txt` e aprire la pagina del componente candidato per controllarne API, variante, codice, dipendenze, accessibilità e licenza attuali.
2. Cercare prima nel repository eventuali porting o componenti già presenti. Preferire il riuso o l'estensione coerente di questi, evitando duplicati.
3. Scegliere l'effetto in base allo scopo della pagina, allo stile MOI LAB, ai dispositivi mobili e alla leggibilità. Spiegare brevemente quale riferimento si è scelto e perché.
4. Verificare se l'esempio richiede React, GSAP, Motion, Three.js, OGL o altre dipendenze. Questo repository è un sito statico in HTML/CSS/JavaScript senza build: mantenere questa architettura e adattare l'effetto a JavaScript/CSS vanilla quando fattibile. Non introdurre framework, build o dipendenze pesanti solo per replicare una demo; se una dipendenza o una migrazione architetturale è davvero necessaria, descriverne prima impatto e alternativa.
5. Mantenere interazioni utilizzabili con tastiera e touch, rispettare `prefers-reduced-motion`, non bloccare scroll o focus, e prevedere un fallback per dispositivi o browser senza WebGL quando serve.
6. Riportare nel riepilogo il riferimento React Bits usato, la modalità di adattamento e le dipendenze aggiunte (se ce ne sono). Se nessun elemento è adatto, dirlo e implementare la soluzione più semplice coerente con il sito.

## Licenza e attribuzione

React Bits è open source, ma controllare la licenza del singolo componente e le condizioni applicabili al relativo codice prima di copiarlo o adattarlo. Non presumere che tutti gli elementi abbiano la stessa licenza. Conservare gli avvisi di copyright/licenza richiesti; non importare codice da React Bits Pro o altre aree a pagamento senza che sia stato richiesto e autorizzato esplicitamente.

## Riferimenti già presenti nel sito

Il README documenta già adattamenti React Bits in JavaScript/CSS vanilla, tra cui Accordion Gallery, Scroll Expand, Galaxy, Swarm Cursor, Sling Button, Flex Carousel, Option Wheel, Specular Button, Hold Button, Slide Commit, Sticker Peel e altri. Consultare `README.md` e cercare in `assets/` prima di creare un nuovo effetto.
