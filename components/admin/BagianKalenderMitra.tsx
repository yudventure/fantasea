"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

/** Nomor WhatsApp seperti disimpan server, 08xx menjadi 628xx. */
const rapikanWa = (v: string) => v.replace(/[^\d]/g, "").replace(/^0/, "62").slice(0, 16);
import type { BarisPanelMitra } from "@/lib/server/kalender-mitra";
import { tautanWa } from "@/lib/whatsapp";
import { IkonWhatsapp } from "@/components/Ikon";
import { KartuPanel } from "./Kolom";

type Keadaan = "semua" | "aktif" | "belumDibuka" | "belumAda";
const KEADAAN: { nilai: Keadaan; label: string }[] = [
  { nilai: "semua", label: "Semua" }, { nilai: "aktif", label: "Sudah dibuka" }, { nilai: "belumDibuka", label: "Belum dibuka" }, { nilai: "belumAda", label: "Belum ada tautan" },
];
const keadaan = (m: BarisPanelMitra): Exclude<Keadaan, "semua"> => (!m.tautan ? "belumAda" : m.tautan.dibuka ? "aktif" : "belumDibuka");
const waktu = (iso: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jayapura", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

async function minta(method: string, isi?: unknown) {
  const r = await fetch("/api/kalender-mitra/tautan", { method, cache: "no-store", headers: isi ? { "content-type": "application/json" } : undefined, body: isi ? JSON.stringify(isi) : undefined }).catch(() => null);
  if (!r) throw new Error("Server tidak bisa dihubungi.");
  const o = (await r.json().catch(() => ({}))) as { mitra?: BarisPanelMitra[]; galat?: string };
  if (!r.ok || !o.mitra) throw new Error(o.galat ?? "Belum berhasil.");
  return o.mitra;
}

/** Daftar kalender mitra untuk Ringkasan (kartu pintu) dan halaman Kalender mitra. */
export function useKalenderMitra(aktif: boolean) {
  const [mitra, setMitra] = useState<BarisPanelMitra[] | null>(null);
  const [galat, setGalat] = useState("");
  const muat = useCallback(async () => { try { setMitra(await minta("GET")); setGalat(""); } catch (e) { setGalat((e as Error).message); } }, []);
  useEffect(() => { if (aktif) void muat(); }, [aktif, muat]);
  return { mitra, setMitra, galat, setGalat, muat };
}

/**
 * Kalender mitra di panel (pola DAMPIER, KalenderMitraDaftar.tsx). Permintaan
 * pemilik, November 2026: "kalender mitra dan lain lain dibuat sama dulu".
 * Tiap homestay punya kartu dengan keadaan tautannya, data pemilik dan jumlah
 * kamar, tombol buka dan buat tautan, serta kirim, ganti, atau cabut tautan.
 */
export default function BagianKalenderMitra() {
  const { mitra, setMitra, galat, setGalat } = useKalenderMitra(true);
  const [cari, setCari] = useState("");
  const [saring, setSaring] = useState<Keadaan>("semua");

  const tampil = useMemo(() => (mitra ?? []).filter((m) =>
    (saring === "semua" || keadaan(m) === saring) &&
    (!cari.trim() || `${m.nama} ${m.lokasi} ${m.pemilik}`.toLowerCase().includes(cari.trim().toLowerCase()))), [mitra, cari, saring]);

  const jalankan = async (method: string, isi: unknown, konfirmasi?: string) => {
    if (konfirmasi && !window.confirm(konfirmasi)) return;
    try { setMitra(await minta(method, isi)); setGalat(""); } catch (e) { setGalat((e as Error).message); }
  };

  if (!mitra) return <p className="text-[14px] text-ink2">{galat || "Memuat kalender mitra"}</p>;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari homestay, lokasi, atau pemilik" aria-label="Cari" className="kolom max-w-[320px]" />
        <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden pb-1" role="group" aria-label="Saring keadaan">
          {KEADAAN.map((k) => {
            const n = k.nilai === "semua" ? mitra.length : mitra.filter((m) => keadaan(m) === k.nilai).length;
            return (
              <button key={k.nilai} type="button" onClick={() => setSaring(k.nilai)} aria-pressed={saring === k.nilai}
                className={`flex-none rounded-pill px-3.5 py-2 text-[13px] font-bold ${saring === k.nilai ? "bg-navy text-white" : "bg-white text-navy shadow-card hover:bg-buih"}`}>{k.label} ({n})</button>
            );
          })}
        </div>
      </div>
      {galat && <p className="kolom-galat" role="alert">{galat}</p>}
      {mitra.length === 0 && <p className="text-[14px] text-ink2">Belum ada homestay. Tambahkan dulu di menu Homestay.</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {tampil.map((m, i) => (
          <div key={m.homestayId} className={tampil.length % 2 === 1 && i === tampil.length - 1 ? "lg:col-span-2" : ""}>
            <KartuMitra m={m} jalankan={jalankan} />
          </div>
        ))}
      </div>
      {tampil.length === 0 && mitra.length > 0 && <p className="text-[14px] text-ink2">Tidak ada homestay yang cocok.</p>}
    </div>
  );
}

function KartuMitra({ m, jalankan }: { m: BarisPanelMitra; jalankan: (method: string, isi: unknown, konfirmasi?: string) => Promise<void> }) {
  const [pemilik, setPemilik] = useState(m.pemilik);
  const [wa, setWa] = useState(m.wa);
  const [kamar, setKamar] = useState(String(m.kamar));
  const [kotak, setKotak] = useState(false);
  const [salin, setSalin] = useState("");
  // Setelah tersimpan, kolom mengikuti nilai dari server (WhatsApp sudah dirapikan).
  useEffect(() => { setPemilik(m.pemilik); setWa(m.wa); setKamar(String(m.kamar)); }, [m.pemilik, m.wa, m.kamar]);
  const k = keadaan(m);
  const berubah = pemilik.trim() !== m.pemilik || rapikanWa(wa) !== m.wa || Number(kamar) !== m.kamar;
  const asal = typeof window === "undefined" ? "" : location.origin;
  const alamat = m.tautan ? `${asal}/kalender/${m.tautan.token}` : "";
  const ical = m.tautan ? `${asal}/api/kalender-mitra/ics/${m.tautan.ekspor}.ics` : "";
  const pesan = `Halo ${m.pemilik || "Bapak atau Ibu"}, ini tautan kalender ${m.nama} dari Fantasea Dive Travel.\n${alamat}\nDi sini pesanan Fantasea masuk sendiri. Catat juga pesanan dari Booking.com, OTA lain, atau tamu langsung, dan tanggal tutup, supaya kami tidak menawarkan kamar yang sudah terisi. Simpan tautan ini, jangan dibagikan ke orang lain.`;
  const wa62 = m.wa ? tautanWa(m.wa, pesan) : "";
  const salinTeks = (t: string, nama: string) => { void navigator.clipboard?.writeText(t).then(() => { setSalin(nama); setTimeout(() => setSalin(""), 2000); }); };

  return (
    <KartuPanel judul={m.nama} keterangan={[m.lokasi, m.pemilik ? `pemilik ${m.pemilik}` : "", !m.tampil ? "tidak tampil di situs" : "", m.contoh ? "homestay contoh" : ""].filter(Boolean).join(" · ") || undefined}>
      <p className="-mt-2 flex items-start gap-2 text-[13.5px] text-navy">
        <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${k === "aktif" ? "bg-[#2E7D5B]" : k === "belumDibuka" ? "bg-koral" : "bg-line"}`} />
        <span>
          {k === "aktif" ? `Dibuka pemilik ${waktu(m.tautan!.dibuka!)}, ${m.tautan!.kali} kali.` : k === "belumDibuka" ? "Tautan sudah dibuat, belum dibuka pemilik." : "Belum ada tautan kalender."}
          {` ${m.entri} catatan dari mitra.`}{m.diubah ? ` Terakhir diubah ${waktu(m.diubah)}.` : ""}
        </span>
      </p>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px]">
        <div><label htmlFor={`pm-${m.homestayId}`} className="kolom-label">Nama pemilik</label><input id={`pm-${m.homestayId}`} className="kolom" value={pemilik} onChange={(e) => setPemilik(e.target.value)} maxLength={80} /></div>
        <div><label htmlFor={`wa-${m.homestayId}`} className="kolom-label">WhatsApp pemilik</label><input id={`wa-${m.homestayId}`} className="kolom" inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="6281234567890" /></div>
        <div><label htmlFor={`km-${m.homestayId}`} className="kolom-label">Jumlah kamar</label><input id={`km-${m.homestayId}`} className="kolom" inputMode="numeric" value={kamar} onChange={(e) => setKamar(e.target.value.replace(/\D/g, "").slice(0, 2))} /></div>
      </div>
      {berubah && <button type="button" onClick={() => jalankan("PUT", { homestayId: m.homestayId, pemilik, wa, kamar: Number(kamar) })} className="btn btn-navy w-fit">Simpan data mitra</button>}

      <div className="flex flex-wrap gap-2">
        {m.tautan ? (
          <>
            <a href={alamat} target="_blank" rel="noopener noreferrer" className="rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white hover:bg-malam">Buka kalender</a>
            <button type="button" onClick={() => setKotak((b) => !b)} aria-expanded={kotak} className="rounded-pill bg-buih px-4 py-2 text-[13.5px] font-bold text-navy hover:bg-line">Kirim, ganti, atau cabut tautan</button>
          </>
        ) : (
          <button type="button" onClick={() => jalankan("POST", { homestayId: m.homestayId })} className="rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white hover:bg-malam">Buat tautan kalender</button>
        )}
      </div>

      {m.tautan && kotak && (
        <div className="grid gap-3 rounded-in bg-soft p-4">
          <div>
            <label htmlFor={`tt-${m.homestayId}`} className="kolom-label">Tautan kalender pemilik</label>
            <div className="flex gap-2"><input id={`tt-${m.homestayId}`} readOnly value={alamat} onFocus={(e) => e.target.select()} className="kolom text-[13px]" /><button type="button" onClick={() => salinTeks(alamat, "tautan")} className="flex-none rounded-pill bg-white px-4 text-[13px] font-bold text-navy shadow-card">{salin === "tautan" ? "Tersalin" : "Salin"}</button></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {wa62
              ? <a href={wa62} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-[13.5px] font-bold text-navy shadow-card hover:bg-buih"><IkonWhatsapp size={16} />Kirim ke pemilik</a>
              : <span className="rounded-pill bg-white px-4 py-2 text-[13px] text-ink2">Isi WhatsApp pemilik untuk mengirim lewat WhatsApp</span>}
            <button type="button" onClick={() => jalankan("POST", { id: m.tautan!.id, ganti: true }, "Ganti tautan? Tautan lama dan tautan iCal langsung tidak berlaku, catatan mitra tetap.")} className="rounded-pill px-4 py-2 text-[13.5px] font-bold text-navy hover:bg-white">Ganti tautan</button>
            <button type="button" onClick={() => jalankan("DELETE", { id: m.tautan!.id }, "Cabut tautan? Pemilik tidak bisa membuka kalendernya lagi sampai dibuatkan tautan baru. Catatan mitra tetap.")} className="rounded-pill px-4 py-2 text-[13.5px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]">Cabut</button>
          </div>
          <div>
            <label htmlFor={`ic-${m.homestayId}`} className="kolom-label">Tautan iCal untuk Booking.com</label>
            <div className="flex gap-2"><input id={`ic-${m.homestayId}`} readOnly value={ical} onFocus={(e) => e.target.select()} className="kolom text-[13px]" /><button type="button" onClick={() => salinTeks(ical, "ical")} className="flex-none rounded-pill bg-white px-4 text-[13px] font-bold text-navy shadow-card">{salin === "ical" ? "Tersalin" : "Salin"}</button></div>
            <p className="mt-1 text-[12.5px] text-ink2">Ditempel di sinkronisasi kalender OTA. Malam yang penuh di Fantasea ikut tertutup di sana, tanpa data tamu. Tautan ini juga ada di halaman pemilik.</p>
          </div>
        </div>
      )}
    </KartuPanel>
  );
}
