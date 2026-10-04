import { MapPin } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

const SERVICE_AREAS: string[] = [
  "وکیل‌آباد",
  "احمدآباد",
  "سجاد",
  "فرامرز عباسی",
  "هاشمیه",
  "پیروزی",
  "فردوسی",
  "ابوذر",
  "امامیه",
  "ملک‌آباد",
  "گلشهری",
  "دامنگ",
  "آزادی",
  "شهدا",
  "بعثت",
  "کوحسنگ",
  "کوهسنگی",
  "نوغان",
  "قیام",
  "رامتین",
];

interface ServiceAreaProps {
  className?: string;
}

export function ServiceArea({ className }: ServiceAreaProps) {
  return (
    <section className={cn("container mx-auto px-4 py-14 md:py-20", className)}>
      <SectionHeading
        eyebrow="مناطق تحت پوشش"
        title="تعمیر موتور سیکلت در مشهد و حومه"
        description="به همه مناطق مشهد بزرگ خدمات تعمیر موتور سیکلت ارائه می‌دهیم."
        align="center"
        className="mb-8"
      />

      <div className="max-w-4xl mx-auto">
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3">
          {SERVICE_AREAS.map((area, i) => (
            <li
              key={i}
              className="group flex items-center gap-2 rounded-lg bg-card border border-border hover:border-brand-300 hover:bg-brand-50 transition-colors px-3.5 py-2.5"
            >
              <MapPin className="w-4 h-4 shrink-0 text-brand-500 group-hover:text-brand-700 group-hover:scale-110 transition-all" />
              <span className="text-sm font-medium text-foreground group-hover:text-brand-700 transition-colors truncate">
                {area}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          اگر منطقه شما در لیست نیست، با ما تماس بگیرید — احتمالا به شما هم خدمت
          ارائه می‌دهیم.
        </p>
      </div>
    </section>
  );
}
