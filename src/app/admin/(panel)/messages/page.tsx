import { db } from "@/lib/db";
import { MessagesClient } from "@/components/admin/messages-client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MessagesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = (sp.filter as string) || "all";
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt((sp.limit as string) || "10", 10) || 10));

  const where = filter === "unread" ? { read: false } : {};

  const [items, total, unreadCount, totalCount] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { read: false } }),
    db.contactMessage.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          پیام‌ها
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          صندوق پیام‌های فرم تماس سایت
        </p>
      </div>
      <MessagesClient
        items={items}
        total={total}
        unreadCount={unreadCount}
        totalCount={totalCount}
        page={page}
        limit={limit}
        filter={filter}
      />
    </div>
  );
}
