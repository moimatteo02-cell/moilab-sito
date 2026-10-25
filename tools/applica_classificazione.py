#!/usr/bin/env python3
"""Applica data/apparel/fonte/classificazione-visiva.txt agli elenchi 'includi' dei settori in percorsi.json.
Formato riga: SKU settori   (B = tutti i settori; TP = sport,eventi,lavoro,edilizia,casual). Poi esegue build_percorsi.py."""
import json, os, subprocess, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); D = os.path.join(ROOT, 'data', 'apparel')
cfg = json.load(open(os.path.join(D, 'percorsi.json'), encoding='utf-8'))
ALL = [s['id'] for s in cfg['settori']]; TP = ['sport', 'eventi', 'lavoro', 'edilizia', 'casual']
skus = {e['sku'] for e in json.load(open(os.path.join(D, 'elenco.json'), encoding='utf-8'))}
vis = {}
for line in open(os.path.join(D, 'fonte', 'classificazione-visiva.txt'), encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    sku, codes = line.split()[:2]; out = set()
    for c in codes.split(','): out |= set(ALL) if c == 'B' else set(TP) if c == 'TP' else {c}
    if out - set(ALL): sys.exit(f'Settore sconosciuto per {sku}: {out - set(ALL)}')
    if sku not in skus: print('attenzione: SKU non nel catalogo', sku)
    vis[sku] = out
for s in cfg['settori']: s['includi'] = sorted(k for k, v in vis.items() if s['id'] in v and k in skus)
json.dump(cfg, open(os.path.join(D, 'percorsi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({s['id']: len(s['includi']) for s in cfg['settori']})
subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'tools', 'build_percorsi.py')], check=True)
