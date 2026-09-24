"""Validate local HTML asset/link targets and migration destination coverage."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
ROOT = Path(__file__).resolve().parents[1]
errors = []
class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value: self.links.append(value)
for page in [*ROOT.glob('*.html'), *ROOT.joinpath('2026').rglob('*.html'), *ROOT.joinpath('resources').rglob('*.html')]:
    parser = Links(); parser.feed(page.read_text())
    for link in parser.links:
        if '${' in link: continue  # JavaScript template, not an HTML target.
        url = urlsplit(link)
        if url.scheme or url.netloc or not url.path: continue
        path = unquote(url.path)
        target = ROOT / path.removeprefix('/nspa/') if path.startswith('/nspa/') else page.parent / path
        if not target.exists(): errors.append(f'{page.relative_to(ROOT)}: missing {link}')
for old, new in json.loads((ROOT/'docs/redirect-map.json').read_text()).items():
    if not (ROOT/new.removeprefix('/nspa/')).is_file(): errors.append(f'{old}: missing destination {new}')
if errors:
    raise SystemExit('\n'.join(errors))
print('PASS: local links, assets, and all migration destinations exist.')
