"use client";

/**
 * Memperkecil foto di peramban lalu mengunggahnya ke /api/unggah.
 * Foto dari kamera ponsel bisa belasan MB; diperkecil ke paling lebar
 * 2000 px WebP supaya hemat ruang server dan cepat dimuat tamu.
 */
const MAKS_SISI = 2000;

async function perkecil(berkas: File): Promise<Blob> {
  let gambar: ImageBitmap;
  try {
    gambar = await createImageBitmap(berkas);
  } catch {
    throw new Error("Foto ini tidak bisa dibaca peramban. Pakai JPG, PNG, atau WebP. Foto HEIC dari iPhone ubah dulu ke JPG.");
  }
  const skala = Math.min(1, MAKS_SISI / Math.max(gambar.width, gambar.height));
  const kanvas = document.createElement("canvas");
  kanvas.width = Math.round(gambar.width * skala);
  kanvas.height = Math.round(gambar.height * skala);
  kanvas.getContext("2d")!.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
  gambar.close();
  const blob = await new Promise<Blob | null>((ok) => kanvas.toBlob(ok, "image/webp", 0.82));
  if (blob && blob.type === "image/webp") return blob;
  const jpg = await new Promise<Blob | null>((ok) => kanvas.toBlob(ok, "image/jpeg", 0.85));
  if (!jpg) throw new Error("Foto gagal diproses.");
  return jpg;
}

export async function unggahFoto(berkas: File): Promise<string> {
  const blob = await perkecil(berkas);
  const form = new FormData();
  form.append("berkas", blob, blob.type === "image/webp" ? "foto.webp" : "foto.jpg");
  const r = await fetch("/api/unggah", { method: "POST", body: form, credentials: "same-origin" }).catch(() => null);
  if (!r) throw new Error("Server tidak bisa dihubungi. Periksa sambungan lalu coba lagi.");
  const o = (await r.json().catch(() => ({}))) as { alamat?: string; galat?: string };
  if (!r.ok || !o.alamat) throw new Error(o.galat ?? "Foto belum terunggah.");
  return o.alamat;
}
