"""Ikon garis Fantasea (grid 24, garis 1,7, ujung membulat) dan template cover sorotan.

Pakai: python3 brand/scripts/buat_ikon.py
Hasil: brand/grafis/ikon/*.svg dan brand/sosial/template/07-cover-sorotan.html
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

IKON = {
    "trip": ("Trip", '<path d="M2.5 14.5h19l-2.6 4.3H5.1z"/><path d="M7 14.5V10h6.6l3 4.5"/><path d="M10.3 10V6.5"/><path d="M2 21.5c1.7 0 1.7-1 3.3-1s1.7 1 3.4 1 1.6-1 3.3-1 1.7 1 3.3 1 1.7-1 3.4-1 1.6 1 3.3 1"/>'),
    "titik-selam": ("Titik Selam", '<path d="M3 9.5C3 8.1 4.1 7 5.5 7h11c1.4 0 2.5 1.1 2.5 2.5v3c0 1.7-1.3 3-3 3h-1.8c-.8 0-1.6-.5-2-1.2l-.4-.8c-.4-.8-1.6-.8-2 0l-.4.8c-.4.7-1.2 1.2-2 1.2H6c-1.7 0-3-1.3-3-3z"/><path d="M21.5 4v10.5a5 5 0 0 1-5 5H14"/>'),
    "jadwal": ("Jadwal", '<rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17"/><path d="M8 3v5M16 3v5"/><path d="M8 14h2M14 14h2M8 17h2"/>'),
    "ulasan": ("Ulasan", '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"/>'),
    "info": ("Info", '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.2"/>'),
    "galeri": ("Galeri", '<path d="M3.5 8.5h3.2l1.6-2.5h7.4l1.6 2.5h3.2v11h-17z"/><circle cx="12" cy="13.8" r="3.4"/>'),
}

KANVAS = """<div class="kanvas kotak" data-nama="07-sorotan-{kunci}">
  <div class="segi"></div>
  <svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">{svg}</svg>
  <i class="tanda"></i>
</div>
"""

HALAMAN = """<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Template 07: Cover Sorotan (1080x1080)</title>
<link rel="stylesheet" href="_dasar.css">
<style>
  /* Instagram memotong sampul sorotan menjadi lingkaran. Isi penting berada di lingkaran tengah 760 px. */
  body { grid-template-columns: repeat(3, 1080px); }
  .kanvas { background: var(--navy); }
  .segi { width: 560px; height: 560px; left: 260px; top: 260px; background: var(--putih); opacity: .07; }
  .ikon { position: absolute; left: 50%; top: 50%; width: 420px; height: 420px; transform: translate(-50%, -50%); fill: none; stroke: var(--putih); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  .tanda { position: absolute; right: 290px; top: 250px; width: 72px; height: 72px; color: var(--ukir); transform: rotate(-20deg); }
</style>
</head>
<body>
{isi}</body>
</html>
"""

if __name__ == "__main__":
    folder = ROOT / "grafis" / "ikon"
    folder.mkdir(parents=True, exist_ok=True)
    for kunci, (nama, svg) in IKON.items():
        (folder / f"ikon-{kunci}.svg").write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" '
            'stroke="#203149" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
            f"<title>Ikon {nama}</title>{svg}</svg>\n"
        )
    isi = "".join(KANVAS.format(kunci=k, svg=v[1]) for k, v in IKON.items())
    (ROOT / "sosial" / "template" / "07-cover-sorotan.html").write_text(HALAMAN.replace("{isi}", isi))
    print("✓", len(IKON), "ikon dan 07-cover-sorotan.html")
