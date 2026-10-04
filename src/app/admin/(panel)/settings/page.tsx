import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Fetch the singleton settings
  const settings = await db.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          تنظیمات سایت
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          پیکربندی اطلاعات تماس، صفحه اصلی، درباره ما و سئوی سراسری
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
