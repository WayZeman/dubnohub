import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

import type { PlaceCardData } from "@/components/place-card";
import { formatAddress } from "@/lib/format";
import { getPostalBrandInfo } from "@/lib/postal-brand";
import { cn } from "@/lib/utils";

/** Dense directory row — best for postal / high-volume lists. */
export function PlaceRow({
  place,
  className,
}: {
  place: PlaceCardData;
  className?: string;
}) {
  const postal = getPostalBrandInfo(place.slug);
  const title = postal ? `№${postal.number}` : place.title;
  const meta = postal
    ? `${postal.brandLabel} · ${postal.kindLabel}`
    : place.category.name;

  return (
    <Link
      href={`/places/${place.slug}`}
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border/60 px-1 py-3.5 transition-colors last:border-b-0 hover:bg-secondary/40 sm:gap-4 sm:px-2",
        className
      )}
    >
      {postal ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={postal.logoSrc}
          alt=""
          className="size-9 object-contain sm:size-10"
        />
      ) : (
        <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-muted-foreground sm:size-10">
          {place.category.name.slice(0, 1)}
        </span>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="truncate text-[15px] font-semibold tracking-tight group-hover:text-primary">
            {title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0 opacity-60" />
          <span className="truncate">{formatAddress(place.address)}</span>
        </p>
      </div>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
