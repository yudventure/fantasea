import { BCP47, type Locale } from "@/lib/i18n/config";

/** Rupiah utuh, mis. "Rp 8.500.000" atau "IDR 8,500,000". */
export function rupiah(n: number, l: Locale): string {
  return new Intl.NumberFormat(BCP47[l], { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const tgl = (s: string) => new Date(`${s}T00:00:00Z`);

/** "12 Dec 2026" */
export function tanggalPanjang(s: string, l: Locale): string {
  if (!s) return "";
  return new Intl.DateTimeFormat(BCP47[l], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(tgl(s));
}

/**
 * Rentang tanggal rapat tanpa spasi di sekitar tanda hubung, sesuai aturan
 * tulisan situs: "12–15 Dec 2026", "27 Dec–2 Jan 2027", "30 Dec 2026–2 Jan 2027".
 */
export function rentangTanggal(mulai: string, selesai: string, l: Locale): string {
  if (!mulai) return "";
  if (!selesai || selesai === mulai) return tanggalPanjang(mulai, l);
  const a = tgl(mulai), b = tgl(selesai);
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(BCP47[l], { ...o, timeZone: "UTC" }).format(d);
  const tahunB = b.getUTCFullYear();
  if (a.getUTCFullYear() !== tahunB) return `${f(a, { day: "numeric", month: "short", year: "numeric" })}–${f(b, { day: "numeric", month: "short", year: "numeric" })}`;
  if (a.getUTCMonth() !== b.getUTCMonth()) return `${f(a, { day: "numeric", month: "short" })}–${f(b, { day: "numeric", month: "short" })} ${tahunB}`;
  return `${a.getUTCDate()}–${f(b, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** Hari dan bulan untuk kartu jadwal: { hari: "12–15", bulan: "Dec 2026" }. */
export function potonganTanggal(mulai: string, selesai: string, l: Locale): { hari: string; bulan: string } {
  const a = tgl(mulai), b = tgl(selesai || mulai);
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(BCP47[l], { ...o, timeZone: "UTC" }).format(d);
  if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) {
    return { hari: a.getTime() === b.getTime() ? `${a.getUTCDate()}` : `${a.getUTCDate()}–${b.getUTCDate()}`, bulan: f(a, { month: "short", year: "numeric" }) };
  }
  return { hari: `${a.getUTCDate()}–${b.getUTCDate()}`, bulan: `${f(a, { month: "short" })}–${f(b, { month: "short", year: "numeric" })}` };
}
