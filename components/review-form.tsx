"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Star } from "lucide-react";

import { upsertReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function ReviewEditor({
  placeId,
  seed,
  hasExisting,
}: {
  placeId: string;
  seed: { rating: number; comment: string } | null;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(seed?.rating ?? 5);
  const [comment, setComment] = useState(seed?.comment ?? "");

  return (
    <form
      className="space-y-4 rounded-2xl border border-border/70 bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await upsertReview({ placeId, rating, comment });
          if (!result.success) {
            toast.error(result.error ?? "Помилка");
            return;
          }
          toast.success("Відгук збережено");
          router.refresh();
        });
      }}
    >
      <div>
        <p className="mb-2 text-sm font-medium">Ваша оцінка</p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="inline-flex size-11 items-center justify-center rounded-md transition-colors hover:bg-muted sm:size-9"
              aria-label={`${value} зірок`}
            >
              <Star
                className={cn(
                  "size-7 sm:size-6",
                  value <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Розкажіть про свій досвід…"
        required
        minLength={5}
      />
      <Button type="submit" disabled={pending}>
        {pending
          ? "Збереження…"
          : hasExisting
            ? "Оновити відгук"
            : "Надіслати відгук"}
      </Button>
    </form>
  );
}

export function ReviewForm({
  placeId,
  placeSlug,
  initial,
  existingReviews = [],
}: {
  placeId: string;
  placeSlug: string;
  initial?: { rating: number; comment: string } | null;
  existingReviews?: { userId: string; rating: number; comment: string }[];
}) {
  const { data: session, status } = useSession();

  const fromSession = session?.user?.id
    ? existingReviews.find((review) => review.userId === session.user.id)
    : null;
  const seed = initial ?? fromSession ?? null;
  const hasExisting = Boolean(seed);

  if (status === "loading") {
    return <div className="h-32 animate-pulse rounded-2xl bg-muted" />;
  }

  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm text-muted-foreground">
        Щоб залишити відгук,{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/places/${placeSlug}`)}`}
          className="text-primary underline"
        >
          увійдіть через Google
        </Link>
        .
      </div>
    );
  }

  return (
    <ReviewEditor
      key={session.user.id}
      placeId={placeId}
      seed={seed}
      hasExisting={hasExisting}
    />
  );
}
