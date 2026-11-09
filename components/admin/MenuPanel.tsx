"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { IdTab } from "@/lib/peran";
import { IkonAtur, IkonBola, IkonKalender, IkonKapal, IkonKisi, IkonKotakMasuk, IkonPanahBawah } from "@/components/Ikon";

/**
 * Menu panel berkelompok menurut pekerjaan (pola DAMPIER, MenuPanel.tsx).
 * Permintaan pemilik, November 2026: panel Fantasea mengikuti cara dan pola
 * panel DAMPIER. Kelompok yang hanya punya satu butir untuk suatu peran
 * tampil sebagai butir tunggal. Halaman dengan isian belum disimpan diberi
 * titik merah, dan lencana menyebut jumlah yang menunggu.
 */
type Ikon = (p: { size?: number }) => ReactNode;
export interface ButirMenu { tab: IdTab; label: string }
export interface KelompokMenu { key: string; label: string; Ikon: Ikon; butir: ButirMenu[] }

export const MENU: KelompokMenu[] = [
  { key: "ringkasan", label: "Ringkasan", Ikon: IkonKisi, butir: [{ tab: "ringkasan", label: "Ringkasan" }] },
  { key: "permintaan", label: "Permintaan", Ikon: IkonKotakMasuk, butir: [{ tab: "permintaan", label: "Permintaan" }] },
  { key: "kalender", label: "Kalender kegiatan", Ikon: IkonKalender, butir: [{ tab: "kalender", label: "Kalender kegiatan" }] },
  {
    key: "produk", label: "Produk", Ikon: IkonKapal,
    butir: [{ tab: "trip", label: "Trip dan harga" }, { tab: "jadwal", label: "Jadwal open trip" }, { tab: "homestay", label: "Homestay" }, { tab: "kalendermitra", label: "Kalender mitra" }, { tab: "titik", label: "Titik selam" }],
  },
  {
    key: "situs", label: "Situs web", Ikon: IkonBola,
    butir: [{ tab: "beranda", label: "Beranda" }, { tab: "ulasan", label: "Ulasan dan FAQ" }, { tab: "kontak", label: "Kontak dan SEO" }],
  },
  { key: "sistem", label: "Sistem", Ikon: IkonAtur, butir: [{ tab: "akun", label: "Akun dan peran" }] },
];

/** Penjelasan satu kalimat di kepala tiap halaman. */
export const KET_TAB: Record<IdTab, string> = {
  ringkasan: "Permintaan yang menunggu, angka situs, dan isi contoh yang masih perlu diganti.",
  permintaan: "Permintaan pesan dari tamu. Ubah status, catat tindak lanjut, dan balas lewat WhatsApp.",
  kalender: "Semua pesanan per tanggal, yaitu open trip, trip, dan tamu di homestay mitra. Klik tanggalnya untuk melihat siapa yang datang, berangkat, dan pulang.",
  trip: "Trip di beranda dan halaman Trip, harga, foto, pembuka halaman Trip, dan kartu edukasi selam.",
  jadwal: "Tanggal open trip, jumlah kursi, dan yang sudah terisi.",
  homestay: "Homestay di beranda dan halaman Homestay, dengan harga, fasilitas, dan foto.",
  kalendermitra: "Kalender tiap homestay mitra. Buat tautan untuk pemiliknya, kirim lewat WhatsApp, isi jumlah kamar, dan lihat kapan kalendernya terakhir dibuka.",
  titik: "Titik selam di halaman Trip, dengan kedalaman, arus, dan level.",
  beranda: "Hero, bagian homestay, galeri, Liveaboard, judul bagian lain, ajakan, menu, dan footer.",
  ulasan: "Ulasan tamu asli dan pertanyaan yang sering ditanyakan.",
  kontak: "Kontak dan media sosial di footer, alamat, dan judul serta deskripsi di Google.",
  akun: "Akun saya, kata sandi, anggota tim beserta perannya, dan email sistem.",
};

export const menuPeran = (tabs: IdTab[]): KelompokMenu[] =>
  MENU.map((k) => ({ ...k, butir: k.butir.filter((b) => tabs.includes(b.tab)) })).filter((k) => k.butir.length > 0);
export const cariHalaman = (menu: KelompokMenu[], tab: IdTab) => {
  for (const kelompok of menu) { const butir = kelompok.butir.find((b) => b.tab === tab); if (butir) return { kelompok, butir }; }
  return null;
};
export const tunggal = (k: KelompokMenu) => k.butir.length === 1;

const Titik = ({ di = false }: { di?: boolean }) => <span aria-hidden className={`h-2 w-2 flex-none rounded-full bg-[#A63A22] ${di ? "ring-2 ring-white" : ""}`} />;

interface Props {
  menu: KelompokMenu[];
  aktif: IdTab;
  /** Halaman yang isiannya belum disimpan. */
  berubah: IdTab[];
  onPilih: (t: IdTab) => void;
  lencana?: (t: IdTab, on: boolean) => ReactNode;
}

/** Daftar menu: satu kelompok terbuka sekaligus, kelompok halaman aktif terbuka sendiri. */
export function NavMenu({ menu, aktif, berubah, onPilih, lencana }: Props) {
  const kAktif = cariHalaman(menu, aktif)?.kelompok.key ?? null;
  const [buka, setBuka] = useState<string | null>(kAktif);
  useEffect(() => { setBuka(kAktif); }, [kAktif]);
  return (
    <nav aria-label="Menu panel" className="grid gap-1">
      {menu.map((k) => {
        if (tunggal(k)) {
          const b = k.butir[0], on = b.tab === aktif;
          return (
            <button key={k.key} type="button" onClick={() => onPilih(b.tab)} aria-current={on ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-[14px] px-3.5 py-[11px] text-left text-[15px] leading-snug transition ${on ? "bg-navy font-bold text-white shadow-[0_10px_20px_-10px_rgba(19,31,51,.65)]" : "font-semibold text-navy hover:bg-white"}`}>
              <span aria-hidden className="flex-none"><k.Ikon size={19} /></span>
              <span className="min-w-0 flex-1">{b.label}</span>
              {berubah.includes(b.tab) && <Titik di={on} />}
              {lencana?.(b.tab, on)}
            </button>
          );
        }
        const terbuka = buka === k.key, berisiAktif = k.key === kAktif;
        return (
          <div key={k.key}>
            <button type="button" onClick={() => setBuka(terbuka ? null : k.key)} aria-expanded={terbuka}
              className={`flex w-full items-center gap-3 rounded-[14px] px-3.5 py-[11px] text-left text-[15px] leading-snug text-navy transition ${berisiAktif ? "bg-white font-bold" : "font-semibold hover:bg-white"}`}>
              <span aria-hidden className="flex-none"><k.Ikon size={19} /></span>
              <span className="min-w-0 flex-1">{k.label}</span>
              {!terbuka && k.butir.some((b) => berubah.includes(b.tab)) && <Titik />}
              <span aria-hidden className={`flex-none text-ink2 transition ${terbuka ? "rotate-180" : ""}`}><IkonPanahBawah size={16} /></span>
            </button>
            {terbuka && (
              <div role="group" aria-label={k.label} className="mt-1 grid gap-0.5 pb-1.5 pl-[42px]">
                {k.butir.map((b) => {
                  const on = b.tab === aktif;
                  return (
                    <button key={b.tab} type="button" onClick={() => onPilih(b.tab)} aria-current={on ? "page" : undefined}
                      className={`flex w-full items-center gap-2 rounded-[12px] px-3 py-[9px] text-left text-[14px] leading-snug transition ${on ? "bg-navy font-bold text-white" : "font-semibold text-ink2 hover:bg-white hover:text-navy"}`}>
                      <span className="min-w-0 flex-1">{b.label}</span>
                      {berubah.includes(b.tab) && <Titik di={on} />}
                      {lencana?.(b.tab, on)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Menu di bawah xl: satu kartu yang menyebut halaman yang sedang dibuka,
 * menempel di bawah header panel saat digulir (tinggi header dari
 * --kepala-panel), dan diketuk untuk membuka daftar yang sama dengan sidebar.
 * Ketuk di luar menutupnya.
 */
export function MenuPonsel(props: Props) {
  const { menu, aktif, berubah, onPilih } = props;
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const temu = cariHalaman(menu, aktif);
  const Ikon = temu?.kelompok.Ikon ?? IkonKisi;
  useEffect(() => {
    if (!buka) return;
    const tutup = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setBuka(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setBuka(false); };
    document.addEventListener("pointerdown", tutup);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", tutup); document.removeEventListener("keydown", esc); };
  }, [buka]);
  return (
    <div ref={ref} className="sticky z-20 -mx-4 mb-5 bg-soft px-4 pb-2 pt-1 sm:-mx-6 sm:px-6 xl:hidden" style={{ top: "var(--kepala-panel, 64px)" }}>
      <button type="button" onClick={() => setBuka((b) => !b)} aria-expanded={buka}
        className="flex w-full items-center gap-3 rounded-[16px] border border-line bg-white px-4 py-3 text-left shadow-card">
        <span aria-hidden className="grid h-9 w-9 flex-none place-items-center rounded-full bg-buih text-navy"><Ikon size={18} /></span>
        <span className="min-w-0 flex-1">
          {temu && !tunggal(temu.kelompok) && <span className="block text-[12px] font-bold text-ink2">{temu.kelompok.label}</span>}
          <span className="block truncate text-[15px] font-extrabold text-navy">{temu?.butir.label ?? "Menu"}</span>
        </span>
        {berubah.length > 0 && <Titik />}
        <span aria-hidden className={`flex-none text-ink2 transition ${buka ? "rotate-180" : ""}`}><IkonPanahBawah size={18} /></span>
      </button>
      {buka && (
        <div className="absolute inset-x-4 top-full z-30 mt-1 max-h-[70vh] overflow-y-auto overscroll-contain rounded-[18px] border border-line bg-soft p-2 shadow-lift supports-[height:1svh]:max-h-[70svh] sm:inset-x-6">
          <NavMenu {...props} onPilih={(t) => { setBuka(false); onPilih(t); }} />
        </div>
      )}
    </div>
  );
}
