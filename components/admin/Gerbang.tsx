"use client";
import Image from "next/image";
import { useState } from "react";
import type { Sesi } from "./Panel";

type Langkah = "masuk" | "lupa" | "kode" | "kunci";

/**
 * Halaman masuk panel, penyiapan akun pemilik pertama bila belum ada akun,
 * dan Lupa kata sandi (pola DAMPIER). Lupa kata sandi mengirim kode 6 angka
 * lewat email sistem (SMTP di hPanel). Selama email sistem belum dipasang,
 * pemilik memakai kunci penyiapan (FANTASEA_KUNCI) sebagai gantinya, dan
 * developer dan pemilik memakai kunci penyiapan, dan akun lain meminta
 * developer atau pemilik mengatur ulang dari menu Akun.
 */
export default function Gerbang({ mode, kunciPerlu, onMasuk }: { mode: "masuk" | "siapkan"; kunciPerlu: boolean; onMasuk: (s: Sesi) => void }) {
  const [langkah, setLangkah] = useState<Langkah>("masuk");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [nama, setNama] = useState("");
  const [kunci, setKunci] = useState("");
  const [kode, setKode] = useState("");
  const [menit, setMenit] = useState(15);
  const [tanpaEmail, setTanpaEmail] = useState(false);
  const [galat, setGalat] = useState("");
  const [proses, setProses] = useState(false);

  const ke = (l: Langkah) => { setLangkah(l); setGalat(""); setSandi(""); };

  async function kirimJson<T>(url: string, isi: unknown): Promise<{ ok: boolean; o: T & { galat?: string } } | null> {
    setGalat(""); setProses(true);
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(isi) }).catch(() => null);
    setProses(false);
    if (!r) { setGalat("Server tidak bisa dihubungi. Coba lagi sebentar."); return null; }
    return { ok: r.ok, o: (await r.json().catch(() => ({}))) as T & { galat?: string } };
  }

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "siapkan" || langkah === "masuk") {
      const url = mode === "masuk" ? "/api/masuk" : "/api/penyiapan";
      const h = await kirimJson<{ sesi?: Sesi }>(url, mode === "masuk" ? { email, sandi } : { email, sandi, nama, kunci });
      if (!h) return;
      if (!h.ok || !h.o.sesi) { setGalat(h.o.galat ?? "Belum berhasil. Coba lagi."); return; }
      onMasuk(h.o.sesi);
      return;
    }
    if (langkah === "lupa") {
      const h = await kirimJson<{ emailAktif?: boolean; menit?: number }>("/api/lupa-sandi", { email });
      if (!h) return;
      if (!h.ok) { setGalat(h.o.galat ?? "Belum berhasil. Coba lagi."); return; }
      if (h.o.emailAktif === false) { setTanpaEmail(true); return; }
      setMenit(h.o.menit ?? 15); setKode(""); ke("kode");
      return;
    }
    const isi = langkah === "kode" ? { email, kode: kode.trim(), sandi } : { email, kunci, sandi };
    const h = await kirimJson<{ sesi?: Sesi }>("/api/lupa-sandi/atur", isi);
    if (!h) return;
    if (!h.ok || !h.o.sesi) { setGalat(h.o.galat ?? "Belum berhasil. Coba lagi."); return; }
    onMasuk(h.o.sesi);
  }

  const judul = mode === "siapkan" ? "Siapkan akun pemilik" : langkah === "masuk" ? "Masuk panel" : "Atur ulang kata sandi";
  const ket = mode === "siapkan"
    ? "Belum ada akun. Buat akun pemilik pertama. Langkah ini hanya sekali."
    : langkah === "masuk" ? "Panel pengelola situs Fantasea Dive Travel."
    : langkah === "lupa" ? "Tulis email akunmu. Kami kirim kode 6 angka untuk membuat kata sandi baru."
    : langkah === "kode" ? `Kode sudah dikirim ke ${email} kalau email itu terdaftar. Berlaku ${menit} menit. Periksa juga folder spam.`
    : "Khusus developer dan pemilik. Isi kunci penyiapan FANTASEA_KUNCI yang tersimpan di hPanel, lalu kata sandi baru.";

  return (
    <main className="grid min-h-screen place-items-center bg-soft px-4 py-12">
      <form onSubmit={kirim} className="w-full max-w-[420px] rounded-card bg-white p-7 shadow-lift">
        <Image src="/brand/logo/fantasea-logo-utama.png" alt="Fantasea Dive Travel" width={1617} height={1004} unoptimized priority className="mx-auto h-auto w-[170px]" />
        <h1 className="mt-6 text-center text-[34px]">{judul}</h1>
        <p className="mt-2 text-center text-[14px] text-ink2">{ket}</p>
        <div className="mt-6 grid gap-4">
          {mode === "siapkan" && (
            <>
              {kunciPerlu && (
                <div>
                  <label htmlFor="g-kunci" className="kolom-label">Kunci penyiapan</label>
                  <input id="g-kunci" className="kolom" value={kunci} onChange={(e) => setKunci(e.target.value)} autoComplete="off" />
                  <p className="mt-1 text-[12.5px] text-ink2">Isi FANTASEA_KUNCI yang Anda tulis sendiri di hPanel.</p>
                </div>
              )}
              <div>
                <label htmlFor="g-nama" className="kolom-label">Nama</label>
                <input id="g-nama" className="kolom" value={nama} onChange={(e) => setNama(e.target.value)} autoComplete="name" />
              </div>
            </>
          )}

          <div>
            <label htmlFor="g-email" className="kolom-label">Email</label>
            <input id="g-email" className="kolom" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setTanpaEmail(false); }} autoComplete="username" readOnly={langkah === "kode"} />
          </div>

          {mode === "masuk" && langkah === "kode" && (
            <div>
              <label htmlFor="g-kode" className="kolom-label">Kode dari email</label>
              <input id="g-kode" className="kolom tracking-[0.3em]" inputMode="numeric" maxLength={6} value={kode} onChange={(e) => setKode(e.target.value.replace(/\D/g, ""))} autoComplete="one-time-code" />
            </div>
          )}
          {mode === "masuk" && langkah === "kunci" && (
            <div>
              <label htmlFor="g-kunci2" className="kolom-label">Kunci penyiapan</label>
              <input id="g-kunci2" className="kolom" value={kunci} onChange={(e) => setKunci(e.target.value)} autoComplete="off" />
            </div>
          )}

          {langkah !== "lupa" && (
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="g-sandi" className="kolom-label">{langkah === "masuk" ? "Kata sandi" : "Kata sandi baru"}</label>
                {mode === "masuk" && langkah === "masuk" && <button type="button" onClick={() => ke("lupa")} className="text-[13px] font-bold text-tanda">Lupa kata sandi?</button>}
              </div>
              <input id="g-sandi" className="kolom" type="password" value={sandi} onChange={(e) => setSandi(e.target.value)} autoComplete={mode === "masuk" && langkah === "masuk" ? "current-password" : "new-password"} />
              {(mode === "siapkan" || langkah !== "masuk") && <p className="mt-1 text-[12.5px] text-ink2">Paling sedikit 10 huruf. Sesi di perangkat lain ikut keluar.</p>}
            </div>
          )}

          {tanpaEmail && langkah === "lupa" && (
            <div className="rounded-in bg-[#FFF4DD] px-4 py-3 text-[13.5px] text-navy" role="status">
              <p className="font-bold">Email sistem belum dipasang, jadi kode belum bisa dikirim.</p>
              <p className="mt-1">Developer dan pemilik bisa memakai kunci penyiapan dari hPanel. Akun lain minta developer atau pemilik mengatur ulang sandinya di menu Akun dan peran.</p>
              <button type="button" onClick={() => ke("kunci")} className="mt-2 font-bold text-tanda">Pakai kunci penyiapan</button>
            </div>
          )}

          {galat && <p className="kolom-galat" role="alert">{galat}</p>}
          <button type="submit" className="btn btn-navy w-full" disabled={proses}>
            {proses ? "Memproses" : mode === "siapkan" ? "Buat akun dan masuk" : langkah === "masuk" ? "Masuk" : langkah === "lupa" ? "Kirim kode" : "Simpan dan masuk"}
          </button>

          {mode === "masuk" && langkah !== "masuk" && (
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px] font-bold">
              {langkah === "kode" && <button type="button" onClick={() => ke("lupa")} className="text-tanda">Kirim kode lagi</button>}
              {langkah === "lupa" && !tanpaEmail && <button type="button" onClick={() => ke("kunci")} className="text-ink2 hover:text-navy">Developer atau pemilik? Pakai kunci penyiapan</button>}
              <button type="button" onClick={() => ke("masuk")} className="text-ink2 hover:text-navy">Kembali ke Masuk</button>
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
