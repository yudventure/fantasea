import type { Konten } from "./konten";

/**
 * Tanda yang tidak dipakai di teks situs (CLAUDE.md, Gaya): titik dua,
 * titik koma, tanda pisah panjang, dan tanda pisah berspasi. Jam (07:00) dan
 * alamat (https://) boleh. Dipakai peringatan per kolom dan kotak ringkasan
 * di atas halaman panel (pola DAMPIER, temuanTandaBaca).
 */
const TERLARANG = /[;—]|:(?!\/\/)|\s–\s/;
export const adaTandaTerlarang = (s: string) => TERLARANG.test(s.replace(/\b\d{1,2}:\d{2}\b/g, ""));

const masalah = (s: string) => {
  const t = s.replace(/\b\d{1,2}:\d{2}\b/g, "");
  return [
    /:(?!\/\/)/.test(t) && "titik dua",
    /;/.test(t) && "titik koma",
    /—|\s–\s/.test(t) && "tanda pisah",
  ].filter(Boolean) as string[];
};

const NAMA_BAGIAN: Record<string, string> = {
  situs: "Kontak dan SEO", menu: "Menu", hero: "Hero", jelajah: "Bagian homestay", gerbang: "Galeri", bagian: "Judul bagian",
  ajakan: "Ajakan", liveaboard: "Liveaboard", footer: "Footer", trip: "Trip", jadwal: "Jadwal", homestay: "Homestay", titik: "Titik selam",
  ulasan: "Ulasan", faq: "FAQ", halamanTrip: "Halaman Trip", halamanHomestay: "Halaman Homestay",
};
const NAMA_KOLOM: Record<string, string> = {
  judul: "judul", lead: "kalimat", label: "label", ringkas: "ringkasan", deskripsi: "deskripsi", nama: "nama", tombol: "tombol",
  tombol1: "tombol pertama", tombol2: "tombol kedua", keterangan: "keterangan", isi: "isi", tanya: "pertanyaan", jawab: "jawaban",
  teks: "teks", lokasi: "lokasi", fasilitas: "fasilitas", termasuk: "termasuk", belum: "belum termasuk", durasi: "durasi", level: "level",
  sorotan: "sorotan", wilayah: "wilayah", arus: "arus", catatan: "catatan", tentang: "tentang", alamat: "alamat", butir: "butir",
  kepala: "pembuka", edukasi: "edukasi", seo: "Google", kontak: "kontak", asal: "asal",
};
const LEWATI = new Set(["foto", "slug", "id", "warna", "tripId", "mulai", "selesai", "peta", "video", "instagram", "facebook", "tiktok", "youtube", "email", "whatsapp", "versiKontak", "tag", "kedalaman"]);

/** Nama item daftar untuk letak, mis. nama trip, kalau ada. */
function namaItem(v: unknown): string {
  if (!v || typeof v !== "object") return "";
  const o = v as Record<string, unknown>;
  const n = o.nama ?? o.judul ?? o.tanya;
  if (typeof n === "string") return n;
  if (n && typeof n === "object") { const t = n as Record<string, unknown>; return String(t.id || t.en || ""); }
  return "";
}

export interface TemuanTanda { kunci: keyof Konten; letak: string; masalah: string[] }

/** Semua isian teks di isi situs yang memakai tanda terlarang, dengan letaknya. */
export function temuanTandaBaca(k: Konten): TemuanTanda[] {
  const hasil: TemuanTanda[] = [];
  let akar: keyof Konten = "situs";
  const telusur = (v: unknown, jalur: string[]) => {
    if (typeof v === "string") {
      const m = masalah(v);
      if (m.length) hasil.push({ kunci: akar, letak: jalur.join(", "), masalah: m });
      return;
    }
    if (Array.isArray(v)) { v.forEach((x, i) => telusur(x, typeof x === "string" ? jalur : [...jalur, namaItem(x) || `nomor ${i + 1}`])); return; }
    if (v && typeof v === "object") {
      for (const [kunci, isi] of Object.entries(v as Record<string, unknown>)) {
        if (LEWATI.has(kunci)) continue;
        const nama = kunci === "en" ? "(EN)" : kunci === "id" ? "(ID)" : jalur.length === 0 ? NAMA_BAGIAN[kunci] ?? kunci : NAMA_KOLOM[kunci] ?? kunci;
        telusur(isi, kunci === "en" || kunci === "id" ? [...jalur.slice(0, -1), `${jalur[jalur.length - 1] ?? ""} ${nama}`.trim()] : [...jalur, nama]);
      }
    }
  };
  for (const kunci of Object.keys(k) as (keyof Konten)[]) { akar = kunci; telusur({ [kunci]: k[kunci] }, []); }
  return hasil;
}
