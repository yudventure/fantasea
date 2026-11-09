import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { envText } from "@/lib/env";
import { cariAkun, type Peran } from "./akun";
import { rahasia } from "./gudang";

/**
 * Sesi panel pengelola (pola DAMPIER). Cookie HttpOnly berisi token
 * bertanda tangan HMAC-SHA256 `{email, v, exp}`. Akun dibaca ulang tiap
 * permintaan, jadi menghapus akun atau mengganti sandi (versi naik)
 * langsung memutus sesi yang sedang berjalan.
 */
export const NAMA_COOKIE = "fantasea_sesi";
const UMUR_DETIK = 12 * 60 * 60;

export interface Sesi { email: string; nama: string; peran: Peran }

export const kunciPenyiapan = () => envText("FANTASEA_KUNCI") || null;

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const tanda = (isi: string, kunci: string) => createHmac("sha256", kunci).update(isi).digest("base64url");

export async function buatToken(email: string, v: number): Promise<string> {
  const isi = b64(JSON.stringify({ email, v, exp: Math.floor(Date.now() / 1000) + UMUR_DETIK }));
  return `${isi}.${tanda(isi, await rahasia())}`;
}

async function bacaToken(token: string | undefined) {
  if (!token) return null;
  const [isi, ttd] = token.split(".");
  if (!isi || !ttd) return null;
  const benar = Buffer.from(tanda(isi, await rahasia()));
  const diberi = Buffer.from(ttd);
  if (benar.length !== diberi.length || !timingSafeEqual(benar, diberi)) return null;
  try {
    const o = JSON.parse(Buffer.from(isi, "base64url").toString("utf8")) as { email?: unknown; v?: unknown; exp?: unknown };
    if (typeof o.email !== "string" || typeof o.v !== "number" || typeof o.exp !== "number") return null;
    if (o.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: o.email, v: o.v };
  } catch { return null; }
}

export function cookieDari(req: Request, nama: string): string | undefined {
  for (const bagian of (req.headers.get("cookie") ?? "").split(";")) {
    const [k, ...v] = bagian.trim().split("=");
    if (k === nama) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export async function sesiDariToken(token: string | undefined): Promise<Sesi | null> {
  const t = await bacaToken(token);
  if (!t) return null;
  const akun = await cariAkun(t.email);
  if (!akun || akun.versi !== t.v) return null;
  return { email: akun.email, nama: akun.nama, peran: akun.peran };
}

export const sesiDari = (req: Request) => sesiDariToken(cookieDari(req, NAMA_COOKIE));

const amanHttps = (req: Request) => (req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "")) === "https";

export function pasangCookieSesi(res: NextResponse, token: string, req: Request) {
  res.cookies.set(NAMA_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: UMUR_DETIK, secure: amanHttps(req) });
  return res;
}
export function hapusCookieSesi(res: NextResponse) {
  res.cookies.set(NAMA_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}

export const jsonTanpaCache = (isi: unknown, init: ResponseInit = {}) =>
  NextResponse.json(isi, { ...init, headers: { "cache-control": "no-store", ...(init.headers ?? {}) } });

/** Sesi yang sah dan diizinkan, atau respons 401/403 yang tinggal dikembalikan. */
export async function wajib(req: Request, izin: (s: Sesi) => boolean = () => true): Promise<Sesi | NextResponse> {
  const s = await sesiDari(req);
  if (!s) return jsonTanpaCache({ galat: "Belum masuk." }, { status: 401 });
  if (!izin(s)) return jsonTanpaCache({ galat: "Peran akunmu belum boleh melakukan ini. Minta pemilik mengubah peranmu." }, { status: 403 });
  return s;
}

/** Menolak isi yang bukan JSON di rute yang mengubah data (penangkal CSRF lewat formulir situs lain). */
export function wajibJson(req: Request): NextResponse | null {
  const jenis = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  return jenis === "application/json" ? null : jsonTanpaCache({ galat: "Isi harus JSON." }, { status: 415 });
}

// ---- pembatas laju sederhana di memori proses ----
const hitung = new Map<string, { n: number; sejak: number }>();
export function catat(kunci: string, jendelaMs: number): number {
  const kini = Date.now();
  if (hitung.size > 5000) for (const [k, c] of hitung) if (kini - c.sejak > jendelaMs) hitung.delete(k);
  const c = hitung.get(kunci);
  if (!c || kini - c.sejak > jendelaMs) { hitung.set(kunci, { n: 1, sejak: kini }); return 1; }
  c.n += 1;
  return c.n;
}
export function lupakan(kunci: string) { hitung.delete(kunci); }

/** Alamat peminta. Proksi hosting menambah alamat di ujung kanan X-Forwarded-For. */
export function alamatPeminta(req: Request): string {
  const daftar = (req.headers.get("x-forwarded-for") ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  return daftar[daftar.length - 1] || req.headers.get("x-real-ip")?.trim() || "lokal";
}
