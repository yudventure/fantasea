import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
export default async function TripLama({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  permanentRedirect(`/${locale}/activities`);
}
