"""Menyusun paket aset merek Fantasea, satu folder per item, menjadi
brand/ekspor/Fantasea-Dive-Travel-Brand-Kit.zip.

Pakai (setelah logo, template, PNG grafis, dan PDF terbaru dibuat):
  node brand/scripts/buat_png_grafis.js
  python3 brand/scripts/buat_zip.py

Selain mengemas, skrip ini juga membuat berkas palet warna di brand/warna/:
palet-warna.png, palet-warna.txt, fantasea.ase (Adobe), fantasea.gpl (GIMP/Inkscape).
"""
import json
import struct
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageDraw, ImageFont

BRAND = Path(__file__).resolve().parents[1]
KIT = "Fantasea-Dive-Travel-Brand-Kit"
OUT = BRAND / "ekspor" / f"{KIT}.zip"
WARNA_DIR = BRAND / "warna"

TOKENS = json.loads((BRAND / "token" / "tokens.json").read_text())
WARNA = [(k, v) for grup in ("inti", "pendamping") for k, v in TOKENS["warna"][grup].items()]


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


# ---------- berkas palet ----------
def font(nama, ukuran, berat=None):
    f = ImageFont.truetype(str(BRAND / "font" / "desktop" / nama), ukuran)
    if berat:
        try:
            f.set_variation_by_axes([berat])
        except Exception:
            pass
    return f


def buat_palet_png():
    W, H = 2400, 1350
    im = Image.new("RGB", (W, H), "#FFFFFF")
    d = ImageDraw.Draw(im)
    judul = font("LondrinaSolid-Black.ttf", 96)
    aksen = font("GochiHand-Regular.ttf", 34)
    nama_f = font("Nunito[wght].ttf", 40, 900)
    isi_f = font("Nunito[wght].ttf", 28, 500)
    d.text((100, 80), "Warna Fantasea Dive Travel", font=judul, fill="#203149")
    d.text((104, 200), "WARNA INTI DARI LOGO  ·  WARNA PENDAMPING", font=aksen, fill="#1264A8", spacing=4)
    kolom, x0, y0, gap = 4, 100, 300, 30
    w = (W - 2 * x0 - (kolom - 1) * gap) // kolom
    h_blok, h_data = 300, 190
    for i, (_, v) in enumerate(WARNA):
        r, c = divmod(i, kolom)
        x = x0 + c * (w + gap)
        y = y0 + r * (h_blok + h_data + gap)
        d.rounded_rectangle((x, y, x + w, y + h_blok + h_data), radius=24, fill="#FFFFFF", outline="#D5E2EA", width=3)
        d.rounded_rectangle((x, y, x + w, y + h_blok), radius=24, fill=v["hex"])
        d.rectangle((x, y + h_blok - 24, x + w, y + h_blok), fill=v["hex"])
        if v["hex"].upper() == "#FFFFFF":
            # swatch putih diberi bingkai, bukan garis pemisah
            d.rounded_rectangle((x + 14, y + 14, x + w - 14, y + h_blok - 14), radius=14, outline="#D5E2EA", width=3)
        d.text((x + 28, y + h_blok + 22), v["nama"], font=nama_f, fill="#203149")
        rgb = " ".join(map(str, v["rgb"]))
        baris = f"{v['hex']}   RGB {rgb}"
        if "cmyk" in v:
            baris2 = "CMYK " + " ".join(map(str, v["cmyk"]))
        else:
            baris2 = "Warna layar (web dan media sosial)"
        d.text((x + 28, y + h_blok + 82), baris, font=isi_f, fill="#203149")
        d.text((x + 28, y + h_blok + 122), baris2, font=isi_f, fill="#55657A")
    im.save(WARNA_DIR / "palet-warna.png", optimize=True)


def buat_palet_teks():
    baris = ["WARNA FANTASEA DIVE TRAVEL", "Lima warna inti dibaca langsung dari logo (sRGB). CMYK adalah titik awal; minta contoh cetak.", ""]
    for grup, judul in (("inti", "WARNA INTI"), ("pendamping", "WARNA PENDAMPING")):
        baris.append(judul)
        for _, v in TOKENS["warna"][grup].items():
            cmyk = ("  CMYK " + " ".join(map(str, v["cmyk"]))) if "cmyk" in v else ""
            baris.append(f"- {v['nama']:<13} {v['hex']}  RGB {' '.join(map(str, v['rgb']))}{cmyk}")
            baris.append(f"  {v['peran']}")
        baris.append("")
    baris.append("PASANGAN TEKS YANG LOLOS KETERBACAAN")
    for k, r in TOKENS["kontras"].items():
        baris.append(f"- {k}: {r} : 1")
    (WARNA_DIR / "palet-warna.txt").write_text("\n".join(baris) + "\n")


def buat_ase():
    """Adobe Swatch Exchange: dibuka di Illustrator, Photoshop, InDesign, Affinity."""
    blok = []
    for _, v in WARNA:
        nama = v["nama"]
        nama_b = (nama + "\0").encode("utf-16-be")
        r, g, b = (c / 255 for c in hex_rgb(v["hex"]))
        isi = struct.pack(">H", len(nama) + 1) + nama_b + b"RGB " + struct.pack(">fffH", r, g, b, 2)
        blok.append(struct.pack(">HI", 0x0001, len(isi)) + isi)
    data = b"ASEF" + struct.pack(">HHI", 1, 0, len(blok)) + b"".join(blok)
    (WARNA_DIR / "fantasea.ase").write_bytes(data)


def buat_gpl():
    baris = ["GIMP Palette", "Name: Fantasea Dive Travel", "Columns: 4", "#"]
    for _, v in WARNA:
        r, g, b = hex_rgb(v["hex"])
        baris.append(f"{r:3d} {g:3d} {b:3d}\t{v['nama']}")
    (WARNA_DIR / "fantasea.gpl").write_text("\n".join(baris) + "\n")


# ---------- isi paket ----------
def glob(pola):
    return sorted(BRAND.glob(pola))


PAKET = {
    "01-pedoman-merek": [("pedoman-merek.pdf", "Fantasea-Pedoman-Merek.pdf")],
    "02-logo-utama/png": [
        "logo/fantasea-logo-utama.png",
        "logo/fantasea-logo-latar-gelap.png",
        "logo/fantasea-logo-navy.png",
        "logo/fantasea-logo-putih.png",
        "logo/fantasea-logo-utama-latar-putih.jpg",
    ],
    "02-logo-utama/svg": [f"logo/svg/fantasea-logo-{v}.svg" for v in ("utama", "latar-gelap", "navy", "putih")],
    "03-tanda-manta/png": [f"logo/fantasea-manta{v}.png" for v in ("", "-latar-gelap", "-navy", "-putih")],
    "03-tanda-manta/svg": [f"logo/svg/fantasea-manta{v}.svg" for v in ("", "-latar-gelap", "-navy", "-putih")],
    "04-logo-asli": ["logo/fantasea-logo-asli.webp"],
    "05-favikon-dan-ikon-web": glob("logo/web/*"),
    "06-warna": ["warna/palet-warna.png", "warna/palet-warna.txt", "warna/fantasea.ase", "warna/fantasea.gpl"],
    "07-font/desktop": glob("font/desktop/*.ttf"),
    "07-font/lisensi": glob("font/OFL-*.txt"),
    "08-elemen-grafis/svg": [p for p in glob("grafis/*.svg")],
    "08-elemen-grafis/png": glob("grafis/png/*.png"),
    "09-ikon/svg": glob("grafis/ikon/*.svg"),
    "09-ikon/png": glob("grafis/ikon/png/*.png"),
    "10-media-sosial/foto-profil": [
        ("logo/fantasea-avatar-1080.png", "foto-profil-laut-malam.png"),
        ("logo/fantasea-avatar-putih-1080.png", "foto-profil-putih.png"),
    ],
    "10-media-sosial/feed": [p for p in glob("sosial/ekspor/0[1-5]-*.png")],
    "10-media-sosial/story": glob("sosial/ekspor/06-*.png"),
    "10-media-sosial/cover-sorotan": glob("sosial/ekspor/07-*.png"),
    "11-website/token": ["token/tokens.css", "token/tokens.json"],
    "11-website/font/web": glob("font/web/*"),
}

BACA = """FANTASEA DIVE TRAVEL - PAKET ASET MEREK
Edisi 1 - November 2026
Tagline: Live the Fantasea.

Satu folder untuk setiap jenis aset. Buka 01-pedoman-merek lebih dulu.

01-pedoman-merek        Buku pedoman merek (PDF A4 lanskap).
02-logo-utama           Logo lengkap. PNG transparan untuk layar, SVG untuk
                        percetakan, sablon, papan nama, dan desainer.
                          utama       latar putih atau terang (pilihan pertama)
                          latar-gelap latar navy, laut malam, foto gelap
                          navy        satu warna: stempel, sablon, cetak hitam
                          putih       satu warna putih: kaos gelap, bordir
                          utama-latar-putih.jpg  untuk WhatsApp dan dokumen
03-tanda-manta          Manta tanpa tulisan: ruang kecil, sudut template,
                        cap air, stiker. Dipakai bila logo lengkap < 160 px.
04-logo-asli            Gambar logo asli yang menjadi sumber semua versi.
05-favikon-dan-ikon-web Favikon dan ikon aplikasi untuk website.
06-warna                Palet (PNG dan TXT) beserta swatch untuk Adobe (.ase)
                        dan GIMP/Inkscape (.gpl).
07-font                 Londrina Solid (judul), Gochi Hand (label aksen),
                        Nunito (teks isi). Klik dua kali TTF untuk memasang.
                        Lisensi SIL OFL 1.1: bebas untuk usaha.
08-elemen-grafis        Garis Ekor, Tanda Arah, Pulau Segi, Ukir Sayap, Pola
                        Jalur. SVG dan PNG transparan.
09-ikon                 Ikon garis (navy dan putih), SVG dan PNG 512 px.
10-media-sosial         Foto profil, template feed 4:5, story 9:16, dan cover
                        sorotan, siap unggah.
11-website              tokens.css, tokens.json, dan font web (woff2).

WARNA UTAMA
  Navy Manta   #203149    Biru Ukir    #30A6DE    Biru Tanda   #1264A8
  Kabut Karang #C3D6E2    Putih        #FFFFFF
  Laut Malam   #131F33    Buih         #EEF5F9    Koral Senja  #FF8A5C

ATURAN SINGKAT
- Jangan meregangkan, memiringkan, atau mengganti warna logo.
- Logo utama jangan diletakkan di latar navy; pakai versi latar-gelap.
- Ruang kosong di sekitar logo minimal setinggi huruf DIVE TRAVEL.
- Ukuran terkecil: logo lengkap 160 px (40 mm), tanda manta 40 px (10 mm).
- Koral Senja hanya untuk tombol pesan, harga, dan sisa kursi.

YANG MASIH CONTOH
- Harga, tanggal, kuota, dan data titik selam di template media sosial.
- Nomor WhatsApp +62 8XX-XXXX-XXXX, handle @fantaseadivetravel, domain
  fantaseadivetravel.com.
- SVG adalah jiplakan rapi dari logo 2000 px, bukan file kerja desainer.
"""

if __name__ == "__main__":
    WARNA_DIR.mkdir(exist_ok=True)
    buat_palet_png()
    buat_palet_teks()
    buat_ase()
    buat_gpl()

    OUT.parent.mkdir(exist_ok=True)
    jumlah = 0
    with ZipFile(OUT, "w", ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(f"{KIT}/00-BACA-DULU.txt", BACA)
        for folder, isi in PAKET.items():
            if not isi:
                raise SystemExit(f"Folder {folder} kosong. Jalankan skrip pembuat asetnya dulu.")
            for item in isi:
                src, nama = (item if isinstance(item, tuple) else (item, None))
                src = BRAND / src if not isinstance(src, Path) else src
                if not src.exists():
                    raise SystemExit(f"Berkas tidak ada: {src}")
                z.write(src, f"{KIT}/{folder}/{nama or src.name}")
                jumlah += 1
    print(f"✓ {OUT.relative_to(BRAND.parent)}  ({jumlah + 1} berkas, {OUT.stat().st_size / 1e6:.1f} MB)")
