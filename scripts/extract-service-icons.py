"""Extract the official symbols without resampling the designer's PNGs."""
from pathlib import Path
import sys
from PIL import Image

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / "public/assets/services"
target.mkdir(parents=True, exist_ok=True)
names = ["civil", "humanos", "penal", "publico", "propiedad", "corporativo", "concursal", "ambiental"]
for number, name in enumerate(names, 1):
    original = Image.open(source / f"servicios-{number:02}.png").convert("RGBA")
    band = original.crop((0, 0, original.width, 112))
    points = [(x, y) for y in range(band.height) for x in range(band.width)
              if (lambda p: p[0] > 120 and p[0] > p[1] * 1.08 and p[1] > p[2] * 1.1)(band.getpixel((x, y)))]
    if not points:
        raise ValueError(f"Missing symbol: {name}")
    box = (min(x for x, _ in points) - 3, min(y for _, y in points) - 3,
           max(x for x, _ in points) + 4, max(y for _, y in points) + 4)
    original.crop(box).save(target / f"{name}.png")
    print(name, box)
