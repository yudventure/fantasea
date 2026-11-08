import { Fragment } from "react";

/**
 * Judul dari panel. Teks di antara tanda bintang tampil berwarna aksen,
 * baris baru tetap baris baru: "Gateway to\n*the Coral Triangle.*".
 */
export function isiJudul(teks: string, kelasAksen = "text-tanda") {
  const baris = teks.split("\n");
  return baris.map((b, i) => (
    <Fragment key={i}>
      {b.split("*").map((potong, j) => (j % 2 === 1 ? <span key={j} className={kelasAksen}>{potong}</span> : <Fragment key={j}>{potong}</Fragment>))}
      {i < baris.length - 1 && <br />}
    </Fragment>
  ));
}

export function Judul({ as: Tag = "h2", teks, className = "", aksen }: { as?: "h1" | "h2" | "h3"; teks: string; className?: string; aksen?: string }) {
  if (!teks.trim()) return null;
  return <Tag className={className}>{isiJudul(teks, aksen)}</Tag>;
}

/** Teks polos tanpa tanda bintang, untuk judul halaman dan atribut alt. */
export const polos = (teks: string) => teks.replace(/\*/g, "").replace(/\n/g, " ").trim();
