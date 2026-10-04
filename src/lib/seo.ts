import type { Metadata } from "next";
import { db } from "@/lib/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://motormechanic.ir";

export function absoluteUrl(path: string = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface SeoInput {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  slug?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  author?: string | null;
  noIndex?: boolean;
}

export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings?.siteName || "موتور مکانیک";
  const fallbackTitle =
    settings?.metaTitle || `${siteName} | مرکز تخصصی تعمیرات موتور سیکلت`;
  const fallbackDesc =
    settings?.metaDescription ||
    "مرکز تخصصی تعمیرات موتور سیکلت در مشهد با گارانتی و قطعات اصلی";
  const fallbackKeywords = settings?.metaKeywords || "";
  const fallbackOg = settings?.ogImage;

  const title = input.title || fallbackTitle;
  const description = input.description || fallbackDesc;
  const keywords = input.keywords || fallbackKeywords;
  const path = input.slug ? `/${input.slug}` : "/";
  const canonical = input.canonicalUrl || absoluteUrl(path);
  const ogImage = input.ogImage || fallbackOg;

  return {
    title: input.title ? `${input.title}` : fallbackTitle,
    description,
    keywords: keywords ? keywords.split(",").map((k) => k.trim()) : undefined,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: "fa_IR",
      type: input.type || "website",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      publishedTime: input.publishedTime?.toISOString(),
      modifiedTime: input.modifiedTime?.toISOString(),
      authors: input.author ? [input.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// Cached settings fetcher
let _settingsCache: any = null;
let _settingsTime = 0;
export async function getSettings() {
  const now = Date.now();
  if (_settingsCache && now - _settingsTime < 30000) return _settingsCache;
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  _settingsCache = s;
  _settingsTime = now;
  return s;
}

// JSON-LD builders for structured data
export function localBusinessStructuredData(settings: any) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: settings?.siteName || "موتور مکانیک",
    description: settings?.siteDescription,
    image: settings?.ogImage,
    telephone: settings?.phone,
    email: settings?.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address,
      addressLocality: "مشهد",
      addressRegion: "خراسان رضوی",
      addressCountry: "IR",
    },
    openingHours: settings?.workingHours,
    url: SITE_URL,
    sameAs: [
      settings?.instagram ? `https://instagram.com/${settings.instagram}` : "",
      settings?.telegram ? `https://t.me/${settings.telegram}` : "",
    ].filter(Boolean),
    priceRange: "$$",
  };
}

export function serviceStructuredData(service: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "AutoRepair",
      name: "موتور مکانیک",
    },
    areaServed: "مشهد",
  };
}

export function articleStructuredData(article: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: article.authorName || "موتور مکانیک",
    },
    publisher: {
      "@type": "Organization",
      name: "موتور مکانیک",
    },
  };
}

export function breadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
