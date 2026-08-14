import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarBlank, Clock } from "@phosphor-icons/react";

import { PublicPage } from "@/components/public-page";
import {
  blogPostUrl,
  formatBlogDate,
  getBlogPost,
  getRelatedBlogPosts,
  siteUrl,
} from "@/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) return {};
    return {
      meta: [
        { title: `${post.title} — OffStories Blog` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: blogPostUrl(post.slug) },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
      ],
      links: [{ rel: "canonical", href: blogPostUrl(post.slug) }],
    };
  },
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const relatedPosts = getRelatedBlogPosts(post).slice(0, 2);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.title,
        item: blogPostUrl(post.slug),
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: blogPostUrl(post.slug),
    author: {
      "@type": "Organization",
      name: "OffStories",
    },
    publisher: {
      "@type": "Organization",
      name: "OffStories",
      url: siteUrl,
    },
    keywords: post.keywords.join(", "),
  };

  return (
    <PublicPage>
      <article className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to blog
        </Link>

        <header className="mt-6 border-b border-border pb-8">
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
          <h1 className="serif mt-5 text-4xl text-balance text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {post.excerpt}
          </p>
        </header>

        <div className="mt-8 space-y-8">
          <p className="text-base leading-relaxed text-foreground/85">{post.intro}</p>

          {post.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-[24px] border border-border bg-white p-6 shadow-soft"
            >
              <h2 className="serif text-2xl text-foreground">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/80">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.ordered?.length ? (
                <ol className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/80">
                  {section.ordered.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-medium text-foreground">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}

          <section className="rounded-[24px] border border-border bg-surface p-6">
            <h2 className="serif text-2xl text-foreground">FAQ</h2>
            <div className="mt-5 space-y-4">
              {post.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-[18px] border border-border bg-background p-5"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground focus-visible:outline-none">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-border bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="eyebrow">Related reading</div>
                <h2 className="serif mt-2 text-2xl text-foreground">
                  Artikel lain yang saling melengkapi.
                </h2>
              </div>
              <Link
                to="/auth"
                className="rounded-[14px] border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              >
                Open workspace
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedPosts.length ? (
                relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    to={`/blog/${related.slug}`}
                    className="rounded-[20px] border border-border bg-surface p-5 transition duration-150 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {related.category}
                    </div>
                    <h3 className="serif mt-3 text-xl text-balance text-foreground">{related.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {related.excerpt}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[20px] border border-border bg-surface p-5 text-sm text-muted-foreground">
                  More articles are coming soon.
                </div>
              )}
            </div>
          </section>
        </div>

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </article>
    </PublicPage>
  );
}
