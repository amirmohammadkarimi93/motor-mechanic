import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { buildMetadata, getSettings } from "@/lib/seo";
import { SiteBreadcrumb } from "@/components/site/breadcrumb";
import { StatsBand } from "@/components/site/stats-band";
import { ServiceCard } from "@/components/site/service-card";
import { CtaBand } from "@/components/site/cta-band";
import { SectionHeading } from "@/components/site/section-heading";
import { Markdown } from "@/components/site/markdown";
import { DynamicIcon } from "@/components/site/icon";

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: settings?.aboutTitle || "درباره ما",
    description: settings?.siteDescription,
    slug: "about",
    ogImage: settings?.aboutImage,
  });
}

function parseStats(str?: string | null) {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

async function getAboutData() {
  const [settings, services] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "singleton" } }),
    db.service.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ]);
  return { settings, services };
}

export default async function AboutPage() {
  const { settings, services } = await getAboutData();
  const stats = parseStats(settings?.stats);

  const values = [
    {
      icon: "award",
      title: "تجربه و تخصص",
      desc: "بیش از ۱۵ سال سابقه در تعمیر انواع موتور سیکلت با تیمی متخصص و دوره‌دیده.",
    },
    {
      icon: "wrench",
      title: "تجهیزات مدرن",
      desc: "استفاده از مدرن‌ترین تجهیزات تشخیصی و تعمیراتی برای ارائه بهترین خدمات.",
    },
    {
      icon: "shield-check",
      title: "گارانتی معتبر",
      desc: "تمام تعمیرات ما با گارانتی معتبر ارائه می‌شوند تا با خیال راحت سوار شوید.",
    },
    {
      icon: "heart",
      title: "رضایت مشتری",
      desc: "اولویت ما رضایت کامل مشتری است؛ از کیفیت خدمات تا قیمت منصفانه.",
    },
  ];

  return (
    <>
      <SiteBreadcrumb
        items={[{ label: "خانه", href: "/" }, { label: "درباره ما" }]}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white py-14 md:py-20">
        {settings?.aboutImage && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={settings.aboutImage}
              alt={settings?.aboutTitle || "درباره موتور مکانیک"}
              fill
              sizes="100vw"
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/85 to-ink/40" />
          </div>
        )}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />
        <div className="container mx-auto px-4">
          <span className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/40 rounded-full px-4 py-1.5 mb-4 text-xs font-bold text-brand-300">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            درباره موتور مکانیک
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
            {settings?.aboutTitle || "درباره موتور مکانیک"}
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-white/75 leading-relaxed text-pretty">
            {settings?.siteDescription ||
              "مرکز تخصصی تعمیرات موتور سیکلت در مشهد با بیش از ۱۵ سال سابقه."}
          </p>
        </div>
      </section>

      {/* About content */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-start">
          <div className="lg:col-span-3">
            {settings?.aboutContent && (
              <Markdown content={settings.aboutContent} />
            )}
          </div>
          <div className="lg:col-span-2">
            {settings?.aboutImage && (
              <div className="sticky top-24 relative aspect-[4/5] rounded-xl overflow-hidden border border-border shadow-xl">
                <Image
                  src={settings.aboutImage}
                  alt={settings?.aboutTitle || "درباره موتور مکانیک"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-lg bg-ink/85 backdrop-blur-sm text-white">
                  <p className="font-display text-lg font-bold">
                    {settings?.siteName || "موتور مکانیک"}
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    مرکز تخصصی تعمیرات موتور سیکلت در مشهد
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/40 border-y border-border py-14 md:py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="ارزش‌های ما"
            title="چرا موتور مکانیک؟"
            description="آنچه ما را به انتخابی مطمئن برای تعمیر موتور سیکلت شما تبدیل می‌کند."
            align="center"
            className="mx-auto"
          />
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="group rounded-xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-brand-300 transition-all p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-110 transition-transform">
                  <DynamicIcon
                    name={v.icon}
                    className="w-6 h-6"
                    strokeWidth={2.2}
                  />
                </div>
                <h3 className="mt-4 font-display font-bold text-base md:text-lg text-foreground">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {stats.length > 0 && <StatsBand stats={stats} />}

      {/* Services overview */}
      {services.length > 0 && (
        <section className="container mx-auto px-4 py-14 md:py-20">
          <SectionHeading
            eyebrow="خدمات ما"
            title="خدمات تخصصی تعمیر موتور سیکلت"
            description="مجموعه‌ای کامل از خدمات تعمیراتی برای موتور سیکلت شما."
          />
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </section>
      )}

      <CtaBand phone={settings?.phone} />
    </>
  );
}
