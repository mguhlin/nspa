#!/usr/bin/env python3
"""Package an already-built Linux SSAT executable; never rebuild or alter its bytes."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

AUDIT = Path(__file__).resolve().parents[2]
DESKTOP = AUDIT / 'go/desktop'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--binary', type=Path, required=True)
parser.add_argument('--support-dir', type=Path, required=True,
                    help='Directory containing build-info, modules and third-party license inventory')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--version', default=json.loads((DESKTOP / 'wails.json').read_text())['info']['productVersion'])
args = parser.parse_args()
if not re.fullmatch(r'\d+\.\d+\.\d+', args.version):
    parser.error('version must be three numeric components')
header = args.binary.read_bytes()[:20]
if len(header) < 20 or header[:6] != b'\x7fELF\x02\x01' or header[18:20] != b'\x3e\x00':
    parser.error('binary must be a little-endian Linux x86-64 ELF executable')
args.output = args.output.resolve()
args.output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='ssat-deb-') as temporary:
    root = Path(temporary) / 'package'
    def put(source, destination, mode=0o644):
        target = root / destination
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        target.chmod(mode)
    put(args.binary, 'usr/lib/ssat-desktop/SSAT', 0o755)
    put(DESKTOP / 'packaging/ssat.desktop', 'usr/share/applications/ssat.desktop')
    put(AUDIT / 'web/public/favicon.svg', 'usr/share/icons/hicolor/scalable/apps/ssat.svg')
    for name in ['START-HERE.txt', 'THIRD-PARTY-NOTICES.md']:
        put(DESKTOP / name, f'usr/share/doc/ssat-desktop/{name}')
    for name in ['build-info.txt', 'modules.txt', 'THIRD-PARTY-LICENSES.txt']:
        put(args.support_dir / name, f'usr/share/doc/ssat-desktop/{name}')
    launcher = root / 'usr/bin/ssat'
    launcher.parent.mkdir(parents=True)
    launcher.write_text('#!/bin/sh\nexec /usr/lib/ssat-desktop/SSAT "$@"\n', encoding='utf-8')
    launcher.chmod(0o755)
    control = root / 'DEBIAN'
    control.mkdir()
    installed_size = sum(p.stat().st_size for p in root.rglob('*') if p.is_file())
    (control / 'control').write_text(f'''Package: ssat-desktop
Version: {args.version}-1
Architecture: amd64
Section: office
Priority: optional
Maintainer: Miguel Guhlin <drawsplat@gmail.com>
Homepage: https://mguhlin.github.io/nspa/audit/
Installed-Size: {(installed_size + 1023) // 1024}
Depends: libc6 (>= 2.34), libgtk-3-0 (>= 3.24) | libgtk-3-0t64 (>= 3.24), libglib2.0-0 (>= 2.68) | libglib2.0-0t64 (>= 2.68), libgdk-pixbuf-2.0-0, libsoup-3.0-0, libjavascriptcoregtk-4.1-0, libwebkit2gtk-4.1-0
Description: Offline security audit roadmap for scholarship teams
 A desktop security self-assessment assistant with guided starting questions,
 action plans, encrypted local audit files and redacted report exports.
 Includes an application-menu launcher. No account or internet connection
 is required for audit work once the declared system libraries are installed.
''', encoding='utf-8')
    sums = []
    for item in sorted((root / 'usr').rglob('*')):
        if item.is_file():
            sums.append(hashlib.md5(item.read_bytes()).hexdigest() + '  ' + item.relative_to(root).as_posix())
    (control / 'md5sums').write_text('\n'.join(sums) + '\n', encoding='utf-8')
    for directory in [root, *[p for p in root.rglob('*') if p.is_dir()]]:
        directory.chmod(0o755)
    environment = dict(os.environ, SOURCE_DATE_EPOCH='0')
    subprocess.run(['dpkg-deb', '--root-owner-group', '-Zxz', '--build', str(root), str(args.output)],
                   check=True, env=environment)
print(args.output)
