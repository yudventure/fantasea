"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "@/components/DatePicker";
import { IkonPanahKanan, IkonPanahKiri, IkonTambah, IkonTutup } from "@/components/Ikon";
import {
  POLA_PROSES, SUMBER_KALENDER, WARNA_FANTASEA, bolehTandai, cariBentrok, daftarPakai, kamarBebas, malamDi, metaSumber, terpakai, uraianBentrok,
  type DataKalenderMitra, type EntriKalender, type Pakai, type SumberKalender,
} from "@/lib/kalender-mitra";
import { NAMA_HARI, bulanLain, bulanTahun, geser, kisiBulan, rentangTampil, selisihHari, tanggalLengkap, tanggalPendek } from "@/lib/tanggal";

const TEKS_TANGGAL = { pilih: "Pilih tanggal", sebelum: "Bulan sebelumnya", berikut: "Bulan berikutnya", hariIni: "Hari ini", hapus: "Hapus" };
const URUTAN: Pakai["sumber"][] = ["fantasea", "proses", "ota", "langsung", "tutup"];
const warnaPakai = (s: Pakai["sumber"]) => (s === "fantasea" ? WARNA_FANTASEA.warna : s === "proses" ? "" : metaSumber(s).warna);
const latarPakai = (s: Pakai["sumber"]) => (s === "proses" ? { backgroundImage: POLA_PROSES } : { background: warnaPakai(s) });
const LABEL_PAKAI: Record<Pakai["sumber"], string> = { fantasea: "Pesanan Fantasea", proses: "Fantasea, sedang diproses", ota: "OTA", langsung: "Tamu langsung", tutup: "Tutup" };
const idKirim = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, "0")).join("");

interface Draf { id?: string; sumber: SumberKalender | ""; mulai: string; selesai: string; nomor: number[]; kamar: number; nama: string; tamu: string; catatan: string; pilihSendiri: boolean }

/**
 * Halaman kalender mitra homestay (pola DAMPIER, components/mitra/KalenderMitra.tsx).
 * Pemilik homestay melihat pesanan Fantasea (yang belum dikonfirmasi bergaris),
 * mencatat pesanan dari OTA dan tamu langsung, menutup tanggal, dan menandai
 * tamu yang sudah datang atau pulang. Satu kisi bulanan untuk seluruh homestay.
 */
export default function KalenderMitra({ token, awal }: { token: string; awal: DataKalenderMitra | null }) {
  const [data, setData] = useState(awal);
  const [bulan, setBulan] = useState(() => `${(awal?.hariIni ?? new Date().toISOString()).slice(0, 7)}-01`);
  const [pilih, setPilih] = useState<string | null>(null);
  const [draf, setDraf] = useState<Draf | null>(null);
  const [galat, setGalat] = useState("");
  const [pesan, setPesan] = useState("");
  const [proses, setProses] = useState(false);
  const refHari = useRef<HTMLDivElement>(null);
  const refLembar = useRef<HTMLDivElement>(null);

  const kirim = useCallback(async (isi: Record<string, unknown>) => {
    setProses(true); setGalat("");
    const r = await fetch("/api/kalender-mitra", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, ...isi }) }).catch(() => null);
    setProses(false);
    if (!r) { setGalat("Sinyal terputus. Coba lagi saat sinyal kembali."); return false; }
    const o = (await r.json().catch(() => ({}))) as { data?: DataKalenderMitra; galat?: string };
    if (!r.ok || !o.data) { setGalat(o.galat ?? "Belum tersimpan. Coba lagi."); if (r.status === 404 && o.galat?.startsWith("Tautan")) setData(null); return false; }
    setData(o.data);
    return true;
  }, [token]);

  // Baca ulang tiap menit selama halaman terlihat dan tidak sedang mengisi.
  useEffect(() => {
    if (draf || !data) return;
    const baca = () => { if (document.visibilityState === "visible") void kirim({ aksi: "baca" }); };
    const t = setInterval(baca, 60_000);
    document.addEventListener("visibilitychange", baca);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", baca); };
  }, [draf, data, kirim]);

  const pakai = useMemo(() => (data ? daftarPakai(data.entri, data.fantasea) : []), [data]);
  const kisi = useMemo(() => kisiBulan(bulan), [bulan]);

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-soft px-4">
        <div className="w-full max-w-[420px] rounded-card bg-white p-7 text-center shadow-lift">
          <Image src="/brand/logo/fantasea-logo-utama.png" alt="Fantasea Dive Travel" width={1617} height={1004} unoptimized className="mx-auto h-auto w-[150px]" />
          <h1 className="mt-6 text-[30px]">Tautan tidak berlaku</h1>
          <p className="mt-2 text-[14.5px] text-ink2">Tautan kalender ini sudah diganti atau dicabut. Minta tautan baru ke tim Fantasea lewat WhatsApp.</p>
        </div>
      </main>
    );
  }

  const { kamar, hariIni } = data;
  const nama = (k: string) => pakai.find((p) => p.kunci === k)?.label ?? k;
  const bentrok = cariBentrok(pakai, kamar, hariIni, geser(hariIni, 365));
  const prosesF = data.fantasea.filter((f) => !f.pasti && f.selesai > hariIni);
  const malamIni = terpakai(pakai, hariIni).total;
  const datang7 = pakai.filter((p) => p.sumber !== "tutup" && p.sumber !== "proses" && p.mulai >= hariIni && p.mulai <= geser(hariIni, 6)).length;
  const hariBulan = kisi.filter((x) => x.bulanIni).map((x) => x.iso);
  const isiBulan = hariBulan.reduce((n, iso) => n + Math.min(kamar, terpakai(pakai.filter((p) => p.sumber !== "tutup"), iso).total), 0);
  const persen = Math.round((isiBulan / (kamar * hariBulan.length)) * 100);
  const akanDatang = pakai.filter((p) => p.sumber !== "tutup" && p.selesai >= geser(hariIni, -1)).sort((a, b) => a.mulai.localeCompare(b.mulai)).slice(0, 12);

  const pilihHari = (iso: string | null) => {
    setPilih(iso); setPesan("");
    if (iso) requestAnimationFrame(() => refHari.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };
  const bukaLembar = (d: Draf) => {
    setDraf(d); setGalat(""); setPesan("");
    requestAnimationFrame(() => refLembar.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const lembarBaru = (sumber: SumberKalender | "" = "", mulai = hariIni >= bulan ? hariIni : bulan) => {
    const selesai = geser(mulai, 1);
    const bebas = kamarBebas(pakai, kamar, mulai, selesai);
    bukaLembar({ sumber, mulai, selesai, kamar: 1, nomor: kamar > 1 ? (sumber === "tutup" ? Array.from({ length: kamar }, (_, i) => i + 1) : [bebas[0] ?? 1]) : [], nama: "", tamu: "", catatan: "", pilihSendiri: false });
  };
  const ubahEntri = (e: EntriKalender) => bukaLembar({ id: e.id, sumber: e.sumber, mulai: e.mulai, selesai: e.selesai, kamar: e.kamar, nomor: e.nomorKamar ?? [], nama: e.nama ?? "", tamu: e.tamu ? String(e.tamu) : "", catatan: e.catatan ?? "", pilihSendiri: true });

  async function simpan() {
    if (!draf) return;
    if (!draf.sumber) { setGalat("Pilih asal pesanan."); return; }
    if (draf.selesai <= draf.mulai) { setGalat("Tanggal pulang harus sesudah tanggal datang."); return; }
    if (kamar > 1 && draf.nomor.length === 0) { setGalat("Pilih kamarnya."); return; }
    if (draf.sumber !== "tutup" && !(Number(draf.tamu) >= 1)) { setGalat("Isi jumlah tamu."); return; }
    const entri = { sumber: draf.sumber, mulai: draf.mulai, selesai: draf.selesai, kamar: kamar > 1 ? draf.nomor.length : draf.kamar, nomorKamar: kamar > 1 ? draf.nomor : undefined, nama: draf.nama, tamu: Number(draf.tamu), catatan: draf.catatan };
    const ok = await kirim(draf.id ? { aksi: "ubah", id: draf.id, entri } : { aksi: "tambah", entri, idKirim: idKirim() });
    if (ok) { setDraf(null); setPesan(draf.id ? "Catatan diperbarui." : "Catatan tersimpan."); setPilih(draf.mulai); setBulan(`${draf.mulai.slice(0, 7)}-01`); }
  }
  async function hapus() {
    if (!draf?.id || !window.confirm("Hapus catatan ini?")) return;
    if (await kirim({ aksi: "hapus", id: draf.id })) { setDraf(null); setPesan("Catatan dihapus."); }
  }
  const tandai = (kunci: string, jenis: "masuk" | "keluar", nilai: boolean) => kirim({ aksi: "hadir", kunci, jenis, nilai });

  // Saat tanggal berubah, kamar ikut dipilihkan yang kosong sampai pemilik memilih sendiri.
  const aturDraf = (ubah: Partial<Draf>) => setDraf((d) => {
    if (!d) return d;
    const n = { ...d, ...ubah };
    if (kamar > 1 && !n.pilihSendiri && (ubah.mulai || ubah.selesai || ubah.sumber)) {
      const bebas = kamarBebas(pakai, kamar, n.mulai, n.selesai, n.id ? `e:${n.id}` : undefined);
      n.nomor = n.sumber === "tutup" ? Array.from({ length: kamar }, (_, i) => i + 1) : [bebas[0] ?? 1];
    }
    if (ubah.mulai && n.selesai <= n.mulai) n.selesai = geser(n.mulai, 1);
    return n;
  });

  const pratinjauBentrok = draf && draf.sumber && draf.selesai > draf.mulai
    ? cariBentrok([...pakai.filter((p) => p.kunci !== `e:${draf.id}`), { kunci: "baru", sumber: draf.sumber, label: "catatan ini", mulai: draf.mulai, selesai: draf.selesai, kamar: kamar > 1 ? draf.nomor.length : draf.kamar, nomor: kamar > 1 ? draf.nomor : undefined }], kamar, draf.mulai, draf.selesai)
    : [];
  const isiHari = pilih ? pakai.filter((p) => malamDi(p, pilih) || p.selesai === pilih) : [];

  return (
    <main className="min-h-screen bg-soft pb-16">
      <header className="relative overflow-hidden bg-navy text-white">
        <Image src="/brand/grafis/ukir-sayap-putih.svg" alt="" aria-hidden width={993} height={835} unoptimized className="pointer-events-none absolute -right-24 -top-10 w-[460px] max-w-none opacity-[0.08]" />
        <div className="relative mx-auto max-w-[1100px] px-4 pb-6 pt-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo/fantasea-manta.png" alt="" width={993} height={835} unoptimized className="h-8 w-auto brightness-0 invert" />
            <span className="font-display text-[20px]">Fantasea</span>
            <span className="font-aksen text-[13px] uppercase tracking-[0.2em] text-ukir">Kalender mitra</span>
          </div>
          <h1 className="mt-4 text-[clamp(30px,6vw,46px)] leading-tight text-white">{data.homestay.nama}</h1>
          {data.homestay.lokasi && <p className="text-[14px] text-kabut">{data.homestay.lokasi} · {kamar} kamar</p>}
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { label: "Malam ini", nilai: `${Math.min(malamIni, kamar)}/${kamar}`, ket: malamIni >= kamar ? "penuh" : "kamar terisi" },
              { label: "7 hari ke depan", nilai: String(datang7), ket: "tamu datang" },
              { label: `Keterisian ${bulanTahun(bulan).split(" ")[0]}`, nilai: `${persen}%`, ket: "dari semua kamar" },
            ].map((x) => (
              <div key={x.label} className="rounded-[16px] bg-white/10 px-3 py-3 sm:px-4">
                <p className="text-[11.5px] font-bold text-kabut sm:text-[12.5px]">{x.label}</p>
                <p className="mt-0.5 font-display text-[26px] leading-tight tabular-nums sm:text-[32px]">{x.nilai}</p>
                <p className="text-[11px] text-kabut sm:text-[12px]">{x.ket}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] gap-4 px-4 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="grid min-w-0 gap-4">
          <details className="rounded-card border border-line bg-white px-5 py-4 text-[14px] text-navy shadow-card">
            <summary className="cursor-pointer font-extrabold">Cara kalender ini bekerja</summary>
            <ul className="mt-2 grid gap-1.5 text-ink2">
              <li>Pesanan Fantasea masuk sendiri. Yang belum pasti tampil bergaris, artinya ada tamu yang sedang menanyakan tanggal itu ke tim Fantasea.</li>
              <li>Catat pesanan dari Booking.com, OTA lain, atau tamu langsung, supaya tim Fantasea tidak menawarkan kamar yang sudah terisi.</li>
              <li>Pakai Tutup untuk tanggal kamar tidak bisa dipesan.</li>
              <li>Tandai tamu yang sudah datang dan pulang di daftar tamu.</li>
            </ul>
          </details>

          {bentrok.length > 0 && (
            <div className="rounded-card border border-[#E7B8AA] bg-[#FDF1ED] px-5 py-4 text-[14px] text-[#7A2614]" role="alert">
              <p className="font-extrabold">Ada potensi double booking</p>
              <ul className="mt-1.5 grid gap-1">{bentrok.slice(0, 5).map((b) => <li key={`${b.jenis}${b.nomor}${b.mulai}`}>{rentangTampil(b.mulai, geser(b.selesai, -1))}. {uraianBentrok(b, kamar, nama)}</li>)}</ul>
            </div>
          )}
          {prosesF.length > 0 && (
            <div className="rounded-card border border-line bg-white px-5 py-4 text-[14px] text-navy shadow-card">
              <p className="flex items-center gap-2 font-extrabold"><span aria-hidden className="h-3 w-5 rounded-[4px]" style={{ backgroundImage: POLA_PROSES }} />{prosesF.length} permintaan Fantasea sedang diproses</p>
              <p className="mt-1 text-ink2">{prosesF.map((f) => `${rentangTampil(f.mulai, f.selesai)}, ${f.orang} orang`).join(" · ")}. Tim Fantasea akan mengabari kalau tamunya jadi menginap.</p>
            </div>
          )}

          <section className="rounded-card border border-line bg-white p-3 shadow-card sm:p-4" aria-label="Kalender bulanan">
            <div className="mb-3 flex items-center gap-1.5">
              <button type="button" onClick={() => { setBulan(bulanLain(bulan, -1)); setPilih(null); }} aria-label="Bulan sebelumnya" className="grid h-10 w-10 place-items-center rounded-full border border-line text-navy hover:bg-buih"><IkonPanahKiri size={18} /></button>
              <button type="button" onClick={() => { setBulan(bulanLain(bulan, 1)); setPilih(null); }} aria-label="Bulan berikutnya" className="grid h-10 w-10 place-items-center rounded-full border border-line text-navy hover:bg-buih"><IkonPanahKanan size={18} /></button>
              <h2 className="ml-1.5 font-body text-[19px] font-extrabold capitalize tracking-normal text-navy">{bulanTahun(bulan)}</h2>
              {bulan.slice(0, 7) !== hariIni.slice(0, 7) && <button type="button" onClick={() => { setBulan(`${hariIni.slice(0, 7)}-01`); setPilih(null); }} className="ml-auto rounded-pill bg-buih px-3 py-1.5 text-[13px] font-bold text-navy">Hari ini</button>}
            </div>
            <div className="grid grid-cols-7">
              {NAMA_HARI.map((h) => <div key={h} className="py-1.5 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink2">{h}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {kisi.map(({ iso, bulanIni: di }) => {
                const t = terpakai(pakai, iso);
                const penuh = t.total >= kamar, lebih = t.total > kamar || bentrok.some((b) => b.mulai <= iso && iso < b.selesai);
                const on = pilih === iso;
                return (
                  <button key={iso} type="button" onClick={() => pilihHari(on ? null : iso)} aria-pressed={on}
                    aria-label={`${tanggalLengkap(iso)}, ${t.total ? `${Math.min(t.total, kamar)} dari ${kamar} kamar terisi` : "kosong"}${lebih ? ", ada bentrok" : ""}`}
                    className={`flex min-h-[60px] flex-col items-stretch rounded-[10px] p-1 text-left transition sm:min-h-[76px] sm:p-1.5 ${on ? "bg-navy text-white" : !di ? "bg-soft text-ink2/60" : lebih ? "bg-[#FBE4DD] ring-1 ring-[#E7B8AA]" : penuh ? "bg-kabut/50" : "bg-soft hover:bg-buih"} ${iso === hariIni && !on ? "ring-2 ring-ukir" : ""}`}>
                    <span className="text-[13px] font-extrabold tabular-nums">{Number(iso.slice(8))}</span>
                    <span className={`hidden text-[10.5px] font-bold sm:block ${on ? "text-kabut" : "text-ink2"}`}>{lebih ? "Bentrok" : penuh ? "Penuh" : t.total ? `${t.total}/${kamar}` : ""}</span>
                    {t.total > 0 && (
                      <span className="mt-auto flex h-[6px] w-full gap-[2px] overflow-hidden rounded-pill bg-white">
                        {URUTAN.filter((s) => t.per[s]).map((s) => <span key={s} style={{ width: `${(100 * t.per[s]!) / Math.max(kamar, t.total)}%`, ...latarPakai(s) }} />)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Warna di kalender">
              {URUTAN.map((s) => <li key={s} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink2"><span aria-hidden className="h-2.5 w-4 rounded-[3px]" style={latarPakai(s)} />{LABEL_PAKAI[s]}</li>)}
            </ul>
          </section>

          {pilih && (
            <div ref={refHari} className="scroll-mt-4 rounded-card border border-line bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-body text-[18px] font-extrabold capitalize tracking-normal text-navy">{tanggalLengkap(pilih)}</h3>
                  <p className="text-[13px] text-ink2">{Math.min(terpakai(pakai, pilih).total, kamar)} dari {kamar} kamar terisi malam ini</p>
                </div>
                <button type="button" onClick={() => setPilih(null)} aria-label="Tutup" className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line text-navy hover:bg-buih"><IkonTutup size={16} /></button>
              </div>
              <div className="mt-3 grid gap-2">
                {isiHari.length === 0 && <p className="text-[14px] text-ink2">Belum ada pesanan malam ini.</p>}
                {isiHari.map((p) => <KartuPakai key={p.kunci} p={p} data={data} hari={pilih} onUbah={ubahEntri} onTandai={tandai} />)}
              </div>
              <button type="button" onClick={() => lembarBaru("", pilih)} className="btn btn-terang mt-4 w-full"><IkonTambah size={18} />Catat pesanan mulai tanggal ini</button>
            </div>
          )}

          {draf && (
            <div ref={refLembar} className="scroll-mt-4 rounded-card border-2 border-tanda/30 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-body text-[19px] font-extrabold tracking-normal text-navy">{draf.id ? "Ubah catatan" : draf.sumber === "tutup" ? "Tutup tanggal" : "Catat pesanan"}</h3>
                <button type="button" onClick={() => setDraf(null)} aria-label="Batal" className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line text-navy hover:bg-buih"><IkonTutup size={16} /></button>
              </div>
              <div className="mt-4 grid gap-4">
                <div>
                  <p className="kolom-label">Asal pesanan</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {SUMBER_KALENDER.map((s) => (
                      <button key={s.value} type="button" onClick={() => aturDraf({ sumber: s.value })} aria-pressed={draf.sumber === s.value}
                        className={`flex items-center gap-2 rounded-in border px-3 py-2.5 text-left text-[14px] font-bold ${draf.sumber === s.value ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:bg-buih"}`}>
                        <span aria-hidden className="h-3 w-3 flex-none rounded-full ring-1 ring-white/60" style={{ background: s.warna }} />{s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DatePicker label="Tanggal datang" value={draf.mulai} onChange={(v) => aturDraf({ mulai: v })} min={geser(hariIni, -365)} locale="id" teks={TEKS_TANGGAL} />
                  <DatePicker label="Tanggal pulang" value={draf.selesai} onChange={(v) => aturDraf({ selesai: v })} min={geser(draf.mulai, 1)} locale="id" teks={TEKS_TANGGAL} />
                </div>
                <p className="-mt-2 text-[13px] text-ink2">{selisihHari(draf.mulai, draf.selesai)} malam</p>
                {kamar > 1 && (
                  <div>
                    <p className="kolom-label">Kamar</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {Array.from({ length: kamar }, (_, i) => i + 1).map((n) => {
                        const kosong = kamarBebas(pakai, kamar, draf.mulai, draf.selesai, draf.id ? `e:${draf.id}` : undefined).includes(n);
                        const on = draf.nomor.includes(n);
                        return (
                          <button key={n} type="button" aria-pressed={on} onClick={() => aturDraf({ pilihSendiri: true, nomor: on ? draf.nomor.filter((x) => x !== n) : [...draf.nomor, n].sort((a, b) => a - b) })}
                            className={`rounded-in border px-2 py-2 text-left ${on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:bg-buih"}`}>
                            <span className="block text-[14px] font-extrabold">Kamar {n}</span>
                            <span className={`block text-[11.5px] ${on ? "text-kabut" : kosong ? "text-[#2E7D5B]" : "text-[#A63A22]"}`}>{kosong ? "Kosong" : "Terisi"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {draf.sumber !== "tutup" && (
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
                    <div><label htmlFor="km-nama" className="kolom-label">Nama tamu</label><input id="km-nama" className="kolom" value={draf.nama} onChange={(e) => aturDraf({ nama: e.target.value })} maxLength={80} /></div>
                    <div><label htmlFor="km-tamu" className="kolom-label">Jumlah tamu</label><input id="km-tamu" className="kolom" inputMode="numeric" value={draf.tamu} onChange={(e) => aturDraf({ tamu: e.target.value.replace(/\D/g, "").slice(0, 2) })} /></div>
                  </div>
                )}
                <div><label htmlFor="km-catatan" className="kolom-label">Catatan</label><input id="km-catatan" className="kolom" value={draf.catatan} onChange={(e) => aturDraf({ catatan: e.target.value })} maxLength={200} placeholder={draf.sumber === "tutup" ? "Misalnya renovasi" : "Misalnya nomor pesanan OTA"} /></div>
                {pratinjauBentrok.length > 0 && <p className="rounded-in bg-[#FDF1ED] px-4 py-3 text-[13.5px] text-[#7A2614]">Catatan ini membuat potensi double booking. {uraianBentrok(pratinjauBentrok[0], kamar, (k) => (k === "baru" ? "catatan ini" : nama(k)))}</p>}
                {galat && <p className="kolom-galat" role="alert">{galat}</p>}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={simpan} disabled={proses} className="btn btn-navy">{proses ? "Menyimpan" : "Simpan"}</button>
                  <button type="button" onClick={() => setDraf(null)} className="btn btn-terang">Batal</button>
                  {draf.id && <button type="button" onClick={hapus} disabled={proses} className="ml-auto rounded-pill px-4 py-2 text-[14px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]">Hapus catatan</button>}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-4">
          <div className="grid gap-2 rounded-card border border-line bg-white p-4 shadow-card">
            <button type="button" onClick={() => lembarBaru()} className="btn btn-navy w-full"><IkonTambah size={18} />Catat pesanan</button>
            <button type="button" onClick={() => lembarBaru("tutup")} className="btn btn-terang w-full">Tutup tanggal</button>
            {pesan && <p className="text-center text-[13.5px] font-bold text-[#2E7D5B]" role="status">{pesan}</p>}
            {galat && !draf && <p className="kolom-galat" role="alert">{galat}</p>}
          </div>

          <div className="rounded-card border border-line bg-white p-4 shadow-card">
            <h2 className="font-body text-[17px] font-extrabold tracking-normal text-navy">Tamu yang akan datang</h2>
            {akanDatang.length === 0 ? <p className="mt-2 text-[14px] text-ink2">Belum ada tamu yang akan datang.</p> : (
              <ul className="mt-3 grid gap-2">{akanDatang.map((p) => <li key={p.kunci}><KartuPakai p={p} data={data} hari={hariIni} onUbah={ubahEntri} onTandai={tandai} ringkas /></li>)}</ul>
            )}
          </div>

          {data.ical && <TautanIcal jalur={data.ical} />}
        </aside>
      </div>
    </main>
  );
}

function KartuPakai({ p, data, hari, onUbah, onTandai, ringkas = false }: {
  p: Pakai; data: DataKalenderMitra; hari: string; onUbah: (e: EntriKalender) => void; onTandai: (k: string, j: "masuk" | "keluar", n: boolean) => void; ringkas?: boolean;
}) {
  const entri = p.kunci.startsWith("e:") ? data.entri.find((e) => `e:${e.id}` === p.kunci) : undefined;
  const f = p.kunci.startsWith("f:") ? data.fantasea.find((x) => x.kunci === p.kunci) : undefined;
  const h = data.hadir[p.kunci] ?? {};
  const saat = p.mulai === hari ? "Datang hari ini" : p.selesai === hari ? "Pulang hari ini" : null;
  const tandaBoleh = p.sumber !== "tutup" && p.sumber !== "proses" && bolehTandai(p, data.hariIni);
  const jam = (iso: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jayapura", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  return (
    <div className="rounded-in border border-line bg-white px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-extrabold text-navy">{p.sumber === "tutup" ? "Tanggal tutup" : p.label}</span>
          <span className="block text-[12.5px] text-ink2">{tanggalPendek(p.mulai)} sampai {tanggalPendek(p.selesai)}, {selisihHari(p.mulai, p.selesai)} malam{p.tamu ? ` · ${p.tamu} tamu` : ""}{p.nomor?.length ? ` · kamar ${p.nomor.join(", ")}` : p.kamar > 1 ? ` · ${p.kamar} kamar` : ""}</span>
        </span>
        {p.sumber === "proses" ? (
          <span className="flex flex-none items-center gap-1.5 rounded-pill bg-white px-2 py-0.5 text-[11px] font-extrabold text-navy ring-1 ring-kabut"><span aria-hidden className="h-2.5 w-3.5 rounded-[3px]" style={{ backgroundImage: POLA_PROSES }} />Diproses</span>
        ) : (
          <span className="flex-none rounded-pill px-2 py-0.5 text-[11px] font-extrabold" style={{ background: warnaPakai(p.sumber), color: p.sumber === "fantasea" ? WARNA_FANTASEA.teks : metaSumber(p.sumber).teks }}>
            {p.sumber === "fantasea" ? "Fantasea" : metaSumber(p.sumber).pendek}
          </span>
        )}
      </div>
      {(saat || f || entri?.catatan) && <p className="mt-1 text-[12.5px] text-ink2">{[saat, f ? `Otomatis dari Fantasea, kode ${f.kode}` : "", entri?.catatan].filter(Boolean).join(" · ")}</p>}
      {(h.masuk || h.keluar) && <p className="mt-1 text-[12.5px] font-bold text-[#2E7D5B]">{h.keluar ? `Sudah pulang ${jam(h.keluar)}` : `Sudah datang ${jam(h.masuk!)}`}</p>}
      {(entri || tandaBoleh) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tandaBoleh && !h.masuk && <button type="button" onClick={() => onTandai(p.kunci, "masuk", true)} className="rounded-pill bg-buih px-3 py-1.5 text-[12.5px] font-bold text-navy hover:bg-line">Tandai sudah datang</button>}
          {tandaBoleh && h.masuk && !h.keluar && <button type="button" onClick={() => onTandai(p.kunci, "keluar", true)} className="rounded-pill bg-buih px-3 py-1.5 text-[12.5px] font-bold text-navy hover:bg-line">Tandai sudah pulang</button>}
          {tandaBoleh && h.masuk && <button type="button" onClick={() => onTandai(p.kunci, h.keluar ? "keluar" : "masuk", false)} className="rounded-pill px-3 py-1.5 text-[12.5px] font-bold text-ink2 hover:bg-buih">Batalkan tanda</button>}
          {entri && <button type="button" onClick={() => onUbah(entri)} className="rounded-pill bg-buih px-3 py-1.5 text-[12.5px] font-bold text-navy hover:bg-line">Ubah</button>}
        </div>
      )}
    </div>
  );
}

/** Tautan iCal untuk ditempel di Booking.com atau OTA lain (pola DAMPIER, ekspor iCal). */
function TautanIcal({ jalur }: { jalur: string }) {
  const [salin, setSalin] = useState(false);
  const alamat = typeof window === "undefined" ? jalur : `${location.origin}${jalur}`;
  return (
    <details className="rounded-card border border-line bg-white p-4 text-[13.5px] text-navy shadow-card">
      <summary className="cursor-pointer font-extrabold">Sambungkan ke Booking.com</summary>
      <p className="mt-2 text-ink2">Tempel tautan ini di Booking.com atau OTA lain, di bagian sinkronisasi kalender atau impor iCal. Malam yang sudah penuh di sini ikut tertutup di sana. Tidak ada nama atau kontak tamu di dalamnya.</p>
      <input readOnly value={alamat} className="kolom mt-2 text-[12.5px]" onFocus={(e) => e.target.select()} aria-label="Tautan iCal" />
      <button type="button" onClick={() => { void navigator.clipboard?.writeText(alamat).then(() => { setSalin(true); setTimeout(() => setSalin(false), 2000); }); }} className="btn btn-terang mt-2 w-full">{salin ? "Tersalin" : "Salin tautan"}</button>
    </details>
  );
}
