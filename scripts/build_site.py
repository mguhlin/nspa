"""Stage only public website content for GitHub Pages."""
from pathlib import Path
import shutil
from update_resource_navigation import update_menus
ROOT = Path(__file__).resolve().parents[1]
update_menus()
out = ROOT/'_site'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for name in ['index.html', '404.html']:
    shutil.copy2(ROOT/name, out/name)
for name in ['assets', 'resources', '2026']:
    shutil.copytree(ROOT/name, out/name, ignore=shutil.ignore_patterns('README.md', 'Code.gs', 'offline', '*.zip'))
# Publish only these current practice downloads. Retired offline archives stay excluded.
for name in ['fictional-review-packet.zip', 'scholarship-evidence-review.zip']:
    shutil.copy2(ROOT/'2026/prompting/files'/name,out/'2026/prompting/files'/name)
# Retired presenter downloads are kept in Git for history, not published.
for name in ['facilitator-guide.docx', 'presenter-route.pdf', 'slide-transcript.html']:
    (out/'2026/p'/name).unlink(missing_ok=True)
# Preserve the old takeaway addresses without publishing the retired offline kit.
legacy=out/'2026/offline';legacy.mkdir(exist_ok=True)
for suffix in ['pdf','docx']:
    source=ROOT/f'2026/handouts/session-takeaways.{suffix}'
    if source.exists():shutil.copy2(source,legacy/source.name)
(out/'.nojekyll').touch()
lab = ROOT/'lab/dist'
if not (lab/'index.html').is_file():
    raise SystemExit('Build the decision lab first: npm ci --prefix lab && npm run build --prefix lab')
shutil.copytree(lab, out/'lab')
audit = ROOT/'audit/web/dist'
if not (audit/'index.html').is_file():
    raise SystemExit('Build the security audit toolkit first: npm ci --prefix audit/web && npm run build --prefix audit/web')
shutil.copytree(audit, out/'audit')
print('Staged public website in _site; supplemental inputs excluded.')
