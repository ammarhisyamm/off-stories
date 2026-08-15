import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CalendarBlank, Clock, Envelope, PaperPlaneTilt } from "@phosphor-icons/react";
import { useState } from "react";

import { PublicPage } from "@/components/public-page";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import {
  blogCategories,
  blogCategoryUrl,
  formatBlogDate,
  getBlogPostsByCategory,
  getCategoryLabel,
  getLatestBlogPosts,
  siteUrl,
  type BlogCategory,
} from "@/lib/blog";

export const Route = createFileRoute("/blog/categories/$slug")({
  head: ({ params }) => {
    const category = blogCategories.find((item) => item.slug === params.slug);
    if (!category) return {};
    return {
      meta: [
        { title: `${category.title} — OffStories Blog` },
        { name: "description", content: category.description },
        { property: "og:title", content: `${category.title} — OffStories Blog` },
        { property: "og:description", content: category.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: blogCategoryUrl(category.slug) },
      ],
      links: [{ rel: "canonical", href: blogCategoryUrl(category.slug) }],
    };
  },
  loader: ({ params }): { category: BlogCategory } => {
    const category = blogCategories.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    return { category };
  },
  component: BlogCategoryPage,
});

function CompactNewsletter({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);

  return (
    <div className="rounded-[22px] border border-border bg-surface p-6">
      <div className="eyebrow">Free download</div>
      <h3 className="serif mt-2 text-xl text-foreground">Template budgeting gratis</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ceklis dan template budget yang bisa langsung dipakai.
      </p>
      {done ? (
        <p className="mt-4 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-foreground">
          Terkirim! Periksa email kamu. 💌
        </p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (email.includes("@"))
              subscribe({ data: { email, source: `category:${slug}` } }).then(() => setDone(true));
          }}
          className="mt-4 space-y-3"
        >
          <label className="sr-only" htmlFor="compact-newsletter-email">
            Alamat email
          </label>
          <div className="relative">
            <Envelope
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="compact-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email kamu"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition duration-150 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition duration-150 hover:opacity-90 active:scale-[0.98]"
          >
            Kirim ke email
            <PaperPlaneTilt weight="bold" size={15} />
          </button>
        </form>
      )}
    </div>
  );
}

function BlogCategoryPage() {
  const { category } = Route.useLoaderData() as { category: BlogCategory };
  const posts = getBlogPostsByCategory(category.slug);
  const otherCategories = blogCategories.filter((item) => item.slug !== category.slug);
  const categoryCounts = Object.fromEntries(
    blogCategories.map((item) => [item.slug, getBlogPostsByCategory(item.slug).length]),
  );
  const popular = getLatestBlogPosts(5);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.title} — OffStories Blog`,
    description: category.description,
    url: blogCategoryUrl(category.slug),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <PublicPage wide>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="space-y-10">
        <section className="border-b border-border pb-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link to="/blog" className="transition-colors hover:text-foreground">
              Blog
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">{category.title}</span>
          </nav>
          <div className="mt-6 flex items-start gap-4">
            <div className="text-4xl" aria-hidden>
              {category.emoji}
            </div>
            <div>
              <h1 className="serif text-4xl text-balance text-foreground sm:text-5xl">
                {category.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {category.intro}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div>
            {posts.length ? (
              <section className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group flex flex-col rounded-[24px] border border-border bg-white p-6 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-foreground">
                        {getCategoryLabel(post)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarBlank size={14} />
                        {formatBlogDate(post.updatedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} />
                        {post.readingTime}
                      </span>
                    </div>
                    <h2 className="serif mt-4 flex-1 text-2xl text-balance text-foreground">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary"
                    >
                      Baca artikel
                      <ArrowRight size={16} />
                    </Link>
                  </article>
                ))}
              </section>
            ) : (
              <div className="rounded-[24px] border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                Artikel di kategori ini akan segera hadir. Sementara itu, jelajahi kategori lain.
              </div>
            )}

            <section className="mt-10 rounded-[24px] border border-border bg-surface p-6">
              <div className="flex flex-wrap gap-3">
                {otherCategories.slice(0, 6).map((item) => (
                  <Link
                    key={item.slug}
                    to={blogCategoryUrl(item.slug)}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground transition duration-150 hover:bg-surface-2"
                  >
                    {item.emoji} {item.title}
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[22px] border border-border bg-white p-6 shadow-soft">
              <div className="eyebrow">Kategori lain</div>
              <ul className="mt-4 space-y-1">
                {otherCategories.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={blogCategoryUrl(item.slug)}
                      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-2"
                    >
                      <span className="truncate">
                        {item.emoji} {item.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {categoryCounts[item.slug] ?? 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[22px] border border-border bg-white p-6 shadow-soft">
              <div className="eyebrow">Terpopuler</div>
              <ul className="mt-4 space-y-3">
                {popular.map((post) => (
                  <li key={post.slug}>
                    <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block">
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {getCategoryLabel(post)}
                      </div>
                      <div className="mt-1 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                        {post?.title}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <CompactNewsletter slug={category.slug} />
          </aside>
        </div>
      </div>
    </PublicPage>
  );
}
