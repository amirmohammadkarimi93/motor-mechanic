"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Bike, Moon, Sun, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "خانه" },
  { href: "/about", label: "درباره ما" },
  { href: "/articles", label: "مقالات" },
  { href: "/services", label: "دسته‌بندی‌ها" },
  { href: "/contact", label: "تماس با ما" },
];

export function SiteHeader({ phone, siteName }: { phone?: string; siteName?: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-background/40 backdrop-blur-sm"
      )}
    >
      {/* Top utility bar */}
      <div className="hidden md:block bg-ink text-white/80 text-xs">
        <div className="container mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 hover:text-brand-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{phone}</span>
              </a>
            )}
            <span className="text-white/60">|</span>
            <span>شنبه تا پنجشنبه، ۹ صبح تا ۸ شب</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hover:text-brand-400 transition-colors flex items-center gap-1"
            >
              پنل مدیریت
              <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500/30 blur-md rounded-full group-hover:bg-brand-500/50 transition-all" />
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Bike className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg md:text-xl font-extrabold text-foreground">
                {siteName || "موتور مکانیک"}
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground tracking-wide">
                MOTOR MECHANIC
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "text-brand-700 bg-brand-50"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg"
                aria-label="تغییر تم"
              >
                <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
            <Button
              asChild
              className="hidden md:flex bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-md shadow-brand-600/30"
            >
              <a href={`tel:${phone || ""}`}>
                <Phone className="w-4 h-4 ml-2" />
                تماس فوری
              </a>
            </Button>

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden rounded-lg"
                  aria-label="منو"
                >
                  {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] bg-background p-0"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 p-5 border-b border-border">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                      <Bike className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-display text-lg font-bold">
                      {siteName || "موتور مکانیک"}
                    </span>
                  </div>
                  <nav className="flex flex-col p-3 gap-1 flex-1">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between",
                          isActive(item.href)
                            ? "text-brand-700 bg-brand-50"
                            : "text-foreground/80 hover:bg-muted"
                        )}
                      >
                        {item.label}
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border space-y-2">
                    <Button
                      asChild
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                    >
                      <a href={`tel:${phone || ""}`}>
                        <Phone className="w-4 h-4 ml-2" />
                        تماس فوری
                      </a>
                    </Button>
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="block text-center text-xs text-muted-foreground hover:text-foreground py-2"
                    >
                      پنل مدیریت →
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
