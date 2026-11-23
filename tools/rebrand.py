#!/usr/bin/env python3
"""Recolour the copied YourTube frontend into the green TizenTube identity.

Keeps the exact same frontend behaviour; only the play button / accent colour,
launcher identity and descriptive text change. No Chrome/headless rasterizer is
needed: the existing PNGs are recoloured pixel-by-pixel from the known
#1E6FFF source blue into #00E676 green.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"

GREEN = "#00E676"
GREEN_LOW = GREEN.lower()
SOURCE_BLUE = (30, 111, 255)
TARGET_GREEN = (0, 230, 118)

TEXT_SUFFIXES = {".svg", ".css", ".js", ".xml", ".html"}

REPLACEMENTS = [
    ("#1E6FFF", GREEN),
    ("#1e6fff", GREEN_LOW),
    ("black background, white wordmark, blue play button",
     "black background, white wordmark, green play button"),
    ("blue play button", "green play button"),
    ("blue circles", "green circles"),
    ("blue progress bar", "green progress bar"),
    ("blue SponsorBlock ranges", "green SponsorBlock ranges"),
    ("blue marks on the seek bar", "green marks on the seek bar"),
    ("thin blue played range", "thin green played range"),
    ("same blue as the wordmark play icon", "same green as the wordmark play icon"),
    ("blue liked state", "green liked state"),
    ("with blue accents", "with green accents"),
]

IDENTITY = [
    ('id="https://yourtube.local/app"', 'id="https://youtube.local/app"'),
    ("<description>A 10-foot YouTube client: no ads, no Shorts, no noise.</description>",
     "<description>YouTube (TizenTube edition): a 10-foot ad-free client.</description>"),
    ("<author href=\"http://localhost\" email=\"\">YourTube</author>",
     "<author href=\"http://localhost\" email=\"\">TizenTube</author>"),
    ('id="GmLaunch01.YourTube" package="GmLaunch01"',
     'id="GmLaunch02.TyzenTube" package="GmLaunch02"'),
]


def recolour_pixel(rgb):
    """Map blends of black/white/#1E6FFF onto black/white/#00E676."""
    r, g, b = rgb[:3]
    a = (b - r) / 225.0          # amount of source blue in the pixel
    w = b / 255.0 - a            # amount of white in the pixel
    if a < 0:
        a = 0.0
    if w < 0:
        w = 0.0
    total = a + w
    if total > 1.0:
        a /= total
        w /= total
    gr, gg, gb = TARGET_GREEN
    return (
        int(round(w * 255)),
        int(round(a * gg + w * 255)),
        int(round(a * gb + w * 255)),
    )


def recolour_png(path):
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, alpha = pixels[x, y]
            pixels[x, y] = recolour_pixel((r, g, b)) + (alpha,)
    image.save(path, optimize=True)


def main():
    changed_text = 0
    for path in sorted(APP.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() in TEXT_SUFFIXES:
            text = path.read_text(encoding="utf-8")
            original = text
            for old, new in REPLACEMENTS + IDENTITY:
                text = text.replace(old, new)
            if text != original:
                path.write_text(text, encoding="utf-8")
                changed_text += 1
        elif path.suffix.lower() == ".png":
            recolour_png(path)
    print(f"recoloured PNGs and updated {changed_text} text files for {GREEN}")


if __name__ == "__main__":
    main()
