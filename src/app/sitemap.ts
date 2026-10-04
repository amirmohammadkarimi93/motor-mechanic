// Next.js native sitemap generator
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://motormechanic.ir";

export const revalidate = 3600; // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  // Dynamic category pages
  const categories = await db.category.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/services/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic article pages
  const articles = await db.article.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true, publishedAt: true },
  });
  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
