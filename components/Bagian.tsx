import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buatT } from "@/lib/i18n/t";
import { getMessages } from "@/lib/i18n/messages";
import { rupiah, potonganTanggal } from "@/lib/format";
import { KISI_TIGA, KISI_TIGA_TEKS, tempatTiga } from "@/lib/kisi";
import KisiKartu from "./KisiKartu";
import { sisaKursi, tx, txDaftar, type Faq, type Homestay, type Jadwal, type KepalaBagian, type TitikSelam, type Trip, type Ulasan } from "@/lib/konten";
import { IkonBintang, IkonJam, IkonMasker, IkonPanahKanan, IkonPin } from "./Ikon";
import { isiJudul } from "./Judul";

const unopt = (src: string) => src.startsWith("/unggahan/");

/** Label aksen, judul berwarna, dan kalimat pembuka bagian. */
export function KepalaBagianSitus({ b, l, tengah = false }: { b: KepalaBagian; l: Locale; tengah?: boolean }) {
  return (
    <div className={tengah ? "mx-auto max-w-[760px] text-center" : "max-w-[760px]"}>
      {tx(b.label, l) && <p className="aksen">{tx(b.label, l)}</p>}
      <h2 className="mt-3 text-[clamp(38px,5.6vw,64px)]">{isiJudul(tx(b.judul, l))}</h2>
      {tx(b.lead, l) && <p className={`mt-5 text-[16px] text-ink2 ${tengah ? "mx-auto" : ""} max-w-[56ch]`}>{tx(b.lead, l)}</p>}
    </div>
  );
}

/** Harga mulai di kartu dan halaman. `sempit` untuk kartu dua kolom di ponsel. */
function HargaMulai({ harga, l, label, besar = false, sempit = false }: { harga: number; l: Locale; label: { dari: string; per: string; tanya: string }; besar?: boolean; sempit?: boolean }) {
  if (!harga) return <span className={`font-display leading-none text-navy ${besar ? "text-[32px]" : "text-[24px]"} ${sempit ? "max-sm:text-[18px]" : ""}`}>{label.tanya}</span>;
  return (
    <span className="grid leading-none">
      <span className={`text-[12.5px] font-bold text-ink2 ${sempit ? "max-sm:text-[11.5px]" : ""}`}>{label.dari}</span>
      <span className={`mt-1 font-display text-navy ${besar ? "text-[36px]" : "text-[26px]"} ${sempit ? "max-sm:text-[20px]" : ""}`}>{rupiah(harga, l)}</span>
      <span className={`mt-1 text-[12.5px] font-semibold text-ink2 ${sempit ? "max-sm:text-[11.5px]" : ""}`}>{label.per}</span>
    </span>
  );
}

export function HargaTrip({ trip, l, besar = false, sempit = false }: { trip: Trip; l: Locale; besar?: boolean; sempit?: boolean }) {
  const t = buatT(getMessages(l));
  return <HargaMulai harga={trip.hargaMulai} l={l} besar={besar} sempit={sempit} label={{ dari: t("trip.dari"), per: t("trip.perOrang"), tanya: t("trip.tanyaHarga") }} />;
}

/**
 * Kerangka kartu berfoto untuk trip dan homestay. `lebar` untuk kartu yang
 * melebar mendatar di layar lebar. `sempit` untuk kartu yang berbagi baris
 * di ponsel (dua kolom, permintaan pemilik November 2026): tulisan
 * diperkecil, ringkasan dipotong tiga baris, pil disembunyikan, dan tombol
 * selebar kartu.
 */
function KartuFoto({ href, sampul, pil, nama, ringkas, pilBawah, harga, tombol, lebar = false, sempit = false }: {
  href: string; sampul?: string; pil?: React.ReactNode; nama: string; ringkas: string; pilBawah?: React.ReactNode; harga: React.ReactNode; tombol: string; lebar?: boolean; sempit?: boolean;
}) {
  const hp = (kelas: string) => (sempit ? kelas : "");
  return (
    <article className={`group flex h-full overflow-hidden rounded-card bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift ${lebar ? "flex-col md:flex-row" : "flex-col"}`}>
      <Link href={href} className={`relative block flex-none overflow-hidden bg-kabut ${lebar ? "aspect-[4/3] md:aspect-auto md:w-[46%]" : "aspect-[4/3]"}`} tabIndex={-1} aria-hidden>
        {sampul && <Image src={sampul} alt="" fill sizes={sempit ? "(max-width: 640px) 50vw, 420px" : "(max-width: 768px) 100vw, 420px"} unoptimized={unopt(sampul)} className="object-cover transition duration-700 group-hover:scale-[1.04]" />}
        {pil && <span className={`pill pill-terang absolute left-3 top-3 max-w-[calc(100%-24px)] bg-white/95 ${hp("max-sm:left-2 max-sm:top-2 max-sm:max-w-[calc(100%-16px)] max-sm:px-2 max-sm:text-[11px]")}`}>{pil}</span>}
      </Link>
      <div className={`flex flex-1 flex-col p-5 sm:p-6 ${hp("max-sm:p-3.5")}`}>
        <h3 className={`text-[28px] sm:text-[30px] ${hp("max-sm:text-[19px] max-sm:leading-[1.05]")}`}><Link href={href} className="hover:text-tanda">{nama}</Link></h3>
        {ringkas && <p className={`mt-2 text-[15px] text-ink2 ${hp("max-sm:line-clamp-3 max-sm:text-[13px]")}`}>{ringkas}</p>}
        {pilBawah && <div className={`mt-4 flex flex-wrap gap-2 ${hp("max-sm:hidden")}`}>{pilBawah}</div>}
        <div className={`mt-auto flex items-end justify-between gap-3 pt-6 ${hp("max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5 max-sm:pt-4")}`}>
          {harga}
          <Link href={href} className={`btn btn-navy min-h-[44px] px-5 text-[14px] ${hp("max-sm:min-h-[38px] max-sm:w-full max-sm:px-3 max-sm:text-[13px]")}`}>{tombol}</Link>
        </div>
      </div>
    </article>
  );
}

export function KartuTrip({ trip, l, lebar = false, sempit = false }: { trip: Trip; l: Locale; lebar?: boolean; sempit?: boolean }) {
  const t = buatT(getMessages(l));
  const pil = [
    tx(trip.durasi, l) && <span key="d" className="pill pill-terang"><IkonJam size={15} />{tx(trip.durasi, l)}</span>,
    trip.selam > 0 && <span key="s" className="pill pill-terang"><IkonMasker size={15} />{t("trip.selam", { n: trip.selam })}</span>,
  ].filter(Boolean);
  return (
    <KartuFoto href={`/${l}/trip/${trip.slug}`} sampul={trip.foto[0]} pil={t(`trip.kategori.${trip.kategori}`)} nama={tx(trip.nama, l)} ringkas={tx(trip.ringkas, l)}
      pilBawah={pil.length ? pil : undefined} harga={<HargaTrip trip={trip} l={l} sempit={sempit} />} tombol={t("trip.lihat")} lebar={lebar} sempit={sempit} />
  );
}

/** Kisi kartu dengan tempat tiga kolom dan tombol Lihat lebih banyak di ponsel. */
function kisi<T>(daftar: T[], kartu: (x: T, p: ReturnType<typeof tempatTiga>) => React.ReactNode) {
  const tempat = daftar.map((_, i) => tempatTiga(i, daftar.length));
  return { kartu: daftar.map((x, i) => <Fragment key={i}>{kartu(x, tempat[i])}</Fragment>), kelasKartu: tempat.map((p) => p.kelas) };
}

export function DaftarTrip({ b, trip, l }: { b: KepalaBagian; trip: Trip[]; l: Locale }) {
  const tampil = trip.filter((x) => x.tampil);
  if (!tampil.length) return null;
  return (
    <section id="trip" className="bg-soft py-16 sm:py-24">
      <div className="wrap">
        <KepalaBagianSitus b={b} l={l} />
        <KisiKartu kelas={`mt-10 ${KISI_TIGA}`} {...kisi(tampil, (x, p) => <KartuTrip trip={x} l={l} lebar={p.lebar} sempit={p.sempit} />)} />
      </div>
    </section>
  );
}

export function HargaHomestay({ h, l, besar = false, sempit = false }: { h: Homestay; l: Locale; besar?: boolean; sempit?: boolean }) {
  const t = buatT(getMessages(l));
  return <HargaMulai harga={h.hargaMulai} l={l} besar={besar} sempit={sempit} label={{ dari: t("homestay.dari"), per: t("homestay.perMalam"), tanya: t("homestay.tanyaHarga") }} />;
}

/** Kartu homestay, rupanya sama dengan kartu trip (permintaan pemilik, November 2026). */
export function KartuHomestay({ h, l, lebar = false, sempit = false }: { h: Homestay; l: Locale; lebar?: boolean; sempit?: boolean }) {
  const t = buatT(getMessages(l));
  const fasilitas = txDaftar(h.fasilitas, l).slice(0, 3);
  const lokasi = tx(h.lokasi, l);
  return (
    <KartuFoto href={`/${l}/homestay/${h.slug}`} sampul={h.foto[0]} nama={tx(h.nama, l)} ringkas={tx(h.ringkas, l)}
      pil={lokasi ? <><IkonPin size={15} className="flex-none" /><span className="truncate">{lokasi}</span></> : undefined}
      pilBawah={fasilitas.length ? fasilitas.map((f) => <span key={f} className="pill pill-terang">{f}</span>) : undefined}
      harga={<HargaHomestay h={h} l={l} sempit={sempit} />} tombol={t("homestay.lihat")} lebar={lebar} sempit={sempit} />
  );
}

/** Kisi kartu homestay di bawah bagian kartu bertumpuk. */
export function DaftarHomestay({ homestay, l }: { homestay: Homestay[]; l: Locale }) {
  const tampil = homestay.filter((h) => h.tampil);
  if (!tampil.length) return null;
  return (
    <div className="wrap mt-12 sm:mt-16">
      <KisiKartu kelas={KISI_TIGA} {...kisi(tampil, (h, p) => <KartuHomestay h={h} l={l} lebar={p.lebar} sempit={p.sempit} />)} />
    </div>
  );
}

export function JadwalOpenTrip({ b, jadwal, trip, l, hrefTanya }: { b: KepalaBagian; jadwal: Jadwal[]; trip: Trip[]; l: Locale; hrefTanya: string }) {
  const t = buatT(getMessages(l));
  const tripDari = new Map(trip.filter((x) => x.tampil).map((x) => [x.id, x]));
  const daftar = jadwal.filter((j) => tripDari.has(j.tripId));
  return (
    <section id="jadwal" className="py-16 sm:py-24">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
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
          {daftar.map((j) => {
            const x = tripDari.get(j.tripId)!;
            const sisa = sisaKursi(j);
            const tgl = potonganTanggal(j.mulai, j.selesai, l);
            return (
              <article key={j.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-card bg-white p-4 shadow-card sm:flex-nowrap sm:p-5">
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
      </div>
    </section>
  );
}

export function DaftarTitik({ b, titik, l }: { b: KepalaBagian; titik: TitikSelam[]; l: Locale }) {
  const t = buatT(getMessages(l));
  const tampil = titik.filter((x) => x.tampil);
  if (!tampil.length) return null;
  return (
    <section id="titik" className="bg-soft py-16 sm:py-24">
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
            <figure key={u.id} className={`${tempatTiga(i, tampil.length, false).kelas} m-0 flex flex-col rounded-card bg-white p-6 shadow-card`}>
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
          {isi.map((f) => (
            <details key={f.id} className="group rounded-card bg-white px-5 py-4 shadow-card open:pb-5 sm:px-6">
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
        <div className="relative overflow-hidden rounded-[32px] bg-navy px-6 py-12 text-white sm:px-12 sm:py-16">
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
