import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { dirUnggahan } from "./gudang";

/**
 * Foto unggahan panel. Peramban sudah memperkecil foto ke paling lebar
 * 2000 px (components/admin/unggah.ts), jadi server cukup memeriksa jenisnya
 * dari isi berkas, bukan dari namanya, lalu menyimpannya di folder data
 * supaya tidak hilang saat deploy ulang. Disajikan di /unggahan/<nama>.
 */
export const MAKS_BITA = 8 * 1024 * 1024;

const JENIS: { ext: string; mime: string; cocok: (b: Buffer) => boolean }[] = [
  { ext: "webp", mime: "image/webp", cocok: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
  { ext: "jpg", mime: "image/jpeg", cocok: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", mime: "image/png", cocok: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
];

export const mimeDari = (nama: string) => JENIS.find((j) => nama.endsWith(`.${j.ext}`))?.mime ?? null;

export async function simpanFoto(isi: Buffer): Promise<string> {
  const jenis = JENIS.find((j) => j.cocok(isi));
  if (!jenis) throw new Error("Berkas harus foto WebP, JPEG, atau PNG.");
  const nama = `${Date.now().toString(36)}-${randomBytes(5).toString("hex")}.${jenis.ext}`;
  await fs.writeFile(path.join(await dirUnggahan(), nama), isi);
  return `/unggahan/${nama}`;
}

/** Nama berkas yang aman dibaca: tanpa garis miring dan tanpa titik dua kali. */
export const namaSah = (nama: string) => /^[\w-]+\.(webp|jpg|png)$/.test(nama);

export async function bacaFoto(nama: string): Promise<Buffer | null> {
  if (!namaSah(nama)) return null;
  try { return await fs.readFile(path.join(await dirUnggahan(), nama)); }
  catch { return null; }
}
