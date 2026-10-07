"""Bundle participant and presenter editions with separate checksum manifests."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import hashlib,json
workshop=Path(__file__).resolve().parents[1]/'2026'
root=workshop/'offline'
archive=root/'nspa-2026-offline.zip'
files=sorted(p for p in root.rglob('*') if p.is_file() and p not in [archive,root/'manifest.json'])
def bundle(path,included,presenter=False):
 payload={p.relative_to(root).as_posix():p.read_bytes() for p in included}
 if not presenter:
  # Keep original online PDF links, so optional references still lead to the website.
  for name in ['handouts/participant-workbook.pdf','slides/nspa-trust-transparency-ai.pdf']:
   payload[name]=(workshop/name).read_bytes()
  payload['START-HERE.txt']=b'NSPA PARTICIPANT SESSION KIT\n\nExtract the whole ZIP and open index.html. Keep all folders together.\nUse the workbook on paper or conversation.html for local notes.\nExport notes before closing the browser. Slides and takeaways are included.\nFind optional resources and infographics on the NSPA website when you reconnect.\n'
 manifest={name:hashlib.sha256(data).hexdigest() for name,data in payload.items()}
 extra='NSPA 2026 PRESENTER WORKSHOP\n\nExtract the whole ZIP. Open p/index.html for the route,\np/webdeck.html for the presentation, or p/facilitator.html for the full guide.\nKeep all folders together. Participant activities start at index.html.\n'
 if presenter:manifest['PRESENTER-START.txt']=hashlib.sha256(extra.encode()).hexdigest()
 serialized=json.dumps(manifest,indent=2)+'\n'
 path.parent.mkdir(parents=True,exist_ok=True)
 with ZipFile(path,'w',ZIP_DEFLATED,compresslevel=6) as z:
  for name,data in payload.items():z.writestr('nspa-2026-offline/'+name,data)
  if presenter:z.writestr('nspa-2026-offline/PRESENTER-START.txt',extra)
  z.writestr('nspa-2026-offline/manifest.json',serialized)
 if not presenter:(root/'manifest.json').write_text(serialized)
 print(f'Packaged {len(manifest)} files: {path.name} ({path.stat().st_size/1024/1024:.1f} MB)')
participant={'index.html','conversation.html','offline.css','workshop.css','navigation.js','practice.js','workshop-flow.js','assets/nspa-logo.png','handouts/participant-workbook.pdf','slides/nspa-trust-transparency-ai.pdf','session-takeaways.pdf'}
missing=participant-{p.relative_to(root).as_posix() for p in files}
if missing:raise SystemExit(f'Missing participant files: {sorted(missing)}')
bundle(archive,[p for p in files if p.relative_to(root).as_posix() in participant])
bundle(workshop/'p/nspa-2026-presenter-offline.zip',files,True)
