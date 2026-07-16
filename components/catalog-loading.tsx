import {
  CardSkeleton,
  PageHeaderSkeleton,
} from "@/components/loading-skeleton";

export function CatalogLoading({
  columns = 3,
  count = 6,
}: {
  columns?: 2 | 3 | 4;
  count?: number;
}) {
  const grid =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="page-shell section-pad space-y-8">
      <PageHeaderSkeleton />
      <div className={`grid gap-5 ${grid}`}>
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
