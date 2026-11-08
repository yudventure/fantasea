import { hapusCookieSesi, jsonTanpaCache } from "@/lib/server/sesi";

export async function POST() {
  return hapusCookieSesi(jsonTanpaCache({ ok: true }));
}
