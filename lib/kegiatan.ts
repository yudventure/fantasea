import { tx, type Jadwal, type Konten, type Trip } from "./konten";
import type { Permintaan } from "./server/permintaan";
import { geser, selisihHari } from "./tanggal";

/**
 * Kegiatan untuk Kalender kegiatan di panel (pola DAMPIER, Kalender.tsx).
 * Permintaan pemilik, November 2026: semua pesanan ke mitra terlihat di satu
 * kalender. Isinya keberangkatan open trip beserta permintaan yang ikut,
 * trip dengan tanggal pilihan tamu, dan tamu di homestay mitra. Dihitung
 * ulang dari permintaan dan jadwal setiap kali dibuka, tidak disimpan.
 */
export type JenisKegiatan = "opentrip" | "trip" | "homestay";

export interface Kegiatan {
  kunci: string;
  jenis: JenisKegiatan;
  /** Id trip atau homestay, untuk saringan. */
  itemId: string;
  judul: string;
  mulai: string;
  /** Hari terakhir. Untuk homestay, tanggal keluar (tamu pulang hari itu). */
  selesai: string;
  /** Permintaan dikonfirmasi, atau keberangkatan open trip yang terjadwal. */
  pasti: boolean;
  permintaan?: Permintaan;
  jadwal?: Jadwal;
  /** Permintaan yang memilih keberangkatan open trip ini, tanpa yang batal. */
  ikut?: Permintaan[];
}

export const PASTI = (p: Permintaan) => p.status === "dikonfirmasi";

/** Lama trip dalam hari dari teks durasinya ("4 days 3 nights", "4 hari 3 malam"), 1 bila tidak terbaca. */
export function hariTrip(t?: Trip): number {
  if (!t) return 1;
  for (const s of [t.durasi.id, t.durasi.en]) {
    const m = /(\d+)\s*(hari|days?)\b/i.exec(s);
    if (m) return Math.min(30, Math.max(1, Number(m[1])));
  }
  return 1;
}

export function susunKegiatan(k: Konten, daftar: Permintaan[]): Kegiatan[] {
  const hidup = daftar.filter((p) => p.status !== "batal" && p.mulai);
  const jadwal = new Map(k.jadwal.map((j) => [j.id, j]));
  const hasil: Kegiatan[] = k.jadwal.map((j) => ({
    kunci: `j:${j.id}`, jenis: "opentrip", itemId: j.tripId,
    judul: tx(k.trip.find((t) => t.id === j.tripId)?.nama ?? { en: "Open trip", id: "Open trip" }, "id"),
    mulai: j.mulai, selesai: j.selesai || j.mulai, pasti: true, jadwal: j,
    ikut: hidup.filter((p) => p.jadwalId === j.id),
  }));
  for (const p of hidup) {
    if (p.jadwalId && jadwal.has(p.jadwalId)) continue;
    if (p.jenis === "homestay") {
      hasil.push({ kunci: `p:${p.id}`, jenis: "homestay", itemId: p.tripId, judul: p.tripNama, mulai: p.mulai, selesai: p.selesai || p.mulai, pasti: PASTI(p), permintaan: p });
      continue;
    }
    const lama = hariTrip(k.trip.find((t) => t.id === p.tripId));
    const selesai = p.selesai && p.selesai >= p.mulai ? p.selesai : geser(p.mulai, lama - 1);
    hasil.push({ kunci: `p:${p.id}`, jenis: "trip", itemId: p.tripId, judul: p.tripNama, mulai: p.mulai, selesai, pasti: PASTI(p), permintaan: p });
  }
  return hasil.sort((a, b) => a.mulai.localeCompare(b.mulai) || a.jenis.localeCompare(b.jenis));
}

/** Jumlah orang permintaan yang ikut keberangkatan, dipilah pasti dan belum. */
export function orangIkut(g: Kegiatan) {
  const ikut = g.ikut ?? [];
  return { pasti: ikut.filter(PASTI).reduce((n, p) => n + p.orang, 0), belum: ikut.filter((p) => !PASTI(p)).reduce((n, p) => n + p.orang, 0) };
}

/** Kalimat untuk diteruskan ke homestay mitra lewat WhatsApp. Tanpa nomor dan email tamu. */
export function pesanMitra(p: Permintaan): string {
  const f = (iso: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  const malam = p.selesai ? selisihHari(p.mulai, p.selesai) : 0;
  return [
    `Halo, ada tamu Fantasea Dive Travel untuk ${p.tripNama}.`,
    `Nama tamu ${p.nama}, ${p.orang} orang.`,
    p.selesai ? `Datang ${f(p.mulai)}, pulang ${f(p.selesai)}, ${malam} malam.` : `Datang ${f(p.mulai)}.`,
    `Kode pesanan ${p.kode}.`,
    "Mohon kabari kalau kamarnya tersedia. Terima kasih.",
  ].join("\n");
}
