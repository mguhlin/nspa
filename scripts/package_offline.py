"""Bundle the complete, already-built offline folder for extraction anywhere."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import hashlib,json
root=Path(__file__).resolve().parents[1]/'2026/offline'
archive=root/'nspa-2026-offline.zip'
files=sorted(p for p in root.rglob('*') if p.is_file() and p not in [archive,root/'manifest.json'])
(root/'manifest.json').write_text(json.dumps({p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files},indent=2)+'\n')
with ZipFile(archive,'w',ZIP_DEFLATED,compresslevel=6) as z:
 for p in files+[root/'manifest.json']:z.write(p,'nspa-2026-offline/'+p.relative_to(root).as_posix())
print(f'Packaged {len(files)} files: {archive.stat().st_size/1024/1024:.1f} MB')
