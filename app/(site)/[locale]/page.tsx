import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { tx } from "@/lib/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Jelajah from "@/components/Jelajah";
import Gerbang from "@/components/Gerbang";
import Footer from "@/components/Footer";
import { Ajakan, DaftarFaq, DaftarTitik, DaftarTrip, DaftarUlasan, JadwalOpenTrip } from "@/components/Bagian";

/**
 * Beranda. Tiga bagian pertama mengikuti referensi desain (hero kartu
 * mengipas, kartu bertumpuk, galeri besar), lalu bagian dive travel dengan
 * gaya yang sama. Semua isi dari panel pengelola.
 */
export default async function Beranda({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const { k, t, menu, pesan, waUmum, jadwal } = await muatSitus(l);
  const hrefTanya = waUmum || `/${l}#trip`;

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur="" />
      <main id="isi">
        <Hero k={k} l={l} />
        <Jelajah
          label={tx(k.jelajah.label, l)} judul={tx(k.jelajah.judul, l)} lead={tx(k.jelajah.lead, l)}
          tombol1={tx(k.jelajah.tombol1, l)} tombol2={tx(k.jelajah.tombol2, l)} kartu={k.jelajah.kartu}
          hrefTombol1={hrefTanya}
        />
        <Gerbang
          label={tx(k.gerbang.label, l)} judul={tx(k.gerbang.judul, l)} lead={tx(k.gerbang.lead, l)}
          foto={k.gerbang.foto.map((f) => ({ foto: f.foto, keterangan: tx(f.keterangan, l) }))}
          video={k.gerbang.video} tag={k.gerbang.tag} warna={k.gerbang.warna}
        />
        <DaftarTrip b={k.bagian.trip} trip={k.trip} l={l} />
        <JadwalOpenTrip b={k.bagian.jadwal} jadwal={jadwal} trip={k.trip} l={l} hrefTanya={hrefTanya} />
        <DaftarTitik b={k.bagian.titik} titik={k.titik} l={l} />
        <DaftarUlasan b={k.bagian.ulasan} ulasan={k.ulasan} l={l} />
        <DaftarFaq b={k.bagian.faq} faq={k.faq} l={l} />
        <Ajakan judul={tx(k.ajakan.judul, l)} lead={tx(k.ajakan.lead, l)} tombol={waUmum ? tx(k.ajakan.tombol, l) : t("ajakan.permintaan")} href={hrefTanya} l={l} />
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
