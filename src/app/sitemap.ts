import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/data/products";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://example.com"; // TODO: set from env
  const now = new Date().toISOString();
  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];
  for (const p of getAllProducts()) {
    items.push({
      url: `${base}/product/${p.slug}`,
      lastModified: p.createdAt ?? now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }
  return items;
}

