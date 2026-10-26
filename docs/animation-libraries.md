# Librerie di animazioni e componenti UI — guida per MOI LAB

Documento di riferimento condiviso da **Claude Code** e **ChatGPT/Codex**.
Ultima verifica di licenze e requisiti: **26 ottobre 2026**. Le licenze cambiano: ricontrollale prima di usare un componente nuovo.

---

## 1. Il progetto in breve (vincoli che decidono tutto)

| Aspetto | Situazione attuale | Conseguenza per le animazioni |
|---|---|---|
| Framework | **Nessuno.** HTML + CSS + JavaScript (ES modules e script classici) | I componenti React **non si possono incollare**: vanno riscritti in JavaScript semplice |
| Build | **Nessuna** (`netlify.toml`: `command = ""`) | Niente npm/bundler nel sito pubblico; niente Tailwind compilato |
| Dipendenze | **Zero** librerie esterne caricate dal sito | Ogni libreria aggiunta è peso e rischio in più: va giustificata |
| Hosting | Netlify (statico). Branch `anteprima` = prova gratuita, `main` = sito pubblico | Si lavora su branch; si pubblica solo dopo il "pubblica" del titolare |
| Compatibilità WordPress | Alta: il sito è già fatto di file statici | In WordPress basta un tema/plugin che carichi gli stessi CSS/JS (`wp_enqueue_style` / `wp_enqueue_script`) |
| Animazioni esistenti | `assets/moi-motion.js` + `.css`, `assets/sticker-peel.js`, `assets/portfolio-ring.js`, `apparel/pdp-loader.mjs` | Riutilizzare questi prima di aggiungere altro |

**Regola d'oro:** una pagina pubblica di MOI LAB non deve caricare React, Tailwind CDN o un framework solo per un effetto.

### Cosa serve per essere "compatibile WordPress"
- Nessun passaggio di build obbligatorio; file `.js` e `.css` serviti così come sono.
- Niente variabili globali generiche: tutto dentro funzioni immediate `(() => { ... })()` o moduli.
- CSS con prefisso o ambito (`.mm-…`, `#moi-…`) per non scontrarsi con tema e plugin.
- Nessun conflitto con jQuery (WordPress lo carica spesso): non usare `$` globale.
- Rispetto di `prefers-reduced-motion`.
- Librerie esterne (GSAP, Motion) **salvate nel progetto** con versione fissa, non prese da CDN a ogni visita.

---

## 2. Identità visiva da rispettare

| Area | Colori | Caratteri | Tono delle animazioni |
|---|---|---|---|
| Home | nero `#0b0b0c`, grafite `#151515`, oro `#c8aa77` / `#d6bd8e` / `#8a7552` | Helvetica Neue; *Moi Editorial* (corsivo); *Moi Calligraphy* | Lente, eleganti, "di lusso": sfocature, riflessi oro, luce |
| Servizi (Apparel, Custom, Signage, Design) | carta `#f6f5f2`, testo `#151515`, linee `#1818181a`, oro come accento | Helvetica Neue | Discrete; una sola animazione "forte" per pagina |
| Automotive | verde `#2f5a46`, carta chiara | Helvetica Neue | Funzionali (configuratore, riflesso carrozzeria) |
| Digital | carta pixel `#f4f1ea`, verde `#1f3b34` / `#2f6f5e`, giallo `#ffd166`, rosso `#ff5a5f` | monospazio | Giocose, "software": pixel, decodifica, scintille |
| Catalogo Apparel | carta, nero | Helvetica Neue | **Quasi nessuna**: foto e prezzi sono i protagonisti |

Principi (validi per entrambe le AI):
1. **Ogni animazione deve avere un motivo legato al servizio** (es. adesivo che si stacca = prodotto sticker).
2. **Una sola animazione forte per pagina.** Le altre sono di contorno.
3. **Dove si compra, calma.** Niente effetti che distraggono da prezzi, foto e pulsante preventivo.
4. **Durata sotto 1 secondo** per ciò che blocca la lettura; i testi non devono "farsi aspettare".
5. **Telefono prima di tutto:** niente effetti solo-mouse indispensabili; niente 3D pesante.
6. **Mai cursori personalizzati** sul sito pubblico.

---

## 3. Le librerie

Legenda stato per MOI LAB:
- ✅ **Compatibile diretta** — si può usare senza React (eventualmente salvando un file nel progetto).
- 🔁 **Da riscrivere** — gratuita e con licenza adatta, ma è React/Tailwind: si prende l'idea o il codice e si riscrive in JavaScript semplice.
- 📚 **Solo riferimento** — usata come fonte di idee e tecniche; non si copia nel sito.

| Libreria | Licenza (gratuito) | Tecnologia | Stato | Note per MOI LAB |
|---|---|---|---|---|
| **React Bits** | MIT + Commons Clause (uso commerciale OK nel proprio sito; vietato rivendere i componenti) | React; varianti JS/TS e CSS/Tailwind | 🔁 Da riscrivere | Fonte principale: già usata (Sticker Peel, Hold Button, Spotlight, Pixel Transition…). Scegliere sempre la variante **JS + CSS**: è la più facile da tradurre. **Pro** a pagamento: escluso salvo acquisto |
| **Aceternity UI** | Componenti gratuiti: termini non pubblicati in modo esplicito (la pagina licenza descrive la versione Pro) | React + Next.js + Tailwind + Motion | 📚 Solo riferimento | Bello ma molto "startup americana"; prendere solo idee. Prima di copiare codice: verificare la licenza del singolo componente |
| **Magic UI** | MIT | React + TypeScript + Tailwind + Motion | 🔁 Da riscrivere | Ottimo per effetti testo, bordi animati, marquee. Ha un **MCP ufficiale** (`@magicuidesign/mcp`) che restituisce il codice dei componenti |
| **GSAP** (+ ScrollTrigger, SplitText, Flip…) | Gratuito al 100% anche per uso commerciale, plugin inclusi ("Standard No Charge License", da quando è di Webflow). Unico divieto rilevante: usarlo in strumenti visivi "senza codice" per creare animazioni che fanno concorrenza a Webflow (non riguarda un sito come questo) | JavaScript puro, nessun framework | ✅ Compatibile diretta | La scelta migliore se servono timeline complesse o animazioni legate allo scroll. Peso: alcune decine di KB (core + solo i plugin scelti). **Non ancora installato**: aggiungerlo solo quando un effetto lo richiede davvero |
| **Motion** (motion.dev) | MIT (Motion+ a pagamento: esempi e strumenti extra) | JavaScript puro **e** React | ✅ Compatibile diretta | Versione JavaScript leggera (`animate`, `scroll`, `inView`), molle fisiche. Alternativa più leggera a GSAP per animazioni semplici. Ha un kit AI con **MCP della documentazione gratuito** (`npx motion-ai`) |
| **Codrops** | Demo: MIT salvo indicazione diversa; "freebies" grafici: uso commerciale sì, ridistribuzione no | HTML/CSS/JS (spesso GSAP, Three.js, WebGL) | 📚 Riferimento + ✅ demo MIT | Miglior fonte di effetti "editoriali" ed eleganti, molto in linea con la home. Controllare la licenza di **ogni** demo e mantenere l'avviso MIT nel file |
| **Uiverse** | MIT, attribuzione non obbligatoria (gradita) | HTML + CSS (alcuni Tailwind) | ✅ Compatibile diretta | Pulsanti, loader, toggle, input in puro CSS: si adattano in minuti. Qualità variabile: adattare sempre colori e font MOI LAB |
| **Animata** | MIT | React + Tailwind (Motion opzionale) | 🔁 Da riscrivere | Micro-animazioni, testi, card. Utile come idea; da riscrivere |

### Cosa NON usare sul sito pubblico
- Tailwind via CDN (pesante, cambia gli stili globali).
- React/Next.js caricato solo per un componente.
- Componenti Three.js/WebGL pesanti (Lanyard, Fluid Glass, Ballpit, Hyperspeed…) salvo un motivo forte: il sito ha già l'anello 3D e Sticker Peel.
- Componenti Pro o a pagamento senza licenza acquistata.

---

## 4. Come lavorare (processo ripetibile, uguale per Claude e Codex)

1. **Perché?** Scrivi in una riga quale problema risolve l'animazione (attenzione, comprensione, fiducia, conversione). Se non c'è un perché, non si fa.
2. **Dove?** Una sola area/servizio. Controlla che la pagina non abbia già un effetto "forte".
3. **Cerca prima in casa:** `assets/moi-motion.js` ha già 18 effetti riutilizzabili (vedi §6).
4. **Scegli la fonte** in quest'ordine: Uiverse/Codrops (già HTML/CSS/JS) → React Bits / Magic UI / Animata (da riscrivere) → GSAP o Motion solo se servono timeline/scroll complessi.
5. **Licenza:** controlla la licenza del singolo componente; annota la fonte in un commento in testa al codice.
6. **Riscrivi** in JavaScript semplice (vedi §5), con i colori e i font MOI LAB.
7. **Prova** in locale (`python3 -m http.server`) su computer e telefono simulato (Playwright): nessun errore in console, nessuno scorrimento orizzontale, `prefers-reduced-motion` rispettato.
8. **Mostra** al titolare: pagina di prova o branch `anteprima`. **Mai** su `main` senza il suo "pubblica".

---

## 5. Ricetta: da componente React a JavaScript semplice

1. Prendi la variante **JS + CSS** (React Bits) o il file `.tsx` (Magic UI/Animata).
2. Copia il CSS cambiando i nomi delle classi con un prefisso (`mm-…`) e convertendo Tailwind in CSS normale.
3. Trasforma il componente in una funzione `nomeEffetto(elemento, opzioni)`:
   - `useRef` → l'elemento passato o `querySelector`;
   - `useState` → variabili locali + `dataset`/classi CSS;
   - `useEffect(() => { …; return cleanup })` → codice eseguito subito + funzione `destroy()` restituita;
   - props → oggetto `opzioni` con gli stessi valori predefiniti.
4. `motion/react` o `framer-motion` → transizioni CSS, Web Animations API (`element.animate`) o Motion vanilla.
5. `gsap` → resta GSAP (è JavaScript puro) se è davvero necessario; altrimenti CSS.
6. Icone `@hugeicons`/`lucide-react` → SVG inline (vedi `apparel/icons.mjs`).
7. Carica il codice pesante **solo quando serve** (esempio: `sticker-peel.js` parte solo all'apertura di Custom).
8. Aggiungi sempre il ramo `prefers-reduced-motion`.

Esempio reale nel progetto: `assets/sticker-peel.js` (porting meccanico di Sticker Peel di React Bits: il corpo di `useEffect` è diventato il corpo di una funzione).

---

## 6. Effetti già pronti nel progetto (`assets/moi-motion.js`)

| # | Effetto | Origine | Dove si usa |
|---|---|---|---|
| 1 | Comparsa allo scorrimento | Fade/Animated Content | sezioni dei servizi |
| 2 | Menu a tendina a veli | Staggered Menu | menu ☰ della home |
| 3 | Pulsante magnetico | Magnet | CTA principali |
| 4 | Testo parola per parola con sfocatura | Split/Blur Text | titolo home |
| 5 | Riflesso oro sul testo | Shiny Text | kicker home |
| 6 | Luce che segue il mouse | Spotlight Card | card servizi home |
| 7 | Grana pellicola | Noise | sfondo home |
| 8 | Numero che sale | Count Up | "400 modelli" (in `apparel/browse.mjs`) |
| 9 | Battito del cuore | Pulse Heart | preferiti scheda prodotto |
| 10 | Adesivo che si stacca (WebGL) | Sticker Peel | Custom |
| 11 | Configuratore a passi | Stepper | modulo Automotive |
| 12 | Riflesso sulle foto | Glare Hover | Automotive |
| 13 | Insegna al neon | variante Shiny/Glitch | titolo Signage |
| 14 | Lettere che reagiscono al mouse | Variable Proximity | titolo Design |
| 15 | Testo che si decodifica | Decrypted Text | titolo Digital |
| 16 | Card a pixel | Pixel Transition | servizi Digital |
| 17 | Scintille al clic | Click Spark | pulsanti Digital |
| 18 | Tieni premuto | Hold Button (Micro) | "Provalo" Digital |

---

## 7. MCP: serve configurarlo?

| MCP | Cosa fa | Utile per MOI LAB? |
|---|---|---|
| **shadcn MCP** (`npx shadcn@latest mcp`) — usato da React Bits, Aceternity, Magic UI tramite registri | Cerca e **installa** componenti in un progetto React con `components.json` | **No, per ora.** Il sito non è React: installerebbe file inutilizzabili. Utile solo in un progetto React separato |
| **Magic UI MCP ufficiale** (`@magicuidesign/mcp`, MIT) | Elenca e restituisce il **codice** dei componenti Magic UI | **Facoltativo.** Comodo per leggere il codice da riscrivere; non modifica il progetto |
| **Motion AI Kit** (`npx motion-ai`, MCP della documentazione gratuito; quello Motion+ è a pagamento) | Documentazione Motion dentro l'agente | **Facoltativo**, solo se si adotta Motion. Supporta Claude Code; Codex non è nell'elenco ufficiale |
| React Bits Pro MCP | Installa componenti Pro | **No**: richiede licenza Pro e progetto React |
| GSAP, Codrops, Uiverse, Animata | Nessun MCP ufficiale verificato | — Si lavora con i file sorgente e la documentazione |

**Raccomandazione:** nessuna configurazione MCP nel repository adesso (eviterebbe dipendenze e permessi in più per entrambi gli agenti). Se in futuro si fanno molti porting da Magic UI, aggiungere il suo MCP **sul computer dello sviluppatore**, non nel sito.

Esempi di configurazione (da usare solo se deciso):
- Claude Code: `claude mcp add magicui -- npx -y @magicuidesign/mcp@latest`
- Codex (`~/.codex/config.toml`):
  ```toml
  [mcp_servers.magicui]
  command = "npx"
  args = ["-y", "@magicuidesign/mcp@latest"]
  ```

---

## 8. Installazioni consigliate

| Cosa | Consiglio | Quando |
|---|---|---|
| Nessuna libreria nuova | ✅ **Adesso** | Gli effetti attuali sono già in JavaScript semplice, senza dipendenze |
| GSAP (core + ScrollTrigger) salvato in `assets/vendor/gsap/` con versione fissa | ⏳ **Solo al primo progetto che lo richiede** | Animazioni legate allo scroll, timeline lunghe, titoli spezzati per lettera su molte pagine |
| Motion (vanilla) in `assets/vendor/motion/` | ⏳ Alternativa più leggera a GSAP | Molle fisiche e animazioni semplici, se GSAP non serve |
| Progetto separato `ui-lab` (React + Tailwind + shadcn MCP) **fuori dal sito** | ⏳ Facoltativo | Se si vogliono provare molti componenti React prima di riscriverli |

---

## Fonti
- React Bits: https://reactbits.dev — repository e licenza: https://github.com/DavidHDev/react-bits
- React Bits Pro (MCP, licenza): https://pro.reactbits.dev/docs/mcp — https://pro.reactbits.dev/about
- Aceternity UI: https://ui.aceternity.com — CLI/registro: https://ui.aceternity.com/docs/cli — licenza: https://ui.aceternity.com/licence
- Magic UI: https://magicui.design — MCP ufficiale: https://glama.ai/mcp/servers/@magicuidesign/mcp
- GSAP gratuito: https://webflow.com/blog/gsap-becomes-free — testo della licenza: https://scancode-licensedb.aboutcode.org/gsap-standard-no-charge-2025.html
- Motion: https://motion.dev — README/licenza: https://cdn.jsdelivr.net/npm/motion@12.38.0/README.md — AI Kit: https://motion.dev/docs/studio-install
- Codrops (licenze): https://tympanus.net/codrops/?p=7319
- Uiverse (licenza MIT): https://cdn.jsdelivr.net/gh/uiverse-io/galaxy@master/README.md
- Animata: https://raw.githubusercontent.com/codse/animata/main/README.md
- shadcn MCP: https://ui.shadcn.com/docs/mcp
