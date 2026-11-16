import { notFound, permanentRedirect, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { bacaKonten } from "@/lib/server/konten";

/**
 * Halaman Dive Homestay sudah tidak ada (permintaan pemilik, November 2026).
 * Paketnya pindah ke aktivitas Fun diving, dan semua homestay satu kategori
 * di Akomodasi. Alamat lama, termasuk tautan dari website lama, diantar ke
 * kategori tempat paket itu berada, atau ke katalog Activities.
 */
type Params = { params: Promise<{ locale: string }> };
export default async function DiveHomestayLama({ params }: Params) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const k = await bacaKonten();
  const paket = k.trip.find((t) => t.id.startsWith("t-dh-") && t.tampil);
  const kategori = paket && k.kategori.find((x) => x.id === paket.kategori && x.tampil && !["kursus", "liveaboard"].includes(x.id));
  if (kategori) redirect(`/${l}/activities/${kategori.id}`);
  permanentRedirect(`/${l}/activities`);
}
