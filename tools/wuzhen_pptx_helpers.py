"""Low-level helpers for the Wuzhen Apple-style deck: raw OOXML for
transitions, entrance/exit animations, fills with alpha, CJK fonts,
letter-spacing. Everything else stays on the python-pptx API."""
from lxml import etree
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

P = "http://schemas.openxmlformats.org/presentationml/2006/main"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
P14 = "http://schemas.microsoft.com/office/powerpoint/2010/main"

# palette
INK = RGBColor(0x1D, 0x1D, 0x1F)
SUB = RGBColor(0x6E, 0x6E, 0x73)
BG_L = RGBColor(0xF5, 0xF5, 0xF7)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
WGREEN = RGBColor(0x66, 0x7F, 0x80)
DEEPWATER = RGBColor(0x24, 0x36, 0x38)
SOFT = RGBColor(0xA1, 0xA1, 0xA6)
HAIR = RGBColor(0xD2, 0xD2, 0xD7)

LATIN = "Helvetica Neue"
# Chinese face. PingFang SC only exists on macOS, so on a Windows machine the
# 中文 (team names, chapter labels) can fall back to a surprise serif. 微软雅黑
# is present on every Windows install and ships with macOS Office, and its
# latin glyphs stay close to the brand face, so it doubles as the latin face.
EA_FONT = "微软雅黑"


def _el(xml):
    return etree.fromstring(xml)


def style_run(run, size, color, bold=False, spc=None, latin=LATIN, ea=EA_FONT):
    """Font size/color/weight + letter-spacing + CJK face on one run."""
    f = run.font
    f.size = Pt(size)
    f.bold = bold
    f.color.rgb = color
    f.name = latin
    rPr = run._r.get_or_add_rPr()
    # east asian face
    ea_el = rPr.find(qn("a:ea"))
    if ea_el is None:
        ea_el = _el(f'<a:ea xmlns:a="{A}"/>')
        rPr.append(ea_el)
    ea_el.set("typeface", ea)
    if spc is not None:
        rPr.set("spc", str(spc))  # 1/100 pt
    # kill the theme-kerning quirk so tracking sticks
    rPr.set("kern", "1200")


def add_text(slide, x, y, w, h, lines, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
             line_spacing=None, space_after=None):
    """lines: list of (text, dict(size, color, bold, spc, latin, ea)) — one paragraph each."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tb.shadow.inherit = False
    tf = tb.text_frame
    tf.word_wrap = True
    # Deterministic geometry: no auto-grow, no shrink-on-overflow. Text that is
    # too big overflows visibly so the layout audit can catch it instead of
    # silently expanding the box into its neighbours.
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, (text, st) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = st.get("align", align)
        if line_spacing:
            p.line_spacing = line_spacing
        if space_after is not None:
            p.space_after = Pt(space_after)
        r = p.add_run()
        r.text = text
        style_run(r, st["size"], st.get("color", INK), st.get("bold", False),
                  st.get("spc"), st.get("latin", LATIN), st.get("ea", EA_FONT))
    return tb


def add_rect(slide, x, y, w, h, fill=None, fill_alpha=None, line=None,
             line_w=None, shape=MSO_SHAPE.RECTANGLE):
    sp = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sp.shadow.inherit = False
    if fill is None:
        sp.fill.background()
    else:
        sp.fill.solid()
        sp.fill.fore_color.rgb = fill
        if fill_alpha is not None:
            srgb = sp.fill._xPr.find(qn("a:solidFill")).find(qn("a:srgbClr"))
            a = _el(f'<a:alpha xmlns:a="{A}" val="{int(fill_alpha * 1000)}"/>')
            srgb.append(a)
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line
        sp.line.width = Pt(line_w if line_w is not None else 0.75)
    sp.text_frame.paragraphs[0].text = ""
    return sp


def add_pic(slide, path, x, y, w, h, crop="cover", alpha=None):
    """Place a picture. crop='cover' fills the box, center-cropped, no stretch."""
    from PIL import Image
    with Image.open(path) as im:
        iw, ih = im.size
    bw, bh = w, h
    if crop == "cover":
        scale = max(bw / iw, bh / ih)
        nw, nh = iw * scale, ih * scale
        x += (bw - nw) / 2
        y += (bh - nh) / 2
        w, h = nw, nh
    pic = slide.shapes.add_picture(path, Inches(x), Inches(y), Inches(w), Inches(h))
    pic.shadow.inherit = False
    if alpha is not None:
        blip = pic._element.blipFill.blip
        am = _el(f'<a:alphaMod xmlns:a="{A}" val="{int(alpha * 1000)}"/>')
        blip.append(am)
    return pic


def add_conn(slide, x1, y1, x2, y2, color, weight=0.75, alpha=None, dash=None):
    from pptx.enum.shapes import MSO_CONNECTOR
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,
                                   Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color
    c.line.width = Pt(weight)
    c.shadow.inherit = False
    if alpha is not None:
        ln = c._element.spPr.find(qn("a:ln"))
        srgb = ln.find(qn("a:solidFill")).find(qn("a:srgbClr"))
        srgb.append(_el(f'<a:alpha xmlns:a="{A}" val="{int(alpha * 1000)}"/>'))
    if dash:
        ln = c._element.spPr.find(qn("a:ln"))
        ln.append(_el(f'<a:prstDash xmlns:a="{A}" val="{dash}"/>'))
    return c


def set_bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def add_notes(slide, text):
    """Speaker notes — 30-60 seconds of English per slide."""
    slide.notes_slide.notes_text_frame.text = text


# ---------------------------------------------------------------- transitions
def _drop(sld, tag):
    """Remove only nodes of this tag — transitions must NOT touch timing
    (an earlier version dropped both, which silently erased every animation)."""
    for el in sld.findall(qn(tag)):
        sld.remove(el)


def _insert_after(sld, el, stop_tags):
    """Append el after the last child whose tag is in stop_tags,
    keeping the OOXML order cSld -> clrMapOvr -> transition -> timing."""
    pos = 0
    for k, c in enumerate(list(sld)):
        if c.tag in stop_tags:
            pos = k + 1
    sld.insert(pos, el)


def transition(slide, kind, dur_ms=1000):
    """kind: fade | black | crossdark | morph"""
    sld = slide._element
    _drop(sld, "p:transition")
    nsdecl = f'xmlns:p="{P}" xmlns:p14="{P14}"'
    if kind == "morph":
        xml = (f'<p:transition {nsdecl} p14:dur="{dur_ms}">'
               f'<p14:morph option="byObject"/></p:transition>')
    elif kind == "black":
        xml = (f'<p:transition {nsdecl} spd="slow"><p:fade thruBlk="1"/></p:transition>')
    elif kind == "crossdark":
        xml = (f'<p:transition {nsdecl} spd="slow">'
               f'<p:fade thruBlk="1"/></p:transition>')
    else:  # plain fade
        xml = f'<p:transition {nsdecl} spd="med"><p:fade/></p:transition>'
    el = _el(xml)
    # transition sits after cSld/clrMapOvr but BEFORE p:timing
    _insert_after(sld, el, (qn("p:cSld"), qn("p:clrMapOvr")))
    return el


# ---------------------------------------------------------------- animations
_PRESETS = {
    "fade": ("10", "0", 'filter="fade"'),
    "zoom": ("23", "0", 'filter="zoom"'),
    "wipe": ("22", "4", None),
    "fly": ("2", "0", None),
}


def _anim_group(i, spid, kind, delay_ms, dur_ms, extra=""):
    pclass = "exit" if kind.startswith("out:") else "entr"
    kind = kind.split(":")[0] if not kind.startswith("out:") else "fade"
    pid, sub, effect = _PRESETS[kind]
    if pclass == "exit":
        pid, sub, effect = "10", "0", 'filter="fade"'
    children = []
    if kind.startswith("movefade"):
        # position delta: extra = 'x=-91440|dur=1200'
        x_off = extra
        children.append(
            f'<p:anim calcmode="lin" decel="0">'
            f'<p:cBhvr><p:cTn id="{i}" dur="{dur_ms}">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spLst><p:spTgt spid="{spid}"/></p:spLst></p:tgtEl>'
            f'<p:attrLst><p:attr name="ppt_x"/></p:attrLst></p:cBhvr>'
            f'<p:tavLst>'
            f'<p:tav tm="0"><p:val><p:str x="{x_off}" y="0"/></p:val></p:tav>'
            f'<p:tav tm="100000"><p:val><p:str x="0" y="0"/></p:val></p:tav>'
            f'</p:tavLst></p:anim>'
        )
        children.append(
            f'<p:animEffect transition="in" filter="fade">'
            f'<p:cBhvr><p:cTn id="{i + 1}" dur="{dur_ms}">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spLst><p:spTgt spid="{spid}"/></p:spLst></p:tgtEl>'
            f'</p:cBhvr></p:animEffect>'
        )
        return (f'<p:par><p:cTn id="{i + 2}" presetID="2" presetClass="{pclass}"'
            f' presetSubtype="0" fill="hold" nodeType="afterEffect">'
            f'<p:stCondLst><p:cond delay="{delay_ms}"/></p:stCondLst>'
            f'<p:childTnLst>{"".join(children)}</p:childTnLst></p:cTn></p:par>'), i + 3

    if effect is None:
        # wipe: animEffect with a wipe filter
        direction = {"up": "down", "down": "up", "left": "right", "right": "left"}
        d = extra if extra in direction else "down"
        effect = f'filter="wipe({d})"'
    inner = (f'<p:animEffect transition="in" {effect}>'
             f'<p:cBhvr><p:tgtEl><p:spLst><p:spTgt spid="{spid}"/></p:spLst></p:tgtEl>'
             f'</p:cBhvr></p:animEffect>')
    return (f'<p:par><p:cTn id="{i}" presetID="{pid}" presetClass="{pclass}" '
            f'presetSubtype="{sub}" fill="hold" nodeType="afterEffect">'
            f'<p:stCondLst><p:cond delay="{delay_ms}"/></p:stCondLst>'
            f'<p:childTnLst>{inner}</p:childTnLst></p:cTn></p:par>'), i + 1


def animations(slide, groups):
    """groups: list of (shape, kind, delay_ms, dur_ms, extra).
    kind: fade | zoom | wipe:up|wipe:down|wipe:left|wipe:right | movefade:<xoff>.
    All start automatically as the slide appears (After-Previous chain)."""
    sld = slide._element
    _drop(sld, "p:timing")   # NEVER drop transition — they are separate nodes
    body = []
    i = 3
    for shape, kind, delay_ms, dur_ms, *rest in groups:
        extra = rest[0] if rest else ""
        block, i = _anim_group(i, shape.shape_id, kind, delay_ms, dur_ms, extra)
        body.append(block)
    xml = (f'<p:timing xmlns:p="{P}"><p:tnLst><p:par>'
           f'<p:cTn id="1" dur="indefinite" restart="never" nodeType="mainSeq">'
           f'<p:childTnLst><p:par>'
           f'<p:cTn id="2" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
           f'<p:childTnLst>{"".join(body)}</p:childTnLst></p:cTn></p:par>'
           f'</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
    sld.append(_el(xml))
