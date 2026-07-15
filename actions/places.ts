"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/session";
import { parseCommaList, placeSchema } from "@/lib/validations";
import { slugify } from "@/lib/constants";
import type { ActionResult } from "@/actions/types";

async function uniquePlaceSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "place";
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.place.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

function placeData(data: ReturnType<typeof placeSchema.parse>, slug: string) {
  return {
    title: data.title,
    slug,
    description: data.description,
    categoryId: data.categoryId,
    address: data.address,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    phone: data.phone?.trim() || null,
    website: data.website?.trim() || null,
    facebook: data.facebook?.trim() || null,
    instagram: data.instagram?.trim() || null,
    workingHours: data.workingHours?.trim() || null,
    featured: data.featured ?? false,
    images: parseCommaList(data.images),
  };
}

export async function createPlace(
  raw: unknown
): Promise<ActionResult & { id?: string; slug?: string }> {
  try {
    await requireEditor();
    const data = placeSchema.parse(raw);
    const slug = await uniquePlaceSlug(data.slug || data.title);

    const place = await prisma.place.create({
      data: placeData(data, slug),
    });

    revalidatePath("/");
    revalidatePath("/places");
    revalidatePath("/categories");
    revalidatePath("/admin/places");
    return { success: true, id: place.id, slug: place.slug };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка створення",
    };
  }
}

export async function updatePlace(
  id: string,
  raw: unknown
): Promise<ActionResult> {
  try {
    await requireEditor();
    const data = placeSchema.parse(raw);
    const slug = await uniquePlaceSlug(data.slug || data.title, id);

    await prisma.place.update({
      where: { id },
      data: placeData(data, slug),
    });

    revalidatePath("/");
    revalidatePath("/places");
    revalidatePath(`/places/${slug}`);
    revalidatePath("/categories");
    revalidatePath("/admin/places");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка оновлення",
    };
  }
}

export async function deletePlace(id: string): Promise<ActionResult> {
  try {
    await requireEditor();
    await prisma.place.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/places");
    revalidatePath("/categories");
    revalidatePath("/admin/places");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка видалення",
    };
  }
}
