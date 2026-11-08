"use client";
import { useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/context";
import { MAKS_KARTU_PONSEL } from "@/lib/kisi";
import { IkonPanahAtas, IkonPanahBawah } from "./Ikon";

/**
 * Kisi kartu dengan tombol Lihat lebih banyak di ponsel (permintaan pemilik,
 * November 2026). Di bawah md hanya MAKS_KARTU_PONSEL kartu yang tampil.
 * Tombolnya tulisan saja tanpa latar, dengan panah kecil di bawahnya, dan
 * berganti jadi Lihat lebih sedikit setelah terbuka. Di layar md ke atas
 * semua kartu selalu tampil dan tombolnya tidak ada.
 */
export default function KisiKartu({ kelas, kartu, kelasKartu }: { kelas: string; kartu: ReactNode[]; kelasKartu: string[] }) {
  const { t } = useI18n();
  const [buka, setBuka] = useState(false);
  const tombol = useRef<HTMLButtonElement>(null);
  const lebih = kartu.length > MAKS_KARTU_PONSEL;

  function alih() {
    const tutup = buka;
    setBuka(!buka);
    // Setelah dilipat, tombolnya naik jauh. Gulir ke tombol supaya tamu tidak kehilangan tempat.
    if (tutup) requestAnimationFrame(() => tombol.current?.scrollIntoView({ block: "center" }));
  }

  return (
    <>
      <div className={kelas}>
        {kartu.map((k, i) => (
          <div key={i} className={`${kelasKartu[i] ?? ""} ${!buka && i >= MAKS_KARTU_PONSEL ? "max-md:hidden" : ""}`}>{k}</div>
        ))}
      </div>
      {lebih && (
        <button ref={tombol} type="button" onClick={alih} aria-expanded={buka}
          className="mx-auto mt-6 flex flex-col items-center gap-0.5 px-4 py-2 text-[15px] font-extrabold text-navy transition hover:text-tanda md:hidden">
          {buka ? t("kartu.sedikit") : t("kartu.lagi")}
          {buka ? <IkonPanahAtas size={16} /> : <IkonPanahBawah size={16} />}
        </button>
      )}
    </>
  );
}
