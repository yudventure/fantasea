import type { Locale } from "@/lib/i18n/config";

/**
 * Bentuk isi situs yang diatur dari panel pengelola.
 *
 * Semua yang tampil ke tamu ada di sini, kecuali label tetap formulir dan
 * tombol (messages/*.json). Teks dua bahasa disimpan sebagai { en, id }.
 * Judul bagian boleh memuat *kata berwarna* di antara tanda bintang dan baris
 * baru, lihat components/Judul.tsx.
 */
export type Teks = { en: string; id: string };
export type DaftarTeks = { en: string[]; id: string[] };
export type WarnaTag = "tanda" | "ukir" | "koral" | "navy";
export const WARNA_TAG: WarnaTag[] = ["tanda", "ukir", "koral", "navy"];

/** Kartu foto berlabel di hero dan bagian Jelajah. `tag` seperti "@mantasandy". */
export interface Kartu { foto: string; tag: string; warna: WarnaTag }
export interface FotoBerketerangan { foto: string; keterangan: Teks }
export interface KepalaBagian { label: Teks; judul: Teks; lead: Teks }

export type KategoriTrip = "selam" | "snorkel" | "liveaboard" | "privat";
export const KATEGORI_TRIP: KategoriTrip[] = ["selam", "snorkel", "liveaboard", "privat"];

export interface Trip {
  id: string;
  slug: string;
  nama: Teks;
  kategori: KategoriTrip;
  ringkas: Teks;
  /** Paragraf dipisah baris kosong. */
  deskripsi: Teks;
  durasi: Teks;
  /** Jumlah selam dalam satu trip. 0 untuk trip tanpa selam. */
  selam: number;
  level: Teks;
  /** Harga mulai per orang dalam rupiah. 0 berarti tanya harga. */
  hargaMulai: number;
  termasuk: DaftarTeks;
  belum: DaftarTeks;
  /** Foto pertama jadi sampul. */
  foto: string[];
  tampil: boolean;
  /** Isi contoh bawaan. Hilang begitu diubah di panel. */
  contoh?: boolean;
}

export interface Jadwal {
  id: string;
  tripId: string;
  /** YYYY-MM-DD */
  mulai: string;
  selesai: string;
  kursi: number;
  terisi: number;
  catatan: Teks;
  contoh?: boolean;
}

export interface TitikSelam {
  id: string;
  nama: string;
  wilayah: Teks;
  kedalaman: string;
  arus: Teks;
  level: Teks;
  sorotan: Teks;
  foto: string;
  tampil: boolean;
  contoh?: boolean;
}

export interface Ulasan { id: string; nama: string; asal: string; teks: string; bintang: number; tampil: boolean }
export interface Faq { id: string; tanya: Teks; jawab: Teks }

export interface Konten {
  situs: {
    kontak: { whatsapp: string; email: string; alamat: Teks; peta: string };
    sosial: { instagram: string; facebook: string; tiktok: string; youtube: string };
    seo: { judul: Teks; deskripsi: Teks };
  };
  menu: { trip: Teks; jadwal: Teks; titik: Teks; ulasan: Teks; faq: Teks; pesan: Teks };
  hero: { judul: Teks; lead: Teks; tombol1: Teks; tombol2: Teks; kartu: Kartu[] };
  jelajah: KepalaBagian & { tombol1: Teks; tombol2: Teks; kartu: Kartu[] };
  gerbang: KepalaBagian & { foto: FotoBerketerangan[]; video: string; tag: string; warna: WarnaTag };
  bagian: { trip: KepalaBagian; jadwal: KepalaBagian; titik: KepalaBagian; ulasan: KepalaBagian; faq: KepalaBagian };
  ajakan: { judul: Teks; lead: Teks; tombol: Teks };
  footer: { tentang: Teks };
  trip: Trip[];
  jadwal: Jadwal[];
  titik: TitikSelam[];
  ulasan: Ulasan[];
  faq: Faq[];
}

export const JUMLAH_KARTU_HERO = 5;
export const JUMLAH_KARTU_JELAJAH = 4;
export const MAKS_FOTO_GERBANG = 6;
export const MAKS_FOTO_TRIP = 8;
export const MAKS_DAFTAR = 60;

// ---------------------------------------------------------------------------
// Membaca teks dua bahasa

/** Teks dalam bahasa ini, jatuh ke bahasa Inggris lalu Indonesia bila kosong. */
export function tx(t: Teks | undefined, l: Locale): string {
  if (!t) return "";
  return (t[l] || t.en || t.id || "").trim();
}
export function txDaftar(d: DaftarTeks | undefined, l: Locale): string[] {
  if (!d) return [];
  const isi = d[l]?.length ? d[l] : d.en?.length ? d.en : d.id ?? [];
  return isi.map((s) => s.trim()).filter(Boolean);
}

export function slugDari(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "trip";
}

export function idBaru(awalan: string): string {
  return `${awalan}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Sisa kursi sebuah jadwal, tidak pernah di bawah nol. */
export const sisaKursi = (j: Jadwal) => Math.max(0, j.kursi - j.terisi);

/** Jadwal yang belum lewat, urut tanggal mulai. `hariIni` YYYY-MM-DD. */
export function jadwalMendatang(daftar: Jadwal[], hariIni: string): Jadwal[] {
  return daftar.filter((j) => j.selesai >= hariIni).sort((a, b) => a.mulai.localeCompare(b.mulai));
}

/** Tanggal hari ini di Raja Ampat (WIT, UTC+9). */
export function hariIniWit(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Merapikan isi dari panel sebelum disimpan. Apa pun yang dikirim peramban
// dibentuk ulang ke bentuk yang sah, jadi berkas simpanan selalu bisa dibaca.

const str = (v: unknown, maks = 4000) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").slice(0, maks) : "");
const num = (v: unknown, min = 0, maks = 1e12) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(maks, Math.max(min, Math.round(n))) : min;
};
const bool = (v: unknown, bawaan = true) => (typeof v === "boolean" ? v : bawaan);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v.slice(0, MAKS_DAFTAR) : []);

export function teks(v: unknown, bawaan?: Teks, maks = 4000): Teks {
  const o = obj(v);
  return {
    en: typeof o.en === "string" ? str(o.en, maks) : bawaan?.en ?? "",
    id: typeof o.id === "string" ? str(o.id, maks) : bawaan?.id ?? "",
  };
}
function daftarTeks(v: unknown): DaftarTeks {
  const o = obj(v);
  const satu = (x: unknown) => arr(x).map((s) => str(s, 300).trim()).filter(Boolean).slice(0, 30);
  return { en: satu(o.en), id: satu(o.id) };
}
/** Alamat foto yang boleh disimpan: aset merek, unggahan, atau https. */
export function fotoSah(v: unknown): string {
  const s = str(v, 600).trim();
  if (/^\/(brand|unggahan)\/[\w./-]+$/.test(s) && !s.includes("..")) return s;
  if (/^https:\/\/[^\s"'<>]+$/.test(s)) return s;
  return "";
}
const warna = (v: unknown, bawaan: WarnaTag = "tanda"): WarnaTag => (WARNA_TAG.includes(v as WarnaTag) ? (v as WarnaTag) : bawaan);
const tanggal = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
const tautan = (v: unknown) => {
  const s = str(v, 400).trim();
  return /^https:\/\/[^\s"'<>]+$/.test(s) ? s : "";
};
const id = (v: unknown, awalan: string) => {
  const s = str(v, 40).trim();
  return /^[\w-]{2,40}$/.test(s) ? s : idBaru(awalan);
};

function kartu(v: unknown, bawaan?: Kartu): Kartu {
  const o = obj(v);
  return { foto: "foto" in o ? fotoSah(o.foto) : bawaan?.foto ?? "", tag: "tag" in o ? str(o.tag, 40).trim() : bawaan?.tag ?? "", warna: warna(o.warna, bawaan?.warna) };
}
function kepala(v: unknown, b: KepalaBagian): KepalaBagian {
  const o = obj(v);
  return { label: teks(o.label, b.label, 80), judul: teks(o.judul, b.judul, 200), lead: teks(o.lead, b.lead, 600) };
}

export function normalkanKonten(v: unknown, b: Konten): Konten {
  const o = obj(v);
  const situs = obj(o.situs), kontak = obj(situs.kontak), sosial = obj(situs.sosial), seo = obj(situs.seo);
  const menu = obj(o.menu), hero = obj(o.hero), jelajah = obj(o.jelajah), gerbang = obj(o.gerbang), bagian = obj(o.bagian), ajakan = obj(o.ajakan), footer = obj(o.footer);

  const kartuList = (x: unknown, jumlah: number, bawaan: Kartu[]) =>
    Array.from({ length: jumlah }, (_, i) => kartu(arr(x)[i], bawaan[i]));

  const trip: Trip[] = ("trip" in o ? arr(o.trip) : b.trip).map((t) => {
    const x = obj(t);
    const nama = teks(x.nama, undefined, 120);
    return {
      id: id(x.id, "t"),
      slug: slugDari(str(x.slug, 80) || nama.en || nama.id),
      nama,
      kategori: KATEGORI_TRIP.includes(x.kategori as KategoriTrip) ? (x.kategori as KategoriTrip) : "selam",
      ringkas: teks(x.ringkas, undefined, 300),
      deskripsi: teks(x.deskripsi, undefined, 6000),
      durasi: teks(x.durasi, undefined, 60),
      selam: num(x.selam, 0, 99),
      level: teks(x.level, undefined, 80),
      hargaMulai: num(x.hargaMulai, 0, 1e11),
      termasuk: daftarTeks(x.termasuk),
      belum: daftarTeks(x.belum),
      foto: arr(x.foto).map(fotoSah).filter(Boolean).slice(0, MAKS_FOTO_TRIP),
      tampil: bool(x.tampil),
      ...(x.contoh === true ? { contoh: true } : {}),
    };
  });
  // Slug kembar diberi akhiran supaya tiap trip punya alamat sendiri.
  const dipakai = new Set<string>();
  for (const t of trip) {
    let s = t.slug, n = 2;
    while (dipakai.has(s)) s = `${t.slug}-${n++}`;
    t.slug = s;
    dipakai.add(s);
  }
  const idTrip = new Set(trip.map((t) => t.id));

  return {
    situs: {
      kontak: {
        whatsapp: str(kontak.whatsapp, 30).replace(/[^\d]/g, "") || ("whatsapp" in kontak ? "" : b.situs.kontak.whatsapp),
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(kontak.email, 120).trim()) ? str(kontak.email, 120).trim() : "email" in kontak ? "" : b.situs.kontak.email,
        alamat: teks(kontak.alamat, b.situs.kontak.alamat, 300),
        peta: "peta" in kontak ? tautan(kontak.peta) : b.situs.kontak.peta,
      },
      sosial: {
        instagram: "instagram" in sosial ? tautan(sosial.instagram) : b.situs.sosial.instagram,
        facebook: "facebook" in sosial ? tautan(sosial.facebook) : b.situs.sosial.facebook,
        tiktok: "tiktok" in sosial ? tautan(sosial.tiktok) : b.situs.sosial.tiktok,
        youtube: "youtube" in sosial ? tautan(sosial.youtube) : b.situs.sosial.youtube,
      },
      seo: { judul: teks(seo.judul, b.situs.seo.judul, 90), deskripsi: teks(seo.deskripsi, b.situs.seo.deskripsi, 300) },
    },
    menu: {
      trip: teks(menu.trip, b.menu.trip, 30), jadwal: teks(menu.jadwal, b.menu.jadwal, 30), titik: teks(menu.titik, b.menu.titik, 30),
      ulasan: teks(menu.ulasan, b.menu.ulasan, 30), faq: teks(menu.faq, b.menu.faq, 30), pesan: teks(menu.pesan, b.menu.pesan, 30),
    },
    hero: {
      judul: teks(hero.judul, b.hero.judul, 200), lead: teks(hero.lead, b.hero.lead, 400),
      tombol1: teks(hero.tombol1, b.hero.tombol1, 40), tombol2: teks(hero.tombol2, b.hero.tombol2, 40),
      kartu: kartuList(hero.kartu, JUMLAH_KARTU_HERO, b.hero.kartu),
    },
    jelajah: {
      ...kepala(jelajah, b.jelajah),
      tombol1: teks(jelajah.tombol1, b.jelajah.tombol1, 40), tombol2: teks(jelajah.tombol2, b.jelajah.tombol2, 40),
      kartu: kartuList(jelajah.kartu, JUMLAH_KARTU_JELAJAH, b.jelajah.kartu),
    },
    gerbang: {
      ...kepala(gerbang, b.gerbang),
      foto: ("foto" in gerbang ? arr(gerbang.foto) : b.gerbang.foto).slice(0, MAKS_FOTO_GERBANG).map((f) => {
        const x = obj(f);
        return { foto: fotoSah(x.foto), keterangan: teks(x.keterangan, undefined, 200) };
      }).filter((f) => f.foto),
      video: "video" in gerbang ? tautan(gerbang.video) : b.gerbang.video,
      tag: "tag" in gerbang ? str(gerbang.tag, 40).trim() : b.gerbang.tag,
      warna: warna(gerbang.warna, b.gerbang.warna),
    },
    bagian: {
      trip: kepala(obj(bagian.trip), b.bagian.trip), jadwal: kepala(obj(bagian.jadwal), b.bagian.jadwal), titik: kepala(obj(bagian.titik), b.bagian.titik),
      ulasan: kepala(obj(bagian.ulasan), b.bagian.ulasan), faq: kepala(obj(bagian.faq), b.bagian.faq),
    },
    ajakan: { judul: teks(ajakan.judul, b.ajakan.judul, 200), lead: teks(ajakan.lead, b.ajakan.lead, 400), tombol: teks(ajakan.tombol, b.ajakan.tombol, 40) },
    footer: { tentang: teks(footer.tentang, b.footer.tentang, 400) },
    trip,
    jadwal: ("jadwal" in o ? arr(o.jadwal) : b.jadwal).map((j) => {
      const x = obj(j);
      const mulai = tanggal(x.mulai), selesai = tanggal(x.selesai) || mulai;
      const kursi = num(x.kursi, 0, 500);
      return {
        id: id(x.id, "j"), tripId: str(x.tripId, 40), mulai, selesai: selesai < mulai ? mulai : selesai,
        kursi, terisi: Math.min(kursi, num(x.terisi, 0, 500)), catatan: teks(x.catatan, undefined, 160),
        ...(x.contoh === true ? { contoh: true } : {}),
      };
    }).filter((j) => j.mulai && idTrip.has(j.tripId)),
    titik: ("titik" in o ? arr(o.titik) : b.titik).map((t) => {
      const x = obj(t);
      return {
        id: id(x.id, "s"), nama: str(x.nama, 80).trim(), wilayah: teks(x.wilayah, undefined, 80), kedalaman: str(x.kedalaman, 30).trim(),
        arus: teks(x.arus, undefined, 40), level: teks(x.level, undefined, 60), sorotan: teks(x.sorotan, undefined, 300),
        foto: fotoSah(x.foto), tampil: bool(x.tampil), ...(x.contoh === true ? { contoh: true } : {}),
      };
    }).filter((t) => t.nama),
    ulasan: ("ulasan" in o ? arr(o.ulasan) : b.ulasan).map((u) => {
      const x = obj(u);
      return { id: id(x.id, "u"), nama: str(x.nama, 60).trim(), asal: str(x.asal, 60).trim(), teks: str(x.teks, 800).trim(), bintang: num(x.bintang, 1, 5) || 5, tampil: bool(x.tampil) };
    }).filter((u) => u.nama && u.teks),
    faq: ("faq" in o ? arr(o.faq) : b.faq).map((f) => {
      const x = obj(f);
      return { id: id(x.id, "f"), tanya: teks(x.tanya, undefined, 200), jawab: teks(x.jawab, undefined, 1500) };
    }).filter((f) => f.tanya.en || f.tanya.id),
  };
}
