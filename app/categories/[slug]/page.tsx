import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/empty-state";
import { APP_CITY_GENITIVE } from "@/lib/constants";
import { getCategoryBySlug, searchPlaces } from "@/lib/queries";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 120;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Категорію не знайдено" };
  return {
    title: `${category.name} у Дубні`,
    description:
      category.description ||
      `${category.name} ${APP_CITY_GENITIVE} — адреси, контакти та відгуки.`,
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const places = await searchPlaces({ category: slug });

  return (
    <div className="page-shell section-pad space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Категорія
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {category.name} у Дубні
        </h1>
        {category.description ? (
          <p className="max-w-2xl text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </header>

      {places.length === 0 ? (
        <EmptyState
          title="Поки немає місць"
          description="У цій категорії ще немає доданих локацій."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
