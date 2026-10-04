"use client";

import { useEffect, useState } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/articles/${slug}`;

  const shareTargets = [
    {
      name: "تلگرام",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M22 2L2 9.5l6.5 2L18 6l-7.5 8.5L18 18 22 2z" />
        </svg>
      ),
      bg: "bg-sky-500 hover:bg-sky-600",
    },
    {
      name: "واتساپ",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.3 7.3 0 01-1.3-1.7c-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4a3 3 0 00-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.2z" />
        </svg>
      ),
      bg: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "ایکس",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M18.9 2H22l-7.4 8.5L23 22h-6.8l-5.3-7-6 7H2l8-9L1.4 2h7l4.8 6.4L18.9 2zm-1.2 18h1.8L7.4 4H5.5l12.2 16z" />
        </svg>
      ),
      bg: "bg-ink hover:bg-ink/80",
    },
    {
      name: "کپی لینک",
      href: "#",
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      ),
      bg: "bg-brand-600 hover:bg-brand-700",
    },
  ];

  const handleClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    target: (typeof shareTargets)[number]
  ) => {
    if (target.name === "کپی لینک") {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {shareTargets.map((t) => (
        <a
          key={t.name}
          href={t.href}
          target={t.name === "کپی لینک" ? undefined : "_blank"}
          rel="noopener noreferrer"
          onClick={(e) => handleClick(e, t)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-white rounded-lg px-3 py-2 transition-colors ${t.bg}`}
          aria-label={`اشتراک در ${t.name}`}
        >
          {t.icon}
          {t.name}
        </a>
      ))}
    </div>
  );
}
