#!/usr/bin/env python3
"""Collect redistribution notices from the pinned, downloaded module sources."""
import json
from pathlib import Path
import subprocess

out = subprocess.check_output(['go', 'list', '-m', '-json', 'all'], text=True)
decoder = json.JSONDecoder()
parts = []
while out.strip():
    obj, end = decoder.raw_decode(out.lstrip())
    out = out.lstrip()[end:]
    module_dir = obj.get('Dir')
    if not module_dir or obj.get('Main') or obj.get('Replace'):
        continue
    directory = Path(module_dir)
    for item in sorted(directory.iterdir()):
        if item.is_file() and item.name.lower() in {'license', 'license.md', 'license.txt', 'copying', 'copying.txt', 'notice', 'notice.md', 'notice.txt'}:
            parts.append(f"\n{'='*72}\n{obj['Path']} {obj.get('Version', '')} / {item.name}\n{'='*72}\n{item.read_text(errors='replace')}")
root = Path(__file__).resolve().parents[2]
noble = root / 'web/node_modules/@noble/hashes/LICENSE'
parts.append('\n@noble/hashes (MIT)\n' + noble.read_text())
go_root = Path(subprocess.check_output(['go', 'env', 'GOROOT'], text=True).strip())
parts.append('\nGo toolchain (BSD-3-Clause)\n' + (go_root / 'LICENSE').read_text())
Path('THIRD-PARTY-LICENSES.txt').write_text('\n'.join(parts))
