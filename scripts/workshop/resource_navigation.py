"""Shared Resources dropdown for workshop and collection pages."""
from html import escape

RESOURCE_LINKS = [
    ('NSPA 2026 Session Materials', 'https://mguhlin.org/blog/nspa-2026-conference-session-materials-and-infographics/'),
    ('AI Prompting for Scholarship Review', '2026/prompting/'),
    ('Awareness self-check', '2026/assessment.html'),
    ('Infographic collection', 'resources/infographics.html'),
    ('Resource library', 'resources/library.html'),
    ('The Ethics of AI Use in Scholarships and Data Protection', 'resources/index.html#session1'),
    ('Creating and Revising Scholarship Applications with AI', 'resources/index.html#session2'),
    ('Automating Office Tasks with AI', 'resources/index.html#session3'),
    ('AI for Marketing & Engagement: A Nonprofit Toolkit', 'resources/index.html#session4'),
    ('AI Fluency', 'resources/ai_fluency_levels.html'),
    ('Marketing Readiness', 'resources/assess/'),
    ('The Prompt Library', 'https://mguhlin.github.io/creations/architect/index.html'),
]

def resource_links(root_prefix):
    return ''.join(
        f'<a href="{escape(path if path.startswith("https://") else root_prefix+path, quote=True)}">{escape(title)}</a>'
        for title,path in RESOURCE_LINKS
    )


def session_tabs(root_prefix):
    """Only the two session destinations belong in the shared tab row."""
    return (f'<a href="{escape(root_prefix+"2026/", quote=True)}">Trust, Transparency, and AI</a>'
            f'<a href="{escape(root_prefix+"2026/prompting/", quote=True)}">AI Prompting Practice</a>')


def prompting_presenter_section():
    return '''<section id="prompting-presenter"><h2>AI Prompting for Scholarship Review</h2><p>26 slides covering prompts, Projects, instructions, reusable skills, and ChatGPT demonstrations.</p><div class="download-grid"><a class="download" href="ai-prompting-webdeck.html"><span class="filetype">WEB</span><span><strong>Open the prompting webdeck</strong><small>Presentation with speaking notes and synchronized presenter view</small></span></a><a class="download" href="slides/ai-prompting-scholarship-review.pptx"><span class="filetype">PPTX</span><span><strong>Prompting PowerPoint with speaker notes</strong><small>Editable slides, tables, and speaking notes</small></span></a></div><p><a href="../prompting/">Open the participant prompting materials</a></p></section>'''
