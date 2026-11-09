import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { bacaJson, ubahJson } from "./gudang";
import { rapikanPeran, type Peran } from "@/lib/peran";

export type { Peran };

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/**
 * Akun panel pengelola, satu per orang (pola DAMPIER). Tidak ada sandi
 * bawaan. Akun pemilik pertama dibuat lewat penyiapan dengan kunci
 * FANTASEA_KUNCI dari hPanel, lalu pemilik menambah anggota tim dari panel.
 */
export interface Akun { email: string; nama: string; peran: Peran; sandi: string; versi: number; dibuat: string }
export type AkunPublik = Omit<Akun, "sandi" | "versi">;

const BERKAS = "akun.json";
const bawaan = { akun: [] as Akun[] };

export const rapikanEmail = (e: unknown) => (typeof e === "string" ? e.trim().toLowerCase().slice(0, 120) : "");
export const emailSah = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const SANDI_MIN = 10;

export async function hashSandi(sandi: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(sandi, salt, 64);
  return ["scrypt", salt.toString("hex"), hash.toString("hex")].join("$");
}

export async function cocokSandi(sandi: string, simpanan: string): Promise<boolean> {
  const [jenis, saltHex, hashHex] = simpanan.split("$");
  if (jenis !== "scrypt" || !saltHex || !hashHex) return false;
  const hash = await scrypt(sandi, Buffer.from(saltHex, "hex"), 64);
  const benar = Buffer.from(hashHex, "hex");
  return benar.length === hash.length && timingSafeEqual(benar, hash);
}

export async function semuaAkun(): Promise<Akun[]> {
  const o = await bacaJson(BERKAS, bawaan);
  return (Array.isArray(o.akun) ? o.akun : []).map((a) => ({ ...a, peran: rapikanPeran(a.peran) }));
}

/** Atur kata sandi baru (lupa sandi). Versi naik, jadi sesi lama di perangkat lain keluar. */
export async function aturSandi(email: string, sandi: string): Promise<Akun | null> {
  const hash = await hashSandi(sandi);
  const e = rapikanEmail(email);
  const daftar = await ubahAkun((semua) => semua.map((a) => (a.email === e ? { ...a, sandi: hash, versi: a.versi + 1 } : a)));
  return daftar.find((a) => a.email === e) ?? null;
}

export async function cariAkun(email: string): Promise<Akun | null> {
  const e = rapikanEmail(email);
  return (await semuaAkun()).find((a) => a.email === e) ?? null;
}

export const publik = (a: Akun): AkunPublik => ({ email: a.email, nama: a.nama, peran: a.peran, dibuat: a.dibuat });

export function ubahAkun(ubah: (daftar: Akun[]) => Akun[]): Promise<Akun[]> {
  return ubahJson(BERKAS, bawaan, (o) => ({ akun: ubah(Array.isArray(o.akun) ? o.akun : []) }), 0o600).then((o) => o.akun);
}
