"""Reader-facing, self-contained workshop activities and matching workbook."""
from html import escape
from lxml import html
from demo_one import ANATOMY, PROMPT

PARAGRAPH = 'For six Saturdays I helped at a neighborhood repair table. When our sign-in line got long, I suggested separate lines for tool returns and new requests. The volunteer lead tried the change the next week.'
RUBRIC = [
 ('4 · Exemplary','Sustained contribution, a clear role and evidence of results.'),
 ('3 · Proficient','Specific contribution and role; results are partly documented.'),
 ('2 · Developing','A contribution is described; the role or results remain unclear.'),
 ('1 · Beginning','A general service claim with little supporting detail.')]
ROUTE = [
 ('3:30–3:38','1–4','Trust and expectations','8 minutes'),
 ('3:38–3:50','5–8','My six-part review request','12 minutes'),
 ('3:50–4:01','9–10','Our document follow-up plan','11 minutes'),
 ('4:01–4:12','11','My rating and the words behind it','11 minutes'),
 ('4:12–4:20','12','A summary that preserves the evidence','8 minutes'),
 ('4:20–4:30','13–14','Our workflow and first test','10 minutes'),
 ('4:30–4:48','15–21','Applicant rules and a fair response','18 minutes'),
 ('4:48–5:00','22–24','My 30 / 60 / 90-day plan','12 minutes')]

def p(text):return '<p>'+escape(text)+'</p>'
def h(text):return '<h3>'+escape(text)+'</h3>'
def ol(items):return '<ol>'+''.join('<li>'+escape(x)+'</li>' for x in items)+'</ol>'
def ul(items):return '<ul>'+''.join('<li>'+escape(x)+'</li>' for x in items)+'</ul>'
def quote(label,text):return '<blockquote class="prepared-draft">'+p(label)+p('“'+text+'”')+'</blockquote>'
def example(text):return h('An example of the response format')+p(text)
def steps(items):return h('My conversation and work')+ol(items)
def activity(id,title,slides,minutes,goal,parts,output,guide):
 return dict(id=id,title=title,slides=slides,minutes=minutes,goal=goal,parts=parts,output=output,guide=guide)

ACTIVITIES = [
 activity('pulse','The trust I want our process to earn','1–4',5,
  'I can describe what my team and an applicant each need from a review process.',[
  h('The situation I am considering')+p('Our scholarship team uses AI to flag missing documents. An applicant receives “Your application is incomplete” but cannot see which document is missing, whether staff checked it, or how to correct the record. The applicant believes the reference was emailed separately.'),
  h('Two perspectives I can consider')+ul(['From my team’s perspective: I need a manageable workload, consistent rules, and records another reviewer can check.','From the applicant’s perspective: I need to understand the issue, know how to respond, and know that a person can correct a mistake.']),
  steps(['I spend one minute noting what information would help each side.','My partner and I each take one minute to explain a different perspective. I can choose a role without sharing a personal experience.','We use two minutes to choose one change to the message or process. We explain which need it addresses and what staff would have to do.']),
  example('“I would name the document and explain how to ask staff to check the record. That gives the applicant a usable next step and gives staff a clear correction route.” This is one possible improvement; my team may identify another.'),
  h('What I keep')+p('I name one quality of trust, one process change, and the reason the change would matter. I will return to that quality in my implementation plan.')],
  'My quality of trust; one change our team could make; why it matters.',
  'Five-minute activity. Read the short scenario. Invite the provider and applicant perspectives without asking for personal disclosures. Debrief the relationship between a proposed change and a specific need; there is no single approved phrase.'),
 activity('prompt','My six-part review request','5–8',6,
  'I can turn a broad request into instructions whose result I can check.',[
  h('The task I am preparing')+p('I want a draft document check for A-102. Our program requires an essay, a reference, and a transcript. References can arrive through the portal or an approved inbox. The portal record says: “Essay and transcript are linked. The reference field is blank.”'),
  h('My example, part by part')+''.join('<h4>'+str(i)+'. '+escape(label)+'</h4>'+quote('Example instruction to the AI assistant',words) for i,(label,words) in enumerate(ANATOMY,1)),
  h('What I mean by a staff check')+p('Before using the answer, our intake coordinator checks the portal and approved inbox. A blank field alone does not establish that the reference was never received. The coordinator decides whether applicant contact is needed under our published process.'),
  h('The assembled request I can copy')+'<pre id="anatomy-complete-prompt">'+escape(PROMPT)+'</pre><button class="button secondary" type="button" data-copy="anatomy-complete-prompt">Copy the six-part example</button>',
  steps(['I use two minutes to read the example and identify what each part adds. In the quoted instructions, “you” means the AI assistant.','I use two minutes to adapt one part for a task my team actually needs. I keep the example if I do not yet have a task in mind.','My partner and I use two minutes to inspect our requests. Could a reviewer tell whether the answer followed the criteria? Have we named the staff verification needed before action?']),
  example('If my task is checking documents, my format might ask for “document | recorded status | exact source words | paragraph ID | staff check needed.” A sample row is: Reference | not recorded in the portal | “reference field is blank” | P1 | intake coordinator checks the approved inbox.'),
  h('What I keep')+p('I keep my changed instruction and explain why it makes the response easier to verify. I do not need to run an AI tool during this activity.')],
  'My changed prompt part; why I changed it; what our intake coordinator must verify before acting.',
  'Six-minute activity. Walk through the six labeled examples before participants adapt anything. Distinguish directions inside the AI prompt from directions for participants. Ask a pair to explain one edit and how a staff member would check the result.'),
 activity('triage','Our document follow-up plan','9–10',7,
  'I can turn an AI flag into a workable staff procedure instead of an automatic applicant message.',[
  h('The rules and record I have')+p('Our program requires an essay, a reference, and a transcript. References may arrive through the portal or an approved separate inbox. No deadline, grace period, or rejection rule is supplied for this exercise.'),
  quote('A-102 · P1, portal record','Essay and transcript are linked. The reference field is blank.')+p('The record does not say whether staff checked the inbox. A blank field may reflect a missing reference, an unlinked file, or an unfinished staff check.'),
  quote('The prepared AI draft','Reference missing. Send a request to the applicant.'),
  h('The decision our team faces')+p('Our team has 40 flags and one hour before reviewer assignments begin. Contacting every flagged applicant could save staff time now, but it could send unnecessary requests. Checking the source channels takes time, but it may prevent avoidable work and inconsistent treatment.'),
  steps(['My partner and I use four minutes to design a procedure. Who checks the portal and inbox? What can we check efficiently or in groups?','We decide what must be confirmed before staff contact an applicant and who sends the message.','We decide how to handle a flag that is still unresolved after the hour. We identify the person with authority to resolve it and what staff record.','I use one minute to write our procedure. We use the two-minute debrief to compare trade-offs with another pair.']),
  example('One possible procedure: “Our intake coordinator checks both channels and records the result. Staff contact the applicant only if the reference remains unlocated under the published process. Our review lead resolves unfinished cases before any adverse action.” Another procedure can be defensible if it protects consistent treatment and explains its checks.'),
  h('What I keep')+p('My procedure identifies who verifies, when staff contact an applicant, and how an unfinished check is escalated and recorded. I note one trade-off my partner helped me see.')],
  'Our verification role; our trigger for applicant contact; our unresolved-case procedure; one trade-off.',
  'Seven-minute activity. This is process design, not a hunt for an obvious missing-document label. Read the two-channel setup and the limited-time constraint. Ask pairs to compare workload, applicant burden, and consistent treatment. Do not supply a deadline or imply that a blank field establishes ineligibility.'),
 activity('evidence','My rating and the words behind it','7 and 11',8,
  'I can explain a draft rating with exact words from the application and identify what the paragraph does not establish.',[
  h('The application paragraph I am reviewing')+quote('A-102 · E1',PARAGRAPH),
  h('The community-impact score descriptions I am using')+ul([level+': '+words for level,words in RUBRIC]),
  h('What exact words from the paragraph look like')+quote('An example of quoted evidence','I suggested separate lines for tool returns and new requests.')+p('These are the applicant’s own words, copied inside quotation marks. They show a specific action. My explanation connects those words to the score description; the quotation does not explain itself.'),
  steps(['I spend two minutes choosing a rating from 1 to 4 and copying the exact words that explain my choice. I make my own judgment before opening the prepared comparison below.','My partner and I each take two minutes to explain our rating, evidence, and one uncertainty. We ask what would justify the next score level.','We spend two minutes clarifying a score description or identifying information we would need. We can keep different ratings if we explain our reasons.']),
  '<details class="workshop-details"><summary>After my rating: a prepared comparison</summary>'+p('A defensible draft is 3: the contribution and role are specific, while results are only partly documented. The paragraph says the volunteer lead tried the change; it does not tell us whether waiting time improved. A different adopted rubric could lead to another judgment. This comparison is not an award decision.')+'</details>',
  example('“My rating is __ because E1 says ‘__’. Those words match the description ‘__’. I still do not know __.” For the uncertainty, I might write: “The paragraph does not tell me whether the change shortened the queue.”'),
  h('What I keep')+p('I keep my rating, the exact words I copied, my explanation of the match, and one uncertainty. If we interpret a score description differently, we compare our evidence and clarify the wording.')],
  'My rating (1–4); exact words copied from E1; how those words fit the score description; what I still do not know.',
  'Eight-minute activity. The displayed paragraph is the material participants review; there is no missing longer essay. Model what a quotation is using the example already on the page. Protect independent judgment before discussing the draft 3. Debrief what the paragraph establishes and what it leaves open.'),
 activity('organize','A summary that preserves the evidence','12',6,
  'I can prepare a neutral summary and evidence-based tags without turning them into character judgments or eligibility decisions.',[
  h('The records and tag definitions I have')+ul(['A-101 · T1: “I care for my younger brother after school.” The tag “caregiving” means an explicit responsibility for caring for another person.','A-102 · T1: “I plan to complete a nursing certificate.” The tag “healthcare goal” means an explicitly stated plan to study or work in a healthcare field.','A-103 · T1: “Neither parent attended college.” The tag “parent-education context” preserves this statement. A first-generation eligibility definition has not been supplied.']),
  quote('A prepared summary for me to examine','A-101 is a resilient leader who deserves priority. A-102 is committed to a healthcare career. A-103 qualifies as first-generation.'),
  p('Some claims in this draft go beyond the supplied words. A tag can help organize work, but it can also shape who receives attention.'),
  steps(['I use two minutes to mark words that add a character judgment, a priority, or an eligibility conclusion.','My partner and I use three minutes to rewrite one applicant’s summary in no more than 60 words. We add one permitted tag and its exact source words.','I use one minute to note what our summary leaves unknown and how a reviewer can return to the original record.']),
  example('“A-101 reports caring for a younger brother after school. Tag: caregiving. Evidence: T1, ‘I care for my younger brother after school.’ The record does not describe the duration or extent of that responsibility.” This preserves the supplied fact without deciding merit.'),
  h('What I keep')+p('I keep our revised summary, one tag, the exact source words, and an uncertainty. I leave eligibility and award decisions to the authorized reviewers using the adopted program rules.')],
  'Our neutral summary (up to 60 words); tag and source words; uncertainty; how staff find the original record.',
  'Six-minute activity. Give the definitions before asking participants to tag. The flawed summary is deliberately authored. Ask how an adjective or tag could change attention. Debrief preserving the applicant’s account rather than guessing character or eligibility.'),
 activity('workflow','Our workflow and first test','13–14',8,
  'I can name the staff roles, checks, and pause conditions for a small clerical pilot.',[
  h('The pilot our team is considering')+p('Our intake coordinator wants AI to draft document-check tables. The coordinator can inspect both approved submission channels. A review lead can pause the pilot. Committee members make eligibility and award decisions under the published rules.'),
  h('The process I need to design')+ol(['Before use: a program, privacy, or security owner approves the task, actual service, settings, and permitted inputs.','Draft: the assistant organizes the supplied records and identifies uncertainty.','Before reliance: the intake coordinator compares each flag with the source channels and corrects it.','Before action: the authorized staff role decides follow-up; the committee retains consequential decisions.','After use: the review lead samples the work, records corrections, and revisits the process when the tool or rules change.']),
  h('Three tests I can choose from')+ul(['Repeat the same record three times while holding the record, rules, prompt, and settings constant. Compare flags, quotations, and omissions.','In a controlled test, change only a name and investigate an unexplained change in the output.','Compare AI-assisted drafts with independent staff judgments on a small practice set. Ten cases can reveal problems; they cannot establish that the system is fair.']),
  steps(['My partner and I use four minutes to assign actual roles to the five stages. We can use the roles in the example if our local roles differ.','We use two minutes to choose one first test and define what we will record.','We use two minutes to name a condition that pauses the pilot, who investigates it, and what must be checked before work resumes.']),
  example('“If a draft invents a quotation, our intake coordinator stops using that draft. Our review lead checks the source and prompt, records the correction, and retests before resuming.” A pause condition identifies both a problem and someone with authority to act.'),
  h('What I keep')+p('I keep our roles, first test, evidence to record, and pause condition. I can explain how this plan connects to our trust goal from the opening activity.')],
  'Our workflow roles; first test; evidence to record; pause condition and the role who resolves it.',
  'Eight-minute activity. Define meaningful human oversight as time, evidence, and authority. Ask groups to name roles rather than writing “human review.” Compare one realistic pause-and-resume procedure; avoid implying that a small sample certifies fairness.'),
 activity('fair','Applicant rules and a fair response','15–21',12,
  'I can apply a published AI-use rule to the available facts and explain my organization’s own AI use.',[
  h('The policy approaches my organization can compare')+ul(['Prohibit: no generative AI assistance; scope and accessibility exceptions need clear definitions.','Disclose: allowed help is briefly explained; applicants need to know how disclosure affects review.','Bounded use: specified assistance is allowed while core work remains the applicant’s; examples define the limits.','Embrace: tools are allowed while accurate claims and examination of substance remain required.'])+h('The practice rule for this application cycle')+quote('Published applicant rule','Spelling, grammar, translation, and brainstorming help are permitted. The applicant’s experiences and factual claims must be accurate. AI rewriting of substantive passages requires a short statement naming the tool and the kind of help. Translation alone does not require that statement. A detector result alone does not establish a violation.'),
  h('The situation our review team faces')+p('A finalist’s polished paragraph receives a detector flag. The applicant reports using translation help. The record supplies no evidence of fabricated experiences or substantive rewriting. A reviewer proposes asking for all of the applicant’s AI chat histories before scoring.'),
  h('The facts I can separate from assumptions')+ul(['Known: a detector produced a flag; the applicant reports translation help; the published rule permits that help.','Unknown: whether any prohibited or disclosure-triggering assistance occurred. The flag and polished style do not establish it.','Not supplied: evidence of invented facts or a reason to request private chat histories.']),
  steps(['I use two minutes to read the rule and facts. I decide what action the available evidence supports.','My partner and I use four minutes to discuss whether a misconduct follow-up is justified. If we propose a question, we name the rule and specific facts that make it relevant.','We use three minutes to write a neutral response or an internal staff note explaining why no misconduct inquiry is justified.','We use three minutes to draft one sentence explaining our organization’s AI use and how an applicant can request a correction. We include only practices our organization can verify.']),
  example('One defensible internal note is: “The reported translation support is permitted under the published rule. The record does not establish a disclosure-triggering use or fabricated facts. We will score the paragraph under the rubric and document the reason for not opening a misconduct inquiry.”'),
  h('A provider statement I can adapt')+quote('Sample wording','We use approved AI tools to help organize applications and check recorded documents. Staff verify the drafts and make all scoring and award decisions. Applicants can contact [role and channel] to ask for a correction.')+p('My organization must confirm that this wording matches its actual process, service, data terms, and correction route before publishing it.'),
  h('What I keep')+p('I keep the action supported by the rule and facts, my response or staff note, and a truthful provider-use statement. If a justified concern arises in another case, I would use a neutral question, an accessible response method, and the published review route.')],
  'The rule and facts supporting our action; our response or staff note; our provider-use statement and correction contact.',
  'Twelve-minute activity. The rule is supplied so participants can actually apply it. Do not introduce a new translation disclosure requirement. A conclusion that no misconduct inquiry is justified is legitimate. Debrief both applicant expectations and verified provider transparency.'),
 activity('change','My 30 / 60 / 90-day plan','22–24',8,
  'I can take one manageable next step, name the owner, and decide how we will judge the result.',[
  h('The starting point I can use')+p('Our example team has no consistent procedure for checking AI document flags. The review coordinator wants to pilot that clerical task. The program lead owns policy, privacy and security owners approve the service and inputs, and the review lead can stop the pilot.'),
  h('The checklist I can use to choose three gaps')+ul(['Approved service and verified data terms; personal information minimized.','Clear rubric descriptions; versioned prompts; evidence for each draft judgment.','Consistency and name-change tests; independent staff comparison; an audit each cycle.','Authorized people make consequential decisions; a documented pause and correction route.','A truthful provider-use statement; applicant rules, examples, and any required disclosure.','No action on a detector alone; scheduled policy, service, and settings review.'])+h('My three stages')+ul(['Within 30 days: I choose one clerical task and an owner. Our team drafts applicant guidance and a provider-use statement and resolves approval questions.','Within 60 days: our team tests practice records, compares the draft with independent staff review, and records errors, omissions, corrections, and verification time.','Within 90 days: if approvals and results support proceeding, our team trains reviewers, publishes the applicable policy, and sets the audit and review dates. If they do not, we revise or stop the pilot.']),
  steps(['I use three minutes to choose one task and write a concrete step for each stage. I can adapt the example if it fits my team.','My partner and I each take two minutes to explain our plan. We ask who owns the next action, what evidence would show improvement, and what would make us pause.','I use one minute to revise my plan and name a date when a colleague and I will review it.']),
  example('“By day 30, our review coordinator will document the two-channel reference check and obtain the needed approvals. By day 60, we will compare drafts with staff checks and log every mismatch and the time needed to verify it. By day 90, we will decide whether to stop, revise, or train the team. An invented source quotation pauses the pilot.”'),
  h('What I keep')+p('I leave with one task, an owner for the next step, three stages, a review date, evidence to inspect, and a reason to pause. I connect the plan to the quality of trust I named at the start.')],
  'My task and owner; steps for 30, 60, and 90 days; review date; evidence of improvement; pause condition.',
  'Eight-minute activity. Protect the closing time. Ask for a small clerical task and a concrete next action, not a promise to adopt AI. Allow stopping or revising as a valid outcome. Close by returning to the trust qualities participants named at the start.')
]

def sections():
 return [(x['id'],x['title'],'Slides '+x['slides']+' · '+str(x['minutes'])+' minutes',x['output'],h('What I am learning')+p(x['goal'])+''.join(x['parts'])) for x in ACTIVITIES]

def presenter_notes(slide_number):
 slots={2:0,6:1,10:2,11:3,12:4,14:5,19:6,23:7}
 if slide_number not in slots:return None
 x=ACTIVITIES[slots[slide_number]]
 return [x['guide'],'The companion and workbook contain all of the case information, examples and response prompts for this activity. Activity: '+x['title']+'. Participant work to keep: '+x['output']]

def workbook_story(root,styles,text,lines):
 from reportlab.platypus import PageBreak,Spacer,Image
 from participant_packet import artwork
 from reportlab.lib.styles import ParagraphStyle
 styles['workbook-cover']=ParagraphStyle('workbook-cover',parent=styles['h1'],fontSize=30,leading=36,spaceAfter=18)
 story=[text('PARTICIPANT WORKBOOK','h2'),text('Trust, Transparency, and AI','workbook-cover'),text('My scholarship review practice, evidence, and next steps.'),artwork(root,'session-concept.png',528),Spacer(1,14),text('October 21, 2026 · 3:30–5:00 PM CT','h2'),text('Miguel Guhlin · NSPA 2026'),text('My name (optional): __________________________________'),text('All cases, records, operational constraints and prepared AI drafts in this workbook are fictional teaching examples. I need no AI account. Each activity includes the material I need; there is no longer essay to find. I can reflect privately or pass on speaking.','small'),text('Illustrations are AI-generated.','small')]
 def add_parts(parts):
  result=[]
  for part in parts:
   if part.startswith('<h3>My example, part by part'):
    result.append(text('My six-part example','h2'))
    result.extend(text(label+': '+words) for label,words in ANATOMY)
    continue
   tree=html.fragment_fromstring(part,create_parent='div')
   for node in tree.iter():
    words=node.text_content().strip()
    if node.tag in ['h3','h4']:result.append(text(words,'h2'))
    elif node.tag in ['p','li'] and words!='Example instruction to the AI assistant':result.append(text(words))
    elif node.tag=='summary':result.append(text(words,'h2'))
    # The six examples already print every part of the assembled copy block.
  return result
 for x in ACTIVITIES:
  if x['id']=='pulse':
   story += [PageBreak(),text(x['title'],'h1'),text('Slides '+x['slides']+' · '+str(x['minutes'])+' minutes'),text(x['goal'])]+add_parts(x['parts'])+lines('My notes and decision',3)
   continue
  split=next(i for i,part in enumerate(x['parts']) if part.startswith('<h3>My conversation'))
  before=[part for part in x['parts'][:split] if '<pre ' not in part]
  work=x['parts'][split]
  after=[part for part in x['parts'][split+1:] if not part.startswith('<h3>What I keep')]
  story += [PageBreak(),text(x['title'],'h1'),text('My case and reference · Slides '+x['slides']),text(x['goal'])]+add_parts(before)
  if x['id']!='prompt':story+=lines('What I notice before our conversation',3)
  story += [PageBreak(),text(x['title'],'h1'),text('Our conversation and my decisions · '+str(x['minutes'])+' minutes')]+add_parts([work])+lines('My response',5)+[text(x['output'],'small')]+add_parts(after)
 return story
