"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().url("آدرس معتبر نیست").optional().or(z.literal("")),
  ogImage: z.string().url("آدرس معتبر نیست").optional().or(z.literal("")),
  structuredData: z.string().optional().nullable(),
});

type ArticleValues = z.infer<typeof articleSchema>;

interface ArticleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: ArticleWithRelations | null;
  categories: { id: string; title: string }[];
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

function articleToValues(a: ArticleWithRelations | null): ArticleValues {
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
    metaTitle: a.metaTitle ?? "",
    metaDescription: a.metaDescription ?? "",
    metaKeywords: a.metaKeywords ?? "",
    canonicalUrl: a.canonicalUrl ?? "",
    ogImage: a.ogImage ?? "",
    structuredData: a.structuredData ?? "",
  };
}

export function ArticleFormSheet({
  open,
  onOpenChange,
  article,
  categories,
}: ArticleFormSheetProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = !!article;

  const form = useForm<ArticleValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: articleToValues(article),
  });

  useEffect(() => {
    form.reset(articleToValues(article));
  }, [article, open]);

  const title = form.watch("title");
  const slug = form.watch("slug");
  useEffect(() => {
    if (!isEdit && title && (!slug || slug === toSlug(form.getValues("slug")))) {
      form.setValue("slug", toSlug(title));
    }
  }, [title, isEdit]);

  async function onSubmit(values: ArticleValues) {
    setSaving(true);
    try {
      const body = {
        ...values,
        coverImage: values.coverImage || null,
        canonicalUrl: values.canonicalUrl || null,
        ogImage: values.ogImage || null,
        categoryId: values.categoryId || null,
        authorName: values.authorName || null,
        readingTime: values.readingTime || null,
        publishedAt: values.published ? new Date().toISOString() : null,
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
      if (!res.ok || !data.ok) {
        toast.error(data.error || "ذخیره ناموفق بود");
        return;
      }
      toast.success(isEdit ? "مقاله به‌روزرسانی شد" : "مقاله ساخته شد");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="p-6 pb-3 border-b bg-muted/30">
          <SheetTitle className="text-xl">
            {isEdit ? "ویرایش مقاله" : "افزودن مقاله"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "اطلاعات این مقاله را ویرایش کنید"
              : "یک مقاله جدید بنویسید"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
        >
          <Field label="عنوان" required error={form.formState.errors.title?.message as string}>
            <Input {...form.register("title")} placeholder="عنوان مقاله" />
          </Field>

          <Field label="اسلاگ (URL)" required error={form.formState.errors.slug?.message as string}>
            <Input {...form.register("slug")} placeholder="my-article" dir="ltr" />
          </Field>

          <Field label="خلاصه" error={form.formState.errors.excerpt?.message as string}>
            <Textarea
              {...form.register("excerpt")}
              rows={2}
              placeholder="خلاصه کوتاه مقاله (نمایش در لیست)"
            />
          </Field>

          <Field label="محتوا" required error={form.formState.errors.content?.message as string}>
            <MarkdownEditor
              value={form.watch("content") ?? ""}
              onChange={(v) => form.setValue("content", v)}
              placeholder="محتوای کامل مقاله..."
            />
          </Field>

          <Field label="آدرس تصویر کاور">
            <Input {...form.register("coverImage")} placeholder="https://..." dir="ltr" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="دسته‌بندی">
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
            </Field>
            <Field label="نام نویسنده">
              <Input {...form.register("authorName")} placeholder="نام نویسنده" />
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
            <Field label="برچسب‌ها (با کاما)">
              <Input
                {...form.register("tags")}
                placeholder="تعمیر موتور, مشهد"
                dir="ltr"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <SwitchField
              label="منتخب"
              description="نمایش در صفحه اصلی"
              checked={form.watch("featured")}
              onChange={(v) => form.setValue("featured", v)}
            />
            <SwitchField
              label="منتشر"
              description="در دسترس عموم"
              checked={form.watch("published")}
              onChange={(v) => form.setValue("published", v)}
            />
          </div>

          {/* SEO accordion */}
          <Accordion type="single" collapsible className="rounded-lg border px-4">
            <AccordionItem value="seo" className="border-0">
              <AccordionTrigger className="text-base font-semibold">
                تنظیمات سئو
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Field label="عنوان متا">
                  <Input {...form.register("metaTitle")} placeholder="60 کاراکتر" />
                </Field>
                <Field label="توضیح متا">
                  <Textarea
                    {...form.register("metaDescription")}
                    rows={3}
                    placeholder="160 کاراکتر"
                  />
                </Field>
                <Field label="کلمات کلیدی (با کاما)">
                  <Input {...form.register("metaKeywords")} dir="ltr" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="آدرس کانونیکال">
                    <Input {...form.register("canonicalUrl")} dir="ltr" />
                  </Field>
                  <Field label="تصویر OG">
                    <Input {...form.register("ogImage")} dir="ltr" />
                  </Field>
                </div>
                <Field label="JSON-LD (اختیاری)">
                  <Textarea
                    {...form.register("structuredData")}
                    rows={4}
                    dir="ltr"
                    className="font-mono text-xs"
                  />
                </Field>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-row gap-2 pt-4 border-t sticky bottom-0 bg-background py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              ذخیره
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
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
    <div className="flex items-start gap-3 rounded-lg border p-3 flex-1 min-w-[160px]">
      <Switch checked={checked} onCheckedChange={onChange} />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  );
}
