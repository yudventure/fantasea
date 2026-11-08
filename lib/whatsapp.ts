/**
 * Tautan WhatsApp. Pesan ditulis tanpa titik dua (aturan tulisan situs):
 * label dan nilai dipisah baris, bukan "Kode: ...".
 */
export function tautanWa(nomor: string, pesan: string): string {
  const n = nomor.replace(/[^\d]/g, "");
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(pesan)}`;
}

/** Nomor Indonesia untuk dibaca orang, mis. +62 812 3456 7890. */
export function nomorTampil(nomor: string): string {
  const n = nomor.replace(/[^\d]/g, "");
  if (!n) return "";
  const kode = n.startsWith("62") ? "62" : "";
  const sisa = kode ? n.slice(2) : n;
  const kelompok = kode && sisa.length > 7
    ? [sisa.slice(0, 3), ...(sisa.slice(3).match(/.{1,4}/g) ?? [])].join(" ")
    : sisa.match(/.{1,4}/g)?.join(" ") ?? sisa;
  return kode ? `+${kode} ${kelompok}` : kelompok;
}

/**
 * Nomor WhatsApp contoh di isi bawaan (permintaan pemilik, November 2026,
 * supaya footer sudah lengkap sebelum nomor asli diisi di panel). Sengaja
 * nomor yang tidak mungkin ada (+62 800 0000 0000), jadi tidak ada data tamu
 * yang sampai ke orang lain.
 */
export const NOMOR_WA_CONTOH = "6280000000000";

/** Nomor untuk meneruskan permintaan tamu. Nomor contoh dianggap belum diisi. */
export const nomorWaAsli = (nomor: string) => (nomor.replace(/[^\d]/g, "") === NOMOR_WA_CONTOH ? "" : nomor);
