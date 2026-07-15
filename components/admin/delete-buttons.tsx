"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteCategory } from "@/actions/categories";
import { deletePlace } from "@/actions/places";
import { deleteReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";

export function DeleteCategoryButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Видалити категорію?")) return;
        startTransition(async () => {
          const result = await deleteCategory(id);
          if (!result.success) {
            toast.error(result.error ?? "Помилка");
            return;
          }
          toast.success("Видалено");
          router.refresh();
        });
      }}
    >
      Видалити
    </Button>
  );
}

export function DeletePlaceButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Видалити місце?")) return;
        startTransition(async () => {
          const result = await deletePlace(id);
          if (!result.success) {
            toast.error(result.error ?? "Помилка");
            return;
          }
          toast.success("Видалено");
          router.refresh();
        });
      }}
    >
      Видалити
    </Button>
  );
}

export function DeleteReviewButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Видалити відгук?")) return;
        startTransition(async () => {
          const result = await deleteReview(id);
          if (!result.success) {
            toast.error(result.error ?? "Помилка");
            return;
          }
          toast.success("Видалено");
          router.refresh();
        });
      }}
    >
      Видалити
    </Button>
  );
}
