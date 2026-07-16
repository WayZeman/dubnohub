import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type PlaceFilters = {
  q?: string;
  category?: string;
  minRating?: number;
  take?: number;
  skip?: number;
};

function placeWhere(filters: PlaceFilters = {}): Prisma.PlaceWhereInput {
  const where: Prisma.PlaceWhereInput = {};

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.minRating != null && filters.minRating > 0) {
    where.rating = { gte: filters.minRating };
  }

  const q = filters.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

const placeCardSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  address: true,
  phone: true,
  rating: true,
  images: true,
  viewCount: true,
  clickCount: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, slug: true, icon: true },
  },
  _count: { select: { reviews: true } },
} satisfies Prisma.PlaceSelect;

export const getCategories = cache(
  unstable_cache(
    async () =>
      prisma.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { places: true } } },
      }),
    ["categories"],
    { revalidate: 120, tags: ["categories"] }
  )
);

export const getCategoryBySlug = cache(async (slug: string) =>
  unstable_cache(
    async () =>
      prisma.category.findUnique({
        where: { slug },
        include: { _count: { select: { places: true } } },
      }),
    ["category-by-slug", slug],
    { revalidate: 120, tags: ["categories", `category:${slug}`] }
  )()
);

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export const searchPlaces = cache(async (filters: PlaceFilters = {}) => {
  const key = JSON.stringify({
    q: filters.q ?? "",
    category: filters.category ?? "",
    minRating: filters.minRating ?? 0,
    take: filters.take ?? 48,
    skip: filters.skip ?? 0,
  });

  return unstable_cache(
    async () =>
      prisma.place.findMany({
        where: placeWhere(filters),
        orderBy: [
          { clickCount: "desc" },
          { viewCount: "desc" },
          { rating: "desc" },
          { createdAt: "desc" },
        ],
        take: filters.take ?? 48,
        skip: filters.skip ?? 0,
        select: placeCardSelect,
      }),
    ["search-places", key],
    { revalidate: 60, tags: ["places"] }
  )();
});

export async function countPlaces(filters: PlaceFilters = {}) {
  return prisma.place.count({ where: placeWhere(filters) });
}

export const getPlaceBySlug = cache(async (slug: string) =>
  unstable_cache(
    async () =>
      prisma.place.findUnique({
        where: { slug },
        include: {
          category: true,
          reviews: {
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
    ["place-by-slug", slug],
    { revalidate: 60, tags: ["places", `place:${slug}`] }
  )()
);

export async function getPlaceById(id: string) {
  return prisma.place.findUnique({
    where: { id },
    include: { category: true },
  });
}

export const getSimilarPlaces = cache(
  async (placeId: string, categoryId: string, take = 4) =>
    unstable_cache(
      async () =>
        prisma.place.findMany({
          where: { categoryId, NOT: { id: placeId } },
          orderBy: { rating: "desc" },
          take,
          select: placeCardSelect,
        }),
      ["similar-places", placeId, categoryId, String(take)],
      { revalidate: 120, tags: ["places"] }
    )()
);

export const getLatestPlaces = cache(async (take = 8) =>
  unstable_cache(
    async () =>
      prisma.place.findMany({
        orderBy: { createdAt: "desc" },
        take,
        select: placeCardSelect,
      }),
    ["latest-places", String(take)],
    { revalidate: 60, tags: ["places"] }
  )()
);

export const getTopPlaces = cache(async (take = 8) =>
  unstable_cache(
    async () =>
      prisma.place.findMany({
        where: { rating: { gt: 0 } },
        orderBy: [
          { clickCount: "desc" },
          { viewCount: "desc" },
          { rating: "desc" },
          { createdAt: "desc" },
        ],
        take,
        select: placeCardSelect,
      }),
    ["top-places", String(take)],
    { revalidate: 60, tags: ["places"] }
  )()
);

export async function getDirectoryStats() {
  const [places, categories, reviews, avg] = await Promise.all([
    prisma.place.count(),
    prisma.category.count(),
    prisma.review.count(),
    prisma.place.aggregate({ _avg: { rating: true } }),
  ]);

  return {
    places,
    categories,
    reviews,
    avgRating: Number((avg._avg.rating ?? 0).toFixed(1)),
  };
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      profession: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUserReviews(userId: string) {
  return prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      place: {
        select: { id: true, title: true, slug: true, images: true },
      },
    },
  });
}

export async function getAllReviewsAdmin() {
  return prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      place: { select: { id: true, title: true, slug: true } },
    },
  });
}

export async function getAllPlacesAdmin() {
  return prisma.place.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { reviews: true } },
    },
  });
}

export const getMapPlaces = cache(
  unstable_cache(
    async () =>
      prisma.place.findMany({
        where: {
          latitude: { not: null },
          longitude: { not: null },
        },
        orderBy: [{ category: { sortOrder: "asc" } }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          address: true,
          latitude: true,
          longitude: true,
          category: {
            select: { slug: true, name: true },
          },
        },
      }),
    ["map-places"],
    { revalidate: 120, tags: ["places", "map"] }
  )
);

export async function recalculatePlaceRating(placeId: string) {
  const agg = await prisma.review.aggregate({
    where: { placeId },
    _avg: { rating: true },
    _count: true,
  });

  const rating =
    agg._count === 0 ? 0 : Number((agg._avg.rating ?? 0).toFixed(1));

  await prisma.place.update({
    where: { id: placeId },
    data: { rating },
  });

  return rating;
}
