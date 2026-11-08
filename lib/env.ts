/**
 * Membaca environment variable dari hPanel.
 *
 * Impor .env di hPanel menolak value kosong, jadi semua key diimpor dengan
 * value "-" lalu diisi pemilik sendiri. "-" dibaca sama dengan kosong, supaya
 * fitur yang key-nya belum diisi tetap tersembunyi dengan aman.
 */
export function envText(nama: string): string {
  const v = process.env[nama]?.trim() ?? "";
  return v === "-" ? "" : v;
}
