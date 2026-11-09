import { META_PERAN } from "@/lib/peran";
import { agendaPanel } from "@/lib/server/kalender-mitra";
import { jsonTanpaCache, wajib } from "@/lib/server/sesi";

export const dynamic = "force-dynamic";

/** Catatan semua kalender mitra untuk Kalender kegiatan, bagi peran yang boleh membukanya. */
export async function GET(req: Request) {
  const s = await wajib(req, (x) => META_PERAN[x.peran].tabs.includes("kalender"));
  if (s instanceof Response) return s;
  return jsonTanpaCache({ mitra: await agendaPanel() });
}
