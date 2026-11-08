import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { bacaJson, ubahJson } from "./gudang";

/**
 * Permintaan pesan dari tamu (request to book, pola DAMPIER tanpa bayar).
 * Tamu mengisi trip, tanggal, dan jumlah orang. Permintaan tersimpan di
 * sini dan tampil di panel, lalu tamu melanjutkan obrolan lewat WhatsApp.
 */
export type StatusPermintaan = "baru" | "dihubungi" | "dikonfirmasi" | "batal";
export const STATUS_PERMINTAAN: StatusPermintaan[] = ["baru", "dihubungi", "dikonfirmasi", "batal"];

export interface Permintaan {
  id: string;
  /** Kode yang dilihat tamu, mis. FTS-2611-0007. */
  kode: string;
  tripId: string;
  tripNama: string;
  jadwalId: string;
  mulai: string;
  selesai: string;
  orang: number;
  nama: string;
  whatsapp: string;
  email: string;
  catatan: string;
  bahasa: Locale;
  status: StatusPermintaan;
  /** Catatan tim, hanya terlihat di panel. */
  catatanTim: string;
  dibuat: string;
  diubah: string;
}

interface Berkas { daftar: Permintaan[]; urut: Record<string, number> }
const BERKAS = "permintaan.json";
const bawaan: Berkas = { daftar: [], urut: {} };
const rapikan = (o: Berkas): Berkas => ({ daftar: Array.isArray(o?.daftar) ? o.daftar : [], urut: o?.urut && typeof o.urut === "object" ? o.urut : {} });

export async function semuaPermintaan(): Promise<Permintaan[]> {
  const o = rapikan(await bacaJson(BERKAS, bawaan));
  return [...o.daftar].sort((a, b) => b.dibuat.localeCompare(a.dibuat));
}

/** Simpan permintaan baru dan beri kode urut per bulan (WIT). */
export async function tambahPermintaan(isi: Omit<Permintaan, "id" | "kode" | "status" | "catatanTim" | "dibuat" | "diubah">): Promise<Permintaan> {
  let baru: Permintaan | null = null;
  await ubahJson(BERKAS, bawaan, (lama) => {
    const o = rapikan(lama);
    const wit = new Date(Date.now() + 9 * 3600_000).toISOString();
    const bulan = wit.slice(2, 4) + wit.slice(5, 7);
    const n = (o.urut[bulan] ?? 0) + 1;
    const kini = new Date().toISOString();
    baru = {
      ...isi,
      id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      kode: `FTS-${bulan}-${String(n).padStart(4, "0")}`,
      status: "baru",
      catatanTim: "",
      dibuat: kini,
      diubah: kini,
    };
    return { daftar: [...o.daftar, baru], urut: { ...o.urut, [bulan]: n } };
  });
  return baru!;
}

export async function ubahPermintaan(id: string, ubah: Partial<Pick<Permintaan, "status" | "catatanTim">>): Promise<Permintaan | null> {
  let hasil: Permintaan | null = null;
  await ubahJson(BERKAS, bawaan, (lama) => {
    const o = rapikan(lama);
    return {
      ...o,
      daftar: o.daftar.map((p) => {
        if (p.id !== id) return p;
        hasil = { ...p, ...ubah, diubah: new Date().toISOString() };
        return hasil;
      }),
    };
  });
  return hasil;
}

export async function hapusPermintaan(id: string): Promise<void> {
  await ubahJson(BERKAS, bawaan, (lama) => {
    const o = rapikan(lama);
    return { ...o, daftar: o.daftar.filter((p) => p.id !== id) };
  });
}
