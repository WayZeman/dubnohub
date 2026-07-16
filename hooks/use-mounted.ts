"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Avoid hydration mismatch for client-only UI (theme, relative dates). */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
