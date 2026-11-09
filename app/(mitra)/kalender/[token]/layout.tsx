import type { Metadata } from "next";
import "../../../globals.css";
import { kelasFont } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Kalender mitra Fantasea",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Halaman kalender milik mitra homestay, lewat tautan rahasia. Selalu bahasa Indonesia. */
export default function LayoutKalenderMitra({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={kelasFont}>
      <body>{children}</body>
    </html>
  );
}
