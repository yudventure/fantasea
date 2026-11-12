import { VERSI_KONTAK, type Konten } from "@/lib/konten";
import { NOMOR_WA_CONTOH, nomorWaAsli } from "@/lib/whatsapp";

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
    // Kontak dan media sosial contoh, tinggal diganti di panel (Kontak dan SEO).
    // Ringkasan panel mengingatkan selama masih contoh. Handle dan domain
    // fantaseadivetravel masih usulan di pedoman merek, belum dipastikan.
    versiKontak: VERSI_KONTAK,
    kontak: {
      whatsapp: NOMOR_WA_CONTOH,
      email: "halo@fantaseadivetravel.com",
      alamat: { en: "Raja Ampat, Southwest Papua, Indonesia", id: "Raja Ampat, Papua Barat Daya, Indonesia" },
      peta: "",
    },
    sosial: {
      instagram: "https://www.instagram.com/fantaseadivetravel",
      facebook: "https://www.facebook.com/fantaseadivetravel",
      tiktok: "https://www.tiktok.com/@fantaseadivetravel",
      youtube: "https://www.youtube.com/@fantaseadivetravel",
    },
    seo: {
      judul: { en: "Fantasea Dive Travel, Raja Ampat dive trips", id: "Fantasea Dive Travel, trip selam Raja Ampat" },
      deskripsi: {
        en: "Dive and snorkel trips in Raja Ampat for small groups. Pickup in Sorong, boat, homestay, meals and local dive guides arranged for you.",
        id: "Trip selam dan snorkeling di Raja Ampat untuk rombongan kecil. Jemput di Sorong, kapal, homestay, makan, dan pemandu selam lokal kami atur.",
      },
    },
  },
  menu: {
    beranda: { en: "Home", id: "Beranda" },
    about: { en: "About", id: "About" },
    trip: { en: "Activities", id: "Aktivitas" },
    liveaboard: { en: "Liveaboard", id: "Liveaboard" },
    jadwal: { en: "Open trips", id: "Open trip" },
    homestay: { en: "Accommodation", id: "Akomodasi" },
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
  // Pembuka homestay (permintaan pemilik, November 2026). Teks lama "Dive with
  // us" di simpanan diganti otomatis, lihat JELAJAH_LAMA di lib/konten.ts.
  jelajah: {
    label: { en: "Where to stay", id: "Tempat menginap" },
    judul: { en: "Find your\n*accommodation*\nwith us.", id: "Temukan\n*penginapanmu*\nbersama kami." },
    lead: {
      en: "Staying in Raja Ampat, especially in high season, means booking your bed long before you fly. We work to connect you with authentic homestays that truly live as one with nature.",
      id: "Menginap di Raja Ampat, terutama saat musim ramai, berarti tempat bermalam harus sudah dipesan jauh hari sebelumnya. Kami berusaha menghubungkanmu dengan homestay autentik yang benar-benar menyatu dengan alam.",
    },
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
      label: { en: "Activities", id: "Aktivitas" },
      judul: { en: "Categories", id: "Kategori" },
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
  about: {
    label: { en: "About Fantasea", id: "Tentang Fantasea" },
    judul: { en: "Live the *Fantasea.*", id: "Live the *Fantasea.*" },
    lead: { en: "A personal approach to discovering Raja Ampat.", id: "Pendekatan personal untuk mengenal Raja Ampat." },
    paragraf: {
      en: ["Fantasea is a brand operated by Ekowisata Bahari Raja Ampat, an Indonesian registered company.", "Based in Waisai, Southwest Papua, we operate as a small dive travel agency offering scuba diving experiences with an emphasis on quality, consistency, and a personal approach.", "At Fantasea, we treat our guests like family, creating a relaxed, well-organized experience both in and out of the water, whether you’re diving Raja Ampat or exploring the local culture and excursions."],
      id: ["Fantasea adalah merek yang dioperasikan oleh Ekowisata Bahari Raja Ampat, perusahaan yang terdaftar di Indonesia.", "Berbasis di Waisai, Papua Barat Daya, kami adalah agen perjalanan selam kecil yang menawarkan pengalaman scuba diving dengan mengutamakan kualitas, konsistensi, dan pendekatan personal.", "Di Fantasea, kami memperlakukan tamu seperti keluarga. Kami menciptakan pengalaman yang santai dan tertata, baik di dalam maupun di luar air, saat menyelam di Raja Ampat atau menjelajahi budaya lokal dan wisata sekitarnya."],
    },
    badan: "Ekowisata Bahari Raja Ampat", nib: "2510250035066",
    registrasi: { en: "Indonesia", id: "Indonesia" },
    lokasi: { en: "Raja Ampat, Southwest Papua, Indonesia", id: "Raja Ampat, Papua Barat Daya, Indonesia" },
    kegiatan: { en: "Scuba diving courses & trips, marine excursions, adventure activities and accommodation in Raja Ampat", id: "Kursus dan trip scuba diving, wisata bahari, aktivitas petualangan, dan akomodasi di Raja Ampat" },
  },
  rute: {
    label: { en: "Getting to Waisai", id: "Menuju Waisai" },
    judul: { en: "How to\n*get here.*", id: "Cara menuju\n*Waisai.*" },
    lead: { en: "Fantasea is based in Waisai, Raja Ampat. Fly to Sorong, then cross to Waisai by ferry and coordinate your arrival with our team.", id: "Fantasea berbasis di Waisai, Raja Ampat. Terbang ke Sorong, lanjutkan dengan feri ke Waisai, lalu koordinasikan kedatanganmu dengan tim kami." },
    langkah: [
      { judul: { en: "Fly to Sorong", id: "Terbang ke Sorong" }, isi: { en: "Arrive at Domine Eduard Osok Airport (SOQ), then continue to the ferry harbour in Sorong.", id: "Tiba di Bandara Domine Eduard Osok (SOQ), lalu lanjutkan ke pelabuhan feri di Sorong." } },
      { judul: { en: "Ferry to Waisai", id: "Feri ke Waisai" }, isi: { en: "Take the Sorong–Waisai ferry across the Dampier Strait. Check the current schedule before making travel arrangements.", id: "Naik feri Sorong–Waisai melintasi Selat Dampier. Periksa jadwal terbaru sebelum menyusun perjalanan." } },
      { judul: { en: "Meet us in Waisai", id: "Bertemu di Waisai" }, isi: { en: "Share your arrival details with our team so we can confirm the meeting point and your onward arrangements.", id: "Kabari detail kedatanganmu agar tim kami dapat memastikan titik pertemuan dan pengaturan perjalanan berikutnya." } },
    ],
    catatan: { en: "Ferry schedules and travel times can change with weather and local operations. Confirm your plans with our team before travelling.", id: "Jadwal feri dan waktu perjalanan dapat berubah sesuai cuaca dan operasional setempat. Konfirmasikan rencanamu dengan tim kami sebelum berangkat." },
    tombol: { en: "Ask about the route on WhatsApp", id: "Tanyakan rute melalui WhatsApp" },
  },
  ajakan: {
    judul: { en: "Live the *Fantasea.*", id: "Live the *Fantasea.*" },
    lead: { en: "Tell us your dates and we will plan the rest.", id: "Kabari tanggalmu, sisanya kami yang atur." },
    tombol: { en: "Chat on WhatsApp", id: "Chat lewat WhatsApp" },
  },
  // Bagian Liveaboard di beranda (permintaan pemilik, November 2026).
  diveCourse: {
    kursus: [
      { id: "padi-advanced", nama: { en: "PADI Advanced Open Water Diver Course", id: "PADI Advanced Open Water Diver Course" }, foto: F("penyelam-ok"), hargaUsd: 363, hari: 2, selam: 4, alat: true, tampil: true, lokasi: { en: "Gam Island, Central Raja Ampat", id: "Pulau Gam, Raja Ampat Tengah" }, pembayaran: "" },
      { id: "padi-open-water", nama: { en: "PADI Open Water Diver Course", id: "PADI Open Water Diver Course" }, foto: F("penyelam-biru"), hargaUsd: 445, hari: 3, selam: 6, alat: true, tampil: true, lokasi: { en: "Gam Island, Central Raja Ampat", id: "Pulau Gam, Raja Ampat Tengah" }, pembayaran: "" },
      { id: "padi-tanpa-elearning", nama: { en: "PADI Open Water Diver Course without E-learning", id: "PADI Open Water Diver Course tanpa E-learning" }, foto: F("penyelam-biru"), hargaUsd: 442.22, hari: 3, selam: 6, alat: true, tampil: true, lokasi: { en: "Gam Island, Central Raja Ampat", id: "Pulau Gam, Raja Ampat Tengah" }, pembayaran: "" },
      { id: "ssi-open-water", nama: { en: "SSI Open Water Diver Course", id: "SSI Open Water Diver Course" }, foto: F("penyelam-karang"), hargaUsd: 395, hari: 2, selam: 4, alat: true, tampil: true, lokasi: { en: "", id: "" }, pembayaran: "" },
    ],
    tampil: true,
    label: { en: "Dive course", id: "Kursus selam" },
    judul: { en: "Your next step\n*starts underwater.*", id: "Langkah berikutnya\n*di bawah laut.*" },
    lead: { en: "New to diving or ready to keep learning? Tell us about your experience and what you would like to learn. Explore diving courses and specialty courses for your next step.", id: "Baru mulai menyelam atau ingin belajar lebih jauh? Ceritakan pengalamanmu dan apa yang ingin kamu pelajari. Jelajahi kursus selam dan kursus spesialti untuk langkah berikutnya." },
    foto: F("penyelam-ok"),
    tombol: { en: "Ask about dive courses", id: "Tanya kursus selam" },
  },
  liveaboard: {
    tampil: true,
    label: { en: "Liveaboard", id: "Liveaboard" },
    judul: { en: "Sleep where\n*you dive.*", id: "Bermalam di\n*atas laut.*" },
    lead: {
      en: "On a liveaboard you stay on the boat for several days, so you reach the far reefs of Raja Ampat that day trips cannot. Tell us your dates and we will find a boat that fits.",
      id: "Di liveaboard kamu tinggal di kapal selama beberapa hari, jadi bisa mencapai karang Raja Ampat yang jauh dan tidak terjangkau trip harian. Kabari tanggalmu, kami carikan kapal yang cocok.",
    },
    foto: F("kapal-penyelam"),
    tag: "@misool",
    warna: "koral",
    butir: {
      en: ["Several days on board with a cabin and meals", "Up to four dives a day", "Remote sites such as Misool and Wayag", "Small groups with a dive guide"],
      id: ["Beberapa hari di kapal dengan kabin dan makan", "Sampai empat kali selam sehari", "Titik jauh seperti Misool dan Wayag", "Rombongan kecil bersama pemandu selam"],
    },
    tombol: { en: "Ask about liveaboard dates", id: "Tanya jadwal liveaboard" },
  },
  // Halaman Trip dan Homestay (permintaan pemilik, November 2026). Edukasi
  // selam berisi pengetahuan umum, bertanda contoh supaya diperiksa pemandu.
  halamanTrip: {
    kepala: {
      label: { en: "Activities", id: "Aktivitas" },
      judul: { en: "Find your next\n*adventure.*", id: "Temukan\n*petualanganmu.*" },
      lead: {
        en: "All our dive and snorkel trips in one place, plus what to know before diving Raja Ampat and the sites we visit.",
        id: "Semua trip selam dan snorkeling kami di satu tempat, ditambah yang perlu kamu tahu sebelum menyelam di Raja Ampat dan titik selam yang kami kunjungi.",
      },
    },
    kategori: {
      label: { en: "Categories", id: "Kategori" },
      judul: { en: "Pick your\n*adventure.*", id: "Pilih\n*petualanganmu.*" },
      lead: { en: "", id: "" },
    },
    edukasi: {
      label: { en: "Before you dive", id: "Sebelum menyelam" },
      judul: { en: "Diving in\n*Raja Ampat.*", id: "Menyelam di\n*Raja Ampat.*" },
      lead: {
        en: "A few things that make your dives safer and more fun.",
        id: "Beberapa hal yang membuat penyelamanmu lebih aman dan menyenangkan.",
      },
      butir: [
        {
          id: "e-musim", contoh: true,
          judul: { en: "Best season", id: "Musim terbaik" },
          isi: {
            en: "October to April usually brings calmer seas. You can dive all year, but some sites depend on wind and waves that day.",
            id: "Oktober sampai April biasanya lautnya lebih tenang. Menyelam bisa sepanjang tahun, tapi beberapa titik bergantung pada angin dan ombak hari itu.",
          },
        },
        {
          id: "e-arus", contoh: true,
          judul: { en: "Currents", id: "Arus" },
          isi: {
            en: "The Dampier Strait is known for currents that bring big schools of fish. Your guide picks sites with the tide, and some dives use a reef hook.",
            id: "Selat Dampier terkenal dengan arus yang membawa kawanan ikan besar. Pemandu memilih titik mengikuti pasang, dan beberapa penyelaman memakai reef hook.",
          },
        },
        {
          id: "e-sertifikat", contoh: true,
          judul: { en: "Certification", id: "Sertifikasi" },
          isi: {
            en: "Scuba trips need an Open Water certificate or higher. Snorkel trips need no certificate at all.",
            id: "Trip selam membutuhkan sertifikat Open Water atau lebih tinggi. Trip snorkeling sama sekali tidak butuh sertifikat.",
          },
        },
        {
          id: "e-air", contoh: true,
          judul: { en: "Water and gear", id: "Suhu air dan alat" },
          isi: {
            en: "The water is around 27 to 30 °C. A 3 mm wetsuit is enough for most divers. Bring your own mask if you can.",
            id: "Suhu air sekitar 27 sampai 30 °C. Wetsuit 3 mm sudah cukup untuk kebanyakan penyelam. Bawa masker sendiri kalau bisa.",
          },
        },
        {
          id: "e-etika", contoh: true,
          judul: { en: "Reef etiquette", id: "Etika di karang" },
          isi: {
            en: "Do not touch or stand on coral, keep your fins off the reef, and use reef safe sunscreen. Raja Ampat is a marine protected area.",
            id: "Jangan menyentuh atau berdiri di atas karang, jaga fin tidak mengenai karang, dan pakai tabir surya yang ramah karang. Raja Ampat adalah kawasan konservasi laut.",
          },
        },
        {
          id: "e-terbang", contoh: true,
          judul: { en: "Before you fly", id: "Sebelum terbang" },
          isi: {
            en: "Leave at least 18 hours between your last dive and your flight home. Plan a relaxed last day on the island.",
            id: "Beri jarak paling sedikit 18 jam antara selam terakhir dan penerbangan pulang. Rencanakan hari terakhir yang santai di pulau.",
          },
        },
      ],
    },
  },
  halamanHomestay: {
    kepala: {
      label: { en: "Homestays", id: "Homestay" },
      judul: { en: "Stay close to\n*the reef.*", id: "Menginap dekat\n*karang.*" },
      lead: {
        en: "In high season the best homestays fill up months ahead. Pick one below and send us your dates, we will check the room for you.",
        id: "Saat musim ramai, homestay terbaik penuh berbulan-bulan sebelumnya. Pilih salah satu di bawah dan kirim tanggalmu, kami yang memastikan kamarnya.",
      },
    },
  },
  // Halaman Liveaboard (permintaan pemilik, November 2026). Kartu pengetahuan
  // umum bertanda contoh supaya diperiksa tim sebelum dipromosikan.
  halamanLiveaboard: {
    kepala: {
      label: { en: "Liveaboard", id: "Liveaboard" },
      judul: { en: "Days at sea,\n*nights on deck.*", id: "Hari di laut,\n*malam di dek.*" },
      lead: {
        en: "Our liveaboard trips in one place. Stay on the boat for several days and reach the far reefs of Raja Ampat that day trips cannot.",
        id: "Semua trip liveaboard kami di satu tempat. Tinggal di kapal beberapa hari dan capai karang Raja Ampat yang jauh dan tidak terjangkau trip harian.",
      },
    },
    edukasi: {
      label: { en: "Before you board", id: "Sebelum naik kapal" },
      judul: { en: "Life on\n*a liveaboard.*", id: "Hidup di\n*kapal selam.*" },
      lead: {
        en: "What a few days on board usually look like, so you can pack and plan with ease.",
        id: "Gambaran beberapa hari di kapal, supaya kamu lebih mudah berkemas dan bersiap.",
      },
      butir: [
        {
          id: "e-la-hari", contoh: true,
          judul: { en: "A day on board", id: "Sehari di kapal" },
          isi: {
            en: "You sleep in a cabin, eat on board, and the boat moves between sites while you rest. Days are built around the dives.",
            id: "Kamu tidur di kabin, makan di kapal, dan kapal berpindah titik selagi kamu beristirahat. Hari-harinya disusun mengikuti jadwal selam.",
          },
        },
        {
          id: "e-la-selam", contoh: true,
          judul: { en: "How many dives", id: "Berapa kali menyelam" },
          isi: {
            en: "Usually three or four dives a day, sometimes with a night dive. You can skip a dive whenever you want to rest.",
            id: "Biasanya tiga atau empat kali sehari, kadang dengan selam malam. Kamu boleh melewatkan penyelaman kapan saja untuk istirahat.",
          },
        },
        {
          id: "e-la-level", contoh: true,
          judul: { en: "Experience", id: "Pengalaman menyelam" },
          isi: {
            en: "Many routes are fine with an Open Water certificate. Routes with strong currents are more comfortable with Advanced. Ask us about the route.",
            id: "Banyak rute cukup dengan sertifikat Open Water. Rute berarus kuat lebih nyaman dengan Advanced. Tanyakan rutenya ke kami.",
          },
        },
        {
          id: "e-la-mabuk", contoh: true,
          judul: { en: "Seasickness", id: "Mabuk laut" },
          isi: {
            en: "The boat crosses open water between islands. If you get seasick easily, bring medicine and take it before the crossing.",
            id: "Kapal menyeberangi laut terbuka antar pulau. Kalau mudah mabuk laut, bawa obat dan minum sebelum menyeberang.",
          },
        },
        {
          id: "e-la-bawa", contoh: true,
          judul: { en: "What to pack", id: "Yang perlu dibawa" },
          isi: {
            en: "Light clothes, a thin jacket for evenings on deck, reef safe sunscreen, and a power bank for your camera.",
            id: "Baju ringan, jaket tipis untuk malam di dek, tabir surya ramah karang, dan power bank untuk kamera.",
          },
        },
        {
          id: "e-la-musim", contoh: true,
          judul: { en: "Season", id: "Musim" },
          isi: {
            en: "Most boats sail Raja Ampat around October to April, when the sea is calmer. Outside those months there are fewer departures.",
            id: "Kebanyakan kapal berlayar di Raja Ampat sekitar Oktober sampai April, saat laut lebih tenang. Di luar bulan itu keberangkatannya lebih sedikit.",
          },
        },
      ],
    },
  },
  footer: {
    tentang: {
      en: "Dive and snorkel trips in Raja Ampat for small groups, with local guides.",
      id: "Trip selam dan snorkeling di Raja Ampat untuk rombongan kecil, bersama pemandu lokal.",
    },
  },
  // Kategori aktivitas seperti website lama Fantasea (permintaan pemilik,
  // November 2026). Fotonya ilustrasi bawaan, ganti di panel Trip dan harga.
  kategori: [
    { id: "homestay-selam", tampil: true, foto: F("pantai-karst"), nama: { en: "Dive Homestay", id: "Homestay selam" }, ringkas: { en: "Dive packages with a stay at a homestay by the sea.", id: "Paket selam sekaligus menginap di homestay tepi laut." } },
    { id: "kursus", tampil: true, foto: F("penyelam-ok"), nama: { en: "Diving Courses", id: "Kursus selam" }, ringkas: { en: "Courses to start diving or take the next step.", id: "Kursus untuk mulai menyelam atau naik ke tingkat berikutnya." } },
    { id: "liveaboard", tampil: true, foto: F("kapal-penyelam"), nama: { en: "Liveaboards", id: "Liveaboard" }, ringkas: { en: "Several days on a boat to the far reefs.", id: "Beberapa hari di kapal menuju karang yang jauh." } },
    { id: "spesialti", tampil: true, foto: F("penyelam-gua"), nama: { en: "Specialty Courses", id: "Kursus spesialti" }, ringkas: { en: "Focused courses after your first certificate.", id: "Kursus khusus setelah sertifikat pertamamu." } },
    { id: "selam", tampil: true, foto: F("penyelam-karang"), nama: { en: "Fun Diving (Certified Diver)", id: "Fun diving (penyelam bersertifikat)" }, ringkas: { en: "Guided dives for certified divers.", id: "Penyelaman bersama pemandu untuk penyelam bersertifikat." } },
    { id: "try-scuba", tampil: true, foto: F("penyelam-biru"), nama: { en: "Try Scuba (Non-certified)", id: "Try scuba (belum bersertifikat)" }, ringkas: { en: "A first dive with an instructor, no certificate needed.", id: "Selam pertama bersama instruktur, tanpa sertifikat." } },
    { id: "snorkel", tampil: true, foto: F("snorkel-laguna"), nama: { en: "Snorkeling", id: "Snorkeling" }, ringkas: { en: "Reefs and lagoons from the surface.", id: "Karang dan laguna dari permukaan." } },
    { id: "ekstra", tampil: true, foto: F("speedboat-laguna"), nama: { en: "Extra Service", id: "Layanan tambahan" }, ringkas: { en: "Transfers, gear rental, and other help for your trip.", id: "Antar jemput, sewa alat, dan bantuan lain untuk perjalananmu." } },
  ],
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
      alat: false,
      sorot: { en: "", id: "" },
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
      alat: false,
      sorot: { en: "", id: "" },
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
      alat: false,
      sorot: { en: "", id: "" },
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
      kategori: "selam",
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
      alat: false,
      sorot: { en: "", id: "" },
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
  // Daftar, kapasitas, dan harga USD per malam untuk dua orang dari gambar pemilik.
  // Foto asli ditambahkan melalui panel Homestay, tanpa memakai ilustrasi sebagai foto properti.
  homestay: [
    {"id": "h-corepen", "slug": "corepen", "nama": {"en": "Corepen Dive Homestay", "id": "Corepen Dive Homestay"}, "lokasi": {"en": "Gam Island", "id": "Pulau Gam"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 72, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 14, "foto": [], "tampil": true},
    {"id": "h-dapunlol", "slug": "dapunlol", "nama": {"en": "Dapunlol Homestay", "id": "Dapunlol Homestay"}, "lokasi": {"en": "Misool", "id": "Misool"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 192, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 10, "foto": [], "tampil": true},
    {"id": "h-kalma", "slug": "kalma", "nama": {"en": "Kalma Homestay", "id": "Kalma Homestay"}, "lokasi": {"en": "Mansuar Island", "id": "Pulau Mansuar"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 90, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 8, "foto": [], "tampil": true},
    {"id": "h-korain", "slug": "korain", "nama": {"en": "Korain Homestay", "id": "Korain Homestay"}, "lokasi": {"en": "Friwen Island", "id": "Pulau Friwen"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 56, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 6, "foto": [], "tampil": true},
    {"id": "h-kordiris", "slug": "kordiris", "nama": {"en": "Kordiris Dive Homestay", "id": "Kordiris Dive Homestay"}, "lokasi": {"en": "Gam Island", "id": "Pulau Gam"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 50, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 22, "foto": [], "tampil": true},
    {"id": "h-lumba-lumba", "slug": "lumba-lumba", "nama": {"en": "Lumba-Lumba Homestay", "id": "Lumba-Lumba Homestay"}, "lokasi": {"en": "Kri Island", "id": "Pulau Kri"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 74, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 8, "foto": [], "tampil": true},
    {"id": "h-mandum", "slug": "mandum", "nama": {"en": "Mandum Homestay", "id": "Mandum Homestay"}, "lokasi": {"en": "Saporkren", "id": "Saporkren"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 56, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 10, "foto": [], "tampil": true},
    {"id": "h-nut-tonton", "slug": "nut-tonton", "nama": {"en": "Nut Tonton Homestay", "id": "Nut Tonton Homestay"}, "lokasi": {"en": "Misool", "id": "Misool"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 190, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 12, "foto": [], "tampil": true},
    {"id": "h-panun", "slug": "panun", "nama": {"en": "Panun Private Island", "id": "Panun Private Island"}, "lokasi": {"en": "Misool", "id": "Misool"}, "ringkas": {"en": "Bungalow room with attached bathroom, 24-hour AC and Starlink WiFi.", "id": "Kamar bungalo dengan kamar mandi dalam, AC 24 jam, dan WiFi Starlink."}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": ["Attached bathroom", "24-hour AC", "Starlink WiFi"], "id": ["Kamar mandi dalam", "AC 24 jam", "WiFi Starlink"]}, "hargaMulai": 200, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 20, "foto": [], "tampil": true},
    {"id": "h-pesona-papua", "slug": "pesona-papua", "nama": {"en": "Pesona Papua Homestay", "id": "Pesona Papua Homestay"}, "lokasi": {"en": "Sawinggrai", "id": "Sawinggrai"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 60, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 6, "foto": [], "tampil": true},
    {"id": "h-wainay", "slug": "wainay", "nama": {"en": "Wainay Homestay", "id": "Wainay Homestay"}, "lokasi": {"en": "Gam Island", "id": "Pulau Gam"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 56, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 12, "foto": [], "tampil": true},
    {"id": "h-warahnus", "slug": "warahnus", "nama": {"en": "Warahnus Dive Homestay", "id": "Warahnus Dive Homestay"}, "lokasi": {"en": "Kri Island", "id": "Pulau Kri"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 106, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 12, "foto": [], "tampil": true},
    {"id": "h-yenwar", "slug": "yenwar", "nama": {"en": "Yenwar Homestay", "id": "Yenwar Homestay"}, "lokasi": {"en": "Gam Island", "id": "Pulau Gam"}, "ringkas": {"en": "", "id": ""}, "deskripsi": {"en": "", "id": ""}, "fasilitas": {"en": [], "id": []}, "hargaMulai": 56, "mataUang": "USD", "hargaUntuk": 2, "kapasitas": 6, "foto": [], "tampil": true},
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

/** Kontak dan media sosial yang masih sama dengan contoh bawaan, untuk Ringkasan dan editor Kontak panel. */
export function kontakMasihContoh(k: Konten): { wa: boolean; lain: string[] } {
  const b = KONTEN_BAWAAN.situs;
  const lain = [
    k.situs.kontak.email && k.situs.kontak.email === b.kontak.email ? "Email" : "",
    ...(([["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"], ["youtube", "YouTube"]] as const)
      .map(([kunci, nama]) => (k.situs.sosial[kunci] && k.situs.sosial[kunci] === b.sosial[kunci] ? nama : ""))),
  ].filter(Boolean);
  return { wa: !nomorWaAsli(k.situs.kontak.whatsapp), lain };
}
