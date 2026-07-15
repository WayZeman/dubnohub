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
const NP_WEBSITE = "https://novaposhta.ua/";
const NP_FACEBOOK = "https://www.facebook.com/nova.poshta.official";
const NP_INSTAGRAM = "https://www.instagram.com/novaposhta.official/";
const NP_PHONE = "+380800500609";

async function ensureLogo(): Promise<string> {
  const buffer = await readFile(
    resolve(process.cwd(), "public/brands/nova-poshta-logo.png"),
  );
  const blob = await put("brands/nova-poshta-logo.png", buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });
  return blob.url;
}

type NpWarehouse = {
  Ref: string;
  Number: string;
  CategoryOfWarehouse: "Branch" | "Postomat" | "DropOff" | string;
  Description: string;
  ShortAddress: string;
  Phone?: string;
  Latitude: string;
  Longitude: string;
  Schedule?: Record<string, string>;
  TotalMaxWeightAllowed?: string;
  PlaceMaxWeightAllowed?: string;
  WarehouseStatus?: string;
};

function formatHours(schedule?: Record<string, string>): string | null {
  if (!schedule) return null;
  const mon = schedule.Monday;
  const fri = schedule.Friday;
  const sat = schedule.Saturday;
  const sun = schedule.Sunday;
  if (!mon) return null;
  if (mon === "00:01-23:59") return "Цілодобово";
  const weekdaySame = mon === fri;
  const parts: string[] = [];
  if (weekdaySame) parts.push(`Пн–Пт: ${mon}`);
  else parts.push(`Пн: ${mon}`, `Пт: ${fri ?? mon}`);
  if (sat) parts.push(`Сб: ${sat}`);
  if (sun) parts.push(`Нд: ${sun}`);
  return parts.join(", ");
}

function typeLabel(category: string): string {
  if (category === "Branch") return "Відділення";
  if (category === "Postomat") return "Поштомат";
  if (category === "DropOff") return "Пункт видачі";
  return "Нова Пошта";
}

function slugFor(category: string, number: string): string {
  const kind =
    category === "Branch"
      ? "viddilennya"
      : category === "Postomat"
        ? "poshtomat"
        : category === "DropOff"
          ? "punkt"
          : "np";
  return `nova-poshta-${kind}-${number}-dubno`;
}

function titleFor(w: NpWarehouse): string {
  const label = typeLabel(w.CategoryOfWarehouse);
  return `Нова Пошта ${label} №${w.Number}`;
}

function descriptionFor(w: NpWarehouse): string {
  const kind = typeLabel(w.CategoryOfWarehouse).toLowerCase();
  const weight =
    w.TotalMaxWeightAllowed && w.TotalMaxWeightAllowed !== "0"
      ? ` Максимальна вага: до ${w.TotalMaxWeightAllowed} кг.`
      : w.PlaceMaxWeightAllowed && w.PlaceMaxWeightAllowed !== "0"
        ? ` Максимальна вага на одне місце: до ${w.PlaceMaxWeightAllowed} кг.`
        : "";
  return `${kind.charAt(0).toUpperCase()}${kind.slice(1)} Нової Пошти в Дубні. ${w.Description}.${weight} Офіційна гаряча лінія: ${NP_PHONE}.`;
}

function addressFor(w: NpWarehouse): string {
  const raw = w.ShortAddress || w.Description;
  if (raw.includes("Дубно")) return raw;
  return `${raw}, Дубно`;
}

function phoneFor(w: NpWarehouse): string | null {
  const phone = (w.Phone || "").replace(/\D/g, "");
  if (!phone) {
    return w.CategoryOfWarehouse === "Branch" ? NP_PHONE : null;
  }
  if (phone.startsWith("380")) return `+${phone}`;
  if (phone.startsWith("0")) return `+38${phone}`;
  return `+${phone}`;
}

async function fetchWarehouses(): Promise<NpWarehouse[]> {
  const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: process.env.NOVA_POSHTA_API_KEY || "",
      modelName: "Address",
      calledMethod: "getWarehouses",
      methodProperties: {
        CityName: CITY_NAME,
        Limit: 200,
      },
    }),
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: NpWarehouse[];
    errors?: string[];
  };

  if (!json.success || !json.data) {
    throw new Error(
      `Nova Poshta API error: ${JSON.stringify(json.errors || json)}`,
    );
  }

  // Only city Dubno (not village Dubno in Rokytne district)
  return json.data.filter(
    (w) =>
      w.WarehouseStatus === "Working" ||
      w.WarehouseStatus === undefined ||
      w.WarehouseStatus === "",
  );
}

async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: "poshta" },
    create: {
      name: "Пошта",
      slug: "poshta",
      icon: "Mail",
      description: "Відділення та поштомати Нової Пошти та інших операторів",
      sortOrder: 11,
    },
    update: {
      name: "Пошта",
      description: "Відділення та поштомати Нової Пошти та інших операторів",
    },
  });
}

async function main() {
  const category = await ensureCategory();
  const npLogo = await ensureLogo();
  const warehouses = await fetchWarehouses();

  // Prefer Branch first in featured
  const branches = warehouses.filter((w) => w.CategoryOfWarehouse === "Branch");
  let created = 0;
  let updated = 0;

  for (const w of warehouses) {
    const slug = slugFor(w.CategoryOfWarehouse, w.Number);
    const address = addressFor(w);
    const geo = await geocodeAddress(address, {
      slug,
      delayMs: 1100,
    });
    if (!geo) {
      console.warn(`Geocode failed for ${slug}, using NP API coords`);
    }
    const latitude = geo?.latitude ?? Number.parseFloat(w.Latitude);
    const longitude = geo?.longitude ?? Number.parseFloat(w.Longitude);

    const data = {
      title: titleFor(w),
      slug,
      description: descriptionFor(w),
      categoryId: category.id,
      address,
      latitude,
      longitude,
      phone: phoneFor(w),
      website: NP_WEBSITE,
      facebook: NP_FACEBOOK,
      instagram: NP_INSTAGRAM,
      workingHours: formatHours(w.Schedule),
      featured: w.CategoryOfWarehouse === "Branch",
      rating: 0,
      images: [npLogo],
    };

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

  const counts = {
    total: warehouses.length,
    branches: branches.length,
    postomats: warehouses.filter((w) => w.CategoryOfWarehouse === "Postomat")
      .length,
    dropOff: warehouses.filter((w) => w.CategoryOfWarehouse === "DropOff")
      .length,
    created,
    updated,
  };

  console.log("Nova Poshta Dubno import done:", counts);
  for (const w of branches) {
    console.log(`  • ${titleFor(w)} — ${addressFor(w)}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
