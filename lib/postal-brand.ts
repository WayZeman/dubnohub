export type PostalBrand = "nova-poshta" | "ukrposhta" | "meest";

export type PostalBrandInfo = {
  brand: PostalBrand;
  kindLabel: string;
  /** Branch / postomat number for display */
  number: string;
  logoSrc: string;
  brandLabel: string;
  accentClass: string;
};

const NP_LOGO = "/brands/nova-poshta-logo.svg";
const UP_LOGO = "/brands/ukrposhta-logo.svg";
const MEEST_LOGO = "/brands/meest-logo.svg";

/**
 * Detect Nova Poshta / Ukrposhta / Meest listing and extract branch number.
 */
export function getPostalBrandInfo(slug: string): PostalBrandInfo | null {
  const np = slug.match(
    /^nova-poshta-(viddilennya|poshtomat|punkt)-(.+)-dubno$/,
  );
  if (np) {
    const kind =
      np[1] === "viddilennya"
        ? "Відділення"
        : np[1] === "poshtomat"
          ? "Поштомат"
          : "Пункт видачі";
    return {
      brand: "nova-poshta",
      kindLabel: kind,
      number: np[2]!,
      logoSrc: NP_LOGO,
      brandLabel: "Нова Пошта",
      accentClass: "text-[#ed1c24]",
    };
  }

  const up = slug.match(/^ukrposhta-(\d+)-dubno$/);
  if (up) {
    const index = up[1]!;
    const n = Number.parseInt(index, 10);
    const branchGuess = n % 10;
    const useBranch =
      index.length === 5 && index.startsWith("3560") && branchGuess >= 1;

    return {
      brand: "ukrposhta",
      kindLabel: "Відділення",
      number: useBranch ? String(branchGuess) : index,
      logoSrc: UP_LOGO,
      brandLabel: "Укрпошта",
      accentClass: "text-[#003399]",
    };
  }

  const meest = slug.match(/^meest-(\d+)-dubno$/);
  if (meest) {
    return {
      brand: "meest",
      kindLabel: "Міні-відділення",
      number: meest[1]!,
      logoSrc: MEEST_LOGO,
      brandLabel: "Meest",
      accentClass: "text-[#0061AF]",
    };
  }

  return null;
}

const BRAND_ORDER: PostalBrand[] = ["nova-poshta", "ukrposhta", "meest"];

/** Interleave brands so homepage peek isn't all Meest then all Ukrposhta. */
export function pickPostalPeek<T extends { slug: string }>(
  places: T[],
  take = 8
): T[] {
  const buckets = new Map<string, T[]>();
  for (const place of places) {
    const brand = getPostalBrandInfo(place.slug)?.brand ?? "other";
    const list = buckets.get(brand) ?? [];
    list.push(place);
    buckets.set(brand, list);
  }

  const result: T[] = [];
  let added = true;
  while (result.length < take && added) {
    added = false;
    for (const brand of [...BRAND_ORDER, "other"] as string[]) {
      const list = buckets.get(brand);
      if (list?.length) {
        result.push(list.shift()!);
        added = true;
        if (result.length >= take) break;
      }
    }
  }
  return result;
}
