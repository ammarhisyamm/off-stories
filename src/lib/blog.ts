export const siteUrl = "https://offstories.fun";

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  ordered?: string[];
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
  category: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  author: BlogAuthor;
  intro: string;
  sections: BlogSection[];
  faqs: BlogFAQ[];
  relatedSlugs: string[];
  keywords: string[];
};

export type BlogCategory = {
  slug: string;
  label: string;
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

export function slugifyCategory(category: string) {
  return category
    .toLowerCase()
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
    category: "Checklist",
    publishedAt: "2026-08-07",
    updatedAt: "2026-08-13",
    readTime: "7 menit baca",
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
  },
  {
    slug: "nikah-jakarta-budget-50-juta",
    title: "Nikah di Jakarta dengan Budget 50 Juta: Breakdown Real dari Pasangan",
    excerpt:
      "Breakdown nyata dari pasangan yang sudah lewat: ke mana saja Rp 50 juta habis, dan bagian mana yang paling layak diprioritaskan.",
    category: "Budget",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-13",
    readTime: "7 menit baca",
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
        ordered: [
          "Venue + catering: Rp 25 juta (alokasi terbesar).",
          "Dekorasi dan dokumentasi: Rp 10 juta.",
          "Makeup, busana, dan MC: Rp 7 juta.",
          "Seserahan, undangan, dan souvenir: Rp 6 juta.",
          "Cadangan dan biaya kecil: Rp 2 juta.",
        ],
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
  },
  {
    slug: "panduan-adat-pernikahan-jawa",
    title: "Panduan Adat Pernikahan Jawa: Dari Lamaran sampai Resepsi",
    excerpt:
      "Rangkaian prosesi adat Jawa dari lamaran, akad, sampai resepsi, lengkap dengan makna dan persiapan biayanya.",
    category: "Adat",
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-13",
    readTime: "8 menit baca",
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
  },
  {
    slug: "budget-pernikahan-indonesia",
    title: "Budget Pernikahan di Indonesia: Cara Membagi Anggaran Tanpa Over",
    excerpt:
      "Panduan praktis untuk membagi biaya venue, catering, dekor, WO, dokumentasi, dan dana cadangan supaya anggaran pernikahan tetap sehat.",
    category: "Budget",
    publishedAt: "2026-08-01",
    updatedAt: "2026-08-12",
    readTime: "6 menit baca",
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
  },
  {
    slug: "checklist-seserahan-pernikahan",
    title: "Checklist Seserahan Pernikahan di Indonesia: Barang, Timing, dan Cara Menyusunnya",
    excerpt:
      "Daftar seserahan yang umum di Indonesia, kapan harus mulai menyiapkan, dan cara mengatur checklist supaya tidak ada item yang tertinggal.",
    category: "Adat",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
  },
  {
    slug: "wedding-organizer-vs-diy-wedding",
    title: "Wedding Organizer vs DIY Wedding di Indonesia: Kapan Perlu WO?",
    excerpt:
      "Bandingkan peran wedding organizer dan planning mandiri agar kamu tahu kapan WO benar-benar membantu, dan kapan kamu bisa mengelola sendiri.",
    category: "Checklist",
    publishedAt: "2026-08-04",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
  },
  {
    slug: "rsvp-seating-check-in-pernikahan",
    title: "RSVP, Seating, dan Check-in Pernikahan di Indonesia: Flow Tamu yang Lebih Rapi",
    excerpt:
      "Cara menata RSVP link, WhatsApp, seating, dan QR check-in supaya pengelolaan tamu lebih mudah dan acara berjalan lebih tenang.",
    category: "Resepsi",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-13",
    readTime: "6 menit baca",
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
  },
  {
    slug: "cara-negosiasi-harga-vendor",
    title: "Cara Negosiasi Harga Vendor Tanpa Kelihatan Pelit",
    excerpt:
      "Teknik menawar vendor yang tetap sopan dan profesional, plus kapan lebih baik minta penyesuaian paket daripada potongan harga.",
    category: "Vendor",
    publishedAt: "2026-08-11",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
  },
  {
    slug: "interview-vendor-katering",
    title: "Interview Vendor Katering: 7 Pertanyaan yang Wajib Ditanyain",
    excerpt:
      "Daftar pertanyaan penting sebelum booking katering: mulai dari harga per pax, menu prasmanan, sampai kebijakan perubahan jumlah tamu.",
    category: "Vendor",
    publishedAt: "2026-08-12",
    updatedAt: "2026-08-13",
    readTime: "6 menit baca",
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
  },
  {
    slug: "rundown-resepsi-wedding-4-jam",
    title: "Rundown Resepsi Wedding 4 Jam: Template yang Bisa Dicopy",
    excerpt:
      "Susunan acara 4 jam dari tamu masuk sampai acara selesai, lengkap dengan waktu ideal untuk tiap sesi.",
    category: "Resepsi",
    publishedAt: "2026-08-08",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
  },
  {
    slug: "tema-wedding-minimalis-2025",
    title: "Tema Wedding Minimalis 2025: Inspirasi dan Estimasi Budget",
    excerpt:
      "Ide tema minimalis yang sedang tren, cara memadukan warna netral, dan perkiraan budget dekorasi yang realistis.",
    category: "Dekorasi",
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-13",
    readTime: "6 menit baca",
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
  },
  {
    slug: "skincare-6-bulan-sebelum-wedding",
    title: "Skincare Routine 6 Bulan Sebelum Wedding: yang Benar-benar Berdampak",
    excerpt:
      "Rutinitas perawatan kulit yang realistis dari 6 bulan sebelum hari H, fokus pada konsistensi bukan produk mahal.",
    category: "Fashion",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-13",
    readTime: "6 menit baca",
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
  },
  {
    slug: "tips-pose-natural-prewedding",
    title: "Tips Pose Natural untuk yang Tidak Terbiasa Difoto",
    excerpt:
      "Cara rileks di depan kamera untuk sesi prewedding, dari latihan kecil sampai teknik yang biasa dipakai fotografer.",
    category: "Prewedding",
    publishedAt: "2026-08-08",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
  },
  {
    slug: "cincin-titanium-vs-emas",
    title: "Cincin Kawin Titanium vs Emas: Mana yang Lebih Tahan Lama?",
    excerpt:
      "Perbandingan cincin titanium dan emas dari segi kekuatan, harga, dan kenyamanan, supaya kamu pilih sesuai gaya hidup.",
    category: "Cincin",
    publishedAt: "2026-08-07",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
  },
  {
    slug: "burnout-pre-wedding",
    title: "Burnout Pre-Wedding: Tanda-tanda dan Cara Mengatasinya",
    excerpt:
      "Kenali tanda stres berlebih saat persiapan pernikahan dan cara mengatasinya sebelum sampai ke titik kelelahan.",
    category: "Mental",
    publishedAt: "2026-08-12",
    updatedAt: "2026-08-13",
    readTime: "6 menit baca",
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
  },
  {
    slug: "nikah-adat-vs-nikah-sipil",
    title: "Nikah Adat vs Nikah Sipil di Indonesia: Plus Minus dan Biaya",
    excerpt:
      "Bandingkan pernikahan adat dan akad sipil dari sisi prosesi, biaya, dan kemudahan administrasi, lalu pilih yang paling cocok.",
    category: "Adat",
    publishedAt: "2026-08-11",
    updatedAt: "2026-08-13",
    readTime: "6 menit baca",
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
  },
];

export const blogCategories: BlogCategory[] = [
  {
    slug: "budget",
    label: "Budget",
    title: "Budgeting & Keuangan",
    description: "Tips mengatur budget wedding, tracking pengeluaran, dan nikah hemat tanpa kompromi kualitas.",
    intro:
      "Untuk pasangan di Indonesia, budget biasanya paling sensitif di venue, catering, WO, dan dekor. Kategori ini membantu kamu mulai dari angka yang paling realistis.",
    emoji: "💰",
  },
  {
    slug: "checklist",
    label: "Checklist",
    title: "Checklist & Timeline",
    description: "Timeline persiapan, checklist lengkap, dan hal-hal yang sering terlupa menjelang hari H.",
    intro:
      "Urutan kerja yang rapi adalah obat dari keputusan mendadak. Kategori ini menuntun kamu dari 12 bulan sebelum sampai H-1.",
    emoji: "📋",
  },
  {
    slug: "adat",
    label: "Adat",
    title: "Adat & Tradisi",
    description: "Panduan adat Jawa, Sunda, Batak, Minang, Bali, dan tradisi lokal lainnya.",
    intro:
      "Dari lamaran sampai resepsi, kategori ini membahas prosesi adat dan bagaimana menyesuaikannya dengan budget dan kesepakatan keluarga.",
    emoji: "🏛️",
  },
  {
    slug: "vendor",
    label: "Vendor",
    title: "Vendor & Supplier",
    description: "Cara pilih vendor, review MUA, venue, katering, dan tips negosiasi harga.",
    intro:
      "Vendor yang tepat menentukan hari H yang tenang. Di sini kamu belajar menyaring, mewawancarai, dan bernegosiasi dengan lebih percaya diri.",
    emoji: "👗",
  },
  {
    slug: "dekorasi",
    label: "Dekorasi",
    title: "Tema & Dekorasi",
    description: "Inspirasi tema wedding, DIY decorations, dan warna palette yang sedang tren.",
    intro:
      "Tema yang jelas membuat dekorasi fokus dan hemat. Kategori ini menginspirasi tanpa membuat keputusan terasa berlebihan.",
    emoji: "🎨",
  },
  {
    slug: "fashion",
    label: "Fashion",
    title: "Fashion & Beauty",
    description: "Gaun pengantin, skincare pre-wedding, busana keluarga, dan bridesmaids.",
    intro:
      "Tampil percaya diri di hari H dimulai dari persiapan yang tidak terburu-buru, baik untuk pengantin maupun keluarga.",
    emoji: "👕",
  },
  {
    slug: "prewedding",
    label: "Prewedding",
    title: "Pre-Wedding & Dokumentasi",
    description: "Ide lokasi prewed, tips pose, dan cara memilih fotografer vs videografer.",
    intro:
      "Dokumentasi menyimpan kenangan paling berharga. Kategori ini membantu kamu memilih dan bersiap tampil natural di depan kamera.",
    emoji: "📸",
  },
  {
    slug: "resepsi",
    label: "Resepsi",
    title: "Resepsi & Acara",
    description: "Rundown acara, games untuk tamu, catering, dan menu favorit.",
    intro:
      "Resepsi yang mulus soal rundown yang jelas. Di sini kamu menyusun urutan acara, hiburan, dan pengalaman tamu.",
    emoji: "🎉",
  },
  {
    slug: "cincin",
    label: "Cincin",
    title: "Cincin & Jewelry",
    description: "Pilih cincin kawin, custom design, perawatan, dan estimasi harga.",
    intro:
      "Cincin yang dipakai setiap hari harus sesuai gaya hidup. Kategori ini membantu memilih bahan, ukuran, dan perawatannya.",
    emoji: "💍",
  },
  {
    slug: "mental",
    label: "Mental",
    title: "Mental Prep & Relationship",
    description: "Mengatasi stress pre-wedding, komunikasi dengan pasangan, dan keluarga.",
    intro:
      "Persiapan pernikahan tidak hanya soal vendor. Kategori ini menjaga hubungan dan kesehatan mental tetap sehat sampai hari H.",
    emoji: "🧘",
  },
];

export const featuredSlugs = [
  "checklist-12-bulan-sebelum-nikah",
  "nikah-jakarta-budget-50-juta",
  "panduan-adat-pernikahan-jawa",
];

export function getBlogCategory(slug: string) {
  return blogCategories.find((category) => category.slug === slug);
}

export function getBlogPostsByCategory(slug: string) {
  return blogPosts.filter((post) => slugifyCategory(post.category) === slug);
}

export function getFeaturedBlogPosts() {
  return featuredSlugs
    .map((slug) => getBlogPost(slug))
    .filter((post): post is BlogPost => Boolean(post));
}

export function getLatestBlogPosts(count = 8) {
  return [...blogPosts]
    .filter((post) => !featuredSlugs.includes(post.slug))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, count);
}

export function blogCategoryUrl(slug: string) {
  return `${siteUrl}/blog/categories/${slug}`;
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3) {
  const related = post.relatedSlugs
    .map((slug) => getBlogPost(slug))
    .filter((item): item is BlogPost => Boolean(item));
  if (related.length >= limit) return related.slice(0, limit);
  const fallback = blogPosts
    .filter((item) => item.slug !== post.slug && !related.some((r) => r.slug === item.slug))
    .slice(0, limit - related.length);
  return [...related, ...fallback];
}

export function blogPostUrl(slug: string) {
  return `${siteUrl}/blog/${slug}`;
}