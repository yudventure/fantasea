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

/**
 * Kategori aktivitas seperti website lama Fantasea (permintaan pemilik,
 * November 2026, "aktivitasnya seperti ini dan kelompokan per kategori").
 * Diatur di panel Trip dan harga. Kategori `liveaboard` punya halaman sendiri
 * dan tidak bisa dihapus.
 */
export interface KategoriAktivitas { id: string; nama: Teks; ringkas: Teks; foto: string; tampil: boolean }
export const ID_LIVEABOARD = "liveaboard";
export const MAKS_KATEGORI = 16;

export interface Trip {
  id: string;
  slug: string;
  nama: Teks;
  /** Id kategori aktivitas (`Konten.kategori`). */
  kategori: string;
  ringkas: Teks;
  /** Paragraf dipisah baris kosong. */
  deskripsi: Teks;
  durasi: Teks;
  /** Jumlah selam dalam satu trip. 0 untuk trip tanpa selam. */
  selam: number;
  /** Alat selam termasuk, tampil sebagai Gear included di kartu. */
  alat: boolean;
  /** Satu baris pendek di kartu di bawah durasi, mis. All-included atau nama pulau. */
  sorot: Teks;
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

/**
 * Homestay mitra yang ditawarkan di bawah bagian kartu bertumpuk (permintaan
 * pemilik, November 2026). Kartunya seperti kartu trip, dan tiap homestay
 * punya halaman sendiri dengan formulir permintaan menginap.
 */
export interface Homestay {
  id: string;
  slug: string;
  nama: Teks;
  /** Pulau atau kampung, mis. Pulau Kri, Selat Dampier. */
  lokasi: Teks;
  ringkas: Teks;
  /** Paragraf dipisah baris kosong. */
  deskripsi: Teks;
  fasilitas: DaftarTeks;
  /** Harga mulai per orang per malam dalam rupiah. 0 berarti tanya harga. */
  hargaMulai: number;
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

/** Satu kartu edukasi selam di halaman Trip, mis. musim terbaik atau etika di karang. */
export interface Edukasi { id: string; judul: Teks; isi: Teks; contoh?: boolean }

export interface Ulasan { id: string; nama: string; asal: string; teks: string; bintang: number; tampil: boolean }
export interface Faq { id: string; tanya: Teks; jawab: Teks }

export interface KursusSelam {
  id: string; nama: Teks; foto: string; hargaUsd: number; hari: number; selam: number; alat: boolean; tampil: boolean; lokasi: Teks; pembayaran: string;
}

export interface Konten {
  situs: {
    /** Penanda simpanan. Di bawah VERSI_KONTAK berarti disimpan sebelum kontak contoh ada. */
    versiKontak: number;
    kontak: { whatsapp: string; email: string; alamat: Teks; peta: string };
    sosial: { instagram: string; facebook: string; tiktok: string; youtube: string };
    seo: { judul: Teks; deskripsi: Teks };
  };
  menu: { beranda: Teks; about: Teks; trip: Teks; liveaboard: Teks; jadwal: Teks; homestay: Teks; titik: Teks; ulasan: Teks; faq: Teks; pesan: Teks };
  hero: { judul: Teks; lead: Teks; tombol1: Teks; tombol2: Teks; kartu: Kartu[] };
  /** Bagian kartu bertumpuk, sekarang pembuka homestay. Kartu homestay tampil di bawahnya. */
  jelajah: KepalaBagian & { kartu: Kartu[] };
  gerbang: KepalaBagian & { foto: FotoBerketerangan[]; video: string; tag: string; warna: WarnaTag };
  bagian: { trip: KepalaBagian; jadwal: KepalaBagian; titik: KepalaBagian; ulasan: KepalaBagian; faq: KepalaBagian };
  ajakan: { judul: Teks; lead: Teks; tombol: Teks };
  /**
   * Bagian Liveaboard di beranda, di antara open trip dan FAQ (permintaan
   * pemilik, November 2026). Trip berkategori liveaboard tampil di sini
   * sebagai kartu, dan tidak diulang di daftar trip beranda.
   */
  diveCourse: KepalaBagian & { tampil: boolean; foto: string; tombol: Teks; kursus: KursusSelam[] };
  liveaboard: KepalaBagian & { tampil: boolean; foto: string; tag: string; warna: WarnaTag; butir: DaftarTeks; tombol: Teks };
  /**
   * Halaman sendiri untuk trip dan homestay (permintaan pemilik, November
   * 2026). Halaman Trip berisi katalog trip, edukasi selam, dan titik selam.
   * Halaman Homestay berisi semua homestay.
   */
  halamanTrip: { kepala: KepalaBagian; kategori: KepalaBagian; edukasi: KepalaBagian & { butir: Edukasi[] } };
  halamanHomestay: { kepala: KepalaBagian };
  /**
   * Halaman Liveaboard sendiri seperti halaman Trip (permintaan pemilik,
   * November 2026). Katalog trip berjenis Liveaboard, keunggulan dari bagian
   * Liveaboard, jadwal, dan kartu pengetahuan sebelum naik kapal.
   */
  halamanLiveaboard: { kepala: KepalaBagian; edukasi: KepalaBagian & { butir: Edukasi[] } };
  footer: { tentang: Teks };
  kategori: KategoriAktivitas[];
  trip: Trip[];
  jadwal: Jadwal[];
  homestay: Homestay[];
  titik: TitikSelam[];
  ulasan: Ulasan[];
  faq: Faq[];
}

/**
 * Sejak versi 2 isi bawaan memuat kontak dan media sosial contoh. Simpanan
 * yang lebih lama menyimpan kolom itu kosong karena dulu bawaannya kosong,
 * jadi kolom kosongnya diisi contoh sekali. Sesudah disimpan dari panel,
 * kolom kosong berarti sengaja disembunyikan.
 */
export const VERSI_KONTAK = 2;

/**
 * Teks bawaan lama bagian kartu bertumpuk ("Dive with us"). Simpanan yang
 * masih memuat teks ini persis diganti teks bawaan baru (penginapan), jadi
 * permintaan pemilik tetap tayang walau panel pernah disimpan. Teks yang
 * sudah diubah pemilik tidak disentuh.
 */
const JELAJAH_LAMA: KepalaBagian = {
  label: { en: "Dive travel", id: "Dive travel" },
  judul: { en: "Dive with us,\n*& explore the reefs*\ntogether.", id: "Menyelam bersama,\n*& jelajahi karang*\nRaja Ampat." },
  lead: {
    en: "A small dive travel team from Raja Ampat. We plan the boat, the homestay and the dives. You bring the curiosity.",
    id: "Tim dive travel kecil dari Raja Ampat. Kami atur kapal, homestay, dan titik selamnya. Kamu cukup membawa rasa ingin tahu.",
  },
};

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
  const o = structuredClone(obj(v));
  const gantiLama = (sumber: Record<string, unknown>, kunci: string, lama: Teks, baru: Teks) => {
    const nilai = obj(sumber[kunci]);
    for (const l of ["en", "id"] as const) if (nilai[l] === lama[l]) nilai[l] = baru[l];
  };
  gantiLama(obj(o.menu), "trip", { en: "Trips", id: "Trip" }, b.menu.trip);
  gantiLama(obj(o.menu), "homestay", { en: "Homestays", id: "Homestay" }, b.menu.homestay);
  const bagianLama = obj(obj(o.bagian).trip);
  gantiLama(bagianLama, "label", { en: "Trips", id: "Trip" }, b.bagian.trip.label);
  gantiLama(bagianLama, "judul", { en: "Pick your *route.*", id: "Pilih *rutemu.*" }, b.bagian.trip.judul);
  const kepalaLama = obj(obj(o.halamanTrip).kepala);
  gantiLama(kepalaLama, "label", { en: "Trips and dive sites", id: "Trip dan titik selam" }, b.halamanTrip.kepala.label);
  gantiLama(kepalaLama, "judul", { en: "Every trip,\n*every reef.*", id: "Semua trip,\n*semua karang.*" }, b.halamanTrip.kepala.judul);
  const situs = obj(o.situs), kontak = obj(situs.kontak), sosial = obj(situs.sosial), seo = obj(situs.seo);
  const menu = obj(o.menu), hero = obj(o.hero), jelajah = obj(o.jelajah), gerbang = obj(o.gerbang), bagian = obj(o.bagian), ajakan = obj(o.ajakan), footer = obj(o.footer);
  const diveCourse = obj(o.diveCourse);
  const liveaboard = obj(o.liveaboard);
  const halamanTrip = obj(o.halamanTrip), edukasi = obj(halamanTrip.edukasi), halamanHomestay = obj(o.halamanHomestay);
  const halamanLiveaboard = obj(o.halamanLiveaboard), edukasiLa = obj(halamanLiveaboard.edukasi);
  const butirEdukasi = (sumber: Record<string, unknown>, bawaan: Edukasi[]) => ("butir" in sumber ? arr(sumber.butir) : bawaan).map((e) => {
    const x = obj(e);
    return { id: id(x.id, "e"), judul: teks(x.judul, undefined, 80), isi: teks(x.isi, undefined, 600), ...(x.contoh === true ? { contoh: true } : {}) };
  }).filter((e) => e.judul.en || e.judul.id);

  const kartuList = (x: unknown, jumlah: number, bawaan: Kartu[]) =>
    Array.from({ length: jumlah }, (_, i) => kartu(arr(x)[i], bawaan[i]));

  const kategori: KategoriAktivitas[] = ("kategori" in o ? arr(o.kategori) : b.kategori).map((kt) => {
    const x = obj(kt);
    return { id: slugDari(str(x.id, 40)) || idBaru("k"), nama: teks(x.nama, undefined, 60), ringkas: teks(x.ringkas, undefined, 300), foto: fotoSah(x.foto), tampil: bool(x.tampil, true) };
  }).filter((kt, i, semua) => (kt.nama.en || kt.nama.id) && semua.findIndex((y) => y.id === kt.id) === i).slice(0, MAKS_KATEGORI);
  // Kategori liveaboard selalu ada, karena punya halaman sendiri.
  if (!kategori.some((kt) => kt.id === ID_LIVEABOARD)) kategori.push(structuredClone(b.kategori.find((kt) => kt.id === ID_LIVEABOARD)!));
  // Simpanan lama memakai jenis tetap. "privat" menjadi Fun diving.
  const kategoriTrip = (v: unknown) => {
    const s = str(v, 40) === "privat" ? "selam" : str(v, 40);
    return kategori.some((kt) => kt.id === s) ? s : kategori.find((kt) => kt.id === "selam")?.id ?? kategori[0].id;
  };

  const trip: Trip[] = ("trip" in o ? arr(o.trip) : b.trip).map((t) => {
    const x = obj(t);
    const nama = teks(x.nama, undefined, 120);
    return {
      id: id(x.id, "t"),
      slug: slugDari(str(x.slug, 80) || nama.en || nama.id),
      nama,
      kategori: kategoriTrip(x.kategori),
      ringkas: teks(x.ringkas, undefined, 300),
      deskripsi: teks(x.deskripsi, undefined, 6000),
      durasi: teks(x.durasi, undefined, 60),
      selam: num(x.selam, 0, 99),
      alat: bool(x.alat, false),
      sorot: teks(x.sorot, undefined, 60),
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

  const homestay: Homestay[] = ("homestay" in o ? arr(o.homestay) : b.homestay).map((h) => {
    const x = obj(h);
    const nama = teks(x.nama, undefined, 120);
    return {
      id: id(x.id, "h"),
      slug: slugDari(str(x.slug, 80) || nama.en || nama.id || "homestay"),
      nama,
      lokasi: teks(x.lokasi, undefined, 120),
      ringkas: teks(x.ringkas, undefined, 300),
      deskripsi: teks(x.deskripsi, undefined, 6000),
      fasilitas: daftarTeks(x.fasilitas),
      hargaMulai: num(x.hargaMulai, 0, 1e11),
      foto: arr(x.foto).map(fotoSah).filter(Boolean).slice(0, MAKS_FOTO_TRIP),
      tampil: bool(x.tampil),
      ...(x.contoh === true ? { contoh: true } : {}),
    };
  });
  const slugHomestay = new Set<string>();
  for (const h of homestay) {
    let s = h.slug, n = 2;
    while (slugHomestay.has(s)) s = `${h.slug}-${n++}`;
    h.slug = s;
    slugHomestay.add(s);
  }
  const sama = (a: Teks, c: Teks) => a.en === c.en && a.id === c.id;
  const kepalaJelajah = kepala(jelajah, b.jelajah);
  for (const kunci of ["label", "judul", "lead"] as const) {
    if (sama(kepalaJelajah[kunci], JELAJAH_LAMA[kunci])) kepalaJelajah[kunci] = b.jelajah[kunci];
  }
  const kontakLama = num(situs.versiKontak, 0, 99) < VERSI_KONTAK;
  const isiAtauBawaan = (asal: Record<string, unknown>, kunci: string, nilai: string, bawaan: string) =>
    nilai || (kunci in asal && !kontakLama ? "" : bawaan);
  const sosialSah = (kunci: keyof Konten["situs"]["sosial"]) => isiAtauBawaan(sosial, kunci, tautan(sosial[kunci]), b.situs.sosial[kunci]);
  const emailMentah = str(kontak.email, 120).trim();

  return {
    situs: {
      versiKontak: VERSI_KONTAK,
      kontak: {
        whatsapp: isiAtauBawaan(kontak, "whatsapp", str(kontak.whatsapp, 30).replace(/[^\d]/g, ""), b.situs.kontak.whatsapp),
        email: isiAtauBawaan(kontak, "email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailMentah) ? emailMentah : "", b.situs.kontak.email),
        alamat: teks(kontak.alamat, b.situs.kontak.alamat, 300),
        peta: "peta" in kontak ? tautan(kontak.peta) : b.situs.kontak.peta,
      },
      sosial: { instagram: sosialSah("instagram"), facebook: sosialSah("facebook"), tiktok: sosialSah("tiktok"), youtube: sosialSah("youtube") },
      seo: { judul: teks(seo.judul, b.situs.seo.judul, 90), deskripsi: teks(seo.deskripsi, b.situs.seo.deskripsi, 300) },
    },
    menu: {
      beranda: teks(menu.beranda, b.menu.beranda, 30), about: teks(menu.about, b.menu.about, 30),
      trip: teks(menu.trip, b.menu.trip, 30), liveaboard: teks(menu.liveaboard, b.menu.liveaboard, 30), jadwal: teks(menu.jadwal, b.menu.jadwal, 30), homestay: teks(menu.homestay, b.menu.homestay, 30), titik: teks(menu.titik, b.menu.titik, 30),
      ulasan: teks(menu.ulasan, b.menu.ulasan, 30), faq: teks(menu.faq, b.menu.faq, 30), pesan: teks(menu.pesan, b.menu.pesan, 30),
    },
    hero: {
      judul: teks(hero.judul, b.hero.judul, 200), lead: teks(hero.lead, b.hero.lead, 400),
      tombol1: teks(hero.tombol1, b.hero.tombol1, 40), tombol2: teks(hero.tombol2, b.hero.tombol2, 40),
      kartu: kartuList(hero.kartu, JUMLAH_KARTU_HERO, b.hero.kartu),
    },
    jelajah: {
      ...kepalaJelajah,
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
    diveCourse: {
      ...kepala(diveCourse, b.diveCourse),
      kursus: ("kursus" in diveCourse ? arr(diveCourse.kursus) : b.diveCourse.kursus).slice(0, 50).map((v) => {
        const x = obj(v);
        return { id: id(x.id, "kursus"), nama: teks(x.nama, undefined, 160), foto: fotoSah(x.foto),
          hargaUsd: Math.round(Math.min(1000000, Math.max(0, Number(x.hargaUsd) || 0)) * 100) / 100,
          hari: Math.min(365, Math.max(1, Math.floor(Number(x.hari) || 1))),
          selam: Math.min(1000, Math.max(0, Math.floor(Number(x.selam) || 0))),
          alat: bool(x.alat, false), tampil: bool(x.tampil, true), lokasi: teks(x.lokasi, undefined, 160), pembayaran: tautan(x.pembayaran) };
      }),
      tampil: bool(diveCourse.tampil, b.diveCourse.tampil),
      foto: "foto" in diveCourse ? fotoSah(diveCourse.foto) : b.diveCourse.foto,
      tombol: teks(diveCourse.tombol, b.diveCourse.tombol, 40),
    },
    liveaboard: {
      ...kepala(liveaboard, b.liveaboard),
      tampil: bool(liveaboard.tampil, b.liveaboard.tampil),
      foto: "foto" in liveaboard ? fotoSah(liveaboard.foto) : b.liveaboard.foto,
      tag: "tag" in liveaboard ? str(liveaboard.tag, 40).trim() : b.liveaboard.tag,
      warna: warna(liveaboard.warna, b.liveaboard.warna),
      butir: "butir" in liveaboard ? daftarTeks(liveaboard.butir) : b.liveaboard.butir,
      tombol: teks(liveaboard.tombol, b.liveaboard.tombol, 40),
    },
    halamanTrip: {
      kepala: kepala(obj(halamanTrip.kepala), b.halamanTrip.kepala),
      kategori: kepala(obj(halamanTrip.kategori), b.halamanTrip.kategori),
      edukasi: {
        ...kepala(edukasi, b.halamanTrip.edukasi),
        butir: butirEdukasi(edukasi, b.halamanTrip.edukasi.butir),
      },
    },
    halamanHomestay: { kepala: kepala(obj(halamanHomestay.kepala), b.halamanHomestay.kepala) },
    halamanLiveaboard: {
      kepala: kepala(obj(halamanLiveaboard.kepala), b.halamanLiveaboard.kepala),
      edukasi: { ...kepala(edukasiLa, b.halamanLiveaboard.edukasi), butir: butirEdukasi(edukasiLa, b.halamanLiveaboard.edukasi.butir) },
    },
    footer: { tentang: teks(footer.tentang, b.footer.tentang, 400) },
    kategori,
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
    homestay,
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
