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
for f in ['webdeck.html','practice.html','capacity-matrix.html','slide-transcript.html','workshop.css','capacity-matrix.js','practice.js','navigation.js']:
 cp(W/f,f)
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
mapping[BASE+'2026/']=OUT/'index.html';mapping[BASE+'2026/index.html']=OUT/'index.html';mapping[BASE]=OUT/'index.html';mapping[BASE+'index.html']=OUT/'index.html'
from protect_offline import build as build_protect
mapping['https://mglearn.github.io/tcea/protect_rubric_v2/']=build_protect()
external={}
def rel(target,p):return os.path.relpath(target,p.parent).replace(os.sep,'/')
def destination(value,source,p):
 value=html.unescape(value)
 if not value or value.startswith(('#','data:','javascript:','blob:')):return value
 absolute=urljoin(source,value);u=urlsplit(absolute);key=u._replace(fragment='',query='').geturl()
 if key in mapping:return rel(mapping[key],p)+('#'+u.fragment if u.fragment else '')
 if key==BASE+'2026/offline/':return rel(OUT/'index.html',p)
 ident='ref-'+hashlib.sha256(absolute.encode()).hexdigest()[:12]
 external[ident]=absolute
 return rel(OUT/'references.html',p)+'#'+ident
STYLE=''' :root{--teal:#007681;--aqua:#e4f4f4;--ink:#2e4f66;--muted:#526674;--line:#cbdfe2;--orange:#bf4310}input,select{font:16px Arial;min-height:40px;padding:8px;box-sizing:border-box}.indicator-table input{min-height:0}.print-answer{display:none}@media print{.print-answer{display:block}}body{margin:0;background:#fffefa;color:#2e4f66;font:17px/1.65 Arial,sans-serif}header,main,footer{max-width:1160px;margin:auto;padding:24px}header{display:flex;gap:22px;align-items:center;border-bottom:1px solid #cbdfe2}header img{width:105px}nav{display:flex;gap:18px;flex-wrap:wrap}a{color:#007681}h1{font:44px/1.1 Georgia,serif;max-width:850px}h2{font-size:26px;line-height:1.3}h3{font-size:20px}section{margin:32px 0;scroll-margin-top:24px}.hero{padding:30px;background:#e4f4f4;border-radius:14px}.eyebrow{font-size:12px;font-weight:bold;letter-spacing:.12em;text-transform:uppercase;color:#007681}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card{padding:22px;border:1px solid #cbdfe2;border-top:5px solid #007681;border-radius:8px;text-decoration:none;background:white}.card strong{display:block;font-size:20px}.card span{display:block;color:#2e4f66;margin-top:8px;font-size:15px}.button{display:inline-block;padding:12px 18px;border:1px solid #007681;border-radius:5px;background:#007681;color:white;text-decoration:none;font:700 15px Arial;cursor:pointer}.button.secondary{background:white;color:#007681}.actions{display:flex;gap:12px;flex-wrap:wrap}.notice{padding:18px;border-left:4px solid #ffcd34;background:#fff8df}table{border-collapse:collapse;width:100%}td,th{padding:12px;border:1px solid #cbdfe2;text-align:left}th{background:#e4f4f4}.table-scroll{overflow:auto}textarea{display:block;width:100%;box-sizing:border-box;padding:14px;min-height:140px;font:16px/1.5 Arial;border:1px solid #7895a5;margin:12px 0 22px}label{font-weight:bold}details{padding:18px;border:1px solid #cbdfe2;margin:18px 0}summary{cursor:pointer;font-weight:bold}pre{white-space:pre-wrap;overflow-wrap:anywhere}code,.reference-url{overflow-wrap:anywhere}.offline-form{margin:30px 0;padding:24px;background:#e4f4f4}footer{font-size:13px}img{max-width:100%;height:auto}@media(max-width:750px){.cards{grid-template-columns:1fr}h1{font-size:34px}header{display:block}nav{margin-top:16px}main{padding:16px}.hero{padding:22px}}@media print{header,nav,.actions,button{display:none}body{font-size:11pt}main{max-width:none;padding:0}.cards{display:block}.card{display:block;margin:12px 0}textarea{display:none}.print-answer{white-space:pre-wrap}section,details{break-inside:avoid}a{color:#2e4f66;text-decoration:none}}'''
(OUT/'offline.css').write_text(STYLE)
def shell(title,body):return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)} | NSPA offline workshop</title><link rel="stylesheet" href="offline.css"></head><body><header><img src="assets/nspa-logo.webp" alt="NSPA"><nav aria-label="Offline workshop"><a href="index.html">Start here</a><a href="webdeck.html">Present</a><a href="practice.html">Practice</a><a href="capacity-matrix.html">Capacity matrix</a><a href="facilitator.html">Facilitator</a></nav></header><main>{body}</main><footer>NSPA 2026 · Miguel Guhlin · October 21 · 3:30–5:00 PM CT · Offline edition</footer><script src="navigation.js"></script></body></html>'''
# Use whichever official logo filename is present in the shared site.
logos=list((OUT/'assets').glob('*logo*'))
logo=next((p for p in logos if p.suffix=='.webp'),logos[0])
def page(title,body):return shell(title,body).replace('assets/nspa-logo.webp',logo.relative_to(OUT).as_posix())
# Rewrite documents in their original URL context before replacing their site chrome.
for original,p in list(mapping.items()):
 if original=='https://mglearn.github.io/tcea/protect_rubric_v2/':continue
 if not p.exists() or p.suffix not in ['.html','.css']:continue
 s=p.read_text()
 s=re.sub(r'@import\s+url\([^)]*\)\s*;', '',s)
 if p.suffix=='.css':
  s=re.sub(r'@import[^;]+;', '',s)
 else:
  s=re.sub(r'<link\b[^>]*(?:fonts\.google|rel="(?:preconnect|canonical)")[^>]*>','',s)
  s=re.sub(r'(href|src)="([^"]*)"',lambda m:m[1]+'="'+E(destination(m[2],original,p),quote=True)+'"' if not m[2].startswith('data:') else m[0],s)
  s=s.replace('target="_blank"','target="_blank"')
  if p.name in ['practice.html','capacity-matrix.html','slide-transcript.html']:
   body=s.split('<main id="main" class="wrap workshop">')[1].split('</main>')[0]
   s=page(p.stem.replace('-',' ').title(),body).replace('</head>','<link rel="stylesheet" href="workshop.css"></head>')
  if p.name=='webdeck.html':
   s=s.replace('Navigation requires JavaScript.','Navigation requires JavaScript.')
   # PostMessage fallback also synchronizes presenter view on restrictive file:// origins.
   s=s.replace('function send(msg) {','function send(msg) {\n    try { if (window.opener) window.opener.postMessage({offlineDeck:CH,msg:msg}, "*"); if (presenterWin) presenterWin.postMessage({offlineDeck:CH,msg:msg}, "*"); } catch (_) {}')
   s=s.replace('function onMsg(fn) {','function onMsg(fn) {\n    window.addEventListener("message", function(e) { if ((e.source===window.opener || e.source===presenterWin) && e.data?.offlineDeck===CH) fn(e.data.msg); });')
   s=s.replace('location.pathname + \'?presenter=1\'', 'new URL("?presenter=1", location.href).href')
   cue='<p><strong>OFFLINE SESSION:</strong> Use the local practice packet and prepared reference outputs. No AI service is needed. Say: “Today we’ll work through the prepared examples together. They are teaching examples, not a live AI response.” Follow facilitator.html for the offline route.</p>'
   s=s.replace('<div class="notes">','<div class="notes">'+cue)
  p.write_text(s)
# The core lab remains useful with no clipboard permission or AI service.
p=OUT/'practice.html';s=p.read_text().replace('Use these fictional materials with an approved Gen AI tool, or complete the activities on paper. No real applicant data is needed.','Complete every activity locally or on paper. For the demonstrations, compare the fictional packet with the prepared teaching references below. No AI service or real applicant data is needed.')
s=s.replace('Compare it with a live output or use it offline.','Check it against the fictional packet together. It is not a recorded AI response.')
s=s.replace('<nav class="jump-links"','<p class="notice">Offline workshop: draft your answers below, export a text copy, or use the printed workbook. The prepared examples replace live model calls.</p><nav class="jump-links"',1)
workflow='''<section id="workflow"><h2>4. Map a protected workflow</h2><p>Draw five steps: approved input → draft → evidence check → human decision → record. Name a person at each check. Mark where work stops if information is not approved or evidence is missing.</p><p><a href="handouts/protected-workflow.pdf">Open the local workflow reference</a></p></section>'''
s=s.replace('<section id="policy">',workflow+'<section id="policy">').replace('4. Draft a fair','5. Draft a fair').replace('5. Set a 30-day','6. Set a 30-day')
fields=[('request','My revised five-part request'),('evidence','My evidence check and corrections for C-101'),('rubric','My independent ratings, evidence, and changes to the scoring guide'),('workflow','My workflow, named reviewers, data checks, and pause points'),('policy','My policy draft and neutral follow-up question'),('exit','My clearer request, one check, and one rule to clarify')]
form='<section class="offline-form"><h2>Keep your workshop drafts</h2><p>Type here or write on paper. Export before closing; browser storage availability varies for local files.</p>'+''.join(f'<label for="draft-{k}">{v}</label><textarea id="draft-{k}" data-draft="{k}" maxlength="15000"></textarea>' for k,v in fields)+'<div class="actions"><button class="button" id="export-drafts">Export my drafts</button><button class="button secondary" onclick="window.print()">Print my drafts</button></div><p id="draft-status" role="status"></p></section><script src="offline-drafts.js"></script>'
s=s.replace('</main>',form+'</main>');p.write_text(s)
(OUT/'offline-drafts.js').write_text('''const drafts=[...document.querySelectorAll('[data-draft]')],draftKey='nspa-offline-drafts-v1',draftStatus=document.querySelector('#draft-status');try{const saved=JSON.parse(localStorage.getItem(draftKey)||'{}');drafts.forEach(e=>e.value=typeof saved[e.dataset.draft]==='string'?saved[e.dataset.draft]:'');}catch{}drafts.forEach(e=>e.addEventListener('input',()=>{try{localStorage.setItem(draftKey,JSON.stringify(Object.fromEntries(drafts.map(e=>[e.dataset.draft,e.value]))));draftStatus.textContent='Saved in this browser. Export a copy before closing.';}catch{draftStatus.textContent='Export a copy before closing; browser storage is unavailable.';}}));document.querySelector('#export-drafts').onclick=()=>{const text='NSPA 2026 workshop drafts\\n\\n'+drafts.map(e=>e.previousElementSibling.textContent+'\\n'+e.value).join('\\n\\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='nspa-workshop-drafts.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);draftStatus.textContent='Drafts exported.';};addEventListener('beforeprint',()=>drafts.forEach(e=>{let p=e.nextElementSibling;if(!p.classList.contains('print-answer')){p=document.createElement('p');p.className='print-answer';e.after(p);}p.textContent=e.value||'No response entered.';}));''')
# Prevent an online-edition storage key from mixing with offline participant answers.
p=OUT/'capacity-matrix.js';p.write_text(p.read_text().replace('nspa-2026-checklist-v2','nspa-offline-checklist-v1'))
# Files commonly opened without a browser keep local workshop actions too.
for p in (OUT/'slides').glob('*.pptx'):
 with ZipFile(p) as z:
  parts={i.filename:z.read(i.filename) for i in z.infolist()}
 for name,data in list(parts.items()):
  if name.endswith('.rels'):
   root=ET.fromstring(data)
   for r in root:
    if r.get('TargetMode')=='External' and r.get('Type','').endswith('/hyperlink'):r.set('Target',destination(r.get('Target'),BASE+'2026/slides/'+p.name,p))
   parts[name]=ET.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
  if re.match(r'ppt/notesSlides/notesSlide\d+\.xml$',name):
   root=ET.fromstring(data)
   ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
   ts=root.findall('.//a:t',ns)
   if ts:ts[0].text='OFFLINE: Use prepared teaching examples in ../practice.html and the route in ../facilitator.html; no live AI service is needed.\n\n'+(ts[0].text or '')
   parts[name]=ET.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
 with ZipFile(p,'w',ZIP_DEFLATED) as z:
  for name,data in parts.items():z.writestr(name,data)
for p in list((OUT/'handouts').glob('*.pdf'))+list((OUT/'slides').glob('*.pdf')):
 reader=PdfReader(p);writer=PdfWriter();writer.clone_document_from_reader(reader)
 for pg in writer.pages:
  for ref in pg.get('/Annots',[]):
   ann=ref.get_object();act=ann.get('/A')
   if act and act.get('/URI'):act[NameObject('/URI')]=TextStringObject(destination(str(act['/URI']),BASE+'2026/'+p.relative_to(OUT).as_posix(),p))
 with p.open('wb') as f:writer.write(f)
# Overview and a friendly offline run of show supplement the full speaking script.
rows=''.join(f'<tr><th>{E(t)}</th><td>{E(topic)}</td><td>{E(out)}</td></tr>' for t,d,topic,out,_ in AGENDA)
fac='''<p class="eyebrow">Your offline route</p><h1>Lead the workshop without internet</h1><p>Keep the same 3:30–5:00 PM schedule and learning goals. Use the full speaking guide for the session; the directions below replace its live demonstration steps.</p><p><a class="button" href="handouts/facilitator-guide.pdf">Full speaking guide PDF</a> <a href="slide-transcript.html">Slide-by-slide notes</a></p><h2>Before people arrive</h2><ol><li>Extract the complete ZIP. Open index.html from the extracted folder. Keep all files together.</li><li>Open webdeck.html and this guide in separate windows. Press V for presenter view, S for notes, and F for fullscreen. If a popup is blocked, allow it or use S.</li><li>Print the participant workbook, three-page capacity matrix, and session takeaway. Use the quick references as table handouts.</li><li>Put the extracted package on a USB drive if participants need their own copy. With no network, participants cannot open links on their own devices unless they have the files.</li></ol><h2>What to say at the start</h2><p>“We have everything we need right here. Today we’ll use a made-up application and prepared examples. You can type in the local practice page or work on paper. We’re practicing how to ask a clear question, check the answer, and decide what a person needs to do next.”</p><h2>3:38–3:50 Build the request</h2><p>Open the prompt lab. Give partners two minutes to choose a task, two to write the request, and one to swap and remove a guess. Save the revised request in the workbook or local draft fields.</p><h2>3:50–4:05 Replace the live completeness demo</h2><p>“Let’s look at the application first. Which information can we point to? Which information is missing? Now we’ll compare our reading with this prepared example. This is a teaching reference, not a response from a model we just ran.”</p><ol><li>Open <a href="practice.html#packet">C-101</a>; read P1–P5 together.</li><li>Ask participants to make their own present, missing, or unclear list.</li><li>Reveal the <a href="practice.html#demo-completeness">prepared completeness table</a>. Check each entry against the packet.</li><li>Ask: “What should happen to the instruction in P5? What follow-up would we need for P4?” Record a correction and a human follow-up.</li></ol><h2>4:05–4:20 Replace live rubric scoring</h2><p>“Score the example on your own first. Then tell your partner which words support your rating. We’ll use the prepared discussion reference to compare our reasons, not to choose a winner.”</p><p>Use the <a href="practice.html#rubric">rubric</a>, then reveal the <a href="practice.html#demo-scoring">calibration reference</a>. Keep disagreements visible, revise one ambiguous scoring description, and record why a rating changed.</p><h2>4:20–4:30 Map the checks</h2><p>Open the <a href="practice.html#workflow">workflow activity</a>. Ask pairs to name the person who approves the input, checks evidence, decides, and records the outcome. Add a stop condition.</p><h2>4:30–4:45 Discuss applicant AI use</h2><p>Use the flagged essay and translation-help scenario in the <a href="practice.html#policy">policy lab</a>. Ask which published rule applies, what evidence matters, and what a neutral question would say. A flag alone does not establish misconduct. No detector is needed for this activity.</p><h2>4:45–5:00 Choose and keep a next step</h2><p>Complete the <a href="capacity-matrix.html">capacity matrix</a> and 30-day action plan. Ask participants to share one clearer request, one human check, and one rule to clarify. Export their drafts and plan, or keep the printed pages.</p><div class="table-scroll"><table><thead><tr><th>Time CT</th><th>Focus</th><th>What participants make</th></tr></thead><tbody>'''+rows+'''</tbody></table></div>'''
(OUT/'facilitator.html').write_text(page('Offline facilitator route',fac))
cards=[('Present the webdeck','webdeck.html','26 slides, embedded images, speaker notes, and local practice links.'),('Practice and keep drafts','practice.html','Fictional packet, prepared demos, rubric, workflow, policy, and exportable drafts.'),('Mark the capacity matrix','capacity-matrix.html','Self-assessment, notes, a 30-day plan, export, and print.'),('Lead the session','facilitator.html','Friendly instructions for running all 90 minutes without a live AI service.'),('Read the takeaway','session-takeaways.docx','The NSPA template filled with the session’s key points.'),('Print the participant workbook','handouts/participant-workbook.pdf','Paper activities and space to write during the workshop.')]
body='<section class="hero"><p class="eyebrow">NSPA 2026 · Complete offline workshop</p><h1>Trust, Transparency, and AI</h1><p>Building Responsible Scholarship Review Practices</p><p><strong>Start here:</strong> open this file in your browser after extracting the ZIP. No installation, login, server, or internet connection is needed for the slides and activities.</p><p>Prepared examples replace live AI demonstrations. You will still build a prompt, check evidence, calibrate a rubric, map a protected workflow, and draft a fair policy.</p></section><div class="cards" id="library">'+''.join(f'<a class="card" href="{u}"><strong>{t}</strong><span>{d}</span></a>' for t,u,d in cards)+'</div><section><h2>Presentation and print files</h2><ul>'+''.join(f'<li><a href="{p.relative_to(OUT).as_posix()}">{E(p.stem.replace("-"," "))} ({p.suffix[1:].upper()})</a></li>' for p in sorted([*(OUT/'slides').glob('*'),*(OUT/'handouts').glob('*.pdf')]) if p.is_file())+'</ul><p><a href="session-takeaways.pdf">Printable session takeaway PDF</a> · <a href="resources/ethics-toolkit.html">Optional ethics discussion toolkit</a> · <a href="resources/protect/index.html">PROTECT manual privacy review</a></p><p><a href="slide-transcript.html">Complete slide text and speaking notes</a> · <a href="references.html">Source summaries and reference addresses</a></p></section><section id="sources"><h2>Keep your work and share the package</h2><p>Export your activity drafts and capacity plan before closing the browser. Browser storage for local files varies. You can also print or use the paper workbook. Keep the folder structure intact when copying the package to a USB drive or another computer.</p><p>PowerPoint and PDFs are included as backups. Some document viewers restrict links to local files; the webdeck and this start page provide the same resources directly.</p><p>External research pages and AI services are not required for the session. Their addresses are retained in the local reference directory for later reading; these are summaries, not copies of the full publications.</p></section>'
(OUT/'index.html').write_text(page('Start here',body))
refbody='<p class="eyebrow">Read without a connection</p><h1>Sources and supporting resources</h1><p>The summaries below preserve the source context used in the presentation. Full publications and external services are not bundled. The workshop activities and prepared examples are all local.</p>'
for title,url,desc in SOURCES:
 ident='ref-'+hashlib.sha256(url.encode()).hexdigest()[:12];external[ident]=url
 refbody+=f'<section id="{ident}"><h2>{E(title)}</h2><p>{E(desc)}</p><p class="reference-url">Original address for later reading: {E(url)}</p></section>'
sourceurls={u for _,u,_ in SOURCES}
refbody+='<h2>Other addresses for later</h2><p>These optional links appeared in the supporting resources. They are not needed to complete the offline workshop.</p>'
for ident,url in sorted(external.items()):
 if url not in sourceurls:refbody+=f'<section id="{ident}"><p class="reference-url">{E(url)}</p><p>This external resource is available when you reconnect. Return to <a href="index.html">the local workshop</a> for the included practice materials.</p></section>'
(OUT/'references.html').write_text(page('Source summaries',refbody))
(OUT/'START-HERE.txt').write_text('NSPA 2026 OFFLINE WORKSHOP\n\nExtract the entire ZIP first. Open index.html in a browser. Keep all files together.\nNo installation, server, login, or internet is required for slides and activities.\nOpen facilitator.html for the offline 90-minute route. Prepared examples replace live AI calls.\nPrint handouts/participant-workbook.pdf and handouts/capacity-matrix.pdf for paper activities.\nExport drafts and the capacity plan before closing the browser.\nExternal research is summarized in references.html; full external publications and services are not bundled.\nPowerPoint/PDF link behavior depends on your viewer; use the webdeck for local navigation.\n')
print('Offline workshop built:',OUT)
