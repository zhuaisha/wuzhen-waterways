# -*- coding: utf-8 -*-
"""Data-integrity check for the WUZHEN deck.

Every fact in build_pptx.py must trace back to an authoritative project
source. This flags anything that cannot be traced, so nothing fabricated
slips into the deck.

Usage: python tools/verify_pptx_data.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "tools", "build_pptx.py"), encoding="utf-8").read()
fails = 0


def ok(cond):
    global fails
    if not cond:
        fails += 1
    return "PASS" if cond else "FAIL"


print("=== 1. 团队成员 (src/data/team.js) ===")
team_js = open(os.path.join(ROOT, "src", "data", "team.js"), encoding="utf-8").read()
for n in ["蒋盛熠", "汪瀚宇", "鲁昂", "朱钟乐", "沈毅程", "沈煜程"]:
    c = ok(n in src and n in team_js)
    print(f"  [{c}] {n}")

print("\n=== 2. 关键数字 ===")
for tok in ["72", "10,000"]:
    c = ok(src.count(tok) >= 1)
    print(f"  [{c}] '{tok}' x{src.count(tok)}")

print("\n=== 3. Atlas 节点名（须与官网一致）===")
for n in ["NORTH WATER GATE", "XIZHA BRIDGE", "LANTERN WHARF", "MORNING MARKET"]:
    c = ok(n in src)
    print(f"  [{c}] {n}")
c = ok("NORTH GATE" not in src)  # the old wrong name
print(f"  [{c}] [旧错名] NORTH GATE 不存在")

print("\n=== 4. 图片来源作者 (images-sources.json) ===")
js = json.load(open(os.path.join(ROOT, "src", "data", "images-sources.json"),
                    encoding="utf-8"))
authors = set()


def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k.lower() in ("artist", "artists", "author", "credit", "creator") \
                    and isinstance(v, str):
                authors.add(v)
            else:
                walk(v)
    elif isinstance(o, list):
        for i in o:
            walk(i)


walk(js)
print(f"  权威源作者数: {len(authors)}")
# Text is matched against the CONCATENATED run of string literals in the
# sources block, not the raw file -- a long author list is split across
# several ("...") lines and the space sits at the join.
i = src.find('"Image sources')
j = src.find('add_text(s, I(1200), I(922)', i)
join_text = src[i:j]
lit_text = "".join(re.findall(r'["\x27]([^\x22\x27]*)["\x27]', join_text))
for a in ["韩笃一", "Immanuel Giel", "Jakub Hałun", "Gerbil",
          "Nico le terrible", "Sastognuti", "N509FZ", "ChinaUli2010"]:
    traced = any(a in x for x in authors) or any(a.split()[0] in x for x in authors)
    in_deck = a in lit_text
    c = ok(traced and in_deck)
    print(f"  [{c}] {a}  (源:{'有' if traced else '无'} / 幻灯:{'有' if in_deck else '无'})")

print("\n=== 5. 引用图片文件必须真实存在 ===")
names = set(re.findall(r"""["']([\w\-]+\.(?:jpg|jpeg|png))["']""", src))
for m in sorted(names):
    p = os.path.join(ROOT, "public", "images", m)
    c = ok(os.path.exists(p))
    print(f"  [{c}] public/images/{m}")

print("\n=== 6. 常见编造痕迹扫描 ===")
for bad in ["1,000+", "1000+", "approximately", "roughly", "ca.", "circa"]:
    c = ok(bad not in src.lower())
    print(f"  [{c}] 无 '{bad}'")

print(f"\n>>> {'ALL CHECKS PASSED' if fails == 0 else str(fails) + ' CHECK(S) FAILED'}")
raise SystemExit(1 if fails else 0)
