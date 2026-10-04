"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { DynamicIcon } from "./icon";

interface TrustSignal {
  icon: string;
  title: string;
  desc: string;
}

const TRUST_SIGNALS: TrustSignal[] = [
  {
    icon: "badge-check",
    title: "گارانتی معتبر روی تمام تعمیرات",
    desc: "تمام خدمات و قطعات با گارانتی نوشته‌شده و قابل اعتماد ارائه می‌شوند.",
  },
  {
    icon: "shield-check",
    title: "قطعات اصلی و درجه یک",
    desc: "فقط از قطعات اصل و باکیفیت برند اصلی استفاده می‌کنیم.",
  },
  {
    icon: "users",
    title: "مکانیک‌های متخصص و دوره‌دیده",
    desc: "تیمی حرفه‌ای با سال‌ها تجربه و آموزش به‌روز در تعمیر موتور سیکلت.",
  },
  {
    icon: "dollar-sign",
    title: "قیمت منصفانه و شفاف",
    desc: "هزینه‌ها قبل از شروع کار اعلام می‌شود؛ بدون هزینه پنهان.",
  },
  {
    icon: "clock",
    title: "تعمیر سریع و تحویل به‌موقع",
    desc: "تعیین زمان دقیق تحویل و رعایت وقت مشتری در اولویت ماست.",
  },
  {
    icon: "award",
    title: "۱۵ سال سابقه و تجربه",
    desc: "بیش از یک دهه تجربه در تعمیر تخصصی انواع موتور سیکلت در مشهد.",
  },
];

export function TrustSignals() {
  return (
    <section className="bg-muted/40 border-y border-border py-14 md:py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="چرا موتور مکانیک؟"
          title="چرا موتور مکانیک را انتخاب کنید؟"
          description="مزیت‌هایی که باعث می‌شود با خیال راحت موتور سیکلت خود را به ما بسپارید."
          align="center"
          className="mb-10 md:mb-12"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {TRUST_SIGNALS.map((t, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group relative rounded-xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-brand-300 hover:-translate-y-1 transition-all p-5 md:p-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-24 h-24 -ml-12 -mt-12 rounded-full bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors" />
              <div className="relative flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-110 transition-transform">
                  <DynamicIcon
                    name={t.icon}
                    className="w-6 h-6"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-base md:text-lg text-foreground group-hover:text-brand-700 transition-colors">
                    {t.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
