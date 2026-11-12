import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { polos } from "@/components/Judul";
import { DaftarEdukasi, DaftarTitik, JadwalOpenTrip, KatalogTrip, KepalaHalaman, KisiKategori } from "@/components/Bagian";

/**
 * Halaman Trip (permintaan pemilik, November 2026): kotak kategori berfoto
 * dan aktivitas yang dikelompokkan per kategori seperti website lama
 * Fantasea, edukasi selam, lalu titik selam. Semua isi dari panel (Trip dan
 * harga, Titik selam).
 */
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  const h = k.halamanTrip.kepala;
  return {
    title: polos(tx(h.judul, locale)),
    description: tx(h.lead, locale),
    alternates: { canonical: `/${locale}/activities`, languages: { en: "/en/activities", id: "/id/activities" } },
  };
}

export default async function HalamanTrip({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const { k, menu, pesan, waUmum, jadwal } = await muatSitus(l);
  const e = k.halamanTrip.edukasi;

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur="/activities" />
      <main id="isi">
        <KepalaHalaman b={k.halamanTrip.kepala} l={l} />
        <KisiKategori b={k.halamanTrip.kategori} kategori={k.kategori} trip={k.trip} l={l} adaLiveaboard={k.liveaboard.tampil} adaKursus={k.diveCourse.tampil} />
        <KatalogTrip kosong kategori={k.kategori.filter((x) => x.id !== "homestay-selam" && !(x.id === "kursus" && k.diveCourse.tampil) && !(x.id === "liveaboard" && k.liveaboard.tampil))} trip={k.trip} l={l} adaLiveaboard={k.liveaboard.tampil} />
        <JadwalOpenTrip b={k.bagian.jadwal} jadwal={jadwal} trip={k.trip} l={l} hrefTanya={waUmum || `/${l}/activities`} />
        <DaftarEdukasi b={e} butir={e.butir} l={l} />
        <DaftarTitik b={k.bagian.titik} titik={k.titik} l={l} latar="bg-white" />
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
