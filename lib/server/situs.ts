import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { buatT } from "@/lib/i18n/t";
import { getMessages } from "@/lib/i18n/messages";
import { hariIniWit, jadwalMendatang, tx, type Konten } from "@/lib/konten";
import { nomorWaAsli, tautanWa } from "@/lib/whatsapp";
import { envText } from "@/lib/env";
import { bacaKonten } from "./konten";
import type { TautanMenu } from "@/components/Header";

/** Isi dan tautan bersama untuk setiap halaman situs tamu. */
export async function muatSitus(l: Locale) {
  const k: Konten = await bacaKonten();
  const t = buatT(getMessages(l));
  const awal = `/${l}`;
  // Empat menu utama, sama untuk header desktop, ponsel, dan footer.
  const menu: TautanMenu[] = [
    { href: awal, label: tx(k.menu.beranda, l) },
    { href: `${awal}#homestay`, label: tx(k.menu.homestay, l) },
    { href: `${awal}#trip`, label: tx(k.menu.trip, l) },
    { href: `${awal}#about`, label: tx(k.menu.about, l) },
  ];
  const pesan: TautanMenu = { href: `${awal}#trip`, label: tx(k.menu.pesan, l) };
  // Nomor contoh tidak dipakai tombol ajakan, supaya tamu tidak diarahkan ke nomor yang tidak ada.
  const waUmum = tautanWa(nomorWaAsli(k.situs.kontak.whatsapp), t("pesanWa.umum"));
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
