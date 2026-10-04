"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck, ShieldAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, ROLE_PERMISSIONS, type Role } from "@/lib/roles";

export interface UserFormValue {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  active: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserFormValue | null;
}

const createSchema = z.object({
  username: z
    .string()
    .min(3, "نام کاربری باید حداقل ۳ کاراکتر باشد")
    .max(50)
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "نام کاربری فقط شامل حروف انگلیسی، اعداد و خط تیره باشد"
    ),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  name: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  role: z.string(),
  active: z.boolean(),
});

const editSchema = z.object({
  username: z.string(), // not editable, but kept for display
  password: z
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .optional()
    .or(z.literal("")),
  name: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  role: z.string(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof editSchema>;

function defaultValues(user: UserFormValue | null): FormValues {
  if (user) {
    return {
      username: user.username,
      password: "",
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role,
      active: user.active,
    };
  }
  return {
    username: "",
    password: "",
    name: "",
    email: "",
    role: "author",
    active: true,
  };
}

function PermissionMatrix({ role }: { role: string }) {
  if (!role || !(role in ROLE_PERMISSIONS)) {
    return null;
  }
  const perms = ROLE_PERMISSIONS[role as Role];

  const levelLabel: Record<"none" | "own" | "all", string> = {
    none: "—",
    own: "فقط موارد خود",
    all: "همه",
  };

  type TriplePerm = "none" | "own" | "all";
  type BoolPerm = boolean;

  const tripleItems: { label: string; value: TriplePerm }[] = [
    { label: "مقالات", value: perms.articles as TriplePerm },
    { label: "دسته‌بندی‌ها", value: perms.categories as TriplePerm },
    { label: "رسانه", value: perms.media as TriplePerm },
  ];

  const boolItems: { label: string; value: BoolPerm }[] = [
    { label: "خدمات", value: perms.services as BoolPerm },
    { label: "پیام‌ها", value: perms.messages as BoolPerm },
    { label: "تنظیمات سایت", value: perms.settings as BoolPerm },
    { label: "مدیریت کاربران", value: perms.users as BoolPerm },
    { label: "داشبورد", value: perms.dashboard as BoolPerm },
  ];

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-brand-500" />
        <span className="font-medium">سطوح دسترسی نقش {ROLE_LABELS[role as Role]}:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {tripleItems.map((item) => (
          <PermissionRow
            key={item.label}
            label={item.label}
            valueText={levelLabel[item.value]}
            granted={item.value !== "none"}
          />
        ))}
        {boolItems.map((item) => (
          <PermissionRow
            key={item.label}
            label={item.label}
            valueText={item.value ? "دارد" : "ندارد"}
            granted={item.value}
          />
        ))}
      </div>
    </div>
  );
}

function PermissionRow({
  label,
  valueText,
  granted,
}: {
  label: string;
  valueText: string;
  granted: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-background/60 px-2.5 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          "inline-flex items-center gap-1 font-medium " +
          (granted ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")
        }
      >
        {granted ? (
          <ShieldCheck className="size-3.5" />
        ) : (
          <ShieldAlert className="size-3.5" />
        )}
        {valueText}
      </span>
    </div>
  );
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = !!user;

  const schema = isEdit ? editSchema : createSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: defaultValues(user),
  });

  useEffect(() => {
    form.reset(defaultValues(user));
  }, [user, open, form]);

  const watchedRole = form.watch("role");
  const watchedActive = form.watch("active");

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      if (isEdit) {
        // Build update payload — omit username (not editable)
        const body: Record<string, unknown> = {
          name: values.name || null,
          email: values.email || null,
          role: values.role,
          active: values.active,
        };
        if (values.password) {
          body.password = values.password;
        }
        const res = await fetch(`/api/admin/users/${user!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "ذخیره ناموفق بود");
          return;
        }
        toast.success("کاربر به‌روزرسانی شد");
      } else {
        const body = {
          username: values.username,
          password: values.password,
          name: values.name || null,
          email: values.email || null,
          role: values.role,
          active: values.active,
        };
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "ایجاد کاربر ناموفق بود");
          return;
        }
        toast.success("کاربر جدید ساخته شد");
      }
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "ویرایش کاربر" : "افزودن کاربر جدید"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "اطلاعات کاربر و سطوح دسترسی را ویرایش کنید"
              : "یک کاربر جدید با نقش دلخواه بسازید"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Username */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              نام کاربری <span className="text-destructive">*</span>
            </Label>
            <Input
              {...form.register("username")}
              placeholder="مثلاً editor1"
              dir="ltr"
              disabled={isEdit}
              autoComplete="off"
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                نام کاربری قابل تغییر نیست
              </p>
            )}
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">
                {form.formState.errors.username.message as string}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              رمز عبور{" "}
              {!isEdit && <span className="text-destructive">*</span>}
              {isEdit && (
                <span className="text-muted-foreground font-normal">
                  (در صورت تمایل به تغییر وارد کنید)
                </span>
              )}
            </Label>
            <Input
              type="password"
              {...form.register("password")}
              placeholder={isEdit ? "بدون تغییر خالی بگذارید" : "حداقل ۶ کاراکتر"}
              autoComplete="new-password"
              dir="ltr"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">نام نمایشی</Label>
              <Input
                {...form.register("name")}
                placeholder="مثلاً رضا کریمی"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message as string}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">ایمیل</Label>
              <Input
                {...form.register("email")}
                placeholder="user@example.com"
                dir="ltr"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Role select */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              نقش <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedRole}
              onValueChange={(v) => form.setValue("role", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب نقش..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">حساب فعال</span>
              <span className="text-xs text-muted-foreground">
                کاربران غیرفعال نمی‌توانند وارد پنل شوند
              </span>
            </div>
            <Switch
              checked={watchedActive}
              onCheckedChange={(v) => form.setValue("active", v)}
            />
          </div>

          {/* Permission matrix */}
          {watchedRole && <PermissionMatrix role={watchedRole} />}

          <DialogFooter className="flex-row gap-2 justify-end pt-2">
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
              {isEdit ? "ذخیره تغییرات" : "ایجاد کاربر"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
