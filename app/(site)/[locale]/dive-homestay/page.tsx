import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KepalaHalaman, KartuTrip } from "@/components/Bagian";

type Params = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  const kategori = k.kategori.find((x) => x.id === "homestay-selam" && x.tampil);
  if (!kategori) return {};
  return { title: tx(kategori.nama, locale), description: tx(kategori.ringkas, locale), alternates: { canonical: `/${locale}/dive-homestay`, languages: { en: "/en/dive-homestay", id: "/id/dive-homestay" } } };
}
export default async function DiveHomestay({ params }: Params) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const { k, t, menu, pesan } = await muatSitus(l);
  const kategori = k.kategori.find((x) => x.id === "homestay-selam" && x.tampil);
  if (!kategori) notFound();
  const paket = k.trip.filter((x) => x.tampil && x.kategori === kategori.id);
  return <>
    <Header menu={menu} pesan={pesan} jalur="/dive-homestay" />
    <main id="isi">
      <KepalaHalaman b={{ label: k.menu.trip, judul: kategori.nama, lead: kategori.ringkas }} l={l} />
      <section className="bg-soft pb-20 pt-8 sm:pb-28 sm:pt-12">
        <div className="wrap">
          <Link href={`/${l}/activities`} className="font-bold text-tanda hover:underline">{t("activity.all")}</Link>
          {paket.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{paket.map((x) => <KartuTrip key={x.id} trip={x} l={l} />)}</div> : <p className="mt-8 text-ink2">{t("activity.empty")}</p>}
        </div>
      </section>
    </main>
    <Footer k={k} l={l} menu={menu} />
  </>;
}
