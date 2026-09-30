"""
Build the standalone presentation PPTX:
  public/assets/wuzhen_waterways_presentation.pptx

Content is reused from the real project data (chapters.js, Facts,
Keywords, the 60-80 word English guide, show-day roles from team.js).
Images are the local photos in public/images/. Layout is a clean
"light paper + water accent" editorial deck, readable on a projector.

Run:  python tools/make_pptx.py
"""
import os, sys
from PIL import Image, ImageOps
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # project root
ROOT = HERE
IMG  = os.path.join(ROOT, "public", "images")
OUT  = os.path.join(ROOT, "public", "assets", "wuzhen_waterways_presentation.pptx")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

# ---- palette ---------------------------------------------------------------
NIGHT   = RGBColor(0x0A, 0x1C, 0x2B)   # deep water
DEEP    = RGBColor(0x06, 0x0F, 0x1A)
PAPER   = RGBColor(0xF5, 0xF0, 0xE3)    # warm paper
WARM    = RGBColor(0xE8, 0xE5, 0xDC)
LANTERN = RGBColor(0xD7, 0xAD, 0x69)    # lantern gold
MUTED   = RGBColor(0x8A, 0x9A, 0xA8)
BODY    = RGBColor(0x2A, 0x3A, 0x46)

W, H = Inches(13.333), Inches(7.5)   # 16:9

prs = Presentation()
prs.slide_width, prs.slide_height = W, H
blank = prs.slide_layouts[6]

# ---- helpers ----------------------------------------------------------------
def add_slide():
    s = prs.slides.add_slide(blank)
    return s

def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color

def pic(slide, name, x, y, w, h, crop=False):
    p = os.path.join(IMG, name)
    if not os.path.exists(p):
        print(f"  [warn] image missing: {name}")
        return None
    sp = slide.shapes.add_picture(p, x, y, w, h)
    return sp

def textbox(slide, x, y, w, h, lines, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
            wrap=True):
    """lines: list of (text, size, color, bold, font, space_before)"""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, (txt, size, color, bold, font, sb) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if sb: p.space_before = Pt(sb)
        r = p.add_run(); r.text = txt
        r.font.size = Pt(size); r.font.bold = bold
        r.font.color.rgb = color
        r.font.name = font
        # CJK font fallback
        rPr = r._r.get_or_add_rPr()
        latin = rPr.find(qn('a:latin'))
        if latin is None:
            latin = rPr.makeelement(qn('a:latin'), {}); rPr.append(latin)
        latin.set('typeface', font)
        ea = rPr.find(qn('a:ea'))
        if ea is None:
            ea = rPr.makeelement(qn('a:ea'), {}); rPr.append(ea)
        ea.set('typeface', 'Microsoft YaHei')
    return tb

def T(txt, size=18, color=BODY, bold=False, font="Georgia", sb=0):
    return (txt, size, color, bold, font, sb)

def rect(slide, x, y, w, h, fill, line=None, line_w=0.75):
    sp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    sp.fill.solid(); sp.fill.fore_color.rgb = fill
    if line: sp.line.color.rgb = line; sp.line.width = Pt(line_w)
    else: sp.line.fill.background()
    sp.shadow.inherit = False
    return sp

def rule(slide, x, y, w, color=LANTERN, h=Pt(2.5)):
    return rect(slide, x, y, w, h, color)

def eyebrow(slide, num, label, cn):
    textbox(slide, Inches(0.7), Inches(0.55), Inches(9), Inches(0.4),
            [T(f"{num}  /  {label}", 11, LANTERN, True, "Arial")])
    if cn:
        textbox(slide, Inches(0.7), Inches(0.85), Inches(9), Inches(0.4),
                [T(cn, 13, MUTED, False, "Microsoft YaHei")])

def footer(slide, n):
    rule(slide, Inches(0.7), Inches(6.85), Inches(11.9), PAPER if n else LANTERN, Pt(1.2))
    textbox(slide, Inches(0.7), Inches(7.0), Inches(6), Inches(0.3),
            [T("WUZHEN · WATERWAYS & BRIDGES", 9, MUTED, False, "Arial")])
    textbox(slide, Inches(11.2), Inches(7.0), Inches(1.4), Inches(0.3),
            [T(f"{n:02d}", 10, LANTERN, True, "Arial")], align=PP_ALIGN.RIGHT)

def photo_frame(slide, name, x, y, w, h, cap=""):
    pic(slide, name, x, y, w, h)
    # thin lantern frame
    fr = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    fr.fill.background(); fr.line.color.rgb = LANTERN; fr.line.width = Pt(1.5)
    fr.shadow.inherit = False
    if cap:
        textbox(slide, x, y + h + Pt(4), w, Inches(0.3),
                [T(cap, 9.5, MUTED, False, "Arial")])

# =============================================================================
# SLIDE 1 — COVER
# =============================================================================
s = add_slide(); bg(s, DEEP)
# full-bleed hero photo with a deep veil
pic(s, "hero_wuzhen-1920.webp", 0, 0, W, H)
veil = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, W, H)
veil.fill.solid(); veil.fill.fore_color.rgb = DEEP
veil.line.fill.background(); veil.shadow.inherit = False
# set veil ~78% opaque
srgb = veil.fill._xPr.find(qn('a:solidFill')).find(qn('a:srgbClr'))
if srgb is not None:
    a = srgb.makeelement(qn('a:alpha'), {'val': '55000'}); srgb.append(a)

rule(s, Inches(0.9), Inches(1.5), Inches(0.9), LANTERN, Pt(3))
textbox(s, Inches(0.9), Inches(1.75), Inches(8), Inches(0.4),
        [T("GROUP 907  ·  NINTH-GRADE ENGLISH PBL  ·  2026", 11, LANTERN, True, "Arial")])
textbox(s, Inches(0.9), Inches(2.45), Inches(11.5), Inches(1.7),
        [T("WUZHEN", 78, PAPER, False, "Georgia"),
         T("Waterways & Bridges", 30, LANTERN, False, "Georgia", sb=6)])
textbox(s, Inches(0.9), Inches(4.55), Inches(11.5), Inches(0.6),
        [T("Why is water the main line of the ancient town?", 17, WARM, False, "Georgia")])
textbox(s, Inches(0.9), Inches(5.9), Inches(11.5), Inches(0.4),
        [T("蒋盛熠 · 汪瀚宇 · 鲁昂 · 朱钟乐 · 沈毅程 · 沈煜程", 13, MUTED, False, "Microsoft YaHei")])

# =============================================================================
# SLIDE 2 — THE CORE QUESTION
# =============================================================================
s = add_slide(); bg(s, PAPER)
eyebrow(s, "01", "THE CORE QUESTION", "我们最初的问题")
textbox(s, Inches(0.7), Inches(1.5), Inches(11.9), Inches(1.5),
        [T("Why is water the main line of the ancient town?", 34, NIGHT, True, "Georgia")])
rule(s, Inches(0.7), Inches(2.65), Inches(2.2), LANTERN, Pt(3))
# 2x2 reasoning cards
cards = [
    ("It is the road", "Canals came before streets. To cross town you walked the embankment or took a boat — the water was the road of daily life."),
    ("It is home", "Clothes were washed, boats were tied, neighbours met at the water's edge. Life happened by the water, for a thousand mornings."),
    ("It is the shape", "The town kept its shape around the canals. Houses face the water; bridges decide where the town meets itself."),
    ("It is the image", "Lanterns on the water at dusk — the town darkens, then glows. Reflections are Wuzhen's signature sight."),
]
cx = [0.7, 6.9]; cw = 6.0
cy = [3.05, 4.75]; ch = 1.5
for i, (head, body) in enumerate(cards):
    x, y = Inches(cx[i % 2]), Inches(cy[i // 2])
    rect(s, x, y, Inches(cw), Inches(ch), WARM)
    textbox(s, x + Inches(0.3), y + Inches(0.2), Inches(cw - 0.6), Inches(0.4),
            [T(head, 16, LANTERN, True, "Georgia")])
    textbox(s, x + Inches(0.3), y + Inches(0.62), Inches(cw - 0.6), Inches(0.8),
            [T(body, 11.5, BODY, False, "Georgia")])
footer(s, 2)

# =============================================================================
# SLIDE 3 — WHAT WE FOUND (3 facts)
# =============================================================================
s = add_slide(); bg(s, PAPER)
eyebrow(s, "02", "WHAT WE FOUND", "三条关键事实")
# left photo
photo_frame(s, "waterway-webp.webp", Inches(0.7), Inches(1.5), Inches(4.4), Inches(4.6),
            "A canal carries the whole town.")
# right: 3 fact blocks
facts = [
    ("≈ 10,000 m", "of waterways in Xizha", "The canal system runs nearly ten kilometres through the old town."),
    ("72", "ancient stone bridges", "Stone arches link the two banks; a boat ducks beneath them on the way through."),
    ("Cross-shaped", "water system", "The inner canals form a cross that divides the town into zones, connected by water."),
]
fy = 1.55
for big, label, desc in facts:
    textbox(s, Inches(5.6), Inches(fy), Inches(1.9), Inches(0.8),
            [T(big, 30, LANTERN, True, "Georgia")])
    textbox(s, Inches(7.7), Inches(fy + 0.05), Inches(5.0), Inches(0.4),
            [T(label, 14, NIGHT, True, "Arial")])
    textbox(s, Inches(7.7), Inches(fy + 0.45), Inches(5.0), Inches(0.6),
            [T(desc, 11, BODY, False, "Georgia")])
    if big != "Cross-shaped":
        rule(s, Inches(5.6), Inches(fy + 1.05), Inches(7.0), WARM, Pt(1.5))
    fy += 1.45
footer(s, 3)

# =============================================================================
# SLIDE 4 — WHY WATER (diagram)
# =============================================================================
s = add_slide(); bg(s, PAPER)
eyebrow(s, "03", "WHY WATER?", "水如何连接一切")
# vertical diagram on the left
def node(x, y, w, txt, accent=False):
    r = rect(s, x, y, Inches(w), Inches(0.62), LANTERN if accent else WARM,
             LANTERN if accent else None, 1.0)
    textbox(s, x, y, Inches(w), Inches(0.62),
            [T(txt, 14, DEEP if accent else NIGHT, True, "Arial")],
            align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    return r
node(Inches(0.9), Inches(1.7), 2.6, "WATER", True)
node(Inches(0.9), Inches(2.75), 2.6, "CONNECTS")
# row of 5 small nodes
small = ["HOUSES", "BRIDGES", "STREETS", "PEOPLE", "BOATS"]
sx = 0.55; sw = 1.15; gap = 0.12
for t in small:
    node(Inches(sx), Inches(3.8), sw, t); sx += sw + gap
node(Inches(0.9), Inches(4.85), 2.6, "TRADITIONAL LIFE", True)
# down arrows between the three tiers (simple triangles)
for ay in [2.33, 4.45, 5.49]:
    ar = s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(2.15), Inches(ay), Inches(0.15), Inches(0.32))
    ar.fill.solid(); ar.fill.fore_color.rgb = LANTERN; ar.line.fill.background(); ar.shadow.inherit=False
# right explanation
textbox(s, Inches(6.6), Inches(1.7), Inches(6.0), Inches(0.5),
        [T("Reading the town like a sentence", 16, LANTERN, True, "Georgia")])
textbox(s, Inches(6.6), Inches(2.35), Inches(6.0), Inches(3.4),
        [T("The water is the line the town is written on. It carries the people, the boats, the light and the evening — and a town built around water keeps its shape around water, for as long as the canals stay open.",
           13, BODY, False, "Georgia"),
         T("", 6, BODY, False, "Georgia", sb=6),
         T("水，把一切连接起来。", 15, NIGHT, True, "Microsoft YaHei")])
footer(s, 4)

# =============================================================================
# SLIDE 5 — KEYWORDS
# =============================================================================
s = add_slide(); bg(s, PAPER)
eyebrow(s, "04", "KEYWORDS", "关键词")
kws = [
    ("WATER", "水", 40), ("BRIDGES", "桥", 30), ("CANAL", "水道", 22),
    ("LIFE", "生活", 26), ("BOATS", "船", 24), ("NIGHT", "夜", 34),
    ("REFLECTION", "倒影", 20), ("WATER TOWN", "水乡古镇", 24), ("TRADITIONAL LIFE", "传统生活", 18),
]
# compose a loose cloud: place in a 3-column grid with varied sizes
colx = [0.7, 4.9, 9.1]
yy = 1.7
for i, (en, cn, sz) in enumerate(kws):
    c = i % 3; r = i // 3
    x = Inches(colx[c]); y = Inches(yy + r * 1.55)
    textbox(s, x, y, Inches(4.0), Inches(1.4),
            [T(en, sz, NIGHT if sz >= 26 else LANTERN, True, "Georgia"),
             T(cn, 13, MUTED, False, "Microsoft YaHei", sb=2)])
footer(s, 5)

# =============================================================================
# SLIDE 6 — THE JOURNEY (6 chapters, condensed)
# =============================================================================
s = add_slide(); bg(s, PAPER)
eyebrow(s, "05", "THE JOURNEY", "六个章节")
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
    x = Inches(0.7 + c * 6.2); y = Inches(1.6 + r * 1.65)
    textbox(s, x, y, Inches(0.9), Inches(0.7), [T(n, 30, LANTERN, True, "Georgia")])
    textbox(s, x + Inches(1.0), y + Inches(0.02), Inches(4.6), Inches(0.4),
            [T(title, 17, NIGHT, True, "Georgia")])
    textbox(s, x + Inches(1.0), y + Inches(0.45), Inches(4.7), Inches(0.7),
            [T(desc, 10.5, BODY, False, "Georgia")])
footer(s, 6)

# =============================================================================
# SLIDE 7 — THE ENGLISH GUIDE (60-80 words)
# =============================================================================
s = add_slide(); bg(s, DEEP)
eyebrow(s, "06", "OUR ENGLISH GUIDE", "60–80 词英文导览")
textbox(s, Inches(0.7), Inches(1.5), Inches(7.2), Inches(4.4),
        [T("Wuzhen is a water town in Zhejiang, where the canals came first and the streets came later.", 17, PAPER, False, "Georgia"),
         T("", 8, PAPER, False, "Georgia", sb=4),
         T("Boats still cross its 72 stone bridges, and houses face the water the way they did a thousand years ago.", 17, PAPER, False, "Georgia"),
         T("", 8, PAPER, False, "Georgia", sb=4),
         T("Lanterns and reflections make the evening a second sightseeing tour.", 17, PAPER, False, "Georgia"),
         T("", 8, PAPER, False, "Georgia", sb=4),
         T("If you love quiet canals, old stone and a living old town, come — and take a boat with us.", 17, LANTERN, True, "Georgia")])
# word count badge
textbox(s, Inches(0.7), Inches(6.1), Inches(4), Inches(0.4),
        [T("≈ 72 words · 60–80 word requirement", 11, LANTERN, True, "Arial")])
# right: night photo
photo_frame(s, "night-webp.webp", Inches(8.4), Inches(1.5), Inches(4.2), Inches(3.4),
            "Wuzhen at night — lanterns over the water.")
footer(s, 7)

# =============================================================================
# SLIDE 8 — THE CHALLENGE (interactive closing)
# =============================================================================
s = add_slide(); bg(s, PAPER)
eyebrow(s, "07", "THE CHALLENGE", "给听众的互动")
textbox(s, Inches(0.7), Inches(1.6), Inches(11.9), Inches(0.7),
        [T("A question for the room", 30, NIGHT, True, "Georgia")])
rule(s, Inches(0.7), Inches(2.45), Inches(2.2), LANTERN, Pt(3))
q = [
    ("YOUR TURN", "Can you spot where water still runs the town today?"),
    ("IN ENGLISH", "\u201cVisit Wuzhen by boat — the water is the road.\u201d"),
    ("DISCUSS", "If the canals were blocked, what would Wuzhen lose?"),
]
qx = 0.7; qw = 3.85; qgap = 0.35
for i, (label, body) in enumerate(q):
    x = Inches(qx + i * (qw + qgap))
    rect(s, x, Inches(3.0), Inches(qw), Inches(2.6), WARM, LANTERN, 1.0)
    textbox(s, x + Inches(0.3), Inches(3.35), Inches(qw - 0.6), Inches(0.4),
            [T(label, 12, LANTERN, True, "Arial")])
    textbox(s, x + Inches(0.3), Inches(3.95), Inches(qw - 0.6), Inches(1.5),
            [T(body, 16, BODY, False, "Georgia")])
footer(s, 8)

# =============================================================================
# SLIDE 9 — SHOW-DAY ROLES
# =============================================================================
s = add_slide(); bg(s, PAPER)
eyebrow(s, "08", "SHOW-DAY ROLES", "展示日分工（5 角色）")
roles = [
    ("开场负责人", "Opening", "蒋盛熠", "Introduce the group & theme"),
    ("文化讲解员", "Culture", "汪瀚宇", "Findings & the hometown link"),
    ("英文推荐员", "English", "沈毅程", "The 60–90 s live guide"),
    ("PPT操作员", "Slides", "鲁昂", "Pacing & page control"),
    ("互动负责人", "Interaction", "沈煜程", "The question & the vote"),
]
for i, (cn, en, who, note) in enumerate(roles):
    c = i % 3; r = i // 3
    x = Inches(0.7 + c * 4.2); y = Inches(1.7 + r * 2.0)
    w = 3.8
    rect(s, x, y, Inches(w), Inches(1.75), WARM, LANTERN, 1.0)
    textbox(s, x + Inches(0.3), y + Inches(0.18), Inches(w - 0.6), Inches(0.5),
            [T(cn, 18, NIGHT, True, "Microsoft YaHei")])
    textbox(s, x + Inches(0.3), y + Inches(0.72), Inches(w - 0.6), Inches(0.4),
            [T(f"{en} · {who}", 12, LANTERN, True, "Arial")])
    textbox(s, x + Inches(0.3), y + Inches(1.15), Inches(w - 0.6), Inches(0.4),
            [T(note, 10.5, BODY, False, "Georgia")])
footer(s, 9)

# =============================================================================
# SLIDE 10 — SOURCES & CLOSING
# =============================================================================
s = add_slide(); bg(s, DEEP)
eyebrow(s, "09", "SOURCES & THANK YOU", "资料来源与致谢")
textbox(s, Inches(0.7), Inches(1.6), Inches(11.9), Inches(0.7),
        [T("Everything on these slides is sourced.", 26, PAPER, True, "Georgia")])
rule(s, Inches(0.7), Inches(2.45), Inches(2.2), LANTERN, Pt(3))
textbox(s, Inches(0.7), Inches(2.8), Inches(11.9), Inches(2.4),
        [T("Facts — Xizha canal length, 72 stone bridges, and the cross-shaped water system: public Wuzhen heritage material, cited on the project site's Image Sources & Licensing page.", 13, WARM, False, "Georgia"),
         T("", 6, WARM, False, "Georgia", sb=6),
         T("Images — aerial and field photographs taken on site by the group; each carries its own credit. No stock imagery.", 13, WARM, False, "Georgia"),
         T("", 6, WARM, False, "Georgia", sb=6),
         T("The full interactive version of this deck lives on the project site.", 13, LANTERN, True, "Georgia")])
textbox(s, Inches(0.7), Inches(5.7), Inches(11.9), Inches(0.8),
        [T("Water connects everything.", 30, LANTERN, True, "Georgia"),
         T("水，把一切连接起来。  ·  谢谢 / Thank you", 15, PAPER, False, "Microsoft YaHei", sb=4)])
footer(s, 10)

# ---- save ------------------------------------------------------------------
prs.save(OUT)
print(f"OK  {OUT}")
print(f"    {len(prs.slides)} slides, {os.path.getsize(OUT)//1024} KB")
