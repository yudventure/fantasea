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
  const kelompok = sisa.match(/.{1,4}/g)?.join(" ") ?? sisa;
  return kode ? `+${kode} ${kelompok}` : kelompok;
}
