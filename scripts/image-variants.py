# Responsive image variants, so cards and small slots don't download full-size images.
# Usage: python -I scripts/image-variants.py   (needs Pillow; run from the repo root)
#   images/products/<slug>.webp  -> <slug>-xs.webp (440w)   [-sm 720w and full 1400w already exist]
#   images/insights/<slug>.webp  -> <slug>-xs.webp (440w)
#   images/photos/<name>.webp    -> <name>-md.webp (800w)
# Idempotent: existing variants are rewritten from the full-size source.
import os
from PIL import Image

def variant(src, dst, width, quality=78):
    im = Image.open(src)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)

for folder, suffix, width in (("images/products", "-xs", 440), ("images/insights", "-xs", 440), ("images/photos", "-md", 800)):
    for f in sorted(os.listdir(folder)):
        if not f.endswith(".webp") or f.rsplit(".", 1)[0].endswith(("-xs", "-sm", "-md")):
            continue
        variant(os.path.join(folder, f), os.path.join(folder, f.replace(".webp", f"{suffix}.webp")), width)
print("variants written")
