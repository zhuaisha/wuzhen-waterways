import json, re, sys, time
sys.path.insert(0, "tools")
import fetch_images as F

m = json.load(open("src/data/images-sources.json", encoding="utf-8"))

def clean_artist(raw):
    """Commons Artist is HTML like <a href=".../wiki/User:Foo" title="User:Foo">Foo</a>
    Extract the visible label; fall back to stripping tags."""
    if not raw:
        return "unknown"
    if "<" in raw:
        labels = re.findall(r">(.*?)</a>", raw)
        if labels:
            return labels[-1].strip()
        # no anchor — strip all tags
        txt = re.sub(r"<[^>]+>", "", raw).strip()
        return txt or "unknown"
    return raw.strip() or "unknown"

for k, v in m.items():
    title = v["file"]
    try:
        d = F.api_call({
            "action": "query", "titles": title, "prop": "imageinfo",
            "iiprop": "extmetadata", "format": "json",
        })
        md = list(d["query"]["pages"].values())[0]["imageinfo"][0].get("extmetadata", {})
        a = md.get("Artist")
        raw = a["value"] if isinstance(a, dict) else (a or "")
        v["artist"] = clean_artist(raw)
        lic = md.get("LicenseShortName")
        if isinstance(lic, dict) and lic.get("value"):
            v["license"] = lic["value"]
    except Exception as e:
        print(f"  ! {k}: {type(e).__name__}")
    time.sleep(F.SLEEP)

json.dump(m, open("src/data/images-sources.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)

print(f"{'key':12s} {'license':14s} {'artist':26s} file")
for k, v in sorted(m.items()):
    print(f"{k:12s} {v['license']:14s} {v['artist'][:26]:26s} {v['file'][:46]}")
