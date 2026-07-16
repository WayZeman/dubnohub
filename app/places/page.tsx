import type { Metadata } from "next";
import { Suspense } from "react";

import { PlacesSearch } from "@/components/places-search";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/empty-state";
import { APP_CITY_GENITIVE } from "@/lib/constants";
import { getCategories, searchPlaces } from "@/lib/queries";

export const metadata: Metadata = {
  title: `Місця ${APP_CITY_GENITIVE}`,
  description: `Каталог закладів і локацій ${APP_CITY_GENITIVE}: кафе, аптеки, лікарні, магазини, школи та інше з адресами й відгуками.`,
  alternates: { canonical: "/places" },
  openGraph: {
    title: `Місця ${APP_CITY_GENITIVE}`,
    description: `Каталог закладів і локацій ${APP_CITY_GENITIVE}.`,
    url: "/places",
  },
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    rating?: string;
  }>;
};

export default async function PlacesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const minRating = params.rating ? Number(params.rating) : undefined;

  const [categories, places] = await Promise.all([
    getCategories(),
    searchPlaces({
      q: params.q,
      category: params.category,
      minRating: Number.isFinite(minRating) ? minRating : undefined,
    }),
  ]);

  return (
    <div className="page-shell section-pad space-y-8">
      <header className="space-y-2">
        <p className="section-eyebrow">Каталог</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Місця {APP_CITY_GENITIVE}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Шукайте за назвою, адресою або категорією. Фільтруйте за рейтингом.
        </p>
      </header>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-2xl bg-muted" />}>
        <PlacesSearch
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </Suspense>

      {places.length === 0 ? (
        <EmptyState
          title="Нічого не знайдено"
          description="Спробуйте змінити запит або прибрати фільтри."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
