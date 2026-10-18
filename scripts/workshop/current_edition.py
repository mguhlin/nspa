"""October 18 supplied-deck edition. Revise visual slides and derive companion materials.

Run this after the legacy site/reference builders; retired kits are not rebuilt.
The supplied webdeck and PPTX are private inputs; committed webdeck is the fallback.
"""
from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape
import html as H
import json
import re
from lxml import html, etree
from activities import sections as complete_sections, workbook_story, ROUTE
from visual_deck import patch_html_deck, patch_powerpoint
from experience import learning_intentions
from demo_one import patch_html as patch_demo_html, patch_pptx_slide, patch_pptx_notes, ANATOMY, PROMPT as DEMO_PROMPT, SOURCE as DEMO_SOURCE, DRAFT as DEMO_DRAFT
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[2]
W = ROOT / '2026'
URL = 'https://mguhlin.github.io/nspa/2026/'
TITLE = 'Trust, Transparency, and AI: Building Responsible Scholarship Review Practices'
OLD_NOTE = 'The resource site provides related NSPA workshop materials; its current workshop route differs from this sixty-minute adaptation.'
NEW_NOTE = 'The session is 90 minutes, 3:30–5:00 PM CT. The route integrates explanations, eight complete activities, and transitions. The companion, workbook and takeaways match this presentation.'
AGENDA = [(title,nums,duration,time) for time,nums,title,duration in ROUTE]

def slides():
 tree = html.fromstring((W / 'p/webdeck.html').read_text())
 return tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," slide ")]')
def title(slide):
 return ' '.join(' '.join(slide.xpath('.//h1//text()|.//h2//text()')).split())
def notes(slide):
 return slide.xpath('./div[@class="notes"]')[0]
def visible(slide):
 body = deepcopy(slide.xpath('./div[@class="slide-body"]')[0])
 for el in body.iter():
  for key in list(el.attrib):
   if key not in ['href', 'colspan', 'rowspan']: del el.attrib[key]
 for el in list(body.xpath('.//img|.//div[not(normalize-space())]')):
  el.getparent().remove(el)
 for col in body.xpath('.//colgroup'): col.getparent().remove(col)
 return html.tostring(body, encoding='unicode')
def shell(title_text, body, presenter=False):
 prefix = '../' if presenter else ''
 return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{H.escape(title_text)} | NSPA 2026</title>{'<meta name="robots" content="noindex">' if presenter else ''}<link rel="stylesheet" href="{prefix}../assets/site.css"><link rel="stylesheet" href="{prefix}workshop.css"><script src="{prefix}../assets/resource-navigation.js" defer></script><script src="{prefix}navigation.js" defer></script></head><body><a class="skip" href="#main">Skip to content</a><header class="masthead wrap"><div class="brand"><a href="{prefix}../"><img class="nspa-logo" src="{prefix}../assets/nspa-logo.png" width="110" height="70" alt="NSPA"></a><span class="brand-caption">A resource collection<br>by <a href="https://mguhlin.org">Miguel Guhlin</a></span></div><nav aria-label="Main navigation"><a href="{prefix}./">Workshop</a><details class="resource-menu"><summary>Resources</summary><div class="resource-menu-links"><a href="{prefix}../resources/infographics.html">Infographic collection</a><a href="{prefix}../resources/library.html">Resource library</a><a href="{prefix}resources.html">Workshop materials</a></div></details></nav></header><nav class="workshop-nav wrap" aria-label="Workshop navigation"><a href="{prefix}./">Workshop hub</a><a href="{prefix}slides/nspa-trust-transparency-ai.pdf">Presentation PDF</a><a href="{prefix}conversation.html">Session companion</a><a href="{prefix}handouts/participant-workbook.pdf">Workbook</a></nav><main id="main" class="wrap workshop">{body}</main><footer class="wrap footer"><p>October 21, 2026 · 3:30–5:00 PM CT · 90 minutes · <a href="https://mguhlin.org">Miguel Guhlin</a></p></footer></body></html>'''
def cards(entries):
 return '<div class="download-grid">'+''.join(f'<a class="download" href="{u}"><span class="filetype">{kind}</span><span><strong>{t}</strong><small>{d}</small></span></a>' for t,u,d,kind in entries)+'</div>'
def agenda():
 return '<div class="table-scroll"><table><thead><tr><th>Focus</th><th>Slides</th><th>Suggested time</th><th>Use</th></tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+H.escape(x)+'</td>' for x in row)+'</tr>' for row in AGENDA)+'</tbody></table></div><p>This 90-minute route includes explanations, the eight activities, and transitions. B1–B4 remain optional backups.</p>'
def prepare_deck():
 source = ROOT/'supplemental-resources/NSPA26-Scholarship-Review-Webdeck.html'
 text = (source if source.exists() else W/'p/webdeck.html').read_text()
 text = text.replace('60-minute workshop','90-minute workshop').replace(OLD_NOTE,NEW_NOTE)
 text = text.replace('Our 60-minute route is:', 'Our 90-minute route integrates explanations and eight complete activities. The earlier section cues were:')
 text = text.replace('https://studentprivacy.ed.gov/privacy-and-data-sharing.', 'https://studentprivacy.ed.gov/privacy-and-data-sharing')
 text = text.replace("href: 'https://mguhlin.github.io/nspa/2026/'", "href: './'")
 text = text.replace('height:91px;font-size:27px;', 'height:103px;font-size:27px;')
 text = text.replace('</head>', '<meta name="robots" content="noindex"></head>') if 'name="robots"' not in text else text
 text = patch_demo_html(text)
 text = text.replace('If people read the descriptors differently, clarify the rubric and compare evidence.', 'If reviewers interpret a score description differently, compare the quoted evidence and clarify the wording.')
 text = text.replace('If people read the descriptors differently,<br>clarify the rubric and compare evidence.', 'If reviewers interpret a score description differently,<br>compare the quoted evidence and clarify the wording.')
 text = patch_html_deck(text)
 (W/'p/webdeck.html').write_text(text)
 source = ROOT/'supplemental-resources/trust_transparency_ai_scholarship_review_nspa26.pptx'
 target = W/'p/slides/nspa-trust-transparency-ai.pptx'
 if source.exists():
  with ZipFile(source) as zin, ZipFile(target,'w',ZIP_DEFLATED) as zout:
   for item in zin.infolist():
    data=zin.read(item.filename)
    if item.filename in ['ppt/slides/slide1.xml','ppt/notesSlides/notesSlide1.xml','ppt/notesSlides/notesSlide24.xml']:
     data=data.replace(b'60-minute workshop',b'90-minute workshop').replace(OLD_NOTE.encode(),NEW_NOTE.encode()).replace(b'Our 60-minute route is:',b'Our 90-minute route integrates explanations and eight complete activities. The earlier section cues were:')
    if item.filename=='ppt/slides/slide10.xml':data=patch_pptx_slide(data)
    if item.filename=='ppt/notesSlides/notesSlide10.xml':data=patch_pptx_notes(data)
    if item.filename=='ppt/slides/slide7.xml':
     root=etree.fromstring(data)
     for shape in root.findall('.//{http://schemas.openxmlformats.org/presentationml/2006/main}sp'):
      ts=shape.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}t')
      if ts and 'If people read the descriptors differently' in ''.join(t.text or '' for t in ts):
       words=['If reviewers interpret a score description differently,','compare the quoted evidence and clarify the wording.']
       if len(ts)==2:
        for t,word in zip(ts,words):t.text=word
       else:
        ts[0].text=' '.join(words)
        for t in ts[1:]:t.text=''
     data=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
    zout.writestr(item,data)
 patch_powerpoint(target,slides())

def companion_sections(ss):
 return complete_sections()

def build_pages(ss, sections):
 intro=f'<p class="eyebrow">NSPA26 · October 21 · 3:30–5:00 PM CT · 90 minutes</p><h1>{TITLE}</h1><p class="lead">AI can sort, summarize, and suggest. People decide.</p><p>I can explore both sides of scholarship review: AI supporting my team and AI supporting applicants. I will examine three prepared demonstrations, compare policy choices, and plan a small pilot with staff verification.</p><p>24 core slides and four backup references. My companion and workbook include all case information, worked examples, and note spaces. No AI account is required.</p><p><a class="button" href="conversation.html">Open the session companion</a></p>'
 downloads=[('Participant workbook','handouts/participant-workbook.pdf','A cover, complete activity materials, worked examples and space for my notes','PDF'),('Presentation PDF','slides/nspa-trust-transparency-ai.pdf','28 slides for viewing and sharing','PDF'),('Session takeaways','handouts/session-takeaways.pdf','Two-page reference aligned to this presentation','PDF')]
 (W/'index.html').write_text(shell(TITLE,intro+'<section id="downloads"><h2>Keep the participant materials</h2>'+cards(downloads)+'</section><details class="workshop-details"><summary>Session route and discussion time</summary>'+agenda()+'</details><p><a href="resources.html">Prompts, editable takeaways, and supporting resources</a></p><p id="sources"><a href="resources.html#sources">Sources and interpretation</a></p>'))
 body='<p class="eyebrow">My session companion</p><h1>Evidence, human checks, and clear expectations</h1><p class="lead">I can follow the presentation or work through these activities with a colleague. My notes stay in this browser. All cases, records, operational constraints, and prepared AI drafts in this companion are fictional teaching examples. Each activity includes the information I need. There is no longer essay to find.</p><p>I can use the prepared examples on paper or keep notes here. I do not need an AI account. If I choose to try a live tool later, I use an approved service. <a href="handouts/participant-workbook.pdf">Download the workbook</a>.</p><noscript><p>All activities appear below. Use the workbook to keep notes without JavaScript.</p></noscript><nav class="jump-links activity-nav" aria-label="Session activities" data-step-nav="" data-step-label="Activity">'+''.join(f'<a href="#{id}" data-step-link="">{i}. {H.escape(name)}</a>' for i,(id,name,*_) in enumerate(sections,1))+'</nav>'
 for i,(id,name,ref,question,content) in enumerate(sections,1):
  body+=f'<section id="{id}" data-step=""><h2 tabindex="-1">{i}. {H.escape(name)}</h2><p class="activity-meta">{ref}</p>{content}<div class="draft-field"><label for="draft-{id}">{H.escape(question)}</label><textarea id="draft-{id}" data-draft="{id}" rows="5" maxlength="15000"></textarea></div></section>'
 body+='<div class="step-pager" data-step-pager="" hidden><button class="button secondary" data-step-prev="" type="button">Previous</button><p data-step-status="" role="status"></p><button class="button" data-step-next="" type="button">Next</button></div><section class="draft-actions"><h2>My notes to keep</h2><p>I can export a copy before closing the browser.</p><button class="button" id="export-drafts" type="button">Export all my notes</button> <button class="button secondary" id="print-drafts" type="button">Print activities and notes</button><p id="draft-status" role="status" aria-live="polite"></p><p class="copy-status" role="status" aria-live="polite"></p></section><script src="practice.js" defer></script><script src="workshop-flow.js" defer></script>'
 (W/'conversation.html').write_text(shell('Session companion',body))
 for presenter in [False,True]:
  body='<p class="eyebrow">Presentation transcript</p><h1>Slide text'+(' and speaker notes' if presenter else '')+'</h1><p>24 core slides and four backups for the 90-minute session.</p>'
  for i,s in enumerate(ss,1):
   body+=f'<details class="workshop-details"><summary>{i:02}. {H.escape(title(s))}</summary>{visible(s)}'
   if presenter:body+='<h3>Speaker notes</h3>'+html.tostring(notes(s),encoding='unicode')
   body+='</details>'
  (W/('p/slide-transcript.html' if presenter else 'slide-transcript.html')).write_text(shell('Presentation transcript',body,presenter))
 sources={}
 for s in ss:
  for a in notes(s).xpath('.//a'):
   href=a.get('href','')
   if '/images/' not in href and href!=URL:sources[href]=a.text_content().strip() or href
 body='<p class="eyebrow">Workshop materials</p><h1>Resources for discussion and practice</h1><p>I can use the worked examples in the <a href="conversation.html#prompt">session companion</a>, extend the applicant-policy conversation, or develop my 30 / 60 / 90-day plan.</p>'+cards([('Editable takeaways','handouts/session-takeaways.docx','NSPA template with the updated session reference','DOCX'),('Slide text','slide-transcript.html','Readable slide content','HTML')])+'<h2>Session route</h2>'+agenda()+'<details class="workshop-details"><summary>Browse all 28 slides</summary><div class="reference-gallery">'+''.join(f'<a href="images/nspa-trust-transparency-ai/{i:02}.png"><img loading="lazy" src="images/nspa-trust-transparency-ai/{i:02}.png" alt="{H.escape(title(s))}"><strong>{i:02}. {H.escape(title(s))}</strong></a>' for i,s in enumerate(ss,1))+'</div></details><section id="sources"><h2>Sources and interpretation</h2><p>The presentation preserves dates and sample limitations. Historical detector examples do not establish current performance. The hypothetical 1% calculation is illustrative. A small test cannot certify fairness. Teaching examples and policy choices are not official NSPA policy.</p><ul>'+''.join(f'<li><a href="{H.escape(u)}">{H.escape(label)}</a></li>' for u,label in sources.items())+'</ul></section><details class="workshop-details"><summary>Additional practice and reference collections</summary><p>These longer labs use the separate fictional C-101 case and its 0–2 rubric. The current presentation uses A-101–A-103 and a 1–4 community-impact criterion. Keep the exercises separate.</p><p><a href="practice.html">Additional C-101 labs</a> · <a href="capacity-matrix.html">Readiness checklist</a> · <a href="../resources/infographics.html">Infographic collection</a> · <a href="../resources/library.html">Complete resource library</a></p>'+cards([('Prompt reference','handouts/prompt-review.pdf','Additional C-101 practice','PDF'),('Protected workflow','handouts/protected-workflow.pdf','Data approval and human checks','PDF'),('Fair applicant response','handouts/fair-ai-policy.pdf','Policy and follow-up reference','PDF'),('Readiness checklist','handouts/capacity-matrix.pdf','Blank ratings and notes','PDF')])+'</details>'
 (W/'resources.html').write_text(shell('Workshop resources',body+learning_intentions()))
 body='<p class="eyebrow">Presenter materials</p><h1>Your 90-minute session</h1><p>October 21 · 3:30–5:00 PM CT. Present the 24 core slides, with B1–B4 available for questions. The route includes all eight complete activities within the 90-minute session.</p>'+cards([('Open the webdeck','webdeck.html','S: notes · V: presenter · F: fullscreen · P: print','WEB'),('Speaker guide','facilitator-guide.pdf','Notes for all 28 supplied slides','PDF'),('Presenter route','presenter-route.pdf','One-page route and flexible discussion options','PDF'),('PowerPoint','slides/nspa-trust-transparency-ai.pptx','Supplied presentation with editable speaker notes','PPTX'),('Full transcript','slide-transcript.html','Slide text and speaker notes','HTML')])+agenda()+'<p><a href="../conversation.html">Open the participant companion</a></p>'
 (W/'p/index.html').write_text(shell('Presenter materials',body,True))

def build_pdfs(ss):
 pdfmetrics.registerFont(TTFont('NSBody','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
 pdfmetrics.registerFont(TTFont('NSBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
 pdfmetrics.registerFontFamily('NSBody',normal='NSBody',bold='NSBold')
 ink=colors.HexColor('#2e4f66');teal=colors.HexColor('#007681')
 styles={k:ParagraphStyle(k,fontName='NSBold' if k in ['h1','h2'] else 'NSBody',fontSize=sz,leading=lead,textColor=teal if k=='h2' else ink,spaceAfter=9,spaceBefore=7 if k=='h2' else 0) for k,sz,lead in [('h1',22,27),('h2',13,18),('body',10.5,15),('small',9,13)]}
 def p(t,kind='body'):return Paragraph(escape(t),styles[kind])
 def frame(c,d):
  c.setFont('NSBold',9);c.setFillColor(teal);c.drawString(42,760,'NSPA 2026 · TRUST, TRANSPARENCY, AND AI')
  c.setFont('NSBody',8);c.drawString(42,27,'October 21 · 3:30–5:00 PM CT · Miguel Guhlin');c.drawRightString(570,27,str(d.page));c.linkURL(URL,(42,20,350,39))
 def write(path,story):SimpleDocTemplate(str(path),pagesize=letter,leftMargin=42,rightMargin=42,topMargin=53,bottomMargin=48,title=path.stem.replace('-',' '),author='Miguel Guhlin').build(story,onFirstPage=frame,onLaterPages=frame)
 def lines(label,n=3):return [p(label,'h2'),Table([['']]*n,colWidths=[528],rowHeights=24,style=TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#afc5ca'))]))]
 def page(title_text,sub):return [p(title_text,'h1'),p(sub)]
 story=workbook_story(ROOT,styles,p,lines)
 write(W/'handouts/participant-workbook.pdf',story)
 story=page('Your 90-minute presenter route','October 21, 2026 · 3:30–5:00 PM CT')
 for focus,nums,duration,use in AGENDA:story += [p(f'{focus} · {duration}','h2'),p(f'Slides {nums}. {use}.')]
 story += [p('Flexible discussion options','h2'),p('Extend a prepared demo with a partner evidence check. Compare policy boundaries from the applicant’s perspective. Give teams time to draft their provider-use statement or implementation plan. Use the companion and complete workbook. B1–B4 are backups outside the core route.'),p('Open p/webdeck.html. S: notes. V: presenter view. F: fullscreen. P: print. Keep decisions with people; use only fictional practice data.','small')]
 write(W/'p/presenter-route.pdf',story)
 story=page('Your speaker guide','90-minute session · Supplied notes for 24 core slides and four backups. The route includes all eight complete activities within the 90-minute session.')
 story += [p('Preparation','h2'),p('Open the webdeck and companion. Keep the workbook and two-page takeaways ready. Prepared teaching examples replace live model calls. Keep the one-page route beside the deck. All displayed practice data and responses are fictional.')]
 for i,s in enumerate(ss,1):
  story += [PageBreak(),p(f'{i:02}. '+title(s),'h1')]
  for para in notes(s).xpath('./p'):story.append(p(para.text_content()))
 write(W/'p/facilitator-guide.pdf',story)
 # Matching first-person source stays out of the public website.
 (ROOT/'docs/presentation-script.md').write_text('# NSPA26 presentation script\n\n90-minute session · October 21 · 3:30–5:00 PM CT. The timed route integrates the slides, eight activities, and transitions.\n\n'+'\n\n'.join(f'## {i:02}. {title(s)}\n\n'+ '\n\n'.join(x.text_content().strip() for x in notes(s).xpath('./p')) for i,s in enumerate(ss,1))+'\n')

def build():
 prepare_deck();ss=slides();assert len(ss)==28
 sections=companion_sections(ss);build_pages(ss,sections);build_pdfs(ss)
 (ROOT/'docs/workshop-slide-map.json').write_text(json.dumps([{'number':i,'title':title(s),'core':i<=24} for i,s in enumerate(ss,1)],indent=2)+'\n')
 print('Built supplied-deck edition: 28 slides, 90-minute session, matching companion and PDFs.')
if __name__=='__main__':build()
