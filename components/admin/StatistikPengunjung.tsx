"use client";
import { useEffect, useRef, useState } from "react";
import { JENDELA_AKTIF_MS, SEGARKAN_PENGUNJUNG_MS, type JumlahKunjungan, type StatistikKunjungan } from "@/lib/kunjungan";
import { hari, hariIniWit, rentangTampil, tanggalLengkap } from "@/lib/tanggal";
import Dropdown from "@/components/Dropdown";

const angka = (n: number) => n.toLocaleString("id-ID");
const jam = (iso: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jayapura", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(iso));
const singkat = (iso: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric", month: "short" }).format(hari(iso));
const pilihanTanggal = (iso: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(hari(iso));
const angkaSumbu = (n: number) => n < 10000 ? angka(n) : new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n);

let namaRegion: Intl.DisplayNames | null = null;
const namaNegara = (kode: string) => {
  try { namaRegion ??= new Intl.DisplayNames(["id"], { type: "region" }); return namaRegion.of(kode) ?? kode; } catch { return kode; }
};
/** Bendera dari huruf kode negara. Di Windows tampil sebagai dua huruf, tetap terbaca. */
const bendera = (kode: string) => String.fromCodePoint(...[...kode].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
const MAKS_NEGARA = 8;

/**
 * Statistik pengunjung di Ringkasan panel, disalin dari DAMPIER
 * (components/admin/StatistikPengunjung.tsx) atas permintaan pemilik,
 * November 2026, dengan warna dan komponen Fantasea.
 */

/**
 * Negara diurutkan dari pengunjung terbanyak. Lebih dari delapan, sisanya
 * digabung jadi Negara lain. Peramban tanpa negara (data sebelum asal negara
 * dicatat, atau zona waktu UTC) dihitung terpisah sebagai `tidak`, supaya
 * persen tiap negara tidak tenggelam oleh data lama.
 */
function barisNegara(total: number, negara: Record<string, JumlahKunjungan>) {
  const urut = Object.entries(negara).filter(([, v]) => v.pengunjung > 0)
    .sort(([ka, a], [kb, b]) => b.pengunjung - a.pengunjung || b.halaman - a.halaman || namaNegara(ka).localeCompare(namaNegara(kb), "id"));
  const atas = urut.slice(0, urut.length > MAKS_NEGARA + 1 ? MAKS_NEGARA : urut.length)
    .map(([kode, v]) => ({ kunci: kode, nama: namaNegara(kode), bendera: bendera(kode), ...v }));
  const sisa = urut.slice(atas.length);
  const dikenal = urut.reduce((n, [, v]) => n + v.pengunjung, 0);
  return {
    dikenal,
    tidak: Math.max(0, total - dikenal),
    baris: [
      ...atas,
      ...(sisa.length ? [{ kunci: "lain", nama: `Negara lain (${sisa.length})`, bendera: "", pengunjung: sisa.reduce((n, [, v]) => n + v.pengunjung, 0), halaman: sisa.reduce((n, [, v]) => n + v.halaman, 0) }] : []),
    ],
  };
}

/** Skala memakai hitungan bulat dan memberi ruang untuk angka di atas batang. */
function skalaGrafik(maks: number) {
  const dasar = Math.pow(10, Math.floor(Math.log10(Math.max(1, maks) / 3)));
  const langkah = Math.max(1, ([1, 2, 5, 10].find((n) => n * dasar >= maks / 3) ?? 10) * dasar);
  const atas = Math.max(langkah, Math.ceil(maks / langkah) * langkah + (maks % langkah === 0 ? langkah : 0));
  return { atas, tanda: Array.from({ length: Math.round(atas / langkah) + 1 }, (_, i) => atas - i * langkah) };
}

export default function StatistikPengunjung() {
  const [data, setData] = useState<StatistikKunjungan | null>(null);
  const [galat, setGalat] = useState("");
  const [periode, setPeriode] = useState<7 | 30>(7);
  const [tanggal, setTanggal] = useState("");
  const ulang = useRef<() => void>(() => {});
  useEffect(() => {
    let hidup = true, sedang = false;
    let controller: AbortController | null = null;
    const muat = async () => {
      if (sedang || document.visibilityState !== "visible") return;
      sedang = true;
      controller = new AbortController();
      const batas = setTimeout(() => controller?.abort(), 10000);
      try {
        const r = await fetch("/api/pengunjung", { credentials: "same-origin", cache: "no-store", signal: controller.signal });
        const o = await r.json();
        if (!r.ok || !o.statistik) throw new Error(o.galat || "Statistik pengunjung belum bisa dimuat.");
        if (hidup) { setData(o.statistik); setGalat(""); }
      } catch { if (hidup) setGalat("Statistik belum diperbarui. Periksa koneksi lalu coba lagi."); }
      finally { clearTimeout(batas); sedang = false; }
    };
    ulang.current = () => { void muat(); };
    void muat();
    const timer = setInterval(() => { void muat(); }, SEGARKAN_PENGUNJUNG_MS);
    const terlihat = () => { void muat(); };
    document.addEventListener("visibilitychange", terlihat);
    return () => { hidup = false; controller?.abort(); clearInterval(timer); document.removeEventListener("visibilitychange", terlihat); };
  }, []);

  const mulai = data?.mulai ? hariIniWit(new Date(data.mulai)) : null;
  const riwayat = mulai ? data?.harian.filter((d) => d.tanggal >= mulai) ?? [] : [];
  const baris = riwayat.slice(-periode);
  const sorot = baris.find((d) => d.tanggal === tanggal) ?? baris[baris.length - 1];
  const adaKunjungan = baris.some((d) => d.pengunjung > 0);
  const skala = skalaGrafik(Math.max(1, ...baris.map((d) => d.pengunjung)));
  const labelGrafik = [...new Set(Array.from({ length: Math.min(4, baris.length) }, (_, i) => Math.round(i * (baris.length - 1) / Math.max(1, Math.min(4, baris.length) - 1))))];
  const ringkasPeriode = data ? (periode === 7 ? data.minggu : data.bulan) : null;
  const asal = ringkasPeriode ? barisNegara(ringkasPeriode.pengunjung, ringkasPeriode.negara) : { dikenal: 0, tidak: 0, baris: [] };
  const negaraPeriode = asal.baris;
  const negaraHari = sorot ? barisNegara(sorot.pengunjung, sorot.negara).baris.filter((n) => n.kunci !== "lain").slice(0, 3) : [];
  const maksNegara = Math.max(1, ...negaraPeriode.map((n) => n.pengunjung));
  const kolomNegara = Math.ceil(negaraPeriode.length / 2);
  const persenNegara = (pengunjung: number) => Math.round(pengunjung / Math.max(1, asal.dikenal) * 100);
  // Kalau tiap jumlah sama dengan persennya (pengunjung yang diketahui tepat 100), cukup persennya.
  // Permintaan pemilik, November 2026: "tidak perlu lagi ada angka yang sama didepannya". Jumlahnya tetap di tooltip.
  const hanyaPersen = negaraPeriode.length > 0 && negaraPeriode.every((n) => persenNegara(n.pengunjung) === n.pengunjung);
  const kpi = [
    { kunci: "aktif", label: "Aktif sekarang", nilai: data?.aktif, ket: `Dalam ${JENDELA_AKTIF_MS / 60000} menit terakhir` },
    { kunci: "hari", label: "Hari ini", nilai: data?.hari.pengunjung, ket: data ? `${angka(data.hari.halaman)} tampilan halaman` : "Mengikuti waktu WIT" },
    { kunci: "minggu", label: "7 hari terakhir", nilai: data?.minggu.pengunjung, ket: data ? `${angka(data.minggu.halaman)} tampilan halaman` : "Termasuk hari ini" },
    { kunci: "bulan", label: "30 hari terakhir", nilai: data?.bulan.pengunjung, ket: data ? `${angka(data.bulan.halaman)} tampilan halaman` : "Termasuk hari ini" },
  ];

  return (
    <section className="rounded-card border border-line bg-white p-4 shadow-card sm:p-5" data-statistik-pengunjung aria-labelledby="judul-pengunjung" aria-busy={!data && !galat}>
      <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
        <div className="min-w-0">
          <p className="font-aksen text-[14px] uppercase tracking-[0.16em] text-tanda">Statistik situs</p>
          <h3 id="judul-pengunjung" className="mt-1 font-body text-[19px] font-extrabold tracking-normal text-navy sm:text-xl">Pengunjung website</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink2">Pantau pengunjung dan tampilan halaman situs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-col sm:items-end">
          <span aria-live="polite" className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-semibold ${galat ? "bg-[#FFF1DC] text-[#8A5A00]" : "bg-soft text-ink"}`}>
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${galat ? "bg-[#F4B740]" : data ? "bg-ukir" : "bg-ink2"}`} />
            {galat ? "Tertunda" : data ? "Live" : "Memuat"}
          </span>
          {data && <p className="text-[10.5px] tabular-nums text-ink2">Diperbarui {jam(data.pada)} WIT</p>}
        </div>
      </div>
      {galat && <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 rounded-in bg-[#FFF1DC] px-3 py-2.5 text-[13px] text-[#8A5A00]">
        <p>{galat}</p><button type="button" onClick={() => ulang.current()} className="font-semibold underline underline-offset-2">Coba lagi</button>
      </div>}
      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {kpi.map((k) => <div key={k.kunci} className={`min-w-0 rounded-in p-3.5 sm:p-4 ${k.kunci === "aktif" ? "bg-navy text-white" : "bg-soft"}`} data-kpi-pengunjung={k.kunci}>
          <p className={`text-[12px] font-semibold ${k.kunci === "aktif" ? "text-white/80" : "text-ink2"}`}>{k.label}</p>
          <p data-nilai-pengunjung className="mt-2 break-words font-display text-[34px] leading-none tabular-nums sm:text-[34px]">{k.nilai === undefined ? "…" : angka(k.nilai)}</p>
          <p className={`mt-1 text-[10.5px] ${k.kunci === "aktif" ? "text-white/70" : "text-ink2"}`}>{k.kunci === "aktif" ? "pengunjung aktif" : "pengunjung unik"}</p>
          <p className={`mt-3 text-[11px] leading-relaxed ${k.kunci === "aktif" ? "text-white/80" : "text-ink2"}`}>{k.ket}</p>
        </div>)}
      </div>
      <div className={`mt-5 grid gap-4 ${baris.length ? "lg:grid-cols-[minmax(0,1fr)_200px]" : "grid-cols-1"}`}>
        <div className="min-w-0 rounded-in bg-soft p-3.5 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="font-body text-[13px] font-bold">Pengunjung per hari</h4>
              <p className="mt-1 text-[11px] text-ink2">{baris.length ? rentangTampil(baris[0].tanggal, baris[baris.length - 1].tanggal) : "Riwayat kunjungan situs"}</p>
            </div>
            <div role="group" aria-label="Periode grafik pengunjung" className="flex gap-0.5 rounded-lg bg-white p-1">
              {([7, 30] as const).map((n) => <button key={n} type="button" aria-pressed={periode === n} data-periode-pengunjung={n} onClick={() => { if (periode !== n) { setPeriode(n); setTanggal(""); } }}
                className={`min-h-9 rounded-md px-3 text-[11.5px] font-semibold transition-colors ${periode === n ? "bg-tanda text-white" : "text-ink2 hover:bg-soft"}`}>{n} hari</button>)}
            </div>
          </div>
          {data && adaKunjungan ? <>
            <div role="group" aria-label={`Grafik pengunjung harian selama ${periode} hari terakhir`} className="relative mt-8 pl-11" data-grafik-pengunjung>
              <div aria-hidden className="absolute bottom-6 left-0 top-0 w-9 text-right text-[10px] tabular-nums text-ink2">
                {skala.tanda.map((n) => <span key={n} className="absolute right-0 -translate-y-1/2" style={{ top: `${(skala.atas - n) / skala.atas * 100}%` }}>{angkaSumbu(n)}</span>)}
              </div>
              <div className="grid h-[160px] sm:h-[180px]" style={{ gridTemplateColumns: `repeat(${baris.length}, minmax(0, 1fr))` }}>
                {baris.map((d, i) => {
                  const dipilih = d.tanggal === sorot?.tanggal;
                  const tinggi = d.pengunjung / skala.atas * 100;
                  return <button key={d.tanggal} type="button" data-tanggal-pengunjung={d.tanggal} aria-pressed={dipilih}
                    aria-label={`${tanggalLengkap(d.tanggal)}, ${angka(d.pengunjung)} pengunjung, ${angka(d.halaman)} tampilan halaman`}
                    title={`${tanggalLengkap(d.tanggal)}, ${angka(d.pengunjung)} pengunjung`}
                    onClick={() => setTanggal(d.tanggal)}
                    onKeyDown={(e) => {
                      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                      e.preventDefault();
                      const tujuan = e.key === "Home" ? 0 : e.key === "End" ? baris.length - 1 : Math.min(baris.length - 1, Math.max(0, i + (e.key === "ArrowLeft" ? -1 : 1)));
                      setTanggal(baris[tujuan].tanggal);
                      (e.currentTarget.parentElement?.children[tujuan] as HTMLButtonElement | undefined)?.focus();
                    }}
                    className="group relative flex min-w-0 items-end justify-center rounded-md hover:bg-white/70">
                    {(baris.length <= 7 || dipilih) && <span aria-hidden className={`pointer-events-none absolute mb-1.5 text-[10px] font-semibold tabular-nums ${dipilih ? "text-tanda" : "text-ink2"}`} style={{ bottom: `${tinggi}%` }}>{angkaSumbu(d.pengunjung)}</span>}
                    {d.pengunjung > 0 ? <span aria-hidden data-batang-pengunjung className={`w-[70%] max-w-[32px] rounded-t-md transition-colors ${dipilih ? "bg-ukir" : "bg-tanda/80 group-hover:bg-tanda"}`} style={{ height: `${tinggi}%` }} />
                      : <span aria-hidden className="mb-0.5 h-1 w-1 rounded-full bg-ink2/40" />}
                  </button>;
                })}
              </div>
              <div aria-hidden className="relative mt-2 h-4 text-[10px] text-ink2">
                {labelGrafik.map((i) => <span key={baris[i].tanggal} className={`absolute whitespace-nowrap ${baris.length === 1 ? "-translate-x-1/2" : i === 0 ? "" : i === baris.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
                  style={{ left: `${baris.length === 1 ? 50 : i / (baris.length - 1) * 100}%` }}>{singkat(baris[i].tanggal)}</span>)}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10.5px] text-ink2">
              <p>{baris.length < periode ? `Baru ${baris.length} hari tercatat` : `${baris.length} hari tercatat`}</p>
              <p>Pilih batang untuk melihat rincian.</p>
            </div>
          </> : <div className="flex min-h-[210px] items-center justify-center py-8 text-center">
            <p className="max-w-[32ch] text-[12px] leading-relaxed text-ink2">{!data ? galat ? "Riwayat belum bisa ditampilkan." : "Memuat riwayat pengunjung…" : mulai ? "Belum ada pengunjung tercatat pada periode ini." : "Riwayat akan muncul setelah pengunjung pertama membuka situs."}</p>
          </div>}
        </div>
        {sorot && <aside className="min-w-0 rounded-in bg-buih p-3.5 sm:p-4" aria-label="Rincian pengunjung pada hari yang dipilih">
          <Dropdown label="Rincian hari" value={sorot.tanggal} onChange={setTanggal} kosong="Pilih tanggal"
            pilihan={[...baris].reverse().map((d) => ({ nilai: d.tanggal, label: pilihanTanggal(d.tanggal) }))} />
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-1" data-rincian-pengunjung>
            <div className="min-w-0"><dt className="text-[11px] text-ink2">Pengunjung unik</dt><dd className="mt-1 break-words text-[26px] font-bold leading-tight tracking-[-0.025em] tabular-nums">{angka(sorot.pengunjung)}</dd></div>
            <div className="min-w-0"><dt className="text-[11px] text-ink2">Tampilan halaman</dt><dd className="mt-1 break-words text-[26px] font-bold leading-tight tracking-[-0.025em] tabular-nums">{angka(sorot.halaman)}</dd></div>
          </dl>
          {negaraHari.length > 0 && <div className="mt-5" data-negara-hari>
            <p className="text-[11px] text-ink2">Negara teratas</p>
            <ul className="mt-2 grid gap-1.5">
              {negaraHari.map((n) => <li key={n.kunci} className="flex min-w-0 items-center gap-2 text-[12.5px]">
                <span aria-hidden className="flex-none text-[15px] leading-none">{n.bendera}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{n.nama}</span>
                <span className="flex-none tabular-nums text-ink2">{angka(n.pengunjung)}</span>
              </li>)}
            </ul>
          </div>}
          <p className="mt-4 text-[10.5px] leading-relaxed text-ink2">Satu pengunjung bisa membuka beberapa halaman.</p>
        </aside>}
      </div>
      {data && ringkasPeriode && ringkasPeriode.pengunjung > 0 && <div role="group" className="mt-4 rounded-in bg-soft p-3.5 sm:p-4" data-asal-negara aria-labelledby="judul-asal-negara">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h4 id="judul-asal-negara" className="font-body text-[13px] font-bold">Asal negara pengunjung</h4>
          <p className="text-[11px] text-ink2">{periode} hari terakhir · {angka(asal.dikenal)} dari {angka(ringkasPeriode.pengunjung)} pengunjung diketahui negaranya</p>
        </div>
        {!negaraPeriode.length && <p className="mt-3 text-[12px] leading-relaxed text-ink2" data-negara-kosong>Belum ada data negara pada periode ini. Negara mulai tercatat dari kunjungan berikutnya.</p>}
        {/* Empat baris ke atas dibagi dua kolom di layar lebar, urut ke bawah dulu. */}
        <ol className={`mt-3 grid gap-x-8 gap-y-2.5 ${negaraPeriode.length > 3 ? "lg:grid-flow-col lg:grid-cols-2" : ""}`}
          style={negaraPeriode.length > 3 ? { gridTemplateRows: `repeat(${kolomNegara}, auto)` } : undefined} data-hanya-persen={hanyaPersen || undefined}>
          {negaraPeriode.map((n) => {
            const persen = persenNegara(n.pengunjung);
            const ket = `${n.nama}, ${angka(n.pengunjung)} pengunjung, ${angka(n.halaman)} tampilan halaman`;
            return <li key={n.kunci} data-negara-pengunjung={n.kunci} title={ket} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto]">
              <span className="flex min-w-0 items-center gap-2 text-[12.5px]">
                <span aria-hidden className="w-5 flex-none text-center text-[15px] leading-none">{n.bendera}</span>
                <span className="min-w-0 truncate font-semibold">{n.nama}</span>
              </span>
              <span aria-hidden className="col-span-2 row-start-2 h-2 min-w-0 overflow-hidden rounded-pill bg-white sm:col-span-1 sm:row-start-auto">
                <span className={`block h-full rounded-pill ${n.kunci === "lain" ? "bg-tanda/40" : "bg-tanda/80"}`} style={{ width: `${Math.max(2, n.pengunjung / maksNegara * 100)}%` }} />
              </span>
              <span className="col-start-2 row-start-1 whitespace-nowrap text-right text-[12px] tabular-nums sm:col-start-auto sm:row-start-auto">
                {hanyaPersen
                  ? <><span className="font-semibold">{persen}%</span><span className="sr-only">, {angka(n.pengunjung)} pengunjung</span></>
                  : <><span className="font-semibold">{angka(n.pengunjung)}</span> <span className="text-ink2">· {persen}%</span></>}
              </span>
            </li>;
          })}
        </ol>
        <p className="mt-3 text-[10.5px] leading-relaxed text-ink2" data-negara-catatan>
          Persen dihitung dari pengunjung yang diketahui negaranya, diperkirakan dari zona waktu perangkat, tanpa alamat IP.
          {asal.tidak > 0 && ` ${angka(asal.tidak)} pengunjung belum punya data negara, misalnya yang datang sebelum fitur ini dipasang.`}
        </p>
      </div>}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-5 gap-y-2 text-[11px] leading-relaxed text-ink2">
        <p>{mulai ? `Data sejak ${pilihanTanggal(mulai)} · WIT` : "Tanggal mengikuti WIT"} · Pembaruan setiap {SEGARKAN_PENGUNJUNG_MS / 1000} detik</p>
        <details className="max-w-[60ch]">
          <summary className="cursor-pointer font-semibold text-tanda">Cara data dihitung</summary>
          <p className="mt-2">Satu peramban dihitung sekali di setiap periode, meski membuka beberapa halaman. Total 7 dan 30 hari menghitung pengunjung unik dalam periode itu, sehingga bukan penjumlahan angka harian. Akun tim yang sedang masuk dan bot yang dikenali tidak dihitung.</p>
          <p className="mt-2">Asal negara diperkirakan dari zona waktu perangkat pengunjung, bukan dari alamat IP, dan yang disimpan hanya kode negaranya. Tamu yang sudah berada di Indonesia dan memakai zona waktu setempat tercatat Indonesia. Pengunjung sebelum fitur ini dipasang, atau yang perangkatnya memakai zona UTC, masuk Tidak diketahui.</p>
        </details>
      </div>
    </section>
  );
}
