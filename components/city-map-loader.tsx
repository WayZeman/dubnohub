"use client";

import dynamic from "next/dynamic";

import type { MapFilterGroup } from "@/lib/map-places";
import type { MapPlacePoint } from "@/lib/map-config";

const CityMap = dynamic(
  () => import("@/components/city-map").then((m) => m.CityMap),
  {
    ssr: false,
    loading: () => (
      <div className="city-map-shell flex h-[min(72vh,640px)] min-h-[22rem] items-center justify-center bg-secondary/40 text-sm text-muted-foreground">
        Завантаження мапи…
      </div>
    ),
  }
);

export function CityMapLoader({
  points,
  filterGroups,
  fullHeight = false,
}: {
  points: MapPlacePoint[];
  filterGroups: MapFilterGroup[];
  fullHeight?: boolean;
}) {
  return (
    <CityMap
      points={points}
      filterGroups={filterGroups}
      fullHeight={fullHeight}
    />
  );
}
