import localFont from "next/font/local";

/**
 * Huruf merek (brand/font, SIL OFL), di-host sendiri lewat next/font:
 * Londrina Solid untuk judul, Gochi Hand untuk label aksen seperti
 * DIVE TRAVEL di logo, Nunito untuk teks isi.
 */
export const fontJudul = localFont({
  src: [
    { path: "../app/fonts/LondrinaSolid-Black.woff2", weight: "900", style: "normal" },
    { path: "../app/fonts/LondrinaSolid-Regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-judul",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

export const fontAksen = localFont({
  src: [{ path: "../app/fonts/GochiHand-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-aksen",
  display: "swap",
  fallback: ["cursive"],
});

export const fontIsi = localFont({
  src: [
    { path: "../app/fonts/Nunito-Variable.woff2", weight: "200 1000", style: "normal" },
    { path: "../app/fonts/Nunito-Italic-Variable.woff2", weight: "200 1000", style: "italic" },
  ],
  variable: "--font-isi",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

export const kelasFont = `${fontJudul.variable} ${fontAksen.variable} ${fontIsi.variable}`;
