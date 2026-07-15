import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DeletePlaceButton } from "@/components/admin/delete-buttons";
import { getAllPlacesAdmin } from "@/lib/queries";

export default async function AdminPlacesPage() {
  const places = await getAllPlacesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Місця</h2>
        <Button asChild>
          <Link href="/admin/places/new">Додати місце</Link>
        </Button>
      </div>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
        {places.map((place) => (
          <li
            key={place.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{place.title}</p>
              <p className="text-xs text-muted-foreground">
                {place.category.name} · {place.rating.toFixed(1)}★ ·{" "}
                {place._count.reviews} відгуків
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/places/${place.id}`}>Редагувати</Link>
              </Button>
              <DeletePlaceButton id={place.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
