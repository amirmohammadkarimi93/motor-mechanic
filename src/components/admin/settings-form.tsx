"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import type { SiteSettings } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { MarkdownEditor } from "@/components/admin/markdown-editor";

type SettingsData = Partial<SiteSettings>;

interface SettingsFormProps {
  initial: SiteSettings | null;
}

// Default values when settings is null
const EMPTY: SettingsData = {
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
  heroBadge: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  heroCtaText: "",
  aboutTitle: "",
  aboutContent: "",
  aboutImage: "",
  features: "[]",
  stats: "[]",
  footerText: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  primaryColor: "",
};

type FeatureItem = { icon: string; title: string; description: string };
type StatItem = { label: string; value: string; suffix: string };

function safeParse<T>(text: string | null | undefined, fallback: T): T {
  try {
    const v = JSON.parse(text || "");
    return Array.isArray(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

function validateColor(value: string): boolean {
  if (!value) return true;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsData>({
    ...EMPTY,
    ...(initial || {}),
  });

  const features = safeParse<FeatureItem[]>(data.features, []);
  const stats = safeParse<StatItem[]>(data.stats, []);

  function set<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // Features manipulation
  function updateFeature(i: number, k: keyof FeatureItem, v: string) {
    const next = [...features];
    next[i] = { ...next[i], [k]: v };
    set("features", JSON.stringify(next));
  }
  function addFeature() {
    const next = [...features, { icon: "Wrench", title: "", description: "" }];
    set("features", JSON.stringify(next));
  }
  function removeFeature(i: number) {
    const next = features.filter((_, idx) => idx !== i);
    set("features", JSON.stringify(next));
  }

  // Stats manipulation
  function updateStat(i: number, k: keyof StatItem, v: string) {
    const next = [...stats];
    next[i] = { ...next[i], [k]: v };
    set("stats", JSON.stringify(next));
  }
  function addStat() {
    const next = [...stats, { label: "", value: "", suffix: "+" }];
    set("stats", JSON.stringify(next));
  }
  function removeStat(i: number) {
    const next = stats.filter((_, idx) => idx !== i);
    set("stats", JSON.stringify(next));
  }

  async function handleSave() {
    if (data.primaryColor && !validateColor(data.primaryColor)) {
      toast.error("فرمت رنگ اصلی معتبر نیست (مثال: #ea580c)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        toast.error(result.error || "ذخیره ناموفق بود");
        return;
      }
      toast.success("تنظیمات ذخیره شد");
      router.refresh();
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="brand" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1">
          <TabsTrigger value="brand">اطلاعات اصلی</TabsTrigger>
          <TabsTrigger value="contact">تماس</TabsTrigger>
          <TabsTrigger value="social">شبکه‌های اجتماعی</TabsTrigger>
          <TabsTrigger value="hero">صفحه اصلی</TabsTrigger>
          <TabsTrigger value="about">درباره ما</TabsTrigger>
          <TabsTrigger value="features">آمار و ویژگی‌ها</TabsTrigger>
          <TabsTrigger value="seo">سئو عمومی</TabsTrigger>
          <TabsTrigger value="theme">رنگ اصلی</TabsTrigger>
        </TabsList>

        {/* Brand */}
        <TabsContent value="brand">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 p-6">
              <Field label="نام سایت">
                <Input
                  value={data.siteName || ""}
                  onChange={(e) => set("siteName", e.target.value)}
                />
              </Field>
              <Field label="متن لوگو">
                <Input
                  value={data.logoText || ""}
                  onChange={(e) => set("logoText", e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="توضیحات سایت (تگلاین)">
                  <Textarea
                    rows={2}
                    value={data.siteDescription || ""}
                    onChange={(e) => set("siteDescription", e.target.value)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="متن فوتر">
                  <Textarea
                    rows={3}
                    value={data.footerText || ""}
                    onChange={(e) => set("footerText", e.target.value)}
                    placeholder="© ۱۴۰۳ موتور مکانیک — تمامی حقوق محفوظ است."
                  />
                </Field>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 p-6">
              <Field label="تلفن">
                <Input
                  dir="ltr"
                  value={data.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
              <Field label="واتساپ">
                <Input
                  dir="ltr"
                  value={data.whatsapp || ""}
                  onChange={(e) => set("whatsapp", e.target.value)}
                />
              </Field>
              <Field label="ایمیل">
                <Input
                  dir="ltr"
                  value={data.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="ساعات کاری">
                <Input
                  value={data.workingHours || ""}
                  onChange={(e) => set("workingHours", e.target.value)}
                  placeholder="شنبه تا پنجشنبه ۹ تا ۱۹"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="آدرس">
                  <Textarea
                    rows={2}
                    value={data.address || ""}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="کد امبد نقشه (Google Maps iframe)">
                  <Textarea
                    rows={4}
                    dir="ltr"
                    className="font-mono text-xs"
                    value={data.mapEmbed || ""}
                    onChange={(e) => set("mapEmbed", e.target.value)}
                    placeholder='<iframe src="https://www.google.com/maps/..." />'
                  />
                </Field>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 p-6">
              <Field label="اینستاگرام">
                <Input
                  dir="ltr"
                  value={data.instagram || ""}
                  onChange={(e) => set("instagram", e.target.value)}
                  placeholder="@motormechanic"
                />
              </Field>
              <Field label="تلگرام">
                <Input
                  dir="ltr"
                  value={data.telegram || ""}
                  onChange={(e) => set("telegram", e.target.value)}
                  placeholder="@motormechanic"
                />
              </Field>
            </div>
          </Card>
        </TabsContent>

        {/* Hero */}
        <TabsContent value="hero">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 p-6">
              <Field label="بَج بالای عنوان">
                <Input
                  value={data.heroBadge || ""}
                  onChange={(e) => set("heroBadge", e.target.value)}
                  placeholder="مرکز تخصصی تعمیرات موتور"
                />
              </Field>
              <Field label="متن دکمه CTA">
                <Input
                  value={data.heroCtaText || ""}
                  onChange={(e) => set("heroCtaText", e.target.value)}
                  placeholder="تماس با ما"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="عنوان اصلی (Hero Title)">
                  <Input
                    value={data.heroTitle || ""}
                    onChange={(e) => set("heroTitle", e.target.value)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="زیرعنوان (Hero Subtitle)">
                  <Textarea
                    rows={3}
                    value={data.heroSubtitle || ""}
                    onChange={(e) => set("heroSubtitle", e.target.value)}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="آدرس تصویر Hero">
                  <Input
                    dir="ltr"
                    value={data.heroImage || ""}
                    onChange={(e) => set("heroImage", e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about">
          <Card className="space-y-4 p-6">
            <Field label="عنوان بخش درباره ما">
              <Input
                value={data.aboutTitle || ""}
                onChange={(e) => set("aboutTitle", e.target.value)}
              />
            </Field>
            <Field label="آدرس تصویر درباره ما">
              <Input
                dir="ltr"
                value={data.aboutImage || ""}
                onChange={(e) => set("aboutImage", e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="محتوای درباره ما (Markdown)">
              <MarkdownEditor
                value={data.aboutContent || ""}
                onChange={(v) => set("aboutContent", v)}
                placeholder="درباره مرکز تعمیرات موتور مکانیک..."
              />
            </Field>
          </Card>
        </TabsContent>

        {/* Features & Stats */}
        <TabsContent value="features">
          <div className="space-y-4">
            <Card>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">ویژگی‌ها</h3>
                    <p className="text-sm text-muted-foreground">
                      کارت‌های ویژگی‌های خدمات
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    type="button"
                  >
                    افزودن ویژگی
                  </Button>
                </div>
                {features.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ویژگی‌ای اضافه نشده است
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {features.map((f, i) => (
                      <div
                        key={i}
                        className="grid gap-2 sm:grid-cols-[120px_1fr_1fr_auto] items-end rounded-lg border p-3"
                      >
                        <Field label="آیکون">
                          <Input
                            dir="ltr"
                            value={f.icon}
                            onChange={(e) =>
                              updateFeature(i, "icon", e.target.value)
                            }
                            placeholder="Wrench"
                          />
                        </Field>
                        <Field label="عنوان">
                          <Input
                            value={f.title}
                            onChange={(e) =>
                              updateFeature(i, "title", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="توضیح">
                          <Input
                            value={f.description}
                            onChange={(e) =>
                              updateFeature(i, "description", e.target.value)
                            }
                          />
                        </Field>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeFeature(i)}
                          type="button"
                          aria-label="حذف ویژگی"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">آمار</h3>
                    <p className="text-sm text-muted-foreground">
                      اعداد آماری صفحه اصلی
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addStat}
                    type="button"
                  >
                    افزودن آمار
                  </Button>
                </div>
                {stats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    موردی اضافه نشده است
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {stats.map((s, i) => (
                      <div
                        key={i}
                        className="grid gap-2 sm:grid-cols-[1fr_120px_120px_auto] items-end rounded-lg border p-3"
                      >
                        <Field label="عنوان">
                          <Input
                            value={s.label}
                            onChange={(e) =>
                              updateStat(i, "label", e.target.value)
                            }
                            placeholder="سال تجربه"
                          />
                        </Field>
                        <Field label="مقدار">
                          <Input
                            dir="ltr"
                            value={s.value}
                            onChange={(e) =>
                              updateStat(i, "value", e.target.value)
                            }
                            placeholder="15"
                          />
                        </Field>
                        <Field label="پسوند">
                          <Input
                            dir="ltr"
                            value={s.suffix}
                            onChange={(e) =>
                              updateStat(i, "suffix", e.target.value)
                            }
                            placeholder="+"
                          />
                        </Field>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeStat(i)}
                          type="button"
                          aria-label="حذف آمار"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <div className="grid gap-4 p-6">
              <Field label="عنوان متا (سراسری)">
                <Input
                  value={data.metaTitle || ""}
                  onChange={(e) => set("metaTitle", e.target.value)}
                  placeholder="60 کاراکتر"
                />
              </Field>
              <Field label="توضیح متا (سراسری)">
                <Textarea
                  rows={3}
                  value={data.metaDescription || ""}
                  onChange={(e) => set("metaDescription", e.target.value)}
                  placeholder="160 کاراکتر"
                />
              </Field>
              <Field label="کلمات کلیدی (با کاما)">
                <Input
                  dir="ltr"
                  value={data.metaKeywords || ""}
                  onChange={(e) => set("metaKeywords", e.target.value)}
                />
              </Field>
              <Field label="تصویر OG (سراسری)">
                <Input
                  dir="ltr"
                  value={data.ogImage || ""}
                  onChange={(e) => set("ogImage", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </Card>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme">
          <Card>
            <div className="p-6 grid gap-4 sm:grid-cols-2">
              <Field label="رنگ اصلی (Primary Color)">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.primaryColor || "#ea580c"}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    className="size-9 rounded-md border border-input cursor-pointer p-1 bg-background"
                    aria-label="انتخاب رنگ"
                  />
                  <Input
                    dir="ltr"
                    value={data.primaryColor || ""}
                    onChange={(e) => set("primaryColor", e.target.value)}
                    placeholder="#ea580c"
                  />
                </div>
              </Field>
              <div className="flex items-end">
                <p className="text-xs text-muted-foreground">
                  برای بازنشانی به رنگ پیش‌فرض نارنجی (#ea580c) این فیلد را خالی
                  کنید.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 flex justify-end gap-2 bg-background/80 backdrop-blur border-t pt-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 min-w-[160px]"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          ذخیره تنظیمات
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
