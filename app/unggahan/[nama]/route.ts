import { bacaFoto, mimeDari } from "@/lib/server/unggahan";

/** Menyajikan foto unggahan dari folder data. Namanya unik, jadi boleh disimpan peramban lama. */
export async function GET(_req: Request, { params }: { params: Promise<{ nama: string }> }) {
  const { nama } = await params;
  const isi = await bacaFoto(nama);
  const mime = mimeDari(nama);
  if (!isi || !mime) return new Response("Tidak ditemukan", { status: 404 });
  return new Response(new Uint8Array(isi), {
    headers: { "content-type": mime, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
  });
}
