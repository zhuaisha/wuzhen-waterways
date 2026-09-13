import json
m = json.load(open("src/data/images-sources.json", encoding="utf-8"))
print("total:", len(m))
print(f"{'key':12s} {'license':15s} {'section':14s} {'artist':24s} file")
for k, v in sorted(m.items()):
    print(f"{k:12s} {v['license']:15s} {v['section']:14s} {v['artist'][:24]:24s} {v['file'][:52]}")
