import type { Locale } from "./config";
import en from "@/messages/en.json";
import id from "@/messages/id.json";

/** Teks antarmuka tetap (label tombol dan formulir). Isi situs ada di panel (lib/konten.ts). */
export const MESSAGES: Record<Locale, Record<string, unknown>> = { en, id };
export const getMessages = (locale: Locale) => MESSAGES[locale];
