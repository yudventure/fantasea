"use client";
import { useEffect, useId, useRef, useState } from "react";
import { IkonPanahBawah } from "./Ikon";

export interface Pilihan { nilai: string; label: string; catatan?: string; mati?: boolean }

/**
 * Pilih satu, pengganti <select> bawaan (konvensi DAMPIER, components/Dropdown.tsx):
 * kartu membulat, baris berlingkaran pilih, Esc dan ketuk di luar menutup.
 */
export default function Dropdown({ label, value, onChange, pilihan, kosong }: {
  label: string; value: string; onChange: (v: string) => void; pilihan: Pilihan[]; kosong: string;
}) {
  const id = useId();
  const [buka, setBuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);
  const terpilih = pilihan.find((p) => p.nilai === value);

  useEffect(() => {
    if (!buka) return;
    const luar = (e: PointerEvent) => { if (wadah.current && !wadah.current.contains(e.target as Node)) setBuka(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setBuka(false);
    document.addEventListener("pointerdown", luar);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", luar); document.removeEventListener("keydown", esc); };
  }, [buka]);

  return (
    <div ref={wadah} className="relative">
      <label htmlFor={id} className="kolom-label">{label}</label>
      <button id={id} type="button" onClick={() => setBuka((v) => !v)} aria-haspopup="listbox" aria-expanded={buka} className="kolom flex items-center justify-between gap-3 text-left">
        <span className={terpilih ? "text-ink" : "text-[#8A97A8]"}>
          {terpilih ? terpilih.label : kosong}
          {terpilih?.catatan && <span className="ml-2 text-[13px] font-bold text-tanda">{terpilih.catatan}</span>}
        </span>
        <IkonPanahBawah size={18} className={`flex-none text-tanda transition ${buka ? "rotate-180" : ""}`} />
      </button>
      {buka && (
        <ul role="listbox" aria-label={label} className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[320px] overflow-auto rounded-[20px] border border-line bg-white p-2 shadow-lift">
          {pilihan.map((p) => (
            <li key={p.nilai}>
              <button type="button" role="option" aria-selected={p.nilai === value} disabled={p.mati} onClick={() => { onChange(p.nilai); setBuka(false); }}
                className={`flex w-full items-center gap-3 rounded-in px-3 py-2.5 text-left text-[15px] transition ${p.mati ? "cursor-not-allowed text-ink2/50" : "text-navy hover:bg-buih"}`}>
                <span aria-hidden className={`grid h-5 w-5 flex-none place-items-center rounded-full border-2 ${p.nilai === value ? "border-navy" : "border-line"}`}>
                  {p.nilai === value && <span className="h-2.5 w-2.5 rounded-full bg-navy" />}
                </span>
                <span className="flex-1 font-semibold">{p.label}</span>
                {p.catatan && <span className={`text-[13px] font-bold ${p.mati ? "" : "text-tanda"}`}>{p.catatan}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
