"""Participant activities and speaking text for the supplied October 20 deck.

Slide references are positions in the 28-slide file, including resource screens.
The original PowerPoint and its supplied notes are preserved unchanged.
"""
from html import escape as E

TITLES = [
    'Session resources', 'Trust, Transparency, and AI', 'Your first judgment',
    'AI authority in the review process', 'Task sorting with a safeguard',
    'Two gates before an upload', 'Session resources', 'A prompt reviewers can check',
    'A prompt repair lab', 'A shared scoring anchor', 'An evidence audit',
    'A reviewable handoff', 'A fairness calibration', 'The review path and its owners',
    'Applicant use boundary sort', 'What an AI detector can get wrong',
    'A flagged essay case conference', 'A documented response to a concern',
    'Policy language people can use', 'A policy drafting lab',
    'Sample response for applicants', 'Sample response for reviewers',
    'Sample response for concerns', 'A four-week pilot',
    'Your next review-cycle decision', 'Take-home review prompt',
    'Resources for your team', 'Session resources',
]

# The activity slide itself, rather than a later debrief or sample answer.
ACTIVITY_SLIDES = {
    'judgment': 3, 'sorting': 5, 'prompt': 9, 'audit': 11,
    'calibration': 13, 'boundaries': 15, 'conference': 17,
    'policy': 20, 'commitment': 25,
}

CUES = [
    'Arrival and resource screen', 'Welcome · 1 minute',
    'Activity 1 · 2 minutes · Individual vote, then pairs',
    'Discuss · 2 minutes', 'Activity 2 · 3 minutes · Pairs',
    'Discuss · 3 minutes', 'Resource reminder', 'Discuss · 2 minutes',
    'Activity 3 · 4 minutes · Pairs', 'Introduce the rubric · 2 minutes',
    'Activity 4 · 5 minutes · Pairs', 'Debrief · 3 minutes',
    'Activity 5 · 4 minutes · Individual, then pairs', 'Discuss · 2 minutes',
    'Activity 6 · 4 minutes · Small groups', 'Discuss · 2 minutes',
    'Activity 7 · 4 minutes · Groups of three', 'Debrief · 2 minutes',
    'Discuss · 2 minutes', 'Activity 8 · 6 minutes · Small groups',
    'Activity 8 sample · Within the policy discussion',
    'Activity 8 sample · Within the policy discussion',
    'Activity 8 sample · Within the policy discussion',
    'Discuss · 2 minutes', 'Activity 9 · 2 minutes · Individual, then pairs',
    'Take-home reference', 'Take-home reference', 'Closing resource screen',
]

SAY = [
    """Welcome. The QR code takes you back to the workshop resources. You can download the workbook, presentation, and takeaways now or return to them later. The companion also lets you keep your own notes. We will use fictional examples today, so you do not need an applicant record or an AI account. Keep the workbook or a blank page nearby, and find someone you can talk with during the activities.""",
    """Today we will look at where AI can help a scholarship team and where a person needs to remain responsible. By the end, I want you to have one limited task to test, a specific evidence check, and policy language your team can discuss. Our cases, rubric, and sample outputs are fictional teaching examples. We have a 60-minute core with 30 more minutes available for practice and discussion. You can participate on paper or in the companion. You do not need to run a live AI tool.""",
    """Start with your own judgment. Which task gives AI the most influence over who receives an award: flagging a missing transcript, summarizing leadership evidence, or ranking finalists? Choose A, B, or C, then tell a partner what could go wrong. I will take two responses. Ranking finalists puts the model closest to the award decision. A summary can also change a decision by leaving out evidence or adding a claim. Even a missing-document flag needs a person to check the actual requirements and exceptions. What would you need to verify before acting?""",
    """Here is a boundary we can discuss for local practice. AI may assist with organizing files and inventories. When it maps quotations to a rubric, someone needs to check the source and the match. People remain responsible for awards, exceptions, and appeals. This is a suggested workshop boundary that your organization can adapt to its requirements. The question is who has authority to approve the work, correct an error, and stop the process. Keep those responsibilities in mind as we sort some tasks.""",
    """With a partner, assign each task to ASSIST, CHECK, or HUMAN. Then add a safeguard that someone could actually carry out. You have two minutes, and we will use the last minute to compare one choice you debated. A missing-reference list may fit ASSIST, with staff confirming requirements and exceptions. Linking a quote to a criterion needs CHECK, including the exact wording and location. A deadline waiver and recipient selection need a human decision. A stricter category can make sense if you can explain it. I am listening for a concrete safeguard and an owner.""",
    """Before anything is uploaded, we need two conditions. First, the organization approves the service, the task, and the information involved. Check access, retention, reuse, and how an exposure would be reported. Second, supply only what the task needs. For a rubric check, that may mean an application code, a relevant excerpt, a criterion, and a source pointer. A home address or full birth date usually adds nothing to that task. Removing a name does not guarantee anonymity or make an unapproved tool acceptable. We will keep our workshop examples fictional.""",
    """Here is the resource link again. If you have just joined us, scan the QR code and open the workbook or companion. Keep any real applicant information out of the practice. We are moving from deciding what AI may do to writing a request whose result a reviewer can check.""",
    """A checkable prompt makes four things visible: the task, the source, the evidence requirement, and the limit on AI authority. Use one excerpt and one published criterion. Supply the actual rubric and ask for an exact quote, a location, and any missing evidence. State that the tool must not infer personal traits, rank applicants, or recommend awards. Those instructions help us inspect the response, but they do not guarantee it will be correct. A person still checks the source. The take-home prompt gives you a fuller version to adapt later.""",
    """Here is our weak request: Review all applications and choose the strongest students. With your partner, replace it with something a reviewer could inspect. Name one criterion and the text it comes from. Ask for a quote and a gap. Limit what AI may decide. Use the fictional community-engagement rubric in your workbook, or a criterion you can state precisely. Take two minutes to write, then exchange with another pair for one minute. Could you verify every requested output? We will finish with one useful repair. Keep real application information out of this exercise.""",
    """For the next two cases, we all need the same anchor. This is an invented teaching rubric. Zero means no relevant activity appears. One means an activity is named but the applicant's role is unclear. Two means the contribution is specific. Three requires a specific contribution and a supported result. To choose three, we must actually find evidence of a result. Smooth writing or a prestigious activity does not supply that missing evidence. A statement in an application is still applicant-reported. Real scholarship programs should use their own published criteria and anchors.""",
    """Read A17, paragraph two, and the sample AI summary. Take one quiet minute to mark what the excerpt supports. Then compare with your partner, rewrite the summary, and choose an anchor. We will debrief after five minutes. The source supports organizing twelve weekend tutoring sessions and recruiting two volunteers. It does not establish founding a program, serving 120 students, or improving grades by twenty percent. Strong leadership is also an unsupported trait judgment here. Under our teaching anchor, two out of three fits the specific contribution. What evidence would show the result of those sessions?""",
    """Here is a handoff someone else can inspect. It keeps a quotation, the source location, and an unanswered question together. Our provisional reading is two out of three because the role is specific and result evidence is missing. That is a reading of an applicant-reported excerpt, not independent verification of the event or an award recommendation. The full quotation also mentions recruiting two volunteers. A reviewer should be able to return to paragraph two and see that. Which part of this record would help the next person catch an error?""",
    """Score A and B independently using the same anchor. Then compare with your partner. Did your scores differ, and which evidence explains the difference? Both describe coordinating twelve tutoring sessions and recruiting two volunteers. Neither supplies evidence of a result. Under this teaching rubric, both support two out of three. If we scored them differently because of vocabulary or polish, we need to examine that judgment. This one exercise does not establish that a workflow is fair. It shows why we should test varied fictional cases, compare omissions and judgments, correct the process, and retest.""",
    """Now put an owner at each step. Staff receive the materials and check requirements and exceptions. They confirm approval and minimize the data. Approved assistance may organize files and map quotations. A reviewer verifies that work and corrects the record. The committee then makes the decision, records reasons, and keeps a reconsideration route. At each handoff, ask who can correct an error. When you return to your team, replace the general word staff with the actual role responsible for that step.""",
    """In a small group, sort four applicant uses: permit, prohibit, or needs a clearer local rule. Proofreading a truthful draft and translating an applicant's own statement may be allowed under your policy. Inventing an achievement conflicts with truthful claims. Drafting most of an essay from truthful notes raises a separate question about authorship assistance. Decide what your proposed policy would require applicants to disclose. There is no universal disclosure rule in this exercise. Use two minutes to sort, one to decide disclosure, and one to share. Mark any choice your organization still needs to resolve.""",
    """A detector can flag human-written text, and it can miss AI-generated text. These are possible classification errors, not measured rates shown by this illustration. A flag by itself cannot establish authorship or a policy violation. An unflagged result cannot prove authorship either. Turnitin's guidance cautions that its report should not be the sole basis for adverse action against a student. Here we are applying that caution to a suggested scholarship-review practice. Return to the actual evidence and the published rule before deciding what to do.""",
    """Form a group of three: reviewer, applicant, and policy observer. In this fictional case, a detector flags the essay, while activities and references agree. The published rule allows proofreading and requires truthful claims. It says nothing about translation or disclosure. Decide the next action, the evidence needed, and one neutral question. You have thirty seconds to read, two minutes to discuss, and ninety seconds to report. A question could be: Can you describe the help you used and how you checked the claims? Do not assume misconduct or add a disclosure requirement after submission.""",
    """Our suggested response starts by pausing automatic penalties. Check the source evidence and the rule that applicants could read. Invite clarification when appropriate, and record the human decision with its reasons and reconsideration route. Someone needs authority to correct a mistaken record. Use consistent, proportionate steps across cases. The detector score does not decide the outcome. What would your team need to document so another person could understand both the concern and the reason for the response?""",
    """The first rule leaves applicants guessing about what counts as AI-generated. The more specific example names brainstorming, outlining, and proofreading. It asks applicants to write their own statement, verify claims, and disclose the tool and type of help. It also explains human review and reconsideration. This is illustrative language for local adaptation. Your organization still needs to decide about translation, where disclosure goes, who handles questions, and which deadlines apply. Publish those choices before applications open. We will now turn them into sentences someone can use.""",
    """Write three sentences with your group. For applicants, name allowed help, truthful work, and disclosure. For reviewers, name the approved task and service, the evidence check, and the owner. For concerns, explain evidence review, clarification, and reconsideration. Spend three minutes writing, then two minutes exchanging and revising with another group. We will use the last minute to hear one useful example. Mark one unresolved local choice. The next three slides offer samples for comparison. Ask whether a new applicant or staff member could act on your sentence without guessing.""",
    """Here is one applicant example. You may use AI to brainstorm, outline, or proofread, but you must write your own statement, verify each claim, and disclose the tool and type of help. It names the assistance, keeps responsibility for the statement and claims with the applicant, and explains what disclosure includes. Your organization still needs to say where and when that disclosure happens. Compare this with your sentence. Which choice would you need to make before publishing it?""",
    """This reviewer example limits assistance to evidence extraction in an approved service. It gives the assigned reviewer responsibility for checking every quote and source before the committee acts. Those details make the rule usable: a task, a service boundary, a check, and an owner. Your team still needs to name the actual service and assign the reviewer. If a quotation or source cannot be verified, the committee should not rely on it. What would make that responsibility clear in your own process?""",
    """For concerns, the sample starts with the evidence and the published rule. It allows clarification when appropriate and gives a contact for reconsideration. That makes the next step visible to both staff and applicants. Your organization needs to fill in the contact, review steps, and response timeline. Compare your draft with this example. Could a person tell how to raise a question, what staff would check, and how to request another review?""",
    """Here is an illustrative four-week pilot. In week one, choose one limited task and one owner. In week two, test fictional cases and log errors. In week three, compare the results, correct the workflow, and retest. In week four, decide whether to proceed, revise, or stop. Agree on success criteria before the test. Faster work with unacceptable errors is not ready to advance. Before any real applicant information is used, confirm approval for the service and data, verification ownership, retention, and readiness of the published rules.""",
    """Write a commitment a colleague could follow. Name one task you will test, the specific check a person must perform, and who will do it by what date. Take one minute to write and one to share with a partner. If a pilot is premature, clarifying a published rule or identifying the service owner is a valid next task. Take your three policy sentences back to your team. What evidence would help you trust the process enough to continue, and what error would make you pause?""",
    """This take-home prompt is a starting point. Supply the excerpt, the published criterion and anchors, an application code, and a source pointer. Ask for an exact quote, its location, missing evidence, and a neutral follow-up question. If the evidence is absent, the response should say not provided. Keep the boundary explicit: no invented facts, trait inferences, rankings, or award recommendations. A person verifies each finding before it is used. Use fictional information for practice and your organization's authorized service and information for any approved work.""",
    """These are starting points for a local discussion. The NIST Generative AI Profile is a voluntary risk-management resource. Turnitin explains its writing report and the need for human judgment about possible misclassification. Pair these references with your organization's published rules and approved-tool requirements. Our cases, sample summary, rubric, policy language, and four-week plan are teaching examples. Use them with the colleagues who own the actual process, and adapt them before any real use.""",
    """Scan the QR code to return to the handouts, or save the workshop address now. You can keep the workbook, presentation, takeaways, and your companion notes. Before you leave, share your next task and human check with a colleague. Bring the unresolved policy choices back to the people who can decide them. Thank you for working through the evidence and the decisions together.""",
]

RUBRIC = [('0', 'No relevant activity described'),
          ('1', 'Activity named, but the applicant’s role is unclear'),
          ('2', 'Applicant’s contribution is specific'),
          ('3', 'Specific contribution and a supported result')]
EXCERPT = 'I organized 12 weekend tutoring sessions for sixth graders and recruited two volunteers.'
BAD_SUMMARY = 'Founded a program serving 120 students. Improved grades by 20%. Strong leadership. Score: 3 of 3.'
CALIBRATION = [('A', 'I coordinated twelve weekend tutoring sessions for grade-six learners and recruited two volunteers.'),
               ('B', 'I set up 12 weekend tutoring days for sixth graders. I got two volunteers to help.')]
POLICY_SAMPLES = [
    ('Applicants', 'You may use AI to brainstorm, outline, or proofread, but you must write your own statement, verify each claim, and disclose the tool and type of help.'),
    ('Reviewers', 'Use only the approved service for evidence extraction, and the assigned reviewer must verify each quote and source before the committee acts.'),
    ('Concerns', 'Staff review the evidence and published rule, invite clarification when appropriate, and provide a contact for reconsideration.'),
]
PROMPT = """Using only the supplied excerpt and published rubric, compare the evidence with one criterion. Return a table containing the criterion, an exact quotation, the quotation's source location, missing evidence, and one neutral follow-up question. If evidence is absent, write 'not provided.' Do not invent facts, infer personal traits, rank applicants, or recommend awards. A human reviewer will verify each quote, source, and connection to the rubric before any use.

Application code: [code]
Source pointer: [document and paragraph]
Approved excerpt: [text]
Published criterion and scoring anchors: [rubric]"""

def para(text):
    return '<p>'+E(text)+'</p>'

def table(headers, rows):
    return '<div class="table-scroll"><table><thead><tr>'+''.join('<th scope="col">'+E(t)+'</th>' for t in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+E(t)+'</td>' for t in row)+'</tr>' for row in rows)+'</tbody></table></div>'

def quote(text):
    return '<blockquote>'+E(text)+'</blockquote>'

def rubric():
    return para('Fictional teaching rubric: community engagement. Use these same anchors for both cases. A real program uses its published rubric.')+table(['Points','Evidence in the supplied excerpt'], RUBRIC)

def activities():
    return [
      ('judgment', 'Your first judgment', 'Slide 3 · 2 minutes · Individual, then pairs',
       para('Which task gives AI the most influence over who receives an award?')+table(['Choice','Task'], [('A','Flag a missing transcript'),('B','Summarize evidence of leadership'),('C','Rank the finalists')])+para('Choose A, B, or C. Tell a partner what could go wrong and what a person would need to check.'),
       'My choice, the risk I see, and the evidence I would check'),
      ('sorting', 'Task sorting with a safeguard', 'Slides 4–6 · Activity 2 · 3 minutes · Pairs',
       para('Assign ASSIST, CHECK, or HUMAN to each task. Add a specific safeguard and the person responsible.')+para('ASSIST: AI helps organize routine information. A person confirms requirements and exceptions before acting on the result.')+para('CHECK: AI suggests an evidence match or interpretation. A reviewer verifies each quotation, source location, and rubric match before using it.')+para('HUMAN: A person makes the judgment or decision, including awards, exceptions, and appeals. AI does not make that decision.')+para('A safeguard is a concrete check or limit. The owner is the person who carries it out. For example: the program coordinator checks a missing-document flag against the application requirements before contacting the applicant.')+table(['Fictional task','My category','Safeguard and owner'], [(t,'','') for t in ['List applications missing a reference','Link an essay quote to a rubric criterion','Decide whether to waive a deadline','Select the scholarship recipients']])+para('Before an upload, both gates must be satisfied: approved use (tool, access, retention, reuse, and response plan) and only needed data (code, excerpt, criterion, and source pointer).'),
       'One classification we debated and the safeguard we chose'),
      ('prompt', 'A prompt repair lab', 'Slides 8–10 · Activity 3 · 4 minutes · Pairs',
       quote('Review all applications and choose the strongest students.')+para('Replace this weak request. Name one criterion and its source. Ask for a quote, its location, and a gap. Limit what AI may decide. Exchange prompts and check whether each requested output can be verified.')+rubric()+para('Practice input: fictional A17, paragraph 2. '+EXCERPT),
       'My repaired prompt with the task, source, evidence requirement, and boundary'),
      ('audit', 'An evidence audit', 'Slides 10–12 · Activity 4 · 5 minutes · Pairs',
       rubric()+para('Applicant excerpt: fictional A17, paragraph 2.')+quote(EXCERPT)+para('Intentionally fabricated sample AI summary:')+quote(BAD_SUMMARY)+para('Mark supported and unsupported claims. Rewrite the summary, choose a scoring anchor, and write a neutral follow-up question. Preserve the quote and source pointer in your handoff.'),
       'Supported claims, corrected summary, anchor and reason, and my follow-up question'),
      ('calibration', 'A fairness calibration', 'Slide 13 · Activity 5 · 4 minutes · Individual, then pairs',
       rubric()+''.join(para('Excerpt '+a)+quote(b) for a,b in CALIBRATION)+para('Score each excerpt independently, then compare with a partner. Did your scores differ? Which evidence justified the difference? One calibration exercise cannot establish that a workflow is fair.'),
       'My scores for A and B, the evidence, and a difference we need to examine'),
      ('boundaries', 'Applicant use boundary sort', 'Slide 15 · Activity 6 · 4 minutes · Small groups',
       para('Sort each use: permit, prohibit, or needs a clearer local rule. Decide which uses would require disclosure under your proposed policy.')+table(['Case','Fictional use','My decision'], [('A','Proofread the applicant’s truthful draft',''),('B','Translate the applicant’s own statement',''),('C','Invent a community-service achievement',''),('D','Draft most of the essay from truthful notes','')])+para('The local rule must address truthful claims, authorship assistance, translation, and disclosure. Do not assume a universal disclosure requirement.'),
       'Our four classifications, disclosure decision, and one unresolved local choice'),
      ('conference', 'A flagged essay case conference', 'Slides 16–18 · Activity 7 · 4 minutes · Groups of three',
       para('Fictional case: a detector flags an essay. The activities and references agree.')+quote('Published rule: Proofreading is allowed. Claims must be truthful. Translation and disclosure are unspecified.')+table(['Role','Question'], [('Reviewer','What evidence needs checking?'),('Applicant','What neutral question could you answer?'),('Observer','Which published rule applies?')])+para('Agree on the next action and what would justify it. A detector can flag human-written text or miss AI-generated text. A score alone cannot settle eligibility. Pause penalties, check evidence and rules, invite clarification when appropriate, and record reasons and reconsideration.'),
       'Our next action, needed evidence, neutral question, and human decision owner'),
      ('policy', 'A policy drafting lab', 'Slides 19–23 · Activity 8 · 6 minutes · Small groups',
       para('Write one usable sentence for each row. Exchange drafts with another group and revise. Mark one unresolved local choice.')+table(['Focus','My sentence must specify'], [('Applicants','Allowed help, truthful work, and when to disclose'),('Reviewers','Approved task and tool, evidence check, and owner'),('Concerns','Evidence review, clarification, and reconsideration')])+para('A new applicant or staff member should be able to act on each sentence. The presentation and companion include sample responses for comparison after drafting.'),
       'My applicant sentence, reviewer sentence, concern sentence, and unresolved choice'),
      ('commitment', 'Your next review-cycle decision', 'Slides 24–25 · Activity 9 · 2 minutes · Individual, then pairs',
       para('Write a commitment a colleague could follow, then share it with a partner.')+table(['Commitment','My plan'], [('Task','One task we will test'),('Check','A specific finding a person must verify'),('Owner and date','Who will do it and by when')])+para('Suggested four-week pilot: week 1, scope one task and owner; week 2, test fictional cases and log errors; week 3, compare, correct, and retest; week 4, decide whether to proceed, revise, or stop. Confirm tool and data approval before any real use.'),
       'My task, human check, owner, date, success evidence, and pause condition'),
    ]

assert len(TITLES) == len(CUES) == len(SAY) == 28

NOTE_SOURCES = {
    6: [('NIST AI 600-1', 'https://doi.org/10.6028/NIST.AI.600-1')],
    16: [('Turnitin AI Writing Report guidance', 'https://guides.turnitin.com/hc/en-us/articles/22774058814093-Using-the-AI-Writing-Report')],
    27: [('NIST AI 600-1', 'https://doi.org/10.6028/NIST.AI.600-1'),
         ('Turnitin AI Writing Report guidance', 'https://guides.turnitin.com/hc/en-us/articles/22774058814093-Using-the-AI-Writing-Report')],
}

def speaking_notes():
    records=[]
    for i,(title,cue,say) in enumerate(zip(TITLES,CUES,SAY),1):
        text=cue+'\n\n'+say
        if i==26:text+='\n\nCopyable prompt:\n\n'+PROMPT
        if i in NOTE_SOURCES:text+='\n\nSources:\n\n'+'\n\n'.join(t+': '+u for t,u in NOTE_SOURCES[i])
        records.append({'number':i,'title':title,'notes':text})
    return records
