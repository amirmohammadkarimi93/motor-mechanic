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
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import type { CategoryWithRelations } from "./types";

const slugRegex = /^[a-z0-9-]+$/;

const categorySchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(slugRegex, "اسلاگ فقط شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد"),
  brand: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  image: z.string().url("آدرس تصویر معتبر نیست").optional().or(z.literal("")),
  icon: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  canonicalUrl: z
    .string()
    .url("آدرس معتبر نیست")
    .optional()
    .or(z.literal("")),
  ogImage: z.string().url("آدرس معتبر نیست").optional().or(z.literal("")),
  structuredData: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

type CategoryValues = z.infer<typeof categorySchema>;

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithRelations | null;
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

function categoryToValues(c: CategoryWithRelations | null): CategoryValues {
  if (!c) {
    return {
      title: "",
      slug: "",
      brand: "",
      city: "",
      shortDescription: "",
      content: "",
      image: "",
      icon: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      canonicalUrl: "",
      ogImage: "",
      structuredData: "",
      parentId: "",
      featured: false,
      published: true,
      order: 0,
    };
  }
  return {
    title: c.title ?? "",
    slug: c.slug ?? "",
    brand: c.brand ?? "",
    city: c.city ?? "",
    shortDescription: c.shortDescription ?? "",
    content: c.content ?? "",
    image: c.image ?? "",
    icon: c.icon ?? "",
    metaTitle: c.metaTitle ?? "",
    metaDescription: c.metaDescription ?? "",
    metaKeywords: c.metaKeywords ?? "",
    canonicalUrl: c.canonicalUrl ?? "",
    ogImage: c.ogImage ?? "",
    structuredData: c.structuredData ?? "",
    parentId: c.parentId ?? "",
    featured: c.featured,
    published: c.published,
    order: c.order,
  };
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  category,
}: CategoryFormSheetProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = !!category;

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: categoryToValues(category),
  });

  useEffect(() => {
    form.reset(categoryToValues(category));
  }, [category, open]);

  const title = form.watch("title");
  const slug = form.watch("slug");
  useEffect(() => {
    if (!isEdit && title && (!slug || slug === toSlug(form.getValues("slug")))) {
      form.setValue("slug", toSlug(title));
    }
  }, [title, isEdit]);

  async function onSubmit(values: CategoryValues) {
    setSaving(true);
    try {
      const body = {
        ...values,
        image: values.image || null,
        canonicalUrl: values.canonicalUrl || null,
        ogImage: values.ogImage || null,
        parentId: values.parentId || null,
      };
      const url = isEdit
        ? `/api/admin/categories/${category!.id}`
        : "/api/admin/categories";
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
      toast.success(isEdit ? "دسته‌بندی به‌روزرسانی شد" : "دسته‌بندی ساخته شد");
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
            {isEdit ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "اطلاعات این دسته‌بندی (صفحه سئو) را ویرایش کنید"
              : "یک دسته‌بندی جدید (صفحه سئو) بسازید"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
        >
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="عنوان" required error={form.formState.errors.title?.message as string}>
              <Input {...form.register("title")} placeholder="مثلاً تعمیر موتورگلکسی در مشهد" />
            </Field>
            <Field label="اسلاگ (URL)" required error={form.formState.errors.slug?.message as string}>
              <Input {...form.register("slug")} placeholder="repair-galaxy-mashhad" dir="ltr" />
            </Field>
            <Field label="برند موتور">
              <Input {...form.register("brand")} placeholder="گلکسی، بنلی، کراس..." />
            </Field>
            <Field label="شهر">
              <Input {...form.register("city")} placeholder="مشهد، تهران..." />
            </Field>
            <Field label="آیکون (نام lucide)">
              <Input {...form.register("icon")} placeholder="Bike, Wrench, Cog..." dir="ltr" />
            </Field>
            <Field label="ترتیب نمایش">
              <Input type="number" {...form.register("order")} min={0} dir="ltr" />
            </Field>
            <Field label="آدرس تصویر کاور">
              <Input {...form.register("image")} placeholder="https://..." dir="ltr" />
            </Field>
            <Field label="دسته والد (اختیاری)">
              <Input {...form.register("parentId")} placeholder="ID دسته والد" dir="ltr" />
            </Field>
          </div>

          <Field label="توضیح کوتاه (کارت لیست)">
            <Textarea
              {...form.register("shortDescription")}
              rows={2}
              placeholder="توضیح مختصر برای کارت‌های لیست"
            />
          </Field>

          <Field label="محتوای صفحه (Markdown)">
            <MarkdownEditor
              value={form.watch("content") ?? ""}
              onChange={(v) => form.setValue("content", v)}
              placeholder="محتوای طولانی برای صفحه سئو..."
            />
          </Field>

          <div className="flex flex-wrap gap-6 pt-1">
            <SwitchField
              label="منتخب"
              description="نمایش به عنوان دسته ویژه"
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
                <Field label="عنوان متا (Meta Title)">
                  <Input {...form.register("metaTitle")} placeholder="60 کاراکتر" />
                </Field>
                <Field label="توضیح متا (Meta Description)">
                  <Textarea {...form.register("metaDescription")} rows={3} placeholder="160 کاراکتر" />
                </Field>
                <Field label="کلمات کلیدی (با کاما)">
                  <Input {...form.register("metaKeywords")} placeholder="تعمیر موتور, مشهد..." dir="ltr" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="آدرس کانونیکال">
                    <Input {...form.register("canonicalUrl")} placeholder="https://..." dir="ltr" />
                  </Field>
                  <Field label="تصویر OG">
                    <Input {...form.register("ogImage")} placeholder="https://..." dir="ltr" />
                  </Field>
                </div>
                <Field label="JSON-LD داده ساختاریافته (اختیاری)">
                  <Textarea
                    {...form.register("structuredData")}
                    rows={4}
                    placeholder='{"@context":"https://schema.org",...}'
                    dir="ltr"
                    className="font-mono text-xs"
                  />
                </Field>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <SheetFooter className="flex-row gap-2 pt-4 border-t">
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
          </SheetFooter>
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
