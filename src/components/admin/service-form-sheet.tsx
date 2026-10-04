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
import type { ServiceRow } from "./types";

const slugRegex = /^[a-z0-9-]+$/;

const serviceSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(slugRegex, "اسلاگ فقط شامل حروف کوچک، اعداد و خط تیره"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  image: z.string().url("آدرس معتبر نیست").optional().or(z.literal("")),
  price: z.string().optional().nullable(),
  features: z.string().optional().nullable(),
  published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

type ServiceValues = z.infer<typeof serviceSchema>;

interface ServiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceRow | null;
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

function parseFeatures(text: string): string {
  try {
    const arr = JSON.parse(text);
    if (Array.isArray(arr)) return arr.map(String).join("\n");
  } catch {
    /* fall through */
  }
  return text || "";
}

function stringifyFeatures(text: string | null | undefined): string {
  const list = (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(list);
}

function serviceToValues(s: ServiceRow | null): ServiceValues {
  if (!s) {
    return {
      title: "",
      slug: "",
      description: "",
      icon: "Wrench",
      image: "",
      price: "",
      features: "",
      published: true,
      order: 0,
    };
  }
  return {
    title: s.title ?? "",
    slug: s.slug ?? "",
    description: s.description ?? "",
    icon: s.icon ?? "Wrench",
    image: s.image ?? "",
    price: s.price ?? "",
    features: parseFeatures(s.features || "[]"),
    published: s.published,
    order: s.order,
  };
}

export function ServiceFormSheet({
  open,
  onOpenChange,
  service,
}: ServiceFormSheetProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = !!service;

  const form = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: serviceToValues(service),
  });

  useEffect(() => {
    form.reset(serviceToValues(service));
  }, [service, open]);

  const title = form.watch("title");
  const slug = form.watch("slug");
  useEffect(() => {
    if (!isEdit && title && (!slug || slug === toSlug(form.getValues("slug")))) {
      form.setValue("slug", toSlug(title));
    }
  }, [title, isEdit]);

  async function onSubmit(values: ServiceValues) {
    setSaving(true);
    try {
      const body = {
        ...values,
        image: values.image || null,
        features: stringifyFeatures(values.features),
      };
      const url = isEdit
        ? `/api/admin/services/${service!.id}`
        : "/api/admin/services";
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
      toast.success(isEdit ? "خدمت به‌روزرسانی شد" : "خدمت ساخته شد");
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
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-3 border-b bg-muted/30">
          <SheetTitle className="text-xl">
            {isEdit ? "ویرایش خدمت" : "افزودن خدمت"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "اطلاعات این خدمت را ویرایش کنید"
              : "یک خدمت جدید ثبت کنید"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="عنوان" required error={form.formState.errors.title?.message as string}>
              <Input {...form.register("title")} placeholder="عنوان خدمت" />
            </Field>
            <Field label="اسلاگ" required error={form.formState.errors.slug?.message as string}>
              <Input {...form.register("slug")} placeholder="service-slug" dir="ltr" />
            </Field>
            <Field label="آیکون (نام lucide)">
              <Input {...form.register("icon")} placeholder="Wrench" dir="ltr" />
            </Field>
            <Field label="قیمت">
              <Input
                {...form.register("price")}
                placeholder="توافقی / از ۵۰۰ هزار تومان"
              />
            </Field>
            <Field label="آدرس تصویر">
              <Input {...form.register("image")} placeholder="https://..." dir="ltr" />
            </Field>
            <Field label="ترتیب نمایش">
              <Input type="number" min={0} {...form.register("order")} dir="ltr" />
            </Field>
          </div>

          <Field label="توضیحات">
            <Textarea
              {...form.register("description")}
              rows={3}
              placeholder="توضیحات خدمت"
            />
          </Field>

          <Field label="ویژگی‌ها (هر خط یک مورد)">
            <Textarea
              {...form.register("features")}
              rows={5}
              placeholder={"بررسی موتور\nتعویض روغن\nگارانتی ۶ ماه"}
            />
          </Field>

          <div className="flex gap-6 pt-1">
            <SwitchField
              label="منتشر"
              description="نمایش در سایت"
              checked={form.watch("published")}
              onChange={(v) => form.setValue("published", v)}
            />
          </div>

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
