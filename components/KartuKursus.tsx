import Image from "next/image";
import { tx, type KursusSelam } from "@/lib/konten";
import type { Locale } from "@/lib/i18n/config";
import { buatT } from "@/lib/i18n/t";
import { getMessages } from "@/lib/i18n/messages";
import { nomorWaAsli, tautanWa } from "@/lib/whatsapp";
import { IkonJam, IkonMasker, IkonCentang, IkonPanahKanan } from "./Ikon";

export default function KartuKursus({ daftar, l, nomor }: { daftar: KursusSelam[]; l: Locale; nomor: string }) {
  const t = buatT(getMessages(l));
  return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {daftar.filter((x) => x.tampil).map((x) => {
      const nama = tx(x.nama, l);
      const wa = tautanWa(nomorWaAsli(nomor), t("course.message", { course: nama }));
      const harga = new Intl.NumberFormat(l === "id" ? "id-ID" : "en-US", { style: "currency", currency: "USD", currencyDisplay: "code", minimumFractionDigits: x.hargaUsd % 1 ? 2 : 0 }).format(x.hargaUsd);
      return <article key={x.id} className="flex flex-col overflow-hidden rounded-[28px] border border-line bg-white shadow-card transition hover:shadow-lift">
        <div className="relative aspect-[16/10] bg-kabut">
          {x.foto && <Image src={x.foto} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px" className="object-cover" />}
          <span className="absolute bottom-4 left-4 rounded-pill bg-white px-4 py-2 text-xs font-extrabold text-navy">{nama.startsWith("PADI") ? "PADI" : nama.startsWith("SSI") ? "SSI" : t("course.label")}</span>
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="text-[28px] leading-tight">{nama}</h3>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-ink2">
            <span className="inline-flex items-center gap-1.5"><IkonJam size={16} />{t("course.days", { n: x.hari })}</span>
            <span className="inline-flex items-center gap-1.5"><IkonMasker size={16} />{t("course.dives", { n: x.selam })}</span>
            {x.alat && <span className="inline-flex items-center gap-1.5"><IkonCentang size={16} />{t("course.gear")}</span>}
          </div>
          {tx(x.lokasi, l) && <p className="mt-3 text-sm text-ink2">{tx(x.lokasi, l)}</p>}
          <div className="mt-auto pt-7">
            <p className="font-display text-[38px] leading-none text-navy">{harga}</p>
            <p className="mt-2 text-sm text-ink2">{t("course.perPerson")}</p>
            {x.pembayaran && x.hargaUsd > 0 ? <a href={x.pembayaran} className="btn btn-koral mt-5 w-full">{t("course.pay")}<IkonPanahKanan size={16} /></a> : <>
              <button disabled className="btn mt-5 w-full cursor-not-allowed bg-buih text-ink2" aria-describedby={`bayar-${x.id}`}>{t("course.pay")}</button>
              <p id={`bayar-${x.id}`} className="mt-2 text-center text-xs text-ink2">{t("course.paymentPending")}</p>
            </>}
            {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-garis mt-3 w-full text-center text-sm">{t("course.ask")}</a> : <>
              <button disabled className="btn btn-garis mt-3 w-full cursor-not-allowed text-center text-sm opacity-50" aria-describedby={`wa-${x.id}`}>{t("course.ask")}</button>
              <p id={`wa-${x.id}`} className="mt-2 text-center text-xs text-ink2">{t("course.whatsappPending")}</p>
            </>}
          </div>
        </div>
      </article>;
    })}
  </div>;
}
