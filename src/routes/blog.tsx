import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CalendarBlank, Clock, Envelope, PaperPlaneTilt } from "@phosphor-icons/react";
import { useState } from "react";

import { PublicPage } from "@/components/public-page";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import {
  blogCategories,
  blogCategoryUrl,
  blogPosts,
  blogPostUrl,
  formatBlogDate,
  getFeaturedBlogPosts,
  getLatestBlogPosts,
  getCategoryCount,
  getCategoryLabel,
  siteUrl,
} from "@/lib/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Panduan Lengkap Persiapan Pernikahan — OffStories Blog" },
      {
        name: "description",
        content:
          "Tips, checklist, dan inspirasi wedding dari budgeting sampai hari H — khusus untuk calon pengantin Indonesia.",
      },
      { property: "og:title", content: "Panduan Lengkap Persiapan Pernikahan — OffStories Blog" },
      {
        property: "og:description",
        content:
          "Tips, checklist, dan inspirasi wedding dari budgeting sampai hari H — khusus untuk calon pengantin Indonesia.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/blog` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/blog` }],
  }),
  component: BlogIndex,
});

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");
  const subscribe = useServerFn(subscribeNewsletter);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.includes("@")) return;
        setState("submitting");
        subscribe({ data: { email, source: "blog" } })
          .then(() => setState("done"))
          .catch(() => setState("idle"));
      }}
      className="mt-6"
    >
      {state === "done" ? (
        <p className="rounded-2xl border border-primary/25 bg-primary/10 px-5 py-4 text-sm font-medium text-foreground">
          Terima kasih! Checklist wedding gratis sedang dikirim ke email kamu. 💌
        </p>
      ) : (
        <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">
            Alamat email
          </label>
          <div className="relative flex-1">
            <Envelope
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alamat email kamu"
              className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none transition duration-150 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={state === "submitting"}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === "submitting" ? "Mengirim…" : "Terima Checklist"}
            <PaperPlaneTilt weight="bold" size={16} />
          </button>
        </div>
      )}
    </form>
  );
}

function CategoryCount({ slug }: { slug: string }) {
  const count = getCategoryCount(slug);
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {count} artikel
    </span>
  );
}

function BlogIndex() {
  const featured = getFeaturedBlogPosts();
  const latest = getLatestBlogPosts(6);

  return (
    <PublicPage>
      <div className="space-y-16">
        <section className="border-b border-border pb-10 text-center">
          <h1 className="serif text-4xl text-balance text-foreground sm:text-5xl">
            Panduan Lengkap Persiapan Pernikahan
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tips, checklist, dan inspirasi wedding dari budgeting sampai hari H — khusus untuk calon
            pengantin Indonesia.
          </p>
          <a
            href="#artikel-terbaru"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-soft transition duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            Mulai Baca
            <ArrowRight weight="bold" size={16} />
          </a>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="eyebrow">Kategori</div>
              <h2 className="serif mt-2 text-2xl text-foreground">
                Temukan artikel yang paling relevan untuk fase planning kamu.
              </h2>
            </div>
            <Link
              to="/blog/categories"
              className="hidden items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary md:inline-flex"
            >
              Lihat semua kategori
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {blogCategories.map((category) => (
              <Link
                key={category.slug}
                to={blogCategoryUrl(category.slug)}
                className="group flex flex-col rounded-[22px] border border-border bg-surface p-5 transition duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="text-2xl" aria-hidden>
                  {category.emoji}
                </div>
                <h3 className="serif mt-3 text-xl text-balance text-foreground">
                  {category.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
                <div className="mt-4">
                  <CategoryCount slug={category.slug} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="border-b border-border pb-4">
            <div className="eyebrow">Pilihan Editor</div>
            <h2 className="serif mt-2 text-2xl text-foreground">
              Mulai dari tiga panduan yang paling banyak dicari.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((post) => (
              <Link
                key={post.slug}
                to={blogPostUrl(post.slug)}
                className="group flex flex-col rounded-[24px] border border-border bg-white p-6 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-foreground">
                    {getCategoryLabel(post)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} />
                    {post.readingTime}
                  </span>
                </div>
                <h3 className="serif mt-4 flex-1 text-xl text-balance text-foreground group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{formatBlogDate(post.updatedAt)}</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors group-hover:text-primary">
                    Baca
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6" id="artikel-terbaru">
          <div className="border-b border-border pb-4">
            <div className="eyebrow">Artikel terbaru</div>
            <h2 className="serif mt-2 text-2xl text-foreground">
              Panduan yang bisa dibaca sesuai kebutuhan.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latest.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col rounded-[24px] border border-border bg-white p-6 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    {getCategoryLabel(post)}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarBlank size={14} />
                    {formatBlogDate(post.updatedAt)}
                  </div>
                </div>
                <h3 className="serif mt-4 flex-1 text-xl text-balance text-foreground">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{post.readingTime}</span>
                  <Link
                    to={blogPostUrl(post.slug)}
                    className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors group-hover:text-primary"
                  >
                    Baca artikel
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-surface px-6 py-12 text-center shadow-soft sm:px-12">
          <div className="eyebrow">Free download</div>
          <h2 className="serif mt-3 text-3xl text-balance text-foreground">
            Dapatkan Checklist Wedding Gratis via Email
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Join 5,000+ calon pengantin yang sudah download template checklist kami. Satu tempat
            untuk semua tugas, budget, dan tanggal penting.
          </p>
          <NewsletterForm />
          <p className="mt-4 text-xs text-muted-foreground">
            Kami tidak spam. Unsubscribe kapan saja.
          </p>
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
                "Tips, checklist, dan inspirasi wedding dari budgeting sampai hari H — khusus untuk calon pengantin Indonesia.",
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
