import "server-only";
import { KONTEN_BAWAAN } from "@/data/bawaan";
import { normalkanKonten, type Konten } from "@/lib/konten";
import { bacaJson, tulisJson } from "./gudang";

/**
 * Isi situs yang tersimpan, digabung dengan isi bawaan. Kolom yang belum
 * pernah disimpan memakai bawaan, jadi kolom baru di versi berikutnya
 * langsung terisi tanpa migrasi.
 */
const BERKAS = "konten.json";

export async function bacaKonten(): Promise<Konten> {
  const simpanan = await bacaJson<{ konten?: unknown }>(BERKAS, {});
  return normalkanKonten(simpanan.konten ?? {}, KONTEN_BAWAAN);
}

export async function simpanKonten(isi: unknown, oleh: string): Promise<Konten> {
  const rapi = normalkanKonten(isi, KONTEN_BAWAAN);
  await tulisJson(BERKAS, { konten: rapi, diubah: new Date().toISOString(), oleh });
  return rapi;
}
