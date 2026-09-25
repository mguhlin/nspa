from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
root=(Path(__file__).resolve().parents[1]/'2026/offline').resolve();bad=[];count=0
class P(HTMLParser):
 def __init__(self):super().__init__();self.urls=[];self.ids=set()
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if 'id'in d:self.ids.add(d['id'])
  for k in ['href','src']:
   if k in d:self.urls.append(d[k])
parsed={}
for p in root.rglob('*.html'):
 parser=P();parser.feed(p.read_text());parsed[p]=parser
for p,parser in parsed.items():
 for v in parser.urls:
  if not v or v.startswith(('data:','javascript:','blob:')):continue
  u=urlsplit(v);target=(p.parent/unquote(u.path)).resolve() if u.path else p
  if target.is_dir():target=target/'index.html'
  if u.scheme or not target.is_relative_to(root) or not target.exists():bad.append((str(p.relative_to(root)),v,'file'))
  elif u.fragment and target.suffix=='.html' and target.name!='webdeck.html' and unquote(u.fragment) not in parsed[target].ids:bad.append((str(p.relative_to(root)),v,'fragment'))
  count+=1
print('Checked',count,'references;',len(bad),'failures');
if bad:print(bad[:30]);raise SystemExit(1)
