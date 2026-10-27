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
const media = JSON.parse(fs.readFileSync(path.join(root,'data/catalogo/media.json'))).items;
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.indexOf('/assets/catalog-navigation.js?v=20261027-4') < html.indexOf('/assets/gadget-catalog.js?v=20261027-5'));
assert(html.includes('/assets/gadget-catalog.css?v=20261027-4'));
for(const [id,m] of Object.entries(media)) {
  assert(all.some(x=>x.id===id));
  assert.equal(m.status,'verified');
  for(const file of [m.src,m.small]) assert(fs.existsSync(path.join(root,file)),file);
}
console.log(`PASS: ${all.length} products, ${Object.keys(media).length} media pairs, 6 macroareas, synonym/intent searches, IDs and asset versions`);
