import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { DeleteCategoryButton } from "@/components/admin/delete-buttons";
import { getCurrentUser } from "@/lib/session";
import { getCategories } from "@/lib/queries";

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  if (user?.role !== Role.ADMIN) redirect("/admin/places");

  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Категорії</h2>
        <Button asChild>
          <Link href="/admin/categories/new">Додати категорію</Link>
        </Button>
      </div>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-xs text-muted-foreground">
                /{category.slug} · {category._count.places} місць · іконка{" "}
                {category.icon}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/categories/${category.id}`}>Редагувати</Link>
              </Button>
              <DeleteCategoryButton id={category.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
