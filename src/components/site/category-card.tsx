"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryCardData {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  image?: string | null;
  brand?: string | null;
  city?: string | null;
}

interface CategoryCardProps {
  category: CategoryCardData;
  index?: number;
  variant?: "default" | "compact";
}

export function CategoryCard({
  category,
  index = 0,
  variant = "default",
}: CategoryCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      className="group relative rounded-xl bg-card border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden h-full"
    >
      <Link
        href={`/services/${category.slug}`}
        className="block h-full"
        aria-label={category.title}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-700/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

          {/* Brand badge */}
          {category.brand && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-brand-600 text-white border-0 shadow-md">
                {category.brand}
              </Badge>
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h3 className="font-display text-lg md:text-xl font-bold text-white leading-tight line-clamp-2">
              {category.title}
            </h3>
            {category.city && (
              <div className="mt-1 flex items-center gap-1 text-white/80 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>مشهد</span>
              </div>
            )}
          </div>
        </div>

        {variant === "default" && (
          <div className="p-4 md:p-5">
            {category.shortDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {category.shortDescription}
              </p>
            )}
            <div className="mt-3 flex items-center gap-1 text-sm font-bold text-brand-700 group-hover:gap-2 transition-all">
              مشاهده جزئیات
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
          </div>
        )}
      </Link>
    </motion.article>
  );
}
