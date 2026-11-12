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
  const adaUlasan = k.ulasan.some((u) => u.tampil);
  // Urutan menu mengikuti urutan bagian di beranda (permintaan pemilik,
  // November 2026): homestay, trip dengan open trip, liveaboard, ulasan, FAQ.
  // Open trip dan titik selam termasuk Trip, jadi tidak punya menu sendiri.
  const menu: TautanMenu[] = [
    ...(k.homestay.some((h) => h.tampil) ? [{ href: `${awal}/homestay`, label: tx(k.menu.homestay, l) }] : []),
    { href: `${awal}/activities`, label: tx(k.menu.trip, l) },
    ...(k.diveCourse.tampil ? [{ href: `${awal}/dive-course`, label: tx(k.diveCourse.label, l) }] : []),
    ...(k.liveaboard.tampil ? [{ href: `${awal}/liveaboard`, label: tx(k.menu.liveaboard, l) }] : []),
    ...(adaUlasan ? [{ href: `${awal}#ulasan`, label: tx(k.menu.ulasan, l) }] : []),
    { href: `${awal}#faq`, label: tx(k.menu.faq, l) },
  ].filter((m) => m.label);
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
