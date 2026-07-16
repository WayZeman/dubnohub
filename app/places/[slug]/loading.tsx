import { Skeleton } from "@/components/ui/skeleton";

export default function PlaceDetailLoading() {
  return (
    <div className="page-shell section-pad space-y-8">
      <Skeleton className="h-4 w-32" />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-80 rounded-[1.35rem]" />
      </div>
    </div>
  );
}
