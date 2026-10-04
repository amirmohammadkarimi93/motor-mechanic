import Link from "next/link";
import { Bike, Phone, MapPin, Mail, Clock, Instagram, Send, ChevronLeft } from "lucide-react";

interface FooterProps {
  settings: any;
  categories?: { title: string; slug: string }[];
}

export function SiteFooter({ settings, categories = [] }: FooterProps) {
  const year = new Date().getFullYear();
  const siteName = settings?.siteName || "موتور مکانیک";
  const footerText =
    settings?.footerText ||
    "موتور مکانیک - مرکز تخصصی تعمیرات موتور سیکلت در مشهد.";

  return (
    <footer className="mt-auto bg-ink text-white/80">
      {/* Hazard stripe top */}
      <div className="h-2 bg-hazard opacity-80" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/40">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-xl font-extrabold text-white">
                  {siteName}
                </span>
                <span className="text-xs text-white/50 tracking-widest">
                  MOTOR MECHANIC
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed text-pretty">
              {footerText}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings?.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-brand-500 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.telegram && (
                <a
                  href={`https://t.me/${settings.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-brand-500 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              دسترسی سریع
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "خانه" },
                { href: "/about", label: "درباره ما" },
                { href: "/articles", label: "مقالات" },
                { href: "/services", label: "دسته‌بندی‌ها" },
                { href: "/contact", label: "تماس با ما" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3 h-3 text-brand-500" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              دسته‌بندی‌ها
            </h3>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/services/${c.slug}`}
                    className="text-white/70 hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3 h-3 text-brand-500" />
                    {c.title}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-white/40 text-xs">به‌زودی...</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              تماس با ما
            </h3>
            <ul className="space-y-3 text-sm">
              {settings?.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-white/70 hover:text-brand-400 transition-colors"
                    dir="ltr"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-white/70 leading-relaxed">
                    {settings.address}
                  </span>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-white/70 hover:text-brand-400 transition-colors"
                    dir="ltr"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.workingHours && (
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-white/70">{settings.workingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 md:mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>
            © {year} {siteName}. تمامی حقوق محفوظ است.
          </p>
          <p className="flex items-center gap-1.5">
            طراحی و توسعه با
            <span className="text-brand-500">●</span>
            توسط موتور مکانیک
          </p>
        </div>
      </div>
    </footer>
  );
}
