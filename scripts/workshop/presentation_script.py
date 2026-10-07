"""Export the full first-person speaking route as a presenter-only Markdown file."""
from content import ROOT, SOURCES
from conversation import FLAWED_DRAFT
from facilitator import SECTIONS
from slides import SLIDES, CORE_COUNT

OPTIONAL_WORDS = {
    13: "If you want to try a request after today, choose a small task and make its boundaries clear. Tell the assistant which published criteria to use, which source packet to read, and which decisions stay with people. Ask for a format another reviewer can check: required item, source paragraph, present or missing, and human follow-up. A polished request still needs an evidence check. The prompt reference gives you a starting point to adapt with your team.",
    14: "Here is the practice description we used for reflection or adaptation. P3 describes a queue problem and a specific change the applicant proposed. A rating of two is defensible under this description. If your team expects the applicant to explicitly explain what they learned, discuss and clarify that expectation before reviewing real applications. The point of this example is to make our reasons visible and improve the scoring description together. This is a teaching guide, not a validated award-selection instrument.",
    15: "Before real applicant information goes into a tool, the people responsible in your organization need to approve the actual use. That means the service and its settings, what information it receives, who can access it, how long it is kept, and what happens when something goes wrong. Removing a name can leave identifying details. For a first practice run, use fictional information and a bounded task. Take the protected-workflow reference to the colleagues who own those decisions.",
    16: "A detector result cannot tell us whether an applicant violated a rule. It needs context: what the tool measures, what language and writing it was tested on, and what evidence we actually have. Turnitin advises against treating its indicator as the sole basis for action. The studies in our resources examine different samples and detector families, and their findings should not be turned into one universal error rate. Return to the published rule, the specific concern, and an accessible way for the applicant to respond. A detector score alone should never decide an award.",
    17: "Choose a resource when it helps with a question you are working on. The workshop hub has the conversation companion, workbook, slide PDF, takeaways, and participant download. The Resources menu opens the infographic collection and resource library. Everything remains available on the website. You can return to one reference with a colleague when you are ready to test your change.",
    18: "These are the sources behind the workshop's risk-management and detector discussion. NIST provides a generative AI risk-management framework. Turnitin explains how to interpret its own indicator. The research studies examine particular writing samples, languages, and tools; their findings need that context. Our applicant, practice rule, and scoring guide are fictional teaching examples. Use them to start a local conversation with the people who own policy, privacy, accessibility, and review decisions.",
}


def build():
    blocks = [
        '# Trust, Transparency, and AI\n\nFull presentation script for Miguel Guhlin',
        '**NSPA 2026 | October 21, 2026 | 3:30-5:00 PM CT | 90 minutes**',
        'This is a first-person script to rehearse and adapt. **Say** contains words to speak. **Facilitation cue** contains directions for you. The 12 core slides carry the timed session; slides 13-18 are optional responses to questions.',
        '## Before people arrive',
        '- Open the webdeck and conversation companion. Keep this script and a silent timer beside you.\n- Print the 10-page participant workbook. Page 1 is the cover, pages 2-7 are the activities, and pages 8-10 are optional visual references.\n- Keep the prepared teaching draft ready. No live AI call or participant account is needed.\n- Offer paper, private reflection, written contributions, and passing on speaking.',
        '## The experience to protect',
        'Give people time to form a judgment, hear another perspective, reconsider an assumption, and choose one change to try with a colleague. Keep the conversation focused on one fictional case. Use the infographics when they help participants make meaning; they do not create extra tasks.',
        '## At a glance',
        '| Time CT | Slide | Conversation | Workbook page |\n| --- | --- | --- | --- |\n' + '\n'.join(
            f'| {s["time"].split(" PM")[0]} | {i} | {s["title"]} | {page} |'
            for i, (s, page) in enumerate(zip(SECTIONS, ['1-2', '2', '2', '2', '3', '4', '4', '5', '5', '6', '6', '7']), 1)
        ),
    ]
    for number, section in enumerate(SECTIONS, 1):
        blocks += [f'## Slide {number}: {SLIDES[number-1]["title"]}',
                   f'**{section["time"].replace("| Slides ", "| Slide ")}**']
        for part_number, (label, kind, words) in enumerate(section['parts']):
            blocks.append(f'### {label}\n\n**'+('Say' if kind == 'say' else 'Facilitation cue')+'**\n\n'+words)
            if number == 1 and label == 'Participation and care':
                blocks.append('**Say**\n\nYour workbook activities are on pages two through seven. The three visual references at the back are there when you need them. Start with your own thinking; we will build on it together.')
            if number == 4 and part_number == 0:
                blocks.append('**Say, while showing the prepared draft**\n\nHere is the summary we are going to examine:\n\n> '+FLAWED_DRAFT+'\n\nBefore we check the source, what would you want to verify? Take thirty seconds to notice, then compare one concern with your partner.')

    blocks += [
        '## Optional reference slides: use only when a question calls for one',
        '**Facilitation cue**\n\nThese six slides are outside the 90-minute route. End the core session on slide 12 at 5:00. Keep a reference closed unless it answers a specific question or serves a later conversation.',
    ]
    for number in range(CORE_COUNT + 1, len(SLIDES) + 1):
        blocks += [f'### Slide {number}: {SLIDES[number-1]["title"]}',
                   '**Say**\n\n'+OPTIONAL_WORDS[number]]
    blocks += [
        '## Words to use when the conversation needs a little help',
        '### If nobody answers immediately',
        '**Facilitation cue**\n\nWait at least eight seconds. Offer writing or a pair response. Do not fill the two-minute reflection with narration.',
        '**Say**\n\nTake a little more time. You can write your response, offer a shared observation with your partner, or keep it private. What detail from the case is giving you something to think about?',
        '### If the discussion becomes a debate about tools',
        '**Say**\n\nLet’s bring that back to the review task. What would a person need to check before relying on this answer? Which quality of trust would our choice protect? We can keep the tool question for the resources afterward.',
        '### If someone asks for the correct rating',
        '**Say**\n\nShow us the words that support your judgment and the scoring description you used. If we are interpreting that description differently, what should we clarify before reviewing a real applicant?',
        '### If someone wants to use a real applicant example',
        '**Say**\n\nLet’s keep this example fictional. You can describe the process question without identifying information, or we can test it against C-101.',
        '### If the session is running behind',
        '**Facilitation cue**\n\nShorten whole-room reporting and extra examples. Keep independent thinking, the two-minute silence, and the fair-response discussion. Begin slide 12 at 4:50.',
        '**Say**\n\nI’ll take one observation so we have time for the next conversation. Keep the rest of your questions with your notes. We can return to them with the resources or a colleague afterward.',
        '## Presenter reference links',
        '- [Participant workshop hub](https://mguhlin.github.io/nspa/2026/)\n- [Conversation companion](https://mguhlin.github.io/nspa/2026/conversation.html)\n- [Presenter route and full offline download](https://mguhlin.github.io/nspa/2026/p/)\n- [Infographic collection](https://mguhlin.github.io/nspa/resources/infographics.html)\n- [Resource library](https://mguhlin.github.io/nspa/resources/library.html)',
        '## Sources and scope',
        'The script follows the shared slide notes and speaker’s guide. The sources below support the optional references and the related discussion. The fictional case, practice rule, and teaching rubric are not official NSPA policy.',
        '\n'.join(f'- [{source[0]}]({source[1]})' for source in SOURCES),
    ]
    return '\n\n'.join(blocks) + '\n'


if __name__ == '__main__':
    path = ROOT / 'docs/presentation-script.md'
    path.write_text(build())
    print(f'Wrote {path}: 12 timed slide sections and 6 optional reference scripts.')
