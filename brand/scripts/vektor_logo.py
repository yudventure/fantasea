"""Menjiplak logo Fantasea menjadi SVG per lapis warna (potrace).

Logo asli hanya tersedia sebagai gambar 2000 px. SVG ini hasil jiplakan yang
rapi untuk cetak besar, tetapi bukan file kerja asli desainer.

Pakai: python3 brand/scripts/vektor_logo.py   (butuh: pip install potracer scipy)
"""
import sys
from pathlib import Path

import numpy as np
import potrace
from PIL import Image
from scipy import ndimage as ndi

sys.path.insert(0, str(Path(__file__).resolve().parent))
import buat_logo as bl  # noqa: E402

LOGO = bl.LOGO / "svg"
SKALA = 2  # jiplak pada 2x agar lengkung halus


def topeng(peta_bobot, ambang=0.5):
    im = Image.fromarray(np.clip(peta_bobot * 255, 0, 255).astype(np.uint8))
    im = im.resize((im.width * SKALA, im.height * SKALA), Image.BICUBIC)
    return np.asarray(im) > ambang * 255


def jiplak(mask):
    bm = potrace.Bitmap(~mask)  # potracer membalik bitmap bool, jadi dibalik dulu
    plist = bm.trace(turdsize=6 * SKALA, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    f = lambda p: f"{p.x / SKALA:.2f} {p.y / SKALA:.2f}"  # noqa: E731
    for curve in plist:
        d.append("M" + f(curve.start_point))
        for seg in curve.segments:
            if seg.is_corner:
                d.append("L" + f(seg.c) + "L" + f(seg.end_point))
            else:
                d.append("C" + f(seg.c1) + " " + f(seg.c2) + " " + f(seg.end_point))
        d.append("Z")
    return "".join(d)


def lapisan(bobot):
    i = bl.IDX
    navy, ukir, tanda, kabut = (bobot[..., i[n]] for n in ("navy", "ukir", "tanda", "kabut"))
    padat = navy + ukir
    # bidang segi sedikit diperluas ke bawah manta agar tidak ada celah putih
    k = kabut > 0.5
    k_bawah = ndi.binary_dilation(k, iterations=3) & ((padat + tanda) > 0.3)
    return {
        "kabut": topeng((k | k_bawah).astype(np.float32)),
        "navy": topeng(padat),
        "ukir": topeng(ukir),
        "tanda": topeng(tanda),
    }


def svg(lap, warna, judul, bbox=None):
    h, w = next(iter(lap.values())).shape
    w, h = w // SKALA, h // SKALA
    x0, y0, x1, y1 = bbox or (0, 0, w, h)
    isi = []
    for nama in ("kabut", "navy", "ukir", "tanda"):
        if nama not in lap or warna.get(nama) is None:
            continue
        col, op = warna[nama]
        if not lap[nama].any():
            continue
        attr = f' fill-opacity="{op}"' if op < 1 else ""
        isi.append(f'  <path id="{nama}" fill="{col}"{attr} fill-rule="evenodd" d="{jiplak(lap[nama])}"/>')
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1 - x0} {y1 - y0}" '
        f'width="{x1 - x0}" height="{y1 - y0}" role="img" aria-label="{judul}">\n'
        f"  <title>{judul}</title>\n" + "\n".join(isi) + "\n</svg>\n"
    )


def kotak_isi(bobot, pad):
    a = bobot.sum(axis=2) > 0.03
    ys, xs = np.nonzero(a)
    return (int(xs.min()) - pad, int(ys.min()) - pad, int(xs.max()) + 1 + pad, int(ys.max()) + 1 + pad)


HEX = lambda c: "#%02X%02X%02X" % c  # noqa: E731

if __name__ == "__main__":
    LOGO.mkdir(exist_ok=True)
    versi_logo = {
        "fantasea-logo-utama": {"kabut": (HEX(bl.KABUT), 1), "navy": (HEX(bl.NAVY), 1), "ukir": (HEX(bl.UKIR), 1), "tanda": (HEX(bl.TANDA), 1)},
        "fantasea-logo-latar-gelap": {"kabut": ("#FFFFFF", 0.12), "navy": ("#FFFFFF", 1), "ukir": (HEX(bl.UKIR), 1), "tanda": (HEX(bl.UKIR), 1)},
        "fantasea-logo-navy": {"navy": (HEX(bl.NAVY), 1), "ukir": None, "tanda": (HEX(bl.NAVY), 1)},
        "fantasea-logo-putih": {"navy": ("#FFFFFF", 1), "ukir": None, "tanda": ("#FFFFFF", 1)},
    }
    lap = lapisan(bl.B)
    box = kotak_isi(bl.B, 60)
    for nama, warna in versi_logo.items():
        lp = dict(lap)
        if warna.get("ukir") is None:
            # satu warna: pola ukir menjadi lubang di badan manta
            lp["navy"] = lap["navy"] & ~lap["ukir"]
        (LOGO / f"{nama}.svg").write_text(svg(lp, warna, "Fantasea Dive Travel", box))
        print("✓", f"{nama}.svg")

    BM = bl.bobot_manta()
    lap_m = lapisan(BM)
    box_m = kotak_isi(BM, 40)
    versi_manta = {
        "fantasea-manta": {"navy": (HEX(bl.NAVY), 1), "ukir": (HEX(bl.UKIR), 1)},
        "fantasea-manta-latar-gelap": {"navy": ("#FFFFFF", 1), "ukir": (HEX(bl.UKIR), 1)},
        "fantasea-manta-navy": {"navy": (HEX(bl.NAVY), 1), "ukir": None},
        "fantasea-manta-putih": {"navy": ("#FFFFFF", 1), "ukir": None},
    }
    for nama, warna in versi_manta.items():
        lp = {"navy": lap_m["navy"], "ukir": lap_m["ukir"]}
        if warna.get("ukir") is None:
            lp["navy"] = lap_m["navy"] & ~lap_m["ukir"]
        (LOGO / f"{nama}.svg").write_text(svg(lp, warna, "Manta Fantasea", box_m))
        print("✓", f"{nama}.svg")
