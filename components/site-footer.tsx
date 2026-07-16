"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  APP_CITY_GENITIVE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/constants";

const footerLinks = [
  { href: "/", label: "Головна" },
  { href: "/map", label: "Мапа міста" },
  { href: "/places", label: "Усі місця" },
  { href: "/categories", label: "Категорії" },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/map"
  ) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-secondary/40">
      <div className="page-shell py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr]">
          <div className="max-w-md space-y-3">
            <p className="font-display text-xl font-semibold tracking-tight">
              {APP_NAME}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {APP_TAGLINE}. {APP_DESCRIPTION}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Розділи
            </p>
            <nav
              aria-label="Нижня навігація"
              className="mt-3 flex flex-col gap-2"
            >
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-10 items-center text-sm text-foreground/85 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {year} {APP_NAME}. Міський довідник {APP_CITY_GENITIVE}.
        </p>
      </div>
    </footer>
  );
}
