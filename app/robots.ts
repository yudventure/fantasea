import type { MetadataRoute } from "next";
import { asalSitus } from "@/lib/server/situs";

export const dynamic = "force-dynamic";

// /admin sengaja tidak diblokir: header noindex (next.config.ts) harus bisa dibaca mesin pencari.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: `${asalSitus()}/sitemap.xml` };
}
