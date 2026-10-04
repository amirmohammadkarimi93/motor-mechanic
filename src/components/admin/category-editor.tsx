"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
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
  featured: z.boolean(),
  published: z.boolean(),
  order: z.coerce.number().int().min(0),
});

type CategoryValues = z.infer<typeof categorySchema>;

interface CategoryOption {
  id: string;
  title: string;
}

interface CategoryEditorProps {
  category?: CategoryWithRelations | null;
  parentCategories: CategoryOption[];
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

function categoryToValues(
  c: CategoryWithRelations | null | undefined
): CategoryValues {
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

// Resolve a lucide icon by name (PascalCase or kebab-case) — fallback to Wrench.
function resolveIcon(name: string | null | undefined) {
  if (!name) return null;
  const pascal = name
    .split(/[-_\s]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("");
  const Icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const Comp = Icons[pascal] || Icons[name] || Icons.Wrench;
  return Comp;
}

export function CategoryEditor({
  category,
  parentCategories,
}: CategoryEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savingPublish, setSavingPublish] = useState(false);
  const isEdit = !!category;

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryValues>,
    defaultValues: categoryToValues(category),
  });

  useEffect(() => {
    form.reset(categoryToValues(category));
  }, [category?.id, form]);

  const title = form.watch("title");
  const slug = form.watch("slug");
  const image = form.watch("image");
  const iconName = form.watch("icon");

  // Auto-generate slug from title (only while user has not customized it)
  useEffect(() => {
    if (!isEdit && title && (!slug || slug === toSlug(form.getValues("slug")))) {
      form.setValue("slug", toSlug(title));
    }
  }, [title, isEdit, slug, form]);

  async function submit(values: CategoryValues, publish: boolean) {
    const setSavingState = publish ? setSavingPublish : setSaving;
    setSavingState(true);
    try {
      const published = publish ? true : values.published;
      const body = {
        ...values,
        image: values.image || null,
        canonicalUrl: values.canonicalUrl || null,
        ogImage: values.ogImage || null,
        parentId: values.parentId || null,
        published,
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
      if (!res.ok) {
        toast.error(data.error || "ذخیره ناموفق بود");
        return;
      }
      if (publish) {
        toast.success(
          isEdit
            ? "دسته‌بندی به‌روزرسانی و منتشر شد"
            : "دسته‌بندی ساخته و منتشر شد"
        );
      } else {
        toast.success(
          isEdit ? "دسته‌بندی به‌روزرسانی شد" : "دسته‌بندی ساخته شد"
        );
      }
      router.push("/admin/categories");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSavingState(false);
    }
  }

  const onSave = (v: CategoryValues) => submit(v, false);
  const onSaveAndPublish = (v: CategoryValues) => submit(v, true);

  const savingAny = saving || savingPublish;
  const IconPreview = resolveIcon(iconName);

  return (
    <div className="space-y-6">
      {/* Mobile title bar */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <h1 className="text-xl font-bold font-display">
          {isEdit ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی / صفحه لندینگ جدید"}
        </h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/categories">
            <ArrowRight className="size-4" />
            بازگشت
          </Link>
        </Button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">اطلاعات اصلی</CardTitle>
              <CardDescription>
                عنوان، برند و شهر را وارد کنید — این دسته به‌عنوان یک صفحه سئوی
                پویا نمایش داده می‌شود
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
                  placeholder="مثلاً تعمیر موتور گلکسی در مشهد"
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
                  placeholder="repair-galaxy-mashhad"
                  dir="ltr"
                  className="font-mono"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="برند موتور">
                  <Input
                    {...form.register("brand")}
                    placeholder="گلکسی، بنلی، کراس..."
                  />
                </Field>
                <Field label="شهر">
                  <Input
                    {...form.register("city")}
                    placeholder="مشهد، تهران..."
                  />
                </Field>
              </div>

              <Field label="توضیح کوتاه (نمایش در کارت لیست)">
                <Textarea
                  {...form.register("shortDescription")}
                  rows={2}
                  placeholder="توضیح مختصر برای کارت‌های لیست دسته‌بندی‌ها"
                />
              </Field>

              <Field
                label="آدرس تصویر کاور"
                error={form.formState.errors.image?.message as string}
              >
                <div className="flex gap-3">
                  <Input
                    {...form.register("image")}
                    placeholder="https://example.com/image.jpg"
                    dir="ltr"
                    className="flex-1"
                  />
                  {image ? (
                    <div className="size-12 rounded-md overflow-hidden border bg-muted shrink-0">
                      <img
                        src={image}
                        alt="پیش‌نمایش تصویر"
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="size-12 rounded-md border bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon className="size-5" />
                    </div>
                  )}
                </div>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">محتوای صفحه (Markdown)</CardTitle>
              <CardDescription>
                محتوای طولانی سئو — این متن در صفحه /services/[slug] نمایش داده
                می‌شود
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={form.watch("content") ?? ""}
                onChange={(v) => form.setValue("content", v)}
                placeholder="محتوای طولانی سئو برای این صفحه لندینگ..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Display card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">نمایش و انتشار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SwitchField
                label="منتشر شده"
                description="این صفحه در سایت قابل مشاهده است"
                checked={form.watch("published")}
                onChange={(v) => form.setValue("published", v)}
              />
              <SwitchField
                label="منتخب"
                description="در صفحه اصلی به عنوان دسته ویژه نمایش داده می‌شود"
                checked={form.watch("featured")}
                onChange={(v) => form.setValue("featured", v)}
              />
              <Field label="ترتیب نمایش">
                <Input
                  type="number"
                  {...form.register("order")}
                  min={0}
                  dir="ltr"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Icon picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">آیکون</CardTitle>
              <CardDescription>
                نام آیکون از کتابخانه{" "}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                  dir="ltr"
                >
                  lucide.dev
                </a>{" "}
                را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="نام آیکون">
                <Input
                  {...form.register("icon")}
                  placeholder="Bike, Wrench, Cog, Zap..."
                  dir="ltr"
                  className="font-mono"
                />
              </Field>
              {IconPreview && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="size-10 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center ring-1 ring-brand-500/20">
                    <IconPreview className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">پیش‌نمایش</span>
                    <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                      {iconName}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parent category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">دسته والد (اختیاری)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={form.watch("parentId") || "none"}
                onValueChange={(v) =>
                  form.setValue("parentId", v === "none" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="بدون والد (دسته اصلی)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— بدون والد —</SelectItem>
                  {parentCategories.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      disabled={isEdit && c.id === category?.id}
                    >
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        placeholder="تعمیر موتور, مشهد..."
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
                        rows={5}
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
              <Link href="/admin/categories">
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
