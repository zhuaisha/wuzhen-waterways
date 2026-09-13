import json

m = json.load(open("src/data/images-sources.json", encoding="utf-8"))

# Section assignment mirrored from tools/fetch_images.py PICKS.
SECTION = {
    "waterway": "01 WATER",
    "bridge": "02 BRIDGES",
    "bridge2": "02 BRIDGES",
    "nightbridge": "02 BRIDGES",
    "boat": "03 BOATS",
    "boat2": "03 BOATS",
    "street": "04 LIFE",
    "night": "05 NIGHT",
    "lantern": "05 NIGHT",
    "lantern2": "05 NIGHT",
    "nightxizha": "GALLERY",
}
# Captions from the first (older) run that didn't store them under `section`.
CAPTION = {
    "waterway": "The canal carries the whole town",
    "bridge": "A stone arch bridges two banks",
    "bridge2": "Bridges turn water into a crossing",
    "boat": "A boat moves with the current",
    "boat2": "Boats moored along the canal",
    "street": "Daily life happens at the water's edge",
    "night": "The town darkens, lights come on",
    "lantern": "Lantern light over the water",
    "lantern2": "Red lanterns glowing at night",
    "nightxizha": "Xizha by night",
    "nightbridge": "A lit bridge at night",
}

for k, v in m.items():
    v.setdefault("section", SECTION.get(k, "GALLERY"))
    v.setdefault("caption", CAPTION.get(k, ""))
    v.setdefault("used_in", v["section"])

json.dump(m, open("src/data/images-sources.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)

print("total:", len(m))
print(f"{'key':12s} {'license':15s} {'section':14s} {'artist':22s} file")
for k, v in sorted(m.items()):
    print(f"{k:12s} {v['license']:15s} {v['section']:14s} "
          f"{v['artist'][:22]:22s} {v['file'][:52]}")
