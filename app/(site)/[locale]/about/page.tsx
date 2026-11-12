import type { Metadata } from "next";
import Image from "next/image";
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
  return { title: tx(k.menu.about, locale), description: tx(k.footer.tentang, locale), alternates: { canonical: `/${locale}/about`, languages: { en: "/en/about", id: "/id/about" } } };
}
export default async function About({ params }: Params) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const { k, menu, pesan } = await muatSitus(l);
  const foto = k.gerbang.foto[0];
  return <>
    <Header menu={menu} pesan={pesan} jalur="/about" />
    <main id="isi">
      <KepalaHalaman b={{ label: k.menu.about, judul: { en: "Fantasea Dive Travel", id: "Fantasea Dive Travel" }, lead: k.footer.tentang }} l={l} />
      {foto && <div className="wrap pb-12 sm:pb-20"><div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-kabut sm:aspect-[21/9]">
        <Image src={foto.foto} alt={tx(foto.keterangan, l)} fill sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover" />
      </div></div>}
      <DaftarFaq b={k.bagian.faq} faq={k.faq} l={l} />
    </main>
    <Footer k={k} l={l} menu={menu} />
  </>;
}
