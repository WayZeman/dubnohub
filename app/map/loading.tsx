export default function MapLoading() {
  return (
    <div className="flex min-h-[min(72vh,640px)] flex-1 items-center justify-center bg-secondary/30">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-pulse rounded-full bg-primary/25" />
        <p className="text-sm text-muted-foreground">Завантаження мапи…</p>
      </div>
    </div>
  );
}
