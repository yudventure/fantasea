import { MAKS_BITA, simpanFoto } from "@/lib/server/unggahan";
import { jsonTanpaCache, wajib } from "@/lib/server/sesi";
import { bolehUbahIsi } from "@/lib/peran";

/** Unggah satu foto dari panel (sudah diperkecil di peramban). */
export async function POST(req: Request) {
  const s = await wajib(req, (x) => bolehUbahIsi(x.peran));
  if (s instanceof Response) return s;
  const panjang = Number(req.headers.get("content-length") ?? 0);
  if (panjang > MAKS_BITA + 64 * 1024) return jsonTanpaCache({ galat: "Foto terlalu besar. Paling besar 8 MB." }, { status: 413 });
  const form = await req.formData().catch(() => null);
  const berkas = form?.get("berkas");
  if (!berkas || typeof berkas === "string") return jsonTanpaCache({ galat: "Pilih foto dulu." }, { status: 400 });
  if (berkas.size > MAKS_BITA) return jsonTanpaCache({ galat: "Foto terlalu besar. Paling besar 8 MB." }, { status: 413 });
  try {
    const alamat = await simpanFoto(Buffer.from(await berkas.arrayBuffer()));
    return jsonTanpaCache({ alamat });
  } catch (e) {
    return jsonTanpaCache({ galat: (e as Error).message }, { status: 400 });
  }
}
