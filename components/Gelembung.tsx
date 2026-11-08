import type { WarnaTag } from "@/lib/konten";

// Nama kelas ditulis utuh supaya tidak dibuang Tailwind saat build.
const KELAS: Record<WarnaTag, string> = {
  tanda: "gelembung-tanda",
  ukir: "gelembung-ukir",
  koral: "gelembung-koral",
  navy: "gelembung-navy",
};

/** Gelembung tag seperti @nama di referensi. Kosong berarti tidak tampil. */
export default function Gelembung({ teks, warna, className = "" }: { teks: string; warna: WarnaTag; className?: string }) {
  if (!teks.trim()) return null;
  return <span className={`gelembung ${KELAS[warna] ?? KELAS.tanda} ${className}`}>{teks}</span>;
}
