/* MOI LAB — Design: racconto del processo e brief guidato, senza dipendenze esterne. */
(() => {
'use strict';
const room=document.getElementById('moi-showroom-design'), dz=room&&room.querySelector('.dz'); if(!dz)return;
const $=s=>dz.querySelector(s), thread=$('.dz-thread'), pad=$('.dz-pad'), reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA='393278815148', answers={};
const Q=[
{id:'nome',ask:'Ciao! Come si chiama la tua attività o il progetto che vuoi far nascere?',type:'text',ph:'Il nome del progetto'},
{id:'attivita',ask:'Di cosa ti occupi? Raccontamelo con parole tue.',type:'text',ph:'Che cosa fai e per chi?'},
{id:'richiesta',ask:'Da dove vuoi cominciare?',type:'multi',opts:['Creare un logo','Rinnovare un logo','Costruire un’identità completa','Grafica per social o stampa','Packaging ed etichette','Non so ancora, ragioniamoci']},
{id:'stile',ask:'Che impressione dovrebbe lasciare il tuo marchio?',hint:'Scegli fino a tre sensazioni.',type:'multi',max:3,opts:['Elegante','Essenziale','Artigianale','Contemporanea','Audace','Accogliente','Giocosa','Naturale','Affidabile','Non saprei']},
{id:'riferimenti',ask:'Hai colori, marchi o immagini che ti ispirano? Anche qualcosa da evitare ci aiuta.',type:'text',ph:'Raccontaci qualche riferimento'},
{id:'utilizzi',ask:'Dove immagini di usare il marchio?',type:'multi',opts:['Social e sito','Insegna','Packaging','Biglietti e stampa','Abbigliamento','Un po’ ovunque']},
{id:'tempi',ask:'Hai già in mente una tempistica o un budget indicativo?',hint:'Facoltativo: puoi anche dire “da definire”.',type:'text',ph:'Quando ti serve e cosa hai in mente?'}
];
let step=-1,started=false;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function progress(){const n=Q.length,k=Math.max(0,Math.min(step,n));$('[data-progress]').style.width=(k/n*100)+'%';$('[data-progress-label]').textContent=step<0?'Pronto quando vuoi':step>=n?'Brief pronto':'Passaggio '+(step+1)+' di '+n}
function bubble(who,text){const e=document.createElement('div');e.className='dz-msg dz-'+who;const p=document.createElement('p');p.textContent=text;e.append(p);thread.append(e);thread.scrollTop=thread.scrollHeight}
function preview(){ $('[data-preview-name]').textContent=(answers.nome||'IL TUO NOME').toUpperCase().slice(0,24); $('[data-preview-meta]').textContent=answers.stile?(Array.isArray(answers.stile)?answers.stile.slice(0,2).join(' · '):answers.stile):'La direzione si definisce insieme';}
function ask(){progress();pad.innerHTML='';if(step>=Q.length){finish();return}const q=Q[step];bubble('st',q.ask);if(q.hint){const h=document.createElement('p');h.className='dz-hint';h.textContent=q.hint;pad.append(h)}
if(q.type==='text'){const f=document.createElement('form');f.className='dz-input-row';f.innerHTML='<input aria-label="La tua risposta" placeholder="'+esc(q.ph)+'" maxlength="180"><button class="dz-send" type="submit">Invia →</button>';pad.append(f);const input=f.querySelector('input');f.addEventListener('submit',e=>{e.preventDefault();const v=input.value.trim();if(!v&&q.id!=='tempi')return;answer(v||'Da definire')});setTimeout(()=>input.focus({preventScroll:true}),reduce?0:220)}
else{const box=document.createElement('div');box.className='dz-options';q.opts.forEach(label=>{const b=document.createElement('button');b.type='button';b.className='dz-option';b.textContent=label;b.addEventListener('click',()=>{if(q.type==='multi'){const a=new Set(answers[q.id]||[]);a.has(label)?a.delete(label):q.max&&a.size>=q.max?null:a.add(label);answers[q.id]=[...a];b.setAttribute('aria-pressed',String(a.has(label)))}else answer(label)});box.append(b)});pad.append(box);if(q.type==='multi'){const go=document.createElement('button');go.type='button';go.className='dz-link';go.textContent='Continua →';go.style.marginTop='14px';go.addEventListener('click',()=>answer(answers[q.id]||[]));pad.append(go)}}
if(step>0){const back=document.createElement('button');back.type='button';back.className='dz-link';back.textContent='← Indietro';back.style.marginTop='12px';back.addEventListener('click',previous);pad.append(back)}}
function answer(v){const q=Q[step];answers[q.id]=v;bubble('me',Array.isArray(v)?v.join(', '):v);if(q.id==='nome'||q.id==='stile')preview();step++;ask()}
function previous(){if(step<=0)return;step--;delete answers[Q[step].id];thread.lastElementChild?.remove();thread.lastElementChild?.remove();ask()}
function finish(){progress();bubble('st','Grazie '+(answers.nome||'')+'. Abbiamo una prima traccia. Ora possiamo parlarne, guardare riferimenti e costruire il marchio con i tuoi feedback.');const rows=Q.filter(q=>answers[q.id]&&String(answers[q.id]).length).map(q=>[q.id,Array.isArray(answers[q.id])?answers[q.id].join(', '):answers[q.id]]);const msg='Ciao MOI LAB! Vorrei parlare del mio progetto di design.\n\n'+rows.map(x=>'• '+x[0]+': '+x[1]).join('\n')+'\n\nVorrei svilupparlo insieme a voi, passo dopo passo.';const box=document.createElement('div');box.className='dz-summary';box.innerHTML='<h3>La conversazione fin qui</h3><dl>'+rows.map(x=>'<div><dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd></div>').join('')+'</dl><div class="dz-action-row"><a class="dz-submit" target="_blank" rel="noopener" href="https://wa.me/'+WA+'?text='+encodeURIComponent(msg)+'">Continua la chiacchierata su WhatsApp →</a><button class="dz-link" type="button" data-cart>Aggiungi al preventivo</button></div>';pad.append(box);box.querySelector('[data-cart]').addEventListener('click',e=>{if(window.MoiCart){window.MoiCart.add({service:'design',title:'Progetto Design: '+(answers.nome||'nuovo progetto'),qty:null,details:rows.map(x=>x[0]+': '+x[1])});e.currentTarget.textContent='Aggiunto ✓';e.currentTarget.disabled=true}})}
function start(){if(started)return;started=true;step=0;ask()}
$('.dz-cta').addEventListener('click',start);
new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))start()},{root:room,threshold:.15}).observe($('.dz-chat'));
if(!reduce)document.querySelector('.dz-art-stack')?.classList.add('is-animated');
})();
