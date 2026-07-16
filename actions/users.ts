"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/session";
import {
  updateProfileSchema,
  updateUserRoleSchema,
} from "@/lib/validations";
import { displayName } from "@/lib/user-display";
import type { ActionResult } from "@/actions/types";

export async function updateUserRole(raw: unknown): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = updateUserRoleSchema.parse(raw);

    if (data.userId === admin.id && data.role !== Role.ADMIN) {
      return {
        success: false,
        error: "Не можна зняти з себе роль адміна",
      };
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { role: data.role },
    });

    revalidatePath("/admin/users");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка оновлення ролі",
    };
  }
}

export async function updateProfile(raw: unknown): Promise<ActionResult> {
  try {
    const sessionUser = await requireUser();
    const data = updateProfileSchema.parse(raw);
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const profession = data.profession?.trim() || null;

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        firstName,
        lastName,
        profession,
        name: displayName({ firstName, lastName }),
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Помилка оновлення профілю",
    };
  }
}

export async function getAdminUsers() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      role: true,
      profession: true,
      createdAt: true,
      _count: { select: { reviews: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: displayName(user),
    email: user.email,
    image: user.image,
    role: user.role,
    profession: user.profession,
    createdAt: user.createdAt,
    reviewsCount: user._count.reviews,
  }));
}

export async function getAdminUserStats() {
  await requireAdmin();
  const [total, admins, editors, regularUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.user.count({ where: { role: Role.EDITOR } }),
    prisma.user.count({ where: { role: Role.USER } }),
  ]);

  return { total, admins, editors, regularUsers };
}
