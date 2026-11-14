import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KartuTrip } from "@/components/Bagian";
import { KartuKursusItem } from "@/components/KartuKursus";
import KatalogAktivitas, { type ItemKatalogAktivitas } from "@/components/KatalogAktivitas";

type Params = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  return { title: tx(k.menu.trip, locale), description: tx(k.halamanTrip.kepala.lead, locale), alternates: { canonical: `/${locale}/activities`, languages: { en: "/en/activities", id: "/id/activities" } } };
}

export default async function SemuaAktivitas({ params }: Params) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const { k, menu, pesan } = await muatSitus(l);
  const kategori = k.kategori.filter((x) => x.tampil && (x.id !== "liveaboard" || k.liveaboard.tampil) && (x.id !== "kursus" || k.diveCourse.tampil));
  const item: ItemKatalogAktivitas[] = kategori.flatMap((kat) => {
    const trip: ItemKatalogAktivitas[] = k.trip.filter((x) => x.tampil && x.kategori === kat.id).map((x) => ({
      id: `trip-${x.id}`, kategori: kat.id,
      pencarian: [x.nama.en, x.nama.id, x.ringkas.en, x.ringkas.id, x.deskripsi.en, x.deskripsi.id, x.sorot.en, x.sorot.id, kat.nama.en, kat.nama.id].join(" "),
      kartu: <KartuTrip trip={x} l={l} kategori={tx(kat.nama, l)} />,
    }));
    const kursus: ItemKatalogAktivitas[] = kat.id === "kursus" ? k.diveCourse.kursus.filter((x) => x.tampil).map((x) => ({
      id: `kursus-${x.id}`, kategori: kat.id,
      pencarian: [x.nama.en, x.nama.id, x.lokasi.en, x.lokasi.id, kat.nama.en, kat.nama.id].join(" "),
      kartu: <KartuKursusItem x={x} l={l} nomor={k.situs.kontak.whatsapp} />,
    })) : [];
    return [...trip, ...kursus];
  });
  return <>
    <Header menu={menu} pesan={pesan} jalur="/activities" />
    <main id="isi" className="bg-soft pb-20 pt-[100px] sm:pb-28 sm:pt-[120px]">
      <div className="wrap">
        <h1 className="text-[clamp(32px,4.5vw,48px)]">{tx(k.menu.trip, l)}</h1>
        <KatalogAktivitas item={item} kategori={kategori.map((x) => ({ nilai: x.id, label: tx(x.nama, l) }))} />
      </div>
    </main>
    <Footer k={k} l={l} menu={menu} />
  </>;
}
