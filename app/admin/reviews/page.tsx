import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { DeleteReviewButton } from "@/components/admin/delete-buttons";
import { getCurrentUser } from "@/lib/session";
import { getAllReviewsAdmin } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export default async function AdminReviewsPage() {
  const user = await getCurrentUser();
  if (user?.role !== Role.ADMIN) redirect("/admin/places");

  const reviews = await getAllReviewsAdmin();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold">Відгуки</h2>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium">
                <Link
                  href={`/places/${review.place.slug}`}
                  className="hover:text-primary"
                >
                  {review.place.title}
                </Link>{" "}
                · {review.rating}★
              </p>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              <p className="text-xs text-muted-foreground">
                {review.user.name || review.user.email} ·{" "}
                {formatDate(review.createdAt)}
              </p>
            </div>
            <DeleteReviewButton id={review.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
