/**
 * Tanggal kalender polos (YYYY-MM-DD) untuk panel, dikerjakan di UTC dari
 * ujung ke ujung supaya tanggal tidak bergeser di zona waktu peramban
 * (pola DAMPIER, lib/tanggal.ts).
 */

const UTC = { timeZone: "UTC" } as const;
const LENGKAP = new Intl.DateTimeFormat("id-ID", { ...UTC, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const HARI_PENDEK = new Intl.DateTimeFormat("id-ID", { ...UTC, weekday: "short", day: "numeric", month: "short" });
const BULAN_TAHUN = new Intl.DateTimeFormat("id-ID", { ...UTC, month: "long", year: "numeric" });

/** Tengah malam UTC untuk tanggal kalender polos. */
export const hari = (iso: string) => new Date(`${iso}T00:00:00Z`);
export const keIso = (d: Date) => d.toISOString().slice(0, 10);

export function geser(iso: string, n: number) {
  const d = hari(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return keIso(d);
}

/** Selisih hari dua tanggal, mis. jumlah malam menginap. */
export const selisihHari = (mulai: string, selesai: string) => Math.round((hari(selesai).getTime() - hari(mulai).getTime()) / 86_400_000);

/** `iso` di dalam mulai..selesai, kedua batas ikut terhitung. */
export const didalam = (iso: string, mulai: string, selesai: string) => iso >= mulai && iso <= selesai;

/** Kisi enam pekan untuk bulan yang memuat `iso`, mulai Senin, tingginya tetap. */
export function kisiBulan(iso: string): { iso: string; bulanIni: boolean }[] {
  const d = hari(iso);
  const a = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  a.setUTCDate(a.getUTCDate() - ((a.getUTCDay() + 6) % 7));
  const bulan = d.getUTCMonth();
  return Array.from({ length: 42 }, (_, i) => {
    const t = new Date(a);
    t.setUTCDate(t.getUTCDate() + i);
    return { iso: keIso(t), bulanIni: t.getUTCMonth() === bulan };
  });
}

export function bulanLain(iso: string, langkah: number) {
  const d = hari(iso);
  return keIso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + langkah, 1)));
}

export const NAMA_HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
export const tanggalLengkap = (iso: string) => LENGKAP.format(hari(iso));
export const tanggalPendek = (iso: string) => HARI_PENDEK.format(hari(iso));
export const bulanTahun = (iso: string) => BULAN_TAHUN.format(hari(iso));
