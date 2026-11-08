import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { tx, type Konten } from "@/lib/konten";
import Gelembung from "./Gelembung";
import { Judul } from "./Judul";

/**
 * Hero ala referensi: judul besar di tengah, lima kartu foto mengipas
 * dengan gelembung tag, kalimat pendek, dan dua tombol. Kartu luar miring
 * menjauh dengan perspektif, kartu tengah paling besar dan tegak.
 * Di ponsel hanya tiga kartu tengah yang tampil supaya tidak sesak.
 */
const GAYA = [
  "[transform:rotateY(26deg)_rotate(-5deg)_translateY(34px)_scale(.84)] hidden sm:block",
  "[transform:rotateY(13deg)_rotate(-2deg)_translateY(10px)_scale(.94)]",
  "z-[3] [transform:translateY(-4px)]",
  "[transform:rotateY(-13deg)_rotate(2deg)_translateY(10px)_scale(.94)]",
  "[transform:rotateY(-26deg)_rotate(5deg)_translateY(34px)_scale(.84)] hidden sm:block",
];
const URUTAN_Z = ["z-[1]", "z-[2]", "z-[3]", "z-[2]", "z-[1]"];

export default function Hero({ k, l }: { k: Konten; l: Locale }) {
  const h = k.hero;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F1F6F9] via-white to-white pb-16 pt-10 sm:pt-14">
      <div className="wrap text-center">
        <Judul as="h1" teks={tx(h.judul, l)} className="mx-auto max-w-[16ch] text-[clamp(44px,8.4vw,92px)] leading-[0.95]" />
      </div>

      <div className="relative mx-auto mt-8 flex max-w-[1180px] items-end justify-center px-2 [perspective:1400px] sm:mt-10" aria-hidden>
        {h.kartu.map((c, i) => (
          <figure key={i} className={`group relative -mx-3 m-0 w-[34vw] max-w-[230px] flex-none transition-transform duration-500 sm:-mx-4 sm:w-[19vw] ${URUTAN_Z[i]} ${GAYA[i]}`}>
            {c.foto && (
              <div className="foto-kartu aspect-[4/5] transition-transform duration-500 group-hover:-translate-y-2">
                <div className="isi">
                  <Image src={c.foto} alt="" fill sizes="(max-width: 640px) 34vw, 230px" priority={i === 2} unoptimized={c.foto.startsWith("/unggahan/")} className="object-cover" />
                </div>
              </div>
            )}
            {c.tag && <Gelembung teks={c.tag} warna={c.warna} className={`absolute -top-4 ${i < 2 ? "left-2" : "right-2"} z-[4] -rotate-3`} />}
          </figure>
        ))}
      </div>

      <div className="wrap mt-10 text-center">
        {tx(h.lead, l) && <p className="mx-auto max-w-[52ch] text-[16px] text-ink2 sm:text-[17px]">{tx(h.lead, l)}</p>}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {tx(h.tombol1, l) && <Link href="#jadwal" className="btn btn-navy">{tx(h.tombol1, l)}</Link>}
          {tx(h.tombol2, l) && <Link href="#titik" className="btn btn-terang">{tx(h.tombol2, l)}</Link>}
        </div>
      </div>
    </section>
  );
}
