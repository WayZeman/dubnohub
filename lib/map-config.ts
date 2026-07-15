import type { StyleSpecification } from "maplibre-gl";
import type { PostalBrand } from "@/lib/postal-brand";

/** Dubno city center [lng, lat] */
export const DUBNO_CENTER: [number, number] = [25.744, 50.417];

/**
 * OpenFreeMap Bright — clean flat street map, no API key.
 * @see https://openfreemap.org/
 */
export const MAP_STREETS_STYLE =
  "https://tiles.openfreemap.org/styles/bright";

/** @deprecated use MAP_STREETS_STYLE */
export const MAP_STYLE = MAP_STREETS_STYLE;

/**
 * Esri World Imagery — free satellite basemap for MapLibre (no API key).
 * Labels via Esri reference overlay for street orientation.
 */
export const MAP_SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  name: "Esri Satellite",
  sources: {
    "esri-imagery": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      maxzoom: 19,
    },
    "esri-labels": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "© Esri",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "esri-imagery",
      type: "raster",
      source: "esri-imagery",
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: "esri-labels",
      type: "raster",
      source: "esri-labels",
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "raster-opacity": 0.9,
      },
    },
  ],
};

export type MapBasemap = "streets" | "satellite";

export function getMapBasemapStyle(
  basemap: MapBasemap
): string | StyleSpecification {
  return basemap === "satellite" ? MAP_SATELLITE_STYLE : MAP_STREETS_STYLE;
}

export const MAP_INITIAL_ZOOM = 13.6;
export const MAP_INITIAL_PITCH = 0;
export const MAP_INITIAL_BEARING = 0;

/** Above this zoom: place name cards appear (circles always remain) */
export const MAP_CARD_ZOOM = 14;

/** Longer labels once this zoom is reached */
export const MAP_LABEL_DETAIL_ZOOM = 15.2;

/** Near street level — fullest place names */
export const MAP_LABEL_FULL_ZOOM = 16.2;

export const MAP_LAYER_COLORS: Record<string, string> = {
  pamyatky: "#5c4d3c",
  poshta: "#52637a",
  "nova-poshta": "#ed1c24",
  ukrposhta: "#003399",
  meest: "#0061AF",
};

export const POSTAL_BRAND_LABELS: Record<PostalBrand, string> = {
  "nova-poshta": "Нова Пошта",
  ukrposhta: "Укрпошта",
  meest: "Meest",
};

export type MapPlacePoint = {
  id: string;
  slug: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  categorySlug: string;
  categoryName: string;
  /** Layer key for filtering (category or postal brand) */
  layerKey: string;
  color: string;
  label: string;
};
