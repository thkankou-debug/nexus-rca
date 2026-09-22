#!/usr/bin/env python3
"""Rastérise le dessin officiel de components/ui/NexusLogoMark.tsx.

Ne redessine pas un autre symbole. Géométrie reprise telle quelle :
viewBox 24, traits M3 3 L21 21 et M21 3 L3 21, cercle r=3,
dégradé #0a1a6b → #f97316 (nexus-blue-800 → nexus-orange-500),
pastille orange avec anneau blanc.
La variante thermique est le même dessin en noir et blanc, lisible
sur Star TSP143LAN.
"""

from PIL import Image, ImageDraw

NAVY = (10, 26, 107)
ORANGE = (249, 115, 22)
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def symbol(draw, box, color, sw):
    x0, y0, x1, y1 = box

    def p(vx, vy):
        return (x0 + vx / 24 * (x1 - x0), y0 + vy / 24 * (y1 - y0))

    def cap(pt):
        r = sw / 2
        draw.ellipse((pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r), fill=color)

    a, b = p(3, 3), p(21, 21)
    c, d = p(21, 3), p(3, 21)
    draw.line([a, b], fill=color, width=sw)
    draw.line([c, d], fill=color, width=sw)
    for pt in (a, b, c, d):
        cap(pt)
    cx, cy = p(12, 12)
    r = 3 / 24 * (x1 - x0)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color)


def render(path, mono=False, px=640):
    square = int(px * 0.82)
    ox = int(px * 0.06)
    oy = int(px * 0.06)
    canvas = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    grad = Image.new("RGBA", (square, square), (0, 0, 0, 0))
    pix = grad.load()
    for y in range(square):
        for x in range(square):
            t = (x + y) / (2 * (square - 1))
            rgb = (0, 0, 0) if mono else lerp(NAVY, ORANGE, t)
            pix[x, y] = (*rgb, 255)
    grad.putalpha(rounded_mask(square, int(square * 0.3)))
    canvas.paste(grad, (ox, oy), grad)

    draw = ImageDraw.Draw(canvas)
    inner = square * 0.6
    ix = ox + (square - inner) / 2
    iy = oy + (square - inner) / 2
    sw = max(2, int(round(2.5 / 24 * inner)))
    symbol(draw, (ix, iy, ix + inner, iy + inner), WHITE, sw)

    dot = square * 0.25
    ring = square * 0.05
    dcx = ox + square - square * 0.075
    dcy = oy + square - square * 0.075
    draw.ellipse(
        (dcx - dot / 2 - ring, dcy - dot / 2 - ring, dcx + dot / 2 + ring, dcy + dot / 2 + ring),
        fill=WHITE,
    )
    fill = (0, 0, 0, 255) if mono else (*ORANGE, 255)
    draw.ellipse((dcx - dot / 2, dcy - dot / 2, dcx + dot / 2, dcy + dot / 2), fill=fill)
    canvas.save(path)


if __name__ == "__main__":
    render("public/brand/nexus-mark.png", mono=False)
    render("public/brand/nexus-mark-thermal.png", mono=True)
