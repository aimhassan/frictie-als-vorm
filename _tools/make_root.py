#!/usr/bin/env python3
"""Make the main page (root index.html) from a version folder.

Usage: python3 _tools/make_root.py v3
The root page is that version's index.html with adjusted paths: style, script and
fonts load from the version folder, so each version exists once. Run it again after
every change to <version>/index.html while that version is the main page.
"""
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
version = sys.argv[1] if len(sys.argv) > 1 else 'v3'
src = open(os.path.join(REPO, version, 'index.html'), encoding='utf-8').read()

pairs = [
    ('href="fonts/', f'href="{version}/fonts/'),
    ('href="style.css"', f'href="{version}/style.css"'),
    ('src="script.js"', f'src="{version}/script.js"'),
    ('href="../', 'href="'),
]
for old, new in pairs:
    if old not in src:
        sys.exit(f'expected "{old}" in {version}/index.html')
    src = src.replace(old, new)

head = '<!DOCTYPE html>\n'
note = (f'<!-- Hoofdpagina: {version}. Gemaakt met _tools/make_root.py uit {version}/index.html; '
        f'stijl, script en lettertypes komen uit {version}/. -->\n')
if not src.startswith(head):
    sys.exit('unexpected start of index.html')
src = head + note + src[len(head):]
if '../' in src:
    sys.exit('a ../ path is left in the root page')
open(os.path.join(REPO, 'index.html'), 'w', encoding='utf-8').write(src)
print(f'index.html written from {version}/index.html')
