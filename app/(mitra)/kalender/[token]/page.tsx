import { headers } from "next/headers";
import { botPratinjau, catatKunjunganKalender, dataUntukToken, tautanDariToken } from "@/lib/server/kalender-mitra";
import KalenderMitra from "@/components/mitra/KalenderMitra";

export const dynamic = "force-dynamic";

/** Kalender mitra homestay (pola DAMPIER, app/(mitra)/kalender/[token]). */
export default async function HalamanKalenderMitra({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const tautan = await tautanDariToken(token);
  const data = tautan ? await dataUntukToken(token) : null;
  if (tautan && data && !botPratinjau((await headers()).get("user-agent"))) await catatKunjunganKalender(tautan.id);
  return <KalenderMitra token={token} awal={data} />;
}
