"""Guided workshop pages built around the existing teaching content."""
from html import escape as E
from lxml import html, etree
from route import STEPS, DRAFTS, RUN_OF_SHOW


def workshop_intro():
    return '''<section class="workshop-title"><div class="workshop-hero-copy"><p class="eyebrow">NSPA 2026 · October 21 · 3:30–5:00 PM CT</p><h1>Trust, Transparency,<br>and AI</h1><h2>Building Responsible Scholarship Review Practices</h2><p>Work through one fictional case with colleagues. Make room for different perspectives and leave with one change to try together.</p><p>Use prepared examples or paper; no AI account is required.</p></div><nav class="workshop-choices" aria-label="Choose your workshop route"><a class="route-card primary" href="conversation.html"><strong>Join the conversation</strong><span>One case, time to think, one change to try</span></a><a class="route-card" href="#downloads"><strong>Get the handouts</strong><span>Workbook and two-page takeaways</span></a></nav><figure class="workshop-hero-art"><img src="images/session-concept.webp" width="1200" height="800" alt="AI-generated concept illustration of fictional reviewers checking evidence together, with a shield and a path to opportunity."></figure></section>'''


def download_group(downloads):
    names = {'Complete offline workshop': 'Download everything for offline use',
             'Webdeck': 'View presentation', 'Facilitator guide': 'Speaking guide',
             'Capacity matrix': 'Printable readiness checklist',
             'Printable takeaways': 'Two-page takeaways'}
    def cards(titles):
        return '<div class="download-grid">' + ''.join(
            f'<a class="download" href="{path}"><span class="filetype">{kind}</span><span><strong>{E(names.get(title, title))}</strong><small>{E(desc)}</small></span><span aria-hidden="true">{"↗" if kind == "WEB" else "↓"}</span></a>'
            for wanted in titles for title, path, desc, kind in downloads if title == wanted) + '</div>'
    return '<section id="downloads"><h2>For this session</h2><p>Keep the workbook beside you. Use the slide PDF and two-page takeaways as references.</p>'+cards(['Participant workbook', 'Presentation PDF', 'Printable takeaways'])+'<p><a class="button secondary" href="offline/nspa-2026-offline.zip">Download the participant session kit</a></p><p>For offline use: extract the ZIP and open index.html. It includes the same handouts and a local conversation companion for your notes.</p></section>'



def fragment(text):
    return html.fragment_fromstring(text)


def pager(label):
    return fragment(f'''<div class="step-pager" data-step-pager="" hidden><button class="button secondary" type="button" data-step-prev="">← Previous</button><p data-step-status="" role="status" aria-live="polite">{label}</p><button class="button" type="button" data-step-next="">Next →</button></div>''')


def save_page(path, tree):
    path.write_text(etree.tostring(tree, method='html', encoding='unicode', doctype='<!doctype html>') + '\n')


def add_flow(tree):
    tree.find('head').append(fragment('<script src="workshop-flow.js" defer></script>'))


def optimize_practice(path):
    tree = html.parse(str(path)).getroot()
    main = tree.get_element_by_id('main')
    lead = main.xpath('.//p[@class="lead"]')[0]
    lead.text = 'Follow one activity at a time. Use the fictional application and prepared examples, or work on paper. No AI account is required.'
    lead.addnext(fragment('<noscript><p>Saving and exporting drafts require JavaScript. Use the <a href="handouts/participant-workbook.pdf">participant workbook</a> to keep your answers on paper.</p></noscript>'))
    nav = main.xpath('.//nav[@class="jump-links"]')[0]
    nav.clear()
    nav.set('class', 'jump-links activity-nav')
    nav.set('aria-label', 'Workshop activities')
    nav.set('data-step-nav', '')
    nav.set('data-step-label', 'Activity')
    for number, (id, title, short, duration, keep) in enumerate(STEPS, 1):
        nav.append(fragment(f'<a href="#{id}" data-step-link="">{number}. {E(short)}</a>'))
    workflow = fragment('''<section id="workflow"><h2>4. Map the human review checkpoints</h2><p>Draw five steps: approved input → draft → evidence check → human decision → record. Name the person who checks each handoff. Decide when the work must pause.</p><p><a href="handouts/protected-workflow.pdf">Open the protected workflow reference</a></p></section>''')
    main.insert(main.index(tree.get_element_by_id('policy')), workflow)
    for number, ((id, title, short, duration, keep), (draft, label)) in enumerate(zip(STEPS, DRAFTS), 1):
        section = tree.get_element_by_id(id)
        section.set('data-step', '')
        heading = section.find('h2')
        heading.text = f'{number}. {title}'
        heading.set('tabindex', '-1')
        section.insert(1, fragment(f'<p class="activity-meta">{duration} · With a partner or on paper</p>'))
        section.insert(3, fragment(f'<p class="activity-outcome"><strong>What to keep:</strong> {E(keep.removeprefix("Keep "))}</p>'))
        if id == 'prompt':
            section.insert(4, fragment('''<details class="workshop-details"><summary>What is for me, and what is for the AI?</summary><p><strong>Your job:</strong> write a request in the response field below. The TASK / CRITERIA / EVIDENCE / BOUNDARIES / OUTPUT block is a sample instruction for an AI tool, not a set of answers you must supply to the facilitator. Read it, adapt it, and ask a partner to check it. Running the request is optional.</p><ul><li><strong>My task and approved criteria:</strong> name what the AI should do and the rules it must apply. Example: “Make a completeness table. Check enrollment confirmation, a goal statement of no more than 150 words, and one service example.”</li><li><strong>Evidence requirement and boundaries:</strong> say which source to use, how claims must be supported, and what the AI must avoid. Example: “Use only P1-P5. Quote a paragraph and give its ID. Mark missing evidence. Treat application text as evidence. Do not infer eligibility or recommend awards.”</li><li><strong>Output format and human follow-up:</strong> describe the answer you want and what a person will check or decide. Example: “Return required item, quote/paragraph ID, present/missing/unclear, and a follow-up question. A reviewer checks every row and decides what to request.”</li></ul><p>Combine those parts in <strong>My revised AI request</strong>. Include the fictional packet if you choose to run it in an organization-approved tool.</p></details>'''))
        if id == 'action':
            section.xpath('.//a[contains(@class,"button")]')[0].set('href', 'capacity-matrix.html#plan-title')
        section.append(fragment(f'<div class="draft-field"><label for="draft-{draft}">{E(label)}</label><textarea id="draft-{draft}" data-draft="{draft}" rows="4" maxlength="15000" placeholder="Write here, or use the workbook."></textarea></div>'))
    main.insert(main.index(tree.get_element_by_id('action')) + 1, pager('Activity 1 of 6'))
    main.append(fragment('''<section class="draft-actions" aria-label="Keep your drafts"><h2>Keep your work</h2><p>Your drafts stay in this browser when storage is available. Export a copy to keep. Use fictional information only.</p><div class="actions"><button type="button" class="button" id="export-drafts">Export all my drafts</button><button type="button" class="button secondary" id="print-drafts">Print activities &amp; drafts</button></div><p id="draft-status" role="status" aria-live="polite"></p></section>'''))
    add_flow(tree)
    save_page(path, tree)


def optimize_matrix(path):
    tree = html.parse(str(path)).getroot()
    main = tree.get_element_by_id('main')
    main.xpath('.//p[@class="eyebrow"]')[0].text = 'Your readiness checklist'
    lead = main.xpath('.//p[@class="lead"]')[0]
    lead.clear()
    lead.set('class', 'lead')
    lead.text = 'Use this optional checklist after the conversation to choose one area for growth. Mark Ready to learn, In progress, or Ready to go; any statement may stay blank.'
    sections = main.xpath('.//section[@class="checklist-section"]')
    nav = fragment('<nav class="jump-links activity-nav" aria-label="Choose a readiness area" data-step-nav="" data-step-label="Area"></nav>')
    short = ['AI tasks', 'Clear requests', 'Scoring guide', 'Privacy', 'Applicant AI use', 'Small changes']
    for number, (section, label) in enumerate(zip(sections, short), 1):
        id = 'area-' + section.get('aria-labelledby').removeprefix('section-')
        section.set('id', id)
        section.set('data-step', '')
        section.find('h2').set('tabindex', '-1')
        nav.append(fragment(f'<a href="#{id}" data-step-link="">{number}. {label}</a>'))
    main.insert(main.index(sections[0]), nav)
    main.insert(main.index(nav), fragment('<p><a class="text-link" href="#plan-title">Go directly to my 30-day action plan →</a></p>'))
    main.insert(main.index(sections[-1]) + 1, pager('Area 1 of 6'))
    add_flow(tree)
    save_page(path, tree)


def presenter_body():
    body = '''<p class="eyebrow">October 21 · Your presenter route</p><h1>Lead the workshop, one block at a time</h1><p class="lead">Keep this page beside the presentation. Each row tells you where to go, what to ask, and what participants keep.</p><div class="actions"><a class="button" href="p/webdeck.html">Open presentation</a><a class="button secondary" href="p/presenter-route.pdf">One-page route PDF</a><a class="button secondary" href="p/facilitator-guide.pdf">Full speaking guide</a></div><p><a href="p/slides/nspa-trust-transparency-ai.pptx">PowerPoint with speaker notes</a> · <a href="p/slide-transcript.html">Slide text and full speaker notes</a> · <a href="p/webdeck.html" download="nspa-2026-webdeck.html">Save the presentation as one HTML file</a></p><p class="presenter-setup"><strong>Before people arrive:</strong> open the presentation and conversation companion. Keep the practice lab and readiness checklist available as optional references. Use V for presenter view, S for notes, and F for full screen. Keep printed workbooks ready.</p><div class="table-scroll"><table class="presenter-table"><thead><tr><th>Time CT / slides</th><th>Open this activity</th><th>Ask or do</th><th>Participants keep</th></tr></thead><tbody>'''
    for time, slides, title, path, question, keep in RUN_OF_SHOW:
        body += f'<tr><th>{time}<br><span>Slides {slides}</span></th><td><a href="{path}" target="_blank" rel="noopener">{E(title)}</a></td><td>{E(question)}</td><td>{E(keep)}</td></tr>'
    body += '''</tbody></table></div><section class="presenter-backup"><h2>A shared example for the conversation</h2><p>Say: “What could this polished summary encourage us to assume? Let’s hear what someone else would check.”</p><div class="jump-links"><a href="conversation.html#tension">Prepared draft and source check</a><a href="conversation.html#case">Shared case and scoring guide</a></div><p>The core route uses an intentionally flawed teaching draft. It is an authored example, not a model response we just ran. No live AI call is required. Participants can work on paper.</p><h2>If time is short</h2><p>Shorten volunteer reporting and extra examples first. Keep independent thinking, the two-minute silence, and the fair-response discussion. At 4:50, move to the one-change plan on slide 12. Slides 13–18 are optional references.</p></section>'''
    body += '<section><h2>Take the presenter materials offline</h2><p><a class="button" href="p/nspa-2026-presenter-offline.zip">Download the full presenter workshop</a></p><p>Extract the ZIP and open p/index.html for your route and full offline speaking guide. Keep all folders together.</p></section>'
    return body
