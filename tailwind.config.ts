import type { Config } from "tailwindcss";

// Token desain dari brand/token/tokens.json (pedoman merek Fantasea).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#203149",   // Navy Manta: teks utama, tombol utama, latar gelap
        ukir: "#30A6DE",   // Biru Ukir: aksen grafis, teks di latar gelap
        tanda: "#1264A8",  // Biru Tanda: aksen judul, tautan, tombol biru
        kabut: "#C3D6E2",  // Kabut Karang: bidang segi, latar lembut
        malam: "#131F33",  // Laut Malam: latar paling gelap
        buih: "#EEF5F9",   // Buih: panel terang
        koral: "#FF8A5C",  // Koral Senja: tombol pesan, harga, sisa kursi
        ink: "#203149",
        ink2: "#55657A",
        line: "#D5E2EA",
        soft: "#F4F8FB",
      },
      fontFamily: {
        display: ["var(--font-judul)", "Impact", "sans-serif"],
        aksen: ["var(--font-aksen)", "cursive"],
        body: ["var(--font-isi)", "Segoe UI", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "22px", pill: "999px", in: "14px" },
      boxShadow: {
        card: "0 1px 2px rgba(19,31,51,.06), 0 10px 28px rgba(19,31,51,.08)",
        lift: "0 2px 6px rgba(19,31,51,.10), 0 24px 48px -12px rgba(19,31,51,.28)",
        foto: "0 18px 40px -16px rgba(19,31,51,.45)",
      },
    },
  },
  plugins: [],
};
export default config;
