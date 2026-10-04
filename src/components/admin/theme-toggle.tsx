"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "حالت روشن" : "حالت تیره"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9 rounded-full"
      suppressHydrationWarning
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
