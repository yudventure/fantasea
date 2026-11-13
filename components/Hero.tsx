import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { tx, type Konten } from "@/lib/konten";
import Gelembung from "./Gelembung";
import { Judul } from "./Judul";

/**
 * Hero ala referensi: judul besar di tengah, lima kartu foto mengipas
 * dengan gelembung tag dan kalimat pendek, tanpa tombol.
 *
 * Permintaan pemilik, November 2026:
 * - Hero selalu tepat satu layar penuh di semua ukuran layar, jadi bagian
 *   di bawahnya tidak mengintip. Tingginya minimal 100svh (100vh untuk
 *   peramban lama), dan ukuran judul serta kartu mengikuti tinggi layar
 *   (vh) selain lebarnya, supaya isinya tetap utuh di layar pendek.
 * - Judul dua baris di layar lebar. Baris baru dari panel tetap baris baru,
 *   dan lebarnya cukup untuk satu baris judul tanpa patah (max 26ch, ukuran
 *   ikut lebar layar). Judul tanpa baris baru dibagi rata (text-balance).
 * - Kartu foto lebih besar, dan kartu yang disorot pointer membesar jelas:
 *   naik, membesar, maju ke depan, bayangannya menebal, fotonya ikut
 *   mendekat. Rotasi 3D ada di <figure>, pembesaran di lapisan dalam,
 *   supaya keduanya tidak saling menimpa transform.
 * - Latar diberi elemen grafis merek yang samar (permintaan pemilik, November
 *   2026): Ukir Sayap besar di belakang judul, beberapa Pulau Segi, dan Tanda
 *   Arah yang ditebar (paling banyak enam, sesuai pedoman merek). Semuanya
 *   tipis supaya foto dan judul tetap yang paling menonjol.
 * Di ponsel hanya tiga kartu tengah yang tampil supaya tidak sesak.
 */
const GAYA = [
  "[transform:rotateY(26deg)_rotate(-5deg)_translateY(34px)_scale(.84)] hidden sm:block",
  "[transform:rotateY(13deg)_rotate(-2deg)_translateY(10px)_scale(.94)]",
  "[transform:translateY(-4px)]",
  "[transform:rotateY(-13deg)_rotate(2deg)_translateY(10px)_scale(.94)]",
  "[transform:rotateY(-26deg)_rotate(5deg)_translateY(34px)_scale(.84)] hidden sm:block",
];
const URUTAN_Z = ["z-[1]", "z-[2]", "z-[3]", "z-[2]", "z-[1]"];

/** Elemen grafis merek di latar hero, sengaja samar. Posisi dalam persen supaya ikut ukuran layar. */
const PULAU = [
  "left-[-5%] top-[16%] w-[clamp(120px,16vw,260px)] -rotate-[8deg] opacity-[0.45]",
  "right-[2%] top-[12%] w-[clamp(90px,10vw,170px)] rotate-[12deg] opacity-[0.38] hidden sm:block",
  "right-[8%] bottom-[6%] w-[clamp(80px,8vw,130px)] rotate-[24deg] opacity-[0.32] hidden sm:block",
];
const ARAH = [
  { src: "tanda-arah", kelas: "left-[11%] top-[30%] w-[clamp(20px,2.2vw,36px)] -rotate-[14deg] hidden sm:block" },
  { src: "tanda-arah-belah", kelas: "right-[15%] top-[33%] w-[clamp(18px,2vw,30px)] rotate-[18deg] hidden sm:block" },
  { src: "tanda-arah", kelas: "left-[5%] bottom-[16%] w-[clamp(18px,2vw,32px)] rotate-[32deg] hidden sm:block" },
  { src: "tanda-arah-belah", kelas: "right-[5%] bottom-[24%] w-[clamp(20px,2.2vw,36px)] -rotate-[22deg] hidden sm:block" },
  // Di ponsel hanya satu Tanda Arah, di ruang kosong di bawah header.
  { src: "tanda-arah", kelas: "right-[10%] top-[15%] w-[22px] -rotate-[14deg] sm:hidden" },
];

function HiasanHero() {
  return (
    <div aria-hidden data-paralaks="0.3" className="pointer-events-none absolute inset-0 overflow-hidden will-change-transform">
      <Image src="/brand/grafis/ukir-sayap.svg" alt="" width={993} height={835} unoptimized priority
        className="absolute left-1/2 top-[17%] w-[170vw] max-w-none -translate-x-1/2 opacity-[0.07] sm:top-[4%] sm:w-[min(1180px,150vw)]" />
      {PULAU.map((k, i) => <Image key={i} src="/brand/grafis/pulau-segi.svg" alt="" width={300} height={300} unoptimized className={`absolute ${k}`} />)}
      {ARAH.map((a, i) => <Image key={i} src={`/brand/grafis/${a.src}.svg`} alt="" width={100} height={100} unoptimized className={`absolute opacity-[0.16] ${a.kelas}`} />)}
    </div>
  );
}

export default function Hero({ k, l }: { k: Konten; l: Locale }) {
  const h = k.hero;
  return (
    <section className="relative flex min-h-[100vh] flex-col overflow-hidden bg-gradient-to-b from-[#EAF2F7] via-[#F6FAFC] to-white pb-[3vh] pt-[84px] supports-[height:100svh]:min-h-[100svh] sm:pt-[100px]">
      <HiasanHero />
      <div className="relative flex flex-1 translate-y-[clamp(12px,2.5vh,32px)] flex-col justify-center">
        <div className="wrap hero-masuk text-center">
          <Judul as="h1" teks={tx(h.judul, l)} className="mx-auto max-w-[26ch] text-balance text-[clamp(28px,min(9.6vw,9vh),96px)] leading-[0.95]" />
        </div>

        <div className="relative mx-auto mt-[3.5vh] flex w-full max-w-[1500px] items-end justify-center px-2 [perspective:1400px]" aria-hidden>
          {h.kartu.map((c, i) => (
            <figure key={i} className={`group relative -mx-3 m-0 w-[min(38vw,26vh)] max-w-[330px] flex-none sm:-mx-5 sm:w-[min(21vw,31vh)] ${URUTAN_Z[i]} ${GAYA[i]} hover:z-20`}>
              <div className="hero-kartu" style={{ "--tunda": `${180 + i * 90}ms` } as React.CSSProperties}>
              <div className="relative transition-transform duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-[1.15] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100">
                {c.foto && (
                  <div className="foto-kartu aspect-[4/5] transition-shadow duration-500 group-hover:shadow-[0_36px_64px_-18px_rgba(19,31,51,.6)]">
                    <div className="isi">
                      <Image src={c.foto} alt="" fill sizes="(max-width: 640px) 38vw, 330px" priority={i === 2} unoptimized={c.foto.startsWith("/unggahan/")}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08] motion-reduce:group-hover:scale-100" />
                    </div>
                  </div>
                )}
                {c.tag && <Gelembung teks={c.tag} warna={c.warna} className={`absolute -top-4 ${i < 2 ? "left-2" : "right-2"} z-[4] -rotate-3`} />}
              </div>
              </div>
            </figure>
          ))}
        </div>

        <div className="wrap hero-masuk mt-[4.5vh] text-center" style={{ "--tunda": "620ms" } as React.CSSProperties}>
          {tx(h.lead, l) && <p className="mx-auto max-w-[52ch] text-[clamp(15px,1.9vh,18px)] text-ink2">{tx(h.lead, l)}</p>}
        </div>
      </div>
    </section>
  );
}
