"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { rentangTanggal } from "@/lib/format";
import { tautanWa } from "@/lib/whatsapp";
import DatePicker from "./DatePicker";
import Dropdown from "./Dropdown";
import { IkonKurang, IkonTambah, IkonWhatsapp } from "./Ikon";

export interface PilihanJadwal { id: string; mulai: string; selesai: string; sisa: number }

/** Tanggal YYYY-MM-DD ditambah n hari. */
const tambahHari = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/**
 * Formulir permintaan pesan (request to book tanpa bayar). Tamu memilih
 * tanggal open trip atau tanggal sendiri, jumlah orang, dan kontaknya.
 * Untuk homestay (`jenis` homestay) tamu memilih tanggal masuk dan keluar.
 * Permintaan tersimpan di panel (/api/permintaan), lalu tamu bisa langsung
 * melanjutkan obrolan lewat WhatsApp dengan pesan yang sudah terisi.
 */
export default function FormPermintaan({ jenis = "trip", itemId, itemNama, jadwal, jadwalAwal, hariIni, wa }: {
  jenis?: "trip" | "homestay"; itemId: string; itemNama: string; jadwal: PilihanJadwal[]; jadwalAwal: string; hariIni: string; wa: string;
}) {
  const { t, locale } = useI18n();
  const menginap = jenis === "homestay";
  const adaJadwal = !menginap && jadwal.some((j) => j.sisa > 0);
  const [mode, setMode] = useState<"jadwal" | "sendiri">(adaJadwal ? "jadwal" : "sendiri");
  const [jadwalId, setJadwalId] = useState(jadwal.find((j) => j.id === jadwalAwal && j.sisa > 0)?.id ?? "");
  const [mulai, setMulai] = useState("");
  const [keluar, setKeluar] = useState("");
  const [orang, setOrang] = useState(2);
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");
  const [email, setEmail] = useState("");
  const [catatan, setCatatan] = useState("");
  const [jebakan, setJebakan] = useState("");
  const [galat, setGalat] = useState<Record<string, string>>({});
  const [kirim, setKirim] = useState(false);
  const [hasil, setHasil] = useState<{ kode: string; mulai: string; selesai: string } | null>(null);
  const [galatUmum, setGalatUmum] = useState("");

  const pilihanTerpilih = jadwal.find((j) => j.id === jadwalId);
  const maksOrang = mode === "jadwal" && pilihanTerpilih ? Math.max(1, pilihanTerpilih.sisa) : 30;

  function periksa() {
    const g: Record<string, string> = {};
    if (mode === "jadwal" && !jadwalId) g.tanggal = t("form.wajib");
    if (mode === "sendiri" && !mulai) g.tanggal = t("form.wajib");
    if (menginap && !keluar) g.keluar = t("form.wajib");
    else if (menginap && mulai && keluar <= mulai) g.keluar = t("form.keluarSalah");
    if (nama.trim().length < 2) g.nama = t("form.wajib");
    const angka = nomor.replace(/[^\d]/g, "");
    if (angka.length < 8 || angka.length > 16) g.nomor = nomor.trim() ? t("form.waSalah") : t("form.wajib");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) g.email = t("form.emailSalah");
    setGalat(g);
    return Object.keys(g).length === 0;
  }

  async function ajukan(e: React.FormEvent) {
    e.preventDefault();
    setGalatUmum("");
    if (!periksa()) return;
    setKirim(true);
    try {
      const r = await fetch("/api/permintaan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(menginap ? { homestayId: itemId, selesai: keluar } : { tripId: itemId }),
          jadwalId: mode === "jadwal" ? jadwalId : "", mulai: mode === "sendiri" ? mulai : "",
          orang: Math.min(orang, maksOrang), nama, whatsapp: nomor, email, catatan, bahasa: locale, situs: jebakan,
        }),
      });
      const o = (await r.json().catch(() => ({}))) as { kode?: string; mulai?: string; selesai?: string; galat?: string };
      if (!r.ok || !o.kode) { setGalatUmum(o.galat || t("form.galat")); return; }
      setHasil({ kode: o.kode, mulai: o.mulai ?? "", selesai: o.selesai ?? "" });
    } catch {
      setGalatUmum(t("form.galat"));
    } finally {
      setKirim(false);
    }
  }

  if (hasil) {
    const tanggal = rentangTanggal(hasil.mulai, hasil.selesai, locale);
    const pesan = [menginap ? t("pesanWa.salamHomestay", { homestay: itemNama }) : t("pesanWa.salam", { trip: itemNama }), t("pesanWa.kode", { kode: hasil.kode }), tanggal && t("pesanWa.tanggal", { tanggal }), t("pesanWa.orang", { n: orang }), t("pesanWa.nama", { nama: nama.trim() })].filter(Boolean).join("\n");
    const link = tautanWa(wa, pesan);
    return (
      <div className="rounded-card bg-white p-6 shadow-lift" role="status">
        <p className="aksen">{t("form.berhasil")}</p>
        <p className="mt-3 text-[14px] font-bold text-ink2">{t("form.kode")}</p>
        <p className="font-display text-[40px] leading-none text-navy">{hasil.kode}</p>
        <p className="mt-4 text-[15px] text-ink2">{t("form.berhasilLead")}</p>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-koral mt-5 w-full"><IkonWhatsapp size={20} />{t("form.lanjutWa")}</a>
        )}
        <button type="button" onClick={() => { setHasil(null); setJadwalId(""); setMulai(""); setKeluar(""); }} className="btn btn-terang mt-3 w-full">{t("form.lagi")}</button>
      </div>
    );
  }

  return (
    <form onSubmit={ajukan} noValidate className="rounded-card bg-white p-5 shadow-lift sm:p-6">
      <h2 className="text-[34px]">{menginap ? t("form.judulHomestay") : t("form.judul")}</h2>
      <p className="mt-2 text-[14.5px] text-ink2">{menginap ? t("form.leadHomestay") : t("form.lead")}</p>

      <div className="mt-5 grid gap-4">
        {adaJadwal && (
          <fieldset>
            <legend className="kolom-label">{t("form.jenisTanggal")}</legend>
            <div className="grid grid-cols-2 gap-1 rounded-pill bg-buih p-1">
              {(["jadwal", "sendiri"] as const).map((m) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => { setMode(m); setGalat((g) => ({ ...g, tanggal: "" })); }}
                  className={`rounded-pill px-3 py-2 text-[14px] font-extrabold transition ${mode === m ? "bg-white text-navy shadow-card" : "text-navy/60"}`}>
                  {m === "jadwal" ? t("form.pakaiJadwal") : t("form.pakaiSendiri")}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          {mode === "jadwal" ? (
            <Dropdown label={t("form.pakaiJadwal")} value={jadwalId} onChange={(v) => { setJadwalId(v); setGalat((g) => ({ ...g, tanggal: "" })); }} kosong={t("form.pilihJadwal")}
              pilihan={jadwal.map((j) => ({ nilai: j.id, label: rentangTanggal(j.mulai, j.selesai, locale), catatan: j.sisa > 0 ? t("form.sisa", { n: j.sisa }) : t("form.penuh"), mati: j.sisa <= 0 }))} />
          ) : (
            <DatePicker value={mulai} onChange={(v) => { setMulai(v); if (menginap && keluar && keluar <= v) setKeluar(""); setGalat((g) => ({ ...g, tanggal: "" })); }} min={hariIni} locale={locale} label={menginap ? t("form.masuk") : t("form.tanggal")}
              teks={{ pilih: t("form.pilihTanggal"), sebelum: t("kalender.sebelum"), berikut: t("kalender.berikut"), hariIni: t("kalender.hariIni"), hapus: t("kalender.hapus") }} />
          )}
          {galat.tanggal && <p className="kolom-galat">{galat.tanggal}</p>}
        </div>

        {menginap && (
          <div>
            <DatePicker value={keluar} onChange={(v) => { setKeluar(v); setGalat((g) => ({ ...g, keluar: "" })); }} min={tambahHari(mulai || hariIni, 1)} locale={locale} label={t("form.keluar")}
              teks={{ pilih: t("form.pilihTanggal"), sebelum: t("kalender.sebelum"), berikut: t("kalender.berikut"), hariIni: t("kalender.hariIni"), hapus: t("kalender.hapus") }} />
            {galat.keluar && <p className="kolom-galat">{galat.keluar}</p>}
          </div>
        )}

        <div>
          <span className="kolom-label" id="label-orang">{t("form.orang")}</span>
          <div className="flex items-center gap-3" role="group" aria-labelledby="label-orang">
            <button type="button" className="btn-bulat" onClick={() => setOrang((n) => Math.max(1, n - 1))} aria-label={t("form.kurangi")} disabled={orang <= 1}><IkonKurang /></button>
            <span className="min-w-[3ch] text-center font-display text-[30px] text-navy" aria-live="polite">{Math.min(orang, maksOrang)}</span>
            <button type="button" className="btn-bulat" onClick={() => setOrang((n) => Math.min(maksOrang, n + 1))} aria-label={t("form.tambah")} disabled={orang >= maksOrang}><IkonTambah /></button>
          </div>
        </div>

        <div>
          <label htmlFor="f-nama" className="kolom-label">{t("form.nama")}</label>
          <input id="f-nama" className="kolom" value={nama} onChange={(e) => setNama(e.target.value)} autoComplete="name" maxLength={80} aria-invalid={!!galat.nama} />
          {galat.nama && <p className="kolom-galat">{galat.nama}</p>}
        </div>
        <div>
          <label htmlFor="f-wa" className="kolom-label">{t("form.wa")}</label>
          <input id="f-wa" className="kolom" value={nomor} onChange={(e) => setNomor(e.target.value)} inputMode="tel" autoComplete="tel" placeholder={t("form.waContoh")} maxLength={24} aria-invalid={!!galat.nomor} />
          {galat.nomor && <p className="kolom-galat">{galat.nomor}</p>}
        </div>
        <div>
          <label htmlFor="f-email" className="kolom-label">{t("form.email")}</label>
          <input id="f-email" className="kolom" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={120} aria-invalid={!!galat.email} />
          {galat.email && <p className="kolom-galat">{galat.email}</p>}
        </div>
        <div>
          <label htmlFor="f-catatan" className="kolom-label">{t("form.catatan")}</label>
          <textarea id="f-catatan" className="kolom min-h-[92px]" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder={menginap ? t("homestay.catatanContoh") : t("form.catatanContoh")} maxLength={600} />
        </div>
        {/* Kolom jebakan untuk robot, disembunyikan dari orang. */}
        <div className="absolute -left-[9999px]" aria-hidden>
          <label htmlFor="f-situs">Website</label>
          <input id="f-situs" tabIndex={-1} autoComplete="off" value={jebakan} onChange={(e) => setJebakan(e.target.value)} />
        </div>

        {galatUmum && <p className="kolom-galat" role="alert">{galatUmum}</p>}
        <button type="submit" className="btn btn-koral w-full" disabled={kirim}>{kirim ? t("form.mengirim") : t("form.kirim")}</button>
      </div>
    </form>
  );
}
