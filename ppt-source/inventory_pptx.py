# -*- coding: utf-8 -*-
"""Recursively count text frames + pictures inside group shapes, and dump
a flat inventory so we can confirm nothing was dropped or clipped."""
import zipfile
import re
import sys
from collections import Counter

PPTX = r"C:\Users\zhuaisha\AppData\Local\Hermes Agent CN Desktop\data\hermes-home\projects\wuzhen_waterways_ppt169_20261006\exports\wuzhen_waterways_final.pptx"

EMU_PER_INCH = 914400
SW, SH = 12192000, 6858000

z = zipfile.ZipFile(PPTX)

print("=== Recursive shape inventory ===")
total_text, total_pic, off_canvas = 0, 0, 0
for i in range(1, 7):
    xml = z.read(f"ppt/slides/slide{i}.xml").decode("utf-8", "replace")
    n_txt = len(re.findall(r"<a:t>", xml))
    n_pic = xml.count("<p:pic>")
    # top-level offset extents: <a:off x= y=/> on shape-level grpSpPr / spPr
    offs = re.findall(r'<a:off x="(\d+)" y="(\d+)"/>', xml)
    outs = re.findall(r'<a:ext cx="(\d+)" cy="(\d+)"/>', xml)
    total_text += n_txt
    total_pic += n_pic
    # check for any geometry whose right/bottom edge exceeds the canvas
    bad = 0
    for (x, y), (cx, cy) in zip(offs, outs):
        x, y, cx, cy = map(int, (x, y, cx, cy))
        if x < 0 or y < 0 or x + cx > SW + 9144 or y + cy > SH + 9144:
            bad += 1
    off_canvas += bad
    print(f"  slide{i}: {n_txt:>3} text-runs, {n_pic} pics, "
          f"{len(offs)} placements, {bad} off-canvas")

print(f"\n  TOTAL: {total_text} text-runs, {total_pic} pictures, {off_canvas} off-canvas placements")

print()
print("=== Text-length sanity (longest runs per slide) ===")
for i in range(1, 7):
    xml = z.read(f"ppt/slides/slide{i}.xml").decode("utf-8", "replace")
    runs = re.findall(r"<a:t>(.*?)</a:t>", xml)
    runs.sort(key=len, reverse=True)
    print(f"  slide{i}: longest={len(runs[0]) if runs else 0} chars "
          f"-> {(runs[0][:60] + '...') if runs and len(runs[0])>60 else (runs[0] if runs else '')}")

print()
print("=== Relationship targets (images actually linked) ===")
for i in range(1, 7):
    rels = z.read(f"ppt/slides/_rels/slide{i}.xml.rels").decode("utf-8", "replace")
    imgs = re.findall(r'Target="\.\./(media/[^"]+)"', rels)
    print(f"  slide{i}: {imgs}")

sys.exit(0)
