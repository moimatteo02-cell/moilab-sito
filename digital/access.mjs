export async function refreshPrivateTools(){
 const links=[...document.querySelectorAll('[data-admin-link]')];links.forEach(a=>a.hidden=true);
 let mode=false;try{mode=sessionStorage.getItem('moi-private-mode')==='1'}catch{}
 if(!mode)return;
 try{const config=window.MOI_STICKER_CONFIG||{},base=config.digitalApiBase||'/api/digital';const response=await fetch(base+'/session',{credentials:'same-origin',headers:config.nonce?{'X-WP-Nonce':config.nonce}:{}});if(!response.ok)return;const s=await response.json();links.forEach(a=>{a.hidden=!(a.dataset.adminScope==='software'?s.canManageSoftware:s.canManageUsers)})}catch{}
}
