"""Keep native, no-JavaScript Resources menus consistent in public sources."""
from pathlib import Path
import os
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts/workshop'))
from resource_navigation import resource_links, session_tabs

def update_menus():
    count=0
    for page in [ROOT/'index.html',*ROOT.joinpath('2026').rglob('*.html'),*ROOT.joinpath('resources').rglob('*.html')]:
        source=page.read_text()
        if 'resource-menu-links' not in source:continue
        prefix=Path(os.path.relpath(ROOT,page.parent)).as_posix()+'/'
        updated=re.sub(r'(<div class="resource-menu-links">).*?(</div>)',lambda m:m[1]+resource_links(prefix)+m[2],source,flags=re.S)
        updated=re.sub(r'(<nav class="workshop-nav wrap"[^>]*>).*?(</nav>)',lambda m:m[1]+session_tabs(prefix)+m[2],updated,flags=re.S)
        if updated!=source:
            page.write_text(updated)
            count+=1
    return count

if __name__=='__main__':
    print(f'Updated Resources menus in {update_menus()} pages.')
