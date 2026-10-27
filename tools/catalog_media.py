#!/usr/bin/env python3
"""Audit all catalog products. Import original/licensed pictures only after visual QA.

python3 tools/catalog_media.py audit
python3 tools/catalog_media.py import-image ID /absolute/source.png --reviewed

Pillow is needed only for importing images. Runtime website has no dependencies.
Private supplier mapping must never be an input to public exports.
"""
import argparse
import csv
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/catalogo'
SERVICES = ('custom', 'signage', 'design')

def products():
    return [(s, x) for s in SERVICES for x in json.loads((DATA / f'{s}.json').read_text())['items']]

def media():
    return json.loads((DATA / 'media.json').read_text()) if (DATA / 'media.json').exists() else {'version':1, 'items':{}}

def audit():
    rows = products()
    ids = [x['id'] for _, x in rows]
    assert len(ids) == len(set(ids)), 'Duplicate product ID'
    families = json.loads(subprocess.check_output(['node','-e',"const n=require('./assets/catalog-navigation.js'); console.log(JSON.stringify(n.groups));"],cwd=ROOT,text=True))
    m = media()['items']; assert set(m) <= set(ids), 'Unknown media product ID'
    hashes = {}; ready = 0; export = []
    for s, x in rows:
        item = m.get(x['id'], {})
        complete = item.get('status') == 'verified'
        if complete:
            assert item.get('description') and item.get('alt') and item.get('provenance'), x['id']
            for key in ('src', 'small'):
                path = ROOT / item[key].lstrip('/')
                assert path.is_file(), f'Missing {path}'
                assert path.stat().st_size < 250_000, f'Image too large: {path}'
            digest = hashlib.sha256((ROOT / item['src'].lstrip('/')).read_bytes()).hexdigest()
            assert digest not in hashes, f'Duplicate image: {x["id"]} / {hashes.get(digest)}'
            hashes[digest] = x['id']; ready += 1
        slug = re.sub(r'[^a-z0-9]+', '-', x['n'].lower()).strip('-')
        export.append({'id':x['id'], 'servizio':s, 'nome':x['n'], 'categoria_esistente':x['cat'],
            'sottocategoria_esistente':x['sub'], 'categoria_proposta':next((name for name,cats in families if x['cat'] in cats),x['cat']),
            'descrizione':item.get('description','Non presente — da verificare'),
            'varianti_presenti':' | '.join(x.get('col',[])) or 'Non specificate',
            'immagine_attuale':item.get('src',f'assets/gadget-icons.js#{x["ic"]}'),
            'stato_immagine':'Mockup originale verificato' if complete else 'Illustrazione condivisa; foto specifica mancante',
            'file_immagine_previsto':item.get('src',f'/assets/catalogo/{s}/{x["id"].lower()}-{slug}.webp'),
            'stato_completamento':'Contenuto pronto; verifica online in attesa' if complete else 'Da completare',
            'origine':f'data/catalogo/{s}.json'})
    dest = ROOT / 'docs/catalogo'; dest.mkdir(parents=True, exist_ok=True)
    with (dest/'inventario.csv').open('w',newline='',encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f,fieldnames=export[0].keys(),delimiter=';'); writer.writeheader(); writer.writerows(export)
    apparel = json.loads((ROOT/'data/apparel/elenco.json').read_text())
    apparel_rows = [{'id':x['sku'], 'nome':x['nome'], 'categoria':x['categoria'], 'immagine_attuale':x.get('immagine_principale',''), 'stato':'URL esistente; raggiungibilità e diritti non riverificati; catalogo preservato'} for x in apparel]
    with (dest/'apparel-esistente.csv').open('w',newline='',encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f,fieldnames=apparel_rows[0].keys(),delimiter=';'); writer.writeheader(); writer.writerows(apparel_rows)
    report = {'totale_cataloghi_esaminati':len(rows)+len(apparel),'apparel_preservati':len(apparel),'apparel_con_url_immagine':sum(bool(x.get('immagine_principale')) for x in apparel),'totale':len(rows),'immagini_specifiche_iniziali':0,'immagini_generate_integrate':ready,
        'prodotti_da_illustrare':len(rows)-ready,'categorie_esistenti':len({x['cat'] for _,x in rows}),
        'sottocategorie_esistenti':len({(s,x['cat'],x['sub']) for s,x in rows}),
        'macroaree_navigazione':6,'verifica_online':'In attesa: anteprima protetta da Netlify',
        'ambito':'Catalogo gadget, packaging, insegne e stampa; Apparel esistente non modificato'}
    (dest/'stato.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False))

def import_image(product_id, source, reviewed):
    assert reviewed, 'Inspect the image before importing with --reviewed'
    from PIL import Image, ImageOps
    service, product = next((s,x) for s,x in products() if x['id']==product_id)
    slug = re.sub(r'[^a-z0-9]+','-',product['n'].lower()).strip('-')
    base = f'{product_id.lower()}-{slug}'
    out = ROOT/'assets/catalogo'/service; out.mkdir(parents=True, exist_ok=True)
    for suffix in ('', '-480'):
        target = out/f'{base}{suffix}.webp'
        if target.exists(): raise FileExistsError(target)
    im = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    # Resize without cropping, retouching or inventing details.
    for width, suffix in ((960,''),(480,'-480')):
        target = out/f'{base}{suffix}.webp'
        resized = im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
        resized.save(target,'WEBP',quality=84,method=6)
        print('/'+str(target.relative_to(ROOT)))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command',required=True)
    sub.add_parser('audit')
    imp = sub.add_parser('import-image'); imp.add_argument('id'); imp.add_argument('source'); imp.add_argument('--reviewed',action='store_true')
    args = parser.parse_args()
    if args.command=='audit': audit()
    else: import_image(args.id,args.source,args.reviewed)
