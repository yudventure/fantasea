"use client";
import { useRef, useState } from "react";
import { idBaru, slugDari, tx, type Homestay, type Konten } from "@/lib/konten";
import { bacaHomestayMd, contohHomestayMd, homestayKeMd, homestayKosong } from "@/lib/homestay-md";
import type { Ubah } from "./Panel";

interface HasilBerkas { berkas: string; nama: string; status: "diperbarui" | "ditambahkan" | "gagal"; diisi: string[]; peringatan: string[] }

/** Mengunduh teks sebagai berkas .md di peramban. */
export function unduhMd(nama: string, isi: string) {
  const url = URL.createObjectURL(new Blob([isi], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = nama;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const unduhHomestayMd = (h: Homestay) => unduhMd(`${h.slug || "homestay"}.md`, homestayKeMd(h));

/**
 * Isi dari berkas .md di panel Homestay (permintaan pemilik, November 2026,
 * pola DAMPIER). Satu atau banyak berkas sekaligus. Tiap berkas dicocokkan
 * dengan homestay yang ada dari alamat halaman lalu nama, yang belum ada
 * ditambahkan dan disembunyikan dulu. Hasilnya masuk draf seperti isian
 * panel lain, jadi baru tayang setelah Simpan perubahan.
 */
export default function ImporHomestay({ k, ubah, onBuka }: { k: Konten; ubah: Ubah; onBuka: (id: string) => void }) {
  const masukan = useRef<HTMLInputElement>(null);
  const [hasil, setHasil] = useState<HasilBerkas[]>([]);
  const [proses, setProses] = useState(false);

  async function pilih(daftar: FileList | null) {
    if (!daftar?.length) return;
    setProses(true);
    const semua: HasilBerkas[] = [];
    const sudah = new Set<string>();
    const rencana: { id: string; baru: boolean; terapkan: (h: Homestay) => string[]; slug: string }[] = [];
    for (const berkas of Array.from(daftar).slice(0, 60)) {
      if (berkas.size > 200_000) { semua.push({ berkas: berkas.name, nama: berkas.name, status: "gagal", diisi: [], peringatan: ["Berkas lebih dari 200 KB. Satu berkas .md cukup untuk satu homestay."] }); continue; }
      const isi = await berkas.text().catch(() => "");
      if (!isi.trim()) { semua.push({ berkas: berkas.name, nama: berkas.name, status: "gagal", diisi: [], peringatan: ["Berkas kosong atau tidak bisa dibaca."] }); continue; }
      const b = bacaHomestayMd(isi);
      const namaKecil = (s: string) => s.trim().toLowerCase();
      const cocok = k.homestay.find((h) => b.slug && h.slug === b.slug)
        ?? k.homestay.find((h) => b.nama.en && [h.nama.en, h.nama.id].map(namaKecil).includes(namaKecil(b.nama.en)));
      if (!cocok && !b.nama.en) { semua.push({ berkas: berkas.name, nama: berkas.name, status: "gagal", diisi: [], peringatan: [...b.peringatan, "Homestay tidak ditemukan dan berkas tidak menulis nama, jadi tidak ada yang ditambahkan."] }); continue; }
      const id = cocok?.id ?? idBaru("h");
      if (sudah.has(id)) { semua.push({ berkas: berkas.name, nama: tx(cocok!.nama, "id"), status: "gagal", diisi: [], peringatan: ["Homestay yang sama sudah diisi dari berkas lain di pilihan ini. Berkas ini dilewati."] }); continue; }
      sudah.add(id);
      // Coba di salinan dulu, untuk daftar kolom yang terisi.
      const uji = structuredClone(cocok ?? homestayKosong(id, ""));
      const diisi = b.terapkan(uji);
      rencana.push({ id, baru: !cocok, terapkan: b.terapkan, slug: b.slug || slugDari(b.nama.en) });
      semua.push({ berkas: berkas.name, nama: uji.nama.id || uji.nama.en, status: cocok ? "diperbarui" : "ditambahkan", diisi, peringatan: b.peringatan });
    }
    if (rencana.length) {
      ubah((d) => {
        for (const r of rencana) {
          let h = d.homestay.find((x) => x.id === r.id);
          if (!h) { h = homestayKosong(r.id, r.slug || `homestay-${d.homestay.length + 1}`); d.homestay.push(h); }
          r.terapkan(h);
          if (r.baru && !h.slug) h.slug = `homestay-${d.homestay.length}`;
        }
        // Alamat halaman tetap unik.
        const dipakai = new Set<string>();
        for (const h of d.homestay) { let s = h.slug, n = 2; while (dipakai.has(s)) s = `${h.slug}-${n++}`; h.slug = s; dipakai.add(s); }
      });
      if (rencana.length === 1) onBuka(rencana[0].id);
    }
    setHasil(semua);
    setProses(false);
    if (masukan.current) masukan.current.value = "";
  }

  const berhasil = hasil.filter((h) => h.status !== "gagal").length;
  return (
    <div className="grid gap-3 rounded-card border border-line bg-soft p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-[60ch]">
          <p className="text-[15px] font-extrabold text-navy">Isi dari berkas .md</p>
          <p className="mt-0.5 text-[13px] text-ink2">Pilih satu atau beberapa berkas .md sekaligus. Homestay dicocokkan dari alamat halaman, lalu dari nama. Yang belum ada ditambahkan dan disembunyikan dulu. Bagian yang tidak ditulis di berkas tidak mengubah isian panel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => unduhMd("contoh-homestay.md", contohHomestayMd())} className="rounded-pill bg-white px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-buih">Unduh contoh .md</button>
          <button type="button" disabled={proses} onClick={() => masukan.current?.click()} className="rounded-pill bg-navy px-4 py-2 text-[13px] font-bold text-white disabled:opacity-60">{proses ? "Membaca berkas" : "Pilih berkas .md"}</button>
          <input ref={masukan} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" multiple hidden onChange={(e) => pilih(e.target.files)} aria-label="Pilih berkas .md homestay" />
        </div>
      </div>
      {hasil.length > 0 && (
        <div className="grid gap-2" role="status">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-in bg-buih px-3.5 py-2.5">
            <p className="text-[13.5px] font-semibold text-navy">{berhasil > 0 ? `${berhasil} homestay terisi dari berkas. Periksa isinya, lalu tekan Simpan perubahan supaya tayang.` : "Tidak ada homestay yang terisi dari berkas ini."}</p>
            <button type="button" onClick={() => setHasil([])} className="rounded-pill px-3 py-1 text-[13px] font-bold text-navy hover:bg-white">Tutup hasil</button>
          </div>
          <ul className="grid gap-2">
            {hasil.map((h, i) => (
              <li key={`${h.berkas}-${i}`} className="rounded-in bg-white px-3.5 py-2.5 text-[13px]">
                <p className="font-extrabold text-navy">{h.nama} <span className={`ml-1 rounded-pill px-2 py-0.5 text-[11.5px] ${h.status === "gagal" ? "bg-[#FBE4DD] text-[#A63A22]" : h.status === "ditambahkan" ? "bg-[#FFF4DD] text-[#8A5A00]" : "bg-buih text-navy"}`}>{h.status === "gagal" ? "Tidak dipakai" : h.status === "ditambahkan" ? "Ditambahkan, masih disembunyikan" : "Diperbarui"}</span></p>
                <p className="text-ink2">{h.berkas}{h.diisi.length ? `. Terisi ${h.diisi.join(", ")}.` : ""}</p>
                {h.peringatan.length > 0 && (
                  <ul className="mt-1 grid gap-0.5 text-[#8A5A00]">
                    {h.peringatan.map((p, j) => <li key={j}>{p}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
