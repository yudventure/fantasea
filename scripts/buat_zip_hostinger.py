"""Mengemas website Fantasea menjadi ZIP siap unggah ke Hostinger (Node.js Apps).

Isinya kode sumber Next.js di akar ZIP (package.json langsung di dalam, bukan di
subfolder), tanpa node_modules, .next, data lokal, dan brand kit. Hostinger
menjalankan npm install dan npm run build sendiri.

Pakai: python3 scripts/buat_zip_hostinger.py
Hasil: hostinger/Fantasea-Website-Hostinger.zip
"""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

AKAR = Path(__file__).resolve().parents[1]
OUT = AKAR / "hostinger" / "Fantasea-Website-Hostinger.zip"

BERKAS = [
    "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "tailwind.config.ts",
    "postcss.config.mjs", "next-env.d.ts", "middleware.ts", "server.js", ".nvmrc", ".env.example",
    "scripts/cek-tanda-baca.mjs",
]
FOLDER = ["app", "components", "lib", "data", "messages", "public"]
LEWATI = {".DS_Store", "Thumbs.db"}

if __name__ == "__main__":
    OUT.parent.mkdir(exist_ok=True)
    daftar: list[Path] = [AKAR / b for b in BERKAS]
    for f in FOLDER:
        daftar += sorted(p for p in (AKAR / f).rglob("*") if p.is_file() and p.name not in LEWATI)
    with ZipFile(OUT, "w", ZIP_DEFLATED, compresslevel=9) as z:
        for p in daftar:
            if not p.exists():
                raise SystemExit(f"Berkas tidak ada: {p.relative_to(AKAR)}")
            z.write(p, p.relative_to(AKAR).as_posix())
        z.write(AKAR / "hostinger" / "PANDUAN-HOSTINGER.md", "PANDUAN-HOSTINGER.md")
    print(f"✓ {OUT.relative_to(AKAR)}  ({len(daftar) + 1} berkas, {OUT.stat().st_size / 1e6:.1f} MB)")
