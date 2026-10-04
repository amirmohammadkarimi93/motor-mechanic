"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "right" | "center" | "left";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "right",
  dark = false,
  className,
}: SectionHeadingProps) {
  const alignClass =
    align === "center"
      ? "text-center mx-auto items-center"
      : align === "left"
      ? "text-left items-start"
      : "text-right items-start";

  return (
    <div className={cn("flex flex-col gap-3 max-w-2xl", alignClass, className)}>
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className={cn(
            "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full badge-skew",
            dark
              ? "bg-white/10 text-brand-400"
              : "bg-brand-50 text-brand-700 border border-brand-200"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className={cn(
          "font-display text-2xl md:text-4xl font-extrabold tracking-tight",
          dark ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "text-sm md:text-base leading-relaxed text-pretty",
            dark ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
