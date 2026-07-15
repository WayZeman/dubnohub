import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

export function formatNumber(value: number, locale = "uk-UA"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Ukrainian noun forms for counts. */
export function pluralizeUk(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

export function formatCountLabel(
  n: number,
  forms: [string, string, string]
): string {
  return `${formatNumber(n)} ${pluralizeUk(n, ...forms)}`;
}

export function formatDate(date: Date | string, pattern = "d MMM yyyy"): string {
  return format(new Date(date), pattern, { locale: uk });
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: uk });
}

/** Light cleanup for crowded address strings from imports. */
export function formatAddress(address: string): string {
  return address
    .replace(/\s+,/g, ",")
    .replace(/,([^\s])/g, ", $1")
    .replace(/\s{2,}/g, " ")
    .trim();
}
