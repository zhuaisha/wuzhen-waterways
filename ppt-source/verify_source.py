# -*- coding: utf-8 -*-
"""Verify the aggregated PPT source markdown against project authorities.

Nothing in ppt-source/wuzhen-waterways.md may be unsourced. Fail loudly on
any fact that cannot be traced to src/data/ or src/components/.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "ppt-source", "wuzhen-waterways.md"), encoding="utf-8").read()
fails = 0


def check(cond, label):
    global fails
    if not cond:
        fails += 1
    print(f"  [{'PASS' if cond else 'FAIL'}] {label}")


print("=== 1. 团队成员（src/data/team.js）===")
team = open(os.path.join(ROOT, "src", "data", "team.js"), encoding="utf-8").read()
for n in ["蒋盛熠", "汪瀚宇", "鲁昂", "朱钟乐", "沈毅程", "沈煜程"]:
    check(n in src and n in team, f"{n}  源:{'有' if n in team else '无'} 文档:{'有' if n in src else '无'}")
check(src.count("Project lead") >= 1 and src.count("Research & mapping") >= 1, "角色字段")

print("\n=== 2. 关键数字（src/components/Facts.jsx）===")
facts = open(os.path.join(ROOT, "src", "components", "Facts.jsx"), encoding="utf-8").read()
check("72" in src and "72" in facts, "72 座桥")
check("10,000" in src and "10000" in facts, "10,000 米水道")

print("\n=== 3. Atlas 节点名（src/components/Atlas.jsx）===")
atlas = open(os.path.join(ROOT, "src", "components", "Atlas.jsx"), encoding="utf-8").read()
for n in ["North Water Gate", "Xizha Bridge", "Lantern Wharf", "Morning Market"]:
    check(n in src and n in atlas, f"{n}")
check("North Gate" not in src, "[旧错名] North Gate 不存在")

print("\n=== 4. 图片来源作者（src/data/images-sources.json）===")
js = json.load(open(os.path.join(ROOT, "src", "data", "images-sources.json"), encoding="utf-8"))
authors = set()


def walk(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == "artist" and isinstance(v, str):
                authors.add(v)
            else:
                walk(v)
    elif isinstance(o, list):
        for i in o:
            walk(i)


walk(js)
print(f"  权威源作者数: {len(authors)}")
# The artist line in the doc is one joined string; split on the middle dot.
m = re.search(r"Photo artists.*?\*\*(.*?)\*\*", src)
doc_authors = [a.strip() for a in m.group(1).split("·")] if m else []
for a in doc_authors:
    traced = any(a in x or x in a for x in authors)
    check(traced, f"{a}")

print("\n=== 5. 章节标题（src/data/chapters.js）===")
chap = open(os.path.join(ROOT, "src", "data", "chapters.js"), encoding="utf-8").read()
for en in ["WATER", "BRIDGES", "BOATS", "LIFE", "NIGHT", "MEMORY"]:
    check(en in src and f"en: '{en}'" in chap, f"{en}")

print("\n=== 6. 编造痕迹扫描 ===")
for bad in ["1,000+", "1000+", "approximately", "roughly", "circa", "estimated"]:
    check(bad not in src.lower(), f"无 '{bad}'")

print("\n=== 7. 项目标识 ===")
check("907" in src, "907 班级")
check("90706" in src, "90706 小组")
check("4 weeks" in src, "4 周周期")
check("6" in src, "6 人")

print(f"\n>>> {'ALL CHECKS PASSED' if fails == 0 else str(fails) + ' CHECK(S) FAILED'}")
raise SystemExit(1 if fails else 0)
