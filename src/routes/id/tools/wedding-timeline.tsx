import { createFileRoute } from "@tanstack/react-router";
import { SeoCallout, SeoHero, SeoPage } from "@/components/seo/seo-page";
import { WeddingTimelineTool } from "@/components/seo/planning-tools";
import { siteUrl } from "@/lib/blog";

export const Route = createFileRoute("/id/tools/wedding-timeline")({
  head: () => ({
    meta: [
      { title: "Wedding Timeline Generator Indonesia — OffStories" },
      {
        name: "description",
        content:
          "Buat timeline persiapan pernikahan berdasarkan tanggal acara. Dapatkan milestone venue, vendor, undangan, dan hari H yang bisa dilanjutkan di OffStories.",
      },
      { property: "og:title", content: "Wedding Timeline Generator Indonesia — OffStories" },
      {
        property: "og:description",
        content:
          "Masukkan tanggal pernikahanmu, lalu dapatkan timeline planning yang bisa disimpan.",
      },
      { property: "og:url", content: `${siteUrl}/id/tools/wedding-timeline` },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/id/tools/wedding-timeline` }],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  return (
    <SeoPage cluster="timeline" crumb="Wedding timeline generator">
      <SeoHero
        eyebrow="Wedding timeline generator"
        title="Tahu apa yang perlu dikerjakan, dan kapan."
        description="Masukkan tanggal pernikahan kalian untuk mendapatkan urutan milestone yang realistis—mulai dari budget, venue, vendor utama, hingga konfirmasi hari H."
      />
      <div className="py-12 sm:py-16">
        <WeddingTimelineTool />
      </div>
      <div className="grid gap-6 border-t border-border py-12 md:grid-cols-2">
        <SeoCallout
          title="Timeline adalah titik mulai"
          body="Tanggal yang bergeser tidak harus membuat semua rencana kacau. Simpan timeline di workspace agar tugas dan keputusan bisa kalian update bersama."
        />
        <div>
          <h2 className="display text-2xl text-foreground">Untuk apa timeline ini?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Gunakan untuk memulai percakapan dengan keluarga, menetapkan batas waktu vendor, dan
            memilih hal yang perlu diputuskan lebih dulu. Semua milestone ini tetap bisa diubah
            sesuai adat, kota, dan format acara kalian.
          </p>
        </div>
      </div>
    </SeoPage>
  );
}
