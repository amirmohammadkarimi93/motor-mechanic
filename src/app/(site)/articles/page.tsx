import Link from "next/link";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { SiteBreadcrumb } from "@/components/site/breadcrumb";
import { ArticleCard } from "@/components/site/article-card";
import { ArticlesFilter } from "@/components/site/articles-filter";
import { CtaBand } from "@/components/site/cta-band";
import { Button } from "@/components/ui/button";
import { ArticlesPagination } from "@/components/site/articles-pagination";
import { Newspaper } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata() {
  return buildMetadata({
    title: "مقالات و راهنماهای موتور سیکلت",
    description:
      "مقالات و راهنماهای کاربردی برای نگهداری، تعمیر و سرویس موتور سیکلت. جدیدترین مطالب آموزشی موتور مکانیک.",
    slug: "articles",
  });
}

const PER_PAGE = 9;

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}

async function getArticlesData(searchParams: {
  page?: string;
  category?: string;
  tag?: string;
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const where: {
    published: boolean;
    categoryId?: string;
    tags?: { contains: string };
  } = { published: true };

  if (searchParams.category) {
    where.categoryId = searchParams.category;
  }
  if (searchParams.tag) {
    where.tags = { contains: searchParams.tag };
  }

  const [articles, total, categories, popularTags] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: { select: { title: true, slug: true } } },
    }),
    db.article.count({ where }),
    db.category.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { id: true, title: true, slug: true },
    }),
    db.article.findMany({
      where: { published: true, tags: { not: null } },
      select: { tags: true },
      take: 100,
    }),
  ]);

  // Build tag frequency
  const tagCount = new Map<string, number>();
  popularTags.forEach((a) => {
    if (!a.tags) return;
    a.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tagCount.set(t, (tagCount.get(t) ?? 0) + 1));
  });
  const tags = Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([t]) => t);

  return { articles, total, categories, tags, page };
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { articles, total, categories, tags, page } = await getArticlesData(params);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const buildPageUrl = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { ...params, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    const qs = sp.toString();
    return qs ? `/articles?${qs}` : "/articles";
  };

  return (
    <>
      <SiteBreadcrumb
        items={[{ label: "خانه", href: "/" }, { label: "مقالات" }]}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white py-14 md:py-20">
        <div className="absolute inset-0 bg-carbon opacity-25" />
        <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />
        <div className="container mx-auto px-4 relative">
          <span className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/40 rounded-full px-4 py-1.5 mb-4 text-xs font-bold text-brand-300">
            <Newspaper className="w-3.5 h-3.5" />
            مقالات و راهنماها
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
            مقالات و راهنماهای موتور سیکلت
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-white/75 leading-relaxed text-pretty">
            مجموعه‌ای از مقالات آموزشی و راهنماهای کاربردی برای نگهداری و تعمیر
            موتور سیکلت شما.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20">
        {/* Filter bar */}
        <div className="mb-8">
          <ArticlesFilter categories={categories} tags={tags} />
        </div>

        {/* Articles grid */}
        {articles.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-12 text-center">
            <p className="text-muted-foreground">
              مقاله‌ای یافت نشد. فیلتر را تغییر دهید یا همه مقالات را مشاهده کنید.
            </p>
            <Button asChild className="mt-4 bg-brand-600 hover:bg-brand-700 text-white">
              <Link href="/articles">نمایش همه مقالات</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {total} مقاله یافت شد
                {totalPages > 1 && ` · صفحه ${page} از ${totalPages}`}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {articles.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-10">
                <ArticlesPagination
                  currentPage={page}
                  totalPages={totalPages}
                  buildPageUrl={buildPageUrl}
                />
              </div>
            )}
          </>
        )}
      </section>

      <CtaBand />
    </>
  );
}
