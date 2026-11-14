import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KatalogAktivitas, { type ItemKatalogAktivitas } from "@/components/KatalogAktivitas";
import { polos } from "@/components/Judul";
import { KartuHomestay, KepalaHalaman } from "@/components/Bagian";

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
  const { k, t, menu, pesan } = await muatSitus(l);
  const tampil = k.homestay.filter((h) => h.tampil);
  if (!tampil.length) notFound();
  const lokasi = new Map<string, string>();
  const item: ItemKatalogAktivitas[] = tampil.map((h) => {
    const namaLokasi = tx(h.lokasi, l).trim();
    const nilai = namaLokasi.toLocaleLowerCase() || "__unknown";
    lokasi.set(nilai, namaLokasi || t("homestayCatalog.unknown"));
    return { id: h.id, kategori: nilai,
      pencarian: [h.nama.en, h.nama.id, h.lokasi.en, h.lokasi.id, h.ringkas.en, h.ringkas.id, h.deskripsi.en, h.deskripsi.id, ...h.fasilitas.en, ...h.fasilitas.id].join(" "),
      kartu: <KartuHomestay h={h} l={l} />,
    };
  });
  const filterLokasi = Array.from(lokasi, ([nilai, label]) => ({ nilai, label })).sort((a, b) => a.label.localeCompare(b.label, l));

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur="/homestay" />
      <main id="isi" className="pb-16 sm:pb-24">
        <KepalaHalaman b={k.halamanHomestay.kepala} l={l} />
        <div className="wrap">
          <KatalogAktivitas item={item} kategori={filterLokasi} labelPrefix="homestayCatalog" />
        </div>
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
