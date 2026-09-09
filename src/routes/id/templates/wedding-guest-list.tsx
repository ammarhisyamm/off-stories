import { createFileRoute } from "@tanstack/react-router";
import { SeoHero, SeoPage } from "@/components/seo/seo-page";
import { InteractiveTemplate } from "@/components/seo/planning-tools";
import { siteUrl } from "@/lib/blog";
export const Route = createFileRoute("/id/templates/wedding-guest-list")({
  head: () => ({
    meta: [
      { title: "Wedding Guest List Template Indonesia — OffStories" },
      {
        name: "description",
        content:
          "Template daftar tamu pernikahan untuk memisahkan tamu kedua keluarga, melacak RSVP, dan melanjutkan ke seating plan.",
      },
      { property: "og:title", content: "Wedding Guest List Template Indonesia — OffStories" },
      { property: "og:url", content: `${siteUrl}/id/templates/wedding-guest-list` },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/id/templates/wedding-guest-list` }],
  }),
  component: GuestListTemplatePage,
});
function GuestListTemplatePage() {
  return (
    <SeoPage cluster="guests" crumb="Wedding guest list template">
      <SeoHero
        eyebrow="Wedding guest list template"
        title="Mulai daftar tamu tanpa mencampur semua pihak."
        description="Pisahkan keluarga, teman, dan rekan kerja sejak awal. Saat siap, lanjutkan ke shared guest list untuk RSVP dan seating di workspace kalian."
      />
      <div className="py-12 sm:py-16">
        <InteractiveTemplate type="guests" />
      </div>
    </SeoPage>
  );
}
