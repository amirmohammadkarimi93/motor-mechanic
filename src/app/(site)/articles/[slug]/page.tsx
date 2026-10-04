import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  buildMetadata,
  articleStructuredData,
  breadcrumbStructuredData,
  absoluteUrl,
} from "@/lib/seo";
import { SiteBreadcrumb } from "@/components/site/breadcrumb";
import { ArticleCard } from "@/components/site/article-card";
import { CtaBand } from "@/components/site/cta-band";
import { Markdown } from "@/components/site/markdown";
import { TableOfContents } from "@/components/site/table-of-contents";
import { ShareButtons } from "@/components/site/share-buttons";
import { ArticleViewTracker } from "@/components/site/article-view-tracker";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Eye, ChevronLeft, Tag, Calendar } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await db.article.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const article = await db.article.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!article || !article.published) {
    return buildMetadata({
      title: "مقاله یافت نشد",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || undefined,
    keywords: article.metaKeywords,
    canonicalUrl: article.canonicalUrl,
    ogImage: article.ogImage || article.coverImage,
    slug: `articles/${slug}`,
    type: "article",
    publishedTime: article.publishedAt || article.createdAt,
    modifiedTime: article.updatedAt,
    author: article.authorName,
  });
}

function formatDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

async function getArticleData(slug: string) {
  const [article, related] = await Promise.all([
    db.article.findUnique({
      where: { slug },
      include: { category: true },
    }),
    db.article.findMany({
      where: { published: true, slug: { not: slug } },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: { category: { select: { title: true, slug: true } } },
    }),
  ]);
  if (!article || !article.published) return null;
  return { article, related };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getArticleData(slug);
  if (!data) notFound();
  const { article, related } = data;

  // Filter related by same category if exists
  const sameCategory = related
    .filter((a) => article.categoryId && a.categoryId === article.categoryId)
    .slice(0, 3);
  const relatedArticles = sameCategory.length > 0 ? sameCategory : related.slice(0, 3);

  const breadcrumbItems = [
    { label: "خانه", href: "/" },
    { label: "مقالات", href: "/articles" },
    ...(article.category
      ? [{ label: article.category.title, href: `/services/${article.category.slug}` }]
      : []),
    { label: article.title },
  ];

  const jsonLdArticle = articleStructuredData(article);
  const jsonLdBreadcrumb = breadcrumbStructuredData(breadcrumbItems.map((c) => ({
    name: c.label,
    url: c.href ? c.href : `/articles/${slug}`,
  })));

  const tags = (article.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <ArticleViewTracker slug={article.slug} />

      <SiteBreadcrumb items={breadcrumbItems} />

      {/* Article Hero */}
      <article>
        <header className="relative isolate overflow-hidden bg-ink text-white py-12 md:py-16">
          {article.coverImage && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/60" />
            </div>
          )}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              {article.category && (
                <Link href={`/services/${article.category.slug}`}>
                  <Badge className="bg-brand-600 hover:bg-brand-700 text-white border-0 mb-4">
                    {article.category.title}
                  </Badge>
                </Link>
              )}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-balance">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mt-4 text-base md:text-lg text-white/75 leading-relaxed text-pretty">
                  {article.excerpt}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs md:text-sm text-white/70">
                {article.authorName && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-brand-400" />
                    {article.authorName}
                  </span>
                )}
                {article.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    {formatDate(article.publishedAt)}
                  </span>
                )}
                {article.readingTime ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-400" />
                    {article.readingTime} دقیقه مطالعه
                  </span>
                ) : null}
                {article.views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-brand-400" />
                    {article.views.toLocaleString("fa-IR")} بازدید
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            {/* Main article */}
            <div className="lg:col-span-8 order-1">
              {article.coverImage && (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border shadow-lg mb-8 -mt-20 md:-mt-24 hidden lg:block">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <Markdown content={article.content} />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    برچسب‌ها
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Link
                        key={t}
                        href={`/articles?tag=${encodeURIComponent(t)}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-muted hover:bg-brand-50 hover:text-brand-700 text-sm transition-colors"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  اشتراک‌گذاری
                </h3>
                <ShareButtons title={article.title} slug={article.slug} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 order-2">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="rounded-xl bg-card border border-border shadow-sm p-5">
                  <TableOfContents content={article.content} />
                </div>

                {/* Related articles */}
                {relatedArticles.length > 0 && (
                  <div className="rounded-xl bg-card border border-border shadow-sm p-5">
                    <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      مقالات مرتبط
                    </h3>
                    <div className="space-y-3">
                      {relatedArticles.map((a, i) => (
                        <ArticleCard key={a.id} article={a} index={i} variant="list" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick CTA */}
                <div className="rounded-xl bg-ink text-white p-5 relative isolate overflow-hidden">
                  <div className="absolute inset-0 bg-carbon opacity-25" />
                  <div className="relative">
                    <p className="font-display font-bold text-base">
                      نیاز به تعمیر دارید؟
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      با کارشناسان ما تماس بگیرید.
                    </p>
                    <Button
                      asChild
                      className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white"
                    >
                      <a href="tel:0513333333">تماس فوری</a>
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Related grid */}
      {relatedArticles.length > 0 && (
        <section className="bg-muted/40 border-y border-border py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <SectionHeading
                eyebrow="ادامه مطلب"
                title="مقالات مرتبط"
              />
              <Button
                asChild
                variant="ghost"
                className="text-brand-700 hover:text-brand-800 hover:bg-brand-50"
              >
                <Link href="/articles">
                  همه مقالات
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {relatedArticles.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
