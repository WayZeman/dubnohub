import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { CategoryCard } from "@/components/category-card";
import { HomeHero } from "@/components/home-hero";
import { PlaceCard } from "@/components/place-card";
import { Button } from "@/components/ui/button";
import {
  APP_CITY_LOCATIVE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/constants";
import { getCategories, getLatestPlaces, getTopPlaces } from "@/lib/queries";
import { getDubnoWeather } from "@/lib/weather";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, latest, top, weather] = await Promise.all([
    getCategories().catch(() => []),
    getLatestPlaces(8).catch(() => []),
    getTopPlaces(8).catch(() => []),
    getDubnoWeather(),
  ]);

  const popular = categories.slice(0, 8);

  return (
    <div>
      <HomeHero weather={weather} />

      <section className="page-shell section-pad">
        <div className="mb-8 max-w-xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Що шукаєте
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Оберіть категорію — від памʼяток і пошти до кафе та лікарень{" "}
            {APP_CITY_LOCATIVE}.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/categories">
              Усі категорії
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/70 py-14 sm:py-16">
        <div className="page-shell">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
                Рейтинг
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Варто відвідати
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70 sm:text-base">
                Місця з найвищим рейтингом у довіднику.
              </p>
            </div>
            <Button asChild variant="outline" className="hidden shrink-0 border-border bg-card sm:inline-flex">
              <Link href="/places?rating=4">
                Більше
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-pad">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Нещодавно додані
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Нові точки, які щойно зʼявилися в каталозі.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/places">Усі місця</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      <section className="bg-primary">
        <div className="page-shell flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
          <div className="max-w-lg">
            <p className="text-xs font-medium tracking-[0.16em] text-primary-foreground/75 uppercase">
              Навігація
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-primary-foreground sm:text-3xl">
              Усі точки на одній мапі
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              Фільтруйте категорії й операторів пошти — і відкривайте потрібну
              адресу за секунди.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-11 shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/map">
              Відкрити мапу
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
