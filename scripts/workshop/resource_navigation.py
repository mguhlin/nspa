"""Shared Resources dropdown for workshop and collection pages."""
from html import escape

RESOURCE_LINKS = [
    ('NSPA 2026 Session Materials', 'https://mguhlin.org/blog/nspa-2026-conference-session-materials-and-infographics/'),
    ('Infographic collection', 'resources/infographics.html'),
    ('Resource library', 'resources/library.html'),
    ('Session Archive', 'resources/index.html'),
    ('AI Fluency', 'resources/ai_fluency_levels.html'),
    ('Marketing Readiness', 'resources/assess/'),
    ('The Prompt Library', 'https://mguhlin.github.io/creations/architect/index.html'),
]

def resource_links(root_prefix):
    return ''.join(
        f'<a href="{escape(path if path.startswith("https://") else root_prefix+path, quote=True)}">{escape(title)}</a>'
        for title,path in RESOURCE_LINKS
    )
