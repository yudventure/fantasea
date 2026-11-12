import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { muatSitus } from "@/lib/server/situs";
import { bacaKonten } from "@/lib/server/konten";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KartuKursus from "@/components/KartuKursus";
import { KepalaHalaman } from "@/components/Bagian";
import { polos } from "@/components/Judul";

type Params = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  return { title: polos(tx(k.diveCourse.judul, locale)), description: tx(k.diveCourse.lead, locale), alternates: { canonical: `/${locale}/dive-course`, languages: { en: "/en/dive-course", id: "/id/dive-course" } } };
}
export default async function HalamanKursus({ params }: Params) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const { k, menu, pesan } = await muatSitus(l);
  if (!k.diveCourse.tampil) notFound();
  return <>
    <Header menu={menu} pesan={pesan} jalur="/dive-course" />
    <main id="isi">
      <KepalaHalaman b={k.diveCourse} l={l} />
      <section className="bg-soft pb-20 pt-8 sm:pb-28 sm:pt-12">
        <div className="wrap"><KartuKursus daftar={k.diveCourse.kursus} l={l} nomor={k.situs.kontak.whatsapp} /></div>
      </section>
    </main>
    <Footer k={k} l={l} menu={menu} />
  </>;
}
