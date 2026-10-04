import { db } from "@/lib/db";
import { ServicesTable } from "@/components/admin/services-table";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt((sp.limit as string) || "10", 10) || 10));
  const search = (sp.search as string) || "";

  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { slug: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.service.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.service.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          خدمات
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مدیریت خدمات مرکز تعمیرات موتور سیکلت
        </p>
      </div>
      <ServicesTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        search={search}
      />
    </div>
  );
}
