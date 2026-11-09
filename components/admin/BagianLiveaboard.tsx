"use client";
import Image from "next/image";
import { ID_LIVEABOARD, tx, type Konten } from "@/lib/konten";
import { rupiah } from "@/lib/format";
import type { IdTab } from "@/lib/peran";
import { KartuPanel, KolomDaftar, KolomDua, KolomFoto, KolomTeks, PilihWarna, Saklar, ringkasTeks } from "./Kolom";
import { KepalaEditor } from "./BagianIsi";
import { EditorEdukasi } from "./BagianTrip";
import type { Ubah } from "./Panel";

/**
 * Menu Liveaboard di panel (permintaan pemilik, November 2026, halaman
 * Liveaboard sendiri seperti Trip). Bagian Liveaboard di beranda, pembuka
 * halaman /liveaboard, dan kartu sebelum naik kapal. Trip liveaboard tetap
 * diisi di Trip dan harga dengan kategori Liveaboards.
 */
export default function BagianLiveaboard({ k, ubah, pindah }: { k: Konten; ubah: Ubah; pindah: (t: IdTab) => void }) {
  const kapal = k.trip.filter((t) => t.kategori === ID_LIVEABOARD);
  return (
    <div className="grid gap-6">
      <KartuPanel judul="Trip liveaboard" keterangan="Trip berkategori Liveaboards di Trip dan harga. Tampil sebagai kartu di beranda (paling banyak 6, dengan tombol Lihat semua liveaboard) dan di halaman /liveaboard."
        aksi={<button type="button" onClick={() => pindah("trip")} className="rounded-pill bg-buih px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-line">Ubah di Trip dan harga</button>}>
        {kapal.length === 0 ? (
          <p className="text-[14px] text-ink2">Belum ada trip liveaboard. Tambahkan trip di Trip dan harga, lalu pilih kategori Liveaboards.</p>
        ) : (
          <ul className="grid gap-2">
            {kapal.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-in bg-soft px-3 py-2.5">
                <span className="relative h-10 w-14 flex-none overflow-hidden rounded-[8px] bg-buih">{t.foto[0] && <Image src={t.foto[0]} alt="" fill sizes="56px" unoptimized className="object-cover" />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold text-navy">{tx(t.nama, "id")}</span>
                  <span className="block text-[12.5px] text-ink2">{[tx(t.durasi, "id"), t.hargaMulai ? `mulai ${rupiah(t.hargaMulai, "id")}` : "tanya harga", t.tampil ? "" : "disembunyikan"].filter(Boolean).join(" · ")}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </KartuPanel>

      <KartuPanel id="liveaboard" judul="Bagian Liveaboard" keterangan="Bagian navy di beranda di antara open trip dan FAQ, juga tampil di halaman Liveaboard. Mematikannya menyembunyikan bagian beranda, halaman Liveaboard, dan menu Liveaboard. Tombolnya membuka WhatsApp bila nomor sudah diisi, kalau belum menuju halaman Trip.">
        <Saklar label="Tampil di situs" value={k.liveaboard.tampil} onChange={(v) => ubah((d) => { d.liveaboard.tampil = v; })} hint="Bagian beranda, halaman /liveaboard, dan menu Liveaboard di header." />
        <KepalaEditor b={k.liveaboard} set={(f) => ubah((d) => f(d.liveaboard))} />
        <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <KolomFoto label="Foto" value={k.liveaboard.foto} onChange={(v) => ubah((d) => { d.liveaboard.foto = v; })} />
          <div className="grid content-start gap-2">
            <KolomTeks label="Gelembung tag" hint="Contoh @misool. Kosongkan untuk menyembunyikan." value={k.liveaboard.tag} onChange={(v) => ubah((d) => { d.liveaboard.tag = v; })} maks={40} />
            <PilihWarna value={k.liveaboard.warna} onChange={(v) => ubah((d) => { d.liveaboard.warna = v; })} />
          </div>
        </div>
        <KolomDaftar label="Daftar keunggulan" value={k.liveaboard.butir} onChange={(v) => ubah((d) => { d.liveaboard.butir = v; })} />
        <KolomDua label="Tombol" value={k.liveaboard.tombol} onChange={(v) => ubah((d) => { d.liveaboard.tombol = v; })} maks={40} />
      </KartuPanel>

      <KartuPanel judul="Halaman Liveaboard" keterangan="Pembuka halaman /liveaboard, berisi trip liveaboard, bagian Liveaboard, jadwal open trip liveaboard bila ada, dan kartu sebelum naik kapal."
        lipat ringkas={`Judul ${ringkasTeks(k.halamanLiveaboard.kepala.judul)}`}>
        <KepalaEditor b={k.halamanLiveaboard.kepala} set={(f) => ubah((d) => f(d.halamanLiveaboard.kepala))} />
      </KartuPanel>

      <EditorEdukasi k={k} ubah={ubah} halaman="halamanLiveaboard" />
    </div>
  );
}
