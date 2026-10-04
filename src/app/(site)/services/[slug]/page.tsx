import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  buildMetadata,
  breadcrumbStructuredData,
  serviceStructuredData,
} from "@/lib/seo";
import { SiteBreadcrumb } from "@/components/site/breadcrumb";
import { ServiceCard } from "@/components/site/service-card";
import { ArticleCard } from "@/components/site/article-card";
import { CtaBand } from "@/components/site/cta-band";
import { Markdown } from "@/components/site/markdown";
import { SectionHeading } from "@/components/site/section-heading";
import { DynamicIcon } from "@/components/site/icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, CheckCircle2, Wrench, ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const category = await db.category.findUnique({ where: { slug } });
  if (!category || !category.published) {
    return buildMetadata({
      title: "صفحه یافت نشد",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: category.metaTitle || category.title,
    description:
      category.metaDescription || category.shortDescription || undefined,
    keywords: category.metaKeywords,
    canonicalUrl: category.canonicalUrl,
    ogImage: category.ogImage || category.image,
    slug: `services/${slug}`,
  });
}

async function getCategoryData(slug: string) {
  const category = await db.category.findUnique({ where: { slug } });
  if (!category || !category.published) return null;
  const [services, articles] = await Promise.all([
    db.service.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    db.article.findMany({
      where: { published: true, categoryId: category.id },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: { select: { title: true, slug: true } } },
    }),
  ]);
  return { category, services, articles };
}

function buildFAQ(category: {
  title: string;
  brand?: string | null;
  city?: string | null;
}) {
  const faqs: { q: string; a: string }[] = [];
  const brand = category.brand || "موتور سیکلت";
  const city = category.city || "مشهد";
  faqs.push({
    q: `هزینه ${category.title} چقدر است؟`,
    a: `هزینه ${category.title} بسته به نوع خرابی و قطعات مورد نیاز متفاوت است. برای دریافت قیمت دقیق با کارشناسان ما تماس بگیرید.`,
  });
  faqs.push({
    q: `آیا ${category.title} شامل گارانتی است؟`,
    a: `بله، تمام خدمات تعمیراتی ما شامل گارانتی معتبر هستند تا با خیال راحت سوار شوید.`,
  });
  faqs.push({
    q: `مدت زمان انجام ${category.title} چقدر است؟`,
    a: `مدت زمان بسته به میزان خرابی متفاوت است، اما تلاش ما بر ارائه سریع خدمات با حفظ کیفیت است. برای دریافت نوبت تماس بگیرید.`,
  });
  faqs.push({
    q: `آیا از قطعات اصل برای ${brand} استفاده می‌کنید؟`,
    a: `بله، ما برای ${category.title} از قطعات اصلی و درجه یک استفاده می‌کنیم تا دوام و کیفیت تعمیرات تضمین شود.`,
  });
  faqs.push({
    q: `چگونه برای ${category.title} نوبت بگیرم؟`,
    a: `برای دریافت نوبت کافیست با شماره تماس ما تماس بگیرید یا از طریق فرم تماس، درخواست خود را ثبت کنید.`,
  });
  return faqs;
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const data = await getCategoryData(slug);
  if (!data) notFound();
  const { category, services, articles } = data;

  const breadcrumbItems = [
    { label: "خانه", href: "/" },
    { label: "دسته‌بندی‌ها", href: "/services" },
    { label: category.title },
  ];

  const faqs = buildFAQ(category);

  // JSON-LD: Service + BreadcrumbList + FAQ
  const jsonLdService = serviceStructuredData({
    title: category.title,
    description: category.shortDescription,
  });
  const jsonLdBreadcrumb = breadcrumbStructuredData(breadcrumbItems.map((c) => ({
    name: c.label,
    url: c.href ? c.href : `/services/${slug}`,
  })));
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <SiteBreadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white py-14 md:py-20">
        {category.image && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={category.image}
              alt={category.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/80 to-ink/40" />
          </div>
        )}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {category.brand && (
                <Badge className="bg-brand-600 text-white border-0">
                  {category.brand}
                </Badge>
              )}
              {category.city && (
                <span className="inline-flex items-center gap-1 text-xs md:text-sm text-white/80">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  {category.city}
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
              {category.title}
            </h1>
            {category.shortDescription && (
              <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed text-pretty">
                {category.shortDescription}
              </p>
            )}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-600/40"
              >
                <a href="tel:0513333333">
                  <Phone className="w-5 h-5 ml-2" />
                  برای نوبت تماس بگیرید
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl"
              >
                <Link href="/contact">
                  ارسال درخواست آنلاین
                  <ChevronLeft className="w-4 h-4 mr-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content body */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          <div className="lg:col-span-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="hidden md:block w-14 h-14 rounded-xl bg-brand-50 border border-brand-200 flex-shrink-0 flex items-center justify-center">
                <DynamicIcon
                  name={category.icon || "bike"}
                  className="w-7 h-7 text-brand-600"
                  strokeWidth={2.2}
                />
              </div>
              <SectionHeading
                eyebrow="توضیحات کامل"
                title={category.title}
              />
            </div>
            {category.content ? (
              <Markdown content={category.content} />
            ) : (
              <p className="text-muted-foreground">
                برای دریافت اطلاعات بیشتر با ما تماس بگیرید.
              </p>
            )}

            {/* Quick highlights */}
            <div className="mt-10 rounded-xl bg-brand-50 border border-brand-200 p-5 md:p-6">
              <h3 className="font-display font-bold text-base md:text-lg text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                چرا برای {category.title} ما را انتخاب کنید؟
              </h3>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "تیم متخصص و دوره‌دیده",
                  "قطعات اصلی و باکیفیت",
                  "گارانتی معتبر بر تمام خدمات",
                  "خدمت سریع و تحویل به‌موقع",
                  "قیمت منصفانه و رقابتی",
                  "مشاوره تخصصی رایگان",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div className="mt-10">
              <SectionHeading
                eyebrow="سوالات متداول"
                title={`سوالات متداول ${category.title}`}
              />
              <Accordion
                type="single"
                collapsible
                className="mt-6"
                defaultValue="faq-0"
              >
                {faqs.map((f, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-b border-border"
                  >
                    <AccordionTrigger className="text-right py-4 hover:no-underline hover:text-brand-700 text-sm md:text-base font-bold text-foreground">
                      <span className="flex items-start gap-2 text-right">
                        <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500" />
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-4">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* CTA card */}
              <div className="rounded-xl bg-ink text-white p-6 relative isolate overflow-hidden">
                <div className="absolute inset-0 bg-carbon opacity-25" />
                <div className="absolute top-0 inset-x-0 h-1 bg-hazard opacity-90" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold">
                    نوبت تعمیر {category.brand || "موتور سیکلت"} خود را رزرو کنید
                  </h3>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    برای دریافت نوبت و مشاوره رایگان با کارشناسان ما تماس بگیرید.
                  </p>
                  <Button
                    asChild
                    className="mt-5 w-full bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    <a href="tel:0513333333">
                      <Phone className="w-4 h-4 ml-2" />
                      تماس فوری
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-2 w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link href="/contact">فرم درخواست آنلاین</Link>
                  </Button>
                </div>
              </div>

              {/* Quick info */}
              <div className="rounded-xl bg-card border border-border shadow-sm p-5">
                <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  اطلاعات تماس
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                    <a href="tel:0513333333" dir="ltr" className="font-medium hover:text-brand-700">
                      051-3333333
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      مشهد، بلوار وکیل‌آباد
                    </span>
                  </li>
                </ul>
              </div>

              {/* Articles related */}
              {articles.length > 0 && (
                <div className="rounded-xl bg-card border border-border shadow-sm p-5">
                  <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    مقالات مرتبط
                  </h3>
                  <div className="space-y-3">
                    {articles.map((a, i) => (
                      <ArticleCard key={a.id} article={a} index={i} variant="list" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Services offered */}
      {services.length > 0 && (
        <section className="bg-muted/40 border-y border-border py-14 md:py-20">
          <div className="container mx-auto px-4">
            <SectionHeading
              eyebrow="خدمات ارائه‌شده"
              title="خدمات تعمیراتی که ارائه می‌دهیم"
              description="مجموعه‌ای کامل از خدمات تعمیراتی برای موتور سیکلت شما با بهترین کیفیت."
            />
            <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {services.map((s, i) => (
                <ServiceCard key={s.id} service={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles from same category */}
      {articles.length > 0 && (
        <section className="container mx-auto px-4 py-14 md:py-20">
          <SectionHeading
            eyebrow="مقالات مرتبط"
            title={`مقالات ${category.title}`}
          />
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {articles.map((a, i) => (
              <ArticleCard key={a.id} article={a} index={i} />
            ))}
          </div>
        </section>
      )}

      <CtaBand
        title={`برای نوبت ${category.title} تماس بگیرید`}
        subtitle="کارشناسان ما آماده پاسخ به سوالات شما و ارائه مشاوره تخصصی هستند."
        phone="0513333333"
      />
    </>
  );
}
