import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { polos } from "@/components/Judul";
import { DaftarHomestay, KepalaHalaman } from "@/components/Bagian";

/**
 * Halaman Homestay (permintaan pemilik, November 2026): semua homestay yang
 * tampil, dibuka dari tombol di atas kartu homestay beranda dan menu header.
 * Tanpa homestay yang tampil, alamatnya 404.
 */
type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  const h = k.halamanHomestay.kepala;
  return {
    title: polos(tx(h.judul, locale)),
    description: tx(h.lead, locale),
    alternates: { canonical: `/${locale}/homestay`, languages: { en: "/en/homestay", id: "/id/homestay" } },
  };
}

export default async function HalamanDaftarHomestay({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const { k, menu, pesan } = await muatSitus(l);
  if (!k.homestay.some((h) => h.tampil)) notFound();

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur="/homestay" />
      <main id="isi" className="pb-16 sm:pb-24">
        <KepalaHalaman b={k.halamanHomestay.kepala} l={l} />
        <DaftarHomestay homestay={k.homestay} l={l} beranda={false} />
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
