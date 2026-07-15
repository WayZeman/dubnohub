import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { canManageContent } from "@/lib/roles";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireEditor() {
  const user = await requireUser();
  if (!canManageContent(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
