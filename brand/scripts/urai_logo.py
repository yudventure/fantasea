"""Mengurai logo asli Fantasea menjadi peta bobot per warna merek.

Setiap piksel logo asli (latar putih) dijelaskan sebagai campuran warna merek:
  - satu warna merek + putih  -> tepi halus di atas latar (menjadi transparansi)
  - dua warna merek           -> tepi di antara dua bidang warna (tetap padat)
Hasilnya disimpan sebagai brand/scripts/.cache/bobot.npz dan dipakai buat_logo.py
untuk mewarnai ulang logo tanpa kehilangan tepi halus.

Pakai: python3 brand/scripts/urai_logo.py
"""
import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageCms

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "logo" / "fantasea-logo-asli.webp"
CACHE = Path(__file__).resolve().parent / ".cache"

# Warna merek, dibaca dari logo asli (profil sRGB)
WARNA = {
    "navy": (0x20, 0x31, 0x49),    # Navy Manta: badan manta, tulisan
    "ukir": (0x30, 0xA6, 0xDE),    # Biru Ukir: pola ukir di sayap
    "tanda": (0x12, 0x64, 0xA8),   # Biru Tanda: segitiga penanda
    "kabut": (0xC3, 0xD6, 0xE2),   # Kabut Karang: bidang segi di belakang
}
NAMA = list(WARNA)


def baca_srgb():
    im = Image.open(SRC)
    icc = im.info.get("icc_profile")
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        im = ImageCms.profileToProfile(im, src, ImageCms.createProfile("sRGB"), outputMode="RGB")
    return np.asarray(im.convert("RGB"), dtype=np.float32)


def urai(c, pakai=None):
    """pakai: daftar indeks warna yang boleh dipakai (default semua)."""
    h, w, _ = c.shape
    px = c.reshape(-1, 3)
    W = np.array([255.0, 255.0, 255.0])
    F = np.array([WARNA[n] for n in NAMA], dtype=np.float32)
    k = len(F)
    pakai = list(range(k)) if pakai is None else pakai
    best_res = np.full(len(px), np.inf, dtype=np.float32)
    bobot = np.zeros((len(px), k), dtype=np.float32)

    # campuran warna merek + putih
    for i in pakai:
        d = W - F[i]
        a = np.clip(((W - px) @ d) / (d @ d), 0, 1)
        res = np.linalg.norm(a[:, None] * F[i] + (1 - a[:, None]) * W - px, axis=1)
        m = res < best_res
        best_res[m] = res[m]
        bobot[m] = 0
        bobot[m, i] = a[m]

    # campuran dua warna merek (tepi di dalam logo, tetap padat)
    for i in pakai:
        for j in pakai:
            if j <= i:
                continue
            d = F[i] - F[j]
            t = np.clip(((px - F[j]) @ d) / (d @ d), 0, 1)
            res = np.linalg.norm(t[:, None] * F[i] + (1 - t[:, None]) * F[j] - px, axis=1)
            # sedikit penalti agar tepi ke latar putih lebih disukai bila sama-sama cocok
            res = res + 2.0
            m = res < best_res
            best_res[m] = res[m]
            bobot[m] = 0
            bobot[m, i] = t[m]
            bobot[m, j] = 1 - t[m]

    # piksel yang hampir putih dianggap latar
    putih = px.min(axis=1) > 250
    bobot[putih] = 0
    return bobot.reshape(h, w, k), best_res.reshape(h, w)


def zona(mask, luas_min, lebar):
    """Wilayah tempat sebuah warna benar-benar ada: komponen besar, sedikit dilebarkan."""
    from scipy import ndimage as ndi
    lab, n = ndi.label(mask)
    if n == 0:
        return np.zeros_like(mask)
    luas = ndi.sum(mask, lab, range(1, n + 1))
    besar = np.isin(lab, 1 + np.flatnonzero(luas >= luas_min))
    return ndi.binary_dilation(besar, iterations=lebar)


def urai_bersih(c):
    """Tepi antara navy dan biru ukir mirip warna Biru Tanda, dan tepi navy di atas
    putih mirip Kabut Karang. Karena itu Biru Tanda dan Kabut Karang hanya boleh
    muncul di wilayah segitiga dan bidang segi yang sebenarnya."""
    i_tanda, i_kabut = NAMA.index("tanda"), NAMA.index("kabut")
    semua, _ = urai(c)
    z_tanda = zona(semua[..., i_tanda] > 0.6, 150, 3)
    z_kabut = zona(semua[..., i_kabut] > 0.6, 1500, 3)
    dasar = [NAMA.index("navy"), NAMA.index("ukir")]
    hasil = {}
    for kunci, pakai in {
        "dasar": dasar,
        "tanda": dasar + [i_tanda],
        "kabut": dasar + [i_kabut],
        "semua": dasar + [i_tanda, i_kabut],
    }.items():
        hasil[kunci] = urai(c, pakai)
    pilih = np.where(z_tanda & z_kabut, 3, np.where(z_tanda, 1, np.where(z_kabut, 2, 0)))
    urutan = ["dasar", "tanda", "kabut", "semua"]
    bobot = np.zeros_like(semua)
    res = np.zeros(c.shape[:2], dtype=np.float32)
    for i, kunci in enumerate(urutan):
        m = pilih == i
        bobot[m] = hasil[kunci][0][m]
        res[m] = hasil[kunci][1][m]

    # Sisa kompresi: bobot navy/ukir tipis yang jauh dari bidang navy/ukir padat
    # (mis. garis samar di tepi bidang segi). Pindahkan ke Kabut Karang bila
    # berada di bidang segi, selain itu dibuang.
    from scipy import ndimage as ndi
    for nama in ("navy", "ukir"):
        i = NAMA.index(nama)
        dekat = ndi.binary_dilation(bobot[..., i] > 0.5, iterations=2)
        nyasar = np.where(dekat, 0, bobot[..., i])
        bobot[..., i] -= nyasar
        bobot[..., i_kabut] += np.where(z_kabut, nyasar, 0)
    return bobot, res


if __name__ == "__main__":
    c = baca_srgb()
    bobot, res = urai_bersih(c)
    CACHE.mkdir(exist_ok=True)
    np.savez_compressed(CACHE / "bobot.npz", bobot=bobot.astype(np.float16), nama=np.array(NAMA))
    print("ukuran", c.shape[1], "x", c.shape[0])
    print("sisa rata-rata", float(res.mean()), "p99", float(np.percentile(res, 99)))
    for i, n in enumerate(NAMA):
        print(f"  {n:6s} luas {float(bobot[..., i].sum()):10.0f} px")
