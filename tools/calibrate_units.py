# -*- coding: utf-8 -*-
"""Empirically calibrate the audit's unit chain.

Builds a slide at the deck's own 13.3333 x 7.5 in size, drops in boxes of
KNOWN design-pixel widths, then reads back what box_of() reports. Also renders
Arial glyphs at several point sizes and measures them with PIL. That pins down
the two unknowns: design_px -> EMU/inch ratio, and PIL-px -> design_px ratio.
"""
from pptx import Presentation
from pptx.util import Inches
from pptx.enum.text import PP_ALIGN, MSO_AUTO_SIZE
from PIL import ImageFont
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_layout import box_of, PXM

prs = Presentation()
prs.slide_width = Inches(13.3333)
prs.slide_height = Inches(7.5)
s = prs.slides.add_slide(prs.slide_layouts[6])

print("--- box_of() vs design px ---")
for dpx in (144, 288, 720, 1000, 1920):
    tb = s.shapes.add_textbox(Inches(dpx / 144), Inches(0),
                              Inches(dpx / 144), Inches(1))
    b = box_of(tb)
    print(f"  wrote {dpx:5d} design-px -> box_of width = {b[2]:9.3f}")

print("\n--- font metrics (Arial Bold, size N) ---")
fb = r"C:\Windows\Fonts\arialbd.ttf"
for n in (12, 26, 72, 150):
    fe = ImageFont.truetype(fb, n)
    w = fe.getlength("WUZHEN")
    print(f"  size {n:4d}  'WUZHEN' = {w:7.1f} px (PIL, 96dpi)")

print("\n--- consistency check ---")
# If 1 design-px == X pt, then a font of `n` pt is n/X design px tall.
# PIL measures at 96dpi where 1 px == 1 pt, so getlength returns `pt` units.
# design_w = pil_w / X.
# box_of reports box in design px, so compare getlength*? == box_w.
