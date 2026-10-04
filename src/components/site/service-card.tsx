"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ChevronLeft, Phone } from "lucide-react";
import { DynamicIcon } from "./icon";
import { Badge } from "@/components/ui/badge";

interface ServiceCardData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  price?: string | null;
  features?: string | null;
}

interface ServiceCardProps {
  service: ServiceCardData;
  index?: number;
  phone?: string | null;
}

function parseFeatures(features?: string | null): string[] {
  if (!features) return [];
  try {
    const parsed = JSON.parse(features);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
  } catch {
    return features
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

export function ServiceCard({ service, index = 0, phone }: ServiceCardProps) {
  const features = parseFeatures(service.features).slice(0, 4);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      className="group relative rounded-xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-brand-300 transition-all overflow-hidden flex flex-col"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-l from-brand-500 to-brand-700 origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-lg bg-brand-50 group-hover:bg-brand-500 flex items-center justify-center transition-colors">
            <DynamicIcon
              name={service.icon}
              className="w-6 h-6 text-brand-600 group-hover:text-white transition-colors"
              strokeWidth={2.2}
            />
          </div>
          {service.price && (
            <Badge
              variant="outline"
              className="border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold"
            >
              {service.price}
            </Badge>
          )}
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:text-brand-700 transition-colors">
          {service.title}
        </h3>
        {service.description && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {service.description}
          </p>
        )}

        {features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs md:text-sm text-foreground/80"
              >
                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors group/link"
          >
            اطلاعات بیشتر
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-x-0.5" />
          </Link>
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              تماس
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">
              برای دریافت نوبت تماس بگیرید
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

