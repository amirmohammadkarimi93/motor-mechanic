"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LockKeyhole, User, Bike, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  async function doLogin(e?: React.MouseEvent | React.FormEvent) {
    if (e) e.preventDefault();
    // Validate
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = "نام کاربری را وارد کنید";
    if (!password.trim()) newErrors.password = "رمز عبور را وارد کنید";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "ورود ناموفق بود");
        setLoading(false);
        return;
      }
      toast.success("خوش آمدید!");
      const redirect = searchParams.get("redirect") || "/admin";
      // Use hard navigation to ensure cookie is sent with full page reload
      window.location.href = redirect;
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-2xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <CardHeader className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-30 rounded-full" />
            <div className="relative size-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg ring-1 ring-white/10">
              <Bike className="size-10 text-white" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-display tracking-tight">
            موتور مکانیک
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            پنل مدیریت محتوا — مرکز تخصصی تعمیرات موتور سیکلت
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Use plain div instead of form to avoid native GET submit fallback */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="login-username" className="text-sm font-medium text-foreground">
              نام کاربری
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="login-username"
                type="text"
                autoComplete="off"
                className="pr-10"
                placeholder="نام کاربری خود را وارد کنید"
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    doLogin();
                  }
                }}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              رمز عبور
            </label>
            <div className="relative">
              <LockKeyhole className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="login-password"
                type="password"
                autoComplete="new-password"
                className="pr-10"
                placeholder="رمز عبور خود را وارد کنید"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    doLogin();
                  }
                }}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>
          <Button
            type="button"
            onClick={doLogin}
            className="w-full h-11 text-base bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                در حال ورود...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                ورود به پنل
              </>
            )}
          </Button>
        </div>
        <div className="mt-6 pt-6 border-t border-border/60 text-center">
          <p className="text-xs text-muted-foreground">
            برای بازیابی رمز عبور با مدیر سیستم تماس بگیرید
          </p>
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">اطلاعات تست:</span>
            <br />
            نام کاربری: <code className="text-brand-600 font-mono">admin</code>
            <br />
            رمز عبور: <code className="text-brand-600 font-mono">admin123</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-svh flex items-center justify-center p-4 bg-carbon relative overflow-hidden">
      {/* Industrial hazard stripe accent */}
      <div className="absolute top-0 inset-x-0 h-2 bg-hazard opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-2 bg-hazard opacity-80" />
      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/4 size-72 bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-72 bg-brand-700/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <Loader2 className="size-8 animate-spin text-brand-500" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
