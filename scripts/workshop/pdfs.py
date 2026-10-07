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
 target=ROOT/'2026/p' if name in ['facilitator-guide','presenter-route'] else OUT
 target.mkdir(parents=True,exist_ok=True)
 d=SimpleDocTemplate(str(target/(name+'.pdf')),pagesize=size,rightMargin=36,leftMargin=36,topMargin=53,bottomMargin=50,title=name.replace('-',' ').title(),author='Miguel Guhlin');d.build(story,onFirstPage=header,onLaterPages=header)
def title(a,b):return [text(a,'h1'),text(b)]
def section(a,b):return [text(a,'h2'),text(b)]
def lines(label,n=2,hint=''):return [text(label,'h2')]+([text(hint,'small')] if hint else [])+[Spacer(1,6),Table([['']]*n,colWidths=[530],rowHeights=23,style=TableStyle([('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#AFC5CA'))]))]
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
# Conversation workbook: six pages, with one shared case and a single change to try.
from conversation import FLAWED_DRAFT, FAIR_SCENARIO, FAIR_RULE
story=title('My conversation workbook','October 21, 2026 | 3:30-5:00 PM CT | Trust, Transparency, and AI')
story += [text('Every ruled space is for your own notes. No AI tool is needed during these conversations. Use fictional information only. You may reflect privately or pass on speaking.'),text('1. What makes a review worthy of trust?','h2'),text('One quiet minute, then two minutes per partner. Recall a review that built or weakened trust. Leave out identifying details.')]
story += lines('A quality of trust I want our process to protect',3,'Write one quality and why it matters. Example: clear reasons, so applicants understand a decision.')
story += [text('2. What could a polished summary hide?','h2'),text(FLAWED_DRAFT),text('Intentionally flawed teaching draft, authored for discussion. It is not an actual model response. Compare it with P4 and P5 on page 2.','small')]
story += lines('What would I check? What should our request require?',3,'Write one source check and one instruction an AI request should include. Example: check P4; report missing evidence instead of calling the packet complete.')
story += [PageBreak()]+title('Our shared case: C-101','Entirely fictional. Required: enrollment confirmation, a goal statement of no more than 150 words, and one service example. Missing evidence requires follow-up.')
for id,v in CASE:story += [p(f'<b>{id}</b>  {escape(v)}')]
story += [text('Read alone for three minutes. Mark one detail to rely on and one question. Then turn to the scoring guide on page 3.')]+lines('My evidence and an open question',3,'Write a paragraph ID, a short quote, and a question. Example: P4 says "not included"; how should we request the enrollment document?')
story += [PageBreak()]+title('3. What do you see that I might miss?','Three minutes alone, two minutes per partner, then three minutes to clarify a scoring description. Focus on reflection or adaptation in P3.')
story += [table([['Criterion','0','1','2']]+RUBRIC,[108,144,144,144]),text('Practice guide, not a validated award-selection instrument. Missing or contradictory source information requires follow-up. Do not infer personal traits or rate writing polish.','small')]
story += lines('My rating and the words that support it',2,'Write 0, 1, or 2 for reflection/adaptation, then quote P3 to explain your judgment.')+lines('My partner’s reason; what I would clarify or change',2,'Write what your partner noticed and a scoring phrase to clarify. You may keep your original rating.')
story += [text('4. What are you reconsidering?','h2'),text('Two full minutes of silence. What assumption changed, and why? What question remains? Share only what you choose.')]+lines('My private reflection',2,'Finish "I first thought ...; now I wonder ... because ..." or write an open question.')
story += [PageBreak()]+title('5. Where does our process need a person?','Choose one small task for C-101. Map seven minutes, test three minutes, then exchange a challenge with another group.')
story += [text('Map approved input, AI draft, evidence check, human decision, and record. Name roles before the tool, before relying on the draft, and before a decision.')]
story += lines('Our task and workflow; the people who approve, check, and decide',5,'Write one task, then sketch the steps with a role at each check. Example: completeness draft; program lead approves, reviewer checks P1-P5, authorized staff decide follow-up.')+lines('Our pause condition and the person who resolves the concern',2,'Finish "We pause if ...; ... investigates before we resume." Example: an invented quote; the review lead checks the source.')
story += [text('What might another team question?','h2'),text('Each group gets two minutes to explain and receive a question. Revise for two minutes.')]+lines('The peer challenge and what we changed',2,'Write the other group’s question and your revision. Example: "Who checks a missing document?" We added a named reviewer.')
story += [PageBreak()]+title('6. What would a fair response sound like?',FAIR_SCENARIO)
story += [text('Published practice rule','h2'),text(FAIR_RULE),text('A detector flag alone does not establish misconduct. If no policy concern is justified, follow up on the missing enrollment document. Do not add a rule retroactively.','small')]
story += lines('Our first message; the actual concern or ordinary follow-up',3,'Write words you would send to C-101. If no policy concern is justified, request the missing enrollment confirmation through an approved channel.')
story += [text('How might it feel to receive our question?','h2'),text('Draft three minutes, read and listen three minutes, revise two minutes. You may review silently instead of role-playing.')]
story += lines('What felt assumed? Our revised wording and response method',2,'Write what sounded unclear or accusatory, then your revised message and an accessible way to respond.')+lines('Response time, decision owner, and route for another review',2,'Name a locally appropriate deadline, the role deciding next steps, and how to request another review. These are your proposed choices, not supplied program rules.')
story += [PageBreak()]+title('7. What will you try, and who will help you learn?','Three minutes to plan, then two minutes per partner. Choose one change to your review practice within the next 30 days.')
story += lines('The quality of trust I want to protect and my one action',2,'Write the quality from page 1 and one small action. Example: clear reasons; add source paragraph IDs to a fictional completeness test.')+lines('A colleague to invite and a date to review what happens',2,'Write a colleague’s role or name and a specific review date within 30 days.')+lines('Evidence of improvement; when we will pause or revise',2,'Write what you will observe and a reason to stop or change course. Example: another reviewer can find every source; pause if any quote is invented.')+lines('What changed in my thinking because of another person?',2,'Write the perspective you heard and how it changed your thinking, or a question you will keep exploring together.')
story += [p(f'<link href="{URL}conversation.html" color="#007c89">Keep and export conversation notes online</link>'),p(f'<link href="{URL}" color="#007c89">All infographics, optional labs, readiness checklist, and resources</link>'),text('Keep first AI tests fictional. These examples support local discussion; they are not official NSPA policy.','small')]
doc('participant-workbook',story)
# Facilitator guide: conversational words to say, with separate stage directions.
from facilitator import SECTIONS
styles['say']=ParagraphStyle('say',parent=styles['body'],fontSize=12,leading=17,spaceAfter=9)
styles['cue']=ParagraphStyle('cue',parent=styles['small'],fontSize=11,leading=15.5,backColor=PALE,borderPadding=7,spaceBefore=5,spaceAfter=10)
styles['script-label']=ParagraphStyle('script-label',parent=styles['h2'],fontSize=11.5,leading=16,spaceBefore=11,spaceAfter=5,keepWithNext=True)
from route import RUN_OF_SHOW
from slides import SLIDES, CORE_COUNT
story=title('Your workshop speaker’s guide','Miguel Guhlin | October 21, 2026 | 3:30-5:00 PM CT')
story += [text('How can we use AI to support scholarship review while strengthening human judgment, trust, and connection?'),text('The experience to protect','h2'),text('People have time to think, hear another perspective, reconsider an assumption, and choose one change to try with a colleague. Twelve core slides carry the session. Six optional references answer questions afterward.'),text('Before people arrive','h2'),text('Open the webdeck and conversation companion. Print the six-page workbook. Keep the prepared draft ready; no live AI call or participant account is required. Have a silent timer and a place to capture a few ideas. Invite paper, private reflection, and passing on speaking.','small')]
story += [table([['Time CT','Slides','Conversation']]+[[time,slides,title] for time,slides,title,path,question,keep in RUN_OF_SHOW],[100,55,385])]
story += [text('Adjust the strategy, protect the learning','h2'),text('If time is short, shorten whole-room reporting and extra examples. Keep independent thinking, the two-minute silence, and the fair-response discussion. Move to slide 12 at 4:50. If a discussion matters, invite one useful follow-up and record the question for later.','small'),text('SAY THIS gives friendly wording to adapt. PRESENTER CUE gives timing and facilitation reminders. Each core slide starts on a fresh page.','small')]
for number,section in enumerate(SECTIONS,1):
 story += [PageBreak()]+title(f'{number:02}. '+section['title'],section['time'])
 for label,kind,words in section['parts']:
  story.append(text(label+' | '+('SAY THIS' if kind=='say' else 'PRESENTER CUE'),'script-label'))
  for paragraph in words.split('\n\n'):story.append(text(paragraph,'say' if kind=='say' else 'cue'))
story += [PageBreak()]+title('Optional references, when a question calls for one','Slides 13-18 are outside the timed route. Keep the core conversation intact.')
for number,sld in enumerate(SLIDES[CORE_COUNT:],CORE_COUNT+1):
 story += [text(f'{number}. '+sld['title'],'h2'),text(' '.join(h+': '+t for h,t in sld['blocks']),'small')]
story += [text('Sources and scope','h2'),source_line([0,1,2,3]),text('Guidance reviewed October 7, 2026. Study findings depend on the tested writing, language, and detector. The cases, rubric, policy starter, and checklist are workshop teaching tools, not validated instruments or official NSPA policy. Recheck source guidance and local rules before real use.','small')]
story += [PageBreak()]+title('Your links during the workshop','The same destinations appear on the slides and in the companion.')
from resources import RESOURCES, BASE
for key in ['conversation','workbook','tension','case','checkpoints','fair','change','hub','prompt','rubric','workflow','policyref','matrix','library']:
 label,path=RESOURCES[key]
 story += [p(f'<b>{escape(label)}</b><br/><link href="{urljoin(BASE,path)}" color="#007c89">{urljoin(BASE,path)}</link>','small')]
story += [text('Using the resource links','h2'),text('Click the teal resource links in PowerPoint Slide Show, the PDF, or the webdeck. Use the complete offline package for local copies. Document viewers can restrict local links; the offline webdeck is the preferred navigation route.','small'),text('All photographic people and new infographic scenes are AI-generated fictional illustrations. Prepared outputs are authored teaching examples, not recordings of actual model responses.','small')]
doc('facilitator-guide',story)
# A compact, one-page route complements the full speaking guide.
from route import RUN_OF_SHOW
styles['route']=ParagraphStyle('route',parent=styles['small'],fontSize=9.5,leading=12.5,spaceAfter=0)
route_rows=[[p('Time / slides','white'),p('Open this activity','white'),p('Ask or do / keep','white')]]
for time,slide,activity,path,question,keep in RUN_OF_SHOW:
 route_rows.append([text(time+'\nSlides '+slide,'route'),p(f'<link href="{URL+path}" color="#007c89"><b>{escape(activity)}</b></link>','route'),p(escape(question)+'<br/><b>Keep:</b> '+escape(keep),'route')])
route_table=Table(route_rows,colWidths=[80,130,330],hAlign='LEFT')
route_table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),TEAL),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#CCDDDD')),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
route_story=title('Your presenter route','October 21, 2026 | 3:30-5:00 PM CT | Keep this beside the presentation.')+[route_table,text('Prepared teaching example','h2'),p(f'<link href="{URL}practice.html#demo-completeness" color="#007c89">Completeness reference</link> | <link href="{URL}practice.html#demo-scoring" color="#007c89">Scoring discussion</link>. Say: This is a prepared teaching example, not a live model response.','small'),text('If time is short: shorten volunteer reporting and extra examples. Keep independent thinking, the two-minute silence, and the fair-response discussion. At 4:50, move to the one-change plan on slide 12. Slides 13-18 are optional references.','small'),p(f'<link href="{URL}p/facilitator-guide.pdf" color="#007c89">Full speaking guide</link> | <link href="{URL}p/" color="#007c89">Online presenter route</link>','small')]
doc('presenter-route',route_story)
print('Created handout PDFs: '+(', '.join(sys.argv[1:]) if len(sys.argv)>1 else 'all six'))
