import { db } from "@/lib/db";
import { getSession, getPermissionLevel } from "@/lib/auth";
import { MediaManager } from "@/components/admin/media-manager";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MediaPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) {
    // Middleware should already redirect, but as a safety net:
    return null;
  }

  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const limit = Math.min(
    60,
    Math.max(1, parseInt((sp.limit as string) || "24", 10) || 24)
  );
  const search = (sp.search as string) || "";

  // Author sees only own uploads
  const level = getPermissionLevel(session.role, "media");
  const where: Record<string, unknown> = {};
  if (level === "own") {
    where.uploadedById = session.id;
  }
  if (search) {
    where.OR = [
      { filename: { contains: search } },
      { alt: { contains: search } },
      { title: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    db.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploadedBy: {
          select: { id: true, name: true, username: true },
        },
      },
    }),
    db.media.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            رسانه‌ها
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            کتابخانه تصاویر سایت — آپلود، ویرایش متنی (alt/title) و مدیریت فایل‌ها
          </p>
        </div>
      </div>

      <MediaManager
        items={items.map((m) => ({
          id: m.id,
          filename: m.filename,
          url: m.url,
          alt: m.alt,
          title: m.title,
          caption: m.caption,
          mimeType: m.mimeType,
          size: m.size,
          width: m.width,
          height: m.height,
          createdAt: m.createdAt,
          uploadedBy: m.uploadedBy
            ? {
                id: m.uploadedBy.id,
                name: m.uploadedBy.name,
                username: m.uploadedBy.username,
              }
            : null,
          uploadedById: m.uploadedById,
        }))}
        total={total}
        page={page}
        limit={limit}
        search={search}
        canManageAll={level === "all"}
        currentUserId={session.id}
      />
    </div>
  );
}
