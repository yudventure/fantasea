"use client";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import type { WarnaTag } from "@/lib/konten";
import Gelembung from "./Gelembung";
import { IkonPanahKanan, IkonPanahKiri, IkonPutar, IkonTitikTiga } from "./Ikon";
import { isiJudul } from "./Judul";

export interface FotoGerbang { foto: string; keterangan: string }

/**
 * Bagian ketiga referensi: judul besar, lalu satu foto lebar membulat dengan
 * deretan foto kecil di kiri atas, tombol Tonton di kiri bawah, panah di
 * kanan bawah, tombol titik tiga untuk keterangan, dan gelembung tag.
 */
export default function Gerbang({ label, judul, lead, foto, video, tag, warna }: {
  label: string; judul: string; lead: string; foto: FotoGerbang[]; video: string; tag: string; warna: WarnaTag;
}) {
  const { t } = useI18n();
  const [aktif, setAktif] = useState(0);
  const [info, setInfo] = useState(false);
  if (!foto.length) return null;
  const n = foto.length;
  const pindah = (arah: number) => { setAktif((a) => (a + arah + n) % n); };
  const kini = foto[aktif] ?? foto[0];

  return (
    <section className="py-16 sm:py-24">
      <div className="wrap">
        <div data-muncul="">
          {label && <p className="aksen">{label}</p>}
          <h2 className="mt-3 text-[clamp(40px,6.2vw,72px)]">{isiJudul(judul)}</h2>
          {lead && <p className="mt-5 max-w-[52ch] text-ink2">{lead}</p>}
        </div>

        <div className="relative mt-10" data-muncul="zoom">
          {tag && <Gelembung teks={tag} warna={warna} className="absolute -top-5 right-6 z-20 rotate-2 sm:right-14" />}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-kabut shadow-lift sm:aspect-[16/8.5]">
            {foto.map((f, i) => (
              <Image key={f.foto + i} src={f.foto} alt={f.keterangan} fill sizes="(max-width: 1200px) 100vw, 1200px" unoptimized={f.foto.startsWith("/unggahan/")}
                className={`object-cover transition-opacity duration-700 ${i === aktif ? "opacity-100" : "opacity-0"}`} />
            ))}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-malam/45 via-transparent to-transparent" />

            {n > 1 && (
              <div className="absolute left-3 top-3 flex flex-col gap-2 sm:left-5 sm:top-5">
                {foto.slice(0, 4).map((f, i) => (
                  <button key={i} type="button" onClick={() => setAktif(i)} aria-label={t("gerbang.foto", { n: i + 1 })} aria-pressed={i === aktif}
                    className={`relative h-12 w-12 overflow-hidden rounded-[12px] border-2 transition sm:h-16 sm:w-16 ${i === aktif ? "border-white shadow-lift" : "border-white/60 opacity-80 hover:opacity-100"}`}>
                    <Image src={f.foto} alt="" fill sizes="64px" unoptimized={f.foto.startsWith("/unggahan/")} className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <button type="button" onClick={() => setInfo((v) => !v)} aria-expanded={info} aria-label={t("gerbang.keterangan")}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-navy backdrop-blur transition hover:bg-white sm:right-5 sm:top-5">
              <IkonTitikTiga size={22} />
            </button>
            {info && kini.keterangan && (
              <p className="absolute right-3 top-16 max-w-[260px] rounded-[16px] bg-white px-4 py-3 text-[14px] font-semibold text-navy shadow-lift sm:right-5 sm:top-[76px]">{kini.keterangan}</p>
            )}

            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
              <div className="min-w-0">
                {video ? (
                  <a href={video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-pill bg-white py-2 pl-2 pr-4 text-[14px] font-extrabold text-navy shadow-lift hover:bg-buih">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-white"><IkonPutar size={14} /></span>
                    {t("gerbang.tonton")}
                  </a>
                ) : kini.keterangan ? (
                  <p className="max-w-[40ch] text-[14px] font-bold text-white [text-shadow:0_1px_10px_rgba(0,0,0,.4)]">{kini.keterangan}</p>
                ) : null}
              </div>
              {n > 1 && (
                <div className="flex flex-none gap-2">
                  <button type="button" className="btn-bulat" onClick={() => pindah(-1)} aria-label={t("gerbang.sebelumnya")}><IkonPanahKiri /></button>
                  <button type="button" className="btn-bulat" onClick={() => pindah(1)} aria-label={t("gerbang.berikutnya")}><IkonPanahKanan /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
