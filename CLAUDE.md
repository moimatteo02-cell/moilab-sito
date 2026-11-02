# Istruzioni per Claude Code

Prima di intervenire sul sito:

1. Leggi `AGENTS.md`, `README.md` e le istruzioni specifiche dell'area che toccherai.
2. Per interfaccia, layout, immagini in UI, componenti, sfondi, animazioni o interazioni, segui `docs/react-bits.md` e consulta il catalogo aggiornato https://reactbits.dev/llms.txt.
3. Riusa i porting e i pattern già presenti nel repository. Il sito è statico HTML/CSS/JavaScript senza build: non aggiungere React o dipendenze pesanti senza motivazione e senza documentarne l'impatto.
4. Lavora su `anteprima`; non modificare `main` senza l'esplicito «pubblica» dell'utente.
5. Evita di lavorare contemporaneamente sulla stessa pagina di ChatGPT o di un altro agente; lascia un commit chiaro e passa la mano.

Per ogni modifica visiva, riassumi quale riferimento React Bits hai considerato, cosa hai riusato o adattato e quali dipendenze hai introdotto.
