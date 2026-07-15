import type { PostalBrandInfo } from "@/lib/postal-brand";
import { cn } from "@/lib/utils";

const TINT: Record<PostalBrandInfo["brand"], string> = {
  "nova-poshta": "bg-[#fff5f5]",
  ukrposhta: "bg-[#f3f6fb]",
  meest: "bg-[#f2f7fc]",
};

/** Minimal postal cover: logo + branch number on a soft brand tint. */
export function PostalBrandCover({
  info,
  className,
}: {
  info: PostalBrandInfo;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-3 px-5 py-7",
        TINT[info.brand],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={info.logoSrc}
        alt={info.brandLabel}
        className="h-11 w-auto max-w-[70%] object-contain sm:h-12"
      />
      <p
        className={cn(
          "text-center text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
          info.accentClass
        )}
      >
        №{info.number}
      </p>
    </div>
  );
}
