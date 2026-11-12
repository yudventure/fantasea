import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { buatT } from "@/lib/i18n/t";
import { getMessages } from "@/lib/i18n/messages";
import { tx, txDaftar, type Konten } from "@/lib/konten";
import { nomorWaAsli, tautanWa } from "@/lib/whatsapp";
import { isiJudul } from "./Judul";
import { KepalaBagianSitus } from "./Bagian";

export function AboutFantasea({ k, l }: { k: Konten; l: Locale }) {
  const b = k.about;
  const t = buatT(getMessages(l));
  const legal = [[t("about.legalEntity"), b.badan], [t("about.registration"), tx(b.registrasi, l)], [t("about.nib"), b.nib], [t("about.location"), tx(b.lokasi, l)], [t("about.activities"), tx(b.kegiatan, l)]];
  return <section id="about" className="py-16 sm:py-24">
    <div className="wrap">
      <div className="relative overflow-hidden rounded-[32px] bg-navy p-6 text-white sm:p-10 lg:p-14">
        <Image src="/brand/grafis/ukir-sayap-putih.svg" alt="" width={993} height={835} aria-hidden className="pointer-events-none absolute -right-20 -top-20 w-[620px] max-w-none opacity-[0.05]" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="aksen text-ukir">{tx(b.label, l)}</p>
            <h2 className="mt-4 text-[clamp(40px,5.5vw,68px)] text-white">{isiJudul(tx(b.judul, l), "text-ukir")}</h2>
            {tx(b.lead, l) && <p className="mt-5 text-lg font-bold text-kabut">{tx(b.lead, l)}</p>}
            <div className="mt-6 grid gap-4 text-[16px] leading-relaxed text-kabut">{txDaftar(b.paragraf, l).map((x, i) => <p key={i}>{x}</p>)}</div>
          </div>
          <div className="self-start rounded-[24px] border border-white/15 bg-white/5 p-6 sm:p-8">
            <h3 className="text-[28px] text-white">{t("about.company")}</h3>
            <dl className="mt-5 grid gap-5">{legal.filter(([, v]) => v).map(([label, value]) => <div key={label}>
              <dt className="text-xs font-extrabold uppercase tracking-wider text-ukir">{label}</dt>
              <dd className="mt-1.5 break-words text-[15px] leading-relaxed text-white">{value}</dd>
            </div>)}</dl>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

function PetaRute({ l }: { l: Locale }) {
  const t = buatT(getMessages(l));
  const pin = (x: number, y: number, n: string) => <g transform={`translate(${x} ${y})`}>
    <path d="M0 15 C-34-23-27-49 0-49 C27-49 34-23 0 15Z" fill="#1264A8" stroke="#FFFFFF" strokeWidth="4" />
    <circle cy="-23" r="14" fill="#FFFFFF" /><text y="-18" textAnchor="middle" fontSize="16" fontWeight="800" fill="#203149">{n}</text>
  </g>;
  return <figure className="overflow-hidden rounded-[28px] border border-line bg-buih shadow-card">
    <svg viewBox="0 0 800 560" role="img" aria-labelledby={`peta-judul-${l} peta-ket-${l}`} className="block h-auto w-full" style={{ fontFamily: "var(--font-isi), sans-serif" }}>
      <title id={`peta-judul-${l}`}>{t("about.mapTitle")}</title>
      <desc id={`peta-ket-${l}`}>{t("about.mapDescription")}</desc>
      <defs><linearGradient id={`laut-${l}`} x2="0" y2="1"><stop stopColor="#EEF5F9" /><stop offset="1" stopColor="#C3D6E2" /></linearGradient></defs>
      <rect width="800" height="560" fill={`url(#laut-${l})`} />
      <path d="M0 0H505Q480 66 405 91T282 162T141 196L0 224Z" fill="#C3D6E2" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M0 0H466Q425 43 359 68T239 128T95 160L0 177Z" fill="#EEF5F9" />
      <path d="M410 560Q487 500 565 476T800 370V560Z" fill="#EEF5F9" stroke="#FFFFFF" strokeWidth="3" />
      <g fill="#EEF5F9" stroke="#FFFFFF" strokeWidth="2"><ellipse cx="94" cy="382" rx="62" ry="23" /><ellipse cx="215" cy="493" rx="44" ry="14" /><ellipse cx="608" cy="196" rx="32" ry="12" /><ellipse cx="700" cy="245" rx="24" ry="10" /><ellipse cx="652" cy="153" rx="16" ry="6" /></g>
      <g fill="none" stroke="#FFFFFF" strokeWidth="3" opacity=".8"><path d="M65 290q12-9 24 0t24 0M335 244q12-9 24 0t24 0M555 300q12-9 24 0t24 0M315 450q12-9 24 0t24 0M140 450q12-9 24 0t24 0" /></g>
      <text x="30" y="45" fontSize="20" fill="#55657A">{t("about.waigeo")}</text>
      <text x="126" y="273" fontSize="19" fontStyle="italic" fill="#55657A">{t("about.strait")}</text>
      <path d="M704 470C605 493 503 453 432 388S334 207 183 139" fill="none" stroke="#203149" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
      <g transform="translate(438 368)"><path d="M-24-3H26L16 12H-15Z" fill="#203149" stroke="#FFFFFF" strokeWidth="2" /><path d="M-15-5L-9-19H11L18-5Z" fill="#FFFFFF" stroke="#1264A8" strokeWidth="2" /><path d="M-28 20q12-7 24 0t24 0" stroke="#FFFFFF" strokeWidth="3" fill="none" /></g>
      {/* Jalur udara masuk ke Sorong, dibedakan dari lintasan feri. */}
      <path data-peta="jalur-udara" d="M767 70C774 172 754 302 711 450" fill="none" stroke="#55657A" strokeWidth="2.5" strokeDasharray="5 10" strokeLinecap="round" opacity=".55" />
      <g data-peta="pesawat" transform="translate(753 237) rotate(10)">
        <path d="M0 38C-5 35-6 23-6 11L-32-4V-11L-6-4V-22L-17-29V-35L-3-31L0-36L3-31L17-35V-29L6-22V-4L32-11V-4L6 11C6 23 5 35 0 38Z" fill="#203149" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
        <path d="M-2 22Q0 27 2 22" fill="none" stroke="#30A6DE" strokeWidth="2" />
      </g>
      <g data-peta="landasan" transform="translate(704 474) rotate(-15)">
        <rect x="-55" y="-13" width="110" height="26" rx="4" fill="#C3D6E2" stroke="#FFFFFF" strokeWidth="3" />
        <rect x="-50" y="-9" width="100" height="18" rx="2" fill="#55657A" />
        <path d="M-34 0H34" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="8 6" />
        <path d="M-44-6V6M-39-6V6M39-6V6M44-6V6" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M-5 13V25H19" fill="none" stroke="#C3D6E2" strokeWidth="6" />
        <rect x="17" y="20" width="20" height="12" rx="2" fill="#FFFFFF" stroke="#C3D6E2" strokeWidth="2" />
      </g>
      {pin(627, 469, "1")}{pin(439, 336, "2")}
      <g data-peta="fantasea-waisai">
        <path d="M173 134L183 147L193 134" fill="#FFFFFF" />
        <rect x="129" y="62" width="108" height="76" rx="16" fill="#FFFFFF" stroke="#C3D6E2" strokeWidth="2" />
        <image href="/brand/logo/fantasea-logo-utama.png" x="137" y="71" width="92" height="57" preserveAspectRatio="xMidYMid meet" />
      </g>
      <text x="605" y="526" fontSize="26" fontWeight="800" letterSpacing="3" fill="#203149">SORONG</text>
      <text x="251" y="100" fontSize="26" fontWeight="800" letterSpacing="3" fill="#203149">WAISAI</text>
      <text x="570" y="38" fontSize="12" fontWeight="700" fill="#55657A">{t("about.mapNote")}</text>
    </svg>
    <figcaption className="bg-white px-5 py-3 text-xs text-ink2">{t("about.mapDescription")}</figcaption>
  </figure>;
}

export function RuteWaisai({ k, l }: { k: Konten; l: Locale }) {
  const b = k.rute;
  const t = buatT(getMessages(l));
  const wa = tautanWa(nomorWaAsli(k.situs.kontak.whatsapp), t("about.routeMessage"));
  return <section id="lokasi" className="bg-soft py-16 sm:py-24">
    <div className="wrap">
      <KepalaBagianSitus b={b} l={l} />
      <div className="mt-10 grid items-start gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <PetaRute l={l} />
        <div>
          <ol className="grid gap-4">{b.langkah.map((x, i) => <li key={i} className="flex gap-4 rounded-card border border-line bg-white p-5 sm:p-6">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-tanda font-extrabold text-white">{i + 1}</span>
            <div><h3 className="text-[25px]">{tx(x.judul, l)}</h3><p className="mt-2 text-sm leading-relaxed text-ink2">{tx(x.isi, l)}</p></div>
          </li>)}</ol>
          <p className="mt-6 text-sm leading-relaxed text-ink2">{tx(b.catatan, l)}</p>
          {wa && tx(b.tombol, l) && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-koral mt-5">{tx(b.tombol, l)}</a>}
        </div>
      </div>
    </div>
  </section>;
}
