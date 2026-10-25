#!/usr/bin/env python3
"""Costruisce i percorsi del catalogo APPAREL (settori, esigenze, filtri, ricerca).

Uso:  python3 tools/build_percorsi.py            (dalla cartella del sito)
Legge:  data/apparel/elenco.json, data/apparel/prodotti/*.json,
        data/apparel/fonte/gorfactory-attributi.json (dati ufficiali Gorfactory),
        data/apparel/percorsi.json (configurazione modificabile)
Scrive: data/apparel/elenco.json (aggiunge i campi dei filtri),
        data/apparel/percorsi-indice.json (card, conteggi, sinonimi per la ricerca),
        data/apparel/mappatura-settori.csv (controllo: perché ogni prodotto è in un settore)
Va eseguito DOPO il ricalcolo dei prezzi (che riscrive elenco.json).
"""
import colorsys, csv, json, os, re, unicodedata
from collections import Counter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
D = os.path.join(ROOT, 'data', 'apparel')
load = lambda p: json.load(open(os.path.join(D, p), encoding='utf-8'))

elenco = load('elenco.json')
cfg = load('percorsi.json')
attr = load('fonte/gorfactory-attributi.json')
prod = {}
for e in elenco:
    try: prod[e['sku']] = load(f"prodotti/{e['sku']}.json")['product']
    except FileNotFoundError: prod[e['sku']] = {}

def norm(t):
    t = unicodedata.normalize('NFD', str(t or '').lower())
    return re.sub(r'\s+', ' ', ''.join(c for c in t if unicodedata.category(c) != 'Mn')).strip()

GENERE = {'HO': 'uomo', 'MU': 'donna', 'UN': 'unisex'}

def famiglia(hexes):
    h = (hexes or '').split('/')[0].strip()
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', h): return None
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    hu, l, s = colorsys.rgb_to_hls(r, g, b); hu *= 360
    if l > .9 and s < .5: return 'Bianco'
    if l < .13: return 'Nero'
    if s < .12 or (s < .2 and .2 < l < .8): return 'Grigio'
    if 20 <= hu < 50 and l < .42: return 'Marrone'
    if 25 <= hu < 65 and l > .7 and s < .6: return 'Beige'
    if hu < 12 or hu >= 345: return 'Rosso'
    if hu < 40: return 'Arancione'
    if hu < 66: return 'Giallo'
    if hu < 170: return 'Verde'
    if hu < 200: return 'Azzurro'
    if hu < 245: return 'Blu'
    if hu < 290: return 'Viola'
    return 'Rosa'

FIBRE = {'cotone': 'Cotone', 'poliestere': 'Poliestere', 'elastan': 'Elastan', 'viscosa': 'Viscosa',
         'poliammide': 'Poliammide', 'nylon': 'Poliammide', 'acrilico': 'Acrilico', 'lana': 'Lana', 'lino': 'Lino', 'modal': 'Modal'}
def materiale(txt):
    t = norm(txt); best = None
    for pct, fib in re.findall(r'(\d{1,3})\s*%\s*([a-z]+)', t):
        for k, v in FIBRE.items():
            if fib.startswith(k[:6]) and (best is None or int(pct) > best[0]): best = (int(pct), v)
    return best[1] if best else None

def match(rule, a, p):
    if not rule: return []
    why = []
    why += [f"collezione {c}" for c in rule.get('collezioni', []) if c in a.get('c', [])]
    why += [f"icona {c}" for c in rule.get('icone', []) if c in a.get('i', [])]
    why += [f"categoria {c}" for c in rule.get('categorie_gorfactory', []) if c in a.get('k', [])]
    why += [f"sottocategoria {c}" for c in rule.get('sottocategorie', []) if c == p.get('sottocategoria')]
    return why

righe, cnt_set, cnt_es, cnt_cf, cnt_mat = [], Counter(), Counter(), Counter(), Counter()
for e in elenco:
    sku = e['sku']; p = prod[sku]; a = attr.get(sku, {})
    sett = []
    for s in cfg['settori']:
        why = match(s.get('regole'), a, e) if sku not in s.get('escludi', []) else []
        if sku in s.get('includi', []): why = why + ['scelto a mano']
        if why: sett.append(s['id']); righe.append([sku, e['nome'], e['categoria'], s['nome'], '; '.join(why)])
    es = [x['id'] for x in cfg['esigenze'] if match(x, a, e)]
    taglie = p.get('taglie') or []
    bimbo = any(re.search(r'anni|mesi|kids|bambin', norm(t)) for t in taglie)
    fam = sorted({f for c in p.get('colori', []) if (f := famiglia(c.get('hex')))})
    mat = materiale(p.get('descrizione') or p.get('descrizione_breve'))
    e.update(s=sett, x=es, g=GENERE.get(a.get('g')), b=bimbo, tg=taglie, cf=fam, m=mat, marca=p.get('marca', e.get('marca')),
             kw=norm(' '.join([e['nome'], e['tipo'], e['sku'], e['categoria'], e.get('sottocategoria') or '', p.get('marca') or '',
                               ' '.join(c['nome'] for c in p.get('colori', []))])))
    cnt_set.update(sett); cnt_es.update(es); cnt_cf.update(fam); cnt_mat.update([mat] if mat else [])

json.dump(elenco, open(os.path.join(D, 'elenco.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

def card_img(ids_key, val):
    for e in elenco:
        if val in e.get(ids_key, []) and e.get('immagine_modello_fronte'): return e['immagine_modello_fronte']
indice = {
    'settori': [{**{k: s[k] for k in ('id', 'nome', 'descrizione', 'ordine')}, 'immagine': s.get('immagine') or card_img('s', s['id']), 'conteggio': cnt_set[s['id']]}
                for s in sorted(cfg['settori'], key=lambda s: s.get('ordine', 99)) if s.get('visibile', True) and cnt_set[s['id']]],
    'esigenze': [{'id': x['id'], 'nome': x['nome'], 'conteggio': cnt_es[x['id']]} for x in cfg['esigenze'] if cnt_es[x['id']]],
    'colori': [{'nome': k, 'conteggio': v} for k, v in sorted(cnt_cf.items(), key=lambda kv: -kv[1])],
    'materiali': [{'nome': k, 'conteggio': v} for k, v in sorted(cnt_mat.items(), key=lambda kv: -kv[1])],
    'sinonimi': {k: [norm(w) for w in v] for k, v in cfg['sinonimi'].items()},
    'tipi': {k: [norm(w) for w in v] for k, v in cfg['tipi'].items()},
}
json.dump(indice, open(os.path.join(D, 'percorsi-indice.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open(os.path.join(D, 'mappatura-settori.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f, delimiter=';'); w.writerow(['SKU', 'Nome', 'Categoria', 'Settore', 'Motivo (dato Gorfactory)']); w.writerows(righe)

print('prodotti:', len(elenco))
print('settori:', dict(cnt_set)); print('esigenze:', dict(cnt_es))
print('colori:', dict(cnt_cf)); print('materiali:', dict(cnt_mat))
print('senza settore:', sum(1 for e in elenco if not e['s']), '| senza materiale:', sum(1 for e in elenco if not e['m']))
