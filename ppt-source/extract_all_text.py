# -*- coding: utf-8 -*-
"""Extract every visible text run from all 6 SVGs so each can be traced
back to an authoritative source file."""
import re
import glob
import os
import html

SVG_DIR = r"C:\Users\zhuaisha\AppData\Local\Hermes Agent CN Desktop\data\hermes-home\projects\wuzhen_waterways_ppt169_20261006\svg_output"

runs = []
for path in sorted(glob.glob(os.path.join(SVG_DIR, "*.svg"))):
    xml = open(path, encoding="utf-8").read()
    page = os.path.basename(path)
    # each <text ...>...</text> element; concatenate direct children and tspans
    for m in re.finditer(r"<text\b[^>]*>(.*?)</text>", xml, re.S):
        inner = m.group(1)
        # drop tags entirely, keep only character data
        text_only = re.sub(r"<[^>]+>", " ", inner)
        text_only = html.unescape(text_only)
        text_only = re.sub(r"\s+", " ", text_only).strip()
        if text_only:
            runs.append((page, text_only))

print(f"=== {len(runs)} text runs across {len(set(p for p, _ in runs))} pages ===\n")
cur = None
for page, t in runs:
    if page != cur:
        cur = page
        print(f"\n--- {page} ---")
    print(f"  {t}")
