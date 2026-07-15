import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PlaceForm } from "@/components/admin/place-form";
import { getCategories } from "@/lib/queries";

export default async function NewPlacePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/places"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Усі місця
        </Link>
        <h2 className="font-display text-lg font-semibold">Нове місце</h2>
      </div>
      <div className="rounded-2xl border border-border/70 p-5">
        <PlaceForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}
