"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { META_PERAN, type IdTab } from "@/lib/peran";
import type { Permintaan } from "@/lib/server/permintaan";
import { rentangTanggal } from "@/lib/format";
import { IkonKeluar, IkonLonceng } from "@/components/Ikon";
import type { Sesi } from "./Panel";

/** Lapisan yang tertutup saat diketuk di luar atau Esc. */
function useLapisan(): [boolean, (b: boolean) => void, React.RefObject<HTMLDivElement | null>] {
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!buka) return;
    const tutup = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setBuka(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setBuka(false); };
    document.addEventListener("pointerdown", tutup);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", tutup); document.removeEventListener("keydown", esc); };
  }, [buka]);
  return [buka, setBuka, ref];
}

function Lapisan({ children }: { children: ReactNode }) {
  return <div className="absolute right-0 top-full z-50 mt-2 w-[min(340px,calc(100vw-24px))] rounded-[18px] border border-line bg-white p-2 shadow-lift">{children}</div>;
}

/** Lonceng permintaan baru (pola DAMPIER, Lonceng.tsx). */
function Lonceng({ permintaan, onBuka }: { permintaan: Permintaan[]; onBuka: () => void }) {
  const [buka, setBuka, ref] = useLapisan();
  const baru = permintaan.filter((p) => p.status === "baru");
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setBuka(!buka)} aria-expanded={buka} aria-label={baru.length ? `${baru.length} permintaan baru` : "Tidak ada permintaan baru"}
        className="relative grid h-10 w-10 place-items-center rounded-full text-navy hover:bg-buih">
        <IkonLonceng size={21} />
        {baru.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-koral px-1 text-[11px] font-extrabold text-navy">{baru.length > 9 ? "9+" : baru.length}</span>}
      </button>
      {buka && (
        <Lapisan>
          <p className="px-3 pb-1 pt-2 text-[13px] font-extrabold text-navy">{baru.length ? `${baru.length} permintaan baru` : "Tidak ada permintaan baru"}</p>
          <ul className="grid gap-1">
            {baru.slice(0, 5).map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => { setBuka(false); onBuka(); }} className="w-full rounded-[12px] px-3 py-2 text-left hover:bg-buih">
                  <span className="block text-[14px] font-bold text-navy">{p.nama}</span>
                  <span className="block text-[12.5px] text-ink2">{p.tripNama} · {rentangTanggal(p.mulai, p.selesai, "id")} · {p.orang} orang</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => { setBuka(false); onBuka(); }} className="mt-1 w-full rounded-[12px] px-3 py-2.5 text-left text-[13.5px] font-extrabold text-tanda hover:bg-buih">Buka meja permintaan</button>
        </Lapisan>
      )}
    </div>
  );
}

/** Menu akun: nama, peran, ganti sandi, keluar (pola DAMPIER, ProfileMenu.tsx). */
function MenuAkun({ sesi, onGantiSandi, onKeluar }: { sesi: Sesi; onGantiSandi: () => void; onKeluar: () => void }) {
  const [buka, setBuka, ref] = useLapisan();
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setBuka(!buka)} aria-expanded={buka} aria-label="Menu akun"
        className="flex items-center gap-2 rounded-pill py-1 pl-1 pr-2 hover:bg-buih sm:pr-3">
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-navy text-[14px] font-extrabold text-white">{(sesi.nama.trim()[0] ?? "?").toUpperCase()}</span>
        <span className="hidden max-w-[140px] truncate text-[13.5px] font-bold text-navy md:inline">{sesi.nama}</span>
      </button>
      {buka && (
        <Lapisan>
          <div className="px-3 pb-2 pt-2">
            <p className="text-[14.5px] font-extrabold text-navy">{sesi.nama}</p>
            <p className="text-[12.5px] text-ink2">{sesi.email}</p>
            <p className="mt-1 inline-flex rounded-pill bg-buih px-2 py-0.5 text-[11.5px] font-extrabold text-navy">{META_PERAN[sesi.peran].label}</p>
          </div>
          <button type="button" onClick={() => { setBuka(false); onGantiSandi(); }} className="w-full rounded-[12px] px-3 py-2.5 text-left text-[14px] font-bold text-navy hover:bg-buih">Ganti kata sandi</button>
          <button type="button" onClick={onKeluar} className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[14px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonKeluar size={17} />Keluar</button>
        </Lapisan>
      )}
    </div>
  );
}

/**
 * Header panel yang menempel (pola DAMPIER, AdminHeader.tsx). Tingginya
 * diukur ke --kepala-panel untuk kartu menu ponsel yang menempel di bawahnya.
 * Latar putih padat, tanpa blur, supaya lapisan di dalamnya tidak terkurung.
 */
export default function KepalaPanel({ sesi, permintaan, bolehPermintaan, onPilih, onKeluar }: {
  sesi: Sesi; permintaan: Permintaan[]; bolehPermintaan: boolean; onPilih: (t: IdTab, jangkar?: string) => void; onKeluar: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const akar = document.documentElement;
    const pasang = () => akar.style.setProperty("--kepala-panel", `${Math.round(el.getBoundingClientRect().height)}px`);
    pasang();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(pasang);
    ro?.observe(el);
    return () => { ro?.disconnect(); akar.style.removeProperty("--kepala-panel"); };
  }, []);
  return (
    <header ref={ref} className="sticky top-0 z-40 bg-white shadow-[0_8px_18px_-14px_rgba(19,31,51,.35)]">
      <div className="wrap-panel flex h-16 items-center gap-2 sm:gap-3">
        <button type="button" onClick={() => onPilih("ringkasan")} className="flex items-center gap-2.5" aria-label="Panel Fantasea, Ringkasan">
          <Image src="/brand/logo/fantasea-manta.png" alt="" width={993} height={835} unoptimized className="h-9 w-auto" />
          <span className="font-display text-[22px] text-navy">Fantasea</span>
          <span aria-hidden className="hidden font-aksen text-[13px] uppercase tracking-[0.2em] text-tanda min-[420px]:inline">Admin</span>
        </button>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a href="/en" target="_blank" rel="noopener" className="rounded-pill bg-buih px-3 py-2 text-[13px] font-bold text-navy hover:bg-line">
            <span className="sm:hidden">Situs ↗</span><span className="hidden sm:inline">Lihat situs ↗</span>
          </a>
          {bolehPermintaan && <Lonceng permintaan={permintaan} onBuka={() => onPilih("permintaan")} />}
          <MenuAkun sesi={sesi} onGantiSandi={() => onPilih("akun", "ganti-sandi")} onKeluar={onKeluar} />
        </div>
      </div>
    </header>
  );
}
