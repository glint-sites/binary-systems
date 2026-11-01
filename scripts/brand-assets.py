# Raster brand assets: favicon.ico, app icons and Open Graph share images.
# Usage: python -I scripts/brand-assets.py   (needs Pillow; run from the repo root)
# Draws straight from the vector logo in images/brand/bsm-logo.svg, so the PNGs always match it.
import re
from PIL import Image, ImageDraw, ImageFont, ImageChops

VIOLET = (104, 63, 153)
INK = (21, 14, 36)
WHITE = (255, 255, 255)


def subpaths(d):
    """Flatten an absolute M/L/H/V/C/Z SVG path into point lists."""
    toks = re.findall(r"[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?", d)
    out, cur, i, cmd, x, y = [], [], 0, None, 0.0, 0.0
    num = lambda: float(toks[i])
    while i < len(toks):
        t = toks[i]
        if re.match(r"[MLHVCZ]", t):
            cmd = t; i += 1
            if cmd == "Z":
                if cur: out.append(cur); cur = []
            continue
        if cmd == "M":
            if cur: out.append(cur)
            x, y = float(toks[i]), float(toks[i + 1]); i += 2; cur = [(x, y)]; cmd = "L"
        elif cmd == "L":
            x, y = float(toks[i]), float(toks[i + 1]); i += 2; cur.append((x, y))
        elif cmd == "H":
            x = num(); i += 1; cur.append((x, y))
        elif cmd == "V":
            y = num(); i += 1; cur.append((x, y))
        elif cmd == "C":
            x1, y1, x2, y2, x3, y3 = (float(v) for v in toks[i:i + 6]); i += 6
            x0, y0 = x, y
            for k in range(1, 13):
                s = k / 12; m = 1 - s
                cur.append((m**3 * x0 + 3 * m * m * s * x1 + 3 * m * s * s * x2 + s**3 * x3,
                            m**3 * y0 + 3 * m * m * s * y1 + 3 * m * s * s * y2 + s**3 * y3))
            x, y = x3, y3
    if cur: out.append(cur)
    return out


def draw_svg(svg_file, width, color, only=None):
    """Render the logo's paths (even-odd per path) to an RGBA image `width` px wide."""
    svg = open(svg_file, encoding="utf-8").read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    paths = re.findall(r'<path d="([^"]+)"', svg)
    if only is not None: paths = paths[:only]
    ss = 4
    scale = width * ss / vb[2]
    W, H = int(vb[2] * scale), int(vb[3] * scale)
    mask = Image.new("L", (W, H), 0)
    for d in paths:
        pm = Image.new("L", (W, H), 0)
        for sp in subpaths(d):
            if len(sp) < 3: continue
            tmp = Image.new("L", (W, H), 0)
            ImageDraw.Draw(tmp).polygon([((px - vb[0]) * scale, (py - vb[1]) * scale) for px, py in sp], fill=255)
            pm = ImageChops.logical_xor(pm.convert("1"), tmp.convert("1")).convert("L")
        mask = ImageChops.lighter(mask, pm)
    mask = mask.resize((W // ss, H // ss), Image.LANCZOS)
    img = Image.new("RGBA", mask.size, color + (0,))
    img.putalpha(mask)
    return img


def icon(size, path):
    ss = 4
    tile = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    ImageDraw.Draw(tile).rounded_rectangle([0, 0, size * ss - 1, size * ss - 1], radius=int(size * ss * 0.22), fill=VIOLET + (255,))
    tile = tile.resize((size, size), Image.LANCZOS)
    mark = draw_svg("images/brand/bsm-mark.svg", int(size * 0.62), WHITE)
    tile.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    tile.save(path)
    return tile


def font(size, wght=600, wdth=100):
    f = ImageFont.truetype("fonts/Archivo-normal-100-900-latin.woff2", size)
    try:
        axes = f.get_variation_axes()
        vals = [wght if a["name"] in (b"Weight", "Weight") else wdth for a in axes]
        f.set_variation_by_axes(vals)
    except Exception:
        pass
    return f


def og(path, tagline):
    W, H = 1200, 630
    im = Image.new("RGBA", (W, H), INK + (255,))
    d = ImageDraw.Draw(im)
    # Soft violet glow + dot grid, as on the site's dark sections.
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse([640, -260, 1400, 520], fill=120)
    from PIL import ImageFilter
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    im = Image.composite(Image.new("RGBA", (W, H), VIOLET + (255,)), im, glow)
    d = ImageDraw.Draw(im)
    for gx in range(14, W, 28):
        for gy in range(14, H, 28):
            d.ellipse([gx - 1.3, gy - 1.3, gx + 1.3, gy + 1.3], fill=(187, 163, 223, 34))
    # Plate: BINARYSYSTEM, one ASCII byte per column, rows A-H.
    word = "BINARYSYSTEM"
    px, py, cell, r = 680, 150, 38, 14
    d.rounded_rectangle([px - 34, py - 52, px + 12 * cell + 4, py + 8 * cell + 56], radius=24, fill=(32, 23, 54, 255), outline=(220, 206, 245, 40), width=2)
    small = font(15, 500)
    for ci, ch in enumerate(word):
        bits = format(ord(ch), "08b")
        cx = px + ci * cell + cell / 2
        d.text((cx, py - 30), str(ci + 1), font=small, fill=(143, 132, 168), anchor="mm")
        for ri in range(8):
            cy = py + ri * cell + cell / 2
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(12, 7, 24), outline=(187, 163, 223, 45), width=2)
            if bits[ri] == "1":
                d.ellipse([cx - r + 3, cy - r + 3, cx + r - 3, cy + r - 3], fill=(170, 128, 230))
        d.text((cx, py + 8 * cell + 26), ch, font=font(20, 600), fill=(217, 203, 238), anchor="mm")
    for ri, rl in enumerate("ABCDEFGH"):
        d.text((px - 18, py + ri * cell + cell / 2), rl, font=small, fill=(143, 132, 168), anchor="mm")
    logo = draw_svg("images/brand/bsm-logo.svg", 300, WHITE)
    im.alpha_composite(logo, (80, 92))
    y = 300
    if tagline:
        for line in tagline:
            d.text((80, y), line, font=font(44, 640), fill=WHITE)
            y += 56
    d.text((80, 520), "IVD  ·  MD  ·  RUO", font=font(22, 600), fill=(187, 163, 223))
    d.text((80, 556), "binarysys.net", font=font(22, 500), fill=(143, 132, 168))
    im.convert("RGB").save(path, optimize=True)


if __name__ == "__main__":
    i512 = icon(512, "images/brand/icon-512.png")
    icon(192, "images/brand/icon-192.png")
    icon(180, "images/brand/apple-touch-icon.png")
    i512.resize((48, 48), Image.LANCZOS).save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    import os
    os.makedirs("images/og", exist_ok=True)
    og("images/og/og-en.png", ["IVD & medical device", "solutions for Saudi", "healthcare."])
    og("images/og/og-ar.png", None)
    print("brand assets written")
