/**
 * Kisi kartu tiga kolom di atas enam lajur (pola DAMPIER, components/kisi.ts).
 * Kartu yang sendirian di baris terakhir melebar penuh, dua kartu di baris
 * terakhir dibagi rata setengah-setengah.
 *
 * Di bawah lg kisinya dua kolom, juga di ponsel (permintaan pemilik,
 * November 2026), jadi kartu yang sendirian di baris terakhir melebar dua
 * kolom. Kartu di ponsel tampil paling banyak 6 dulu (`KisiKartu`). Kartu
 * yang berbagi baris di ponsel diberi tanda `sempit`, supaya tulisannya
 * diperkecil.
 */
export const KISI_TIGA = "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-6 lg:gap-6";
/** Kisi untuk kartu teks panjang (ulasan), satu kolom di ponsel. */
export const KISI_TIGA_TEKS = "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6";
/** Kartu yang tampil di ponsel sebelum tombol Lihat lebih banyak. */
export const MAKS_KARTU_PONSEL = 6;

export function tempatTiga(i: number, n: number, duaDiPonsel = true): { kelas: string; lebar: boolean; sempit: boolean } {
  const sisaLg = n % 3;
  const awalSisaLg = n - sisaLg;
  const sendiriDua = n % 2 === 1 && i === n - 1;
  let lg = "lg:col-span-2";
  let lebar = false;
  if (i >= awalSisaLg && sisaLg === 1) { lg = "lg:col-span-6"; lebar = true; }
  else if (i >= awalSisaLg && sisaLg === 2) lg = "lg:col-span-3";
  const dua = duaDiPonsel ? (sendiriDua ? "col-span-2" : "") : sendiriDua ? "md:col-span-2" : "md:col-span-1";
  return { kelas: `${dua} ${lg}`.trim(), lebar: lebar || n === 1, sempit: duaDiPonsel && !sendiriDua };
}
