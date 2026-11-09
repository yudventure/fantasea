import { SANDI_MIN, aturSandi, cocokSandi, emailSah, hashSandi, publik, rapikanEmail, semuaAkun, ubahAkun } from "@/lib/server/akun";
import { buatToken, jsonTanpaCache, pasangCookieSesi, wajib, wajibJson } from "@/lib/server/sesi";
import { statusEmail } from "@/lib/server/email";
import type { Peran } from "@/lib/peran";

/** Peran yang boleh diberikan pemilik ke anggota tim. Pemilik tetap satu, dari penyiapan. */
const PERAN_TIM: Peran[] = ["tim", "meja"];

/**
 * Akun tim. GET, POST, PUT (ganti peran), dan DELETE hanya pemilik. PATCH
 * mengganti sandi sendiri (semua peran), dan sesi lain milik akun itu ikut
 * terputus karena versinya naik. GET juga memberi status email sistem
 * (tanpa kata sandinya), untuk kartu Email sistem di menu Akun.
 */
export async function GET(req: Request) {
  const s = await wajib(req, (x) => x.peran === "pemilik");
  if (s instanceof Response) return s;
  return jsonTanpaCache({ akun: (await semuaAkun()).map(publik), email: statusEmail() });
}

export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, (x) => x.peran === "pemilik");
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = rapikanEmail(o.email);
  const nama = typeof o.nama === "string" ? o.nama.trim().slice(0, 60) : "";
  const sandi = typeof o.sandi === "string" ? o.sandi : "";
  const peran: Peran = PERAN_TIM.includes(o.peran as Peran) ? (o.peran as Peran) : "tim";
  if (!nama) return jsonTanpaCache({ galat: "Isi nama." }, { status: 400 });
  if (!emailSah(email)) return jsonTanpaCache({ galat: "Periksa alamat email." }, { status: 400 });
  if (sandi.length < SANDI_MIN) return jsonTanpaCache({ galat: `Kata sandi sementara paling sedikit ${SANDI_MIN} huruf.` }, { status: 400 });
  const hash = await hashSandi(sandi);
  let ada = false;
  const daftar = await ubahAkun((lama) => {
    if (lama.some((a) => a.email === email)) { ada = true; return lama; }
    return [...lama, { email, nama, peran, sandi: hash, versi: 1, dibuat: new Date().toISOString() }];
  });
  if (ada) return jsonTanpaCache({ galat: "Email itu sudah punya akun." }, { status: 409 });
  return jsonTanpaCache({ akun: daftar.map(publik) });
}

/**
 * Ubah anggota tim, khusus pemilik. `peran` mengganti perannya (Tim atau
 * Meja permintaan), `sandi` memberi kata sandi sementara untuk anggota yang
 * lupa sandinya selama email sistem belum dipasang. Keduanya mengeluarkan
 * sesi anggota itu, supaya menu atau sandi barunya langsung berlaku.
 */
export async function PUT(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, (x) => x.peran === "pemilik");
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = rapikanEmail(o.email);
  if (email === s.email) return jsonTanpaCache({ galat: "Akun sendiri diubah di kartu Akun saya." }, { status: 400 });
  const sasaran = (await semuaAkun()).find((a) => a.email === email);
  if (!sasaran || sasaran.peran === "pemilik") return jsonTanpaCache({ galat: "Anggota itu tidak ditemukan." }, { status: 404 });

  if (typeof o.sandi === "string") {
    if (o.sandi.length < SANDI_MIN) return jsonTanpaCache({ galat: `Kata sandi sementara paling sedikit ${SANDI_MIN} huruf.` }, { status: 400 });
    await aturSandi(email, o.sandi);
    return jsonTanpaCache({ akun: (await semuaAkun()).map(publik) });
  }
  const peran = o.peran as Peran;
  if (!PERAN_TIM.includes(peran)) return jsonTanpaCache({ galat: "Peran tidak dikenal." }, { status: 400 });
  const daftar = await ubahAkun((lama) => lama.map((a) => (a.email === email && a.peran !== "pemilik" && a.peran !== peran ? { ...a, peran, versi: a.versi + 1 } : a)));
  return jsonTanpaCache({ akun: daftar.map(publik) });
}

export async function DELETE(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, (x) => x.peran === "pemilik");
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = rapikanEmail(o.email);
  if (email === s.email) return jsonTanpaCache({ galat: "Akun sendiri tidak bisa dihapus." }, { status: 400 });
  const daftar = await ubahAkun((lama) => lama.filter((a) => a.email !== email || a.peran === "pemilik"));
  return jsonTanpaCache({ akun: daftar.map(publik) });
}

export async function PATCH(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req);
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const lama = typeof o.lama === "string" ? o.lama : "";
  const baru = typeof o.baru === "string" ? o.baru : "";
  if (baru.length < SANDI_MIN) return jsonTanpaCache({ galat: `Kata sandi baru paling sedikit ${SANDI_MIN} huruf.` }, { status: 400 });
  const akun = (await semuaAkun()).find((a) => a.email === s.email);
  if (!akun || !(await cocokSandi(lama, akun.sandi))) return jsonTanpaCache({ galat: "Kata sandi lama keliru." }, { status: 401 });
  const hash = await hashSandi(baru);
  const daftar = await ubahAkun((semua) => semua.map((a) => (a.email === s.email ? { ...a, sandi: hash, versi: a.versi + 1 } : a)));
  const kini = daftar.find((a) => a.email === s.email)!;
  return pasangCookieSesi(jsonTanpaCache({ ok: true }), await buatToken(kini.email, kini.versi), req);
}
