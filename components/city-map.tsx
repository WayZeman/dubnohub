"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import { Layers, Map as MapIcon, Maximize2, Minimize2, Satellite, Crosshair, Settings, Minus, Plus, LocateFixed, Expand } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DUBNO_CENTER,
  getMapBasemapStyle,
  MAP_CARD_ZOOM,
  MAP_INITIAL_BEARING,
  MAP_INITIAL_PITCH,
  MAP_INITIAL_ZOOM,
  MAP_LABEL_DETAIL_ZOOM,
  MAP_LABEL_FULL_ZOOM,
  type MapBasemap,
  type MapPlacePoint,
} from "@/lib/map-config";
import {
  isMapPointVisible,
  type MapFilterGroup,
} from "@/lib/map-places";

import "maplibre-gl/dist/maplibre-gl.css";

const SOURCE_ID = "places";
const LAYER_GLOW = "places-glow";
const LAYER_DOTS = "places-dots";
const MARKER_LEAVE_MS = 200;

type ScreenBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type MarkerState = {
  marker: maplibregl.Marker;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncateLabel(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function labelForZoom(label: string, zoom: number): string {
  if (zoom >= MAP_LABEL_FULL_ZOOM) return truncateLabel(label, 44);
  if (zoom >= MAP_LABEL_DETAIL_ZOOM) return truncateLabel(label, 30);
  return truncateLabel(label, 16);
}

function collisionPadding(zoom: number): number {
  if (zoom >= MAP_LABEL_FULL_ZOOM) return 1;
  if (zoom >= MAP_LABEL_DETAIL_ZOOM) return 3;
  return 6;
}

function estimateCardBox(
  screenX: number,
  screenY: number,
  text: string
): ScreenBox {
  const width = Math.min(32 + text.length * 6.4, 176);
  const height = 38;
  return {
    left: screenX - width / 2,
    right: screenX + width / 2,
    top: screenY - height,
    bottom: screenY - 4,
  };
}

function boxesOverlap(a: ScreenBox, b: ScreenBox, pad: number): boolean {
  return !(
    a.right + pad < b.left ||
    a.left - pad > b.right ||
    a.bottom + pad < b.top ||
    a.top - pad > b.bottom
  );
}

/** Hide OSM POI icons/labels so only directory places show as markers. */
function hideBasemapPois(map: MapLibreMap) {
  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    const sourceLayer = "source-layer" in layer ? layer["source-layer"] : "";
    const id = layer.id.toLowerCase();
    const isPoi =
      sourceLayer === "poi" ||
      sourceLayer === "aerodrome_label" ||
      sourceLayer === "housenumber" ||
      id.startsWith("poi") ||
      id.includes("poi_");

    if (isPoi && map.getLayer(layer.id)) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  }
}

function buildGeoJson(
  points: MapPlacePoint[],
  active: Record<string, boolean>
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points
      .filter((p) => isMapPointVisible(p, active))
      .map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          id: p.id,
          slug: p.slug,
          title: p.title,
          label: p.label,
          address: p.address,
          color: p.color,
          category: p.categoryName,
        },
      })),
  };
}

function ensurePlacesLayers(
  map: MapLibreMap,
  data: GeoJSON.FeatureCollection
) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, { type: "geojson", data });
  } else {
    (map.getSource(SOURCE_ID) as GeoJSONSource).setData(data);
  }

  if (!map.getLayer(LAYER_GLOW)) {
    map.addLayer({
      id: LAYER_GLOW,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11,
          10,
          15,
          14,
        ],
        "circle-color": ["get", "color"],
        "circle-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          MAP_CARD_ZOOM - 0.4,
          0.22,
          MAP_CARD_ZOOM + 0.4,
          0.1,
        ],
        "circle-blur": 0.55,
      },
    });
  }

  if (!map.getLayer(LAYER_DOTS)) {
    map.addLayer({
      id: LAYER_DOTS,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11,
          5.5,
          15,
          7,
        ],
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2.25,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.98,
      },
    });
  }
}

function computeScaleBar(map: MapLibreMap, maxWidth = 112): { label: string; width: number } {
  const y = map.getContainer().clientHeight / 2;
  const left = map.unproject([0, y]);
  const right = map.unproject([maxWidth, y]);
  const maxMeters = left.distanceTo(right);

  const candidates = [
    1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000,
  ];
  let distance = candidates[0]!;
  for (const value of candidates) {
    if (value < maxMeters) distance = value;
  }

  const width = Math.max(28, (distance / maxMeters) * maxWidth);
  const label =
    distance >= 1000 ? `${distance / 1000} км` : `${distance} м`;

  return { label, width };
}

function createPinElement(point: MapPlacePoint, text: string): HTMLAnchorElement {
  const el = document.createElement("a");
  el.href = `/places/${encodeURIComponent(point.slug)}`;
  el.className = "map-place-pin map-place-pin--enter";
  el.title = point.title;
  el.setAttribute("aria-label", point.label);
  el.innerHTML = `
    <span class="map-place-pin__card">
      <span class="map-place-pin__dot" style="background:${escapeHtml(point.color)}"></span>
      <span class="map-place-pin__text">${escapeHtml(text)}</span>
    </span>
    <span class="map-place-pin__arrow" aria-hidden="true"></span>
  `;
  return el;
}

function playEnter(el: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.remove("map-place-pin--enter");
    });
  });
}

function removeMarkerAnimated(state: MarkerState): Promise<void> {
  const el = state.marker.getElement();
  el.classList.add("map-place-pin--leave");
  el.classList.remove("map-place-pin--enter");
  return new Promise((resolve) => {
    window.setTimeout(() => {
      state.marker.remove();
      resolve();
    }, MARKER_LEAVE_MS);
  });
}

function clearMarkersImmediate(
  markers: globalThis.Map<string, MarkerState>
) {
  for (const state of markers.values()) state.marker.remove();
  markers.clear();
}

function pickLabeledPoints(
  map: MapLibreMap,
  points: MapPlacePoint[],
  active: Record<string, boolean>
): Array<{ point: MapPlacePoint; text: string }> {
  const zoom = map.getZoom();
  if (zoom < MAP_CARD_ZOOM) return [];

  const pad = collisionPadding(zoom);
  const centerScreen = map.project(map.getCenter());
  const placed: ScreenBox[] = [];

  // Prefer places near the current view center so labels follow where you look.
  const ranked = points
    .filter((p) => isMapPointVisible(p, active))
    .map((point) => {
      const screen = map.project([point.longitude, point.latitude]);
      const dx = screen.x - centerScreen.x;
      const dy = screen.y - centerScreen.y;
      return { point, screen, dist2: dx * dx + dy * dy };
    })
    .sort((a, b) => a.dist2 - b.dist2);

  const result: Array<{ point: MapPlacePoint; text: string }> = [];

  for (const { point, screen } of ranked) {
    const text = labelForZoom(point.label, zoom);
    const box = estimateCardBox(screen.x, screen.y, text);
    if (placed.some((other) => boxesOverlap(box, other, pad))) continue;
    placed.push(box);
    result.push({ point, text });
  }

  return result;
}

function syncCardMarkers(
  map: MapLibreMap,
  points: MapPlacePoint[],
  active: Record<string, boolean>,
  markers: globalThis.Map<string, MarkerState>
) {
  const desired = pickLabeledPoints(map, points, active);
  const desiredIds = new Set(desired.map((d) => d.point.id));

  for (const [id, state] of [...markers.entries()]) {
    if (desiredIds.has(id)) continue;
    markers.delete(id);
    void removeMarkerAnimated(state);
  }

  for (const { point, text } of desired) {
    const existing = markers.get(point.id);
    if (existing) {
      if (existing.text !== text) {
        const textEl = existing.marker
          .getElement()
          .querySelector(".map-place-pin__text");
        if (textEl) textEl.textContent = text;
        existing.text = text;
      }
      continue;
    }

    const el = createPinElement(point, text);
    const marker = new maplibregl.Marker({
      element: el,
      anchor: "bottom",
      offset: [0, 2],
    })
      .setLngLat([point.longitude, point.latitude])
      .addTo(map);

    markers.set(point.id, { marker, text });
    playEnter(el);
  }
}

export function CityMap({
  points,
  filterGroups,
  className,
  fullHeight = false,
}: {
  points: MapPlacePoint[];
  filterGroups: MapFilterGroup[];
  className?: string;
  fullHeight?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const markersRef = useRef<globalThis.Map<string, MarkerState>>(
    new globalThis.Map()
  );
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const pointsRef = useRef(points);
  const activeRef = useRef<Record<string, boolean>>({});
  const cardsVisibleRef = useRef(false);

  const initialActive = useMemo(() => {
    const state: Record<string, boolean> = {};
    for (const g of filterGroups) state[g.key] = true;
    return state;
  }, [filterGroups]);

  const [active, setActive] = useState(initialActive);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [basemap, setBasemap] = useState<MapBasemap>("streets");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scaleBar, setScaleBar] = useState({ label: "100 м", width: 72 });
  const basemapRef = useRef<MapBasemap>("streets");

  pointsRef.current = points;
  activeRef.current = active;
  basemapRef.current = basemap;

  const visibleCount = useMemo(
    () => points.filter((p) => isMapPointVisible(p, active)).length,
    [points, active]
  );

  const toggleLayer = useCallback(
    (key: string) => {
      setActive((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        if (key === "poshta" && next.poshta) {
          for (const g of filterGroups) {
            if (g.parent === "poshta") next[g.key] = true;
          }
        }
        return next;
      });
    },
    [filterGroups]
  );

  const switchBasemap = useCallback((next: MapBasemap) => {
    const map = mapRef.current;
    if (!map || basemapRef.current === next) return;
    basemapRef.current = next;
    setBasemap(next);
    map.setStyle(getMapBasemapStyle(next));
  }, []);

  const flyToCityCenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: DUBNO_CENTER,
      zoom: MAP_INITIAL_ZOOM,
      bearing: MAP_INITIAL_BEARING,
      pitch: MAP_INITIAL_PITCH,
      essential: true,
      duration: 900,
    });
  }, []);

  const zoomBy = useCallback((delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ zoom: map.getZoom() + delta, duration: 220 });
  }, []);

  const locateMe = useCallback(() => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15), duration: 900 });

        userMarkerRef.current?.remove();
        const el = document.createElement("div");
        el.className = "map-user-location";
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map);
      },
      () => {
        /* permission denied / unavailable — silent */
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const toggleBrowserFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void shell.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const root = settingsRef.current;
      if (!root) return;
      if (!root.contains(event.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [settingsOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let interactionsBound = false;

    const initMap = () => {
      if (cancelled || mapRef.current || !containerRef.current) return;

      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: getMapBasemapStyle("streets"),
        center: DUBNO_CENTER,
        zoom: MAP_INITIAL_ZOOM,
        pitch: MAP_INITIAL_PITCH,
        bearing: MAP_INITIAL_BEARING,
        maxPitch: 0,
        attributionControl: false,
      });

      const resizeMap = () => {
        if (!mapRef.current) return;
        mapRef.current.resize();
        setScaleBar(computeScaleBar(mapRef.current));
      };

      const refreshCards = () => {
        const showCards = map.getZoom() >= MAP_CARD_ZOOM;
        cardsVisibleRef.current = showCards;
        setScaleBar(computeScaleBar(map));
        syncCardMarkers(
          map,
          pointsRef.current,
          activeRef.current,
          markersRef.current
        );
      };

      const onZoomDuring = () => {
        setScaleBar(computeScaleBar(map));
        const showCards = map.getZoom() >= MAP_CARD_ZOOM;
        if (showCards === cardsVisibleRef.current) return;
        cardsVisibleRef.current = showCards;
        syncCardMarkers(
          map,
          pointsRef.current,
          activeRef.current,
          markersRef.current
        );
      };

      const onPlaceClick = (
        e: maplibregl.MapMouseEvent & {
          features?: maplibregl.MapGeoJSONFeature[];
        }
      ) => {
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;

        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties as {
          slug: string;
          label: string;
          address: string;
          category: string;
        };

        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          maxWidth: "280px",
          className: "city-map-popup",
          offset: 14,
        })
          .setLngLat([lng, lat])
          .setHTML(
            `<div class="map-popup-body">
              <p class="map-popup-category">${escapeHtml(props.category)}</p>
              <p class="map-popup-title">${escapeHtml(props.label)}</p>
              <p class="map-popup-address">${escapeHtml(props.address)}</p>
              <a href="/places/${encodeURIComponent(props.slug)}" class="map-popup-link">Відкрити місце</a>
            </div>`
          )
          .addTo(map);
      };

      const setupAfterStyle = () => {
        if (cancelled) return;
        hideBasemapPois(map);
        ensurePlacesLayers(
          map,
          buildGeoJson(pointsRef.current, activeRef.current)
        );

        if (!interactionsBound) {
          interactionsBound = true;
          map.on("click", LAYER_DOTS, onPlaceClick);
          map.on("mouseenter", LAYER_DOTS, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", LAYER_DOTS, () => {
            map.getCanvas().style.cursor = "";
          });
          map.on("zoom", onZoomDuring);
          map.on("zoomend", refreshCards);
          map.on("moveend", refreshCards);
        }

        refreshCards();
        resizeMap();
        requestAnimationFrame(resizeMap);
        setReady(true);
      };

      map.on("style.load", setupAfterStyle);

      resizeObserver = new ResizeObserver(resizeMap);
      resizeObserver.observe(containerRef.current);

      mapRef.current = map;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(initMap);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      popupRef.current?.remove();
      userMarkerRef.current?.remove();
      clearMarkersImmediate(markersRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points, initialActive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(buildGeoJson(points, active));
    syncCardMarkers(map, points, active, markersRef.current);
    cardsVisibleRef.current = map.getZoom() >= MAP_CARD_ZOOM;
  }, [points, active, ready]);

  const topLevel = filterGroups.filter((g) => !g.parent);
  const postalChildren = filterGroups.filter((g) => g.parent === "poshta");

  const shellHeight = fullHeight
    ? "h-[calc(100svh-4.25rem)] min-h-[20rem]"
    : "h-[min(72vh,640px)] min-h-[22rem]";

  return (
    <div
      ref={shellRef}
      className={cn(
        "city-map-shell relative overflow-hidden bg-secondary/30",
        shellHeight,
        expanded && !fullHeight && "fixed inset-0 z-[60] h-svh",
        className
      )}
    >
      <div
        ref={containerRef}
        className="city-map-canvas absolute inset-0 h-full w-full"
        aria-label="Мапа Дубна"
      />

      <div className="city-map-filters absolute left-3 top-3 z-10 w-[min(100%-1.5rem,17.5rem)] sm:left-4 sm:top-4">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="size-4 shrink-0 text-primary" />
          <p className="text-sm font-semibold text-foreground">Шари мапи</p>
          <span className="ml-auto rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
            {visibleCount}
          </span>
        </div>

        <div className="space-y-1">
          {topLevel.map((group) => (
            <FilterToggle
              key={group.key}
              group={group}
              active={active[group.key] !== false}
              onToggle={() => toggleLayer(group.key)}
            />
          ))}
        </div>

        {active.poshta !== false && postalChildren.length > 0 ? (
          <div className="mt-3 space-y-1 border-t border-border pt-3">
            <p className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Оператори
            </p>
            {postalChildren.map((group) => (
              <FilterToggle
                key={group.key}
                group={group}
                active={active[group.key] !== false}
                onToggle={() => toggleLayer(group.key)}
                nested
              />
            ))}
          </div>
        ) : null}
      </div>

      <div
        ref={settingsRef}
        className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-2 sm:bottom-4 sm:right-4"
      >
        {settingsOpen ? (
          <div className="city-map-settings w-[min(100vw-1.5rem,17rem)] rounded-xl border border-border bg-card p-3 shadow-lg">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Налаштування
            </p>

            <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-secondary/60 p-1">
              <button
                type="button"
                onClick={() => switchBasemap("streets")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-colors",
                  basemap === "streets"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={basemap === "streets"}
              >
                <MapIcon className="size-3.5" />
                Карта
              </button>
              <button
                type="button"
                onClick={() => switchBasemap("satellite")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-colors",
                  basemap === "satellite"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={basemap === "satellite"}
              >
                <Satellite className="size-3.5" />
                Супутник
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => zoomBy(-1)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-secondary"
                  aria-label="Зменшити масштаб"
                >
                  <Minus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomBy(1)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-secondary"
                  aria-label="Збільшити масштаб"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={locateMe}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium hover:bg-secondary"
              >
                <LocateFixed className="size-4 text-primary" />
                Моя локація
              </button>

              <button
                type="button"
                onClick={flyToCityCenter}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium hover:bg-secondary"
              >
                <Crosshair className="size-4 text-primary" />
                Центр Дубна
              </button>

              {!fullHeight ? (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium hover:bg-secondary"
                  >
                    {expanded ? (
                      <Minimize2 className="size-4 text-primary" />
                    ) : (
                      <Maximize2 className="size-4 text-primary" />
                    )}
                    {expanded ? "Згорнути мапу" : "Розгорнути мапу"}
                  </button>
                  <Link
                    href="/map"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium hover:bg-secondary"
                  >
                    <Expand className="size-4 text-primary" />
                    На весь екран
                  </Link>
                </>
              ) : null}

              <button
                type="button"
                onClick={toggleBrowserFullscreen}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium hover:bg-secondary"
              >
                <Maximize2 className="size-4 text-primary" />
                Повний екран
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <div
            className="city-map-scale pointer-events-none select-none rounded-lg border border-border bg-card px-2.5 py-2 shadow-md"
            aria-hidden
          >
            <div
              className="city-map-scale__bar border-b-2 border-l-2 border-r-2 border-foreground"
              style={{ width: scaleBar.width }}
            />
            <p className="mt-1 text-center text-[11px] font-semibold tabular-nums text-foreground">
              {scaleBar.label}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-11 shrink-0 rounded-xl border border-border bg-card text-foreground shadow-md"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label="Налаштування мапи"
            aria-expanded={settingsOpen}
            title="Налаштування"
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterToggle({
  group,
  active,
  onToggle,
  nested = false,
}: {
  group: MapFilterGroup;
  active: boolean;
  onToggle: () => void;
  nested?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        nested && "py-1.5 pl-3"
      )}
    >
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full ring-2 ring-background",
          !active && "opacity-40"
        )}
        style={{ backgroundColor: group.color }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate font-medium">{group.label}</span>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {group.count}
      </span>
    </button>
  );
}
