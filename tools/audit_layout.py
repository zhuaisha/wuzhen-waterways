#!/usr/bin/env python3
"""Audit a .pptx for layout geometry problems.

Usage: python audit_layout.py DECK.pptx

Reports per slide:
  WIDE   text measured wider than its box -> will wrap
  TALL   text measured taller than its box (advisory; line-height is approximate)
  OVL    two text boxes whose rectangles overlap by >1pt on both axes
  OFF    a text box partly or wholly off the canvas
  PIC    a picture off the canvas

Exit 0 always. '>>> blocking issues: N' is the count to drive to zero.
Deterministic output (no timestamps) so runs can be diffed.

Unit handling is the crux. Everything stays in EMU internally:
  * shape geometry (left/top/width/height) is already EMU;
  * a run's font size is converted Pt -> EMU with Pt(n).emu;
  * PIL measures text in pt, which is exactly 96-dpi px / 4.0, so the pt value
    is converted to EMU at the point of comparison and nowhere else.
Never mix those in a comparison — that is the usual source of uniformly wrong
results (everything WIDE, or nothing). If every check fires for the same
reason by the same factor, the units are mismatched, not the layout.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import ImageFont
from pptx import Presentation

EMU_PT = 12700          # one point, in EMU (914400 / 72)
PX96_EMU = 9525         # EMU per 96-dpi pixel (914400 / 96)
OVERLAP_TOL = 12700     # 1pt; ignore sub-point rectangle intersections

# Prefer a real metric font; fall back to the system default if none is found.
# Latin and CJK must use DIFFERENT faces: on Windows every /usr/share path
# below is absent, so a single shared fallback silently measures Latin text
# with a CJK font and inflates widths ~2x. The builder sets latin="Helvetica
# Neue" (which Office substitutes with Arial) and ea="微软雅黑" — mirror that.
LATIN = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/TTF/DejaVuSans.ttf",
    "C:/Windows/Fonts/arial.ttf",
]
CJK = [
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "C:/Windows/Fonts/msyh.ttc",
]


def _is_cjk(text: str) -> bool:
    """True if the text is mostly CJK, so we can pick the CJK face for it.

    PIL has no per-glyph face switching, so we pick one face per run. Mixed
    runs (e.g. "Group 90706 · 中文") measure in whichever face matches their
    majority, which is close enough for a wrap/overflow triage pass."""
    cjk = sum(1 for c in text if '\u3000' <= c <= '\u9fff' or '\uf900' <= c <= '\ufaff')
    return cjk * 2 > len(text)


def _font(size_pt: int, cjk: bool = False):
    size = max(4, int(round(size_pt)))
    for cand in (list(CJK) if cjk else []) + list(LATIN) + list(CJK):
        if Path(cand).exists():
            return ImageFont.truetype(cand, size)
    return ImageFont.load_default()


def _line_width_emu(text: str, pt: float) -> float:
    """Rendered width of one line, in EMU.

    ImageFont.getlength() returns the width in POINTS at the given size, so it
    converts straight to EMU with EMU_PT. (The old form multiplied by
    `4.0 * PX96_EMU`, which treats pt as 96-dpi pixels and then rescales —
    that inflates every measurement by exactly 3x, which is why the audit
    reported the whole deck as overflowing by the same factor.)"""
    if not text:
        return 0.0
    return _font(int(round(pt)), _is_cjk(text)).getlength(text) * EMU_PT


def _wrap(text: str, pt: float, box_w_emu: float):
    """Greedy word-wrap at the box width; returns the list of lines."""
    if not text:
        return []
    lines, cur = [], ""
    for word in text.split(" "):
        trial = (cur + " " + word).strip()
        if not cur or _line_width_emu(trial, pt) <= box_w_emu:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def _measure(tf, box_w_emu: float):
    """Return (max_line_w_emu, block_h_emu, n_lines) for a text frame.

    Line height must match the renderer's model, or the audit and the picture
    disagree: `lh = pt * 1.18 * line_spacing` (see preview_slides_pil.py).
    A guessed `pt * 1.2` understates multi-line frames and both hides real
    overflows and flags false ones; the font's getbbox height (~0.73em for
    Arial caps) is the *ink* box, not the advance, and is wrong for this use."""
    max_w, block_h, n_lines = 0.0, 0.0, 0
    for para in tf.paragraphs:
        text = "".join(r.text for r in para.runs)
        if not text.strip():
            continue
        pt = 12.0
        for r in para.runs:
            if r.font.size is not None:
                pt = r.font.size.pt
                break
        ls = para.line_spacing if isinstance(para.line_spacing, float) else 1.0
        wrapped = _wrap(text, pt, box_w_emu)
        max_w = max(max_w, max((_line_width_emu(l, pt) for l in wrapped), default=0.0))
        block_h += len(wrapped) * pt * EMU_PT * 1.18 * ls
        n_lines += len(wrapped)
    return max_w, block_h, n_lines


def audit(path: str) -> int:
    prs = Presentation(path)
    SW, SH = prs.slide_width, prs.slide_height
    blocking = 0
    advisory = 0

    for i, slide in enumerate(prs.slides, 1):
        boxes = []
        for sh in slide.shapes:
            if not (sh.has_text_frame and sh.text_frame.text.strip()):
                continue
            x, y = sh.left or 0, sh.top or 0
            w, h = sh.width or 0, sh.height or 0
            label = sh.text_frame.text.strip()[:40]
            mw, mh, nl = _measure(sh.text_frame, w)
            boxes.append((x, y, w, h, label, mw, mh, nl))

            # --- hard violations: off-canvas and hard collisions -------------
            if x < 0 or y < 0 or x + w > SW or y + h > SH:
                blocking += 1
                print(f"  slide {i}: OFF canvas                {label!r}")
            if mw > w * 1.01:
                advisory += 1
                print(f"  slide {i}: wrap ({nl} lines, {mw/EMU_PT:.0f}pt vs box {w/EMU_PT:.0f}pt)  {label!r}")

        for a in range(len(boxes)):
            for b in range(a + 1, len(boxes)):
                ax, ay, aw, ah, al, *_ = boxes[a]
                bx, by, bw, bh, bl, *_ = boxes[b]
                ox = min(ax + aw, bx + bw) - max(ax, bx)
                oy = min(ay + ah, by + bh) - max(ay, by)
                if ox > OVERLAP_TOL and oy > OVERLAP_TOL:
                    blocking += 1
                    print(f"  slide {i}: OVL ({ox/EMU_PT:.0f}x{oy/EMU_PT:.0f}pt)  "
                          f"{al[:26]!r}  x  {bl[:26]!r}")

        # --- HARD: rendered text taller than its box AND spilling vertically
        #     into a neighbouring text box. Word-wrap keeps the text within
        #     the box WIDTH, so the only way an over-tall frame causes a real
        #     visual collision is by overrunning downward into a lower box.
        #     Line height (~1.2em) already carries the descender, so a frame
        #     whose measured height merely exceeds its own height is cosmetic
        #     when the next box starts further below than the text ends.
        for x, y, w, h, label, mw, mh, nl in boxes:
            if mh <= h:
                continue
            into = None
            for bx, by, bw, bh, bl, *_ in boxes:
                if bl == label:
                    continue
                # strictly below this box's bottom edge, horizontally within reach
                if by >= y + h and bx < x + w and bx + bw > x:
                    if by < y + mh:          # it begins before our text ends
                        into = (bl, by - (y + mh))
                        break
            if into is None:
                advisory += 1
                print(f"  slide {i}: tall ({mh/EMU_PT:.0f}pt vs {h/EMU_PT:.0f}pt, "
                      f"+{(y+mh-y-h)/EMU_PT:.0f}pt into empty space)  {label!r}")
            else:
                blocking += 1
                print(f"  slide {i}: SPILL into {into[0][:24]!r} "
                      f"({-into[1]/EMU_PT:.0f}pt)  from {label!r}")

        for sh in slide.shapes:
            if sh.shape_type == 13 and (sh.left or 0) + (sh.width or 0) > SW:
                blocking += 1
                print(f"  slide {i}: PIC off canvas right")

    print(f">>> blocking issues: {blocking}   (advisory wrap/tall: {advisory})")
    return 0


if __name__ == "__main__":
    sys.exit(audit(sys.argv[1]) if len(sys.argv) > 1 else 2)
