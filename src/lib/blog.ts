export const siteUrl = "https://offstories.fun";

export type BlogSubSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  ordered?: string[];
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  ordered?: string[];
  subsections?: BlogSubSection[];
  quote?: string;
  callout?: { title: string; body: string };
  table?: { headers: string[]; rows: string[][] };
};

export type BlogFAQ = {
  question: string;
  answer: string;
};

export type BlogAuthor = {
  name: string;
  role: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  categoryId: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  author: BlogAuthor;
  intro: string;
  sections: BlogSection[];
  faqs: BlogFAQ[];
  relatedSlugs: string[];
  keywords: string[];
  tags: string[];
  published: boolean;
  featuredImage?: string;
  imageAlt?: string;
};

export type BlogCategory = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  emoji: string;
};

const blogDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatBlogDate(date: string) {
  return blogDateFormatter.format(new Date(date));
}

export function slugifyCategory(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const offStoriesAuthor: BlogAuthor = {
  name: "Tim OffStories",
  role: "Wedding planning guides untuk pasangan Indonesia",
};

export const blogPosts: BlogPost[] = [
  {
    slug: "checklist-12-bulan-sebelum-nikah",
    title: "Checklist 12 Bulan Sebelum Nikah di Indonesia: Timeline yang Lebih Terkontrol",
    excerpt:
      "Timeline praktis dari 12 bulan sebelum hari H sampai mendekati acara, cocok untuk pasangan yang ingin mengurangi keputusan mendadak.",
    categoryId: "planning-budget",
    publishedAt: "2026-08-07",
    updatedAt: "2026-08-13",
    readingTime: "7 menit baca",
    author: offStoriesAuthor,
    intro:
      "Timeline pernikahan yang bagus bukan yang paling padat, melainkan yang paling realistis. Kalau kamu mulai sekitar 12 bulan sebelum hari H, kamu punya cukup ruang untuk mengunci tanggal, menyusun budget, memilih vendor, dan menghindari keputusan mendadak yang biasanya paling mahal. Di Indonesia, urutan yang rapi juga membantu kamu menyesuaikan jadwal KUA, akad nikah, resepsi, dan kebutuhan keluarga besar.",
    sections: [
      {
        heading: "12 sampai 9 bulan sebelum acara",
        paragraphs: [
          "Fase ini biasanya dipakai untuk mengunci fondasi utama. Lokasi, range budget, format acara, dan prioritas keluarga sebaiknya sudah mulai jelas. Setelah itu, vendor besar seperti venue, catering, dan foto-video bisa mulai dibicarakan. Kalau kamu ingin mengurus akad di KUA, ini juga waktu yang pas untuk mulai mengantisipasi jadwal administratif dan kebutuhan dokumen.",
        ],
        ordered: [
          "Tentukan tanggal dan kota acara.",
          "Susun range budget awal.",
          "Buat daftar vendor prioritas.",
          "Mulai catat kebutuhan adat atau keluarga.",
        ],
        callout: {
          title: "Tips penting",
          body: "Simpan semua keputusan dan kontak vendor di satu tempat sejak awal supaya tidak ada yang tercecer di chat yang berbeda.",
        },
      },
      {
        heading: "8 sampai 4 bulan sebelum acara",
        paragraphs: [
          "Di fase ini, detail mulai bergerak cepat. Kamu biasanya sudah punya shortlist vendor, checklist seserahan, draft guest list, dan rencana dekor. Ini juga waktu yang tepat untuk mulai menyusun pembagian pembayaran agar arus kas tetap aman.",
        ],
        bullets: [
          "Finalisasi vendor utama.",
          "Review progres budget dan pembayaran.",
          "Lengkapi data tamu dan undangan.",
          "Mulai susun rundown acara.",
        ],
      },
      {
        heading: "3 bulan terakhir",
        paragraphs: [
          "Tiga bulan terakhir adalah masa pengecekan, bukan masa panik. Fokusnya pindah ke konfirmasi tamu, pengecekan cetak, finalisasi seating, dan briefing hari H. Kalau semua data sudah rapi sebelumnya, fase ini justru terasa lebih tenang dari yang dibayangkan.",
        ],
        quote:
          "Rundown yang jelas dan data yang rapi adalah dua hal yang paling menenangkan di minggu-minggu terakhir.",
      },
    ],
    faqs: [
      {
        question: "Apakah 12 bulan selalu dibutuhkan?",
        answer:
          "Tidak selalu, tetapi rentang ini ideal untuk venue populer, adat yang kompleks, atau pasangan yang ingin planning lebih santai.",
      },
      {
        question: "Kalau mulai mepet, apa yang harus didahulukan?",
        answer:
          "Kunci tanggal, budget, venue, dan vendor utama dulu. Sisanya bisa menyusul setelah fondasi aman.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "rundown-resepsi-wedding-4-jam", "nikah-jakarta-budget-50-juta"],
    keywords: ["timeline pernikahan", "checklist 12 bulan sebelum nikah", "wedding timeline indonesia"],
    tags: ["timeline", "checklist", "persiapan"],
    published: true,
  },
  {
    slug: "nikah-jakarta-budget-50-juta",
    title: "Nikah di Jakarta dengan Budget 50 Juta: Breakdown Real dari Pasangan",
    excerpt:
      "Breakdown nyata dari pasangan yang sudah lewat: ke mana saja Rp 50 juta habis, dan bagian mana yang paling layak diprioritaskan.",
    categoryId: "planning-budget",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-13",
    readingTime: "7 menit baca",
    author: offStoriesAuthor,
    intro:
      "Rp 50 juta untuk pernikahan di Jakarta sering terdengar mustahil, padahal banyak pasangan berhasil melewatinya dengan alokasi yang disiplin. Kuncinya bukan menekan semua item, melainkan memutuskan di mana kamu rela 'boros' dan di mana kamu rela sederhana. Sebelum mulai, sisihkan dulu dana cadangan supaya perubahan kecil tidak langsung bikin panik.",
    sections: [
      {
        heading: "50 juta di Jakarta realistis untuk siapa",
        paragraphs: [
          "Angka ini paling masuk akal untuk pernikahan dengan tamu di kisaran 100–200 orang, format resepsi tunggal (tanpa akad terpisah yang menyewa gedung lain), dan vendor yang bukan tier premium. Jakarta memang punya tarif lebih tinggi daripada kota satelit, tapi masih ada venue murah seperti gedung serbaguna, ballroom di hotel menengah, atau restoran dengan paket all-in.",
          "Kalau kamu menginginkan akad dan resepsi dengan dua venue berbeda di hari yang sama, siapkan alokasi tambahan untuk logistik dan sewa. Sebaiknya angka 50 juta ini dipakai untuk satu rangkaian acara yang menyatu.",
        ],
        bullets: [
          "Cocok untuk tamu 100–200 pax.",
          "Venue all-in atau gedung serbaguna menjadi penyelamat budget.",
          "Dana cadangan 10% harus diambil dari total, bukan setelahnya.",
        ],
      },
      {
        heading: "Contoh alokasi Rp 50 juta",
        paragraphs: [
          "Tidak ada rumus yang sama untuk semua pasangan, tapi pola di bawah ini memberi gambaran distribusi yang rata-rata berhasil:",
        ],
        table: {
          headers: ["Komponen", "Alokasi", "Catatan"],
          rows: [
            ["Venue + catering", "Rp 25 juta", "Porsi terbesar, sangat menentukan"],
            ["Dekorasi & dokumentasi", "Rp 10 juta", "Prioritas visual"],
            ["Makeup, busana, MC", "Rp 7 juta", "Sesuaikan dengan kebutuhan"],
            ["Seserahan & undangan", "Rp 6 juta", "Bisa dikompres"],
            ["Cadangan & biaya kecil", "Rp 2 juta", "Jangan dilewati"],
          ],
        },
      },
      {
        heading: "Di mana bisa hemat dan di mana jangan",
        paragraphs: [
          "Bagian yang paling aman dihemat adalah dekorasi tambahan, souvenir, dan rangkaian sound system yang berlebihan. Sebaliknya, jangan memotong dokumentasi dan catering secara ekstrem, karena dua hal ini paling menentukan kesan acara di mata tamu dan keluarga besar.",
          "Kalau kamu butuh panduan yang lebih detail, catat semua angka di satu tempat sejak awal supaya keputusan tidak tercecer di chat vendor yang berbeda-beda.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah 50 juta sudah termasuk gaun pengantin?",
        answer:
          "Tergantung pembagian. Sebagian pasangan memasukkannya ke budget busana, sebagian lagi memisahkannya dari paket utama karena bisa disewa.",
      },
      {
        question: "Kota satelit di sekitar Jakarta lebih hemat berapa?",
        answer:
          "Bisa 20–30% lebih hemat untuk venue dan vendor. Kalau keluarga berkenan, opsi ini cukup membantu.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "checklist-12-bulan-sebelum-nikah", "cara-negosiasi-harga-vendor"],
    keywords: ["budget wedding jakarta 50 juta", "nikah di jakarta budget 50 juta", "biaya pernikahan jakarta"],
    tags: ["budget", "jakarta", "breakdown biaya"],
    published: true,
  },
  {
    slug: "panduan-adat-pernikahan-jawa",
    title: "Panduan Adat Pernikahan Jawa: Dari Lamaran sampai Resepsi",
    excerpt:
      "Rangkaian prosesi adat Jawa dari lamaran, akad, sampai resepsi, lengkap dengan makna dan persiapan biayanya.",
    categoryId: "tradisi-adat",
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-13",
    readingTime: "8 menit baca",
    author: offStoriesAuthor,
    intro:
      "Pernikahan adat Jawa punya rangkaian yang kaya makna, dari lamaran sampai panggih di resepsi. Bagi sebagian keluarga, prosesi ini wajib, bagi yang lain cukup dipilih yang penting. Yang paling bijak adalah duduk bersama keluarga untuk menyepakati prosesi mana yang benar-benar dijalankan, agar budget dan tenaga tidak habis untuk hal yang sebenarnya tidak diminta siapa pun.",
    sections: [
      {
        heading: "Sejak lamaran dan peningset",
        paragraphs: [
          "Rangkaian biasanya diawali lamaran yang dilanjutkan penyerahan peningset, sebagian di antaranya dikembalikan sebagai simbol pernyataan. Di sinilah seserahan dan perlengkapan adat mulai disiapkan, termasuk kebutuhan busana keluarga inti yang biasanya ikut terlibat.",
          "Jangan mulai dari daftar barang. Mulai dari kesepakatan keluarga: siapa yang menanggung apa, dan simbol apa yang benar-benar akan dipakai.",
        ],
        bullets: [
          "Siapkan seserahan sesuai kesepakatan keluarga.",
          "Cek kebutuhan busana untuk keluarga inti.",
          "Catat siapa yang menjadi saksi dan penghulu.",
        ],
      },
      {
        heading: "Akad, siraman, dan midodareni",
        paragraphs: [
          "Sebelum akad, sering ada siraman dan midodareni sebagai persiapan spiritual dan simbolis. Ketiganya butuh koordinasi jadwal dan tempat, terutama kalau berkaitan dengan sanggar atau tokoh adat. Pastikan semua pihak tahu urutan waktu sejak jauh-jauh hari.",
        ],
        ordered: [
          "Tentukan waktu siraman dan siapa yang memandu.",
          "Siapkan perlengkapan midodareni jika keluarga memakainya.",
          "Konsultasikan urutan akad dengan penghulu atau KUA.",
        ],
        callout: {
          title: "Common mistake",
          body: "Menambah prosesi di tengah jalan tanpa kesepakatan kedua keluarga, padahal budget dan logistik sudah dikunci.",
        },
      },
      {
        heading: "Resepsi dan panggih",
        paragraphs: [
          "Puncaknya, prosesi panggih bisa diringkas atau dijalankan penuh sesuai kesepakatan. Beberapa pasangan memilih versi singkat agar tamu tidak menunggu terlalu lama. Yang terpenting, urutan MC sudah disetujui dan seluruh simbol prosesi sudah siap sebelum acara dimulai.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah semua prosesi adat Jawa wajib?",
        answer:
          "Tidak wajib. Yang wajib adalah kesepakatan antara kedua keluarga dan pelaksanaan simbol yang disetujui bersama.",
      },
      {
        question: "Berapa biaya tambahan untuk prosesi adat?",
        answer:
          "Sangat bervariasi tergantung sanggar, jumlah seserahan, dan busana. Idealnya dibuat rinci dulu sebelum menetapkan vendor utama.",
      },
    ],
    relatedSlugs: ["checklist-seserahan-pernikahan", "nikah-adat-vs-nikah-sipil", "rundown-resepsi-wedding-4-jam"],
    keywords: ["adat pernikahan jawa", "prosesi pernikahan jawa", "biaya adat jawa", "panggih"],
    tags: ["adat jawa", "prosesi", "budaya"],
    published: true,
  },
  {
    slug: "budget-pernikahan-indonesia",
    title: "Budget Pernikahan di Indonesia: Cara Membagi Anggaran Tanpa Over",
    excerpt:
      "Panduan praktis untuk membagi biaya venue, catering, dekor, WO, dokumentasi, dan dana cadangan supaya anggaran pernikahan tetap sehat.",
    categoryId: "planning-budget",
    publishedAt: "2026-08-01",
    updatedAt: "2026-08-12",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Di Indonesia, budget pernikahan biasanya paling cepat membengkak di tiga area: venue, catering, dan vendor utama. Kalau tiga komponen ini tidak dihitung sejak awal, pasangan sering baru sadar bahwa total pengeluaran sudah melewati target setelah kontrak pertama ditandatangani. Karena itu, pembagian anggaran perlu dibuat sejak fase awal, bukan setelah semua keputusan besar selesai. Buat pasangan yang menikah di Jakarta, Surabaya, Bandung, Bali, atau kota besar lain, perbedaan harga antarkota bisa terasa sangat nyata sejak awal pencarian vendor.",
    sections: [
      {
        heading: "Apa yang paling memengaruhi budget",
        paragraphs: [
          "Kota tempat acara sangat menentukan level biaya. Jakarta, Surabaya, Bandung, Bali, dan kota besar lain biasanya punya tarif venue dan vendor yang lebih tinggi daripada kota satelit. Jumlah tamu juga memengaruhi semua lini: venue, catering, kursi, parkir, dekor, souvenir, dan tim operasional. Kalau acaranya memakai format akad dan resepsi terpisah, kamu juga perlu mengeluarkan budget tambahan untuk flow tamu dan waktu sewa venue.",
          "Kalau kamu sudah tahu lokasi dan estimasi tamu, kamu sebenarnya sudah punya dua input terbesar untuk memulai perhitungan budget yang masuk akal.",
        ],
        bullets: [
          "Venue dan catering biasanya menyerap porsi terbesar.",
          "Dekor dan dokumentasi naik turun tergantung gaya acara.",
          "Dana cadangan 10–15% membantu mengurangi stres saat ada perubahan mendadak.",
        ],
      },
      {
        heading: "Contoh pembagian anggaran yang sehat",
        paragraphs: [
          "Untuk banyak pasangan, model yang paling aman adalah membuat alokasi berdasarkan prioritas, bukan membagi rata. Jika kamu ingin pengalaman tamu yang kuat, catering dan venue bisa jadi fokus utama. Kalau kamu ingin kenangan visual yang rapi, dokumentasi dan dekor perlu diperkuat.",
        ],
        ordered: [
          "Tentukan total budget maksimal yang benar-benar nyaman dipakai.",
          "Pisahkan kebutuhan wajib, kebutuhan penting, dan tambahan opsional.",
          "Sisihkan dana cadangan sebelum membagi ke vendor mana pun.",
          "Bandingkan estimasi vendor dengan harga pasar lokal di kota acara.",
        ],
      },
      {
        heading: "Kesalahan yang paling sering terjadi",
        paragraphs: [
          "Banyak pasangan memulai dari dekor atau seragam dulu, padahal komponen yang paling berat justru venue dan catering. Ada juga yang belum menghitung biaya kecil seperti transport tim, biaya parkir, revisi desain, atau pajak layanan. Hal-hal kecil ini terlihat sepele, tetapi bisa menggerus ruang budget dengan cepat.",
          "Kalau kamu masih di tahap awal, lebih baik bikin estimasi dalam rentang angka, bukan satu angka pasti. Rentang memberi ruang napas saat harga vendor berubah.",
        ],
      },
    ],
    faqs: [
      {
        question: "Berapa dana cadangan yang ideal?",
        answer:
          "Sisihkan sekitar 10–15% dari total budget untuk revisi, biaya tambahan, dan kebutuhan tak terduga.",
      },
      {
        question: "Apakah budget pernikahan harus ditentukan sebelum pilih vendor?",
        answer:
          "Iya, karena budget awal membantu kamu menyaring vendor yang realistis dan mencegah keputusan impulsif.",
      },
    ],
    relatedSlugs: ["nikah-jakarta-budget-50-juta", "wedding-organizer-vs-diy-wedding", "checklist-seserahan-pernikahan"],
    keywords: ["budget pernikahan indonesia", "budget wedding indonesia", "cara membagi budget nikah"],
    tags: ["budget", "anggaran", "tips keuangan"],
    published: true,
  },
  {
    slug: "checklist-seserahan-pernikahan",
    title: "Checklist Seserahan Pernikahan di Indonesia: Barang, Timing, dan Cara Menyusunnya",
    excerpt:
      "Daftar seserahan yang umum di Indonesia, kapan harus mulai menyiapkan, dan cara mengatur checklist supaya tidak ada item yang tertinggal.",
    categoryId: "tradisi-adat",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-13",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Seserahan sering terasa sederhana di awal, tetapi begitu mulai dicatat, itemnya cepat bertambah. Karena tiap keluarga punya kebiasaan yang berbeda, checklist seserahan sebaiknya diperlakukan seperti daftar kerja: jelas, bisa dicentang, dan mudah disesuaikan dengan adat keluarga masing-masing. Di Indonesia, isi seserahan bisa ikut berubah tergantung adat Jawa, Sunda, Minang, Bugis, Betawi, atau kebiasaan keluarga inti.",
    sections: [
      {
        heading: "Apa yang biasanya masuk ke seserahan",
        paragraphs: [
          "Isi seserahan bisa berbeda-beda tergantung tradisi keluarga, tetapi biasanya ada kombinasi barang pribadi, perlengkapan ibadah, produk perawatan diri, pakaian, hingga kebutuhan simbolis yang disepakati bersama. Intinya bukan menyalin daftar orang lain mentah-mentah, melainkan menyesuaikan dengan adat, kemampuan, dan preferensi keluarga. Kalau keluarga ingin aman, formatnya bisa dibuat bertahap: barang yang wajib, barang tambahan, dan barang simbolis yang sudah disepakati sejak awal.",
          "Kalau kamu ingin rapi, pisahkan seserahan ke beberapa kategori supaya lebih mudah ditandai saat belanja.",
        ],
        bullets: [
          "Perlengkapan pribadi dan perawatan diri.",
          "Pakaian atau aksesori yang relevan dengan adat keluarga.",
          "Barang simbolis sesuai kebiasaan daerah atau keluarga.",
          "Dokumen kecil untuk cek ulang isi sebelum serah terima.",
        ],
      },
      {
        heading: "Kapan mulai menyiapkan",
        paragraphs: [
          "Idealnya, checklist seserahan mulai disusun jauh sebelum hari H supaya kamu punya cukup waktu untuk membandingkan harga, mencari kemasan yang rapi, dan memastikan semua barang tersedia. Beberapa item bisa dibeli lebih awal, sementara item tertentu sebaiknya dibeli mendekati acara agar tetap fresh dan sesuai kebutuhan terakhir.",
        ],
        ordered: [
          "Mulai daftar awal begitu tanggal pernikahan sudah cukup jelas.",
          "Pisahkan item yang harus dibeli cepat dan item yang bisa menunggu.",
          "Cek ulang ukuran, warna, dan kebutuhan adat sebelum final belanja.",
          "Siapkan satu orang yang bertugas memeriksa checklist akhir.",
        ],
      },
      {
        heading: "Cara menghindari daftar yang berantakan",
        paragraphs: [
          "Masalah paling umum dalam seserahan adalah duplikasi item, ukuran yang salah, atau barang yang sebenarnya tidak disepakati keluarga. Karena itu, checklist harus punya status yang jelas: belum dibeli, dibeli, dikemas, dan siap dibawa. Kalau kamu memakai tracker sederhana, seluruh proses jadi jauh lebih tenang.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah seserahan harus sama persis dengan tradisi daerah tertentu?",
        answer:
          "Tidak selalu. Yang penting adalah mengikuti kesepakatan keluarga dan kebutuhan adat yang benar-benar dipakai.",
      },
      {
        question: "Apakah checklist seserahan bisa dibuat di aplikasi?",
        answer:
          "Bisa banget. Checklist digital memudahkan kamu menandai item yang sudah dibeli, disusun, dan siap dikirim.",
      },
    ],
    relatedSlugs: ["panduan-adat-pernikahan-jawa", "budget-pernikahan-indonesia", "cara-negosiasi-harga-vendor"],
    keywords: ["seserahan pernikahan", "checklist seserahan", "barang seserahan"],
    tags: ["seserahan", "adat", "checklist"],
    published: true,
  },
  {
    slug: "wedding-organizer-vs-diy-wedding",
    title: "Wedding Organizer vs DIY Wedding di Indonesia: Kapan Perlu WO?",
    excerpt:
      "Bandingkan peran wedding organizer dan planning mandiri agar kamu tahu kapan WO benar-benar membantu, dan kapan kamu bisa mengelola sendiri.",
    categoryId: "planning-budget",
    publishedAt: "2026-08-04",
    updatedAt: "2026-08-13",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Di Indonesia, keputusan pakai Wedding Organizer sering ditentukan bukan cuma oleh budget, tetapi juga oleh kompleksitas keluarga, jumlah tamu, adat yang dipakai, dan seberapa banyak vendor yang perlu dikontrol. Ada pasangan yang cukup nyaman mengatur sendiri, tetapi ada juga yang butuh WO untuk menjaga timeline tetap rapi dan keluarga tetap tenang. Saat akad, resepsi, dan sesi keluarga terjadi dalam satu hari, koordinasi WO biasanya terasa jauh lebih membantu.",
    sections: [
      {
        heading: "Kapan WO paling membantu",
        paragraphs: [
          "WO paling berguna saat kamu punya banyak vendor, jadwal yang padat, atau keluarga yang ingin semuanya berjalan dengan detail tertentu. Mereka membantu koordinasi hari H, menyusun urutan kerja vendor, dan mengurangi beban komunikasi yang biasanya melelahkan kalau semua dilakukan oleh pasangan sendiri. Ini sangat terasa kalau kamu harus sinkron dengan gedung, WO, keluarga besar, MC, dekor, dan dokumentasi sekaligus.",
        ],
        bullets: [
          "Acara dengan banyak vendor dan titik koordinasi.",
          "Pernikahan dengan adat atau rangkaian acara yang panjang.",
          "Pasangan yang sibuk dan sulit memantau detail harian.",
        ],
      },
      {
        heading: "Kapan DIY masih realistis",
        paragraphs: [
          "Kalau acara kamu kecil, vendor tidak terlalu banyak, dan keluarga ikut aktif membantu, DIY wedding masih sangat mungkin. Yang penting, kamu punya sistem yang jelas: checklist, budget tracker, guest list, dan satu sumber data yang sama agar keputusan tidak tercecer di chat berbeda.",
        ],
        ordered: [
          "Tetapkan satu tempat untuk semua informasi.",
          "Bagi tugas ke orang yang benar-benar bisa diandalkan.",
          "Pastikan semua vendor punya kontak dan timeline yang tertulis.",
          "Review progres setiap minggu, bukan hanya saat mendekati hari H.",
        ],
      },
      {
        heading: "Risiko terbesar kalau tanpa sistem",
        paragraphs: [
          "Tanpa sistem, DIY wedding sering terasa lebih mahal secara waktu dan tenaga daripada yang terlihat di awal. Masalahnya bukan cuma lupa tugas, tetapi juga miskomunikasi kecil yang menumpuk. Karena itu, bahkan kalau kamu tidak pakai WO, kamu tetap butuh ruang kerja yang rapi untuk memantau semua keputusan.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah WO selalu lebih mahal?",
        answer:
          "Tidak selalu. Kadang biaya WO justru menghemat pengeluaran lain karena keputusan jadi lebih terarah dan vendor lebih terkoordinasi.",
      },
      {
        question: "Kalau tidak pakai WO, apa yang paling penting?",
        answer:
          "Checklist, timeline, dan komunikasi vendor yang jelas. Tanpa itu, beban koordinasi cepat terasa berat.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "rundown-resepsi-wedding-4-jam", "interview-vendor-katering"],
    keywords: ["wedding organizer vs diy", "perlu wedding organizer", "plan wedding sendiri"],
    tags: ["wedding organizer", "diy", "keputusan"],
    published: true,
  },
  {
    slug: "rsvp-seating-check-in-pernikahan",
    title: "RSVP, Seating, dan Check-in Pernikahan di Indonesia: Flow Tamu yang Lebih Rapi",
    excerpt:
      "Cara menata RSVP link, WhatsApp, seating, dan QR check-in supaya pengelolaan tamu lebih mudah dan acara berjalan lebih tenang.",
    categoryId: "acara-tamu",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-13",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Guest management sering baru terasa penting saat jumlah tamu mulai mendekati kapasitas venue. Padahal, alur RSVP, seating, dan check-in yang rapi bisa mengurangi antrean, menghindari kursi kosong yang kacau, dan membuat tim keluarga lebih mudah mengarahkan tamu di hari acara. Untuk pasangan di Indonesia, RSVP sering datang lewat WhatsApp, lalu perlu dirapikan lagi ke satu daftar utama supaya keluarga, WO, dan venue melihat data yang sama.",
    sections: [
      {
        heading: "Kenapa RSVP dulu baru seating",
        paragraphs: [
          "RSVP memberi gambaran siapa yang benar-benar datang dan berapa pax yang perlu disiapkan. Tanpa itu, seating plan mudah berubah karena kamu belum tahu jumlah hadir yang realistis. Setelah RSVP terkumpul, barulah kamu bisa menyusun susunan meja yang lebih masuk akal. Di acara keluarga besar, ini juga membantu menghindari tamu yang datang berkelompok tapi duduk terpencar.",
        ],
        bullets: [
          "RSVP menentukan estimasi hadir yang lebih akurat.",
          "Seating plan membantu venue dan keluarga mengatur kursi.",
          "Check-in QR mempercepat proses masuk tamu di pintu acara.",
        ],
      },
      {
        heading: "Flow sederhana yang biasanya paling aman",
        paragraphs: [
          "Untuk banyak pasangan, flow paling aman adalah kirim undangan, buka RSVP, susun seating, lalu siapkan check-in. Jika ada perubahan mendadak, tim di lapangan tetap bisa melihat data tamu yang paling baru. Dengan begitu, bagian depan acara tidak bergantung pada ingatan satu orang saja.",
        ],
        ordered: [
          "Kirim link RSVP ke tamu yang diundang.",
          "Kumpulkan jawaban hadir beserta jumlah pax.",
          "Susun seating berdasarkan keluarga, teman, dan prioritas meja.",
          "Gunakan QR atau daftar check-in saat tamu datang.",
        ],
      },
      {
        heading: "Hal yang sering bikin berantakan",
        paragraphs: [
          "Masalah paling umum adalah RSVP yang tersebar di banyak tempat: WhatsApp, spreadsheet, dan chat keluarga. Kalau data tidak digabung, seating jadi sulit dicek. Karena itu, satu dashboard tamu jauh lebih berguna daripada sekadar daftar nama panjang.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah seating plan harus dibuat untuk semua acara?",
        answer:
          "Tidak selalu, tetapi untuk acara dengan tamu banyak atau venue terbatas, seating plan sangat membantu.",
      },
      {
        question: "Apakah check-in QR wajib?",
        answer:
          "Tidak wajib, tapi sangat membantu kalau kamu ingin alur masuk tamu lebih cepat dan data kehadiran lebih rapi.",
      },
    ],
    relatedSlugs: ["rundown-resepsi-wedding-4-jam", "budget-pernikahan-indonesia", "checklist-12-bulan-sebelum-nikah"],
    keywords: ["rsvp pernikahan", "seating plan pernikahan", "check in tamu wedding"],
    tags: ["rsvp", "tamu", "seating"],
    published: true,
  },
  {
    slug: "cara-negosiasi-harga-vendor",
    title: "Cara Negosiasi Harga Vendor Tanpa Kelihatan Pelit",
    excerpt:
      "Teknik menawar vendor yang tetap sopan dan profesional, plus kapan lebih baik minta penyesuaian paket daripada potongan harga.",
    categoryId: "vendor-venue",
    publishedAt: "2026-08-11",
    updatedAt: "2026-08-13",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Banyak pasangan merasa canggung menawar vendor karena takut terkesan pelit. Padahal, vendor yang profesional justru menghargai pasangan yang komunikasinya jelas. Kuncinya bukan menekan harga mentah-mentah, tapi mencari titik tengah: penyesuaian paket, jadwal, atau tambahan kecil yang nilainya signifikan bagi kamu dan tetap wajar bagi vendor.",
    sections: [
      {
        heading: "Persiapkan sebelum menawar",
        paragraphs: [
          "Sebelum menghubungi vendor, kamu perlu tahu harga pasar di kota kamu dan paket apa yang benar-benar kamu butuhkan. Vendor akan lebih mudah bernegosiasi dengan pasangan yang datang dengan angka dan prioritas yang jelas, daripada sekadar bilang 'boleh kurang?'. Bawa juga tanggal acara yang pasti, karena itu menunjukkan keseriusan.",
        ],
        bullets: [
          "Riset 3–5 vendor sejenis untuk tahu harga wajar.",
          "Tentukan item wajib yang tidak bisa dikurangi.",
          "Siapkan tanggal dan lokasi acara yang pasti.",
        ],
      },
      {
        heading: "Cara bertanya yang sopan tapi tegas",
        paragraphs: [
          "Fokus pada penyesuaian paket daripada potongan harga langsung. Contoh kalimat yang efektif: 'Kalau bisa disesuaikan, kami lebih butuh tambahan waktu lighting daripada tambahan dekor, apakah ada opsi?' Pendekatan ini membuat percakapan terasa kolaboratif.",
        ],
      },
      {
        heading: "Kapan berhenti menawar",
        paragraphs: [
          "Kalau penawaran sudah masuk dalam rentang pasar dan vendor sudah memberi fleksibilitas, biasanya itu waktu yang tepat untuk berhenti menekan. Terlalu memaksa bisa berujung layanan yang setengah hati. Kontrak yang jelas dan progres komunikasi yang rapi jauh lebih berharga daripada selisih harga kecil.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah menawar bisa merusak hubungan dengan vendor?",
        answer:
          "Tidak, selama dilakukan dengan sopan dan fokus pada penyesuaian, bukan pemaksaan harga di bawah pasar.",
      },
      {
        question: "Kapan waktu terbaik untuk menawar?",
        answer:
          "Saat low season dan dengan tanggal pasti. Vendor lebih terbuka bernegosiasi ketika jadwal sedang tidak penuh.",
      },
    ],
    relatedSlugs: ["interview-vendor-katering", "nikah-jakarta-budget-50-juta", "budget-pernikahan-indonesia"],
    keywords: ["negosiasi harga vendor", "tips menawar vendor wedding", "cara hemat vendor"],
    tags: ["vendor", "negosiasi", "hemat"],
    published: true,
  },
  {
    slug: "interview-vendor-katering",
    title: "Interview Vendor Katering: 7 Pertanyaan yang Wajib Ditanyain",
    excerpt:
      "Daftar pertanyaan penting sebelum booking katering: mulai dari harga per pax, menu prasmanan, sampai kebijakan perubahan jumlah tamu.",
    categoryId: "vendor-venue",
    publishedAt: "2026-08-12",
    updatedAt: "2026-08-13",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Katering biasanya mengambil porsi terbesar dari budget resepsi, jadi memilihnya tidak boleh asal. Pertanyaan yang tepat di awal bisa menyelamatkanmu dari kejutan di akhir, seperti biaya peralatan, minimum pax, atau kebijakan saat tamu hadir lebih sedikit dari perkiraan. Berikut daftar yang wajib ditanyakan sebelum tanda tangan kontrak.",
    sections: [
      {
        heading: "7 pertanyaan inti",
        paragraphs: [
          "Bawa daftar ini saat bertemu calon vendor katering, dan minta semuanya ditulis dalam penawaran tertulis:",
        ],
        ordered: [
          "Berapa harga per pax dan apa saja yang sudah termasuk?",
          "Apakah ada minimal pax dan biaya penalti jika berkurang?",
          "Berapa jumlah pramusaji dan apakah sudah termasuk seragam?",
          "Apakah harga sudah termasuk peralatan, meja, dan setting?",
          "Bagaimana kebijakan tasting sebelum booking?",
          "Berapa lama stand by di lokasi dan apakah ada biaya lembur?",
          "Apakah tersedia opsi menu sesuai tamu anak-anak atau yang alergi?",
        ],
      },
      {
        heading: "Jangan lupa soal komunikasi",
        paragraphs: [
          "Tanyakan juga siapa PIC yang akan menangani hari H dan bagaimana dia bisa dihubungi. Perubahan jumlah tamu mendadak itu umum, jadi pastikan vendor punya alur update yang jelas supaya tim keluarga tidak menebak-nebak.",
        ],
      },
      {
        heading: "Sebelum tanda tangan",
        paragraphs: [
          "Semua jawaban di atas harus tertulis, bukan sekadar janji verbal. Cek juga reputasi vendor dari ulasan pasangan lain, dan minta contoh menu foto asli, bukan hanya foto portofolio yang dihias.",
        ],
      },
    ],
    faqs: [
      {
        question: "Berapa harga wajar katering per pax?",
        answer:
          "Sangat tergantung kota dan menu, umumnya mulai Rp 75.000 sampai ratusan ribu. Sesuaikan dengan paket dan kualitas.",
      },
      {
        question: "Apakah tasting wajib dilakukan?",
        answer:
          "Sangat disarankan untuk menu utama. Rasanya adalah hal yang paling sering dikeluhkan tamu.",
      },
    ],
    relatedSlugs: ["cara-negosiasi-harga-vendor", "rundown-resepsi-wedding-4-jam", "budget-pernikahan-indonesia"],
    keywords: ["interview vendor katering", "tips pilih katering wedding", "pertanyaan untuk katering"],
    tags: ["katering", "vendor", "pertanyaan"],
    published: true,
  },
  {
    slug: "rundown-resepsi-wedding-4-jam",
    title: "Rundown Resepsi Wedding 4 Jam: Template yang Bisa Dicopy",
    excerpt:
      "Susunan acara 4 jam dari tamu masuk sampai acara selesai, lengkap dengan waktu ideal untuk tiap sesi.",
    categoryId: "acara-tamu",
    publishedAt: "2026-08-08",
    updatedAt: "2026-08-13",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Resepsi yang berjalan mulus biasanya bukan karena kebetulan, melainkan karena rundown yang jelas dan direvisi bersama MC. Untuk acara 4 jam, setiap 30 menit punya fungsi masing-masing. Template di bawah bisa langsung kamu sesuaikan dengan adat, jumlah tamu, dan format acara kamu.",
    sections: [
      {
        heading: "Template rundown 4 jam",
        paragraphs: [
          "Rentang waktu berikut adalah titik mulai yang umum dipakai. MC dan WO bisa menyesuaikan dengan flow tamu di lapangan.",
        ],
        ordered: [
          "30 menit pertama: tamu masuk, registrasi, dan hiburan ringan.",
          "30 menit kedua: sesi foto keluarga dan panggih singkat.",
          "30 menit ketiga: sambutan keluarga dan penyampaian ayah/ibu.",
          "1 jam berikut: sesi makan prasmanan dan hiburan utama.",
          "1 jam berikut: foto tamu, games ringan, dan sesi ramah tamah.",
          "30 menit terakhir: ucapan terima kasih dan penutupan.",
        ],
        table: {
          headers: ["Waktu", "Sesi"],
          rows: [
            ["30 menit", "Tamu masuk, registrasi, hiburan ringan"],
            ["30 menit", "Foto keluarga dan panggih singkat"],
            ["30 menit", "Sambutan keluarga"],
            ["1 jam", "Makan prasmanan dan hiburan utama"],
            ["1 jam", "Foto tamu, games, ramah tamah"],
            ["30 menit", "Ucapan terima kasih dan penutupan"],
          ],
        },
      },
      {
        heading: "Hal yang sering bikin jadwal molor",
        paragraphs: [
          "Foto keluarga yang terlalu panjang, sambutan yang bertambah-tambah, dan masa antrean prasmanan adalah tiga penyebab paling umum. Untuk mengamankannya, batasi sesi foto dengan daftar orang yang jelas dan beri tenggat waktu yang disepakati MC.",
        ],
      },
      {
        heading: "Bagaimana tetap fleksibel",
        paragraphs: [
          "Rundown bukan aturan mati. Jika satu sesi molor, MC perlu instruksi prioritas: bagian mana yang boleh dipotong dan mana yang tidak. Pastikan penanggung jawab hari H tahu prioritas ini sebelum acara dimulai.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah 4 jam cukup untuk semua tamu foto?",
        answer:
          "Tergantung jumlah tamu. Untuk 100–200 pax umumnya cukup jika sesi foto dijadwalkan bertahap.",
      },
      {
        question: "Siapa yang menentukan urutan acara?",
        answer:
          "Pasangan dan keluarga, lalu disinkronkan dengan MC dan WO agar realistis di lapangan.",
      },
    ],
    relatedSlugs: ["rsvp-seating-check-in-pernikahan", "interview-vendor-katering", "panduan-adat-pernikahan-jawa"],
    keywords: ["rundown resepsi wedding", "susunan acara pernikahan", "template rundown 4 jam"],
    tags: ["rundown", "resepsi", "template"],
    published: true,
  },
  {
    slug: "tema-wedding-minimalis-2025",
    title: "Tema Wedding Minimalis 2025: Inspirasi dan Estimasi Budget",
    excerpt:
      "Ide tema minimalis yang sedang tren, cara memadukan warna netral, dan perkiraan budget dekorasi yang realistis.",
    categoryId: "dekorasi-konsep",
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-13",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Wedding minimalis tidak berarti kosong, melainkan fokus pada elemen inti dengan komposisi yang rapi. Di tahun 2025, palet netral seperti cream, sage, dan dusty pink masih mendominasi karena menghasilkan foto yang timeless. Kabar baiknya, tema ini sering lebih hemat karena mengurangi jumlah dekorasi yang bertumpuk.",
    sections: [
      {
        heading: "Ciri khas tema minimalis",
        paragraphs: [
          "Warna netral sebagai base, garis bersih, dan pencahayaan yang hangat menjadi tiga kunci utamanya. Alih-alih banyak bunga di semua sudut, tema ini menonjolkan satu titik fokus seperti pelaminan atau backdrop foto. Hasilnya, kesan mewah datang dari komposisi, bukan dari banyaknya barang.",
        ],
        bullets: [
          "Palet netral: cream, sage, dusty pink, terracotta.",
          "Fokus pada satu elemen statement.",
          "Proporsi dekorasi yang sudah dihitung sejak awal.",
        ],
      },
      {
        heading: "Estimasi budget dekorasi",
        paragraphs: [
          "Untuk venue yang sudah cukup bagus, dekorasi minimalis umumnya lebih murah daripada tema penuh. Beri ruang untuk florist, backdrop, dan tata cahaya sebagai tiga komponen utama.",
        ],
        ordered: [
          "Tentukan satu titik fokus (backdrop atau pelaminan).",
          "Alokasikan dana paling besar untuk titik fokus tersebut.",
          "Kurangi dekorasi pinggir yang hanya menambah biaya.",
          "Tambahkan lighting sebagai pengganti bunga tambahan.",
        ],
      },
      {
        heading: "Agar tidak terkesan kosong",
        paragraphs: [
          "Kunci tema minimalis adalah proporsi dan keberanian memilih. Sebaiknya konsultasikan denah venue dengan dekorator supaya ruang kosong terasa disengaja, bukan terlupakan. Foto dari acara serupa juga bisa jadi acuan sebelum keputusan final.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah tema minimalis cocok untuk tamu banyak?",
        answer:
          "Bisa, asalkan venue mendukung dan flow tamu tertata. Titik fokus yang kuat membantu arah pandang tetap rapi.",
      },
      {
        question: "Berapa budget dekorasi minimalis?",
        answer:
          "Bervariasi per kota, tetapi umumnya lebih rendah daripada dekorasi penuh karena jumlah elemen yang lebih terkontrol.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "nikah-jakarta-budget-50-juta", "rundown-resepsi-wedding-4-jam"],
    keywords: ["tema wedding minimalis", "dekorasi wedding", "inspirasi tema pernikahan"],
    tags: ["dekorasi", "tema", "warna"],
    published: true,
  },
  {
    slug: "skincare-6-bulan-sebelum-wedding",
    title: "Skincare Routine 6 Bulan Sebelum Wedding: yang Benar-benar Berdampak",
    excerpt:
      "Rutinitas perawatan kulit yang realistis dari 6 bulan sebelum hari H, fokus pada konsistensi bukan produk mahal.",
    categoryId: "fashion-prewedding",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-13",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Kulit yang sehat di hari H tidak terjadi dalam satu minggu. Dengan waktu 6 bulan, kamu punya kesempatan untuk memperbaiki tekstur, menjaga kelembapan, dan memberi ruang untuk konsultasi profesional jika dibutuhkan. Yang paling penting bukan membeli banyak produk, melainkan memulai lebih awal dan konsisten.",
    sections: [
      {
        heading: "Mulai dengan dasar dulu",
        paragraphs: [
          "Enam bulan sebelum hari H, fokus pada tiga hal: pembersihan, kelembapan, dan perlindungan matahari. Jangan menambah produk baru secara berlebihan, karena reaksi kulit baru biasanya muncul 2–4 minggu setelah pemakaian.",
        ],
        bullets: [
          "Gunakan pembersih yang lembut dan tidak membuat kering.",
          "Terapkan pelembap sesuai jenis kulit.",
          "Sun protection untuk area yang sering terekspos.",
          "Konsisten 3 bulan sebelum mencoba perawatan tambahan.",
        ],
      },
      {
        heading: "Kapan konsultasi profesional",
        paragraphs: [
          "Kalau ada masalah seperti jerawat aktif, pigmentasi, atau kulit sensitif, konsultasikan sejak H-6 bulan, bukan mendekati hari H. Perawatan klinik butuh waktu, dan beberapa prosedur tidak boleh dilakukan terlalu dekat dengan acara.",
        ],
      },
      {
        heading: "Perubahan yang dilakukan H-3 bulan",
        paragraphs: [
          "Di fase ini kamu bisa menambah perawatan yang lebih spesifik sesuai rekomendasi profesional, dan mulai menyamakan jadwal agar hari H bebas dari kemerahan atau tekstur baru. Jangan mencoba produk baru di bulan terakhir.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah perlu skincare yang mahal?",
        answer:
          "Tidak harus. Konsistensi dan pemilihan sesuai jenis kulit lebih berdampak daripada harga produk.",
      },
      {
        question: "Kapan sebaiknya rutinitas baru tidak ditambah lagi?",
        answer:
          "Kurang lebih H-1 sampai H-2 bulan, supaya kulit punya waktu menyesuaikan tanpa reaksi menjelang acara.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "cara-negosiasi-harga-vendor", "checklist-12-bulan-sebelum-nikah"],
    keywords: ["skincare pre wedding", "perawatan kulit sebelum nikah", "rutinitas skincare 6 bulan"],
    tags: ["skincare", "beauty", "persiapan diri"],
    published: true,
  },
  {
    slug: "tips-pose-natural-prewedding",
    title: "Tips Pose Natural untuk yang Tidak Terbiasa Difoto",
    excerpt:
      "Cara rileks di depan kamera untuk sesi prewedding, dari latihan kecil sampai teknik yang biasa dipakai fotografer.",
    categoryId: "fashion-prewedding",
    publishedAt: "2026-08-08",
    updatedAt: "2026-08-13",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Banyak pasangan cemas menghadapi sesi prewedding karena merasa kaku di depan kamera. Kabar baiknya, foto yang natural bukan soal bakat, melainkan latihan dan komunikasi dengan fotografer. Semakin rileks kamu, semakin mudah hasilnya terlihat seperti keseharian kalian.",
    sections: [
      {
        heading: "Persiapan kecil sebelum sesi",
        paragraphs: [
          "Kenakan pakaian yang nyaman dan tidak terlalu banyak aksesori yang perlu diatur terus-menerus. Latih beberapa pose sederhana di rumah, atau lihat referensi foto lalu tiru dengan versi kalian sendiri.",
        ],
        bullets: [
          "Pilih pakaian yang sudah pernah dipakai agar tidak asing.",
          "Latih pose dasar di depan cermin.",
          "Kumpulkan referensi dan kirim ke fotografer.",
        ],
      },
      {
        heading: "Teknik saat difoto",
        paragraphs: [
          "Alih-alih menyeringai atau berpikir soal pose, lakukan aktivitas kecil: berjalan berdampingan, tertawa pada candaan, atau saling memperhatikan. Gerakan sederhana inilah yang biasanya menghasilkan foto paling natural.",
        ],
      },
      {
        heading: "Komunikasi dengan fotografer",
        paragraphs: [
          "Jangan ragu memberi tahu fotografer jika ada sudut atau pose yang terasa aneh. Fotografer yang baik akan menyesuaikan. Setelah mengambil beberapa foto, minta lihat hasilnya sebentar supaya kamu lebih percaya diri untuk sisa sesi.",
        ],
      },
    ],
    faqs: [
      {
        question: "Berapa lama sesi prewedding biasanya?",
        answer:
          "Umumnya 2–4 jam per lokasi, tergantung paket dan jumlah outfit.",
      },
      {
        question: "Haruskah booking fotografer untuk referensi pose?",
        answer:
          "Idealnya iya. Komunikasi sebelum sesi membantu fotografer memahami gaya yang kamu suka.",
      },
    ],
    relatedSlugs: ["cara-negosiasi-harga-vendor", "rundown-resepsi-wedding-4-jam", "budget-pernikahan-indonesia"],
    keywords: ["tips pose prewedding", "pose natural di depan kamera", "foto prewedding"],
    tags: ["prewedding", "fotografi", "pose"],
    published: true,
  },
  {
    slug: "cincin-titanium-vs-emas",
    title: "Cincin Kawin Titanium vs Emas: Mana yang Lebih Tahan Lama?",
    excerpt:
      "Perbandingan cincin titanium dan emas dari segi kekuatan, harga, dan kenyamanan, supaya kamu pilih sesuai gaya hidup.",
    categoryId: "fashion-prewedding",
    publishedAt: "2026-08-07",
    updatedAt: "2026-08-13",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Pilihan antara titanium dan emas sering membuat pasangan galau karena keduanya punya keunggulan berbeda. Titanium dikenal ringan dan sangat tahan gores, sementara emas lebih fleksibel dan mudah diukir. Keputusan terbaik bergantung pada gaya hidup sehari-hari dan seberapa sering cincin akan dipakai.",
    sections: [
      {
        heading: "Titanium: apa keunggulannya",
        paragraphs: [
          "Titanium sangat ringan dan kuat, cocok untuk orang yang aktif menggunakan tangan. Karena hampir tidak teroksidasi, warnanya stabil dan tidak mudah luntur. Namun, titanium sulit diubah ukurannya, jadi pastikan ukuran sudah tepat saat membeli.",
        ],
        bullets: [
          "Sangat ringan dan nyaman dipakai lama.",
          "Tahan gores dan tidak mudah berubah warna.",
          "Sulit disesuaikan ukurannya setelah jadi.",
        ],
      },
      {
        heading: "Emas: apa keunggulannya",
        paragraphs: [
          "Emas lebih lentur, mudah diukir, dan bisa disesuaikan ukurannya di kemudian hari. Emas dengan kadar lebih tinggi cenderung lebih lembut, sementara kadar lebih rendah lebih tahan terhadap baret. Harganya mengikuti pasar, jadi bisa menjadi pilihan yang disesuaikan budget.",
        ],
      },
      {
        heading: "Cara memutuskan",
        paragraphs: [
          "Tanyakan pada diri sendiri seberapa aktif aktivitas harian dan seberapa penting kemudahan menyesuaikan ukuran. Kalau kamu bekerja banyak dengan tangan, titanium bisa lebih praktis. Kalau kamu ingin pola atau ukiran khusus, emas lebih fleksibel.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah titanium bisa digunakan untuk ukiran?",
        answer:
          "Bisa, tetapi lebih sulit daripada emas dan biasanya terbatas pada pola yang sudah jadi.",
      },
      {
        question: "Apakah cincin emas mudah baret?",
        answer:
          "Tergantung kadar. Kadar lebih rendah umumnya lebih tahan daripada kadar tinggi yang lebih lembut.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "cara-negosiasi-harga-vendor", "checklist-12-bulan-sebelum-nikah"],
    keywords: ["cincin titanium vs emas", "cincin kawin", "jewelry pernikahan"],
    tags: ["cincin", "jewelry", "perbandingan"],
    published: true,
  },
  {
    slug: "burnout-pre-wedding",
    title: "Burnout Pre-Wedding: Tanda-tanda dan Cara Mengatasinya",
    excerpt:
      "Kenali tanda stres berlebih saat persiapan pernikahan dan cara mengatasinya sebelum sampai ke titik kelelahan.",
    categoryId: "relationship-wellbeing",
    publishedAt: "2026-08-12",
    updatedAt: "2026-08-13",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Persiapan pernikahan seharusnya membahagiakan, tetapi bagi banyak pasangan justru menjadi salah satu fase paling melelahkan. Burnout muncul perlahan: rasa lelah yang tidak hilang, mudah tersinggung, dan menurunnya antusiasme pada detail acara. Mengenali tanda ini sejak dini jauh lebih penting daripada memaksakan semuanya sempurna.",
    sections: [
      {
        heading: "Tanda-tanda yang tidak boleh diabaikan",
        paragraphs: [
          "Burnout biasanya muncul sebagai kombinasi dari beberapa hal: sulit tidur karena terus membahas vendor, merasa semua keputusan diambil sendiri, dan hilangnya kesenangan membahas pernikahan. Jika dua atau lebih tanda ini bertahan selama lebih dari dua minggu, saatnya mengambil jeda.",
        ],
        bullets: [
          "Merasa lelah padahal tidak bekerja terlalu banyak.",
          "Mudah tersinggung pada hal-hal kecil.",
          "Kesulitan menikmati momen bersama pasangan.",
          "Menghindari pembahasan pernikahan.",
        ],
      },
      {
        heading: "Cara mengatasinya",
        paragraphs: [
          "Beri jeda untuk satu-dua hari tanpa menyentuh urusan wedding. Bagilah keputusan dengan pasangan agar beban tidak menumpuk di satu orang, dan buat daftar prioritas supaya kamu berhenti mengurus hal-hal yang tidak benar-benar penting.",
        ],
        ordered: [
          "Jadwalkan jeda bebas-wedding dalam seminggu.",
          "Bagi tanggung jawab vendor dan keputusan dengan pasangan.",
          "Turunkan standar pada bagian yang tidak dilihat tamu.",
          "Bicara jujur ke orang terdekat tentang rasa lelah.",
        ],
      },
      {
        heading: "Kapan mencari bantuan",
        paragraphs: [
          "Jika perasaan cemas atau sedih mengganggu tidur dan aktivitas harian dalam waktu lama, jangan ragu berkonsultasi dengan profesional. Pernikahan seharusnya tentang dua orang, bukan ujian yang harus dihadapi sendirian.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah burnout pre-wedding itu normal?",
        answer:
          "Cukup umum terjadi. Yang penting adalah mengenali tandanya dan mengambil jeda sebelum menjadi lebih berat.",
      },
      {
        question: "Bagaimana membantu pasangan yang burnout?",
        answer:
          "Ambil alih sebagian tanggung jawab dan beri ruang untuk berbicara tanpa perlu langsung menyelesaikan masalah.",
      },
    ],
    relatedSlugs: ["checklist-12-bulan-sebelum-nikah", "budget-pernikahan-indonesia", "wedding-organizer-vs-diy-wedding"],
    keywords: ["burnout pre wedding", "stres persiapan pernikahan", "mental health wedding"],
    tags: ["mental", "stress", "wellbeing"],
    published: true,
  },
  {
    slug: "nikah-adat-vs-nikah-sipil",
    title: "Nikah Adat vs Nikah Sipil di Indonesia: Plus Minus dan Biaya",
    excerpt:
      "Bandingkan pernikahan adat dan akad sipil dari sisi prosesi, biaya, dan kemudahan administrasi, lalu pilih yang paling cocok.",
    categoryId: "tradisi-adat",
    publishedAt: "2026-08-11",
    updatedAt: "2026-08-13",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Sebagian pasangan memilih mengikuti prosesi adat secara penuh, sebagian lain memilih rangkaian sipil yang lebih ringkas, dan banyak juga yang menggabungkan keduanya. Tidak ada pilihan yang salah, selama keputusannya disepakati kedua keluarga dan sesuai dengan kebutuhan hari H. Yang perlu diperjelas sejak awal adalah biaya dan tingkat kompleksitas tiap pilihan.",
    sections: [
      {
        heading: "Nikah adat: kaya prosesi, lebih banyak koordinasi",
        paragraphs: [
          "Prosesi adat memberi nilai kultural yang kuat dan sering dinantikan keluarga besar. Namun, biayanya bertambah untuk sanggar, busana, seserahan, dan perlengkapan simbolis. Koordinasi juga lebih banyak karena melibatkan tokoh adat dan pihak keluarga yang lebih luas.",
        ],
        bullets: [
          "Nilai budaya dan kesakralan yang tinggi.",
          "Biaya tambahan untuk sanggar dan perlengkapan.",
          "Butuh waktu koordinasi yang lebih panjang.",
        ],
      },
      {
        heading: "Nikah sipil: ringkas dan efisien",
        paragraphs: [
          "Akad sipil lebih ringkas secara prosesi dan biasanya lebih mudah dari segi administrasi. Biaya yang dikeluarkan lebih terfokus pada dokumen dan persiapan hari itu sendiri. Pilihan ini cocok untuk pasangan yang ingin acara lebih fokus pada tamu dan keluarga inti.",
        ],
      },
      {
        heading: "Kombinasi keduanya",
        paragraphs: [
          "Banyak pasangan memilih akad sipil sebagai dasar hukum lalu menambahkan prosesi adat terpilih yang paling penting. Cara ini memberi keseimbangan antara budaya dan kepraktisan, asalkan kesepakatan keluarga dibuat sejak awal supaya tidak ada pihak yang merasa dilewati.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah akad sipil dianggap sah?",
        answer:
          "Sah secara hukum selama memenuhi syarat administrasi dan dilakukan oleh pejabat yang berwenang.",
      },
      {
        question: "Bisakah menggabungkan adat dengan akad sipil?",
        answer:
          "Bisa, dan umum dilakukan. Kuncinya adalah kesepakatan keluarga tentang prosesi mana yang turut dijalankan.",
      },
    ],
    relatedSlugs: ["panduan-adat-pernikahan-jawa", "budget-pernikahan-indonesia", "rundown-resepsi-wedding-4-jam"],
    keywords: ["nikah adat vs nikah sipil", "prosesi pernikahan", "biaya pernikahan adat"],
    tags: ["adat", "sipil", "perbandingan"],
    published: true,
  },
  {
    slug: "tips-memilih-venue-wedding",
    title: "Tips Memilih Venue Wedding: 8 Hal yang Harus Dicek Sebelum Bayar DP",
    excerpt:
      "Daftar cek sebelum booking venue: kapasitas, biaya tersembunyi, kebijakan vendor luar, dan apa yang tidak boleh kamu lewatkan.",
    categoryId: "vendor-venue",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-14",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Venue biasanya salah satu pengeluaran terbesar dalam pernikahan, tapi banyak pasangan baru menemukan masalah setelah DP dibayar. Ada yang ternyata punya pembatasan jam sewa, ada juga biaya wajib yang tidak disebut di awal. Berikut hal-hal yang wajib dicek sebelum kamu mengunci keputusan venue.",
    sections: [
      {
        heading: "Kapasitas dan tata ruang",
        paragraphs: [
          "Pastikan kapasitas venue sesuai dengan estimasi tamu, bukan hanya angka maksimal di brosur. Tanyakan juga fleksibilitas tata ruang: apakah bisa mengakomodasi pelaminan, prasmanan, dan area foto tanpa terasa penuh.",
        ],
        bullets: [
          "Cek kapasitas maksimal vs jumlah tamu realistis.",
          "Lihat layout area akad dan resepsi.",
          "Tanyakan parkir dan akses tamu.",
        ],
      },
      {
        heading: "Biaya tersembunyi",
        paragraphs: [
          "Minta rincian penawaran tertulis dan tanyakan biaya di luar paket: biaya kebersihan, listrik, overtime, atau penggunaan vendor pihak ketiga. Biaya kecil ini sering baru muncul di hari H.",
        ],
      },
      {
        heading: "Kebijakan vendor luar",
        paragraphs: [
          "Beberapa venue mewajibkan memakai katering atau dekorasi internal, sementara yang lain membebaskan dengan biaya masuk vendor. Pastikan kamu paham sebelum membandingkan harga dengan venue lain.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kapan waktu terbaik booking venue?",
        answer:
          "Umumnya 9–12 bulan sebelum hari H untuk tanggal populer, terutama di kota besar dan bulan ramai.",
      },
      {
        question: "Apakah bisa negosiasi paket venue?",
        answer:
          "Bisa, terutama di low season atau hari kerja. Tanyakan penyesuaian layanan, bukan hanya potongan harga.",
      },
    ],
    relatedSlugs: ["interview-vendor-katering", "cara-negosiasi-harga-vendor", "budget-pernikahan-indonesia"],
    keywords: ["tips memilih venue wedding", "biaya venue pernikahan", "checklist venue"],
    tags: ["venue", "lokasi", "booking"],
    published: true,
  },
  {
    slug: "palet-warna-wedding-2026",
    title: "Palet Warna Wedding 2026: Kombinasi yang Tenang dan Timeless",
    excerpt:
      "Kombinasi palet warna yang sedang tren untuk wedding Indonesia, cara mencocokkannya dengan dekorasi, dan tips memilih yang sesuai venue.",
    categoryId: "dekorasi-konsep",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-14",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Palet warna menentukan suasana seluruh acara dan konsistensi dokumentasi. Untuk wedding Indonesia, kombinasi yang tenang seperti sage, cream, dan terracotta terbukti menghasilkan foto yang tidak cepat terasa outdated. Berikut cara memilih dan memadukan palet yang tepat untuk venue kamu.",
    sections: [
      {
        heading: "Mulai dari venue, bukan tren",
        paragraphs: [
          "Warna lantai, dinding, dan pencahayaan venue adalah dasar yang sulit diubah. Pilih palet yang melengkapi venue alih-alih melawannya. Untuk venue dengan kayu dan tanaman, sage dan cream biasanya paling aman.",
        ],
        bullets: [
          "Sesuaikan palet dengan material venue.",
          "Pilih satu warna netral sebagai base.",
          "Tambahkan satu warna aksen saja.",
        ],
      },
      {
        heading: "Kombinasi yang sedang banyak dipakai",
        paragraphs: [
          "Beberapa kombinasi yang banyak dipakai pasangan Indonesia tahun ini: sage dengan cream dan dusty pink untuk kesan lembut; terracotta dengan ivory untuk kesan hangat; serta navy dengan putih untuk kesan formal yang tetap tenang.",
        ],
      },
      {
        heading: "Uji sebelum mengunci",
        paragraphs: [
          "Sebelum final, uji palet pada beberapa elemen kecil seperti kartu, bunga, dan kain. Cek juga warna di pencahayaan malam karena hasilnya bisa sangat berbeda dari siang hari.",
        ],
      },
    ],
    faqs: [
      {
        question: "Berapa warna yang ideal untuk satu palet?",
        answer:
          "Sebagian besar pasangan menggunakan 2–3 warna: satu netral, satu utama, dan satu aksen.",
      },
      {
        question: "Apakah tren warna penting?",
        answer:
          "Tidak wajib. Yang lebih penting adalah keselarasan dengan venue dan selera kamu untuk jangka panjang.",
      },
    ],
    relatedSlugs: ["tema-wedding-minimalis-2025", "budget-pernikahan-indonesia", "rundown-resepsi-wedding-4-jam"],
    keywords: ["palet warna wedding", "tema warna pernikahan", "dekorasi wedding"],
    tags: ["warna", "palet", "tema"],
    published: true,
  },
  {
    slug: "komunikasi-pasangan-soal-budget",
    title: "Cara Komunikasi Pasangan Soal Budget Wedding tanpa Berantem",
    excerpt:
      "Cara membahas keuangan pernikahan dengan pasangan secara jujur dan tenang, plus trik menyepakati prioritas bersama.",
    categoryId: "relationship-wellbeing",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-14",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Budget adalah salah satu topik paling sensitif dalam persiapan pernikahan. Kalau dibahas dengan nada menuntut, obrolan kecil bisa berubah jadi konflik. Kuncinya bukan siapa yang benar, tapi bagaimana kamu berdua menyepakati prioritas bersama. Berikut cara membahas keuangan yang membuat hubungan justru makin dekat.",
    sections: [
      {
        heading: "Mulai dari nilai, bukan angka",
        paragraphs: [
          "Sebelum bicara nominal, tanyakan hal yang paling penting bagi masing-masing. Mungkin salah satu dari kamu lebih peduli makanan, yang lain lebih peduli dokumentasi. Menyepakati nilai dulu membuat pembahasan angka terasa lebih mudah.",
        ],
        bullets: [
          "Diskusikan 3 hal terpenting bagi masing-masing.",
          "Jangan membandingkan dengan pernikahan orang lain.",
          "Buat kesepakatan soal angka yang nyaman bagi berdua.",
        ],
      },
      {
        heading: "Pisahkan perasaan dari keputusan",
        paragraphs: [
          "Saat topik terasa panas, pisahkan dulu perasaan dari keputusan. Ambil jeda, lalu kembali dengan data: berapa biaya sebenarnya, dan apakah bisa dikurangi tanpa mengorbankan prioritas bersama.",
        ],
      },
      {
        heading: "Jadwalkan pembahasan, bukan dadakan",
        paragraphs: [
          "Jadikan budget sebagai agenda rutin mingguan, bukan topik yang muncul mendadak saat sedang lelah. Dengan jadwal yang jelas, diskusi terasa lebih terstruktur dan tidak mudah memanas.",
        ],
      },
    ],
    faqs: [
      {
        question: "Bagaimana jika pasangan sulit terbuka soal keuangan?",
        answer:
          "Mulai dari hal kecil dan ajak diskusi tanpa menghakimi. Konsistensi lebih penting daripada pembahasan panjang sekali waktu.",
      },
      {
        question: "Apakah penting membuat dokumen budget bersama?",
        answer:
          "Sangat membantu. Data yang sama membuat keputusan lebih objektif dan mengurangi perdebatan.",
      },
    ],
    relatedSlugs: ["burnout-pre-wedding", "budget-pernikahan-indonesia", "checklist-12-bulan-sebelum-nikah"],
    keywords: ["komunikasi pasangan", "budget wedding diskusi", "hubungan sehat saat persiapan nikah"],
    tags: ["komunikasi", "hubungan", "budget"],
    published: true,
  },
  {
    slug: "games-tamu-wedding",
    title: "Games untuk Tamu Wedding: 7 Ide Seru yang Tidak Cringe",
    excerpt:
      "Ide games ringan untuk resepsi yang menghidupkan suasana tanpa membuat tamu malu, lengkap dengan hadiah yang hemat.",
    categoryId: "acara-tamu",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-14",
    readingTime: "5 menit baca",
    author: offStoriesAuthor,
    intro:
      "Games adalah cara efektif mencairkan suasana di tengah resepsi, tapi banyak pasangan khawatir acara terasa dipaksakan. Kuncinya memilih games yang singkat, sukarela, dan tidak memaksa tamu menjadi pusat perhatian. Berikut tujuh ide yang biasanya berhasil di resepsi wedding Indonesia.",
    sections: [
      {
        heading: "Games yang melibatkan banyak orang",
        paragraphs: [
          "Mulai dengan games yang bisa diikuti banyak tamu dari tempat duduk, seperti tebak lagu, kuis fakta pasangan, atau undian nomor meja. Format ini menyenangkan tanpa memanggil satu per satu ke depan.",
        ],
      },
      {
        heading: "Games sukarela di atas panggung",
        paragraphs: [
          "Kalau ingin games yang lebih interaktif, pilih yang sifatnya sukarela dan singkat, seperti kuis siapa yang lebih mengenal pasangan atau kompetisi kecil antar meja. MC berperan besar menjaga suasana tetap ringan.",
        ],
      },
      {
        heading: "Hadiah yang hemat tapi bermakna",
        paragraphs: [
          "Hadiah tidak harus mahal. Souvenir ekstra, gantungan kunci, atau voucer kecil sudah cukup. Yang penting hadiah dibagikan dengan cepat supaya rundown tidak molor.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kapan waktu terbaik untuk games?",
        answer:
          "Saat tamu sudah mulai makan atau di sela-sela hiburan utama, ketika suasana sudah cukup hangat.",
      },
      {
        question: "Berapa lama games idealnya?",
        answer:
          "10–15 menit per sesi sudah cukup untuk menjaga energi tanpa mengganggu flow acara.",
      },
    ],
    relatedSlugs: ["rundown-resepsi-wedding-4-jam", "rsvp-seating-check-in-pernikahan", "budget-pernikahan-indonesia"],
    keywords: ["games wedding", "hiburan resepsi", "games untuk tamu"],
    tags: ["games", "hiburan", "resepsi"],
    published: true,
  },
  {
    slug: "template-budget-pernikahan-excel",
    title: "Template Budget Pernikahan Excel: Contoh Alokasi + Cara Menyusun",
    excerpt:
      "Template budget pernikahan siap pakai: contoh alokasi venue, catering, dekor, dan dana cadangan, plus cara menyusun anggaran nikah di Excel agar tidak over budget.",
    categoryId: "planning-budget",
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    readingTime: "7 menit baca",
    author: offStoriesAuthor,
    intro:
      "Template budget pernikahan adalah alat paling sederhana untuk mencegah anggaran jebol: satu tabel berisi semua komponen biaya, estimasi, realisasi, dan status pembayaran. Kabar baiknya, kamu tidak perlu template rumit — spreadsheet dengan 6–7 kolom yang diisi disiplin sudah jauh lebih baik daripada mengandalkan ingatan dan chat vendor. Artikel ini memberi contoh alokasi yang realistis untuk pasar Indonesia plus cara menyusunnya langkah demi langkah.",
    sections: [
      {
        heading: "Isi template budget pernikahan yang ideal",
        paragraphs: [
          "Template anggaran nikah yang bagus selalu punya kolom yang sama untuk setiap baris biaya: nama komponen, estimasi awal, biaya aktual, DP terbayar, sisa pelunasan, tenggat bayar, dan PIC. Dengan struktur ini, kamu bisa langsung melihat selisih estimasi versus realisasi setiap kali ada kontrak baru ditandatangani.",
          "Pisahkan juga dana cadangan 10–15% sebagai baris tersendiri di paling bawah, bukan sisa yang tidak tertulis. Kalau cadangan tidak dicatat sebagai pos resmi, ia akan habis tanpa terasa untuk hal-hal kecil.",
        ],
        bullets: [
          "Kolom wajib: komponen, estimasi, aktual, DP, sisa, tenggat, PIC, status.",
          "Satu baris dana cadangan 10–15% yang tidak boleh dipakai tanpa diskusi.",
          "Satu file yang sama untuk pasangan, keluarga, dan WO agar tidak ada dua versi angka.",
        ],
        callout: {
          title: "Tips penting",
          body: "Update template setiap ada pembayaran atau kontrak baru, idealnya seminggu sekali. Template yang tidak diupdate sama saja dengan tidak punya template.",
        },
      },
      {
        heading: "Contoh alokasi template budget untuk 200 tamu",
        paragraphs: [
          "Contoh di bawah memakai total Rp 200 juta untuk resepsi 200 tamu di kota besar. Sesuaikan persentasenya dengan prioritas kamu — yang penting total dan cadangannya selalu terlihat.",
        ],
        table: {
          headers: ["Komponen", "Alokasi", "Catatan"],
          rows: [
            ["Venue + catering", "Rp 90 juta (45%)", "Porsi terbesar, kunci dulu"],
            ["Dekorasi + dokumentasi", "Rp 40 juta (20%)", "Prioritas visual"],
            ["Busana, MUA, hiburan", "Rp 30 juta (15%)", "Sesuaikan gaya acara"],
            ["Seserahan, undangan, souvenir", "Rp 20 juta (10%)", "Bisa dikompres"],
            ["Dana cadangan", "Rp 20 juta (10%)", "Wajib, jangan diganggu"],
          ],
        },
      },
      {
        heading: "Cara menyusun template agar tidak over budget",
        paragraphs: [
          "Urutannya menentukan hasil. Mulai dari total maksimal yang nyaman, bukan dari daftar keinginan vendor. Setelah total dikunci, baru alokasikan per komponen dan bandingkan dengan harga pasar di kotamu sebelum menghubungi vendor mana pun.",
        ],
        ordered: [
          "Tetapkan total budget maksimal bersama pasangan dan keluarga.",
          "Sisihkan dana cadangan 10–15% sebelum membagi ke komponen lain.",
          "Isi estimasi tiap komponen berdasarkan riset 3–5 vendor sejenis.",
          "Catat setiap DP dan tenggat pelunasan begitu kontrak ditandatangani.",
          "Review selisih estimasi vs aktual tiap minggu dan sesuaikan prioritas.",
        ],
        quote:
          "Budget yang ditulis rapi membuat keputusan vendor 10 menit, bukan 10 hari penuh drama.",
      },
    ],
    faqs: [
      {
        question: "Di mana bisa download template budget pernikahan Excel?",
        answer:
          "Kamu bisa membuatnya sendiri dalam 10 menit dengan kolom komponen, estimasi, aktual, DP, sisa, tenggat, dan status. Alternatifnya, gunakan budget tracker digital agar angkanya sinkron dengan checklist dan vendor.",
      },
      {
        question: "Berapa persen dana cadangan yang ideal?",
        answer:
          "Sekitar 10–15% dari total budget. Cadangan menutup revisi desain, tambahan pax catering, overtime venue, dan biaya kecil yang muncul di minggu terakhir.",
      },
      {
        question: "Apakah template untuk 100 tamu dan 300 tamu berbeda?",
        answer:
          "Strukturnya sama, tetapi porsi catering dan venue berubah paling besar. Untuk tamu di atas 250, naikkan porsi catering dan siapkan buffer tambahan untuk logistik.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "nikah-jakarta-budget-50-juta", "checklist-12-bulan-sebelum-nikah"],
    keywords: ["template budget pernikahan", "template anggaran nikah excel", "contoh budget wedding", "cara menyusun budget nikah"],
    tags: ["budget", "template", "excel"],
    published: true,
  },
  {
    slug: "template-undangan-pernikahan-digital",
    title: "Template Undangan Pernikahan Digital: Cara Membuat + Contoh Kata",
    excerpt:
      "Template undangan pernikahan digital siap edit: cara membuat undangan online, contoh kata-kata untuk akad dan resepsi, plus checklist sebelum disebar ke tamu.",
    categoryId: "acara-tamu",
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-02",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Template undangan pernikahan digital memangkas biaya cetak dan mempercepat penyebaran, apalagi kalau daftar tamu kamu tersebar di banyak kota. Satu link undangan online bisa memuat jadwal akad dan resepsi, peta lokasi, galeri, amplop digital, sampai tombol RSVP. Tantangannya tinggal satu: kata-katanya harus sopan dan informasinya tidak boleh kurang.",
    sections: [
      {
        heading: "Kenapa undangan digital makin populer",
        paragraphs: [
          "Selain hemat, undangan digital bisa diupdate kalau ada perubahan jadwal atau lokasi — sesuatu yang mustahil dilakukan undangan cetak. Tamu juga lebih mudah menyimpan link dan meneruskannya ke keluarga. Untuk keluarga besar yang terbiasa undangan fisik, solusinya bukan menolak digital, melainkan mencetak sebagian kecil khusus untuk orang tua dan sesepuh.",
        ],
        bullets: [
          "Hemat biaya cetak dan ongkos kirim, terutama untuk tamu luar kota.",
          "Bisa direvisi kapan saja tanpa cetak ulang.",
          "Terhubung langsung ke RSVP, peta, dan amplop digital.",
          "Cetak 20–50 pcs fisik khusus keluarga inti dan sesepuh.",
        ],
      },
      {
        heading: "Contoh kata-kata undangan pernikahan digital",
        paragraphs: [
          "Struktur yang sopan selalu sama: pembuka, nama kedua mempelai beserta orang tua, jadwal akad dan resepsi yang jelas, lokasi lengkap, dan penutup. Bedakan dengan tegas antara tamu akad dan tamu resepsi supaya tidak ada yang salah datang.",
          "Contoh ringkas untuk resepsi: awali dengan salam, tulis nama lengkap kedua mempelai dan orang tua masing-masing, lalu cantumkan hari, tanggal, jam, dan alamat venue dalam satu blok yang mudah dibaca. Akhiri dengan ucapan terima kasih dan nama keluarga yang mengundang.",
        ],
        bullets: [
          "Cantumkan nama orang tua kedua mempelai untuk kesopanan.",
          "Pisahkan info akad dan resepsi jika tamunya berbeda.",
          "Tulis alamat lengkap plus titik peta, bukan cuma nama gedung.",
          "Letakkan nomor rekening di halaman dalam, bukan halaman depan.",
        ],
        callout: {
          title: "Common mistake",
          body: "Menyebar link undangan tanpa testing: tombol RSVP error, peta salah titik, atau tanggal akad dan resepsi tertukar.",
        },
      },
      {
        heading: "Checklist sebelum undangan disebar",
        paragraphs: [
          "Lakukan pemeriksaan akhir bersama pasangan sebelum link dikirim ke grup keluarga. Sekali tersebar, koreksi kecil pun akan membingungkan tamu yang sudah menyimpan versi lama.",
        ],
        ordered: [
          "Cek ejaan nama, gelar, dan nama orang tua kedua pihak.",
          "Klik semua tombol: RSVP, peta, galeri, dan amplop digital.",
          "Pastikan jam, tanggal, dan alamat sama dengan rundown final.",
          "Kirim dulu ke keluarga inti untuk koreksi sebelum sebar massal.",
          "Jadwalkan pengiriman H-30 dan pengingat H-7.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah undangan digital sopan untuk keluarga besar?",
        answer:
          "Sopan, selama bahasanya formal dan mencantumkan nama orang tua. Untuk sesepuh yang tidak terbiasa dengan link, kirimkan juga undangan cetak atau sampaikan langsung.",
      },
      {
        question: "Kapan undangan digital sebaiknya disebar?",
        answer:
          "Sekitar H-30 untuk undangan utama dan H-7 untuk pengingat. Jangan terlalu awal karena tamu bisa lupa, jangan terlalu mepet karena tamu luar kota butuh persiapan.",
      },
      {
        question: "Bagaimana menghubungkan undangan digital dengan RSVP?",
        answer:
          "Tempelkan tombol RSVP di halaman utama undangan yang mengarah ke satu formulir. Dengan begitu jawaban tamu langsung masuk ke daftar utama dan bisa dipakai untuk seating.",
      },
    ],
    relatedSlugs: ["rsvp-seating-check-in-pernikahan", "rundown-resepsi-wedding-4-jam", "checklist-12-bulan-sebelum-nikah"],
    keywords: ["template undangan pernikahan", "undangan digital wedding", "contoh kata undangan nikah", "cara buat undangan online"],
    tags: ["undangan", "digital", "template"],
    published: true,
  },
  {
    slug: "syarat-nikah-kua-2026",
    title: "Syarat Nikah di KUA 2026: Dokumen, Biaya & Alur Lengkap",
    excerpt:
      "Syarat nikah di KUA 2026 lengkap: dokumen yang dibawa, biaya resmi akad di dalam dan luar KUA, alur pendaftaran, plus tips agar tidak bolak-balik.",
    categoryId: "tradisi-adat",
    publishedAt: "2026-09-03",
    updatedAt: "2026-09-03",
    readingTime: "7 menit baca",
    author: offStoriesAuthor,
    intro:
      "Syarat nikah di KUA sebenarnya tidak rumit, tetapi banyak pasangan bolak-balik karena satu dokumen kurang atau salah memahami alur. Kuncinya adalah mengurus surat pengantar dari RT, RW, dan kelurahan jauh sebelum tanggal akad, karena pendaftaran ke KUA paling lambat dilakukan 10 hari kerja sebelum hari H. Berikut daftar dokumen, biaya resmi 2026, dan alurnya dari awal sampai buku nikah terbit.",
    sections: [
      {
        heading: "Dokumen syarat nikah di KUA",
        paragraphs: [
          "Siapkan dokumen kedua calon dalam map terpisah agar tidak tertukar. Semua fotokopi sebaiknya dibuat rangkap karena tiap tingkatan administrasi meminta arsipnya sendiri.",
        ],
        ordered: [
          "KTP dan Kartu Keluarga kedua calon beserta fotokopinya.",
          "Akta kelahiran atau surat kenal lahir.",
          "Pas foto 2x3 dan 4x6 dengan background sesuai ketentuan KUA setempat.",
          "Surat pengantar RT dan RW untuk keperluan numpang nikah atau nikah setempat.",
          "Formulir N1 sampai N4 dari kelurahan: keterangan untuk nikah, asal-usul, persetujuan orang tua, dan keterangan kematian jika relevan.",
          "Surat rekomendasi nikah dari KUA asal jika akad di luar kecamatan domisili.",
          "Surat dispensasi pengadilan jika salah satu calon belum cukup umur.",
        ],
        callout: {
          title: "Tips penting",
          body: "Fotokopi KTP dan KK dari kedua keluarga besar sekalian — wali dan saksi juga diminta identitasnya saat akad.",
        },
      },
      {
        heading: "Biaya nikah di KUA 2026",
        paragraphs: [
          "Biaya resmi akad nikah diatur negara dan sama di seluruh Indonesia. Yang membedakan hanyalah lokasi dan waktunya.",
        ],
        table: {
          headers: ["Lokasi akad", "Biaya resmi", "Catatan"],
          rows: [
            ["Di dalam KUA, jam kerja", "Rp 0 (gratis)", "Hari Senin sampai Jumat"],
            ["Di luar KUA atau di luar jam kerja", "Rp 600.000", "Disetor ke kas negara via bank"],
            ["Gedung atau rumah", "Rp 600.000 + biaya penghulu transport", "Sesuai kesepakatan wajar"],
          ],
        },
      },
      {
        heading: "Alur pendaftaran sampai buku nikah terbit",
        paragraphs: [
          "Urutannya selalu sama: kelurahan dulu, baru KUA. Jangan datang langsung ke KUA tanpa surat pengantar karena pasti diminta kembali.",
        ],
        ordered: [
          "Minta surat pengantar RT dan RW di domisili masing-masing.",
          "Urus formulir N1 sampai N4 di kelurahan.",
          "Daftarkan berkas ke KUA kecamatan tempat akad, minimal H-10 hari kerja.",
          "Ikuti pemeriksaan berkas dan bimbingan pranikah (suscatin) jika diwajibkan.",
          "Laksanakan akad sesuai jadwal, lalu terima buku nikah setelah pencatatan.",
        ],
        quote:
          "Yang bikin ribet bukan aturannya, tapi dokumen yang disiapkan mepet. Urus dari H-2 bulan dan semuanya terasa enteng.",
      },
    ],
    faqs: [
      {
        question: "Berapa lama proses daftar nikah di KUA?",
        answer:
          "Pendaftaran berkasnya sendiri biasanya selesai dalam 1–2 kunjungan kalau dokumen lengkap. Aturannya, berkas harus masuk minimal 10 hari kerja sebelum akad, jadi amannya mulai mengurus 1–2 bulan sebelumnya.",
      },
      {
        question: "Apakah bisa akad di luar KUA, misalnya di gedung atau rumah?",
        answer:
          "Bisa. Akad di luar KUA atau di luar jam kerja dikenai biaya resmi Rp 600.000 yang disetor ke kas negara. Pastikan jadwal penghulu sudah dikonfirmasi jauh hari.",
      },
      {
        question: "Bagaimana kalau KTP beda domisili dengan lokasi akad?",
        answer:
          "Minta surat rekomendasi nikah dari KUA kecamatan asal, lalu daftarkan ke KUA tempat akad dilangsungkan. Prosesnya sama, hanya ada satu langkah tambahan.",
      },
    ],
    relatedSlugs: ["nikah-adat-vs-nikah-sipil", "panduan-adat-pernikahan-jawa", "checklist-12-bulan-sebelum-nikah"],
    keywords: ["syarat nikah di KUA", "biaya nikah KUA 2026", "cara daftar nikah KUA", "dokumen akad nikah"],
    tags: ["KUA", "akad", "administrasi"],
    published: true,
  },
  {
    slug: "souvenir-pernikahan-murah-berkesan",
    title: "15 Ide Souvenir Pernikahan Murah tapi Berkesan (Update 2026)",
    excerpt:
      "15 ide souvenir pernikahan murah mulai Rp 3 ribuan: tumbler, lilin aromaterapi, madu, sampai bibit tanaman — plus cara menghitung jumlah dan budgetnya.",
    categoryId: "acara-tamu",
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-05",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Souvenir pernikahan murah bukan berarti murahan — yang menentukan kesan adalah kegunaan dan kemasannya, bukan harganya. Di 2026, souvenir fungsional seperti tumbler kecil, lilin aromaterapi, dan madu kemasan sachet jauh lebih diingat tamu daripada pajangan yang berakhir di laci. Berikut 15 ide yang ramah budget beserta cara menghitung jumlahnya agar tidak kurang dan tidak mubazir.",
    sections: [
      {
        heading: "Souvenir murah yang benar-benar dipakai tamu",
        paragraphs: [
          "Prinsipnya sederhana: kalau barangnya dipakai seminggu setelah acara, souvenir kamu berhasil. Pilih yang netral agar cocok untuk semua umur dan tidak bentrok dengan selera.",
        ],
        bullets: [
          "Tumbler kecil atau botol minum (Rp 8–15 ribu): paling aman dan awet.",
          "Lilin aromaterapi mini (Rp 10–20 ribu): kesan premium dengan harga menengah.",
          "Madu atau sambal kemasan kecil (Rp 5–12 ribu): unik dan pasti habis dipakai.",
          "Bibit tanaman atau sukulen mini (Rp 5–10 ribu): berkesan untuk tema outdoor.",
          "Tote bag kanvas sablon nama (Rp 7–12 ribu): berguna dan jadi media kenangan.",
          "Sendok-garpu set atau sumpit (Rp 4–8 ribu): klasik tapi tetap dipakai.",
          "Sabun handmade atau hand sanitizer spray (Rp 3–7 ribu): termurah yang tetap elegan.",
        ],
      },
      {
        heading: "Cara menghitung jumlah dan budget souvenir",
        paragraphs: [
          "Rumus amannya: jumlah undangan yang hadir dikali 1,1, ditambah cadangan untuk keluarga inti dan tamu tak terduga. Jangan samakan jumlah souvenir dengan jumlah undangan kertas, karena satu undangan sering mewakili 2–3 tamu.",
        ],
        ordered: [
          "Ambil estimasi hadir dari data RSVP, bukan dari jumlah undangan.",
          "Kalikan 1,1 untuk cadangan, lalu bulatkan ke atas ke kelipatan order vendor.",
          "Minta harga grosir per 100 pcs dan bandingkan minimal 3 vendor.",
          "Sisihkan 10% budget souvenir untuk kemasan dan kartu ucapan.",
          "Pesan H-2 bulan agar ada waktu revisi sablon atau kemasan.",
        ],
      },
      {
        heading: "Kesalahan yang bikin souvenir mubazir",
        paragraphs: [
          "Souvenir yang terlalu personal seperti foto wajah pengantin ukuran besar cenderung tidak dipakai. Begitu juga barang musiman yang kedaluwarsa atau pudar sebelum hari H. Selalu minta sampel fisik sebelum order massal, karena warna sablon di layar dan di barang asli sering berbeda jauh.",
        ],
        quote: "Souvenir terbaik adalah yang tamu pakai tanpa ingat harganya.",
      },
    ],
    faqs: [
      {
        question: "Berapa budget souvenir per pcs yang wajar?",
        answer:
          "Untuk 200–300 tamu, kisaran Rp 5–15 ribu per pcs sudah menghasilkan souvenir yang bagus. Totalnya sekitar 3–5% dari keseluruhan budget pernikahan.",
      },
      {
        question: "Kapan souvenir harus dipesan?",
        answer:
          "Idealnya H-2 bulan, terutama yang custom sablon atau kemasan khusus. Produksi massal butuh 2–4 minggu plus waktu revisi.",
      },
      {
        question: "Apakah souvenir untuk anak-anak perlu dibedakan?",
        answer:
          "Tidak wajib, tetapi snack box kecil atau mainan edukatif murah membuat keluarga dengan anak merasa diperhatikan.",
      },
    ],
    relatedSlugs: ["budget-pernikahan-indonesia", "rundown-resepsi-wedding-4-jam", "nikah-jakarta-budget-50-juta"],
    keywords: ["souvenir pernikahan murah", "ide souvenir nikah unik", "souvenir wedding hemat"],
    tags: ["souvenir", "tamu", "hemat"],
    published: true,
  },
  {
    slug: "biaya-prewedding-2026",
    title: "Biaya Prewedding 2026: Paket Foto, Lokasi & Tips Hemat",
    excerpt:
      "Rincian biaya prewedding 2026: kisaran paket foto studio vs outdoor, sewa busana dan MUA, plus tips hemat tanpa mengorbankan hasil.",
    categoryId: "fashion-prewedding",
    publishedAt: "2026-09-06",
    updatedAt: "2026-09-06",
    readingTime: "6 menit baca",
    author: offStoriesAuthor,
    intro:
      "Biaya prewedding 2026 sangat bervariasi tergantung konsep: sesi studio bisa mulai Rp 3 jutaan, sementara outdoor dengan beberapa lokasi dan ganti busana bisa menembus Rp 25 juta. Karena prewedding bukan kebutuhan wajib, kuncinya adalah memutuskan dulu fungsinya — untuk undangan, dekorasi, atau sekadar kenangan — baru menyesuaikan paketnya.",
    sections: [
      {
        heading: "Kisaran biaya prewedding 2026",
        paragraphs: [
          "Harga di bawah adalah kisaran umum di kota besar untuk paket yang sudah termasuk fotografer, busana, dan MUA dasar. Selalu minta rincian tertulis karena istilah paket hemat bisa sangat berbeda antar vendor.",
        ],
        table: {
          headers: ["Paket", "Kisaran", "Cocok untuk"],
          rows: [
            ["Studio 1 konsep", "Rp 3–8 juta", "Undangan dan dekorasi simpel"],
            ["Outdoor 1 lokasi", "Rp 8–15 juta", "Galeri dan media sosial"],
            ["Outdoor multi-lokasi + sinematik", "Rp 15–25 juta", "Dokumentasi premium"],
          ],
        },
      },
      {
        heading: "Komponen yang sering luput dihitung",
        paragraphs: [
          "Banyak pasangan kaget karena total membengkak bukan dari paket fotonya, melainkan dari biaya pendukung yang tidak masuk penawaran awal.",
        ],
        bullets: [
          "Tiket masuk dan izin foto lokasi wisata atau gedung.",
          "Transport, konsumsi tim, dan penginapan jika lokasi jauh.",
          "Sewa busana tambahan di luar paket dan retouch makeup.",
          "Biaya overtime jika sesi molor dari jadwal.",
          "Cetak foto dan album yang biasanya dijual terpisah.",
        ],
      },
      {
        heading: "Tips hemat prewedding tanpa hasil murahan",
        paragraphs: [
          "Hemat bukan berarti murahan — artinya memotong pos yang tidak terlihat di hasil akhir. Satu lokasi yang dieksplorasi maksimal hampir selalu mengalahkan tiga lokasi yang terburu-buru.",
        ],
        ordered: [
          "Pilih satu lokasi dengan banyak sudut, bukan banyak lokasi.",
          "Pakai busana sendiri untuk satu konsep agar hemat sewa.",
          "Jadwalkan sesi pagi hari untuk cahaya terbaik dan waktu efisien.",
          "Batasi cetak album, perbanyak file digital untuk undangan.",
          "Booking di weekday atau low season untuk harga lebih lentur.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kapan waktu terbaik foto prewedding?",
        answer:
          "Idealnya 3–4 bulan sebelum hari H agar hasilnya bisa dipakai untuk undangan dan dekorasi tanpa terburu-buru.",
      },
      {
        question: "Apakah prewedding outdoor butuh izin lokasi?",
        answer:
          "Sering ya, terutama taman kota, pantai wisata, dan gedung bersejarah. Tanyakan biaya izinnya di awal karena bisa jutaan rupiah.",
      },
    ],
    relatedSlugs: ["tips-pose-natural-prewedding", "cara-negosiasi-harga-vendor", "budget-pernikahan-indonesia"],
    keywords: ["biaya prewedding", "paket prewedding murah", "harga foto prewedding", "tips hemat prewedding"],
    tags: ["prewedding", "fotografi", "budget"],
    published: true,
  },
  {
    slug: "menu-catering-prasmanan-pernikahan",
    title: "Menu Catering Prasmanan Pernikahan: Contoh Susunan + Harga per Pax",
    excerpt:
      "Contoh susunan menu catering prasmanan pernikahan untuk 200 tamu, kisaran harga per pax 2026, dan cara memilih menu yang disukai semua umur.",
    categoryId: "vendor-venue",
    publishedAt: "2026-09-08",
    updatedAt: "2026-09-08",
    readingTime: "7 menit baca",
    author: offStoriesAuthor,
    intro:
      "Menu catering prasmanan pernikahan menentukan kesan tamu lebih dari dekorasi mana pun — orang lupa bunga, tapi ingat rasa. Susunan yang aman selalu punya pola yang sama: karbohidrat, dua lauk, sayur, sup atau soto, dessert, buah, dan minuman, plus 1–2 stall untuk variasi. Berikut contoh susunan per tier harga dan cara menyesuaikannya dengan jumlah tamu.",
    sections: [
      {
        heading: "Anatomi menu prasmanan yang lengkap",
        paragraphs: [
          "Prasmanan yang terasa mewah bukan yang menunya paling banyak, melainkan yang alurnya lengkap dari pembuka sampai penutup. Pastikan ada pilihan yang aman untuk anak-anak dan tamu sepuh, karena merekalah yang paling rewel soal rasa.",
        ],
        bullets: [
          "Karbohidrat: nasi putih plus satu pendamping seperti mie atau nasi goreng.",
          "Lauk utama: satu ayam dan satu daging atau ikan agar ada pilihan.",
          "Sayur dan sup: capcay plus soto atau sop sebagai penyegar.",
          "Penutup: dessert manis, buah potong, dan minuman dingin.",
          "Stall tambahan: siomay, bakso, atau sate untuk antrean yang hidup.",
        ],
      },
      {
        heading: "Contoh susunan menu dan harga per pax 2026",
        paragraphs: [
          "Kisaran harga per pax 2026 di kota besar untuk prasmanan lengkap umumnya seperti di bawah ini. Harga sudah termasuk peralatan dan pramusaji pada paket standar.",
        ],
        table: {
          headers: ["Tier", "Harga per pax", "Isi paket"],
          rows: [
            ["Hemat", "Rp 75–100 ribu", "Prasmanan dasar + 1 stall + minuman"],
            ["Standar", "Rp 120–175 ribu", "Prasmanan lengkap + 2 stall + dessert premium"],
            ["Premium", "Rp 200 ribu ke atas", "Bahan premium + live cooking + banyak stall"],
          ],
        },
      },
      {
        heading: "Cara memilih menu yang aman untuk semua tamu",
        paragraphs: [
          "Selalu lakukan food tasting sebelum tanda tangan, dan bawa 2–3 anggota keluarga dengan selera berbeda. Menu yang lolos di lidah banyak orang mengalahkan menu yang terlihat mewah di brosur.",
        ],
        ordered: [
          "Pilih satu menu familiar dan satu menu favorit sebagai jangkar rasa.",
          "Minta label untuk menu pedas, seafood, dan kacang-kacangan.",
          "Siapkan porsi anak atau menu lembut untuk tamu sepuh.",
          "Hitung pax dari RSVP hadir plus 5–10% cadangan, bukan dari undangan.",
          "Konfirmasi jam refill dan durasi stand by pramusaji di kontrak.",
        ],
        callout: {
          title: "Tips penting",
          body: "Jangan tambah stall berlebihan demi gengsi — tiap stall menambah antrean, biaya, dan kebutuhan pramusaji.",
        },
      },
    ],
    faqs: [
      {
        question: "Berapa pax catering untuk 200 undangan?",
        answer:
          "Umumnya yang hadir 70–80% dari undangan. Untuk 200 undangan, pesan sekitar 150–170 pax lalu sesuaikan setelah RSVP terkumpul dan mendekati hari H.",
      },
      {
        question: "Apakah food stall dihitung terpisah dari prasmanan?",
        answer:
          "Tergantung paket. Sebagian vendor menggabungkan 1–2 stall ke paket standar, selebihnya dihitung per stall. Tanyakan selalu sebelum menandatangani penawaran.",
      },
      {
        question: "Kapan food tasting dilakukan?",
        answer:
          "Setelah shortlist 2–3 vendor dan sebelum membayar DP. Tasting adalah momen terbaik untuk negosiasi penyesuaian menu.",
      },
    ],
    relatedSlugs: ["interview-vendor-katering", "cara-negosiasi-harga-vendor", "budget-pernikahan-indonesia"],
    keywords: ["menu prasmanan pernikahan", "contoh menu catering wedding", "harga catering per pax", "tips pilih menu prasmanan"],
    tags: ["catering", "menu", "prasmanan"],
    published: true,
  },
];

export const blogCategories: BlogCategory[] = [
  {
    slug: "planning-budget",
    title: "Planning & Budget",
    description: "Persiapan pernikahan, budgeting, timeline, checklist, dan keputusan perencanaan.",
    intro:
      "Semua hal soal perencanaan: budgeting, timeline, checklist, dan keputusan yang membangun fondasi pernikahan.",
    emoji: "💰",
  },
  {
    slug: "vendor-venue",
    title: "Vendor & Venue",
    description: "Memilih, membandingkan, mewawancarai, dan bernegosiasi dengan vendor dan venue.",
    intro:
      "Dari katering sampai venue: cara memilih, mewawancarai, dan bernegosiasi dengan vendor yang tepat.",
    emoji: "🤝",
  },
  {
    slug: "tradisi-adat",
    title: "Tradisi & Adat",
    description: "Tradisi pernikahan Indonesia: adat Jawa, Sunda, Batak, Minang, dan Bali.",
    intro:
      "Prosesi, seserahan, dan adat dari berbagai daerah di Indonesia yang menyatukan dua keluarga.",
    emoji: "🏛️",
  },
  {
    slug: "dekorasi-konsep",
    title: "Dekorasi & Konsep",
    description: "Tema wedding, dekorasi, styling, palet warna, dan konsep visual.",
    intro:
      "Inspirasi tema, palet warna, dan dekorasi yang membentuk suasana dan kenangan visual acara.",
    emoji: "🎨",
  },
  {
    slug: "fashion-prewedding",
    title: "Fashion & Pre-Wedding",
    description: "Busana pengantin, perawatan diri, prewedding, fotografi, dan videografi.",
    intro:
      "Gaun, skincare, sesi prewedding, dan dokumentasi supaya kamu tampil percaya diri sampai hari H.",
    emoji: "👗",
  },
  {
    slug: "acara-tamu",
    title: "Acara & Tamu",
    description: "Rundown resepsi, manajemen tamu, RSVP, seating, catering, dan games.",
    intro:
      "Flow hari H: rundown, tamu, RSVP, seating, katering, dan hiburan yang membuat acara terasa lancar.",
    emoji: "🎉",
  },
  {
    slug: "relationship-wellbeing",
    title: "Relationship & Wellbeing",
    description: "Persiapan hubungan, komunikasi, manajemen stres, dan persiapan emosional.",
    intro:
      "Menjaga hubungan dan kesehatan mental tetap sehat selama persiapan, agar pernikahan tidak menguras berdua.",
    emoji: "🧘",
  },
];

export function getBlogCategory(slug: string) {
  return blogCategories.find((category) => category.slug === slug);
}

export function getCategoryForPost(post: BlogPost) {
  return getBlogCategory(post.categoryId);
}

export function getCategoryLabel(post: BlogPost) {
  return getCategoryForPost(post)?.title ?? post.categoryId;
}

export function getPublishedPosts() {
  return blogPosts.filter((post) => post.published);
}

export function getBlogPostsByCategory(slug: string) {
  return getPublishedPosts().filter((post) => post.categoryId === slug);
}

export function getCategoryCount(slug: string) {
  return getBlogPostsByCategory(slug).length;
}

export function getFeaturedBlogPosts() {
  return [
    getBlogPost("checklist-12-bulan-sebelum-nikah"),
    getBlogPost("nikah-jakarta-budget-50-juta"),
    getBlogPost("panduan-adat-pernikahan-jawa"),
  ].filter((post): post is BlogPost => Boolean(post));
}

export function getLatestBlogPosts(count = 6) {
  return getPublishedPosts()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, count);
}

export function blogCategoryUrl(slug: string) {
  return `${siteUrl}/blog/categories/${slug}`;
}

export function getBlogPost(slug: string) {
  return getPublishedPosts().find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3) {
  const related = post.relatedSlugs
    .map((slug) => getBlogPost(slug))
    .filter((item): item is BlogPost => Boolean(item));
  if (related.length >= limit) return related.slice(0, limit);
  const sameCategory = getBlogPostsByCategory(post.categoryId)
    .filter((item) => item.slug !== post.slug && !related.some((r) => r.slug === item.slug))
    .slice(0, limit - related.length);
  return [...related, ...sameCategory];
}

export function getAdjacentPosts(post: BlogPost) {
  const siblings = getBlogPostsByCategory(post.categoryId);
  const index = siblings.findIndex((item) => item.slug === post.slug);
  return {
    previous: index > 0 ? siblings[index - 1] : undefined,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined,
  };
}

export function getPostHeadings(post: BlogPost) {
  return post.sections.map((section) => ({
    id: slugifyHeading(section.heading),
    heading: section.heading,
    subsections: (section.subsections ?? []).map((sub) => ({
      id: slugifyHeading(sub.heading),
      heading: sub.heading,
    })),
  }));
}

export function blogPostUrl(slug: string) {
  return `${siteUrl}/blog/${slug}`;
}

const categoryCover: Record<string, { from: string; to: string }> = {
  "planning-budget": { from: "#e8f0e8", to: "#f6faf6" },
  "vendor-venue": { from: "#fff0e2", to: "#fff8f0" },
  "tradisi-adat": { from: "#f8e8e8", to: "#fbecec" },
  "dekorasi-konsep": { from: "#fbe9e4", to: "#fdf4f0" },
  "fashion-prewedding": { from: "#f9e8f2", to: "#fdf2f8" },
  "acara-tamu": { from: "#fdf2dd", to: "#fff9ee" },
  "relationship-wellbeing": { from: "#e8eef7", to: "#f4f7fc" },
};

export function postCover(post: BlogPost) {
  const { from, to } = categoryCover[post.categoryId] ?? categoryCover["planning-budget"];
  const label = getCategoryLabel(post);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1040" cy="120" r="200" fill="#ffffff" opacity="0.35"/>
  <circle cx="140" cy="540" r="260" fill="#ffffff" opacity="0.25"/>
  <text x="1200" y="430" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="120" font-weight="700" fill="#5b0e20" opacity="0.92">${label
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")}</text>
  <text x="1200" y="505" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" letter-spacing="6" fill="#5b0e20" opacity="0.6">${label.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function postImageAlt(post: BlogPost) {
  return post.imageAlt ?? `${post.title} — ilustrasi kategori ${getCategoryLabel(post)}`;
}