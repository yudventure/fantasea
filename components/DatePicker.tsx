"use client";
import { useEffect, useId, useRef, useState } from "react";
import { BCP47, type Locale } from "@/lib/i18n/config";
import { IkonKalender, IkonPanahKanan, IkonPanahKiri } from "./Ikon";

/**
 * Pemilih tanggal bermerek pengganti <input type="date"> (Dragonet,
 * permintaan pemilik). Senin lebih dulu, hari ini bercincin, terpilih navy,
 * tanggal di luar batas pudar, keyboard panah, Esc menutup, ketuk di luar
 * menutup.
 */
const iso = (d: Date) => d.toISOString().slice(0, 10);
const dariIso = (s: string) => new Date(`${s}T00:00:00Z`);

export default function DatePicker({ id, value, onChange, min, locale, label, teks }: {
  id?: string; value: string; onChange: (v: string) => void; min: string; locale: Locale; label: string;
  teks: { pilih: string; sebelum: string; berikut: string; hariIni: string; hapus: string };
}) {
  const otomatis = useId();
  const idKolom = id ?? otomatis;
  const [buka, setBuka] = useState(false);
  const awal = value || min;
  const [bulan, setBulan] = useState(() => { const d = dariIso(awal); d.setUTCDate(1); return d; });
  const [fokus, setFokus] = useState(awal);
  const wadah = useRef<HTMLDivElement>(null);
  const kisi = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buka) return;
    const luar = (e: PointerEvent) => { if (wadah.current && !wadah.current.contains(e.target as Node)) setBuka(false); };
    document.addEventListener("pointerdown", luar);
    return () => document.removeEventListener("pointerdown", luar);
  }, [buka]);
  useEffect(() => {
    if (buka) kisi.current?.querySelector<HTMLButtonElement>(`[data-tgl="${fokus}"]`)?.focus();
  }, [buka, fokus, bulan]);

  const fmtBulan = new Intl.DateTimeFormat(BCP47[locale], { month: "long", year: "numeric", timeZone: "UTC" });
  const fmtTampil = new Intl.DateTimeFormat(BCP47[locale], { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const namaHari = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(BCP47[locale], { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i))));
  const hariIni = min;

  const geserBulan = (n: number) => setBulan((b) => { const d = new Date(b); d.setUTCMonth(d.getUTCMonth() + n); return d; });
  const awalKisi = new Date(bulan);
  awalKisi.setUTCDate(1 - ((bulan.getUTCDay() + 6) % 7));
  const sel = Array.from({ length: 42 }, (_, i) => { const d = new Date(awalKisi); d.setUTCDate(d.getUTCDate() + i); return d; });

  const pilih = (s: string) => { if (s < min) return; onChange(s); setBuka(false); };
  const tombolKeyboard = (e: React.KeyboardEvent) => {
    const langkah: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === "Escape") { setBuka(false); return; }
    if (!(e.key in langkah)) return;
    e.preventDefault();
    const d = dariIso(fokus); d.setUTCDate(d.getUTCDate() + langkah[e.key]);
    const s = iso(d);
    setFokus(s);
    if (d.getUTCMonth() !== bulan.getUTCMonth()) { const b = new Date(d); b.setUTCDate(1); setBulan(b); }
  };

  return (
    <div ref={wadah} className="relative">
      <label htmlFor={idKolom} className="kolom-label">{label}</label>
      <button id={idKolom} type="button" onClick={() => { setFokus(value || min); setBuka((v) => !v); }} aria-haspopup="dialog" aria-expanded={buka}
        className="kolom flex items-center justify-between gap-3 text-left">
        <span className={value ? "text-ink" : "text-[#8A97A8]"}>{value ? fmtTampil.format(dariIso(value)) : teks.pilih}</span>
        <IkonKalender size={19} className="flex-none text-tanda" />
      </button>
      {buka && (
        <div role="dialog" aria-label={label} onKeyDown={tombolKeyboard} className="absolute left-0 right-0 top-full z-30 mt-2 rounded-[20px] border border-line bg-white p-4 shadow-lift sm:right-auto sm:w-[320px]">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => geserBulan(-1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-buih" aria-label={teks.sebelum}><IkonPanahKiri size={18} /></button>
            <span className="text-[15px] font-extrabold capitalize text-navy">{fmtBulan.format(bulan)}</span>
            <button type="button" onClick={() => geserBulan(1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-buih" aria-label={teks.berikut}><IkonPanahKanan size={18} /></button>
          </div>
          <div className="mt-3 grid grid-cols-7 text-center text-[12px] font-bold text-ink2">
            {namaHari.map((h, i) => <span key={i} className="py-1">{h}</span>)}
          </div>
          <div ref={kisi} className="grid grid-cols-7 gap-1" role="grid">
            {sel.map((d) => {
              const s = iso(d);
              const luarBulan = d.getUTCMonth() !== bulan.getUTCMonth();
              const mati = s < min;
              const terpilih = s === value;
              return (
                <button key={s} type="button" data-tgl={s} disabled={mati} tabIndex={s === fokus ? 0 : -1} onClick={() => pilih(s)} aria-pressed={terpilih}
                  className={`aspect-square rounded-full text-[14px] font-bold transition ${terpilih ? "bg-navy text-white" : mati ? "text-[#C3CCD6]" : luarBulan ? "text-ink2/60 hover:bg-buih" : "text-navy hover:bg-buih"} ${s === hariIni && !terpilih ? "ring-2 ring-inset ring-ukir" : ""}`}>
                  {d.getUTCDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between">
            <button type="button" onClick={() => pilih(hariIni)} className="rounded-pill px-3 py-1.5 text-[13.5px] font-bold text-tanda hover:bg-buih">{teks.hariIni}</button>
            <button type="button" onClick={() => { onChange(""); setBuka(false); }} className="rounded-pill px-3 py-1.5 text-[13.5px] font-bold text-ink2 hover:bg-buih">{teks.hapus}</button>
          </div>
        </div>
      )}
    </div>
  );
}
