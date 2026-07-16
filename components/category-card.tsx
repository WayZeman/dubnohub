import {
  Building2,
  Car,
  Castle,
  Church,
  Coffee,
  Dumbbell,
  Factory,
  Fuel,
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
} from "lucide-react";
import Link from "next/link";

import { formatCountLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

function CategoryIcon({ name }: { name: string }) {
  switch (name) {
    case "Building2":
      return <Building2 className="size-5" aria-hidden />;
    case "Car":
      return <Car className="size-5" aria-hidden />;
    case "Castle":
      return <Castle className="size-5" aria-hidden />;
    case "Church":
      return <Church className="size-5" aria-hidden />;
    case "Coffee":
      return <Coffee className="size-5" aria-hidden />;
    case "Dumbbell":
      return <Dumbbell className="size-5" aria-hidden />;
    case "Factory":
      return <Factory className="size-5" aria-hidden />;
    case "Fuel":
      return <Fuel className="size-5" aria-hidden />;
    case "GraduationCap":
      return <GraduationCap className="size-5" aria-hidden />;
    case "Hospital":
      return <Hospital className="size-5" aria-hidden />;
    case "Landmark":
      return <Landmark className="size-5" aria-hidden />;
    case "Mail":
      return <Mail className="size-5" aria-hidden />;
    case "Pill":
      return <Pill className="size-5" aria-hidden />;
    case "ShoppingBag":
      return <ShoppingBag className="size-5" aria-hidden />;
    case "Smile":
      return <Smile className="size-5" aria-hidden />;
    case "Sparkles":
      return <Sparkles className="size-5" aria-hidden />;
    case "Trees":
      return <Trees className="size-5" aria-hidden />;
    case "UtensilsCrossed":
      return <UtensilsCrossed className="size-5" aria-hidden />;
    default:
      return <MapPin className="size-5" aria-hidden />;
  }
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
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group flex h-full items-center gap-3.5 rounded-2xl border border-border/60 bg-card/90 p-3.5 shadow-(--shadow-soft) transition-[border-color,box-shadow,transform] duration-500 ease-out-soft hover:-translate-y-0.5 hover:border-border hover:shadow-(--shadow-float) sm:gap-4 sm:p-4",
        className
      )}
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
        <CategoryIcon name={category.icon} />
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
  );
}
