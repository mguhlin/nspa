"""Shared activity order and compact presenter cues for HTML and PDF editions."""

STEPS = [
    ('prompt', 'Write a clear AI request', 'Request', '12 min', 'Keep a revised request with a task, rules, sources, limits, and answer format.'),
    ('packet', 'Check a fictional application', 'Application', '15 min', 'Keep an evidence check, one correction, and a question for a human.'),
    ('rubric', 'Compare ratings using the same scoring guide', 'Ratings', '15 min', 'Keep your independent ratings, supporting paragraphs, and a reason for any change.'),
    ('workflow', 'Map the human review checkpoints', 'Checkpoints', '10 min', 'Keep a workflow with named reviewers and a pause condition.'),
    ('policy', 'Draft a fair applicant AI-use policy', 'Policy', '15 min', 'Keep a policy starter and a neutral follow-up question.'),
    ('action', 'Choose one next step for 30 days', 'Next step', '10 min', 'Keep one action, owner, date, evidence of progress, and stop condition.'),
]

DRAFTS = [
    ('request', 'My revised AI request'),
    ('evidence', 'My evidence check and corrections for C-101'),
    ('rubric', 'My independent ratings, evidence, and scoring-guide changes'),
    ('workflow', 'My workflow, named reviewers, and pause points'),
    ('policy', 'My policy draft and neutral follow-up question'),
    ('exit', 'My clearer request, one human check, and one rule to clarify'),
]

RUN_OF_SHOW = [
    ('3:30–3:40', '1–2', 'Start with trust', 'conversation.html#trust', 'Think quietly, then tell a partner about a review that built or weakened trust. Hear both voices.', 'A quality worth protecting'),
    ('3:40–3:50', '3–4', 'Stretch an assumption', 'conversation.html#tension', 'What could a polished summary hide? Show the prepared draft, then check P4 and P5.', 'One question about evidence'),
    ('3:50–4:10', '5–6', 'Learn from another reading', 'conversation.html#case', 'Read alone, compare reasons, then revise. What did your partner notice that you missed?', 'A reason for changing or keeping a judgment'),
    ('4:10–4:15', '7', 'Make room for reflection', 'conversation.html#reflection', 'Hold two full minutes of silence. What are you reconsidering, and why?', 'A changed assumption or open question'),
    ('4:15–4:35', '8–9', 'Map and challenge a workflow', 'conversation.html#workflow', 'Name the people at three checkpoints. Ask another group to test one assumption. Revise.', 'Named owners and a pause condition'),
    ('4:35–4:50', '10–11', 'Practice a fair response', 'conversation.html#fair', 'Read the published rule. Draft a question, listen from the applicant perspective, and revise.', 'A fair question and response route'),
    ('4:50–5:00', '12', 'Choose one change together', 'conversation.html#change', 'What will you try, with whom, by when? What would show improvement or tell you to pause?', 'One change with a learning partner'),
]

CONVERSATIONS = [
    ('trust', 'What makes a review worthy of trust?', 'Trust', '10 min', 'A quality you want your process to protect.'),
    ('tension', 'What could a polished summary hide?', 'Assumptions', '10 min', 'One question you will ask before relying on a summary.'),
    ('case', 'What do you see that I might miss?', 'Shared case', '20 min', 'A judgment, its evidence, and a reason for keeping or changing it.'),
    ('reflection', 'What are you reconsidering?', 'Reflection', '5 min', 'A changed assumption or a question to carry forward.'),
    ('workflow', 'Where does our process need a person?', 'Checkpoints', '20 min', 'A workflow with named owners, a peer challenge, and a pause condition.'),
    ('fair', 'What would a fair response sound like?', 'Fair response', '15 min', 'A revised question and an accessible response route.'),
    ('change', 'What will you try, and who will help you learn?', 'One change', '10 min', 'One action, a colleague, a date, evidence of improvement, and a stop condition.'),
]
