"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { COOKIE_PENGUNJUNG, DETAK_PENGUNJUNG_MS, ID_KUNJUNGAN, UMUR_COOKIE_PENGUNJUNG } from "@/lib/kunjungan";

/** Berjalan sesudah hidrasi, sehingga prefetch dan HTML dari cache tidak dihitung. */
export default function PencatatPengunjung() {
  const pathname = usePathname();
  const terakhir = useRef<{ jalur: string; kejadian: string; dicatat: boolean } | null>(null);
  useEffect(() => {
    if (!pathname) return;
    if (navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    if (!crypto.randomUUID) return;
    if (terakhir.current?.jalur !== pathname) terakhir.current = { jalur: pathname, kejadian: crypto.randomUUID(), dicatat: false };
    const kunjungan = terakhir.current;
    let sedang = false;
    const kirim = () => {
      if (document.visibilityState !== "visible" || sedang) return;
      const bacaId = () => document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_PENGUNJUNG}=`))?.slice(COOKIE_PENGUNJUNG.length + 1);
      if (!ID_KUNJUNGAN.test(bacaId() ?? "")) {
        // Pemisah ini sintaks atribut cookie, bukan teks yang ditampilkan.
        document.cookie = `${COOKIE_PENGUNJUNG}=${crypto.randomUUID()}; Path=/; Max-Age=${UMUR_COOKIE_PENGUNJUNG}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
      }
      if (!ID_KUNJUNGAN.test(bacaId() ?? "")) return;
      sedang = true;
      const halaman = !kunjungan.dicatat;
      // Zona waktu perangkat (mis. Europe/Paris) untuk perkiraan asal negara.
      // Bukan alamat IP, dan server hanya menyimpan kode negaranya.
      let zona = "";
      try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* peramban lama */ }
      // keepalive mempertahankan kiriman saat tamu cepat berpindah halaman.
      void fetch("/api/pengunjung", { method: "POST", credentials: "same-origin", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ halaman, kejadian: kunjungan.kejadian, ...(zona ? { zona } : {}) }) })
        .then((r) => { if (r.ok && halaman) kunjungan.dicatat = true; })
        .catch(() => {})
        .finally(() => { sedang = false; });
    };
    kirim();
    const timer = window.setInterval(kirim, DETAK_PENGUNJUNG_MS);
    document.addEventListener("visibilitychange", kirim);
    window.addEventListener("pageshow", kirim);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", kirim); window.removeEventListener("pageshow", kirim); };
  }, [pathname]);
  return null;
}
