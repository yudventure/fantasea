"use client";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { jadwalMendatang, sisaKursi, type Konten } from "@/lib/konten";
import type { Permintaan } from "@/lib/server/permintaan";
import { META_PERAN, type IdTab } from "@/lib/peran";
import { kontakMasihContoh } from "@/data/bawaan";
import { susunKegiatan } from "@/lib/kegiatan";
import { BATAS_JAWAB_JAM, kunciBulan, kunciBulanLalu, labelBulan, lewatBatas, medianJawabMenit, menitSejak, ringkasBulan, tulisMenit } from "@/lib/ringkasan";
import { hariIniWit, rentangTampil } from "@/lib/tanggal";
import { rentangTanggal } from "@/lib/format";
import { KartuPanel } from "./Kolom";
import { KELAS_STATUS, NAMA_STATUS } from "./BagianPermintaan";
import StatistikPengunjung from "./StatistikPengunjung";
import { useKalenderMitra } from "./BagianKalenderMitra";
import type { Sesi } from "./Panel";

/** Panel melayani operasi di Raja Ampat, jadi jamnya jam pulau, bukan jam peramban. */
const ZONA = "Asia/Jayapura";
const JAM = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
const TANGGAL = new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const JAM_ANGKA = new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, hour: "2-digit", hourCycle: "h23" });
const sapaan = (jam: number) => (jam < 11 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam");

/** Sapaan dan jam WIT di puncak Ringkasan (pola DAMPIER, Banner.tsx). */
function Banner({ sesi, menunggu, lewat }: { sesi: Sesi; menunggu: number; lewat: number }) {
  const [kini, setKini] = useState<Date | null>(null);
  useEffect(() => {
    // Timeout ke detik berikutnya mengoreksi diri, setInterval melenceng.
    let id: number;
    const detak = () => { const d = new Date(); setKini(d); id = window.setTimeout(detak, 1000 - (d.getTime() % 1000)); };
    detak();
    return () => window.clearTimeout(id);
  }, []);
  const namaDepan = sesi.nama.trim().split(/\s+/)[0];
  return (
    <div className="relative mb-5 overflow-hidden rounded-card bg-navy p-5 text-white sm:p-7">
      <Image src="/brand/grafis/ukir-sayap-putih.svg" alt="" aria-hidden width={993} height={835} unoptimized
        className="pointer-events-none absolute -right-16 top-1/2 w-[420px] max-w-none -translate-y-1/2 opacity-[0.09] sm:right-0 sm:w-[520px]" />
      <Image src="/brand/grafis/pulau-segi.svg" alt="" aria-hidden width={300} height={300} unoptimized
        className="pointer-events-none absolute -bottom-10 left-[38%] w-[150px] opacity-[0.08]" />
      <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="font-aksen text-[15px] uppercase tracking-[0.16em] text-ukir">{META_PERAN[sesi.peran].label} · Meja pengelola</p>
          <h1 className="mt-1 text-[clamp(30px,4vw,40px)] leading-tight text-white">{kini ? sapaan(Number(JAM_ANGKA.format(kini))) : "Halo"}, {namaDepan}.</h1>
          <p className="mt-1.5 max-w-[48ch] text-[14px] leading-relaxed text-kabut">
            {menunggu > 0
              ? <>{menunggu} permintaan baru belum dihubungi{lewat > 0 ? <>, <span className="font-bold text-koral">{lewat} sudah lewat {BATAS_JAWAB_JAM} jam</span>.</> : ". Semua masih dalam batas."}</>
              : "Tidak ada permintaan baru yang menunggu dihubungi."}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="font-display text-[36px] leading-none tabular-nums sm:text-[44px]"><time>{kini ? JAM.format(kini) : "--.--.--"}</time></div>
          <div className="mt-2 text-[13px] text-kabut">{kini ? TANGGAL.format(kini) : ""} · <abbr title="Waktu Indonesia Timur, Raja Ampat" className="no-underline">WIT</abbr></div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, nilai, ket, warna }: { label: string; nilai: number | string; ket: string; warna?: "baik" | "buruk" }) {
  return (
    <div className="rounded-card border border-line bg-white p-4 shadow-card">
      <div className="text-[12.5px] font-bold text-ink2">{label}</div>
      <div className="mt-1 font-display text-[34px] leading-[1.1] tabular-nums text-navy">{nilai}</div>
      <div className={`mt-1.5 text-[12.5px] font-bold ${warna === "baik" ? "text-[#2E7D5B]" : warna === "buruk" ? "text-[#A63A22]" : "text-ink2"}`}>{ket}</div>
    </div>
  );
}

/** Kartu pintu ke halaman lain, tombolnya selalu di dasar kartu (pola DAMPIER, Pintu). */
export function Pintu({ label, judul, tombol, onKlik, boleh, children }: { label: string; judul: string; tombol: string; onKlik: () => void; boleh: boolean; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-card border border-line bg-white p-5 shadow-card">
      <p className="font-aksen text-[14px] uppercase tracking-[0.16em] text-tanda">{label}</p>
      <h3 className="mt-1 font-body text-[18px] font-extrabold leading-tight tracking-normal text-navy">{judul}</h3>
      <div className="mt-3 grid flex-1 grid-cols-[minmax(0,1fr)] content-start gap-1.5 text-[13.5px]">{children}</div>
      {boleh && <button type="button" onClick={onKlik} className="mt-4 w-full rounded-pill bg-buih px-4 py-2.5 text-[14px] font-bold text-navy hover:bg-line">{tombol}</button>}
    </div>
  );
}

export function Baris({ kiri, bawah, kanan }: { kiri: ReactNode; bawah?: ReactNode; kanan?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[12px] bg-soft px-3 py-2">
      <span className="min-w-0"><span className="block truncate font-bold text-navy">{kiri}</span>{bawah && <span className="block truncate text-[12.5px] text-ink2">{bawah}</span>}</span>
      {kanan && <span className="flex-none whitespace-nowrap text-[12.5px] font-bold text-ink2">{kanan}</span>}
    </div>
  );
}

/**
 * Ringkasan panel (pola DAMPIER, Dashboard tab ringkasan). Permintaan pemilik,
 * November 2026: "ringkasan juga dibuat seperti dampier". Sapaan dan jam WIT,
 * angka bulan ini, statistik pengunjung situs, permintaan yang lewat batas,
 * kartu pintu ke kalender dan jadwal, isi contoh yang perlu diganti, dan
 * permintaan terbaru.
 */
export default function BagianRingkasan({ k, permintaan, sesi, pindah, boleh }: {
  k: Konten; permintaan: Permintaan[]; sesi: Sesi; pindah: (t: IdTab, jangkar?: string) => void; boleh: (t: IdTab) => boolean;
}) {
  const { mitra } = useKalenderMitra(boleh("kalendermitra"));
  const hariIni = hariIniWit();
  const bolehUbah = boleh("trip");
  const baru = permintaan.filter((p) => p.status === "baru");
  const lewat = lewatBatas(permintaan);
  const bulanIni = kunciBulan(), namaBulan = labelBulan();
  const bulan = ringkasBulan(permintaan, bulanIni), bulanLalu = ringkasBulan(permintaan, kunciBulanLalu(bulanIni));
  const median = medianJawabMenit(permintaan);
  const mendatang = jadwalMendatang(k.jadwal, hariIni);
  const kursi = mendatang.reduce((n, j) => n + sisaKursi(j), 0);
  const homestayTampil = k.homestay.filter((h) => h.tampil);
  const kegiatan = susunKegiatan(k, permintaan).filter((g) => g.pasti && g.selesai >= hariIni && g.jenis !== "opentrip");

  const contoh = {
    trip: k.trip.filter((t) => t.contoh && t.tampil).length,
    jadwal: mendatang.filter((j) => j.contoh).length,
    titik: k.titik.filter((t) => t.contoh && t.tampil).length,
    homestay: homestayTampil.filter((h) => h.contoh).length,
    edukasi: k.halamanTrip.edukasi.butir.filter((e) => e.contoh).length,
  };
  const kontakContoh = kontakMasihContoh(k);
  const fotoBawaan = [k.hero.kartu, k.jelajah.kartu].flat().filter((c) => c.foto.startsWith("/brand/")).length + k.gerbang.foto.filter((f) => f.foto.startsWith("/brand/")).length;
  const adaContoh = contoh.trip + contoh.jadwal + contoh.titik + contoh.homestay + contoh.edukasi > 0 || kontakContoh.wa || kontakContoh.lain.length > 0 || fotoBawaan > 0;
  const Butir = ({ teks, tombol, ke, lembut = false }: { teks: string; tombol: string; ke: IdTab; lembut?: boolean }) => (
    <li className={`flex flex-wrap items-center justify-between gap-2 rounded-in px-4 py-3 ${lembut ? "bg-buih" : "bg-[#FFF4DD]"}`}><span>{teks}</span><button type="button" onClick={() => pindah(ke)} className="font-bold text-tanda">{tombol}</button></li>
  );

  return (
    <div className="grid gap-5">
      <Banner sesi={sesi} menunggu={baru.length} lewat={lewat.length} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        <Kpi label={`Permintaan masuk · ${namaBulan}`} nilai={bulan.masuk} ket={bulanLalu.masuk ? `${bulanLalu.masuk} bulan lalu` : "belum ada data bulan lalu"} />
        <Kpi label={`Dikonfirmasi · ${namaBulan}`} nilai={bulan.dikonfirmasi} ket={bulan.masuk ? `${Math.round((bulan.dikonfirmasi / bulan.masuk) * 100)}% dari permintaan` : "belum ada permintaan"} />
        <Kpi label="Median waktu jawab" nilai={median === null ? "belum ada" : tulisMenit(median)} ket={`30 hari terakhir · target ${BATAS_JAWAB_JAM} jam`} warna={median === null ? undefined : median <= BATAS_JAWAB_JAM * 60 ? "baik" : "buruk"} />
        <Kpi label="Menunggu dihubungi" nilai={baru.length} ket={lewat.length ? `${lewat.length} lewat ${BATAS_JAWAB_JAM} jam` : "semua dalam batas"} warna={lewat.length ? "buruk" : undefined} />
        <Kpi label="Homestay mitra tampil" nilai={homestayTampil.length} ket={contoh.homestay ? `${contoh.homestay} masih contoh` : homestayTampil.length ? "semua data asli" : "belum ada"} />
        <Kpi label="Kursi open trip kosong" nilai={kursi} ket={`${mendatang.length} keberangkatan mendatang`} />
      </div>

      <StatistikPengunjung />

      <KartuPanel judul={lewat.length ? `${lewat.length} permintaan lewat ${BATAS_JAWAB_JAM} jam` : "Tidak ada yang lewat batas"}
        keterangan={`Permintaan Baru yang belum dihubungi lebih dari ${BATAS_JAWAB_JAM} jam sejak masuk. Klik untuk membuka kartunya di meja permintaan.`}
        aksi={boleh("permintaan") ? <button type="button" onClick={() => pindah("permintaan")} className="rounded-pill bg-buih px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-line">Buka meja permintaan</button> : undefined}>
        {lewat.length ? (
          <ul className="grid gap-2">
            {lewat.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => pindah("permintaan", `permintaan-${p.id}`)} className="flex w-full items-center justify-between gap-3 rounded-in bg-[#FBE4DD]/60 px-4 py-3 text-left hover:bg-[#FBE4DD]">
                  <span className="min-w-0"><span className="block font-extrabold text-navy">{p.kode} · {p.nama}</span><span className="block text-[13px] text-ink2">{p.tripNama} · {rentangTanggal(p.mulai, p.selesai, "id")}</span></span>
                  <span className="flex-none text-[13px] font-extrabold tabular-nums text-[#A63A22]">{tulisMenit(menitSejak(p.dibuat))}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-ink2">Semua permintaan baru masih dalam batas {BATAS_JAWAB_JAM} jam. Yang lewat batas akan muncul di sini.</p>
        )}
      </KartuPanel>

      <div className="grid gap-5 md:grid-cols-3">
        <Pintu label="Jadwal terdekat" judul={`${kegiatan.length} kegiatan pasti`} tombol="Buka kalender kegiatan" onKlik={() => pindah("kalender")} boleh={boleh("kalender")}>
          {kegiatan.slice(0, 3).map((g) => <Baris key={g.kunci} kiri={g.permintaan?.nama} bawah={g.judul} kanan={rentangTampil(g.mulai, g.selesai)} />)}
          {kegiatan.length === 0 && <p className="text-ink2">Belum ada permintaan yang dikonfirmasi untuk tanggal mendatang.</p>}
        </Pintu>
        <Pintu label="Open trip" judul={`${mendatang.length} keberangkatan mendatang`} tombol="Buka jadwal open trip" onKlik={() => pindah("jadwal")} boleh={boleh("jadwal")}>
          {mendatang.slice(0, 3).map((j) => <Baris key={j.id} kiri={k.trip.find((t) => t.id === j.tripId)?.nama.id ?? "Open trip"} bawah={rentangTampil(j.mulai, j.selesai)} kanan={sisaKursi(j) === 0 ? "Penuh" : `${j.terisi}/${j.kursi} kursi`} />)}
          {mendatang.length === 0 && <p className="text-ink2">Belum ada jadwal open trip mendatang.</p>}
        </Pintu>
        {mitra ? (
          <Pintu label="Kalender mitra" judul={`${mitra.filter((m) => m.tautan).length} dari ${mitra.length} homestay punya tautan`} tombol="Buka kalender mitra" onKlik={() => pindah("kalendermitra")} boleh>
            {[...mitra].sort((a, b) => (b.tautan?.dibuka ?? "").localeCompare(a.tautan?.dibuka ?? "")).slice(0, 3).map((m) => (
              <Baris key={m.homestayId} kiri={m.nama} bawah={m.tautan?.dibuka ? `dibuka ${rentangTampil(m.tautan.dibuka.slice(0, 10), m.tautan.dibuka.slice(0, 10))}, ${m.entri} catatan` : m.tautan ? "belum dibuka pemilik" : "belum ada tautan"} kanan={`${m.kamar} kamar`} />
            ))}
            {mitra.length === 0 && <p className="text-ink2">Belum ada homestay.</p>}
          </Pintu>
        ) : (
          <Pintu label="Homestay mitra" judul={`${homestayTampil.length} homestay tampil`} tombol="Buka homestay" onKlik={() => pindah("homestay")} boleh={boleh("homestay")}>
            {homestayTampil.slice(0, 3).map((h) => <Baris key={h.id} kiri={h.nama.id || h.nama.en} bawah={h.lokasi.id || h.lokasi.en} />)}
            {homestayTampil.length === 0 && <p className="text-ink2">Belum ada homestay yang tampil.</p>}
          </Pintu>
        )}
      </div>

      {bolehUbah && adaContoh && (
        <KartuPanel judul="Yang perlu dilengkapi sebelum promosi" keterangan="Isi berikut masih contoh bawaan, bukan data Fantasea. Ganti atau sembunyikan supaya tamu tidak salah paham.">
          <ul className="grid gap-2.5 text-[14.5px] text-navy">
            {kontakContoh.wa && <Butir teks={k.situs.kontak.whatsapp ? "Nomor WhatsApp masih contoh. Footer menampilkan nomor contoh, dan permintaan tamu belum diteruskan ke WhatsApp." : "Nomor WhatsApp belum diisi, jadi tombol WhatsApp di situs tersembunyi."} tombol="Isi kontak" ke="kontak" />}
            {kontakContoh.lain.length > 0 && <Butir teks={`${kontakContoh.lain.join(", ")} di footer masih alamat contoh fantaseadivetravel. Ganti dengan akun asli atau kosongkan.`} tombol="Isi kontak" ke="kontak" />}
            {contoh.trip > 0 && <Butir teks={`${contoh.trip} trip contoh masih tampil dengan harga contoh.`} tombol="Ubah trip" ke="trip" />}
            {contoh.jadwal > 0 && <Butir teks={`${contoh.jadwal} jadwal open trip contoh masih tampil.`} tombol="Ubah jadwal" ke="jadwal" />}
            {contoh.homestay > 0 && <Butir teks={`${contoh.homestay} homestay contoh masih tampil. Ganti dengan homestay mitra asli beserta foto dan harganya, atau sembunyikan.`} tombol="Ubah homestay" ke="homestay" />}
            {contoh.edukasi > 0 && <Butir teks={`${contoh.edukasi} kartu edukasi selam di halaman Trip masih contoh. Minta pemandu memeriksa isinya.`} tombol="Periksa edukasi" ke="trip" />}
            {contoh.titik > 0 && <Butir teks={`${contoh.titik} titik selam contoh. Minta pemandu memeriksa kedalaman, arus, dan level.`} tombol="Periksa titik" ke="titik" />}
            {fotoBawaan > 0 && <Butir teks={`${fotoBawaan} foto beranda masih ilustrasi bawaan. Ganti dengan foto trip Fantasea.`} tombol="Ganti foto" ke="beranda" lembut />}
          </ul>
        </KartuPanel>
      )}

      <KartuPanel judul="Permintaan terbaru" aksi={boleh("permintaan") ? <button type="button" onClick={() => pindah("permintaan")} className="rounded-pill bg-buih px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-line">Lihat semua</button> : undefined}>
        {permintaan.length === 0 ? (
          <p className="text-[14.5px] text-ink2">Belum ada permintaan. Permintaan dari formulir di halaman trip dan homestay muncul di sini.</p>
        ) : (
          <ul className="grid gap-2">
            {permintaan.slice(0, 5).map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => pindah("permintaan", `permintaan-${p.id}`)} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-in bg-soft px-4 py-3 text-left hover:bg-buih">
                  <span className="min-w-0">
                    <span className="block font-extrabold text-navy">{p.nama} <span className="font-semibold text-ink2">· {p.tripNama}</span></span>
                    <span className="block text-[13px] text-ink2">{p.kode} · {rentangTanggal(p.mulai, p.selesai, "id")} · {p.orang} orang</span>
                  </span>
                  <span className={`rounded-pill px-2.5 py-1 text-[12px] font-extrabold ${KELAS_STATUS[p.status]}`}>{NAMA_STATUS[p.status]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </KartuPanel>
    </div>
  );
}
