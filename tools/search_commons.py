#!/usr/bin/env python3
"""Search Wikimedia Commons for a query, print files with usable open licenses."""
import json, sys, urllib.parse, urllib.request

def search(query, limit=30):
    api = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size",
        "iiurlwidth": "1920",
        "format": "json",
    }
    url = api + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "WuzhenPBL/1.0 (student project)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.load(r)
    pages = data.get("query", {}).get("pages", {})
    rows = []
    for pid, p in pages.items():
        ii = (p.get("imageinfo") or [{}])[0]
        md = ii.get("extmetadata") or {}
        def mv(k):
            v = md.get(k)
            return (v or {}).get("value", "") if isinstance(v, dict) else (v or "")
        lic = mv("LicenseShortName") or "UNKNOWN"
        artist = mv("Artist").replace("[", "").replace("]", "").strip()
        w, h = ii.get("width", 0), ii.get("height", 0)
        good_lic = any(k in lic for k in ("PD", "CC", "Public", "GFDL"))
        ok = good_lic and w >= 1200
        rows.append((ok, p.get("title",""), lic, w, h, artist, ii.get("thumburl",""), p.get("title","")))
    for ok, title, lic, w, h, artist, thumb, ptitle in sorted(rows, key=lambda x: not x[0]):
        tag = "OK  " if ok else "SKIP"
        print(f"{tag} {title} | {lic} | {w}x{h} | {artist[:40]}")
        if ok:
            print(f"      THUMB: {thumb}")
            print(f"      PAGE : https://commons.wikimedia.org/wiki/File:{ptitle}")

if __name__ == "__main__":
    q = sys.argv[1] if len(sys.argv) > 1 else "Wuzhen"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 25
    search(q, n)
