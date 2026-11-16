import {
  MAKS_BUTIR, MAKS_BUTIR_DAFTAR, MAKS_DESKRIPSI_HOMESTAY, MAKS_FOTO_TRIP, MAKS_PERJALANAN, MAKS_RINGKAS_HOMESTAY,
  fotoSah, slugDari, type DaftarTeks, type Homestay, type Teks,
} from "./konten";
import { adaTandaTerlarang } from "./tanda-panel";

/**
 * Homestay dari berkas .md (permintaan pemilik, November 2026, "buatkan fitur
 * untuk bisa upload dengan file md"). Bentuknya meniru Isi dari berkas .md di
 * DAMPIER, tapi dua bahasa situs Fantasea (Inggris dan Indonesia).
 *
 *   ---
 *   nama: Corepen Dive Homestay
 *   alamat halaman: corepen
 *   lokasi: Gam Island
 *   lokasi indonesia: Pulau Gam
 *   harga: 72
 *   mata uang: USD
 *   harga untuk: 2
 *   kapasitas: 14
 *   ---
 *
 *   <!-- Catatan tim, tidak ikut ke situs. -->
 *
 *   ## Deskripsi Inggris
 *   ## Deskripsi Indonesia
 *   ## Kamar Inggris
 *   - Enam bungalow ...
 *
 * Bagian dan kunci yang tidak ditulis tidak mengubah isian panel, jadi berkas
 * boleh hanya memuat sebagian. Berkas di konten/homestay/ memakai bentuk ini.
 */

type KolomTeks = "ringkas" | "deskripsi" | "perjalanan";
type KolomDaftar = "kamar" | "termasuk" | "fasilitas" | "kegiatan" | "catatan";
type Bahasa = "en" | "id";

/** Urutan bagian di berkas, judulnya, dan kolom Homestay-nya. */
export const BAGIAN_MD: { kolom: KolomTeks | KolomDaftar; judul: string; daftar: boolean; maks: number }[] = [
  { kolom: "ringkas", judul: "Ringkas", daftar: false, maks: MAKS_RINGKAS_HOMESTAY },
  { kolom: "deskripsi", judul: "Deskripsi", daftar: false, maks: MAKS_DESKRIPSI_HOMESTAY },
  { kolom: "kamar", judul: "Kamar", daftar: true, maks: MAKS_BUTIR },
  { kolom: "termasuk", judul: "Sudah termasuk", daftar: true, maks: MAKS_BUTIR },
  { kolom: "fasilitas", judul: "Fasilitas", daftar: true, maks: MAKS_BUTIR },
  { kolom: "kegiatan", judul: "Kegiatan", daftar: true, maks: MAKS_BUTIR },
  { kolom: "perjalanan", judul: "Cara ke sana", daftar: false, maks: MAKS_PERJALANAN },
  { kolom: "catatan", judul: "Perlu diketahui", daftar: true, maks: MAKS_BUTIR },
];

/** Judul lain yang juga dikenali. */
const SINONIM: Record<string, KolomTeks | KolomDaftar> = {
  ringkasan: "ringkas", "ringkasan kartu": "ringkas", "tipe kamar": "kamar", "kamar dan tempat tidur": "kamar",
  termasuk: "termasuk", fitur: "fasilitas", "fasilitas dan fitur": "fasilitas", aktivitas: "kegiatan",
  "kegiatan di sekitar": "kegiatan", perjalanan: "perjalanan", transportasi: "perjalanan", catatan: "catatan",
};
const BAHASA: Record<string, Bahasa> = { inggris: "en", english: "en", en: "en", indonesia: "id", id: "id" };
const NAMA_BAHASA: Record<Bahasa, string> = { en: "Inggris", id: "Indonesia" };

export interface BerkasHomestay {
  /** Nama dari bagian depan, untuk mencocokkan dengan homestay yang ada. */
  nama: Teks;
  slug: string;
  /** Isi tampil dari berkas, kalau ditulis. */
  tampil?: boolean;
  /** Menerapkan isi berkas ke homestay, lalu menyebut kolom yang diisi. */
  terapkan: (h: Homestay) => string[];
  peringatan: string[];
}

const rapikanKunci = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim();

/** Angka harga. Titik dan koma ribuan Indonesia dikenali (1.735 atau 1.735,50). */
export function angkaHarga(s: string): number {
  let t = s.replace(/[^\d.,]/g, "");
  if (!t) return NaN;
  if (t.includes(",") && t.includes(".")) t = t.indexOf(",") > t.indexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (t.includes(",")) t = /,\d{1,2}$/.test(t) ? t.replace(/,(?=\d{3}\b)/g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  return Number(t);
}

const yaTidak = (s: string): boolean | undefined => {
  const t = rapikanKunci(s);
  if (["ya", "yes", "true", "tampil", "1"].includes(t)) return true;
  if (["tidak", "no", "false", "sembunyi", "disembunyikan", "0"].includes(t)) return false;
  return undefined;
};

/** Paragraf dipisah baris kosong, baris di dalam paragraf disambung. */
function paragraf(baris: string[]): string[] {
  const hasil: string[] = [];
  let kini: string[] = [];
  for (const b of baris) {
    if (!b.trim()) { if (kini.length) hasil.push(kini.join(" ")); kini = []; continue; }
    kini.push(b.trim());
  }
  if (kini.length) hasil.push(kini.join(" "));
  return hasil;
}

/** Satu butir per baris bertanda (- * + atau 1.), baris lanjutan ikut butir sebelumnya. */
function butir(baris: string[]): string[] {
  const hasil: string[] = [];
  let lanjut = false;
  for (const b of baris) {
    const t = b.trim();
    if (!t) { lanjut = false; continue; }
    const m = /^(?:[-*+•]|\d+[.)])\s+(.*)$/.exec(t);
    if (m) { hasil.push(m[1].trim()); lanjut = true; }
    else if (lanjut && hasil.length) hasil[hasil.length - 1] += ` ${t}`;
    else { hasil.push(t); lanjut = true; }
  }
  return hasil.filter(Boolean);
}

export function bacaHomestayMd(isi: string): BerkasHomestay {
  const peringatan: string[] = [];
  const teksBersih = isi.replace(/^﻿/, "").replace(/\r\n?/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
  let badan = teksBersih;
  const depan: Record<string, string> = {};
  const m = /^\s*---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(teksBersih);
  if (m) {
    badan = teksBersih.slice(m[0].length);
    for (const baris of m[1].split("\n")) {
      const k = /^([^:#]+?)\s*:\s*(.*)$/.exec(baris.trim());
      if (k) depan[rapikanKunci(k[1])] = k[2].trim();
    }
  } else {
    peringatan.push("Bagian depan (di antara dua baris ---) tidak ditemukan, jadi nama, harga, dan lokasi tidak berubah.");
  }

  // Bagian ## Judul Bahasa.
  const teks: Partial<Record<KolomTeks, Partial<Teks>>> = {};
  const daftar: Partial<Record<KolomDaftar, Partial<DaftarTeks>>> = {};
  let foto: string[] | undefined;
  let judulKini = "";
  let tampung: string[] = [];
  const simpan = () => {
    if (!judulKini) {
      if (tampung.some((b) => b.trim())) peringatan.push("Ada tulisan sebelum bagian ## pertama. Tulisan itu dilewati.");
      return;
    }
    const kunci = rapikanKunci(judulKini);
    if (kunci === "foto") {
      const semua = butir(tampung);
      const sah = semua.map(fotoSah).filter(Boolean).slice(0, MAKS_FOTO_TRIP);
      if (sah.length < semua.length) peringatan.push(`${semua.length - sah.length} alamat foto dilewati. Pakai alamat /unggahan/ dari panel atau https.`);
      if (sah.length) foto = sah;
      return;
    }
    const kata = kunci.split(" ");
    const bahasa = BAHASA[kata[kata.length - 1]];
    const namaBagian = bahasa ? kata.slice(0, -1).join(" ") : kunci;
    const bagian = BAGIAN_MD.find((b) => rapikanKunci(b.judul) === namaBagian) ?? BAGIAN_MD.find((b) => b.kolom === SINONIM[namaBagian]);
    if (!bagian) { peringatan.push(`Bagian ${judulKini} tidak dikenali dan dilewati.`); return; }
    if (!bahasa) { peringatan.push(`Bagian ${judulKini} tidak menyebut bahasanya. Tulis ${bagian.judul} Inggris atau ${bagian.judul} Indonesia.`); return; }
    const label = `${bagian.judul} ${NAMA_BAHASA[bahasa]}`;
    if (bagian.daftar) {
      let isiDaftar = butir(tampung);
      if (!isiDaftar.length) return;
      if (isiDaftar.length > MAKS_BUTIR_DAFTAR) { peringatan.push(`${label} dipotong menjadi ${MAKS_BUTIR_DAFTAR} butir.`); isiDaftar = isiDaftar.slice(0, MAKS_BUTIR_DAFTAR); }
      if (isiDaftar.some((s) => s.length > bagian.maks)) peringatan.push(`Ada butir ${label} yang lebih dari ${bagian.maks} huruf dan dipotong.`);
      isiDaftar = isiDaftar.map((s) => s.slice(0, bagian.maks));
      if (isiDaftar.some(adaTandaTerlarang)) peringatan.push(`${label} memakai titik dua, titik koma, atau tanda pisah.`);
      const kolom = bagian.kolom as KolomDaftar;
      daftar[kolom] = { ...daftar[kolom], [bahasa]: isiDaftar };
    } else {
      const p = paragraf(tampung);
      if (!p.length) return;
      let nilai = bagian.kolom === "ringkas" ? p.join(" ") : p.join("\n\n");
      if (nilai.length > bagian.maks) { peringatan.push(`${label} lebih dari ${bagian.maks} huruf dan dipotong.`); nilai = nilai.slice(0, bagian.maks).trim(); }
      if (adaTandaTerlarang(nilai)) peringatan.push(`${label} memakai titik dua, titik koma, atau tanda pisah.`);
      const kolom = bagian.kolom as KolomTeks;
      teks[kolom] = { ...teks[kolom], [bahasa]: nilai };
    }
  };
  for (const baris of badan.split("\n")) {
    const j = /^#{1,3}\s+(.+?)\s*#*\s*$/.exec(baris);
    if (j) { simpan(); judulKini = j[1]; tampung = []; continue; }
    tampung.push(baris);
  }
  simpan();

  // Bagian yang hanya satu bahasa.
  for (const b of BAGIAN_MD) {
    const v = b.daftar ? daftar[b.kolom as KolomDaftar] : teks[b.kolom as KolomTeks];
    if (!v) continue;
    const ada = (["en", "id"] as Bahasa[]).filter((l) => v[l] !== undefined);
    if (ada.length === 1) peringatan.push(`${b.judul} hanya ditulis dalam bahasa ${NAMA_BAHASA[ada[0]]}.`);
  }

  // Bagian depan.
  const ambil = (...kunci: string[]) => { for (const k of kunci) if (depan[k]) return depan[k]; return undefined; };
  const namaEn = ambil("nama", "nama inggris") ?? "";
  const nama: Teks = { en: namaEn.slice(0, 120), id: (ambil("nama indonesia") ?? namaEn).slice(0, 120) };
  const slugTeks = ambil("alamat halaman", "slug", "alamat");
  const slug = slugTeks ? slugDari(slugTeks) : "";
  const lokasiEn = ambil("lokasi", "lokasi inggris");
  const lokasiId = ambil("lokasi indonesia");
  const hargaTeks = ambil("harga", "harga mulai");
  const harga = hargaTeks === undefined ? undefined : angkaHarga(hargaTeks);
  if (hargaTeks !== undefined && !(harga! >= 0)) peringatan.push(`Harga ${hargaTeks} tidak terbaca sebagai angka dan dilewati.`);
  const uangTeks = ambil("mata uang");
  const uang = uangTeks === undefined ? undefined : /usd|us\$|\$|dolar|dollar/i.test(uangTeks) ? "USD" : /idr|rp|rupiah/i.test(uangTeks) ? "IDR" : undefined;
  if (uangTeks !== undefined && !uang) peringatan.push(`Mata uang ${uangTeks} tidak dikenali. Tulis USD atau IDR.`);
  const untukTeks = ambil("harga untuk");
  const untuk = untukTeks === undefined ? undefined : Number(untukTeks.replace(/\D/g, ""));
  const kapasitasTeks = ambil("kapasitas");
  const kapasitas = kapasitasTeks === undefined ? undefined : Number(kapasitasTeks.replace(/\D/g, ""));
  const tampilTeks = ambil("tampil");
  const tampil = tampilTeks === undefined ? undefined : yaTidak(tampilTeks);
  if (tampilTeks !== undefined && tampil === undefined) peringatan.push(`Isi tampil ${tampilTeks} tidak dikenali. Tulis ya atau tidak.`);
  if (!nama.en) peringatan.push("Nama belum ditulis di bagian depan.");
  for (const [l, v] of [["Nama", nama.en], ["Nama Indonesia", nama.id], ["Lokasi", lokasiEn ?? ""], ["Lokasi Indonesia", lokasiId ?? ""]] as const) {
    if (adaTandaTerlarang(v)) peringatan.push(`${l} memakai titik dua, titik koma, atau tanda pisah.`);
  }

  function terapkan(h: Homestay): string[] {
    const diisi: string[] = [];
    if (nama.en) { h.nama = { ...nama }; diisi.push("nama"); }
    if (slug) { h.slug = slug; diisi.push("alamat halaman"); }
    if (lokasiEn !== undefined || lokasiId !== undefined) {
      h.lokasi = { en: (lokasiEn ?? h.lokasi.en).slice(0, 120), id: (lokasiId ?? h.lokasi.id).slice(0, 120) };
      diisi.push("lokasi");
    }
    if (harga !== undefined && harga >= 0) { h.hargaMulai = Math.round(Math.min(1e11, harga) * 100) / 100; diisi.push("harga"); }
    if (uang) h.mataUang = uang;
    if (untuk && untuk >= 1) h.hargaUntuk = Math.min(100, untuk);
    if (kapasitas !== undefined && kapasitas >= 0 && Number.isFinite(kapasitas)) { h.kapasitas = Math.min(10000, kapasitas); diisi.push("kapasitas"); }
    if (tampil !== undefined) h.tampil = tampil;
    for (const b of BAGIAN_MD) {
      if (b.daftar) {
        const v = daftar[b.kolom as KolomDaftar];
        if (!v) continue;
        const kolom = b.kolom as KolomDaftar;
        h[kolom] = { en: v.en ?? h[kolom].en, id: v.id ?? h[kolom].id };
      } else {
        const v = teks[b.kolom as KolomTeks];
        if (!v) continue;
        const kolom = b.kolom as KolomTeks;
        h[kolom] = { en: v.en ?? h[kolom].en, id: v.id ?? h[kolom].id };
      }
      diisi.push(b.judul.toLowerCase());
    }
    if (foto) { h.foto = foto; diisi.push("foto"); }
    delete h.contoh;
    return diisi;
  }

  return { nama, slug, tampil, terapkan, peringatan };
}

/** Homestay kosong untuk Tambah homestay dan berkas .md yang belum ada di panel. */
export function homestayKosong(id: string, slug: string): Homestay {
  const kosong = { en: "", id: "" };
  const daftarKosong = () => ({ en: [] as string[], id: [] as string[] });
  return {
    id, slug, nama: { en: "New homestay", id: "Homestay baru" }, lokasi: { ...kosong }, ringkas: { ...kosong }, deskripsi: { ...kosong },
    fasilitas: daftarKosong(), kamar: daftarKosong(), termasuk: daftarKosong(), kegiatan: daftarKosong(), perjalanan: { ...kosong }, catatan: daftarKosong(),
    hargaMulai: 0, mataUang: "IDR", hargaUntuk: 1, kapasitas: 0, foto: [], tampil: false,
  };
}

/** Homestay menjadi berkas .md, untuk Unduh .md di panel. Bisa diubah lalu diunggah lagi. */
export function homestayKeMd(h: Homestay): string {
  const kunci = (k: string, v: string | number) => [k, String(v)].join(": ");
  const depan = [
    kunci("nama", h.nama.en || h.nama.id),
    ...(h.nama.id && h.nama.id !== h.nama.en ? [kunci("nama indonesia", h.nama.id)] : []),
    kunci("alamat halaman", h.slug),
    kunci("lokasi", h.lokasi.en),
    kunci("lokasi indonesia", h.lokasi.id),
    kunci("harga", h.hargaMulai),
    kunci("mata uang", h.mataUang ?? "IDR"),
    kunci("harga untuk", h.hargaUntuk ?? 1),
    kunci("kapasitas", h.kapasitas ?? 0),
    kunci("tampil", h.tampil ? "ya" : "tidak"),
  ];
  const bagian: string[] = [];
  for (const b of BAGIAN_MD) {
    for (const l of ["en", "id"] as Bahasa[]) {
      const isi = b.daftar ? h[b.kolom as KolomDaftar][l].map((s) => `- ${s}`).join("\n") : h[b.kolom as KolomTeks][l];
      bagian.push(`## ${b.judul} ${NAMA_BAHASA[l]}\n\n${isi}`.trim());
    }
  }
  if (h.foto.length) bagian.push(`## Foto\n\n${h.foto.map((f) => `- ${f}`).join("\n")}`);
  return [
    "---", ...depan, "---", "",
    "<!-- Diunduh dari panel Fantasea. Ubah isinya, lalu unggah lagi di Homestay, Isi dari berkas .md. Bagian yang dihapus tidak mengubah isian panel. -->",
    "", bagian.join("\n\n"), "",
  ].join("\n");
}

/** Contoh berkas untuk Unduh contoh .md. Teksnya petunjuk, bukan isi homestay. */
export function contohHomestayMd(): string {
  const h = homestayKosong("contoh", "nama-homestay");
  h.nama = { en: "Nama Homestay", id: "Nama Homestay" };
  h.lokasi = { en: "Gam Island", id: "Pulau Gam" };
  h.hargaMulai = 72; h.mataUang = "USD"; h.hargaUntuk = 2; h.kapasitas = 12; h.tampil = true;
  h.ringkas = { en: "One sentence for the homestay card, up to 300 characters.", id: "Satu kalimat untuk kartu homestay, paling panjang 300 huruf." };
  h.deskripsi = { en: "First paragraph about the place.\n\nSecond paragraph. Separate paragraphs with one empty line.", id: "Paragraf pertama tentang tempatnya.\n\nParagraf kedua. Pisahkan paragraf dengan satu baris kosong." };
  h.kamar = { en: ["Six beach bungalows, each with a double bed and mosquito net"], id: ["Enam bungalow tepi pantai, masing-masing dengan kasur ganda dan kelambu"] };
  h.termasuk = { en: ["Three meals a day", "Drinking water, tea, and coffee"], id: ["Makan tiga kali sehari", "Air minum, teh, dan kopi"] };
  h.fasilitas = { en: ["Shared bathroom with western toilet", "Electricity from sunset to midnight"], id: ["Kamar mandi bersama dengan kloset duduk", "Listrik dari senja sampai tengah malam"] };
  h.kegiatan = { en: ["Snorkelling on the house reef"], id: ["Snorkeling di karang depan homestay"] };
  h.perjalanan = { en: "Boat transfer from Waisai, arranged by our team.", id: "Antar jemput perahu dari Waisai, diatur tim kami." };
  h.catatan = { en: ["Bring cash in rupiah"], id: ["Bawa uang tunai rupiah"] };
  return homestayKeMd(h).replace(
    /<!--[\s\S]*?-->/,
    [
      "<!--",
      "Contoh berkas homestay Fantasea. Satu berkas untuk satu homestay.",
      "Homestay dicocokkan dari alamat halaman, lalu dari nama. Yang belum ada ditambahkan dan disembunyikan dulu.",
      "Bagian yang tidak ditulis tidak mengubah isian panel. Hindari titik dua, titik koma, dan tanda pisah panjang di teks yang tampil.",
      "Catatan untuk tim boleh ditulis di dalam tanda komentar seperti ini, tidak ikut ke situs.",
      "-->",
    ].join("\n"),
  );
}
