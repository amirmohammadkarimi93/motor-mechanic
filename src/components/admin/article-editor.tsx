"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  Save,
  Send,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import type { ArticleWithRelations } from "./types";

const slugRegex = /^[a-z0-9-]+$/;

const articleSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(slugRegex, "اسلاگ فقط شامل حروف کوچک، اعداد و خط تیره"),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1, "محتوا الزامی است"),
  coverImage: z.string().url("آدرس معتبر نیست").optional().or(z.literal("")),
  categoryId: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  readingTime: z.coerce.number().int().min(0).optional().nullable(),
  tags: z.string().optional().nullable(),
  featured: z.boolean(),
  published: z.boolean(),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().url("آدرس معتبر نیست").optional().or(z.literal("")),
  ogImage: z.string().url("آدرس معتبر نیست").optional().or(z.literal("")),
  structuredData: z.string().optional().nullable(),
});

type ArticleValues = z.infer<typeof articleSchema>;

interface CategoryOption {
  id: string;
  title: string;
}

interface ArticleEditorProps {
  article?: ArticleWithRelations | null;
  categories: CategoryOption[];
}

function toSlug(s: string) {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Convert ISO date string -> datetime-local input value (yyyy-MM-ddTHH:mm)
function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Convert datetime-local input value -> ISO string (or null)
function datetimeLocalToIso(v: string | null | undefined): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function articleToValues(a: ArticleWithRelations | null | undefined): ArticleValues {
  if (!a) {
    return {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      categoryId: "",
      authorName: "",
      readingTime: 0,
      tags: "",
      featured: false,
      published: false,
      publishedAt: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogImage: "",
      structuredData: "",
    };
  }
  return {
    title: a.title ?? "",
    slug: a.slug ?? "",
    excerpt: a.excerpt ?? "",
    content: a.content ?? "",
    coverImage: a.coverImage ?? "",
    categoryId: a.categoryId ?? "",
    authorName: a.authorName ?? "",
    readingTime: a.readingTime ?? 0,
    tags: a.tags ?? "",
    featured: a.featured,
    published: a.published,
    publishedAt: a.publishedAt ? isoToDatetimeLocal(a.publishedAt.toISOString()) : "",
    metaTitle: a.metaTitle ?? "",
    metaDescription: a.metaDescription ?? "",
    metaKeywords: a.metaKeywords ?? "",
    canonicalUrl: a.canonicalUrl ?? "",
    ogImage: a.ogImage ?? "",
    structuredData: a.structuredData ?? "",
  };
}

export function ArticleEditor({
  article,
  categories,
}: ArticleEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savingPublish, setSavingPublish] = useState(false);
  const isEdit = !!article;

  const form = useForm<ArticleValues>({
    resolver: zodResolver(articleSchema) as Resolver<ArticleValues>,
    defaultValues: articleToValues(article),
  });

  // Reset form when article prop changes (e.g., navigating between edit pages)
  useEffect(() => {
    form.reset(articleToValues(article));
  }, [article?.id, form]);

  const title = form.watch("title");
  const slug = form.watch("slug");
  const coverImage = form.watch("coverImage");

  // Auto-generate slug from title if empty or matches the auto-slug of previous title
  useEffect(() => {
    if (!isEdit && title && (!slug || slug === toSlug(form.getValues("slug")))) {
      form.setValue("slug", toSlug(title));
    }
  }, [title, isEdit, slug, form]);

  async function submit(values: ArticleValues, publish: boolean) {
    const setSavingState = publish ? setSavingPublish : setSaving;
    setSavingState(true);
    try {
      const published = publish ? true : values.published;
      const publishedAt =
        datetimeLocalToIso(values.publishedAt) ??
        (published ? new Date().toISOString() : null);

      const body = {
        ...values,
        coverImage: values.coverImage || null,
        canonicalUrl: values.canonicalUrl || null,
        ogImage: values.ogImage || null,
        categoryId: values.categoryId || null,
        authorName: values.authorName || null,
        readingTime: values.readingTime || null,
        published,
        publishedAt,
      };

      const url = isEdit
        ? `/api/admin/articles/${article!.id}`
        : "/api/admin/articles";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "ذخیره ناموفق بود");
        return;
      }
      if (publish) {
        toast.success(
          isEdit ? "مقاله به‌روزرسانی و منتشر شد" : "مقاله ساخته و منتشر شد"
        );
      } else {
        toast.success(isEdit ? "مقاله به‌روزرسانی شد" : "مقاله ساخته شد");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSavingState(false);
    }
  }

  const onSave = (v: ArticleValues) => submit(v, false);
  const onSaveAndPublish = (v: ArticleValues) => submit(v, true);

  const savingAny = saving || savingPublish;

  return (
    <div className="space-y-6">
      {/* Top bar: title + back + action buttons (mobile) */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold font-display">
            {isEdit ? "ویرایش مقاله" : "ایجاد مقاله جدید"}
          </h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/articles">
              <ArrowRight className="size-4" />
              بازگشت
            </Link>
          </Button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">محتوای مقاله</CardTitle>
              <CardDescription>
                عنوان، خلاصه و محتوای اصلی مقاله را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field
                label="عنوان"
                required
                error={form.formState.errors.title?.message as string}
              >
                <Input
                  {...form.register("title")}
                  placeholder="عنوان مقاله"
                  className="text-base h-12"
                />
              </Field>

              <Field
                label="اسلاگ (URL)"
                required
                error={form.formState.errors.slug?.message as string}
                hint="به‌صورت خودکار از روی عنوان ساخته می‌شود؛ در صورت نیاز می‌توانید آن را تغییر دهید"
              >
                <Input
                  {...form.register("slug")}
                  placeholder="my-article"
                  dir="ltr"
                  className="font-mono"
                />
              </Field>

              <Field
                label="خلاصه"
                error={form.formState.errors.excerpt?.message as string}
              >
                <Textarea
                  {...form.register("excerpt")}
                  rows={3}
                  placeholder="خلاصه کوتاه مقاله (نمایش در لیست مقالات)"
                />
              </Field>

              <Field
                label="محتوا"
                required
                error={form.formState.errors.content?.message as string}
              >
                <MarkdownEditor
                  value={form.watch("content") ?? ""}
                  onChange={(v) => form.setValue("content", v)}
                  placeholder="محتوای کامل مقاله را به زبان مارک‌داون بنویسید..."
                />
              </Field>

              <Field
                label="آدرس تصویر کاور"
                error={form.formState.errors.coverImage?.message as string}
              >
                <div className="flex gap-3">
                  <Input
                    {...form.register("coverImage")}
                    placeholder="https://example.com/cover.jpg"
                    dir="ltr"
                    className="flex-1"
                  />
                  {coverImage && (
                    <div className="size-12 rounded-md overflow-hidden border bg-muted shrink-0">
                      <img
                        src={coverImage}
                        alt="پیش‌نمایش کاور"
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {!coverImage && (
                    <div className="size-12 rounded-md border bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon className="size-5" />
                    </div>
                  )}
                </div>
              </Field>

              <Field label="برچسب‌ها (با کاما جدا کنید)">
                <Input
                  {...form.register("tags")}
                  placeholder="تعمیر موتور, مشهد, کاربراتور"
                  dir="ltr"
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">وضعیت انتشار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SwitchField
                label="منتشر شده"
                description="مقاله برای عموم قابل مشاهده است"
                checked={form.watch("published")}
                onChange={(v) => form.setValue("published", v)}
              />
              <SwitchField
                label="منتخب"
                description="در صفحه اصلی سایت نمایش داده می‌شود"
                checked={form.watch("featured")}
                onChange={(v) => form.setValue("featured", v)}
              />
              <Field label="تاریخ انتشار">
                <Input
                  type="datetime-local"
                  {...form.register("publishedAt")}
                  dir="ltr"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Category card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">دسته‌بندی</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={form.watch("categoryId") || "none"}
                onValueChange={(v) =>
                  form.setValue("categoryId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="بدون دسته" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— بدون دسته —</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Author + reading time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">اطلاعات نویسنده</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="نام نویسنده">
                <Input
                  {...form.register("authorName")}
                  placeholder="مثلاً علی رضایی"
                />
              </Field>
              <Field label="زمان مطالعه (دقیقه)">
                <Input
                  type="number"
                  min={0}
                  {...form.register("readingTime")}
                  dir="ltr"
                  placeholder="5"
                />
              </Field>
            </CardContent>
          </Card>

          {/* SEO accordion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تنظیمات سئو</CardTitle>
              <CardDescription>
                فیلدهای اختیاری برای بهینه‌سازی موتورهای جستجو
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion
                type="single"
                collapsible
                defaultValue="seo"
                className="w-full"
              >
                <AccordionItem value="seo" className="border-0">
                  <AccordionTrigger className="text-sm font-medium">
                    نمایش فیلدهای سئو
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <Field label="عنوان متا (Meta Title)">
                      <Input
                        {...form.register("metaTitle")}
                        placeholder="حداکثر ۶۰ کاراکتر"
                      />
                    </Field>
                    <Field label="توضیح متا (Meta Description)">
                      <Textarea
                        {...form.register("metaDescription")}
                        rows={3}
                        placeholder="حداکثر ۱۶۰ کاراکتر"
                      />
                    </Field>
                    <Field label="کلمات کلیدی (با کاما)">
                      <Input
                        {...form.register("metaKeywords")}
                        placeholder="تعمیر موتور, مشهد"
                        dir="ltr"
                      />
                    </Field>
                    <Field
                      label="آدرس کانونیکال"
                      error={form.formState.errors.canonicalUrl?.message as string}
                    >
                      <Input
                        {...form.register("canonicalUrl")}
                        placeholder="https://..."
                        dir="ltr"
                      />
                    </Field>
                    <Field
                      label="تصویر Open Graph"
                      error={form.formState.errors.ogImage?.message as string}
                    >
                      <Input
                        {...form.register("ogImage")}
                        placeholder="https://..."
                        dir="ltr"
                      />
                    </Field>
                    <Field label="JSON-LD داده ساختاریافته (اختیاری)">
                      <Textarea
                        {...form.register("structuredData")}
                        rows={4}
                        dir="ltr"
                        placeholder='{"@context":"https://schema.org",...}'
                        className="font-mono text-xs"
                      />
                    </Field>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sticky action bar at the bottom */}
        <div className="lg:col-span-3 sticky bottom-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 mt-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={savingAny}
            >
              <Link href="/admin/articles">
                <ArrowRight className="size-4" />
                انصراف
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit(onSave)}
              disabled={savingAny}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              ذخیره
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSaveAndPublish)}
              disabled={savingAny}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {savingPublish ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              ذخیره و انتشار
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SwitchField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}
