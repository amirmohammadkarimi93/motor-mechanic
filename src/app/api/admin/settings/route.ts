import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const settingsSchema = z.object({
  // Brand
  siteName: z.string().optional().nullable(),
  siteDescription: z.string().optional().nullable(),
  logoText: z.string().optional().nullable(),
  // Contact
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  workingHours: z.string().optional().nullable(),
  mapEmbed: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  // About
  aboutTitle: z.string().optional().nullable(),
  aboutContent: z.string().optional().nullable(),
  aboutImage: z.string().optional().nullable(),
  // Hero
  heroBadge: z.string().optional().nullable(),
  heroTitle: z.string().optional().nullable(),
  heroSubtitle: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  heroCtaText: z.string().optional().nullable(),
  // Homepage extras
  features: z.string().optional().nullable(),
  stats: z.string().optional().nullable(),
  // Footer
  footerText: z.string().optional().nullable(),
  // Global SEO
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  // Theme
  primaryColor: z.string().optional().nullable(),
});

const DEFAULT_SETTINGS = {
  id: "singleton",
  siteName: "موتور مکانیک",
  siteDescription: "",
  logoText: "موتور مکانیک",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  workingHours: "",
  mapEmbed: "",
  instagram: "",
  telegram: "",
  aboutTitle: "",
  aboutContent: "",
  aboutImage: "",
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  heroCtaText: "",
  features: "",
  stats: "",
  footerText: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  primaryColor: "#ea580c",
};

export async function GET() {
  let settings = await db.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    settings = await db.siteSettings.create({ data: DEFAULT_SETTINGS });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  // Ensure singleton row exists
  let existing = await db.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!existing) {
    existing = await db.siteSettings.create({ data: DEFAULT_SETTINGS });
  }

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updateData[key] = value;
  }

  try {
    const updated = await db.siteSettings.update({
      where: { id: "singleton" },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update settings error:", err);
    return NextResponse.json(
      { error: "به‌روزرسانی تنظیمات با خطا مواجه شد" },
      { status: 500 }
    );
  }
}
