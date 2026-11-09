import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Alamat tanpa kode bahasa (/, /trip/x, /halaman-lama) diantar ke bahasa
 * pengunjung, supaya yang tidak ada pun berakhir di halaman 404 berbahasa
 * lengkap dengan menu. Pilihan bahasa dari tombol EN / ID diingat di cookie.
 */
export const config = {
  matcher: ["/((?!_next/|brand/|unggahan/|api/|admin|kalender/|icon\\.png|apple-icon\\.png|favicon\\.ico|opengraph-image|robots\\.txt|sitemap\\.xml).*)"],
};

export const COOKIE_BAHASA = "fantasea_bahasa";

function bahasaDari(req: NextRequest): Locale {
  const simpan = req.cookies.get(COOKIE_BAHASA)?.value;
  if (simpan && isLocale(simpan)) return simpan;
  for (const b of (req.headers.get("accept-language") ?? "").split(",")) {
    const utama = b.split(";")[0].trim().toLowerCase().split("-")[0];
    const kode = utama === "in" ? "id" : utama;
    if (isLocale(kode)) return kode;
  }
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const awal = pathname.split("/")[1] ?? "";
  if (isLocale(awal)) {
    const res = NextResponse.next();
    if (req.cookies.get(COOKIE_BAHASA)?.value !== awal) res.cookies.set(COOKIE_BAHASA, awal, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }
  const url = req.nextUrl.clone();
  url.pathname = `/${bahasaDari(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}
