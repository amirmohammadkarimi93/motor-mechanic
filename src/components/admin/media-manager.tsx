"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Search,
  Copy,
  Pencil,
  Trash2,
  Loader2,
  ImageIcon,
  FileImage,
  X,
  Save,
  Link2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  alt: string | null;
  title: string | null;
  caption: string | null;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  createdAt: Date | string;
  uploadedById: string | null;
  uploadedBy: { id: string; name: string | null; username: string } | null;
}

interface MediaManagerProps {
  items: MediaItem[];
  total: number;
  page: number;
  limit: number;
  search: string;
  canManageAll: boolean;
  currentUserId: string;
}

// ===== helpers =====
function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes.toLocaleString("fa-IR")} بایت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).toLocaleString("fa-IR")} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2).toLocaleString("fa-IR")} MB`;
}

function formatDimensions(w: number | null, h: number | null): string {
  if (!w || !h) return "—";
  return `${w.toLocaleString("fa-IR")} × ${h.toLocaleString("fa-IR")}`;
}

function formatDate(d: Date | string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(d));
  } catch {
    return "";
  }
}

// ===== main component =====
export function MediaManager({
  items,
  total,
  page,
  limit,
  search,
  canManageAll,
  currentUserId,
}: MediaManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState(search);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editAlt, setEditAlt] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ===== search =====
  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) params.set("search", searchValue);
    else params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  // ===== upload =====
  const uploadFile = useCallback(
    (file: File) => {
      if (!file) return;
      // Quick client-side validation matches the server
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
        toast.error("فقط تصویر قابل آپلود است");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم فایل نباید بیش از ۱۰ مگابایت باشد");
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      // Use XHR to get progress events
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/media/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        setUploadProgress(0);
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            toast.success("تصویر با موفقیت آپلود شد");
            router.refresh();
          } else {
            toast.error(data.error || "آپلود ناموفق بود");
          }
        } catch {
          toast.error("پاسخ سرور نامعتبر است");
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setUploadProgress(0);
        toast.error("خطا در ارتباط با سرور");
      };

      xhr.onabort = () => {
        setUploading(false);
        setUploadProgress(0);
        toast.info("آپلود لغو شد");
      };

      const fd = new FormData();
      fd.append("file", file);
      xhr.send(fd);
    },
    [router]
  );

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset value so the same file can be picked again
    if (e.target) e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // Only clear when leaving the zone itself (not children)
    if (e.currentTarget === e.target) setIsDragging(false);
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  // ===== copy url =====
  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("آدرس تصویر کپی شد");
    } catch {
      toast.error("کپی آدرس ناموفق بود");
    }
  }

  // ===== edit =====
  function openEdit(item: MediaItem) {
    setEditing(item);
    setEditAlt(item.alt ?? "");
    setEditTitle(item.title ?? "");
    setEditCaption(item.caption ?? "");
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alt: editAlt || null,
          title: editTitle || null,
          caption: editCaption || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "ذخیره ناموفق بود");
        return;
      }
      toast.success("رسانه به‌روزرسانی شد");
      setEditOpen(false);
      setEditing(null);
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setEditSaving(false);
    }
  }

  // ===== delete =====
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "حذف ناموفق بود");
        return;
      }
      toast.success("رسانه حذف شد");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDeletingId(null);
    }
  }

  function canModify(item: MediaItem): boolean {
    if (canManageAll) return true;
    return item.uploadedById === currentUserId;
  }

  return (
    <div className="space-y-4">
      {/* ===== Upload Zone ===== */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={
          "relative rounded-xl border-2 border-dashed transition-colors p-6 sm:p-8 text-center cursor-pointer " +
          (isDragging
            ? "border-brand-500 bg-brand-500/5"
            : "border-border bg-card hover:border-brand-400/60 hover:bg-muted/40")
        }
        onClick={triggerFilePicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerFilePicker();
          }
        }}
        aria-label="منطقه آپلود تصویر — برای انتخاب فایل کلیک کنید"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={
              "size-14 rounded-2xl flex items-center justify-center ring-1 transition-colors " +
              (isDragging
                ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 ring-brand-500/30"
                : "bg-muted text-muted-foreground ring-border")
            }
          >
            {uploading ? (
              <Loader2 className="size-7 animate-spin text-brand-500" />
            ) : (
              <Upload className="size-7" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">
              {uploading
                ? `در حال آپلود… ${uploadProgress.toLocaleString("fa-IR")}٪`
                : "تصویر را اینجا رها کنید یا کلیک کنید"}
            </p>
            <p className="text-xs text-muted-foreground">
              فرمت‌های مجاز: JPG, PNG, WebP, GIF — حداکثر ۱۰ مگابایت
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden rounded-b-xl">
            <div
              className="h-full bg-brand-500 transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* ===== Search + Filter ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <form onSubmit={applySearch} className="relative w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="جستجو در نام فایل، متن جایگزین یا عنوان…"
            className="pr-10"
          />
        </form>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="size-3.5" />
          <span>
            مجموع <span className="font-medium text-foreground">{total.toLocaleString("fa-IR")}</span> تصویر
          </span>
        </div>
      </div>

      {/* ===== Grid ===== */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="size-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search
                ? "نتیجه‌ای یافت نشد"
                : "هنوز تصویری آپلود نشده است"}
            </p>
            {!search && (
              <Button
                onClick={triggerFilePicker}
                className="mt-4 bg-brand-600 hover:bg-brand-700 text-white"
              >
                <Upload className="size-4" />
                آپلود اولین تصویر
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((m) => {
            const mine = m.uploadedById === currentUserId;
            const modifiable = canModify(m);
            return (
              <Card
                key={m.id}
                className="overflow-hidden group flex flex-col hover:shadow-md hover:border-brand-500/40 transition-all"
              >
                {/* Image preview */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={m.url}
                    alt={m.alt || m.filename}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Mine / role badge */}
                  {canManageAll && mine && (
                    <div className="absolute top-1.5 right-1.5">
                      <Badge className="bg-brand-500/90 text-white border-0 text-[10px] backdrop-blur-sm">
                        من
                      </Badge>
                    </div>
                  )}
                  {canManageAll && !mine && m.uploadedBy && (
                    <div className="absolute top-1.5 right-1.5 max-w-[80%]">
                      <Badge className="bg-black/60 text-white border-0 text-[10px] backdrop-blur-sm truncate">
                        {m.uploadedBy.name || m.uploadedBy.username}
                      </Badge>
                    </div>
                  )}

                  {/* Hover actions overlay */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      className="size-7 bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(m.url);
                      }}
                      aria-label="کپی آدرس"
                      title="کپی آدرس"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      className="size-7 bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(m);
                      }}
                      disabled={!modifiable}
                      aria-label="ویرایش"
                      title="ویرایش"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          className="size-7 bg-black/60 hover:bg-destructive text-white border-0 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                          disabled={!modifiable || deletingId === m.id}
                          aria-label="حذف"
                          title="حذف"
                        >
                          {deletingId === m.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف رسانه</AlertDialogTitle>
                          <AlertDialogDescription>
                            آیا از حذف تصویر «{m.filename}» مطمئن هستید؟ این عمل
                            قابل بازگشت نیست و فایل از سرور حذف می‌شود.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(m.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <FileImage className="size-3.5 text-muted-foreground shrink-0" />
                    <span
                      className="text-xs font-medium truncate"
                      title={m.filename}
                      dir="ltr"
                    >
                      {m.filename}
                    </span>
                  </div>

                  {m.alt ? (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      <span className="text-foreground/70">alt:</span> {m.alt}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      بدون متن جایگزین
                    </p>
                  )}

                  <div className="mt-auto pt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{formatDimensions(m.width, m.height)}</span>
                    <span>{formatBytes(m.size)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/80">
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ===== Pagination ===== */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            صفحه <span className="font-medium text-foreground">{page.toLocaleString("fa-IR")}</span> از{" "}
            <span className="font-medium text-foreground">{totalPages.toLocaleString("fa-IR")}</span>
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

      {/* ===== Edit Dialog ===== */}
      <Dialog open={editOpen} onOpenChange={(v) => {
        setEditOpen(v);
        if (!v) setEditing(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <Pencil className="size-5 text-brand-500" />
              ویرایش رسانه
            </DialogTitle>
            <DialogDescription className="text-right">
              متن جایگزین (alt) و عنوان برای دسترسی‌پذیری و سئو
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={editing.url}
                  alt={editing.alt || editing.filename}
                  fill
                  sizes="480px"
                  className="object-contain"
                />
              </div>

              <div className="grid gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>نام فایل:</span>
                  <span className="font-mono truncate max-w-[60%]" dir="ltr" title={editing.filename}>
                    {editing.filename}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ابعاد:</span>
                  <span>{formatDimensions(editing.width, editing.height)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>حجم:</span>
                  <span>{formatBytes(editing.size)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-alt" className="text-sm font-medium">
                  متن جایگزین (Alt) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-alt"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="مثلاً: تعمیر موتورگلکسی در مشهد"
                />
                <p className="text-[11px] text-muted-foreground">
                  برای تصاویر تزئینی خالی بگذارید
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  عنوان (Title)
                </Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="عنوان تصویر برای موتور جستجو"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-caption" className="text-sm font-medium">
                  کپشن (Caption)
                </Label>
                <Textarea
                  id="edit-caption"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={3}
                  placeholder="کپشن اختیاری برای نمایش زیر تصویر"
                />
              </div>

              {/* Quick copy URL */}
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <Link2 className="size-4 text-muted-foreground shrink-0" />
                <input
                  readOnly
                  value={editing.url}
                  dir="ltr"
                  className="flex-1 bg-transparent text-xs font-mono outline-none text-muted-foreground"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyUrl(editing.url)}
                  className="h-7 px-2 text-xs"
                >
                  <Copy className="size-3" />
                  کپی
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditing(null);
              }}
              disabled={editSaving}
            >
              <X className="size-4" />
              انصراف
            </Button>
            <Button
              onClick={saveEdit}
              disabled={editSaving}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {editSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
