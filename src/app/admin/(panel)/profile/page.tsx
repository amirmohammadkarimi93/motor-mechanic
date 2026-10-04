import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfilePasswordForm } from "@/components/admin/profile-password-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const user = await db.adminUser.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { articles: true, categories: true, media: true },
      },
    },
  });
  if (!user) redirect("/admin/login");

  const createdDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(user.createdAt);

  const roleClass: Record<Role, string> = {
    super_admin: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    editor:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    author:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    landing_editor:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          پروفایل من
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مشاهده اطلاعات حساب و تغییر رمز عبور
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">اطلاعات کاربری</CardTitle>
            <CardDescription>اطلاعات حساب شما در سیستم</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center py-2">
              <div
                className={
                  "size-20 rounded-full flex items-center justify-center text-2xl font-bold ring-1 " +
                  roleClass[user.role as Role]
                }
              >
                {(user.name || user.username).slice(0, 2).toUpperCase()}
              </div>
              <div className="mt-3">
                <p className="font-semibold text-lg">
                  {user.name || user.username}
                </p>
                <p className="text-sm text-muted-foreground font-mono" dir="ltr">
                  @{user.username}
                </p>
              </div>
              <Badge
                variant="outline"
                className={"mt-2 border " + roleClass[user.role as Role]}
              >
                {ROLE_LABELS[user.role as Role] || user.role}
              </Badge>
            </div>

            <div className="space-y-2 pt-3 border-t text-sm">
              <InfoRow label="ایمیل" value={user.email || "—"} dir="ltr" />
              <InfoRow label="نام کاربری" value={user.username} dir="ltr" />
              <InfoRow label="تاریخ عضویت" value={createdDate} />
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">آمار محتوای شما</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <StatBox label="مقالات" value={user._count.articles} />
                <StatBox label="دسته‌ها" value={user._count.categories} />
                <StatBox label="رسانه" value={user._count.media} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password change card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">تغییر رمز عبور</CardTitle>
            <CardDescription>
              برای امنیت بیشتر، رمز عبور خود را به‌صورت دوره‌ای تغییر دهید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate" dir={dir}>
        {value}
      </span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2">
      <div className="text-lg font-bold font-display tabular-nums">
        {value.toLocaleString("fa-IR")}
      </div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
