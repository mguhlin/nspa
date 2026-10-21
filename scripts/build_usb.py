"""Build a file:// friendly USB copy from the already-staged public website."""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit, unquote, quote
import argparse, hashlib, json, os, re, shutil, subprocess

ROOT=Path(__file__).resolve().parents[1]

def page(title, items, note=''):
    links=''.join('<li><a href="'+escape(href)+'">'+escape(label)+'</a></li>' for label,href in items)
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{font:20px/1.6 Arial,sans-serif;color:#2e4f66;max-width:850px;margin:40px auto;padding:20px}a{color:#007681}li{margin:20px 0}h1{font-family:Georgia,serif}</style><h1>'+title+'</h1><ul>'+links+'</ul><p>'+note+'</p></html>'

def build(output):
    source=ROOT/'_site'
    if not source.is_dir():raise SystemExit('Run scripts/build_site.py first.')
    output=output.resolve()
    if output.exists() and any(output.iterdir()):
        if not (output/'.nspa-usb-package').exists():raise SystemExit('Output contains other files; choose an empty folder.')
        shutil.rmtree(output)
    output.mkdir(parents=True,exist_ok=True)
    (output/'.nspa-usb-package').write_text('Generated NSPA USB package\n')
    web=output/'web';shutil.copytree(source,web)
    fac=output/'facilitator';part=output/'participant';fac.mkdir();part.mkdir()
    copies={
        fac/'Trust-Transparency-AI.pptx':ROOT/'2026/p/slides/nspa-trust-transparency-ai.pptx',
        fac/'AI-Prompting-Practice.pptx':ROOT/'2026/p/slides/ai-prompting-scholarship-review.pptx',
        fac/'Trust-Transparency-Facilitator-Guide.pdf':ROOT/'2026/p/facilitator-guide.pdf',
        part/'Trust-Transparency-AI.pdf':ROOT/'2026/slides/nspa-trust-transparency-ai.pdf',
        part/'AI-Prompting-Practice.pdf':ROOT/'2026/prompting/slides/ai-prompting-scholarship-review.pdf',
        part/'Participant-Workbook.pdf':ROOT/'2026/handouts/participant-workbook.pdf',
        part/'Session-Takeaways.pdf':ROOT/'2026/handouts/session-takeaways.pdf',
    }
    for dest,src in copies.items():shutil.copy2(src,dest)
    shutil.copytree(ROOT/'2026/prompting/files',part/'Practice-Files',ignore=shutil.ignore_patterns('*.zip'))
    missing=[]
    def local_url(value, current):
        if '${' in value or '{{' in value:return value
        if value.startswith(('#','data:','mailto:','tel:','javascript:','blob:')):return value
        parsed=urlsplit(value)
        path=unquote(parsed.path)
        if parsed.scheme or parsed.netloc:
            if parsed.netloc=='mguhlin.github.io' and path.startswith('/nspa/'):
                target=web/path[len('/nspa/'):]
            else:return value
        elif path.startswith('/'):
            target=web/path.removeprefix('/nspa/').lstrip('/')
        elif not path:return value
        else:target=current.parent/path
        target=target.resolve()
        if not target.is_relative_to(web):return value
        if target.is_dir():target=target/'index.html'
        if not target.exists():
            missing.append((str(current.relative_to(web)),value));return value
        relative=quote(os.path.relpath(target,current.parent),safe='/._-~')
        return relative+('?' + parsed.query if parsed.query else '')+('#'+parsed.fragment if parsed.fragment else '')
    for f in web.rglob('*'):
        if f.suffix not in ('.html','.css'):continue
        text=f.read_text()
        if f.suffix=='.html':
            text=re.sub(r'\b(href|src|poster)\s*=\s*([\"\'])(.*?)\2',lambda m:m[1]+'='+m[2]+local_url(m[3],f)+m[2],text)
            text=re.sub(r'<link\b[^>]*href=[\"\']https://fonts\.(?:googleapis|gstatic)\.com[^>]*>','',text)
        text=re.sub(r'@import\s+url\([\"\']?https://fonts\.googleapis\.com[^;]*;','',text)
        text=re.sub(r'url\(([\"\']?)(/[^)\"\']+)\1\)',lambda m:'url('+m[1]+local_url(m[2],f)+m[1]+')',text)
        f.write_text(text)
    # The older marketing self-assessment already supports a local demo mode.
    (web/'resources/assess/config.js').write_text('window.NSPA_CONFIG = { SHEET_ENDPOINT: "" };\n')
    (fac/'START-HERE.html').write_text(page('Facilitator materials',[
        ('Trust, Transparency, and AI PowerPoint','Trust-Transparency-AI.pptx'),
        ('AI Prompting Practice PowerPoint','AI-Prompting-Practice.pptx'),
        ('Trust, Transparency, and AI facilitator guide PDF','Trust-Transparency-Facilitator-Guide.pdf'),
        ('Trust, Transparency, and AI webdeck','../web/2026/p/webdeck.html'),
        ('AI Prompting Practice webdeck','../web/2026/p/ai-prompting-webdeck.html'),
        ('Adaptive speaking guide','../web/2026/p/facilitator-guide.html')
    ],'The PowerPoints include speaker notes. Press V in either webdeck for presenter view; use A− and A+ to resize the notes.'))
    (part/'START-HERE.html').write_text(page('Participant materials',[(p.stem.replace('-',' '),p.name) for p in part.glob('*.pdf')]+[
        ('Awareness self-check','../web/2026/assessment.html'),
        ('Guided ChatGPT activities','../web/2026/prompting/demos.html'),
        ('Practice files and instructions','Practice-Files/README.txt')
    ],'All practice applications are made up. Reading the materials and completing the self-check work offline. Running a live ChatGPT activity needs internet access.'))
    (output/'START-HERE.html').write_text(page('NSPA workshop resources',[
        ('Open the website','web/index.html'),('Facilitator materials','facilitator/START-HERE.html'),('Participant materials','participant/START-HERE.html')
    ],'Open this file in your browser. No installation or local server is needed. Share the participant folder with attendees. Presenter notes are in facilitator/ and web/2026/p/.'))
    (output/'README.txt').write_text('NSPA WORKSHOP USB COPY\n\nOpen START-HERE.html in a web browser, or open web/index.html directly.\nNo installation, web server, or special software is needed for the website.\n\nfacilitator/: two PowerPoints with notes, facilitator guide PDF, and links to local presenter views.\nparticipant/: four participant PDFs and unzipped practice files. Share this folder with attendees.\nweb/: complete local website, including both webdecks, speaking guide, practice pages, and self-check.\n\nReading, navigation, notes, and the awareness self-check work without the internet. ChatGPT, live AI features, and links to other websites need internet access. The older marketing assessment uses its clearly labeled local demo mode.\n\nThe self-check does not send answers anywhere. Your browser may save companion notes locally when you choose to use that feature.\n')
    revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    manifest={'source_revision':revision,'files':{str(p.relative_to(output)):hashlib.sha256(p.read_bytes()).hexdigest() for p in output.rglob('*') if p.is_file()}}
    (output/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Built {output}; {len(manifest["files"])} files; unresolved local references: {len(missing)}')
    if missing:print(json.dumps(missing[:25],indent=2));raise SystemExit(1)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);args=parser.parse_args();build(args.output)
