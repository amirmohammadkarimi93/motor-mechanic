import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود به پنل مدیریت",
  description: "ورود به پنل مدیریت سایت موتور مکانیک",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
