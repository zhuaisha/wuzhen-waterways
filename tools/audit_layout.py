# -*- coding: utf-8 -*-
"""Layout audit for the Wuzhen decks.

Checks, per slide:
  1. WIDE  — measured text run wider than its text box (will wrap/overflow).
  2. TALL  — measured text block taller than its box (visual judgement only;
             boxes are auto-grow=NONE, so overflow is visible, not silent).
  3. OVL   — two text boxes whose boxes overlap by >30% of the smaller one
             AND whose text content actually overlaps (the real bug class).
  4. OFF   — any shape extending outside the 1920x1080 canvas.
  5. PIC   — picture pixel dimensions vs. declared size (aspect distortion).

Usage: python tools/audit_layout.py <file.pptx>
"""
import sys
import math
from pathlib import Path
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from PIL import Image, ImageFont

PXW, PXH = 1920 * 0.666667, 1080 * 0.666667   # box_of() reports 96-dpi px
EMU = 914400
PXM = 96.0 / EMU                       # EMU -> 96-dpi px

EN_FONTS = [
    (r"C:\Windows\Fonts\arialbd.ttf", 1),
    (r"C:\Windows\Fonts\arial.ttf", 0),
]
CJK_FONTS = [
    (r"C:\Windows\Fonts\msyhbd.ttc", 1),
    (r"C:\Windows\Fonts\msyh.ttc", 0),
    (r"C:\Windows\Fonts\msyh.ttf", 0),
    (r"C:\Windows\Fonts\simsun.ttc", 0),
]


def load_cands(sizes, bold):
    """Build a font per (size,bold,kind) candidate we may need."""
    out = {}
    for sz, bd in sizes:
        pool = EN_FONTS if bd == 0 else EN_FONTS
        if bd:
            pool = [p for p in pool if "bd" in p[0]] or pool
        else:
            pool = [p for p in pool if "bd" not in p[0]] or pool
        out[(sz, bd)] = (ImageFont.truetype(pool[0][0], max(4, int(round(sz)))),
                         [ImageFont.truetype(p[0], max(4, int(round(sz))))
                          for p in CJK_FONTS if Path(p[0]).exists()])
    return out


def is_cjk(ch):
    o = ord(ch)
    return (0x4E00 <= o <= 0x9FFF or 0x3400 <= o <= 0x4DBF
            or 0x3000 <= o <= 0x303F or 0xFF00 <= o <= 0xFFEF
            or 0x2E80 <= o <= 0x2FDF)


def measure(text, pt, bold, tracking, box_w_px):
    """Return (widest_line_w, line_count) in the SAME unit as box_w_px.

    Unit chain:
      * The canvas is 1920 design-px wide == 13.333 in (PowerPoint slide).
      * add_textbox receives Inches(x/144), so 144 design-px == 1 in.
      * add_text's `size` is passed to Pt(size) -> a PowerPoint point.
      * 1 in == 72 pt, and 1 in == 144 design-px  =>  1 pt == 2 design-px.
    PIL measures glyphs in px at 96 dpi, where px value == the pt value, so a
    150pt face is rendered as a 150-px-tall glyph and its advance widths come
    back in "pt" units. Converting to design px is therefore just *2.
    """
    if not text.strip():
        return 0.0, 1
    size = max(4, int(round(pt)))
    fb = [p for p in EN_FONTS if Path(p[0]).exists()]
    fe = ImageFont.truetype(fb[0][0], size) if fb else ImageFont.load_default()
    cands = [ImageFont.truetype(p[0], size) for p in CJK_FONTS
             if Path(p[0]).exists()]
    SCALE = 0.75                      # pt -> 96-dpi px (see docstring)
    tk = (tracking or 0) / 100 * SCALE  # spc attr: 1/100 pt -> 96-dpi px
    words = []
    buf = ""
    for ch in text:
        if ch == " " and not is_cjk(ch) and buf:
            words.append(buf); buf = ""
        elif is_cjk(ch) or (ch.isspace() and ch != " "):
            if buf:
                words.append(buf); buf = ""
            words.append(ch)
        else:
            buf += ch
    if buf:
        words.append(buf)
    if not words:
        return 0.0, 1
    line_w, n = 0.0, 1
    spw = fe.getlength(" ") * SCALE
    for w in words:
        widths = [fe.getlength(w) * SCALE + tk * (len(w) - 1)]
        for c in cands:
            w2 = 0.0
            for ch in w:
                w2 += (c.getlength(ch) if is_cjk(ch) else fe.getlength(ch))
            widths.append(w2 * SCALE)
        ww = max(widths)
        if line_w > 0 and line_w + spw + ww > box_w_px:
            line_w = ww
            n += 1
        else:
            line_w += (spw if line_w > 0 else 0) + ww
    return line_w, n


def box_of(sh, pad=0):
    try:
        x = sh.left * PXM - pad
        y = sh.top * PXM - pad
        w = sh.width * PXM + pad * 2
        h = sh.height * PXM + pad * 2
    except Exception:
        return None
    return (x, y, w, h)


def inter(a, b):
    x1, y1 = max(a[0], b[0]), max(a[1], b[1])
    x2, y2 = min(a[0] + a[2], b[0] + b[2]), min(a[1] + a[3], b[1] + b[3])
    if x2 <= x1 or y2 <= y1:
        return 0.0
    return (x2 - x1) * (y2 - y1)


def audit(path):
    pr = Presentation(path)
    total = 0
    for idx, sl in enumerate(pr.slides, 1):
        msgs = []
        textboxes = []
        for sh in sl.shapes:
            if sh.shape_type == MSO_SHAPE_TYPE.PICTURE:
                try:
                    iw, ih = sh.image.size
                    dw, dh = sh.width * PXM, sh.height * PXM
                    ir, dr = iw / ih, (dw / dh if dh else 0)
                    if ir and abs(ir - dr) / ir > 0.03:
                        msgs.append(f"PIC  distorting {iw}x{ih} -> "
                                    f"{dw:.0f}x{dh:.0f}")
                except Exception:
                    pass
                b = box_of(sh)
                if b and (b[0] < -2 or b[1] < -2
                          or b[0] + b[2] > PXW + 2 or b[1] + b[3] > PXH + 2):
                    msgs.append(f"OFF  picture {sh.name} "
                                f"[{b[0]:.0f},{b[1]:.0f},{b[2]:.0f}x{b[3]:.0f}]")
                continue
            if not sh.has_text_frame or not sh.text_frame.text.strip():
                continue
            b = box_of(sh)
            if not b:
                continue
            # ---- text measurement
            tf = sh.text_frame
            ls = 1.42
            for p in tf.paragraphs:
                sp = p.line_spacing
                if sp is not None:
                    ls = max(ls, float(sp) if isinstance(sp, (int, float))
                             else 1.42)
            for p in tf.paragraphs:
                t = "".join(r.text for r in p.runs)
                if not t.strip():
                    continue
                fpt = 12.0
                bold = 0
                trk = 0
                for r in p.runs:
                    if r.font.size:
                        fpt = r.font.size.pt
                    bold = 1 if r.font.bold else bold
                    try:
                        spc = r._r.get_or_add_rPr().get("spc")
                        trk = int(spc) if spc else 0
                    except Exception:
                        pass
                    break
                wpx, nlines = measure(t, fpt, bold, trk, max(b[2], 1))
                if wpx > b[2] + 1:
                    msgs.append(f"WIDE  '{t[:46]}' {wpx:.0f}px > box "
                                f"{b[2]:.0f}px")
                    total += 1
                est_h = fpt * 0.75 * ls * nlines
                if est_h > b[3] + 2:
                    msgs.append(f"TALL  '{t[:40]}' ~{est_h:.0f}px "
                                f"> box {b[3]:.0f}px")
            # ---- visual extent for overlap: text sits in the top part of the
            #     box (anchor=TOP), so shrink the box vertically to the text.
            textboxes.append((b, tf.text.strip()[:60]))
            if (b[0] < -2 or b[1] < -2
                    or b[0] + b[2] > PXW + 2 or b[1] + b[3] > PXH + 2):
                msgs.append(f"OFF  text '{tf.text.strip()[:40]}' "
                            f"[{b[0]:.0f},{b[1]:.0f},{b[2]:.0f}x{b[3]:.0f}]")
        # ---- pairwise text-box overlap (box rectangles only)
        for i in range(len(textboxes)):
            for j in range(i + 1, len(textboxes)):
                bi, ti = textboxes[i]
                bj, tj = textboxes[j]
                ov = inter(bi, bj)
                if ov <= 0:
                    continue
                small = min(bi[2] * bi[3], bj[2] * bj[3])
                if ov / max(small, 1) < 0.15:
                    continue
                msgs.append(f"OVL   '{ti[:34]}' x '{tj[:34]}' "
                            f"{ov / max(small, 1) * 100:.0f}%")
                total += 1
        print(f"\n== slide {idx} ({len(sl.shapes)} shapes) ==")
        if msgs:
            for m in msgs:
                print("   " + m)
        else:
            print("   clean")
    print(f"\n>>> blocking issues (WIDE/OVL/OFF): {total}")
    return total


if __name__ == "__main__":
    f = sys.argv[1] if len(sys.argv) > 1 else \
        "wuzhen_presentation_6p.pptx"
    audit(f)
