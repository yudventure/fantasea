"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Konten } from "@/lib/konten";
import type { Permintaan } from "@/lib/server/permintaan";
import { IkonKeluar } from "@/components/Ikon";
import Gerbang from "./Gerbang";
import { BagianPermintaan, BagianRingkasan } from "./BagianPermintaan";
import { BagianJadwal, BagianTitik, BagianTrip } from "./BagianTrip";
import { BagianBeranda, BagianKontak, BagianUlasanFaq } from "./BagianIsi";
import BagianAkun from "./BagianAkun";

export interface Sesi { email: string; nama: string; peran: "pemilik" | "tim" }
export type Ubah = (f: (d: Konten) => void) => void;

const TAB = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "permintaan", label: "Permintaan" },
  { id: "trip", label: "Trip dan harga" },
  { id: "jadwal", label: "Jadwal open trip" },
  { id: "titik", label: "Titik selam" },
  { id: "beranda", label: "Beranda" },
  { id: "ulasan", label: "Ulasan dan FAQ" },
  { id: "kontak", label: "Kontak dan SEO" },
  { id: "akun", label: "Akun" },
] as const;
type IdTab = (typeof TAB)[number]["id"];

/**
 * Panel pengelola Fantasea (bahasa Indonesia). Semua isi situs dimuat sekali,
 * diubah di peramban, lalu disimpan sekaligus lewat bilah Simpan di bawah.
 * Permintaan tamu punya simpanan sendiri per baris.
 */
export default function Panel() {
  const [tahap, setTahap] = useState<"muat" | "masuk" | "siapkan" | "siap">("muat");
  const [sesi, setSesi] = useState<Sesi | null>(null);
  const [kunciPerlu, setKunciPerlu] = useState(true);
  const [k, setK] = useState<Konten | null>(null);
  const [asli, setAsli] = useState("");
  const [permintaan, setPermintaan] = useState<Permintaan[]>([]);
  const [tab, setTab] = useState<IdTab>("ringkasan");
  const [simpan, setSimpan] = useState<"" | "proses" | "beres" | string>("");

  const muat = useCallback(async () => {
    const [rk, rp] = await Promise.all([fetch("/api/konten", { cache: "no-store" }), fetch("/api/permintaan", { cache: "no-store" })]);
    if (rk.status === 401) { setTahap("masuk"); return; }
    const ok = (await rk.json()) as { konten: Konten };
    setK(ok.konten); setAsli(JSON.stringify(ok.konten));
    if (rp.ok) setPermintaan(((await rp.json()) as { daftar: Permintaan[] }).daftar);
    setTahap("siap");
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/sesi", { cache: "no-store" }).catch(() => null);
      const s = r?.ok ? ((await r.json().catch(() => ({}))) as { sesi?: Sesi | null }).sesi : null;
      if (s) { setSesi(s); await muat(); return; }
      const p = (await fetch("/api/penyiapan", { cache: "no-store" }).then((x) => x.json()).catch(() => ({ perlu: false, kunciAda: true }))) as { perlu: boolean; kunciAda: boolean };
      setKunciPerlu(p.kunciAda);
      setTahap(p.perlu ? "siapkan" : "masuk");
    })();
  }, [muat]);

  useEffect(() => {
    const dariHash = () => { const h = location.hash.slice(1) as IdTab; if (TAB.some((t) => t.id === h)) setTab(h); };
    dariHash();
    window.addEventListener("hashchange", dariHash);
    return () => window.removeEventListener("hashchange", dariHash);
  }, []);

  const ubah: Ubah = useCallback((f) => setK((lama) => { if (!lama) return lama; const d = structuredClone(lama); f(d); return d; }), []);
  const berubah = useMemo(() => !!k && JSON.stringify(k) !== asli, [k, asli]);

  useEffect(() => {
    if (!berubah) return;
    const cegah = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", cegah);
    return () => window.removeEventListener("beforeunload", cegah);
  }, [berubah]);

  async function simpanSemua() {
    if (!k) return;
    setSimpan("proses");
    const r = await fetch("/api/konten", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ konten: k }) }).catch(() => null);
    if (!r) { setSimpan("Server tidak bisa dihubungi. Coba lagi."); return; }
    const o = (await r.json().catch(() => ({}))) as { konten?: Konten; galat?: string };
    if (!r.ok || !o.konten) { setSimpan(o.galat ?? "Belum tersimpan. Coba lagi."); return; }
    setK(o.konten); setAsli(JSON.stringify(o.konten));
    setSimpan("beres");
    setTimeout(() => setSimpan(""), 3000);
  }

  async function keluar() {
    await fetch("/api/keluar", { method: "POST" }).catch(() => null);
    location.reload();
  }

  if (tahap === "muat") return <div className="grid min-h-screen place-items-center text-[15px] font-bold text-ink2">Memuat panel</div>;
  if (tahap === "masuk" || tahap === "siapkan") {
    return <Gerbang mode={tahap} kunciPerlu={kunciPerlu} onMasuk={(s) => { setSesi(s); setTahap("muat"); muat(); }} />;
  }
  if (!k || !sesi) return null;

  const baru = permintaan.filter((p) => p.status === "baru").length;
  const pindah = (id: IdTab) => { setTab(id); history.replaceState(null, "", `#${id}`); window.scrollTo({ top: 0 }); };

  return (
    <div className="panel-admin min-h-screen bg-soft pb-28">
      <header className="sticky top-0 z-30 bg-white/95 shadow-[0_6px_24px_-14px_rgba(19,31,51,.3)] backdrop-blur">
        <div className="wrap-panel flex h-16 items-center gap-3">
          <Image src="/brand/logo/fantasea-manta.png" alt="" width={993} height={835} unoptimized className="h-9 w-auto" />
          <span className="font-display text-[22px] text-navy">Panel Fantasea</span>
          <a href="/en" target="_blank" rel="noopener" className="ml-auto hidden rounded-pill bg-buih px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-line sm:inline-flex">Lihat situs</a>
          <span className="hidden text-[13px] text-ink2 md:inline">{sesi.nama}</span>
          <button type="button" onClick={keluar} className="ml-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-[13px] font-bold text-navy hover:bg-buih sm:ml-0"><IkonKeluar size={17} />Keluar</button>
        </div>
      </header>

      <div className="wrap-panel mt-6 grid gap-6 xl:grid-cols-[230px_minmax(0,1fr)]">
        <nav aria-label="Menu panel" className="xl:sticky xl:top-24 xl:self-start">
          <ul className="flex gap-1.5 overflow-x-auto overflow-y-hidden pb-1 xl:flex-col xl:overflow-visible">
            {TAB.map((t) => (
              <li key={t.id} className="flex-none">
                <button type="button" onClick={() => pindah(t.id)} aria-current={tab === t.id ? "page" : undefined}
                  className={`flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-in px-4 py-2.5 text-left text-[14px] font-bold transition ${tab === t.id ? "bg-navy text-white" : "bg-white text-navy hover:bg-buih xl:bg-transparent"}`}>
                  {t.label}
                  {t.id === "permintaan" && baru > 0 && <span className={`rounded-pill px-2 py-0.5 text-[12px] ${tab === t.id ? "bg-white text-navy" : "bg-koral text-navy"}`}>{baru}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0">
          {tab === "ringkasan" && <BagianRingkasan k={k} permintaan={permintaan} pindah={pindah} />}
          {tab === "permintaan" && <BagianPermintaan permintaan={permintaan} setPermintaan={setPermintaan} sesi={sesi} k={k} />}
          {tab === "trip" && <BagianTrip k={k} ubah={ubah} />}
          {tab === "jadwal" && <BagianJadwal k={k} ubah={ubah} />}
          {tab === "titik" && <BagianTitik k={k} ubah={ubah} />}
          {tab === "beranda" && <BagianBeranda k={k} ubah={ubah} />}
          {tab === "ulasan" && <BagianUlasanFaq k={k} ubah={ubah} />}
          {tab === "kontak" && <BagianKontak k={k} ubah={ubah} />}
          {tab === "akun" && <BagianAkun sesi={sesi} />}
        </main>
      </div>

      {(berubah || simpan) && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3" role="status">
          <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 rounded-[20px] bg-navy px-5 py-3.5 text-white shadow-lift">
            <span className="text-[14px] font-bold">
              {simpan === "proses" ? "Menyimpan" : simpan === "beres" ? "Tersimpan dan langsung tayang di situs." : simpan ? simpan : "Ada perubahan yang belum disimpan."}
            </span>
            {berubah && (
              <div className="flex gap-2">
                <button type="button" onClick={() => { setK(JSON.parse(asli)); setSimpan(""); }} className="rounded-pill px-4 py-2 text-[14px] font-bold text-white hover:bg-white/10">Batalkan</button>
                <button type="button" onClick={simpanSemua} disabled={simpan === "proses"} className="btn btn-koral min-h-[42px] px-5 text-[14px]">Simpan perubahan</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
