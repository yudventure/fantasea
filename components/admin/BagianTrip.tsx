"use client";
import Image from "next/image";
import { useState } from "react";
import { KATEGORI_TRIP, MAKS_FOTO_TRIP, hariIniWit, idBaru, slugDari, sisaKursi, tx, type Jadwal, type KategoriTrip, type Konten, type TitikSelam, type Trip } from "@/lib/konten";
import { rentangTanggal, rupiah } from "@/lib/format";
import DatePicker from "@/components/DatePicker";
import Dropdown from "@/components/Dropdown";
import { IkonPanahAtas, IkonPanahBawah, IkonSampah, IkonTambah } from "@/components/Ikon";
import { KartuPanel, KolomAngka, KolomBanyakFoto, KolomDaftar, KolomDua, KolomFoto, KolomTeks, Saklar } from "./Kolom";
import type { Ubah } from "./Panel";

const NAMA_KATEGORI: Record<KategoriTrip, string> = { selam: "Trip selam", snorkel: "Trip snorkeling", liveaboard: "Liveaboard", privat: "Trip privat" };
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

// ---------------------------------------------------------------------------

export function BagianTrip({ k, ubah }: { k: Konten; ubah: Ubah }) {
  const [buka, setBuka] = useState<string | null>(null);
  const ubahTrip = (id: string, f: (t: Trip) => void) => ubah((d) => { const t = d.trip.find((x) => x.id === id); if (t) { f(t); delete t.contoh; } });

  function tambah() {
    const id = idBaru("t");
    ubah((d) => { d.trip.push({ id, slug: `trip-${d.trip.length + 1}`, nama: { en: "New trip", id: "Trip baru" }, kategori: "selam", ringkas: kosong, deskripsi: kosong, durasi: kosong, selam: 0, level: kosong, hargaMulai: 0, termasuk: { en: [], id: [] }, belum: { en: [], id: [] }, foto: [], tampil: false }); });
    setBuka(id);
  }

  return (
    <KartuPanel judul="Trip dan harga" keterangan="Trip yang tampil di beranda dan punya halaman sendiri dengan formulir pesan. Urutan di sini sama dengan urutan di situs."
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
                <p className="text-[13px] text-ink2">{NAMA_KATEGORI[t.kategori]} · {t.hargaMulai ? `mulai ${rupiah(t.hargaMulai, "id")}` : "tanya harga"} · /trip/{t.slug}</p>
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
                  <Dropdown label="Jenis trip" value={t.kategori} onChange={(v) => ubahTrip(t.id, (x) => { x.kategori = v as KategoriTrip; })} kosong="Pilih jenis" pilihan={KATEGORI_TRIP.map((c) => ({ nilai: c, label: NAMA_KATEGORI[c] }))} />
                </div>
                <KolomDua label="Ringkasan di kartu" value={t.ringkas} onChange={(v) => ubahTrip(t.id, (x) => { x.ringkas = v; })} panjang maks={300} />
                <KolomDua label="Deskripsi lengkap" hint="Pisahkan paragraf dengan satu baris kosong." value={t.deskripsi} onChange={(v) => ubahTrip(t.id, (x) => { x.deskripsi = v; })} panjang maks={6000} />
                <div className="grid gap-4 md:grid-cols-2">
                  <KolomDua label="Durasi" value={t.durasi} onChange={(v) => ubahTrip(t.id, (x) => { x.durasi = v; })} maks={60} />
                  <KolomDua label="Level" value={t.level} onChange={(v) => ubahTrip(t.id, (x) => { x.level = v; })} maks={80} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <KolomAngka label="Harga mulai per orang" hint="Rupiah. Isi 0 untuk menampilkan Tanya harga." awalan="Rp" value={t.hargaMulai} onChange={(v) => ubahTrip(t.id, (x) => { x.hargaMulai = v; })} />
                  <KolomAngka label="Jumlah selam" hint="Isi 0 untuk trip tanpa selam." value={t.selam} maks={99} onChange={(v) => ubahTrip(t.id, (x) => { x.selam = v; })} />
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
