"use client";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { IkonPanahKanan, IkonPanahKiri } from "./Ikon";

/** Galeri foto trip: satu foto besar membulat dan deretan foto kecil di bawahnya. */
export default function GaleriTrip({ foto, alt }: { foto: string[]; alt: string }) {
  const { t } = useI18n();
  const [aktif, setAktif] = useState(0);
  if (!foto.length) return null;
  const n = foto.length;
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-kabut shadow-lift">
        {foto.map((f, i) => (
          <Image key={f + i} src={f} alt={i === 0 ? alt : ""} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 720px" unoptimized={f.startsWith("/unggahan/")}
            className={`object-cover transition-opacity duration-500 ${i === aktif ? "opacity-100" : "opacity-0"}`} />
        ))}
        {n > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button type="button" className="btn-bulat" onClick={() => setAktif((a) => (a - 1 + n) % n)} aria-label={t("gerbang.sebelumnya")}><IkonPanahKiri /></button>
            <button type="button" className="btn-bulat" onClick={() => setAktif((a) => (a + 1) % n)} aria-label={t("gerbang.berikutnya")}><IkonPanahKanan /></button>
          </div>
        )}
      </div>
      {n > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto overflow-y-hidden pb-1">
          {foto.map((f, i) => (
            <button key={f + i} type="button" onClick={() => setAktif(i)} aria-label={t("gerbang.foto", { n: i + 1 })} aria-pressed={i === aktif}
              className={`relative h-16 w-24 flex-none overflow-hidden rounded-[14px] border-2 transition ${i === aktif ? "border-navy" : "border-transparent opacity-75 hover:opacity-100"}`}>
              <Image src={f} alt="" fill sizes="96px" unoptimized={f.startsWith("/unggahan/")} className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
