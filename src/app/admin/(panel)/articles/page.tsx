import { db } from "@/lib/db";
import { getSession, getPermissionLevel } from "@/lib/auth";
import { ArticlesTable } from "@/components/admin/articles-table";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt((sp.limit as string) || "10", 10) || 10));
  const search = (sp.search as string) || "";
  const categoryId = (sp.category as string) || "";
  const publishedParam = (sp.published as string) || "";

  // Build where filter
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (publishedParam === "published") where.published = true;
  if (publishedParam === "draft") where.published = false;
  if (publishedParam === "featured") where.featured = true;

  const session = await getSession();
  const permissionLevel = session
    ? getPermissionLevel(session.role, "articles")
    : "none";

  // Authors with "own" permission only see their own articles in the list
  if (permissionLevel === "own" && session) {
    where.authorId = session.id;
  }

  const [items, total, categories] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { id: true, title: true } } },
    }),
    db.article.count({ where }),
    db.category.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          مقالات
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مدیریت مقالات وبلاگ و محتوای سایت
        </p>
      </div>
      <ArticlesTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        search={search}
        categoryId={categoryId}
        published={publishedParam}
        categories={categories}
        currentUserId={session?.id}
        permissionLevel={permissionLevel}
      />
    </div>
  );
}
