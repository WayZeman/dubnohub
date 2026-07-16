import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PlaceForm } from "@/components/admin/place-form";
import { getCategories, getPlaceById } from "@/lib/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPlacePage({ params }: PageProps) {
  const { id } = await params;
  const [place, categories] = await Promise.all([
    getPlaceById(id),
    getCategories(),
  ]);
  if (!place) notFound();

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
        <h2 className="font-display text-lg font-semibold">Редагувати місце</h2>
        <p className="mt-1 text-sm text-muted-foreground">{place.title}</p>
      </div>
      <div className="rounded-2xl border border-border/70 p-5">
        <PlaceForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          initial={{
            id: place.id,
            title: place.title,
            slug: place.slug,
            description: place.description,
            categoryId: place.categoryId,
            extraCategoryIds: place.categories
              .map((link) => link.categoryId)
              .filter((id) => id !== place.categoryId),
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            phone: place.phone,
            website: place.website,
            facebook: place.facebook,
            instagram: place.instagram,
            youtube: place.youtube,
            telegram: place.telegram,
            workingHours: place.workingHours,
            images: place.images,
          }}
        />
      </div>
    </div>
  );
}
