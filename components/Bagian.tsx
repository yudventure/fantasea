import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buatT } from "@/lib/i18n/t";
import { getMessages } from "@/lib/i18n/messages";
import { rupiah, potonganTanggal } from "@/lib/format";
import { KISI_TIGA, KISI_TIGA_TEKS, tempatTiga } from "@/lib/kisi";
import KisiKartu from "./KisiKartu";
import Gelembung from "./Gelembung";
import { ID_LIVEABOARD, sisaKursi, tx, txDaftar, type Edukasi, type Konten, type Faq, type Homestay, type Jadwal, type KategoriAktivitas, type KepalaBagian, type TitikSelam, type Trip, type Ulasan } from "@/lib/konten";
import { IkonBintang, IkonCentang, IkonJam, IkonMasker, IkonPanahKanan, IkonPin } from "./Ikon";
import { isiJudul } from "./Judul";

const unopt = (src: string) => src.startsWith("/unggahan/");

/** Label aksen, judul berwarna, dan kalimat pembuka bagian. */
export function KepalaBagianSitus({ b, l, tengah = false }: { b: KepalaBagian; l: Locale; tengah?: boolean }) {
  return (
    <div data-muncul="" className={tengah ? "mx-auto max-w-[760px] text-center" : "max-w-[760px]"}>
      {tx(b.label, l) && <p className="aksen">{tx(b.label, l)}</p>}
      <h2 className="mt-3 text-[clamp(38px,5.6vw,64px)]">{isiJudul(tx(b.judul, l))}</h2>
      {tx(b.lead, l) && <p className={`mt-5 text-[16px] text-ink2 ${tengah ? "mx-auto" : ""} max-w-[56ch]`}>{tx(b.lead, l)}</p>}
    </div>
  );
}

/** Harga mulai di kartu dan halaman. `sempit` untuk kartu dua kolom di ponsel. */
function HargaMulai({ harga, l, label, besar = false, sempit = false, tengah = false }: { harga: number; l: Locale; label: { dari: string; per: string; tanya: string }; besar?: boolean; sempit?: boolean; tengah?: boolean }) {
  if (!harga) return <span className={`font-display leading-none text-navy ${besar ? "text-[32px]" : "text-[24px]"} ${sempit ? "max-sm:text-[18px]" : ""}`}>{label.tanya}</span>;
  return (
    <span className={`grid leading-none ${tengah ? "justify-items-center text-center" : ""}`}>
      <span className={`text-[12.5px] font-bold text-ink2 ${sempit ? "max-sm:text-[11.5px]" : ""}`}>{label.dari}</span>
      <span className={`mt-1 font-display text-navy ${besar ? "text-[36px]" : "text-[26px]"} ${sempit ? "max-sm:text-[20px]" : ""}`}>{rupiah(harga, l)}</span>
      <span className={`mt-1 text-[12.5px] font-semibold text-ink2 ${sempit ? "max-sm:text-[11.5px]" : ""}`}>{label.per}</span>
    </span>
  );
}

/** Pembuka halaman sendiri (Trip, Homestay): label, judul besar, kalimat, di bawah header yang melayang. */
export function KepalaHalaman({ b, l }: { b: KepalaBagian; l: Locale }) {
  return (
    <section className="bg-gradient-to-b from-[#EAF2F7] to-white pb-8 pt-[100px] sm:pb-12 sm:pt-[128px]">
      <div className="wrap hero-masuk">
        {tx(b.label, l) && <p className="aksen">{tx(b.label, l)}</p>}
        <h1 className="mt-3 max-w-[16ch] text-[clamp(44px,7.4vw,88px)] leading-[0.95]">{isiJudul(tx(b.judul, l))}</h1>
        {tx(b.lead, l) && <p className="mt-5 max-w-[58ch] text-[17px] text-ink2">{tx(b.lead, l)}</p>}
      </div>
    </section>
  );
}

/** Tombol menuju halaman sendiri, di atas kisi kartu beranda (permintaan pemilik, November 2026). `terang` untuk latar navy. */
export function TombolSemua({ href, label, terang = false }: { href: string; label: string; terang?: boolean }) {
  return (
    <Link href={href} data-muncul="" className={`btn min-h-[44px] flex-none px-5 text-[14px] ${terang ? "text-white ring-2 ring-inset ring-white hover:bg-white hover:text-navy" : "btn-garis"}`}>
      {label}<IkonPanahKanan size={16} />
    </Link>
  );
}

export function HargaTrip({ trip, l, besar = false, sempit = false, tengah = false }: { trip: Trip; l: Locale; besar?: boolean; sempit?: boolean; tengah?: boolean }) {
  const t = buatT(getMessages(l));
  return <HargaMulai harga={trip.hargaMulai} l={l} besar={besar} sempit={sempit} tengah={tengah} label={{ dari: t("trip.dari"), per: t("trip.perOrang"), tanya: t("trip.tanyaHarga") }} />;
}

/**
 * Kerangka kartu berfoto untuk aktivitas dan homestay, seperti kartu di
 * website lama Fantasea (permintaan pemilik, November 2026): foto lebar,
 * judul di tengah, baris ikon (durasi, jumlah selam, alat), satu baris
 * keterangan, lalu harga per orang. Seluruh kartu bisa diketuk. `lebar` untuk
 * kartu yang melebar mendatar, `sempit` untuk kartu dua kolom di ponsel.
 */
function KartuFoto({ href, sampul, pil, nama, meta, sorot, harga, lebar = false, sempit = false }: {
  href: string; sampul?: string; pil?: React.ReactNode; nama: string; meta: React.ReactNode[]; sorot?: string; harga: React.ReactNode; lebar?: boolean; sempit?: boolean;
}) {
  const hp = (kelas: string) => (sempit ? kelas : "");
  return (
    <article className={`group relative flex h-full overflow-hidden rounded-card bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift ${lebar ? "flex-col md:flex-row" : "flex-col"}`}>
      <div className={`relative flex-none overflow-hidden bg-kabut ${lebar ? "aspect-[16/10] md:aspect-auto md:min-h-[300px] md:w-1/2" : `aspect-[16/10] ${hp("max-sm:aspect-[4/3]")}`}`}>
        {sampul && <Image src={sampul} alt="" fill sizes={sempit ? "(max-width: 640px) 50vw, 420px" : "(max-width: 768px) 100vw, 480px"} unoptimized={unopt(sampul)} className="object-cover transition duration-700 group-hover:scale-[1.04]" />}
        {pil && <span className={`pill pill-terang absolute left-3 top-3 max-w-[calc(100%-24px)] bg-white/95 ${hp("max-sm:hidden")}`}>{pil}</span>}
      </div>
      <div className={`flex flex-1 flex-col items-center px-5 pb-6 pt-5 text-center sm:px-6 ${lebar ? "md:justify-center md:px-10" : ""} ${hp("max-sm:px-3 max-sm:pb-4 max-sm:pt-3.5")}`}>
        <h3 className={`text-[26px] leading-[1.05] sm:text-[28px] ${hp("max-sm:text-[18px]")}`}>
          <Link href={href} className="after:absolute after:inset-0 after:rounded-card hover:text-tanda focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-tanda">{nama}</Link>
        </h3>
        {meta.length > 0 && <p className={`mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[14.5px] font-semibold text-ink2 ${hp("max-sm:mt-2 max-sm:gap-x-2.5 max-sm:text-[11.5px]")}`}>{meta}</p>}
        {sorot && <p className={`mt-2 text-[14.5px] text-ink2 ${hp("max-sm:line-clamp-2 max-sm:text-[12px]")}`}>{sorot}</p>}
        <div className={`mt-auto pt-5 ${lebar ? "md:mt-0" : ""} ${hp("max-sm:pt-3")}`}>{harga}</div>
      </div>
    </article>
  );
}

const Meta = ({ ikon, teks }: { ikon: React.ReactNode; teks: string }) => <span className="inline-flex items-center gap-1.5">{ikon}{teks}</span>;

export function KartuTrip({ trip, l, kategori, lebar = false, sempit = false }: { trip: Trip; l: Locale; kategori?: string; lebar?: boolean; sempit?: boolean }) {
  const t = buatT(getMessages(l));
  const ik = "flex-none text-tanda";
  const meta = [
    tx(trip.durasi, l) && <Meta key="d" ikon={<IkonJam size={16} className={ik} />} teks={tx(trip.durasi, l)} />,
    trip.selam > 0 && <Meta key="s" ikon={<IkonMasker size={16} className={ik} />} teks={t("trip.selam", { n: trip.selam })} />,
    trip.alat && <Meta key="a" ikon={<IkonCentang size={16} className={ik} />} teks={t("trip.alat")} />,
  ].filter(Boolean) as React.ReactNode[];
  return (
    <KartuFoto href={`/${l}/trip/${trip.slug}`} sampul={trip.foto[0]} pil={kategori} nama={tx(trip.nama, l)} meta={meta} sorot={tx(trip.sorot, l)}
      harga={<HargaTrip trip={trip} l={l} sempit={sempit} tengah />} lebar={lebar} sempit={sempit} />
  );
}

/** Kisi kartu dengan tempat tiga kolom dan tombol Lihat lebih banyak di ponsel. */
function kisi<T>(daftar: T[], kartu: (x: T, p: ReturnType<typeof tempatTiga>) => React.ReactNode) {
  const tempat = daftar.map((_, i) => tempatTiga(i, daftar.length));
  return { kartu: daftar.map((x, i) => <Fragment key={i}>{kartu(x, tempat[i])}</Fragment>), kelasKartu: tempat.map((p) => p.kelas) };
}

const namaKategori = (kategori: KategoriAktivitas[], id: string, l: Locale) => { const k = kategori.find((x) => x.id === id); return k ? tx(k.nama, l) : undefined; };

/**
 * Trip di beranda. Paling banyak 6 kartu di semua ukuran layar, sisanya
 * lewat Load more, dan tombol ke halaman Trip di atas kartu. Jadwal open
 * trip masuk sebagai `children` di bagian yang sama (permintaan pemilik,
 * November 2026, "trip dan open trip di gabung saja").
 */
export function DaftarTrip({ b, trip, kategori, l, children }: { b: KepalaBagian; trip: Trip[]; kategori: KategoriAktivitas[]; l: Locale; children?: React.ReactNode }) {
  const t = buatT(getMessages(l));
  const tampil = trip.filter((x) => x.tampil);
  if (!tampil.length && !children) return null;
  return (
    <section id="trip" className="bg-soft py-16 sm:py-24">
      <div className="wrap">
        {tampil.length > 0 && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <KepalaBagianSitus b={b} l={l} />
              <TombolSemua href={`/${l}/trip`} label={t("trip.lihatSemua")} />
            </div>
            <KisiKartu semuaUkuran kelas={`mt-10 ${KISI_TIGA}`} {...kisi(tampil, (x, p) => <KartuTrip trip={x} l={l} kategori={namaKategori(kategori, x.kategori, l)} lebar={p.lebar} sempit={p.sempit} />)} />
          </>
        )}
        {children}
      </div>
    </section>
  );
}

/** Kursus selam di beranda, memakai aktivitas yang sudah diatur dari panel. */
export function DiveCourse({ b, trip, kategori, l, href }: { b: Konten["diveCourse"]; trip: Trip[]; kategori: KategoriAktivitas[]; l: Locale; href: string }) {
  if (!b.tampil) return null;
  const kursus = trip.filter((x) => x.tampil && ["kursus", "spesialti"].includes(x.kategori) && kategori.some((k) => k.id === x.kategori && k.tampil));
  return (
    <section id="dive-course" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="wrap">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div data-muncul="">
            <KepalaBagianSitus b={b} l={l} />
            {tx(b.tombol, l) && <Link href={href} className="btn btn-koral mt-8">{tx(b.tombol, l)}<IkonPanahKanan size={16} /></Link>}
          </div>
          {b.foto && <div data-muncul="" className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-kabut shadow-card">
            <Image src={b.foto} alt="" fill sizes="(max-width: 1024px) 100vw, 640px" unoptimized={unopt(b.foto)} className="object-cover" />
          </div>}
        </div>
        {kursus.length > 0 && <KisiKartu semuaUkuran kelas={`mt-10 ${KISI_TIGA}`} {...kisi(kursus, (x, p) => <KartuTrip trip={x} l={l} kategori={namaKategori(kategori, x.kategori, l)} lebar={p.lebar} sempit={p.sempit} />)} />}
      </div>
    </section>
  );
}

/** Kategori yang tampil: punya aktivitas yang tampil, atau Liveaboard yang punya halaman sendiri. */
export const kategoriTampil = (kategori: KategoriAktivitas[], trip: Trip[], adaLiveaboard: boolean) =>
  kategori.filter((k) => k.tampil && (trip.some((x) => x.tampil && x.kategori === k.id) || (k.id === ID_LIVEABOARD && adaLiveaboard)));

/** Lebar kotak di baris terakhir supaya kotak sisa melebar rata (kisi 2 kolom di ponsel, 4 di layar lebar). */
const LEBAR_LG: Record<number, string> = { 1: "lg:col-span-12", 2: "lg:col-span-6", 3: "lg:col-span-4", 4: "lg:col-span-3" };

/**
 * Kotak kategori berfoto di halaman Trip, seperti Categories di website lama
 * Fantasea. Liveaboard menuju halamannya sendiri, yang lain ke kelompoknya.
 */
export function KisiKategori({ b, kategori, trip, l, adaLiveaboard }: { b: KepalaBagian; kategori: KategoriAktivitas[]; trip: Trip[]; l: Locale; adaLiveaboard: boolean }) {
  const daftar = kategoriTampil(kategori, trip, adaLiveaboard);
  if (!daftar.length) return null;
  const n = daftar.length, sisaLg = n % 4, awalSisaLg = n - (sisaLg || 4);
  return (
    <section id="kategori" className="pb-12 sm:pb-16">
      <div className="wrap">
        <KepalaBagianSitus b={b} l={l} />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12">
          {daftar.map((k, i) => {
            const lg = i >= awalSisaLg ? LEBAR_LG[sisaLg || 4] : LEBAR_LG[4];
            const hp = n % 2 === 1 && i === n - 1 ? "col-span-2" : "";
            const href = k.id === ID_LIVEABOARD && adaLiveaboard ? `/${l}/liveaboard` : `#kategori-${k.id}`;
            return (
              <Link key={k.id} href={href} data-muncul="" style={{ "--tunda": `${(i % 4) * 70}ms` } as React.CSSProperties}
                className={`group relative block h-[132px] overflow-hidden rounded-[18px] bg-navy shadow-card sm:h-[170px] lg:h-[190px] ${lg} ${hp}`}>
                {k.foto && <Image src={k.foto} alt="" fill sizes="(max-width: 1024px) 50vw, 360px" unoptimized={unopt(k.foto)} className="object-cover transition duration-700 group-hover:scale-[1.06]" />}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-malam/85 via-malam/25 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 text-center font-display text-[18px] leading-tight text-white sm:bottom-4 sm:text-[23px]">{tx(k.nama, l)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Katalog di halaman Trip, dikelompokkan per kategori (permintaan pemilik,
 * November 2026). Kelompok Liveaboard punya tombol ke halamannya sendiri.
 */
export function KatalogTrip({ kategori, trip, l, adaLiveaboard }: { kategori: KategoriAktivitas[]; trip: Trip[]; l: Locale; adaLiveaboard: boolean }) {
  const t = buatT(getMessages(l));
  const grup = kategori.filter((k) => k.tampil).map((k) => ({ k, isi: trip.filter((x) => x.tampil && x.kategori === k.id) })).filter((g) => g.isi.length);
  if (!grup.length) return null;
  return (
    <>
      {grup.map(({ k, isi }, i) => (
        <section key={k.id} id={`kategori-${k.id}`} className={`scroll-mt-24 py-12 sm:py-16 ${i % 2 === 0 ? "bg-soft" : ""}`}>
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4" data-muncul="">
              <div>
                <h2 className="text-[clamp(32px,4.4vw,50px)]">{tx(k.nama, l)}</h2>
                {tx(k.ringkas, l) && <p className="mt-2 max-w-[58ch] text-[16px] text-ink2">{tx(k.ringkas, l)}</p>}
              </div>
              {k.id === ID_LIVEABOARD && adaLiveaboard && <TombolSemua href={`/${l}/liveaboard`} label={t("liveaboard.lihatSemua")} />}
            </div>
            <KisiKartu kelas={`mt-8 ${KISI_TIGA}`} {...kisi(isi, (x, p) => <KartuTrip trip={x} l={l} lebar={p.lebar} sempit={p.sempit} />)} />
          </div>
        </section>
      ))}
    </>
  );
}

/** Kartu edukasi selam di halaman Trip. Ikonnya Tanda Arah dari merek, tanpa nomor. */
export function DaftarEdukasi({ b, butir, l }: { b: KepalaBagian; butir: Edukasi[]; l: Locale }) {
  if (!butir.length) return null;
  return (
    <section id="edukasi" className="bg-soft py-16 sm:py-24">
      <div className="wrap">
        <KepalaBagianSitus b={b} l={l} />
        <div className={`mt-10 ${KISI_TIGA_TEKS}`}>
          {butir.map((e, i) => (
            <article key={e.id} data-muncul="" style={{ "--tunda": `${(i % 3) * 90}ms` } as React.CSSProperties} className={`${tempatTiga(i, butir.length, false).kelas} rounded-card bg-white p-6 shadow-card sm:p-7`}>
              <Image src="/brand/grafis/tanda-arah.svg" alt="" width={100} height={100} unoptimized aria-hidden className="h-8 w-8 -rotate-12" />
              <h3 className="mt-4 text-[26px] leading-tight">{tx(e.judul, l)}</h3>
              {tx(e.isi, l) && <p className="mt-2 text-[15.5px] text-ink2">{tx(e.isi, l)}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HargaHomestay({ h, l, besar = false, sempit = false, tengah = false }: { h: Homestay; l: Locale; besar?: boolean; sempit?: boolean; tengah?: boolean }) {
  const t = buatT(getMessages(l));
  return <HargaMulai harga={h.hargaMulai} l={l} besar={besar} sempit={sempit} tengah={tengah} label={{ dari: t("homestay.dari"), per: t("homestay.perMalam"), tanya: t("homestay.tanyaHarga") }} />;
}

/** Kartu homestay, rupanya sama dengan kartu trip (permintaan pemilik, November 2026). */
export function KartuHomestay({ h, l, lebar = false, sempit = false }: { h: Homestay; l: Locale; lebar?: boolean; sempit?: boolean }) {
  const lokasi = tx(h.lokasi, l);
  const fasilitas = txDaftar(h.fasilitas, l).slice(0, 3).join(" · ");
  return (
    <KartuFoto href={`/${l}/homestay/${h.slug}`} sampul={h.foto[0]} nama={tx(h.nama, l)}
      meta={lokasi ? [<Meta key="l" ikon={<IkonPin size={16} className="flex-none text-tanda" />} teks={lokasi} />] : []} sorot={fasilitas}
      harga={<HargaHomestay h={h} l={l} sempit={sempit} tengah />} lebar={lebar} sempit={sempit} />
  );
}

/** Kisi kartu homestay di bawah bagian kartu bertumpuk. */
export function DaftarHomestay({ homestay, l, beranda = true }: { homestay: Homestay[]; l: Locale; beranda?: boolean }) {
  const t = buatT(getMessages(l));
  const tampil = homestay.filter((h) => h.tampil);
  if (!tampil.length) return null;
  return (
    <div className={`wrap ${beranda ? "mt-12 sm:mt-16" : ""}`}>
      {beranda && (
        <div className="mb-6 flex sm:justify-end">
          <TombolSemua href={`/${l}/homestay`} label={t("homestay.lihatSemua")} />
        </div>
      )}
      <KisiKartu semuaUkuran={beranda} kelas={KISI_TIGA} {...kisi(tampil, (h, p) => <KartuHomestay h={h} l={l} lebar={p.lebar} sempit={p.sempit} />)} />
    </div>
  );
}

/**
 * Bagian Liveaboard di beranda (permintaan pemilik, November 2026). Latar
 * navy dengan Ukir Sayap samar, foto besar, daftar keunggulan, dan tombol
 * tanya jadwal. Trip berkategori liveaboard tampil sebagai kartu di bawahnya.
 */
export function Liveaboard({ b, trip, l, href, kartu = true, beranda = true }: { b: Konten["liveaboard"]; trip: Trip[]; l: Locale; href: string; kartu?: boolean; beranda?: boolean }) {
  if (!b.tampil) return null;
  const t = buatT(getMessages(l));
  const daftar = kartu ? trip.filter((x) => x.tampil && x.kategori === ID_LIVEABOARD) : [];
  const butir = txDaftar(b.butir, l);
  return (
    <section id="liveaboard" className="relative overflow-hidden bg-navy py-16 text-white sm:py-24">
      <Image src="/brand/grafis/ukir-sayap-putih.svg" alt="" width={993} height={835} unoptimized aria-hidden className="pointer-events-none absolute -right-40 -top-24 w-[760px] max-w-none opacity-[0.06]" />
      <div className="wrap relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
        {b.foto && (
          <div className="relative" data-muncul="kiri">
            {b.tag && <Gelembung teks={b.tag} warna={b.warna} className="absolute -top-5 left-6 z-10 -rotate-3" />}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-malam shadow-lift">
              <Image src={b.foto} alt="" fill sizes="(max-width: 1024px) 100vw, 640px" unoptimized={unopt(b.foto)} className="object-cover" />
            </div>
          </div>
        )}
        <div data-muncul="">
          {tx(b.label, l) && <p className="aksen text-ukir">{tx(b.label, l)}</p>}
          <h2 className="mt-3 text-[clamp(40px,5.6vw,68px)] text-white">{isiJudul(tx(b.judul, l), "text-ukir")}</h2>
          {tx(b.lead, l) && <p className="mt-5 max-w-[50ch] text-[16px] text-kabut">{tx(b.lead, l)}</p>}
          {butir.length > 0 && (
            <ul className="mt-6 grid gap-3">
              {butir.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15.5px] font-semibold text-white">
                  <span aria-hidden className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-ukir/20 text-ukir">✓</span>{s}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {tx(b.tombol, l) && <Link href={href} className="btn btn-koral">{tx(b.tombol, l)}<IkonPanahKanan size={16} /></Link>}
            {beranda && <TombolSemua href={`/${l}/liveaboard`} label={t("liveaboard.lihatSemua")} terang />}
          </div>
        </div>
      </div>
      {daftar.length > 0 && (
        <div className="wrap relative mt-12 sm:mt-16">
          <KisiKartu semuaUkuran={beranda} kelas={KISI_TIGA} {...kisi(daftar, (x, p) => <KartuTrip trip={x} l={l} lebar={p.lebar} sempit={p.sempit} />)} />
        </div>
      )}
    </section>
  );
}

/**
 * Jadwal open trip. Di beranda `sisip`, yaitu menyatu di bagian Trip di bawah
 * kartunya. Di halaman Liveaboard berdiri sebagai bagian sendiri.
 */
export function JadwalOpenTrip({ b, jadwal, trip, l, hrefTanya, sisip = false }: { b: KepalaBagian; jadwal: Jadwal[]; trip: Trip[]; l: Locale; hrefTanya: string; sisip?: boolean }) {
  const t = buatT(getMessages(l));
  const tripDari = new Map(trip.filter((x) => x.tampil).map((x) => [x.id, x]));
  const daftar = jadwal.filter((j) => tripDari.has(j.tripId));
  const Bungkus = ({ children }: { children: React.ReactNode }) => sisip
    ? <div id="jadwal" className="mt-16 grid scroll-mt-24 gap-10 sm:mt-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">{children}</div>
    : <section id="jadwal" className="py-16 sm:py-24"><div className="wrap grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">{children}</div></section>;
  return (
    <Bungkus>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <KepalaBagianSitus b={b} l={l} />
        </div>
        <div className="grid gap-3">
          {daftar.length === 0 && (
            <div className="rounded-card bg-buih p-6">
              <p className="text-[16px] text-navy">{t("jadwal.kosong")}</p>
              <Link href={hrefTanya} className="btn btn-navy mt-4">{t("ajakan.permintaan")}</Link>
            </div>
          )}
          {daftar.map((j, urut) => {
            const x = tripDari.get(j.tripId)!;
            const sisa = sisaKursi(j);
            const tgl = potonganTanggal(j.mulai, j.selesai, l);
            return (
              <article key={j.id} data-muncul="" style={{ "--tunda": `${Math.min(urut, 4) * 80}ms` } as React.CSSProperties} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-card bg-white p-4 shadow-card sm:flex-nowrap sm:p-5">
                <div className="grid w-[112px] flex-none place-items-center rounded-[18px] bg-buih px-3 py-3 text-center">
                  <span className="font-display text-[30px] leading-none text-navy">{tgl.hari}</span>
                  <span className="mt-1 font-aksen text-[15px] uppercase tracking-[0.12em] text-tanda">{tgl.bulan}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[24px] leading-tight">{tx(x.nama, l)}</h3>
                  <p className="mt-1 text-[14px] text-ink2">{[tx(x.durasi, l), tx(j.catatan, l)].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex w-full flex-none items-center justify-between gap-3 sm:w-auto sm:justify-end">
                  <span className={`pill ${sisa === 0 ? "pill-navy" : sisa <= 3 ? "pill-koral" : "pill-ukir"}`}>
                    {sisa === 0 ? t("jadwal.penuh") : sisa === 1 ? t("jadwal.sisaSatu") : t("jadwal.sisa", { n: sisa })}
                  </span>
                  {sisa > 0 && (
                    <Link href={`/${l}/trip/${x.slug}?jadwal=${j.id}#pesan`} className="btn btn-garis min-h-[42px] px-4 text-[14px]">
                      {t("jadwal.pesan")}<IkonPanahKanan size={16} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
    </Bungkus>
  );
}

export function DaftarTitik({ b, titik, l, latar = "bg-soft" }: { b: KepalaBagian; titik: TitikSelam[]; l: Locale; latar?: string }) {
  const t = buatT(getMessages(l));
  const tampil = titik.filter((x) => x.tampil);
  if (!tampil.length) return null;
  return (
    <section id="titik" className={`${latar} py-16 sm:py-24`}>
      <div className="wrap">
        <KepalaBagianSitus b={b} l={l} />
        <KisiKartu kelas={`mt-10 ${KISI_TIGA}`} {...kisi(tampil, (x, p) => {
          const hp = (kelas: string) => (p.sempit ? kelas : "");
          const data = [
            [t("titik.kedalaman"), x.kedalaman],
            [t("titik.arus"), tx(x.arus, l)],
            [t("titik.level"), tx(x.level, l)],
          ].filter(([, v]) => v);
          return (
            <article className={`flex h-full overflow-hidden rounded-card bg-white shadow-card ${p.lebar ? "flex-col md:flex-row" : "flex-col"}`}>
              <div className={`relative flex-none bg-kabut ${p.lebar ? "aspect-[4/3] md:aspect-auto md:w-[46%]" : "aspect-[16/10]"}`}>
                {x.foto && <Image src={x.foto} alt={x.nama} fill sizes={p.sempit ? "(max-width: 640px) 50vw, 420px" : "(max-width: 768px) 100vw, 420px"} unoptimized={unopt(x.foto)} className="object-cover" />}
              </div>
              <div className={`flex flex-1 flex-col p-5 sm:p-6 ${hp("max-sm:p-3.5")}`}>
                {tx(x.wilayah, l) && <p className={`aksen text-[16px] ${hp("max-sm:text-[13px]")}`}>{tx(x.wilayah, l)}</p>}
                <h3 className={`mt-1 text-[28px] ${hp("max-sm:text-[19px] max-sm:leading-[1.05]")}`}>{x.nama}</h3>
                {tx(x.sorotan, l) && <p className={`mt-2 text-[15px] text-ink2 ${hp("max-sm:line-clamp-3 max-sm:text-[13px]")}`}>{tx(x.sorotan, l)}</p>}
                {data.length > 0 && (
                  <dl className={`mt-auto grid grid-cols-3 gap-3 pt-5 ${hp("max-sm:grid-cols-1 max-sm:gap-1.5 max-sm:pt-3")}`}>
                    {data.map(([k, v]) => (
                      <div key={k} className={`rounded-[14px] bg-buih px-3 py-2.5 ${hp("max-sm:px-2.5 max-sm:py-1.5")}`}>
                        <dt className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink2">{k}</dt>
                        <dd className={`mt-0.5 text-[14.5px] font-extrabold leading-tight text-navy ${hp("max-sm:text-[13px]")}`}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </article>
          );
        })} />
      </div>
    </section>
  );
}

export function DaftarUlasan({ b, ulasan, l }: { b: KepalaBagian; ulasan: Ulasan[]; l: Locale }) {
  const tampil = ulasan.filter((u) => u.tampil);
  if (!tampil.length) return null;
  return (
    <section id="ulasan" className="py-16 sm:py-24">
      <div className="wrap">
        <KepalaBagianSitus b={b} l={l} />
        <div className={`mt-10 ${KISI_TIGA_TEKS}`}>
          {tampil.map((u, i) => (
            <figure key={u.id} data-muncul="" style={{ "--tunda": `${(i % 3) * 90}ms` } as React.CSSProperties} className={`${tempatTiga(i, tampil.length, false).kelas} m-0 flex flex-col rounded-card bg-white p-6 shadow-card`}>
              <div className="flex gap-1 text-koral" aria-label={`${u.bintang}/5`}>
                {Array.from({ length: u.bintang }, (_, n) => <IkonBintang key={n} size={18} />)}
              </div>
              <blockquote className="mt-4 flex-1 text-[16.5px] font-semibold leading-relaxed text-navy">{u.teks}</blockquote>
              <figcaption className="mt-5">
                <span className="block font-display text-[22px] text-navy">{u.nama}</span>
                {u.asal && <span className="aksen text-[16px]">{u.asal}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DaftarFaq({ b, faq, l }: { b: KepalaBagian; faq: Faq[]; l: Locale }) {
  const isi = faq.filter((f) => tx(f.tanya, l) && tx(f.jawab, l));
  if (!isi.length) return null;
  return (
    <section id="faq" className="bg-soft py-16 sm:py-24">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <KepalaBagianSitus b={b} l={l} />
        <div className="grid gap-3">
          {isi.map((f, urut) => (
            <details key={f.id} data-muncul="" style={{ "--tunda": `${Math.min(urut, 5) * 70}ms` } as React.CSSProperties} className="group rounded-card bg-white px-5 py-4 shadow-card open:pb-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-extrabold text-navy [&::-webkit-details-marker]:hidden">
                {tx(f.tanya, l)}
                <span aria-hidden className="grid h-8 w-8 flex-none place-items-center rounded-full bg-buih text-[20px] leading-none text-navy transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15.5px] text-ink2">{tx(f.jawab, l)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Ajakan({ judul, lead, tombol, href, l }: { judul: string; lead: string; tombol: string; href: string; l: Locale }) {
  void l;
  return (
    <section className="py-16 sm:py-24">
      <div className="wrap">
        <div data-muncul="zoom" className="relative overflow-hidden rounded-[32px] bg-navy px-6 py-12 text-white sm:px-12 sm:py-16">
          <Image src="/brand/grafis/ukir-sayap-putih.svg" alt="" width={993} height={835} aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 w-[640px] max-w-none opacity-[0.07]" />
          <Image src="/brand/logo/fantasea-manta-latar-gelap.png" alt="" width={993} height={835} aria-hidden unoptimized className="pointer-events-none absolute -right-6 bottom-0 hidden w-[300px] -rotate-6 opacity-95 md:block lg:right-10 lg:w-[360px]" />
          <div className="relative max-w-[600px]">
            <h2 className="text-[clamp(44px,7vw,80px)] text-white">{isiJudul(judul, "text-ukir")}</h2>
            {lead && <p className="mt-5 text-[17px] text-kabut">{lead}</p>}
            {tombol && <a href={href} className="btn btn-koral mt-8" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{tombol}</a>}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Daftar termasuk dan belum termasuk di halaman trip. */
export function DaftarCentang({ isi, centang }: { isi: string[]; centang: boolean }) {
  if (!isi.length) return null;
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {isi.map((s) => (
        <li key={s} className="flex items-start gap-2.5 text-[15.5px] text-navy">
          <span aria-hidden className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full ${centang ? "bg-ukir/15 text-tanda" : "bg-[#F1F3F5] text-ink2"}`}>
            {centang ? "✓" : "×"}
          </span>
          {s}
        </li>
      ))}
    </ul>
  );
}
export { txDaftar };
