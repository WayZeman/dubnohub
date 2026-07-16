import type { Metadata } from "next";

import { CategoryCard } from "@/components/category-card";
import { APP_CITY_GENITIVE } from "@/lib/constants";
import { getCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: `Категорії закладів ${APP_CITY_GENITIVE}`,
  description: `Усі категорії довідника ${APP_CITY_GENITIVE}: кафе, ресторани, аптеки, лікарні та інше.`,
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <div className="page-shell section-pad space-y-8">
      <header className="space-y-2">
        <p className="section-eyebrow">Навігація</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Категорії
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Оберіть тип закладу, щоб швидко знайти потрібне місце.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
