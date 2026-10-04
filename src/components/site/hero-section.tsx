"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Phone, CalendarClock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PopularSearch {
  label: string;
  href: string;
}

interface HeroSectionProps {
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  heroImage?: string | null;
  ctaText?: string | null;
  phone?: string | null;
  stats?: { label: string; value: string; suffix?: string }[];
  popularSearches?: PopularSearch[];
}

export function HeroSection({
  badge,
  title,
  subtitle,
  heroImage,
  ctaText,
  phone,
  stats = [],
  popularSearches = [],
}: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white min-h-[88vh] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={title || "موتور مکانیک"}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-50"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/80 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
      </div>

      {/* Hazard stripe top accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />

      {/* Decorative big text */}
      <div
        aria-hidden
        className="absolute -bottom-6 -left-4 text-[140px] md:text-[220px] font-display font-extrabold text-white/[0.04] leading-none pointer-events-none select-none"
      >
        MOTOR
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl">
          {badge && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/40 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs md:text-sm font-bold text-brand-300 tracking-wide">
                {badge}
              </span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-balance"
          >
            {title || "تعمیرات تخصصی موتور سیکلت با گارانتی"}
            <span className="block mt-3 text-brand-500 text-3xl md:text-5xl">
              در مشهد
            </span>
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base md:text-lg text-white/75 leading-relaxed max-w-2xl text-pretty"
            >
              {subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            {phone && (
              <Button
                asChild
                size="lg"
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-600/40 group"
              >
                <a href={`tel:${phone}`}>
                  <Phone className="w-5 h-5 ml-2 transition-transform group-hover:rotate-12" />
                  {ctaText || "تماس فوری"}
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl group"
            >
              <Link href="/services">
                <CalendarClock className="w-5 h-5 ml-2" />
                مشاهده خدمات
                <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {popularSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-2"
            >
              <span className="text-xs text-white/60">جستجوی پرطرفدار:</span>
              {popularSearches.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/15 hover:bg-brand-500/20 hover:border-brand-400/50 hover:text-brand-200 text-white/85 text-xs font-medium transition-all px-3 py-1.5"
                >
                  {s.label}
                  <ChevronLeft className="w-3 h-3 opacity-70" />
                </Link>
              ))}
            </motion.div>
          )}

          {stats && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl"
            >
              {stats.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col"
                >
                  <span className="font-display text-2xl md:text-4xl font-extrabold text-white">
                    {s.value}
                    <span className="text-brand-500">{s.suffix}</span>
                  </span>
                  <span className="text-xs md:text-sm text-white/60 mt-1">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
