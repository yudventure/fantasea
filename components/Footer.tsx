import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buatT } from "@/lib/i18n/t";
import { getMessages } from "@/lib/i18n/messages";
import { tx, type Konten } from "@/lib/konten";
import { nomorTampil, tautanWa } from "@/lib/whatsapp";
import { IkonFacebook, IkonInstagram, IkonPin, IkonSurel, IkonTiktok, IkonWhatsapp, IkonYoutube } from "./Ikon";
import type { TautanMenu } from "./Header";

export default function Footer({ k, l, menu }: { k: Konten; l: Locale; menu: TautanMenu[] }) {
  const t = buatT(getMessages(l));
  const { kontak, sosial } = k.situs;
  const wa = tautanWa(kontak.whatsapp, t("pesanWa.umum"));
  const sos = [
    { href: sosial.instagram, ikon: IkonInstagram, nama: "Instagram" },
    { href: sosial.facebook, ikon: IkonFacebook, nama: "Facebook" },
    { href: sosial.tiktok, ikon: IkonTiktok, nama: "TikTok" },
    { href: sosial.youtube, ikon: IkonYoutube, nama: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-malam text-kabut">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,1fr))] lg:py-16">
        <div>
          <Image src="/brand/logo/fantasea-logo-latar-gelap.png" alt="Fantasea Dive Travel" width={1617} height={1004} unoptimized className="h-auto w-[180px]" />
          {tx(k.footer.tentang, l) && <p className="mt-5 max-w-[38ch] text-[15px]">{tx(k.footer.tentang, l)}</p>}
        </div>
        <div>
          <p className="font-aksen text-[13px] uppercase tracking-[0.2em] text-ukir">{t("footer.jelajahi")}</p>
          <ul className="mt-4 grid gap-2.5">
            {menu.map((m) => <li key={m.href}><Link href={m.href} className="text-[15px] font-semibold text-white/85 hover:text-white">{m.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="font-aksen text-[13px] uppercase tracking-[0.2em] text-ukir">{t("footer.kontak")}</p>
          <ul className="mt-4 grid gap-3 text-[15px]">
            {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2.5 font-semibold text-white/85 hover:text-white"><IkonWhatsapp size={19} className="flex-none" />{nomorTampil(kontak.whatsapp)}</a></li>}
            {/* Alamat email panjang boleh patah di mana saja, supaya kolom kontak yang sempit (768 px) tidak menggeser halaman ke samping. */}
            {kontak.email && <li><a href={`mailto:${kontak.email}`} className="inline-flex max-w-full items-center gap-2.5 font-semibold text-white/85 hover:text-white"><IkonSurel size={19} className="flex-none" /><span className="min-w-0 [overflow-wrap:anywhere]">{kontak.email}</span></a></li>}
            {tx(kontak.alamat, l) && (
              <li className="flex items-start gap-2.5"><IkonPin size={19} className="mt-0.5 flex-none" />
                {kontak.peta ? <a href={kontak.peta} target="_blank" rel="noopener noreferrer" className="font-semibold text-white/85 hover:text-white">{tx(kontak.alamat, l)}</a> : <span>{tx(kontak.alamat, l)}</span>}
              </li>
            )}
          </ul>
          {sos.length > 0 && (
            <>
              <p className="mt-7 font-aksen text-[13px] uppercase tracking-[0.2em] text-ukir">{t("footer.ikuti")}</p>
              <div className="mt-3 flex gap-2">
                {sos.map(({ href, ikon: Ikon, nama }) => (
                  <a key={nama} href={href} target="_blank" rel="noopener noreferrer" aria-label={nama} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"><Ikon size={19} /></a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="wrap flex flex-wrap items-center justify-between gap-3 pb-8 text-[13.5px] text-kabut/80">
        <span>{t("footer.hak", { tahun: new Date().getFullYear() })}</span>
        <Link href="/admin" className="font-semibold hover:text-white" rel="nofollow">{t("footer.masuk")}</Link>
      </div>
    </footer>
  );
}
