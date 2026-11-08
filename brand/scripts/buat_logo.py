"""Membuat semua versi logo Fantasea dari peta bobot hasil urai_logo.py.

Pakai:
  python3 brand/scripts/urai_logo.py   # sekali, atau setelah logo asli berganti
  python3 brand/scripts/buat_logo.py

Hasil di brand/logo/ dan brand/logo/web/.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "logo"
CACHE = Path(__file__).resolve().parent / ".cache"

NAVY = (0x20, 0x31, 0x49)
UKIR = (0x30, 0xA6, 0xDE)
TANDA = (0x12, 0x64, 0xA8)
KABUT = (0xC3, 0xD6, 0xE2)
PUTIH = (0xFF, 0xFF, 0xFF)
LAUT_MALAM = (0x13, 0x1F, 0x33)

data = np.load(CACHE / "bobot.npz")
B = data["bobot"].astype(np.float32)
IDX = {n: i for i, n in enumerate(data["nama"].tolist())}


def warnai(bobot, peta):
    """peta: nama warna -> (rgb, opasitas) atau None untuk dibuang."""
    h, w, _ = bobot.shape
    alpha = np.zeros((h, w), np.float32)
    rgb = np.zeros((h, w, 3), np.float32)
    for nama, aturan in peta.items():
        if aturan is None:
            continue
        warna, op = aturan
        wgt = bobot[..., IDX[nama]] * op
        alpha += wgt
        rgb += wgt[..., None] * np.array(warna, np.float32)
    alpha = np.clip(alpha, 0, 1)
    rgb = np.where(alpha[..., None] > 1e-4, rgb / np.maximum(alpha[..., None], 1e-4), 0)
    out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).round().astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def pangkas(im, pad):
    """Pangkas ke isi lalu beri ruang bebas pad (px) di semua sisi."""
    bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bbox)
    out = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    out.paste(im, (pad, pad))
    return out


def di_latar(im, warna):
    bg = Image.new("RGBA", im.size, warna + (255,))
    bg.alpha_composite(im)
    return bg.convert("RGB")


# ---------- versi logo lengkap ----------
PETA = {
    "utama": {"navy": (NAVY, 1), "ukir": (UKIR, 1), "tanda": (TANDA, 1), "kabut": (KABUT, 1)},
    "latar-gelap": {"navy": (PUTIH, 1), "ukir": (UKIR, 1), "tanda": (UKIR, 1), "kabut": (PUTIH, 0.12)},
    "navy": {"navy": (NAVY, 1), "ukir": None, "tanda": (NAVY, 1), "kabut": None},
    "putih": {"navy": (PUTIH, 1), "ukir": None, "tanda": (PUTIH, 1), "kabut": None},
}


# ---------- tanda manta (tanpa tulisan) ----------
def bobot_manta():
    """Ambil badan manta saja. Ekor manta menyatu dengan palang huruf T, jadi palang
    dibuang dan ekor di bagian itu disambung lurus antara tepi atas dan bawah palang."""
    padat = (B[..., IDX["navy"]] + B[..., IDX["ukir"]]) > 0.5
    lab, _ = ndi.label(padat)
    utama = lab[300, 950]  # titik di tengah badan manta
    mask = lab == utama
    # area palang T
    y0, y1, x0, x1 = 580, 648, 790, 965
    mask[y0:y1, x0:x1] = False

    def tepi(y):
        xs = np.flatnonzero(padat[y, 830:930]) + 830
        return xs.min(), xs.max() + 1

    la, ra = tepi(y0 - 1)
    lb, rb = tepi(y1)
    ekor = np.zeros_like(mask, dtype=np.float32)
    for y in range(y0, y1):
        t = (y - (y0 - 1)) / (y1 - (y0 - 1))
        l = la + (lb - la) * t
        r = ra + (rb - ra) * t
        xs = np.arange(x0, x1)
        cover = np.clip(np.minimum(xs + 1 - l, r - xs), 0, 1)  # cakupan tepi halus
        ekor[y, x0:x1] = cover
    # lebarkan sedikit agar tepi halus manta ikut terbawa
    zona = ndi.binary_dilation(mask, iterations=2)
    out = B.copy()
    out[~zona] = 0
    out[..., IDX["kabut"]] = 0
    out[..., IDX["tanda"]] = 0
    band = out[y0:y1, x0:x1]
    band[:] = 0
    band[..., IDX["navy"]] = ekor[y0:y1, x0:x1]
    return out


def kotak(im, sisi, pad_frac, latar=None, sudut=0):
    """Taruh im di tengah kanvas persegi."""
    kan = Image.new("RGBA", (sisi, sisi), (0, 0, 0, 0))
    if latar is not None:
        bg = Image.new("RGBA", (sisi, sisi), latar + (255,))
        if sudut:
            m = Image.new("L", (sisi, sisi), 0)
            from PIL import ImageDraw
            ImageDraw.Draw(m).rounded_rectangle((0, 0, sisi - 1, sisi - 1), radius=sudut, fill=255)
            kan.paste(bg, (0, 0), m)
        else:
            kan = bg
    inner = int(sisi * (1 - 2 * pad_frac))
    s = inner / max(im.size)
    kecil = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    kan.alpha_composite(kecil, ((sisi - kecil.width) // 2, (sisi - kecil.height) // 2))
    return kan


if __name__ == "__main__":
    LOGO.mkdir(exist_ok=True)
    web = LOGO / "web"
    web.mkdir(exist_ok=True)

    pad = 60
    for nama, peta in PETA.items():
        im = pangkas(warnai(B, peta), pad)
        im.save(LOGO / f"fantasea-logo-{nama}.png", optimize=True)
        print("✓", f"fantasea-logo-{nama}.png", im.size)
    # logo utama di atas putih (JPG untuk WhatsApp, dokumen, percetakan sederhana)
    di_latar(pangkas(warnai(B, PETA["utama"]), 160), PUTIH).save(LOGO / "fantasea-logo-utama-latar-putih.jpg", quality=95)

    BM = bobot_manta()
    manta = {
        "manta": {"navy": (NAVY, 1), "ukir": (UKIR, 1)},
        "manta-latar-gelap": {"navy": (PUTIH, 1), "ukir": (UKIR, 1)},
        "manta-navy": {"navy": (NAVY, 1), "ukir": None},
        "manta-putih": {"navy": (PUTIH, 1), "ukir": None},
    }
    hasil = {}
    for nama, peta in manta.items():
        im = pangkas(warnai(BM, peta), 40)
        hasil[nama] = im
        im.save(LOGO / f"fantasea-{nama}.png", optimize=True)
        print("✓", f"fantasea-{nama}.png", im.size)

    # siluet padat untuk ukuran sangat kecil (pola ukir hilang di bawah 48 px)
    sil = pangkas(warnai(BM, {"navy": (PUTIH, 1), "ukir": (PUTIH, 1)}), 40)

    # foto profil: manta terang di atas Laut Malam, aman untuk potongan lingkaran
    av = kotak(hasil["manta-latar-gelap"], 1080, 0.17, LAUT_MALAM)
    av.convert("RGB").save(LOGO / "fantasea-avatar-1080.png", optimize=True)
    av2 = kotak(hasil["manta"], 1080, 0.17, PUTIH)
    av2.convert("RGB").save(LOGO / "fantasea-avatar-putih-1080.png", optimize=True)
    print("✓ avatar")

    # ikon web
    for s in (16, 32):
        kotak(sil, s, 0.08, LAUT_MALAM, sudut=max(2, s // 5)).save(web / f"favicon-{s}.png")
    kotak(hasil["manta-latar-gelap"], 48, 0.1, LAUT_MALAM, sudut=10).save(web / "favicon-48.png")
    ico = kotak(sil, 256, 0.08, LAUT_MALAM, sudut=52)
    ico.save(web / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    kotak(hasil["manta-latar-gelap"], 180, 0.16, LAUT_MALAM).convert("RGB").save(web / "apple-touch-icon.png")
    for s in (192, 512):
        kotak(hasil["manta-latar-gelap"], s, 0.16, LAUT_MALAM).convert("RGB").save(web / f"icon-{s}.png")
    # versi maskable: isi di zona aman 80%
    kotak(hasil["manta-latar-gelap"], 512, 0.24, LAUT_MALAM).convert("RGB").save(web / "icon-maskable-512.png")
    print("✓ ikon web")
