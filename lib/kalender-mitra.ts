import { geser } from "./tanggal";

/**
 * Kalender mitra homestay (pola DAMPIER, data/kalender-mitra.ts dan
 * lib/kamar-mitra.ts). Permintaan pemilik, November 2026: "kalender mitra
 * dan lain lain dibuat sama dulu". Pemilik homestay membuka kalendernya
 * lewat tautan rahasia /kalender/<kunci>, mencatat pesanan dari tempat lain
 * dan tanggal tutup, dan melihat pesanan Fantasea. Berkas ini murni, dipakai
 * halaman mitra, panel, dan server.
 */

export type SumberKalender = "ota" | "langsung" | "tutup";
export interface MetaSumber { value: SumberKalender; label: string; pendek: string; ket: string; warna: string; teks: string }

/** Warna dari token merek. Tutup memakai abu tinta, tamu langsung Kabut Karang. */
export const SUMBER_KALENDER: MetaSumber[] = [
  { value: "ota", label: "Booking.com atau OTA lain", pendek: "OTA", ket: "Pesanan dari Booking.com, Stay Raja Ampat, Airbnb, atau situs pemesanan lain.", warna: "#30A6DE", teks: "#203149" },
  { value: "langsung", label: "Tamu langsung", pendek: "Langsung", ket: "Tamu yang memesan lewat telepon, WhatsApp, atau datang langsung.", warna: "#C3D6E2", teks: "#203149" },
  { value: "tutup", label: "Tutup", pendek: "Tutup", ket: "Kamar tidak bisa dipesan, misalnya diperbaiki atau dipakai keluarga.", warna: "#55657A", teks: "#FFFFFF" },
];
export const metaSumber = (s: SumberKalender) => SUMBER_KALENDER.find((x) => x.value === s)!;
export const WARNA_FANTASEA = { warna: "#1264A8", teks: "#FFFFFF" };
/** Pesanan Fantasea yang belum dikonfirmasi, bergaris seperti "sedang diproses" di DAMPIER. */
export const POLA_PROSES = "repeating-linear-gradient(135deg, #1264A8 0 2px, #C3D6E2 2px 5px)";

export const MAKS_MALAM = 90;
export const MAKS_ENTRI = 600;
export const MAKS_KAMAR = 50;
export const TOKEN_KALENDER = /^[A-Za-z0-9_-]{32,64}$/;
export const ID_KIRIM = /^[a-f0-9]{12}$/;

export interface EntriKalender {
  id: string;
  /** Tanggal datang. */
  mulai: string;
  /** Tanggal pulang. Malam yang terpakai mulai..selesai-1. */
  selesai: string;
  kamar: number;
  /** Kamar 1..N yang dipakai, kalau homestay punya lebih dari satu kamar. */
  nomorKamar?: number[];
  sumber: SumberKalender;
  nama?: string;
  tamu?: number;
  catatan?: string;
  dibuat: string;
  diubah?: string;
}

/** Permintaan menginap dari Fantasea, hanya dibaca di halaman mitra. Nama tamu hanya untuk yang dikonfirmasi. */
export interface PesananFantasea { kunci: string; kode: string; nama?: string; mulai: string; selesai: string; kamar: number; orang: number; pasti: boolean }
export interface TandaHadir { masuk?: string; keluar?: string }

export interface DataKalenderMitra {
  homestay: { id: string; nama: string; lokasi: string };
  kamar: number;
  entri: EntriKalender[];
  fantasea: PesananFantasea[];
  hadir: Record<string, TandaHadir>;
  hariIni: string;
  /** Jalur iCal ekspor untuk Booking.com atau OTA lain, /api/kalender-mitra/ics/<kunci>.ics. */
  ical: string;
}

/** Rombongan Fantasea dihitung dua orang sekamar, karena permintaan tidak menyebut kamar. */
export const kamarFantasea = (orang: number, kamarMaks: number) => Math.min(Math.max(1, kamarMaks), Math.max(1, Math.ceil(orang / 2)));

const tgl = (s: unknown) => (typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) ? s : "");
const teks = (s: unknown, n: number) => (typeof s === "string" ? s.trim().replace(/\s+/g, " ").slice(0, n) : "");
const malam = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);

/** Merapikan isian dari halaman mitra. Mengembalikan kalimat galat kalau tidak sah. */
export function rapikanIsianEntri(m: unknown, kamarMaks: number): Omit<EntriKalender, "id" | "dibuat" | "diubah"> | string {
  const o = (m ?? {}) as Record<string, unknown>;
  const sumber = SUMBER_KALENDER.some((x) => x.value === o.sumber) ? (o.sumber as SumberKalender) : null;
  if (!sumber) return "Pilih asal pesanan.";
  const mulai = tgl(o.mulai), selesai = tgl(o.selesai);
  if (!mulai || !selesai) return "Pilih tanggal datang dan tanggal pulang.";
  if (selesai <= mulai) return "Tanggal pulang harus sesudah tanggal datang.";
  if (malam(mulai, selesai) > MAKS_MALAM) return `Paling lama ${MAKS_MALAM} malam dalam satu catatan.`;
  const nomor = Array.isArray(o.nomorKamar)
    ? [...new Set(o.nomorKamar.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= kamarMaks))].sort((a, b) => a - b)
    : [];
  const kamar = nomor.length || Math.min(kamarMaks, Math.max(1, Math.round(Number(o.kamar) || 1)));
  const hasil: Omit<EntriKalender, "id" | "dibuat" | "diubah"> = { mulai, selesai, kamar, sumber };
  if (nomor.length && kamarMaks > 1) hasil.nomorKamar = nomor;
  const catatan = teks(o.catatan, 200);
  if (catatan) hasil.catatan = catatan;
  if (sumber !== "tutup") {
    const nama = teks(o.nama, 80);
    if (nama) hasil.nama = nama;
    const tamu = Math.round(Number(o.tamu));
    if (!(tamu >= 1 && tamu <= 99)) return "Isi jumlah tamu, 1 sampai 99.";
    hasil.tamu = tamu;
  }
  return hasil;
}

/** Satu pemakaian kamar, dari catatan mitra atau pesanan Fantasea. */
export interface Pakai {
  kunci: string;
  sumber: SumberKalender | "fantasea" | "proses";
  label: string;
  mulai: string;
  selesai: string;
  kamar: number;
  nomor?: number[];
  tamu?: number;
}

export function daftarPakai(entri: EntriKalender[], fantasea: PesananFantasea[]): Pakai[] {
  return [
    ...fantasea.map((f): Pakai => ({ kunci: f.kunci, sumber: f.pasti ? "fantasea" : "proses", label: f.pasti ? f.nama || f.kode : `${f.kode}, sedang diproses`, mulai: f.mulai, selesai: f.selesai, kamar: f.kamar, tamu: f.orang })),
    ...entri.map((e): Pakai => ({ kunci: `e:${e.id}`, sumber: e.sumber, label: e.sumber === "tutup" ? "Tutup" : e.nama || metaSumber(e.sumber).pendek, mulai: e.mulai, selesai: e.selesai, kamar: e.kamar, nomor: e.nomorKamar, tamu: e.tamu })),
  ];
}

/** Malam `iso` terpakai bila mulai <= iso < selesai. */
export const malamDi = (p: { mulai: string; selesai: string }, iso: string) => p.mulai <= iso && iso < p.selesai;

export function terpakai(pakai: Pakai[], iso: string) {
  const isi = pakai.filter((p) => malamDi(p, iso));
  const per: Partial<Record<Pakai["sumber"], number>> = {};
  for (const p of isi) per[p.sumber] = (per[p.sumber] ?? 0) + p.kamar;
  return { total: isi.reduce((n, p) => n + p.kamar, 0), per, isi };
}

export interface Bentrok { mulai: string; selesai: string; jenis: "lebih" | "ganda"; kunci: string[]; nomor?: number }

/**
 * Double booking per malam (pola DAMPIER, cariBentrok). "lebih" bila kamar
 * terpakai melebihi jumlah kamar, "ganda" bila satu kamar bernomor dipakai
 * dua catatan. Malam berurutan dengan pesanan yang sama digabung.
 */
export function cariBentrok(pakai: Pakai[], kamar: number, dari: string, sampai: string): Bentrok[] {
  const hasil: Bentrok[] = [];
  const dorong = (b: Omit<Bentrok, "selesai">, iso: string) => {
    const akhir = hasil.find((x) => x.jenis === b.jenis && x.nomor === b.nomor && x.selesai === iso && x.kunci.join() === b.kunci.join());
    if (akhir) akhir.selesai = geser(iso, 1);
    else hasil.push({ ...b, selesai: geser(iso, 1) });
  };
  for (let iso = dari; iso < sampai; iso = geser(iso, 1)) {
    const t = terpakai(pakai, iso);
    if (t.total > kamar) dorong({ mulai: iso, jenis: "lebih", kunci: t.isi.map((p) => p.kunci).sort() }, iso);
    const perNomor = new Map<number, string[]>();
    for (const p of t.isi) for (const n of p.nomor ?? []) perNomor.set(n, [...(perNomor.get(n) ?? []), p.kunci]);
    for (const [n, k] of perNomor) if (k.length > 1) dorong({ mulai: iso, jenis: "ganda", kunci: k.sort(), nomor: n }, iso);
  }
  return hasil;
}

export function uraianBentrok(b: Bentrok, kamar: number, nama: (k: string) => string) {
  const siapa = b.kunci.map(nama).join(", ");
  return b.jenis === "lebih" ? `Kamar terpesan melebihi ${kamar} kamar. ${siapa}.` : `Kamar ${b.nomor} dipakai dua pesanan. ${siapa}.`;
}

/** Kamar bernomor yang kosong di semua malam mulai..selesai, nomor terkecil dulu. */
export function kamarBebas(pakai: Pakai[], kamar: number, mulai: string, selesai: string, kecuali?: string): number[] {
  const dipakai = new Set<number>();
  for (const p of pakai) {
    if (p.kunci === kecuali || !p.nomor || !(p.mulai < selesai && mulai < p.selesai)) continue;
    for (const n of p.nomor) dipakai.add(n);
  }
  return Array.from({ length: kamar }, (_, i) => i + 1).filter((n) => !dipakai.has(n));
}

/** Malam yang sudah penuh, untuk iCal ekspor ke OTA. Rentang berurutan digabung. */
export function rentangPenuh(pakai: Pakai[], kamar: number, dari: string, sampai: string): { mulai: string; selesai: string }[] {
  const hasil: { mulai: string; selesai: string }[] = [];
  for (let iso = dari; iso < sampai; iso = geser(iso, 1)) {
    if (terpakai(pakai, iso).total < kamar) continue;
    const akhir = hasil[hasil.length - 1];
    if (akhir && akhir.selesai === iso) akhir.selesai = geser(iso, 1);
    else hasil.push({ mulai: iso, selesai: geser(iso, 1) });
  }
  return hasil;
}

/** Tanda datang dan pulang boleh dari sehari sebelum datang sampai 30 hari sesudah pulang (pola DAMPIER). */
export const bolehTandai = (p: { mulai: string; selesai: string }, hariIni: string) => hariIni >= geser(p.mulai, -1) && hariIni <= geser(p.selesai, 30);
