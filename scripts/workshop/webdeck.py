"""Self-contained webdeck using the supplied framework and the reviewed slide layouts."""
from content import ROOT, TITLE, SOURCES
from slides import SLIDES
import render_slides  # Rebuild the same real-text HTML used for the reviewed slide PNGs.
import re,base64,io
from pathlib import Path
from html import escape as E
from PIL import Image
HERE=Path(__file__).resolve().parent
cache={}
def embedded(path):
 p=Path(path)
 if p not in cache:
  im=Image.open(p);im.thumbnail((1400,1400))
  buf=io.BytesIO();im.save(buf,format='WEBP',quality=88,method=6)
  cache[p]='data:image/webp;base64,'+base64.b64encode(buf.getvalue()).decode()
 return cache[p]
def inline_assets(text):
 return re.sub(r'file://([^"\)<>]+)',lambda m:embedded(m.group(1)),text)
def name(word):return 'nspa-canvas' if word=='slide' else 'nspa-'+word
# Namespace the slide renderer styles to avoid collisions with framework chrome.
def style_rule(m):
 selectors=[]
 for sel in m.group(1).strip().split(','):
  sel=re.sub(r'\.([A-Za-z][\w-]*)',lambda c:'.'+name(c.group(1)),sel.strip())
  if sel in ['body','html']:selectors.append('.nspa-canvas');continue
  if sel.startswith('.nspa-canvas'):selectors.append(sel);continue
  selectors.append('.nspa-canvas '+sel)
  if sel.startswith('.'):selectors.append('.nspa-canvas'+sel)
 return ','.join(selectors)+'{'+m.group(2)+'}'
css=re.sub(r'([^{}]+)\{([^{}]*)\}',style_rule,render_slides.css)
css=inline_assets(css)
sections=[]
for n,s in enumerate(SLIDES,1):
 html=(render_slides.BUILD/f'{n:02}.html').read_text().split('<body>',1)[1].split('</body>',1)[0]
 html=re.sub(r'class="([^"]*)"',lambda m:'class="'+' '.join(name(c) for c in m.group(1).split())+'"',html)
 html=inline_assets(html)
 html=re.sub(r'<a ', '<a target="_blank" rel="noopener noreferrer" ',html)
 # Framework heading lookup and a meaningful label for resource navigation.
 html=html.replace('<h1>','<h1 class="slide-title">',1).replace('<nav class="nspa-resource-links">','<nav class="nspa-resource-links" aria-label="Slide resources">')
 notes=''.join('<p>'+E(p).replace('\n','<br>')+'</p>' for p in s['notes'].split('\n\n'))
 notes+=''.join(f'<p><a href="{E(SOURCES[i][1])}" target="_blank" rel="noopener noreferrer">{E(SOURCES[i][0])}</a></p>' for i in s['sources'])
 sections.append(f'<section class="slide{ " current" if n==1 else ""}" aria-label="Slide {n}: {E(s["title"])}"><div class="slide-body nspa-body">{html}</div><div class="slide-footer nspa-footer"><span class="brand">NSPA 2026</span><span>Miguel Guhlin</span><span>{n} / 26</span></div><div class="notes">{notes}</div></section>')
framework_css=(HERE/'deck-framework.css').read_text()
framework_js=(HERE/'deck-framework.js').read_text()
theme=(HERE/'webdeck-theme.css').read_text()
extras=(HERE/'webdeck-extras.js').read_text()
html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#2e4f66"><title>{E(TITLE)} | NSPA webdeck</title><link rel="canonical" href="https://mguhlin.github.io/nspa/2026/webdeck.html"><style>{framework_css}\n{css}\n{theme}</style></head><body><a id="exitDeck" href="https://mguhlin.github.io/nspa/2026/">← Workshop materials</a><div class="deck">{''.join(sections)}</div><noscript><p style="position:fixed;bottom:0;background:white;color:#2e4f66;padding:12px">Navigation requires JavaScript. <a href="https://mguhlin.github.io/nspa/2026/slides/nspa-trust-transparency-ai.pdf">Open the presentation PDF</a>.</p></noscript><script>{framework_js}</script><script>{extras}</script></body></html>'''
(ROOT/'2026/webdeck.html').write_text(html)
print(f'Created 26-slide self-contained webdeck: {len(html.encode())/1024/1024:.1f} MB, {len(cache)} embedded assets')
