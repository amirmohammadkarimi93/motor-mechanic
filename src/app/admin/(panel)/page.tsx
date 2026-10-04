import Link from "next/link";
import {
  FileText,
  Layers,
  Wrench,
  Mail,
  TrendingUp,
  Plus,
  CheckCircle2,
  Eye,
  Clock,
} from "lucide-react";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function formatJalaliDate(date: Date) {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
  href,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "orange" | "blue" | "green" | "purple";
  href: string;
}) {
  const colorMap: Record<string, string> = {
    orange: "bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-brand-500/20",
    blue: "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    purple: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20",
  };
  return (
    <Link href={href} className="block">
      <Card className="relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div
            className={
              "size-10 rounded-lg flex items-center justify-center ring-1 " +
              colorMap[accent]
            }
          >
            <Icon className="size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-display tabular-nums">
            {value}
          </div>
          {sub && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {sub}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  const [
    articlesCount,
    publishedArticlesCount,
    categoriesCount,
    servicesCount,
    unreadMessagesCount,
    totalMessagesCount,
    recentMessages,
    recentArticles,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { published: true } }),
    db.category.count(),
    db.service.count(),
    db.contactMessage.count({ where: { read: false } }),
    db.contactMessage.count(),
    db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            داشبورد
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            خلاصه‌ای از وضعیت سایت موتور مکانیک — سلام {session?.name || session?.username} 👋
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
            <Link href="/admin/articles?new=1">
              <Plus className="size-4" />
              مقاله جدید
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/categories?new=1">
              <Plus className="size-4" />
              دسته‌بندی جدید
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="مقالات"
          value={articlesCount}
          sub={`${publishedArticlesCount} منتشر شده`}
          icon={FileText}
          accent="orange"
          href="/admin/articles"
        />
        <StatCard
          title="دسته‌بندی‌ها"
          value={categoriesCount}
          sub="صفحات سئو"
          icon={Layers}
          accent="blue"
          href="/admin/categories"
        />
        <StatCard
          title="خدمات"
          value={servicesCount}
          sub="خدمات فعال"
          icon={Wrench}
          accent="green"
          href="/admin/services"
        />
        <StatCard
          title="پیام‌های خوانده‌نشده"
          value={unreadMessagesCount}
          sub={`${totalMessagesCount} پیام کل`}
          icon={Mail}
          accent="purple"
          href="/admin/messages"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent messages */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">آخرین پیام‌ها</CardTitle>
              <CardDescription className="text-xs">
                ۵ پیام اخیر کاربران
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/messages">مشاهده همه</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                پیامی دریافت نشده است.
              </p>
            ) : (
              <div className="max-h-96 overflow-y-auto -mx-2">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-right">نام</TableHead>
                      <TableHead className="text-right">موضوع</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        تاریخ
                      </TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMessages.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="max-w-[160px] truncate">
                          {m.subject || "—"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {formatJalaliDate(m.createdAt)}
                        </TableCell>
                        <TableCell>
                          {m.read ? (
                            <Badge variant="secondary" className="text-xs">
                              خوانده‌شده
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="text-xs bg-brand-500 hover:bg-brand-500"
                            >
                              جدید
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent articles */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">آخرین مقالات</CardTitle>
              <CardDescription className="text-xs">
                ۵ مقاله اخیر منتشر شده
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/articles">مشاهده همه</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {recentArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                مقاله‌ای موجود نیست.
              </p>
            ) : (
              <div className="max-h-96 overflow-y-auto -mx-2">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-right">عنوان</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        دسته
                      </TableHead>
                      <TableHead className="text-right">بازدید</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentArticles.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {a.title}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {a.category?.title || "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="size-3" />
                            {a.views.toLocaleString("fa-IR")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {a.published ? (
                            <Badge
                              variant="default"
                              className="text-xs bg-emerald-500 hover:bg-emerald-500"
                            >
                              <CheckCircle2 className="size-3" />
                              منتشر
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="size-3" />
                              پیش‌نویس
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4 text-brand-500" />
            دسترسی سریع
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/articles">مدیریت مقالات</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/categories">مدیریت دسته‌بندی‌ها</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/services">مدیریت خدمات</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/messages">صندوق پیام‌ها</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/settings">تنظیمات سایت</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
