import { createFileRoute } from "@tanstack/react-router";
import { SeoCallout, SeoHero, SeoPage } from "@/components/seo/seo-page";
import { WeddingBudgetCalculator } from "@/components/seo/planning-tools";
import { siteUrl } from "@/lib/blog";

export const Route = createFileRoute("/id/tools/kalkulator-budget-pernikahan")({
  head: () => ({
    meta: [
      { title: "Kalkulator Budget Pernikahan Indonesia — OffStories" },
      {
        name: "description",
        content:
          "Hitung estimasi budget pernikahan berdasarkan kota, jumlah tamu, dan gaya acara. Lihat alokasi venue, catering, dekorasi, foto, dan dana cadangan.",
      },
      { property: "og:title", content: "Kalkulator Budget Pernikahan Indonesia — OffStories" },
      {
        property: "og:description",
        content: "Buat estimasi awal budget nikah dan lanjutkan ke tracker bersama pasangan.",
      },
      { property: "og:url", content: `${siteUrl}/id/tools/kalkulator-budget-pernikahan` },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/id/tools/kalkulator-budget-pernikahan` }],
  }),
  component: BudgetCalculatorPage,
});

function BudgetCalculatorPage() {
  return (
    <SeoPage cluster="budget" crumb="Kalkulator budget pernikahan">
      <SeoHero
        eyebrow="Kalkulator budget pernikahan"
        title="Hitung budget awal sebelum angka vendor datang."
        description="Masukkan kota, jumlah tamu, dan gaya acara untuk melihat titik mulai alokasi budget pernikahan kalian. Setelah itu, lanjutkan ke tracker agar DP dan pelunasan tidak terlewat."
      />
      <div className="py-12 sm:py-16">
        <WeddingBudgetCalculator />
      </div>
      <div className="grid gap-6 border-t border-border py-12 md:grid-cols-2">
        <SeoCallout
          title="Gunakan sebagai range, bukan harga final"
          body="Harga venue dan catering berubah menurut tanggal, paket, dan ketersediaan. Sisakan buffer sebelum membuat komitmen dengan vendor."
        />
        <div>
          <h2 className="display text-2xl text-foreground">
            Budget terasa lebih aman saat dicatat bersama.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Mulai dari total yang disepakati, lalu bandingkan quotation, catat DP, dan lihat sisa
            per pos di satu tempat. Itu cara paling praktis untuk mencegah kejutan menjelang hari H.
          </p>
        </div>
      </div>
    </SeoPage>
  );
}
