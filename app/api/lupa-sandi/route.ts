import { cariAkun, rapikanEmail } from "@/lib/server/akun";
import { emailAktif, kirimEmail } from "@/lib/server/email";
import { MENIT_BERLAKU, buatKode } from "@/lib/server/kode-sandi";
import { alamatPeminta, catat, jsonTanpaCache, wajibJson } from "@/lib/server/sesi";

export const dynamic = "force-dynamic";

/**
 * Minta kode atur ulang kata sandi (pola DAMPIER). Jawabannya sama untuk
 * email yang terdaftar maupun tidak, supaya tidak bisa dipakai menebak siapa
 * anggota tim. Paling banyak 3 kode per email dan 10 permintaan per alamat
 * per jam. Tanpa email sistem (SMTP di hPanel) jawabannya emailAktif false,
 * dan pemilik memakai kunci penyiapan sebagai gantinya.
 */
export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const JAM = 60 * 60 * 1000;
  const o = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = rapikanEmail(o.email);
  if (!email) return jsonTanpaCache({ galat: "Isi email akunmu." }, { status: 400 });
  if (catat(`lupa-ip:${alamatPeminta(req)}`, JAM) > 10) return jsonTanpaCache({ galat: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  if (!emailAktif()) return jsonTanpaCache({ ok: true, emailAktif: false });
  const akun = await cariAkun(email);
  if (akun && catat(`lupa-email:${email}`, JAM) <= 3) {
    const kode = await buatKode(email);
    const teks = `Halo ${akun.nama},\n\nKode untuk mengatur ulang kata sandi panel Fantasea adalah ${kode}. Kode ini berlaku ${MENIT_BERLAKU} menit.\n\nKalau kamu tidak meminta kode ini, abaikan email ini. Kata sandimu tidak berubah.\n\nFantasea Dive Travel`;
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#203149;line-height:1.6"><p>Halo ${akun.nama.replace(/[<>&]/g, "")},</p><p>Kode untuk mengatur ulang kata sandi panel Fantasea</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:12px 0">${kode}</p><p>Kode ini berlaku ${MENIT_BERLAKU} menit. Kalau kamu tidak meminta kode ini, abaikan email ini. Kata sandimu tidak berubah.</p><p>Fantasea Dive Travel</p></div>`;
    void kirimEmail({ ke: email, subjek: "Kode atur ulang kata sandi panel Fantasea", teks, html }).catch((x) => console.error("[fantasea] email kode sandi", x));
  }
  return jsonTanpaCache({ ok: true, emailAktif: true, menit: MENIT_BERLAKU });
}
