import { NextResponse, type NextRequest } from "next/server";
import { META_PERAN } from "@/lib/peran";
import { COOKIE_PENGUNJUNG, ID_KUNJUNGAN } from "@/lib/kunjungan";
import { bacaStatistikKunjungan, catatKunjungan, hashPengunjung } from "@/lib/server/kunjungan";
import { alamatPeminta, catat, jsonTanpaCache, sesiDari, wajib, wajibJson } from "@/lib/server/sesi";
import { ZONA_NEGARA } from "@/lib/zona-negara";

export const dynamic = "force-dynamic";
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|WhatsApp|curl|wget|python|httpclient/i;
const kosong = () => new NextResponse(null, { status: 204, headers: { "cache-control": "no-store" } });

/**
 * Statistik pengunjung (pola DAMPIER, app/api/pengunjung). GET untuk akun
 * panel yang boleh membuka Ringkasan, POST dari PencatatPengunjung di situs.
 */
export async function GET(req: Request) {
  const s = await wajib(req, (s) => META_PERAN[s.peran].tabs.includes("ringkasan"));
  if (s instanceof NextResponse) return s;
  try { return jsonTanpaCache({ statistik: await bacaStatistikKunjungan() }); }
  catch (e) { console.error("[fantasea] statistik pengunjung", e); return jsonTanpaCache({ galat: "Statistik pengunjung belum bisa dimuat." }, { status: 503 }); }
}

/** Pencatatan saja, tidak pernah mengembalikan statistik atau identitas. */
export async function POST(req: NextRequest) {
  const jenis = wajibJson(req);
  if (jenis) return jenis;
  if (req.headers.get("sec-fetch-site") === "cross-site") return kosong();
  if (req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1" || BOT.test(req.headers.get("user-agent") ?? "")) return kosong();
  if (await sesiDari(req)) return kosong();
  const id = req.cookies.get(COOKIE_PENGUNJUNG)?.value;
  if (!id || !ID_KUNJUNGAN.test(id)) return kosong();
  if (catat(`pengunjung-ip:${hashPengunjung(alamatPeminta(req))}`, 60000) > 600 || catat(`pengunjung:${hashPengunjung(id)}`, 60000) > 90) return kosong();
  // Batas juga berlaku untuk kiriman chunked tanpa Content-Length.
  if (Number(req.headers.get("content-length") ?? 0) > 2048) return jsonTanpaCache({ galat: "Isi terlalu besar." }, { status: 413 });
  const reader = req.body?.getReader();
  if (!reader) return jsonTanpaCache({ galat: "Isi tidak terbaca." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let ukuran = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    ukuran += value.byteLength;
    if (ukuran > 2048) { await reader.cancel(); return jsonTanpaCache({ galat: "Isi terlalu besar." }, { status: 413 }); }
    chunks.push(value);
  }
  let b: { kejadian?: unknown; halaman?: unknown; zona?: unknown } | null = null;
  try { b = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { /* badan tidak sah */ }
  if (!b || typeof b.halaman !== "boolean" || (b.halaman && (typeof b.kejadian !== "string" || !ID_KUNJUNGAN.test(b.kejadian)))) return jsonTanpaCache({ galat: "Isi tidak dikenali." }, { status: 400 });
  // Asal negara dari zona waktu perangkat, dicocokkan ke tabel tzdata. Zona
  // yang tidak dikenal (UTC, buatan) berarti negaranya tidak diketahui.
  const negara = typeof b.zona === "string" && b.zona.length <= 64 && Object.hasOwn(ZONA_NEGARA, b.zona) ? ZONA_NEGARA[b.zona] : null;
  try { await catatKunjungan(id, b.halaman ? b.kejadian as string : null, Date.now(), negara); return kosong(); }
  catch (e) { console.error("[fantasea] pencatatan pengunjung", e); return jsonTanpaCache({ galat: "Pencatatan belum tersedia." }, { status: 503 }); }
}
