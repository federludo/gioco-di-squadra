#!/usr/bin/env python3
"""Non-destructive integrity checks for the static Gioco di Squadra website."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
HOST = "https://giocodisquadra.net/"
EXCLUDED = {Path("404.html"), Path("evento/index.html"), Path("partner/index.html")}
errors = []


def fail(message):
    errors.append(message)


def relpath(path):
    return path.relative_to(ROOT).as_posix()


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.meta = {}
        self.canonical = []
        self.title_count = 0

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "title":
            self.title_count += 1
        if tag == "meta" and values.get("name"):
            self.meta[values["name"].lower()] = values.get("content", "")
        if tag == "link" and values.get("rel") == "canonical":
            self.canonical.append(values.get("href", ""))
        if tag in ("a", "img", "script", "link"):
            key = "href" if tag in ("a", "link") else "src"
            if values.get(key):
                self.links.append(values[key])


pages = sorted(ROOT.rglob("index.html"))
pages.extend(ROOT.glob("404.html"))
public = {}
for path in pages:
    parser = PageParser()
    html = path.read_text(encoding="utf-8")
    try:
        parser.feed(html)
    except Exception as error:
        fail(f"{relpath(path)}: invalid HTML parser input ({error})")
        continue
    rel = path.relative_to(ROOT)
    if parser.title_count != 1:
        fail(f"{rel}: expected one HTML title, got {parser.title_count}")
    expected_url = HOST + ("" if rel == Path("index.html") else rel.as_posix()[:-len("index.html")])
    if rel not in EXCLUDED:
        if parser.meta.get("robots", "").lower() != "index,follow":
            fail(f"{rel}: expected index,follow")
        if parser.canonical != [expected_url]:
            fail(f"{rel}: canonical mismatch: {parser.canonical!r}")
        public[expected_url] = rel
    elif "noindex" not in parser.meta.get("robots", "").lower():
        fail(f"{rel}: empty template / 404 should remain noindex")
    for raw in parser.links:
        if raw.startswith(("//", "#")):
            continue
        parsed = urlsplit(raw)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        relative = unquote(parsed.path)
        dest = (ROOT / relative.lstrip("/")) if relative.startswith("/") else (path.parent / relative)
        dest = dest.resolve()
        if not dest.is_relative_to(ROOT):
            fail(f"{rel}: link outside project: {raw}")
            continue
        if dest.is_dir():
            dest /= "index.html"
        if not dest.exists():
            fail(f"{rel}: missing local target: {raw}")

sitemap = ROOT / "sitemap.xml"
if not sitemap.is_file():
    fail("missing sitemap.xml")
else:
    try:
        tree = ET.parse(sitemap).getroot()
        urls = [item.text for item in tree.iter() if item.tag.endswith("}loc")]
        if len(urls) != len(set(urls)):
            fail("duplicate sitemap URLs")
        if set(urls) != set(public):
            fail(f"sitemap mismatch; missing={sorted(set(public)-set(urls))}; extra={sorted(set(urls)-set(public))}")
    except (ET.ParseError, OSError) as error:
        fail(f"invalid sitemap.xml: {error}")

robots = ROOT / "robots.txt"
if not robots.is_file() or "Sitemap: " + HOST + "sitemap.xml" not in robots.read_text(encoding="utf-8"):
    fail("robots.txt sitemap reference missing or incorrect")

for filename in ("organizations", "events", "news", "site"):
    try:
        data = json.loads((ROOT / "content" / (filename + ".json")).read_text(encoding="utf-8"))
    except (ValueError, OSError) as error:
        fail(f"content/{filename}.json: {error}")
        continue
    if filename == "organizations":
        ids = [x["id"] for x in data]
        if len(ids) != len(set(ids)):
            fail("duplicate organization IDs")
        for o in data:
            if o.get("type") not in ("capofila", "partner", "sostenitore"):
                fail(f"invalid organization type: {o['id']}")
                continue
            p = ROOT / ("sostenitore" if o["type"] == "sostenitore" else "partner") / o["id"] / "index.html"
            if not p.is_file():
                fail(f"missing organization profile: {o['id']}")
            elif "net-profile-static" not in p.read_text(encoding="utf-8"):
                fail(f"profile lacks HTML fallback: {o['id']}")
            logo = o.get("image")
            if logo and logo.startswith("assets/") and not (ROOT / logo).is_file():
                fail(f"missing logo: {logo}")

homepage = (ROOT / "index.html").read_text(encoding="utf-8")
network = (ROOT / "partenariato/index.html").read_text(encoding="utf-8")
calendar = (ROOT / "calendario/index.html").read_text(encoding="utf-8")
if homepage.count('class="gds-partner-slide"') < 11:
    fail("homepage partner carousel missing logos")
if 'id="network-map"' not in network:
    fail("network map mount point missing")
if 'id="calendar-count"' not in calendar:
    fail("calendar mount point missing")

if errors:
    for message in errors:
        print("ERROR:", message, file=sys.stderr)
    print(f"Validation failed with {len(errors)} issue(s)", file=sys.stderr)
    sys.exit(1)
print(f"Site integrity OK: {len(public)} public pages, {len(pages)} HTML pages, JSON data and local links")
