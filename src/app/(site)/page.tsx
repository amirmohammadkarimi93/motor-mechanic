import Link from "next/link";
import { db } from "@/lib/db";
import { buildMetadata, getSettings } from "@/lib/seo";
import { HeroSection } from "@/components/site/hero-section";
import { FeaturesStrip } from "@/components/site/features-strip";
import { StatsBand } from "@/components/site/stats-band";
import { ServiceCard } from "@/components/site/service-card";
import { CategoryCard } from "@/components/site/category-card";
import { ArticleCard } from "@/components/site/article-card";
import { CtaBand } from "@/components/site/cta-band";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  ChevronLeft,
} from "lucide-react";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: settings?.metaTitle,
    description: settings?.metaDescription,
    keywords: settings?.metaKeywords,
    slug: "",
  });
}

function parseJSON<T>(str?: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

async function getHomepageData() {
  const [settings, services, featuredCategories, allCategories, latestArticles] =
    await Promise.all([
      db.siteSettings.findUnique({ where: { id: "singleton" } }),
      db.service.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        take: 6,
      }),
      db.category.findMany({
        where: { published: true, featured: true },
        orderBy: { order: "asc" },
        take: 6,
        include: { _count: { select: { articles: true } } },
      }),
      db.category.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          brand: true,
          city: true,
          shortDescription: true,
        },
      }),
      db.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: { category: { select: { title: true, slug: true } } },
      }),
    ]);
  return {
    settings,
    services,
    featuredCategories,
    allCategories,
    latestArticles,
  };
}

export default async function HomePage() {
  const data = await getHomepageData();
  const { settings } = data;
  const features = parseJSON<{ icon: string; title: string; desc: string }[]>(
    settings?.features
  );
  const stats = parseJSON<{ label: string; value: string; suffix?: string }[]>(
    settings?.stats
  );

  const aboutFirstParagraph =
    settings?.aboutContent?.split("\n\n").filter(Boolean)[0] || "";

  return (
    <>
      <HeroSection
        badge={settings?.heroBadge}
        title={settings?.heroTitle}
        subtitle={settings?.heroSubtitle}
        heroImage={settings?.heroImage}
        ctaText={settings?.heroCtaText}
        phone={settings?.phone}
        stats={stats ?? undefined}
      />

      {features && features.length > 0 && <FeaturesStrip features={features} />}

      {/* Stats band */}
      {stats && stats.length > 0 && <StatsBand stats={stats} />}

      {/* Services grid */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <SectionHeading
          eyebrow="خدمات ما"
          title="خدمات تخصصی تعمیر موتور سیکلت"
          description="مجموعه‌ای کامل از خدمات تعمیراتی و سرویس برای موتور سیکلت شما با بهترین کیفیت."
        />
        <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {data.services.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      {data.featuredCategories.length > 0 && (
        <section className="bg-muted/40 border-y border-border py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <SectionHeading
                eyebrow="برندهای محبوب"
                title="تعمیر تخصصی موتور سیکلت برندهای مختلف"
                description="ما در تعمیر انواع برندهای موتور سیکلت تخصص و تجربه داریم."
              />
              <Button
                asChild
                variant="ghost"
                className="self-start md:self-end text-brand-700 hover:text-brand-800 hover:bg-brand-50"
              >
                <Link href="/services">
                  مشاهده همه دسته‌بندی‌ها
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {data.featuredCategories.map((c, i) => (
                <CategoryCard key={c.id} category={c} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Categories preview */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <SectionHeading
          eyebrow="همه دسته‌بندی‌ها"
          title="تمام تخصص‌های ما در یک نگاه"
          description="روی هر مورد کلیک کنید تا جزئیات کامل خدمات را مشاهده کنید."
        />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {data.allCategories.map((c) => (
            <Link
              key={c.id}
              href={`/services/${c.slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-brand-300 transition-all p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 group-hover:bg-brand-500 flex items-center justify-center transition-colors">
                  <Wrench className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm md:text-base text-foreground group-hover:text-brand-700 transition-colors truncate">
                    {c.title}
                  </h3>
                  {c.shortDescription && (
                    <p className="text-xs text-muted-foreground truncate">
                      {c.shortDescription}
                    </p>
                  )}
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-brand-600 group-hover:-translate-x-1 transition-transform shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* About preview */}
      {settings?.aboutContent && (
        <section className="bg-ink text-white py-14 md:py-20 relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-carbon opacity-20" />
          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <SectionHeading
                  eyebrow="درباره ما"
                  title={settings?.aboutTitle || "درباره موتور مکانیک"}
                  dark
                />
                <p className="mt-4 text-white/75 leading-relaxed text-pretty">
                  {aboutFirstParagraph}
                </p>
                <Button
                  asChild
                  className="mt-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl"
                >
                  <Link href="/about">
                    ادامه مطلب
                    <ChevronLeft className="w-4 h-4 mr-2" />
                  </Link>
                </Button>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-xl">
                  {settings?.aboutImage ? (
                    <img
                      src={settings.aboutImage}
                      alt={settings?.aboutTitle || "درباره موتور مکانیک"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 to-brand-700/30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {data.latestArticles.length > 0 && (
        <section className="container mx-auto px-4 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <SectionHeading
              eyebrow="مقالات و راهنماها"
              title="جدیدترین مقالات موتور سیکلت"
              description="راهنماهای کاربردی برای نگهداری و تعمیر موتور سیکلت."
            />
            <Button
              asChild
              variant="ghost"
              className="self-start md:self-end text-brand-700 hover:text-brand-800 hover:bg-brand-50"
            >
              <Link href="/articles">
                همه مقالات
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {data.latestArticles.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
        </section>
      )}

      <CtaBand phone={settings?.phone} />
    </>
  );
}
