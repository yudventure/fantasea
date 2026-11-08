import { cariAkun, cocokSandi, publik, rapikanEmail } from "@/lib/server/akun";
import { alamatPeminta, buatToken, catat, jsonTanpaCache, lupakan, pasangCookieSesi, wajibJson } from "@/lib/server/sesi";

/** Masuk panel dengan email dan kata sandi. Lima percobaan gagal per 15 menit per alamat. */
export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const kunci = `masuk:${alamatPeminta(req)}`;
  if (catat(kunci, 15 * 60 * 1000) > 5) return jsonTanpaCache({ galat: "Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi." }, { status: 429 });
  const o = (await req.json().catch(() => ({}))) as { email?: unknown; sandi?: unknown };
  const akun = await cariAkun(rapikanEmail(o.email));
  const sandi = typeof o.sandi === "string" ? o.sandi : "";
  if (!akun || !(await cocokSandi(sandi, akun.sandi))) return jsonTanpaCache({ galat: "Email atau kata sandi keliru." }, { status: 401 });
  lupakan(kunci);
  const res = jsonTanpaCache({ sesi: publik(akun) });
  return pasangCookieSesi(res, await buatToken(akun.email, akun.versi), req);
}
