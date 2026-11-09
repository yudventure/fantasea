import { bolehTab, type Peran } from "@/lib/peran";
import { MAKS_KAMAR } from "@/lib/kalender-mitra";
import { aturMitra, buatTautan, cabutTautan, daftarPanel, gantiTautan } from "@/lib/server/kalender-mitra";
import { jsonTanpaCache, wajib, wajibJson } from "@/lib/server/sesi";

export const dynamic = "force-dynamic";

/**
 * Kalender mitra di panel (pola DAMPIER, /api/kalender-mitra/tautan), untuk
 * developer, pemilik, dan admin. GET daftar per homestay, POST membuat atau mengganti
 * tautan, PUT data mitra (jumlah kamar, nama dan WhatsApp pemilik), DELETE
 * mencabut tautan. Catatan mitra tidak ikut terhapus.
 */
const izin = (x: { peran: Peran }) => bolehTab(x.peran, "kalendermitra");

export async function GET(req: Request) {
  const s = await wajib(req, izin);
  if (s instanceof Response) return s;
  return jsonTanpaCache({ mitra: await daftarPanel() });
}

export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, izin);
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof o.id === "string" && o.ganti === true) await gantiTautan(o.id, s.email);
  else if (typeof o.homestayId === "string") {
    const galat = await buatTautan(o.homestayId, s.email);
    if (galat) return jsonTanpaCache({ galat }, { status: 404 });
  } else return jsonTanpaCache({ galat: "Pilih homestay." }, { status: 400 });
  return jsonTanpaCache({ mitra: await daftarPanel() });
}

export async function PUT(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, izin);
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof o.homestayId !== "string") return jsonTanpaCache({ galat: "Pilih homestay." }, { status: 400 });
  const kamar = Math.round(Number(o.kamar));
  if (!(kamar >= 1 && kamar <= MAKS_KAMAR)) return jsonTanpaCache({ galat: `Jumlah kamar 1 sampai ${MAKS_KAMAR}.` }, { status: 400 });
  const wa = typeof o.wa === "string" ? o.wa.replace(/[^\d]/g, "").replace(/^0/, "62").slice(0, 16) : "";
  if (wa && wa.length < 9) return jsonTanpaCache({ galat: "Periksa nomor WhatsApp pemilik." }, { status: 400 });
  await aturMitra(o.homestayId, { kamar, pemilik: typeof o.pemilik === "string" ? o.pemilik.trim().slice(0, 80) : "", wa });
  return jsonTanpaCache({ mitra: await daftarPanel() });
}

export async function DELETE(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, izin);
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof o.id !== "string") return jsonTanpaCache({ galat: "Pilih tautan." }, { status: 400 });
  await cabutTautan(o.id);
  return jsonTanpaCache({ mitra: await daftarPanel() });
}
