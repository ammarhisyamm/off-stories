import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarBlank, Clock } from "@phosphor-icons/react";

import { PublicPage } from "@/components/public-page";
import {
  blogCategories,
  blogCategoryUrl,
  blogPosts,
  blogPostUrl,
  formatBlogDate,
  siteUrl,
} from "@/lib/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — OffStories" },
      {
        name: "description",
        content:
          "Panduan pernikahan untuk Indonesia: budget, seserahan, RSVP, timeline, dan planning yang lebih tenang.",
      },
      { property: "og:title", content: "Blog — OffStories" },
      {
        property: "og:description",
        content:
          "Panduan pernikahan untuk Indonesia: budget, seserahan, RSVP, timeline, dan planning yang lebih tenang.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/blog` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/blog` }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const featured = blogPosts[0];

  return (
    <PublicPage>
      <div className="space-y-12">
        <section className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4">Wedding planning guides for Indonesia</div>
            <h1 className="serif text-4xl text-balance text-foreground sm:text-5xl">
              Blog yang membantu pasangan memutuskan dengan lebih tenang.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Panduan praktis tentang budget, seserahan, RSVP, timeline, dan workflow pernikahan
              di Indonesia. Ditulis untuk membantu kamu mulai lebih cepat dan mengurangi keputusan
              yang terasa terlalu mendadak.
            </p>
          </div>
          <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Why this matters
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              Artikel yang terstruktur membantu mesin pencari memahami konteks produk, dan
              membantu calon pengguna menemukan jawaban yang relevan sebelum mereka masuk ke
              workspace.
            </p>
            <Link
              to="/auth"
              className="mt-5 inline-flex items-center gap-2 rounded-[14px] border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
            >
              Start planning
              <ArrowRight weight="bold" size={16} />
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Browse by category</div>
              <h2 className="serif mt-2 text-2xl text-foreground">
                Temukan artikel yang paling relevan untuk fase planning kamu.
              </h2>
            </div>
            <Link
              to="/blog/categories"
              className="hidden items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary md:inline-flex"
            >
              View all categories
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {blogCategories.map((category) => (
              <Link
                key={category.slug}
                to={blogCategoryUrl(category.slug)}
                className="rounded-[22px] border border-border bg-surface p-5 transition duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {category.label}
                </div>
                <h3 className="serif mt-3 text-xl text-balance text-foreground">{category.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">Featured article</div>
              <h2 className="serif mt-2 text-2xl text-foreground">
                Mulai dari budget yang paling realistis.
              </h2>
            </div>
            <Link
              to={`/blog/${featured.slug}`}
              className="hidden items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary md:inline-flex"
            >
              Read the guide
              <ArrowRight size={16} />
            </Link>
          </div>
          <article className="grid gap-6 rounded-[28px] border border-border bg-white p-6 shadow-soft lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-foreground">
                  {featured.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlank size={14} />
                  {formatBlogDate(featured.updatedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  {featured.readTime}
                </span>
              </div>
              <h3 className="serif mt-5 text-3xl text-balance text-foreground sm:text-4xl">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <Link
                to={`/blog/${featured.slug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-soft transition duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              >
                Read article
                <ArrowRight weight="bold" size={16} />
              </Link>
            </div>
            <div className="rounded-[24px] border border-border bg-surface p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                What you&apos;ll learn
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
                <li>• Cara membagi budget pernikahan tanpa kehilangan ruang cadangan.</li>
                <li>• Mengapa lokasi dan guest count mengubah seluruh perhitungan.</li>
                <li>• Kapan kamu butuh WO dan kapan DIY masih aman.</li>
                <li>• Bagaimana data tamu dan seserahan jadi lebih rapi.</li>
              </ul>
            </div>
          </article>
        </section>

        <section className="space-y-6">
          <div>
            <div className="eyebrow">All articles</div>
            <h2 className="serif mt-2 text-2xl text-foreground">
              Panduan yang bisa dibaca sesuai kebutuhan.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="group rounded-[24px] border border-border bg-white p-6 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    {post.category}
                  </span>
                  <div className="text-xs text-muted-foreground">{formatBlogDate(post.updatedAt)}</div>
                </div>
                <h3 className="serif mt-4 text-2xl text-balance text-foreground">{post.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{post.readTime}</span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors group-hover:text-primary"
                  >
                    Read more
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              name: "OffStories Blog",
              url: `${siteUrl}/blog`,
              description:
                "Panduan pernikahan untuk Indonesia: budget, seserahan, RSVP, timeline, dan planning yang lebih tenang.",
              blogPost: blogPosts.map((post) => ({
                "@type": "BlogPosting",
                headline: post.title,
                url: blogPostUrl(post.slug),
                datePublished: post.publishedAt,
                dateModified: post.updatedAt,
              })),
            }),
          }}
        />
      </div>
    </PublicPage>
  );
}
