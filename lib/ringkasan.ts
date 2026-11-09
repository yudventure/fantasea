import type { Permintaan } from "./server/permintaan";

/**
 * Angka Ringkasan panel (pola DAMPIER, lib/ringkasan.ts). Dihitung dari
 * permintaan yang sama dengan meja permintaan, tanpa angka contoh, jadi
 * bulan tanpa data tampil nol.
 */

/** Batas internal tim untuk menghubungi tamu pertama kali. Tidak tampil ke tamu. */
export const BATAS_JAWAB_JAM = 24;

const ZONA = "Asia/Jayapura";
const FORMAT_KUNCI = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit" });
const FORMAT_LABEL = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, month: "long" });

/** "2026-11" menurut WIT. */
export const kunciBulan = (waktu: string | number | Date = Date.now()) => FORMAT_KUNCI.format(new Date(waktu));
export const labelBulan = (waktu: string | number | Date = Date.now()) => FORMAT_LABEL.format(new Date(waktu));
export function kunciBulanLalu(kunci: string) {
  const [y, m] = kunci.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export function ringkasBulan(daftar: Permintaan[], kunci: string) {
  const ini = daftar.filter((p) => p.dibuat && kunciBulan(p.dibuat) === kunci);
  return { masuk: ini.length, dikonfirmasi: ini.filter((p) => p.status === "dikonfirmasi").length };
}

/** Median menit dari permintaan masuk sampai pertama kali ditangani, 30 hari terakhir. */
export function medianJawabMenit(daftar: Permintaan[], kini = Date.now()): number | null {
  const menit = daftar
    .filter((p) => p.dijawab && kini - Date.parse(p.dijawab) <= 30 * 864e5)
    .map((p) => Math.max(0, (Date.parse(p.dijawab!) - Date.parse(p.dibuat)) / 60000))
    .sort((a, b) => a - b);
  if (!menit.length) return null;
  const t = Math.floor(menit.length / 2);
  return Math.round(menit.length % 2 ? menit[t] : (menit[t - 1] + menit[t]) / 2);
}

export const tulisMenit = (m: number) => (m < 60 ? `${m}m` : m < 60 * 48 ? `${Math.floor(m / 60)}j ${m % 60}m` : `${Math.floor(m / 1440)} hari`);
export const menitSejak = (iso: string, kini = Date.now()) => Math.max(0, Math.round((kini - Date.parse(iso)) / 60000));

/** Permintaan Baru yang belum dihubungi lebih lama dari batas, paling lama di atas. */
export const lewatBatas = (daftar: Permintaan[], kini = Date.now()) =>
  daftar.filter((p) => p.status === "baru" && menitSejak(p.dibuat, kini) > BATAS_JAWAB_JAM * 60).sort((a, b) => a.dibuat.localeCompare(b.dibuat));
