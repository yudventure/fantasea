"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/context";
import type { Kartu } from "@/lib/konten";
import Gelembung from "./Gelembung";
import { IkonPanahAtas, IkonPanahBawah } from "./Ikon";
import { isiJudul } from "./Judul";

/**
 * Bagian kedua referensi: teks di kiri, empat kartu foto bertumpuk menurun
 * di kanan dengan gelembung tag, dan tombol atas dan bawah untuk menggeser
 * urutannya. Tempat kartu ditentukan urutan, jadi pergeseran beranimasi.
 *
 * Permintaan pemilik, November 2026: bagian ini jadi pembuka homestay
 * (Find your accommodation with us), tanpa dua tombol, dan kartu homestay
 * tampil di bawahnya (`children`, dari DaftarHomestay).
 */
const TEMPAT = [
  "left-0 top-[6%] w-[38%] -rotate-[3deg]",
  "left-[22%] top-[18%] w-[36%] rotate-[1deg]",
  "left-[44%] top-[22%] w-[34%] -rotate-[1deg]",
  "left-[64%] top-[32%] w-[33%] rotate-[2deg]",
];

export default function Jelajah({ id, label, judul, lead, kartu, children }: {
  id?: string; label: string; judul: string; lead: string; kartu: Kartu[]; children?: ReactNode;
}) {
  const { t } = useI18n();
  const ada = kartu.filter((c) => c.foto);
  const [geser, setGeser] = useState(0);
  const n = ada.length;
  const putar = (arah: number) => setGeser((g) => (g + arah + n) % n);

  return (
    <section id={id} className="overflow-hidden py-16 sm:py-24">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          {label && <p className="aksen">{label}</p>}
          <h2 className="mt-3 text-[clamp(40px,5.6vw,68px)]">{isiJudul(judul)}</h2>
          {lead && <p className="mt-6 max-w-[46ch] text-[16px] text-ink2">{lead}</p>}
        </div>

        {n > 0 && (
          <div className="relative">
            <div className="relative aspect-[1.25/1] w-full">
              {ada.map((c, i) => {
                const tempat = (i - geser + n) % n;
                return (
                  <figure key={c.foto + i} className={`absolute m-0 transition-all duration-700 ease-out ${TEMPAT[tempat] ?? TEMPAT[3]}`} style={{ zIndex: 10 + tempat }}>
                    <div className="foto-kartu aspect-[4/5]">
                      <div className="isi">
                        <Image src={c.foto} alt="" fill sizes="(max-width: 1024px) 40vw, 260px" unoptimized={c.foto.startsWith("/unggahan/")} className="object-cover" />
                      </div>
                    </div>
                    {c.tag && <Gelembung teks={c.tag} warna={c.warna} className="absolute -top-4 right-3 rotate-2" />}
                  </figure>
                );
              })}
            </div>
            {n > 1 && (
              <div className="absolute -right-1 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 sm:-right-3">
                <button type="button" className="btn-bulat" onClick={() => putar(-1)} aria-label={t("jelajah.sebelumnya")}><IkonPanahAtas /></button>
                <button type="button" className="btn-bulat" onClick={() => putar(1)} aria-label={t("jelajah.berikutnya")}><IkonPanahBawah /></button>
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
