"use client";

import { useEffect } from "react";

export function PlaceViewTracker({ placeId }: { placeId: string }) {
  useEffect(() => {
    const body = JSON.stringify({ type: "view" });
    const url = `/api/places/${placeId}/engagement`;

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon(url, body);
      return;
    }

    void fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  }, [placeId]);

  return null;
}
