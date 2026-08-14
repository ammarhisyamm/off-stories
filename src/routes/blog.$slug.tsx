import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  Check,
  Clock,
  Copy,
  ThumbsDown,
  ThumbsUp,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { PublicPage } from "@/components/public-page";
import {
  blogPostUrl,
  formatBlogDate,
  getBlogPost,
  getBlogPostsByCategory,
  getCategoryLabel,
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

function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.min(1, window.scrollY / total) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}

function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url?.includes("http") ? url : `${siteUrl}${url || "/blog"}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Bagikan
      </span>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition duration-150 hover:text-foreground"
        aria-label="Bagikan ke WhatsApp"
      >
        <WhatsappLogo size={16} />
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-medium text-muted-foreground transition duration-150 hover:text-foreground"
        aria-label="Salin link artikel"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Tersalin" : "Salin link"}
      </button>
    </div>
  );
}

function HelpfulFeedback() {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  return (
    <div className="rounded-[24px] border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-semibold text-foreground">Apakah artikel ini membantu?</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnswer("yes")}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-150 ${
              answer === "yes"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-surface-2"
            }`}
          >
            <ThumbsUp size={15} weight="bold" />
            Ya
          </button>
          <button
            type="button"
            onClick={() => setAnswer("no")}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-150 ${
              answer === "no"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-surface-2"
            }`}
          >
            <ThumbsDown size={15} weight="bold" />
            Tidak
          </button>
        </div>
      </div>
      {answer && (
        <p className="mt-4 text-sm text-muted-foreground">
          Terima kasih atas masukannya! Masukan ini membantu kami menulis artikel yang lebih
          berguna.
        </p>
      )}
    </div>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const relatedPosts = getRelatedBlogPosts(post, 3);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const sizeClass = {
    sm: "text-[17px]",
    md: "text-lg",
    lg: "text-xl",
  }[size];

  const toc = useMemo(
    () =>
      post.sections.map((section) => ({
        id: slugifyHeading(section.heading),
        heading: section.heading,
      })),
    [post],
  );

  const postIndex = getBlogPostsByCategory(post.categoryId).findIndex(
    (item) => item.slug === post.slug,
  );
  const categoryPosts = getBlogPostsByCategory(post.categoryId);
  const previous = postIndex > 0 ? categoryPosts[postIndex - 1] : undefined;
  const next =
    postIndex >= 0 && postIndex < categoryPosts.length - 1
      ? categoryPosts[postIndex + 1]
      : undefined;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${siteUrl}/blog` },
      {
        "@type": "ListItem",
        position: 2,
        name: getCategoryLabel(post),
        item: `${siteUrl}/blog/categories/${post.categoryId}`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: blogPostUrl(post.slug) },
    ],
  };

  const author = post.author;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: blogPostUrl(post.slug),
    author: { "@type": "Person", name: author.name, description: author.role },
    publisher: { "@type": "Organization", name: "OffStories", url: siteUrl },
    keywords: post.keywords.join(", "),
  };

  return (
    <PublicPage>
      <ReadingProgress />
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

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <nav className="rounded-[22px] border border-border bg-surface p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Isi artikel
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {toc.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      {index + 1}. {item.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ShareButtons url={blogPostUrl(post.slug)} title={post.title} />
          </div>
        </aside>

        <article className="mx-auto max-w-3xl min-w-0">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Kembali ke blog
          </Link>

          <header className="mt-6 border-b border-border pb-8">
            <Link
              to="/blog/categories/$slug"
              params={{ slug: post.categoryId }}
              className="inline-flex rounded-full border border-border bg-surface px-3 py-1 font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              {getCategoryLabel(post)}
            </Link>
            <h1 className="serif mt-5 text-4xl text-balance text-foreground sm:text-5xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarBlank size={14} />
                {formatBlogDate(post.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {post.readingTime}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {author.name.replace("Tim ", "").charAt(0)}
                </span>
                {author.name}
              </span>
            </div>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {post.excerpt}
            </p>
            <div className="mt-5 flex items-center gap-2 lg:hidden">
              <ShareButtons url={blogPostUrl(post.slug)} title={post.title} />
            </div>
          </header>

          <div className="mt-8">
            <div className={`${sizeClass} space-y-8 leading-relaxed text-foreground/85`}>
              <p>{post.intro}</p>

              {post.sections.map((section, index) => {
                const id = toc[index]?.id;
                return (
                  <section key={section.heading} id={id} className="scroll-mt-16">
                    <h2 className="serif text-3xl text-foreground">{section.heading}</h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-5 space-y-3 text-foreground/80">
                        {section.bullets.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {section.ordered?.length ? (
                      <ol className="mt-5 space-y-3 text-foreground/80">
                        {section.ordered.map((item, orderIndex) => (
                          <li key={item} className="flex gap-3">
                            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-medium text-foreground">
                              {orderIndex + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    ) : null}

                    {index === 0 && (
                      <div className="mt-6 rounded-2xl border-l-4 border-primary bg-surface p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          💡 Tips penting
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                          Catat setiap poin di satu tempat yang sama sejak awal — budget, kontak
                          vendor, dan tanggal penting.
                        </p>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <div className="mt-8 flex gap-2">
              {(["sm", "md", "lg"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition duration-150 ${
                    size === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option === "sm" ? "A-" : option === "lg" ? "A+" : "A"}
                </button>
              ))}
              <span className="self-center text-xs text-muted-foreground">Ukuran teks</span>
            </div>

            <section className="mt-8">
              <FAQSection />
            </section>

            <section className="mt-8">
              <HelpfulFeedback />
            </section>

            <section className="mt-8 rounded-[24px] border border-border bg-surface p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="eyebrow">Baca Juga</div>
                  <h2 className="serif mt-2 text-2xl text-foreground">Artikel terkait.</h2>
                </div>
                <Link
                  to="/auth"
                  className="rounded-[14px] border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                >
                  Buka workspace
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {relatedPosts.length ? (
                  relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      to="/blog/$slug"
                      params={{ slug: related.slug }}
                      className="rounded-[20px] border border-border bg-background p-5 transition duration-150 hover:-translate-y-0.5 hover:bg-white"
                    >
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {getCategoryLabel(related)}
                      </div>
                      <h3 className="serif mt-3 text-lg text-balance text-foreground">
                        {related.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {related.excerpt}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-border bg-background p-5 text-sm text-muted-foreground">
                    Artikel lain sedang segera hadir.
                  </div>
                )}
              </div>
            </section>

            {(previous || next) && (
              <nav className="mt-8 grid gap-4 sm:grid-cols-2">
                {previous ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: previous.slug }}
                    className="group rounded-[20px] border border-border bg-white p-5 transition duration-150 hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      <ArrowLeft size={14} />
                      Artikel sebelumnya
                    </div>
                    <div className="serif mt-2 text-base text-foreground group-hover:text-primary">
                      {previous.title}
                    </div>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: next.slug }}
                    className="group rounded-[20px] border border-border bg-white p-5 text-right transition duration-150 hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="flex items-center justify-end gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Artikel berikutnya
                      <ArrowRight size={14} />
                    </div>
                    <div className="serif mt-2 text-base text-foreground group-hover:text-primary">
                      {next.title}
                    </div>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </nav>
            )}

            <section className="mt-8 overflow-hidden rounded-[32px] bg-primary p-8 text-primary-foreground shadow-soft sm:p-10">
              <h2 className="serif text-3xl text-balance">
                Mau planning wedding lebih terorganisir?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed opacity-90">
                Coba OffStories dashboard gratis — kelola budget, checklist, dan vendor dalam satu
                tempat untuk hari yang lebih tenang.
              </p>
              <Link
                to="/auth"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-background px-7 py-3.5 text-sm font-semibold text-primary transition duration-150 hover:opacity-90 active:scale-[0.98]"
              >
                Coba Gratis Sekarang
                <ArrowRight weight="bold" size={16} />
              </Link>
            </section>
          </div>
        </article>
      </div>

      <script type="application/ld+json" />
    </PublicPage>
  );
}

function FAQSection() {
  const { post } = Route.useLoaderData();
  return (
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
  );
}
