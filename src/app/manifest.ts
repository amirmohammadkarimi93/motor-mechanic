// Web app manifest for PWA support
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "موتور مکانیک - مرکز تخصصی تعمیرات موتور سیکلت",
    short_name: "موتور مکانیک",
    description: "مرکز تخصصی تعمیرات موتور سیکلت در مشهد",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    lang: "fa-IR",
    dir: "rtl",
  };
}
