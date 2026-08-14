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

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
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

export const blogPosts: BlogPost[] = [
  {
    slug: "budget-pernikahan-indonesia",
    title: "Budget Pernikahan di Indonesia: Cara Membagi Anggaran Tanpa Over",
    excerpt:
      "Panduan praktis untuk membagi biaya venue, catering, dekor, WO, dokumentasi, dan dana cadangan supaya anggaran pernikahan tetap sehat.",
    category: "Budget",
    publishedAt: "2026-08-01",
    updatedAt: "2026-08-12",
    readTime: "6 menit baca",
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
    relatedSlugs: [
      "wedding-organizer-vs-diy-wedding",
      "checklist-seserahan-pernikahan",
    ],
    keywords: ["budget pernikahan indonesia", "budget wedding indonesia", "cara membagi budget nikah"],
  },
  {
    slug: "checklist-seserahan-pernikahan",
    title: "Checklist Seserahan Pernikahan di Indonesia: Barang, Timing, dan Cara Menyusunnya",
    excerpt:
      "Daftar seserahan yang umum di Indonesia, kapan harus mulai menyiapkan, dan cara mengatur checklist supaya tidak ada item yang tertinggal.",
    category: "Seserahan",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
    relatedSlugs: ["budget-pernikahan-indonesia", "rsvp-seating-check-in-pernikahan"],
    keywords: ["seserahan pernikahan", "checklist seserahan", "barang seserahan"],
  },
  {
    slug: "wedding-organizer-vs-diy-wedding",
    title: "Wedding Organizer vs DIY Wedding di Indonesia: Kapan Perlu WO?",
    excerpt:
      "Bandingkan peran wedding organizer dan planning mandiri agar kamu tahu kapan WO benar-benar membantu, dan kapan kamu bisa mengelola sendiri.",
    category: "Planning",
    publishedAt: "2026-08-04",
    updatedAt: "2026-08-13",
    readTime: "5 menit baca",
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
    relatedSlugs: ["budget-pernikahan-indonesia", "rsvp-seating-check-in-pernikahan"],
    keywords: ["wedding organizer vs diy", "perlu wedding organizer", "plan wedding sendiri"],
  },
  {
    slug: "rsvp-seating-check-in-pernikahan",
    title: "RSVP, Seating, dan Check-in Pernikahan di Indonesia: Flow Tamu yang Lebih Rapi",
    excerpt:
      "Cara menata RSVP link, WhatsApp, seating, dan QR check-in supaya pengelolaan tamu lebih mudah dan acara berjalan lebih tenang.",
    category: "Guests",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-13",
    readTime: "6 menit baca",
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
    relatedSlugs: ["budget-pernikahan-indonesia", "checklist-seserahan-pernikahan"],
    keywords: ["rsvp pernikahan", "seating plan pernikahan", "check in tamu wedding"],
  },
  {
    slug: "checklist-12-bulan-sebelum-nikah",
    title: "Checklist 12 Bulan Sebelum Nikah di Indonesia: Timeline Pernikahan yang Lebih Terkontrol",
    excerpt:
      "Timeline praktis dari 12 bulan sebelum hari H sampai mendekati acara, cocok untuk pasangan yang ingin mengurangi keputusan mendadak.",
    category: "Timeline",
    publishedAt: "2026-08-07",
    updatedAt: "2026-08-13",
    readTime: "7 menit baca",
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
    relatedSlugs: ["budget-pernikahan-indonesia", "wedding-organizer-vs-diy-wedding"],
    keywords: ["timeline pernikahan", "checklist 12 bulan sebelum nikah", "wedding timeline indonesia"],
  },
];

export const blogCategories: BlogCategory[] = [
  {
    slug: "budget",
    label: "Budget",
    title: "Budget pernikahan",
    description: "Cara membagi biaya pernikahan, menentukan prioritas, dan menjaga budget tetap sehat.",
    intro:
      "Untuk pasangan di Indonesia, budget biasanya paling sensitif di venue, catering, WO, dan dekor. Category ini membantu kamu mulai dari angka yang paling realistis.",
  },
  {
    slug: "seserahan",
    label: "Seserahan",
    title: "Seserahan & adat",
    description: "Checklist seserahan, timing belanja, dan penyesuaian dengan tradisi keluarga.",
    intro:
      "Kategori ini fokus pada checklist seserahan yang umum dipakai di Indonesia, termasuk penyesuaian dengan adat keluarga dan kebutuhan simbolis.",
  },
  {
    slug: "planning",
    label: "Planning",
    title: "WO vs DIY",
    description: "Kapan wedding organizer membantu, kapan planning mandiri masih masuk akal, dan apa risikonya.",
    intro:
      "Kategori ini membahas koordinasi, vendor, dan workflow yang biasanya paling sibuk pada pernikahan di Indonesia.",
  },
  {
    slug: "guests",
    label: "Guests",
    title: "RSVP & tamu",
    description: "RSVP, seating, check-in, dan alur tamu yang lebih rapi untuk acara di Indonesia.",
    intro:
      "Kategori ini membantu kamu merapikan tamu, kursi, dan check-in agar tim keluarga dan venue melihat data yang sama.",
  },
  {
    slug: "timeline",
    label: "Timeline",
    title: "Timeline nikah",
    description: "Checklist 12 bulan, persiapan KUA, akad, resepsi, dan milestone penting menjelang hari H.",
    intro:
      "Kategori ini untuk pasangan yang ingin urutan kerja lebih tenang dari awal sampai mendekati hari acara.",
  },
];

export function getBlogCategory(slug: string) {
  return blogCategories.find((category) => category.slug === slug);
}

export function getBlogPostsByCategory(slug: string) {
  return blogPosts.filter((post) => slugifyCategory(post.category) === slug);
}

export function blogCategoryUrl(slug: string) {
  return `${siteUrl}/blog/categories/${slug}`;
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(post: BlogPost) {
  return post.relatedSlugs
    .map((slug) => getBlogPost(slug))
    .filter((item): item is BlogPost => Boolean(item));
}

export function blogPostUrl(slug: string) {
  return `${siteUrl}/blog/${slug}`;
}
