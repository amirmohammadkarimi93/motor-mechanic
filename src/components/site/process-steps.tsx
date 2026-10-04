"use client";

import { motion } from "framer-motion";
import { DynamicIcon } from "./icon";
import { SectionHeading } from "./section-heading";

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

interface ProcessStepsProps {
  steps: ProcessStep[];
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-14 md:py-20">
      <SectionHeading
        eyebrow="فرآیند کار ما"
        title="فرآیند تعمیر موتور سیکلت شما در موتور مکانیک"
        description="از تماس تا تحویل، یک تجربه حرفه‌ای و شفاف در ۶ گام ساده."
        align="center"
        className="mb-10 md:mb-14"
      />

      {/* Desktop: 6 columns with horizontal arrows, Mobile: vertical stack */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 relative">
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 6) * 0.08 }}
            className="relative group"
          >
            <article className="relative rounded-xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-brand-300 transition-all overflow-hidden h-full flex flex-col">
              <div className="h-1 bg-gradient-to-l from-brand-500 to-brand-700 origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="p-5 flex flex-col items-center text-center flex-1">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full bg-brand-50 group-hover:bg-brand-500 flex items-center justify-center transition-colors ring-4 ring-brand-100/60">
                    <DynamicIcon
                      name={s.icon}
                      className="w-6 h-6 text-brand-600 group-hover:text-white transition-colors"
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 min-w-7 h-7 px-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-display font-extrabold flex items-center justify-center shadow-md shadow-brand-600/30 border-2 border-card">
                    {String(s.step).toLocaleString("fa-IR")}
                  </span>
                </div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground group-hover:text-brand-700 transition-colors leading-snug">
                  {s.title}
                </h3>
                {s.description && (
                  <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                )}
              </div>
            </article>

            {/* Arrow connector between cards (desktop only) */}
            {i < steps.length - 1 && (
              <div
                aria-hidden
                className="hidden xl:flex absolute top-1/2 -left-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-brand-100 text-brand-700 items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Horizontal line on desktop for visual flow */}
      <div
        aria-hidden
        className="hidden lg:block absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-l from-transparent via-brand-200 to-transparent opacity-60"
        style={{ marginTop: "10rem" }}
      />
    </section>
  );
}
