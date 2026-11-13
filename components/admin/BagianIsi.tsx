"use client";
import { MAKS_FOTO_GERBANG, idBaru, type Konten, type KepalaBagian } from "@/lib/konten";
import { IkonPanahAtas, IkonPanahBawah, IkonSampah, IkonTambah } from "@/components/Ikon";
import { KartuPanel, KolomAngka, ringkasTeks, KolomDaftar, KolomDua, KolomFoto, KolomTeks, PilihWarna, Saklar, Label } from "./Kolom";
import type { Ubah } from "./Panel";
import { kontakMasihContoh } from "@/data/bawaan";

const HINT_JUDUL = "Tulis kata berwarna di antara tanda bintang, misalnya *Raja Ampat*. Tekan Enter untuk pindah baris.";
const kosong = { en: "", id: "" };

export function KepalaEditor({ b, set, tanpaLead = false }: { b: KepalaBagian; set: (f: (b: KepalaBagian) => void) => void; tanpaLead?: boolean }) {
  return (
    <div className="grid gap-4">
      <KolomDua label="Label kecil" value={b.label} onChange={(v) => set((x) => { x.label = v; })} maks={80} />
      <KolomDua label="Judul" hint={HINT_JUDUL} value={b.judul} onChange={(v) => set((x) => { x.judul = v; })} panjang maks={200} />
      {!tanpaLead && <KolomDua label="Kalimat pembuka" value={b.lead} onChange={(v) => set((x) => { x.lead = v; })} panjang maks={600} />}
    </div>
  );
}

export function BagianBeranda({ k, ubah }: { k: Konten; ubah: Ubah }) {
  return (
    <div className="grid gap-6">
      <KartuPanel id="hero" judul="Bagian atas (hero)" keterangan="Judul besar di tengah, lima kartu foto mengipas, dan kalimat pendek. Satu tombol Book tampil di bawah kalimat, di luar menu.">
        <KolomDua label="Judul" hint={HINT_JUDUL} value={k.hero.judul} onChange={(v) => ubah((d) => { d.hero.judul = v; })} panjang maks={200} />
        <KolomDua label="Kalimat pendek" value={k.hero.lead} onChange={(v) => ubah((d) => { d.hero.lead = v; })} panjang maks={400} />
        <KolomDua label="Tombol Book di bawah hero" value={k.menu.pesan} onChange={(v) => ubah((d) => { d.menu.pesan = v; })} maks={30} />
        <EditorKartu judul="Kartu foto" kartu={k.hero.kartu} set={(i, f) => ubah((d) => f(d.hero.kartu[i]))} keterangan="Kartu 1 dan 5 tidak tampil di ponsel. Kartu tengah paling besar." />
      </KartuPanel>

      <KartuPanel id="jelajah" judul="Bagian kedua, pembuka homestay (kartu bertumpuk)" keterangan="Teks di kiri dan empat kartu foto bertumpuk di kanan yang bisa digeser tamu. Kartu homestay tampil di bawahnya, diatur di menu Homestay.">
        <KepalaEditor b={k.jelajah} set={(f) => ubah((d) => f(d.jelajah))} />
        <EditorKartu judul="Kartu foto" kartu={k.jelajah.kartu} set={(i, f) => ubah((d) => f(d.jelajah.kartu[i]))} />
      </KartuPanel>

      <KartuPanel id="gerbang" judul="Bagian ketiga (galeri besar)" keterangan="Satu foto lebar dengan deretan foto kecil, tombol Tonton bila ada tautan video, dan gelembung tag.">
        <KepalaEditor b={k.gerbang} set={(f) => ubah((d) => f(d.gerbang))} />
        <div className="grid gap-4 md:grid-cols-2">
          <KolomTeks label="Tautan video" hint="Alamat YouTube atau Instagram, diawali https. Kosongkan untuk menyembunyikan tombol Tonton." jenis="tautan" value={k.gerbang.video} onChange={(v) => ubah((d) => { d.gerbang.video = v; })} />
          <div className="grid gap-2">
            <KolomTeks label="Gelembung tag" hint="Contoh @piaynemo. Kosongkan untuk menyembunyikan." value={k.gerbang.tag} onChange={(v) => ubah((d) => { d.gerbang.tag = v; })} maks={40} />
            <PilihWarna value={k.gerbang.warna} onChange={(v) => ubah((d) => { d.gerbang.warna = v; })} />
          </div>
        </div>
        <div className="grid gap-3">
          <Label hint={`Paling banyak ${MAKS_FOTO_GERBANG} foto. Empat pertama tampil sebagai foto kecil.`}>Foto galeri</Label>
          {k.gerbang.foto.map((f, i) => (
            <div key={i} className="grid gap-4 rounded-card border border-line bg-soft p-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
              <KolomFoto label={`Foto ${i + 1}`} value={f.foto} onChange={(v) => ubah((d) => { d.gerbang.foto[i].foto = v; })} rasio="aspect-[16/9]" bolehKosong={false} />
              <div className="grid content-start gap-3">
                <KolomDua label="Keterangan" value={f.keterangan} onChange={(v) => ubah((d) => { d.gerbang.foto[i].keterangan = v; })} maks={200} />
                <div className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => ubah((d) => { const a = d.gerbang.foto; [a[i - 1], a[i]] = [a[i], a[i - 1]]; })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white disabled:opacity-30" aria-label="Naikkan"><IkonPanahAtas size={17} /></button>
                  <button type="button" disabled={i === k.gerbang.foto.length - 1} onClick={() => ubah((d) => { const a = d.gerbang.foto; [a[i + 1], a[i]] = [a[i], a[i + 1]]; })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white disabled:opacity-30" aria-label="Turunkan"><IkonPanahBawah size={17} /></button>
                  <button type="button" onClick={() => ubah((d) => { d.gerbang.foto.splice(i, 1); })} className="ml-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-[13px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus</button>
                </div>
              </div>
            </div>
          ))}
          {k.gerbang.foto.length < MAKS_FOTO_GERBANG && (
            <button type="button" onClick={() => ubah((d) => { d.gerbang.foto.push({ foto: "/brand/foto/senja-karst.webp", keterangan: kosong }); })} className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah foto galeri</button>
          )}
        </div>
      </KartuPanel>

      <KartuPanel id="dive-course" judul="Dive Course" keterangan="Seksi kursus selam di beranda, setelah open trip. Aktivitas kursus diatur di Aktivitas dan harga dengan kategori Kursus selam atau Kursus spesialti.">
        <Saklar label="Tampil di situs" value={k.diveCourse.tampil} onChange={(v) => ubah((d) => { d.diveCourse.tampil = v; })} />
        <KepalaEditor b={k.diveCourse} set={(f) => ubah((d) => f(d.diveCourse))} />
        <KolomFoto label="Foto kursus" value={k.diveCourse.foto} onChange={(v) => ubah((d) => { d.diveCourse.foto = v; })} />
        <KolomDua label="Tombol tanya kursus" value={k.diveCourse.tombol} onChange={(v) => ubah((d) => { d.diveCourse.tombol = v; })} maks={40} />
        <p className="text-sm text-ink2">Nomor WhatsApp memakai panel Kontak. Isi tautan pembayaran Xendit per kursus setelah tersedia. Harga dalam USD per orang sesuai daftar pemilik, bukan konversi rupiah.</p>
        {k.diveCourse.kursus.map((x, i) => <div key={x.id} className="grid gap-4 rounded-card border border-line bg-soft p-5">
          <Saklar label="Tampilkan kursus" value={x.tampil} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].tampil = v; })} />
          <KolomDua label="Nama kursus" value={x.nama} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].nama = v; })} maks={160} />
          <KolomFoto label="Foto kursus" value={x.foto} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].foto = v; })} />
          <label className="grid gap-2 text-sm font-bold text-navy">Harga USD per orang
            <input className="kolom" type="number" min="0" max="1000000" step="0.01" value={x.hargaUsd} onChange={(e) => { const v = Number(e.target.value); ubah((d) => { d.diveCourse.kursus[i].hargaUsd = Math.max(0, v); }); }} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomAngka label="Jumlah hari" min={1} maks={365} value={x.hari} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].hari = v; })} />
            <KolomAngka label="Jumlah selam" maks={1000} value={x.selam} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].selam = v; })} />
          </div>
          <Saklar label="Termasuk alat" value={x.alat} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].alat = v; })} />
          <KolomDua label="Lokasi" value={x.lokasi} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].lokasi = v; })} maks={160} />
          <KolomTeks label="Tautan pembayaran Xendit" jenis="tautan" hint="Tautan HTTPS untuk kursus dan harga ini. Kosongkan selama pembayaran belum tersedia. Perbarui tautan bila harga berubah." value={x.pembayaran} onChange={(v) => ubah((d) => { d.diveCourse.kursus[i].pembayaran = v; })} />
          <button type="button" className="justify-self-start text-sm font-bold text-navy underline" onClick={() => ubah((d) => { d.diveCourse.kursus.splice(i, 1); })}>Hapus kursus</button>
        </div>)}
        <button type="button" className="btn btn-garis justify-self-start" onClick={() => ubah((d) => { d.diveCourse.kursus.push({ id: idBaru("kursus"), nama: { en: "", id: "" }, foto: "", hargaUsd: 0, hari: 1, selam: 0, alat: false, tampil: false, lokasi: { en: "", id: "" }, pembayaran: "" }); })}>Tambah kursus</button>
      </KartuPanel>

      <KartuPanel judul="Judul bagian lain" keterangan="Label, judul, dan kalimat pembuka untuk bagian Trip, Jadwal open trip, Ulasan, dan FAQ di beranda, dan Titik selam di halaman Trip."
        lipat ringkas="Trip, Jadwal open trip, Titik selam, Ulasan, dan FAQ. Jarang perlu diubah.">
        {([["trip", "Trip"], ["jadwal", "Jadwal open trip"], ["titik", "Titik selam (halaman Trip)"], ["ulasan", "Ulasan"], ["faq", "FAQ"]] as const).map(([kunci, nama]) => (
          <div key={kunci} className="rounded-card border border-line bg-soft p-4">
            <p className="mb-3 text-[15px] font-extrabold text-navy">{nama}</p>
            <KepalaEditor b={k.bagian[kunci]} set={(f) => ubah((d) => f(d.bagian[kunci]))} />
          </div>
        ))}
      </KartuPanel>

      <KartuPanel id="about" judul="About Fantasea" keterangan="Profil dan informasi perusahaan di seksi About beranda serta halaman About.">
        <KepalaEditor b={k.about} set={(f) => ubah((d) => f(d.about))} />
        <KolomDaftar label="Paragraf profil" value={k.about.paragraf} onChange={(v) => ubah((d) => { d.about.paragraf = v; })} />
        <KolomTeks label="Badan usaha" value={k.about.badan} onChange={(v) => ubah((d) => { d.about.badan = v; })} maks={180} />
        <KolomTeks label="NIB" value={k.about.nib} onChange={(v) => ubah((d) => { d.about.nib = v; })} maks={40} />
        <KolomDua label="Pendaftaran usaha" value={k.about.registrasi} onChange={(v) => ubah((d) => { d.about.registrasi = v; })} maks={200} />
        <KolomDua label="Lokasi usaha" value={k.about.lokasi} onChange={(v) => ubah((d) => { d.about.lokasi = v; })} maks={300} />
        <KolomDua label="Kegiatan usaha" value={k.about.kegiatan} onChange={(v) => ubah((d) => { d.about.kegiatan = v; })} panjang maks={600} />
      </KartuPanel>

      <KartuPanel id="lokasi" judul="Peta dan cara menuju Waisai" keterangan="Peta ilustrasi Sorong ke Waisai dan tiga langkah perjalanan. Tombol pertanyaan memakai nomor WhatsApp di panel Kontak.">
        <KepalaEditor b={k.rute} set={(f) => ubah((d) => f(d.rute))} />
        {k.rute.langkah.map((x, i) => <div key={i} className="grid gap-4 rounded-card border border-line bg-soft p-4">
          <KolomDua label={`Judul langkah ${i + 1}`} value={x.judul} onChange={(v) => ubah((d) => { d.rute.langkah[i].judul = v; })} maks={120} />
          <KolomDua label={`Isi langkah ${i + 1}`} value={x.isi} onChange={(v) => ubah((d) => { d.rute.langkah[i].isi = v; })} panjang maks={600} />
        </div>)}
        <KolomDua label="Catatan perjalanan" value={k.rute.catatan} onChange={(v) => ubah((d) => { d.rute.catatan = v; })} panjang maks={600} />
        <KolomDua label="Tombol WhatsApp rute" value={k.rute.tombol} onChange={(v) => ubah((d) => { d.rute.tombol = v; })} maks={60} />
      </KartuPanel>

      <KartuPanel judul="Menu dan footer" keterangan="Empat menu utama di header dan footer. Kalimat tentang Fantasea di bawah dipakai di footer. Profil lengkap diatur pada kartu About Fantasea."
        lipat ringkas={`Menu ${[k.menu.beranda, k.menu.homestay, k.menu.trip, k.menu.about].map((x) => ringkasTeks(x, 24)).join(", ")}`}>
        <div className="grid gap-4 md:grid-cols-2">
          {([["beranda", "Menu beranda"], ["homestay", "Menu akomodasi"], ["trip", "Menu aktivitas"], ["about", "Menu About"]] as const).map(([kunci, nama]) => (
            <KolomDua key={kunci} label={nama} value={k.menu[kunci]} onChange={(v) => ubah((d) => { d.menu[kunci] = v; })} maks={30} />
          ))}
        </div>
        <KolomDua label="Tentang Fantasea di footer" value={k.footer.tentang} onChange={(v) => ubah((d) => { d.footer.tentang = v; })} panjang maks={400} />
      </KartuPanel>
    </div>
  );
}

function EditorKartu({ judul, kartu, set, keterangan }: { judul: string; kartu: Konten["hero"]["kartu"]; set: (i: number, f: (c: Konten["hero"]["kartu"][number]) => void) => void; keterangan?: string }) {
  return (
    <div className="grid gap-3">
      <Label hint={keterangan ?? "Foto dan gelembung tag tiap kartu. Kosongkan tag untuk menyembunyikan gelembungnya."}>{judul}</Label>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {kartu.map((c, i) => (
          <div key={i} className="grid gap-3 rounded-card border border-line bg-soft p-4">
            <KolomFoto label={`Kartu ${i + 1}`} value={c.foto} onChange={(v) => set(i, (x) => { x.foto = v; })} rasio="aspect-[4/5] max-w-[200px]" />
            <KolomTeks label="Gelembung tag" value={c.tag} onChange={(v) => set(i, (x) => { x.tag = v; })} placeholder="@arborek" maks={40} />
            <PilihWarna value={c.warna} onChange={(v) => set(i, (x) => { x.warna = v; })} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BagianUlasanFaq({ k, ubah }: { k: Konten; ubah: Ubah }) {
  return (
    <div className="grid gap-6">
      <KartuPanel judul="Ulasan tamu" keterangan="Hanya ulasan asli dengan izin tamu, salin dari Google atau TripAdvisor. Bagian ulasan tersembunyi selama belum ada ulasan yang tampil."
        aksi={<button type="button" onClick={() => ubah((d) => { d.ulasan.push({ id: idBaru("u"), nama: "", asal: "", teks: "", bintang: 5, tampil: true }); })} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah ulasan</button>}>
        {k.ulasan.length === 0 && <p className="text-[14.5px] text-ink2">Belum ada ulasan. Ulasan yang nama atau isinya kosong tidak disimpan.</p>}
        {k.ulasan.map((u, i) => (
          <div key={u.id} className="grid gap-4 rounded-card border border-line bg-soft p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <KolomTeks label="Nama tamu" value={u.nama} onChange={(v) => ubah((d) => { d.ulasan[i].nama = v; })} maks={60} />
              <KolomTeks label="Asal" hint="Negara atau kota" value={u.asal} onChange={(v) => ubah((d) => { d.ulasan[i].asal = v; })} maks={60} />
            </div>
            <KolomTeks label="Isi ulasan" hint="Tulis apa adanya dalam bahasa aslinya." panjang value={u.teks} onChange={(v) => ubah((d) => { d.ulasan[i].teks = v; })} maks={800} />
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Bintang">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={u.bintang === n} onClick={() => ubah((d) => { d.ulasan[i].bintang = n; })} className={`text-[24px] leading-none ${n <= u.bintang ? "text-koral" : "text-line"}`} aria-label={`${n} bintang`}>★</button>
                ))}
              </div>
              <Saklar label="Tampil" value={u.tampil} onChange={(v) => ubah((d) => { d.ulasan[i].tampil = v; })} />
              <button type="button" onClick={() => ubah((d) => { d.ulasan.splice(i, 1); })} className="ml-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-[13px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus</button>
            </div>
          </div>
        ))}
      </KartuPanel>

      <KartuPanel judul="Pertanyaan umum (FAQ)" keterangan="Tampil di bagian Sebelum berangkat. Hindari harga dan jadwal di sini, karena keduanya cepat berubah."
        aksi={<button type="button" onClick={() => ubah((d) => { d.faq.push({ id: idBaru("f"), tanya: kosong, jawab: kosong }); })} className="inline-flex items-center gap-1.5 rounded-pill bg-navy px-4 py-2 text-[13.5px] font-bold text-white"><IkonTambah size={16} />Tambah pertanyaan</button>}>
        {k.faq.map((f, i) => (
          <div key={f.id} className="grid gap-4 rounded-card border border-line bg-soft p-4">
            <KolomDua label="Pertanyaan" value={f.tanya} onChange={(v) => ubah((d) => { d.faq[i].tanya = v; })} maks={200} />
            <KolomDua label="Jawaban" value={f.jawab} onChange={(v) => ubah((d) => { d.faq[i].jawab = v; })} panjang maks={1500} />
            <div className="flex gap-1">
              <button type="button" disabled={i === 0} onClick={() => ubah((d) => { const a = d.faq; [a[i - 1], a[i]] = [a[i], a[i - 1]]; })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white disabled:opacity-30" aria-label="Naikkan"><IkonPanahAtas size={17} /></button>
              <button type="button" disabled={i === k.faq.length - 1} onClick={() => ubah((d) => { const a = d.faq; [a[i + 1], a[i]] = [a[i], a[i + 1]]; })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white disabled:opacity-30" aria-label="Turunkan"><IkonPanahBawah size={17} /></button>
              <button type="button" onClick={() => ubah((d) => { d.faq.splice(i, 1); })} className="ml-auto inline-flex items-center gap-1.5 rounded-pill px-3 py-2 text-[13px] font-bold text-[#A63A22] hover:bg-[#FBE4DD]"><IkonSampah size={16} />Hapus</button>
            </div>
          </div>
        ))}
      </KartuPanel>
    </div>
  );
}

export function BagianKontak({ k, ubah }: { k: Konten; ubah: Ubah }) {
  const s = k.situs;
  const contoh = kontakMasihContoh(k);
  return (
    <div className="grid gap-6">
      {(contoh.wa && s.kontak.whatsapp || contoh.lain.length > 0) && (
        <p className="rounded-in bg-[#FFF4DD] px-4 py-3 text-[14.5px] text-navy">Masih contoh bawaan {[contoh.wa && s.kontak.whatsapp ? "Nomor WhatsApp" : "", ...contoh.lain].filter(Boolean).join(", ")}. Ganti dengan kontak asli Fantasea, atau kosongkan kolomnya untuk menyembunyikan.</p>
      )}
      <KartuPanel judul="Kontak" keterangan="Tampil di footer dan dipakai tombol WhatsApp di seluruh situs. Kolom kosong disembunyikan.">
        <div className="grid gap-4 md:grid-cols-2">
          <KolomTeks label="Nomor WhatsApp" hint="Dengan kode negara tanpa tanda plus, contoh 6281234567890." jenis="angka" value={s.kontak.whatsapp} onChange={(v) => ubah((d) => { d.situs.kontak.whatsapp = v.replace(/[^\d]/g, ""); })} maks={20} />
          <KolomTeks label="Email" jenis="email" value={s.kontak.email} onChange={(v) => ubah((d) => { d.situs.kontak.email = v; })} maks={120} />
        </div>
        <KolomDua label="Alamat" value={s.kontak.alamat} onChange={(v) => ubah((d) => { d.situs.kontak.alamat = v; })} maks={300} />
        <KolomTeks label="Tautan Google Maps" hint="Diawali https. Alamat di footer jadi tautan ke peta." jenis="tautan" value={s.kontak.peta} onChange={(v) => ubah((d) => { d.situs.kontak.peta = v; })} />
      </KartuPanel>
      <KartuPanel judul="Media sosial" keterangan="Alamat lengkap akun, diawali https. Kosongkan untuk menyembunyikan ikonnya.">
        <div className="grid gap-4 md:grid-cols-2">
          {([["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"], ["youtube", "YouTube"]] as const).map(([kunci, nama]) => (
            <KolomTeks key={kunci} label={nama} jenis="tautan" value={s.sosial[kunci]} onChange={(v) => ubah((d) => { d.situs.sosial[kunci] = v; })} placeholder={`https://${kunci}.com/fantaseadivetravel`} />
          ))}
        </div>
      </KartuPanel>
      <KartuPanel judul="Pencarian Google" keterangan="Judul dan deskripsi beranda di hasil pencarian dan pratinjau tautan. Halaman trip memakai nama dan ringkasan tripnya."
        lipat ringkas={ringkasTeks(s.seo.judul, 90)}>
        <KolomDua label="Judul situs" value={s.seo.judul} onChange={(v) => ubah((d) => { d.situs.seo.judul = v; })} maks={90} />
        <KolomDua label="Deskripsi" value={s.seo.deskripsi} onChange={(v) => ubah((d) => { d.situs.seo.deskripsi = v; })} panjang maks={300} />
      </KartuPanel>
    </div>
  );
}
