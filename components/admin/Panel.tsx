"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { jadwalMendatang, hariIniWit, tx, type Konten } from "@/lib/konten";
import type { Permintaan } from "@/lib/server/permintaan";
import { KONTEN_BAWAAN } from "@/data/bawaan";
import { META_PERAN, bolehUbahIsi, type IdTab, type Peran } from "@/lib/peran";
import { temuanTandaBaca } from "@/lib/tanda-panel";
import { tanggalPanjang } from "@/lib/format";
import Gerbang from "./Gerbang";
import KepalaPanel from "./KepalaPanel";
import { KET_TAB, MenuPonsel, NavMenu, cariHalaman, menuPeran, tunggal } from "./MenuPanel";
import { BagianPermintaan } from "./BagianPermintaan";
import BagianRingkasan from "./BagianRingkasan";
import { BagianHomestay, BagianJadwal, BagianTitik, BagianTrip } from "./BagianTrip";
import { BagianBeranda, BagianKontak, BagianUlasanFaq } from "./BagianIsi";
import BagianAkun from "./BagianAkun";
import BagianKalender from "./BagianKalender";
import BagianKalenderMitra from "./BagianKalenderMitra";
import BagianLiveaboard from "./BagianLiveaboard";
import { susunKegiatan } from "@/lib/kegiatan";
import { didalam } from "@/lib/tanggal";

export interface Sesi { email: string; nama: string; peran: Peran }
export type Ubah = (f: (d: Konten) => void) => void;

/**
 * Bagian isi situs yang diatur tiap halaman panel. Dipakai titik merah
 * belum disimpan dan kalimat bilah simpan (pola DAMPIER, kategoriBerbeda).
 */
const KUNCI_TAB: Partial<Record<IdTab, (keyof Konten)[]>> = {
  trip: ["kategori", "trip", "halamanTrip"],
  liveaboard: ["liveaboard", "halamanLiveaboard"],
  jadwal: ["jadwal"],
  homestay: ["homestay", "halamanHomestay"],
  titik: ["titik"],
  beranda: ["about", "rute", "diveCourse", "hero", "jelajah", "gerbang", "bagian", "ajakan", "menu", "footer"],
  ulasan: ["ulasan", "faq"],
  kontak: ["situs"],
};
const TAB_ISI = Object.keys(KUNCI_TAB) as IdTab[];

/**
 * Kembalikan ke bawaan hanya menyentuh teks halaman, bukan daftar milik
 * pemilik (trip, jadwal, homestay, titik selam, ulasan, kontak). Hasilnya
 * masih draf sampai Simpan perubahan, dan Batalkan mengurungkannya.
 */
const BAWAAN_TAB: Partial<Record<IdTab, { kunci: (keyof Konten)[]; ket: string } | { situsSeo: true; ket: string }>> = {
  trip: { kunci: ["halamanTrip"], ket: "Pembuka halaman Trip dan kartu edukasi selam kembali ke bawaan. Daftar trip tidak berubah." },
  liveaboard: { kunci: ["liveaboard", "halamanLiveaboard"], ket: "Bagian Liveaboard, pembuka halaman Liveaboard, dan kartu sebelum naik kapal kembali ke bawaan. Trip liveaboard tidak berubah." },
  homestay: { kunci: ["halamanHomestay"], ket: "Pembuka halaman Homestay kembali ke bawaan. Daftar homestay tidak berubah." },
  beranda: { kunci: KUNCI_TAB.beranda!, ket: "Semua teks dan foto beranda, menu, dan footer kembali ke bawaan." },
  ulasan: { kunci: ["faq"], ket: "Pertanyaan yang sering ditanyakan kembali ke bawaan. Ulasan tamu tidak berubah." },
  kontak: { situsSeo: true, ket: "Judul dan deskripsi di Google kembali ke bawaan. Kontak dan media sosial tidak berubah." },
};

const LABEL_TAB = (t: IdTab) => cariHalaman(menuPeran(META_PERAN.pemilik.tabs), t)?.butir.label ?? t;
const sama = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const daftarKata = (x: string[]) => x.length <= 1 ? x.join("") : `${x.slice(0, -1).join(", ")} dan ${x[x.length - 1]}`;

/**
 * Panel pengelola Fantasea (bahasa Indonesia), mengikuti pola panel DAMPIER
 * (permintaan pemilik, November 2026). Menu berkelompok di samping, kartu
 * menu menempel di ponsel, header dengan lonceng permintaan dan menu akun,
 * dan kepala tiap halaman. Semua isi situs dimuat sekali sebagai satu draf,
 * lalu disimpan sekaligus dari bilah simpan yang menyebut halaman mana yang
 * belum disimpan. Permintaan tamu punya simpanan sendiri per baris.
 */
export default function Panel() {
  const [tahap, setTahap] = useState<"muat" | "masuk" | "siapkan" | "siap">("muat");
  const [sesi, setSesi] = useState<Sesi | null>(null);
  const [kunciPerlu, setKunciPerlu] = useState(true);
  const [k, setK] = useState<Konten | null>(null);
  const [asli, setAsli] = useState<Konten | null>(null);
  const [permintaan, setPermintaan] = useState<Permintaan[]>([]);
  const [tab, setTab] = useState<IdTab>("ringkasan");
  const [simpan, setSimpan] = useState<"" | "proses" | "beres" | string>("");
  const [tanyaBawaan, setTanyaBawaan] = useState(false);
  const jangkar = useRef<string | null>(null);

  const tabs = useMemo(() => (sesi ? META_PERAN[sesi.peran].tabs : []), [sesi]);
  const menu = useMemo(() => menuPeran(tabs), [tabs]);
  const bolehUbah = !!sesi && bolehUbahIsi(sesi.peran);

  const muat = useCallback(async () => {
    const [rk, rp] = await Promise.all([fetch("/api/konten", { cache: "no-store" }), fetch("/api/permintaan", { cache: "no-store" })]);
    if (rk.status === 401) { setTahap("masuk"); return; }
    const ok = (await rk.json()) as { konten: Konten };
    setK(ok.konten); setAsli(structuredClone(ok.konten));
    if (rp.ok) setPermintaan(((await rp.json()) as { daftar: Permintaan[] }).daftar);
    setTahap("siap");
  }, []);

  const cekSesi = useCallback(async () => {
    const r = await fetch("/api/sesi", { cache: "no-store" }).catch(() => null);
    if (!r) return undefined;
    return r.ok ? ((await r.json().catch(() => ({}))) as { sesi?: Sesi | null }).sesi ?? null : null;
  }, []);

  useEffect(() => {
    (async () => {
      const s = await cekSesi();
      if (s) { setSesi(s); await muat(); return; }
      const p = (await fetch("/api/penyiapan", { cache: "no-store" }).then((x) => x.json()).catch(() => ({ perlu: false, kunciAda: true }))) as { perlu: boolean; kunciAda: boolean };
      setKunciPerlu(p.kunciAda);
      setTahap(p.perlu ? "siapkan" : "masuk");
    })();
  }, [muat, cekSesi]);

  // Kembali ke tab lewat tombol Kembali peramban, atau sesi yang keluar di
  // perangkat lain (ganti sandi), memeriksa sesinya lagi (pola DAMPIER, AdminShell).
  useEffect(() => {
    const periksa = async (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      const s = await cekSesi();
      if (s === null) setTahap("masuk");
    };
    window.addEventListener("pageshow", periksa);
    return () => window.removeEventListener("pageshow", periksa);
  }, [cekSesi]);

  useEffect(() => {
    if (!tabs.length) return;
    const dariHash = () => { const h = location.hash.slice(1) as IdTab; if (tabs.includes(h)) setTab(h); };
    dariHash();
    window.addEventListener("hashchange", dariHash);
    return () => window.removeEventListener("hashchange", dariHash);
  }, [tabs]);

  // Permintaan baru untuk lonceng, tiap menit selama halaman terlihat. Tidak
  // di halaman Permintaan, supaya catatan tim yang sedang diketik tidak tertimpa.
  useEffect(() => {
    if (tahap !== "siap" || tab === "permintaan" || !tabs.includes("permintaan")) return;
    const ambil = async () => {
      if (document.visibilityState !== "visible") return;
      const r = await fetch("/api/permintaan", { cache: "no-store" }).catch(() => null);
      if (r?.status === 401) { setTahap("masuk"); return; }
      if (r?.ok) setPermintaan(((await r.json()) as { daftar: Permintaan[] }).daftar);
    };
    const t = setInterval(ambil, 60_000);
    document.addEventListener("visibilitychange", ambil);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", ambil); };
  }, [tahap, tab, tabs]);

  const ubah: Ubah = useCallback((f) => setK((lama) => { if (!lama) return lama; const d = structuredClone(lama); f(d); return d; }), []);

  const tabBerubah = useMemo(() => {
    if (!k || !asli) return [] as IdTab[];
    return TAB_ISI.filter((t) => KUNCI_TAB[t]!.some((kunci) => !sama(k[kunci], asli[kunci])));
  }, [k, asli]);
  const berubah = tabBerubah.length > 0;

  const temuan = useMemo(() => (k && bolehUbah ? temuanTandaBaca(k) : []), [k, bolehUbah]);

  useEffect(() => {
    if (!berubah) return;
    const cegah = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", cegah);
    return () => window.removeEventListener("beforeunload", cegah);
  }, [berubah]);

  // Gulir ke jangkar setelah halaman tujuan tergambar (mis. Ganti kata sandi dari menu akun).
  useEffect(() => {
    const id = jangkar.current;
    if (!id) return;
    jangkar.current = null;
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const atas = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kepala-panel")) || 64;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - atas - (window.innerWidth < 1280 ? 88 : 16), behavior: "smooth" });
      el.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    });
  });

  async function simpanSemua() {
    if (!k) return;
    setSimpan("proses"); setTanyaBawaan(false);
    const r = await fetch("/api/konten", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ konten: k }) }).catch(() => null);
    if (!r) { setSimpan("Server tidak bisa dihubungi. Coba lagi."); return; }
    if (r.status === 401) { setTahap("masuk"); return; }
    const o = (await r.json().catch(() => ({}))) as { konten?: Konten; galat?: string };
    if (!r.ok || !o.konten) { setSimpan(o.galat ?? "Belum tersimpan. Coba lagi."); return; }
    setK(o.konten); setAsli(structuredClone(o.konten));
    setSimpan("beres");
    setTimeout(() => setSimpan((x) => (x === "beres" ? "" : x)), 3000);
  }

  function kembalikanBawaan() {
    const b = BAWAAN_TAB[tab];
    if (!b) return;
    ubah((d) => {
      if ("situsSeo" in b) { d.situs.seo = structuredClone(KONTEN_BAWAAN.situs.seo); return; }
      const tulis = d as unknown as Record<string, unknown>;
      for (const kunci of b.kunci) tulis[kunci] = structuredClone(KONTEN_BAWAAN[kunci]);
    });
    setTanyaBawaan(false); setSimpan("");
  }

  async function keluar() {
    await fetch("/api/keluar", { method: "POST" }).catch(() => null);
    location.reload();
  }

  if (tahap === "muat") return <div className="grid min-h-screen place-items-center text-[15px] font-bold text-ink2">Memuat panel</div>;
  if (tahap === "masuk" || tahap === "siapkan") {
    return <Gerbang mode={tahap} kunciPerlu={kunciPerlu} onMasuk={(s) => { setSesi(s); setTahap("muat"); muat(); }} />;
  }
  if (!k || !sesi || !asli) return null;

  const baru = permintaan.filter((p) => p.status === "baru").length;
  const pindah = (id: IdTab, ke?: string) => {
    if (!tabs.includes(id)) return;
    setTab(id); setTanyaBawaan(false);
    history.replaceState(null, "", `#${id}`);
    if (ke) jangkar.current = ke; else window.scrollTo({ top: 0 });
  };
  const temu = cariHalaman(menu, tab);
  const isiTab = TAB_ISI.includes(tab);
  const temuanTab = temuan.filter((x) => KUNCI_TAB[tab]?.includes(x.kunci));
  const temuanLain = temuan.length - temuanTab.length;
  const lencana = (t: IdTab, on: boolean) => t === "permintaan" && baru > 0
    ? <span className={`rounded-pill px-2 py-0.5 text-[12px] font-extrabold ${on ? "bg-white text-navy" : "bg-koral text-navy"}`}>{baru}</span>
    : null;
  const propsMenu = { menu, aktif: tab, berubah: tabBerubah, onPilih: (t: IdTab) => pindah(t), lencana };
  const hariIni = hariIniWit();
  const mendatang = jadwalMendatang(k.jadwal, hariIni);
  const kegiatanHariIni = susunKegiatan(k, permintaan).filter((g) => g.pasti && didalam(hariIni, g.mulai, g.selesai)).length;
  const jadwalDekat = mendatang[0];
  const tripDekat = jadwalDekat ? k.trip.find((t) => t.id === jadwalDekat.tripId) : undefined;
  const bawaan = BAWAAN_TAB[tab];
  const tampilBilah = bolehUbah && (isiTab || berubah || !!simpan);

  return (
    <div className="panel-admin min-h-screen bg-soft">
      <KepalaPanel sesi={sesi} permintaan={permintaan} bolehPermintaan={tabs.includes("permintaan")} onPilih={pindah} onKeluar={keluar} />

      <div className="wrap-panel grid gap-6 pb-10 pt-4 xl:grid-cols-[236px_minmax(0,1fr)] xl:pt-6">
        <aside className="hidden xl:sticky xl:block xl:self-start" style={{ top: "calc(var(--kepala-panel, 64px) + 20px)" }}>
          <NavMenu {...propsMenu} />
          {tabs.includes("permintaan") && (
            <div className="mt-5 rounded-[18px] bg-white p-4 text-[13px] text-ink2 shadow-card">
              <p className="font-extrabold text-navy">Hari ini</p>
              <button type="button" onClick={() => pindah("permintaan")} className="mt-2 flex w-full items-center justify-between gap-2 text-left hover:text-navy">
                <span>Permintaan baru</span><span className="font-extrabold text-navy">{baru}</span>
              </button>
              {tabs.includes("kalender") && (
                <button type="button" onClick={() => pindah("kalender")} className="mt-1.5 flex w-full items-center justify-between gap-2 text-left hover:text-navy">
                  <span>Kegiatan pasti hari ini</span><span className="font-extrabold text-navy">{kegiatanHariIni}</span>
                </button>
              )}
              {jadwalDekat && (
                <p className="mt-2">Open trip terdekat <span className="block font-bold text-navy">{tanggalPanjang(jadwalDekat.mulai, "id")}{tripDekat ? `, ${tx(tripDekat.nama, "id")}` : ""}</span></p>
              )}
            </div>
          )}
        </aside>

        <main className="min-w-0">
          <MenuPonsel {...propsMenu} />

          {tab !== "ringkasan" && <div className="mb-6">
            {temu && !tunggal(temu.kelompok) && <p className="font-aksen text-[15px] uppercase tracking-[0.16em] text-tanda">{temu.kelompok.label}</p>}
            <h1 className="mt-0.5 text-[clamp(30px,4vw,40px)] leading-tight text-navy">{temu?.butir.label ?? "Panel"}</h1>
            <p className="mt-1.5 max-w-[70ch] text-[14.5px] text-ink2">{KET_TAB[tab]}</p>
          </div>}

          {isiTab && temuanTab.length > 0 && <KotakTanda temuan={temuanTab} lain={temuanLain} />}

          {tab === "ringkasan" && <BagianRingkasan k={k} permintaan={permintaan} sesi={sesi} pindah={pindah} boleh={(t) => tabs.includes(t)} />}
          {tab === "kalender" && <BagianKalender k={k} permintaan={permintaan} pindah={pindah} boleh={(t) => tabs.includes(t)} />}
          {tab === "permintaan" && <BagianPermintaan permintaan={permintaan} setPermintaan={setPermintaan} sesi={sesi} k={k} />}
          {tab === "trip" && <BagianTrip k={k} ubah={ubah} />}
          {tab === "liveaboard" && <BagianLiveaboard k={k} ubah={ubah} pindah={pindah} />}
          {tab === "jadwal" && <BagianJadwal k={k} ubah={ubah} />}
          {tab === "homestay" && <BagianHomestay k={k} ubah={ubah} />}
          {tab === "kalendermitra" && <BagianKalenderMitra />}
          {tab === "titik" && <BagianTitik k={k} ubah={ubah} />}
          {tab === "beranda" && <BagianBeranda k={k} ubah={ubah} />}
          {tab === "ulasan" && <BagianUlasanFaq k={k} ubah={ubah} />}
          {tab === "kontak" && <BagianKontak k={k} ubah={ubah} />}
          {tab === "akun" && <BagianAkun sesi={sesi} />}

          {tampilBilah && (
            <div className="sticky bottom-3 z-30 mt-8" role="status" aria-live="polite">
              <div className={`flex flex-wrap items-center justify-between gap-3 rounded-[20px] px-5 py-3.5 shadow-lift ${berubah || tanyaBawaan || (simpan && simpan !== "beres") ? "bg-navy text-white" : "border border-line bg-white text-navy"}`}>
                <span className="min-w-0 flex-1 text-[14px] font-bold">
                  {tanyaBawaan && bawaan ? <>Kembalikan ke bawaan? <span className="font-semibold opacity-80">{bawaan.ket}</span></>
                    : simpan === "proses" ? "Menyimpan"
                    : simpan === "beres" ? "Tersimpan dan langsung tayang di situs."
                    : simpan ? simpan
                    : berubah ? `Belum disimpan di ${daftarKata(tabBerubah.map(LABEL_TAB))}.`
                    : "Semua perubahan sudah tersimpan."}
                </span>
                <div className="flex flex-wrap gap-2">
                  {tanyaBawaan ? (
                    <>
                      <button type="button" onClick={() => setTanyaBawaan(false)} className="rounded-pill px-4 py-2 text-[14px] font-bold text-white hover:bg-white/10">Tidak jadi</button>
                      <button type="button" onClick={kembalikanBawaan} className="rounded-pill bg-white px-4 py-2 text-[14px] font-bold text-navy hover:bg-buih">Ya, kembalikan</button>
                    </>
                  ) : (
                    <>
                      {bawaan && simpan !== "proses" && (
                        <button type="button" onClick={() => setTanyaBawaan(true)} className={`rounded-pill px-4 py-2 text-[14px] font-bold ${berubah ? "text-white hover:bg-white/10" : "text-ink2 hover:bg-buih hover:text-navy"}`}>Kembalikan ke bawaan</button>
                      )}
                      {berubah && (
                        <>
                          <button type="button" onClick={() => { setK(structuredClone(asli)); setSimpan(""); }} className="rounded-pill px-4 py-2 text-[14px] font-bold text-white hover:bg-white/10">Batalkan</button>
                          <button type="button" onClick={simpanSemua} disabled={simpan === "proses"} className="btn btn-koral min-h-[42px] px-5 text-[14px]">Simpan perubahan</button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Kotak ringkasan tanda baca di atas halaman (pola DAMPIER, temuanTandaBaca).
 * Hanya mengingatkan, simpanan tidak ditolak. Daftarnya dilipat.
 */
function KotakTanda({ temuan, lain }: { temuan: ReturnType<typeof temuanTandaBaca>; lain: number }) {
  const [buka, setBuka] = useState(false);
  return (
    <div className="mb-6 rounded-[18px] border border-[#F1D9A6] bg-[#FFF4DD] px-5 py-4 text-[14px] text-navy">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">
          {temuan.length} isian di halaman ini memakai titik dua, titik koma, atau tanda pisah.
          <span className="font-semibold text-ink2"> Ganti dengan koma, titik, atau baris baru supaya tulisannya tidak terbaca seperti buatan AI.{lain > 0 ? ` Ada ${lain} lagi di halaman lain.` : ""}</span>
        </p>
        <button type="button" onClick={() => setBuka((b) => !b)} aria-expanded={buka} className="font-bold text-tanda">{buka ? "Tutup daftar" : "Lihat letaknya"}</button>
      </div>
      {buka && (
        <ul className="mt-3 grid gap-1.5 text-[13.5px]">
          {temuan.slice(0, 30).map((x, i) => <li key={i} className="rounded-[10px] bg-white/70 px-3 py-2"><span className="font-bold">{x.letak}</span> <span className="text-ink2">memakai {daftarKata(x.masalah)}</span></li>)}
          {temuan.length > 30 && <li className="px-3 text-ink2">Dan {temuan.length - 30} lagi.</li>}
        </ul>
      )}
    </div>
  );
}
