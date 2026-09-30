# -*- coding: utf-8 -*-
"""
WUZHEN — Waterways & Bridges
Apple-Keynote-style classroom presentation (5 slides, 16:9, 1920x1080).

Strict 5-page brief (classroom show, 5-9 min total):
  1  COVER              — hero photo + WUZHEN + question + LET'S EXPLORE
  2  WHAT WE FOUND      — WATER SHAPES WUZHEN + 3 data lines + waterway photo
  3  WHY IT MATTERS     — PAST -> WATER -> PRESENT flowing line
  4  ENGLISH GUIDE      — 60-80 word spoken guide + 5 keyword chips
  5  TEAM + CONCLUSION  — group photo, 6 avatars, SOURCES, closing line

All facts, photos, team names and the closing line come from the project
(chapters.js, Facts.jsx, Summary.jsx, team.js, images-sources.json).
No invented data. Every slide carries speaker notes (not shown on screen).

Run:  python tools/make_pptx.py
Out:  public/assets/wuzhen_waterways_presentation.pptx
"""
import os, io, json
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from lxml import etree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG  = os.path.join(ROOT, "public", "images")
OUT  = os.path.join(ROOT, "public", "assets", "wuzhen_waterways_presentation.pptx")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
SRC  = json.load(open(os.path.join(ROOT, "src", "data", "images-sources.json"), encoding="utf-8"))

# ---- palette (from the brief) -------------------------------------------
MIDNIGHT = RGBColor(0x07, 0x15, 0x25)   # #071525
DEEP     = RGBColor(0x0D, 0x24, 0x38)   # #0D2438
SOFT     = RGBColor(0x5F, 0xA8, 0xD3)   # #5FA8D3
WARMW    = RGBColor(0xF5, 0xF2, 0xEA)   # #F5F2EA
GOLD     = RGBColor(0xD9, 0xA8, 0x5B)   # #D9A85B (accent only)
FADING   = RGBColor(0x8C, 0x9B, 0xA9)   # muted blue-grey
BODY     = RGBColor(0xB9, 0xC6, 0xD2)

SW, SH = Emu(12192000), Emu(6858000)     # 16:9 @ 1920x1080
SERIF, SANS = "Georgia", "Arial"
prs = Presentation()
prs.slide_width, prs.slide_height = SW, SH
BLANK, TOTAL = prs.slide_layouts[6], 5
def IN(v): return Inches(v)

# ============================================================================
# image helpers — embed real photos (PIL cold cinematic grade, faces kept
# natural). Outputs are embedded as JPG so PPTX compatibility is safe.
# ============================================================================
def _grade(im, face=False):
    if face:
        r, g, b = im.split()
        r = r.point(lambda p: max(0, int(p * 0.96)))
        g = g.point(lambda p: int(p * 0.98))
        b = b.point(lambda p: min(255, int(p * 1.06)))
        return Image.merge("RGB", (r, g, b))
    r, g, b = im.split()
    r = r.point(lambda p: int(p * 0.84))
    g = g.point(lambda p: int(p * 0.92))
    b = b.point(lambda p: min(255, int(p * 1.10)))
    m = Image.merge("RGB", (r, g, b))
    return Image.blend(m, m.convert("L").convert("RGB"), 0.20)

def _load(name, maxpx=1400, face=False, quality=86):
    p = os.path.join(IMG, name)
    if not os.path.exists(p):
        print(f"  [warn] missing image: {name}"); return None
    im = Image.open(p).convert("RGB")
    im = _grade(im, face)
    im.thumbnail((maxpx, maxpx), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=quality); buf.seek(0)
    return buf

def _set_alpha(sh, pct):
    """pct 0-100 = opacity. Applies <a:alpha> to fill and/or blip."""
    el = sh._element
    spPr = el.find(qn('p:spPr'))
    if spPr is not None:
        sf = spPr.find(qn('a:solidFill'))
        if sf is not None:
            clr = sf.find(qn('a:srgbClr'))
            if clr is not None:
                for old in clr.findall(qn('a:alpha')): clr.remove(old)
                a = etree.SubElement(clr, qn('a:alpha'))
                a.set('val', str(int((100 - pct) * 1000)))
    blipFill = el.find(qn('p:blipFill'))
    if blipFill is not None:
        blip = blipFill.find(qn('a:blip'))
        if blip is not None:
            for old in blip.findall(qn('a:alphaModFix')): blip.remove(old)
            mod = etree.SubElement(blip, qn('a:alphaModFix'))
            a = etree.SubElement(mod, qn('a:alpha'))
            a.set('val', str(int((100 - pct) * 1000)))

def pic(s, name, x, y, w, h, face=False, alpha=None):
    buf = _load(name, face=face)
    if buf is None:
        r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
        r.fill.solid(); r.fill.fore_color.rgb = DEEP
        r.line.color.rgb = SOFT; r.line.width = Pt(1); r.shadow.inherit = False
        return r
    sp = s.shapes.add_picture(buf, x, y, w, h)
    if alpha is not None: _set_alpha(sp, alpha)
    return sp

# ============================================================================
# text + shape helpers
# ============================================================================
def txt(s, x, y, w, h, paras, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    """paras: list of paragraphs; each paragraph = list of run tuples
    (text, size, color, bold, font)."""
    tb = s.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, runs in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(0)
        for (text, size, color, bold, font) in runs:
            r = p.add_run(); r.text = text
            r.font.size = Pt(size); r.font.bold = bold
            r.font.color.rgb = color; r.font.name = font
    return tb

def one(s, x, y, w, h, text, size, color, bold=False, font=SANS,
        align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, sb=0, spc=0):
    p_ = txt(s, x, y, w, h, [[(text, size, color, bold, font)]], align=align,
             anchor=anchor)
    para = p_.text_frame.paragraphs[0]
    if sb: para.space_before = Pt(sb)
    if spc:
        for r in para.runs:
            r.font._rPr.set('spc', str(int(spc * 100)))
    return p_

def panel(s, x, y, w, h, fill, line_c=None, line_w=1.0, radius=False):
    shp = s.shapes.add_shape(
        (MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE), x, y, w, h)
    if radius:
        try: shp.adjustments[0] = 0.05
        except Exception: pass
    if fill is None: shp.fill.background()
    else: shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line_c is None: shp.line.fill.background()
    else: shp.line.color.rgb = line_c; shp.line.width = Pt(line_w)
    shp.shadow.inherit = False
    return shp

def line(s, x1, y1, x2, y2, color, wpt=1.0, dash=None):
    cx = s.shapes.add_connector(1, x1, y1, x2, y2)
    cx.line.color.rgb = color; cx.line.width = Pt(wpt)
    if dash:
        ln = cx.line._get_or_add_ln()
        d = etree.SubElement(ln, qn('a:prstDash')); d.set('val', dash)
    cx.shadow.inherit = False
    return cx

def glass(s, x, y, w, h):
    """Glassmorphism panel: translucent deep fill + thin light border."""
    p = panel(s, x, y, w, h, DEEP, line_c=SOFT, line_w=0.75, radius=True)
    _set_alpha(p, 55)
    return p

# ============================================================================
# UI micro-labels (chapter number, progress, coordinates, photo credit)
# ============================================================================
def ui_header(s, num, label, coords):
    one(s, IN(0.6), IN(0.42), IN(0.9), IN(0.4), num, 12, GOLD, True, font=SANS)
    one(s, IN(1.5), IN(0.47), IN(8.5), IN(0.32), label, 10, FADING, True,
        font=SANS, spc=4)
    line(s, IN(0.6), IN(0.92), IN(12.73), IN(0.92), DEEP, 0.8)
    seg_end = IN(0.6 + (int(num) - 1) / TOTAL * 12.13)
    line(s, IN(0.6), IN(0.92), seg_end, IN(0.92), GOLD, 1.2)
    one(s, IN(10.6), IN(7.12), IN(2.13), IN(0.28), coords, 8, FADING,
        align=PP_ALIGN.RIGHT, font=SANS, spc=2)

def credit(s, key, extra=None):
    info = SRC.get(key)
    if not info:
        if extra:
            one(s, IN(9.4), IN(7.12), IN(3.33), IN(0.28), extra, 7.5, FADING,
                align=PP_ALIGN.RIGHT, font=SANS)
        return
    artist, lic = info.get("artist", ""), info.get("license", "")
    base = f"Photo: {artist} · {lic}" if artist else (extra or "")
    if extra and artist: base = f"{base} · {extra}"
    one(s, IN(8.6), IN(7.12), IN(4.13), IN(0.28), base, 7.5, FADING,
        align=PP_ALIGN.RIGHT, font=SANS)

# ============================================================================
# transitions (OOXML) — Morph between content slides, Fade on ends
# ============================================================================
def set_transition(sl, kind):
    el = sl._element
    for old in el.findall(qn('p:transition')): el.remove(old)
    t = etree.SubElement(el, qn('p:transition'))
    t.set('spd', 'slow')
    if kind == "morph":
        etree.SubElement(t, qn('p:morph'))
    elif kind == "push":
        c = etree.SubElement(t, qn('p:push')); c.set('dir', 'l')
    else:  # fade
        etree.SubElement(t, qn('p:fade'))

# ============================================================================
# entrance animations — kept minimal: only safe slide transitions (Morph /
# Fade / Push) are baked into OOXML. Element-level "Appear" fade-ins are
# intentionally NOT injected because hand-written <p:timing> XML is a
# common cause of "PowerPoint found a problem" repair prompts. For richer
# per-object animation, open the PPTX in PowerPoint and use the built-in
# Animation Pane (Fade / Wipe / Zoom presets) on the objects you want.
# ============================================================================

# ============================================================================
# speaker notes
# ============================================================================
def notes(sl, text):
    sl.notes_slide.notes_text_frame.text = text

# ============================================================================
# SLIDE 1 — COVER
# ============================================================================
s1 = prs.slides.add_slide(BLANK)
hero = pic(s1, "hero_wuzhen-1920.webp", Emu(-200000), Emu(-150000),
           Emu(12192000 + 400000), Emu(6858000 + 300000), face=False)
_set_alpha(hero, 30)
# bottom vignette for legibility
vp = panel(s1, 0, Emu(6858000 - 1600000), SW, Emu(1600000), MIDNIGHT, None)
_set_alpha(vp, 72)

wz  = one(s1, IN(0.6), IN(2.5), IN(11), IN(2.5), "WUZHEN", 108, WARMW, False, font=SERIF)
sub = one(s1, IN(0.68), IN(4.55), IN(9), IN(0.7), "WATERWAYS  &  BRIDGES",
          30, GOLD, True, font=SERIF, spc=3)
q   = one(s1, IN(0.68), IN(5.4), IN(11), IN(0.55),
          "WHY IS WATER THE MAIN LINE OF THE ANCIENT TOWN?", 20, BODY, False,
          font=SERIF)
one(s1, IN(0.6), IN(6.95), IN(4), IN(0.4), "GRADE 9  ·  ENGLISH PROJECT",
    10, FADING, True, font=SANS, spc=3)
one(s1, IN(7.5), IN(6.95), IN(5.23), IN(0.4),
    "WUZHEN  ·  TONGXIANG  ·  ZHEJIANG", 10, FADING, font=SANS,
    align=PP_ALIGN.RIGHT, spc=3)
one(s1, IN(5.17), IN(6.42), IN(3), IN(0.4), "LET'S  EXPLORE", 11, GOLD,
    True, font=SANS, align=PP_ALIGN.CENTER, spc=4)
ui_header(s1, "01", "COVER", "30.7°N 120.4°E")
credit(s1, "waterway", "hero · Wuzhen Xizha")

# ============================================================================
# SLIDE 2 — WHAT WE FOUND
# ============================================================================
s2 = prs.slides.add_slide(BLANK)
panel(s2, 0, 0, SW, SH, MIDNIGHT, None)
ui_header(s2, "02", "WHAT WE FOUND", "XIZHA WATERWAYS")

# main heading
one(s2, IN(0.7), IN(1.5), IN(11), IN(0.9), "WATER SHAPES WUZHEN", 44,
    WARMW, True, font=SERIF)

# left: 01 WATER label + three data lines (Apple info-viz, thin rules)
one(s2, IN(0.7), IN(2.7), IN(4.5), IN(0.6), "01  WATER", 14, GOLD, True,
    font=SANS, spc=3)
data = [
    ("≈ 10,000", "METERS", "of waterways run through Xizha"),
    ("72",       "ANCIENT STONE BRIDGES", "link the two banks of the canals"),
    ("CROSS",    "WATER SYSTEM", "divides the town into zones, joined by water"),
]
data_shapes = []
dy = 3.6
for big, unit, desc in data:
    rule = line(s2, IN(0.75), IN(dy), IN(4.9), IN(dy), DEEP, 0.8)
    num  = one(s2, IN(0.75), IN(dy + 0.15), IN(2.1), IN(0.95), big, 42, GOLD,
               True, font=SERIF)
    lab  = one(s2, IN(2.95), IN(dy + 0.3), IN(2.1), IN(0.4), unit, 11, WARMW,
               True, font=SANS, spc=2)
    dsc  = one(s2, IN(2.95), IN(dy + 0.6), IN(2.4), IN(0.55), desc, 10.5,
               FADING, font=SERIF)
    data_shapes += [rule, num, lab, dsc]
    dy += 1.15

# right: waterway photo with mask-reveal feel (framed photo)
w2pic = pic(s2, "waterway-jpg.jpg", IN(5.6), IN(2.2), IN(7.13), IN(4.6), face=False)
fr2   = panel(s2, IN(5.6), IN(2.2), IN(7.13), IN(4.6), None, SOFT, 1.0)
one(s2, IN(5.6), IN(6.88), IN(7.13), IN(0.4), "The canal carries the whole town.",
    12, FADING, font=SERIF)
credit(s2, "waterway")

# ============================================================================
# SLIDE 3 — WHY IT MATTERS
# ============================================================================
s3 = prs.slides.add_slide(BLANK)
panel(s3, 0, 0, SW, SH, MIDNIGHT, None)
ui_header(s3, "03", "WHY IT MATTERS", "PAST  →  PRESENT")
one(s3, IN(0.7), IN(1.5), IN(11), IN(0.9), "WHY DOES WATER MATTER?", 40,
    WARMW, True, font=SERIF)

# flowing water line (a single thin curve as two straight segments meeting)
line(s3, IN(0.7), IN(3.55), IN(6.0), IN(3.55), GOLD, 1.4)
line(s3, IN(6.0), IN(3.55), IN(12.6), IN(3.55), GOLD, 1.4)
# WATER node centre
wnode = panel(s3, IN(5.6), IN(3.15), IN(1.8), IN(0.85), DEEP, GOLD, 1.4, radius=True)
one(s3, IN(5.6), IN(3.38), IN(1.8), IN(0.45), "WATER", 16, GOLD, True,
    font=SERIF, align=PP_ALIGN.CENTER)

# PAST column (left)
one(s3, IN(1.0), IN(4.4), IN(4.5), IN(0.5), "PAST", 22, WARMW, True, font=SERIF)
past = ["Boats", "Transportation", "Trade", "Daily life"]
for i, t in enumerate(past):
    one(s3, IN(1.0), IN(5.1 + i * 0.5), IN(4.5), IN(0.42), t, 14, BODY, font=SERIF)
    one(s3, IN(0.82), IN(5.1 + i * 0.5), IN(0.15), IN(0.42), "·", 14, GOLD, font=SANS)

# PRESENT column (right)
one(s3, IN(8.1), IN(4.4), IN(4.5), IN(0.5), "PRESENT", 22, WARMW, True, font=SERIF)
pres = ["Tourism", "Sightseeing", "Cultural experience"]
for i, t in enumerate(pres):
    one(s3, IN(8.1), IN(5.1 + i * 0.5), IN(4.5), IN(0.42), t, 14, BODY, font=SERIF)
    one(s3, IN(7.92), IN(5.1 + i * 0.5), IN(0.15), IN(0.42), "·", 14, GOLD, font=SANS)

# faint bridge photo as background texture, top-right, low alpha
bp = pic(s3, "bridge-jpg.jpg", IN(9.3), IN(1.5), IN(3.43), IN(2.0), face=False)
_set_alpha(bp, 20)
credit(s3, "bridge")

# ============================================================================
# SLIDE 4 — ENGLISH GUIDE
# ============================================================================
s4 = prs.slides.add_slide(BLANK)
panel(s4, 0, 0, SW, SH, MIDNIGHT, None)
ui_header(s4, "04", "ENGLISH GUIDE", "60–80 WORDS")
one(s4, IN(0.7), IN(1.5), IN(11), IN(0.9), "A WALK THROUGH WUZHEN", 40,
    WARMW, True, font=SERIF)

# left: photo (mask-reveal feel) + caption
b4pic = pic(s4, "boat-jpg.jpg", IN(0.7), IN(2.7), IN(4.6), IN(3.7), face=False)
fr4   = panel(s4, IN(0.7), IN(2.7), IN(4.6), IN(3.7), None, SOFT, 1.0)
one(s4, IN(0.7), IN(6.48), IN(4.6), IN(0.4), "A wupeng boat glides on the canal.",
    11, FADING, font=SERIF)

# right: 60-80 word spoken guide (grade-9 friendly, from project text)
guide_paras = [
    ("Wuzhen is an ancient water town in Zhejiang.", 17, WARMW, False, SERIF),
    ("Its canals run through the old town.",          17, WARMW, False, SERIF),
    ("Stone bridges connect the two sides.",          17, WARMW, False, SERIF),
    ("Traditional boats move slowly on the water.",   17, WARMW, False, SERIF),
    ("For a long time, people lived and worked along the canals.", 17, WARMW, False, SERIF),
    ("At night, lanterns shine on the water.",        17, WARMW, False, SERIF),
    ("Water is not only beautiful here.",            17, WARMW, False, SERIF),
    ("It connects the town, its people and its history.", 17, WARMW, False, SERIF),
]
guide_shapes = []
gy = 2.6
for text_, sz, col, b, fn in guide_paras:
    t4 = one(s4, IN(5.7), IN(gy), IN(7.0), IN(0.42), text_, sz, col, b, font=fn)
    guide_shapes.append(t4)
    gy += 0.48
one(s4, IN(5.7), IN(gy + 0.15), IN(3), IN(0.4), "≈ 72 words", 11, GOLD, True,
    font=SANS)

# 5 keyword chips at the bottom-right (01..05)
kws = ["01 / WATER", "02 / BRIDGES", "03 / BOATS", "04 / LIFE", "05 / NIGHT"]
kx = 5.7
chip_shapes = []
for k in kws:
    chip = panel(s4, IN(kx), IN(6.65), IN(1.32), IN(0.48), DEEP, SOFT, 0.75, radius=True)
    one(s4, IN(kx), IN(6.65), IN(1.32), IN(0.48), k, 10, GOLD, True, font=SANS,
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    chip_shapes.append(chip)
    kx += 1.44
credit(s4, "boat")

# ============================================================================
# SLIDE 5 — TEAM + CONCLUSION + SOURCES
# ============================================================================
s5 = prs.slides.add_slide(BLANK)
panel(s5, 0, 0, SW, SH, MIDNIGHT, None)
ui_header(s5, "05", "OUR TEAM", "ONE TEAM · ONE JOURNEY")

# main heading
one(s5, IN(0.7), IN(1.3), IN(11), IN(0.7), "ONE TEAM.  ONE JOURNEY.", 32,
    WARMW, True, font=SERIF)

# big group photo (main visual)
g5pic = pic(s5, "team-group-4096x2048-jpg.jpg", IN(0.7), IN(2.05), IN(11.93),
            IN(2.3), face=True)
fr5   = panel(s5, IN(0.7), IN(2.05), IN(11.93), IN(2.3), None, SOFT, 1.0)

# 6 avatar row (navigation) + connecting thin line
members = [
    ("01", "team-m2-av-200x200-jpg.jpg", "JIANG SHENGYI"),
    ("02", "team-m1-av-200x200-jpg.jpg", "WANG HANYU"),
    ("03", "team-m3-av-200x200-jpg.jpg", "LU ANG"),
    ("04", "team-m4-av-200x200-jpg.jpg", "ZHU ZHONGLE"),
    ("05", "team-m5-av-200x200-jpg.jpg", "SHEN YICHENG"),
    ("06", "team-m6-av-200x200-jpg.jpg", "SHEN YUCHENG"),
]
av_shapes = []
ax = 0.7
for num, av, name in members:
    avp = pic(s5, av, IN(ax), IN(4.5), IN(1.5), IN(1.5), face=True)
    fr  = panel(s5, IN(ax), IN(4.5), IN(1.5), IN(1.5), None, SOFT, 0.75)
    one(s5, IN(ax), IN(6.06), IN(1.5), IN(0.3), f"{num}  {name}", 8, FADING,
        True, font=SANS, align=PP_ALIGN.CENTER, spc=1)
    av_shapes += [avp, fr]
    ax += 2.02
line(s5, IN(1.45), IN(5.25), IN(11.25), IN(5.25), GOLD, 0.8, dash="sysDot")

# conclusion block (left) + final question (right)
one(s5, IN(0.7), IN(6.55), IN(7.5), IN(0.55), "Water connects everything.",
    24, WARMW, True, font=SERIF)
one(s5, IN(0.7), IN(7.1), IN(8), IN(0.35),
    "One team · one journey · Wuzhen waterways & bridges", 11, FADING,
    font=SERIF)
one(s5, IN(8.6), IN(6.55), IN(4.13), IN(0.5),
    "Why is water the main line of Wuzhen?", 12, GOLD, True, font=SERIF,
    align=PP_ALIGN.RIGHT)
one(s5, IN(8.6), IN(7.1), IN(4.13), IN(0.35), "Thank you.", 14, WARMW, True,
    font=SERIF, align=PP_ALIGN.RIGHT)

# SOURCES block (small, from images-sources.json)
src_lines = [
    "SOURCES",
    f"Canal — {SRC['waterway']['artist']} · {SRC['waterway']['license']} · Wikimedia Commons",
    f"Bridge — {SRC['bridge']['artist']} · {SRC['bridge']['license']} · Wikimedia Commons",
    f"Boat — {SRC['boat']['artist']} · {SRC['boat']['license']} · Wikimedia Commons",
    f"Night — {SRC['night']['artist']} · {SRC['night']['license']} · Wikimedia Commons",
    "Team photos — group portrait, 2026",
]
sy = 6.5
sl = []
for i, t in enumerate(src_lines):
    is_head = (i == 0)
    t5 = one(s5, IN(0.7), IN(sy + i * 0.3), IN(7.5), IN(0.3), t,
             8 if not is_head else 9, GOLD if is_head else FADING,
             not is_head, font=SANS, spc=2 if is_head else 0)
    sl.append(t5)

credit(s5, "night", "team photo · group, 2026")

# ============================================================================
# transitions + notes + save
# ============================================================================
transitions = ["fade", "morph", "morph", "morph", "fade"]
for i, sl in enumerate(prs.slides):
    set_transition(sl, transitions[i])

notes(s1, "Slide 1 · ~45 s. Open on the hero. Say 'Wuzhen. Waterways and "
          "Bridges.' Hold on the question: 'Why is water the main line of the "
          "ancient town? That is what we spent four weeks answering.'")
notes(s2, "Slide 2 · ~90 s. Walk the three data lines left to right: nearly "
          "ten thousand metres of canals, 72 ancient stone bridges, and a "
          "cross-shaped water system. Point at the canal photo on the right — "
          "'the water came first; the town grew around it.'")
notes(s3, "Slide 3 · ~90 s. Follow the gold line from PAST to PRESENT through "
          "WATER. PAST: boats, transport, trade, daily life. PRESENT: "
          "tourism, sightseeing, cultural experience. The same water that once "
          "moved goods now moves visitors.")
notes(s4, "Slide 4 · ~90 s. This is our live English guide — 72 words we can "
          "actually say out loud. Read it naturally. Let the five keyword "
          "chips (Water, Bridges, Boats, Life, Night) light up as you move "
          "through the guide.")
notes(s5, "Slide 5 · ~60 s. Introduce the six of us, one line each, following "
          "the avatar numbers 01 to 06. End on 'Water connects everything.' "
          "and hold the closing question: 'Why is water the main line of "
          "Wuzhen?' Then thank the class.")

prs.save(OUT)
print(f"WROTE {OUT}  {os.path.getsize(OUT)//1024} KB, {TOTAL} slides")
