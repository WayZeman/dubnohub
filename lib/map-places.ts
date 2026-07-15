import {
  MAP_LAYER_COLORS,
  type MapPlacePoint,
} from "@/lib/map-config";
import {
  getPostalBrandInfo,
  type PostalBrand,
} from "@/lib/postal-brand";

type RawMapPlace = {
  id: string;
  title: string;
  slug: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category: { slug: string; name: string };
};

export function toMapPlacePoints(places: RawMapPlace[]): MapPlacePoint[] {
  const points: MapPlacePoint[] = [];

  for (const place of places) {
    if (place.latitude == null || place.longitude == null) continue;

    const postal = getPostalBrandInfo(place.slug);
    const layerKey = postal?.brand ?? place.category.slug;
    const color =
      MAP_LAYER_COLORS[layerKey] ??
      MAP_LAYER_COLORS[place.category.slug] ??
      "#52637a";

    const label = postal
      ? `${postal.brandLabel} №${postal.number}`
      : place.title;

    points.push({
      id: place.id,
      slug: place.slug,
      title: place.title,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      categorySlug: place.category.slug,
      categoryName: place.category.name,
      layerKey,
      color,
      label,
    });
  }

  return points;
}

export type MapFilterGroup = {
  key: string;
  label: string;
  color: string;
  count: number;
  /** Nested under category slug (e.g. poshta) */
  parent?: string;
};

export function buildMapFilterGroups(
  points: MapPlacePoint[],
  categories: { slug: string; name: string }[]
): MapFilterGroup[] {
  const groups: MapFilterGroup[] = [];

  for (const category of categories) {
    if (category.slug === "poshta") continue;
    groups.push({
      key: category.slug,
      label: category.name,
      color: MAP_LAYER_COLORS[category.slug] ?? "#52637a",
      count: points.filter((p) => p.categorySlug === category.slug).length,
    });
  }

  const postalCount = points.filter((p) => p.categorySlug === "poshta").length;
  if (postalCount > 0) {
    groups.push({
      key: "poshta",
      label: "Пошта",
      color: MAP_LAYER_COLORS.poshta ?? "#52637a",
      count: postalCount,
    });

    const brands: PostalBrand[] = ["nova-poshta", "ukrposhta", "meest"];
    const brandLabels: Record<PostalBrand, string> = {
      "nova-poshta": "Нова Пошта",
      ukrposhta: "Укрпошта",
      meest: "Meest",
    };

    for (const brand of brands) {
      const count = points.filter((p) => p.layerKey === brand).length;
      if (count === 0) continue;
      groups.push({
        key: brand,
        label: brandLabels[brand],
        color: MAP_LAYER_COLORS[brand] ?? "#52637a",
        count,
        parent: "poshta",
      });
    }
  }

  return groups;
}

export function isMapPointVisible(
  point: MapPlacePoint,
  active: Record<string, boolean>
): boolean {
  if (point.categorySlug === "poshta" || point.layerKey !== point.categorySlug) {
    if (!active.poshta) return false;
    if (point.layerKey !== "poshta" && active[point.layerKey] === false) {
      return false;
    }
    return true;
  }

  return active[point.categorySlug] !== false;
}
