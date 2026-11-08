import { jsonTanpaCache, sesiDari } from "@/lib/server/sesi";

/** Sesi panel. Belum masuk dijawab sesi null (bukan 401) supaya konsol peramban tetap bersih. */
export async function GET(req: Request) {
  return jsonTanpaCache({ sesi: await sesiDari(req) });
}
