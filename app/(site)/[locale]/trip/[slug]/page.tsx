import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { hariIniWit, sisaKursi, tx, txDaftar, ID_LIVEABOARD } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { muatSitus } from "@/lib/server/situs";
import { rentangTanggal } from "@/lib/format";
import { nomorWaAsli } from "@/lib/whatsapp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GaleriTrip from "@/components/GaleriTrip";
import FormPermintaan from "@/components/FormPermintaan";
import { DaftarCentang, HargaTrip, KartuTrip } from "@/components/Bagian";
import { IkonJam, IkonLevel, IkonMasker, IkonPanahKiri } from "@/components/Ikon";

type Params = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<{ jadwal?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  const trip = k.trip.find((x) => x.slug === slug && x.tampil);
  if (!trip) return {};
  return {
    title: `${tx(trip.nama, locale)}, Raja Ampat`,
    description: tx(trip.ringkas, locale),
    alternates: { canonical: `/${locale}/trip/${trip.slug}`, languages: { en: `/en/trip/${trip.slug}`, id: `/id/trip/${trip.slug}` } },
    openGraph: trip.foto[0] && !trip.foto[0].startsWith("/unggahan/") ? { images: [trip.foto[0]] } : undefined,
  };
}

export default async function HalamanTrip({ params, searchParams }: Params) {
  const { locale, slug } = await params;
  const { jadwal: jadwalAwal = "" } = await searchParams;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const { k, t, menu, pesan, jadwal } = await muatSitus(l);
  const trip = k.trip.find((x) => x.slug === slug && x.tampil);
  if (!trip) notFound();

  const jadwalTrip = jadwal.filter((j) => j.tripId === trip.id);
  const paragraf = tx(trip.deskripsi, l).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  // Trip lain dari kategori yang sama dulu.
  const lainnya = k.trip.filter((x) => x.tampil && x.id !== trip.id).sort((a, b) => Number(b.kategori === trip.kategori) - Number(a.kategori === trip.kategori)).slice(0, 2);
  const kategori = k.kategori.find((x) => x.id === trip.kategori);
  const keLiveaboard = trip.kategori === ID_LIVEABOARD && k.liveaboard.tampil;
  const nama = tx(trip.nama, l);

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur={`/trip/${trip.slug}`} />
      <main id="isi" className="pb-8">
        <section className="bg-gradient-to-b from-[#EAF2F7] to-white pb-10 pt-[92px] sm:pt-[112px]">
          <div className="wrap">
            <Link href={keLiveaboard ? `/${l}/liveaboard` : `/${l}/trip#kategori-${trip.kategori}`} className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-2 text-[14px] font-bold text-navy shadow-card hover:bg-buih">
              <IkonPanahKiri size={16} />{keLiveaboard ? t("liveaboard.semua") : t("trip.semua")}
            </Link>
            {kategori && <p className="aksen mt-6">{tx(kategori.nama, l)}</p>}
            <h1 className="mt-2 max-w-[18ch] text-[clamp(44px,7.4vw,84px)]">{nama}</h1>
            {tx(trip.ringkas, l) && <p className="mt-4 max-w-[56ch] text-[17px] text-ink2">{tx(trip.ringkas, l)}</p>}
          </div>
        </section>

        <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12">
          <div className="min-w-0">
            <GaleriTrip foto={trip.foto} alt={nama} />

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { ikon: IkonJam, k: t("trip.durasi"), v: tx(trip.durasi, l) },
                ...(trip.selam > 0 ? [{ ikon: IkonMasker, k: t("trip.jumlahSelam"), v: String(trip.selam) }] : []),
                { ikon: IkonLevel, k: t("trip.level"), v: tx(trip.level, l) },
              ].filter((d) => d.v).map(({ ikon: Ikon, k: label, v }) => (
                <div key={label} className="rounded-[18px] bg-buih p-4">
                  <Ikon size={20} className="text-tanda" />
                  <dt className="mt-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink2">{label}</dt>
                  <dd className="mt-0.5 text-[16px] font-extrabold leading-tight text-navy">{v}</dd>
                </div>
              ))}
              <div className="rounded-[18px] bg-buih p-4">
                <dt className="sr-only">{t("trip.harga")}</dt>
                <dd><HargaTrip trip={trip} l={l} /></dd>
              </div>
            </dl>

            {paragraf.length > 0 && (
              <div className="mt-10 grid max-w-[68ch] gap-4 text-[16.5px] leading-relaxed text-navy/90">
                {paragraf.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
              </div>
            )}

            {txDaftar(trip.termasuk, l).length > 0 && (
              <div className="mt-10">
                <h2 className="text-[34px]">{t("trip.termasuk")}</h2>
                <div className="mt-4"><DaftarCentang isi={txDaftar(trip.termasuk, l)} centang /></div>
              </div>
            )}
            {txDaftar(trip.belum, l).length > 0 && (
              <div className="mt-8">
                <h2 className="text-[34px]">{t("trip.belum")}</h2>
                <div className="mt-4"><DaftarCentang isi={txDaftar(trip.belum, l)} centang={false} /></div>
              </div>
            )}

            <div className="mt-10">
              <h2 className="text-[34px]">{t("trip.jadwal")}</h2>
              {jadwalTrip.length === 0 ? (
                <p className="mt-3 text-[15.5px] text-ink2">{t("trip.tanpaJadwal")}</p>
              ) : (
                <ul className="mt-4 grid gap-2.5">
                  {jadwalTrip.map((j) => {
                    const sisa = sisaKursi(j);
                    return (
                      <li key={j.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3 shadow-card">
                        <span className="font-extrabold text-navy">{rentangTanggal(j.mulai, j.selesai, l)}{tx(j.catatan, l) && <span className="ml-2 font-semibold text-ink2">{tx(j.catatan, l)}</span>}</span>
                        <span className="flex items-center gap-2">
                          <span className={`pill ${sisa === 0 ? "pill-navy" : sisa <= 3 ? "pill-koral" : "pill-ukir"}`}>{sisa === 0 ? t("jadwal.penuh") : sisa === 1 ? t("jadwal.sisaSatu") : t("jadwal.sisa", { n: sisa })}</span>
                          {sisa > 0 && <Link href={`/${l}/trip/${trip.slug}?jadwal=${j.id}#pesan`} scroll={false} className="text-[14px] font-extrabold text-tanda hover:underline">{t("jadwal.pesan")}</Link>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <aside id="pesan" className="lg:sticky lg:top-24 lg:self-start">
            <FormPermintaan
              key={jadwalAwal}
              itemId={trip.id}
              itemNama={nama}
              jadwal={jadwalTrip.map((j) => ({ id: j.id, mulai: j.mulai, selesai: j.selesai, sisa: sisaKursi(j) }))}
              jadwalAwal={jadwalAwal}
              hariIni={hariIniWit()}
              wa={nomorWaAsli(k.situs.kontak.whatsapp)}
            />
          </aside>
        </div>

        {lainnya.length > 0 && (
          <section className="wrap mt-16 sm:mt-24">
            <h2 className="text-[clamp(36px,5vw,56px)]">{t("trip.lainnya")}</h2>
            <div className={`mt-8 grid gap-3 sm:gap-5 ${lainnya.length > 1 ? "grid-cols-2" : ""}`}>
              {lainnya.map((x) => <KartuTrip key={x.id} trip={x} l={l} lebar={lainnya.length === 1} sempit={lainnya.length > 1} />)}
            </div>
          </section>
        )}
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
