"use client";
import { useMemo, useRef, useState } from "react";
import { hariIniWit, sisaKursi, tx, type Konten } from "@/lib/konten";
import type { Permintaan } from "@/lib/server/permintaan";
import type { IdTab } from "@/lib/peran";
import { orangIkut, pesanMitra, susunKegiatan, type JenisKegiatan, type Kegiatan } from "@/lib/kegiatan";
import { NAMA_HARI, bulanLain, bulanTahun, didalam, geser, kisiBulan, selisihHari, tanggalLengkap, tanggalPendek } from "@/lib/tanggal";
import { rentangTanggal } from "@/lib/format";
import { IkonPanahKanan, IkonPanahKiri, IkonTutup, IkonWhatsapp } from "@/components/Ikon";
import Dropdown from "@/components/Dropdown";
import { KartuPanel, Saklar } from "./Kolom";
import { KELAS_STATUS, NAMA_STATUS } from "./BagianPermintaan";

/** Warna tiap jenis kegiatan, dari token merek. */
const JENIS: Record<JenisKegiatan, { warna: string; label: string; legenda: string }> = {
  opentrip: { warna: "#203149", label: "Open trip", legenda: "Keberangkatan open trip" },
  trip: { warna: "#1264A8", label: "Trip", legenda: "Trip tanggal pilihan tamu" },
  homestay: { warna: "#30A6DE", label: "Homestay", legenda: "Tamu di homestay mitra" },
};

/** Kata pertama nama trip, untuk sel tanggal yang sempit. */
const singkat = (s: string) => s.split(/\s+/)[0] || s;

/** Keadaan satu kegiatan pada satu tanggal: datang, berlangsung, atau pulang. */
function saat(g: Kegiatan, iso: string): string {
  if (g.jenis === "homestay") return g.mulai === iso ? "Datang hari itu" : g.selesai === iso ? "Pulang hari itu" : "Menginap";
  if (g.mulai === iso) return g.jenis === "opentrip" ? "Berangkat hari itu" : "Mulai hari itu";
  return g.selesai === iso ? "Hari terakhir" : "Sedang berjalan";
}

function Titik({ g, terang = false }: { g: Kegiatan; terang?: boolean }) {
  const w = JENIS[g.jenis].warna;
  return <span aria-hidden className={`block h-[7px] w-[7px] flex-none rounded-full ${terang ? "ring-[1.5px] ring-white" : ""}`} style={g.pasti ? { background: w } : { boxShadow: `inset 0 0 0 1.5px ${w}`, background: "white" }} />;
}

/** Isi chip di sel tanggal. Jenisnya sudah terbaca dari warna, jadi yang ditulis nama tamu atau kursi. */
function labelSel(g: Kegiatan, iso: string) {
  if (g.jenis === "opentrip" && g.jadwal) {
    const j = g.jadwal;
    return `${singkat(g.judul)} ${sisaKursi(j) === 0 ? "penuh" : `${j.terisi}/${j.kursi}`}`;
  }
  const awal = g.jenis === "homestay" ? (g.mulai === iso ? "Datang " : g.selesai === iso ? "Pulang " : "") : "";
  return `${awal}${g.permintaan?.nama ?? ""}`;
}

/**
 * Kalender kegiatan (pola DAMPIER, Kalender.tsx). Permintaan pemilik,
 * November 2026: semua pesanan ke mitra terlihat di satu kalender. Kisi
 * bulanan memuat keberangkatan open trip, trip dengan tanggal pilihan tamu,
 * dan tamu di homestay mitra. Klik tanggal untuk melihat siapa yang datang,
 * berangkat, dan pulang. Di bawahnya agenda dua minggu ke depan.
 */
export default function BagianKalender({ k, permintaan, pindah, boleh }: {
  k: Konten; permintaan: Permintaan[]; pindah: (t: IdTab, jangkar?: string) => void; boleh: (t: IdTab) => boolean;
}) {
  const hariIni = hariIniWit();
  const [bulan, setBulan] = useState(() => `${hariIni.slice(0, 7)}-01`);
  const [pilih, setPilih] = useState<string | null>(null);
  const [saring, setSaring] = useState("semua");
  const [belumPasti, setBelumPasti] = useState(true);
  const rincian = useRef<HTMLElement>(null);

  const kegiatan = useMemo(() => susunKegiatan(k, permintaan), [k, permintaan]);
  const tampil = useMemo(() => kegiatan.filter((g) =>
    (belumPasti || g.pasti) && (saring === "semua" || saring === `${g.jenis === "homestay" ? "homestay" : "trip"}:${g.itemId}`)), [kegiatan, saring, belumPasti]);
  const kisi = useMemo(() => kisiBulan(bulan), [bulan]);
  const perHari = useMemo(() => {
    const m = new Map<string, Kegiatan[]>();
    for (const { iso } of kisi) { const x = tampil.filter((g) => didalam(iso, g.mulai, g.selesai)); if (x.length) m.set(iso, x); }
    return m;
  }, [kisi, tampil]);

  const bulanIni = kisi.filter((x) => x.bulanIni).map((x) => x.iso);
  const awalBulan = bulanIni[0], akhirBulan = bulanIni[bulanIni.length - 1];
  const baruBulanIni = tampil.filter((g) => g.permintaan?.status === "baru" && g.mulai <= akhirBulan && g.selesai >= awalBulan).length;

  const pilihan = [
    { nilai: "semua", label: "Semua kegiatan" },
    ...k.trip.map((t) => ({ nilai: `trip:${t.id}`, label: `Trip · ${tx(t.nama, "id")}` })),
    ...k.homestay.map((h) => ({ nilai: `homestay:${h.id}`, label: `Homestay · ${tx(h.nama, "id")}` })),
  ];

  const pindahBulan = (n: number) => { setBulan((b) => bulanLain(b, n)); setPilih(null); };
  const pilihTanggal = (iso: string | null) => {
    setPilih(iso);
    if (iso && window.innerWidth < 1280) requestAnimationFrame(() => rincian.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const keTanggal = (iso: string) => { setBulan(`${iso.slice(0, 7)}-01`); pilihTanggal(iso); };

  const hariPilih = pilih ? (perHari.get(pilih) ?? []) : [];
  const datang = hariPilih.filter((g) => g.jenis === "homestay" && g.mulai === pilih).reduce((n, g) => n + (g.permintaan?.orang ?? 0), 0);
  const pulang = hariPilih.filter((g) => g.jenis === "homestay" && g.selesai === pilih).reduce((n, g) => n + (g.permintaan?.orang ?? 0), 0);

  // Agenda dua minggu: yang datang, berangkat, mulai, dan pulang.
  const agenda = useMemo(() => {
    const hasil: { iso: string; isi: { g: Kegiatan; kata: string }[] }[] = [];
    for (let i = 0; i < 14; i++) {
      const iso = geser(hariIni, i);
      const isi = tampil.flatMap((g) => {
        const out: { g: Kegiatan; kata: string }[] = [];
        if (g.mulai === iso) out.push({ g, kata: g.jenis === "homestay" ? "Datang" : g.jenis === "opentrip" ? "Berangkat" : "Mulai" });
        else if (g.jenis === "homestay" && g.selesai === iso) out.push({ g, kata: "Pulang" });
        return out;
      });
      if (isi.length) hasil.push({ iso, isi });
    }
    return hasil;
  }, [tampil, hariIni]);

  return (
    <div className="grid gap-6">
      <div className={pilih ? "grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]" : ""}>
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => pindahBulan(-1)} aria-label="Bulan sebelumnya" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-navy hover:bg-buih"><IkonPanahKiri size={18} /></button>
              <button type="button" onClick={() => pindahBulan(1)} aria-label="Bulan berikutnya" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-navy hover:bg-buih"><IkonPanahKanan size={18} /></button>
              <h2 className="ml-1.5 font-body text-[20px] font-extrabold capitalize tracking-normal text-navy">{bulanTahun(bulan)}</h2>
              {bulan.slice(0, 7) !== hariIni.slice(0, 7) && (
                <button type="button" onClick={() => { setBulan(`${hariIni.slice(0, 7)}-01`); setPilih(null); }} className="ml-1 rounded-pill bg-buih px-3 py-1.5 text-[13px] font-bold text-navy hover:bg-line">Bulan ini</button>
              )}
            </div>
            <div className="ml-auto flex w-full flex-wrap items-end gap-3 sm:w-auto">
              {baruBulanIni > 0 && (
                <button type="button" onClick={() => pindah("permintaan")} className="rounded-pill bg-[#FFE6DB] px-3 py-1.5 text-[12.5px] font-extrabold text-navy">{baruBulanIni} permintaan baru belum dihubungi</button>
              )}
              <div className="w-full sm:w-[260px]"><Dropdown label="Tampilkan" value={saring} onChange={(v) => { setSaring(v); setPilih(null); }} pilihan={pilihan} kosong="Semua kegiatan" /></div>
            </div>
          </div>

          <div className="overflow-hidden rounded-card border border-line bg-white">
            <div className="grid grid-cols-7 bg-soft">
              {NAMA_HARI.map((h) => <div key={h} className="py-2 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink2">{h}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 bg-soft p-1">
              {kisi.map(({ iso, bulanIni: di }) => {
                const isi = perHari.get(iso) ?? [];
                const on = pilih === iso;
                const penuh = isi.filter((g) => g.jadwal && sisaKursi(g.jadwal) === 0).length;
                return (
                  <button key={iso} type="button" onClick={() => pilihTanggal(on ? null : iso)} aria-pressed={on} aria-controls="kalender-hari"
                    aria-label={`${tanggalLengkap(iso)}, ${isi.length ? `${isi.length} kegiatan` : "tidak ada kegiatan"}`}
                    className={`flex min-h-[58px] flex-col items-stretch justify-start rounded-[10px] p-1 text-left transition sm:min-h-[88px] sm:p-1.5 ${on ? "bg-navy text-white" : di ? "bg-white hover:bg-buih" : "bg-soft text-ink2"}`}>
                    <span className={`inline-grid h-[22px] min-w-[22px] place-items-center self-start rounded-full px-1 text-[12.5px] font-bold tabular-nums ${on ? "bg-white/20" : iso === hariIni ? "bg-tanda text-white" : di ? "text-navy" : "text-ink2/70"}`}>{Number(iso.slice(8))}</span>
                    {isi.length > 0 && (
                      <>
                        {/* Ponsel dan sel sempit: titik saja. */}
                        <span className={`mt-1 flex flex-wrap gap-1 ${pilih ? "" : "sm:hidden"}`}>
                          {isi.slice(0, 6).map((g) => <Titik key={g.kunci} g={g} terang={on} />)}
                          {isi.length > 6 && <span className="text-[10px] font-bold leading-[7px]">+</span>}
                        </span>
                        {!pilih && (
                          <span className="mt-1 hidden space-y-[3px] sm:block">
                            {penuh > 0 && <span className={`block truncate rounded-[5px] px-1 py-[2px] text-[10.5px] font-extrabold leading-[1.3] ${on ? "bg-white/20" : "bg-kabut/60 text-navy"}`}>{penuh} open trip penuh</span>}
                            {isi.slice(0, 2).map((g) => (
                              <span key={g.kunci} className={`flex items-center gap-1 rounded-[5px] px-1 py-[2px] text-[10.5px] leading-[1.3] ${on ? "bg-white/20 text-white" : g.pasti ? "text-navy" : "bg-white text-ink2"}`}
                                style={on ? undefined : g.pasti ? { background: `${JENIS[g.jenis].warna}1F` } : { boxShadow: `inset 0 0 0 1px ${JENIS[g.jenis].warna}55` }}>
                                <Titik g={g} terang={on} />
                                <span className="truncate">{labelSel(g, iso)}</span>
                              </span>
                            ))}
                            {isi.length > 2 && <span className={`block px-1 text-[10.5px] font-bold ${on ? "text-white" : "text-ink2"}`}>+{isi.length - 2} lagi</span>}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Warna di kalender">
              {(Object.keys(JENIS) as JenisKegiatan[]).map((j) => (
                <li key={j} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink2"><span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: JENIS[j].warna }} />{JENIS[j].legenda}</li>
              ))}
              <li className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink2"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-white shadow-[inset_0_0_0_1.5px_#55657A]" />Belum pasti</li>
            </ul>
            <Saklar label="Tampilkan yang belum pasti" value={belumPasti} onChange={(v) => { setBelumPasti(v); setPilih(null); }} />
          </div>
          <p className="mt-3 max-w-[78ch] text-[13px] leading-relaxed text-ink2">
            Kalender ini memuat semua pesanan dari meja permintaan dan jadwal open trip. Permintaan berstatus Dikonfirmasi tampil penuh, yang masih Baru atau Sudah dihubungi tampil sebagai belum pasti, dan yang Batal tidak tampil. Kursi open trip mengikuti angka terisi di menu Jadwal open trip.
          </p>
        </div>

        <aside ref={rincian} id="kalender-hari" aria-label={pilih ? `Kegiatan ${tanggalLengkap(pilih)}` : "Kegiatan harian"}
          className={pilih ? "scroll-mt-[150px] self-start rounded-card border border-line bg-white p-5 shadow-card xl:sticky xl:top-[calc(var(--kepala-panel,64px)+20px)]" : "sr-only"}>
          {pilih && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-aksen text-[14px] uppercase tracking-[0.16em] text-tanda">Kegiatan hari itu</p>
                  <h3 className="mt-1 font-body text-[18px] font-extrabold capitalize leading-tight tracking-normal text-navy">{tanggalLengkap(pilih)}</h3>
                  {(datang > 0 || pulang > 0) && <p className="mt-1 text-[13px] font-bold text-ink2">{[datang ? `${datang} tamu datang` : "", pulang ? `${pulang} tamu pulang` : ""].filter(Boolean).join(", ")}</p>}
                </div>
                <button type="button" onClick={() => setPilih(null)} aria-label="Tutup rincian hari" className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line text-navy hover:bg-buih"><IkonTutup size={16} /></button>
              </div>
              {hariPilih.length === 0 ? (
                <p className="mt-4 text-[14px] text-ink2">Tidak ada kegiatan pada tanggal ini.</p>
              ) : (
                (Object.keys(JENIS) as JenisKegiatan[]).map((j) => {
                  const isi = hariPilih.filter((g) => g.jenis === j);
                  if (!isi.length) return null;
                  return (
                    <div key={j} className="mt-4 grid gap-2.5">
                      <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-ink2">{JENIS[j].legenda}</p>
                      {isi.map((g) => <KartuKegiatan key={g.kunci} g={g} iso={pilih} pindah={pindah} boleh={boleh} />)}
                    </div>
                  );
                })
              )}
            </>
          )}
        </aside>
      </div>

      <KartuPanel judul="Dua minggu ke depan" keterangan="Yang datang, berangkat, mulai, dan pulang mulai hari ini. Klik tanggalnya untuk membuka rincian di kalender.">
        {agenda.length === 0 ? (
          <p className="text-[14px] text-ink2">Belum ada kegiatan dalam dua minggu ke depan.</p>
        ) : (
          <ul className="grid gap-2">
            {agenda.map(({ iso, isi }) => (
              <li key={iso} className="grid gap-2 rounded-in bg-soft p-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-start">
                <button type="button" onClick={() => keTanggal(iso)} className="text-left text-[14px] font-extrabold text-tanda hover:underline">
                  {iso === hariIni ? "Hari ini" : iso === geser(hariIni, 1) ? "Besok" : tanggalPendek(iso)}
                </button>
                <ul className="grid gap-1.5">
                  {isi.map(({ g, kata }) => (
                    <li key={g.kunci + kata} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[14px] text-navy">
                      <Titik g={g} />
                      <span className="font-bold">{kata}</span>
                      <span>{g.jenis === "opentrip" ? g.judul : `${g.permintaan?.nama}, ${g.judul}`}</span>
                      <span className="text-ink2">{g.jenis === "opentrip" && g.jadwal ? `${g.jadwal.terisi}/${g.jadwal.kursi} kursi` : `${g.permintaan?.orang} orang${g.pasti ? "" : ", belum pasti"}`}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </KartuPanel>
    </div>
  );
}

/** Satu kegiatan di rincian hari: open trip beserta yang ikut, atau satu permintaan. */
function KartuKegiatan({ g, iso, pindah, boleh }: { g: Kegiatan; iso: string; pindah: (t: IdTab, jangkar?: string) => void; boleh: (t: IdTab) => boolean }) {
  if (g.jenis === "opentrip" && g.jadwal) {
    const j = g.jadwal, sisa = sisaKursi(j), o = orangIkut(g);
    return (
      <div className="rounded-in border border-line bg-white px-3.5 py-3">
        <div className="flex items-start justify-between gap-2.5">
          <span className="min-w-0">
            <span className="block text-[14.5px] font-extrabold text-navy">{g.judul}</span>
            <span className="block text-[12.5px] text-ink2">{rentangTanggal(j.mulai, j.selesai, "id")} · {saat(g, iso)}{j.contoh ? " · jadwal contoh" : ""}</span>
          </span>
          <span className={`flex-none rounded-pill px-2 py-0.5 text-[11.5px] font-extrabold ${sisa === 0 ? "bg-kabut text-navy" : "bg-buih text-navy"}`}>{sisa === 0 ? "Penuh" : `Sisa ${sisa}`}</span>
        </div>
        <p className="mt-2 text-[12.5px] text-ink2">{j.terisi} dari {j.kursi} kursi terisi. Dari permintaan {o.pasti} orang dikonfirmasi{o.belum ? `, ${o.belum} orang belum pasti` : ""}.</p>
        {(g.ikut ?? []).length > 0 && (
          <ul className="mt-2 grid gap-1.5">
            {g.ikut!.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => pindah("permintaan", `permintaan-${p.id}`)} className="flex w-full items-center justify-between gap-2 rounded-[10px] bg-soft px-2.5 py-1.5 text-left text-[13px] hover:bg-buih">
                  <span className="min-w-0 truncate font-bold text-navy">{p.nama} · {p.orang} orang</span>
                  <span className={`flex-none rounded-pill px-2 py-0.5 text-[11px] font-extrabold ${KELAS_STATUS[p.status]}`}>{NAMA_STATUS[p.status]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {boleh("jadwal") && <button type="button" onClick={() => pindah("jadwal")} className="mt-2.5 text-[13px] font-bold text-tanda">Ubah kursi di Jadwal open trip</button>}
      </div>
    );
  }
  const p = g.permintaan!;
  const malam = g.jenis === "homestay" && p.selesai ? selisihHari(p.mulai, p.selesai) : 0;
  return (
    <div className={`rounded-in border px-3.5 py-3 ${g.pasti ? "border-line bg-white" : "border-line bg-soft"}`}>
      <div className="flex items-start justify-between gap-2.5">
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-extrabold text-navy">{p.nama}</span>
          <span className="block text-[12.5px] leading-[1.45] text-ink2">{g.judul}</span>
        </span>
        <span className={`flex-none rounded-pill px-2 py-0.5 text-[11.5px] font-extrabold ${KELAS_STATUS[p.status]}`}>{NAMA_STATUS[p.status]}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[12.5px] text-ink2">
        <span className="font-bold text-navy">{saat(g, iso)}</span>
        <span>{rentangTanggal(g.mulai, g.selesai, "id")} · {p.orang} orang{malam ? ` · ${malam} malam` : ""}</span>
      </div>
      <p className="mt-1 text-[12px] text-ink2">{p.kode}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button type="button" onClick={() => pindah("permintaan", `permintaan-${p.id}`)} className="rounded-pill bg-buih px-3 py-1.5 text-[12.5px] font-bold text-navy hover:bg-line">Buka di Permintaan</button>
        {g.jenis === "homestay" && (
          <a href={`https://wa.me/?text=${encodeURIComponent(pesanMitra(p))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-pill bg-buih px-3 py-1.5 text-[12.5px] font-bold text-navy hover:bg-line">
            <IkonWhatsapp size={15} />Teruskan ke mitra
          </a>
        )}
      </div>
    </div>
  );
}
