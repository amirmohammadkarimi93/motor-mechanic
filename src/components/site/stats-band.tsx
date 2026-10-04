"use client";

import { motion } from "framer-motion";

interface StatItem {
  label: string;
  value: string;
  suffix?: string;
}

interface StatsBandProps {
  stats: StatItem[];
}

export function StatsBand({ stats }: StatsBandProps) {
  if (!stats || stats.length === 0) return null;
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-carbon opacity-30" />
      <div className="absolute top-0 inset-x-0 h-1 bg-hazard opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-1 bg-hazard opacity-80" />
      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.slice(0, 4).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative">
                <span className="font-display text-4xl md:text-6xl font-extrabold bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  {s.value}
                  <span className="text-brand-500">{s.suffix}</span>
                </span>
                <div className="mt-1 h-0.5 w-12 bg-brand-500/40 mx-auto group-hover:w-20 transition-all duration-500" />
              </div>
              <span className="mt-3 text-sm md:text-base text-white/70 font-medium">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
