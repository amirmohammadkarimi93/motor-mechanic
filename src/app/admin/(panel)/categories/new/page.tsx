import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CategoryEditor } from "@/components/admin/category-editor";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const [parentCategories, allCategories] = await Promise.all([
    db.category.findMany({
      where: { parentId: null },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.category.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  // Use all categories as potential parents (the form will disable self-selection in edit mode)
  const parentOptions = allCategories.length > 0 ? allCategories : parentCategories;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">داشبورد</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/categories">دسته‌بندی‌ها</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>دسته‌بندی جدید</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title (desktop) */}
      <div className="hidden lg:flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display tracking-tight">
          ایجاد دسته‌بندی / صفحه لندینگ جدید
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
        </Button>
      </div>

      <CategoryEditor parentCategories={parentOptions} />
    </div>
  );
}
