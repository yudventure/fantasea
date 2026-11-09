"use client";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { WARNA_TAG, type DaftarTeks, type Teks, type WarnaTag } from "@/lib/konten";
import { FOTO_BAWAAN } from "@/data/foto-bawaan";
import { IkonPanahBawah, IkonPanahKanan, IkonPanahKiri, IkonSampah, IkonUnggah } from "@/components/Ikon";
import { unggahFoto } from "./unggah";
import { adaTandaTerlarang } from "@/lib/tanda-panel";

/**
 * Kolom isian panel pengelola. Label di atas kolom (tanpa titik dua),
 * peringatan lembut bila isian memakai titik dua, titik koma, atau tanda
 * pisah panjang, karena situs tidak memakai tanda itu (CLAUDE.md, Gaya).
 */
function PeringatanTanda({ nilai }: { nilai: string }) {
  if (!adaTandaTerlarang(nilai)) return null;
  return <p className="mt-1 text-[12.5px] font-semibold text-[#9A6714]">Situs tidak memakai titik dua, titik koma, atau tanda pisah panjang. Pecah jadi kalimat atau pakai koma.</p>;
}

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-[13.5px] font-bold text-navy">{children}</label>
      {hint && <p className="text-[12.5px] text-ink2">{hint}</p>}
    </div>
  );
}

export function KolomTeks({ label, value, onChange, hint, panjang = false, placeholder, jenis = "teks", maks }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; panjang?: boolean; placeholder?: string; jenis?: "teks" | "tautan" | "email" | "angka"; maks?: number;
}) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} hint={hint}>{label}</Label>
      {panjang ? (
        <textarea id={id} className="kolom min-h-[110px]" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maks} />
      ) : (
        <input id={id} className="kolom" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maks}
          type={jenis === "email" ? "email" : jenis === "tautan" ? "url" : "text"} inputMode={jenis === "angka" ? "numeric" : undefined} />
      )}
      {jenis === "teks" && <PeringatanTanda nilai={value} />}
    </div>
  );
}

/** Teks dua bahasa berdampingan: Inggris (bawaan situs) dan Indonesia. */
export function KolomDua({ label, value, onChange, hint, panjang = false, maks }: { label: string; value: Teks; onChange: (v: Teks) => void; hint?: string; panjang?: boolean; maks?: number }) {
  const id = useId();
  const kolom = (l: "en" | "id") => {
    const p = { id: `${id}-${l}`, className: `kolom ${panjang ? "min-h-[120px]" : ""}`, value: value[l], maxLength: maks, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [l]: e.target.value }) };
    return (
      <div className="min-w-0">
        <label htmlFor={p.id} className="mb-1 inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-ink2">
          <span className="rounded bg-buih px-1.5 py-0.5 text-navy">{l === "en" ? "EN" : "ID"}</span>{l === "en" ? "Inggris" : "Indonesia"}
        </label>
        {panjang ? <textarea {...p} /> : <input {...p} />}
        <PeringatanTanda nilai={value[l]} />
      </div>
    );
  };
  return (
    <fieldset>
      <legend className="mb-1.5 block text-[13.5px] font-bold text-navy">{label}</legend>
      {hint && <p className="-mt-1 mb-2 text-[12.5px] text-ink2">{hint}</p>}
      <div className="grid gap-3 md:grid-cols-2">{kolom("en")}{kolom("id")}</div>
    </fieldset>
  );
}

/** Daftar dua bahasa, satu butir per baris. */
export function KolomDaftar({ label, value, onChange, hint }: { label: string; value: DaftarTeks; onChange: (v: DaftarTeks) => void; hint?: string }) {
  const teks: Teks = { en: value.en.join("\n"), id: value.id.join("\n") };
  return (
    <KolomDua label={label} hint={hint ?? "Satu butir per baris."} panjang value={teks}
      onChange={(v) => onChange({ en: v.en.split("\n"), id: v.id.split("\n") })} />
  );
}

export function KolomAngka({ label, value, onChange, hint, min = 0, maks = 1e11, awalan }: { label: string; value: number; onChange: (v: number) => void; hint?: string; min?: number; maks?: number; awalan?: string }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} hint={hint}>{label}</Label>
      <div className="flex items-center gap-2">
        {awalan && <span className="text-[14px] font-bold text-ink2">{awalan}</span>}
        <input id={id} className="kolom" inputMode="numeric" value={value ? new Intl.NumberFormat("id-ID").format(value) : ""} placeholder="0"
          onChange={(e) => { const n = Number(e.target.value.replace(/[^\d]/g, "")); onChange(Math.min(maks, Math.max(min, Number.isFinite(n) ? n : 0))); }} />
      </div>
    </div>
  );
}

export function Saklar({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className="flex items-center gap-3 text-left">
      <span className={`relative h-7 w-12 flex-none rounded-full transition ${value ? "bg-navy" : "bg-line"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${value ? "left-6" : "left-1"}`} />
      </span>
      <span>
        <span className="block text-[14px] font-bold text-navy">{label}</span>
        {hint && <span className="block text-[12.5px] text-ink2">{hint}</span>}
      </span>
    </button>
  );
}

const NAMA_WARNA: Record<WarnaTag, string> = { tanda: "Biru Tanda", ukir: "Biru Ukir", koral: "Koral Senja", navy: "Navy Manta" };
const KELAS_WARNA: Record<WarnaTag, string> = { tanda: "bg-tanda", ukir: "bg-ukir", koral: "bg-koral", navy: "bg-navy" };
export function PilihWarna({ value, onChange }: { value: WarnaTag; onChange: (v: WarnaTag) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Warna gelembung">
      {WARNA_TAG.map((w) => (
        <button key={w} type="button" role="radio" aria-checked={value === w} onClick={() => onChange(w)} title={NAMA_WARNA[w]}
          className={`flex items-center gap-2 rounded-pill border px-2.5 py-1.5 text-[12.5px] font-bold ${value === w ? "border-navy bg-buih text-navy" : "border-line text-ink2"}`}>
          <span className={`h-4 w-4 rounded-full ${KELAS_WARNA[w]}`} />{NAMA_WARNA[w]}
        </button>
      ))}
    </div>
  );
}

/** Satu foto: pratinjau, Ganti foto (unggah), Pilih foto bawaan, Hapus. */
export function KolomFoto({ label, value, onChange, hint, rasio = "aspect-[4/3]", bolehKosong = true }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; rasio?: string; bolehKosong?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState("");
  const [galeri, setGaleri] = useState(false);

  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = e.target.files?.[0];
    e.target.value = "";
    if (!berkas) return;
    setGalat(""); setProses(true);
    try { onChange(await unggahFoto(berkas)); } catch (err) { setGalat((err as Error).message); } finally { setProses(false); }
  }

  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <div className={`relative w-full max-w-[360px] overflow-hidden rounded-[16px] border border-line bg-buih ${rasio}`}>
        {value ? <Image src={value} alt="" fill sizes="360px" unoptimized className="object-cover" /> : <span className="absolute inset-0 grid place-items-center text-[13px] font-bold text-ink2">Belum ada foto</span>}
        {proses && <span className="absolute inset-0 grid place-items-center bg-white/80 text-[13px] font-bold text-navy">Mengunggah</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-3.5 py-2 text-[13px] font-bold text-white hover:bg-malam" disabled={proses}>
          <IkonUnggah size={16} />{value ? "Ganti foto" : "Unggah foto"}
        </button>
        <button type="button" onClick={() => setGaleri((v) => !v)} aria-expanded={galeri} className="rounded-pill bg-buih px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-line">Pilih foto bawaan</button>
        {value && bolehKosong && <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-[13px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus</button>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pilih} />
      {galat && <p className="kolom-galat">{galat}</p>}
      {galeri && (
        <div className="mt-3 grid max-w-[520px] grid-cols-4 gap-2 rounded-[16px] border border-line bg-white p-2 sm:grid-cols-6">
          {FOTO_BAWAAN.map((f) => (
            <button key={f} type="button" onClick={() => { onChange(f); setGaleri(false); }} className={`relative aspect-square overflow-hidden rounded-[10px] border-2 ${f === value ? "border-navy" : "border-transparent"}`} aria-label={f.split("/").pop()}>
              <Image src={f} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Beberapa foto berurutan (galeri trip, foto Gerbang). Foto pertama jadi sampul. */
export function KolomBanyakFoto({ label, value, onChange, maks, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; maks: number; hint?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState("");
  const [galeri, setGaleri] = useState(false);
  const geser = (i: number, arah: number) => {
    const j = i + arah;
    if (j < 0 || j >= value.length) return;
    const baru = [...value];
    [baru[i], baru[j]] = [baru[j], baru[i]];
    onChange(baru);
  };
  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const berkas = Array.from(e.target.files ?? []).slice(0, maks - value.length);
    e.target.value = "";
    if (!berkas.length) return;
    setGalat(""); setProses(true);
    const hasil: string[] = [];
    try { for (const b of berkas) hasil.push(await unggahFoto(b)); } catch (err) { setGalat((err as Error).message); }
    finally { setProses(false); if (hasil.length) onChange([...value, ...hasil].slice(0, maks)); }
  }
  return (
    <div>
      <Label hint={hint ?? `Paling banyak ${maks} foto. Foto pertama jadi sampul.`}>{label}</Label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((f, i) => (
          <div key={f + i} className="overflow-hidden rounded-[14px] border border-line bg-white">
            <div className="relative aspect-[4/3] bg-buih">
              <Image src={f} alt="" fill sizes="200px" unoptimized className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-pill bg-navy px-2 py-0.5 text-[11px] font-bold text-white">Sampul</span>}
            </div>
            <div className="flex items-center justify-between p-1.5">
              <div className="flex">
                <button type="button" onClick={() => geser(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-full hover:bg-buih disabled:opacity-30" aria-label="Geser ke kiri"><IkonPanahKiri size={16} /></button>
                <button type="button" onClick={() => geser(i, 1)} disabled={i === value.length - 1} className="grid h-8 w-8 place-items-center rounded-full hover:bg-buih disabled:opacity-30" aria-label="Geser ke kanan"><IkonPanahKanan size={16} /></button>
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid h-8 w-8 place-items-center rounded-full text-[#A63A22] hover:bg-[#FBE4DD]" aria-label="Hapus foto"><IkonSampah size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      {value.length < maks && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={proses} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-3.5 py-2 text-[13px] font-bold text-white hover:bg-malam">
            <IkonUnggah size={16} />{proses ? "Mengunggah" : "Tambah foto"}
          </button>
          <button type="button" onClick={() => setGaleri((v) => !v)} aria-expanded={galeri} className="rounded-pill bg-buih px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-line">Pilih foto bawaan</button>
        </div>
      )}
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pilih} />
      {galat && <p className="kolom-galat">{galat}</p>}
      {galeri && (
        <div className="mt-3 grid max-w-[520px] grid-cols-4 gap-2 rounded-[16px] border border-line bg-white p-2 sm:grid-cols-6">
          {FOTO_BAWAAN.map((f) => (
            <button key={f} type="button" onClick={() => { onChange([...value, f].slice(0, maks)); setGaleri(false); }} className="relative aspect-square overflow-hidden rounded-[10px]" aria-label={f.split("/").pop()}>
              <Image src={f} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Kartu bagian di panel: judul, keterangan, lalu isinya. */
/** Teks satu baris untuk ringkasan kepala kartu terlipat, tanpa tanda warna judul. */
export const ringkasTeks = (t: { en: string; id: string }, maks = 70) => {
  const x = (t.id || t.en).replace(/\*/g, "").replace(/\s+/g, " ").trim();
  return x.length > maks ? `${x.slice(0, maks - 1).trimEnd()}…` : x;
};

/**
 * Kartu bagian di panel. `lipat` membuatnya tertutup saat halaman dibuka,
 * untuk isian yang jarang diubah (pola DAMPIER, BagianLipat). Kepalanya
 * menampilkan `ringkas`, nilainya sekarang dalam satu kalimat, dan isinya
 * baru dimuat saat dibuka.
 */
export function KartuPanel({ judul, keterangan, children, aksi, id, lipat = false, ringkas }: {
  judul: string; keterangan?: string; children: React.ReactNode; aksi?: React.ReactNode; id?: string; lipat?: boolean; ringkas?: React.ReactNode;
}) {
  const [buka, setBuka] = useState(!lipat);
  const kepala = (
    <div className="min-w-0">
      <h2 className="font-body text-[19px] font-extrabold leading-tight tracking-normal">{judul}</h2>
      {keterangan && (buka || !ringkas) && <p className="mt-1 max-w-[70ch] text-[13.5px] text-ink2">{keterangan}</p>}
      {lipat && !buka && ringkas && <p className="mt-1 max-w-[70ch] text-[13.5px] text-ink2">{ringkas}</p>}
    </div>
  );
  return (
    <section id={id} className={`rounded-card border bg-white p-5 shadow-card sm:p-6 ${lipat && buka ? "border-ukir/40" : "border-line"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {lipat ? (
          <button type="button" onClick={() => setBuka((x) => !x)} aria-expanded={buka} className="flex min-w-0 flex-1 items-start gap-3 text-left">
            {kepala}
            <span aria-hidden className={`ml-auto mt-0.5 flex-none text-ink2 transition-transform ${buka ? "rotate-180" : ""}`}><IkonPanahBawah size={18} /></span>
          </button>
        ) : kepala}
        {buka && aksi}
      </div>
      {buka && <div className="mt-5 grid gap-5">{children}</div>}
    </section>
  );
}
