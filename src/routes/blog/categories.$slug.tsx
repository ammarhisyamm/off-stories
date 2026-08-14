import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarBlank, Clock } from "@phosphor-icons/react";

import { PublicPage } from "@/components/public-page";
import {
  blogCategories,
  blogCategoryUrl,
  blogPosts,
  formatBlogDate,
  getBlogPostsByCategory,
  siteUrl,
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
  loader: ({ params }) => {
    const category = blogCategories.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    return { category };
  },
  component: BlogCategoryPage,
});

function BlogCategoryPage() {
  const { category } = Route.useLoaderData();
  const posts = getBlogPostsByCategory(category.slug);
  const topCategories = blogCategories.slice(0, 5);
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
    <PublicPage>
      <div className="space-y-10">
        <section className="max-w-3xl border-b border-border pb-8">
          <Link
            to="/blog/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            All categories
          </Link>
          <div className="eyebrow mt-6 mb-4">Category</div>
          <h1 className="serif text-4xl text-balance text-foreground sm:text-5xl">{category.title}</h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {category.intro}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-[24px] border border-border bg-white p-6 shadow-soft transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-foreground">
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlank size={14} />
                  {formatBlogDate(post.updatedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.readTime}
                </span>
              </div>
              <h2 className="serif mt-4 text-2xl text-balance text-foreground">{post.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary"
              >
                Read article
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </section>

        <section className="rounded-[24px] border border-border bg-surface p-6">
          <div className="flex flex-wrap gap-3">
            {topCategories.map((item) => (
              <Link
                key={item.slug}
                to={blogCategoryUrl(item.slug)}
                className={`rounded-full border px-4 py-2 text-sm transition duration-150 ${
                  item.slug === category.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-surface-2"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      </div>
    </PublicPage>
  );
}
