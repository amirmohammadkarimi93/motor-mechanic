// Next.js native robots.txt generator
import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://motormechanic.ir";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/contact"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
