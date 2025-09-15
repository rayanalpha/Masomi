import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/data/products";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
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

