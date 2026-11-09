import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { tx } from "@/lib/konten";
import { hariIniWit, geser } from "@/lib/tanggal";
import {
  MAKS_ENTRI, MAKS_KAMAR, TOKEN_KALENDER, bolehTandai, daftarPakai, kamarFantasea, rapikanIsianEntri, rentangPenuh,
  type DataKalenderMitra, type EntriKalender, type PesananFantasea, type TandaHadir,
} from "@/lib/kalender-mitra";
import { bacaJson, ubahJson } from "./gudang";
import { bacaKonten } from "./konten";
import { semuaPermintaan } from "./permintaan";

/**
 * Simpanan kalender mitra (pola DAMPIER, lib/server/kalender-mitra.ts).
 * Satu berkas kalender-mitra.json (0600) di folder data. Tautan rahasia
 * disimpan polos dan dicocokkan dengan perbandingan waktu tetap. Data mitra
 * (jumlah kamar, nama dan WhatsApp pemilik) hanya untuk panel, tidak masuk
 * isi situs.
 */
export interface TautanKalender { id: string; homestayId: string; token: string; ekspor: string; dibuat: string; oleh: string; dibuka?: string; kali?: number }
export interface DataMitra { kamar: number; pemilik: string; wa: string }
interface Simpanan {
  tautan: TautanKalender[];
  entri: Record<string, EntriKalender[]>;
  mitra: Record<string, DataMitra>;
  hadir: Record<string, Record<string, TandaHadir>>;
}

const BERKAS = "kalender-mitra.json";
const RAHASIA = 0o600;
const kosong = (): Simpanan => ({ tautan: [], entri: {}, mitra: {}, hadir: {} });
const obj = (x: unknown) => (x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : {});

function rapikan(x: unknown): Simpanan {
  const o = obj(x);
  return {
    tautan: Array.isArray(o.tautan) ? (o.tautan as TautanKalender[]).filter((t) => t && TOKEN_KALENDER.test(t.token) && typeof t.homestayId === "string") : [],
    entri: Object.fromEntries(Object.entries(obj(o.entri)).map(([k, v]) => [k, Array.isArray(v) ? (v as EntriKalender[]) : []])),
    mitra: obj(o.mitra) as Record<string, DataMitra>,
    hadir: obj(o.hadir) as Record<string, Record<string, TandaHadir>>,
  };
}

export const bacaKalender = async () => rapikan(await bacaJson(BERKAS, kosong()));
const ubahKalender = (f: (s: Simpanan) => Simpanan) => ubahJson<Simpanan>(BERKAS, kosong(), (lama) => f(rapikan(lama)), RAHASIA);

export const tokenBaru = () => randomBytes(24).toString("base64url");
const idBaru = () => randomBytes(6).toString("hex");
const sama = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function tautanDariToken(token: string): Promise<TautanKalender | null> {
  if (!TOKEN_KALENDER.test(token)) return null;
  return (await bacaKalender()).tautan.find((t) => sama(t.token, token)) ?? null;
}
async function tautanDariEkspor(ekspor: string): Promise<TautanKalender | null> {
  if (!TOKEN_KALENDER.test(ekspor)) return null;
  return (await bacaKalender()).tautan.find((t) => sama(t.ekspor, ekspor)) ?? null;
}

export const dataMitra = (s: Simpanan, id: string): DataMitra => {
  const m = s.mitra[id];
  return { kamar: Math.min(MAKS_KAMAR, Math.max(1, Math.round(Number(m?.kamar) || 1))), pemilik: m?.pemilik ?? "", wa: m?.wa ?? "" };
};

/** Permintaan menginap Fantasea untuk satu homestay, tanpa nomor dan email tamu. */
async function pesananFantasea(homestayId: string, kamar: number): Promise<PesananFantasea[]> {
  const batas = geser(hariIniWit(), -60);
  return (await semuaPermintaan())
    .filter((p) => p.jenis === "homestay" && p.tripId === homestayId && p.status !== "batal" && p.selesai && p.selesai >= batas)
    .map((p) => ({
      kunci: `f:${p.kode}`, kode: p.kode, mulai: p.mulai, selesai: p.selesai, orang: p.orang,
      kamar: kamarFantasea(p.orang, kamar), pasti: p.status === "dikonfirmasi",
      ...(p.status === "dikonfirmasi" ? { nama: p.nama } : {}),
    }))
    .sort((a, b) => a.mulai.localeCompare(b.mulai));
}

async function susunData(s: Simpanan, homestayId: string, ekspor = ""): Promise<DataKalenderMitra | null> {
  const h = (await bacaKonten()).homestay.find((x) => x.id === homestayId);
  if (!h) return null;
  const { kamar } = dataMitra(s, homestayId);
  return {
    homestay: { id: h.id, nama: tx(h.nama, "id"), lokasi: tx(h.lokasi, "id") },
    kamar,
    entri: [...(s.entri[homestayId] ?? [])].sort((a, b) => a.mulai.localeCompare(b.mulai)),
    fantasea: await pesananFantasea(homestayId, kamar),
    hadir: s.hadir[homestayId] ?? {},
    hariIni: hariIniWit(),
    ical: ekspor ? `/api/kalender-mitra/ics/${ekspor}.ics` : "",
  };
}

export async function dataUntukToken(token: string) {
  const t = await tautanDariToken(token);
  if (!t) return null;
  return susunData(await bacaKalender(), t.homestayId, t.ekspor);
}

const BOT = /bot|crawl|spider|preview|facebookexternalhit|WhatsApp|TelegramBot|Slack|Discord|curl|wget/i;
export const botPratinjau = (ua: string | null) => BOT.test(ua ?? "");

/** Dibuka pemilik. Kunjungan yang jaraknya kurang dari 30 menit dihitung sekali. */
export async function catatKunjunganKalender(id: string) {
  await ubahKalender((s) => ({
    ...s,
    tautan: s.tautan.map((t) => {
      if (t.id !== id) return t;
      const baru = !t.dibuka || Date.now() - Date.parse(t.dibuka) > 30 * 60_000;
      return baru ? { ...t, dibuka: new Date().toISOString(), kali: (t.kali ?? 0) + 1 } : t;
    }),
  }));
}

export type AksiMitra =
  | { aksi: "baca" }
  | { aksi: "tambah"; entri: unknown; idKirim?: string }
  | { aksi: "ubah"; id: string; entri: unknown }
  | { aksi: "hapus"; id: string }
  | { aksi: "hadir"; kunci: string; jenis: "masuk" | "keluar"; nilai: boolean };

/** Aksi dari halaman mitra. Mengembalikan data terbaru, atau kalimat galat. */
export async function aksiMitra(token: string, a: AksiMitra): Promise<DataKalenderMitra | string> {
  const t = await tautanDariToken(token);
  if (!t) return "Tautan kalender ini sudah tidak berlaku. Minta tautan baru ke tim Fantasea.";
  const id = t.homestayId;
  let galat = "";
  if (a.aksi !== "baca") {
    const fantasea = a.aksi === "hadir" ? await pesananFantasea(id, dataMitra(await bacaKalender(), id).kamar) : [];
    await ubahKalender((s) => {
      const { kamar } = dataMitra(s, id);
      const daftar = [...(s.entri[id] ?? [])];
      const kini = new Date().toISOString();
      if (a.aksi === "tambah" || a.aksi === "ubah") {
        const isi = rapikanIsianEntri(a.entri, kamar);
        if (typeof isi === "string") { galat = isi; return s; }
        if (a.aksi === "tambah") {
          const idEntri = typeof a.idKirim === "string" && /^[a-f0-9]{12}$/.test(a.idKirim) ? a.idKirim : idBaru();
          if (daftar.some((e) => e.id === idEntri)) return s; // kiriman yang sama, sudah tersimpan
          if (daftar.length >= MAKS_ENTRI) { galat = `Paling banyak ${MAKS_ENTRI} catatan. Hapus catatan lama dulu.`; return s; }
          daftar.push({ ...isi, id: idEntri, dibuat: kini });
        } else {
          const i = daftar.findIndex((e) => e.id === a.id);
          if (i < 0) { galat = "Catatan itu sudah tidak ada."; return s; }
          daftar[i] = { ...isi, id: daftar[i].id, dibuat: daftar[i].dibuat, diubah: kini };
        }
        return { ...s, entri: { ...s.entri, [id]: daftar } };
      }
      if (a.aksi === "hapus") return { ...s, entri: { ...s.entri, [id]: daftar.filter((e) => e.id !== a.id) } };
      // Tanda datang dan pulang, untuk catatan mitra dan pesanan Fantasea.
      const sasaran = a.kunci.startsWith("e:") ? daftar.find((e) => `e:${e.id}` === a.kunci) : fantasea.find((f) => f.kunci === a.kunci);
      if (!sasaran || ("sumber" in sasaran && sasaran.sumber === "tutup")) { galat = "Pesanan itu tidak ditemukan."; return s; }
      if (!bolehTandai(sasaran, hariIniWit())) { galat = "Tanda datang dan pulang hanya untuk tamu yang datang hari ini sampai 30 hari setelah pulang."; return s; }
      const lama = s.hadir[id]?.[a.kunci] ?? {};
      const baru: TandaHadir = a.jenis === "masuk"
        ? (a.nilai ? { ...lama, masuk: lama.masuk ?? kini } : {})
        : (a.nilai ? { masuk: lama.masuk ?? kini, keluar: kini } : { masuk: lama.masuk });
      const hadir = { ...(s.hadir[id] ?? {}) };
      if (baru.masuk || baru.keluar) hadir[a.kunci] = baru; else delete hadir[a.kunci];
      return { ...s, hadir: { ...s.hadir, [id]: hadir } };
    });
  }
  if (galat) return galat;
  return (await susunData(await bacaKalender(), id, t.ekspor)) ?? "Homestay ini sudah tidak ada di situs Fantasea.";
}

/** Ringkas per homestay untuk panel Kalender mitra. */
export async function daftarPanel() {
  const [s, k] = await Promise.all([bacaKalender(), bacaKonten()]);
  return k.homestay.map((h) => {
    const t = s.tautan.find((x) => x.homestayId === h.id);
    const entri = s.entri[h.id] ?? [];
    return {
      homestayId: h.id, nama: tx(h.nama, "id"), lokasi: tx(h.lokasi, "id"), tampil: h.tampil, contoh: !!h.contoh,
      ...dataMitra(s, h.id),
      tautan: t ? { id: t.id, token: t.token, ekspor: t.ekspor, dibuat: t.dibuat, dibuka: t.dibuka, kali: t.kali ?? 0 } : null,
      entri: entri.length,
      diubah: entri.reduce((m, e) => (e.diubah ?? e.dibuat) > m ? (e.diubah ?? e.dibuat) : m, ""),
    };
  });
}
export type BarisPanelMitra = Awaited<ReturnType<typeof daftarPanel>>[number];

export async function buatTautan(homestayId: string, oleh: string) {
  if (!(await bacaKonten()).homestay.some((h) => h.id === homestayId)) return "Homestay tidak ditemukan.";
  await ubahKalender((s) => (s.tautan.some((t) => t.homestayId === homestayId) ? s : {
    ...s, tautan: [...s.tautan, { id: idBaru(), homestayId, token: tokenBaru(), ekspor: tokenBaru(), dibuat: new Date().toISOString(), oleh }],
  }));
  return null;
}
/** Tautan lama langsung mati. Tautan iCal ikut diganti. Catatan tetap. */
export const gantiTautan = (id: string, oleh: string) => ubahKalender((s) => ({
  ...s, tautan: s.tautan.map((t) => (t.id === id ? { id: t.id, homestayId: t.homestayId, token: tokenBaru(), ekspor: tokenBaru(), dibuat: new Date().toISOString(), oleh } : t)),
}));
export const cabutTautan = (id: string) => ubahKalender((s) => ({ ...s, tautan: s.tautan.filter((t) => t.id !== id) }));

export const aturMitra = (homestayId: string, m: DataMitra) => ubahKalender((s) => ({ ...s, mitra: { ...s.mitra, [homestayId]: m } }));

/** Catatan mitra dan tanda hadir semua homestay, untuk Kalender kegiatan di panel. */
export async function agendaPanel() {
  const s = await bacaKalender();
  return Object.fromEntries(Object.keys({ ...s.entri, ...s.mitra, ...s.hadir }).map((id) => [id, {
    ...dataMitra(s, id), entri: s.entri[id] ?? [], hadir: s.hadir[id] ?? {},
  }]));
}
export type AgendaMitra = Awaited<ReturnType<typeof agendaPanel>>;

const ical = (iso: string) => iso.replace(/-/g, "");
/** iCal malam yang penuh, untuk diimpor Booking.com atau OTA lain. Tanpa data tamu. */
export async function icsUntukEkspor(ekspor: string): Promise<string | null> {
  const t = await tautanDariEkspor(ekspor);
  if (!t) return null;
  const s = await bacaKalender();
  const d = await susunData(s, t.homestayId);
  if (!d) return null;
  const hariIni = hariIniWit();
  const penuh = rentangPenuh(daftarPakai(d.entri, d.fantasea), d.kamar, geser(hariIni, -1), geser(hariIni, 540));
  const cap = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const baris = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fantasea Dive Travel//Kalender mitra//ID", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    ...penuh.flatMap((r) => ["BEGIN:VEVENT", `UID:${t.id}-${ical(r.mulai)}@fantasea`, `DTSTAMP:${cap}`, `DTSTART;VALUE=DATE:${ical(r.mulai)}`, `DTEND;VALUE=DATE:${ical(r.selesai)}`, "SUMMARY:Tidak tersedia (Fantasea)", "TRANSP:OPAQUE", "END:VEVENT"]),
    "END:VCALENDAR",
  ];
  return baris.join("\r\n") + "\r\n";
}
