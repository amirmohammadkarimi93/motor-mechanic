import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getSession, getPermissionLevel } from "@/lib/auth";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;

  const [category, allCategories, session] = await Promise.all([
    db.category.findUnique({
      where: { id },
    }),
    db.category.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    getSession(),
  ]);

  if (!category) notFound();
  if (!session) redirect("/admin/login");

  // RBAC: landing_editors have categories: "all" in this app, but if their
  // permission level is "own" they can only edit categories they authored.
  const permLevel = getPermissionLevel(session.role, "categories");
  if (permLevel === "own" && category.authorId !== session.id) {
    redirect("/admin/categories?forbidden=1");
  }

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
            <BreadcrumbPage>{category.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title (desktop) */}
      <div className="hidden lg:flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display tracking-tight truncate max-w-2xl">
          ویرایش: {category.title}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
        </Button>
      </div>

      <CategoryEditor
        category={category}
        parentCategories={allCategories}
      />
    </div>
  );
}
