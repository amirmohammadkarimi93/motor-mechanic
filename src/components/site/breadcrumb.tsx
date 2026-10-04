import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface Crumb {
  label: string;
  href?: string;
}

export function SiteBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb className="container mx-auto px-4 py-3 text-xs md:text-sm">
      <BreadcrumbList className="flex-wrap">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <span key={i} className="inline-flex items-center gap-1.5">
              <BreadcrumbItem>
                {last || !it.href ? (
                  <BreadcrumbPage className="text-foreground font-medium line-clamp-1 max-w-[200px]">
                    {it.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={it.href}>{it.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && (
                <BreadcrumbSeparator>
                  <ChevronLeft className="w-3.5 h-3.5 text-brand-600" />
                </BreadcrumbSeparator>
              )}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
