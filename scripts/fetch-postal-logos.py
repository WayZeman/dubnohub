#!/usr/bin/env python3
import json
import urllib.parse
import urllib.request
from pathlib import Path

UA = "DubnoHub/1.0 (city directory; logo sync)"


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def search_commons(q: str) -> list[str]:
    api = (
        "https://commons.wikimedia.org/w/api.php?"
        + urllib.parse.urlencode(
            {
                "action": "query",
                "list": "search",
                "srsearch": q,
                "srnamespace": 6,
                "srlimit": 12,
                "format": "json",
            }
        )
    )
    data = json.loads(get(api).decode())
    return [s["title"] for s in data["query"]["search"]]


def file_url(title: str):
    api = (
        "https://commons.wikimedia.org/w/api.php?"
        + urllib.parse.urlencode(
            {
                "action": "query",
                "titles": title,
                "prop": "imageinfo",
                "iiprop": "url|mime|size",
                "format": "json",
            }
        )
    )
    j = json.loads(get(api).decode())
    page = next(iter(j["query"]["pages"].values()))
    ii = (page.get("imageinfo") or [None])[0]
    return ii


def main() -> None:
    print("NP search:", search_commons("Nova Poshta logo"))
    print("UP search:", search_commons("Ukrposhta logo"))
    print("UP ua:", search_commons("Укрпошта"))

    for title in search_commons("Nova Poshta")[:8] + search_commons("Укрпошта")[:8]:
        ii = file_url(title)
        if not ii:
            continue
        if not str(ii.get("mime", "")).startswith("image/"):
            continue
        print(f"{title}\n  {ii['url']} ({ii['mime']}, {ii['size']})")

    # official pages
    for label, url in [
        ("np", "https://novaposhta.ua/"),
        ("up", "https://www.ukrposhta.ua/ua"),
    ]:
        html = get(url).decode("utf-8", "ignore")
        print(f"\n== {label} page logos ==")
        import re

        for m in re.findall(
            r"[\"']((?:https?:)?//[^\"']+\.(?:svg|png))[\"']", html, re.I
        ):
            if any(k in m.lower() for k in ("logo", "brand", "emblem", "mark")):
                print(" ", m)
        for m in re.findall(r"[\"'](/[^\"']*logo[^\"']*\.(?:svg|png))[\"']", html, re.I):
            print(" rel", m)


if __name__ == "__main__":
    main()
