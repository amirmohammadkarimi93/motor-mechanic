"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";

interface FilterCategory {
  id: string;
  title: string;
  slug: string;
}

interface ArticlesFilterProps {
  categories: FilterCategory[];
  tags: string[];
}

export function ArticlesFilter({ categories, tags }: ArticlesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialTag = searchParams.get("tag") || "all";
  const [category, setCategory] = useState(initialCategory);
  const [tag, setTag] = useState(initialTag);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategory(searchParams.get("category") || "all");
    setTag(searchParams.get("tag") || "all");
  }, [searchParams]);

  function applyFilters() {
    const sp = new URLSearchParams();
    if (category && category !== "all") sp.set("category", category);
    if (tag && tag !== "all") sp.set("tag", tag);
    const qs = sp.toString();
    router.push(qs ? `/articles?${qs}` : "/articles");
  }

  function clearFilters() {
    router.push("/articles");
  }

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground shrink-0">
          <Search className="w-4 h-4 text-brand-600" />
          فیلتر مقالات:
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="همه دسته‌بندی‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="همه برچسب‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه برچسب‌ها</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            onClick={applyFilters}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex-1 md:flex-none"
          >
            اعمال فیلتر
          </Button>
          {(category !== "all" || tag !== "all") && (
            <Button
              type="button"
              onClick={clearFilters}
              variant="ghost"
              className="rounded-lg"
              aria-label="حذف فیلتر"
            >
              <FilterX className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
