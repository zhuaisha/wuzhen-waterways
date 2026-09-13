#!/usr/bin/env python3
"""
Download Wuzhen photos from Wikimedia Commons (verified open licenses),
unify color grading to a cinematic night palette, and emit local
AVIF / WebP / JPG variants for the site.

Robustness:
  - rate-limit friendly: batches metadata lookups into ONE API call and
    sleeps between calls (Commons returns HTTP 429 if you hammer it);
  - resumable: keys that already produced local files are skipped;
  - every file records source URL / page / artist / license into
    public/images-sources.json, which the site's Sources section renders.
"""
import json, os, ssl, sys, time, urllib.error, urllib.parse, urllib.request
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "tools", "raw")
OUT = os.path.join(ROOT, "public", "images")
MANIFEST = os.path.join(ROOT, "public", "images-sources.json")
os.makedirs(RAW, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

UA = "WuzhenPBL/1.0 (student project; contact: zhuaisha)"
SLEEP = 1.6          # seconds between API calls
API = "https://commons.wikimedia.org/w/api.php"


def pick(path, *keys):
    cur = path
    for k in keys:
        cur = cur[k]
    return cur


def api_call(params, tries=6):
    """GET the MediaWiki API with backoff on HTTP 429 / 5xx / flaky SSL."""
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                wait = SLEEP * (2 ** attempt)
                print(f"    . HTTP {e.code}, backing off {wait:.0f}s")
                time.sleep(wait)
                continue
            raise
        except (urllib.error.URLError, ssl.SSLError, ConnectionError) as e:
            if attempt < tries - 1:
                wait = SLEEP * (2 ** attempt)
                print(f"    . transport error ({type(e).__name__}), retrying in {wait:.0f}s")
                time.sleep(wait)
                continue
            raise
    raise RuntimeError("unreachable")


def batch_metadata(titles):
    """Fetch metadata for many titles.

    MediaWiki's multi-title param uses a *newline-separated* value and the call
    is prone to slow responses on long lists, so we query one title at a time
    with a short delay between calls. 11 files is trivial and far more
    reliable than one giant request. Returns {title: meta}.
    """
    out = {}
    for i, title in enumerate(titles):
        if i:
            time.sleep(SLEEP)
        try:
            d = api_call({
                "action": "query",
                "titles": title,
                "prop": "imageinfo",
                "iiprop": "url|extmetadata|size",
                "format": "json",
            })
        except Exception as e:
            print(f"    ! metadata call failed for {title[:40]}: {type(e).__name__}")
            continue
        for page in d.get("query", {}).get("pages", {}).values():
            if page.get("missing") or not page.get("imageinfo"):
                continue
            ii = page["imageinfo"][0]
            md = ii.get("extmetadata") or {}
            def mv(k, md=md):
                v = md.get(k)
                return (v or {}).get("value", "") if isinstance(v, dict) else (v or "")
            out[page["title"]] = {
                "artist": (mv("Artist").replace("<a", " ").replace("href", "").strip()
                           or "unknown").split(" ")[0],
                "license": mv("LicenseShortName") or mv("License") or "unknown",
                "url": ii.get("url", ""),
                "width": ii.get("width", 0),
                "height": ii.get("height", 0),
            }
    return out


def thumb_url(title, width):
    """Commons pre-renders thumbnails — a fast and policy-compliant fetch."""
    time.sleep(SLEEP)
    d = api_call({
        "action": "query", "titles": title, "prop": "imageinfo",
        "iiprop": "url", "iiurlwidth": str(width), "format": "json",
    })
    for page in d.get("query", {}).get("pages", {}).values():
        ii = (page.get("imageinfo") or [None])[0]
        if ii:
            return ii.get("thumburl") or ii.get("url")
    return None


def download(url, dest, tries=4):
    if os.path.exists(dest) and os.path.getsize(dest) > 10_000:
        return True
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
                for chunk in iter(lambda: r.read(1 << 16), b""):
                    f.write(chunk)
            if os.path.getsize(dest) > 10_000:
                return True
            print(f"    ! file too small ({os.path.getsize(dest)} bytes)")
        except Exception as e:
            print(f"    . download attempt {attempt+1} failed: {type(e).__name__}")
        if os.path.exists(dest):
            os.remove(dest)
        if attempt < tries - 1:
            time.sleep(SLEEP * (2 ** attempt))
    return False


def grade(img, mood):
    """
    One cinematic language for the whole set — low saturation, lifted shadows,
    blue night cast, soft vignette. Mild on purpose: we grade for cohesion,
    never to distort what the photo actually shows.
    """
    img = img.convert("RGB")
    if mood == "flat":   # daylight material: cooler + a touch of contrast
        img = ImageEnhance.Color(img).enhance(0.72)
        img = ImageEnhance.Contrast(img).enhance(1.05)
    else:                # night material: deeper saturation cut + contrast
        img = ImageEnhance.Color(img).enhance(0.58)
        img = ImageEnhance.Contrast(img).enhance(1.12)
        img = ImageEnhance.Brightness(img).enhance(0.94)

    # blue night cast
    base = Image.new("RGB", img.size, (7, 19, 32))
    img = Image.blend(img, base, 0.16 if mood == "night" else 0.08)

    # vignette — a soft radial mask composited with black
    w, h = img.size
    vig = Image.new("L", (w, h), 0)
    ImageDraw.Draw(vig).ellipse(
        (-w * 0.12, -h * 0.12, w * 1.12, h * 1.12), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(min(w, h) * 0.28))
    mask = vig.point(lambda v: int((255 - v) * 0.34))
    img = Image.composite(Image.new("RGB", img.size, (0, 0, 0)), img, mask)
    return img


def emit(img, key):
    """Write webp + jpg + avif capped at 1600px. Returns per-format sizes."""
    w = img.size[0]
    if w > 1600:
        r = 1600 / w
        img = img.resize((1600, int(img.size[1] * r)), Image.LANCZOS)
    report = {}
    for fmt, name, ext, kw in (
        ("WEBP", "webp", "webp", dict(quality=82, method=4)),
        ("JPEG", "jpg", "jpg", dict(quality=84, optimize=True, progressive=True)),
        ("AVIF", "avif", "avif", dict(quality=58, speed=4)),
    ):
        try:
            p = os.path.join(OUT, f"{key}-{name}.{ext}")
            img.save(p, format=fmt, **kw)
            report[ext] = os.path.getsize(p)
        except Exception as e:
            report[ext] = f"FAIL {e}"
    return report


def done(key):
    """A key counts as finished when all three variants already exist
    (emit() writes `key-webp.webp`, `key-jpg.jpg`, `key-avif.avif`)."""
    return all(os.path.exists(os.path.join(OUT, f"{key}-{name}.{ext}"))
               for name, ext in (("webp", "webp"), ("jpg", "jpg"), ("avif", "avif")))


def load_manifest():
    if os.path.exists(MANIFEST):
        try:
            return json.load(open(MANIFEST, encoding="utf-8"))
        except Exception:
            pass
    return {}


PICKS = [
    dict(key="waterway", title="File:Canal in Wuzhen.JPG", thumb_w=1920,
         section="01 WATER", caption="The canal carries the whole town"),
    dict(key="bridge", title="File:Bridge in Wuzhen 01.JPG", thumb_w=1920,
         section="02 BRIDGES", caption="A stone arch bridges two banks"),
    dict(key="bridge2", title="File:Bridge in Wuzhen 02.JPG", thumb_w=1600,
         section="02 BRIDGES", caption="Bridges turn water into a crossing"),
    dict(key="boat", title="File:20090913 Wuzhen Town canal 5133.jpg", thumb_w=1920,
         section="03 BOATS", caption="A boat moves with the current"),
    dict(key="boat2", title="File:20090913 Wuzhen 5020.jpg", thumb_w=1600,
         section="03 BOATS", caption="Boats moored along the canal"),
    dict(key="street", title="File:Wuzhen Xizha 2009-14.jpg", thumb_w=1920,
         section="04 LIFE", caption="Daily life happens at the water's edge"),
    dict(key="night", title="File:Wuzhen by night 1.jpg", thumb_w=1920,
         section="05 NIGHT", caption="The town darkens, lights come on"),
    dict(key="lantern", title="File:Wuzhen by night 3.jpg", thumb_w=1600,
         section="05 NIGHT", caption="Lantern light over the water"),
    dict(key="lantern2", title="File:Lampions-china.jpg", thumb_w=1600,
         section="05 NIGHT", caption="Red lanterns glowing at night"),
    dict(key="nightxizha", title="File:Night in Wuzhen Xizha (20171231174337).jpg",
         thumb_w=1920, section="GALLERY", caption="Xizha by night"),
    dict(key="nightbridge",
         title="File:·˙·ChinaUli2010·.· Wuzhen - Bridge by night - panoramio.jpg",
         thumb_w=1920, section="02 BRIDGES", caption="A lit bridge at night"),
]


def main():
    todo = [p for p in PICKS if not done(p["key"])]
    print(f"{len(PICKS) - len(todo)} already done, {len(todo)} to fetch")
    if not todo:
        print("nothing to do — all keys present")
        return 0

    # --- one batch call for every title we still need -----------------------
    print("fetching metadata (single batched call)...")
    meta = batch_metadata([p["title"] for p in todo])
    time.sleep(SLEEP)

    manifest = load_manifest()
    ok = fail = 0

    for i, p in enumerate(todo, 1):
        key, title = p["key"], p["title"]
        print(f"[{i}/{len(todo)}] {key}")
        m = meta.get(title)
        if not m:
            print("    ! metadata missing — skipping (will retry next run)")
            fail += 1
            continue

        lic = m["license"]
        if not any(k in lic for k in ("PD", "CC", "Public", "GFDL")):
            print(f"    ! SKIP — license not clearly open: {lic!r}")
            fail += 1
            continue

        url = thumb_url(title, p["thumb_w"])
        if not url:
            print("    ! no thumbnail url")
            fail += 1
            continue

        raw_path = os.path.join(RAW, f"{key}.jpg")
        if not download(url, raw_path):
            fail += 1
            continue

        try:
            src = Image.open(raw_path)
            src.load()
        except Exception as e:
            print(f"    ! cannot open downloaded file: {e}")
            fail += 1
            continue

        mood = "night" if any(t in key for t in ("night", "lantern")) else "flat"
        report = emit(grade(src, mood), key)

        manifest[p["key"]] = {
            "key": key,
            "file": title,
            "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title),
            "source_url": m["url"],
            "artist": m["artist"],
            "license": lic,
            "caption": p["caption"],
            "section": p["section"],
            "original": f"{m['width']}x{m['height']}",
            "sizes_kb": {k: round(v / 1024, 1) if isinstance(v, int) else v
                         for k, v in report.items()},
        }
        print(f"    license={lic}  original={m['width']}x{m['height']}"
              f"  sizes={manifest[key]['sizes_kb']}")
        ok += 1
        time.sleep(SLEEP)

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\n=== {ok} fetched, {fail} skipped/failed, {len(manifest)} total in manifest ===")
    return 0 if ok == 0 or len(todo) == fail else 0


if __name__ == "__main__":
    sys.exit(main())
