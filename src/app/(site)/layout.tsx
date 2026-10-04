import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { localBusinessStructuredData } from "@/lib/seo";

async function getLayoutData() {
  const [settings, categories] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "singleton" } }),
    db.category.findMany({
      where: { published: true },
      select: { title: true, slug: true },
      orderBy: { order: "asc" },
    }),
  ]);
  return { settings, categories };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, categories } = await getLayoutData();
  const structuredData = localBusinessStructuredData(settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteHeader
        phone={settings?.phone || undefined}
        siteName={settings?.siteName || undefined}
      />
      <main className="flex-1 flex flex-col">{children}</main>
      <SiteFooter settings={settings} categories={categories} />
    </>
  );
}
