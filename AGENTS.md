# AGENTS.md — istruzioni per gli agenti AI (Codex/ChatGPT, Claude Code e altri)

Questo file vale per **tutti** gli agenti che lavorano sul repository. `CLAUDE.md` lo importa.
Lingua di lavoro con il titolare: **italiano**, semplice e senza gergo tecnico non necessario.

## Il progetto
- Sito vetrina di **MOI LAB** ("creative solutions for real business"): servizi Apparel, Custom, Automotive, Signage, Design, Digital.
- **Sito statico**: HTML + CSS + JavaScript, **nessun framework e nessuna build** (vedi `netlify.toml`). Dettagli in `README.md`.
- Avvio in locale: `python3 -m http.server 8000` → http://localhost:8000

## Regole che non si discutono
1. **Mai pubblicare senza approvazione.** `main` = sito pubblico. Si lavora su branch; per far vedere le modifiche si usa il branch `anteprima` (deploy di prova gratuito su Netlify). Si porta su `main` solo dopo che il titolare scrive **"pubblica"** (ogni deploy di produzione consuma crediti Netlify).
2. **Il repository è pubblico:** non inserire mai costi d'acquisto dei fornitori, listini privati, chiavi API, password o dati personali. I file privati restano fuori dal repository.
3. **Password e accessi** li inserisce sempre il titolare, mai l'agente.
4. **Un agente alla volta sulla stessa area:** lavora, fa commit con un messaggio chiaro, poi passa la mano.
5. **Non cancellare** dati, prodotti, URL, testi SEO o funzioni esistenti senza richiesta esplicita.
6. **Nessun dato inventato** nel catalogo (prezzi, conteggi, classificazioni).
7. Dopo modifiche a CSS/JS aggiornare il parametro di versione `?v=AAAAMMGG-N` nei link di `index.html` (o nell'import che li carica), altrimenti i browser mostrano la versione vecchia.

## Struttura essenziale
- `index.html` — home + "stanze" dei servizi (`.moi-room`, aperte da `assets/door.js` con l'hash `#moi-showroom-<servizio>`).
- `assets/` — stili e script condivisi. Animazioni: `moi-motion.js`/`.css`, `sticker-peel.js`, `portfolio-ring.js`.
- `apparel/` — catalogo (`browse.mjs` ricerca/filtri, `catalog.mjs` scheda prodotto). Dati in `data/apparel/`; dopo modifiche ai dati: `python3 tools/build_percorsi.py`.
- `automotive/`, `digital/`, `sticker/` — logiche dei singoli servizi.
- `docs/` — documentazione per gli agenti.

## Interfacce e animazioni
Prima di creare o modificare animazioni o componenti UI leggi **`docs/animation-libraries.md`**. In sintesi:
- Librerie di riferimento: React Bits, Aceternity UI, Magic UI, GSAP, Motion, Codrops, Uiverse, Animata.
- Il sito **non usa React né Tailwind**: i componenti React (React Bits, Magic UI, Animata, Aceternity) vanno **riscritti in JavaScript semplice**; HTML/CSS (Uiverse, demo Codrops) si adattano direttamente; GSAP e Motion sono JavaScript puro ma **non sono ancora installati** e vanno aggiunti solo se un effetto lo richiede.
- Riutilizza prima gli effetti già pronti in `assets/moi-motion.js`.
- Solo componenti gratuiti con licenza compatibile con l'uso commerciale; annota la fonte in un commento.
- Rispetta l'identità visiva (nero/oro in home, carta/nero nei servizi, stile pixel nel Digital), una sola animazione forte per pagina, catalogo calmo, `prefers-reduced-motion` sempre rispettato.
- Il codice deve restare compatibile con un futuro passaggio a WordPress: niente build obbligatoria, CSS con prefisso, niente globali generiche.

## Verifica prima di consegnare
- Nessun errore in console; nessuno scorrimento orizzontale su telefono (390 px) e computer (1440 px).
- Prova con Playwright o nel browser: computer e telefono.
- Mostra il risultato al titolare (pagina di prova o `anteprima`) e aspetta il suo OK.
