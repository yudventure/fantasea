/**
 * Bahasa situs tamu. Panel pengelola tetap bahasa Indonesia, karena itu alat
 * internal tim, bukan halaman publik.
 *
 * Menambah bahasa = tambahkan kodenya di sini, isi label dan BCP47, buat
 * messages/<kode>.json, lalu tambahkan kolom bahasanya di tipe Teks
 * (lib/konten.ts). Isi dari panel yang kosong jatuh ke bahasa Inggris.
 */
export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Nama bahasa dalam bahasa itu sendiri. */
export const LOCALE_LABEL: Record<Locale, string> = { en: "English", id: "Bahasa" };
export const LOCALE_PENDEK: Record<Locale, string> = { en: "EN", id: "ID" };
/** Nama bahasa dalam bahasa Indonesia, untuk panel. */
export const NAMA_BAHASA_ID: Record<Locale, string> = { en: "Inggris", id: "Indonesia" };
export const BCP47: Record<Locale, string> = { en: "en", id: "id" };

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);
