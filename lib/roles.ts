import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  USER: "Користувач",
  EDITOR: "Редактор",
  ADMIN: "Адмін",
};

export const ASSIGNABLE_ROLES: Role[] = [Role.USER, Role.EDITOR, Role.ADMIN];

export function canManageContent(role?: Role | null): boolean {
  return role === Role.ADMIN || role === Role.EDITOR;
}

export function canManageAdmin(role?: Role | null): boolean {
  return role === Role.ADMIN;
}
