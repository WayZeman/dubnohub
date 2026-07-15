"use client";

import {
  Car,
  Castle,
  Coffee,
  Dumbbell,
  GraduationCap,
  Hospital,
  Landmark,
  Mail,
  MapPin,
  Pill,
  ShoppingBag,
  Smile,
  Sparkles,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { easeSpringSoft } from "@/lib/motion";
import { formatCountLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  Castle,
  Coffee,
  Dumbbell,
  GraduationCap,
  Hospital,
  Landmark,
  Mail,
  MapPin,
  Pill,
  ShoppingBag,
  Smile,
  Sparkles,
  Trees,
  UtensilsCrossed,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MapPin;
}

export function CategoryCard({
  category,
  className,
}: {
  category: {
    name: string;
    slug: string;
    icon: string;
    description?: string | null;
    _count?: { places: number };
  };
  className?: string;
}) {
  const Icon = resolveIcon(category.icon);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.988 }}
      transition={easeSpringSoft}
      className={cn("h-full", className)}
    >
      <Link
        href={`/categories/${category.slug}`}
        className="group flex h-full items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-3.5 transition-[border-color,box-shadow] duration-500 hover:border-border hover:shadow-[var(--shadow-float)] sm:gap-4 sm:p-4"
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground transition-all duration-500 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-tight transition-colors group-hover:text-primary">
            {category.name}
          </h3>
          {category.description ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {category.description}
            </p>
          ) : null}
          {category._count ? (
            <p
              className={cn(
                "text-xs font-medium tabular-nums text-muted-foreground",
                category.description ? "mt-1" : "mt-0.5 text-sm font-normal"
              )}
            >
              {formatCountLabel(category._count.places, [
                "місце",
                "місця",
                "місць",
              ])}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
