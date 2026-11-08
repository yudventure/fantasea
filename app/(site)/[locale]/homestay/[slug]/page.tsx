import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { hariIniWit, tx, txDaftar } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import { nomorWaAsli } from "@/lib/whatsapp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GaleriTrip from "@/components/GaleriTrip";
import FormPermintaan from "@/components/FormPermintaan";
import { DaftarCentang, HargaHomestay, KartuHomestay } from "@/components/Bagian";
import { IkonPanahKiri, IkonPin } from "@/components/Ikon";

/**
 * Halaman satu homestay (permintaan pemilik, November 2026): galeri,
 * deskripsi, fasilitas, dan formulir permintaan menginap dengan tanggal
 * masuk dan keluar. Rupanya mengikuti halaman trip.
 */
type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  const h = k.homestay.find((x) => x.slug === slug && x.tampil);
  if (!h) return {};
  return {
    title: `${tx(h.nama, locale)}, Raja Ampat`,
    description: tx(h.ringkas, locale),
    alternates: { canonical: `/${locale}/homestay/${h.slug}`, languages: { en: `/en/homestay/${h.slug}`, id: `/id/homestay/${h.slug}` } },
    openGraph: h.foto[0] && !h.foto[0].startsWith("/unggahan/") ? { images: [h.foto[0]] } : undefined,
  };
}

export default async function HalamanHomestay({ params }: Params) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const { k, t, menu, pesan } = await muatSitus(l);
  const h = k.homestay.find((x) => x.slug === slug && x.tampil);
  if (!h) notFound();

  const nama = tx(h.nama, l);
  const lokasi = tx(h.lokasi, l);
  const paragraf = tx(h.deskripsi, l).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const fasilitas = txDaftar(h.fasilitas, l);
  const lainnya = k.homestay.filter((x) => x.tampil && x.id !== h.id).slice(0, 2);

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur={`/homestay/${h.slug}`} />
      <main id="isi" className="pb-8">
        <section className="bg-gradient-to-b from-[#EAF2F7] to-white pb-10 pt-[92px] sm:pt-[112px]">
          <div className="wrap">
            <Link href={`/${l}/homestay`} className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-2 text-[14px] font-bold text-navy shadow-card hover:bg-buih">
              <IkonPanahKiri size={16} />{t("homestay.semua")}
            </Link>
            <p className="aksen mt-6">{t("homestay.label")}</p>
            <h1 className="mt-2 max-w-[18ch] text-[clamp(44px,7.4vw,84px)]">{nama}</h1>
            {tx(h.ringkas, l) && <p className="mt-4 max-w-[56ch] text-[17px] text-ink2">{tx(h.ringkas, l)}</p>}
          </div>
        </section>

        <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12">
          <div className="min-w-0">
            <GaleriTrip foto={h.foto} alt={nama} />

            <dl className={`mt-8 grid gap-3 ${lokasi ? "sm:grid-cols-2" : ""}`}>
              {lokasi && (
                <div className="rounded-[18px] bg-buih p-4">
                  <IkonPin size={20} className="text-tanda" />
                  <dt className="mt-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink2">{t("homestay.lokasi")}</dt>
                  <dd className="mt-0.5 text-[16px] font-extrabold leading-tight text-navy">{lokasi}</dd>
                </div>
              )}
              <div className="rounded-[18px] bg-buih p-4">
                <dt className="sr-only">{t("homestay.harga")}</dt>
                <dd><HargaHomestay h={h} l={l} /></dd>
              </div>
            </dl>

            {paragraf.length > 0 && (
              <div className="mt-10 grid max-w-[68ch] gap-4 text-[16.5px] leading-relaxed text-navy/90">
                {paragraf.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
              </div>
            )}

            {fasilitas.length > 0 && (
              <div className="mt-10">
                <h2 className="text-[34px]">{t("homestay.fasilitas")}</h2>
                <div className="mt-4"><DaftarCentang isi={fasilitas} centang /></div>
              </div>
            )}
          </div>

          <aside id="pesan" className="lg:sticky lg:top-24 lg:self-start">
            <FormPermintaan
              jenis="homestay"
              itemId={h.id}
              itemNama={nama}
              jadwal={[]}
              jadwalAwal=""
              hariIni={hariIniWit()}
              wa={nomorWaAsli(k.situs.kontak.whatsapp)}
            />
          </aside>
        </div>

        {lainnya.length > 0 && (
          <section className="wrap mt-16 sm:mt-24">
            <h2 className="text-[clamp(36px,5vw,56px)]">{t("homestay.lainnya")}</h2>
            <div className={`mt-8 grid gap-3 sm:gap-5 ${lainnya.length > 1 ? "grid-cols-2" : ""}`}>
              {lainnya.map((x) => <KartuHomestay key={x.id} h={x} l={l} lebar={lainnya.length === 1} sempit={lainnya.length > 1} />)}
            </div>
          </section>
        )}
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
