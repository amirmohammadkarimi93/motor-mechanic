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
import { ArticleEditor } from "@/components/admin/article-editor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;

  const [article, categories, session] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: { category: { select: { id: true, title: true } } },
    }),
    db.category.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    getSession(),
  ]);

  if (!article) notFound();
  if (!session) redirect("/admin/login");

  // RBAC: authors can only edit their own articles
  const permLevel = getPermissionLevel(session.role, "articles");
  if (permLevel === "own" && article.authorId !== session.id) {
    redirect("/admin/articles?forbidden=1");
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
              <Link href="/admin/articles">مقالات</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{article.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page title (desktop) */}
      <div className="hidden lg:flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display tracking-tight truncate max-w-2xl">
          ویرایش: {article.title}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/articles">
            <ArrowRight className="size-4" />
            بازگشت به لیست
          </Link>
        </Button>
      </div>

      <ArticleEditor article={article} categories={categories} />
    </div>
  );
}
