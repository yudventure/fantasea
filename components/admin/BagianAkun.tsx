"use client";
import { useEffect, useState } from "react";
import { tanggalPanjang } from "@/lib/format";
import { META_PERAN, type Peran } from "@/lib/peran";
import { IkonSampah } from "@/components/Ikon";
import Dropdown from "@/components/Dropdown";
import { KartuPanel, KolomTeks } from "./Kolom";
import type { Sesi } from "./Panel";

interface AkunTim { email: string; nama: string; peran: Peran; dibuat: string }
type StatusEmail = { aktif: true; host: string; port: number; dari: string } | { aktif: false };

const PILIH_PERAN = (["tim", "meja"] as const).map((p) => ({ nilai: p, label: META_PERAN[p].label }));

/** Key hPanel untuk email sistem. Nilainya diisi pemilik sendiri di hPanel, tidak pernah di panel ini. */
const KEY_EMAIL = [
  { key: "SMTP_HOST", ket: "Server email keluar. Untuk email Hostinger smtp.hostinger.com" },
  { key: "SMTP_PORT", ket: "465, bawaannya kalau dikosongkan" },
  { key: "SMTP_USER", ket: "Alamat email pengirim lengkap, mis. halo@domainmu" },
  { key: "SMTP_PASS", ket: "Kata sandi kotak email itu" },
  { key: "EMAIL_DARI", ket: "Alamat yang tampil sebagai pengirim. Kosong berarti sama dengan SMTP_USER" },
];

async function kirim<T>(method: string, isi: unknown): Promise<T> {
  const r = await fetch("/api/akun", { method, headers: { "content-type": "application/json" }, body: isi === undefined ? undefined : JSON.stringify(isi) }).catch(() => null);
  if (!r) throw new Error("Server tidak bisa dihubungi.");
  const o = (await r.json().catch(() => ({}))) as T & { galat?: string };
  if (!r.ok) throw new Error(o.galat ?? "Belum berhasil.");
  return o;
}

/**
 * Akun dan peran (pola DAMPIER). Semua peran mengganti sandinya sendiri.
 * Pemilik juga menambah anggota, memilih perannya (Tim atau Meja
 * permintaan), memberi sandi sementara, dan melihat status email sistem
 * untuk Lupa kata sandi.
 */
export default function BagianAkun({ sesi }: { sesi: Sesi }) {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [pesan, setPesan] = useState("");
  const [tim, setTim] = useState<AkunTim[]>([]);
  const [statusEmail, setStatusEmail] = useState<StatusEmail | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [peran, setPeran] = useState<Peran>("tim");
  const [pesanTim, setPesanTim] = useState("");
  const [atur, setAtur] = useState<{ email: string; sandi: string } | null>(null);
  const pemilik = sesi.peran === "pemilik";

  useEffect(() => {
    if (!pemilik) return;
    fetch("/api/akun", { cache: "no-store" }).then((r) => r.json())
      .then((o: { akun?: AkunTim[]; email?: StatusEmail }) => { setTim(o.akun ?? []); setStatusEmail(o.email ?? null); })
      .catch(() => {});
  }, [pemilik]);

  async function gantiSandi(e: React.FormEvent) {
    e.preventDefault();
    setPesan("");
    try { await kirim("PATCH", { lama, baru }); setLama(""); setBaru(""); setPesan("Kata sandi diganti. Sesi di perangkat lain ikut keluar."); }
    catch (err) { setPesan((err as Error).message); }
  }
  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    setPesanTim("");
    try {
      const o = await kirim<{ akun: AkunTim[] }>("POST", { nama, email, sandi, peran });
      setTim(o.akun); setNama(""); setEmail(""); setSandi("");
      setPesanTim("Anggota ditambahkan. Kirim email dan kata sandi sementaranya lewat jalur pribadi, lalu minta ia menggantinya di menu Akun.");
    } catch (err) { setPesanTim((err as Error).message); }
  }
  async function gantiPeran(e: string, p: Peran) {
    setPesanTim("");
    try { const o = await kirim<{ akun: AkunTim[] }>("PUT", { email: e, peran: p }); setTim(o.akun); setPesanTim(`Peran ${e} sekarang ${META_PERAN[p].label}. Ia perlu masuk lagi.`); }
    catch (err) { setPesanTim((err as Error).message); }
  }
  async function aturSandi(ev: React.FormEvent) {
    ev.preventDefault();
    if (!atur) return;
    setPesanTim("");
    try { await kirim("PUT", { email: atur.email, sandi: atur.sandi }); setPesanTim(`Kata sandi sementara ${atur.email} tersimpan. Kirim lewat jalur pribadi dan minta ia menggantinya.`); setAtur(null); }
    catch (err) { setPesanTim((err as Error).message); }
  }
  async function hapus(e: string) {
    if (!window.confirm(`Hapus akun ${e}?`)) return;
    try { const o = await kirim<{ akun: AkunTim[] }>("DELETE", { email: e }); setTim(o.akun); }
    catch (err) { setPesanTim((err as Error).message); }
  }

  return (
    <div className="grid gap-6">
      <KartuPanel id="ganti-sandi" judul="Akun saya" keterangan={`Masuk sebagai ${sesi.nama} (${sesi.email}), peran ${META_PERAN[sesi.peran].label}. ${META_PERAN[sesi.peran].ket}`}>
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

      {pemilik && (
        <KartuPanel judul="Tim dan peran" keterangan="Tim mengubah isi situs dan menjawab permintaan. Meja permintaan hanya menjawab permintaan tamu. Hanya pemilik yang mengatur akun dan menghapus permintaan.">
          <ul className="grid gap-2">
            {tim.map((a) => (
              <li key={a.email} className="grid gap-3 rounded-in bg-soft px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-extrabold text-navy">{a.nama}</span>
                    <span className="block break-all text-[13px] text-ink2">{a.email} · sejak {tanggalPanjang(a.dibuat.slice(0, 10), "id")}</span>
                  </span>
                  {a.peran === "pemilik" ? (
                    <span className="rounded-pill bg-white px-3 py-1 text-[12.5px] font-extrabold text-navy">Pemilik</span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-[210px]"><Dropdown label={`Peran ${a.nama}`} value={a.peran} onChange={(v) => gantiPeran(a.email, v as Peran)} pilihan={PILIH_PERAN} kosong="Pilih peran" /></div>
                      <button type="button" onClick={() => setAtur(atur?.email === a.email ? null : { email: a.email, sandi: "" })} className="rounded-pill bg-white px-3 py-2 text-[13px] font-bold text-navy hover:bg-buih">Sandi sementara</button>
                      <button type="button" onClick={() => hapus(a.email)} className="grid h-9 w-9 place-items-center rounded-full text-[#A63A22] hover:bg-[#FBE4DD]" aria-label={`Hapus ${a.email}`}><IkonSampah size={17} /></button>
                    </div>
                  )}
                </div>
                {atur?.email === a.email && (
                  <form onSubmit={aturSandi} className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[220px] flex-1">
                      <label htmlFor={`a-atur-${a.email}`} className="kolom-label">Kata sandi sementara untuk {a.nama}</label>
                      <input id={`a-atur-${a.email}`} type="text" className="kolom" value={atur.sandi} onChange={(e) => setAtur({ ...atur, sandi: e.target.value })} autoComplete="off" />
                    </div>
                    <button type="submit" className="btn btn-navy">Simpan sandi</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={tambah} className="grid gap-4 rounded-card border border-line bg-soft p-4 md:grid-cols-2">
            <KolomTeks label="Nama" value={nama} onChange={setNama} maks={60} />
            <KolomTeks label="Email" jenis="email" value={email} onChange={setEmail} maks={120} />
            <div>
              <label htmlFor="a-sementara" className="kolom-label">Kata sandi sementara</label>
              <input id="a-sementara" type="text" className="kolom" value={sandi} onChange={(e) => setSandi(e.target.value)} autoComplete="off" />
            </div>
            <Dropdown label="Peran" value={peran} onChange={(v) => setPeran(v as Peran)} pilihan={PILIH_PERAN} kosong="Pilih peran" />
            {pesanTim && <p className="text-[13.5px] font-semibold text-navy md:col-span-2" role="status">{pesanTim}</p>}
            <button type="submit" className="btn btn-navy w-fit md:col-span-2">Tambah anggota</button>
          </form>
        </KartuPanel>
      )}

      {pemilik && statusEmail && (
        <KartuPanel judul="Email sistem" lipat={statusEmail.aktif}
          ringkas={statusEmail.aktif ? `Terpasang, lewat ${statusEmail.host} dari ${statusEmail.dari}.` : undefined}
          keterangan="Dipakai Lupa kata sandi untuk mengirim kode. Diisi di hPanel, Websites, Manage, Environment variables, lalu Redeploy. Kata sandi email tidak pernah diisi di panel ini.">
          {statusEmail.aktif ? (
            <p className="rounded-in bg-buih px-4 py-3 text-[14px] text-navy">Terpasang. Kode lupa sandi dikirim lewat {statusEmail.host} port {statusEmail.port}, dari {statusEmail.dari}.</p>
          ) : (
            <>
              <p className="rounded-in bg-[#FFF4DD] px-4 py-3 text-[14px] text-navy">Belum dipasang. Sampai diisi, pemilik yang lupa sandi memakai kunci penyiapan FANTASEA_KUNCI, dan anggota tim diberi sandi sementara dari kartu Tim dan peran.</p>
              <ul className="grid gap-2 text-[13.5px]">
                {KEY_EMAIL.map((x) => <li key={x.key} className="rounded-in bg-soft px-4 py-2.5"><code className="font-bold text-navy">{x.key}</code> <span className="text-ink2">{x.ket}</span></li>)}
              </ul>
            </>
          )}
        </KartuPanel>
      )}
    </div>
  );
}
