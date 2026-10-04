"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  slug: string;
}

export function ArticleViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch(`/api/articles/${slug}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return null;
}
