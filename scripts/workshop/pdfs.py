from content import *
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
for page in range(2):
 if page:story.append(PageBreak())
 story+=title('Responsible review capacity matrix',f'Page {page+1} of 2 | Choose the highest descriptor you can demonstrate. No overall score; this is not a certification.')
 rows=[[text('Capacity / evidence','white')]+[text(f'{i+1}. {l}','white') for i,l in enumerate(LEVELS)]]
 for d in DOMAINS[page*3:page*3+3]:
  label=f'<b>{escape(d["title"])}</b><br/>Evidence: {escape(d["evidence"])}<br/>'+ '<br/>'.join(f'<link href="{urljoin(URL,u)}" color="#007c89">{escape(t)}</link>' for t,u in d['links'])+'<br/>Today: ____  Next: ____'
  rows.append([p(label,'table')]+[text(v,'table') for v in d['levels']])
 t=Table(rows,colWidths=[184,134,134,134,134],hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),TEAL),('BACKGROUND',(0,1),(0,-1),PALE),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#CCDDDD')),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));story.append(t)
 story += [Spacer(1,12),text('Priority: _____________________  Next action: __________________________________________','small'),text('Evidence: ____________________  Owner: ____________________  Date: ____________________','small'),p(f'<link href="{URL}capacity-matrix.html" color="#007c89">Online matrix: linked resources, local saving, and plan export</link>','small')]
doc('capacity-matrix',story,landscape(letter))
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
# Facilitator guide - detailed timing separate from conversational slide notes.
story=title('Facilitator guide','90 minutes | October 21, 2026 | 3:30-5:00 PM CT')
story+=[table([['Time','Slides','Focus / product']]+[[t+' ('+d+')',sl,topic+'. '+out] for t,d,topic,out,sl in AGENDA],[98,60,382]),text('Before the session','h2'),text('Open the hub, practice page, and capacity matrix. Download the PPTX, PDF, workbook, and reference outputs. Test an approved Gen AI account with the synthetic packet only. Verify projection and Wi-Fi; print the workbook and matrix for participants without devices. Recheck detection guidance shortly before the workshop. Slide 26 is a source appendix, outside the 90-minute flow.','small')]
story+=[PageBreak()]+title('Demonstrations and debriefs','Keep both demos bounded; never substitute real applicant records.')
for a,b in [('3:38-3:50 | Prompt design','Slides 5-6: explain the five prompt components and compare the vague and bounded requests. Slide 7: give pairs 2 minutes to choose a task, 2 to revise, and 1 to critique. Ask which assumption they removed.'),('3:50-4:05 | Administrative triage','3:50-3:53: introduce P1-P5. 3:53-3:58: copy the triage prompt and synthetic packet from the practice page into an approved tool. Inspect missing enrollment confirmation, evidence IDs, and P5 instruction handling. 3:58-4:01: compare against the prepared reference. 4:01-4:05: pairs trace, challenge, and correct one output. If the tool fails, use the authored reference table; label it as such.'),('4:05-4:20 | Rubric calibration','4:05-4:09: explain the 0-2 anchors and insufficient-evidence distinction. 4:09-4:15: allow 2 minutes for independent ratings, 2 for comparison, and 2 for anchor revision. 4:15-4:20: run the rubric prompt on the same synthetic packet. Compare the AI draft only after human ratings. Expected discussion: goal and contribution support 2; reflection can expose differences in how reviewers interpret the anchor. Do not present a total or rank.'),('Debrief questions','What fact was unsupported? Which source location supports the claim? Did the output treat P5 as an instruction? Was disagreement about evidence or about the rubric? Who can stop the process? Keep a visible record of corrections rather than celebrating only fast generation.')]:story+=section(a,b)
story+=[PageBreak()]+title('Policy, capacity, and closure','Protect time for participant decisions.')
for a,b in [('4:20-4:30 | Protected workflow','Use 4 minutes for the data gate and 6 for mapping checkpoints. Ask pairs to name the owner before the tool, before reviewer use, and before a final decision. Require one explicit stop condition.'),('4:30-4:45 | Applicant AI use','3 minutes: explain detector limitations and study context. 3 minutes: use the hypothetical 1,000 x 1% = 10 example; this is not a product benchmark. 3 minutes: separate permitted use, disclosure, and misrepresentation. 6 minutes: groups analyze translation-support scenario, draft a neutral message, and name a review path. Debrief against the published rule, not impressions of writing style.'),('4:45-4:55 | Capacity target','3 minutes: revisit the six capacities. 5 minutes: choose a row, current evidence, and next action. 2 minutes: define a 30-day pilot with owner, measure, and stop rule. Ask participants to export their local plan or mark the printed matrix.'),('4:55-5:00 | Exit and questions','3 minutes: one prompt change, one safeguard, one policy decision. 2 minutes: questions and hub reminder. If running late, shorten whole-group reporting and optional explanation, not the independent rubric pass or the policy-response activity.'),('What to collect or retain','Participants keep their prompt, evidence corrections, rubric discussion, workflow map, policy starter, and capacity plan. No applicant information is collected by this workshop site. Do not collect participant browser exports unless there is an explicit agreed purpose.')]:story+=section(a,b)
story+=[source_line([0,1,2,3])]
doc('facilitator-guide',story)
print('Created 6 handout PDFs')
