# Fantasea Dive Travel

Identitas merek **Fantasea Dive Travel**, penyelenggara trip selam dan snorkeling di Raja Ampat. Isinya logo dalam berbagai versi (PNG dan vektor), warna, huruf, token website, elemen grafis, template media sosial, dan buku pedoman merek.

> **Live the Fantasea.**
> *Laut nyata, melampaui khayalan.*

Buka `brand/pedoman-merek.html` di browser untuk melihat semuanya dalam satu halaman, atau kirim `brand/pedoman-merek.pdf` (A4 lanskap, 28 halaman).

## Isi folder `brand/`

| Berkas | Isi |
| --- | --- |
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

`urai_logo.py` memecah logo asli menjadi bobot per warna merek, lalu `buat_logo.py` dan `vektor_logo.py` mewarnai ulang dan menjiplaknya. `render.js` memakai font dari `brand/font/web` sehingga tidak butuh internet; `buat_pdf.js` memuat Google Fonts. Untuk satu template saja, beri awalan nama berkas, misalnya `node brand/sosial/render.js 02`.

## Catatan penting

- Harga, tanggal, kuota, dan data titik selam di template adalah **contoh tata letak**. Ganti dengan data asli dan minta pemandu mengecek data titik selam.
- Wilayah operasi diasumsikan Raja Ampat (Sorong, Waisai, Selat Dampier). Ubah teks pedoman bila berbeda.
- Handle `@fantaseadivetravel`, domain `fantaseadivetravel.com`, dan nomor `+62 8XX-XXXX-XXXX` masih usulan dan isian kosong. Nama "Fantasea" juga dipakai beberapa dive center di luar negeri (Mesir, Bermuda), jadi cek ketersediaan handle lebih dulu.
- Semua PNG dan SVG diturunkan dari logo 2000 px. SVG adalah jiplakan rapi, bukan file kerja desainer. Bila ada file vektor asli, pakai itu untuk cetak sangat besar.
- Tanda manta tanpa tulisan, Garis Ekor, Tanda Arah, Pulau Segi, dan Pola Jalur adalah turunan baru dari logo. Logo asli tidak diubah.
