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
    ('3:30–3:38', '1–4', 'Choose a starting point', 'capacity-matrix.html', 'Choose one readiness area. What would you like to feel more comfortable doing?', 'One starting goal'),
    ('3:38–3:50', '5–7', 'Write the request', 'practice.html#prompt', 'What would the tool still have to guess? Help a partner remove one guess.', 'A clearer request'),
    ('3:50–4:05', '8–11', 'Check the application', 'practice.html#packet', 'What is missing in P4? What should happen to the instruction in P5?', 'Evidence and a follow-up'),
    ('4:05–4:20', '12–14', 'Compare ratings', 'practice.html#rubric', 'Which words support your rating? Compare human reasons before showing the AI draft.', 'Ratings and reasons'),
    ('4:20–4:30', '15–16', 'Name the checkpoints', 'practice.html#workflow', 'Who approves the input, checks evidence, decides, and records? When do we pause?', 'Owners and a stop rule'),
    ('4:30–4:45', '17–20', 'Respond fairly', 'practice.html#policy', 'Which published rule and evidence justify a concern? Ask without assuming wrongdoing.', 'A neutral response'),
    ('4:45–4:55', '21–23', 'Plan one small change', 'capacity-matrix.html#plan-title', 'What will you try, who owns it, and what evidence would show progress?', 'A 30-day plan'),
    ('4:55–5:00', '24–25', 'Share and close', 'practice.html#action', 'Share one prompt change, one human check, and one rule to clarify.', 'An exit ticket'),
]
