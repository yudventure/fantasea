# Deploy website Fantasea di Hostinger (Node.js)

Website ini aplikasi **Next.js 15** (framework React) dengan **Tailwind CSS**, berjalan sebagai server Node.js. Isi situs, permintaan tamu, akun panel, dan foto unggahan disimpan di folder data server, jadi tidak perlu database MySQL.

Ada dua cara memasangnya. Keduanya memakai menu **Deployment** di hPanel dengan preset Next.js.

| | A. Unggah ZIP | B. Sambungkan GitHub |
| --- | --- | --- |
| Berkas | `hostinger/Fantasea-Website-Hostinger.zip` | repo `yudventure/fantasea`, branch `main` |
| Memperbarui situs | unggah ZIP baru | otomatis setiap push ke `main` |
| Cocok untuk | percobaan pertama | pemakaian sehari-hari |

## 1. Buat aplikasi Node.js

1. hPanel, **Websites**, **Add website**, pilih **Node.js Apps**.
2. Pilih **Upload your website files**, lalu unggah `Fantasea-Website-Hostinger.zip`. Untuk cara B pilih **Import Git repository**, lalu repo `yudventure/fantasea` dan branch `main`.
3. Hubungkan domain, misalnya `fantaseadivetravel.com`.

## 2. Pengaturan build

Preset Next.js biasanya terisi sendiri. Pastikan isinya seperti ini.

| Kolom | Isi |
| --- | --- |
| Preset framework | **Next.js** |
| Versi Node | **20.x** (22.x juga bisa) |
| Root directory | `./` |
| Package manager | `npm` |
| Build command | `npm run build` |
| Direktori output | `.next` |
| Start command (bila diminta) | `npm start` |
| Entry file (bila diminta) | `server.js` |

Semua paket yang dibutuhkan saat build (Tailwind, PostCSS, TypeScript) ada di `dependencies`, jadi build tetap jalan walau Hostinger memasang paket dalam mode produksi.

## 3. Variabel environment

Buka **Variabel environment** di pengaturan deployment, tekan **Impor .env**, pilih `hostinger/fantasea-hpanel.env`, lalu ganti value "-" sesuai tabel. Value "-" dibaca sama dengan kosong, jadi key yang belum diisi aman.

| Key | Isi | Wajib |
| --- | --- | --- |
| `SITE_URL` | alamat situs lengkap, mis. `https://fantaseadivetravel.com` | ya, untuk sitemap dan pratinjau tautan |
| `FANTASEA_KUNCI` | kunci penyiapan buatan Anda sendiri, panjang dan acak | ya, sekali untuk membuat akun pemilik |
| `FANTASEA_DATA_DIR` | biarkan "-" | tidak. Kosong berarti `~/.fantasea-data` di folder home hosting |

Kunci penyiapan bukan kata sandi masuk dan jangan dikirim lewat chat. Setelah mengubah variabel, tekan **Deploy ulang** supaya aplikasi memakai nilai baru.

## 4. Deploy dan cek

1. Tekan **Deploy**. Hostinger menjalankan `npm install` lalu `npm run build`, sekitar 2 sampai 4 menit.
2. Buka `https://domainanda.com/api/health`. Jawaban `"status":"ok"` dan `"data":"ok"` berarti aplikasi jalan dan folder data bisa ditulis.
3. Buka `https://domainanda.com`. Pengunjung diantar ke `/en` atau `/id` sesuai bahasa perambannya.

## 5. Siapkan akun pemilik

1. Buka `https://domainanda.com/admin`.
2. Karena belum ada akun, tampil **Siapkan akun pemilik**. Isi kunci penyiapan (nilai `FANTASEA_KUNCI`), nama, email, dan kata sandi paling sedikit 10 huruf.
3. Setelah masuk, buka **Ringkasan**. Daftar **Yang perlu dilengkapi sebelum promosi** menunjukkan isi contoh yang masih tampil, misalnya nomor WhatsApp, trip, harga, jadwal, titik selam, dan foto ilustrasi.
4. Anggota tim ditambahkan dari menu **Akun**.

## Data di server

Semua data ada di satu folder, bawaannya `~/.fantasea-data` di luar folder aplikasi, jadi deploy ulang dan unggah ZIP baru tidak menghapusnya.

| Berkas | Isi |
| --- | --- |
| `konten.json` | semua isi situs dari panel |
| `permintaan.json` | permintaan pesan dari tamu |
| `akun.json` | akun panel (kata sandi ter-hash) |
| `rahasia.txt` | kunci penanda tangan sesi, dibuat sendiri |
| `unggahan/` | foto yang diunggah dari panel |

Cadangkan folder ini sesekali lewat File Manager hPanel (unduh sebagai ZIP).

## Kalau bermasalah

| Gejala | Penyebab dan jalan keluar |
| --- | --- |
| Build gagal di `npm install` | pastikan versi Node 20.x atau 22.x |
| `/api/health` menjawab `"data":"tidak bisa ditulis"` | isi `FANTASEA_DATA_DIR` dengan folder yang bisa ditulis, mis. `/home/u123456789/fantasea-data`, lalu deploy ulang |
| Panel menampilkan "Isi dulu FANTASEA_KUNCI di hPanel" | kunci belum diisi atau masih "-". Isi, lalu deploy ulang |
| Sitemap berisi localhost | `SITE_URL` belum diisi |
| Lupa kata sandi pemilik | hapus `akun.json` di folder data lewat File Manager, lalu siapkan akun pemilik lagi dengan kunci penyiapan. Isi situs tidak ikut terhapus |

## Membuat ulang ZIP

Dari folder repo, setelah kode berubah:

```bash
python3 scripts/buat_zip_hostinger.py
```

ZIP berisi kode sumber saja (tanpa `node_modules`, `.next`, dan folder `brand/`). Hostinger memasang paket dan membangun sendiri.
