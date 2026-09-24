from content import *
from facilitator import SECTIONS
# Slide wording and layout. Speaker notes below are drawn directly from the speaking guide.
DATA=[
('Trust, Transparency, and AI','Building Responsible Scholarship Review Practices','cover',[], '',[], 'review-team'),
('Three things to take home','Useful starting points for your scholarship program','deliverables', [('A clearer AI request','One task, clear limits, an answer you can check.'),('A plan for checking the work','Name the people who check and decide.'),('A fair way to respond','Explain the rules and invite questions.')], 'Keep your drafts. Adapt them with your colleagues.',['pencil','shield','chat'],None),
('People make the decisions','AI can help organize the information','photo', [('AI can help','Sort information and draft a summary.'),('People check','Compare the answer with the application.'),('People decide','Apply the rules and make the call.')], 'Use only made-up application information today.',['document','search','person'],'review-team'),
('Where are you today?','Mark one blank box beside each statement','readiness',[('Ready to learn','I want to learn how.'),('In progress','I am working on this.'),('Ready to go','I can do this now.')], 'Open the capacity checklist. Pick one statement that matters to you.',['book','pencil','check'],None),
('Give the AI a clear job','Five parts of a request you can check','prompt',[('Task','What should it do?'),('Rules','Which criteria apply?'),('Information','What may it use?'),('Limits','What must it not decide?'),('Answer','How should it show its work?')], 'Ask it to show where each answer came from.',['target','list','document','shield','search'],None),
('Remove the guesswork','A clearer request makes checking easier','compare',[('Too much to guess','“Find our best applicants.”'),('A job we can check','“List required items, show the source, mark gaps, and suggest a follow-up.”')], 'What would the tool still have to guess?',['question','check'],None),
('Activity: improve your request','Five minutes with a partner','timeline',[('2 minutes','Choose one small review task.'),('2 minutes','Write the request and its limits.'),('1 minute','Swap requests. Remove one guess.')], 'Keep your revised request as a workshop takeaway.',['target','pencil','chat'],None),
('Meet our practice applicant','C-101 is entirely fictional','photo',[('P2: a goal','A certificate and a concrete next step.'),('P3: a service example','Helping at a neighborhood repair table.'),('P4 and P5: two checks','A missing document and a trick instruction.')], 'A missing document does not prove someone is ineligible.',['target','person','search'],'applicant'),
('Demo: organize, then check','Build a table of what is present, missing, or unclear','process',[('Give the task','Use the practice request and fictional packet.'),('Get the draft','Ask for facts, paragraph labels, and gaps.'),('Check the answer','Compare every claim with the application.')], 'The tool is not choosing a winner.',['document','list','search'],None),
('What can we support?','A prepared teaching example for checking the live answer','evidence',[('Present','Goal in P2; service example in P3.'),('Missing','Enrollment document: not included in P4.'),('Ignore the trick','P5 cannot change our review instructions.')], 'Correct the table before another reviewer relies on it.',['check','question','shield'],None),
('Activity: check one row','Four minutes with your partner','process',[('Find it','Locate the supporting paragraph.'),('Question it','Look for an added, missing, or mistaken detail.'),('Fix it','Write one correction or follow-up question.')], 'A neat-looking answer still needs to be checked.',['search','question','pencil'],None),
('Use the same scoring guide','Look for stated details, not polished writing','rubric',[('Clear goal','0: no goal | 1: goal | 2: goal + next step'),('Contribution','0: none | 1: named | 2: specific actions'),('Learning or change','0: none | 1: claim | 2: change + experience')], 'If the source is missing or contradictory, ask for more information.',['target','person','book'],None),
('Compare your reasons first','Six minutes before seeing an AI rating','photo',[('2 minutes: on your own','Rate each area and note the supporting detail.'),('2 minutes: with a partner','Compare the reasons behind your ratings.'),('2 minutes: clarify the guide','Rewrite one description that caused confusion.')], 'A useful disagreement can reveal an unclear scoring rule.',['pencil','chat','list'],'pair-review'),
('Demo: compare the AI draft','Use your own ratings as the starting point','process',[('Ask for a draft','A rating, a quote, and a reason.'),('Compare the reasons','Check the paragraph and scoring description.'),('Make the call','Accept, change, or reject. Write down why.')], 'Keep the original human rating and explain any change.',['document','search','person'],None),
('Before using real information','Check the tool, the information, and the people responsible','photo',[('Is this use approved?','Ask the people responsible for privacy and the service.'),('What information is needed?','Share only what this specific task requires.'),('What happens to it?','Check access, storage, deletion, and problem reporting.')], 'Removing a name may not be enough to protect someone.',['shield','document','question'],'privacy-team'),
('Activity: name the checkpoints','Six minutes to map one job','process',[('Before the tool','Who approves the task and information?'),('Before relying on it','Who checks the answer against the application?'),('Before a decision','Who decides and handles a correction?')], 'Finish this sentence: “We will stop and check if ...”',['shield','search','person'],None),
('A detector flag is not proof','Start with the published rule and the actual concern','photo',[('People can be wrongly flagged','AI-written text can also be missed.'),('Results depend on context','The tool, language, and type of writing matter.'),('A person needs to review','A score alone cannot establish wrongdoing.')], 'Never use a detector score alone to deny an award.',['question','document','person'],'fair-conversation'),
('Small error rates affect people','A made-up example, not a claim about a particular detector','math',[('1,000','Essays written entirely by people'),('1%','Assumed rate of incorrect flags'),('10','People wrongly flagged')], 'This does not tell us the chance that a flagged person used AI.',['document','question','person'],None),
('Make the rules clear before people apply','Give examples of what is allowed and what is not','policy',[('Allowed help','Spell out editing, translation, and brainstorming.'),('An explanation','Say when applicants should describe the help used.'),('Not allowed','Define invented experiences and false records.')], 'Include a way to ask questions and request another review.',['check','chat','shield'],None),
('Activity: ask without assuming','Six minutes: a flagged essay and reported translation help','photo',[('Read the published rule','What did applicants actually agree to?'),('Draft a fair question','Ask for an explanation without assuming wrongdoing.'),('Name the next person','Who reviews the concern or a request for another look?')], 'Translation help, writing style, and a flag are not proof of dishonesty.',['document','chat','person'],'fair-conversation'),
('Choose a skill to work on','Six sections in your capacity checklist','matrix',[('Where AI fits','Writing clear requests'),('Using a scoring guide','Protecting information'),('Responding fairly','Trying a small change')], 'Use the resource links beside each section for your next step.',['target','list','chat'],None),
('Activity: mark, choose, and plan','Five minutes to choose something you can use','process',[('Mark today','Ready to learn, in progress, or ready to go?'),('Choose one statement','What would help your work most?'),('Write a next step','Add a question, a small action, and a date.')], 'Export or print your checklist and plan to keep a copy.',['check','target','pencil'],None),
('Try one small change this month','Start with made-up applications','timeline',[('Week 1','Choose the task, people, and checks.'),('Week 2','Try it. Keep a record of errors and corrections.'),('Weeks 3-4','Review what happened. Adjust, stop, or seek approval.')], 'Decide what success looks like and when you would pause.',['target','search','chat'],None),
('What will you take back?','Three minutes: write, share, and choose','photo',[('One clearer request','What will you ask the AI to do differently?'),('One check','Where will a person check or pause the work?'),('One rule to clarify','What should applicants know before they apply?')], 'Choose a next step you can explain to a colleague.',['pencil','shield','chat'],'pair-review'),
('Keep the materials close','Questions and next steps','close',[('Your workshop hub','mguhlin.github.io/nspa/2026/'),('Take it with you','Slides, practice activities, handouts, and your checklist.')], 'Thank you for the work you do for scholarship applicants.',['book','chat'],'review-team'),
('Sources and scope','Workshop examples to discuss and adapt','sources',[('NIST: 2024','Guidance on checking and managing AI risks.'),('Turnitin: reviewed Sept. 2026','How to interpret its AI-writing indicator.'),('Research: 2023 and 2026','Detector findings depend on the study context.')], 'Follow the source links in the hub and recheck guidance before use.',['book','search','document'],None)
]
# Each facilitator item is assigned to exactly one slide. The PDF and PPTX share the same words.
# A whole spoken section may span two visual slides; the cue tells the presenter when to advance.
ASSIGN=[
 (0,[[0],[ ],[1],[2,3,4]]),
 (1,[[0],[1],[2,3,4]]),
 (2,[[0],[1,2],[3,4],[5]]),
 (3,[[0],[1,2],[3,4]]),
 (4,[[0],[1,2,3]]),
 (5,[[0],[1],[2],[3,4]]),
 (6,[[0],[1,2],[3]]),
 (7,[[0,1,2],[3,4,5,6]])
]
SLIDES=[]
for title,subtitle,layout,blocks,action,icons,photo in DATA:
 SLIDES.append(dict(title=title,subtitle=subtitle,layout=layout,blocks=blocks,action=action,icons=icons,photo=photo,art=None,notes='',sources=[]))
pos=0
for section_index,groups in ASSIGN:
 section=SECTIONS[section_index]
 for group in groups:
  parts=[section['parts'][i] for i in group]
  notes=section['time']+'\nFacilitator guide: '+section['title']+'\n\n'
  notes+='\n\n'.join(label+' | '+('SAY THIS' if kind=='say' else 'PRESENTER CUE')+'\n'+words for label,kind,words in parts)
  if pos==0:notes+='\n\nPRESENTER CUE: Advance to slide 2 for the paragraph beginning “By five o’clock.”'
  if pos==1:notes+='PRESENTER CUE: Continue the opening from slide 1. The three takeaways shown here match the final paragraph of the welcome.'
  if pos==4:notes+='\n\nPRESENTER CUE: Advance to slide 6 when comparing “Find our best applicants” with the clearer request.'
  if SLIDES[pos]['photo']:notes+='\n\nVISUAL: AI-generated photograph of fictional people, not a real applicant or conference attendee.'
  SLIDES[pos]['notes']=notes;pos+=1
# Split the welcome across its two slides without changing its wording.
opening=SECTIONS[0]['parts'][0][2].split('\n\n')
SLIDES[0]['notes']=SECTIONS[0]['time']+'\n3:30-3:33 | Welcome | SAY THIS\n'+'\n\n'.join(opening[:2])+'\n\nPRESENTER CUE: Advance to slide 2 for the three takeaways.'
SLIDES[1]['notes']=SECTIONS[0]['time']+'\n3:30-3:33 | Welcome, continued | SAY THIS\n'+opening[2]
SLIDES[0]['notes']+='\n\nVISUAL: AI-generated photograph of fictional people.'
SLIDES[25]['notes']='APPENDIX - outside the 90-minute sequence.\nThese sources support the workshop guidance. The application, scoring guide, checklist, and policy starter are teaching examples, not validated selection instruments or official NSPA policy. The detector studies do not establish one error rate for all tools or settings. Recheck the linked guidance before the conference.'
for n,ids in {15:[0],16:[0],17:[1,2,3],20:[1],26:[0,1,2,3]}.items():SLIDES[n-1]['sources']=ids
# Human-readable script stays independently useful; JSON feeds PPTX notes and accessible transcript.
if __name__=='__main__':
 (ROOT/'docs/workshop-slide-map.json').write_text(json.dumps(SLIDES,indent=2)+'\n')
 print('Slides:',len(SLIDES),'| facilitator sections:',len(SECTIONS))
