import { bacaKonten, simpanKonten } from "@/lib/server/konten";
import { jsonTanpaCache, wajib, wajibJson } from "@/lib/server/sesi";
import { bolehUbahIsi } from "@/lib/peran";

/** Isi situs untuk panel. Simpan langsung tayang karena halaman tamu dibaca per permintaan. */
export async function GET(req: Request) {
  const s = await wajib(req);
  if (s instanceof Response) return s;
  return jsonTanpaCache({ konten: await bacaKonten() });
}

export async function PUT(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  // Peran Meja permintaan hanya membaca isi, tidak menyimpannya.
  const s = await wajib(req, (x) => bolehUbahIsi(x.peran));
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => null)) as { konten?: unknown } | null;
  if (!o || typeof o.konten !== "object" || !o.konten) return jsonTanpaCache({ galat: "Isi tidak terbaca." }, { status: 400 });
  return jsonTanpaCache({ konten: await simpanKonten(o.konten, s.email) });
}
