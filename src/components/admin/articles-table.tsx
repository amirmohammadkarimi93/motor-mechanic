"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArticleFormSheet } from "./article-form-sheet";
import type { ArticleWithRelations } from "./types";

interface ArticlesTableProps {
  items: ArticleWithRelations[];
  total: number;
  page: number;
  limit: number;
  search: string;
  categoryId: string;
  published: string;
  categories: { id: string; title: string }[];
}

export function ArticlesTable({
  items,
  total,
  page,
  limit,
  search,
  categoryId,
  published,
  categories,
}: ArticlesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleWithRelations | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function pushParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search: searchValue, page: "1" });
  }

  function onCategoryChange(v: string) {
    pushParams({ category: v === "all" ? "" : v, page: "1" });
  }
  function onPublishedChange(v: string) {
    pushParams({ published: v === "all" ? "" : v, page: "1" });
  }
  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    pushParams({ page: String(p) });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "حذف ناموفق بود");
        return;
      }
      toast.success("مقاله حذف شد");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }
  function openEdit(a: ArticleWithRelations) {
    setEditing(a);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <form onSubmit={applySearch} className="relative w-full lg:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="جستجوی عنوان مقاله..."
            className="pr-10"
          />
        </form>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={categoryId || "all"} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="همه دسته‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={published || "all"} onValueChange={onPublishedChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="همه وضعیت‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="published">منتشر شده</SelectItem>
              <SelectItem value="draft">پیش‌نویس</SelectItem>
              <SelectItem value="featured">منتخب</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="bg-brand-600 hover:bg-brand-700 text-white">
            <Plus className="size-4" />
            افزودن مقاله جدید
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right hidden md:table-cell">دسته</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right hidden lg:table-cell">تاریخ انتشار</TableHead>
              <TableHead className="text-right">بازدید</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  {search || categoryId || published
                    ? "نتیجه‌ای یافت نشد"
                    : "هنوز مقاله‌ای نوشته نشده است"}
                </TableCell>
              </TableRow>
            ) : (
              items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium max-w-[280px]">
                    <div className="flex flex-col">
                      <span className="truncate">{a.title}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        /{a.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {a.category ? (
                      <Badge variant="outline">{a.category.title}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.published ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                          منتشر
                        </Badge>
                      ) : (
                        <Badge variant="secondary">پیش‌نویس</Badge>
                      )}
                      {a.featured && (
                        <Badge className="bg-brand-500 hover:bg-brand-500 text-white">
                          منتخب
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {a.publishedAt
                      ? new Intl.DateTimeFormat("fa-IR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }).format(a.publishedAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {a.views.toLocaleString("fa-IR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(a)}
                        aria-label="ویرایش"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-destructive/10 hover:text-destructive"
                            disabled={deletingId === a.id}
                            aria-label="حذف"
                          >
                            {deletingId === a.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف مقاله</AlertDialogTitle>
                            <AlertDialogDescription>
                              آیا از حذف مقاله «{a.title}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>انصراف</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(a.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            صفحه <span className="font-medium text-foreground">{page}</span> از{" "}
            <span className="font-medium text-foreground">{totalPages}</span> —{" "}
            مجموع {total.toLocaleString("fa-IR")} مقاله
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              قبلی
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              بعدی
            </Button>
          </div>
        </div>
      )}

      <ArticleFormSheet
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setEditing(null);
        }}
        article={editing}
        categories={categories}
      />
    </div>
  );
}
