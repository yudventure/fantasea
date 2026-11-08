# Fantasea Dive Travel

Website dan identitas merek **Fantasea Dive Travel**, penyelenggara trip selam dan snorkeling di Raja Ampat.

## Website

Next.js 15 (framework React) + TypeScript + Tailwind CSS, dengan kerangka DAMPIER: data tersimpan sebagai berkas JSON di folder data server (tanpa database), panel pengelola di `/admin`, situs tamu dua bahasa di `/en` dan `/id`.

| Halaman | Isi |
| --- | --- |
| `/en`, `/id` | Beranda: hero kartu foto mengipas, kartu bertumpuk, galeri besar, trip, jadwal open trip, titik selam, ulasan, FAQ |
| `/en/trip/<alamat>` | Detail trip, galeri, yang termasuk, tanggal open trip, formulir permintaan yang diteruskan ke WhatsApp |
| `/admin` | Panel pengelola: ringkasan, permintaan tamu, trip dan harga, jadwal, titik selam, semua teks dan foto beranda, ulasan dan FAQ, kontak dan SEO, akun tim |
| `/api/health` | Cek deploy |

```bash
npm install
```

```bash
npm run dev
```

**Deploy ke Hostinger:** unggah `hostinger/Fantasea-Website-Hostinger.zip` di hPanel (Node.js Apps, preset Next.js), impor `hostinger/fantasea-hpanel.env`, lalu ikuti [hostinger/PANDUAN-HOSTINGER.md](./hostinger/PANDUAN-HOSTINGER.md). Aturan proyek untuk agen ada di [CLAUDE.md](./CLAUDE.md).

## Identitas merek

Isinya logo dalam berbagai versi (PNG dan vektor), warna, huruf, token website, elemen grafis, template media sosial, dan buku pedoman merek.

> **Live the Fantasea.**
> *Laut nyata, melampaui khayalan.*

Buka `brand/pedoman-merek.html` di browser untuk melihat semuanya dalam satu halaman, atau kirim `brand/pedoman-merek.pdf` (A4 lanskap).

## Paket aset siap kirim

**`brand/ekspor/Fantasea-Dive-Travel-Brand-Kit.zip`** berisi semua aset, satu folder untuk setiap item. Kirim berkas ini ke klien, percetakan, atau desainer.

| Folder di dalam ZIP | Isi |
| --- | --- |
| `00-BACA-DULU.txt` | Panduan singkat isi paket, warna, dan aturan logo |
| `01-pedoman-merek` | Buku pedoman merek (PDF) |
| `02-logo-utama` | Logo lengkap dalam PNG dan SVG (utama, latar gelap, navy, putih) dan JPG latar putih |
| `03-tanda-manta` | Manta tanpa tulisan dalam PNG dan SVG |
| `04-logo-asli` | Gambar logo asli |
| `05-favikon-dan-ikon-web` | Favikon dan ikon aplikasi |
| `06-warna` | Palet PNG dan TXT, swatch Adobe (`.ase`) dan GIMP/Inkscape (`.gpl`) |
| `07-font` | TTF untuk komputer beserta lisensinya |
| `08-elemen-grafis` | Garis Ekor, Tanda Arah, Pulau Segi, Ukir Sayap, Pola Jalur dalam SVG dan PNG |
| `09-ikon` | Ikon garis navy dan putih dalam SVG dan PNG |
| `10-media-sosial` | Foto profil, template feed, story, dan cover sorotan |
| `11-website` | `tokens.css`, `tokens.json`, dan font web |

## Isi folder `brand/`

| Berkas | Isi |
| --- | --- |
| `ekspor/` | Paket aset ZIP siap kirim (lihat di atas) |
| `warna/` | Palet warna PNG dan TXT, swatch `.ase` dan `.gpl` |
| `pedoman-merek.html` / `.pdf` | Buku pedoman: esensi, ide Jalur Manta, logo, warna, tipografi, elemen grafis, fotografi, suara, media sosial, website, penerapan |
| `logo/` | Logo asli, PNG transparan (utama, latar gelap, satu warna navy, satu warna putih), tanda manta tanpa tulisan, foto profil 1080 px |
| `logo/svg/` | Delapan versi logo dan tanda manta dalam vektor, untuk percetakan dan desainer |
| `logo/web/` | Favikon 16/32/48, `favicon.ico`, `apple-touch-icon.png`, ikon aplikasi 192/512 dan maskable |
| `font/` | Londrina Solid, Gochi Hand, Nunito. `desktop/` berisi TTF untuk komputer, `web/` berisi woff2 dan `fonts.css`. Lisensi SIL OFL 1.1 |
| `token/` | `tokens.css` (variabel warna, huruf, jarak, tombol, kartu trip) dan `tokens.json` |
| `grafis/` | Garis Ekor, Tanda Arah, Pulau Segi, Ukir Sayap, Pola Jalur, dan ikon garis (SVG) |
| `sosial/template/` | Sumber template media sosial (HTML) |
| `sosial/ekspor/` | Template siap unggah (PNG): perkenalan, paket trip, titik selam, jadwal open trip, kata tamu, story slot terakhir, enam cover sorotan |
| `scripts/` | Skrip untuk membuat ulang versi logo, SVG, ikon, dan PDF |

## Ringkasan cepat

**Ide besar: Jalur Manta.** Ekor manta di logo turun menjadi huruf T. Ekor itu menjadi Garis Ekor, garis rute setiap trip. Segitiga kecil di logo menjadi Tanda Arah untuk setiap perhentian, bidang bersegi menjadi Pulau Segi, dan pola ukir di sayap menjadi Ukir Sayap.

| Warna | HEX | Peran |
| --- | --- | --- |
| Navy Manta | `#203149` | Teks utama, tulisan logo, latar gelap |
| Biru Ukir | `#30A6DE` | Aksen khas. Tidak untuk teks di atas putih |
| Biru Tanda | `#1264A8` | Tanda Arah, tautan, tombol biru |
| Kabut Karang | `#C3D6E2` | Pulau Segi, latar lembut |
| Putih Buih | `#FFFFFF` | Latar utama |
| Laut Malam | `#131F33` | Latar paling gelap |
| Buih | `#EEF5F9` | Latar panel |
| Koral Senja | `#FF8A5C` | Hanya tombol pesan, harga, sisa kursi. Teks di atasnya navy |

Lima warna pertama dibaca langsung dari logo (sRGB). Tiga terakhir adalah pendamping.

**Huruf** (gratis di Google Fonts): Londrina Solid untuk judul, Gochi Hand untuk label aksen kapital berjarak (seperti DIVE TRAVEL di logo), Nunito untuk teks isi.

**Tagar utama:** `#LiveTheFantasea`

## Membuat ulang berkas

Butuh Python 3 (`pip install pillow numpy scipy potracer`) dan Node.js dengan Playwright (Chromium).

```bash
python3 brand/scripts/urai_logo.py
```

```bash
python3 brand/scripts/buat_logo.py
```

```bash
python3 brand/scripts/vektor_logo.py
```

```bash
node brand/sosial/render.js
```

```bash
node brand/scripts/buat_pdf.js
```

```bash
node brand/scripts/buat_png_grafis.js
```

```bash
python3 brand/scripts/buat_zip.py
```

Jalankan `buat_zip.py` paling akhir setiap kali ada aset yang berubah, supaya ZIP selalu berisi versi terbaru.

`urai_logo.py` memecah logo asli menjadi bobot per warna merek, lalu `buat_logo.py` dan `vektor_logo.py` mewarnai ulang dan menjiplaknya. `render.js` memakai font dari `brand/font/web` sehingga tidak butuh internet; `buat_pdf.js` memuat Google Fonts. Untuk satu template saja, beri awalan nama berkas, misalnya `node brand/sosial/render.js 02`.

## Catatan penting

- Harga, tanggal, kuota, dan data titik selam di template adalah **contoh tata letak**. Ganti dengan data asli dan minta pemandu mengecek data titik selam.
- Wilayah operasi diasumsikan Raja Ampat (Sorong, Waisai, Selat Dampier). Ubah teks pedoman bila berbeda.
- Handle `@fantaseadivetravel`, domain `fantaseadivetravel.com`, dan nomor `+62 8XX-XXXX-XXXX` masih usulan dan isian kosong. Nama "Fantasea" juga dipakai beberapa dive center di luar negeri (Mesir, Bermuda), jadi cek ketersediaan handle lebih dulu.
- Semua PNG dan SVG diturunkan dari logo 2000 px. SVG adalah jiplakan rapi, bukan file kerja desainer. Bila ada file vektor asli, pakai itu untuk cetak sangat besar.
- Tanda manta tanpa tulisan, Garis Ekor, Tanda Arah, Pulau Segi, dan Pola Jalur adalah turunan baru dari logo. Logo asli tidak diubah.
