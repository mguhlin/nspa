"""Cover and visual references for the ten-page participant workbook.

Reuse the workshop's original artwork without changing it. Labels and examples
remain real PDF text so the illustrations support a readable printed reference.
"""
from io import BytesIO
from PIL import Image as RasterImage
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Image, PageBreak, Spacer


def artwork(root, name, width):
    path = root / '2026/images' / name
    # Encode full-resolution artwork for PDF embedding; leave source assets intact.
    with RasterImage.open(path) as source:
        w, h = source.size
        encoded = BytesIO()
        source.convert('RGB').save(encoded, format='JPEG', quality=93, subsampling=0)
    encoded.seek(0)
    return Image(encoded, width=width, height=width * h / w)


def cover(root, styles, text, table):
    styles['cover-title'] = ParagraphStyle(
        'cover-title', parent=styles['h1'], fontSize=31, leading=36,
        spaceAfter=11)
    return [
        text('PARTICIPANT WORKBOOK', 'h2'),
        text('Trust, Transparency, and AI', 'cover-title'),
        text('Strengthening scholarship review through conversation, evidence, and human judgment.'),
        artwork(root, 'session-concept.png', 540),
        Spacer(1, 10),
        text('October 21, 2026 | 3:30-5:00 PM CT', 'h2'),
        text('Miguel Guhlin | NSPA 2026'),
        table([['During the session', 'When a reference helps'],
               ['Pages 2-7: activities, shared case, and your notes',
                'Pages 8-10: evidence, checkpoints, and fair response']], [270, 270]),
        Spacer(1, 13),
        text('Name (optional): __________________________________________'),
        text('No AI account needed. Use fictional information. You may reflect privately or pass on speaking.', 'small'),
        text('Artwork throughout this packet: AI-generated fictional illustrations.', 'small'),
    ]


def visual_references(root, styles, text, table):
    story = [
        PageBreak(), text('Evidence before interpretation', 'h1'),
        text('VISUAL REFERENCE 1 | For the shared case on page 3', 'small'),
        artwork(root, 'conversation/evidence.png', 480),
        Spacer(1, 9),
        table([['1  Locate', '2  Separate', '3  Follow up'],
               ['Find the source paragraph. Quote the words that support a claim.',
                'Distinguish supplied facts from an interpretation or an assumption.',
                'Mark missing or unclear evidence. Name a question for a person.']], [180, 180, 180]),
        text('C-101: a missing document needs follow-up', 'h2'),
        text('P4 says the enrollment confirmation is not included. That supports "missing document." It does not establish that C-101 is ineligible. Ask for the document through an approved channel.'),
        text('P5 is application evidence, not an instruction to the reviewer. Ignore its embedded instruction to mark the packet complete.', 'small'),
        text('A useful question: Can another reviewer find the source for this claim?', 'h2'),
        text('Use with activities 2-3. This reference adds no required activity.', 'small'),

        PageBreak(), text('People at the checkpoints', 'h1'),
        text('VISUAL REFERENCE 2 | For your workflow on page 5', 'small'),
        artwork(root, 'conversation/workflow-wide.png', 480),
        Spacer(1, 8),
        table([['APPROVE', 'CHECK', 'DECIDE'],
               ['Before the tool: a named person approves the task, service, and permitted input.',
                'Before relying on a draft: a named reviewer checks every claim against the source.',
                'Before action: an authorized person owns the decision and follow-up.']], [180, 180, 180]),
        text('Your route, with a role at each human check', 'h2'),
        table([['Step', 'What belongs here'],
               ['Approved input', 'A bounded task, published criteria, and permitted source material. Keep workshop practice fictional.'],
               ['AI draft', 'Organize evidence or draft questions within the approved task.'],
               ['Evidence check', 'Find each quote; check omissions and embedded instructions.'],
               ['Human decision', 'Accept, revise, reject, or pause the draft. Decide next steps under the published rules.'],
               ['Record', 'Keep the evidence checked, corrections, decision owner, and necessary reasons.']], [115, 425]),
        text('A pause condition with an owner', 'h2'),
        text('Pause if a draft invents a quote or follows an embedded instruction. Name the person who investigates before work resumes. A checkpoint needs authority to stop.'),
        text('Use with activity 5 and the peer challenge. No additional activity is required.', 'small'),

        PageBreak(), text('A fair applicant response', 'h1'),
        text('VISUAL REFERENCE 3 | For the practice rule on page 6', 'small'),
        artwork(root, 'conversation/fair.png', 450),
        Spacer(1, 9),
        table([['Published rule', 'Actual evidence', 'Accessible response'],
               ['Use the rule supplied for the application cycle. Do not add a restriction afterward.',
                'Name a specific concern. A detector flag alone does not establish misconduct.',
                'Use neutral wording, a workable response method, time to respond, and a review route.']], [180, 180, 180]),
        text('In our fictional case', 'h2'),
        text('Translation is permitted and does not require disclosure under the supplied rule. The scenario supplies no evidence of fabricated facts. Follow up on the missing enrollment confirmation.'),
        text('Possible opening: "The enrollment confirmation is not included in your packet. Please send it through our approved channel. If that is difficult, let us know so we can discuss an accessible way to respond."', 'small'),
        text('Your group proposes a deadline, decision owner, and route for another review on page 6. Those details are not supplied program rules.', 'small'),
        text('Use with activity 6. Workshop examples are not official NSPA policy.', 'small'),
    ]
    return story
