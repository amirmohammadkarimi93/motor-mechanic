import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "موتور مکانیک | مرکز تخصصی تعمیرات موتور سیکلت در مشهد",
    template: "%s | موتور مکانیک",
  },
  description:
    "مرکز تخصصی تعمیرات موتور سیکلت در مشهد. تعمیر انواع موتور سیکلت‌های گلکسی، بنلی، کراس، آپریلیا و سایر برندها با گارانتی و خدمات حرفه‌ای.",
  keywords: [
    "تعمیر موتور سیکلت",
    "تعمیر موتور سیکلت در مشهد",
    "تعمیر موتورگلکسی",
    "تعمیر موتور بنلی",
    "تعمیر موتور کراس",
    "مرکز تخصصی موتور سیکلت",
    "مکانیک موتور سیکلت مشهد",
  ],
  authors: [{ name: "موتور مکانیک" }],
  creator: "موتور مکانیک",
  metadataBase: new URL("https://motormechanic.ir"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "موتور مکانیک | مرکز تخصصی تعمیرات موتور سیکلت در مشهد",
    description:
      "مرکز تخصصی تعمیرات موتور سیکلت در مشهد. تعمیر انواع موتور سیکلت‌ها با گارانتی و خدمات حرفه‌ای.",
    url: "https://motormechanic.ir",
    siteName: "موتور مکانیک",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "موتور مکانیک",
    description: "مرکز تخصصی تعمیرات موتور سیکلت در مشهد",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
