export type GeoResult = {
  latitude: number;
  longitude: number;
  source: string;
};

const SLEEP_MS = 1100;

/** Dubno + suburbs (Pidbortsi, Tarakaniv, etc.) */
const BBOX = {
  minLat: 50.3,
  maxLat: 50.48,
  minLng: 25.65,
  maxLng: 25.85,
};

/** Verified coords when OSM lacks the address (landmarks.in.ua / prior audit). */
export const MANUAL_COORDS: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "budynok-elberta": { latitude: 50.420328, longitude: 25.739283 },
  "budynok-dombrovskoho": { latitude: 50.398921, longitude: 25.757499 },
  "sadyba-shuvalovykh": { latitude: 50.399133, longitude: 25.755536 },
  khmelefabruka: { latitude: 50.418984, longitude: 25.739782 },
  "istorychni-budynky-svobody": {
    latitude: 50.419212,
    longitude: 25.744834,
  },
  "kupezki-budynky-kyryla-mefodiia": {
    latitude: 50.417322,
    longitude: 25.743473,
  },
  "torhovi-budynky-drahomanova": {
    latitude: 50.420269,
    longitude: 25.743869,
  },
  "kolyshnia-likarnia": { latitude: 50.419738, longitude: 25.739191 },
  "sadyba-shevchenka-10": { latitude: 50.422556, longitude: 25.744209 },
  "kontraktovyi-budynok": { latitude: 50.418893, longitude: 25.744262 },
  "monastyr-karmelitek": { latitude: 50.4263697, longitude: 25.7417887 },
  "lutska-brama": { latitude: 50.4186581, longitude: 25.7338444 },
  "park-derevianykh-skulptur": { latitude: 50.4218, longitude: 25.7435 },
  "tarakanivskyi-fort": { latitude: 50.3629697, longitude: 25.7162056 },
  "ukrposhta-35602-dubno": { latitude: 50.386617, longitude: 25.742763 },
  "nova-poshta-poshtomat-36172-dubno": {
    latitude: 50.3649662,
    longitude: 25.7597785,
  },
  "nova-poshta-punkt-54410-dubno": {
    latitude: 50.4180749,
    longitude: 25.7465035,
  },
  "nova-poshta-poshtomat-62270-dubno": {
    latitude: 50.3930338,
    longitude: 25.7413447,
  },
  "nova-poshta-poshtomat-59529-dubno": {
    latitude: 50.4022835,
    longitude: 25.7527933,
  },
  "nova-poshta-poshtomat-42616-dubno": {
    latitude: 50.4173924,
    longitude: 25.7408362,
  },
  "nova-poshta-poshtomat-42617-dubno": {
    latitude: 50.3874687,
    longitude: 25.7521429,
  },
  "nova-poshta-poshtomat-42618-dubno": {
    latitude: 50.4211514,
    longitude: 25.7403124,
  },
  "nova-poshta-poshtomat-36028-dubno": {
    latitude: 50.3894471,
    longitude: 25.7551614,
  },
  // Educational (OSM gaps / square names)
  "budynok-ditei-molodi-dubno": {
    latitude: 50.4188699,
    longitude: 25.7440885,
  },
};

export function inDubnoBbox(lat: number, lng: number): boolean {
  return (
    lat >= BBOX.minLat &&
    lat <= BBOX.maxLat &&
    lng >= BBOX.minLng &&
    lng <= BBOX.maxLng
  );
}

/** Strip venue hints in parentheses and normalize whitespace. */
export function cleanAddress(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+біля\s+.+/i, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*$/g, "")
    .trim();
}

/** Extract street + house number for structured Nominatim lookup. */
export function parseStreetAndNumber(address: string): {
  street: string | null;
  housenumber: string | null;
  freeQuery: string;
} {
  let a = cleanAddress(address);
  a = a.replace(/^Дубно,\s*/i, "");
  a = a.replace(/,\s*Дубно\s*$/i, "");
  a = a.replace(/,\s*прим\.[^,]+/i, "");

  if (/^с\.?\s*Тараканів/i.test(a)) {
    return {
      street: null,
      housenumber: null,
      freeQuery:
        "Тараканівський форт, Тараканів, Дубенський район, Рівненська область",
    };
  }
  if (/^Острівок/i.test(a)) {
    return {
      street: null,
      housenumber: null,
      freeQuery: "Острівок, Дубно, Рівненська область",
    };
  }

  // "Дубно, Пункт, Замкова, 27" -> Замкова 27
  a = a.replace(/,\s*Пункт\s*,/i, ", ");

  const streetMatch = a.match(
    /^(?:(?:вул\.|вулиця|пров\.|провулок)\s*)?(.+?),\s*([\d]+[\dА-Яа-яІіЇїЄєA-Za-z/\-–—]*(?:\s*\/\s*[\d]+[\dА-Яа-яІіЇїЄєA-Za-z\-–—]*)?)\s*$/iu,
  );
  if (streetMatch) {
    let street = streetMatch[1]!
      .replace(/^вул\.?\s*/i, "")
      .replace(/^пров\.?\s*/i, "")
      .replace(/^Петра\s+/i, "")
      // Drop given names that confuse OSM: "Тараса Шевченка" → "Шевченка"
      .replace(
        /^(Тараса|Михайла|Миколи|Станіслава|Якова|Данила|Петра|Князя)\s+/i,
        "",
      )
      .replace(/^Митрополита\s+/i, "")
      .trim();
    const parts = streetMatch[2]!
      .replace(/[–—]/g, "-")
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);

    let housenumber: string;
    if (
      parts.length === 2 &&
      /^\d+$/.test(parts[0]!) &&
      /^\d+$/.test(parts[1]!)
    ) {
      housenumber = String(Math.round((+parts[0]! + +parts[1]!) / 2));
    } else if (parts[0]!.includes("/")) {
      housenumber = parts[0]!.split("/")[0]!.trim();
    } else {
      housenumber = parts[0]!;
    }

    const isProv = /пров/i.test(a);
    if (!/^(вулиця|провулок|площа|майдан|проспект)/i.test(street)) {
      street = isProv ? `провулок ${street}` : `вулиця ${street}`;
    }

    return {
      street,
      housenumber,
      freeQuery: `${street} ${housenumber}, Дубно, Рівненська область, Україна`,
    };
  }

  const commaParts = a.split(",").map((p) => p.trim());
  if (commaParts.length >= 2) {
    const last = commaParts[commaParts.length - 1]!;
    const streetPart = commaParts.slice(0, -1).join(", ");
    if (/^[\d]/.test(last)) {
      const streetRaw = streetPart.replace(/^Дубно\s*/i, "").trim();
      const street =
        /^(вулиця|провулок|площа)/i.test(streetRaw)
          ? streetRaw
          : `вулиця ${streetRaw}`;
      const housenumber = last.replace(/,.*/, "").trim();
      return {
        street,
        housenumber,
        freeQuery: `${street} ${housenumber}, Дубно, Рівненська область, Україна`,
      };
    }
  }

  if (/парк|Будинку культури|Шевченка \(парк/i.test(a)) {
    return {
      street: null,
      housenumber: null,
      freeQuery: `${a}, Дубно, Рівненська область, Україна`,
    };
  }

  return {
    street: null,
    housenumber: null,
    freeQuery: `${a}, Дубно, Рівненська область, Україна`,
  };
}

function viewboxParams(): Record<string, string> {
  return {
    viewbox: `${BBOX.minLng},${BBOX.maxLat},${BBOX.maxLng},${BBOX.minLat}`,
    bounded: "1",
  };
}

async function nominatimStructured(
  street: string,
  housenumber: string,
): Promise<GeoResult | null> {
  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    countrycodes: "ua",
    city: "Дубно",
    county: "Дубенський район",
    street: `${street} ${housenumber}`,
    ...viewboxParams(),
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent":
          "DubnoHub/1.0 (address geocoding; https://dubnohub.vercel.app)",
      },
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data[0]) return null;
  const latitude = +data[0].lat;
  const longitude = +data[0].lon;
  if (!inDubnoBbox(latitude, longitude)) return null;
  return { latitude, longitude, source: "nominatim-structured" };
}

async function nominatimFree(query: string): Promise<GeoResult | null> {
  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    countrycodes: "ua",
    q: query,
    ...viewboxParams(),
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent":
          "DubnoHub/1.0 (address geocoding; https://dubnohub.vercel.app)",
      },
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!data[0]) return null;
  const latitude = +data[0].lat;
  const longitude = +data[0].lon;
  if (!inDubnoBbox(latitude, longitude)) return null;
  return { latitude, longitude, source: "nominatim-free" };
}

export async function geocodeAddress(
  address: string,
  opts?: { delayMs?: number; slug?: string },
): Promise<GeoResult | null> {
  if (opts?.slug && MANUAL_COORDS[opts.slug]) {
    const m = MANUAL_COORDS[opts.slug]!;
    return { ...m, source: "manual-verified" };
  }

  const delay = opts?.delayMs ?? 0;
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));

  const parsed = parseStreetAndNumber(address);
  if (parsed.street && parsed.housenumber) {
    const structured = await nominatimStructured(
      parsed.street,
      parsed.housenumber,
    );
    if (structured) return structured;
    await new Promise((r) => setTimeout(r, SLEEP_MS));
  }
  return nominatimFree(parsed.freeQuery);
}

export function distMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
