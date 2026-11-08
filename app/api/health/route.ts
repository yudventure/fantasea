import { jsonTanpaCache } from "@/lib/server/sesi";
import { dirData } from "@/lib/server/gudang";

/** Cek deploy: status, commit yang tayang, dan apakah folder data bisa ditulis. */
export const dynamic = "force-dynamic";

export async function GET() {
  let data = "ok";
  try { await dirData(); } catch { data = "tidak bisa ditulis"; }
  return jsonTanpaCache({ status: "ok", commit: (process.env.GIT_COMMIT ?? "").slice(0, 12) || null, data, waktu: new Date().toISOString() });
}
