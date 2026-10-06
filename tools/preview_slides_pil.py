"""Approximate slide preview: parse the .pptx XML geometry (pictures,
solid shapes WITH alpha, text with size/color/position) and paint with PIL.

NOT a PowerPoint renderer (there is none here: no LibreOffice, and Office
COM automation is disabled on this box). It ignores animation timing,
transitions and exact font metrics — but it catches the things that matter
for a hand-built deck: out-of-bounds text, overlapping blocks, cropped
subjects, and low contrast.

Usage: python tools/preview_slides_pil.py [out_dir]
"""
import io
import os
import sys
from pptx import Presentation
from pptx.oxml.ns import qn
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "wuzhen_presentation.pptx")
if os.environ.get("PPTX"):                      # e.g. PPTX=wuzhen_presentation_6p.pptx
    SRC = os.path.join(ROOT, os.environ["PPTX"])
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "tools", "_pptx_preview")
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

W, H = 1920, 1080
EMU = 914400
PX = W / 13.333  # px per inch

FONT_FILES = [r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\msyh.ttc"]
LATIN = next((f for f in FONT_FILES if os.path.exists(f)), None)
# CJK fallback: arial has no 中文字形, so mixed strings render as boxes.
CJK_FILE = r"C:\Windows\Fonts\msyh.ttc"
CJK = ImageFont.truetype(CJK_FILE, 12) if os.path.exists(CJK_FILE) else None


def font(pt):
    if not LATIN:
        return ImageFont.load_default()
    try:
        f = ImageFont.truetype(LATIN, max(7, int(pt * PX / 72)))
    except Exception:
        return ImageFont.load_default()
    return f


def solid_fill(shape):
    """-> (r,g,b,alpha) or None"""
    try:
        if shape.fill.type is None or "SOLID" not in str(shape.fill.type):
            return None
        c = shape.fill.fore_color.rgb
        a = 1.0
        try:
            srgb = shape.fill._xPr.find(qn("a:solidFill")).find(qn("a:srgbClr"))
            am = srgb.find(qn("a:alpha"))
            if am is not None:
                a = max(0.0, min(1.0, int(am.get("val")) / 100000))
        except Exception:
            pass
        return (c[0], c[1], c[2], a)
    except Exception:
        return None


def line_col(shape):
    try:
        if "SOLID" in str(shape.line.fill.type):
            c = shape.line.color.rgb
            return (c[0], c[1], c[2])
    except Exception:
        pass
    return None


def px(v):
    return v / EMU * PX if v is not None else 0


prs = Presentation(SRC)
made = 0
for idx, slide in enumerate(prs.slides, 1):
    bg = (255, 255, 255)
    try:
        if "SOLID" in str(slide.background.fill.type):
            c = slide.background.fill.fore_color.rgb
            bg = (c[0], c[1], c[2])
    except Exception:
        pass
    img = Image.new("RGB", (W, H), bg)

    def put_solid(box, col_a):
        r, g, b, a = col_a
        if a >= 0.999:
            ImageDraw.Draw(img).rectangle([int(box[0]), int(box[1]),
                                           int(box[0] + box[2]), int(box[1] + box[3])],
                                          fill=(r, g, b))
        else:
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(layer).rectangle(
                [int(box[0]), int(box[1]), int(box[0] + box[2]), int(box[1] + box[3])],
                fill=(r, g, b, int(a * 255)))
            img.paste(Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"))

    d = ImageDraw.Draw(img)
    for sh in slide.shapes:
        X, Y, Wd, Ht = px(sh.left), px(sh.top), px(sh.width), px(sh.height)
        box = (X, Y, Wd, Ht)

        # 1. pictures
        if sh.shape_type == 13:
            try:
                pim = Image.open(io.BytesIO(sh.image.blob)).convert("RGB")
                pw, ph = max(1, int(Wd)), max(1, int(Ht))
                img.paste(pim.resize((pw, ph), Image.LANCZOS), (int(X), int(Y)))
            except Exception:
                pass
            continue

        # 2. solid shapes
        col = solid_fill(sh)
        if col:
            put_solid(box, col)
            d = ImageDraw.Draw(img)

        # 3. connector lines
        if str(sh.shape_type).startswith("LINE"):
            lc = line_col(sh)
            if lc:
                d.line([int(X), int(Y), int(X + Wd), int(Y + Ht)], fill=lc, width=2)

        # 4. text
        if not (sh.has_text_frame and sh.text_frame.text.strip()):
            continue
        anchor = str(sh.text_frame.vertical_anchor)
        cursor = Y + (Ht * 0.42 if "MIDDLE" in anchor else 0)
        for p in sh.text_frame.paragraphs:
            txt = "".join(r.text for r in p.runs)
            if not txt:
                continue
            run = p.runs[0]
            pt = run.font.size.pt if run.font.size else 12.0
            col = (30, 30, 31)
            try:
                c = run.font.color.rgb
                col = (c[0], c[1], c[2])
            except Exception:
                pass
            f = font(pt)
            tw = d.textlength(txt, font=f)
            al = str(p.alignment)
            if "CENTER" in al:
                tx = X + (Wd - tw) / 2
            elif "RIGHT" in al:
                tx = X + Wd - tw
            else:
                tx = X
            # draw glyph by glyph, swapping in the CJK face for 中文 — arial
            # has no CJK shapes and would otherwise print tofu boxes.
            cx = tx
            for ch in txt:
                cf = f
                if CJK is not None and ord(ch) > 0x2000:
                    cf = CJK.font_variant(size=f.size)
                d.text((cx, cursor), ch, font=cf, fill=col)
                cx += d.textlength(ch, font=cf)
            cursor += pt * PX / 72 * 1.42
            if cursor > Y + Ht:
                break

    p = os.path.join(OUT, f"slide_{idx:02d}.png")
    img.save(p, "PNG")
    made += 1

print(f"rendered {made} preview PNGs -> {OUT}  (font: {LATIN})")
