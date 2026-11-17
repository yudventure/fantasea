import { SANDI_MIN, aturSandi, cocokSandi, emailSah, hashSandi, publik, rapikanEmail, semuaAkun, ubahAkun } from "@/lib/server/akun";
import { buatToken, jsonTanpaCache, pasangCookieSesi, wajib, wajibJson } from "@/lib/server/sesi";
import { statusEmail } from "@/lib/server/email";
import { PERAN_ANGGOTA, aksesPenuh, akunUtama, type Peran } from "@/lib/peran";

/** Peran yang boleh dipilih untuk anggota baru. Developer dan pemilik tidak dibuat dari panel. */
const peranAnggotaSah = (v: unknown): v is Peran => PERAN_ANGGOTA.includes(v as Peran);

/**
 * Akun panel. GET, POST, PUT (sandi sementara), dan DELETE hanya untuk akses
 * penuh, yaitu developer dan pemilik (permintaan pemilik, November 2026).
 * Peran tidak bisa diubah setelah akun dibuat, dan akun utama (developer dan
 * pemilik) tidak dibuat, dihapus, atau diberi sandi sementara dari sini.
 * Hanya developer yang mengubahnya, lewat akun.json di folder data. PATCH mengganti sandi sendiri (semua peran), dan sesi lain
 * milik akun itu ikut terputus karena versinya naik. GET juga memberi status
 * email sistem (tanpa kata sandinya), untuk kartu Email sistem di menu Akun.
 */
export async function GET(req: Request) {
  const s = await wajib(req, (x) => aksesPenuh(x.peran));
  if (s instanceof Response) return s;
  return jsonTanpaCache({ akun: (await semuaAkun()).map(publik), email: statusEmail() });
}

export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, (x) => aksesPenuh(x.peran));
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = rapikanEmail(o.email);
  const nama = typeof o.nama === "string" ? o.nama.trim().slice(0, 60) : "";
  const sandi = typeof o.sandi === "string" ? o.sandi : "";
  if (o.peran !== undefined && !peranAnggotaSah(o.peran)) return jsonTanpaCache({ galat: "Anggota baru hanya bisa Admin, Tim, atau Meja permintaan. Akun Developer dan Pemilik dibuat developer lewat kode." }, { status: 400 });
  const peran: Peran = peranAnggotaSah(o.peran) ? o.peran : "tim";
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
 * Sandi sementara untuk akun anggota lain (Admin, Tim, Meja permintaan), dan
 * akun itu ikut keluar. Peran tidak bisa diubah setelah akun dibuat
 * (permintaan pemilik, November 2026), jadi permintaan ganti peran ditolak.
 * Akun utama mengganti sandinya sendiri lewat Akun saya atau Lupa kata sandi.
 */
export async function PUT(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, (x) => aksesPenuh(x.peran));
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (o.peran !== undefined) return jsonTanpaCache({ galat: "Peran tidak bisa diubah setelah akun dibuat. Hapus akun anggota itu, lalu buat lagi dengan peran yang benar." }, { status: 400 });
  const email = rapikanEmail(o.email);
  const sasaran = (await semuaAkun()).find((a) => a.email === email);
  if (!sasaran) return jsonTanpaCache({ galat: "Akun itu tidak ditemukan." }, { status: 404 });
  if (typeof o.sandi !== "string") return jsonTanpaCache({ galat: "Tidak ada yang diubah." }, { status: 400 });
  if (email === s.email) return jsonTanpaCache({ galat: "Sandi sendiri diganti di kartu Akun saya." }, { status: 400 });
  if (akunUtama(sasaran.peran)) return jsonTanpaCache({ galat: "Sandi akun Developer dan Pemilik hanya diganti pemiliknya sendiri, lewat Akun saya atau Lupa kata sandi." }, { status: 403 });
  if (o.sandi.length < SANDI_MIN) return jsonTanpaCache({ galat: `Kata sandi sementara paling sedikit ${SANDI_MIN} huruf.` }, { status: 400 });
  await aturSandi(email, o.sandi);
  return jsonTanpaCache({ akun: (await semuaAkun()).map(publik) });
}

export async function DELETE(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, (x) => aksesPenuh(x.peran));
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = rapikanEmail(o.email);
  if (email === s.email) return jsonTanpaCache({ galat: "Akun sendiri tidak bisa dihapus." }, { status: 400 });
  const sasaran = (await semuaAkun()).find((a) => a.email === email);
  if (!sasaran) return jsonTanpaCache({ galat: "Akun itu tidak ditemukan." }, { status: 404 });
  if (akunUtama(sasaran.peran)) return jsonTanpaCache({ galat: "Akun Developer dan Pemilik tidak bisa dihapus dari panel." }, { status: 403 });
  const daftar = await ubahAkun((lama) => lama.filter((a) => a.email !== email || akunUtama(a.peran)));
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
