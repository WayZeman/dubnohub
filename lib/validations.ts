import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Мінімум 2 символи").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Латиниця, цифри та дефіс")
    .optional()
    .or(z.literal("")),
  icon: z.string().trim().min(1).max(40).optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const placeSchema = z.object({
  title: z.string().trim().min(2, "Мінімум 2 символи").max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Латиниця, цифри та дефіс")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().min(20, "Мінімум 20 символів"),
  categoryId: z.string().cuid("Оберіть категорію"),
  address: z.string().trim().min(3, "Вкажіть адресу").max(240),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().url("Некоректне посилання").optional().or(z.literal("")),
  facebook: z.string().trim().url("Некоректне посилання").optional().or(z.literal("")),
  instagram: z.string().trim().url("Некоректне посилання").optional().or(z.literal("")),
  workingHours: z.string().trim().max(1000).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  images: z.string().optional(),
});

export type PlaceInput = z.infer<typeof placeSchema>;

export const reviewSchema = z.object({
  placeId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Мінімум 5 символів").max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["USER", "EDITOR", "ADMIN"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Вкажіть ім'я").max(60),
  lastName: z.string().trim().min(1, "Вкажіть прізвище").max(60),
  profession: z.string().trim().max(80).optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export function parseCommaList(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
