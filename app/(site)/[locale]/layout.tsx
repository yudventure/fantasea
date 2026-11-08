import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../../globals.css";
import { kelasFont } from "@/lib/fonts";
import { BCP47, LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/context";
import { getMessages } from "@/lib/i18n/messages";
import { tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { asalSitus } from "@/lib/server/situs";

// Isi situs dibaca dari folder data tiap permintaan, jadi simpanan dari panel langsung tayang.
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#203149", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const k = await bacaKonten();
  return {
    metadataBase: new URL(asalSitus()),
    title: { default: tx(k.situs.seo.judul, locale), template: `%s · Fantasea Dive Travel` },
    description: tx(k.situs.seo.deskripsi, locale),
    alternates: { canonical: `/${locale}`, languages: Object.fromEntries(LOCALES.map((l) => [BCP47[l], `/${l}`])) },
    openGraph: { type: "website", siteName: "Fantasea Dive Travel", locale: BCP47[locale], title: tx(k.situs.seo.judul, locale), description: tx(k.situs.seo.deskripsi, locale) },
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  return (
    <html lang={BCP47[l]} className={kelasFont}>
      <body>
        <I18nProvider locale={l} messages={getMessages(l)}>{children}</I18nProvider>
      </body>
    </html>
  );
}
