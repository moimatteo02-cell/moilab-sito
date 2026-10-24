export const config=window.MOI_STICKER_CONFIG;
export const escapeHTML = value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export async function api(path,options={}){
 const headers={"X-Moi-Request":"catalog",...(config.nonce?{"X-WP-Nonce":config.nonce}:{}),...options.headers};
 if(options.body&&!(options.body instanceof FormData))headers["Content-Type"]="application/json";
 const response=await fetch(config.apiBase+path,{credentials:"same-origin",...options,headers});
 let data;try{data=await response.json()}catch{throw new Error("Risposta non disponibile. Riprova tra poco.")}
 if(!response.ok)throw new Error(data.error||data.message||"Operazione non riuscita.");
 return data;
}
export function shopURL(params={}){const u=new URL(config.shopUrl,location.origin);["prodotto","carrello","categoria","modifica"].forEach(k=>u.searchParams.delete(k));for(const [k,v]of Object.entries(params))if(v)u.searchParams.set(k,v);return u.pathname+u.search;}
export function placeholder(){return '<div class="ms-paper" aria-hidden="true"><span>MOI<br>LAB.</span><i></i></div>';}
export function productImage(p){return p.imageUrl?'<img src="'+escapeHTML(p.imageUrl)+'" alt="'+escapeHTML(p.name)+'" loading="lazy">':placeholder();}
export function header(count=0,admin=false){return '<header class="ms-header"><a href="'+escapeHTML(config.homeUrl)+'" aria-label="MOI LAB — torna ai servizi"><img class="ms-logo" src="'+escapeHTML(config.assetsBase)+'/logo.svg" alt="MOI LAB"></a><nav aria-label="Navigazione">'+(admin?'<a href="'+escapeHTML(config.shopUrl)+'" target="_blank" rel="noopener">Apri catalogo ↗</a>':'<a class="ms-back" href="'+escapeHTML(config.homeUrl)+'">← Gadget & Oggetti</a><a class="ms-cart-link" href="'+shopURL({carrello:"1"})+'">Carrello <span>'+count+'</span></a><select data-moi-language aria-label="Lingua"></select>')+'</nav></header>';}
export function notify(message,error=false){let t=document.getElementById("ms-toast");if(!t){t=document.createElement("div");t.id="ms-toast";t.className="ms-toast";t.setAttribute("role","status");document.body.appendChild(t);}t.textContent=message;t.classList.toggle("ms-error",error);t.classList.add("is-visible");clearTimeout(window.moiToastTimer);window.moiToastTimer=setTimeout(()=>t.classList.remove("is-visible"),6500);}

