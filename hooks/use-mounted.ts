"use client";

import { useEffect, useState } from "react";

/** Avoid hydration mismatch for client-only UI (theme, relative dates). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
