import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "@phosphor-icons/react";

import { PublicPage } from "@/components/public-page";
import { blogCategories, blogCategoryUrl, getCategoryCount, siteUrl } from "@/lib/blog";

export const Route = createFileRoute("/blog/categories")({
  head: () => ({
    meta: [
      { title: "Blog categories — OffStories" },
      {
        name: "description",
        content:
          "Kategori blog OffStories untuk budget, seserahan, wedding organizer, RSVP tamu, dan timeline pernikahan di Indonesia.",
      },
      { property: "og:title", content: "Blog categories — OffStories" },
      {
        property: "og:description",
        content:
          "Kategori blog OffStories untuk budget, seserahan, wedding organizer, RSVP tamu, dan timeline pernikahan di Indonesia.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/blog/categories` },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/blog/categories` }],
  }),
  component: BlogCategoriesPage,
});

function BlogCategoriesPage() {
  const counts = Object.fromEntries(
    blogCategories.map((category) => [category.slug, getCategoryCount(category.slug)]),
  );

  return (
    <PublicPage>
      <div className="space-y-10">
        <section className="max-w-3xl border-b border-border pb-8">
          <div className="eyebrow mb-4">Blog categories</div>
          <h1 className="serif text-4xl text-balance text-foreground sm:text-5xl">
            Kategori yang mengikuti fase planning pasangan di Indonesia.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sepuluh kategori dibuat supaya kamu bisa cepat berpindah ke topik yang paling relevan:
            budget, checklist, adat, vendor, dan lainnya.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {blogCategories.map((category) => (
            <Link
              key={category.slug}
              to={blogCategoryUrl(category.slug)}
              className="group rounded-[24px] border border-border bg-white p-6 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-2xl" aria-hidden>
                  {category.emoji}
                </span>
                <ArrowRight
                  size={16}
                  className="text-muted-foreground transition-colors group-hover:text-primary"
                />
              </div>
              <h2 className="serif mt-4 text-2xl text-foreground">{category.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{category.intro}</p>
              <div className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {counts[category.slug] ?? 0} artikel
              </div>
            </Link>
          ))}
        </section>

        <div className="flex justify-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-[14px] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 active:scale-[0.98]"
          >
            Back to all articles
          </Link>
        </div>
      </div>
    </PublicPage>
  );
}
