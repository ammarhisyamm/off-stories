import { createFileRoute } from "@tanstack/react-router";
import { SeoHero, SeoPage } from "@/components/seo/seo-page";
import { InteractiveTemplate } from "@/components/seo/planning-tools";
import { siteUrl } from "@/lib/blog";
export const Route = createFileRoute("/id/templates/wedding-checklist")({
  head: () => ({
    meta: [
      { title: "Wedding Checklist Template Indonesia — OffStories" },
      {
        name: "description",
        content:
          "Template checklist persiapan pernikahan yang bisa langsung dicentang dan dilanjutkan bersama pasangan di OffStories.",
      },
      { property: "og:title", content: "Wedding Checklist Template Indonesia — OffStories" },
      { property: "og:url", content: `${siteUrl}/id/templates/wedding-checklist` },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/id/templates/wedding-checklist` }],
  }),
  component: ChecklistTemplatePage,
});
function ChecklistTemplatePage() {
  return (
    <SeoPage cluster="checklist" crumb="Wedding checklist template">
      <SeoHero
        eyebrow="Wedding checklist template"
        title="Mulai checklist persiapan nikah tanpa halaman kosong."
        description="Pilih tugas penting pertama, lalu lanjutkan menjadi checklist yang bisa mengikuti tanggal pernikahan dan dibagi dengan pasangan."
      />
      <div className="py-12 sm:py-16">
        <InteractiveTemplate type="checklist" />
      </div>
    </SeoPage>
  );
}
