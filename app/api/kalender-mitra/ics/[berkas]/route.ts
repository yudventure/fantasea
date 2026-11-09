import { icsUntukEkspor } from "@/lib/server/kalender-mitra";
import { alamatPeminta, catat } from "@/lib/server/sesi";

export const dynamic = "force-dynamic";

/**
 * Ekspor iCal kalender mitra, /api/kalender-mitra/ics/<kunci ekspor>.ics.
 * Ditempel di Booking.com atau OTA lain supaya malam yang sudah penuh di
 * Fantasea tertutup di sana. Tanpa nama atau kontak tamu.
 */
export async function GET(req: Request, { params }: { params: Promise<{ berkas: string }> }) {
  const { berkas } = await params;
  if (catat(`ics:${alamatPeminta(req)}`, 60 * 60_000) > 240) return new Response("Terlalu banyak permintaan", { status: 429 });
  const isi = await icsUntukEkspor(berkas.replace(/\.ics$/, ""));
  if (!isi) return new Response("Tidak ditemukan", { status: 404, headers: { "cache-control": "no-store" } });
  return new Response(isi, {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", "content-disposition": "inline; filename=fantasea.ics" },
  });
}
