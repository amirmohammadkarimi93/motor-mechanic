import { db } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { SiteBreadcrumb } from "@/components/site/breadcrumb";
import { CtaBand } from "@/components/site/cta-band";
import { ContactForm } from "@/components/site/contact-form";
import { SectionHeading } from "@/components/site/section-heading";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Send,
  MessageCircle,
} from "lucide-react";

export async function generateMetadata() {
  return buildMetadata({
    title: "تماس با ما",
    description:
      "با مرکز تخصصی تعمیرات موتور سیکلت در مشهد تماس بگیرید. نشانی، شماره تماس و راه‌های ارتباطی با موتور مکانیک.",
    slug: "contact",
  });
}

async function getContactData() {
  const settings = await db.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  return { settings };
}

export default async function ContactPage() {
  const { settings } = await getContactData();

  const contactItems = [
    settings?.phone
      ? {
          icon: Phone,
          label: "تلفن تماس",
          value: settings.phone,
          href: `tel:${settings.phone}`,
          ltr: true,
        }
      : null,
    settings?.email
      ? {
          icon: Mail,
          label: "ایمیل",
          value: settings.email,
          href: `mailto:${settings.email}`,
          ltr: true,
        }
      : null,
    settings?.address
      ? {
          icon: MapPin,
          label: "نشانی",
          value: settings.address,
          href: undefined,
          ltr: false,
        }
      : null,
    settings?.workingHours
      ? {
          icon: Clock,
          label: "ساعت کاری",
          value: settings.workingHours,
          href: undefined,
          ltr: false,
        }
      : null,
  ].filter(Boolean) as {
    icon: typeof Phone;
    label: string;
    value: string;
    href?: string;
    ltr: boolean;
  }[];

  return (
    <>
      <SiteBreadcrumb
        items={[{ label: "خانه", href: "/" }, { label: "تماس با ما" }]}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white py-14 md:py-20">
        <div className="absolute inset-0 bg-carbon opacity-25" />
        <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />
        <div className="container mx-auto px-4 relative">
          <span className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/40 rounded-full px-4 py-1.5 mb-4 text-xs font-bold text-brand-300">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            در تماس باشید
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
            تماس با موتور مکانیک
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-white/75 leading-relaxed text-pretty">
            برای دریافت نوبت، مشاوره یا هرگونه سوال درباره خدمات تعمیر موتور
            سیکلت با ما در ارتباط باشید.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {/* Left - form */}
          <div>
            <SectionHeading
              eyebrow="فرم تماس"
              title="پیام خود را ارسال کنید"
              description="فرم زیر را تکمیل کنید و کارشناسان ما در اسرع وقت با شما تماس می‌گیرند."
            />
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          {/* Right - info */}
          <div className="space-y-6">
            <div>
              <SectionHeading
                eyebrow="اطلاعات تماس"
                title="راه‌های ارتباطی"
              />
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactItems.map((item, i) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="group rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-brand-300 transition-all p-5 h-full">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 group-hover:bg-brand-500 flex items-center justify-center transition-colors">
                        <Icon
                          className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors"
                          strokeWidth={2.2}
                        />
                      </div>
                      <h3 className="mt-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </h3>
                      <p
                        dir={item.ltr ? "ltr" : "rtl"}
                        className="mt-1 font-display text-base md:text-lg font-bold text-foreground text-right"
                      >
                        {item.value}
                      </p>
                    </div>
                  );
                  return item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      className="block h-full"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={i} className="h-full">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social */}
            <div className="rounded-xl bg-ink text-white p-5 md:p-6">
              <h3 className="font-display font-bold text-base md:text-lg">
                ما را در شبکه‌های اجتماعی دنبال کنید
              </h3>
              <p className="mt-1 text-sm text-white/70">
                جدیدترین نمونه کارها و راهنماها را در اینستاگرام و تلگرام ما دنبال کنید.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {settings?.instagram && (
                  <a
                    href={`https://instagram.com/${settings.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-brand-500 text-white rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    اینستاگرام
                  </a>
                )}
                {settings?.telegram && (
                  <a
                    href={`https://t.me/${settings.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-brand-500 text-white rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    تلگرام
                  </a>
                )}
                {settings?.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    واتساپ
                  </a>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <div className="aspect-[16/10] bg-muted relative">
                {settings?.mapEmbed ? (
                  <div
                    className="absolute inset-0"
                    dangerouslySetInnerHTML={{
                      __html: settings.mapEmbed.replace('height="450"', 'height="100%"').replace('width="600"', 'width="100%"').replace('style="border:0;"', 'style="border:0;width:100%;height:100%;"'),
                    }}
                  />
                ) : (
                  <iframe
                    src="https://www.google.com/maps?q=Mashhad,Vakil+Abad+Blvd&output=embed"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="نقشه موتور مکانیک"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand phone={settings?.phone} />
    </>
  );
}
