"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] || "") + (parts[1][0] || "");
}

const AVATAR_GRADIENTS = [
  "from-brand-500 to-brand-700",
  "from-amber-500 to-orange-700",
  "from-rose-500 to-red-700",
  "from-emerald-500 to-teal-700",
  "from-sky-500 to-indigo-700",
  "from-violet-500 to-purple-700",
];

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white py-14 md:py-20">
      <div className="absolute inset-0 bg-carbon opacity-25" />
      <div className="absolute top-0 inset-x-0 h-1 bg-hazard opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-1 bg-hazard opacity-80" />

      <div
        aria-hidden
        className="absolute -top-8 -left-6 text-[160px] md:text-[240px] font-display font-extrabold text-white/[0.04] leading-none pointer-events-none select-none"
      >
        “
      </div>

      <div className="container mx-auto px-4 relative">
        <SectionHeading
          eyebrow="نظرات مشتریان"
          title="آنچه مشتریان ما می‌گویند"
          description="رضایت شما، اعتبار ماست. تجربه‌ی واقعی مشتریان موتور مکانیک."
          align="center"
          dark
          className="mb-10 md:mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {testimonials.slice(0, 4).map((t, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.08 }}
              className="group relative rounded-xl bg-white/[0.04] border border-white/10 hover:border-brand-400/40 backdrop-blur-sm transition-all p-5 md:p-6 flex flex-col"
            >
              <Quote
                className="w-9 h-9 text-brand-500/60 group-hover:text-brand-400 transition-colors mb-3"
                fill="currentColor"
                strokeWidth={0}
              />

              {typeof t.rating === "number" && t.rating > 0 && (
                <div
                  className="flex items-center gap-0.5 mb-3"
                  aria-label={`امتیاز ${t.rating} از ۵`}
                >
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={cn(
                        "w-4 h-4",
                        idx < t.rating
                          ? "text-brand-400 fill-brand-400"
                          : "text-white/20"
                      )}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  ))}
                </div>
              )}

              <p className="text-sm md:text-base text-white/85 leading-relaxed italic flex-1 text-pretty">
                «{t.content}»
              </p>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-brand-400/40"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold border border-white/10",
                      AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                    )}
                    aria-hidden
                  >
                    {getInitials(t.name)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-display font-bold text-sm text-white">
                    {t.name}
                  </span>
                  {t.role && (
                    <span className="text-xs text-brand-300">{t.role}</span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
