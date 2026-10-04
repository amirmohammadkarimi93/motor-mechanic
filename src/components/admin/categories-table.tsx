"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import type { CategoryWithRelations } from "./types";

interface CategoriesTableProps {
  items: CategoryWithRelations[];
  total: number;
  page: number;
  limit: number;
  search: string;
  /** Current user id — used for own-only RBAC */
  currentUserId?: string;
  /** Permission level for the categories module */
  permissionLevel: "none" | "own" | "all";
}

export function CategoriesTable({
  items,
  total,
  page,
  limit,
  search,
  currentUserId,
  permissionLevel,
}: CategoriesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "حذف ناموفق بود");
        return;
      }
      toast.success("دسته‌بندی حذف شد");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingId(null);
    }
  }

  function canManage(item: CategoryWithRelations): boolean {
    if (permissionLevel === "all") return true;
    if (permissionLevel === "own") return item.authorId === currentUserId;
    return false;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <form onSubmit={applySearch} className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="جستجوی دسته‌بندی..."
            className="pr-10"
          />
        </form>
        <Button
          asChild
          className="bg-brand-600 hover:bg-brand-700 text-white"
        >
          <Link href="/admin/categories/new">
            <Plus className="size-4" />
            افزودن دسته‌بندی جدید
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">slug</TableHead>
              <TableHead className="text-right hidden md:table-cell">برند</TableHead>
              <TableHead className="text-right hidden md:table-cell">شهر</TableHead>
              <TableHead className="text-right">ویژگی‌ها</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  {search ? "نتیجه‌ای یافت نشد" : "هنوز دسته‌بندی‌ای ساخته نشده است"}
                </TableCell>
              </TableRow>
            ) : (
              items.map((c) => {
                const manageable = canManage(c);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium max-w-[240px]">
                      <div className="flex flex-col">
                        <span className="truncate">{c.title}</span>
                        {c.shortDescription && (
                          <span className="text-xs text-muted-foreground truncate">
                            {c.shortDescription}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      /{c.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {c.brand ? <Badge variant="outline">{c.brand}</Badge> : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {c.city ? <Badge variant="outline">{c.city}</Badge> : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.featured && (
                          <Badge className="bg-brand-500 hover:bg-brand-500 text-white">
                            منتخب
                          </Badge>
                        )}
                        {c.published ? (
                          <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                            منتشر
                          </Badge>
                        ) : (
                          <Badge variant="secondary">پیش‌نویس</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {manageable ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            asChild
                            aria-label="ویرایش"
                          >
                            <Link href={`/admin/categories/${c.id}`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 hover:bg-destructive/10 hover:text-destructive"
                                disabled={deletingId === c.id}
                                aria-label="حذف"
                              >
                                {deletingId === c.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
                                <AlertDialogDescription>
                                  آیا از حذف دسته‌بندی «{c.title}» مطمئن هستید؟ این عمل
                                  قابل بازگشت نیست و ممکن است روی مقالات مرتبط تأثیر بگذارد.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(c.id)}
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            صفحه <span className="font-medium text-foreground">{page}</span> از{" "}
            <span className="font-medium text-foreground">{totalPages}</span> —{" "}
            مجموع {total.toLocaleString("fa-IR")} مورد
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
    </div>
  );
}
