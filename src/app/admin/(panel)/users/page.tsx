import { db } from "@/lib/db";
import { UsersManager, type UserRow } from "@/components/admin/users-manager";
import type { Role } from "@/lib/roles";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ALL_ROLES: Role[] = ["super_admin", "editor", "author", "landing_editor"];

export default async function UsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt((sp.limit as string) || "20", 10) || 20)
  );
  const search = (sp.search as string) || "";
  const roleParam = (sp.role as string) || "";
  const role = ALL_ROLES.includes(roleParam as Role)
    ? (roleParam as Role)
    : "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { username: { contains: search } },
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role) where.role = role;

  const [
    items,
    total,
    superAdminCount,
    editorCount,
    authorCount,
    landingCount,
  ] = await Promise.all([
    db.adminUser.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        _count: {
          select: { articles: true, categories: true, media: true },
        },
      },
    }),
    db.adminUser.count({ where }),
    db.adminUser.count({ where: { role: "super_admin" } }),
    db.adminUser.count({ where: { role: "editor" } }),
    db.adminUser.count({ where: { role: "author" } }),
    db.adminUser.count({ where: { role: "landing_editor" } }),
  ]);

  const rows: UserRow[] = items.map((u) => ({
    ...u,
    createdAt: u.createdAt,
  }));

  const stats: Record<Role, number> = {
    super_admin: superAdminCount,
    editor: editorCount,
    author: authorCount,
    landing_editor: landingCount,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          مدیریت کاربران
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مدیریت کاربران و سطوح دسترسی پنل مدیریت
        </p>
      </div>
      <UsersManager
        items={rows}
        total={total}
        page={page}
        limit={limit}
        search={search}
        role={role}
        stats={stats}
      />
    </div>
  );
}
