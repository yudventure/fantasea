import type { Metadata } from "next";
import "../../globals.css";
import { kelasFont } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Panel Fantasea",
  robots: { index: false, follow: false },
};

/** Panel pengelola punya tata letak sendiri dan selalu berbahasa Indonesia. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={kelasFont}>
      <body>{children}</body>
    </html>
  );
}
