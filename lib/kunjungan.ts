/**
 * Statistik pengunjung situs untuk Ringkasan panel, disalin dari DAMPIER
 * (lib/kunjungan.ts) atas permintaan pemilik, November 2026. Cookie acak per
 * peramban, disimpan server hanya sebagai hash, tanpa IP, nama, atau URL.
 */
import { geser, hariIniWit } from "./tanggal";

export const COOKIE_PENGUNJUNG = "fantasea_pengunjung";
export const UMUR_COOKIE_PENGUNJUNG = 180 * 86400;
export const JENDELA_AKTIF_MS = 5 * 60 * 1000;
export const DETAK_PENGUNJUNG_MS = 45 * 1000;
export const SEGARKAN_PENGUNJUNG_MS = 15 * 1000;
export const ID_KUNJUNGAN = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MAKS_KEJADIAN = 64;

export interface JumlahKunjungan { pengunjung: number; halaman: number }
/** Kode negara ISO 3166 dua huruf, mis. "FR". */
export const KODE_NEGARA = /^[A-Z]{2}$/;
export interface HariKunjungan {
  pengunjung: number;
  halaman: number;
  /** Hash peramban. `negara` diperkirakan dari zona waktu perangkatnya. */
  peramban: Record<string, { terakhir: number; kejadian: string[]; negara?: string }>;
  /**
   * Pengunjung dan tampilan halaman per negara. Tetap disimpan setelah hash
   * peramban dibuang (31 hari). Peramban tanpa negara tidak masuk, jadi
   * selisihnya dengan jumlah hari itu adalah "tidak diketahui".
   */
  negara?: Record<string, JumlahKunjungan>;
}
export const hariKosong = (): HariKunjungan => ({ pengunjung: 0, halaman: 0, peramban: {} });
export type JumlahDanNegara = JumlahKunjungan & { negara: Record<string, JumlahKunjungan> };
export interface StatistikKunjungan {
  pada: string;
  mulai: string | null;
  aktif: number;
  hari: JumlahDanNegara;
  minggu: JumlahDanNegara;
  bulan: JumlahDanNegara;
  harian: (JumlahDanNegara & { tanggal: string })[];
}

/**
 * Nonce yang sama (retry, StrictMode) tidak menambah tampilan halaman lagi.
 * Negara pertama yang diketahui untuk peramban itu di hari itu yang dipakai.
 * Peramban yang tercatat sebelum negaranya diketahui (data lama) baru
 * dihitung di negaranya sejak negaranya datang.
 */
export function catatHari(lama: HariKunjungan, peramban: string, kejadian: string | null, kini: number, negara: string | null = null): HariKunjungan {
  const awal = lama.peramban[peramban];
  const baru = !!kejadian && !awal?.kejadian.includes(kejadian);
  const asal = awal?.negara ?? (negara && KODE_NEGARA.test(negara) ? negara : undefined);
  const negaraBaru = !awal?.negara && !!asal;
  const tabel = { ...(lama.negara ?? {}) };
  if (asal && (negaraBaru || baru)) {
    const n = tabel[asal] ?? { pengunjung: 0, halaman: 0 };
    tabel[asal] = { pengunjung: n.pengunjung + (negaraBaru ? 1 : 0), halaman: n.halaman + (baru ? 1 : 0) };
  }
  return {
    pengunjung: lama.pengunjung + (awal ? 0 : 1),
    halaman: lama.halaman + (baru ? 1 : 0),
    peramban: {
      ...lama.peramban,
      [peramban]: {
        terakhir: kini,
        kejadian: baru ? [kejadian!, ...(awal?.kejadian ?? [])].slice(0, MAKS_KEJADIAN) : awal?.kejadian ?? [],
        ...(asal ? { negara: asal } : {}),
      },
    },
    ...(Object.keys(tabel).length ? { negara: tabel } : {}),
  };
}

/** Pengunjung mingguan/bulanan adalah gabungan peramban, bukan penjumlahan harian. */
export function ringkasKunjungan(hari: Record<string, HariKunjungan>, mulai: string | null, kini = Date.now()): StatistikKunjungan {
  const hariIni = hariIniWit(new Date(kini));
  const harian = Array.from({ length: 30 }, (_, i) => {
    const tanggal = geser(hariIni, i - 29);
    const d = hari[tanggal] ?? hariKosong();
    return { tanggal, pengunjung: d.pengunjung, halaman: d.halaman, negara: { ...(d.negara ?? {}) } };
  });
  // Pengunjung per negara juga gabungan peramban: satu peramban yang datang
  // tiga hari dihitung sekali di negaranya. Tampilan halaman dijumlahkan.
  const jumlah = (n: number): JumlahDanNegara => {
    const unik = new Map<string, string | undefined>();
    let halaman = 0;
    const negara: Record<string, JumlahKunjungan> = {};
    for (const d of harian.slice(-n)) {
      for (const [id, p] of Object.entries(hari[d.tanggal]?.peramban ?? {})) if (!unik.get(id)) unik.set(id, p.negara);
      halaman += d.halaman;
      for (const [k, v] of Object.entries(d.negara)) (negara[k] ??= { pengunjung: 0, halaman: 0 }).halaman += v.halaman;
    }
    for (const k of unik.values()) if (k) (negara[k] ??= { pengunjung: 0, halaman: 0 }).pengunjung += 1;
    return { pengunjung: unik.size, halaman, negara };
  };
  const aktif = new Set<string>();
  // Lima menit terakhir bisa melintasi tengah malam WIT.
  for (const tanggal of [hariIni, geser(hariIni, -1)]) {
    for (const [id, p] of Object.entries(hari[tanggal]?.peramban ?? {})) {
      if (p.terakhir <= kini && kini - p.terakhir < JENDELA_AKTIF_MS) aktif.add(id);
    }
  }
  return { pada: new Date(kini).toISOString(), mulai, aktif: aktif.size, hari: jumlah(1), minggu: jumlah(7), bulan: jumlah(30), harian };
}
