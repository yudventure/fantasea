import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { buatT } from "@/lib/i18n/t";
import { getMessages } from "@/lib/i18n/messages";
import { hariIniWit, jadwalMendatang, tx, type Konten } from "@/lib/konten";
import { tautanWa } from "@/lib/whatsapp";
import { envText } from "@/lib/env";
import { bacaKonten } from "./konten";
import type { TautanMenu } from "@/components/Header";

/** Isi dan tautan bersama untuk setiap halaman situs tamu. */
export async function muatSitus(l: Locale) {
  const k: Konten = await bacaKonten();
  const t = buatT(getMessages(l));
  const awal = `/${l}`;
  const adaUlasan = k.ulasan.some((u) => u.tampil);
  const menu: TautanMenu[] = [
    { href: `${awal}#trip`, label: tx(k.menu.trip, l) },
    { href: `${awal}#jadwal`, label: tx(k.menu.jadwal, l) },
    { href: `${awal}#titik`, label: tx(k.menu.titik, l) },
    ...(adaUlasan ? [{ href: `${awal}#ulasan`, label: tx(k.menu.ulasan, l) }] : []),
    { href: `${awal}#faq`, label: tx(k.menu.faq, l) },
  ].filter((m) => m.label);
  const pesan: TautanMenu = { href: `${awal}#trip`, label: tx(k.menu.pesan, l) };
  const waUmum = tautanWa(k.situs.kontak.whatsapp, t("pesanWa.umum"));
  const jadwal = jadwalMendatang(k.jadwal, hariIniWit());
  return { k, t, menu, pesan, waUmum, jadwal };
}

/**
 * Alamat situs untuk tautan absolut (pratinjau tautan, sitemap). Dibaca saat
 * aplikasi berjalan dari SITE_URL di hPanel, bukan NEXT_PUBLIC_* yang
 * ditanam saat build.
 */
export function asalSitus(): string {
  const u = envText("SITE_URL");
  return /^https?:\/\//.test(u) ? u.replace(/\/+$/, "") : "http://localhost:3000";
}
