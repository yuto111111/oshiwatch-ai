import type { MetadataRoute } from "next";
import { SNOW_MAN_MEMBERS } from "@/lib/data/snow-man";

const BASE = "https://devtest.oshikatsu-ai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const entityEntries: MetadataRoute.Sitemap = SNOW_MAN_MEMBERS.map((m) => ({
    url: `${BASE}/entities/${m.name_en}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...entityEntries];
}
