"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = { slug: string; name: string };

export function PlacesSearch({
  categories,
  large = false,
  actionPath = "/places",
}: {
  categories: CategoryOption[];
  large?: boolean;
  actionPath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [minRating, setMinRating] = useState(params.get("rating") ?? "0");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (category !== "all") next.set("category", category);
    if (minRating !== "0") next.set("rating", minRating);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${actionPath}?${qs}` : actionPath);
    });
  }

  return (
    <form
      onSubmit={submit}
      className={
        large
          ? "mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-white/90 p-3 shadow-lg shadow-primary/5 backdrop-blur sm:p-4"
          : "rounded-2xl border border-border/70 bg-card p-3 sm:p-4"
      }
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук за назвою чи адресою…"
            className="h-12 border-0 bg-muted/50 pl-10 text-base shadow-none focus-visible:ring-1 sm:h-11 sm:text-sm"
            enterKeyHint="search"
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:contents">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 w-full text-base sm:h-11 sm:w-[170px] sm:text-sm">
              <SelectValue placeholder="Категорія" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі категорії</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger className="h-12 w-full text-base sm:h-11 sm:w-[140px] sm:text-sm">
              <SelectValue placeholder="Рейтинг" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Будь-який</SelectItem>
              <SelectItem value="3">від 3★</SelectItem>
              <SelectItem value="4">від 4★</SelectItem>
              <SelectItem value="4.5">від 4.5★</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          className="h-12 w-full px-6 text-base sm:h-11 sm:w-auto sm:text-sm"
          disabled={pending}
        >
          Знайти
        </Button>
      </div>
    </form>
  );
}
