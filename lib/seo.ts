import {
  APP_CITY,
  APP_CITY_GENITIVE,
  APP_CITY_LOCATIVE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/constants";

/** Canonical production host used when env is incomplete. */
const PRODUCTION_SITE_URL = "https://dubnohub.vercel.app";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SEO_KEYWORDS = [
  "Дубно",
  "Dubno",
  "DubnoHub",
  "довідник Дубна",
  "міський довідник Дубно",
  "заклади Дубна",
  "кафе у Дубні",
  "ресторани Дубна",
  "аптеки Дубна",
  "лікарні Дубна",
  "школи Дубна",
  "АЗС Дубно",
  "пошта Дубно",
  "Нова Пошта Дубно",
  "памʼятки Дубна",
  "що відвідати у Дубні",
  "мапа Дубна",
  "каталог місць Дубно",
  "контакти закладів Дубно",
  "відгуки Дубно",
] as const;

export function buildPageTitle(title: string): string {
  return `${title} · ${APP_NAME}`;
}

export function placeSeoDescription(input: {
  title: string;
  categoryName: string;
  address: string;
  description: string;
  phone?: string | null;
}): string {
  const fromDesc = input.description.replace(/\s+/g, " ").trim().slice(0, 110);
  const parts = [
    `${input.title} — ${input.categoryName} ${APP_CITY_LOCATIVE}.`,
    input.address ? `Адреса: ${input.address}.` : null,
    fromDesc || null,
    input.phone ? `Тел.: ${input.phone}.` : null,
  ].filter(Boolean);
  return parts.join(" ").slice(0, 160);
}

export function categorySeoDescription(
  name: string,
  description?: string | null
): string {
  if (description?.trim()) return description.trim().slice(0, 160);
  return `${name} ${APP_CITY_GENITIVE} — адреси, телефони, години роботи та відгуки у довіднику ${APP_NAME}.`;
}

type JsonLd = Record<string, unknown>;

export function websiteJsonLd(): JsonLd {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    alternateName: ["ДубноХаб", "Дубно Hub", APP_TAGLINE],
    url,
    description: APP_DESCRIPTION,
    inLanguage: "uk-UA",
    about: {
      "@type": "City",
      name: APP_CITY,
      address: {
        "@type": "PostalAddress",
        addressLocality: APP_CITY,
        addressRegion: "Рівненська область",
        addressCountry: "UA",
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/places?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd(): JsonLd {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url,
    description: APP_DESCRIPTION,
    areaServed: {
      "@type": "City",
      name: APP_CITY,
    },
    knowsAbout: [
      "заклади Дубна",
      "кафе",
      "ресторани",
      "аптеки",
      "медицина",
      "освіта",
      "памʼятки",
    ],
  };
}

export function placeJsonLd(place: {
  title: string;
  slug: string;
  description: string;
  address: string;
  phone?: string | null;
  website?: string | null;
  workingHours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  categoryName: string;
}): JsonLd {
  const url = absoluteUrl(`/places/${place.slug}`);
  const image = place.images?.[0];

  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: place.title,
    description: place.description.slice(0, 300),
    url,
    image: image ? [image] : undefined,
    telephone: place.phone || undefined,
    sameAs: place.website ? [place.website] : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address,
      addressLocality: APP_CITY,
      addressRegion: "Рівненська область",
      addressCountry: "UA",
    },
    additionalType: place.categoryName,
  };

  if (place.latitude != null && place.longitude != null) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: place.latitude,
      longitude: place.longitude,
    };
  }

  if (place.workingHours) {
    data.openingHours = place.workingHours;
  }

  if (place.rating && place.rating > 0 && (place.reviewCount ?? 0) > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(place.rating.toFixed(1)),
      bestRating: 5,
      worstRating: 1,
      reviewCount: place.reviewCount,
    };
  }

  return data;
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: APP_NAME,
      url: getSiteUrl(),
    },
    about: {
      "@type": "City",
      name: APP_CITY,
    },
  };
}
