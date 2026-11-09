/**
 * Peran akun panel (pola DAMPIER, ROLE_META). Tiap peran hanya melihat menu
 * yang boleh dibukanya, dan server memeriksa ulang di tiap aksi.
 *
 * - pemilik: semua, termasuk akun tim dan menghapus permintaan.
 * - tim: semua isi situs dan permintaan, tanpa mengatur akun orang lain.
 * - meja: Meja permintaan dan Kalender kegiatan saja, untuk anggota yang hanya menjawab tamu.
 *   Disiapkan November 2026 (permintaan pemilik) untuk tim yang lebih besar.
 */
export type Peran = "pemilik" | "tim" | "meja";
export const PERAN: Peran[] = ["pemilik", "tim", "meja"];

/** Halaman panel. Urutannya mengikuti menu (components/admin/MenuPanel.tsx). */
export type IdTab = "ringkasan" | "permintaan" | "kalender" | "trip" | "liveaboard" | "jadwal" | "homestay" | "kalendermitra" | "titik" | "beranda" | "ulasan" | "kontak" | "akun";

export const META_PERAN: Record<Peran, { label: string; ket: string; tabs: IdTab[] }> = {
  pemilik: {
    label: "Pemilik",
    ket: "Akses penuh, termasuk akun tim, peran, dan menghapus permintaan.",
    tabs: ["ringkasan", "permintaan", "kalender", "trip", "liveaboard", "jadwal", "homestay", "kalendermitra", "titik", "beranda", "ulasan", "kontak", "akun"],
  },
  tim: {
    label: "Tim",
    ket: "Mengubah semua isi situs dan menjawab permintaan tamu.",
    tabs: ["ringkasan", "permintaan", "kalender", "trip", "liveaboard", "jadwal", "homestay", "kalendermitra", "titik", "beranda", "ulasan", "kontak", "akun"],
  },
  meja: {
    label: "Meja permintaan",
    ket: "Hanya melihat dan menjawab permintaan tamu, dan melihat kalender kegiatan. Tidak bisa mengubah isi situs.",
    tabs: ["ringkasan", "permintaan", "kalender", "akun"],
  },
};

/** Peran yang tersimpan dirapikan: nilai yang tidak dikenal dianggap tim. */
export const rapikanPeran = (v: unknown): Peran => (PERAN.includes(v as Peran) ? (v as Peran) : "tim");
/** Boleh menyimpan isi situs (Simpan perubahan). */
export const bolehUbahIsi = (p: Peran) => p === "pemilik" || p === "tim";
