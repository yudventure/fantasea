"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LOCALES, LOCALE_LABEL, LOCALE_PENDEK, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { kunciGulir, lepasGulir } from "@/lib/gulir";
import { IkonMenu, IkonTutup } from "./Ikon";

export interface TautanMenu { href: string; label: string }

/**
 * Header ala referensi: logo utama di kiri, menu dan tombol bahasa di kanan.
 * Permintaan pemilik, November 2026: logo utama utuh (bukan tanda manta
 * dengan nama terpisah), di puncak halaman header tanpa latar, latar putih
 * tembus pandang baru muncul saat halaman digulir dan logonya mengecil.
 * Permintaan berikutnya: logo di puncak tidak terlalu besar, dan tanpa tombol
 * Pesan trip di pojok kanan atas (tombol pesan ada di hero,
 * dan halaman trip). Header melayang (fixed) di atas hero, jadi bagian pertama
 * tiap halaman memberi ruang di atasnya.
 * `jalur` adalah alamat halaman tanpa kode bahasa, untuk tombol EN / ID.
 */
export default function Header({ menu, jalur }: { menu: TautanMenu[]; pesan: TautanMenu; jalur: string }) {
  const { t, locale } = useI18n();
  const [buka, setBuka] = useState(false);
  const [gulir, setGulir] = useState(false);

  useEffect(() => {
    const cek = () => setGulir(window.scrollY > 8);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    return () => window.removeEventListener("scroll", cek);
  }, []);
  useEffect(() => {
    if (!buka) return;
    kunciGulir();
    const tutup = (e: KeyboardEvent) => e.key === "Escape" && setBuka(false);
    window.addEventListener("keydown", tutup);
    return () => { lepasGulir(); window.removeEventListener("keydown", tutup); };
  }, [buka]);

  const bahasaLain = (l: Locale) => `/${l}${jalur}`;

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Latar dan bayangan di lapisan anak, supaya panel menu ponsel tidak terkurung (aturan DAMPIER bagian Ponsel). */}
      <div aria-hidden className={`absolute inset-0 bg-white/75 shadow-[0_6px_24px_-12px_rgba(19,31,51,.25)] backdrop-blur-md transition-opacity duration-300 ${gulir ? "opacity-100" : "opacity-0"}`} />
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-pill focus:bg-navy focus:px-4 focus:py-2 focus:text-white">{t("nav.lompat")}</a>
      <div className={`wrap relative flex items-center gap-4 transition-[padding] duration-300 ${gulir ? "py-1.5" : "py-3"}`}>
        <Link href={`/${locale}`} className="flex flex-none items-center" aria-label="Fantasea Dive Travel">
          <Image src="/brand/logo/fantasea-logo-utama.png" alt="Fantasea Dive Travel" width={1617} height={1004} priority unoptimized
            className={`w-auto transition-[height] duration-300 ${gulir ? "h-[46px] sm:h-[52px]" : "h-[54px] sm:h-[64px]"}`} />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Menu">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className="rounded-pill px-3.5 py-2 text-[14.5px] font-bold text-navy/80 transition hover:bg-buih hover:text-navy">{m.label}</Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <div className="hidden items-center rounded-pill bg-buih p-1 sm:flex" role="group" aria-label={t("nav.bahasa")}>
            {LOCALES.map((l) => (
              <Link key={l} href={bahasaLain(l)} hrefLang={l} aria-current={l === locale ? "true" : undefined} title={LOCALE_LABEL[l]}
                className={`rounded-pill px-3 py-1.5 text-[13px] font-extrabold transition ${l === locale ? "bg-white text-navy shadow-card" : "text-navy/60 hover:text-navy"}`}>
                {LOCALE_PENDEK[l]}
              </Link>
            ))}
          </div>
          <button type="button" onClick={() => setBuka(true)} className="btn-bulat lg:hidden" aria-label={t("nav.bukaMenu")} aria-expanded={buka}>
            <IkonMenu size={22} />
          </button>
        </div>
      </div>

      {buka && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label={t("nav.tutup")} className="absolute inset-0 bg-malam/40" onClick={() => setBuka(false)} />
          <div className="absolute inset-x-3 top-3 rounded-[26px] bg-white p-5 shadow-lift">
            <div className="flex items-center justify-between">
              <Image src="/brand/logo/fantasea-logo-utama.png" alt="Fantasea Dive Travel" width={1617} height={1004} unoptimized className="h-[50px] w-auto" />
              <button type="button" onClick={() => setBuka(false)} className="btn-bulat" aria-label={t("nav.tutup")}><IkonTutup size={22} /></button>
            </div>
            <nav className="mt-4 grid gap-1" aria-label="Menu">
              {menu.map((m) => (
                <Link key={m.href} href={m.href} onClick={() => setBuka(false)} className="rounded-in px-4 py-3 text-[17px] font-bold text-navy hover:bg-buih">{m.label}</Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-pill bg-buih p-1" role="group" aria-label={t("nav.bahasa")}>
                {LOCALES.map((l) => (
                  <Link key={l} href={bahasaLain(l)} hrefLang={l} aria-current={l === locale ? "true" : undefined}
                    className={`rounded-pill px-4 py-2 text-[14px] font-extrabold ${l === locale ? "bg-white text-navy shadow-card" : "text-navy/60"}`}>
                    {LOCALE_LABEL[l]}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
