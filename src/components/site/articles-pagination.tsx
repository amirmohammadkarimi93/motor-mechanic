"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticlesPaginationProps {
  currentPage: number;
  totalPages: number;
  buildPageUrl: (overrides: Record<string, string | undefined>) => string;
}

function pageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages).filter(
    (p) => p >= 1 && p <= total
  ) as number[];
  const result: (number | "...")[] = [];
  let last = 0;
  for (const p of sorted) {
    if (p - last > 1) result.push("...");
    result.push(p);
    last = p;
  }
  return result;
}

export function ArticlesPagination({
  currentPage,
  totalPages,
  buildPageUrl,
}: ArticlesPaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex items-center justify-center gap-1.5 flex-wrap"
    >
      {currentPage > 1 && (
        <Link
          href={buildPageUrl({ page: String(currentPage - 1) })}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-brand-50 hover:border-brand-300 px-3 py-2 text-sm font-medium transition-colors"
          aria-label="صفحه قبل"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="hidden sm:inline">قبل</span>
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`e-${i}`}
            className="px-2 text-muted-foreground"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl({ page: String(p) })}
            className={cn(
              "min-w-9 h-9 inline-flex items-center justify-center rounded-lg border text-sm font-medium transition-colors",
              p === currentPage
                ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/30"
                : "border-border bg-card hover:bg-brand-50 hover:border-brand-300 text-foreground"
            )}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p.toLocaleString("fa-IR")}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildPageUrl({ page: String(currentPage + 1) })}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:bg-brand-50 hover:border-brand-300 px-3 py-2 text-sm font-medium transition-colors"
          aria-label="صفحه بعد"
        >
          <span className="hidden sm:inline">بعد</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      )}
    </nav>
  );
}
