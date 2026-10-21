"""Extract the designer's original vector paths; never trace or upscale PNGs."""
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import pymupdf

source = pymupdf.open(sys.argv[1])
page = source[2]
target = Path(__file__).resolve().parents[1] / "public/assets/services"
target.mkdir(parents=True, exist_ok=True)
names = ["civil", "humanos", "penal", "publico", "propiedad", "corporativo", "concursal", "ambiental"]
bands = [(x0, y0, x1, y1) for y0, y1 in [(820, 940), (1430, 1540)]
         for x0, x1 in [(400, 600), (750, 950), (1100, 1300), (1450, 1700)]]
namespace = "http://www.w3.org/2000/svg"
ET.register_namespace("", namespace)

def point(value):
    return f"{value.x:.3f} {value.y:.3f}"

for name, band in zip(names, bands):
    selection = []
    for drawing in page.get_drawings():
        color = drawing.get("fill")
        if color and color[0] > .5 and color[0] > color[1] * 1.05 and color[1] > color[2] * 1.1 and drawing["rect"] in pymupdf.Rect(band):
            selection.append(drawing)
    if len(selection) < 5:
        raise ValueError(f"Missing vector symbol: {name}")
    bounds = pymupdf.Rect()
    for drawing in selection:
        bounds |= drawing["rect"]
    bounds += (-1, -1, 1, 1)
    root = ET.Element(f"{{{namespace}}}svg", {"viewBox": f"{bounds.x0:.3f} {bounds.y0:.3f} {bounds.width:.3f} {bounds.height:.3f}"})
    for drawing in selection:
        commands = []
        previous = None
        for kind, *points in drawing["items"]:
            if kind not in ("l", "c"):
                raise ValueError(f"Unexpected path command: {kind}")
            if previous != points[0]:
                commands.append(f"M{point(points[0])}")
            if kind == "l":
                commands.append(f"L{point(points[1])}")
            else:
                commands.append("C" + " ".join(point(p) for p in points[1:]))
            previous = points[-1]
        if drawing.get("closePath"):
            commands.append("Z")
        color = "#" + "".join(f"{round(channel * 255):02x}" for channel in drawing["fill"])
        ET.SubElement(root, f"{{{namespace}}}path", {"fill": color, "fill-rule": "evenodd" if drawing.get("even_odd") else "nonzero", "d": " ".join(commands)})
    ET.ElementTree(root).write(target / f"{name}.svg", encoding="utf-8", xml_declaration=False)
    print(name, len(selection), "vector paths")
