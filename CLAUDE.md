# Fantasea Dive Travel: aturan proyek

Website dive travel Fantasea (Raja Ampat) dan identitas mereknya. Pemilik (Yud) berbahasa Indonesia: dokumentasi, komentar kode, dan panel pengelola dalam bahasa Indonesia. Situs tamu dua bahasa, Inggris (bawaan, `/en`) dan Indonesia (`/id`).

Kerangka mengikuti DAMPIER (`yudventure/dampier_system`), atas permintaan pemilik November 2026: Next.js App Router + TypeScript + Tailwind, data JSON di folder data server, sesi bertanda tangan, panel `/admin`. Tampilan beranda mengikuti referensi desain pemilik (hero kartu foto mengipas dengan gelembung tag, kartu bertumpuk yang bisa digeser, galeri besar) dengan warna dan huruf dari `brand/`.

## Perintah

- `npm run dev` · `npm run typecheck` · `npm run cek:tanda` · `npm run build` · `npm run serve` (server.js, meniru Hostinger).
- Sebelum push jalankan `npm run cek` (cek tipe, tanda baca, build). CI menjalankan hal yang sama, lalu menggabungkan ke `main` dan men-deploy ke Hostinger (bagian Deploy).
- Setelah kode situs berubah, buat ulang ZIP Hostinger: `python3 scripts/buat_zip_hostinger.py`.

## Struktur

- `app/(site)/[locale]/` situs tamu (root layout sendiri, `force-dynamic`, jadi simpanan panel langsung tayang). `page.tsx` beranda, `trip/[slug]` detail trip dengan formulir permintaan.
- `app/(admin)/admin/` panel pengelola (root layout sendiri, selalu bahasa Indonesia). UI di `components/admin/`.
- `app/api/` route: `permintaan` (POST tamu, GET/PUT/DELETE panel), `konten`, `unggah`, `masuk`, `keluar`, `sesi`, `penyiapan`, `akun`, `health`. Foto unggahan disajikan `app/unggahan/[nama]`.
- `lib/konten.ts` bentuk isi situs (`Konten`) dan `normalkanKonten` yang merapikan apa pun dari panel. `data/bawaan.ts` isi bawaan. `lib/server/` gudang JSON, sesi, akun, permintaan, unggahan.
- `messages/en.json`, `messages/id.json` hanya label tetap antarmuka. Kunci baru wajib di kedua berkas.
- `middleware.ts` mengantar alamat tanpa kode bahasa ke bahasa pengunjung (cookie `fantasea_bahasa`).
- `brand/` identitas merek, ZIP paket aset di `brand/ekspor/`. `hostinger/` panduan deploy, file impor env hPanel, ZIP situs.

## Isi dari panel

- **Semua yang tampil di situs tamu bisa diubah dari panel**, kecuali label tetap tombol dan formulir di `messages/`. Isi baru ditambahkan ke `Konten`, `normalkanKonten`, `data/bawaan.ts`, dan editor panel sekaligus.
- Teks dua bahasa `{ en, id }`. Yang kosong jatuh ke bahasa Inggris lalu Indonesia (`tx`).
- Judul bagian memakai `*kata berwarna*` dan baris baru (`components/Judul.tsx`).
- Trip, jadwal, dan titik selam bawaan bertanda `contoh: true`. Tanda itu hilang saat item diubah di panel, dan Ringkasan panel mengingatkan isi contoh yang masih tampil. Jangan menulis harga, jadwal, atau klaim bisnis baru di kode. Ulasan tidak boleh dikarang, bawaannya kosong.
- Foto bawaan `public/brand/foto` adalah ilustrasi AI dari proyek lain milik pemilik (Zanclus, Dragonet), bukan dokumentasi Fantasea.

## Gaya (wajib, juga di panel)

- Tanpa titik dua, titik koma, dan tanda pisah panjang di teks yang tampil. Boleh jam (07:00), rasio (4:5), alamat (https://), dan rentang rapat (12–15 Dec). Pesan WhatsApp juga. `npm run cek:tanda` memeriksanya, dan kolom panel memperingatkan pemilik.
- Tanpa garis datar pemisah (`<hr>`, `border-t`/`border-b` sebagai pemisah, `divide-y`). Bingkai kartu dan kolom isian boleh.
- Kartu yang sendirian di barisnya melebar penuh, dua kartu di baris terakhir kisi tiga kolom dibagi rata (`lib/kisi.ts`).
- Satu butir memakai nomor atau ikon, tidak keduanya. Tanpa hiasan garis putus-putus berpanah. Tanpa warna krem keabuan.
- Pilihan memakai `components/Dropdown.tsx` dan tanggal memakai `components/DatePicker.tsx`, bukan `<select>` atau `<input type="date">` bawaan.

## Merek

- Warna hanya dari `tailwind.config.ts` (sama dengan `brand/token/tokens.json`). Koral Senja hanya untuk ajakan pesan dan harga, teks di atasnya navy.
- Judul `font-display` (Londrina Solid), label `.aksen` (Gochi Hand kapital berjarak), isi `font-body` (Nunito).
- Header memakai logo utama lengkap, tidak dipisah (permintaan pemilik, November 2026). Di puncak halaman header tanpa latar dan logonya sedang (sekitar 105 px lebar, bukan lebih besar), begitu digulir latarnya putih tembus pandang dan logonya mengecil (`components/Header.tsx`). Tanpa tombol Pesan trip di pojok kanan atas, tombol pesan ada di menu ponsel, hero, dan halaman trip. Latar dan blurnya di lapisan anak `absolute inset-0`, bukan di `<header>`. Logo latar gelap di footer.
- Hero beranda selalu tepat satu layar di semua ukuran, bagian berikutnya tidak mengintip (`min-h` 100svh, judul dan kartu ikut tinggi layar). Judul hero dua baris, baris baru dari panel tetap baris baru dan tiap baris tidak patah (lebar 26ch, ukuran huruf ikut lebar dan tinggi layar). Kartu foto yang disorot pointer membesar jelas (`components/Hero.tsx`). Setelah mengubah hero, periksa di beberapa ukuran layar dari 375x667 sampai 2560x1440.

## Deploy dan environment

- Hostinger hPanel, Deployment, preset Next.js, Node 20.x, `npm run build`, output `.next`. Lewat ZIP (`hostinger/Fantasea-Website-Hostinger.zip`) atau sambungan GitHub. Panduan `hostinger/PANDUAN-HOSTINGER.md`.
- Paket build (Tailwind, PostCSS, TypeScript) sengaja di `dependencies`, supaya build tetap jalan bila Hostinger memasang mode produksi.
- Env dibaca lewat `envText()` (`lib/env.ts`): "-" sama dengan kosong, karena pemilik mengimpor semua key sekaligus dengan value "-" lalu mengisinya sendiri. Key baru wajib ditambahkan ke `hostinger/fantasea-hpanel.env`, `.env.example`, dan tabel panduan. Rahasia tidak pernah lewat chat atau repo.
- Data di `FANTASEA_DATA_DIR` atau `~/.fantasea-data`, di luar folder aplikasi.
- Merge dan deploy otomatis, seperti Dragonet (permintaan pemilik, November 2026). `.github/workflows/ci.yml` mengecek setiap push (build), menggabungkan branch selain `main` dan `wip/` ke `main` lewat PR atau merge langsung (merge), lalu memanggil `deploy.yml` yang menjalankan `scripts/hostinger-deploy.mjs` lewat API Hostinger (deploy). Butuh secret `HOSTINGER_API_TOKEN` dan variabel repo `HOSTINGER_DOMAIN` (bawaan testingwebsite.click), tanpa token deploy dilewati dengan peringatan. Pemeriksaan akhirnya `/api/health` dengan `app` bernilai `fantasea`, jadi jangan ubah jawaban health tanpa mengubah skripnya. `AUTO_MERGE=false` mematikan merge. Push hanya pekerjaan yang siap tayang, sisanya di branch `wip/`.

## Pengujian

- Dari lingkungan ini hanya Chromium Linux yang bisa dijalankan. Katakan terus terang bahwa Safari, iPhone, Android, Windows, dan Mac belum diperiksa.
