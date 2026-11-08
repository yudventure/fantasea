/**
 * Skrip kecil di <head> situs tamu, berjalan sebelum halaman tampil. Memasang
 * kelas gulir-siap supaya isi yang belum digulir tersembunyi tanpa berkedip
 * (efek gulir, components/EfekGulir.tsx). Dilewati bila pengunjung mematikan
 * animasi atau perambannya tanpa IntersectionObserver, dan dicabut lagi bila
 * EfekGulir tidak berjalan dalam 4 detik, supaya isi tidak pernah hilang.
 * Ditaruh di berkas biasa (bukan "use client") karena layout server membaca
 * teksnya.
 */
export const SKRIP_AWAL = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;var d=document.documentElement;d.classList.add("gulir-siap");setTimeout(function(){if(!window.__gulirJalan)d.classList.remove("gulir-siap")},4000)}catch(e){}})();`;
