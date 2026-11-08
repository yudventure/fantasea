"use client";
import Image from "next/image";
import { useState } from "react";
import type { Sesi } from "./Panel";

/** Halaman masuk panel, atau penyiapan akun pemilik pertama bila belum ada akun. */
export default function Gerbang({ mode, kunciPerlu, onMasuk }: { mode: "masuk" | "siapkan"; kunciPerlu: boolean; onMasuk: (s: Sesi) => void }) {
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [nama, setNama] = useState("");
  const [kunci, setKunci] = useState("");
  const [galat, setGalat] = useState("");
  const [proses, setProses] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat(""); setProses(true);
    const url = mode === "masuk" ? "/api/masuk" : "/api/penyiapan";
    const isi = mode === "masuk" ? { email, sandi } : { email, sandi, nama, kunci };
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(isi) }).catch(() => null);
    setProses(false);
    if (!r) { setGalat("Server tidak bisa dihubungi. Coba lagi sebentar."); return; }
    const o = (await r.json().catch(() => ({}))) as { sesi?: Sesi; galat?: string };
    if (!r.ok || !o.sesi) { setGalat(o.galat ?? "Belum berhasil. Coba lagi."); return; }
    onMasuk(o.sesi);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-soft px-4 py-12">
      <form onSubmit={kirim} className="w-full max-w-[420px] rounded-card bg-white p-7 shadow-lift">
        <Image src="/brand/logo/fantasea-logo-utama.png" alt="Fantasea Dive Travel" width={1617} height={1004} unoptimized priority className="mx-auto h-auto w-[170px]" />
        <h1 className="mt-6 text-center text-[34px]">{mode === "masuk" ? "Masuk panel" : "Siapkan akun pemilik"}</h1>
        <p className="mt-2 text-center text-[14px] text-ink2">
          {mode === "masuk" ? "Panel pengelola situs Fantasea Dive Travel." : "Belum ada akun. Buat akun pemilik pertama. Langkah ini hanya sekali."}
        </p>
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
            <input id="g-email" className="kolom" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label htmlFor="g-sandi" className="kolom-label">Kata sandi</label>
            <input id="g-sandi" className="kolom" type="password" value={sandi} onChange={(e) => setSandi(e.target.value)} autoComplete={mode === "masuk" ? "current-password" : "new-password"} />
            {mode === "siapkan" && <p className="mt-1 text-[12.5px] text-ink2">Paling sedikit 10 huruf.</p>}
          </div>
          {galat && <p className="kolom-galat" role="alert">{galat}</p>}
          <button type="submit" className="btn btn-navy w-full" disabled={proses}>{proses ? "Memproses" : mode === "masuk" ? "Masuk" : "Buat akun dan masuk"}</button>
        </div>
      </form>
    </main>
  );
}
