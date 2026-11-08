import { timingSafeEqual, createHash } from "node:crypto";
import { SANDI_MIN, emailSah, hashSandi, publik, rapikanEmail, semuaAkun, ubahAkun, type Akun } from "@/lib/server/akun";
import { alamatPeminta, buatToken, catat, jsonTanpaCache, kunciPenyiapan, pasangCookieSesi, wajibJson } from "@/lib/server/sesi";

/**
 * Penyiapan akun pemilik pertama. Hanya bisa sekali, selama belum ada akun,
 * dan hanya dengan kunci FANTASEA_KUNCI dari hPanel. Tidak ada sandi bawaan.
 * Di komputer pengembang (bukan produksi) kunci boleh kosong.
 */
const sama = (a: string, b: string) => timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
const tanpaKunciBoleh = () => process.env.NODE_ENV !== "production";

export async function GET() {
  const perlu = (await semuaAkun()).length === 0;
  return jsonTanpaCache({ perlu, kunciAda: !!kunciPenyiapan() || tanpaKunciBoleh() });
}

export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  if (catat(`penyiapan:${alamatPeminta(req)}`, 15 * 60 * 1000) > 5) return jsonTanpaCache({ galat: "Terlalu banyak percobaan. Tunggu 15 menit." }, { status: 429 });
  if ((await semuaAkun()).length > 0) return jsonTanpaCache({ galat: "Akun pemilik sudah ada. Silakan masuk." }, { status: 409 });

  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kunci = kunciPenyiapan();
  if (kunci) {
    if (typeof o.kunci !== "string" || !sama(o.kunci.trim(), kunci)) return jsonTanpaCache({ galat: "Kunci penyiapan keliru." }, { status: 401 });
  } else if (!tanpaKunciBoleh()) {
    return jsonTanpaCache({ galat: "Isi dulu FANTASEA_KUNCI di hPanel, lalu restart aplikasi." }, { status: 403 });
  }
  const email = rapikanEmail(o.email);
  const nama = typeof o.nama === "string" ? o.nama.trim().slice(0, 60) : "";
  const sandi = typeof o.sandi === "string" ? o.sandi : "";
  if (!nama) return jsonTanpaCache({ galat: "Isi nama." }, { status: 400 });
  if (!emailSah(email)) return jsonTanpaCache({ galat: "Periksa alamat email." }, { status: 400 });
  if (sandi.length < SANDI_MIN) return jsonTanpaCache({ galat: `Kata sandi paling sedikit ${SANDI_MIN} huruf.` }, { status: 400 });

  const akun: Akun = { email, nama, peran: "pemilik", sandi: await hashSandi(sandi), versi: 1, dibuat: new Date().toISOString() };
  let dibuat = false;
  await ubahAkun((daftar) => {
    if (daftar.length > 0) return daftar;
    dibuat = true;
    return [akun];
  });
  if (!dibuat) return jsonTanpaCache({ galat: "Akun pemilik sudah ada. Silakan masuk." }, { status: 409 });
  const res = jsonTanpaCache({ sesi: publik(akun) });
  return pasangCookieSesi(res, await buatToken(akun.email, akun.versi), req);
}
