import {translations} from './translations.mjs';
export const languages={it:'Italiano',en:'English',de:'Deutsch',ru:'Русский',es:'Español',zh:'简体中文',ja:'日本語'};
const key='moi-language';
let language='it';try{language=localStorage.getItem(key)||'it';}catch{}if(!languages[language])language='it';
const reverse=new Map();for(const [source,row] of Object.entries(translations))for(const text of Object.values(row))reverse.set(text,source);
export function translate(text,lang=language){
 const source=reverse.get(text)||text;
 if(translations[source])return translations[source][lang]||source;
 // Keep category hierarchy, numeric values and navigation symbols intact.
 if(text.endsWith('.')&&translations[reverse.get(text.slice(0,-1))||text.slice(0,-1)])return translate(text.slice(0,-1),lang)+'.';
 if(text.includes(' / '))return text.split(' / ').map(s=>translate(s,lang)).join(' / ');
 const decorated=text.match(/^([←↑]\s*)?(.+?)(\s*[↗→])?$/s);
 if(decorated&&(decorated[1]||decorated[3]))return (decorated[1]||'')+translate(decorated[2],lang)+(decorated[3]||'');
 const number=text.match(/^(\d+) (.+)$/);if(number)return number[1]+' '+translate(number[2],lang);
 if(source.startsWith('MOI LAB / '))return 'MOI LAB / '+translate(source.slice(10),lang);
 // Minimum quantities and unit counts remain numeric in every language.
 if(/^Quantità minima: \d+ pezzi\.$/.test(source)){const n=source.match(/\d+/)[0];return translate('Quantità minima:',lang)+' '+n+' '+translate('pezzi',lang)+'.';}
 return source;
}
const originals=new WeakMap(),attrs=new WeakMap();let observer,scheduled=false,lastTitleLang='it';
function sourceFor(node,value){const prev=originals.get(node);if(prev&&prev.last===value)return prev.source;return value;}
function process(){
 observer?.disconnect();
 for(const select of document.querySelectorAll('[data-moi-language]')){
 if(!select.options.length){for(const [code,name] of Object.entries(languages)){const o=document.createElement('option');o.value=code;o.textContent=name;select.append(o);}select.addEventListener('change',()=>setLanguage(select.value));}
 select.value=language;
 }
 const heading=document.querySelector('.mlg-title');
 if(heading&&lastTitleLang!==language){const text=translate('WHAT WE DO.');const line=heading.querySelector('.mlg-type-line');line.replaceChildren();Array.from(text).forEach((char,i)=>{const span=document.createElement('span');span.className='mlg-type-char';span.style.setProperty('--char-delay',i*30+'ms');span.textContent=char===' '?'\u00a0':char;line.append(span);});heading.setAttribute('aria-label',text);lastTitleLang=language;}
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){
 if(!node.parentElement||node.parentElement.closest('script,style,textarea,.demo-edit,.demo-bar,.mlg-title,[data-moi-language],[data-no-translate]'))continue;
 const value=node.nodeValue,source=sourceFor(node,value),trim=source.trim();if(!trim)continue;
 const next=source.replace(trim,translate(trim));if(next!==value)node.nodeValue=next;
 originals.set(node,{source,last:next});
 }
 document.querySelectorAll('[aria-label],[placeholder]').forEach(el=>{
 if(el.closest('.demo-edit,.mlg-title,[data-no-translate]'))return;
 const saved=attrs.get(el)||{};for(const name of ['aria-label','placeholder'])if(el.hasAttribute(name)){const value=el.getAttribute(name),old=saved[name],source=old?.last===value?old.source:value;const next=translate(source);if(next!==value)el.setAttribute(name,next);saved[name]={source,last:next};}attrs.set(el,saved);
 });
 document.documentElement.lang=language;
 observer?.observe(document.body,{childList:true,subtree:true,characterData:true});
}
export function setLanguage(value){if(!languages[value])return;language=value;try{localStorage.setItem(key,value)}catch{}process();}
export function startTranslations(){observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;process();});});process();window.addEventListener('storage',e=>{if(e.key===key)setLanguage(e.newValue||'it');});}
