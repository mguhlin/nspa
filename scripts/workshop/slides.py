from content import ROOT, json, SOURCES
from facilitator import SECTIONS
from resources import links_for_slide
CORE_COUNT=12

def slide(title,subtitle,layout,blocks,action,art=None,photo=None,sources=()):
 return dict(title=title,subtitle=subtitle,layout=layout,blocks=blocks,action=action,art=art,photo=photo,icons=[],sources=list(sources),notes='')

SLIDES=[
 slide('Trust, Transparency, and AI','Building Responsible Scholarship Review Practices','cover',[], '',photo='review-team'),
 slide('What makes a review worthy of trust?','Think of a moment when a review built or weakened trust','split', [('1 minute alone','What happened? What mattered?'),('2 minutes each','Listen for your partner’s perspective.'),('One quality to protect','What should your process make possible?')], 'What would an applicant need to experience?',art='conversation/conversation'),
 slide('How will we learn from each other?','A conversation we can carry into our work','panorama',[('Think quietly','Form your own reading.'),('Share perspectives','Hear another reason.'),('Examine the difference','Ask what led them there.'),('Revise the practice','Keep or change your judgment.')], 'Growth matters when it changes what we do.',art='conversation/learning-wide'),
 slide('What could a polished summary hide?','Can I stretch your thinking a little?','split',[('A prepared draft','A clear answer can still miss evidence.'),('The source packet','What does the draft ask us to assume?')], 'What would you check before someone relied on it?',art='conversation/evidence',sources=[0]),
 slide('One application, different readings','C-101 is our fictional case throughout the session','split',[('A goal','A water systems certificate and a next step.'),('A contribution','A repair table and a change to its queue.'),('An open question','The enrollment document is missing.')], 'Read P1–P5 on your own before comparing interpretations.',photo='applicant'),
 slide('What do you see that I might miss?','Does the change in P3 meet our reflection or adaptation criterion?','split',[('3 minutes alone','Choose a rating. Underline the evidence.'),('2 minutes each','Explain the reason. Listen for a difference.'),('3 minutes together','Clarify one scoring description.')], 'Which detail led you there?',art='conversation/perspectives'),
 slide('What are you reconsidering?','A little silence before we move on','silence',[('2 quiet minutes','What assumption changed? What question remains?')], 'Share only what you choose.',art='conversation/reflection'),
 slide('Where does our process need a person?','One task, named people, a reason to pause','panorama',[('Before the tool','Approve the service and permitted input.'),('Before relying on it','Check each claim against the source.'),('Before a decision','Name the person who decides and corrects.')], 'We will pause if ...',art='conversation/workflow-wide',sources=[0]),
 slide('What might another team question?','A useful challenge can change our strategy','split',[('2 minutes per group','Explain your route. Invite one question.'),('2 minutes to revise','Which assumption needs another look?')], 'What changed because someone challenged your thinking?',photo='pair-review'),
 slide('What would a fair response sound like?','C-101 reports translation help after a detector flag','split',[('Our published practice rule','Translation help is permitted. Facts must be accurate.'),('Our question','What concern, if any, do these facts justify?')], 'A detector flag alone does not establish misconduct.',art='conversation/fair',sources=[1,2,3]),
 slide('How might it feel to receive our question?','Draft, listen from the applicant’s perspective, then revise','split',[('3 minutes to draft','Explain the actual question clearly.'),('3 minutes to listen','What feels assumed? How could I respond?'),('2 minutes to revise','Offer an accessible response route.')], 'No policy concern? Follow up on the missing document.',photo='fair-conversation'),
 slide('What will you try, and who will help you learn?','One change to your review practice in the next 30 days','panorama',[('One action','What quality of trust will it protect?'),('One learning partner','Who will question and reflect with you?'),('Evidence and a date','What would show improvement or a need to pause?')], 'Your plan and the full resource library: mguhlin.github.io/nspa/2026/',art='conversation/change-wide'),
 slide('A request we can check','Optional reference A. Use when a question calls for it.','panorama',[('Task','What should it do?'),('Criteria','Which published rules?'),('Evidence','Which supplied sources?'),('Limits','Which decisions stay human?'),('Output','How can we check it?')], 'Keep gaps visible. Require source paragraphs.',art='infographics/prompt-parts',sources=[0]),
 slide('A scoring description we can discuss','Optional reference B. Reflection or adaptation in P3.','panorama',[('0','No learning or adaptation stated.'),('1','A learning claim without an example.'),('2','A specific change connected to an experience.')], 'Compare human reasons before viewing an AI rating.',art='infographics/evidence-check'),
 slide('Approval before real applicant information','Optional reference C. Local owners approve the actual use.','split',[('The service and settings','Access, storage, retention, deletion, and training use.'),('The minimum information','Removing a name can leave identifying details.'),('The people responsible','Approval, incident response, and correction.')], 'Practice with fictional data until the real use is approved.',photo='privacy-team',sources=[0]),
 slide('A detector result needs context','Optional reference D. A signal cannot settle a policy question.','panorama',[('What the indicator describes','Flagged qualifying prose, not a misconduct probability.'),('What the studies establish','Findings depend on the language, sample, and detector.'),('What people must decide','The published rule, evidence, and a fair response.')], 'Never deny an award using a detector score alone.',art='infographics/policy',sources=[1,2,3]),
 slide('Resources for the question that comes next','Optional reference E. Choose what helps your practice.','panorama',[('Your conversation notes','The workbook and guided companion.'),('A reference when needed','Prompts, privacy, fairness, and readiness.'),('The full library','All infographics, guides, and earlier sessions.')], 'mguhlin.github.io/nspa/2026/',art='infographics/takeaways'),
 slide('Sources and scope','Optional reference F. Reviewed October 7, 2026.','sources',[('NIST, 2024','Generative AI risk management and oversight.'),('Turnitin guidance','Interpretation of its AI-writing indicator.'),('Research, 2023 and 2026','Different study contexts and qualified findings.')], 'Fictional cases and workshop tools. Adapt with your local owners.',sources=[0,1,2,3])
]
for i,s in enumerate(SLIDES,1):
 if i<=CORE_COUNT:
  section=SECTIONS[i-1]
  s['notes']=section['time']+'\n\n'+'\n\n'.join(label+' | '+('SAY THIS' if kind=='say' else 'PRESENTER CUE')+'\n'+words for label,kind,words in section['parts'])
 else:
  s['notes']='OPTIONAL APPENDIX. Outside the timed 90-minute route. Use this reference only when it serves a participant question. Keep the core conversation time intact.\n\n'+ '\n\n'.join(h+': '+p for h,p in s['blocks'])
  if i==14:s['notes']+='\n\nP3 connects a queue problem to a specific change. A rating of 2 is defensible under this practice description. If your team expects explicit reflective language, clarify the description before real reviews. Missing or contradictory source evidence requires follow-up. This teaching rubric is not a validated award-selection instrument.'
  if i==16:s['notes']+='\n\nTurnitin advises against using its indicator as the sole basis for action. Liang et al. (2023) found disparities in the samples and detectors they tested. Al Ali et al. (2026) found no systematic non-native-speaker bias across the detector families in their Czech-writing study. These studies do not supply one universal detector error rate.'
 if s['photo']:s['notes']+='\n\nVISUAL: AI-generated photograph of fictional people, not a real applicant or conference attendee.'
 if s['art']:s['notes']+='\n\nVISUAL: AI-generated teaching illustration. Labels and instructional text are separately typeset.'
 s['links']=links_for_slide(i)
 if s['links']:s['notes']+='\n\nOPEN FROM THIS SLIDE:\n'+'\n'.join(x['label']+': '+x['url'] for x in s['links'])
 if s['sources']:s['notes']+='\n\nSOURCES:\n'+'\n'.join(SOURCES[n][0]+': '+SOURCES[n][1] for n in s['sources'])
if __name__=='__main__':
 (ROOT/'docs/workshop-slide-map.json').write_text(json.dumps(SLIDES,indent=2)+'\n')
 print(f'{CORE_COUNT} core slides, {len(SLIDES)-CORE_COUNT} optional references')
