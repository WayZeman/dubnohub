import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import { cn } from "@/lib/utils";

export type PlaceCardData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  rating: number;
  images: string[];
  featured?: boolean;
  category: { name: string; slug: string; icon: string };
  _count?: { reviews: number };
};

export function PlaceCard({
  place,
  className,
}: {
  place: PlaceCardData;
  className?: string;
}) {
  const image = place.images[0];

  return (
    <Link
      href={`/places/${place.slug}`}
      className={cn(
        "group interactive-surface block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={place.title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Немає фото
          </div>
        )}
        {place.featured ? (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
            Топ
          </span>
        ) : null}
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {place.category.name}
          </p>
          <p className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {place.rating > 0 ? place.rating.toFixed(1) : "—"}
          </p>
        </div>
        <h3 className="font-display line-clamp-3 text-lg font-semibold tracking-tight text-balance transition-colors group-hover:text-primary">
          {place.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {place.description}
        </p>
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-1">{place.address}</span>
        </p>
      </div>
    </Link>
  );
}
