import type { NextConfig } from "next";

/**
 * Satu mode: server Node.js (`next build` lalu `npm start` atau `server.js`).
 * Isi situs, permintaan tamu, dan sesi panel hidup di folder data server
 * (lib/server/gudang.ts), jadi halaman publik dirender per permintaan dan
 * simpanan dari panel langsung tayang tanpa build ulang.
 *
 * Gambar disajikan apa adanya (images.unoptimized), seperti aset merek di
 * DAMPIER: tidak bergantung pada sharp di server Hostinger, dan foto bawaan
 * maupun unggahan sudah diperkecil sebelumnya.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: { unoptimized: true },
  // ESLint tidak dipasang. Cek tipe tetap jalan saat build.
  eslint: { ignoreDuringBuilds: true },
  headers: async () => [
    { source: "/:path*", headers: securityHeaders },
    // Foto dan logo merek disimpan peramban sehari. Ganti nama berkas kalau harus segera tayang.
    { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    // Panel tidak masuk hasil pencarian. Sengaja tidak diblokir robots.txt supaya tanda ini terbaca.
    { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
  ],
};

export default nextConfig;
