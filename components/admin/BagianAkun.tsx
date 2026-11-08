"use client";
import { useEffect, useState } from "react";
import { tanggalPanjang } from "@/lib/format";
import { IkonSampah } from "@/components/Ikon";
import { KartuPanel, KolomTeks } from "./Kolom";
import type { Sesi } from "./Panel";

interface AkunTim { email: string; nama: string; peran: "pemilik" | "tim"; dibuat: string }

async function kirim<T>(method: string, isi: unknown): Promise<T> {
  const r = await fetch("/api/akun", { method, headers: { "content-type": "application/json" }, body: isi === undefined ? undefined : JSON.stringify(isi) }).catch(() => null);
  if (!r) throw new Error("Server tidak bisa dihubungi.");
  const o = (await r.json().catch(() => ({}))) as T & { galat?: string };
  if (!r.ok) throw new Error(o.galat ?? "Belum berhasil.");
  return o;
}

export default function BagianAkun({ sesi }: { sesi: Sesi }) {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [pesan, setPesan] = useState("");
  const [tim, setTim] = useState<AkunTim[]>([]);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [pesanTim, setPesanTim] = useState("");

  useEffect(() => {
    if (sesi.peran !== "pemilik") return;
    fetch("/api/akun", { cache: "no-store" }).then((r) => r.json()).then((o: { akun?: AkunTim[] }) => setTim(o.akun ?? [])).catch(() => {});
  }, [sesi.peran]);

  async function gantiSandi(e: React.FormEvent) {
    e.preventDefault();
    setPesan("");
    try { await kirim("PATCH", { lama, baru }); setLama(""); setBaru(""); setPesan("Kata sandi diganti. Sesi di perangkat lain ikut keluar."); }
    catch (err) { setPesan((err as Error).message); }
  }
  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    setPesanTim("");
    try { const o = await kirim<{ akun: AkunTim[] }>("POST", { nama, email, sandi }); setTim(o.akun); setNama(""); setEmail(""); setSandi(""); setPesanTim("Anggota ditambahkan. Kirim email dan kata sandi sementaranya lewat jalur pribadi, lalu minta ia menggantinya di menu Akun."); }
    catch (err) { setPesanTim((err as Error).message); }
  }
  async function hapus(e: string) {
    if (!window.confirm(`Hapus akun ${e}?`)) return;
    try { const o = await kirim<{ akun: AkunTim[] }>("DELETE", { email: e }); setTim(o.akun); }
    catch (err) { setPesanTim((err as Error).message); }
  }

  return (
    <div className="grid gap-6">
      <KartuPanel judul="Akun saya" keterangan={`Masuk sebagai ${sesi.nama} (${sesi.email}), peran ${sesi.peran}.`}>
        <form onSubmit={gantiSandi} className="grid max-w-[520px] gap-4">
          <div>
            <label htmlFor="a-lama" className="kolom-label">Kata sandi sekarang</label>
            <input id="a-lama" type="password" className="kolom" value={lama} onChange={(e) => setLama(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <label htmlFor="a-baru" className="kolom-label">Kata sandi baru</label>
            <input id="a-baru" type="password" className="kolom" value={baru} onChange={(e) => setBaru(e.target.value)} autoComplete="new-password" />
            <p className="mt-1 text-[12.5px] text-ink2">Paling sedikit 10 huruf.</p>
          </div>
          {pesan && <p className="text-[13.5px] font-semibold text-navy" role="status">{pesan}</p>}
          <button type="submit" className="btn btn-navy w-fit">Ganti kata sandi</button>
        </form>
      </KartuPanel>

      {sesi.peran === "pemilik" && (
        <KartuPanel judul="Tim" keterangan="Anggota tim bisa mengubah isi situs dan menangani permintaan. Hanya pemilik yang bisa menambah atau menghapus akun dan menghapus permintaan.">
          <ul className="grid gap-2">
            {tim.map((a) => (
              <li key={a.email} className="flex flex-wrap items-center justify-between gap-3 rounded-in bg-soft px-4 py-3">
                <span><span className="block font-extrabold text-navy">{a.nama}</span><span className="block text-[13px] text-ink2">{a.email} · {a.peran} · sejak {tanggalPanjang(a.dibuat.slice(0, 10), "id")}</span></span>
                {a.peran !== "pemilik" && <button type="button" onClick={() => hapus(a.email)} className="grid h-9 w-9 place-items-center rounded-full text-[#A63A22] hover:bg-[#FBE4DD]" aria-label={`Hapus ${a.email}`}><IkonSampah size={17} /></button>}
              </li>
            ))}
          </ul>
          <form onSubmit={tambah} className="grid gap-4 rounded-card border border-line bg-soft p-4 md:grid-cols-3">
            <KolomTeks label="Nama" value={nama} onChange={setNama} maks={60} />
            <KolomTeks label="Email" jenis="email" value={email} onChange={setEmail} maks={120} />
            <div>
              <label htmlFor="a-sementara" className="kolom-label">Kata sandi sementara</label>
              <input id="a-sementara" type="text" className="kolom" value={sandi} onChange={(e) => setSandi(e.target.value)} autoComplete="off" />
            </div>
            {pesanTim && <p className="text-[13.5px] font-semibold text-navy md:col-span-3" role="status">{pesanTim}</p>}
            <button type="submit" className="btn btn-navy w-fit md:col-span-3">Tambah anggota</button>
          </form>
        </KartuPanel>
      )}
    </div>
  );
}
