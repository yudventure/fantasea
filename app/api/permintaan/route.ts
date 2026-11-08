import { isLocale } from "@/lib/i18n/config";
import { hariIniWit, jadwalMendatang, sisaKursi, tx } from "@/lib/konten";
import { bacaKonten } from "@/lib/server/konten";
import { alamatPeminta, catat, jsonTanpaCache, wajib, wajibJson } from "@/lib/server/sesi";
import { STATUS_PERMINTAAN, hapusPermintaan, semuaPermintaan, tambahPermintaan, ubahPermintaan, type StatusPermintaan } from "@/lib/server/permintaan";

/**
 * POST terbuka untuk tamu (permintaan pesan). GET, PUT, DELETE hanya untuk
 * panel. Semua isian diperiksa ulang di server terhadap isi situs terbaru.
 */
const str = (v: unknown, maks: number) => (typeof v === "string" ? v.trim().slice(0, maks) : "");

export async function POST(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  if (catat(`permintaan:${alamatPeminta(req)}`, 60 * 60 * 1000) > 8) {
    return jsonTanpaCache({ galat: "Too many requests. Please try again in an hour." }, { status: 429 });
  }
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  // Robot yang mengisi kolom jebakan dijawab seolah berhasil, tanpa disimpan.
  if (str(o.situs, 200)) return jsonTanpaCache({ kode: "FTS-0000-0000", mulai: "", selesai: "" });

  const bahasa = isLocale(str(o.bahasa, 5)) ? (str(o.bahasa, 5) as "en" | "id") : "en";
  const k = await bacaKonten();
  const trip = k.trip.find((t) => t.id === str(o.tripId, 40) && t.tampil);
  if (!trip) return jsonTanpaCache({ galat: bahasa === "id" ? "Trip tidak ditemukan." : "Trip not found." }, { status: 400 });

  const orang = Math.round(Number(o.orang));
  if (!Number.isFinite(orang) || orang < 1 || orang > 30) return jsonTanpaCache({ galat: bahasa === "id" ? "Jumlah orang 1 sampai 30." : "Guests must be 1 to 30." }, { status: 400 });

  const hariIni = hariIniWit();
  let mulai = "", selesai = "", jadwalId = "";
  const idJadwal = str(o.jadwalId, 40);
  if (idJadwal) {
    const j = jadwalMendatang(k.jadwal, hariIni).find((x) => x.id === idJadwal && x.tripId === trip.id);
    if (!j) return jsonTanpaCache({ galat: bahasa === "id" ? "Tanggal open trip ini sudah tidak tersedia." : "This open trip date is no longer available." }, { status: 400 });
    if (sisaKursi(j) < orang) return jsonTanpaCache({ galat: bahasa === "id" ? `Sisa kursi tinggal ${sisaKursi(j)}.` : `Only ${sisaKursi(j)} seats left on this date.` }, { status: 409 });
    mulai = j.mulai; selesai = j.selesai; jadwalId = j.id;
  } else {
    mulai = str(o.mulai, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(mulai) || mulai < hariIni) return jsonTanpaCache({ galat: bahasa === "id" ? "Pilih tanggal mulai hari ini." : "Choose a date from today." }, { status: 400 });
  }

  const nama = str(o.nama, 80);
  const whatsapp = str(o.whatsapp, 24);
  const angka = whatsapp.replace(/[^\d]/g, "");
  const email = str(o.email, 120);
  if (nama.length < 2) return jsonTanpaCache({ galat: bahasa === "id" ? "Isi nama lengkap." : "Please enter your name." }, { status: 400 });
  if (angka.length < 8 || angka.length > 16) return jsonTanpaCache({ galat: bahasa === "id" ? "Periksa lagi nomor WhatsApp." : "Please check the WhatsApp number." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonTanpaCache({ galat: bahasa === "id" ? "Periksa lagi alamat email." : "Please check the email address." }, { status: 400 });

  const p = await tambahPermintaan({
    tripId: trip.id, tripNama: tx(trip.nama, "id") || tx(trip.nama, "en"), jadwalId, mulai, selesai,
    orang, nama, whatsapp, email, catatan: str(o.catatan, 600), bahasa,
  });
  return jsonTanpaCache({ kode: p.kode, mulai: p.mulai, selesai: p.selesai });
}

export async function GET(req: Request) {
  const s = await wajib(req);
  if (s instanceof Response) return s;
  return jsonTanpaCache({ daftar: await semuaPermintaan() });
}

export async function PUT(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req);
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const ubah: { status?: StatusPermintaan; catatanTim?: string } = {};
  if (STATUS_PERMINTAAN.includes(o.status as StatusPermintaan)) ubah.status = o.status as StatusPermintaan;
  if (typeof o.catatanTim === "string") ubah.catatanTim = o.catatanTim.slice(0, 1000);
  const p = await ubahPermintaan(str(o.id, 40), ubah);
  if (!p) return jsonTanpaCache({ galat: "Permintaan tidak ditemukan." }, { status: 404 });
  return jsonTanpaCache({ permintaan: p });
}

export async function DELETE(req: Request) {
  const bukanJson = wajibJson(req);
  if (bukanJson) return bukanJson;
  const s = await wajib(req, (x) => x.peran === "pemilik");
  if (s instanceof Response) return s;
  const o = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  await hapusPermintaan(str(o.id, 40));
  return jsonTanpaCache({ ok: true });
}
