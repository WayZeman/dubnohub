import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const CITY_NAME = "Дубно";
const MEEST_API = "https://publicapi.meest.com";
const MEEST_WEBSITE = "https://meestposhta.com.ua/";
const MEEST_FACEBOOK = "https://www.facebook.com/meestexpress";
const MEEST_INSTAGRAM = "https://www.instagram.com/meest_official/";
const MEEST_PHONE = "+380800505072";

type Localized = { ua?: string; ru?: string; en?: string };

type MeestBranchListItem = {
  br_id: string;
  city?: Localized;
  num_showcase?: number | string;
  parcel_max_kg?: number;
  type_public?: Localized;
};

type MeestBranchDetail = {
  br_id: string;
  num_showcase: number | string;
  city?: Localized;
  street?: Localized;
  street_number?: string;
  location_description?: string | null;
  lat?: string;
  lng?: string;
  working_hours?: string | null;
  type_public?: Localized;
  limits?: {
    parcel_max_kg?: number;
    place_max_kg?: number;
  };
};

async function ensureLogo(): Promise<string> {
  const buffer = await readFile(
    resolve(process.cwd(), "public/brands/meest-logo.png"),
  );
  const blob = await put("brands/meest-logo.png", buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });
  return blob.url;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${MEEST_API}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "DubnoHub/1.0",
    },
  });
  if (!res.ok) {
    throw new Error(`Meest API ${path} failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    status: number;
    result: T;
    msg?: unknown;
  };
  if (json.status !== 1 || json.result == null) {
    throw new Error(`Meest API ${path} error: ${JSON.stringify(json.msg)}`);
  }
  return json.result;
}

async function fetchBranches(): Promise<MeestBranchDetail[]> {
  const list = await apiGet<MeestBranchListItem[]>(
    `/branches?city=${encodeURIComponent(CITY_NAME)}`,
  );

  const inCity = list.filter((b) => b.city?.ua === CITY_NAME);
  const details: MeestBranchDetail[] = [];

  for (const item of inCity) {
    const detailList = await apiGet<MeestBranchDetail[]>(
      `/branches/${item.br_id}`,
    );
    const detail = detailList[0];
    if (!detail) continue;
    if (detail.city?.ua !== CITY_NAME) continue;
    details.push(detail);
  }

  return details.sort(
    (a, b) => Number(a.num_showcase) - Number(b.num_showcase),
  );
}

function cleanHours(raw?: string | null): string | null {
  if (!raw) return null;
  return raw
    .replace(/,\s*Нд\s+--:-----:--/g, "")
    .replace(/,\s*Нд\s+--:--\s*-\s*--:--/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function typeLabel(branch: MeestBranchDetail): string {
  const raw = branch.type_public?.ua?.trim() || "Відділення";
  if (/поштомат/i.test(raw)) return "Поштомат";
  if (/міні/i.test(raw)) return "Міні-відділення";
  return raw;
}

function slugFor(number: string | number): string {
  return `meest-${number}-dubno`;
}

function titleFor(branch: MeestBranchDetail): string {
  const kind = typeLabel(branch);
  return `Meest ${kind} №${branch.num_showcase}`;
}

function addressFor(branch: MeestBranchDetail): string {
  const street = branch.street?.ua?.trim() || "";
  const number = branch.street_number?.trim() || "";
  const base = [street, number].filter(Boolean).join(", ");
  const withCity = base.includes("Дубно") ? base : `${base}, Дубно`;
  const note = branch.location_description?.trim();
  return note ? `${withCity} (${note})` : withCity;
}

function descriptionFor(branch: MeestBranchDetail): string {
  const kind = typeLabel(branch).toLowerCase();
  const kg =
    branch.limits?.parcel_max_kg ??
    branch.limits?.place_max_kg ??
    null;
  const weight = kg ? ` Максимальна вага посилки: до ${kg} кг.` : "";
  const note = branch.location_description?.trim();
  const placeNote = note ? ` Орієнтир: ${note}.` : "";
  return `${kind.charAt(0).toUpperCase()}${kind.slice(1)} Meest у Дубні.${placeNote}${weight} Контакт-центр: ${MEEST_PHONE}.`;
}

async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: "poshta" },
    create: {
      name: "Пошта",
      slug: "poshta",
      icon: "Mail",
      description:
        "Відділення та поштомати Нової Пошти, Укрпошти, Meest та інших операторів",
      sortOrder: 11,
    },
    update: {
      name: "Пошта",
      description:
        "Відділення та поштомати Нової Пошти, Укрпошти, Meest та інших операторів",
    },
  });
}

async function main() {
  const category = await ensureCategory();
  const logo = await ensureLogo();
  const branches = await fetchBranches();

  let created = 0;
  let updated = 0;

  for (const branch of branches) {
    const number = String(branch.num_showcase);
    const slug = slugFor(number);
    const kind = typeLabel(branch);
    const featured = !/міні/i.test(kind) || Number(branch.limits?.parcel_max_kg ?? 0) >= 30;
    const address = addressFor(branch);

    const geo = await geocodeAddress(address, { slug, delayMs: 1100 });
    const latitude = geo?.latitude ?? Number.parseFloat(branch.lat || "");
    const longitude = geo?.longitude ?? Number.parseFloat(branch.lng || "");

    const data = {
      title: titleFor(branch),
      slug,
      description: descriptionFor(branch),
      categoryId: category.id,
      address,
      latitude,
      longitude,
      phone: MEEST_PHONE,
      website: MEEST_WEBSITE,
      facebook: MEEST_FACEBOOK,
      instagram: MEEST_INSTAGRAM,
      workingHours: cleanHours(branch.working_hours),
      featured,
      rating: 0,
      images: [logo],
    };

    if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) {
      throw new Error(`Meest #${number} missing coordinates`);
    }

    const existing = await prisma.place.findUnique({ where: { slug } });
    if (existing) {
      await prisma.place.update({
        where: { slug },
        data: {
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          phone: data.phone,
          website: data.website,
          facebook: data.facebook,
          instagram: data.instagram,
          workingHours: data.workingHours,
          featured: data.featured,
          images: data.images,
        },
      });
      updated++;
    } else {
      await prisma.place.create({ data });
      created++;
    }
  }

  console.log("Meest Dubno import done:", {
    total: branches.length,
    created,
    updated,
    logo,
  });
  for (const branch of branches) {
    console.log(`  • ${titleFor(branch)} — ${addressFor(branch)}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
