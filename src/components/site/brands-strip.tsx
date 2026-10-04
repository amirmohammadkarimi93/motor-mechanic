import Link from "next/link";
import { Wrench, ChevronLeft } from "lucide-react";
import { SectionHeading } from "./section-heading";

export interface BrandItem {
  id: string;
  title: string;
  slug: string;
  brand?: string | null;
  city?: string | null;
}

interface BrandsStripProps {
  categories: BrandItem[];
}

export function BrandsStrip({ categories }: BrandsStripProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <SectionHeading
        eyebrow="برندهای تحت پوشش"
        title="تعمیر تخصصی تمام برندهای موتور سیکلت"
        description="ما در تعمیر انواع برندهای داخلی و خارجی موتور سیکلت تخصص و تجربه داریم."
        align="center"
        className="mb-8"
      />

      <div className="flex flex-wrap justify-center gap-2.5 md:gap-3 max-w-4xl mx-auto">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/services/${c.slug}`}
            className="group inline-flex items-center gap-2 rounded-full bg-card border border-border hover:border-brand-400 hover:bg-brand-50 shadow-sm hover:shadow-md transition-all px-4 py-2 text-sm font-medium text-foreground hover:text-brand-700"
          >
            <Wrench className="w-4 h-4 text-brand-500 group-hover:text-brand-700 transition-colors" />
            <span className="font-display font-bold">{c.title}</span>
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-700 group-hover:-translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto text-pretty">
        تعمیر موتور سیکلت گلکسی، بنلی، کراس، آپریلیا، هوندا، یاماها، سوزوکی و
        سایر برندهای داخلی و خارجی در شهر مشهد با گارانتی معتبر و قطعات اصلی.
      </p>
    </section>
  );
}
