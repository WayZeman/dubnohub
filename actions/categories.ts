"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/constants";
import type { ActionResult } from "@/actions/types";

async function uniqueCategorySlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "category";
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

export async function createCategory(
  raw: unknown
): Promise<ActionResult & { id?: string }> {
  try {
    await requireAdmin();
    const data = categorySchema.parse(raw);
    const slug = await uniqueCategorySlug(data.slug || data.name);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        icon: data.icon || "MapPin",
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/admin/categories");
    return { success: true, id: category.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка створення",
    };
  }
}

export async function updateCategory(
  id: string,
  raw: unknown
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = categorySchema.parse(raw);
    const slug = await uniqueCategorySlug(data.slug || data.name, id);

    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        icon: data.icon || "MapPin",
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath(`/categories/${slug}`);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка оновлення",
    };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const count = await prisma.place.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        success: false,
        error: `Неможливо видалити: у категорії ${count} місць`,
      };
    }
    await prisma.category.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка видалення",
    };
  }
}
