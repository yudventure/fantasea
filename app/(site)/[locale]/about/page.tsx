import type { Metadata } from "next";
import { AboutFantasea, RuteWaisai } from "@/components/AboutFantasea";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { muatSitus } from "@/lib/server/situs";
import { bacaKonten } from "@/lib/server/konten";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KepalaHalaman, DaftarFaq } from "@/components/Bagian";

type Params = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  return { title: tx(k.menu.about, locale), description: tx(k.about.lead, locale), alternates: { canonical: `/${locale}/about`, languages: { en: "/en/about", id: "/id/about" } } };
}
export default async function About({ params }: Params) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const { k, menu, pesan } = await muatSitus(l);
  return <>
    <Header menu={menu} pesan={pesan} jalur="/about" />
    <main id="isi">
      <KepalaHalaman b={{ label: k.menu.about, judul: { en: "Fantasea Dive Travel", id: "Fantasea Dive Travel" }, lead: k.about.lead }} l={l} />
      <AboutFantasea k={k} l={l} />
      <RuteWaisai k={k} l={l} />
      <DaftarFaq b={k.bagian.faq} faq={k.faq} l={l} />
    </main>
    <Footer k={k} l={l} menu={menu} />
  </>;
}
