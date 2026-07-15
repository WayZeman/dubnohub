import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { ArrowLeft } from "lucide-react";

import { CategoryForm } from "@/components/admin/category-form";
import { getCurrentUser } from "@/lib/session";
import { getCategoryById } from "@/lib/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (user?.role !== Role.ADMIN) redirect("/admin/places");

  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Усі категорії
        </Link>
        <h2 className="font-display text-lg font-semibold">
          Редагувати категорію
        </h2>
      </div>
      <div className="rounded-2xl border border-border/70 p-5">
        <CategoryForm
          initial={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            description: category.description,
            sortOrder: category.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
