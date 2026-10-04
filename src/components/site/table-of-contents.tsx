"use client";

import { useEffect, useMemo, useState } from "react";

interface TableOfContentsProps {
  /** markdown content used to extract H2 headings */
  content: string;
}

interface TocItem {
  id: string;
  text: string;
}

function slugify(text: string): string {
  // simple slugify for Persian - keep alphanumerics, replace spaces with -
  return text
    .toString()
    .trim()
    .replace(/[`*_~#>]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .toLowerCase();
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const items = useMemo<TocItem[]>(() => {
    const matches =
      content.match(/^##\s+(.+)$/gm) || content.match(/^###\s+(.+)$/gm) || [];
    return matches.map((m) => {
      const text = m.replace(/^#+\s+/, "").trim();
      const id = slugify(text);
      return { id, text };
    });
  }, [content]);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="فهرست مطالب" className="text-sm">
      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
        فهرست مطالب
      </h3>
      <ul className="space-y-1 border-r-2 border-border pr-3">
        {items.map((it, i) => (
          <li key={i}>
            <a
              href={`#${it.id}`}
              className={`block py-1.5 px-2 rounded-md transition-colors leading-snug ${
                activeId === it.id
                  ? "bg-brand-50 text-brand-700 font-bold border-r-2 -mr-[14px] pr-3 border-brand-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
