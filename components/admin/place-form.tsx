"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createPlace, updatePlace } from "@/actions/places";
import { PlaceMapPicker } from "@/components/admin/place-map-picker";
import { placeSchema, type PlaceInput } from "@/lib/validations";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = { id: string; name: string };

export function PlaceForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    extraCategoryIds?: string[];
    address: string;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    website: string | null;
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
    telegram: string | null;
    workingHours: string | null;
    images: string[];
  };
}) {
  const router = useRouter();
  const form = useForm<PlaceInput>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
      extraCategoryIds: initial?.extraCategoryIds ?? [],
      address: initial?.address ?? "",
      latitude: initial?.latitude ?? null,
      longitude: initial?.longitude ?? null,
      phone: initial?.phone ?? "",
      website: initial?.website ?? "",
      facebook: initial?.facebook ?? "",
      instagram: initial?.instagram ?? "",
      youtube: initial?.youtube ?? "",
      telegram: initial?.telegram ?? "",
      workingHours: initial?.workingHours ?? "",
      images: initial?.images.join(", ") ?? "",
    },
  });
  const latitude = useWatch({ control: form.control, name: "latitude" });
  const longitude = useWatch({ control: form.control, name: "longitude" });
  const primaryCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });

  async function onSubmit(values: PlaceInput) {
    const result = initial
      ? await updatePlace(initial.id, values)
      : await createPlace(values);
    if (!result.success) {
      toast.error(result.error ?? "Помилка");
      return;
    }
    toast.success(initial ? "Місце оновлено" : "Місце створено");
    router.push("/admin/places");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
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
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Основна категорія</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть категорію" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="extraCategoryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Додаткові категорії</FormLabel>
              <div className="grid gap-2 rounded-xl border border-border/70 p-3 sm:grid-cols-2">
                {categories
                  .filter((category) => category.id !== primaryCategoryId)
                  .map((category) => {
                    const checked = field.value?.includes(category.id) ?? false;
                    return (
                      <label
                        key={category.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-border"
                          checked={checked}
                          onChange={(event) => {
                            const next = new Set(field.value ?? []);
                            if (event.target.checked) next.add(category.id);
                            else next.delete(category.id);
                            field.onChange([...next]);
                          }}
                        />
                        {category.name}
                      </label>
                    );
                  })}
              </div>
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
                <Textarea rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Адреса</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Точка на карті</FormLabel>
          <PlaceMapPicker
            latitude={latitude ?? null}
            longitude={longitude ?? null}
            onPick={({ latitude, longitude }) => {
              form.setValue("latitude", latitude, { shouldDirty: true, shouldValidate: true });
              form.setValue("longitude", longitude, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </FormItem>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Широта</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Довгота</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сайт</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="telegram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="workingHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Години роботи</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Пн–Пт: 09:00–18:00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Фото</FormLabel>
              <FormControl>
                <ImageUploader
                  value={
                    field.value
                      ? field.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : []
                  }
                  onChange={(urls) => field.onChange(urls.join(", "))}
                  multiple
                  maxFiles={3}
                  label="Додати фото"
                />
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
                <Input {...field} />
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
