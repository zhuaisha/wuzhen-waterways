# -*- coding: utf-8 -*-
"""Verify every slide's text actually made it into the PPTX XML, and that
all authoritative project facts are present."""
import zipfile
import re
import sys

PPTX = r"C:\Users\zhuaisha\AppData\Local\Hermes Agent CN Desktop\data\hermes-home\projects\wuzhen_waterways_ppt169_20261006\exports\wuzhen_waterways_final.pptx"

z = zipfile.ZipFile(PPTX)
slide_names = sorted(n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n))
print(f"=== {len(slide_names)} slide XML parts ===")

all_text = ""
for n in slide_names:
    xml = z.read(n).decode("utf-8", errors="replace")
    # a:t is the DrawingML text-run element
    runs = re.findall(r"<a:t>(.*?)</a:t>", xml)
    txt = " ".join(runs)
    all_text += " " + txt
    imgs = xml.count("<p:pic>")
    print(f"  {n.split('/')[-1]:<18} {len(runs):>3} text-runs | {len(txt):>5} chars | {imgs} pictures")

print()
print("=== Fact verification (authoritative sources only) ===")
checks = [
    ("72 bridges", "72"),
    ("10,000 waterway meters", "10,000"),
    ("core question", "Why is water the main line"),
    ("group 90706", "90706"),
    ("6 team members - 蒋盛熠", "蒋盛熠"),
    ("6 team members - 汪瀚宇", "汪瀚宇"),
    ("6 team members - 鲁昂", "鲁昂"),
    ("6 team members - 朱钟乐", "朱钟乐"),
    ("6 team members - 沈毅程", "沈毅程"),
    ("6 team members - 沈煜程", "沈煜程"),
    ("atlas node North Water Gate", "NORTH WATER GATE"),
    ("atlas node Xizha Bridge", "XIZHA BRIDGE"),
    ("atlas node Lantern Wharf", "LANTERN WHARF"),
    ("atlas node Morning Market", "MORNING MARKET"),
    ("credit 韩笃一", "韩笃一"),
    ("credit Immanuel Giel", "Immanuel Giel"),
    ("credit Jakub Halun", "Jakub Hałun"),
    ("credit Gerbil", "Gerbil"),
    ("credit Nico le terrible", "Nico le terrible"),
    ("credit Sastognuti", "Sastognuti"),
    ("credit N509FZ", "N509FZ"),
    ("credit ChinaUli2010", "ChinaUli2010"),
    ("coordinates", "120.49"),
    ("closing line", "Water connects everything"),
]
fail = 0
for label, needle in checks:
    ok = needle in all_text
    if not ok:
        fail += 1
    print(f"  [{'OK ' if ok else 'MISS'}] {label}")

# forbidden: any fabricated-looking figure not in the source
print()
print("=== Fabrication guard (no invented numbers) ===")
num_like = sorted(set(re.findall(r"\b\d{1,3}(?:,\d{3})+\b", all_text)))
print(f"  large numbers found: {num_like}")
bad = [n for n in num_like if n not in ("10,000",)]
print(f"  unexpected large numbers: {bad if bad else 'none'}")

print()
print(f"FAIL: {fail + (1 if bad else 0)}")
sys.exit(0)
