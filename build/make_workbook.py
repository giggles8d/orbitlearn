#!/usr/bin/env python3
"""THE ATOMIC RESET — Your Sunday Micro-Habit Planner.
Generates a 35-page, print-ready (vector / 300+ DPI), interactive PDF:
fillable AcroForm fields, PDF outline bookmarks, and internal hyperlinks.
"""
import os
import math
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
OUT = os.path.join(HERE, "THE_ATOMIC_RESET.pdf")

# ----------------------------------------------------------------------------
# Fonts
# ----------------------------------------------------------------------------
def _reg(name, fn):
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONTS, fn)))

_reg("PF",   "PlayfairDisplay-Regular.ttf")
_reg("PFsb", "PlayfairDisplay-SemiBold.ttf")
_reg("PFb",  "PlayfairDisplay-Bold.ttf")
_reg("PFi",  "PlayfairDisplay-Italic.ttf")
_reg("MS",   "Montserrat-Regular.ttf")
_reg("MSm",  "Montserrat-Medium.ttf")
_reg("MSsb", "Montserrat-SemiBold.ttf")
_reg("MSb",  "Montserrat-Bold.ttf")
_reg("SC",   "DancingScript-SemiBold.ttf")

# ----------------------------------------------------------------------------
# Palette
# ----------------------------------------------------------------------------
SAGE  = HexColor("#A4B494")
CREAM = HexColor("#F5EFE6")
OAK   = HexColor("#D4B896")
CHAR  = HexColor("#3D3D3D")
TERRA = HexColor("#C97B63")
WHITE = HexColor("#FFFFFF")

def tint(c, p):
    return Color(c.red + (1 - c.red) * p, c.green + (1 - c.green) * p,
                 c.blue + (1 - c.blue) * p, 1)

def shade(c, p):
    return Color(c.red * (1 - p), c.green * (1 - p), c.blue * (1 - p), 1)

SAGE_BG  = tint(SAGE, 0.78)
SAGE_PNL = tint(SAGE, 0.62)
SAGE_MD  = tint(SAGE, 0.42)
SAGE_LN  = tint(SAGE, 0.50)
OAK_BG   = tint(OAK, 0.66)
OAK_LN   = tint(OAK, 0.38)
CARD     = HexColor("#FBF8F1")
CREAM_DK = HexColor("#ECE2D2")
INK2     = tint(CHAR, 0.30)
INK3     = tint(CHAR, 0.50)
RULE_LT  = tint(SAGE, 0.55)
TERRA_DK = shade(TERRA, 0.12)
TRANS    = Color(1, 1, 1, 0)

PAGE_W, PAGE_H = 612.0, 792.0
MARGIN = 58.0
CW = PAGE_W - 2 * MARGIN
CX = PAGE_W / 2.0

# ----------------------------------------------------------------------------
# Low-level text / shape helpers
# ----------------------------------------------------------------------------
def text(c, x, y, s, font, size, color, align="l", track=0.0):
    c.setFont(font, size)
    c.setFillColor(color)
    if align == "c":
        c.drawCentredString(x, y, s, charSpace=track)
    elif align == "r":
        c.drawRightString(x, y, s, charSpace=track)
    else:
        c.drawString(x, y, s, charSpace=track)

def eyebrow(c, x, y, s, color=TERRA, size=8.6, track=2.6, align="l", font="MSsb"):
    s = s.upper()
    c.setFont(font, size)
    c.setFillColor(color)
    w = pdfmetrics.stringWidth(s, font, size) + track * (len(s) - 1)
    if align == "c":
        c.drawString(x - w / 2, y, s, charSpace=track)
    elif align == "r":
        c.drawString(x - w, y, s, charSpace=track)
    else:
        c.drawString(x, y, s, charSpace=track)
    return w

def wrap(s, font, size, maxw):
    out = []
    for block in s.split("\n"):
        words = block.split()
        if not words:
            out.append("")
            continue
        cur = ""
        for w in words:
            t = (cur + " " + w).strip()
            if pdfmetrics.stringWidth(t, font, size) <= maxw:
                cur = t
            else:
                if cur:
                    out.append(cur)
                cur = w
        out.append(cur)
    return out

def para(c, x, y, s, font, size, color, maxw, leading, align="l"):
    for ln in wrap(s, font, size, maxw):
        text(c, x, y, ln, font, size, color, align=align)
        y -= leading
    return y

def box(c, x, y, w, h, r=8, fill=None, stroke=None, sw=1.0, dash=None):
    if fill is not None:
        c.setFillColor(fill)
    if stroke is not None:
        c.setStrokeColor(stroke)
        c.setLineWidth(sw)
    if dash:
        c.setDash(dash, 0)
    c.roundRect(x, y, w, h, r, stroke=1 if stroke is not None else 0,
                fill=1 if fill is not None else 0)
    if dash:
        c.setDash([], 0)

def rule(c, x1, y, x2, color=SAGE, w=1.0, dash=None):
    c.setStrokeColor(color)
    c.setLineWidth(w)
    c.setLineCap(1)
    if dash:
        c.setDash(dash, 0)
    c.line(x1, y, x2, y)
    if dash:
        c.setDash([], 0)

def vrule(c, x, y1, y2, color=SAGE, w=1.0, dash=None):
    c.setStrokeColor(color)
    c.setLineWidth(w)
    c.setLineCap(1)
    if dash:
        c.setDash(dash, 0)
    c.line(x, y1, x, y2)
    if dash:
        c.setDash([], 0)

# ----------------------------------------------------------------------------
# Botanical line-art (pure vector)
# ----------------------------------------------------------------------------
def leaf(c, x, y, angle, length, color=SAGE, fill=None, lw=1.0, width=None, vein=True):
    if width is None:
        width = length * 0.46
    c.saveState()
    c.translate(x, y)
    c.rotate(angle)
    p = c.beginPath()
    p.moveTo(0, 0)
    p.curveTo(length * 0.30, width * 0.5, length * 0.72, width * 0.5, length, 0)
    p.curveTo(length * 0.72, -width * 0.5, length * 0.30, -width * 0.5, 0, 0)
    p.close()
    if fill is not None:
        c.setFillColor(fill)
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.setLineJoin(1)
    c.drawPath(p, fill=1 if fill is not None else 0, stroke=1)
    if vein:
        c.setLineWidth(lw * 0.7)
        c.line(0, 0, length * 0.9, 0)
    c.restoreState()

def sprig(c, x, y, scale=1.0, color=SAGE, lw=1.15):
    c.saveState()
    c.translate(x, y)
    c.scale(scale, scale)
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.setLineCap(1)
    H = 46
    c.line(0, 0, 0, H)
    for hy, ll in [(15, 17), (26, 14), (35, 11)]:
        leaf(c, 0, hy, 42, ll, color=color, lw=lw * 0.9)
        leaf(c, 0, hy, 138, ll, color=color, lw=lw * 0.9)
    leaf(c, 0, H, 90, 12, color=color, lw=lw * 0.9)
    c.restoreState()

def sprig_filled(c, x, y, scale=1.0, color=SAGE, fillc=None, lw=1.2):
    if fillc is None:
        fillc = tint(color, 0.55)
    c.saveState()
    c.translate(x, y)
    c.scale(scale, scale)
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.setLineCap(1)
    H = 70
    p = c.beginPath()
    p.moveTo(0, 0)
    p.curveTo(3, H * 0.4, -3, H * 0.7, 0, H)
    c.drawPath(p, fill=0, stroke=1)
    for hy, ll, side in [(20, 24, 1), (32, 21, -1), (44, 18, 1), (54, 14, -1)]:
        ang = 40 if side > 0 else 140
        leaf(c, 0, hy, ang, ll, color=color, fill=fillc, lw=lw * 0.9)
    leaf(c, 0, H, 90, 16, color=color, fill=fillc, lw=lw * 0.9)
    c.restoreState()

def sun(c, x, y, r, color=OAK, lw=1.1, rays=11):
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.setLineCap(1)
    c.circle(x, y, r, stroke=1, fill=0)
    for i in range(rays):
        a = 2 * math.pi * i / rays
        c.line(x + math.cos(a) * (r + 3.2), y + math.sin(a) * (r + 3.2),
               x + math.cos(a) * (r + 8.5), y + math.sin(a) * (r + 8.5))
    c.restoreState()

def branch_h(c, cx, y, span=70, color=SAGE_MD, lw=1.0):
    """A small symmetric horizontal sprig used as a divider accent."""
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.setLineCap(1)
    c.line(cx - span, y, cx + span, y)
    for d in (-1, 1):
        for off, ll in [(span * 0.30, 8), (span * 0.55, 7), (span * 0.78, 5)]:
            leaf(c, cx + d * off, y, (20 if d > 0 else 160), ll, color=color, lw=lw * 0.9)
    leaf(c, cx, y, 90, 7, color=color, lw=lw * 0.9)
    c.circle(cx, y, 1.6, fill=1, stroke=0)
    c.restoreState()

def corner_flourish(c, corner="tr"):
    col = tint(SAGE, 0.50)
    c.saveState()
    c.setStrokeColor(col)
    if corner == "tr":
        ox, oy, sx, sy = PAGE_W - 26, PAGE_H - 26, -1, -1
    elif corner == "bl":
        ox, oy, sx, sy = 26, 26, 1, 1
    elif corner == "tl":
        ox, oy, sx, sy = 26, PAGE_H - 26, 1, -1
    else:
        ox, oy, sx, sy = PAGE_W - 26, 26, -1, 1
    c.translate(ox, oy)
    c.scale(sx, sy)
    c.setLineWidth(1.0)
    c.setLineCap(1)
    p = c.beginPath()
    p.moveTo(2, 40)
    p.curveTo(8, 24, 24, 8, 44, 3)
    c.drawPath(p, fill=0, stroke=1)
    for t, ll in [(0.30, 10), (0.55, 9), (0.80, 7)]:
        bx = 2 + (44 - 2) * t
        by = 40 - (40 - 3) * (t ** 1.3)
        leaf(c, bx, by, -30 - t * 25, ll, color=col, lw=0.9)
        leaf(c, bx, by, 60 - t * 10, ll * 0.85, color=col, lw=0.9)
    c.restoreState()

# ----------------------------------------------------------------------------
# Book / page chrome
# ----------------------------------------------------------------------------
class Book:
    def __init__(self, path):
        self.c = canvas.Canvas(path, pagesize=(PAGE_W, PAGE_H))
        self.c.setTitle("THE ATOMIC RESET — Your Sunday Micro-Habit Planner")
        self.c.setAuthor("The Atomic Reset")
        self.c.setSubject("A 60-minute Sunday system built from 10-minute micro-habits.")
        self.c.setKeywords("planner, micro-habits, reset, printable, GoodNotes, Notability")
        self._n = 0

    def fname(self, base="f"):
        self._n += 1
        return f"{base}{self._n}"

    # form fields ---------------------------------------------------------
    def field(self, x, y, w, h, fs=10.5, multiline=False):
        self.c.acroForm.textfield(
            name=self.fname("t"), x=x, y=y, width=w, height=h,
            fontName="Helvetica", fontSize=fs, borderWidth=0,
            borderColor=TRANS, fillColor=TRANS, textColor=CHAR,
            fieldFlags="multiline" if multiline else "")

    def checkbox(self, x, yb, size=11):
        self.c.acroForm.checkbox(
            name=self.fname("c"), x=x, y=yb, size=size, checked=False,
            buttonStyle="check", borderColor=SAGE, fillColor=tint(SAGE, 0.84),
            textColor=shade(SAGE, 0.35), borderWidth=1.0, borderStyle="solid")

    def check_item(self, x, yb, label, size=11, font="MSm", fs=10, color=CHAR, gap=10):
        self.checkbox(x, yb, size)
        text(self.c, x + size + gap, yb + size / 2 - fs * 0.35, label, font, fs, color)

def page_chrome(b, n, frame=True, decor=True):
    c = b.c
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    if frame:
        box(c, 22, 22, PAGE_W - 44, PAGE_H - 44, r=16, stroke=OAK_LN, sw=1.0)
    if decor:
        corner_flourish(c, "bl")
        corner_flourish(c, "br")

def footer(b, n):
    c = b.c
    rule(c, CX - 74, 40, CX - 18, color=OAK_LN, w=0.9)
    rule(c, CX + 18, 40, CX + 74, color=OAK_LN, w=0.9)
    c.setFillColor(SAGE)
    c.circle(CX, 40, 10.5, fill=1, stroke=0)
    text(c, CX, 36.7, f"{n:02d}", "MSsb", 8.0, WHITE, align="c")

def fit_title(c, x, y, s, maxw, size=27, font="PFsb", color=CHAR):
    while size > 15 and pdfmetrics.stringWidth(s, font, size) > maxw:
        size -= 0.5
    text(c, x, y, s, font, size, color)
    return size

def header(b, eb, title, sub=None, sprig_icon=True):
    c = b.c
    top = PAGE_H - 64
    eyebrow(c, MARGIN, top, eb, color=TERRA)
    ty = top - 31
    fit_title(c, MARGIN, ty, title, CW - 74, size=26)
    rule(c, MARGIN, ty - 13, MARGIN + 50, color=SAGE, w=2.4)
    if sprig_icon:
        sprig(c, PAGE_W - MARGIN - 8, top - 34, 0.8, color=SAGE_MD)
    y = ty - 13
    if sub:
        y -= 21
        y = para(c, MARGIN, y, sub, "MSm", 10.3, INK2, CW, 14.5) + 2
    return y - 16

# ----------------------------------------------------------------------------
# Reusable composite components
# ----------------------------------------------------------------------------
def card_title(c, x, y, label, color=TERRA):
    eyebrow(c, x, y, label, color=color, size=8.4, track=2.0)

def panel(c, x, y, w, h, fill=CARD, stroke=SAGE_LN, sw=1.0, r=8):
    box(c, x, y, w, h, r=r, fill=fill, stroke=stroke, sw=sw)

def quote(c, cx, y, s, size=20, color=SAGE_MD):
    text(c, cx, y, s, "SC", size, color, align="c")

def labeled_lines(b, x, y, w, n, gap=24, label=None):
    c = b.c
    if label:
        text(c, x, y, label, "MSsb", 9.2, INK2)
        y -= 16
    top = y
    for i in range(n):
        rule(c, x, y, x + w, color=RULE_LT, w=0.8)
        y -= gap
    b.field(x, y + gap - 2, w, top - y - gap + 4, multiline=True)
    return y

# ============================================================================
# PAGES
# ============================================================================
def p1_cover(b):
    c = b.c
    page_chrome(b, 1, frame=False, decor=False)
    box(c, 30, 30, PAGE_W - 60, PAGE_H - 60, r=18, stroke=OAK_LN, sw=1.1)
    box(c, 36, 36, PAGE_W - 72, PAGE_H - 72, r=14, stroke=tint(SAGE, 0.55), sw=0.8)
    sprig_filled(c, CX, 612, 1.18, color=SAGE, fillc=SAGE_PNL)
    eyebrow(c, CX, 568, "The Sunday Micro-Habit Planner", color=TERRA,
            size=10, track=3.4, align="c")
    branch_h(c, CX, 548, span=60, color=OAK_LN, lw=0.9)
    text(c, CX, 470, "THE ATOMIC", "PFb", 52, CHAR, align="c")
    eyebrow(c, CX, 406, "R E S E T", color=TERRA, size=46, track=10, align="c", font="PFb")
    rule(c, CX - 120, 384, CX + 120, color=SAGE, w=1.4)
    sub = "A 60-Minute Sunday System for Women Who Are Tired of Being Tired"
    para(c, CX, 354, sub, "PFi", 15.5, INK2, 360, 21, align="c")
    quote(c, CX, 250, "small wins count.", size=30, color=SAGE_MD)
    branch_h(c, CX, 150, span=70, color=OAK_LN, lw=0.9)
    eyebrow(c, CX, 120, "Calm  ·  Control  ·  Ten Minutes at a Time",
            color=INK3, size=8.4, track=2.6, align="c")
    footer(b, 1)

def p2_welcome(b):
    c = b.c
    y = header(b, "Read Me First", "A Little Welcome Letter")
    quote(c, CX, y - 6, "We don’t need a new life. We need a 10-minute reset.",
          size=21, color=TERRA)
    y -= 44
    body = (
        "Hi, friend —\n\n"
        "If you’re here, I’m guessing you’re a little tired. Tired of planners that ask "
        "for more than you have. Tired of systems that start on Monday and collapse by "
        "Wednesday. Tired of feeling like rest is something you have to earn.\n\n"
        "So let’s do this differently. This planner is built on one quiet idea: you don’t "
        "need a whole new life — you need a 10-minute reset. Just enough to feel your "
        "shoulders drop. Small, repeatable wins that stack into a calmer week, without the "
        "guilt or the all-or-nothing spiral.\n\n"
        "Every Sunday, you’ll spend about 60 minutes moving gently through six tiny blocks. "
        "Ten minutes here, ten minutes there. No perfection required — done is softer than "
        "perfect. Some weeks you’ll do all six. Some weeks you’ll do one, in your pajamas, "
        "with cold coffee. Both count.\n\n"
        "Think of me as the organized friend who shows up with tea, not a to-do list. We’re "
        "not here to optimize you. We’re here to help you feel at home in your week again — "
        "one tiny thing at a time."
    )
    y = para(c, MARGIN, y, body, "MS", 10.6, CHAR, CW, 15.6)
    text(c, MARGIN, y - 6, "With warmth,", "PFi", 12, INK2)
    text(c, MARGIN, y - 30, "The Atomic Reset", "SC", 22, SAGE_MD)
    footer(b, 2)

def p3_howto(b):
    c = b.c
    y = header(b, "Orientation", "How to Use This Workbook",
               "Six tiny phases, ten minutes each. Start anywhere — this is a menu, not a mandate.")
    phases = [
        ("01", "Brain Dump", "0–10 min"),
        ("02", "Space Reset", "10–20 min"),
        ("03", "Digital Declutter", "20–30 min"),
        ("04", "Meal Prep Lite", "30–40 min"),
        ("05", "Week Preview", "40–50 min"),
        ("06", "Self-Care Ritual", "50–60 min"),
    ]
    # flow diagram: 2 rows x 3
    bx, by = MARGIN + 6, y - 8
    cw, ch, gx, gy = (CW - 12 - 2 * 26) / 3, 92, 26, 26
    for i, (num, name, mins) in enumerate(phases):
        col, row = i % 3, i // 3
        x = bx + col * (cw + gx)
        yy = by - row * (ch + gy) - ch
        panel(c, x, yy, cw, ch, fill=CARD, stroke=SAGE_LN)
        c.setFillColor(SAGE)
        c.circle(x + cw / 2, yy + ch - 22, 15, fill=1, stroke=0)
        text(c, x + cw / 2, yy + ch - 26, num, "PFsb", 14, WHITE, align="c")
        para(c, x + cw / 2, yy + 40, name, "MSsb", 10.2, CHAR, cw - 14, 13, align="c")
        text(c, x + cw / 2, yy + 16, mins, "MSm", 8.4, TERRA, align="c")
        # connector arrows
        if col < 2:
            ax = x + cw + 4
            rule(c, ax, yy + ch - 22, ax + gx - 8, color=OAK_LN, w=1.0)
            c.setFillColor(OAK_LN)
            p = c.beginPath()
            p.moveTo(ax + gx - 8, yy + ch - 22)
            p.lineTo(ax + gx - 13, yy + ch - 19)
            p.lineTo(ax + gx - 13, yy + ch - 25)
            p.close()
            c.drawPath(p, fill=1, stroke=0)
    # clickable index
    iy = by - 2 * ch - gy - 34
    text(c, MARGIN, iy, "Jump to a section", "PFsb", 14, CHAR)
    rule(c, MARGIN, iy - 9, MARGIN + 44, color=SAGE, w=2.0)
    iy -= 30
    index = [
        ("The 60-Minute Sunday Reset", "Section One", 5),
        ("The Micro-Habit Tracker", "Section Two", 12),
        ("The Renter-Friendly Home Reset", "Section Three", 16),
        ("The Weekly Rhythm Pages", "Section Four", 21),
        ("The Bonus Library", "Section Five", 26),
    ]
    rh = 30
    for title, sec, pg in index:
        panel(c, MARGIN, iy - rh + 6, CW, rh - 6, fill=tint(SAGE, 0.86), stroke=None)
        c.setFillColor(SAGE)
        c.circle(MARGIN + 20, iy - rh + 6 + (rh - 6) / 2, 3.0, fill=1, stroke=0)
        text(c, MARGIN + 36, iy - rh + 14, title, "MSsb", 10.6, CHAR)
        eyebrow(c, PAGE_W - MARGIN - 60, iy - rh + 15, sec, color=INK3, size=7.2, track=1.5, align="r")
        text(c, PAGE_W - MARGIN - 18, iy - rh + 13, f"p.{pg}", "PFsb", 11, TERRA, align="r")
        c.linkAbsolute("", f"pg{pg}",
                       (MARGIN, iy - rh + 6, PAGE_W - MARGIN, iy), Border="[0 0 0]")
        iy -= rh + 6
    footer(b, 3)

def p4_science(b):
    c = b.c
    y = header(b, "The Why", "The Science of Micro-Habits",
               "Why ten honest minutes beat a two-hour overhaul you’ll dread and skip.")
    cards = [
        ("Habit Stacking", "New habits stick best when they lean on old ones. Anchor a tiny "
         "action to something you already do — “after I pour my coffee, I’ll wipe one "
         "counter” — and your existing routine does the remembering for you."),
        ("The Dopamine Loop", "Your brain rewards completion, not size. Finishing a 10-minute "
         "task releases the same little hit of done-it satisfaction as a huge one — so small, "
         "frequent wins keep motivation topped up instead of bottomed out."),
        ("Lower the Bar", "A two-hour reset needs willpower, calendar space, and a good mood "
         "all at once. A ten-minute reset only needs ten minutes. Shrinking the task removes "
         "the friction that makes us quit before we start."),
        ("Repetition Over Intensity", "Calm is built on rhythm, not heroics. Doing a little, "
         "often, rewires the routine far more durably than doing a lot, once — and it leaves "
         "you with energy to spare for the rest of your life."),
    ]
    cw = (CW - 22) / 2
    ch = 132
    for i, (t, body) in enumerate(cards):
        col, row = i % 2, i // 2
        x = MARGIN + col * (cw + 22)
        yy = y - 8 - row * (ch + 20) - ch
        panel(c, x, yy, cw, ch, fill=CARD, stroke=SAGE_LN)
        leaf(c, x + 22, yy + ch - 24, 35, 16, color=SAGE, fill=SAGE_PNL, lw=1.0)
        card_title(c, x + 18, yy + ch - 44, t, color=TERRA)
        para(c, x + 18, yy + ch - 62, body, "MS", 9.2, CHAR, cw - 36, 13.2)
    yy = y - 8 - 2 * (ch + 20)
    text(c, CX, yy + 2, "Small is not the compromise. Small is the strategy.",
         "PFi", 12.5, SAGE_MD, align="c")
    footer(b, 4)

def section_eyebrow(b, sec, name):
    return header(b, sec, name)

def p5_timeline(b):
    c = b.c
    y = header(b, "Section One · The 60-Minute Sunday Reset", "The Master Timeline",
               "One gentle hour, six ten-minute blocks. Set a timer, breathe, begin.")
    blocks = [
        ("0–10", "Brain Dump", "Empty the mental tabs onto paper.", 6),
        ("10–20", "Space Reset", "Five-surface tidy, not a deep clean.", 7),
        ("20–30", "Digital Declutter", "Quiet the inbox, photos & pings.", 8),
        ("30–40", "Meal Prep Lite", "Decide, don’t cook. Nine easy meals.", 9),
        ("40–50", "Week Preview", "Three priorities, one plan, one rest.", 10),
        ("50–60", "Self-Care Ritual", "Pick one kind thing. Just one.", 11),
    ]
    x0 = MARGIN + 64
    top = y - 6
    rowh = 64
    vrule(c, x0, top - len(blocks) * rowh + 18, top - 18, color=OAK_LN, w=1.2)
    for i, (mins, name, desc, pg) in enumerate(blocks):
        cy = top - i * rowh - 22
        text(c, MARGIN, cy + 6, mins, "PFsb", 13, TERRA, align="l")
        text(c, MARGIN, cy - 7, "min", "MSm", 7.2, INK3)
        c.setFillColor(CREAM)
        c.circle(x0, cy, 9, fill=1, stroke=0)
        c.setStrokeColor(SAGE)
        c.setLineWidth(1.6)
        c.circle(x0, cy, 7.5, fill=0, stroke=1)
        c.setFillColor(SAGE)
        c.circle(x0, cy, 3.2, fill=1, stroke=0)
        panel(c, x0 + 20, cy - rowh / 2 + 12, PAGE_W - MARGIN - (x0 + 20), rowh - 18,
              fill=CARD, stroke=SAGE_LN)
        text(c, x0 + 36, cy + 6, f"{i+1:02d}", "PFsb", 15, SAGE_MD)
        text(c, x0 + 64, cy + 7, name, "MSsb", 11.5, CHAR)
        text(c, x0 + 64, cy - 8, desc, "MS", 9, INK2)
        text(c, PAGE_W - MARGIN - 16, cy - 1, f"p.{pg}", "PFi", 10.5, TERRA, align="r")
        c.linkAbsolute("", f"pg{pg}",
                       (x0 + 20, cy - rowh / 2 + 12, PAGE_W - MARGIN, cy + rowh / 2 - 6),
                       Border="[0 0 0]")
    footer(b, 5)

def p6_braindump(b):
    c = b.c
    y = header(b, "Block 01 · 0–10 min", "Brain Dump",
               "Don’t organize it. Don’t solve it. Just get it out of your head and onto paper.")
    half = (CW - 22) / 2
    h1 = 250
    panel(c, MARGIN, y - h1, half, h1, fill=CARD, stroke=SAGE_LN)
    card_title(c, MARGIN + 16, y - 26, "What’s looping in your head?", color=TERRA)
    labeled_lines(b, MARGIN + 16, y - 48, half - 32, 11, gap=18)
    x2 = MARGIN + half + 22
    panel(c, x2, y - h1, half, h1, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    card_title(c, x2 + 16, y - 26, "What can wait until Tuesday?", color=shade(SAGE, 0.35))
    labeled_lines(b, x2 + 16, y - 48, half - 32, 11, gap=18)
    yy = y - h1 - 24
    panel(c, MARGIN, yy - 96, CW, 96, fill=CARD, stroke=OAK_LN)
    card_title(c, MARGIN + 16, yy - 24, "One thing I’m letting go of this week", color=TERRA)
    labeled_lines(b, MARGIN + 16, yy - 46, CW - 32, 2, gap=22)
    quote(c, CX, yy - 114, "You don’t have to carry it all at once.", size=18, color=SAGE_MD)
    footer(b, 6)

def room_block(b, x, y, w, room, tasks):
    c = b.c
    h = 30 + len(tasks) * 22
    panel(c, x, y - h, w, h, fill=CARD, stroke=SAGE_LN)
    leaf(c, x + 18, y - 18, 35, 13, color=SAGE, fill=SAGE_PNL, lw=0.9)
    text(c, x + 34, y - 22, room, "MSsb", 10.6, CHAR)
    ty = y - 40
    for t in tasks:
        b.check_item(x + 18, ty - 9, t, size=10, fs=9.2)
        ty -= 22
    return h

def p7_space(b):
    y = header(b, "Block 02 · 10–20 min", "10-Minute Space Reset",
               "Not a deep clean — five surfaces, ten minutes. Reset, don’t scrub.")
    rooms = [
        ("Entryway", ["Clear shoes & bags off the floor", "Wipe the catch-all surface", "Hang up the coats"]),
        ("Kitchen Counter", ["Clear the dish pile", "Wipe counters left to right", "Reset the coffee station"]),
        ("Bathroom Sink", ["Stow stray products", "Wipe the basin & mirror", "Swap in a fresh hand towel"]),
        ("Bedroom Nightstand", ["Return cups & plates to the kitchen", "Tidy the charging cables", "Set out tomorrow’s water"]),
    ]
    cw = (CW - 22) / 2
    positions = [(MARGIN, y), (MARGIN + cw + 22, y)]
    h0 = room_block(b, MARGIN, y, cw, *rooms[0])
    room_block(b, MARGIN + cw + 22, y, cw, *rooms[1])
    y2 = y - max(h0, 96) - 22
    room_block(b, MARGIN, y2, cw, *rooms[2])
    room_block(b, MARGIN + cw + 22, y2, cw, *rooms[3])
    yy = y2 - 96 - 26
    quote(b.c, CX, yy, "Done is softer than perfect.", size=19, color=TERRA)
    footer(b, 7)

def checklist_group(b, x, y, w, title, items, color=TERRA):
    c = b.c
    text(c, x, y, title, "MSsb", 10.6, color)
    rule(c, x, y - 7, x + 24, color=SAGE, w=1.8)
    ty = y - 24
    for it in items:
        b.check_item(x, ty - 9, it, size=10, fs=9.4)
        ty -= 22
    return ty

def p8_digital(b):
    y = header(b, "Block 03 · 20–30 min", "Digital Declutter Sprint",
               "Ten minutes to quiet the noise. Imperfect counts — just lower the volume.")
    half = (CW - 30) / 2
    y1 = checklist_group(b, MARGIN, y, half, "Inbox, Lightly",
        ["Archive anything older than two weeks", "Unsubscribe from three senders",
         "Star only what truly needs a reply", "Empty the trash & spam"], color=TERRA)
    y2 = checklist_group(b, MARGIN + half + 30, y, half, "Photos",
        ["Delete 20 blurry or duplicate shots", "Clear the screenshots folder",
         "Make one ‘favorites’ album"], color=TERRA)
    ny = min(y1, y2) - 22
    y3 = checklist_group(b, MARGIN, ny, half, "Notifications",
        ["Mute three of the noisiest apps", "Turn off badge dots for social",
         "Silence group chats until morning"], color=TERRA)
    y4 = checklist_group(b, MARGIN + half + 30, ny, half, "Screen-Time Check",
        ["Glance at this week’s number — no judgment", "Set one gentle app limit",
         "Pick one screen-free pocket of tomorrow"], color=TERRA)
    yy = min(y3, y4) - 16
    panel(b.c, MARGIN, yy - 60, CW, 60, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    text(b.c, MARGIN + 16, yy - 24, "This week’s screen-time number (just noticing):",
         "MSm", 9.6, CHAR)
    b.field(MARGIN + 16, yy - 50, 160, 18)
    rule(b.c, MARGIN + 16, yy - 52, MARGIN + 176, color=RULE_LT, w=0.8)
    quote(b.c, PAGE_W - MARGIN - 130, yy - 36, "one tiny thing.", size=18, color=SAGE_MD)
    footer(b, 8)

def p9_meal(b):
    c = b.c
    y = header(b, "Block 04 · 30–40 min", "Meal Prep Lite",
               "You’re not cooking — you’re deciding. Nine easy meals, no complicated recipes.")
    groups = [("Breakfasts", 3), ("Lunches", 3), ("Dinners", 3), ("Snack Prep", 1)]
    colw = (CW - 3 * 16) / 4
    x = MARGIN
    top = y - 6
    boxh = 214
    for gi, (g, n) in enumerate(groups):
        panel(c, x, top - boxh, colw, boxh, fill=CARD, stroke=SAGE_LN)
        c.setFillColor(SAGE)
        c.roundRect(x, top - 30, colw, 30, 8, fill=1, stroke=0)
        c.setFillColor(SAGE)
        c.rect(x, top - 30, colw, 14, fill=1, stroke=0)
        text(c, x + colw / 2, top - 20, g, "MSsb", 9.8, WHITE, align="c")
        yy = top - 30 - 22
        for i in range(n):
            text(c, x + 12, yy, f"{i+1}.", "MSsb", 9, TERRA)
            b.field(x + 26, yy - 4, colw - 36, 16)
            rule(c, x + 24, yy - 6, x + colw - 12, color=RULE_LT, w=0.7)
            yy -= 34
        leaf(c, x + colw / 2, top - boxh + 24, 90, 12, color=SAGE, fill=SAGE_PNL, lw=0.9)
        x += colw + 16
    yy = top - boxh - 26
    panel(c, MARGIN, yy - 88, CW, 88, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    card_title(c, MARGIN + 16, yy - 24, "Quick grocery add-ons", color=shade(SAGE, 0.35))
    b.field(MARGIN + 16, yy - 80, CW - 32, 48, multiline=True)
    for k in range(3):
        rule(c, MARGIN + 16, yy - 42 - k * 18, PAGE_W - MARGIN - 16, color=RULE_LT, w=0.7)
    quote(c, CX, yy - 110, "Repeat a winner. Variety is optional.", size=16, color=SAGE_MD)
    footer(b, 9)

def p10_week(b):
    c = b.c
    y = header(b, "Block 05 · 40–50 min", "Week Preview",
               "A soft glance ahead. Three priorities, one social plan, one block of rest.")
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    top = y - 4
    rowh = 30
    panel(c, MARGIN, top - rowh * 7, CW, rowh * 7, fill=CARD, stroke=SAGE_LN)
    for i, d in enumerate(days):
        ry = top - (i + 1) * rowh
        if i % 2 == 0:
            box(c, MARGIN + 1, ry + 1, CW - 2, rowh - 1, r=0, fill=tint(SAGE, 0.90))
        text(c, MARGIN + 14, ry + 11, d, "MSsb", 9.6, CHAR)
        vrule(c, MARGIN + 92, ry + 3, ry + rowh - 3, color=SAGE_LN, w=0.7)
        b.field(MARGIN + 100, ry + 4, CW - 110, rowh - 8)
        if i < 6:
            rule(c, MARGIN, ry, MARGIN + CW, color=tint(SAGE, 0.7), w=0.6)
    yy = top - rowh * 7 - 22
    cw = (CW - 2 * 16) / 3
    fields = [("Top 3 priorities", TERRA), ("One social plan", SAGE_MD), ("One rest block", OAK_LN)]
    x = MARGIN
    for label, col in fields:
        panel(c, x, yy - 92, cw, 92, fill=CARD, stroke=SAGE_LN)
        card_title(c, x + 14, yy - 22, label, color=TERRA)
        b.field(x + 14, yy - 84, cw - 28, 54, multiline=True)
        for k in range(3):
            rule(c, x + 14, yy - 38 - k * 16, x + cw - 14, color=RULE_LT, w=0.7)
        x += cw + 16
    footer(b, 10)

def p11_selfcare(b):
    c = b.c
    y = header(b, "Block 06 · 50–60 min", "Self-Care Ritual Menu",
               "Pick one. Not all of them — one. You don’t have to earn this.")
    items = [
        ("A Warm Bath", "Ten quiet minutes. Phone in the other room."),
        ("A Slow Walk", "Around the block. No step goal, no podcast required."),
        ("Journal", "Three lines. Or one. Whatever wants to come out."),
        ("Stretch", "Gentle floor stretches while the kettle boils."),
        ("Call a Friend", "The one who makes you laugh, not the one who drains you."),
        ("Read 10 Pages", "Fiction counts. Especially fiction."),
    ]
    cw = (CW - 22) / 2
    ch = 74
    for i, (t, d) in enumerate(items):
        col, row = i % 2, i // 2
        x = MARGIN + col * (cw + 22)
        yy = y - 6 - row * (ch + 14) - ch
        panel(c, x, yy, cw, ch, fill=CARD, stroke=SAGE_LN)
        b.checkbox(x + 16, yy + ch / 2 - 6, 13)
        text(c, x + 42, yy + ch - 26, t, "MSsb", 11.2, CHAR)
        para(c, x + 42, yy + ch - 42, d, "MS", 8.8, INK2, cw - 56, 11)
        sun(c, x + cw - 26, yy + ch - 24, 7, color=OAK, lw=0.9, rays=9)
    yy = y - 6 - 3 * (ch + 14)
    quote(c, CX, yy - 4, "Rest is not the reward for finishing. It’s part of the work.",
          size=17, color=SAGE_MD)
    footer(b, 11)

def p12_stack(b):
    c = b.c
    y = header(b, "Section Two · The Micro-Habit Tracker", "Habit Stack Builder",
               "Attach the new to the familiar. Your old routine becomes the reminder.")
    panel(c, MARGIN, y - 58, CW, 58, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    text(c, MARGIN + 16, y - 24, "The formula", "MSsb", 9.4, shade(SAGE, 0.35))
    text(c, MARGIN + 16, y - 46, "After I ", "MSm", 12, CHAR)
    w1 = pdfmetrics.stringWidth("After I ", "MSm", 12)
    text(c, MARGIN + 16 + w1, y - 46, "[something I already do]", "PFi", 12, TERRA)
    w2 = w1 + pdfmetrics.stringWidth("[something I already do]", "PFi", 12)
    text(c, MARGIN + 16 + w2, y - 46, ", I will ", "MSm", 12, CHAR)
    w3 = w2 + pdfmetrics.stringWidth(", I will ", "MSm", 12)
    text(c, MARGIN + 16 + w3, y - 46, "[one tiny new habit]", "PFi", 12, SAGE_MD)
    yy = y - 58 - 22
    text(c, MARGIN, yy, "Your stacks", "MSsb", 10.6, CHAR)
    rule(c, MARGIN, yy - 8, MARGIN + 28, color=SAGE, w=1.8)
    yy -= 26
    for i in range(6):
        rh = 40
        panel(c, MARGIN, yy - rh, CW, rh, fill=CARD, stroke=SAGE_LN)
        text(c, MARGIN + 14, yy - rh / 2 - 4, "After I", "MSsb", 9.6, INK2)
        ax = MARGIN + 14 + pdfmetrics.stringWidth("After I", "MSsb", 9.6) + 8
        midx = MARGIN + CW * 0.52
        b.field(ax, yy - rh + 8, midx - ax - 8, rh - 16)
        rule(c, ax, yy - rh + 8, midx - 10, color=RULE_LT, w=0.7)
        text(c, midx, yy - rh / 2 - 4, ", I will", "MSsb", 9.6, INK2)
        bx = midx + pdfmetrics.stringWidth(", I will", "MSsb", 9.6) + 8
        b.field(bx, yy - rh + 8, MARGIN + CW - bx - 12, rh - 16)
        rule(c, bx, yy - rh + 8, MARGIN + CW - 12, color=RULE_LT, w=0.7)
        yy -= rh + 10
    text(c, MARGIN, yy + 2, "Example:  After I pour my morning coffee, I will write down one tiny win.",
         "PFi", 9.6, INK3)
    footer(b, 12)

def p13_tracker(b):
    c = b.c
    y = header(b, "Section Two · The Micro-Habit Tracker", "4-Week Habit Tracker",
               "Seven habits, twenty-eight days. Fill a square; watch the calm compound.")
    label_w = 116
    grid_x = MARGIN + label_w
    grid_w = CW - label_w
    days = 28
    cell = grid_w / days
    top = y - 16
    rowh = 28
    text(c, MARGIN, top + 6, "Habit", "MSsb", 8.6, INK2)
    for d in range(days):
        if d % 7 == 0:
            text(c, grid_x + d * cell + cell / 2, top + 16, f"Wk {d//7 + 1}", "MSsb", 7.4, TERRA, align="c")
        text(c, grid_x + d * cell + cell / 2, top + 5, str(d + 1), "MSm", 6.0, INK3, align="c")
    rule(c, MARGIN, top, MARGIN + CW, color=SAGE, w=1.2)
    for r in range(7):
        ry = top - (r + 1) * rowh
        if r % 2 == 0:
            box(c, MARGIN, ry + 2, CW, rowh - 2, r=0, fill=tint(SAGE, 0.90))
        b.field(MARGIN + 6, ry + 6, label_w - 12, rowh - 12)
        rule(c, MARGIN + 6, ry + 5, MARGIN + label_w - 8, color=RULE_LT, w=0.6)
        for d in range(days):
            cx = grid_x + d * cell + cell / 2
            sz = min(cell - 3.5, rowh - 12)
            b.checkbox(cx - sz / 2, ry + (rowh - sz) / 2, sz)
    for d in range(0, days + 1, 7):
        vrule(c, grid_x + d * cell, top - 7 * rowh, top, color=SAGE_LN, w=0.9)
    vrule(c, grid_x, top - 7 * rowh, top + 2, color=SAGE, w=1.1)
    rule(c, MARGIN, top - 7 * rowh, MARGIN + CW, color=SAGE_LN, w=0.9)
    yy = top - 7 * rowh - 22
    # legend
    c.setStrokeColor(SAGE)
    c.setLineWidth(1.0)
    c.roundRect(MARGIN, yy - 11, 11, 11, 2, fill=0, stroke=1)
    text(c, MARGIN + 18, yy - 9, "= a small win", "MSm", 8.6, INK2)
    text(c, MARGIN + 120, yy - 9, "blank square = a gentle skip, not a failure",
         "PFi", 9.4, INK3)
    # ideas + reflection
    yy -= 28
    half = (CW - 22) / 2
    h = 118
    panel(c, MARGIN, yy - h, half, h, fill=CARD, stroke=SAGE_LN)
    card_title(c, MARGIN + 16, yy - 22, "Need a nudge? Try one", color=TERRA)
    ideas = ["Drink a glass of water", "Make the bed", "Two-minute stretch",
             "Read two pages", "One kind message", "Lights out 15 min earlier"]
    iy = yy - 42
    for i, it in enumerate(ideas):
        col = i % 2
        row = i // 2
        text(c, MARGIN + 16 + col * (half / 2 - 6), iy - row * 22, "·", "MSsb", 10, SAGE_MD)
        text(c, MARGIN + 24 + col * (half / 2 - 6), iy - row * 22, it, "MS", 8.6, CHAR)
    x2 = MARGIN + half + 22
    panel(c, x2, yy - h, half, h, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    card_title(c, x2 + 16, yy - 22, "My focus this month", color=shade(SAGE, 0.35))
    for k in range(4):
        rule(c, x2 + 16, yy - 44 - k * 20, x2 + half - 16, color=RULE_LT, w=0.7)
    b.field(x2 + 16, yy - 44 - 3 * 20 - 4, half - 32, 3 * 20 + 20, multiline=True)
    quote(c, CX, yy - h - 22, "Missed a day? Begin again. The calm is the point.",
          size=15.5, color=SAGE_MD)
    footer(b, 13)

def p14_reflect(b):
    c = b.c
    y = header(b, "Section Two · The Micro-Habit Tracker", "Weekly Reflection",
               "Three soft questions. No grading, no streak to protect — just noticing.")
    prompts = [
        ("What worked?", "Where did things feel a little easier this week?", TERRA),
        ("What drained me?", "What can I do less of, delegate, or simply drop?", SAGE_MD),
        ("My one tiny win", "The smallest thing I’m quietly proud of.", OAK_LN),
    ]
    yy = y - 4
    for i, (q, hint, col) in enumerate(prompts):
        h = 118 if i < 2 else 96
        panel(c, MARGIN, yy - h, CW, h, fill=CARD, stroke=SAGE_LN)
        c.setFillColor(SAGE)
        c.circle(MARGIN + 26, yy - 26, 11, fill=1, stroke=0)
        text(c, MARGIN + 26, yy - 29.5, str(i + 1), "PFsb", 12, WHITE, align="c")
        text(c, MARGIN + 48, yy - 24, q, "MSsb", 12, CHAR)
        text(c, MARGIN + 48, yy - 39, hint, "PFi", 9.6, INK2)
        n = 3 if i < 2 else 2
        ly = yy - 60
        for k in range(n):
            rule(c, MARGIN + 22, ly - k * 22, PAGE_W - MARGIN - 22, color=RULE_LT, w=0.7)
        b.field(MARGIN + 22, ly - (n - 1) * 22 - 4, CW - 44, (n - 1) * 22 + 22, multiline=True)
        leaf(c, PAGE_W - MARGIN - 28, yy - 24, 35, 13, color=SAGE, fill=SAGE_PNL, lw=0.9)
        yy -= h + 16
    footer(b, 14)

def battery(c, x, y, w, h, segs=4):
    box(c, x, y, w, h, r=3, stroke=SAGE_MD, sw=1.1)
    c.setFillColor(SAGE_MD)
    c.roundRect(x + w, y + h * 0.3, 3.2, h * 0.4, 1, fill=1, stroke=0)
    sw = (w - 6) / segs
    for i in range(1, segs):
        vrule(c, x + 3 + i * sw, y + 3, y + h - 3, color=tint(SAGE, 0.6), w=0.6)

def p15_energy(b):
    c = b.c
    y = header(b, "Section Two · The Micro-Habit Tracker", "Energy Audit",
               "Shade the battery for how full you felt. Patterns whisper where your week leaks.")
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    times = ["Morning", "Afternoon", "Evening"]
    top = y - 10
    label_w = 86
    grid_x = MARGIN + label_w
    colw = (CW - label_w) / 7
    for j, d in enumerate(days):
        text(c, grid_x + j * colw + colw / 2, top + 4, d, "MSsb", 9, CHAR, align="c")
    rowh = 70
    for i, tm in enumerate(times):
        ry = top - 16 - i * rowh
        text(c, MARGIN + 4, ry - rowh / 2 + 4, tm, "MSsb", 9.4, TERRA)
        sun(c, MARGIN + 14, ry - rowh / 2 - 14, 6, color=OAK, lw=0.8, rays=8) if i == 0 else None
        for j in range(7):
            bx = grid_x + j * colw + 10
            battery(c, bx, ry - rowh / 2 - 6, colw - 22, 16, segs=4)
        if i < 2:
            rule(c, MARGIN, ry - rowh + 8, MARGIN + CW, color=tint(SAGE, 0.7), w=0.6)
    yy = top - 16 - 3 * rowh
    panel(c, MARGIN, yy - 70, CW, 70, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    card_title(c, MARGIN + 16, yy - 22, "What I noticed", color=shade(SAGE, 0.35))
    b.field(MARGIN + 16, yy - 60, CW - 32, 30, multiline=True)
    rule(c, MARGIN + 16, yy - 40, PAGE_W - MARGIN - 16, color=RULE_LT, w=0.7)
    rule(c, MARGIN + 16, yy - 56, PAGE_W - MARGIN - 16, color=RULE_LT, w=0.7)
    footer(b, 15)

def p16_renter_intro(b):
    c = b.c
    y = header(b, "Section Three · The Renter-Friendly Home Reset", "Renter’s Rules: No-Damage Refresh",
               "Make a rental feel like yours — and still get every dollar of your deposit back.")
    rules = [
        ("Removable, always", "If it can’t come off cleanly, it doesn’t come on. Hooks, strips, "
         "and tension rods are your love language now."),
        ("Photograph first", "Before you change a thing, document the original. Future-you, "
         "standing at move-out, will be so grateful."),
        ("Test in a corner", "Adhesives behave differently on every wall. Try a small, hidden "
         "spot and wait a day before you commit."),
        ("Keep the originals", "Save the blinds, the shower head, the cabinet pulls. Swap freely — "
         "then put the originals back before you leave."),
    ]
    cw = (CW - 22) / 2
    ch = 116
    for i, (t, d) in enumerate(rules):
        col, row = i % 2, i // 2
        x = MARGIN + col * (cw + 22)
        yy = y - 4 - row * (ch + 18) - ch
        panel(c, x, yy, cw, ch, fill=CARD, stroke=SAGE_LN)
        c.setFillColor(SAGE)
        c.circle(x + 24, yy + ch - 24, 12, fill=1, stroke=0)
        text(c, x + 24, yy + ch - 27.5, str(i + 1), "PFsb", 12, WHITE, align="c")
        text(c, x + 44, yy + ch - 28, t, "MSsb", 11, CHAR)
        para(c, x + 18, yy + ch - 52, d, "MS", 9, CHAR, cw - 36, 12.6)
    yy = y - 4 - 2 * (ch + 18)
    quote(c, CX, yy - 2, "Your home can be temporary and still feel like yours.",
          size=17, color=SAGE_MD)
    footer(b, 16)

def two_col_check(b, x, y, w, items):
    c = b.c
    ty = y
    for it in items:
        b.check_item(x, ty - 9, it, size=10, fs=9.4)
        ty -= 23
    return ty

def p17_maintenance(b):
    c = b.c
    y = header(b, "Section Three · Renter-Friendly Reset", "Small-Space Maintenance",
               "Monthly ten-minute jobs that keep a studio or 1BR fresh — and damage-free.")
    half = (CW - 30) / 2
    left = ["Dust the vents & return-air grille", "Check caulk around tub & sink",
            "Refresh slow drains (baking soda + hot water)", "Vacuum the window tracks",
            "Wipe baseboards & door tops", "Test smoke & CO detectors"]
    right = ["Clean the fridge coils & gasket", "Run a vinegar cycle in the kettle/coffee maker",
             "Wash or swap HVAC filter", "Wipe light switches & door handles",
             "Descale the shower head", "Flip & rotate the mattress"]
    text(c, MARGIN, y, "First half of the month", "MSsb", 10.4, TERRA)
    rule(c, MARGIN, y - 8, MARGIN + 26, color=SAGE, w=1.8)
    two_col_check(b, MARGIN, y - 26, half, left)
    text(c, MARGIN + half + 30, y, "Second half of the month", "MSsb", 10.4, TERRA)
    rule(c, MARGIN + half + 30, y - 8, MARGIN + half + 56, color=SAGE, w=1.8)
    two_col_check(b, MARGIN + half + 30, y - 26, half, right)
    yy = y - 26 - 6 * 23 - 16
    panel(c, MARGIN, yy - 56, CW, 56, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    text(c, MARGIN + 16, yy - 22, "Done-this-month date:", "MSm", 9.6, CHAR)
    b.field(MARGIN + 150, yy - 26, 120, 18)
    rule(c, MARGIN + 150, yy - 28, MARGIN + 270, color=RULE_LT, w=0.8)
    text(c, MARGIN + 300, yy - 22, "Next reset:", "MSm", 9.6, CHAR)
    b.field(MARGIN + 372, yy - 26, 120, 18)
    rule(c, MARGIN + 372, yy - 28, MARGIN + 492, color=RULE_LT, w=0.8)
    footer(b, 17)

def p18_balcony(b):
    c = b.c
    y = header(b, "Section Three · Renter-Friendly Reset", "Balcony Glow-Up",
               "Ten-minute weekly tasks to turn a forgotten ledge into your favorite room.")
    items = ["Sweep the floor & corners", "Check & water the plants",
             "Wipe down the railing", "Test the string lights",
             "Rotate & fluff the cushions", "Shake out the outdoor rug",
             "Wipe the little side table", "Refill the watering can",
             "Empty & rinse any saucers", "Tidy the cozy-blanket basket"]
    half = (CW - 30) / 2
    for i, it in enumerate(items):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (half + 30)
        yy = y - 6 - row * 26
        b.check_item(x, yy - 9, it, size=11, fs=9.8)
    yy = y - 6 - 5 * 26 - 18
    panel(c, MARGIN, yy - 92, CW, 92, fill=CARD, stroke=SAGE_LN)
    card_title(c, MARGIN + 16, yy - 24, "Balcony wish-list (removable only!)", color=TERRA)
    b.field(MARGIN + 16, yy - 84, CW - 32, 52, multiline=True)
    for k in range(3):
        rule(c, MARGIN + 16, yy - 40 - k * 16, PAGE_W - MARGIN - 16, color=RULE_LT, w=0.7)
    sun(c, PAGE_W - MARGIN - 30, yy - 24, 8, color=OAK, lw=1.0)
    footer(b, 18)

def p19_swaps(b):
    c = b.c
    y = header(b, "Section Three · Renter-Friendly Reset", "Renter-Safe Decor Swaps",
               "Fifteen ways to get the look without losing the deposit.")
    swaps = [
        ("Nails & screw holes", "Command hooks & adhesive strips"),
        ("A fresh coat of paint", "Peel-and-stick wallpaper or decals"),
        ("New ceiling fixture", "Plug-in pendant or smart bulbs"),
        ("Built-in shelving", "Tension-rod or freestanding shelves"),
        ("Tile backsplash", "Peel-and-stick tile sheets"),
        ("Replacing the flooring", "Large washable rug or vinyl mats"),
        ("A built-in headboard", "Hook-hung fabric or leaning headboard"),
        ("Hardwired sconces", "Battery puck or plug-in wall lights"),
        ("Drilled curtain rods", "Tension-rod curtains"),
        ("Refacing cabinets", "Removable cabinet film"),
        ("A new faucet", "Aerator + silicone faucet cover"),
        ("Knocking out storage", "Over-door & under-bed organizers"),
        ("Gallery-wall nail holes", "Picture-rail or leaning frames"),
        ("Replacing the blinds", "Cordless stick-up temporary shades"),
        ("A garden bed", "Rail planters & container pots"),
    ]
    top = y - 2
    colw = (CW - 22) / 2
    rows = 8
    for i, (a, bb) in enumerate(swaps):
        col = i // rows
        row = i % rows
        x = MARGIN + col * (colw + 22)
        ry = top - row * 30
        text(c, x, ry, f"{i+1:02d}", "PFsb", 9.5, SAGE_MD)
        text(c, x + 22, ry, a, "MSsb", 8.7, INK2)
        text(c, x + 22, ry - 11, bb, "MS", 8.6, CHAR)
        # arrow
        text(c, x + 16, ry - 5.5, "→", "MSsb", 8, TERRA)
        if row < rows - 1:
            rule(c, x, ry - 17, x + colw - 6, color=tint(SAGE, 0.72), w=0.5)
    footer(b, 19)

def p20_deposit(b):
    c = b.c
    y = header(b, "Section Three · Renter-Friendly Reset", "Deposit Protection Tracker",
               "A photo log and damage diary so move-out day is calm, not chaotic.")
    rooms = ["Entry / Hall", "Kitchen", "Living Room", "Bedroom", "Bathroom", "Outdoor / Balcony"]
    top = y - 2
    text(c, MARGIN, top, "Move-in photo log", "MSsb", 10.4, TERRA)
    rule(c, MARGIN, top - 8, MARGIN + 26, color=SAGE, w=1.8)
    ty = top - 26
    half = (CW - 30) / 2
    for i, r in enumerate(rooms):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (half + 30)
        ry = ty - row * 26
        b.check_item(x, ry - 9, r, size=10, fs=9.6)
        text(c, x + half - 64, ry - 7, "Date:", "MSm", 8, INK3)
        b.field(x + half - 40, ry - 11, 40, 14)
        rule(c, x + half - 40, ry - 12, x + half, color=RULE_LT, w=0.6)
    dy = ty - 3 * 26 - 18
    text(c, MARGIN, dy, "Damage & repair diary", "MSsb", 10.4, TERRA)
    rule(c, MARGIN, dy - 8, MARGIN + 26, color=SAGE, w=1.8)
    dy -= 22
    # table header
    cols = [("Date", 70), ("Where", 120), ("What happened", 190), ("Fixed?", 0)]
    panel(c, MARGIN, dy - 22, CW, 22, fill=SAGE, stroke=None, r=6)
    cxp = MARGIN + 12
    headers = ["Date", "Where", "What happened / noted", "Logged"]
    widths = [64, 120, CW - 64 - 120 - 70, 70]
    hx = MARGIN
    for h, w in zip(headers, widths):
        text(c, hx + 10, dy - 15, h, "MSsb", 8.4, WHITE)
        hx += w
    ry = dy - 22
    for r in range(6):
        rh = 26
        if r % 2 == 0:
            box(c, MARGIN, ry - rh, CW, rh, r=0, fill=tint(SAGE, 0.90))
        hx = MARGIN
        for ci, w in enumerate(widths):
            if ci == 3:
                b.checkbox(hx + w / 2 - 5.5, ry - rh / 2 - 5.5, 11)
            else:
                b.field(hx + 8, ry - rh + 5, w - 14, rh - 10)
            if ci < 3:
                vrule(c, hx + w, ry - rh, ry, color=SAGE_LN, w=0.6)
            hx += w
        rule(c, MARGIN, ry - rh, MARGIN + CW, color=SAGE_LN, w=0.6)
        ry -= rh
    box(c, MARGIN, ry, CW, dy - 22 - ry, r=0, stroke=SAGE_LN, sw=0.9)
    footer(b, 20)

# ----- Section 4: weekly rhythm pages -----
def rhythm_page(b, n, eb, title, sub, blocks, quote_text):
    c = b.c
    y = header(b, eb, title, sub)
    yy = y - 2
    for label, hint, nlines, col in blocks:
        h = 28 + nlines * 22
        panel(c, MARGIN, yy - h, CW, h, fill=CARD, stroke=SAGE_LN)
        leaf(c, MARGIN + 20, yy - 18, 35, 13, color=SAGE, fill=SAGE_PNL, lw=0.9)
        text(c, MARGIN + 36, yy - 22, label, "MSsb", 10.8, CHAR)
        text(c, PAGE_W - MARGIN - 16, yy - 21, hint, "PFi", 9, INK3, align="r")
        ly = yy - 44
        for k in range(nlines):
            rule(c, MARGIN + 20, ly - k * 22, PAGE_W - MARGIN - 20, color=RULE_LT, w=0.7)
        b.field(MARGIN + 20, ly - (nlines - 1) * 22 - 4, CW - 40, (nlines - 1) * 22 + 22, multiline=True)
        yy -= h + 14
    quote(c, CX, yy - 2, quote_text, size=17, color=SAGE_MD)
    footer(b, n)

def p21_sunday(b):
    rhythm_page(b, 21, "Section Four · Weekly Rhythm · Undated & Reusable", "Sunday Reset",
        "Your weekly soft landing. Reprint or duplicate this page as often as you like.",
        [("This week I want to feel…", "name the feeling, not the to-do", 2, TERRA),
         ("Three gentle priorities", "the ones that actually matter", 3, SAGE_MD),
         ("One thing I’m releasing", "permission to let it go", 2, OAK_LN),
         ("My self-care plan", "pick it now, future-you will thank you", 2, TERRA)],
        "A new week is just a new ten minutes.")

def p22_monday(b):
    rhythm_page(b, 22, "Section Four · Weekly Rhythm", "Monday Intention",
        "Set the tone before the inbox does. One calm intention beats ten frantic tasks.",
        [("Today’s one intention", "the single word or phrase for the day", 2, TERRA),
         ("The one thing that must get done", "just one — the rest is bonus", 2, SAGE_MD),
         ("A small kindness (to me or someone else)", "tiny counts", 2, OAK_LN),
         ("Tonight I’ll wind down by…", "decide now, drift later", 2, TERRA)],
        "Start gently. The week will keep up.")

def p23_midweek(b):
    rhythm_page(b, 23, "Section Four · Weekly Rhythm", "Midweek Check-In",
        "Wednesday is for course-correcting with kindness, not for catching up in a panic.",
        [("How am I, really?", "a one-line honest check", 2, TERRA),
         ("What can I drop or push to next week?", "lighten the load", 3, SAGE_MD),
         ("What’s already gone well?", "collect the small wins", 2, OAK_LN)],
        "Halfway is not behind. Halfway is halfway.")

def p24_friday(b):
    rhythm_page(b, 24, "Section Four · Weekly Rhythm", "Friday Wind-Down",
        "Close the week on purpose. Loose ends tied gently, so the weekend stays soft.",
        [("This week’s tiny win", "the one I want to remember", 2, TERRA),
         ("Anything to hand off to next week", "park it, don’t carry it", 3, SAGE_MD),
         ("How I want this weekend to feel", "name it, then protect it", 2, OAK_LN)],
        "You did enough. You are enough.")

def p25_saturday(b):
    rhythm_page(b, 25, "Section Four · Weekly Rhythm", "Saturday Slow Morning",
        "No agenda required. A page for permission to move at the speed of honey.",
        [("This morning I’d love to…", "want-to, not have-to", 2, TERRA),
         ("Something just for joy", "no productivity allowed", 2, SAGE_MD),
         ("A tiny something for the home (optional!)", "only if it sounds nice", 2, OAK_LN),
         ("I’m grateful for…", "three small things", 2, TERRA)],
        "Slow is a pace, not a failure.")

# ----- Section 5: bonus library -----
def p26_microhabits(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "30 Micro-Habits Master List",
               "A menu of ten-minute wins. Steal freely — pick one category, pick one habit.")
    cats = [
        ("Home", ["Make the bed", "Clear one surface", "Run the dishwasher", "One load of laundry", "Wipe the sink", "Set out tomorrow’s clothes"]),
        ("Body", ["Drink a full glass of water", "Stretch for two minutes", "Step outside", "Pack a fruit", "Stand & roll shoulders", "Lights out 15 min earlier"]),
        ("Money", ["Check one account", "Cancel one subscription", "Move $5 to savings", "Note today’s spend", "Pack lunch", "Review one bill"]),
        ("Mind", ["Three deep breaths", "Write one line", "Read two pages", "Tidy phone home screen", "One thing you’re glad about", "Sit quietly for 60 seconds"]),
        ("Relationships", ["Send one kind text", "Reply to that voicemail", "Plan one small meetup", "Compliment someone", "Put the phone away at dinner", "Say no to one thing"]),
    ]
    cw = (CW - 22) / 2
    positions = [(MARGIN, 0), (MARGIN + cw + 22, 0), (MARGIN, 1), (MARGIN + cw + 22, 1), (MARGIN, 2)]
    ch = 142
    for (cat, items), (x, row) in zip(cats, positions):
        yy = y - 2 - row * (ch + 14) - ch
        panel(c, x, yy, cw, ch, fill=CARD, stroke=SAGE_LN)
        c.setFillColor(SAGE)
        c.roundRect(x, yy + ch - 26, cw, 26, 8, fill=1, stroke=0)
        c.setFillColor(SAGE)
        c.rect(x, yy + ch - 26, cw, 13, fill=1, stroke=0)
        text(c, x + 14, yy + ch - 18, cat, "MSsb", 10, WHITE)
        leaf(c, x + cw - 18, yy + ch - 13, 35, 11, color=WHITE, lw=0.9)
        ty = yy + ch - 42
        for it in items:
            b.check_item(x + 14, ty - 8, it, size=8.5, fs=8.4, gap=7)
            ty -= 16
    footer(b, 26)

def p27_emergency(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "Emergency Reset",
               "For the weeks that got away from you. When you only have 15 minutes — do this.")
    panel(c, MARGIN, y - 40, CW, 40, fill=TERRA, stroke=None, r=8)
    text(c, CX, y - 26, "When you only have 15 minutes", "MSsb", 12, WHITE, align="c")
    steps = [
        ("5 min", "One surface", "Clear the kitchen counter or the spot you see most. Just one."),
        ("3 min", "One load", "Start the dishwasher or a load of laundry. Let a machine help."),
        ("3 min", "One list", "Brain-dump the top five loops. Circle the single most urgent."),
        ("2 min", "One reset", "Refill your water, open a window, change into clean clothes."),
        ("2 min", "One breath", "Sit down. Three slow breaths. You caught it. That’s enough."),
    ]
    yy = y - 40 - 18
    for mins, title, desc in steps:
        h = 50
        panel(c, MARGIN, yy - h, CW, h, fill=CARD, stroke=SAGE_LN)
        c.setFillColor(SAGE)
        c.roundRect(MARGIN, yy - h, 64, h, 8, fill=1, stroke=0)
        c.setFillColor(SAGE)
        c.rect(MARGIN + 52, yy - h, 12, h, fill=1, stroke=0)
        text(c, MARGIN + 32, yy - h / 2 + 2, mins, "PFsb", 14, WHITE, align="c")
        text(c, MARGIN + 80, yy - 22, title, "MSsb", 11, CHAR)
        para(c, MARGIN + 80, yy - 36, desc, "MS", 9, INK2, CW - 100, 11)
        yy -= h + 12
    quote(c, CX, yy + 2, "A hard week is not a failed week.", size=17, color=SAGE_MD)
    footer(b, 27)

def p28_pantry(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "Capsule Pantry List",
               "Twenty quiet staples that mix into fifteen low-effort meals. Check what you have.")
    staples = ["Eggs", "Oats", "Greek yogurt", "Canned beans", "Canned tomatoes",
               "Pasta", "Rice", "Tortillas", "Onions", "Garlic",
               "Frozen veg", "Frozen berries", "Cheese", "Olive oil", "Peanut butter",
               "Canned tuna", "Lemons", "Spinach", "Potatoes", "Stock cubes"]
    cols = 4
    colw = (CW - (cols - 1) * 16) / cols
    rows = 5
    top = y - 4
    for i, s in enumerate(staples):
        col = i // rows
        row = i % rows
        x = MARGIN + col * (colw + 16)
        ry = top - row * 26
        b.check_item(x, ry - 9, s, size=11, fs=9.6)
    yy = top - rows * 26 - 16
    text(c, MARGIN, yy, "15 meals hiding in there", "MSsb", 10.6, TERRA)
    rule(c, MARGIN, yy - 8, MARGIN + 26, color=SAGE, w=1.8)
    meals = ("Yogurt + berries · Oatmeal · Egg tortilla · Tuna pasta · Bean chili · "
             "Fried rice · Quesadilla · Tomato pasta · Loaded potato · Veg stir-fry · "
             "Bean & rice bowl · Frittata · Grilled cheese + soup · PB oat bites · "
             "Spinach & egg scramble")
    yy = para(c, MARGIN, yy - 24, meals, "MS", 9.8, CHAR, CW, 16)
    panel(c, MARGIN, yy - 64, CW, 64, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    card_title(c, MARGIN + 16, yy - 22, "My add-to-list", color=shade(SAGE, 0.35))
    b.field(MARGIN + 16, yy - 56, CW - 32, 26, multiline=True)
    rule(c, MARGIN + 16, yy - 38, PAGE_W - MARGIN - 16, color=RULE_LT, w=0.7)
    rule(c, MARGIN + 16, yy - 52, PAGE_W - MARGIN - 16, color=RULE_LT, w=0.7)
    footer(b, 28)

def phone(c, x, y, w, h, bg, accent, affirm, brand):
    fg = WHITE if accent == "w" else shade(SAGE, 0.42)
    sub = tint(WHITE, 0.10) if accent == "w" else INK3
    box(c, x, y, w, h, r=18, fill=bg, stroke=shade(bg, 0.20), sw=1.2)
    c.setFillColor(shade(bg, 0.20))
    c.roundRect(x + w / 2 - 14, y + h - 11, 28, 4.5, 2.2, fill=1, stroke=0)
    sprig(c, x + w / 2, y + h * 0.62, 0.62,
          color=tint(WHITE, 0.18) if accent == "w" else SAGE_MD)
    lines = wrap(affirm, "SC", 16, w - 16)
    ty = y + h * 0.46 + (len(lines) - 1) * 9
    for ln in lines:
        text(c, x + w / 2, ty, ln, "SC", 16, fg, align="c")
        ty -= 18
    eyebrow(c, x + w / 2, y + h * 0.20, brand, color=sub, size=6.0, track=1.4, align="c")

def p29_wallpapers(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "Phone Wallpapers",
               "Four sage reminders for your lock screen. Crop to 1170 × 2532 (iPhone) before saving.")
    designs = [
        (SAGE, "w", "small wins\ncount", "ATOMIC RESET"),
        (tint(SAGE, 0.55), "d", "you don’t\nhave to\nearn rest", "ATOMIC RESET"),
        (OAK_BG, "d", "done is\nsofter than\nperfect", "ATOMIC RESET"),
        (tint(TERRA, 0.50), "d", "one tiny\nthing", "ATOMIC RESET"),
    ]
    pw, ph = 96, 208
    gap = (CW - 4 * pw) / 3
    x = MARGIN
    top = y - 6
    for bg, ac, aff, brand in designs:
        phone(c, x, top - ph, pw, ph, bg, ac, aff, brand)
        x += pw + gap
    yy = top - ph - 18
    panel(c, MARGIN, yy - 56, CW, 56, fill=CARD, stroke=SAGE_LN)
    text(c, MARGIN + 16, yy - 22, "How to use", "MSsb", 9.6, TERRA)
    para(c, MARGIN + 16, yy - 38, "Open this PDF on your phone, screenshot a design, then set it as "
         "your wallpaper. Each is laid out to crop cleanly to a 1170 × 2532 px iPhone screen.",
         "MS", 9, INK2, CW - 32, 12)
    footer(b, 29)

def p30_cards(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "Printable Habit Tracker Cards",
               "Four wallet-sized cards. Print, cut along the dotted lines, and carry one.")
    cw = (CW - 20) / 2
    ch = 150
    gx, gy = 20, 22
    for i in range(4):
        col, row = i % 2, i // 2
        x = MARGIN + col * (cw + gx)
        yy = y - 8 - row * (ch + gy) - ch
        # cut guides
        rule(c, x - 6, yy + ch + 8, x + cw + 6, color=OAK_LN, w=0.6, dash=[2, 2])
        rule(c, x - 6, yy - 8, x + cw + 6, color=OAK_LN, w=0.6, dash=[2, 2])
        vrule(c, x - 8, yy - 6, yy + ch + 6, color=OAK_LN, w=0.6, dash=[2, 2])
        vrule(c, x + cw + 8, yy - 6, yy + ch + 6, color=OAK_LN, w=0.6, dash=[2, 2])
        panel(c, x, yy, cw, ch, fill=CARD, stroke=SAGE_LN, r=10)
        c.setFillColor(SAGE)
        c.roundRect(x, yy + ch - 28, cw, 28, 10, fill=1, stroke=0)
        c.setFillColor(SAGE)
        c.rect(x, yy + ch - 28, cw, 14, fill=1, stroke=0)
        text(c, x + 14, yy + ch - 19, "My Habit", "MSsb", 9.6, WHITE)
        b.field(x + 78, yy + ch - 24, cw - 92, 16)
        rule(c, x + 76, yy + ch - 26, x + cw - 12, color=tint(WHITE, 0.3), w=0.7)
        # 7 day dots
        text(c, x + 14, yy + ch - 48, "7-day streak", "MSm", 8, INK2)
        dlabels = ["M", "T", "W", "T", "F", "S", "S"]
        dx = x + 14
        for d in dlabels:
            b.checkbox(dx, yy + ch - 76, 13)
            text(c, dx + 6.5, yy + ch - 88, d, "MSm", 7, INK3, align="c")
            dx += (cw - 28) / 7
        text(c, x + 14, yy + 30, "Cue:", "MSm", 8, TERRA)
        b.field(x + 40, yy + 26, cw - 54, 14)
        rule(c, x + 40, yy + 24, x + cw - 14, color=RULE_LT, w=0.6)
        text(c, x + 14, yy + 12, "Reward:", "MSm", 8, TERRA)
        b.field(x + 56, yy + 8, cw - 70, 14)
        rule(c, x + 56, yy + 6, x + cw - 14, color=RULE_LT, w=0.6)
    footer(b, 30)

def p31_affirmations(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "Affirmation Cards",
               "Six gentle truths in sage and cream. Cut out, prop up, or tuck into a pocket.")
    affirms = [
        "Small wins count.", "You don’t have to earn rest.",
        "Done is softer than perfect.", "One tiny thing is enough.",
        "I can begin again, anytime.", "Slow is a pace, not a failure.",
    ]
    cw = (CW - 2 * 18) / 3
    ch = 132
    gx, gy = 18, 24
    for i, aff in enumerate(affirms):
        col, row = i % 3, i // 3
        x = MARGIN + col * (cw + gx)
        yy = y - 8 - row * (ch + gy) - ch
        rule(c, x - 5, yy + ch + 10, x + cw + 5, color=OAK_LN, w=0.6, dash=[2, 2])
        rule(c, x - 5, yy - 10, x + cw + 5, color=OAK_LN, w=0.6, dash=[2, 2])
        vrule(c, x - 7, yy - 8, yy + ch + 8, color=OAK_LN, w=0.6, dash=[2, 2])
        vrule(c, x + cw + 7, yy - 8, yy + ch + 8, color=OAK_LN, w=0.6, dash=[2, 2])
        bg = tint(SAGE, 0.80) if i % 2 == 0 else CARD
        panel(c, x, yy, cw, ch, fill=bg, stroke=SAGE_LN, r=10)
        branch_h(c, x + cw / 2, yy + ch - 24, span=cw * 0.28, color=SAGE_MD, lw=0.8)
        para(c, x + cw / 2, yy + ch / 2 + 6, aff, "SC", 21, shade(SAGE, 0.4), cw - 22, 22, align="c")
        sprig(c, x + cw / 2, yy + 16, 0.5, color=SAGE_MD)
    footer(b, 31)

def p32_quarterly(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "Quarterly Review",
               "Every ninety days, zoom out gently. Big-picture reflection, zero pressure.")
    fields = [
        ("What felt good this season?", 3),
        ("What quietly drained me?", 3),
        ("What do I want more of next quarter?", 3),
        ("What do I want less of?", 3),
    ]
    cw = (CW - 22) / 2
    for i, (q, n) in enumerate(fields):
        col, row = i % 2, i // 2
        x = MARGIN + col * (cw + 22)
        h = 120
        yy = y - 4 - row * (h + 16) - h
        panel(c, x, yy, cw, h, fill=CARD, stroke=SAGE_LN)
        leaf(c, x + 20, yy + h - 22, 35, 14, color=SAGE, fill=SAGE_PNL, lw=0.9)
        para(c, x + 36, yy + h - 26, q, "MSsb", 10.4, CHAR, cw - 50, 13)
        ly = yy + h - 52
        for k in range(n):
            rule(c, x + 16, ly - k * 22, x + cw - 16, color=RULE_LT, w=0.7)
        b.field(x + 16, ly - (n - 1) * 22 - 4, cw - 32, (n - 1) * 22 + 22, multiline=True)
    yy = y - 4 - 2 * (120 + 16)
    panel(c, MARGIN, yy - 56, CW, 56, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    text(c, MARGIN + 16, yy - 22, "My one word for next quarter:", "MSm", 10, CHAR)
    b.field(MARGIN + 220, yy - 28, 200, 20, fs=13)
    rule(c, MARGIN + 220, yy - 30, MARGIN + 420, color=RULE_LT, w=0.8)
    footer(b, 32)

def p33_morning(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "The 5-Minute Morning Reset",
               "For days when Sunday didn’t happen. Five minutes to start anyway.")
    steps = [
        ("01", "Make the bed", "Sixty seconds. It tells your brain the day has begun."),
        ("02", "Drink water", "A full glass before the coffee. Your body says thank you."),
        ("03", "Name one thing", "The single must-do for today. Write it where you’ll see it."),
        ("04", "Open a window", "Light and air, even for a moment. Reset the room and your head."),
        ("05", "One deep breath", "In for four, out for six. You’re allowed to start small."),
    ]
    yy = y - 2
    for num, t, d in steps:
        h = 52
        panel(c, MARGIN, yy - h, CW, h, fill=CARD, stroke=SAGE_LN)
        c.setFillColor(SAGE)
        c.circle(MARGIN + 30, yy - h / 2, 16, fill=1, stroke=0)
        text(c, MARGIN + 30, yy - h / 2 - 4, num, "PFsb", 13, WHITE, align="c")
        text(c, MARGIN + 60, yy - 22, t, "MSsb", 11.5, CHAR)
        para(c, MARGIN + 60, yy - 37, d, "MS", 9, INK2, CW - 130, 11)
        b.checkbox(PAGE_W - MARGIN - 34, yy - h / 2 - 7, 14)
        yy -= h + 12
    quote(c, CX, yy, "If Sunday slipped by, today still counts.", size=17, color=SAGE_MD)
    footer(b, 33)

def res_col(b, x, y, w, title, items):
    c = b.c
    panel(c, x, y - (26 + len(items) * 18 + 12), w, 26 + len(items) * 18 + 12,
          fill=CARD, stroke=SAGE_LN)
    c.setFillColor(SAGE)
    c.roundRect(x, y - 26, w, 26, 8, fill=1, stroke=0)
    c.setFillColor(SAGE)
    c.rect(x, y - 26, w, 13, fill=1, stroke=0)
    text(c, x + 12, y - 18, title, "MSsb", 9.6, WHITE)
    ty = y - 42
    for it in items:
        text(c, x + 12, ty, "·", "MSsb", 9, TERRA)
        para(c, x + 20, ty, it, "MS", 8.2, CHAR, w - 30, 9.5)
        ty -= 18

def p34_resources(b):
    c = b.c
    y = header(b, "Section Five · The Bonus Library", "Resource Page",
               "Ten of each, genuinely useful, no affiliate links — just things worth your time.")
    apps = ["Todoist — gentle task lists", "Notion — flexible planning",
            "Streaks — simple habit tracking", "Finch — self-care companion",
            "Insight Timer — free meditation", "Forest — focus timer",
            "YNAB — calm budgeting", "Sleep Cycle — kinder mornings",
            "Tody — flexible cleaning", "Paprika — recipe & meal planning"]
    books = ["Atomic Habits — James Clear", "Tiny Habits — BJ Fogg",
             "Burnout — E. & A. Nagoski", "Four Thousand Weeks — O. Burkeman",
             "How to Keep House While Drowning — KC Davis", "Real Self-Care — P. Lakshmin",
             "Laziness Does Not Exist — Devon Price", "Set Boundaries, Find Peace — N. Tawwab",
             "The Power of Habit — C. Duhigg", "A Slob Comes Clean — Dana K. White"]
    pods = ["The Lazy Genius — K. Adachi", "Happier — Gretchen Rubin",
            "Struggle Care — KC Davis", "A Slob Comes Clean — D. White",
            "10% Happier — Dan Harris", "The Minimalists",
            "Optimal Living Daily", "We Can Do Hard Things — G. Doyle",
            "Before Breakfast — L. Vanderkam", "Note to Self"]
    cw = (CW - 2 * 16) / 3
    res_col(b, MARGIN, y - 4, cw, "Apps", apps)
    res_col(b, MARGIN + cw + 16, y - 4, cw, "Books", books)
    res_col(b, MARGIN + 2 * (cw + 16), y - 4, cw, "Podcasts", pods)
    yy = y - 4 - (26 + 10 * 18 + 12) - 18
    quote(c, CX, yy, "Borrow what helps. Leave the rest. That’s the whole philosophy.",
          size=16, color=SAGE_MD)
    footer(b, 34)

def p35_thanks(b):
    c = b.c
    y = header(b, "One Last Thing", "Thank You + Next Steps")
    quote(c, CX, y - 4, "You showed up for yourself. That’s the win.", size=20, color=TERRA)
    y -= 42
    body = (
        "Thank you — truly. Out of everything competing for your attention this week, "
        "you chose a quieter way of doing things. That matters more than any checked box.\n\n"
        "Here’s my hope for you: that this becomes less of a planner and more of a habit. "
        "That “Sunday reset” turns into something your shoulders recognize — a small, "
        "repeatable hour that hands you back your week. You don’t have to do it perfectly. "
        "You just have to keep coming back to one tiny thing.\n\n"
        "If this workbook helped you breathe a little easier, would you tell one person? "
        "A quick, honest review helps another tired, overwhelmed human find a calmer way — "
        "and it genuinely makes my day."
    )
    y = para(c, MARGIN, y, body, "MS", 10.6, CHAR, CW, 15.6)
    y -= 6
    panel(c, MARGIN, y - 92, CW, 92, fill=tint(SAGE, 0.84), stroke=SAGE_LN)
    text(c, MARGIN + 18, y - 24, "Two tiny next steps", "MSsb", 10.4, shade(SAGE, 0.35))
    b.check_item(MARGIN + 18, y - 48, "Leave a kind, honest review — it takes two minutes.", size=11, fs=10)
    b.check_item(MARGIN + 18, y - 72, "Pick one page to reuse next Sunday.", size=11, fs=10)
    y -= 92 + 22
    text(c, CX, y, "Coming soon to the series", "MSsb", 9, INK3, align="c")
    text(c, CX, y - 20, "The Atomic Reset: Seasonal Editions · The 10-Minute Money Reset",
         "PFi", 11.5, SAGE_MD, align="c")
    branch_h(c, CX, y - 44, span=70, color=OAK_LN, lw=0.9)
    text(c, CX, y - 72, "small wins count.", "SC", 24, TERRA, align="c")
    footer(b, 35)

# ============================================================================
# Build
# ============================================================================
PAGES = [
    p1_cover, p2_welcome, p3_howto, p4_science, p5_timeline, p6_braindump,
    p7_space, p8_digital, p9_meal, p10_week, p11_selfcare, p12_stack,
    p13_tracker, p14_reflect, p15_energy, p16_renter_intro, p17_maintenance,
    p18_balcony, p19_swaps, p20_deposit, p21_sunday, p22_monday, p23_midweek,
    p24_friday, p25_saturday, p26_microhabits, p27_emergency, p28_pantry,
    p29_wallpapers, p30_cards, p31_affirmations, p32_quarterly, p33_morning,
    p34_resources, p35_thanks,
]

# Section-parent pages get an extra, unique outline anchor so ReportLab does
# not collapse a section header and its first child page (same destination).
SECTION_ANCHORS = {5: "sec1", 12: "sec2", 16: "sec3", 21: "sec4", 26: "sec5"}

OUTLINE = [
    ("Cover", "pg1", 0), ("Welcome Letter", "pg2", 0),
    ("How to Use This Workbook", "pg3", 0), ("The Science of Micro-Habits", "pg4", 0),
    ("Section 1 · The 60-Minute Sunday Reset", "sec1", 0),
    ("Master Timeline", "pg5", 1), ("Brain Dump", "pg6", 1),
    ("10-Minute Space Reset", "pg7", 1), ("Digital Declutter Sprint", "pg8", 1),
    ("Meal Prep Lite", "pg9", 1), ("Week Preview", "pg10", 1),
    ("Self-Care Ritual Menu", "pg11", 1),
    ("Section 2 · The Micro-Habit Tracker", "sec2", 0),
    ("Habit Stack Builder", "pg12", 1), ("4-Week Habit Tracker", "pg13", 1),
    ("Weekly Reflection", "pg14", 1), ("Energy Audit", "pg15", 1),
    ("Section 3 · The Renter-Friendly Home Reset", "sec3", 0),
    ("Renter’s Rules", "pg16", 1), ("Small-Space Maintenance", "pg17", 1),
    ("Balcony Glow-Up", "pg18", 1), ("Renter-Safe Decor Swaps", "pg19", 1),
    ("Deposit Protection Tracker", "pg20", 1),
    ("Section 4 · The Weekly Rhythm Pages", "sec4", 0),
    ("Sunday Reset", "pg21", 1), ("Monday Intention", "pg22", 1),
    ("Midweek Check-In", "pg23", 1), ("Friday Wind-Down", "pg24", 1),
    ("Saturday Slow Morning", "pg25", 1),
    ("Section 5 · The Bonus Library", "sec5", 0),
    ("30 Micro-Habits Master List", "pg26", 1), ("Emergency Reset", "pg27", 1),
    ("Capsule Pantry List", "pg28", 1), ("Phone Wallpapers", "pg29", 1),
    ("Printable Habit Tracker Cards", "pg30", 1), ("Affirmation Cards", "pg31", 1),
    ("Quarterly Review", "pg32", 1), ("The 5-Minute Morning Reset", "pg33", 1),
    ("Resource Page", "pg34", 1), ("Thank You + Next Steps", "pg35", 1),
]

def build():
    b = Book(OUT)
    for i, fn in enumerate(PAGES, start=1):
        b.c.bookmarkPage(f"pg{i}")
        if i in SECTION_ANCHORS:
            b.c.bookmarkPage(SECTION_ANCHORS[i])
        if i >= 2:
            page_chrome(b, i, frame=True, decor=True)
        fn(b)
        b.c.showPage()
    for title, dest, level in OUTLINE:
        b.c.addOutlineEntry(title, dest, level=level, closed=(level == 0))
    b.c.showOutline()
    b.c.save()
    print("wrote", OUT, os.path.getsize(OUT), "bytes")

if __name__ == "__main__":
    build()
