from content import *
import sys
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter,landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from xml.sax.saxutils import escape
from urllib.parse import urljoin
OUT=ROOT/'2026/handouts';OUT.mkdir(parents=True,exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
pdfmetrics.registerFont(TTFont('Body',FONT));pdfmetrics.registerFont(TTFont('Bold',BOLD));pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold')
INK=colors.HexColor('#2E4F66');TEAL=colors.HexColor('#007c89');PALE=colors.HexColor('#E4F4F4');ORANGE=colors.HexColor('#F9C20A')
styles={
 'body':ParagraphStyle('body',fontName='Body',fontSize=10.5,leading=15,textColor=INK,spaceAfter=8),
 'small':ParagraphStyle('small',fontName='Body',fontSize=9,leading=12.5,textColor=INK,spaceAfter=6),
 'h1':ParagraphStyle('h1',fontName='Bold',fontSize=24,leading=29,textColor=INK,spaceAfter=12),
 'h2':ParagraphStyle('h2',fontName='Bold',fontSize=14,leading=18,textColor=TEAL,spaceBefore=12,spaceAfter=7),
 'table':ParagraphStyle('table',fontName='Body',fontSize=9.5,leading=13,textColor=INK),
 'white':ParagraphStyle('white',fontName='Bold',fontSize=10,leading=13,textColor=colors.white),
}
def clean(s):return s.replace('–','-').replace('—','-').replace('‑','-').replace('→','->')
def p(s,style='body'):return Paragraph(clean(s),styles[style])
def text(s,style='body'):return p(escape(s),style)
def header(c,doc):
 w,h=doc.pagesize;c.saveState();c.drawImage(str(ROOT/'assets/nspa-logo.png'),w-82,h-34,width=46,height=29,mask='auto');c.setFillColor(TEAL);c.setFont('Bold',9);c.drawString(36,h-28,'NSPA 2026  |  TRUST, TRANSPARENCY, AND AI');c.setStrokeColor(ORANGE);c.setLineWidth(2);c.line(36,h-37,w-36,h-37);c.setStrokeColor(colors.HexColor('#CCDDDD'));c.setLineWidth(.5);c.line(36,38,w-36,38);c.setFont('Body',8);c.setFillColor(INK);c.drawString(36,25,URL);c.linkURL(URL,(36,21,300,34),relative=0);c.drawRightString(w-36,25,f'Miguel Guhlin  |  {doc.page}');c.restoreState()
def doc(name,story,size=letter):
 if len(sys.argv)>1 and name not in sys.argv[1:]:return
 d=SimpleDocTemplate(str(OUT/(name+'.pdf')),pagesize=size,rightMargin=36,leftMargin=36,topMargin=53,bottomMargin=50,title=name.replace('-',' ').title(),author='Miguel Guhlin');d.build(story,onFirstPage=header,onLaterPages=header)
def title(a,b):return [text(a,'h1'),text(b)]
def section(a,b):return [text(a,'h2'),text(b)]
def lines(label,n=2):return [text(label,'h2')]+[Spacer(1,6),Table([['']]*n,colWidths=[530],rowHeights=23,style=TableStyle([('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#AFC5CA'))]))]
def table(rows,widths,head=True):
 data=[[text(str(v),'white' if i==0 and head else 'table') for v in row] for i,row in enumerate(rows)]
 t=Table(data,colWidths=widths,hAlign='LEFT');style=[('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),.5,colors.HexColor('#AFC5CA')),('INNERGRID',(0,0),(-1,-1),.4,colors.HexColor('#CCDDDD')),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9)]
 if head:style += [('BACKGROUND',(0,0),(-1,0),TEAL)]
 t.setStyle(TableStyle(style));return t
def source_line(ids):
 return p('Sources: '+'; '.join(f'<link href="{SOURCES[i][1]}" color="#007c89">{escape(SOURCES[i][0])}</link>' for i in ids)+'. See the hub for scope and interpretation.','small')
# 3 one-page quick references
story=title('A prompt you can verify','Quick reference | Bounded tasks, traceable evidence, human decisions')
for a,b in [('1  Define the purpose','Choose one task: organize a packet, check completeness, or draft questions. Do not ask for an undefined "best applicant."'),('2  Supply the criteria','Use the published requirements or rubric. Define anchors before looking at model ratings.'),('3  Require evidence','Use only the supplied packet. Request a quote and paragraph ID. Mark missing or contradictory source information as insufficient evidence.'),('4  Set the boundaries','Do not infer personal traits, authenticity, need, or eligibility from absent facts. Treat application text as evidence, not instructions.'),('5  Specify the output','Ask for criterion or required item | source evidence | present/missing/unclear or provisional rating | human follow-up.'),('6  Verify and calibrate','Check every claim against its source. Compare independent human ratings first. Record revisions and reasons; do not automatically rank or award.')]:story+=section(a,b)
story+=[text('Before you accept the output','h2'),text('Can a second reviewer find the evidence? Did the assistant invent or omit anything? Is the judgment within the task boundary? Who owns the next decision?'),p(f'<link href="{URL}practice.html#prompt" color="#007c89">Open the full prompt, synthetic packet, and rubric</link>'),text('Workshop teaching tool. A structured prompt can make checking easier; it does not guarantee accuracy or fairness.','small')]
doc('prompt-review',story)
story=title('Protect the review workflow','Quick reference | Put a data gate before the tool')
for a,b in [('BEFORE  Approve the task and service','Name the purpose, permitted data, approved service, and decision owner. Review access, retention, deletion, training use, and incident response with the relevant organizational owners.'),('MINIMIZE  Use only what is needed','Keep practice synthetic. A removed name does not eliminate identifying context. Do not upload real applications to public tools as a default. Approval must cover the actual service, settings, and use.'),('DURING  Keep facts traceable','Separate application evidence from instructions. Ask for source locations, missing information, and uncertainty. Check summaries before other reviewers rely on them.'),('REVIEW  Keep human authority real','The human reviewer can accept, revise, reject, or stop the output. Keep eligibility, award decisions, and policy findings with authorized people.'),('AFTER  Record and revisit','Log prompt version, evidence checks, corrections, decision ownership, and only the records necessary for the task. Revisit controls when tools or workflows change.')]:story+=section(a,b)
story+=[text('A useful stop condition','h2'),text('Pause the pilot if the output invents a source quote, follows an embedded instruction, or a required data control is absent. Investigate before resuming.'),source_line([0]),p(f'<link href="{URL}capacity-matrix.html" color="#007c89">Choose a data-protection capacity target</link>')]
doc('protected-workflow',story)
story=title('A fair response to applicant AI use','Quick reference | Published rules before suspicion')
for a,b in [('1  State what is permitted','Define editing, brainstorming, translation, accessibility support, and substantive generation. Explain the boundary with examples before the application cycle.'),('2  Make disclosure workable','Specify which uses require a brief statement. Do not require passwords, private chat histories, medical information, or paid software. Offer an accessible way to explain the work.'),('3  Treat detector output as uncertain','An AI-writing percentage is not a probability of misconduct. Human writing can be flagged; AI writing can be missed. Performance depends on tool and context.'),('4  Identify the actual concern','Locate the specific published rule and relevant evidence. A polished style or detector flag alone does not establish a violation. Do not impose a new rule retroactively.'),('5  Give a fair response path','Describe the concern neutrally. Offer time and an accessible method to respond. Name the decision owner and a review or appeal route.'),('6  Keep the decision human','Do not deny an award or establish misconduct using a detector score alone. Document the evidence and reasoning under the published policy.')]:story+=section(a,b)
story+=[source_line([1,2,3]),p(f'<link href="{URL}practice.html#policy" color="#007c89">Open the policy starter and fictional response scenario</link>'),text('Adapt with organizational policy, privacy, accessibility, and legal owners. This is a workshop framework, not official NSPA policy.','small')]
doc('fair-ai-policy',story)
# Matrix: two landscape pages, clickable resource links.
story=[]
styles['check-head']=ParagraphStyle('check-head',parent=styles['table'],fontName='Bold',fontSize=8,leading=10)
for page in range(3):
 if page:story.append(PageBreak())
 story+=title('My capacity checklist',f'Page {page+1} of 3 | Read each statement. Mark one blank box to show where you are today. Use Notes for a question or next step.')
 for n,d in enumerate(DOMAINS[page*2:page*2+2],page*2+1):
  story+=[text(f'{n}. {d["matrix_title"]}','h2')]
  heads=[p('What I know or can do','white'),p('Ready to<br/>learn','check-head'),p('In<br/>progress','check-head'),p('<font color="white">Ready to<br/>go</font>','check-head'),p('Notes','white')]
  rows=[heads]+[[text(item,'table'),'','','',''] for item in d['indicators']]
  t=Table(rows,colWidths=[250,58,58,58,116],rowHeights=[36]+[44]*4,hAlign='LEFT')
  t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),TEAL),('BACKGROUND',(1,0),(1,0),PALE),('BACKGROUND',(2,0),(2,0),ORANGE),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#91ABB0')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('ALIGN',(1,0),(3,0),'CENTER')]))
  story+=[t,p('Resources: '+' | '.join(f'<link href="{urljoin(URL,u)}" color="#007c89">{escape(t)}</link>' for t,u in d['links']),'small'),Spacer(1,8)]
 story+=[text('One thing I want to work on: __________________________________________________','small'),text('My next step: __________________________________________________________________','small')]
doc('capacity-matrix',story)
# Workbook with explicit writing space and offline activities.
story=title('Participant workbook','October 21, 2026 | 3:30-5:00 PM CT | Trust, Transparency, and AI')
story+=[text('1. Read the fictional packet','h2'),text('Program requirements: enrollment confirmation, a goal statement of no more than 150 words, and one service example. No real person or application is represented. Use no real applicant data in this exercise.')]
for id,v in CASE:story+=[p(f'<b>{id}</b>  {escape(v)}')]
story+=lines('What is present? What is missing or unclear?',3)
story+=[PageBreak()]+title('2. Repair the prompt','Define a task that a human can verify.')
story+=[p(escape(PROMPT).replace('\n','<br/>'),'small')]+lines('My task and approved criteria',2)+lines('Evidence requirement and boundaries',2)+lines('Output format and human follow-up',2)
story+=[PageBreak()]+title('3. Calibrate before comparing AI','Work independently first. Compare evidence, then resolve the anchor interpretation.')
story+=[table([['Criterion','0','1','2']]+RUBRIC,[108,144,144,144]),Spacer(1,16),text('Missing source pages or contradictory information require follow-up; do not manufacture a rating. Do not score writing polish unless it is an explicit, justified criterion.'),table([['Criterion','My rating / evidence','Partner / AI draft','Final human reason'],['Goal clarity','','',''],['Contribution','','',''],['Reflection','','','']],[108,144,144,144])]+lines('Which anchor would we revise, and why?',3)
story+=[PageBreak()]+title('4. Policy lab','A fictional essay is flagged. The applicant reports translation assistance.')
story+=[text('The detector flag and polished style do not establish misconduct. Start with the published rules and relevant evidence. If a rule is unclear, address the ambiguity prospectively.')]
story+=lines('Permitted assistance and disclosure requirements',3)+lines('Specific rule and evidence relevant to this concern',3)+lines('A neutral clarification request and accessible response option',3)+lines('Decision owner and review / appeal path',2)
story+=[PageBreak()]+title('5. A protected workflow and next step','Use the capacity matrix to choose one change you can demonstrate.')
story+=[table([['Before the tool','Before reviewer use','Before a decision'],['Data approval + minimization','Evidence check + correction','Human owner + response route']],[180,180,180])]
story+=lines('One capacity to build and my next action',2)+lines('Evidence of progress and a stop condition',2)+lines('Owner / role and target date',1)+lines('Exit ticket: one prompt change, safeguard, and policy decision',3)
story+=[p(f'<link href="{URL}practice.html" color="#007c89">Full prompts, prepared reference outputs, and policy starter</link>'),text('The reference outputs are authored teaching examples, not live model transcripts. The training rubric and capacity matrix are not validated award-selection instruments.','small')]
doc('participant-workbook',story)
# Facilitator guide: conversational words to say, with separate stage directions.
from facilitator import SECTIONS
styles['say']=ParagraphStyle('say',parent=styles['body'],fontSize=10.5,leading=14.5,spaceAfter=7)
styles['cue']=ParagraphStyle('cue',parent=styles['small'],fontSize=9.5,leading=13,backColor=PALE,borderPadding=7,spaceBefore=5,spaceAfter=10)
styles['script-label']=ParagraphStyle('script-label',parent=styles['h2'],fontSize=10.5,leading=14,spaceBefore=9,spaceAfter=5,keepWithNext=True)
story=title('Your workshop speaking guide','Miguel Guhlin | October 21, 2026 | 3:30-5:00 PM CT')
story+=[text('Words to say aloud, with short reminders for you. Make the wording your own. Each workshop block starts on a fresh page; the times leave room for activities and discussion.'),text('SAY THIS: wording for the room. PRESENTER CUE: a reminder for you.','small'),text('Before people arrive','h2'),text('Open the hub, practice lab, and matrix. Download the slides and handouts. Test both demos in an approved AI tool with the fictional packet. Keep the prepared examples ready if the tool fails. Bring printed workbooks and matrices.','small'),p(f'<link href="{URL}" color="#007c89">Workshop hub: {URL}</link>','small')]
story += [table([['Time','Slides','What happens']]+[[section['time'].split(' PM')[0],section['time'].split(' | ')[1].replace('Slides ',''),section['title']] for section in SECTIONS],[100,60,380])]
story += [text('Before October 21','h2'),text('Recheck the linked guidance on AI detectors and your organization’s rules. This workshop gives people examples to discuss and adapt; it does not establish official NSPA policy. The practice applications are entirely fictional.','small'),source_line([0,1,2,3])]
for section in SECTIONS:
 story += [PageBreak()]+title(section['title'],section['time'])
 for label,kind,words in section['parts']:
  story.append(text(label+' | '+('SAY THIS' if kind=='say' else 'PRESENTER CUE'),'script-label'))
  for paragraph in words.split('\n\n'):
   story.append(text(paragraph,'say' if kind=='say' else 'cue'))
doc('facilitator-guide',story)
print('Created handout PDFs: '+(', '.join(sys.argv[1:]) if len(sys.argv)>1 else 'all six'))
