"use client";

import Link, { type LinkProps } from "next/link";
import { useCallback } from "react";

function trackPlaceClick(placeId: string) {
  const body = JSON.stringify({ type: "click" });
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
}

type TrackedPlaceLinkProps = LinkProps &
  Omit<React.ComponentProps<typeof Link>, "href"> & {
    placeId: string;
  };

export function TrackedPlaceLink({
  placeId,
  onClick,
  ...props
}: TrackedPlaceLinkProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        trackPlaceClick(placeId);
      }
    },
    [onClick, placeId]
  );

  return <Link {...props} onClick={handleClick} />;
}
