import { createHash, timingSafeEqual } from "node:crypto";
import { SANDI_MIN, aturSandi, cariAkun, rapikanEmail } from "@/lib/server/akun";
import { periksaKode } from "@/lib/server/kode-sandi";
import { aksesPenuh } from "@/lib/peran";
import { alamatPeminta, buatToken, catat, jsonTanpaCache, kunciPenyiapan, lupakan, pasangCookieSesi, wajibJson } from "@/lib/server/sesi";

export const dynamic = "force-dynamic";

const sama = (a: string, b: string) => timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

/**
 * Atur kata sandi baru dengan kode dari email, lalu langsung masuk. Jalan
 * lain khusus pemilik, untuk saat email sistem belum dipasang: kunci
 * penyiapan (FANTASEA_KUNCI di hPanel) menggantikan kode, karena yang
 * memegang hPanel memang pemilik.
 */
export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const JENDELA = 15 * 60 * 1000, kunciIp = `atur-sandi:${alamatPeminta(req)}`;
  if (catat(kunciIp, JENDELA) > 20) return jsonTanpaCache({ galat: "Terlalu banyak percobaan. Tunggu 15 menit." }, { status: 429 });
  const o = (await req.json().catch(() => ({}))) as { email?: unknown; kode?: unknown; kunci?: unknown; sandi?: unknown };
  const email = rapikanEmail(o.email);
  const sandi = typeof o.sandi === "string" ? o.sandi : "";
  if (sandi.length < SANDI_MIN) return jsonTanpaCache({ galat: `Kata sandi baru paling sedikit ${SANDI_MIN} huruf.` }, { status: 400 });
  const akun = email ? await cariAkun(email) : null;

  if (typeof o.kunci === "string") {
    const kunci = kunciPenyiapan();
    if (!akun || !aksesPenuh(akun.peran) || !kunci || !sama(o.kunci.trim(), kunci)) {
      return jsonTanpaCache({ galat: "Kunci penyiapan tidak cocok, atau email itu bukan akun pemilik atau developer." }, { status: 400 });
    }
  } else {
    const hasil = await periksaKode(email, typeof o.kode === "string" ? o.kode : "");
    if (hasil !== "cocok" || !akun) {
      return jsonTanpaCache({ galat: hasil === "salah" ? "Kode salah. Periksa lagi email terbaru dari Fantasea." : "Kode sudah tidak berlaku. Minta kode baru." }, { status: 400 });
    }
  }
  const baru = await aturSandi(akun.email, sandi);
  if (!baru) return jsonTanpaCache({ galat: "Kata sandi belum tersimpan." }, { status: 500 });
  lupakan(kunciIp);
  const res = jsonTanpaCache({ sesi: { email: baru.email, nama: baru.nama, peran: baru.peran } });
  return pasangCookieSesi(res, await buatToken(baru.email, baru.versi), req);
}
