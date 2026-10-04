import Link from "next/link";
import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { SiteBreadcrumb } from "@/components/site/breadcrumb";
import { CategoryCard } from "@/components/site/category-card";
import { ServicesFilter } from "@/components/site/services-filter";
import { CtaBand } from "@/components/site/cta-band";
import { Button } from "@/components/ui/button";
import { Wrench, MapPin, ChevronLeft } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata() {
  return buildMetadata({
    title: "خدمات تعمیر موتور سیکلت در مشهد",
    description:
      "خدمات تخصصی تعمیر موتور سیکلت در مشهد برای برندهای مختلف. تعمیر موتورگلکسی، بنلی، کراس، آپریلیا و هوندا با گارانتی و قطعات اصلی.",
    slug: "services",
  });
}

interface PageProps {
  searchParams: Promise<{ brand?: string; city?: string }>;
}

async function getServicesData(searchParams: { brand?: string; city?: string }) {
  const where: { published: boolean; brand?: string; city?: string } = {
    published: true,
  };
  if (searchParams.brand) where.brand = searchParams.brand;
  if (searchParams.city) where.city = searchParams.city;

  const [categories, brands, cities] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: { order: "asc" },
    }),
    db.category.findMany({
      where: { published: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    }),
    db.category.findMany({
      where: { published: true, city: { not: null } },
      select: { city: true },
      distinct: ["city"],
    }),
  ]);

  return {
    categories,
    brands: brands.map((b) => b.brand).filter(Boolean) as string[],
    cities: cities.map((c) => c.city).filter(Boolean) as string[],
  };
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { categories, brands, cities } = await getServicesData(params);

  return (
    <>
      <SiteBreadcrumb
        items={[{ label: "خانه", href: "/" }, { label: "خدمات" }]}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white py-14 md:py-20">
        <div className="absolute inset-0 bg-carbon opacity-25" />
        <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />
        <div className="container mx-auto px-4 relative">
          <span className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/40 rounded-full px-4 py-1.5 mb-4 text-xs font-bold text-brand-300">
            <Wrench className="w-3.5 h-3.5" />
            خدمات تخصصی
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
            خدمات تعمیر موتور سیکلت در مشهد
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-white/75 leading-relaxed text-pretty">
            مرکز تخصصی موتور مکانیک، خدمات تعمیر موتور سیکلت برای برندهای مختلف را
            با گارانتی و قطعات اصلی ارائه می‌دهد. برند موتور خود را انتخاب کنید.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20">
        {/* Filter */}
        {(brands.length > 0 || cities.length > 0) && (
          <div className="mb-8">
            <ServicesFilter brands={brands} cities={cities} />
          </div>
        )}

        {/* Grid */}
        {categories.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-12 text-center">
            <p className="text-muted-foreground">
              دسته‌بندی‌ای با این فیلتر یافت نشد.
            </p>
            <Button asChild className="mt-4 bg-brand-600 hover:bg-brand-700 text-white">
              <Link href="/services">نمایش همه دسته‌بندی‌ها</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {categories.length.toLocaleString("fa-IR")} دسته‌بندی فعال
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {categories.map((c, i) => (
                <CategoryCard key={c.id} category={c} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Brands list */}
        {brands.length > 0 && (
          <div className="mt-12 pt-10 border-t border-border">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              برندهای موتور سیکلتی که تعمیر می‌کنیم
            </h2>
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <Link
                  key={b}
                  href={`/services?brand=${encodeURIComponent(b)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors text-sm font-medium"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  تعمیر موتور {b}
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <CtaBand />
    </>
  );
}
