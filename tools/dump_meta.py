#!/usr/bin/env python3
"""Dump raw imageinfo structure for one Commons file to diagnose metadata shape."""
import json, sys, urllib.parse, urllib.request

title = sys.argv[1]
api = "https://commons.wikimedia.org/w/api.php"
p = {
    "action": "query",
    "titles": title,
    "prop": "imageinfo",
    "iiprop": "extmetadata|url|size",
    "format": "json",
}
url = api + "?" + urllib.parse.urlencode(p)
req = urllib.request.Request(url, headers={"User-Agent": "WuzhenPBL/1.0"})
d = json.load(urllib.request.urlopen(req, timeout=20))
pg = list(d["query"]["pages"].values())[0]
print("PAGE TITLE:", pg.get("title"))
print("MISSING:", pg.get("missing"))
ii = pg.get("imageinfo")
print("IMAGEINFO TYPE:", type(ii), "LEN:", len(ii) if ii else 0)
if ii:
    node = ii[0]
    print("NODE KEYS:", sorted(node.keys()))
    md = node.get("Metadata", {})
    print("METADATA KEYS:", sorted(md.keys())[:40])
    for k in ("Artist", "LicenseShortName", "License", "UsageTerms"):
        v = md.get(k)
        print(f"  {k}: {str(v)[:100]!r}")
