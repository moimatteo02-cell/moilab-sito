/* Run: node tools/check_catalog.cjs — no extra dependencies. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const nav = require('../assets/catalog-navigation.js');
const all = ['custom','signage','design'].flatMap(s => JSON.parse(fs.readFileSync(path.join(root,`data/catalogo/${s}.json`))).items);
assert.equal(new Set(all.map(x=>x.id)).size, all.length, 'IDs must be unique');
assert.equal(all.length,3121,'Investigate any unrequested product loss/addition');
for (const x of all) assert(nav.groups.some(([,cats])=>cats.includes(x.cat)), `Unmapped category ${x.cat}`);
const search = q => all.filter(x=>nav.matches(x,q)).map(x=>x.id).sort();
assert.deepEqual(search('sticker'), search('etichette'));
assert.deepEqual(search('mug'), search('tazze'));
assert.deepEqual(search('penna'), search('penne'));
assert.deepEqual(search('GFC7832'), ['GFC7832']);
assert.equal(search('prodotto-che-non-esiste-79399').length,0);
assert(search('ristorante').length>0);
for (const p of nav.paths) assert(all.some(x=>nav.inPath(x,p.id)), `Empty path ${p.id}`);
const readM = f => fs.existsSync(path.join(root,`data/catalogo/${f}`)) ? JSON.parse(fs.readFileSync(path.join(root,`data/catalogo/${f}`))).items : {};
const mA = readM('media.json'), mB = readM('media-claude.json');
for (const id of Object.keys(mB)) assert(!(id in mA), `Product in both manifests: ${id}`);
const media = {...mA, ...mB};
// ognuno registra solo i prodotti della propria metà (docs/catalogo/divisione.csv)
const owner = Object.fromEntries(fs.readFileSync(path.join(root,'docs/catalogo/divisione.csv'),'utf8').replace(/^\uFEFF/,'').trim().split('\n').slice(1).map(l=>l.split(';')).map(r=>[r[0],r[1]]));
for (const id of Object.keys(mA)) assert(owner[id] !== 'claude', `${id} belongs to Claude (lotti B) but is in media.json`);
for (const id of Object.keys(mB)) assert(owner[id] !== 'chatgpt', `${id} belongs to ChatGPT (lotti A) but is in media-claude.json`);
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('/assets/catalog-navigation.js?v=20261027-4') < html.indexOf('/assets/gadget-catalog.js?v=20261028-2'));
assert(html.includes('/assets/gadget-catalog.css?v=20261028-1'));
for(const [id,m] of Object.entries(media)) {
  assert(all.some(x=>x.id===id));
  assert.equal(m.status,'verified');
  for(const file of [m.src,m.small]) assert(fs.existsSync(path.join(root,file)),file);
}
const imgs = JSON.parse(fs.readFileSync(path.join(root,'data/catalogo/immagini.json')));
for (const n of imgs) assert(fs.existsSync(path.join(root,`assets/catalogo/categorie/${n}.webp`)), n);
console.log(`PASS: ${all.length} products, ${Object.keys(media).length} media pairs, 6 macroareas, synonym/intent searches, IDs and asset versions`);
