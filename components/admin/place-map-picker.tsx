"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";

import {
  DUBNO_CENTER,
  MAP_INITIAL_ZOOM,
  MAP_STREETS_STYLE,
} from "@/lib/map-config";

import "maplibre-gl/dist/maplibre-gl.css";

type PlaceMapPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onPick: (coords: { latitude: number; longitude: number }) => void;
};

export function PlaceMapPicker({
  latitude,
  longitude,
  onPick,
}: PlaceMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STREETS_STYLE,
      center:
        latitude != null && longitude != null ? [longitude, latitude] : DUBNO_CENTER,
      zoom: latitude != null && longitude != null ? 16 : MAP_INITIAL_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const updateMarker = (lng: number, lat: number) => {
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({
          color: "#2563eb",
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(map);

        markerRef.current.on("dragend", () => {
          const pos = markerRef.current?.getLngLat();
          if (!pos) return;
          onPick({ latitude: pos.lat, longitude: pos.lng });
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
    };

    map.on("click", (event) => {
      const { lat, lng } = event.lngLat;
      updateMarker(lng, lat);
      onPick({ latitude: lat, longitude: lng });
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, onPick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || latitude == null || longitude == null) return;

    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({
        color: "#2563eb",
        draggable: true,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current.on("dragend", () => {
        const pos = markerRef.current?.getLngLat();
        if (!pos) return;
        onPick({ latitude: pos.lat, longitude: pos.lng });
      });
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }

    map.easeTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 16) });
  }, [latitude, longitude, onPick]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-72 overflow-hidden rounded-xl border border-border/70"
      />
      <p className="text-xs text-muted-foreground">
        Клікніть по мапі або перетягніть маркер, щоб вибрати координати.
      </p>
    </div>
  );
}
