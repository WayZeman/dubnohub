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

/** Cache homepage for speed; weather/DB stay fresh enough via short revalidate. */
export const revalidate = 120;

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

      <section id="katalog" className="page-shell section-pad scroll-mt-20">
        <div className="mb-9 max-w-xl">
          <p className="section-eyebrow">Каталог</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
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
        <div className="mt-9">
          <Button asChild variant="outline" className="h-10">
            <Link href="/categories">
              Усі категорії
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border/50 bg-secondary/55 py-14 sm:py-16">
        <div className="page-shell">
          <div className="mb-9 flex items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="section-eyebrow">Рейтинг</p>
              <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Варто відвідати
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Місця з найвищим рейтингом у довіднику.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="hidden h-10 shrink-0 border-border/80 bg-card sm:inline-flex"
            >
              <Link href="/places?rating=4">
                Більше
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((place, i) => (
              <PlaceCard key={place.id} place={place} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section-pad">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="section-eyebrow">Оновлення</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Нещодавно додані
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Нові точки, які щойно зʼявилися в каталозі.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden h-10 shrink-0 sm:inline-flex">
            <Link href="/places">Усі місця</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 80% at 90% 20%, white, transparent)",
          }}
          aria-hidden
        />
        <div className="page-shell relative flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
          <div className="max-w-lg">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary-foreground/70 uppercase">
              Навігація
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-primary-foreground sm:text-3xl">
              Усі точки на одній мапі
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
              Фільтруйте категорії й операторів пошти — і відкривайте потрібну
              адресу за секунди.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 w-full shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:h-11 sm:w-auto"
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
