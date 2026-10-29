/* Controllo legale: dati dell'attività compilati, nessun font/script esterno, pagine privacy e crediti collegate. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const errors = [], warnings = [];
const az = JSON.parse(fs.readFileSync(path.join(root, 'data/azienda.json'), 'utf8'));
['titolare', 'partitaIva', 'sede', 'email'].forEach(k => { if (!String(az[k] || '').trim()) warnings.push('data/azienda.json: manca «' + k + '» (la privacy mostra "da completare")'); });
for (const p of ['privacy/index.html', 'crediti/index.html']) if (!fs.existsSync(path.join(root, p))) errors.push('manca ' + p);
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!idx.includes('/privacy/')) errors.push('index.html: manca il link a /privacy/');
function walk(d, out = []) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (['.git', 'node_modules', 'docs', 'privato'].includes(f.name)) continue; const p = path.join(d, f.name); f.isDirectory() ? walk(p, out) : /\.(html|js|css|mjs)$/.test(f.name) && out.push(p); } return out; }
const EXT = /(fonts\.googleapis\.com|fonts\.gstatic\.com|googletagmanager|google-analytics|connect\.facebook\.net|cdn\.jsdelivr|unpkg\.com|cdnjs)/;
for (const f of walk(root)) { const t = fs.readFileSync(f, 'utf8'); const m = t.match(EXT); if (m) errors.push(path.relative(root, f) + ': risorsa esterna ' + m[0]); }
warnings.forEach(w => console.log('AVVISO', w)); errors.forEach(e => console.log('ERRORE', e));
console.log(errors.length ? 'FALLITO' : 'OK (con ' + warnings.length + ' avvisi)'); process.exit(errors.length ? 1 : 0);
