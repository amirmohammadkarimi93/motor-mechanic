"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { ArticleCard } from "./article-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LatestArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  readingTime?: number | null;
  publishedAt?: Date | string | null;
  views?: number;
  category?: { id?: string; title: string; slug: string } | null;
  tags?: string | null;
}

export interface FilterCategory {
  id: string;
  title: string;
  slug: string;
}

interface LatestArticlesProps {
  articles: LatestArticleItem[];
  categories: FilterCategory[];
}

export function LatestArticles({ articles, categories }: LatestArticlesProps) {
  const [activeCat, setActiveCat] = useState<string>("all");

  if (!articles || articles.length === 0) return null;

  const filtered =
    activeCat === "all"
      ? articles
      : articles.filter(
          (a) => a.category?.id === activeCat || a.category?.slug === activeCat
        );

  // Only show filter pills for categories that have at least one article
  const usedCategoryIds = new Set(
    articles.map((a) => a.category?.id).filter(Boolean) as string[]
  );
  const availableCategories = categories.filter((c) =>
    usedCategoryIds.has(c.id)
  );

  return (
    <section className="container mx-auto px-4 py-14 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <SectionHeading
          eyebrow="مقالات و راهنماها"
          title="جدیدترین مقالات موتور سیکلت"
          description="راهنماهای کاربردی برای نگهداری، تعمیر و سرویس موتور سیکلت."
        />
        <Button
          asChild
          variant="ghost"
          className="self-start md:self-end text-brand-700 hover:text-brand-800 hover:bg-brand-50"
        >
          <Link href="/articles">
            همه مقالات
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Link>
        </Button>
      </div>

      {/* Category filter pills */}
      {availableCategories.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCat("all")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium border transition-all",
              activeCat === "all"
                ? "bg-brand-600 border-brand-600 text-white shadow-sm shadow-brand-600/30"
                : "bg-card border-border text-foreground hover:border-brand-300 hover:text-brand-700"
            )}
          >
            همه
          </button>
          {availableCategories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium border transition-all",
                activeCat === c.id
                  ? "bg-brand-600 border-brand-600 text-white shadow-sm shadow-brand-600/30"
                  : "bg-card border-border text-foreground hover:border-brand-300 hover:text-brand-700"
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      <motion.div
        layout
        className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          مقاله‌ای در این دسته‌بندی یافت نشد.
        </div>
      )}
    </section>
  );
}
