"use client";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

/** Halaman 404 di dalam tata letak bahasa, jadi teksnya ikut bahasa alamat. */
export default function TidakAda() {
  const { t, locale } = useI18n();
  return (
    <main className="grid min-h-[80vh] place-items-center px-4 py-16">
      <div className="grid max-w-[920px] items-center gap-10 md:grid-cols-2">
        <Image src="/brand/logo/fantasea-manta.png" alt="" width={993} height={835} unoptimized className="mx-auto w-[260px] -rotate-6 md:w-[340px]" />
        <div>
          <p className="aksen">{t("galat404.label")}</p>
          <h1 className="mt-2 text-[clamp(48px,8vw,84px)]">{t("galat404.judul")}</h1>
          <p className="mt-4 text-[17px] text-ink2">{t("galat404.lead")}</p>
          <Link href={`/${locale}`} className="btn btn-navy mt-7">{t("galat404.tombol")}</Link>
        </div>
      </div>
    </main>
  );
}
