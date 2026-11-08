"use client";
import { useEffect } from "react";

/**
 * Efek gulir situs tamu (permintaan pemilik, November 2026).
 * - Elemen bertanda data-muncul diberi kelas `muncul` saat masuk layar,
 *   CSS-nya di app/globals.css. Elemen yang ditambahkan kemudian (pindah
 *   halaman, Load more) ikut diamati.
 * - Elemen bertanda data-paralaks="0.3" bergeser lebih lambat dari gulir
 *   (hiasan hero), hanya di dekat puncak halaman.
 * Kelas gulir-siap di <html> dipasang SKRIP_AWAL (lib/gulir-awal.ts) sebelum halaman tampil.
 * Tanpa kelas itu (animasi dimatikan pengunjung, peramban lama) tidak ada
 * yang disembunyikan dan komponen ini tidak melakukan apa-apa.
 */

export default function EfekGulir() {
  useEffect(() => {
    (window as Window & { __gulirJalan?: boolean }).__gulirJalan = true;
    if (!document.documentElement.classList.contains("gulir-siap")) return;

    const io = new IntersectionObserver((entri) => {
      for (const e of entri) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("muncul");
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });

    let tundaAmati = 0;
    const amati = () => {
      tundaAmati = 0;
      document.querySelectorAll("[data-muncul]:not(.muncul)").forEach((el) => io.observe(el));
    };
    amati();
    const mo = new MutationObserver(() => { if (!tundaAmati) tundaAmati = requestAnimationFrame(amati); });
    mo.observe(document.body, { childList: true, subtree: true });

    let tundaGeser = 0;
    const geser = () => {
      tundaGeser = 0;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.5) return;
      document.querySelectorAll<HTMLElement>("[data-paralaks]").forEach((el) => {
        el.style.transform = `translate3d(0, ${(y * Number(el.dataset.paralaks || 0)).toFixed(1)}px, 0)`;
      });
    };
    const saatGulir = () => { if (!tundaGeser) tundaGeser = requestAnimationFrame(geser); };
    window.addEventListener("scroll", saatGulir, { passive: true });
    geser();

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", saatGulir);
      cancelAnimationFrame(tundaAmati);
      cancelAnimationFrame(tundaGeser);
    };
  }, []);
  return null;
}
