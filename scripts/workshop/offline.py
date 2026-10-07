"""Build a portable, no-server workshop, with local practice links and paper fallbacks."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import shutil,re,os,html,json,hashlib
from urllib.parse import urljoin,urlsplit,unquote
from lxml import etree as ET
from pypdf import PdfReader,PdfWriter
from pypdf.generic import TextStringObject,NameObject
from content import ROOT,TITLE,AGENDA,SOURCES,DOMAINS
W=ROOT/'2026';OUT=W/'offline';OUT.mkdir(exist_ok=True)
BASE='https://mguhlin.github.io/nspa/'
E=html.escape
mapping={}
def cp(src,dst):
 dst=OUT/dst;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);mapping[BASE+src.relative_to(ROOT).as_posix()]=dst
for f in ['conversation.html','practice.html','capacity-matrix.html','slide-transcript.html','workshop.css','capacity-matrix.js','practice.js','navigation.js','workshop-flow.js']:
 cp(W/f,f)
for f in ['index.html','webdeck.html','slide-transcript.html','presenter-route.pdf','facilitator-guide.pdf','slides/nspa-trust-transparency-ai.pptx']:
 cp(W/'p'/f,'p/'+f)
mapping[BASE+'2026/p/']=OUT/'p/index.html'
for folder in ['assets']:
 for p in (ROOT/folder).rglob('*'):
  if p.is_file():cp(p,p.relative_to(ROOT))
for folder in ['handouts','slides','images/quick-reference']:
 for p in (W/folder).rglob('*'):
  if p.is_file():cp(p,p.relative_to(W))
cp(W/'images/session-concept.webp','images/session-concept.webp')
# Local enrichment resources linked from the capacity matrix, plus framework examples.
resource_names={Path(u).name for d in DOMAINS for _,u in d['links'] if '../resources/' in u}
resource_names.add('ethics-toolkit.html')
cp(ROOT/'resources/ethics-toolkit.js','resources/ethics-toolkit.js')
resource_names.update(p.name for p in (ROOT/'resources').glob('nspa-example*.html'))
for name in sorted(resource_names):cp(ROOT/'resources'/name,'resources/'+name)
mapping[BASE+'resources/library.html']=OUT/'library.html';mapping[BASE+'resources/infographics.html']=OUT/'infographics.html'
mapping[BASE+'2026/']=OUT/'index.html';mapping[BASE+'2026/index.html']=OUT/'index.html';mapping[BASE]=OUT/'library.html';mapping[BASE+'index.html']=OUT/'library.html'
from protect_offline import build as build_protect
mapping['https://mglearn.github.io/tcea/protect_rubric_v2/']=build_protect()
external={}
def rel(target,p):return os.path.relpath(target,p.parent).replace(os.sep,'/')
def destination(value,source,p):
 value=html.unescape(value)
 if not value or value.startswith(('#','data:','javascript:','blob:')):return value
 absolute=urljoin(source,value);u=urlsplit(absolute);key=u._replace(fragment='',query='').geturl()
 if key==BASE+'2026/' and u.fragment=='sources':return rel(OUT/'references.html',p)+'#sources'
 if key in mapping:return rel(mapping[key],p)+('#'+u.fragment if u.fragment else '')
 if key==BASE+'2026/offline/':return rel(OUT/'index.html',p)
 ident='ref-'+hashlib.sha256(absolute.encode()).hexdigest()[:12]
 external[ident]=absolute
 return rel(OUT/'references.html',p)+'#'+ident
STYLE=''' :root{--teal:#007681;--aqua:#e4f4f4;--ink:#2e4f66;--muted:#526674;--line:#cbdfe2;--orange:#bf4310}input,select{font:16px Arial;min-height:40px;padding:8px;box-sizing:border-box}.indicator-table input{min-height:0}.print-answer{display:none}@media print{.print-answer{display:block}}body{margin:0;background:#fffefa;color:#2e4f66;font:17px/1.65 Arial,sans-serif}header,main,footer{max-width:1160px;margin:auto;padding:24px}header{display:flex;gap:22px;align-items:center;border-bottom:1px solid #cbdfe2}header img{width:105px}nav{display:flex;gap:18px;flex-wrap:wrap}a{color:#007681}h1{font:44px/1.1 Georgia,serif;max-width:850px}h2{font-size:26px;line-height:1.3}h3{font-size:20px}section{margin:32px 0;scroll-margin-top:24px}.hero{padding:30px;background:#e4f4f4;border-radius:14px}.eyebrow{font-size:12px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:#007681}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card{padding:22px;border:1px solid #cbdfe2;border-top:5px solid #007681;border-radius:8px;text-decoration:none;background:white}.card strong{display:block;font-size:20px}.card span{display:block;color:#2e4f66;margin-top:8px;font-size:15px}.button{display:inline-block;padding:12px 18px;border:1px solid #007681;border-radius:5px;background:#007681;color:white;text-decoration:none;font:700 15px Arial;cursor:pointer}.button.secondary{background:white;color:#007681}.actions{display:flex;gap:12px;flex-wrap:wrap}.notice{padding:18px;border-left:4px solid #ffcd34;background:#fff8df}table{border-collapse:collapse;width:100%}td,th{padding:12px;border:1px solid #cbdfe2;text-align:left}th{background:#e4f4f4}.table-scroll{overflow:auto}textarea{display:block;width:100%;box-sizing:border-box;padding:14px;min-height:140px;font:16px/1.5 Arial;border:1px solid #7895a5;margin:12px 0 22px}label{font-weight:bold}details{padding:18px;border:1px solid #cbdfe2;margin:18px 0}summary{cursor:pointer;font-weight:bold}pre{white-space:pre-wrap;overflow-wrap:anywhere}code,.reference-url{overflow-wrap:anywhere}.offline-form{margin:30px 0;padding:24px;background:#e4f4f4}footer{font-size:13px}img{max-width:100%;height:auto}@media(max-width:750px){.cards{grid-template-columns:1fr}h1{font-size:34px}header{display:block}nav{margin-top:16px}main{padding:16px}.hero{padding:22px}}@media print{header,nav,.actions,button{display:none}body{font-size:11pt}main{max-width:none;padding:0}.cards{display:block}.card{display:block;margin:12px 0}textarea{display:none}.print-answer{white-space:pre-wrap}section,details{break-inside:avoid}a{color:#2e4f66;text-decoration:none}}'''
(OUT/'offline.css').write_text(STYLE)
def shell(title,body,prefix=''):return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)} | NSPA offline workshop</title><link rel="stylesheet" href="{prefix}offline.css"></head><body><header><img src="{prefix}assets/nspa-logo.webp" alt="NSPA"><nav aria-label="Offline workshop"><a href="{prefix}index.html">Start here</a><a href="{prefix}slides/nspa-trust-transparency-ai.pdf">Slides PDF</a><a href="{prefix}conversation.html">Conversation</a><a href="{prefix}handouts/participant-workbook.pdf">Workbook</a></nav></header><main>{body}</main><footer>NSPA 2026 · Miguel Guhlin · October 21 · 3:30–5:00 PM CT · Offline edition</footer><script src="{prefix}navigation.js"></script></body></html>'''
# Use whichever official logo filename is present in the shared site.
logos=list((OUT/'assets').glob('*logo*'))
logo=next((p for p in logos if p.suffix=='.webp'),logos[0])
def page(title,body,prefix=''):
 result=shell(title,body,prefix).replace('assets/nspa-logo.webp',logo.relative_to(OUT).as_posix())
 return result.replace('</head>','<meta name="robots" content="noindex"></head>') if prefix else result
# Rewrite documents in their original URL context before replacing their site chrome.
rewritten=set()
for original,p in list(mapping.items()):
 if p in rewritten:continue
 rewritten.add(p)
 if original=='https://mglearn.github.io/tcea/protect_rubric_v2/':continue
 if not p.exists() or p.suffix not in ['.html','.css']:continue
 s=p.read_text()
 if p==OUT/'p/index.html':
  s=re.sub(r'<section><h2>Take the presenter materials offline</h2>.*?</section>', '', s)
 s=re.sub(r'@import\s+url\([^)]*\)\s*;', '',s)
 if p.suffix=='.css':
  s=re.sub(r'@import[^;]+;', '',s)
 else:
  s=re.sub(r'<link\b[^>]*(?:fonts\.google|rel="(?:preconnect|canonical)")[^>]*>','',s)
  s=re.sub(r'(href|src)="([^"]*)"',lambda m:m[1]+'="'+E(destination(m[2],original,p),quote=True)+'"' if not m[2].startswith('data:') else m[0],s)
  s=s.replace('Full resource library','Included offline resources')
  if p.name in ['conversation.html','practice.html','capacity-matrix.html','slide-transcript.html'] or p==OUT/'p/index.html':
   body=s.split('<main id="main" class="wrap workshop">')[1].split('</main>')[0]
   prefix='../' if p.parent==OUT/'p' else ''
   s=page(p.stem.replace('-',' ').title(),body,prefix).replace('</head>',f'<link rel="stylesheet" href="{prefix}workshop.css"><script src="{prefix}workshop-flow.js" defer></script></head>')
  if p.name=='webdeck.html':
   s=s.replace('Navigation requires JavaScript.','Navigation requires JavaScript.')
   # PostMessage fallback also synchronizes presenter view on restrictive file:// origins.
   s=s.replace('function send(msg) {','function send(msg) {\n    try { if (window.opener) window.opener.postMessage({offlineDeck:CH,msg:msg}, "*"); if (presenterWin) presenterWin.postMessage({offlineDeck:CH,msg:msg}, "*"); } catch (_) {}')
   s=s.replace('function onMsg(fn) {','function onMsg(fn) {\n    window.addEventListener("message", function(e) { if ((e.source===window.opener || e.source===presenterWin) && e.data?.offlineDeck===CH) fn(e.data.msg); });')
   s=s.replace('location.pathname + \'?presenter=1\'', 'new URL("?presenter=1", location.href).href')
   cue='<p><strong>OFFLINE SESSION:</strong> Use the local conversation companion and prepared teaching draft. No AI service is needed. Say: “Today we’ll work through the prepared examples together. They are teaching examples, not a live AI response.” Keep your presenter route and full offline speaking guide beside the slides.</p>'
   s=s.replace('<div class="notes">','<div class="notes">'+cue)
  p.write_text(s)
# The core lab remains useful with no clipboard permission or AI service.
p=OUT/'practice.html';s=p.read_text().replace('Use these fictional materials with an approved Gen AI tool, or complete the activities on paper. No real applicant data is needed.','Complete every activity locally or on paper. For the demonstrations, compare the fictional packet with the prepared teaching references below. No AI service or real applicant data is needed.')
s=s.replace('Compare it with a live output or use it offline.','Check it against the fictional packet together. It is not a recorded AI response.')
s=s.replace('<nav class="jump-links"','<p class="notice">Offline workshop: draft your answers below, export a text copy, or use the printed workbook. The prepared examples replace live model calls.</p><nav class="jump-links"',1)
p.write_text(s)
# Draft saving and exports are maintained in the shared practice.js file.
# Prevent an online-edition storage key from mixing with offline participant answers.
p=OUT/'capacity-matrix.js';p.write_text(p.read_text().replace('nspa-2026-checklist-v2','nspa-offline-checklist-v1'))
# Files commonly opened without a browser keep local workshop actions too.
for p in (OUT/'p/slides').glob('*.pptx'):
 with ZipFile(p) as z:
  parts={i.filename:z.read(i.filename) for i in z.infolist()}
 for name,data in list(parts.items()):
  if name.endswith('.rels'):
   root=ET.fromstring(data)
   for r in root:
    if r.get('TargetMode')=='External' and r.get('Type','').endswith('/hyperlink'):r.set('Target',destination(r.get('Target'),BASE+'2026/p/slides/'+p.name,p))
   parts[name]=ET.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
  if re.match(r'ppt/notesSlides/notesSlide\d+\.xml$',name):
   root=ET.fromstring(data)
   ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
   ts=root.findall('.//a:t',ns)
   if ts:ts[0].text='OFFLINE: Follow ../../conversation.html with the prepared teaching examples and the route in ../facilitator.html; no live AI service is needed.\n\n'+(ts[0].text or '')
   parts[name]=ET.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
 with ZipFile(p,'w',ZIP_DEFLATED) as z:
  for name,data in parts.items():z.writestr(name,data)
for p in list((OUT/'handouts').glob('*.pdf'))+list((OUT/'slides').glob('*.pdf'))+list((OUT/'p').glob('*.pdf')):
 reader=PdfReader(p);writer=PdfWriter();writer.clone_document_from_reader(reader)
 for pg in writer.pages:
  for ref in pg.get('/Annots',[]):
   ann=ref.get_object();act=ann.get('/A')
   if act and act.get('/URI'):act[NameObject('/URI')]=TextStringObject(destination(str(act['/URI']),BASE+'2026/'+p.relative_to(OUT).as_posix(),p))
 with p.open('wb') as f:writer.write(f)
# Overview and a friendly offline run of show supplement the full speaking script.
rows=''.join(f'<tr><th>{E(t)}</th><td>{E(topic)}</td><td>{E(out)}</td></tr>' for t,d,topic,out,_ in AGENDA)
from facilitator import SECTIONS
fac='<p class="eyebrow">Your offline speaker’s guide</p><h1>Lead the conversation without internet</h1><p>Follow the same 12 core slides and 3:30–5:00 PM route. Use the prepared draft in the conversation companion. Every core activity works on paper or locally.</p><p><a class="button" href="facilitator-guide.pdf">Speaker’s guide PDF</a> <a href="../conversation.html">Conversation companion</a></p><h2>Before people arrive</h2><p>Extract the whole ZIP, keep its folders together, and open index.html. Open p/webdeck.html and the conversation companion in separate windows. Press V for presenter view, S for notes, and F for fullscreen. Print the six-page workbook. A silent timer helps protect the reflection time.</p><p>Shorten whole-room reporting if needed. Keep independent thinking, the two-minute silence, and the fair-response discussion. Move to slide 12 at 4:50. The appendix is optional.</p>'
for number,section in enumerate(SECTIONS,1):
 fac+=f'<section><h2>{number:02}. {E(section["title"])}</h2><p>{E(section["time"])}</p>'
 for label,kind,words in section['parts']:
  fac+=f'<h3>{E(label)} ({"Say this" if kind=="say" else "Presenter cue"})</h3>'+''.join('<p>'+E(paragraph)+'</p>' for paragraph in words.split('\n\n'))
 fac+='</section>'
(OUT/'p/facilitator.html').write_text(page('Offline facilitator route',fac,'../'))
p=OUT/'p/index.html'
s=p.read_text()
s=re.sub(r'<section><h2>Take the presenter materials offline</h2>.*?</section>', '<section><h2>Your offline speaking guide</h2><p>All activities and slides in this folder work without internet.</p></section>', s)
s=s.replace('</main>','<section><h2>More offline presenter resources</h2><p><a href="facilitator.html">Full offline speaking guide</a> · <a href="../practice.html">Optional labs</a> · <a href="../capacity-matrix.html">Readiness checklist</a> · <a href="../infographics.html">Infographic collection</a> · <a href="../library.html">Included resource library</a></p></section></main>')
p.write_text(s)
cards=[('Join the conversation','conversation.html','One fictional case, time to think, saved notes, and one change to try.'),('View the slide PDF','slides/nspa-trust-transparency-ai.pdf','12 core slides and 6 optional references, without speaker’s notes.'),('Use the participant workbook','handouts/participant-workbook.pdf','The shared case and space for your reflections.')]
body='<section class="hero"><h1>Trust, Transparency, and AI</h1><p>October 21, 2026 · 3:30–5:00 PM CT</p><p>Open this file in your browser after extracting the ZIP. Think quietly, compare perspectives, and choose one change to try with a colleague.</p><p>No account, installation, or internet connection is needed for the conversations. Your answers are your own notes; no AI service is required.</p></section><div class="cards">'+''.join(f'<a class="card" href="{u}"><strong>{t}</strong><span>{d}</span></a>' for t,u,d in cards)+'</div><section><h2>Keep a short reference</h2><p><a href="session-takeaways.pdf">Two-page takeaways</a></p><p>Export your conversation notes before closing the browser. You can also print or use the paper workbook. Keep all folders together when copying this kit.</p><p>Browse the infographic collection and full resource library at https://mguhlin.github.io/nspa/ when you reconnect.</p></section>'
(OUT/'index.html').write_text(page('Start here',body))
from lxml import html as LH
library_source=LH.parse(str(ROOT/'resources/infographics.html'))
visuals=''.join(LH.tostring(section,encoding='unicode') for section in library_source.xpath('//section[contains(@class,"featured-infographics")]'))
visuals=re.sub(r'(href|src)="([^"]*)"',lambda m:m[1]+'="'+E(destination(m[2],BASE+'resources/infographics.html',OUT/'infographics.html'),quote=True)+'"',visuals)
library='<section id="library"><h1>Infographics and included resources</h1><p>The ten original infographic downloads are available here. Selected practice guides and references accompany the core workshop. The complete public library remains at https://mguhlin.github.io/nspa/ for further exploration when you reconnect.</p></section><p><a href="infographics.html">Open the infographic collection</a></p><section><h2>Included guides</h2><ul>'+''.join(f'<li><a href="resources/{E(name)}">{E(name.removesuffix(".html").replace("-"," ").replace("_"," "))}</a></li>' for name in sorted(resource_names))+'</ul><p><a href="practice.html">Optional practice labs</a> · <a href="capacity-matrix.html">Optional readiness checklist</a> · <a href="references.html">External addresses for later reading</a></p></section>'
(OUT/'infographics.html').write_text(page('Infographic collection',visuals).replace('</head>','<style>.infographic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.infographic-card{padding:18px;border:1px solid #cbdfe2}.infographic-actions{display:flex;gap:16px}@media(max-width:750px){.infographic-grid{grid-template-columns:1fr}}</style></head>'))
(OUT/'library.html').write_text(page('Infographics and included resources',library).replace('</head>','<style>.infographic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.infographic-card{padding:18px;border:1px solid #cbdfe2}.infographic-actions{display:flex;flex-wrap:wrap;gap:16px}@media(max-width:750px){.infographic-grid{grid-template-columns:1fr}}</style></head>'))
refbody='<p class="eyebrow">Read without a connection</p><h1 id="sources">Sources and supporting resources</h1><p>The summaries below preserve the source context used in the presentation. Full publications and external services are not bundled. The workshop activities and prepared examples are all local.</p>'
for title,url,desc in SOURCES:
 ident='ref-'+hashlib.sha256(url.encode()).hexdigest()[:12];external[ident]=url
 refbody+=f'<section id="{ident}"><h2>{E(title)}</h2><p>{E(desc)}</p><p class="reference-url">Original address for later reading: {E(url)}</p></section>'
sourceurls={u for _,u,_ in SOURCES}
refbody+='<h2>Other addresses for later</h2><p>These optional links appeared in the supporting resources. They are not needed to complete the offline workshop.</p>'
for ident,url in sorted(external.items()):
 if url not in sourceurls:refbody+=f'<section id="{ident}"><p class="reference-url">{E(url)}</p><p>This external resource is available when you reconnect. Return to <a href="index.html">the local workshop</a> for the included practice materials.</p></section>'
(OUT/'references.html').write_text(page('Source summaries',refbody))
(OUT/'START-HERE.txt').write_text('NSPA 2026 OFFLINE WORKSHOP\n\nExtract the entire ZIP first. Open index.html in a browser. Keep all files together.\nNo installation, server, login, or internet is required for slides and activities.\nOpen conversation.html for the activities. Prepared examples replace live AI calls.\nPrint the six-page handouts/participant-workbook.pdf. Export conversation notes before closing the browser.\nExternal research is summarized in references.html; full external publications and services are not bundled.\nPowerPoint/PDF link behavior depends on your viewer; use the workshop start page for local navigation.\n')
print('Offline workshop built:',OUT)
