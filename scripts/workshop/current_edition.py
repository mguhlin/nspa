"""October 18 supplied-deck edition. Preserve slides; derive companion materials.

Run this after the legacy site/reference builders and before offline.py.
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
NEW_NOTE = 'The session is 90 minutes, 3:30–5:00 PM CT. Use the core presentation with additional discussion and resource practice. The companion, workbook and takeaways match this presentation.'
AGENDA = [
 ('The balancing act', '1–4', '8 minutes', 'Trust, provider and applicant perspectives'),
 ('Prompting fundamentals', '5–8', '10 minutes', 'Six prompt parts, rubric and human checkpoints'),
 ('AI in the review workflow', '9–14', '17 minutes', 'Three prepared demos and evaluation'),
 ('The applicant side', '15–19', '12 minutes', 'Policy boundaries, detection and fair follow-up'),
 ('Policy and frameworks', '20–24', '13 minutes', 'Transparency, checklist and 30 / 60 / 90-day plan'),
 ('Discussion and resource practice', 'Use throughout', '30 minutes', 'Extend a demo, compare policy choices or develop the plan'),
]
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
 return '<div class="table-scroll"><table><thead><tr><th>Focus</th><th>Slides</th><th>Suggested time</th><th>Use</th></tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+H.escape(x)+'</td>' for x in row)+'</tr>' for row in AGENDA)+'</tbody></table></div><p>The core slide cues total about 60 minutes. Use the other 30 minutes flexibly for discussion and resource practice within the 90-minute session. B1–B4 are backups.</p>'
def prepare_deck():
 source = ROOT/'supplemental-resources/NSPA26-Scholarship-Review-Webdeck.html'
 text = (source if source.exists() else W/'p/webdeck.html').read_text()
 text = text.replace('60-minute workshop','90-minute workshop').replace(OLD_NOTE,NEW_NOTE)
 text = text.replace('Our 60-minute route is:', 'The core presentation uses about 60 minutes within our 90-minute session. Allow another 30 minutes for discussion and resource practice. The core route is:')
 text = text.replace('https://studentprivacy.ed.gov/privacy-and-data-sharing.', 'https://studentprivacy.ed.gov/privacy-and-data-sharing')
 text = text.replace("href: 'https://mguhlin.github.io/nspa/2026/'", "href: './'")
 text = text.replace('height:91px;font-size:27px;', 'height:103px;font-size:27px;')
 text = text.replace('</head>', '<meta name="robots" content="noindex"></head>') if 'name="robots"' not in text else text
 (W/'p/webdeck.html').write_text(text)
 source = ROOT/'supplemental-resources/trust_transparency_ai_scholarship_review_nspa26.pptx'
 target = W/'p/slides/nspa-trust-transparency-ai.pptx'
 if source.exists():
  with ZipFile(source) as zin, ZipFile(target,'w',ZIP_DEFLATED) as zout:
   for item in zin.infolist():
    data=zin.read(item.filename)
    if item.filename in ['ppt/slides/slide1.xml','ppt/notesSlides/notesSlide1.xml','ppt/notesSlides/notesSlide24.xml']:
     data=data.replace(b'60-minute workshop',b'90-minute workshop').replace(OLD_NOTE.encode(),NEW_NOTE.encode()).replace(b'Our 60-minute route is:',b'The core presentation uses about 60 minutes within our 90-minute session. Allow another 30 minutes for discussion and resource practice. The core route is:')
    zout.writestr(item,data)

def companion_sections(ss):
 # Read the three prompt paragraphs by their source font size, preserving wording.
 prompt_text=ss[24].xpath('./div[@class="slide-body"]/p[contains(@style,"font-size:21px")]')
 prompt_pairs=list(zip(['Administrative triage','Rubric pre-score','Organizing the pile'],[x.text_content() for x in prompt_text]))
 triage='<p><strong>Fictional practice rules:</strong> essay, reference and transcript required; GPA at least 3.0; Texas residency. A missing item requires human follow-up.</p><ul><li><strong>A-101 · P1:</strong> Essay, reference and transcript supplied. GPA 3.4. States Texas residency.</li><li><strong>A-102 · P1:</strong> Essay and transcript supplied. GPA 3.1. States Texas residency. Reference absent.</li><li><strong>A-103 · P1:</strong> Essay and reference supplied. GPA 3.5. No residency statement. Transcript absent.</li></ul>'+visible(ss[9])+'<p>Check every draft flag. Report eligibility evidence separately as met, not met or unknown. A person verifies any possible threshold failure.</p>'
 score=visible(ss[6])+visible(ss[10])+'<p><strong>Source P1:</strong> The quoted essay paragraph on this page is the complete fictional excerpt used for this exercise. Read it before considering the prepared 3-of-4 rating. The text says a change was tried; it does not establish improved outcomes.</p>'
 organize=visible(ss[11])+'<p><strong>Source labels:</strong> Each displayed excerpt is P1 for its fictional ID. These short examples are separate from the triage records and essay exercise. They are not a combined applicant file. Define any eligibility term separately and check the original application.</p>'
 prompt_html='<h3>Full practice prompts from backup B1</h3>'+''.join(f'<h4>{name}</h4><pre id="demo-prompt-{i}">{H.escape(p)}</pre><button class="button secondary" type="button" data-copy="demo-prompt-{i}">Copy prompt</button>' for i,(name,p) in enumerate(prompt_pairs,1))
 return [
 ('pulse','Trust and expectations','Slides 1–4','What should applicants and reviewers be able to explain?',visible(ss[2])+visible(ss[3])),
 ('prompt','A review request you can check','Slides 5–8 and B1','Write a role, task, context, criteria, format and constraints. Which check stays with a person?',visible(ss[5])+prompt_html),
 ('triage','Demo 1: administrative triage','Slide 10','Which requirement and source support each flag? What follow-up would a person make?',triage),
 ('evidence','Demo 2: evidence and a draft score','Slides 7 and 11','Write your independent 1–4 rating, a supporting quote and what remains unknown. Compare reasons with a partner.',score),
 ('organize','Demo 3: neutral summaries and tags','Slide 12','Which tag is supported by an exact quote? What would the summary omit or imply?',organize),
 ('workflow','Human checks and a pilot test','Slides 9, 13–14 and B2','Name who approves input, verifies evidence, decides and audits. Record a pause condition.',visible(ss[12])+visible(ss[13])+'<h3>Vendor review questions</h3>'+visible(ss[25])),
 ('fair','Applicant AI use and a fair response','Slides 15–21 and B3','For the “too perfect” essay, identify the published rule and available evidence. Draft a neutral, accessible follow-up only if justified.',visible(ss[18])+visible(ss[19])+visible(ss[20])+visible(ss[26])+'<p>A detector result or polished style alone does not establish a violation. Apply published expectations consistently and provide a human correction route.</p>'),
 ('change','Your 30 / 60 / 90-day plan','Slides 22–24','Choose three gaps, one clerical pilot, an owner and a review date. What evidence would lead you to pause?',visible(ss[21])+visible(ss[22])),
 ]

def build_pages(ss, sections):
 intro=f'<p class="eyebrow">NSPA26 · October 21 · 3:30–5:00 PM CT · 90 minutes</p><h1>{TITLE}</h1><p class="lead">AI can sort, summarize, and suggest. People decide.</p><p>Explore both sides of scholarship review: AI supporting your team and AI supporting applicants. Work through three prepared demonstrations, compare policy choices, and plan a small pilot with human checks.</p><p>24 core slides and four backup references. All practice records and displayed responses are fictional teaching examples. No AI account is required.</p><p><a class="button" href="conversation.html">Open the session companion</a></p>'
 downloads=[('Participant workbook','handouts/participant-workbook.pdf','Six pages for demos, policy discussion and your implementation plan','PDF'),('Presentation PDF','slides/nspa-trust-transparency-ai.pdf','28 slides for viewing and sharing','PDF'),('Session takeaways','offline/session-takeaways.pdf','Two-page reference aligned to this presentation','PDF'),('Participant session kit','offline/nspa-2026-offline.zip','Companion, workbook, slides and takeaways for offline use','ZIP')]
 (W/'index.html').write_text(shell(TITLE,intro+'<section id="downloads"><h2>Keep the participant materials</h2>'+cards(downloads)+'</section><details class="workshop-details"><summary>Session route and discussion time</summary>'+agenda()+'</details><p><a href="resources.html">Prompts, editable takeaways, slide images and supporting resources</a></p><p id="sources"><a href="resources.html#sources">Sources and interpretation</a></p>'))
 body='<p class="eyebrow">Your session companion</p><h1>Evidence, human checks, and clear expectations</h1><p class="lead">Follow the presentation or use these resources for a longer discussion. Your notes stay in this browser. Use fictional information only.</p><p>Use the prepared examples on paper or locally. A live AI tool is optional and must be approved. <a href="handouts/participant-workbook.pdf">Download the workbook</a>.</p><noscript><p>All activities appear below. Use the workbook to keep notes without JavaScript.</p></noscript><nav class="jump-links activity-nav" aria-label="Session activities" data-step-nav="" data-step-label="Activity">'+''.join(f'<a href="#{id}" data-step-link="">{i}. {H.escape(name)}</a>' for i,(id,name,*_) in enumerate(sections,1))+'</nav>'
 for i,(id,name,ref,question,content) in enumerate(sections,1):
  body+=f'<section id="{id}" data-step=""><h2 tabindex="-1">{i}. {H.escape(name)}</h2><p class="activity-meta">{ref}</p>{content}<div class="draft-field"><label for="draft-{id}">{H.escape(question)}</label><textarea id="draft-{id}" data-draft="{id}" rows="5" maxlength="15000"></textarea></div></section>'
 body+='<div class="step-pager" data-step-pager="" hidden><button class="button secondary" data-step-prev="" type="button">Previous</button><p data-step-status="" role="status"></p><button class="button" data-step-next="" type="button">Next</button></div><section class="draft-actions"><h2>Keep your notes</h2><p>Export a copy before closing the browser.</p><button class="button" id="export-drafts" type="button">Export all my notes</button> <button class="button secondary" id="print-drafts" type="button">Print activities and notes</button><p id="draft-status" role="status" aria-live="polite"></p><p class="copy-status" role="status" aria-live="polite"></p></section><script src="practice.js" defer></script><script src="workshop-flow.js" defer></script>'
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
 body='<p class="eyebrow">Workshop materials</p><h1>Resources for discussion and practice</h1><p>Use the three demo prompts in the <a href="conversation.html#prompt">session companion</a>, extend the applicant-policy conversation, or develop the 30 / 60 / 90-day plan.</p>'+cards([('Editable takeaways','offline/session-takeaways.docx','NSPA template with the updated session reference','DOCX'),('Slide images','slides/nspa-trust-transparency-ai-pngs.zip','28 numbered slide PNGs','ZIP'),('Slide text','slide-transcript.html','Readable slide content','HTML')])+'<h2>Session route</h2>'+agenda()+'<details class="workshop-details"><summary>Browse all 28 slides</summary><div class="reference-gallery">'+''.join(f'<a href="images/nspa-trust-transparency-ai/{i:02}.png"><img loading="lazy" src="images/nspa-trust-transparency-ai/{i:02}.png" alt="{H.escape(title(s))}"><strong>{i:02}. {H.escape(title(s))}</strong></a>' for i,s in enumerate(ss,1))+'</div></details><section id="sources"><h2>Sources and interpretation</h2><p>The presentation preserves dates and sample limitations. Historical detector examples do not establish current performance. The hypothetical 1% calculation is illustrative. A small test cannot certify fairness. Teaching examples and policy choices are not official NSPA policy.</p><ul>'+''.join(f'<li><a href="{H.escape(u)}">{H.escape(label)}</a></li>' for u,label in sources.items())+'</ul></section><details class="workshop-details"><summary>Additional practice and reference collections</summary><p>These longer labs use the separate fictional C-101 case and its 0–2 rubric. The current presentation uses A-101–A-103 and a 1–4 community-impact criterion. Keep the exercises separate.</p><p><a href="practice.html">Additional C-101 labs</a> · <a href="capacity-matrix.html">Readiness checklist</a> · <a href="../resources/infographics.html">Infographic collection</a> · <a href="../resources/library.html">Complete resource library</a></p>'+cards([('Prompt reference','handouts/prompt-review.pdf','Additional C-101 practice','PDF'),('Protected workflow','handouts/protected-workflow.pdf','Data approval and human checks','PDF'),('Fair applicant response','handouts/fair-ai-policy.pdf','Policy and follow-up reference','PDF'),('Readiness checklist','handouts/capacity-matrix.pdf','Blank ratings and notes','PDF')])+'</details>'
 (W/'resources.html').write_text(shell('Workshop resources',body))
 body='<p class="eyebrow">Presenter materials</p><h1>Your 90-minute session</h1><p>October 21 · 3:30–5:00 PM CT. Present the 24 core slides, with B1–B4 available for questions. Use 30 minutes flexibly for discussion and resources alongside the core slide cues.</p>'+cards([('Open the webdeck','webdeck.html','S: notes · V: presenter · F: fullscreen · P: print','WEB'),('Speaker guide','facilitator-guide.pdf','Notes for all 28 supplied slides','PDF'),('Presenter route','presenter-route.pdf','One-page route and flexible discussion options','PDF'),('PowerPoint','slides/nspa-trust-transparency-ai.pptx','Supplied presentation with editable speaker notes','PPTX'),('Full transcript','slide-transcript.html','Slide text and speaker notes','HTML'),('Complete presenter kit','nspa-2026-presenter-offline.zip','Extract and open p/index.html','ZIP')])+agenda()+'<p><a href="../conversation.html">Open the participant companion</a></p>'
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
 story=page('Your scholarship review workbook','90-minute session · 24 core slides and four backups. All practice records and displayed responses are fictional authored teaching examples, not captured model outputs.')
 story += [p('AI can sort, summarize, and suggest. People decide.','h2'),p('Use this workbook alongside the presentation and session companion. Keep applicant information out of your notes. Share only what you choose.'),p('1. Trust and a clear review request','h2'),p('Slides 1–8. What should applicants and reviewers be able to explain? Write a prompt with role, task, context, verbatim criteria, output format and constraints.')]+lines('The quality of trust our process should protect',2)+lines('My task, criteria, evidence requirements and boundaries',5)
 story += [PageBreak()]+page('2. Administrative triage','Slide 10 · Requirements: essay, reference, transcript; GPA at least 3.0; Texas residency. These are fictional practice rules.')
 for t in ['A-101 · P1: All three documents supplied. GPA 3.4. States Texas residency.','A-102 · P1: Essay and transcript supplied. Reference absent. GPA 3.1. States Texas residency.','A-103 · P1: Essay and reference supplied. Transcript absent. GPA 3.5. No residency statement.']:story.append(p(t))
 story += [p('For each record, identify the source and a possible gap. Report eligibility evidence separately as met, not met or unknown. A flag requires a human check, not automatic rejection.')]+lines('ID, requirement, source, draft status and staff question',7)+lines('Who checks the result and follows up?',3)
 story += [PageBreak()]+page('3. Evidence before a draft score','Slides 7 and 11 · Rate independently before considering the prepared draft.')
 for level,desc in [('4 · Exemplary','Sustained contribution, a clear role and evidence of results.'),('3 · Proficient','Specific contribution and role; results are partly documented.'),('2 · Developing','A contribution is described; the role or results remain unclear.'),('1 · Beginning','A general service claim with little supporting detail.')]:story.append(p(level+': '+desc))
 story += [p('Fictional essay · P1','h2'),p('For six Saturdays I helped at a neighborhood repair table. When our sign-in line got long, I suggested separate lines for tool returns and new requests. The volunteer lead tried the change the next week.'),p('The prepared draft proposes 3 of 4. A change was tried; improved results were not established. This illustrative rubric is not a validated selection instrument. A different adopted rubric may lead to another rating.','small')]+lines('My rating, exact quote and uncertainty',3)+lines('My partner’s reason and any clarification to the rubric',3)
 story += [PageBreak()]+page('4. Organizing and checking a workflow','Slides 12–14 · These short examples are separate from the triage and essay exercises.')
 for t in ['A-101 · P1: “I care for my younger brother after school.” Possible tag: caregiving.','A-102 · P1: “I plan to complete a nursing certificate.” Possible tag: healthcare goal.','A-103 · P1: “Neither parent attended college.” Possible tag: first-generation context. Confirm the program definition.']:story.append(p(t))
 story += [p('Tags describe supplied text; they do not establish eligibility. Do not infer sensitive traits or rank applicants. A person checks every consequential summary.')]+lines('A neutral summary or tag, its source, and what remains unknown',3)+lines('Who approves the input, checks the evidence, decides and audits?',3)+lines('My test and pause condition',2)+[p('Try repeat runs, a controlled fictional name change, and comparison with independent human judgment. Ten cases can reveal a problem; they cannot certify fairness.','small')]
 story += [PageBreak()]+page('5. Applicant AI use and transparency','Slides 15–21 · A finalist’s essay feels “too perfect.” A reviewer suspects AI use without other evidence.')
 story += [p('Discuss what the published rule and available evidence support. Polished style and detector output alone do not establish misconduct. Use a fair, consistent process and an accessible response route.'),p('Policy choices','h2'),p('Prohibit: define scope and accessibility exceptions. Disclose: explain how a short statement affects review. Bounded: give permitted and prohibited examples. Embrace: still require accurate claims and ways to examine substance. Publish the rule before applications open.')]+lines('Our policy boundary and examples applicants can understand',3)+lines('A neutral response supported by the rule and evidence',3)+lines('What we disclose about provider AI use and correction routes',3)
 story += [PageBreak()]+page('6. Your 30 / 60 / 90-day plan','Slides 22–24 · Start with one small clerical pilot and fictional records.')
 story += [p('Priorities to consider','h2'),p('Approved tools and data terms; minimized inputs; clear rubric descriptors; versioned prompts; evidence for draft scores; consistency tests; human decisions; a comparison audit; provider transparency; applicant policy and disclosure; no action on a detector alone; annual policy and tool review.')]+lines('Three gaps and the people who will own them',3)+lines('30 days: draft policies, choose a clerical task and owner',2)+lines('60 days: test fictional cases and compare with human review',2)+lines('90 days: train reviewers, publish policy and schedule the audit',2)+lines('Review date, evidence of progress and a pause condition',2)+[p('Full prompts, vendor questions, disclosure example and glossary are in backups B1–B4. Session resources: '+URL,'small')]
 write(W/'handouts/participant-workbook.pdf',story)
 story=page('Your 90-minute presenter route','October 21, 2026 · 3:30–5:00 PM CT')
 for focus,nums,duration,use in AGENDA:story += [p(f'{focus} · {duration}','h2'),p(f'Slides {nums}. {use}.')]
 story += [p('Flexible discussion options','h2'),p('Extend a prepared demo with a partner evidence check. Compare policy boundaries from the applicant’s perspective. Give teams time to draft their provider-use statement or implementation plan. Use the companion and six-page workbook. B1–B4 are backups outside the core route.'),p('Open p/webdeck.html. S: notes. V: presenter view. F: fullscreen. P: print. Keep decisions with people; use only fictional practice data.','small')]
 write(W/'p/presenter-route.pdf',story)
 story=page('Your speaker guide','90-minute session · Supplied notes for 24 core slides and four backups. Use 30 minutes flexibly for discussion and resources alongside the core slide cues.')
 story += [p('Preparation','h2'),p('Open the webdeck and companion. Print the six-page workbook and two-page takeaways. Prepared teaching examples replace live model calls. Keep the one-page route beside the deck. All displayed practice data and responses are fictional.')]
 for i,s in enumerate(ss,1):
  story += [PageBreak(),p(f'{i:02}. '+title(s),'h1')]
  for para in notes(s).xpath('./p'):story.append(p(para.text_content()))
 write(W/'p/facilitator-guide.pdf',story)
 # Matching first-person source stays out of the public website.
 (ROOT/'docs/presentation-script.md').write_text('# NSPA26 presentation script\n\n90-minute session · October 21 · 3:30–5:00 PM CT. Core slide cues allow about 60 minutes; add 30 minutes of flexible discussion and resource practice.\n\n'+'\n\n'.join(f'## {i:02}. {title(s)}\n\n'+ '\n\n'.join(x.text_content().strip() for x in notes(s).xpath('./p')) for i,s in enumerate(ss,1))+'\n')

def build():
 prepare_deck();ss=slides();assert len(ss)==28
 sections=companion_sections(ss);build_pages(ss,sections);build_pdfs(ss)
 (ROOT/'docs/workshop-slide-map.json').write_text(json.dumps([{'number':i,'title':title(s),'core':i<=24} for i,s in enumerate(ss,1)],indent=2)+'\n')
 print('Built supplied-deck edition: 28 slides, 90-minute session, matching companion and PDFs.')
if __name__=='__main__':build()
