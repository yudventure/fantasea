"use client";
import Image from "next/image";
import { useState } from "react";
import { ID_LIVEABOARD, MAKS_FOTO_TRIP, MAKS_KATEGORI, hariIniWit, idBaru, slugDari, sisaKursi, tx, type Edukasi, type Homestay, type Jadwal, type KategoriAktivitas, type Konten, type TitikSelam, type Trip } from "@/lib/konten";
import { rentangTanggal, rupiah } from "@/lib/format";
import DatePicker from "@/components/DatePicker";
import Dropdown from "@/components/Dropdown";
import { IkonPanahAtas, IkonPanahBawah, IkonSampah, IkonTambah } from "@/components/Ikon";
import { KartuPanel, ringkasTeks, KolomAngka, KolomBanyakFoto, KolomDaftar, KolomDua, KolomFoto, KolomTeks, Saklar } from "./Kolom";
import type { Ubah } from "./Panel";
import { KepalaEditor } from "./BagianIsi";

const namaKategori = (k: Konten, id: string) => tx(k.kategori.find((x) => x.id === id)?.nama ?? { en: "", id: "" }, "id") || "Tanpa kategori";
const kosong = { en: "", id: "" };
const TEKS_KALENDER = { pilih: "Pilih tanggal", sebelum: "Bulan sebelumnya", berikut: "Bulan berikutnya", hariIni: "Hari ini", hapus: "Hapus" };

function TandaContoh({ ada }: { ada?: boolean }) {
  return ada ? <span className="rounded-pill bg-[#FFF4DD] px-2 py-0.5 text-[11.5px] font-extrabold text-[#8A5A00]">Contoh</span> : null;
}

function Geser({ i, n, onGeser }: { i: number; n: number; onGeser: (arah: number) => void }) {
  return (
    <div className="flex">
      <button type="button" disabled={i === 0} onClick={() => onGeser(-1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-buih disabled:opacity-30" aria-label="Naikkan"><IkonPanahAtas size={17} /></button>
      <button type="button" disabled={i === n - 1} onClick={() => onGeser(1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-buih disabled:opacity-30" aria-label="Turunkan"><IkonPanahBawah size={17} /></button>
    </div>
  );
}

function geserDaftar<T>(daftar: T[], i: number, arah: number) {
  const j = i + arah;
  if (j < 0 || j >= daftar.length) return;
  [daftar[i], daftar[j]] = [daftar[j], daftar[i]];
}


/** Kartu edukasi di halaman Trip (selam) atau halaman Liveaboard (sebelum naik kapal). */
export function EditorEdukasi({ k, ubah, halaman = "halamanTrip" }: { k: Konten; ubah: Ubah; halaman?: "halamanTrip" | "halamanLiveaboard" }) {
  const e = k[halaman].edukasi;
  const ambil = (d: Konten) => d[halaman].edukasi;
  const ubahButir = (id: string, f: (x: Edukasi) => void) => ubah((d) => { const x = ambil(d).butir.find((b) => b.id === id); if (x) { f(x); delete x.contoh; } });
  const trip = halaman === "halamanTrip";
  return (
    <KartuPanel judul={trip ? "Edukasi selam di halaman Trip" : "Kartu sebelum naik kapal"}
      keterangan={trip ? "Kartu pengetahuan selam di atas daftar titik selam. Isi bawaan bertanda Contoh, minta pemandu memeriksanya." : "Kartu pengetahuan di halaman Liveaboard, misalnya sehari di kapal dan yang perlu dibawa. Isi bawaan bertanda Contoh, minta tim memeriksanya."}
      lipat ringkas={`${e.butir.length} kartu${e.butir.some((b) => b.contoh) ? `, ${e.butir.filter((b) => b.contoh).length} masih contoh` : ""}. ${ringkasTeks(e.judul)}`}
      aksi={<button type="button" onClick={() => ubah((d) => { ambil(d).butir.push({ id: idBaru("e"), judul: { en: "New tip", id: "Kartu baru" }, isi: kosong }); })} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah kartu</button>}>
      <KepalaEditor b={e} set={(f) => ubah((d) => f(ambil(d)))} />
      <ul className="grid gap-3">
        {e.butir.map((b, i) => (
          <li key={b.id} className="grid gap-4 rounded-card border border-line bg-soft p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex flex-1 flex-wrap items-center gap-2 text-[15px] font-extrabold text-navy">{tx(b.judul, "id") || "Tanpa judul"}<TandaContoh ada={b.contoh} /></p>
              <Geser i={i} n={e.butir.length} onGeser={(a) => ubah((d) => geserDaftar(ambil(d).butir, i, a))} />
              <button type="button" onClick={() => ubah((d) => { ambil(d).butir = ambil(d).butir.filter((x) => x.id !== b.id); })} className="inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-[13px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus</button>
            </div>
            <KolomDua label="Judul kartu" value={b.judul} onChange={(v) => ubahButir(b.id, (x) => { x.judul = v; })} maks={80} />
            <KolomDua label="Isi" value={b.isi} onChange={(v) => ubahButir(b.id, (x) => { x.isi = v; })} panjang maks={600} />
          </li>
        ))}
      </ul>
    </KartuPanel>
  );
}

/**
 * Kategori aktivitas seperti website lama Fantasea (permintaan pemilik,
 * November 2026). Kotak berfoto di halaman Trip dan kelompok aktivitasnya.
 * Liveaboard tidak bisa dihapus karena punya halaman sendiri, dan kategori
 * yang masih dipakai aktivitas tidak bisa dihapus.
 */
function EditorKategori({ k, ubah }: { k: Konten; ubah: Ubah }) {
  const [buka, setBuka] = useState<string | null>(null);
  const ubahK = (id: string, f: (x: KategoriAktivitas) => void) => ubah((d) => { const x = d.kategori.find((y) => y.id === id); if (x) f(x); });
  const jumlah = (id: string) => k.trip.filter((t) => t.kategori === id).length;
  const diSitus = k.kategori.filter((x) => x.tampil && (k.trip.some((t) => t.tampil && t.kategori === x.id) || (x.id === ID_LIVEABOARD && k.liveaboard.tampil))).length;
  function tambah() {
    const id = idBaru("k");
    ubah((d) => { d.kategori.push({ id, nama: { en: "New category", id: "Kategori baru" }, ringkas: kosong, foto: "", tampil: true }); });
    setBuka(id);
  }
  return (
    <KartuPanel judul="Kategori aktivitas" keterangan="Kotak berfoto di halaman Trip dan kelompok aktivitasnya, seperti website lama. Kategori baru tampil di situs setelah punya aktivitas yang tampil. Liveaboard menuju halamannya sendiri."
      lipat ringkas={`${k.kategori.length} kategori, ${diSitus} tampil di halaman Trip`}
      aksi={k.kategori.length < MAKS_KATEGORI ? <button type="button" onClick={tambah} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah kategori</button> : undefined}>
      <ul className="grid gap-3">
        {k.kategori.map((x, i) => {
          const n = jumlah(x.id);
          return (
            <li key={x.id} className="rounded-card border border-line bg-white">
              <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                <div className="relative h-12 w-20 flex-none overflow-hidden rounded-[10px] bg-buih">{x.foto && <Image src={x.foto} alt="" fill sizes="80px" unoptimized className="object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[15.5px] font-extrabold text-navy">{tx(x.nama, "id") || "Tanpa nama"}{!x.tampil && <span className="rounded-pill bg-[#F1F3F5] px-2 py-0.5 text-[11.5px] font-extrabold text-ink2">Disembunyikan</span>}</p>
                  <p className="text-[13px] text-ink2">{n} aktivitas{x.id === ID_LIVEABOARD ? " · punya halaman Liveaboard" : n === 0 ? " · belum tampil di situs" : ""}</p>
                </div>
                <Geser i={i} n={k.kategori.length} onGeser={(a) => ubah((d) => geserDaftar(d.kategori, i, a))} />
                <button type="button" onClick={() => setBuka(buka === x.id ? null : x.id)} aria-expanded={buka === x.id} className="rounded-pill bg-buih px-4 py-2 text-[13.5px] font-bold text-navy hover:bg-line">{buka === x.id ? "Tutup" : "Ubah"}</button>
              </div>
              {buka === x.id && (
                <div className="grid gap-5 bg-soft p-4 sm:p-5">
                  <Saklar label="Tampil di halaman Trip" value={x.tampil} onChange={(v) => ubahK(x.id, (y) => { y.tampil = v; })} hint="Aktivitas di kategori yang disembunyikan tidak ikut tampil di halaman Trip." />
                  <KolomDua label="Nama kategori" value={x.nama} onChange={(v) => ubahK(x.id, (y) => { y.nama = v; })} maks={60} />
                  <KolomDua label="Kalimat di bawah nama" value={x.ringkas} onChange={(v) => ubahK(x.id, (y) => { y.ringkas = v; })} maks={300} />
                  <KolomFoto label="Foto kotak kategori" value={x.foto} onChange={(v) => ubahK(x.id, (y) => { y.foto = v; })} />
                  {x.id !== ID_LIVEABOARD && (
                    <div className="flex items-center justify-end gap-3">
                      {n > 0 && <p className="text-[13px] text-ink2">Pindahkan dulu {n} aktivitas ke kategori lain untuk menghapusnya.</p>}
                      <button type="button" disabled={n > 0} onClick={() => { if (window.confirm("Hapus kategori ini?")) ubah((d) => { d.kategori = d.kategori.filter((y) => y.id !== x.id); }); }}
                        className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[13.5px] font-bold text-[#A63A22] hover:bg-[#FBE4DD] disabled:opacity-40"><IkonSampah size={16} />Hapus kategori</button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </KartuPanel>
  );
}

// ---------------------------------------------------------------------------

export function BagianTrip({ k, ubah }: { k: Konten; ubah: Ubah }) {
  const [buka, setBuka] = useState<string | null>(null);
  const ubahTrip = (id: string, f: (t: Trip) => void) => ubah((d) => { const t = d.trip.find((x) => x.id === id); if (t) { f(t); delete t.contoh; } });

  function tambah() {
    const id = idBaru("t");
    ubah((d) => { d.trip.push({ id, slug: `trip-${d.trip.length + 1}`, nama: { en: "New trip", id: "Trip baru" }, kategori: d.kategori.find((x) => x.id === "selam")?.id ?? d.kategori[0].id, ringkas: kosong, deskripsi: kosong, durasi: kosong, selam: 0, alat: false, sorot: kosong, level: kosong, hargaMulai: 0, termasuk: { en: [], id: [] }, belum: { en: [], id: [] }, foto: [], tampil: false }); });
    setBuka(id);
  }

  return (
    <div className="grid gap-6">
    <KartuPanel judul="Halaman Trip" keterangan="Pembuka halaman /trip, judul kotak kategori, lalu aktivitas dikelompokkan per kategori, edukasi selam, dan titik selam. Di beranda trip tampil paling banyak 6 dengan tombol Lihat semua trip."
      lipat ringkas={`Judul ${ringkasTeks(k.halamanTrip.kepala.judul)}`}>
      <KepalaEditor b={k.halamanTrip.kepala} set={(f) => ubah((d) => f(d.halamanTrip.kepala))} />
      <div className="rounded-card border border-line bg-soft p-4">
        <p className="mb-3 text-[15px] font-extrabold text-navy">Judul kotak kategori</p>
        <KepalaEditor b={k.halamanTrip.kategori} set={(f) => ubah((d) => f(d.halamanTrip.kategori))} />
      </div>
    </KartuPanel>
    <EditorKategori k={k} ubah={ubah} />
    <EditorEdukasi k={k} ubah={ubah} />
    <KartuPanel judul="Trip dan harga" keterangan="Aktivitas yang tampil di beranda dan halaman Trip, masing-masing dengan halaman sendiri dan formulir pesan. Urutan di sini sama dengan urutan di situs, dalam kelompok kategorinya."
      aksi={<button type="button" onClick={tambah} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah trip</button>}>
      <ul className="grid gap-3">
        {k.trip.map((t, i) => (
          <li key={t.id} className="rounded-card border border-line bg-white">
            <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
              <div className="relative h-16 w-24 flex-none overflow-hidden rounded-[12px] bg-buih">
                {t.foto[0] && <Image src={t.foto[0]} alt="" fill sizes="96px" unoptimized className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[16px] font-extrabold text-navy">{tx(t.nama, "id") || "Tanpa nama"}<TandaContoh ada={t.contoh} />{!t.tampil && <span className="rounded-pill bg-[#F1F3F5] px-2 py-0.5 text-[11.5px] font-extrabold text-ink2">Disembunyikan</span>}</p>
                <p className="text-[13px] text-ink2">{namaKategori(k, t.kategori)} · {t.hargaMulai ? `mulai ${new Intl.NumberFormat("id-ID", { style: "currency", currency: t.mataUang ?? "IDR" }).format(t.hargaMulai)}` : "tanya harga"} · /trip/{t.slug}</p>
              </div>
              <Geser i={i} n={k.trip.length} onGeser={(a) => ubah((d) => geserDaftar(d.trip, i, a))} />
              <button type="button" onClick={() => setBuka(buka === t.id ? null : t.id)} aria-expanded={buka === t.id} className="rounded-pill bg-buih px-4 py-2 text-[13.5px] font-bold text-navy hover:bg-line">{buka === t.id ? "Tutup" : "Ubah"}</button>
            </div>
            {buka === t.id && (
              <div className="grid gap-5 bg-soft p-4 sm:p-5">
                <Saklar label="Tampil di situs" value={t.tampil} onChange={(v) => ubahTrip(t.id, (x) => { x.tampil = v; })} hint="Trip yang disembunyikan tidak tampil dan alamatnya menjawab 404." />
                <KolomDua label="Nama trip" value={t.nama} onChange={(v) => ubahTrip(t.id, (x) => { x.nama = v; })} maks={120} />
                <div className="grid gap-4 md:grid-cols-2">
                  <KolomTeks label="Alamat halaman" value={t.slug} onChange={(v) => ubahTrip(t.id, (x) => { x.slug = slugDari(v) || x.slug; })} hint={`Tampil sebagai /en/trip/${t.slug}`} jenis="tautan" maks={60} />
                  <Dropdown label="Kategori" value={t.kategori} onChange={(v) => ubahTrip(t.id, (x) => { x.kategori = v; })} kosong="Pilih kategori" pilihan={k.kategori.map((c) => ({ nilai: c.id, label: tx(c.nama, "id") || c.id }))} />
                </div>
                <KolomDua label="Ringkasan" hint="Tampil di bawah judul halaman trip dan di hasil pencarian Google." value={t.ringkas} onChange={(v) => ubahTrip(t.id, (x) => { x.ringkas = v; })} panjang maks={300} />
                <KolomDua label="Deskripsi lengkap" hint="Pisahkan paragraf dengan satu baris kosong." value={t.deskripsi} onChange={(v) => ubahTrip(t.id, (x) => { x.deskripsi = v; })} panjang maks={6000} />
                <div className="grid gap-4 md:grid-cols-2">
                  <KolomDua label="Durasi" value={t.durasi} onChange={(v) => ubahTrip(t.id, (x) => { x.durasi = v; })} maks={60} />
                  <KolomDua label="Level" value={t.level} onChange={(v) => ubahTrip(t.id, (x) => { x.level = v; })} maks={80} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold text-navy">Harga per orang
                    <input className="kolom" type="number" min="0" max="100000000000" step="0.01" value={t.hargaMulai} onChange={(e) => { const n = Number(e.target.value); ubahTrip(t.id, (x) => { x.hargaMulai = Math.max(0, n); }); }} />
                  </label>
                  <Dropdown label="Mata uang" kosong="Pilih mata uang" value={t.mataUang ?? "IDR"} onChange={(v) => ubahTrip(t.id, (x) => { x.mataUang = v === "USD" ? "USD" : "IDR"; })} pilihan={[{ nilai: "IDR", label: "IDR, Rupiah" }, { nilai: "USD", label: "USD, Dolar AS" }]} />
                  <KolomAngka label="Jumlah selam" hint="Isi 0 untuk trip tanpa selam." value={t.selam} maks={99} onChange={(v) => ubahTrip(t.id, (x) => { x.selam = v; })} />
                </div>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
                  <KolomDua label="Keterangan di kartu" hint="Satu baris pendek di bawah durasi, misalnya All-included atau nama pulau." value={t.sorot} onChange={(v) => ubahTrip(t.id, (x) => { x.sorot = v; })} maks={60} />
                  <Saklar label="Alat selam termasuk" value={t.alat} onChange={(v) => ubahTrip(t.id, (x) => { x.alat = v; })} hint="Kartu menampilkan Gear included." />
                </div>
                <KolomDaftar label="Sudah termasuk" value={t.termasuk} onChange={(v) => ubahTrip(t.id, (x) => { x.termasuk = v; })} />
                <KolomDaftar label="Belum termasuk" value={t.belum} onChange={(v) => ubahTrip(t.id, (x) => { x.belum = v; })} />
                <KolomBanyakFoto label="Foto trip" maks={MAKS_FOTO_TRIP} value={t.foto} onChange={(v) => ubahTrip(t.id, (x) => { x.foto = v; })} />
                <div className="flex justify-end">
                  <button type="button" onClick={() => { if (window.confirm("Hapus trip ini beserta jadwal open trip-nya?")) ubah((d) => { d.trip = d.trip.filter((x) => x.id !== t.id); d.jadwal = d.jadwal.filter((j) => j.tripId !== t.id); }); }}
                    className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[13.5px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus trip</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </KartuPanel>
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Homestay mitra di bawah bagian kartu bertumpuk beranda (permintaan pemilik, November 2026). */
export function BagianHomestay({ k, ubah }: { k: Konten; ubah: Ubah }) {
  const [buka, setBuka] = useState<string | null>(null);
  const ubahH = (id: string, f: (h: Homestay) => void) => ubah((d) => { const h = d.homestay.find((x) => x.id === id); if (h) { f(h); delete h.contoh; } });

  function tambah() {
    const id = idBaru("h");
    ubah((d) => { d.homestay.push({ id, slug: `homestay-${d.homestay.length + 1}`, nama: { en: "New homestay", id: "Homestay baru" }, lokasi: kosong, ringkas: kosong, deskripsi: kosong, fasilitas: { en: [], id: [] }, hargaMulai: 0, foto: [], tampil: false }); });
    setBuka(id);
  }

  return (
    <div className="grid gap-6">
    <KartuPanel judul="Halaman Homestay" keterangan="Pembuka halaman /homestay yang memuat semua homestay. Di beranda homestay tampil paling banyak 6 dengan tombol Lihat semua homestay di atasnya."
      lipat ringkas={`Judul ${ringkasTeks(k.halamanHomestay.kepala.judul)}`}>
      <KepalaEditor b={k.halamanHomestay.kepala} set={(f) => ubah((d) => f(d.halamanHomestay.kepala))} />
    </KartuPanel>
    <KartuPanel judul="Homestay" keterangan="Kartu homestay di beranda, di bawah bagian Temukan penginapanmu. Tiap homestay punya halaman sendiri dengan formulir permintaan menginap. Urutan di sini sama dengan urutan di situs."
      aksi={<button type="button" onClick={tambah} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah homestay</button>}>
      {k.homestay.length === 0 && <p className="text-[14.5px] text-ink2">Belum ada homestay. Bagian kartu homestay di beranda tersembunyi sampai ada yang tampil.</p>}
      <ul className="grid gap-3">
        {k.homestay.map((h, i) => (
          <li key={h.id} className="rounded-card border border-line bg-white">
            <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
              <div className="relative h-16 w-24 flex-none overflow-hidden rounded-[12px] bg-buih">
                {h.foto[0] && <Image src={h.foto[0]} alt="" fill sizes="96px" unoptimized className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[16px] font-extrabold text-navy">{tx(h.nama, "id") || "Tanpa nama"}<TandaContoh ada={h.contoh} />{!h.tampil && <span className="rounded-pill bg-[#F1F3F5] px-2 py-0.5 text-[11.5px] font-extrabold text-ink2">Disembunyikan</span>}</p>
                <p className="text-[13px] text-ink2">{tx(h.lokasi, "id") || "Lokasi belum diisi"} · {h.hargaMulai ? `${new Intl.NumberFormat("id-ID", { style: "currency", currency: h.mataUang ?? "IDR" }).format(h.hargaMulai)} per malam / ${h.hargaUntuk ?? 1} tamu` : "tanya harga"} · /homestay/{h.slug}</p>
              </div>
              <Geser i={i} n={k.homestay.length} onGeser={(a) => ubah((d) => geserDaftar(d.homestay, i, a))} />
              <button type="button" onClick={() => setBuka(buka === h.id ? null : h.id)} aria-expanded={buka === h.id} className="rounded-pill bg-buih px-4 py-2 text-[13.5px] font-bold text-navy hover:bg-line">{buka === h.id ? "Tutup" : "Ubah"}</button>
            </div>
            {buka === h.id && (
              <div className="grid gap-5 bg-soft p-4 sm:p-5">
                <Saklar label="Tampil di situs" value={h.tampil} onChange={(v) => ubahH(h.id, (x) => { x.tampil = v; })} hint="Homestay yang disembunyikan tidak tampil dan alamatnya menjawab 404." />
                <KolomDua label="Nama homestay" value={h.nama} onChange={(v) => ubahH(h.id, (x) => { x.nama = v; })} maks={120} />
                <div className="grid gap-4 md:grid-cols-2">
                  <KolomTeks label="Alamat halaman" value={h.slug} onChange={(v) => ubahH(h.id, (x) => { x.slug = slugDari(v) || x.slug; })} hint={`Tampil sebagai /en/homestay/${h.slug}`} jenis="tautan" maks={60} />
                  <label className="grid gap-2 text-sm font-bold text-navy">Harga per malam
                    <input className="kolom" type="number" min="0" max="100000000000" step="0.01" value={h.hargaMulai} onChange={(e) => { const n = Number(e.target.value); ubahH(h.id, (x) => { x.hargaMulai = Math.max(0, n); }); }} />
                  </label>
                  <Dropdown label="Mata uang" kosong="Pilih mata uang" value={h.mataUang ?? "IDR"} onChange={(v) => ubahH(h.id, (x) => { x.mataUang = v === "USD" ? "USD" : "IDR"; })} pilihan={[{ nilai: "IDR", label: "IDR, Rupiah" }, { nilai: "USD", label: "USD, Dolar AS" }]} />
                  <KolomAngka label="Harga untuk jumlah tamu" min={1} maks={100} value={h.hargaUntuk ?? 1} onChange={(v) => ubahH(h.id, (x) => { x.hargaUntuk = v; })} />
                  <KolomAngka label="Kapasitas maksimal penginapan" hint="Kapasitas keseluruhan, bukan informasi ketersediaan kamar." maks={10000} value={h.kapasitas ?? 0} onChange={(v) => ubahH(h.id, (x) => { x.kapasitas = v; })} />
                </div>
                <KolomDua label="Lokasi" hint="Pulau atau kampung, contoh Pulau Kri, Selat Dampier." value={h.lokasi} onChange={(v) => ubahH(h.id, (x) => { x.lokasi = v; })} maks={120} />
                <KolomDua label="Ringkasan di kartu" value={h.ringkas} onChange={(v) => ubahH(h.id, (x) => { x.ringkas = v; })} panjang maks={300} />
                <KolomDua label="Deskripsi lengkap" hint="Pisahkan paragraf dengan satu baris kosong." value={h.deskripsi} onChange={(v) => ubahH(h.id, (x) => { x.deskripsi = v; })} panjang maks={6000} />
                <KolomDaftar label="Fasilitas" value={h.fasilitas} onChange={(v) => ubahH(h.id, (x) => { x.fasilitas = v; })} />
                <KolomBanyakFoto label="Foto homestay" maks={MAKS_FOTO_TRIP} value={h.foto} onChange={(v) => ubahH(h.id, (x) => { x.foto = v; })} />
                <div className="flex justify-end">
                  <button type="button" onClick={() => { if (window.confirm("Hapus homestay ini?")) ubah((d) => { d.homestay = d.homestay.filter((x) => x.id !== h.id); }); }}
                    className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[13.5px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus homestay</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </KartuPanel>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function BagianJadwal({ k, ubah }: { k: Konten; ubah: Ubah }) {
  const hariIni = hariIniWit();
  const urut = [...k.jadwal].sort((a, b) => a.mulai.localeCompare(b.mulai));
  const ubahJadwal = (id: string, f: (j: Jadwal) => void) => ubah((d) => { const j = d.jadwal.find((x) => x.id === id); if (j) { f(j); delete j.contoh; } });
  const tripPilihan = k.trip.map((t) => ({ nilai: t.id, label: tx(t.nama, "id") || "Tanpa nama", catatan: t.tampil ? undefined : "disembunyikan" }));

  function tambah() {
    const trip = k.trip.find((t) => t.tampil) ?? k.trip[0];
    if (!trip) return;
    ubah((d) => { d.jadwal.push({ id: idBaru("j"), tripId: trip.id, mulai: hariIni, selesai: hariIni, kursi: 8, terisi: 0, catatan: kosong }); });
  }

  return (
    <KartuPanel judul="Jadwal open trip" keterangan="Tanggal keberangkatan bersama. Sisa kursi tampil di situs, dan formulir pesan menolak permintaan yang melebihi sisa kursi. Jadwal yang sudah lewat tidak tampil."
      aksi={<button type="button" onClick={tambah} disabled={!k.trip.length} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah jadwal</button>}>
      {urut.length === 0 && <p className="text-[14.5px] text-ink2">Belum ada jadwal. Tamu tetap bisa memesan dengan tanggal pilihannya sendiri.</p>}
      <ul className="grid gap-3">
        {urut.map((j) => {
          const lewat = j.selesai < hariIni;
          return (
            <li key={j.id} className={`rounded-card border border-line p-4 sm:p-5 ${lewat ? "bg-soft opacity-80" : "bg-white"}`}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-extrabold text-navy">{rentangTanggal(j.mulai, j.selesai, "id")}</span>
                <TandaContoh ada={j.contoh} />
                {lewat ? <span className="rounded-pill bg-[#F1F3F5] px-2 py-0.5 text-[11.5px] font-extrabold text-ink2">Sudah lewat</span>
                  : <span className="rounded-pill bg-buih px-2 py-0.5 text-[11.5px] font-extrabold text-navy">{sisaKursi(j) === 0 ? "Penuh" : `Sisa ${sisaKursi(j)} kursi`}</span>}
                <button type="button" onClick={() => ubah((d) => { d.jadwal = d.jadwal.filter((x) => x.id !== j.id); })} className="ml-auto grid h-9 w-9 place-items-center rounded-full text-[#A63A22] hover:bg-[#FBE4DD]" aria-label="Hapus jadwal"><IkonSampah size={17} /></button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Dropdown label="Trip" value={j.tripId} onChange={(v) => ubahJadwal(j.id, (x) => { x.tripId = v; })} kosong="Pilih trip" pilihan={tripPilihan} />
                <DatePicker label="Berangkat" value={j.mulai} min="2020-01-01" locale="id" teks={TEKS_KALENDER} onChange={(v) => v && ubahJadwal(j.id, (x) => { x.mulai = v; if (x.selesai < v) x.selesai = v; })} />
                <DatePicker label="Pulang" value={j.selesai} min={j.mulai} locale="id" teks={TEKS_KALENDER} onChange={(v) => v && ubahJadwal(j.id, (x) => { x.selesai = v; })} />
                <div className="grid grid-cols-2 gap-3">
                  <KolomAngka label="Kursi" value={j.kursi} maks={500} onChange={(v) => ubahJadwal(j.id, (x) => { x.kursi = v; x.terisi = Math.min(x.terisi, v); })} />
                  <KolomAngka label="Terisi" value={j.terisi} maks={j.kursi} onChange={(v) => ubahJadwal(j.id, (x) => { x.terisi = Math.min(v, x.kursi); })} />
                </div>
              </div>
              <div className="mt-4"><KolomDua label="Catatan singkat" hint="Boleh kosong, mis. Trip tahun baru." value={j.catatan} onChange={(v) => ubahJadwal(j.id, (x) => { x.catatan = v; })} maks={160} /></div>
            </li>
          );
        })}
      </ul>
    </KartuPanel>
  );
}

// ---------------------------------------------------------------------------

export function BagianTitik({ k, ubah }: { k: Konten; ubah: Ubah }) {
  const [buka, setBuka] = useState<string | null>(null);
  const ubahTitik = (id: string, f: (t: TitikSelam) => void) => ubah((d) => { const t = d.titik.find((x) => x.id === id); if (t) { f(t); delete t.contoh; } });
  function tambah() {
    const id = idBaru("s");
    ubah((d) => { d.titik.push({ id, nama: "Titik baru", wilayah: kosong, kedalaman: "", arus: kosong, level: kosong, sorotan: kosong, foto: "", tampil: false }); });
    setBuka(id);
  }
  return (
    <KartuPanel judul="Titik selam" keterangan="Kartu di bagian Tempat kami menyelam. Minta pemandu memeriksa kedalaman, arus, dan level sebelum ditampilkan."
      aksi={<button type="button" onClick={tambah} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah titik</button>}>
      <ul className="grid gap-3">
        {k.titik.map((t, i) => (
          <li key={t.id} className="rounded-card border border-line bg-white">
            <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
              <div className="relative h-14 w-20 flex-none overflow-hidden rounded-[12px] bg-buih">{t.foto && <Image src={t.foto} alt="" fill sizes="80px" unoptimized className="object-cover" />}</div>
              <p className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[16px] font-extrabold text-navy">{t.nama}<TandaContoh ada={t.contoh} />{!t.tampil && <span className="rounded-pill bg-[#F1F3F5] px-2 py-0.5 text-[11.5px] font-extrabold text-ink2">Disembunyikan</span>}</p>
              <Geser i={i} n={k.titik.length} onGeser={(a) => ubah((d) => geserDaftar(d.titik, i, a))} />
              <button type="button" onClick={() => setBuka(buka === t.id ? null : t.id)} aria-expanded={buka === t.id} className="rounded-pill bg-buih px-4 py-2 text-[13.5px] font-bold text-navy hover:bg-line">{buka === t.id ? "Tutup" : "Ubah"}</button>
            </div>
            {buka === t.id && (
              <div className="grid gap-5 bg-soft p-4 sm:p-5">
                <Saklar label="Tampil di situs" value={t.tampil} onChange={(v) => ubahTitik(t.id, (x) => { x.tampil = v; })} />
                <div className="grid gap-4 md:grid-cols-2">
                  <KolomTeks label="Nama titik" value={t.nama} onChange={(v) => ubahTitik(t.id, (x) => { x.nama = v; })} maks={80} />
                  <KolomTeks label="Kedalaman" hint="Contoh 5–18 m" value={t.kedalaman} onChange={(v) => ubahTitik(t.id, (x) => { x.kedalaman = v; })} maks={30} />
                </div>
                <KolomDua label="Wilayah" value={t.wilayah} onChange={(v) => ubahTitik(t.id, (x) => { x.wilayah = v; })} maks={80} />
                <div className="grid gap-4 md:grid-cols-2">
                  <KolomDua label="Arus" value={t.arus} onChange={(v) => ubahTitik(t.id, (x) => { x.arus = v; })} maks={40} />
                  <KolomDua label="Level" value={t.level} onChange={(v) => ubahTitik(t.id, (x) => { x.level = v; })} maks={60} />
                </div>
                <KolomDua label="Sorotan" value={t.sorotan} onChange={(v) => ubahTitik(t.id, (x) => { x.sorotan = v; })} panjang maks={300} />
                <KolomFoto label="Foto" value={t.foto} onChange={(v) => ubahTitik(t.id, (x) => { x.foto = v; })} rasio="aspect-[16/10]" />
                <div className="flex justify-end">
                  <button type="button" onClick={() => { if (window.confirm("Hapus titik selam ini?")) ubah((d) => { d.titik = d.titik.filter((x) => x.id !== t.id); }); }}
                    className="inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[13.5px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus titik</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </KartuPanel>
  );
}
