"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Users as UsersIcon,
  ShieldAlert,
  Mail,
  FileText,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
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
import { UserFormDialog, type UserFormValue } from "./user-form-dialog";
import { ROLE_LABELS, type Role } from "@/lib/roles";

export type UserRow = {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  active: boolean;
  createdAt: string | Date;
  _count: { articles: number; categories: number; media: number };
};

interface UsersManagerProps {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
  search: string;
  role: string;
  stats: Record<Role, number>;
}

const ROLE_BADGE_CLASS: Record<Role, string> = {
  super_admin: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  editor:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  author: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  landing_editor:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const ROLE_STAT_ACCENT: Record<Role, string> = {
  super_admin: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
  editor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20",
  author: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
  landing_editor:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
};

function getInitials(name: string | null, username: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]).join("");
  }
  return username.slice(0, 2);
}

function formatDate(date: string | Date) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleDateString();
  }
}

export function UsersManager({
  items,
  total,
  page,
  limit,
  search,
  role,
  stats,
}: UsersManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserFormValue | null>(null);

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

  function onRoleChange(v: string) {
    pushParams({ role: v === "all" ? "" : v, page: "1" });
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    pushParams({ page: String(p) });
  }

  async function handleToggleActive(user: UserRow, next: boolean) {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "تغییر وضعیت ناموفق بود");
        return;
      }
      toast.success(next ? "حساب فعال شد" : "حساب غیرفعال شد");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "حذف ناموفق بود");
        return;
      }
      toast.success("کاربر حذف شد");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(u: UserRow) {
    setEditing({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      active: u.active,
    });
    setDialogOpen(true);
  }

  const statCards: { role: Role; count: number; label: string }[] = [
    { role: "super_admin", count: stats.super_admin, label: ROLE_LABELS.super_admin },
    { role: "editor", count: stats.editor, label: ROLE_LABELS.editor },
    { role: "author", count: stats.author, label: ROLE_LABELS.author },
    { role: "landing_editor", count: stats.landing_editor, label: ROLE_LABELS.landing_editor },
  ];

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.role} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={
                  "size-10 rounded-lg flex items-center justify-center ring-1 " +
                  ROLE_STAT_ACCENT[s.role]
                }
              >
                <UsersIcon className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display tabular-nums leading-none">
                  {s.count.toLocaleString("fa-IR")}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {s.label}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <form onSubmit={applySearch} className="relative w-full lg:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="جستجو بر اساس نام کاربری / نام / ایمیل..."
            className="pr-10"
          />
        </form>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={role || "all"} onValueChange={onRoleChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="همه نقش‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه نقش‌ها</SelectItem>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Plus className="size-4" />
            افزودن کاربر جدید
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-right">کاربر</TableHead>
              <TableHead className="text-right hidden md:table-cell">ایمیل</TableHead>
              <TableHead className="text-right">نقش</TableHead>
              <TableHead className="text-right">فعال</TableHead>
              <TableHead className="text-right hidden lg:table-cell">محتوا</TableHead>
              <TableHead className="text-right hidden md:table-cell">تاریخ ساخت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  {search || role
                    ? "نتیجه‌ای یافت نشد"
                    : "هنوز کاربری ساخته نشده است"}
                </TableCell>
              </TableRow>
            ) : (
              items.map((u) => {
                const roleClass =
                  ROLE_BADGE_CLASS[u.role as Role] ||
                  "bg-muted text-muted-foreground border-border";
                return (
                  <TableRow key={u.id}>
                    {/* User + avatar + name + username */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            "size-9 rounded-full flex items-center justify-center text-xs font-bold ring-1 " +
                            roleClass
                          }
                          aria-hidden="true"
                        >
                          {getInitials(u.name, u.username)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold leading-tight">
                            {u.name || u.username}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono leading-tight" dir="ltr">
                            @{u.username}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="hidden md:table-cell text-sm">
                      {u.email ? (
                        <a
                          href={`mailto:${u.email}`}
                          className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline"
                          dir="ltr"
                        >
                          <Mail className="size-3 shrink-0" />
                          <span className="truncate max-w-[200px]">{u.email}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Role badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={"border " + roleClass}
                      >
                        {ROLE_LABELS[u.role as Role] || u.role}
                      </Badge>
                    </TableCell>

                    {/* Active switch */}
                    <TableCell>
                      <Switch
                        checked={u.active}
                        disabled={togglingId === u.id}
                        onCheckedChange={(v) => handleToggleActive(u, v)}
                        aria-label={u.active ? "غیرفعال کردن" : "فعال کردن"}
                      />
                    </TableCell>

                    {/* Counts */}
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        <CountBadge
                          icon={FileText}
                          count={u._count.articles}
                          label="مقاله"
                          className="bg-brand-500/10 text-brand-600 dark:text-brand-400"
                        />
                        <CountBadge
                          icon={Layers}
                          count={u._count.categories}
                          label="دسته"
                          className="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        />
                        <CountBadge
                          icon={ImageIcon}
                          count={u._count.media}
                          label="رسانه"
                          className="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        />
                      </div>
                    </TableCell>

                    {/* Created date */}
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEdit(u)}
                          aria-label="ویرایش کاربر"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-destructive/10 hover:text-destructive"
                              disabled={deletingId === u.id}
                              aria-label="حذف کاربر"
                            >
                              {deletingId === u.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="size-5 text-destructive" />
                                حذف کاربر
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا از حذف کاربر «{u.name || u.username}» مطمئن
                                هستید؟ محتوای ساخته‌شده توسط این کاربر حذف نخواهد
                                شد ولی نام نویسنده آن خالی می‌ماند. این عمل قابل
                                بازگشت نیست.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(u.id)}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            صفحه <span className="font-medium text-foreground">{page.toLocaleString("fa-IR")}</span> از{" "}
            <span className="font-medium text-foreground">{totalPages.toLocaleString("fa-IR")}</span> —{" "}
            مجموع <span className="font-medium text-foreground">{total.toLocaleString("fa-IR")}</span> کاربر
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

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(null);
        }}
        user={editing}
      />
    </div>
  );
}

function CountBadge({
  icon: Icon,
  count,
  label,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  label: string;
  className: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium " +
        className
      }
      title={`${count.toLocaleString("fa-IR")} ${label}`}
    >
      <Icon className="size-3" />
      <span className="tabular-nums">{count.toLocaleString("fa-IR")}</span>
    </span>
  );
}
