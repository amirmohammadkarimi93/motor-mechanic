"use client";

import { motion } from "framer-motion";
import { DynamicIcon } from "./icon";

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

interface FeaturesStripProps {
  features: FeatureItem[];
}

export function FeaturesStrip({ features }: FeaturesStripProps) {
  if (!features || features.length === 0) return null;
  return (
    <section className="container mx-auto px-4 -mt-12 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative rounded-xl bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all p-5 md:p-6 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors" />
            <div className="relative flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-110 transition-transform">
                <DynamicIcon
                  name={f.icon}
                  className="w-6 h-6"
                  strokeWidth={2.2}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-base md:text-lg text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
