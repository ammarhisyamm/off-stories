import { createFileRoute } from "@tanstack/react-router";
import { SeoHero, SeoPage } from "@/components/seo/seo-page";
import { InteractiveTemplate } from "@/components/seo/planning-tools";
import { siteUrl } from "@/lib/blog";
export const Route = createFileRoute("/id/templates/wedding-budget")({
  head: () => ({
    meta: [
      { title: "Template Budget Pernikahan Indonesia — OffStories" },
      {
        name: "description",
        content:
          "Template budget pernikahan dengan pos penting, alokasi awal, dan cara melanjutkannya ke tracker bersama pasangan.",
      },
      { property: "og:title", content: "Template Budget Pernikahan Indonesia — OffStories" },
      { property: "og:url", content: `${siteUrl}/id/templates/wedding-budget` },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/id/templates/wedding-budget` }],
  }),
  component: BudgetTemplatePage,
});
function BudgetTemplatePage() {
  return (
    <SeoPage cluster="budget" crumb="Template budget pernikahan">
      <SeoHero
        eyebrow="Template budget pernikahan"
        title="Dari pos budget ke keputusan yang bisa dipantau."
        description="Gunakan struktur awal untuk venue, catering, dekor, dokumentasi, dan buffer. Setelah signup, angka ini bisa langsung berkembang menjadi tracker bersama."
      />
      <div className="py-12 sm:py-16">
        <InteractiveTemplate type="budget" />
      </div>
    </SeoPage>
  );
}
