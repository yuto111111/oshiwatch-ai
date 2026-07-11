import type { MetadataRoute } from "next";
import { OSHI_LIST } from "@/lib/data/oshi-list";

const BASE = "https://devtest.oshikatsu-ai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/dashboard`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const entityEntries: MetadataRoute.Sitemap = OSHI_LIST.map((m) => ({
    url: `${BASE}/entities/${m.name_en}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...entityEntries];
}
