"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, ChevronLeft, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArticleCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  readingTime?: number | null;
  publishedAt?: Date | string | null;
  views?: number;
  category?: { title: string; slug: string } | null;
  tags?: string | null;
}

interface ArticleCardProps {
  article: ArticleCardData;
  index?: number;
  variant?: "default" | "list";
}

function formatDate(date: Date | string): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export function ArticleCard({ article, index = 0, variant = "default" }: ArticleCardProps) {
  if (variant === "list") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
        className="group"
      >
        <Link
          href={`/articles/${article.slug}`}
          className="flex gap-4 items-start rounded-xl bg-card border border-border hover:border-brand-300 hover:shadow-md transition-all p-3"
        >
          <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
            {article.coverImage ? (
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                sizes="128px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-700/20" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {article.category && (
              <Badge
                variant="outline"
                className="mb-1.5 text-[10px] border-brand-200 bg-brand-50 text-brand-700"
              >
                {article.category.title}
              </Badge>
            )}
            <h3 className="font-display text-sm md:text-base font-bold text-foreground group-hover:text-brand-700 transition-colors line-clamp-2">
              {article.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-[10px] md:text-xs text-muted-foreground">
              {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
              {article.readingTime ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime} دقیقه
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      className="group rounded-xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-brand-300 transition-all overflow-hidden h-full flex flex-col"
    >
      <Link
        href={`/articles/${article.slug}`}
        className="block h-full flex flex-col"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-700/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {article.category && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-ink/80 backdrop-blur-sm text-white border-0 text-xs">
                {article.category.title}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-display text-base md:text-lg font-bold text-foreground group-hover:text-brand-700 transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {article.excerpt}
            </p>
          )}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {article.authorName && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span className="hidden sm:inline">{article.authorName}</span>
                </span>
              )}
              {article.readingTime ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  {article.readingTime} دقیقه
                </span>
              ) : null}
            </div>
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
