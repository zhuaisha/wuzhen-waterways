# -*- coding: utf-8 -*-
"""
Build wuzhen_waterways_presentation.pptx (10 slides, 16:9).

Slides
  1  COVER            hero photo + title + members
  2  THE CORE QUESTION 4 reasoning cards
  3  WHAT WE FOUND    3 facts + photo
  4  WHY WATER        diagram + 2 photos + quote
  5  KEYWORDS         word cloud (EN + CN)
  6  THE JOURNEY      6 chapters
  7  OUR ENGLISH GUIDE 60-80 word guide + night photo
  8  THE CHALLENGE    3 interaction cards
  9  SHOW-DAY ROLES   5 roles grid
 10  SOURCES & CLOSING

Images: local JPG photos (PIL-resized, embedded).
Run:  python tools/make_pptx.py
"""
import os, sys, io
from PIL import Image, ImageOps
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG  = os.path.join(ROOT, "public", "images")
OUT  = os.path.join(ROOT, "public", "assets", "wuzhen_waterways_presentation.pptx")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
TMP  = os.path.join(ROOT, ".pptx_tmp"); os.makedirs(TMP, exist_ok=True)

# ---- palette (site: deep water + lantern gold + warm paper) -------------
NIGHT   = RGBColor(0x0A, 0x1C, 0x2B)
DEEP    = RGBColor(0x06, 0x0F, 0x1A)
PAPER   = RGBColor(0xF5, 0xF0, 0xE3)
WARM    = RGBColor(0xE8, 0xE5, 0xDC)
LANTERN = RGBColor(0xD7, 0xAD, 0x69)
MUTED   = RGBColor(0x8A, 0x9A, 0xA8)
INK     = RGBColor(0x14, 0x26, 0x34)
BODY    = RGBColor(0x2B, 0x3A, 0x48)

W, H = Inches(13.333), Inches(7.5)
SERIF = "Georgia"; SANS = "Arial"; CJK = "Microsoft YaHei"

prs = Presentation()
prs.slide_width, prs.slide_height = W, H
BLANK = prs.slide_layouts[6]
TOTAL = 10

def snew():
    return prs.slides.add_slide(BLANK)

def bg(s, c):
    s.background.fill.solid(); s.background.fill.fore_color.rgb = c

def add_pic(s, name, x, y, w, h, max_px=1000, alpha=1.0):
    """Embed a local photo, resized + optionally dimmed. Returns None on miss."""
    p = os.path.join(IMG, name)
    if not os.path.exists(p):
        print(f"  [warn] image missing: {name}", flush=True); return None
    im = Image.open(p).convert("RGB")
    im.thumbnail((max_px, max_px))
    if alpha < 1.0:
        veil = Image.new("RGB", im.size, (10, 26, 43))
        im = Image.blend(im, veil, 1.0 - alpha)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=88)
    buf.seek(0)
    return s.shapes.add_picture(buf, x, y, w, h)

def tbox(s, x, y, w, h, paras, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    """paras: list of list-of-runs; run = (text, size, color, bold, font)."""
    tb = s.shapes.add_textbox(x, y, w, h); tf = tb.text_frame
    tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, runs in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(2)
        for (text, size, color, bold, font) in runs:
            r = p.add_run(); r.text = text
            r.font.size = Pt(size); r.font.bold = bold
            r.font.color.rgb = color; r.font.name = font
    return tb

def one(s, x, y, w, h, text, size, color, bold=False, font=SERIF,
        align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, sb=0):
    if sb:
        tb = tbox(s, x, y, w, h, [[(text, size, color, bold, font)]],
                  align=align, anchor=anchor)
        tb.text_frame.paragraphs[0].space_before = Pt(sb)
        return tb
    return tbox(s, x, y, w, h, [[(text, size, color, bold, font)]],
                align=align, anchor=anchor)

def rect(s, x, y, w, h, fill, line=None, line_w=1.5):
    shp = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    if fill is None: shp.fill.background()
    else: shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line is None: shp.line.fill.background()
    else: shp.line.color.rgb = line; shp.line.width = Pt(line_w)
    shp.shadow.inherit = False
    return shp

def frame(s, x, y, w, h, line=LANTERN, lw=1.5):
    rect(s, x, y, w, h, None, line, lw)

def pic(s, name, x, y, w, h, cap="", alpha=1.0):
    sp = add_pic(s, name, x, y, w, h, alpha=alpha)
    frame(s, x, y, w, h)
    if cap and sp:
        one(s, x, y + h + Pt(4), w, Inches(0.3), cap, 9, MUTED, font=SANS)
    return sp

def footer(s, n, dark=False):
    rule_c = LANTERN if (n <= 2 or dark) else WARM
    rect(s, Inches(0.55), Inches(6.98), Inches(12.23), Pt(1.4), rule_c)
    one(s, Inches(0.55), Inches(7.08), Inches(7), Inches(0.3),
        "907G6  ·  WUZHEN WATERWAYS & BRIDGES", 9, MUTED, font=SANS)
    one(s, Inches(11.4), Inches(7.08), Inches(1.38), Inches(0.3),
        f"{n:02d} / {TOTAL:02d}", 9, LANTERN, True, font=SANS,
        align=PP_ALIGN.RIGHT)

def eyebrow(s, n, label, cn=""):
    one(s, Inches(0.55), Inches(0.42), Inches(1.4), Inches(0.5),
        f"{n:02d}", 20, LANTERN, True, font=SERIF)
    one(s, Inches(1.25), Inches(0.52), Inches(11), Inches(0.34),
        label, 11, MUTED, True, font=SANS)
    if cn:
        one(s, Inches(1.25), Inches(0.78), Inches(11), Inches(0.34),
            cn, 11.5, MUTED, False, font=CJK)
    rect(s, Inches(0.55), Inches(1.18), Inches(12.23), Pt(1.1), WARM)

# ============================================================================
# SLIDE 1 — COVER
# ============================================================================
s = snew(); bg(s, DEEP)
add_pic(s, "hero_wuzhen-1920.webp", 0, 0, W, H, max_px=1280, alpha=0.55)
rect(s, 0, 0, W, H, DEEP, None)  # extra bottom fade not possible; keep simple
rule = rect(s, Inches(0.85), Inches(1.7), Inches(0.9), Pt(3), LANTERN)
one(s, Inches(0.85), Inches(1.95), Inches(8), Inches(0.4),
    "GROUP 907  ·  NINTH-GRADE ENGLISH PBL  ·  2026", 11, LANTERN, True, font=SANS)
one(s, Inches(0.85), Inches(2.6), Inches(11.5), Inches(1.5),
    "WUZHEN", 72, PAPER, False, font=SERIF)
one(s, Inches(0.9), Inches(3.95), Inches(11.5), Inches(0.7),
    "Waterways & Bridges", 30, LANTERN, True, font=SERIF)
one(s, Inches(0.9), Inches(4.75), Inches(11.5), Inches(0.5),
    "Why is water the main line of the ancient town?", 16, WARM, font=SERIF)
rect(s, Inches(0.9), Inches(5.45), Inches(2.4), Pt(2), LANTERN)
one(s, Inches(0.9), Inches(5.65), Inches(11.5), Inches(0.4),
    "JIANG SHENGYI · WANG HANYU · LU ANG · ZHU ZHONGLE · SHEN YICHENG · SHEN YUCHENG",
    9, MUTED, font=SANS, align=PP_ALIGN.LEFT)
footer(s, 1, dark=True)

# ============================================================================
# SLIDE 2 — THE CORE QUESTION
# ============================================================================
s = snew(); bg(s, PAPER)
eyebrow(s, 1, "THE CORE QUESTION", "我们最初的问题")
one(s, Inches(0.55), Inches(1.5), Inches(12.2), Inches(0.9),
    "Why is water the main line of the ancient town?", 30, INK, True, font=SERIF)
cards = [
    ("It is the road", "Canals came before streets. To cross town you walked the embankment or took a boat — the water was the road of daily life."),
    ("It is home", "Clothes were washed, boats were tied, neighbours met at the water's edge. Life happened by the water, for a thousand mornings."),
    ("It is the shape", "The town kept its shape around the canals. Houses face the water; bridges decide where the town meets itself."),
    ("It is the image", "Lanterns on the water at dusk — the town darkens, then glows. Reflections are Wuzhen's signature sight."),
]
cx = [0.55, 6.75]; cw = 6.0; cy = [2.75, 4.55]; ch = 1.6
for i, (head, body) in enumerate(cards):
    x, y = Inches(cx[i % 2]), Inches(cy[i // 2])
    rect(s, x, y, Inches(cw), Inches(ch), WARM, LANTERN, 1)
    one(s, x + Inches(0.3), y + Inches(0.2), Inches(cw - 0.6), Inches(0.4),
        head, 15, LANTERN, True, font=SERIF)
    one(s, x + Inches(0.3), y + Inches(0.65), Inches(cw - 0.6), Inches(0.9),
        body, 11, BODY, font=SERIF)
footer(s, 2)

# ============================================================================
# SLIDE 3 — WHAT WE FOUND
# ============================================================================
s = snew(); bg(s, PAPER)
eyebrow(s, 2, "WHAT WE FOUND", "三条关键事实")
pic(s, "waterway-jpg.jpg", Inches(0.55), Inches(1.5), Inches(4.6), Inches(4.9),
    cap="A canal carries the whole town.", alpha=1.0)
facts = [
    ("≈ 10,000 m", "of waterways in Xizha", "The canal system runs nearly ten kilometres through the old town."),
    ("72", "ancient stone bridges", "Stone arches link the two banks; a boat ducks beneath them on the way through."),
    ("Cross-shaped", "water system", "The inner canals form a cross that divides the town into zones, connected by water."),
]
fy = 1.6
for big, label, desc in facts:
    one(s, Inches(5.6), Inches(fy), Inches(2.4), Inches(0.8),
        big, 28, LANTERN, True, font=SERIF)
    one(s, Inches(8.1), Inches(fy + 0.05), Inches(4.7), Inches(0.4),
        label, 13.5, INK, True, font=SANS)
    one(s, Inches(8.1), Inches(fy + 0.42), Inches(4.7), Inches(0.7),
        desc, 10.5, BODY, font=SERIF)
    rect(s, Inches(5.6), Inches(fy + 1.28), Inches(7.2), Pt(1.1), WARM)
    fy += 1.55
footer(s, 3)

# ============================================================================
# SLIDE 4 — WHY WATER
# ============================================================================
s = snew(); bg(s, PAPER)
eyebrow(s, 3, "WHY WATER?", "水如何连接一切")
def node(x, y, w, txt, accent=False):
    rect(s, x, y, Inches(w), Inches(0.62), LANTERN if accent else WARM,
         LANTERN if accent else None, 1.0)
    one(s, x, y, Inches(w), Inches(0.62), txt, 13.5, DEEP if accent else INK,
        True, font=SANS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
node(Inches(0.55), Inches(1.7), 2.8, "WATER", True)
node(Inches(0.55), Inches(2.85), 2.8, "CONNECTS")
small = ["HOUSES", "BRIDGES", "STREETS", "PEOPLE", "BOATS"]
sx = 0.55; sw = 1.18; gap = 0.08
for t in small:
    node(Inches(sx), Inches(3.95), sw, t, False); sx += sw + gap
node(Inches(0.55), Inches(5.05), 2.8, "TRADITIONAL LIFE", True)
# connector arrows (small down triangles)
for ay in [2.35, 3.55, 4.65]:
    tri = s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(1.8), Inches(ay),
                             Inches(0.2), Inches(0.32))
    tri.fill.solid(); tri.fill.fore_color.rgb = LANTERN
    tri.line.fill.background(); tri.shadow.inherit = False
# right: two photos + quote
pic(s, "bridge-jpg.jpg", Inches(4.6), Inches(1.7), Inches(4.0), Inches(2.6),
    cap="Stone arches: a crossing, and a view.")
pic(s, "lantern-jpg.jpg", Inches(8.95), Inches(1.7), Inches(3.83), Inches(2.6),
    cap="Lanterns over the water at dusk.")
rect(s, Inches(4.6), Inches(5.15), Inches(8.18), Inches(1.5), WARM, LANTERN, 1)
one(s, Inches(4.95), Inches(5.35), Inches(7.5), Inches(0.5),
    "“Water is the main line of the town.”", 18, LANTERN, True, font=SERIF)
one(s, Inches(4.95), Inches(5.95), Inches(7.5), Inches(0.55),
    "If the canals were blocked, the town would lose its shape, its road "
    "and its image all at once.", 11, BODY, font=SERIF)
footer(s, 4)

# ============================================================================
# SLIDE 5 — KEYWORDS
# ============================================================================
s = snew(); bg(s, PAPER)
eyebrow(s, 4, "KEYWORDS", "关键词")
kws = [
    ("WATER", "水", 38), ("BRIDGES", "桥", 30), ("CANAL", "水道", 22),
    ("LIFE", "生活", 24), ("BOATS", "船", 22), ("NIGHT", "夜", 32),
    ("REFLECTION", "倒影", 18), ("WATER TOWN", "水乡古镇", 22),
]
positions = [
    (0.7, 1.75, 3.4, 0), (4.5, 2.1, 3.0, 1), (8.1, 1.75, 3.6, 0),
    (0.7, 3.75, 3.4, 1), (4.7, 3.4, 3.0, 0), (8.3, 3.8, 3.6, 1),
    (2.6, 5.25, 3.4, 0), (6.6, 5.4, 4.0, 1),
]
for (en, cn, sz), (px, py, pw, alt) in zip(kws, positions):
    x = Inches(px); y = Inches(py); w = Inches(pw)
    one(s, x, y, w, Inches(0.75), en, sz,
        INK if alt else LANTERN, True, font=SERIF, align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE)
    one(s, x, y + Inches(0.72), w, Inches(0.4), cn, 12, MUTED, font=CJK,
        align=PP_ALIGN.CENTER)
footer(s, 5)

# ============================================================================
# SLIDE 6 — THE JOURNEY
# ============================================================================
s = snew(); bg(s, PAPER)
eyebrow(s, 5, "THE JOURNEY", "六个章节")
chapters = [
    ("01", "WATER 水", "Canals run through every corner — the roads, and still are."),
    ("02", "BRIDGES 桥", "Stone arches, low steps: a crossing, and a view."),
    ("03", "BOATS 船", "The wupeng slips under low arches; the water is the line it is written on."),
    ("04", "LIFE 生活", "Laundry at the embankment, shops and footsteps — ordinary life repeated."),
    ("05", "NIGHT 夜", "Lanterns over the water; the town darkens, then glows."),
    ("06", "MEMORY 记忆", "A place shaped by water — the answer, simply by watching it work."),
]
for i, (n, title, desc) in enumerate(chapters):
    c = i % 2; r = i // 2
    x = Inches(0.55 + c * 6.35); y = Inches(1.6 + r * 1.7)
    rect(s, x, y, Inches(5.9), Inches(1.5), WARM, LANTERN, 1)
    one(s, x + Inches(0.25), y + Inches(0.22), Inches(0.9), Inches(0.7),
        n, 26, LANTERN, True, font=SERIF)
    one(s, x + Inches(1.25), y + Inches(0.28), Inches(4.4), Inches(0.4),
        title, 15, INK, True, font=SANS)
    one(s, x + Inches(1.25), y + Inches(0.72), Inches(4.5), Inches(0.7),
        desc, 10, BODY, font=SERIF)
footer(s, 6)

# ============================================================================
# SLIDE 7 — OUR ENGLISH GUIDE
# ============================================================================
s = snew(); bg(s, DEEP)
eyebrow(s, 6, "OUR ENGLISH GUIDE", "60–80 词英文导览")
one(s, Inches(0.55), Inches(1.45), Inches(7.4), Inches(4.4),
    "Wuzhen is a water town in Zhejiang, where the canals came first and "
    "the streets came later. Boats still cross its 72 stone bridges, and "
    "houses face the water the way they did a thousand years ago. Lanterns "
    "and reflections make the evening a second sightseeing tour. If you "
    "love quiet canals, old stone and a living old town, come — and take a "
    "boat with us.", 15, PAPER, font=SERIF)
rect(s, Inches(0.55), Inches(6.0), Inches(3.2), Pt(2), LANTERN)
one(s, Inches(0.55), Inches(6.15), Inches(4.5), Inches(0.4),
    "≈ 72 words  ·  in the 60–80 range", 10.5, LANTERN, True, font=SANS)
pic(s, "night-jpg.jpg", Inches(8.4), Inches(1.45), Inches(4.38), Inches(3.9),
    cap="Wuzhen at night — lanterns over the water.", alpha=1.0)
footer(s, 7, dark=True)

# ============================================================================
# SLIDE 8 — THE CHALLENGE
# ============================================================================
s = snew(); bg(s, PAPER)
eyebrow(s, 7, "THE CHALLENGE", "给听众的互动")
one(s, Inches(0.55), Inches(1.45), Inches(12.2), Inches(0.6),
    "A question for the room", 26, INK, True, font=SERIF)
qs = [
    ("YOUR TURN", "Can you spot where water still runs the town today?"),
    ("IN ENGLISH", "“Visit Wuzhen by boat — the water is the road.”"),
    ("DISCUSS", "If the canals were blocked, what would Wuzhen lose?"),
]
for i, (label, body) in enumerate(qs):
    x = Inches(0.55 + i * 4.15)
    rect(s, x, Inches(2.4), Inches(3.85), Inches(3.0), WARM, LANTERN, 1)
    one(s, x + Inches(0.3), Inches(2.75), Inches(3.3), Inches(0.4),
        label, 11, LANTERN, True, font=SANS)
    one(s, x + Inches(0.3), Inches(3.4), Inches(3.3), Inches(1.7),
        body, 15, INK, font=SERIF)
footer(s, 8)

# ============================================================================
# SLIDE 9 — SHOW-DAY ROLES
# ============================================================================
s = snew(); bg(s, PAPER)
eyebrow(s, 8, "SHOW-DAY ROLES", "展示日分工（5 角色）")
roles = [
    ("开场负责人", "Opening", "蒋盛熠", "Introduce the group & the theme"),
    ("文化讲解员", "Culture", "汪瀚宇", "Findings & the hometown link"),
    ("英文推荐员", "English", "沈毅程", "The 60–90 s live guide"),
    ("PPT操作员", "Slides", "鲁昂", "Pacing & page control"),
    ("互动负责人", "Interaction", "沈煜程", "The question & the vote"),
]
for i, (cn, en, who, note) in enumerate(roles):
    c = i % 3; r = i // 3
    x = Inches(0.55 + c * 4.15); y = Inches(1.6 + r * 2.15)
    w = 3.85
    rect(s, x, y, Inches(w), Inches(1.9), WARM, LANTERN, 1)
    one(s, x + Inches(0.3), y + Inches(0.22), Inches(w - 0.6), Inches(0.5),
        cn, 17, INK, True, font=CJK)
    one(s, x + Inches(0.3), y + Inches(0.82), Inches(w - 0.6), Inches(0.4),
        f"{en} · {who}", 12, LANTERN, True, font=SANS)
    one(s, x + Inches(0.3), y + Inches(1.3), Inches(w - 0.6), Inches(0.4),
        note, 10.5, BODY, font=SERIF)
footer(s, 9)

# ============================================================================
# SLIDE 10 — SOURCES & CLOSING
# ============================================================================
s = snew(); bg(s, DEEP)
eyebrow(s, 9, "SOURCES & CLOSING", "资料来源与致谢")
one(s, Inches(0.55), Inches(1.5), Inches(12.2), Inches(0.6),
    "Everything on these slides is sourced.", 24, PAPER, True, font=SERIF)
rect(s, Inches(0.55), Inches(2.35), Inches(2.4), Pt(2.5), LANTERN)
one(s, Inches(0.55), Inches(2.75), Inches(12.2), Inches(2.6),
    "Facts — Xizha canal length, 72 stone bridges, and the cross-shaped "
    "water system: public Wuzhen heritage material, cited on the project "
    "site's Image Sources & Licensing page.", 12.5, WARM, font=SERIF)
one(s, Inches(0.55), Inches(3.75), Inches(12.2), Inches(1.0),
    "Images — aerial and field photographs taken on site by the group; each "
    "carries its own credit. No stock imagery.", 12.5, WARM, font=SERIF)
rect(s, Inches(0.55), Inches(5.15), Inches(4.5), Pt(2), LANTERN)
one(s, Inches(0.55), Inches(5.45), Inches(12.2), Inches(0.7),
    "Water connects everything.", 26, LANTERN, True, font=SERIF)
one(s, Inches(0.55), Inches(6.15), Inches(12.2), Inches(0.5),
    "水，把一切连接起来。  ·  谢谢 / Thank you", 14, PAPER, font=CJK)
footer(s, 10, dark=True)

# ---- save ----------------------------------------------------------------
prs.save(OUT)
print(f"WROTE {OUT}  {os.path.getsize(OUT)//1024} KB, {TOTAL} slides")
