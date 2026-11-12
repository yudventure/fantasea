import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { tx } from "@/lib/konten";
import { muatSitus } from "@/lib/server/situs";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Jelajah from "@/components/Jelajah";
import Gerbang from "@/components/Gerbang";
import { AboutFantasea, RuteWaisai } from "@/components/AboutFantasea";
import Footer from "@/components/Footer";
import { DaftarFaq, DaftarHomestay, KisiKategori, DaftarUlasan } from "@/components/Bagian";

/**
 * Beranda. Tiga bagian pertama mengikuti referensi desain (hero kartu
 * mengipas, kartu bertumpuk, galeri besar), lalu bagian dive travel dengan
 * gaya yang sama. Semua isi dari panel pengelola. Titik selam pindah ke
 * halaman Trip, dan trip serta homestay punya tombol ke halamannya sendiri
 * (permintaan pemilik, November 2026).
 */
export default async function Beranda({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const { k, menu, pesan } = await muatSitus(l);

  return (
    <>
      <Header menu={menu} pesan={pesan} jalur="" />
      <main id="isi">
        <Hero k={k} l={l} />
        <Jelajah id="homestay" label={tx(k.jelajah.label, l)} judul={tx(k.jelajah.judul, l)} lead={tx(k.jelajah.lead, l)} kartu={k.jelajah.kartu}>
          <DaftarHomestay homestay={k.homestay} l={l} />
        </Jelajah>
        <Gerbang
          label={tx(k.gerbang.label, l)} judul={tx(k.gerbang.judul, l)} lead={tx(k.gerbang.lead, l)}
          foto={k.gerbang.foto.map((f) => ({ foto: f.foto, keterangan: tx(f.keterangan, l) }))}
          video={k.gerbang.video} tag={k.gerbang.tag} warna={k.gerbang.warna}
        />
        <KisiKategori b={k.bagian.trip} kategori={k.kategori} l={l} adaLiveaboard={k.liveaboard.tampil} adaKursus={k.diveCourse.tampil} beranda />
        <DaftarUlasan b={k.bagian.ulasan} ulasan={k.ulasan} l={l} />
        <DaftarFaq b={k.bagian.faq} faq={k.faq} l={l} />
        <AboutFantasea k={k} l={l} />
        <RuteWaisai k={k} l={l} />
      </main>
      <Footer k={k} l={l} menu={menu} />
    </>
  );
}
