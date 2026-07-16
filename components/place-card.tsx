import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { TrackedPlaceLink } from "@/components/tracked-place-link";
import { isPlacePopular } from "@/lib/place-popularity";
import { cn } from "@/lib/utils";

export type PlaceCardData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  rating: number;
  images: string[];
  viewCount: number;
  clickCount: number;
  category: { name: string; slug: string; icon: string };
  _count?: { reviews: number };
};

export function PlaceCard({
  place,
  className,
  priority = false,
}: {
  place: PlaceCardData;
  className?: string;
  priority?: boolean;
}) {
  const image = place.images[0];
  const popular = isPlacePopular({
    rating: place.rating,
    reviewsCount: place._count?.reviews ?? 0,
    viewCount: place.viewCount,
    clickCount: place.clickCount,
  });

  return (
    <TrackedPlaceLink
      placeId={place.id}
      href={`/places/${place.slug}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-border/55 bg-card shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--shadow-float)]",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={place.title}
            fill
            priority={priority}
            quality={72}
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Немає фото
          </div>
        )}
        {popular ? (
          <span className="absolute top-3 left-3 rounded-md bg-primary/95 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-primary-foreground">
            Популярне
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5 p-3.5 sm:space-y-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
            {place.category.name}
          </p>
          <p className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {place.rating > 0 ? place.rating.toFixed(1) : "—"}
          </p>
        </div>
        <h3 className="font-display line-clamp-2 text-base font-semibold tracking-tight text-balance transition-colors group-hover:text-primary sm:text-lg">
          {place.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {place.description}
        </p>
        <p className="flex items-start gap-1.5 pt-0.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 opacity-70" />
          <span className="line-clamp-1">{place.address}</span>
        </p>
      </div>
    </TrackedPlaceLink>
  );
}
