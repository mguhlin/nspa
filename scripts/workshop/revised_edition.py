"""Build the October 20 workshop from the supplied 28-slide presentation.

Use the bundled Python. Export the presentation PDF and numbered PNGs first,
then run this builder. prepare_presenter.mjs adds the shared script to notes
without changing any slide, image, table, relationship, or theme part.
"""
from pathlib import Path
from zipfile import ZipFile
from html import escape as E
from io import BytesIO
import base64
import json
import posixpath
import re
from lxml import etree, html
from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from revised_content import TITLES, CUES, SAY, POLICY_SAMPLES, PROMPT, NOTE_SOURCES, activities
from supplied_edition import shell, cards

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
W = ROOT/'2026'
PPTX = W/'p/slides/nspa-trust-transparency-ai.pptx'
SCHEDULE = 'October 21, 2026 · 3:30–5:00 PM CT'
TITLE = 'Trust, Transparency, and AI'
NS = {'p':'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a':'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
RESOURCE_SLIDES = {1, 7, 28}
SOURCES = [('NIST Generative AI Profile', 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence'),
           ('Turnitin AI Writing Report guidance', 'https://guides.turnitin.com/hc/en-us/articles/22774058814093-Using-the-AI-Writing-Report')]
SUCCESS_TEXT = ('My success criteria. Trust, Transparency, and AI. '
    'What am I learning today? I am learning to choose a limited AI task, check evidence, and write clear applicant and reviewer rules. '
    'Why am I learning this? Clear rules and human checks protect applicant trust and support fair, explainable decisions. '
    'How will I know I learned it? I can: '
    'Sort tasks into ASSIST, CHECK, or HUMAN, and name a safeguard. '
    'Check approved use and use only the data the task needs. '
    'Repair a prompt with a task, source, evidence requirement, and limit. '
    'Audit claims, apply the shared rubric, and keep a source-linked handoff. '
    'Compare equivalent excerpts using the same scoring anchors. '
    'Apply clear applicant rules and review detector flags with evidence. '
    'Draft applicant, reviewer, and concern-response policy sentences. '
    'Plan a four-week pilot with a task, human check, owner, and date.')

def resolve(base, target):
    return target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(base),target))

def source_slides(path=PPTX):
    result=[]
    with ZipFile(path) as z:
        pres=etree.fromstring(z.read('ppt/presentation.xml'))
        size=pres.find('p:sldSz',NS)
        rels={r.get('Id'):r.get('Target') for r in etree.fromstring(z.read('ppt/_rels/presentation.xml.rels'))}
        for i,s in enumerate(pres.findall('p:sldIdLst/p:sldId',NS),1):
            part=resolve('ppt/presentation.xml',rels[s.get('{'+NS['r']+'}id')])
            slide=etree.fromstring(z.read(part))
            relpath=posixpath.dirname(part)+'/_rels/'+posixpath.basename(part)+'.rels'
            sr=etree.fromstring(z.read(relpath))
            urls={r.get('Id'):r.get('Target') for r in sr if r.get('Type','').endswith('/hyperlink') and r.get('TargetMode')=='External'}
            paragraphs=[''.join(p.xpath('.//a:t/text()',namespaces=NS)) for p in slide.xpath('//a:p',namespaces=NS)]
            paragraphs=[p for p in paragraphs if p.strip() and not p.strip().isdigit()]
            contents=[]
            for shape in slide.find('p:cSld/p:spTree',NS):
                tbl=shape.find('.//a:tbl',NS)
                if tbl is not None:
                    rows=[[' '.join(c.xpath('.//a:t/text()',namespaces=NS)) for c in row.findall('a:tc',NS)] for row in tbl.findall('a:tr',NS)]
                    contents.append('<div class="table-scroll"><table>'+''.join('<tr>'+''.join('<'+('th scope="col"' if j==0 else 'td')+'>'+E(c)+'</'+('th' if j==0 else 'td')+'>' for c in row)+'</tr>' for j,row in enumerate(rows))+'</table></div>')
                else:
                    for p in shape.findall('.//a:p',NS):
                        text=''.join(p.xpath('.//a:t/text()',namespaces=NS))
                        if text.strip() and not text.strip().isdigit(): contents.append('<p>'+E(text)+'</p>')
            hotspots=[]
            for shape in slide.xpath('//p:sp[.//a:hlinkClick] | //p:pic[.//a:hlinkClick]',namespaces=NS):
                link=shape.find('.//a:hlinkClick',NS);url=urls.get(link.get('{'+NS['r']+'}id'))
                offset=shape.find('.//a:xfrm/a:off',NS);extent=shape.find('.//a:xfrm/a:ext',NS)
                if not url or offset is None or extent is None: continue
                style=f'left:{int(offset.get("x"))/int(size.get("cx"))*100:.4f}%;top:{int(offset.get("y"))/int(size.get("cy"))*100:.4f}%;width:{int(extent.get("cx"))/int(size.get("cx"))*100:.4f}%;height:{int(extent.get("cy"))/int(size.get("cy"))*100:.4f}%'
                hotspots.append(f'<a class="source-link no-advance" href="{E(url)}" aria-label="{E(url)}" style="{style}" target="_blank" rel="noopener"></a>')
            content=''.join(contents)
            if i in RESOURCE_SLIDES:
                content='<p>Scan the resource QR code or open the <a href="../">workshop hub</a> for the workbook, presentation, takeaways, and session companion. <a href="https://mguhlin.org">Miguel Guhlin’s website</a>.</p>'
            result.append({'number':i,'title':TITLES[i-1],'cue':CUES[i-1],'say':SAY[i-1],'content':content,'links':''.join(hotspots)})
    assert len(result)==28
    return result

def success_criteria():
    with PILImage.open(W/'images/success-criteria.webp') as im: width,height=im.size
    return f'<section id="success-criteria" aria-labelledby="success-criteria-title"><h2 id="success-criteria-title">My success criteria</h2><figure class="learning-infographic"><a href="images/success-criteria.png"><img src="images/success-criteria.webp" width="{width}" height="{height}" loading="lazy" alt="{E(SUCCESS_TEXT)}"></a><figcaption>AI-generated infographic · <a href="images/success-criteria.png" download>Download PNG</a></figcaption></figure></section>'

def build_pages(slides):
    intro=f'<p class="eyebrow">NSPA26 · {SCHEDULE}</p><h1>{TITLE}</h1><p class="lead">Responsible scholarship review</p><p><a class="button" href="conversation.html">Open the session companion</a></p>'
    downloads=[('Participant workbook','handouts/participant-workbook.pdf','11 pages with nine activities, the shared rubric, and space for my notes','PDF'),
               ('Presentation PDF','slides/nspa-trust-transparency-ai.pdf','28 slides for viewing and sharing','PDF'),
               ('Session takeaways','handouts/session-takeaways.pdf','Two-page reference for evidence checks, clear rules, and a four-week pilot','PDF'),
               ('Responsible scholarship review infographics','handouts/nspa-responsible-scholarship-review-infographics.pptx','7 infographics for scholarship review teams','PPTX')]
    qr='<section class="return-handouts" aria-labelledby="return-title"><div><h2 id="return-title">Return to these handouts</h2><p>Scan for the workshop resource post, or save this direct handout address for later.</p><p><a href="https://mguhlin.github.io/nspa/2026/">mguhlin.github.io/nspa/2026/</a></p><p><a href="images/nspa26-qr-code.png" download>Save the QR code</a></p></div><a href="https://mguhlin.org/blog/nspa-2026-conference-session-materials-and-infographics/"><img src="images/nspa26-qr-code.png" width="256" height="256" alt="QR code for the NSPA workshop resource post on mguhlin.org, with links to handouts. Use the adjacent direct workshop link to open the handouts."></a></section>'
    (W/'index.html').write_text(shell(TITLE,intro+'<section id="downloads"><h2>Keep the participant materials</h2>'+cards(downloads)+'</section>'+qr+success_criteria()))
    sections=activities()
    body='<p class="eyebrow">My session companion</p><h1>Evidence, human checks, and clear expectations</h1><p class="lead">Nine activities follow the revised presentation. All cases, rubric anchors, and sample outputs are fictional teaching examples. Each activity includes the information I need.</p><p>No AI account is required. My notes save in this browser; I can export them below. <a href="handouts/participant-workbook.pdf">Download the matching 11-page workbook</a>.</p><noscript><p>All activities appear below. Use the workbook to keep notes without JavaScript.</p></noscript><nav class="jump-links activity-nav" aria-label="Session activities" data-step-nav data-step-label="Activity">'+''.join(f'<a href="#{id}" data-step-link>{i}. {E(name)}</a>' for i,(id,name,*_) in enumerate(sections,1))+'</nav>'
    for i,(id,name,ref,content,prompt) in enumerate(sections,1):
        if id=='policy':
            content+='<details class="workshop-details"><summary>Compare the three sample responses after drafting</summary>'+''.join('<h3>'+E(a)+'</h3><p>'+E(b)+'</p>' for a,b in POLICY_SAMPLES)+'<p>Local choices: disclosure method and timing; approved service and assigned reviewer; reconsideration contact, steps, and timeline.</p></details>'
        body+=f'<section id="{id}" data-step><h2 tabindex="-1">{i}. {E(name)}</h2><p class="activity-meta">{ref} · Workbook page {i+1}</p>{content}<div class="draft-field"><label for="draft-{id}">{E(prompt)}</label><textarea id="draft-{id}" data-draft="{id}" rows="6" maxlength="15000"></textarea></div></section>'
    body+='<div class="step-pager" data-step-pager hidden><button class="button secondary" data-step-prev type="button">Previous</button><p data-step-status role="status"></p><button class="button" data-step-next type="button">Next</button></div><section class="draft-actions"><h2>My notes to keep</h2><button class="button" id="export-drafts" type="button">Export all my notes</button> <button class="button secondary" id="print-drafts" type="button">Print activities and notes</button><p id="draft-status" role="status" aria-live="polite"></p><p class="copy-status" role="status" aria-live="polite"></p></section><script src="practice.js" defer></script><script src="workshop-flow.js" defer></script>'
    (W/'conversation.html').write_text(shell('Session companion',body))
    body='<p class="eyebrow">Presenter materials</p><h1>Your workshop presentation</h1><p>October 21 · 3:30–5:00 PM CT. The revised presentation includes 28 slides, nine activities, policy examples, and take-home references.</p>'+cards([
        ('Open the webdeck','webdeck.html','Original slide images with the updated speaking script and synchronized presenter view','WEB'),
        ('PowerPoint with speaker notes','slides/nspa-trust-transparency-ai.pptx','Revised presentation with the updated speaking script in editable notes','PPTX'),
        ('Adaptive facilitator guide','facilitator-guide.html','Slide thumbnails and speaking text that fit your phone or tablet, with adjustable text size','WEB'),
        ('Facilitator guide PDF','facilitator-guide.pdf','Two slide thumbnails per page with readable speaking text','PDF')])+'<p><a href="../conversation.html">Open the participant companion</a></p>'
    (W/'p/index.html').write_text(shell('Presenter materials',body,True))
    # Keep direct transcript addresses current for old bookmarks, without adding
    # them back to the simplified participant or presenter menus.
    for presenter in [False,True]:
        text='<p class="eyebrow">Presentation reference</p><h1>Slide text'+(' and speaking script' if presenter else '')+'</h1>'
        for s in slides:
            text+=f'<details class="workshop-details"><summary>{s["number"]:02}. {E(s["title"])}</summary>{s["content"]}'
            if presenter:text+='<h3>Speaking script</h3><p>'+E(s['say'])+'</p>'
            text+='</details>'
        (W/('p/slide-transcript.html' if presenter else 'slide-transcript.html')).write_text(shell('Presentation reference',text,presenter))

def build_webdeck(slides=None):
    slides=slides or source_slides()
    css=(HERE/'deck-framework.css').read_text()
    js=(HERE/'deck-framework.js').read_text().replace("href: '../index.html'", "href: './'")
    sections=[]
    for s in slides:
        i=s['number']; buf=BytesIO()
        with PILImage.open(W/f'images/nspa-trust-transparency-ai/{i:02}.png') as im:im.save(buf,format='WEBP',lossless=True,method=4)
        src='data:image/webp;base64,'+base64.b64encode(buf.getvalue()).decode()
        notes=f'<p><strong>{E(s["cue"])}</strong></p><p>{E(s["say"])}</p>'
        if i==26:notes+='<pre>'+E(PROMPT)+'</pre>'
        notes+=''.join(f'<p>Source: <a href="{E(u)}" target="_blank" rel="noopener">{E(t)}</a></p>' for t,u in NOTE_SOURCES.get(i,[]))
        sections.append(f'<section class="slide source-slide{" cover current" if i==1 else ""}" data-slide="{i}"><div class="slide-body"><figure class="source-figure"><img class="source-artwork" src="{src}" width="1536" height="864" alt="" decoding="sync">{s["links"]}</figure><div class="slide-readable"><h2 class="slide-title">{i:02}. {E(s["title"])}</h2>{s["content"]}</div></div><div class="slide-footer"><span>NSPA 2026 · Miguel Guhlin</span><span>{i:02} / 28</span></div><div class="notes">{notes}</div></section>')
    theme='''
    :root{--navy:#2e4f66;--navy-dk:#224355;--navy-md:#007681;--steel:#007681;--gold:#ff7233;--text:#2e4f66;--paper:#fff;--font-display:Arial,sans-serif;--font-body:Arial,sans-serif}
    .slide,.slide.cover{background:#fff;color:#2e4f66}.slide:before,.slide.cover:before,.slide.cover:after{display:none}
    .source-slide .slide-body,.source-slide.cover .slide-body{padding:0;margin:0;flex:none;position:relative;width:1280px;height:720px;background:white}
    .source-slide .slide-body:before,.source-slide .slide-body:after{display:none!important}
    .source-figure{position:absolute;inset:0;margin:0;width:1280px;height:720px;animation:none!important}
    .source-artwork{display:block;width:100%;height:100%;object-fit:contain}.source-link{display:block;position:absolute;border-radius:6px}.source-link:focus-visible{outline:4px solid #ff7233}
    .source-slide .slide-footer{display:none}.slide-readable{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:normal;animation:none!important}
    .deck.reflow .source-slide .slide-body{position:relative;width:auto;height:auto;padding:0;display:block}
    .deck.reflow .source-figure{position:relative;inset:auto;width:100%;height:auto;aspect-ratio:16/9;margin:64px 0 0}
    .deck.reflow .slide-readable{position:static;width:auto;height:auto;clip-path:none;overflow:visible;padding:24px 22px;font-size:1.1rem;line-height:1.5}
    .deck.reflow .slide-title{font-size:1.8rem;color:#007681;margin-bottom:1rem}.deck.reflow .source-artwork{width:100%;height:auto}
    .deck.reflow .table-scroll{max-width:100%;overflow-x:auto}.slide-readable th,.slide-readable td{padding:.5rem;border-bottom:1px solid #afc5ca;vertical-align:top;overflow-wrap:anywhere}.slide-readable table{width:100%;font-size:1rem}
    @media print{.source-slide .slide-body,.deck.reflow .source-slide .slide-body{padding:0!important;margin:0!important;position:relative!important;flex:none!important;width:1280px!important;height:720px!important}.source-figure,.deck.reflow .source-figure{position:absolute!important;inset:0!important;margin:0!important;width:1280px!important;height:720px!important}.slide-readable,.source-slide .slide-footer,.notes{display:none!important}}
    '''
    (W/'p/webdeck.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="generator" content="Web Deck v5 (https://mguhlin.github.io/webdecks/) — developed by Miguel Guhlin - mguhlin.org"><!-- Built with Web Deck v5 · MIT --><title>Trust, Transparency, and AI | Presenter webdeck</title><style>'+css+theme+'</style></head><body><div class="deck">'+''.join(sections)+'</div><noscript><p>Open the <a href="../slides/nspa-trust-transparency-ai.pdf">presentation PDF</a>.</p></noscript><script>'+js+'</script></body></html>')

def build_adaptive_guide(slides):
    body='<p class="eyebrow">Presenter speaking guide</p><h1>Trust, Transparency, and AI</h1><p class="lead">Slide thumbnails and what to say. Adjust the text to suit your phone or tablet.</p><div class="guide-tools" aria-label="Reading controls"><label for="guide-jump">Slide</label><select id="guide-jump">'+''.join(f'<option value="slide-{s["number"]}">{s["number"]:02}. {E(s["title"])}</option>' for s in slides)+'</select><button type="button" id="guide-smaller" aria-label="Smaller speaking text">A−</button><button type="button" id="guide-larger" aria-label="Larger speaking text">A+</button><output id="guide-size" aria-live="polite">20 px</output></div>'
    for s in slides:
        i=s['number']
        body+=f'<section class="guide-slide" id="slide-{i}"><div class="guide-image"><a href="webdeck.html#{i}" target="_blank" rel="noopener"><img src="../images/nspa-trust-transparency-ai/{i:02}.png" width="1536" height="864" loading="lazy" alt="Slide {i}: {E(s["title"])}. Open this slide in the webdeck."></a><p class="guide-cue">{E(s["cue"])}</p></div><div class="guide-speaking"><h2>{i:02}. {E(s["title"])}</h2><p>{E(s["say"])}</p></div></section>'
    body+='<script src="facilitator-guide.js" defer></script>'
    page=shell('Adaptive facilitator guide',body,True).replace('</head>','<link rel="stylesheet" href="facilitator-guide.css"></head>')
    (W/'p/facilitator-guide.html').write_text(page)

def pdf_styles():
    for name,file in [('NSBody','DejaVuSans.ttf'),('NSBold','DejaVuSans-Bold.ttf')]:
        if name not in pdfmetrics.getRegisteredFontNames():pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
    pdfmetrics.registerFontFamily('NSBody',normal='NSBody',bold='NSBold')
    return {k:ParagraphStyle(k,fontName='NSBold' if k in ('h1','h2') else 'NSBody',fontSize=size,leading=leading,textColor=colors.HexColor('#007681' if k=='h2' else '#2e4f66'),spaceAfter=8) for k,size,leading in [('h1',22,27),('h2',12,16),('body',10.5,14.5),('small',9,12),('say',14,18)]}

def build_pdfs():
    styles=pdf_styles()
    def p(text,kind='body'):return Paragraph(E(text),styles[kind])
    def frame(c,d):
        c.setFillColor(colors.HexColor('#007681'));c.setFont('NSBold',9);c.drawString(42,761,'NSPA 2026 · TRUST, TRANSPARENCY, AND AI')
        c.setFont('NSBody',8);c.drawString(42,27,'Miguel Guhlin · October 21, 2026 · mguhlin.github.io/nspa/2026/');c.drawRightString(570,27,str(d.page))
    def write(path,story):
        SimpleDocTemplate(str(path),pagesize=letter,leftMargin=42,rightMargin=42,topMargin=53,bottomMargin=48,title=path.stem.replace('-',' '),author='Miguel Guhlin').build(story,onFirstPage=frame,onLaterPages=frame)
    def from_html(content):
        result=[]
        for el in html.fromstring('<div>'+content+'</div>'):
            if el.tag=='div' and el.get('class')=='table-scroll':
                rows=[[p(c.text_content(),'small') for c in row] for row in el.xpath('.//tr')]
                n=len(rows[0]);first=rows[0][0].text
                widths=([55,473] if first in ['Points','Choice'] else [150,378]) if n==2 else ([45,300,183] if first=='Case' else [230,90,208])
                t=Table(rows,colWidths=widths,repeatRows=1,hAlign='LEFT')
                t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e4f4f4')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#afc5ca'))]))
                result+=[t,Spacer(1,8)]
            else:result.append(p(el.text_content()))
        return result
    story=[p('My participant workbook','h1'),p(TITLE,'h2'),p('Responsible scholarship review'),p(SCHEDULE),p('Nine activities for the revised presentation')]
    art=W/'images/conversation/workbook-cover.png'
    if not art.exists(): art=W/'images/conversation/evidence.png'
    if art.exists():story+=[Spacer(1,10),Image(str(art),width=430,height=270,kind='proportional'),Spacer(1,12)]
    story+=[p('All cases, rubric anchors, and sample outputs are fictional teaching examples. Each activity includes the information I need. No real applicant records or live AI account are required.'),p('Pages 2–10 follow the nine activities. Page 11 is a reusable review prompt. I can use this workbook or the session companion to keep my notes.','small')]
    for i,(_,name,ref,content,prompt) in enumerate(activities(),1):
        story+=[PageBreak(),p(f'{i}. {name}','h1'),p(ref,'small')]+from_html(content)+[p(prompt,'h2')]
        n=4 if i in (3,4,5) else 6
        story.append(Table([['']]*n,colWidths=[528],rowHeights=23,style=TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#afc5ca'))])))
        if i==8:story.append(p('Local choices to resolve: disclosure method and timing; approved service and assigned reviewer; reconsideration contact and response timeline.','small'))
    story+=[PageBreak(),p('Take-home review prompt','h1'),p('Slide 26','small'),p('Use fictional information for practice. Before real use, confirm the authorized service, task, and information. Removing a name alone does not establish authorization.')]+[p(t) for t in PROMPT.split('\n\n')]
    story+=[p('My adaptation and the person who will verify each finding','h2'),Table([['']]*5,colWidths=[528],rowHeights=25,style=TableStyle([('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#afc5ca'))]))]
    write(W/'handouts/participant-workbook.pdf',story)

def build_guide_pdf(slides):
    styles=pdf_styles()
    say_style=styles['say'];heading=ParagraphStyle('guide-heading',parent=styles['h2'],fontSize=13,leading=16,spaceAfter=8)
    cue=ParagraphStyle('guide-cue',parent=styles['small'],fontSize=10,leading=13)
    story=[]
    for k in range(0,len(slides),2):
        if k:story.append(PageBreak())
        for s in slides[k:k+2]:
            i=s['number']
            left=[Image(str(W/f'images/nspa-trust-transparency-ai/{i:02}.png'),width=171,height=96.1875),Spacer(1,9),Paragraph(E(s['cue']),cue)]
            right=[Paragraph(f'{i:02}. '+E(s['title']),heading),Paragraph(E(s['say']),say_style)]
            row=Table([[left,right]],colWidths=[193,527],hAlign='LEFT')
            row.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),12)]))
            w,h=row.wrap(720,1000)
            if h>254:raise ValueError(f'Slide {i} speaking block is too tall: {h}')
            story+=[row,Spacer(1,254-h)]
    def frame(c,d):
        c.setFont('NSBold',9);c.setFillColor(colors.HexColor('#007681'));c.drawString(36,589,'NSPA 2026 · FACILITATOR SPEAKING GUIDE')
        c.setFont('NSBody',8);c.drawString(36,17,'Miguel Guhlin · October 21, 2026 · Adaptive version: mguhlin.github.io/nspa/2026/p/facilitator-guide.html');c.drawRightString(756,17,str(d.page))
    SimpleDocTemplate(str(W/'p/facilitator-guide.pdf'),pagesize=landscape(letter),leftMargin=36,rightMargin=36,topMargin=44,bottomMargin=38,title='NSPA facilitator speaking guide',author='Miguel Guhlin').build(story,onFirstPage=frame,onLaterPages=frame)

def build():
    slides=source_slides()
    build_pages(slides);build_webdeck(slides);build_adaptive_guide(slides);build_pdfs();build_guide_pdf(slides)
    (ROOT/'docs/presentation-script.md').write_text('# Trust, Transparency, and AI\n\nOctober 20 revised edition. First-person speaking text shared by the PowerPoint, webdeck, and facilitator guides. Slide numbers are positions in the supplied 28-slide file.\n\n'+'\n\n'.join(f'## Slide {s["number"]:02} {s["title"]}\n\n{s["cue"]}\n\n{s["say"]}' for s in slides)+'\n')
    (ROOT/'docs/workshop-slide-map.json').write_text(json.dumps([{'number':s['number'],'title':s['title'],'cue':s['cue'],'core':2<=s['number']<=25 and s['number']!=7} for s in slides],indent=2)+'\n')
    print('Built October 20 edition: 28 illustrated slides, nine activities, 11-page workbook, adaptive guide, two-slide-per-page guide PDF.')

if __name__=='__main__':build()
