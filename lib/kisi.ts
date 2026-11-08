/**
 * Kisi kartu tiga kolom di atas enam lajur (pola DAMPIER, components/kisi.ts).
 * Kartu yang sendirian di baris terakhir melebar penuh, dua kartu di baris
 * terakhir dibagi rata setengah-setengah. Di layar sedang kisinya dua kolom
 * dengan aturan yang sama.
 */
export const KISI_TIGA = "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6";

export function tempatTiga(i: number, n: number): { kelas: string; lebar: boolean } {
  const sisaLg = n % 3;
  const awalSisaLg = n - sisaLg;
  const sisaMd = n % 2;
  let lg = "lg:col-span-2";
  let lebar = false;
  if (i >= awalSisaLg && sisaLg === 1) { lg = "lg:col-span-6"; lebar = true; }
  else if (i >= awalSisaLg && sisaLg === 2) lg = "lg:col-span-3";
  const md = sisaMd === 1 && i === n - 1 ? "md:col-span-2" : "md:col-span-1";
  return { kelas: `${md} ${lg}`, lebar: lebar || n === 1 };
}
