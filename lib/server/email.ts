import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { envText } from "@/lib/env";

/**
 * Pengirim email lewat SMTP (pola DAMPIER, lib/server/email.ts). Dipakai
 * untuk kode lupa kata sandi panel. Semua pengaturannya dari variabel
 * environment di hPanel, bukan dari panel, karena kata sandi email tidak
 * boleh tersimpan di isi situs. Untuk akun email Hostinger:
 *
 *   SMTP_HOST   smtp.hostinger.com
 *   SMTP_PORT   465   (SSL, 587 untuk STARTTLS)
 *   SMTP_USER   halo@fantaseadivetravel.com
 *   SMTP_PASS   kata sandi akun email itu
 *   EMAIL_DARI  halo@fantaseadivetravel.com   (boleh "-", memakai SMTP_USER)
 *
 * Selama host, user, atau sandi masih "-" atau kosong, email tidak dikirim
 * dan panel mengatakannya. Disiapkan November 2026, tinggal diisi di hPanel.
 */
interface Konfigurasi { host: string; port: number; secure: boolean; user: string; pass: string; dari: string }

function konfigurasi(): Konfigurasi | null {
  const host = envText("SMTP_HOST"), user = envText("SMTP_USER"), pass = envText("SMTP_PASS");
  if (!host || !user || !pass) return null;
  const port = Number.parseInt(envText("SMTP_PORT") || "465", 10) || 465;
  return { host, port, secure: port === 465, user, pass, dari: envText("EMAIL_DARI") || user };
}

export const emailAktif = () => konfigurasi() !== null;

/** Untuk panel, tanpa kata sandi. */
export function statusEmail() {
  const k = konfigurasi();
  return k ? { aktif: true as const, host: k.host, port: k.port, dari: k.dari } : { aktif: false as const };
}

let simpan: { kunci: string; t: Transporter } | null = null;

export async function kirimEmail({ ke, subjek, teks, html }: { ke: string; subjek: string; teks: string; html: string }): Promise<void> {
  const k = konfigurasi();
  if (!k) throw new Error("Email sistem belum dipasang.");
  const kunci = `${k.host}:${k.port}:${k.user}:${k.pass}`;
  if (simpan?.kunci !== kunci) {
    simpan = {
      kunci,
      t: nodemailer.createTransport({
        host: k.host, port: k.port, secure: k.secure, auth: { user: k.user, pass: k.pass },
        connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 20_000,
      }),
    };
  }
  await simpan.t.sendMail({ from: { name: "Fantasea Dive Travel", address: k.dari }, to: ke, subject: subjek, text: teks, html });
}
