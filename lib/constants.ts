export const APP_NAME = "DubnoHub";
export const APP_TAGLINE = "Міський довідник Дубна";
export const APP_DESCRIPTION =
  "DubnoHub — сучасний довідник закладів Дубна: кафе, ресторани, аптеки, лікарні, школи та інші місця з адресами, контактами й відгуками.";
export const APP_CITY = "Дубно";
export const APP_CITY_GENITIVE = "Дубна";
export const APP_CITY_LOCATIVE = "у Дубні";

export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ie",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ю: "iu",
    я: "ia",
    "'": "",
    "’": "",
    "ʼ": "",
  };

  return input
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function googleMapsUrl(opts: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  title?: string | null;
}): string | null {
  if (opts.latitude != null && opts.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${opts.latitude},${opts.longitude}`;
  }
  const q = [opts.title, opts.address, APP_CITY].filter(Boolean).join(", ");
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
