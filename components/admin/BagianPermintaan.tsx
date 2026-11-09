"use client";
import { useState } from "react";
import { tx, type Konten } from "@/lib/konten";
import { rentangTanggal, tanggalPanjang } from "@/lib/format";
import { tautanWa } from "@/lib/whatsapp";
import type { Permintaan, StatusPermintaan } from "@/lib/server/permintaan";
import { IkonSampah, IkonWhatsapp } from "@/components/Ikon";
import { KartuPanel } from "./Kolom";
import type { Sesi } from "./Panel";

export const NAMA_STATUS: Record<StatusPermintaan, string> = { baru: "Baru", dihubungi: "Sudah dihubungi", dikonfirmasi: "Dikonfirmasi", batal: "Batal" };
export const KELAS_STATUS: Record<StatusPermintaan, string> = { baru: "bg-koral text-navy", dihubungi: "bg-ukir/20 text-tanda", dikonfirmasi: "bg-[#E3F1E9] text-[#2E7D5B]", batal: "bg-[#F1F3F5] text-ink2" };
const URUTAN: StatusPermintaan[] = ["baru", "dihubungi", "dikonfirmasi", "batal"];

export function BagianPermintaan({ permintaan, setPermintaan, sesi, k }: { permintaan: Permintaan[]; setPermintaan: (p: Permintaan[]) => void; sesi: Sesi; k: Konten }) {
  const [saring, setSaring] = useState<StatusPermintaan | "semua">("semua");
  const [galat, setGalat] = useState("");
  const tampil = saring === "semua" ? permintaan : permintaan.filter((p) => p.status === saring);

  async function ubah(id: string, isi: { status?: StatusPermintaan; catatanTim?: string }) {
    setGalat("");
    const r = await fetch("/api/permintaan", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, ...isi }) }).catch(() => null);
    const o = r ? ((await r.json().catch(() => ({}))) as { permintaan?: Permintaan; galat?: string }) : {};
    if (!r?.ok || !o.permintaan) { setGalat(o.galat ?? "Perubahan belum tersimpan."); return; }
    setPermintaan(permintaan.map((p) => (p.id === id ? o.permintaan! : p)));
  }
  async function hapus(id: string) {
    if (!window.confirm("Hapus permintaan ini? Tidak bisa dibatalkan.")) return;
    const r = await fetch("/api/permintaan", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => null);
    if (!r?.ok) { setGalat("Permintaan belum terhapus."); return; }
    setPermintaan(permintaan.filter((p) => p.id !== id));
  }

  return (
    <KartuPanel judul="Permintaan tamu" keterangan="Dari formulir Pesan trip di situs. Hubungi tamu lewat WhatsApp, lalu ubah statusnya supaya tim tahu siapa yang sudah ditangani.">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Saring status">
        {(["semua", ...URUTAN] as const).map((s) => (
          <button key={s} type="button" aria-pressed={saring === s} onClick={() => setSaring(s)}
            className={`rounded-pill px-3.5 py-1.5 text-[13px] font-bold ${saring === s ? "bg-navy text-white" : "bg-buih text-navy hover:bg-line"}`}>
            {s === "semua" ? `Semua (${permintaan.length})` : `${NAMA_STATUS[s]} (${permintaan.filter((p) => p.status === s).length})`}
          </button>
        ))}
      </div>
      {galat && <p className="kolom-galat" role="alert">{galat}</p>}
      {tampil.length === 0 && <p className="text-[14.5px] text-ink2">Tidak ada permintaan di sini.</p>}
      <ul className="grid gap-3">
        {tampil.map((p) => {
          const salam = p.bahasa === "id"
            ? `Halo ${p.nama}, terima kasih sudah memesan ${p.tripNama} di Fantasea Dive Travel.\nKode ${p.kode}`
            : `Hello ${p.nama}, thank you for your request for ${p.tripNama} with Fantasea Dive Travel.\nCode ${p.kode}`;
          const wa = tautanWa(p.whatsapp.replace(/^0/, "62"), salam);
          const menginap = p.jenis === "homestay";
          const item = menginap ? k.homestay.find((h) => h.id === p.tripId) : k.trip.find((t) => t.id === p.tripId);
          return (
            <li key={p.id} id={`permintaan-${p.id}`} className="rounded-card border border-line bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-ink2">{p.kode} · masuk {tanggalPanjang(p.dibuat.slice(0, 10), "id")}</p>
                  <p className="mt-0.5 text-[18px] font-extrabold text-navy">{p.nama}</p>
                  <p className="text-[14px] text-navy">{item ? tx(item.nama, "id") : p.tripNama}</p>
                  <p className="text-[14px] text-ink2">{rentangTanggal(p.mulai, p.selesai, "id")} · {p.orang} orang · {menginap ? "Menginap" : p.jadwalId ? "Open trip" : "Tanggal sendiri"} · bahasa {p.bahasa === "id" ? "Indonesia" : "Inggris"}</p>
                </div>
                <span className={`rounded-pill px-2.5 py-1 text-[12px] font-extrabold ${KELAS_STATUS[p.status]}`}>{NAMA_STATUS[p.status]}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[14px]">
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-pill bg-koral px-3.5 py-2 font-bold text-navy"><IkonWhatsapp size={17} />{p.whatsapp}</a>}
                {p.email && <a href={`mailto:${p.email}`} className="rounded-pill bg-buih px-3.5 py-2 font-bold text-navy">{p.email}</a>}
              </div>
              {p.catatan && <p className="mt-3 whitespace-pre-line rounded-in bg-soft px-4 py-3 text-[14px] text-navy">{p.catatan}</p>}
              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <label htmlFor={`ct-${p.id}`} className="mb-1 block text-[13px] font-bold text-navy">Catatan tim</label>
                  <textarea id={`ct-${p.id}`} className="kolom min-h-[64px]" defaultValue={p.catatanTim} onBlur={(e) => e.target.value !== p.catatanTim && ubah(p.id, { catatanTim: e.target.value })} placeholder="Hanya terlihat di panel" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {URUTAN.filter((s) => s !== p.status).map((s) => (
                    <button key={s} type="button" onClick={() => ubah(p.id, { status: s })} className="rounded-pill bg-buih px-3 py-2 text-[13px] font-bold text-navy hover:bg-line">Tandai {NAMA_STATUS[s].toLowerCase()}</button>
                  ))}
                  {sesi.peran === "pemilik" && <button type="button" onClick={() => hapus(p.id)} className="grid h-9 w-9 place-items-center rounded-full text-[#A63A22] hover:bg-[#FBE4DD]" aria-label="Hapus permintaan"><IkonSampah size={17} /></button>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </KartuPanel>
  );
}
