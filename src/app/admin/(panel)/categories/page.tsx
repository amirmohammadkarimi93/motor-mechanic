import { db } from "@/lib/db";
import { getSession, getPermissionLevel } from "@/lib/auth";
import { CategoriesTable } from "@/components/admin/categories-table";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt((sp.limit as string) || "10", 10) || 10));
  const search = (sp.search as string) || "";

  const session = await getSession();
  const permissionLevel = session
    ? getPermissionLevel(session.role, "categories")
    : "none";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
      { brand: { contains: search } },
      { city: { contains: search } },
    ];
  }
  // landing_editor with "own" permission only sees their own categories
  if (permissionLevel === "own" && session) {
    where.authorId = session.id;
  }

  const [items, total] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.category.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          دسته‌بندی‌ها
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مدیریت صفحات سئوی پویا برای خدمات و برندهای موتور سیکلت
        </p>
      </div>
      <CategoriesTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        search={search}
        currentUserId={session?.id}
        permissionLevel={permissionLevel}
      />
    </div>
  );
}
