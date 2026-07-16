"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createCategory, updateCategory } from "@/actions/categories";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const ICON_SUGGESTIONS = [
  "Coffee",
  "UtensilsCrossed",
  "Pill",
  "Hospital",
  "Smile",
  "Landmark",
  "Castle",
  "Church",
  "Car",
  "Fuel",
  "Building2",
  "Factory",
  "GraduationCap",
  "Trees",
  "ShoppingBag",
  "Mail",
  "Dumbbell",
  "Sparkles",
  "MapPin",
];

export function CategoryForm({
  initial,
}: {
  initial?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string | null;
    sortOrder: number;
  };
}) {
  const router = useRouter();
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      icon: initial?.icon ?? "MapPin",
      description: initial?.description ?? "",
      sortOrder: initial?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: CategoryInput) {
    const result = initial
      ? await updateCategory(initial.id, values)
      : await createCategory(values);
    if (!result.success) {
      toast.error(result.error ?? "Помилка");
      return;
    }
    toast.success(initial ? "Категорію оновлено" : "Категорію створено");
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Назва</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (опційно)</FormLabel>
              <FormControl>
                <Input placeholder="avtomyyky" {...field} />
              </FormControl>
              <FormDescription>Якщо порожньо — згенерується з назви</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Іконка Lucide</FormLabel>
              <FormControl>
                <Input list="icon-suggestions" {...field} />
              </FormControl>
              <datalist id="icon-suggestions">
                {ICON_SUGGESTIONS.map((icon) => (
                  <option key={icon} value={icon} />
                ))}
              </datalist>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Опис</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Порядок</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Збереження…"
            : initial
              ? "Оновити"
              : "Створити"}
        </Button>
      </form>
    </Form>
  );
}
