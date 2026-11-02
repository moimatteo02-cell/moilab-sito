/* MOI LAB — stanza DESIGN, interattiva.
   2 chiacchierata (brief guidato) → WhatsApp o carrello del preventivo
   3 come nasce un marchio: si guida scorrendo, toccando i passi o trascinando la tavola
   4 cosa creiamo: le card scorrono di lato mentre scendi; «Chiedilo» porta alla chiacchierata con la voce già scelta */
(() => {
'use strict';
const room = document.getElementById('moi-showroom-design');
const dz = room && room.querySelector('.dz'); if (!dz) return;
const $ = (s, r = dz) => r.querySelector(s), $$ = (s, r = dz) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const WA = '393278815148';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const toEl = (el, block = 'start') => el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block });

/* entrata nella stanza */
const draw = () => { if (!dz.classList.contains('is-drawn')) requestAnimationFrame(() => requestAnimationFrame(() => dz.classList.add('is-drawn'))); };
new MutationObserver(() => { if (room.classList.contains('is-active')) draw(); else dz.classList.remove('is-drawn'); }).observe(room, { attributes: true, attributeFilter: ['class'] });

/* ---------- la chiacchierata ---------- */
const LOGO_NO = 'Sì, e va bene così';
const needsLogo = a => a.logo !== LOGO_NO && (!a.serve || a.serve.some(s => /logo|identità|consigliatemi/i.test(s)));
const Q = [
  { id: 'nome', ask: 'Ciao! Partiamo da te: come si chiama la tua attività o il tuo progetto?', type: 'text', ph: 'Es. Pasticceria Sole', req: true, label: 'Nome' },
  { id: 'attivita', ask: a => `Piacere, ${a.nome}! Di cosa vi occupate, in una frase?`, type: 'text', ph: 'Es. dolci artigianali e colazioni', label: 'Attività' },
  { id: 'serve', ask: 'Cosa ti serve?', hint: 'Puoi sceglierne più di una.', type: 'multi', label: 'Cosa serve',
    opts: ['Logo nuovo', 'Rinnovare il logo', 'Identità completa (logo, colori, font)', 'Grafica per i social', 'Grafica per la stampa', 'Packaging ed etichette', 'Design di un sito', 'Non lo so, consigliatemi'] },
  { id: 'logo', ask: 'Hai già un logo?', type: 'one', label: 'Logo attuale', opts: ['No, partiamo da zero', 'Sì, ma va rinnovato', LOGO_NO],
    after: v => v !== 'No, partiamo da zero' ? 'Perfetto: alla fine potrai mandarcelo su WhatsApp, così lo guardiamo insieme.' : '' },
  { id: 'valori', ask: 'Cosa vuoi che trasmetta, a colpo d’occhio?', hint: 'Scegli fino a 3 parole.', type: 'multi', max: 3, label: 'Da trasmettere',
    opts: ['Affidabile', 'Elegante', 'Giovane', 'Artigianale', 'Moderno', 'Giocoso', 'Lusso', 'Naturale', 'Tecnologico', 'Audace', 'Essenziale', 'Tradizione'] },
  { id: 'tipo', ask: 'Che tipo di logo ti immagini?', hint: 'Sono solo esempi con il tuo nome, per capirci. Anche più di uno.', type: 'logos', when: needsLogo, label: 'Tipo di logo' },
  { id: 'versioni', ask: 'Ti servono più versioni del logo?', hint: 'Per esempio una larga per l’insegna e una piccola per i social.', type: 'one', when: needsLogo, label: 'Versioni',
    opts: ['Sì: principale, ridotta e icona', 'Ne basta una', 'Non so, consigliatemi'] },
  { id: 'sito', ask: 'Per il sito: ne hai già uno?', hint: 'Il design lo curiamo noi, la parte tecnica la segue MOI Digital.', type: 'one', when: a => (a.serve || []).includes('Design di un sito'), label: 'Sito',
    opts: ['No, va creato', 'Sì, va rifatto il design'], note: 'Indirizzo del sito · facoltativo' },
  { id: 'dove', ask: 'Dove lo vedranno i tuoi clienti?', hint: 'Così lo pensiamo da subito per funzionare ovunque.', type: 'multi', label: 'Dove si usa',
    opts: ['Insegna', 'Abbigliamento', 'Veicoli', 'Social', 'Sito web', 'Biglietti e stampa', 'Packaging'] },
  { id: 'rif', ask: 'Ci sono marchi o stili che ti piacciono? (O che proprio non ti piacciono.)', type: 'text', ph: 'Nomi, link, colori…', label: 'Riferimenti' },
  { id: 'budget', ask: 'Quanto pensi di investire? Scrivilo come preferisci.', hint: 'Ci aiuta a proporti la soluzione giusta, senza sorprese.', type: 'text', ph: 'Una cifra indicativa', quick: ['Non lo so ancora'], label: 'Budget' },
  { id: 'tempi', ask: 'Ultima domanda: entro quando ti servirebbe?', type: 'one', label: 'Tempi', opts: ['Prima possibile', 'Entro un mese', 'Senza fretta'] }
];
const brief = $('#dz-brief'); if (!brief) return;
const thread = $('.dz-thread', brief), pad = $('.dz-pad', brief), bar = $('.dz-bar i', brief), count = $('.dz-count', brief);
let A = {}, stack = [], started = false, busy = false; const P = {};

const active = () => Q.filter(q => !q.when || q.when(A));
function progress(i) {
  const board = $('[data-live-art]');
  if (board) { const kind = LOGOS.find(([,label]) => (A.tipo || []).includes(label))?.[0] || 'logotipo'; board.innerHTML = sample(kind, A.nome || 'La tua idea'); $('[data-live-caption]').textContent = A.valori?.length ? A.valori.join(' · ') : A.attivita || 'Il tuo nome è il primo tratto.'; }
  const n = active().length, k = Math.min(i, n);
  bar.style.width = (k / n * 100).toFixed(1) + '%';
  count.textContent = i >= n ? 'Fatto' : `Domanda ${i + 1} di ${n}`;
}
const keep = () => { const r = pad.getBoundingClientRect(), rr = room.getBoundingClientRect(); if (r.bottom > rr.bottom - 90 || r.top < rr.top) pad.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' }); };

function bubble(who, html) {
  const b = document.createElement('div'); b.className = 'dz-msg dz-' + who;
  b.innerHTML = who === 'me' ? `<p>${html}</p>` : `<span class="dz-av" aria-hidden="true"><svg viewBox="0 0 42 43"><path pathLength="1" d="M4 34V9l17 18L38 9v25"/></svg></span><p>${html}</p>`;
  thread.append(b); thread.scrollTop = thread.scrollHeight; return b;
}
async function say(html) {
  const b = bubble('st', '<span class="dz-dots"><i></i><i></i><i></i></span>');
  await wait(520); b.querySelector('p').innerHTML = html; thread.scrollTop = thread.scrollHeight; return b;
}

/* esempi di logo disegnati col nome del cliente (solo per capirsi, non sono proposte) */
let sampleId = 0;
function sample(kind, name) {
  const arcId = `dz-arc-${++sampleId}`;
  const N = (name || 'Il tuo nome').trim().slice(0, 18), W = N.split(/\s+/).filter(Boolean);
  const I = (W.length > 1 ? W[0][0] + W[1][0] : N.slice(0, 2)).toUpperCase();
  const fs = Math.max(13, Math.min(26, 230 / Math.max(N.length, 4)));
  const t = (x, y, s, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${s}" ${extra}>${esc(N)}</text>`;
  const G = {
    logotipo: `${t(100, 68, fs + 2, 'font-weight="700" letter-spacing="-.5"')}<path d="M70 80h60" class="gs" stroke-width="2"/>`,
    simbolo: `<g transform="translate(100 40)"><circle r="17" fill="none" stroke="currentColor" stroke-width="3"/><path d="M-9 8V-8l9 9 9-9V8" fill="none" class="gs" stroke-width="3" stroke-linejoin="round"/></g>${t(100, 90, fs * .8, 'font-weight="600"')}`,
    monogramma: `<rect x="72" y="20" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="100" y="60" text-anchor="middle" font-size="30" class="ed gf">${esc(I)}</text><text x="100" y="98" text-anchor="middle" font-size="9" letter-spacing="3">${esc(N.toUpperCase().slice(0, 16))}</text>`,
    emblema: `<circle cx="100" cy="58" r="44" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="58" r="37" fill="none" stroke="currentColor" stroke-width=".8"/><path id="${arcId}" d="M70 58a30 30 0 0 1 60 0" fill="none"/><text font-size="7" letter-spacing="1.4"><textPath href="#${arcId}" startOffset="50%" text-anchor="middle">${esc(N.toUpperCase().slice(0, 14))}</textPath></text><text x="100" y="76" text-anchor="middle" font-size="22" font-weight="700" class="gf">${esc(I)}</text>`,
    consiglio: `<text x="100" y="66" text-anchor="middle" font-size="40" class="ed gf">?</text><text x="100" y="94" text-anchor="middle" font-size="9" letter-spacing="2">LO SCEGLIAMO INSIEME</text>`
  };
  return `<svg viewBox="0 0 200 116" aria-hidden="true">${G[kind]}</svg>`;
}
const LOGOS = [['logotipo', 'Solo scritta'], ['simbolo', 'Simbolo + scritta'], ['monogramma', 'Monogramma'], ['emblema', 'Emblema o timbro'], ['consiglio', 'Consigliatemi voi']];

function controls(q) {
  pad.innerHTML = '';
  const f = document.createElement('form'); f.className = 'dz-form'; f.noValidate = true;
  const pick = () => $$('[aria-pressed=true]', f).map(b => b.dataset.v);
  if (q.type === 'text') {
    f.innerHTML = `${q.quick ? `<div class="dz-chips">${q.quick.map(v => `<button type="button" class="dz-chip" data-quick="${esc(v)}">${esc(v)}</button>`).join('')}</div>` : ''}
      <div class="dz-row"><input class="dz-in" type="text" maxlength="240" placeholder="${esc(q.ph || '')}" aria-label="${esc(q.label)}" autocomplete="off"><button class="dz-send" type="submit" aria-label="Invia"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button></div>`;
  } else if (q.type === 'logos') {
    f.innerHTML = `<div class="dz-logos">${LOGOS.map(([k, l]) => `<button type="button" class="dz-logo" aria-pressed="false" data-v="${l}">${sample(k, A.nome)}<span>${l}</span></button>`).join('')}</div>
      <div class="dz-row dz-row-end"><button class="dz-next" type="submit" disabled>Avanti</button></div>`;
  } else {
    f.innerHTML = `<div class="dz-chips">${q.opts.map(v => `<button type="button" class="dz-chip" aria-pressed="false" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div>
      ${q.note ? `<input class="dz-in dz-in-note" type="text" maxlength="200" placeholder="${esc(q.note)}" aria-label="${esc(q.note)}">` : ''}
      ${q.type === 'multi' || q.note ? '<div class="dz-row dz-row-end"><button class="dz-next" type="submit" disabled>Avanti</button></div>' : ''}`;
  }
  const foot = document.createElement('div'); foot.className = 'dz-foot';
  foot.innerHTML = `${stack.length > 1 ? '<button type="button" class="dz-link" data-back>← Indietro</button>' : '<span></span>'}${q.req ? '' : '<button type="button" class="dz-link" data-skip>Salta</button>'}`;
  f.append(foot); pad.append(f);
  const next = $('.dz-next', f), inp = $('.dz-in:not(.dz-in-note)', f);
  if (q.id === 'serve' && P.serve) { $$('[aria-pressed]', f).forEach(b => { if (P.serve.includes(b.dataset.v)) b.setAttribute('aria-pressed', 'true'); }); if (next) next.disabled = !pick().length; }
  f.addEventListener('click', e => {
    const c = e.target.closest('[aria-pressed]');
    if (c) {
      if (q.type === 'one') { if (q.note) { $$('[aria-pressed]', f).forEach(x => x.setAttribute('aria-pressed', String(x === c))); if (next) next.disabled = false; } else answer(q, c.dataset.v); return; }
      const on = c.getAttribute('aria-pressed') !== 'true';
      if (on && q.max && pick().length >= q.max) { c.animate?.([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], 220); return; }
      c.setAttribute('aria-pressed', String(on)); if (next) next.disabled = !pick().length; return;
    }
    const qk = e.target.closest('[data-quick]'); if (qk) { answer(q, qk.dataset.quick); return; }
    if (e.target.closest('[data-skip]')) { answer(q, null); return; }
    if (e.target.closest('[data-back]')) back();
  });
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (q.type === 'text') { const v = inp.value.trim(); if (!v) { if (q.req) { inp.focus(); inp.classList.add('is-err'); } return; } answer(q, v); }
    else { const v = pick(); if (v.length) { const note = $('.dz-in-note', f)?.value.trim(); answer(q, q.note ? v[0] + (note ? ` (${note})` : '') : v); } }
  });
  if (inp && matchMedia('(pointer:fine)').matches) inp.focus({ preventScroll: true });
}

async function ask(i) {
  const list = active(), q = list[i]; progress(i);
  if (!q) return finish();
  busy = true; pad.innerHTML = '';
  const node = await say(esc(typeof q.ask === 'function' ? q.ask(A) : q.ask) + (q.hint ? `<small>${esc(q.hint)}</small>` : ''));
  stack.push({ q, nodes: [node] }); busy = false;
  controls(q); keep();
}
async function answer(q, v) {
  if (busy) return; busy = true;
  const cur = stack[stack.length - 1];
  if (v == null) delete A[q.id]; else A[q.id] = v;
  const shown = v == null ? '<em>Salto</em>' : esc(Array.isArray(v) ? v.join(' · ') : v);
  pad.innerHTML = ''; cur.nodes.push(bubble('me', shown));
  const extra = q.after && v != null ? q.after(v) : '';
  if (extra) cur.nodes.push(await say(esc(extra)));
  busy = false;
  ask(active().indexOf(q) + 1);
}
function back() {
  if (busy || stack.length < 2) return;
  stack.pop().nodes.forEach(n => n.remove());
  const prev = stack[stack.length - 1]; prev.nodes.splice(1).forEach(n => n.remove()); delete A[prev.q.id];
  progress(active().indexOf(prev.q)); controls(prev.q);
}

const lines = () => [...(A.stile ? [['Stile che piace', A.stile]] : []), ...active().filter(q => A[q.id] != null).map(q => [q.label, Array.isArray(A[q.id]) ? A[q.id].join(', ') : A[q.id]])];
async function finish() {
  busy = true; pad.innerHTML = '';
  await say(`Grazie, ${esc(A.nome)}! Ecco il riepilogo. Mandacelo e ti rispondiamo con una proposta e un preventivo su misura.`);
  const L = lines(), hasLogo = A.logo && A.logo !== 'No, partiamo da zero';
  const text = `Ciao MOI LAB! Vorrei parlare di un progetto di design.\n\n${L.map(([k, v]) => `• ${k}: ${v}`).join('\n')}${hasLogo ? '\n\nTi mando qui il logo attuale.' : ''}`;
  pad.innerHTML = `<div class="dz-sum"><p class="dz-sum-k">IL TUO BRIEF</p><dl>${L.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="dz-sum-act"><a class="dz-btn dz-btn-ink" href="https://wa.me/${WA}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Invia su WhatsApp <svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></a>
    <button type="button" class="dz-btn dz-btn-line" data-cart>Aggiungi al preventivo</button></div>
    ${hasLogo ? '<p class="dz-sum-n">Su WhatsApp puoi allegare anche il logo che hai già.</p>' : ''}
    <div class="dz-foot"><button type="button" class="dz-link" data-back>← Modifica l’ultima risposta</button><button type="button" class="dz-link" data-again>Ricomincia</button></div></div>`;
  stack.push({ q: null, nodes: [thread.lastElementChild] });
  busy = false; keep();
  pad.querySelector('[data-cart]').addEventListener('click', e => {
    if (!window.MoiCart) return;
    window.MoiCart.add({ service: 'design', title: `Progetto di design: ${A.nome}`, qty: null, details: L });
    e.currentTarget.textContent = 'Aggiunto al preventivo ✓'; e.currentTarget.disabled = true;
  });
  pad.querySelector('[data-again]').addEventListener('click', restart);
  pad.querySelector('[data-back]').addEventListener('click', () => { if (busy) return; stack.pop().nodes.forEach(n => n.remove()); const prev = stack[stack.length - 1]; prev.nodes.splice(1).forEach(n => n.remove()); delete A[prev.q.id]; progress(active().indexOf(prev.q)); controls(prev.q); });
}
function restart() { A = {}; stack = []; thread.innerHTML = ''; ask(0); }
/* partenza dalla prova del nome: il nome e lo stile ci sono già */
function start() { if (started) return; started = true; thread.innerHTML = ''; pad.innerHTML = ''; ask(0); }

bubble('st', 'Ciao! Ti aiutiamo a mettere a fuoco la tua idea. Cominciamo dal nome del progetto?');
pad.innerHTML = '<button type="button" class="dz-btn dz-btn-ink" data-begin>Iniziamo la chiacchierata →</button>';
pad.querySelector('[data-begin]').addEventListener('click', start);



/* Process gallery: keyboard-accessible steps, no forced scroll or autoplay. */
const frames=$$('.dz-f'), steps=$$('.dz-steps button');
const descriptions=['Un foglio bianco e la tua storia.','Le prime forme, a matita.','Proporzioni, griglie e dettagli.','Dal disegno al segno digitale.','Un’identità pronta a incontrare il mondo.'];
function showStep(n){frames.forEach((f,i)=>{f.style.opacity=i===n?'1':'0';f.style.transform='none';});steps.forEach((b,i)=>{b.classList.toggle('is-on',i===n);b.setAttribute('aria-pressed',String(i===n));});$('.dz-story-sub').textContent=descriptions[n];$('.dz-story-n').textContent=String(n+1).padStart(2,'0');}
steps.forEach((b,i)=>b.addEventListener('click',()=>showStep(i)));showStep(0);
$$('[data-start-brief], [data-to-brief]').forEach(b=>b.addEventListener('click',()=>{toEl(brief);start();}));
$$('[data-ask]').forEach(b=>b.addEventListener('click',()=>{P.serve=[b.dataset.ask];toEl(brief);start();}));
brief.classList.add('is-in');
$('[data-process-link]').addEventListener('click', e => { e.preventDefault(); toEl($('#dz-process')); });
// Reuse the site's native SpotlightCard pointer-coordinate pattern, scoped to Design.
if (fine && !reduce) $$('.dz-sv').forEach(card => card.addEventListener('pointermove', e => {
 const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`);
}));
// Show an illustrative board before the first answer as well.
$('[data-live-art]').innerHTML=sample('logotipo','La tua idea');
if(room.classList.contains('is-active'))draw();
})();
