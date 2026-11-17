/**
 * Peran akun panel (pola DAMPIER, ROLE_META). Tiap peran hanya melihat menu
 * yang boleh dibukanya, dan server memeriksa ulang di tiap aksi.
 *
 * - developer dan pemilik: akun utama dengan akses penuh, termasuk akun
 *   anggota, email sistem, dan menghapus permintaan (permintaan pemilik,
 *   November 2026, "developer serta owner punya akses penuh"). Akun utama
 *   tidak dibuat, dihapus, atau diberi sandi sementara dari panel ("developer
 *   dan pemilik tidak bisa dihapus kecuali dari kodingannya karena dua itu
 *   yang utama"), hanya oleh developer lewat akun.json di folder data.
 *
 * Peran tidak bisa diubah setelah akun dibuat ("untuk peran setelah dibuat
 * tidak bisa diubah lagi"). Anggota yang salah peran dihapus lalu dibuat lagi.
 * - admin: semua isi situs, permintaan termasuk menghapus, dan kalender mitra,
 *   tanpa mengatur akun orang lain (ditambahkan November 2026).
 * - tim: mengubah isi situs dan menjawab permintaan, tanpa menghapus
 *   permintaan dan tanpa kalender mitra yang memuat kontak pemilik homestay.
 * - meja: Meja permintaan dan Kalender kegiatan saja, untuk anggota yang hanya menjawab tamu.
 */
export type Peran = "developer" | "pemilik" | "admin" | "tim" | "meja";
export const PERAN: Peran[] = ["developer", "pemilik", "admin", "tim", "meja"];

/** Halaman panel. Urutannya mengikuti menu (components/admin/MenuPanel.tsx). */
export type IdTab = "ringkasan" | "permintaan" | "kalender" | "trip" | "liveaboard" | "jadwal" | "homestay" | "kalendermitra" | "titik" | "beranda" | "ulasan" | "kontak" | "akun";

const SEMUA: IdTab[] = ["ringkasan", "permintaan", "kalender", "trip", "liveaboard", "jadwal", "homestay", "kalendermitra", "titik", "beranda", "ulasan", "kontak", "akun"];

export const META_PERAN: Record<Peran, { label: string; ket: string; tabs: IdTab[] }> = {
  developer: { label: "Developer", ket: "Akun utama dengan akses penuh, termasuk akun anggota, email sistem, dan menghapus permintaan. Tidak bisa dihapus dari panel.", tabs: SEMUA },
  pemilik: { label: "Pemilik", ket: "Akun utama dengan akses penuh, termasuk akun anggota, email sistem, dan menghapus permintaan. Tidak bisa dihapus dari panel.", tabs: SEMUA },
  admin: { label: "Admin", ket: "Semua isi situs, permintaan termasuk menghapus, dan kalender mitra. Tidak mengatur akun orang lain.", tabs: SEMUA },
  tim: { label: "Tim", ket: "Mengubah isi situs dan menjawab permintaan tamu, tanpa menghapus permintaan dan tanpa kalender mitra.", tabs: SEMUA.filter((t) => t !== "kalendermitra") },
  meja: { label: "Meja permintaan", ket: "Hanya melihat dan menjawab permintaan tamu, dan melihat kalender kegiatan. Tidak bisa mengubah isi situs.", tabs: ["ringkasan", "permintaan", "kalender", "akun"] },
};

/** Peran yang tersimpan dirapikan: nilai yang tidak dikenal dianggap tim. */
export const rapikanPeran = (v: unknown): Peran => (PERAN.includes(v as Peran) ? (v as Peran) : "tim");
/** Akses penuh, termasuk mengatur akun anggota. */
export const aksesPenuh = (p: Peran) => p === "developer" || p === "pemilik";
/** Akun utama (developer dan pemilik), tidak dibuat, dihapus, atau diberi sandi sementara dari panel. */
export const akunUtama = aksesPenuh;
/** Peran yang bisa dipilih saat menambah anggota di panel. */
export const PERAN_ANGGOTA: Peran[] = ["admin", "tim", "meja"];
/** Boleh menyimpan isi situs (Simpan perubahan) dan mengunggah foto. */
export const bolehUbahIsi = (p: Peran) => p !== "meja";
/** Boleh menghapus permintaan tamu. */
export const bolehHapusPermintaan = (p: Peran) => aksesPenuh(p) || p === "admin";
/** Boleh membuka halaman panel itu, dipakai server untuk memeriksa ulang. */
export const bolehTab = (p: Peran, t: IdTab) => META_PERAN[p].tabs.includes(t);
