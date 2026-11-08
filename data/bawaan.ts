import type { Konten } from "@/lib/konten";

/**
 * Isi bawaan situs, dipakai sebelum pemilik menyimpan apa pun dari panel dan
 * untuk kolom yang belum pernah diisi.
 *
 * Trip, jadwal, dan titik selam bawaan bertanda `contoh: true`. Panel
 * menampilkan tanda Contoh dan Ringkasan mengingatkan untuk menggantinya,
 * karena harga, tanggal, dan data titik selam di sini belum dari pemilik.
 * Ulasan sengaja kosong, karena ulasan tidak boleh dikarang.
 *
 * Foto bawaan di /brand/foto adalah ilustrasi AI dari proyek lain milik
 * pemilik, bukan dokumentasi Fantasea. Ganti dari panel.
 */
const F = (n: string) => `/brand/foto/${n}.webp`;

export const KONTEN_BAWAAN: Konten = {
  situs: {
    kontak: {
      whatsapp: "",
      email: "",
      alamat: { en: "Raja Ampat, Southwest Papua, Indonesia", id: "Raja Ampat, Papua Barat Daya, Indonesia" },
      peta: "",
    },
    sosial: { instagram: "", facebook: "", tiktok: "", youtube: "" },
    seo: {
      judul: { en: "Fantasea Dive Travel, Raja Ampat dive trips", id: "Fantasea Dive Travel, trip selam Raja Ampat" },
      deskripsi: {
        en: "Dive and snorkel trips in Raja Ampat for small groups. Pickup in Sorong, boat, homestay, meals and local dive guides arranged for you.",
        id: "Trip selam dan snorkeling di Raja Ampat untuk rombongan kecil. Jemput di Sorong, kapal, homestay, makan, dan pemandu selam lokal kami atur.",
      },
    },
  },
  menu: {
    trip: { en: "Trips", id: "Trip" },
    jadwal: { en: "Open trips", id: "Open trip" },
    titik: { en: "Dive sites", id: "Titik selam" },
    ulasan: { en: "Stories", id: "Cerita" },
    faq: { en: "FAQ", id: "FAQ" },
    pesan: { en: "Book a trip", id: "Pesan trip" },
  },
  hero: {
    judul: { en: "Your next dive trip\nstarts in *Raja Ampat.*", id: "Trip selam berikutnya\ndimulai di *Raja Ampat.*" },
    lead: {
      en: "Dive trips, snorkel days and island hopping, planned from Sorong airport to the last dive site.",
      id: "Trip selam, snorkeling, dan jelajah pulau, kami atur dari Bandara Sorong sampai titik selam terakhir.",
    },
    tombol1: { en: "See open trips", id: "Lihat open trip" },
    tombol2: { en: "Explore dive sites", id: "Jelajahi titik selam" },
    kartu: [
      { foto: F("snorkel-karst"), tag: "", warna: "tanda" },
      { foto: F("speedboat-laguna"), tag: "@arborek", warna: "tanda" },
      { foto: F("tamu-kapal"), tag: "", warna: "tanda" },
      { foto: F("senja-karst"), tag: "", warna: "tanda" },
      { foto: F("manta-biru"), tag: "@mantasandy", warna: "ukir" },
    ],
  },
  jelajah: {
    label: { en: "Dive travel", id: "Dive travel" },
    judul: { en: "Dive with us,\n*& explore the reefs*\ntogether.", id: "Menyelam bersama,\n*& jelajahi karang*\nRaja Ampat." },
    lead: {
      en: "A small dive travel team from Raja Ampat. We plan the boat, the homestay and the dives. You bring the curiosity.",
      id: "Tim dive travel kecil dari Raja Ampat. Kami atur kapal, homestay, dan titik selamnya. Kamu cukup membawa rasa ingin tahu.",
    },
    tombol1: { en: "Plan my trip", id: "Rencanakan trip" },
    tombol2: { en: "See all trips", id: "Lihat semua trip" },
    kartu: [
      { foto: F("pantai-karst"), tag: "@pulaukri", warna: "koral" },
      { foto: F("penyelam-karang"), tag: "", warna: "tanda" },
      { foto: F("snorkel-laguna"), tag: "@friwen", warna: "navy" },
      { foto: F("penyu-karang"), tag: "", warna: "tanda" },
    ],
  },
  gerbang: {
    label: { en: "Raja Ampat", id: "Raja Ampat" },
    judul: { en: "Gateway to\n*the Coral Triangle.*", id: "Gerbang menuju\n*Segitiga Karang.*" },
    lead: { en: "", id: "" },
    foto: [
      { foto: F("kapal-penyelam"), keterangan: { en: "Morning dive boat in the Dampier Strait", id: "Kapal selam pagi di Selat Dampier" } },
      { foto: F("manta-cahaya"), keterangan: { en: "Reef mantas at Manta Sandy", id: "Pari manta karang di Manta Sandy" } },
      { foto: F("senja-karst"), keterangan: { en: "Sunset between the karst islands", id: "Senja di antara pulau karst" } },
      { foto: F("snorkel-laguna"), keterangan: { en: "Shallow reefs around Arborek", id: "Karang dangkal di sekitar Arborek" } },
    ],
    video: "",
    tag: "@piaynemo",
    warna: "ukir",
  },
  bagian: {
    trip: {
      label: { en: "Trips", id: "Trip" },
      judul: { en: "Pick your *route.*", id: "Pilih *rutemu.*" },
      lead: {
        en: "Dive and snorkel trips for small groups, from first timers to seasoned divers.",
        id: "Trip selam dan snorkeling untuk rombongan kecil, dari pemula sampai penyelam berpengalaman.",
      },
    },
    jadwal: {
      label: { en: "Open trip", id: "Open trip" },
      judul: { en: "Join an *open trip.*", id: "Ikut *open trip.*" },
      lead: {
        en: "Travel solo or as a couple and share the boat with other divers.",
        id: "Berangkat sendiri atau berdua dan berbagi kapal dengan penyelam lain.",
      },
    },
    titik: {
      label: { en: "Dive sites", id: "Titik selam" },
      judul: { en: "Where we *dive.*", id: "Tempat kami *menyelam.*" },
      lead: {
        en: "Some of the sites we visit in the Dampier Strait. The final plan follows the sea that day.",
        id: "Sebagian titik yang kami kunjungi di Selat Dampier. Rencana akhirnya mengikuti kondisi laut hari itu.",
      },
    },
    ulasan: {
      label: { en: "Stories", id: "Cerita" },
      judul: { en: "What divers *say.*", id: "Kata *para tamu.*" },
      lead: { en: "", id: "" },
    },
    faq: {
      label: { en: "FAQ", id: "FAQ" },
      judul: { en: "Before you *go.*", id: "Sebelum *berangkat.*" },
      lead: { en: "", id: "" },
    },
  },
  ajakan: {
    judul: { en: "Live the *Fantasea.*", id: "Live the *Fantasea.*" },
    lead: { en: "Tell us your dates and we will plan the rest.", id: "Kabari tanggalmu, sisanya kami yang atur." },
    tombol: { en: "Chat on WhatsApp", id: "Chat lewat WhatsApp" },
  },
  footer: {
    tentang: {
      en: "Dive and snorkel trips in Raja Ampat for small groups, with local guides.",
      id: "Trip selam dan snorkeling di Raja Ampat untuk rombongan kecil, bersama pemandu lokal.",
    },
  },
  trip: [
    {
      id: "t-escape",
      slug: "raja-ampat-dive-escape",
      nama: { en: "Raja Ampat Dive Escape", id: "Raja Ampat Dive Escape" },
      kategori: "selam",
      ringkas: {
        en: "Eight dives in the Dampier Strait with mantas, reef sharks and the famous Cape Kri.",
        id: "Delapan kali selam di Selat Dampier bersama manta, hiu karang, dan Cape Kri yang terkenal.",
      },
      deskripsi: {
        en: "We pick you up at Sorong airport and take the fast ferry to Waisai together. From there a small boat brings you to a beachfront homestay in the Dampier Strait.\n\nEach day has two morning dives and one afternoon dive, chosen with the tide and current. Expect reef mantas at Manta Sandy, big schools at Cape Kri and soft coral walls at Friwen.",
        id: "Kami menjemputmu di Bandara Sorong lalu naik kapal cepat ke Waisai bersama. Dari sana kapal kecil membawamu ke homestay tepi pantai di Selat Dampier.\n\nSetiap hari ada dua selam pagi dan satu selam sore, dipilih mengikuti pasang dan arus. Manta karang di Manta Sandy, kawanan ikan di Cape Kri, dan dinding karang lunak di Friwen menunggu.",
      },
      durasi: { en: "4 days 3 nights", id: "4 hari 3 malam" },
      selam: 8,
      level: { en: "Open Water and up", id: "Open Water ke atas" },
      hargaMulai: 8500000,
      termasuk: {
        en: ["Pickup at Sorong airport", "Fast ferry to Waisai", "Beachfront homestay", "Three meals a day", "Local dive guide", "Tanks and weights"],
        id: ["Jemput di Bandara Sorong", "Kapal cepat ke Waisai", "Homestay tepi pantai", "Makan tiga kali sehari", "Pemandu selam lokal", "Tabung dan pemberat"],
      },
      belum: {
        en: ["Flights to Sorong", "Dive gear rental", "Raja Ampat entry permit"],
        id: ["Tiket pesawat ke Sorong", "Sewa alat selam", "Kartu masuk Raja Ampat"],
      },
      foto: [F("kapal-penyelam"), F("manta-biru"), F("penyelam-karang")],
      tampil: true,
      contoh: true,
    },
    {
      id: "t-snorkel",
      slug: "dampier-strait-snorkel-days",
      nama: { en: "Dampier Strait Snorkel Days", id: "Dampier Strait Snorkel Days" },
      kategori: "snorkel",
      ringkas: {
        en: "Shallow reefs, turtles and village jetties. No certification needed.",
        id: "Karang dangkal, penyu, dan dermaga kampung. Tanpa sertifikat selam.",
      },
      deskripsi: {
        en: "A relaxed trip for snorkelers and families. We visit the shallow reefs around Arborek, Friwen and Yenbuba, where the coral starts right below the surface.\n\nYour guide swims with you, shows you where to look and keeps the group together.",
        id: "Trip santai untuk snorkeling dan keluarga. Kami mengunjungi karang dangkal di sekitar Arborek, Friwen, dan Yenbuba, tempat karang tumbuh tepat di bawah permukaan.\n\nPemandu berenang bersamamu, menunjukkan apa yang perlu dilihat, dan menjaga rombongan tetap bersama.",
      },
      durasi: { en: "3 days 2 nights", id: "3 hari 2 malam" },
      selam: 0,
      level: { en: "No certification needed", id: "Tanpa sertifikat" },
      hargaMulai: 4500000,
      termasuk: {
        en: ["Pickup at Sorong airport", "Fast ferry to Waisai", "Homestay", "Three meals a day", "Snorkel guide", "Mask, snorkel and fins"],
        id: ["Jemput di Bandara Sorong", "Kapal cepat ke Waisai", "Homestay", "Makan tiga kali sehari", "Pemandu snorkeling", "Masker, snorkel, dan fin"],
      },
      belum: { en: ["Flights to Sorong", "Raja Ampat entry permit"], id: ["Tiket pesawat ke Sorong", "Kartu masuk Raja Ampat"] },
      foto: [F("snorkel-laguna"), F("penyu-karang"), F("ikan-badut")],
      tampil: true,
      contoh: true,
    },
    {
      id: "t-piaynemo",
      slug: "piaynemo-fam-explorer",
      nama: { en: "Piaynemo & Fam Explorer", id: "Piaynemo & Fam Explorer" },
      kategori: "selam",
      ringkas: {
        en: "Twelve dives and the Piaynemo viewpoint, the postcard view of Raja Ampat.",
        id: "Dua belas kali selam dan bukit pandang Piaynemo, pemandangan kartu pos Raja Ampat.",
      },
      deskripsi: {
        en: "A longer route that adds the Fam islands to the Dampier Strait. You climb the Piaynemo viewpoint at sunrise, dive Melissa's Garden and swim through the lagoons of Fam.\n\nGood for divers who want variety, from coral gardens to walls and channels.",
        id: "Rute lebih panjang yang menambahkan Kepulauan Fam ke Selat Dampier. Kamu mendaki bukit pandang Piaynemo saat matahari terbit, menyelam di Melissa's Garden, dan berenang di laguna Fam.\n\nCocok untuk penyelam yang ingin variasi, dari taman karang sampai dinding dan kanal.",
      },
      durasi: { en: "6 days 5 nights", id: "6 hari 5 malam" },
      selam: 12,
      level: { en: "Open Water and up", id: "Open Water ke atas" },
      hargaMulai: 13900000,
      termasuk: {
        en: ["Pickup at Sorong airport", "Fast ferry to Waisai", "Homestay in two islands", "Three meals a day", "Local dive guide", "Piaynemo viewpoint visit"],
        id: ["Jemput di Bandara Sorong", "Kapal cepat ke Waisai", "Homestay di dua pulau", "Makan tiga kali sehari", "Pemandu selam lokal", "Kunjungan bukit Piaynemo"],
      },
      belum: {
        en: ["Flights to Sorong", "Dive gear rental", "Raja Ampat entry permit"],
        id: ["Tiket pesawat ke Sorong", "Sewa alat selam", "Kartu masuk Raja Ampat"],
      },
      foto: [F("senja-karst"), F("speedboat-laguna"), F("penyelam-gua")],
      tampil: true,
      contoh: true,
    },
    {
      id: "t-private",
      slug: "private-dive-trip",
      nama: { en: "Private Dive Trip", id: "Private Dive Trip" },
      kategori: "privat",
      ringkas: {
        en: "Your own boat and guide on the dates you choose. We build the route with you.",
        id: "Kapal dan pemandu sendiri di tanggal pilihanmu. Rutenya kita susun bersama.",
      },
      deskripsi: {
        en: "For couples, families and dive clubs who want their own schedule. Tell us your dates, your group size and what you most want to see, and we send a plan with the price.",
        id: "Untuk pasangan, keluarga, dan klub selam yang ingin jadwal sendiri. Kabari tanggal, jumlah orang, dan apa yang paling ingin kamu lihat, lalu kami kirim rencana beserta harganya.",
      },
      durasi: { en: "Your dates", id: "Tanggal pilihanmu" },
      selam: 0,
      level: { en: "All levels", id: "Semua level" },
      hargaMulai: 0,
      termasuk: {
        en: ["Private boat and guide", "Route planned with you", "Pickup at Sorong airport"],
        id: ["Kapal dan pemandu pribadi", "Rute disusun bersama", "Jemput di Bandara Sorong"],
      },
      belum: { en: ["Flights to Sorong"], id: ["Tiket pesawat ke Sorong"] },
      foto: [F("tamu-kapal"), F("penyelam-ok")],
      tampil: true,
      contoh: true,
    },
  ],
  jadwal: [
    { id: "j-1", tripId: "t-escape", mulai: "2026-12-12", selesai: "2026-12-15", kursi: 8, terisi: 6, catatan: { en: "", id: "" }, contoh: true },
    { id: "j-2", tripId: "t-escape", mulai: "2026-12-27", selesai: "2026-12-30", kursi: 8, terisi: 8, catatan: { en: "New year trip", id: "Trip tahun baru" }, contoh: true },
    { id: "j-3", tripId: "t-snorkel", mulai: "2027-01-09", selesai: "2027-01-11", kursi: 10, terisi: 3, catatan: { en: "", id: "" }, contoh: true },
    { id: "j-4", tripId: "t-escape", mulai: "2027-01-16", selesai: "2027-01-19", kursi: 8, terisi: 2, catatan: { en: "", id: "" }, contoh: true },
    { id: "j-5", tripId: "t-piaynemo", mulai: "2027-02-06", selesai: "2027-02-11", kursi: 8, terisi: 3, catatan: { en: "", id: "" }, contoh: true },
  ],
  titik: [
    {
      id: "s-mantasandy", nama: "Manta Sandy",
      wilayah: { en: "Near Arborek", id: "Dekat Arborek" }, kedalaman: "5–18 m",
      arus: { en: "Mild to medium", id: "Lemah sampai sedang" }, level: { en: "Open Water", id: "Open Water" },
      sorotan: { en: "Reef mantas visit a cleaning station on a sandy slope.", id: "Pari manta karang datang ke stasiun pembersihan di lereng pasir." },
      foto: F("manta-cahaya"), tampil: true, contoh: true,
    },
    {
      id: "s-capekri", nama: "Cape Kri",
      wilayah: { en: "Kri island", id: "Pulau Kri" }, kedalaman: "5–40 m",
      arus: { en: "Medium to strong", id: "Sedang sampai kuat" }, level: { en: "Advanced", id: "Advanced" },
      sorotan: { en: "Known for record fish counts, big schools and reef sharks.", id: "Terkenal karena jumlah jenis ikannya, kawanan besar, dan hiu karang." },
      foto: F("penyelam-karang"), tampil: true, contoh: true,
    },
    {
      id: "s-bluemagic", nama: "Blue Magic",
      wilayah: { en: "Between Kri and Mioskon", id: "Antara Kri dan Mioskon" }, kedalaman: "7–30 m",
      arus: { en: "Strong", id: "Kuat" }, level: { en: "Advanced", id: "Advanced" },
      sorotan: { en: "A seamount where oceanic mantas and big schools pass by.", id: "Gunung bawah laut tempat manta oseanik dan kawanan besar melintas." },
      foto: F("manta-bawah"), tampil: true, contoh: true,
    },
    {
      id: "s-friwen", nama: "Friwen Wall",
      wilayah: { en: "Friwen island", id: "Pulau Friwen" }, kedalaman: "3–25 m",
      arus: { en: "Mild", id: "Lemah" }, level: { en: "All levels", id: "Semua level" },
      sorotan: { en: "A gentle wall covered in soft corals and sea fans.", id: "Dinding landai penuh karang lunak dan kipas laut." },
      foto: F("penyu-karang"), tampil: true, contoh: true,
    },
    {
      id: "s-sardine", nama: "Sardine Reef",
      wilayah: { en: "Dampier Strait", id: "Selat Dampier" }, kedalaman: "5–25 m",
      arus: { en: "Medium", id: "Sedang" }, level: { en: "Open Water", id: "Open Water" },
      sorotan: { en: "A sloping reef packed with fish, turtles and soft corals.", id: "Karang miring yang dipenuhi ikan, penyu, dan karang lunak." },
      foto: F("penyelam-biru"), tampil: true, contoh: true,
    },
    {
      id: "s-melissa", nama: "Melissa's Garden",
      wilayah: { en: "Fam islands", id: "Kepulauan Fam" }, kedalaman: "3–20 m",
      arus: { en: "Mild to medium", id: "Lemah sampai sedang" }, level: { en: "All levels", id: "Semua level" },
      sorotan: { en: "A shallow hard coral garden with clear water.", id: "Taman karang keras yang dangkal dengan air jernih." },
      foto: F("ikan-badut"), tampil: true, contoh: true,
    },
  ],
  ulasan: [],
  faq: [
    {
      id: "f-tiba",
      tanya: { en: "How do I get to Raja Ampat?", id: "Bagaimana cara ke Raja Ampat?" },
      jawab: {
        en: "Fly to Sorong (SOQ), usually through Jakarta, Makassar or Manado. From Sorong a fast ferry takes about two hours to Waisai. We meet you at the airport and travel with you.",
        id: "Terbang ke Sorong (SOQ), biasanya lewat Jakarta, Makassar, atau Manado. Dari Sorong kapal cepat ke Waisai sekitar dua jam. Kami menjemputmu di bandara dan berangkat bersama.",
      },
    },
    {
      id: "f-sertifikat",
      tanya: { en: "Do I need a dive certificate?", id: "Perlu sertifikat selam?" },
      jawab: {
        en: "Dive trips need at least an Open Water certificate, and some sites with strong current need Advanced. Snorkel trips need no certificate.",
        id: "Trip selam butuh sertifikat Open Water paling sedikit, dan beberapa titik berarus kuat butuh Advanced. Trip snorkeling tidak butuh sertifikat.",
      },
    },
    {
      id: "f-musim",
      tanya: { en: "When is the best time to go?", id: "Kapan waktu terbaik berangkat?" },
      jawab: {
        en: "Raja Ampat can be dived all year. October to April usually brings calmer seas. July and August can be windier, and we pick sheltered sites on those days.",
        id: "Raja Ampat bisa diselami sepanjang tahun. Oktober sampai April biasanya lautnya lebih tenang. Juli dan Agustus bisa lebih berangin, dan di hari seperti itu kami memilih titik yang terlindung.",
      },
    },
    {
      id: "f-izin",
      tanya: { en: "Is there an entry fee for Raja Ampat?", id: "Ada biaya masuk Raja Ampat?" },
      jawab: {
        en: "Every visitor pays the Raja Ampat environmental service fee, which supports the marine park. We help you buy the card when you arrive.",
        id: "Setiap pengunjung membayar biaya jasa lingkungan Raja Ampat yang mendukung kawasan konservasi laut. Kami membantu membeli kartunya saat kamu tiba.",
      },
    },
  ],
};
