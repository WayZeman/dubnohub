"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { reviewSchema } from "@/lib/validations";
import { recalculatePlaceRating } from "@/lib/queries";
import type { ActionResult } from "@/actions/types";

export async function upsertReview(raw: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const data = reviewSchema.parse(raw);

    const place = await prisma.place.findUnique({
      where: { id: data.placeId },
      select: { id: true, slug: true },
    });
    if (!place) return { success: false, error: "Місце не знайдено" };

    await prisma.review.upsert({
      where: {
        userId_placeId: { userId: user.id, placeId: data.placeId },
      },
      create: {
        userId: user.id,
        placeId: data.placeId,
        rating: data.rating,
        comment: data.comment,
      },
      update: {
        rating: data.rating,
        comment: data.comment,
      },
    });

    await recalculatePlaceRating(data.placeId);

    revalidatePath(`/places/${place.slug}`);
    revalidatePath("/places");
    revalidatePath("/admin/reviews");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка збереження відгуку",
    };
  }
}

export async function deleteReview(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const review = await prisma.review.findUnique({
      where: { id },
      include: { place: { select: { slug: true } }, user: { select: { id: true } } },
    });
    if (!review) return { success: false, error: "Відгук не знайдено" };

    const isOwner = review.userId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return { success: false, error: "Forbidden" };
    }

    await prisma.review.delete({ where: { id } });
    await recalculatePlaceRating(review.placeId);

    revalidatePath(`/places/${review.place.slug}`);
    revalidatePath("/admin/reviews");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка видалення",
    };
  }
}
