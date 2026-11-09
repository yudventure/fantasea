import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { catatHari, hariKosong, KODE_NEGARA, ringkasKunjungan, type HariKunjungan } from "@/lib/kunjungan";
import { geser, hariIniWit } from "@/lib/tanggal";
import "server-only";
import { bacaJson, dirData, ubahJson } from "./gudang";

const META = "pengunjung-meta.json";
const BERKAS = /^pengunjung-(\d{4}-\d{2}-\d{2})\.json$/;
const nama = (tanggal: string) => `pengunjung-${tanggal}.json`;
const HASH = /^[a-f0-9]{64}$/;
let metaSiap: Promise<void> | null = null;
let dipadatkan = "";

/** Cookie acak disimpan hanya sebagai hash, tanpa IP, nama, kontak atau URL. */
export const hashPengunjung = (id: string) => createHash("sha256").update(`fantasea-pengunjung:${id}`).digest("hex");

function hariSah(x: unknown): HariKunjungan {
  const d = x as HariKunjungan;
  if (!d || !Number.isSafeInteger(d.pengunjung) || d.pengunjung < 0 || !Number.isSafeInteger(d.halaman) || d.halaman < 0 || !d.peramban || typeof d.peramban !== "object" || Array.isArray(d.peramban)) throw new Error("Data pengunjung tidak terbaca.");
  for (const [id, p] of Object.entries(d.peramban)) {
    if (!HASH.test(id) || !p || !Number.isFinite(p.terakhir) || p.terakhir < 0 || !Array.isArray(p.kejadian) || p.kejadian.length > 64 || p.kejadian.some((k) => typeof k !== "string" || !HASH.test(k))) throw new Error("Data pengunjung tidak terbaca.");
    if (p.negara !== undefined && (typeof p.negara !== "string" || !KODE_NEGARA.test(p.negara))) throw new Error("Negara pengunjung tidak terbaca.");
  }
  // Hari dari sebelum asal negara dicatat tidak punya `negara`.
  if (d.negara !== undefined) {
    if (!d.negara || typeof d.negara !== "object" || Array.isArray(d.negara)) throw new Error("Negara pengunjung tidak terbaca.");
    for (const [k, v] of Object.entries(d.negara)) {
      if (!KODE_NEGARA.test(k) || !v || !Number.isSafeInteger(v.pengunjung) || v.pengunjung < 0 || !Number.isSafeInteger(v.halaman) || v.halaman < 0) throw new Error("Negara pengunjung tidak terbaca.");
    }
  }
  if (Object.keys(d.peramban).length && d.pengunjung !== Object.keys(d.peramban).length) throw new Error("Jumlah pengunjung tidak sesuai.");
  return d;
}

async function berkasHari() {
  return (await fs.readdir(await dirData())).flatMap((n) => { const m = n.match(BERKAS); return m ? [{ nama: n, tanggal: m[1] }] : []; });
}

/** Setelah 31 hari, hapus hash peramban. Jumlah harian tetap disimpan. */
async function padatkan(hariIni: string) {
  if (dipadatkan === hariIni) return;
  dipadatkan = hariIni;
  try {
    for (const b of await berkasHari()) {
      if (b.tanggal >= geser(hariIni, -30)) continue;
      const d = hariSah(await bacaJson(b.nama, hariKosong()));
      if (!Object.keys(d.peramban).length) continue;
      await ubahJson<HariKunjungan>(b.nama, hariKosong(), (lama) => ({ ...hariSah(lama), peramban: {} }), 0o600);
    }
  } catch (e) { dipadatkan = ""; console.error("[fantasea] pemadatan pengunjung", e); }
}

/** `negara` kode ISO dari zona waktu perangkat (lib/zona-negara.ts), atau null kalau tidak diketahui. */
export async function catatKunjungan(id: string, kejadian: string | null, kini = Date.now(), negara: string | null = null) {
  const tanggal = hariIniWit(new Date(kini));
  metaSiap ??= bacaJson<{ mulai: string | null }>(META, { mulai: null }).then(async (m) => {
    if (!m.mulai) await ubahJson(META, { mulai: null as string | null }, (lama) => ({ mulai: lama.mulai ?? new Date(kini).toISOString() }), 0o600);
  }).catch((e) => { metaSiap = null; throw e; });
  await metaSiap;
  await ubahJson<HariKunjungan>(nama(tanggal), hariKosong(), (lama) => catatHari(hariSah(lama), hashPengunjung(id), kejadian ? hashPengunjung(kejadian) : null, kini, negara), 0o600);
  await padatkan(tanggal);
}

export async function bacaStatistikKunjungan(kini = Date.now()) {
  const hariIni = hariIniWit(new Date(kini));
  const tanggal = Array.from({ length: 30 }, (_, i) => geser(hariIni, i - 29));
  const [meta, baris] = await Promise.all([
    bacaJson<{ mulai: string | null }>(META, { mulai: null }),
    Promise.all(tanggal.map(async (t) => [t, hariSah(await bacaJson(nama(t), hariKosong()))] as const)),
  ]);
  return ringkasKunjungan(Object.fromEntries(baris), meta.mulai, kini);
}

