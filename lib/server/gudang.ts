import { promises as fs } from "node:fs";
import { randomBytes } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { envText } from "@/lib/env";

/**
 * Gudang data di server: berkas JSON di satu folder (pola DAMPIER).
 *
 * Skala Fantasea, satu objek isi situs dan puluhan permintaan sebulan, tidak
 * butuh basis data. Berkas JSON tersimpan di server, selamat dari restart,
 * bisa dibaca orang, dan cadangannya cukup satu folder.
 *
 * Folder data `FANTASEA_DATA_DIR` kalau diisi. Kalau tidak, `.fantasea-data`
 * di folder home akun hosting, di luar folder aplikasi, supaya deploy ulang
 * tidak menghapus data. Kalau home tidak bisa ditulis, `.data/` di folder
 * aplikasi (ada di .gitignore).
 *
 * Penulisan atomik (berkas sementara lalu rename) dan berurutan lewat satu
 * antrean, supaya dua simpanan bersamaan tidak saling menimpa.
 */
let dirCache: string | null = null;

async function bisaDitulis(dir: string) {
  try { await fs.mkdir(dir, { recursive: true }); await fs.access(dir, fs.constants.W_OK); return true; }
  catch { return false; }
}

export async function dirData(): Promise<string> {
  if (dirCache) return dirCache;
  const kandidat = [envText("FANTASEA_DATA_DIR"), path.join(os.homedir(), ".fantasea-data"), path.join(process.cwd(), ".data")].filter(Boolean);
  for (const d of kandidat) {
    if (await bisaDitulis(d)) { dirCache = d; return d; }
  }
  throw new Error(`[fantasea] tidak ada folder data yang bisa ditulis, dicoba ${kandidat.join(", ")}`);
}

let antrean: Promise<unknown> = Promise.resolve();
function berurutan<T>(kerja: () => Promise<T>): Promise<T> {
  const hasil = antrean.then(kerja, kerja);
  antrean = hasil.catch(() => undefined);
  return hasil;
}

export async function bacaJson<T>(nama: string, bawaan: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(await dirData(), nama), "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return bawaan;
    console.error(`[fantasea] ${nama} tidak bisa dibaca`, e);
    return bawaan;
  }
}

async function tulisLangsung(nama: string, isi: unknown, mode?: number) {
  const tujuan = path.join(await dirData(), nama);
  const sementara = `${tujuan}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(sementara, JSON.stringify(isi, null, 2) + "\n", { encoding: "utf8", ...(mode ? { mode } : {}) });
  await fs.rename(sementara, tujuan);
}

export function tulisJson(nama: string, isi: unknown, mode?: number): Promise<void> {
  return berurutan(() => tulisLangsung(nama, isi, mode));
}

/** Ubah-baca-tulis dalam satu giliran antrean, supaya tidak ada pembaruan yang hilang. */
export function ubahJson<T>(nama: string, bawaan: T, ubah: (lama: T) => T, mode?: number): Promise<T> {
  return berurutan(async () => {
    const baru = ubah(await bacaJson(nama, bawaan));
    await tulisLangsung(nama, baru, mode);
    return baru;
  });
}

/** Folder unggahan foto di dalam folder data. */
export async function dirUnggahan(): Promise<string> {
  const d = path.join(await dirData(), "unggahan");
  await fs.mkdir(d, { recursive: true });
  return d;
}

// ---- rahasia penanda tangan sesi: dibuat sekali, disimpan di folder data ----
let rahasiaCache: string | null = null;
export async function rahasia(): Promise<string> {
  if (rahasiaCache) return rahasiaCache;
  const jalur = path.join(await dirData(), "rahasia.txt");
  try {
    const isi = (await fs.readFile(jalur, "utf8")).trim();
    if (isi.length >= 32) { rahasiaCache = isi; return isi; }
  } catch { /* belum ada */ }
  const baru = randomBytes(32).toString("hex");
  await fs.writeFile(jalur, baru + "\n", { mode: 0o600 });
  rahasiaCache = baru;
  return baru;
}
