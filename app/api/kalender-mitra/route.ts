import { aksiMitra, type AksiMitra } from "@/lib/server/kalender-mitra";
import { alamatPeminta, catat, jsonTanpaCache, wajibJson } from "@/lib/server/sesi";

export const dynamic = "force-dynamic";

const AKSI = new Set(["baca", "tambah", "ubah", "hapus", "hadir"]);

/**
 * Halaman kalender mitra (pola DAMPIER, /api/kalender-mitra). Kunci tautan
 * dikirim di badan, bukan di alamat. Paling banyak 300 permintaan per jam
 * per alamat, dan 20 kunci salah per jam.
 */
export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const ip = alamatPeminta(req);
  if (catat(`kalender-mitra:${ip}`, 60 * 60_000) > 300) return jsonTanpaCache({ galat: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const token = typeof o.token === "string" ? o.token : "";
  if (!AKSI.has(String(o.aksi))) return jsonTanpaCache({ galat: "Aksi tidak dikenal." }, { status: 400 });
  const hasil = await aksiMitra(token, o as unknown as AksiMitra);
  if (typeof hasil === "string") {
    const tidakBerlaku = hasil.startsWith("Tautan kalender");
    if (tidakBerlaku && catat(`kalender-mitra-salah:${ip}`, 60 * 60_000) > 20) return jsonTanpaCache({ galat: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    return jsonTanpaCache({ galat: hasil }, { status: tidakBerlaku ? 404 : 400 });
  }
  return jsonTanpaCache({ data: hasil });
}
