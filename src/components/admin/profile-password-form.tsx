"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, LockKeyhole, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "رمز عبور فعلی را وارد کنید"),
    newPassword: z
      .string()
      .min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string().min(1, "تکرار رمز عبور را وارد کنید"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "تکرار رمز عبور با رمز جدید مطابقت ندارد",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfilePasswordForm() {
  const [saving, setSaving] = useState(false);

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordValues) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "تغییر رمز ناموفق بود");
        return;
      }
      toast.success("رمز عبور با موفقیت تغییر کرد");
      form.reset();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 max-w-md"
    >
      <Field
        label="رمز عبور فعلی"
        error={form.formState.errors.currentPassword?.message as string}
      >
        <div className="relative">
          <LockKeyhole className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="password"
            className="pr-10"
            autoComplete="current-password"
            {...form.register("currentPassword")}
          />
        </div>
      </Field>

      <Field
        label="رمز عبور جدید"
        error={form.formState.errors.newPassword?.message as string}
      >
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="password"
            className="pr-10"
            autoComplete="new-password"
            {...form.register("newPassword")}
          />
        </div>
      </Field>

      <Field
        label="تکرار رمز عبور جدید"
        error={form.formState.errors.confirmPassword?.message as string}
      >
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="password"
            className="pr-10"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
        </div>
      </Field>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">نکات امنیتی:</p>
        <ul className="list-disc pr-4 space-y-0.5">
          <li>حداقل ۶ کاراکتر استفاده کنید</li>
          <li>از ترکیب حروف، اعداد و نشانه‌ها استفاده کنید</li>
          <li>این رمز را در جایی دیگر استفاده نکنید</li>
        </ul>
      </div>

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
        تغییر رمز عبور
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
