import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { bacaKonten } from "@/lib/server/konten";
import { asalSitus } from "@/lib/server/situs";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const asal = asalSitus();
  const k = await bacaKonten();
  const jalur = ["", "/about", ...(k.diveCourse.tampil ? ["/dive-course"] : []), "/activities", ...(k.liveaboard.tampil ? ["/liveaboard"] : []), ...(k.homestay.some((h) => h.tampil) ? ["/homestay"] : []), ...k.trip.filter((t) => t.tampil).map((t) => `/trip/${t.slug}`), ...k.homestay.filter((h) => h.tampil).map((h) => `/homestay/${h.slug}`)];
  return jalur.flatMap((j) =>
    LOCALES.map((l) => ({
      url: `${asal}/${l}${j}`,
      changeFrequency: "weekly" as const,
      priority: j ? 0.7 : 1,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, `${asal}/${x}${j}`])) },
    })),
  );
}
