import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarBlank,
  CheckSquareOffset,
  CurrencyCircleDollar,
  UsersThree,
  UserSwitch,
  Users,
  Storefront,
} from "@phosphor-icons/react";

import { FeatureList, SeoCta, SeoHero, SeoPage } from "@/components/seo/seo-page";
import { ProductLinkGrid } from "@/components/seo/planning-tools";
import { siteUrl } from "@/lib/blog";

export const Route = createFileRoute("/id/wedding-planner")({
  head: () => ({
    meta: [
      { title: "Wedding Planner Online Indonesia untuk Pasangan — OffStories" },
      {
        name: "description",
        content:
          "OffStories adalah wedding planner online untuk pasangan Indonesia. Atur checklist, budget, tamu, vendor, timeline, dan keputusan pernikahan bersama dalam satu workspace.",
      },
      {
        property: "og:title",
        content: "Wedding Planner Online Indonesia untuk Pasangan — OffStories",
      },
      {
        property: "og:description",
        content: "Semua persiapan nikah kalian, di satu workspace yang bisa dikelola bersama.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/id/wedding-planner` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/id/wedding-planner` }],
  }),
  component: WeddingPlannerPage,
});

const workflow = [
  {
    icon: CalendarBlank,
    title: "Mulai dari tanggal",
    body: "Masukkan tanggal akad atau resepsi agar planning punya arah yang jelas.",
  },
  {
    icon: CheckSquareOffset,
    title: "Kerjakan yang penting dulu",
    body: "Checklist dan milestone membantu kalian fokus pada keputusan berikutnya.",
  },
  {
    icon: UserSwitch,
    title: "Bagi keputusan, bukan file",
    body: "Undang pasangan agar budget, vendor, dan tugas selalu punya satu versi.",
  },
];

function WeddingPlannerPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OffStories",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/id/wedding-planner`,
    description:
      "Wedding planning workspace untuk pasangan Indonesia yang mengelola checklist, budget, tamu, vendor, dan timeline bersama.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
  };

  return (
    <SeoPage cluster="planner" crumb="Wedding planner online">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <SeoHero
        eyebrow="Wedding planner online Indonesia"
        title="Semua persiapan nikah kalian, di satu tempat."
        description="OffStories membantu kalian menyusun checklist, mengatur budget, membagi guest list, membandingkan vendor, dan tetap sinkron tanpa spreadsheet yang bercabang atau chat yang tenggelam."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <SeoCta
            label="Mulai planning berdua"
            draft={{
              sourcePage: "/id/wedding-planner",
              contentCluster: "planner",
              ctaVariant: "planner_hero",
            }}
          />
          <Link
            to="/id/tools/wedding-timeline"
            className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2 active:scale-[0.98]"
          >
            Coba timeline generator
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Gratis untuk mulai · Tidak perlu kartu kredit
        </p>
      </SeoHero>

      <section className="grid gap-6 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <div className="eyebrow">Untuk pasangan yang sedang merencanakan</div>
          <h2 className="display mt-3 text-3xl text-balance text-foreground sm:text-4xl">
            Bukan sekadar daftar tugas. Ini ruang keputusan kalian.
          </h2>
        </div>
        <div className="panel p-6 sm:p-8">
          <FeatureList
            items={[
              "Checklist yang bisa diprioritaskan dan ditandai selesai bersama.",
              "Budget dalam rupiah lengkap dengan DP, pelunasan, dan siapa yang membayar.",
              "Guest list, RSVP, seating, dan check-in dari data yang sama.",
              "Vendor, timeline, rundown, dan dokumen yang tidak lagi tercecer.",
            ]}
          />
        </div>
      </section>

      <section className="border-y border-border py-12 sm:py-16">
        <div className="eyebrow">Cara kerja</div>
        <h2 className="display mt-3 max-w-2xl text-3xl text-balance text-foreground sm:text-4xl">
          Mulai sederhana, lalu tumbuhkan rencana kalian.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {workflow.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[20px] border border-border bg-surface p-6"
              >
                <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                <Icon size={22} className="mt-6 text-primary" />
                <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">Mulai dari kebutuhanmu</div>
            <h2 className="display mt-3 text-3xl text-foreground sm:text-4xl">
              Coba dulu sebelum membuat workspace.
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            Hasilnya dapat kamu lanjutkan setelah signup.
          </span>
        </div>
        <div className="mt-6">
          <ProductLinkGrid />
        </div>
      </section>

      <section className="grid gap-6 border-t border-border py-12 sm:grid-cols-2 sm:py-16">
        <div>
          <div className="eyebrow">Plan it together</div>
          <h2 className="display mt-3 text-3xl text-balance text-foreground">
            Lebih sedikit spreadsheet. Lebih sedikit group chat.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Saat dua orang merencanakan satu hari besar, yang dibutuhkan bukan lebih banyak
            dokumen—tetapi satu sumber keputusan yang sama.
          </p>
        </div>
        <div className="panel p-6 sm:p-8">
          <div className="grid gap-5">
            <div className="flex gap-3">
              <Users size={22} className="shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Ajak pasangan sebagai editor</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Bagi tugas tanpa mengirim ulang file setiap ada perubahan.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Storefront size={22} className="shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Catat keputusan vendor saat itu juga
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Quotation, DP, dan kontak tetap terhubung ke budget yang sama.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CurrencyCircleDollar size={22} className="shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Lihat angka yang benar-benar tersisa
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Tidak perlu menghitung ulang dari beberapa versi spreadsheet.
                </p>
              </div>
            </div>
          </div>
          <SeoCta
            className="mt-7"
            label="Buat shared wedding workspace"
            draft={{
              sourcePage: "/id/wedding-planner",
              contentCluster: "planner",
              ctaVariant: "planner_bottom",
            }}
          />
        </div>
      </section>
    </SeoPage>
  );
}
