"""Stage only public website content for GitHub Pages."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
out = ROOT/'_site'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for name in ['index.html', '404.html']:
    shutil.copy2(ROOT/name, out/name)
for name in ['assets', 'resources', '2026']:
    shutil.copytree(ROOT/name, out/name, ignore=shutil.ignore_patterns('README.md', 'Code.gs'))
(out/'.nojekyll').touch()
print('Staged public website in _site; supplemental inputs excluded.')
