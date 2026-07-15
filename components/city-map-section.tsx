import { CityMapLoader } from "@/components/city-map-loader";
import {
  buildMapFilterGroups,
  toMapPlacePoints,
} from "@/lib/map-places";
import { getCategories, getMapPlaces } from "@/lib/queries";
import { cn } from "@/lib/utils";

export async function CityMapSection({
  className,
  showHeader = true,
  fullHeight = false,
}: {
  className?: string;
  showHeader?: boolean;
  fullHeight?: boolean;
}) {
  const [places, categories] = await Promise.all([
    getMapPlaces().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const points = toMapPlacePoints(places);
  const filterGroups = buildMapFilterGroups(
    points,
    categories.map((c) => ({ slug: c.slug, name: c.name }))
  );

  if (points.length === 0) return null;

  return (
    <section
      id="mapa"
      className={cn(
        "border-b border-border/50",
        fullHeight && "flex min-h-0 flex-1 flex-col",
        className
      )}
    >
      {showHeader ? (
        <div className="page-shell pt-8 pb-4 sm:pt-10 sm:pb-5">
          <div className="mb-0">
            <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
              Навігація
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Мапа Дубна
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Усі точки довідника на одній карті. Увімкніть або вимкніть категорії
              та операторів пошти.
            </p>
          </div>
        </div>
      ) : null}
      <CityMapLoader
        points={points}
        filterGroups={filterGroups}
        fullHeight={fullHeight}
      />
    </section>
  );
}
