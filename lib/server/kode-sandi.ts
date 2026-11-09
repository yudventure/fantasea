import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { rahasia, ubahJson } from "./gudang";

/**
 * Kode enam angka untuk lupa kata sandi. Hanya sidiknya yang disimpan
 * (kode-sandi.json, 0600), berlaku MENIT_BERLAKU menit, dan hangus setelah
 * COBA_MAKS tebakan salah.
 */
export const MENIT_BERLAKU = 15;
const COBA_MAKS = 5;
const BERKAS = "kode-sandi.json";
type Isi = Record<string, { sidik: string; sampai: number; coba: number }>;

const sidik = async (email: string, kode: string) => createHash("sha256").update(`${await rahasia()}:${email}:${kode}`).digest("hex");

export async function buatKode(email: string): Promise<string> {
  const kode = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const s = await sidik(email, kode);
  await ubahJson<Isi>(BERKAS, {}, (lama) => {
    const kini = Date.now();
    const sisa = Object.fromEntries(Object.entries(lama).filter(([, v]) => v.sampai > kini));
    return { ...sisa, [email]: { sidik: s, sampai: kini + MENIT_BERLAKU * 60_000, coba: 0 } };
  }, 0o600);
  return kode;
}

export async function periksaKode(email: string, kode: string): Promise<"cocok" | "salah" | "hangus"> {
  const s = await sidik(email, kode.replace(/\D/g, ""));
  let hasil: "cocok" | "salah" | "hangus" = "hangus";
  await ubahJson<Isi>(BERKAS, {}, (lama) => {
    const c = lama[email];
    if (!c || c.sampai < Date.now() || c.coba >= COBA_MAKS) { hasil = "hangus"; const { [email]: _, ...sisa } = lama; return sisa; }
    if (timingSafeEqual(Buffer.from(c.sidik), Buffer.from(s))) { hasil = "cocok"; const { [email]: _, ...sisa } = lama; return sisa; }
    hasil = "salah";
    return { ...lama, [email]: { ...c, coba: c.coba + 1 } };
  }, 0o600);
  return hasil;
}
