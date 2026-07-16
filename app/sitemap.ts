import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/map`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/places`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${base}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  try {
    const [categories, places] = await Promise.all([
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.place.findMany({
        select: { slug: true, updatedAt: true, featured: true, rating: true },
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
      }),
    ]);

    return [
      ...staticEntries,
      ...categories.map((category) => ({
        url: `${base}/categories/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...places.map((place) => ({
        url: `${base}/places/${place.slug}`,
        lastModified: place.updatedAt,
        changeFrequency: "weekly" as const,
        priority: place.featured ? 0.85 : place.rating >= 4 ? 0.75 : 0.65,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
