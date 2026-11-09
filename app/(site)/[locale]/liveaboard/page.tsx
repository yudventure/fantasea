import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { ID_LIVEABOARD, tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { polos } from "@/components/Judul";
import { Ajakan, DaftarEdukasi, JadwalOpenTrip, KatalogTrip, KepalaHalaman, Liveaboard } from "@/components/Bagian";

/**
 * Halaman Liveaboard sendiri seperti halaman Trip (permintaan pemilik,
 * November 2026). Katalog trip berkategori Liveaboard, keunggulan dari bagian
 * Liveaboard beranda, jadwal open trip liveaboard bila ada, dan kartu
 * pengetahuan sebelum naik kapal. Mati bersama bagian Liveaboard di panel.
 */
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  if (!k.liveaboard.tampil) return {};
  const h = k.halamanLiveaboard.kepala;
  return {
    title: polos(tx(h.judul, locale)),
    description: tx(h.lead, locale),
    alternates: { canonical: `/${locale}/liveaboard`, languages: { en: "/en/liveaboard", id: "/id/liveaboard" } },
    openGraph: k.liveaboard.foto && !k.liveaboard.foto.startsWith("/unggahan/") ? { images: [k.liveaboard.foto] } : undefined,
  };
}

export default async function HalamanLiveaboard({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const { k, t, menu, pesan, waUmum, jadwal } = await muatSitus(l);
  if (!k.liveaboard.tampil) notFound();
  const kapal = k.trip.filter((x) => x.tampil && x.kategori === ID_LIVEABOARD);
  const jadwalKapal = jadwal.filter((j) => kapal.some((x) => x.id === j.tripId));
  const kategori = k.kategori.filter((x) => x.id === ID_LIVEABOARD).map((x) => ({ ...x, tampil: true }));
  const e = k.halamanLiveaboard.edukasi;
  const hrefTanya = waUmum || `/${l}/trip`;

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur="/liveaboard" />
      <main id="isi">
        <KepalaHalaman b={k.halamanLiveaboard.kepala} l={l} />
        <KatalogTrip kategori={kategori} trip={kapal} l={l} adaLiveaboard={false} />
        <Liveaboard b={k.liveaboard} trip={k.trip} l={l} href={hrefTanya} kartu={false} beranda={false} />
        {jadwalKapal.length > 0 && <JadwalOpenTrip b={k.bagian.jadwal} jadwal={jadwalKapal} trip={kapal} l={l} hrefTanya={hrefTanya} />}
        <DaftarEdukasi b={e} butir={e.butir} l={l} />
        <Ajakan judul={tx(k.ajakan.judul, l)} lead={tx(k.ajakan.lead, l)} tombol={waUmum ? tx(k.liveaboard.tombol, l) || tx(k.ajakan.tombol, l) : t("ajakan.permintaan")} href={hrefTanya} l={l} />
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
