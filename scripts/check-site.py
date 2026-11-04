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
# Draft pages are deliberately noindex until governance is formally confirmed.
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
        page_loc_tag = "{http://www.sitemaps.org/schemas/sitemap/0.9}loc"
        image_loc_tag = "{http://www.google.com/schemas/sitemap-image/1.1}loc"
        urls = [item.text for item in tree.iter() if item.tag == page_loc_tag]
        image_urls = [item.text for item in tree.iter() if item.tag == image_loc_tag]
        if len(image_urls) != len(set(image_urls)):
            fail("duplicate image URLs in sitemap")
        for image_url in image_urls:
            if not image_url or not image_url.startswith(HOST):
                fail(f"invalid sitemap image URL: {image_url}")
                continue
            asset_path = unquote(urlsplit(image_url).path).lstrip("/")
            if not (ROOT / asset_path).is_file():
                fail(f"sitemap references missing image: {asset_path}")
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
            if logo and logo.startswith("assets/"):
                logo_path = urlsplit(logo).path
                if not (ROOT / logo_path).is_file():
                    fail(f"missing logo: {logo_path}")

# Maintain the media archive as a single coherent collection: every referenced
# photo, thumbnail, downloadable press release and press-kit file must exist.
gallery_path = ROOT / "content" / "gallery-press.json"
if gallery_path.is_file():
    try:
        gallery = json.loads(gallery_path.read_text(encoding="utf-8"))
        seen_events = set()
        referenced = set()

        def check_media_file(url, context):
            if not isinstance(url, str):
                fail(f"{context}: missing or invalid media path")
                return
            parsed = urlsplit(url)
            path_text = unquote(parsed.path)
            if parsed.scheme or parsed.netloc or not path_text.startswith("assets/"):
                fail(f"{context}: expected internal asset: {url}")
                return
            target = (ROOT / path_text).resolve()
            if not target.is_relative_to(ROOT):
                fail(f"{context}: media path escapes repository: {url}")
            elif not target.is_file():
                fail(f"{context}: missing asset: {path_text}")
            referenced.add(path_text)

        for event in gallery.get("events", []):
            event_id = event.get("id")
            if not event_id or event_id in seen_events:
                fail(f"gallery-press: duplicate or empty event id: {event_id}")
            seen_events.add(event_id)
            check_media_file(event.get("cover"), f"gallery event {event_id} cover")
            for index, image in enumerate(event.get("photos", []), start=1):
                check_media_file(image.get("full"), f"{event_id} photo {index} full")
                check_media_file(image.get("thumb"), f"{event_id} photo {index} thumbnail")
            for release in event.get("pressReleases", []):
                check_media_file(release.get("url"), f"{event_id} press release")
        for item in gallery.get("pressKit", []):
            check_media_file(item.get("url"), "gallery press kit")
    except (ValueError, OSError, TypeError) as error:
        fail(f"content/gallery-press.json: {error}")

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
