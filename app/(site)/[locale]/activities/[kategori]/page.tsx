import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KepalaHalaman, KartuTrip } from "@/components/Bagian";

type Params = { params: Promise<{ locale: string; kategori: string }> };
const khusus: Record<string, string> = { "homestay-selam": "dive-homestay", kursus: "dive-course", liveaboard: "liveaboard" };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: l, kategori: id } = await params;
  if (!isLocale(l)) return {};
  const k = await bacaKonten();
  const kategori = k.kategori.find((x) => x.id === id && x.tampil);
  if (!kategori) return {};
  const jalur = khusus[id] || `activities/${id}`;
  return { title: tx(kategori.nama, l), description: tx(kategori.ringkas, l), alternates: { canonical: `/${l}/${jalur}`, languages: { en: `/en/${jalur}`, id: `/id/${jalur}` } } };
}
export default async function KategoriAktivitas({ params }: Params) {
  const { locale: l, kategori: id } = await params;
  if (!isLocale(l)) notFound();
  const { k, t, menu, pesan } = await muatSitus(l);
  const kategori = k.kategori.find((x) => x.id === id && x.tampil);
  if (!kategori) notFound();
  if (khusus[id]) permanentRedirect(`/${l}/${khusus[id]}`);
  const daftar = k.trip.filter((x) => x.tampil && x.kategori === id);
  return <>
    <Header menu={menu} pesan={pesan} jalur={`/activities/${id}`} />
    <main id="isi">
      <KepalaHalaman b={{ label: k.menu.trip, judul: kategori.nama, lead: kategori.ringkas }} l={l} />
      <section className="bg-soft pb-20 pt-8 sm:pb-28 sm:pt-12">
        <div className="wrap">
          <Link href={`/${l}/activities`} className="font-bold text-tanda hover:underline">{t("activity.all")}</Link>
          {daftar.length ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{daftar.map((x) => <KartuTrip key={x.id} trip={x} l={l} />)}</div> : <p className="mt-8 text-ink2">{t("activity.empty")}</p>}
        </div>
      </section>
    </main>
    <Footer k={k} l={l} menu={menu} />
  </>;
}
