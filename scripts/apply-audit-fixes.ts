import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { MANUAL_COORDS } from "../lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/**
 * Verified fixes from deep audit (zabytki / Wikidata / OSM / ISUO / EDBO).
 * Only high-confidence changes.
 */
const FIXES: Record<
  string,
  {
    title?: string;
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string | null;
    website?: string | null;
    facebook?: string | null;
  }
> = {
  // —— Landmarks: wrong street midpoints ——
  "mykolaivskyi-sobor": {
    latitude: 50.419084,
    longitude: 25.7347093,
  },
  "pamyatnyk-shevchenku": {
    latitude: 50.418528,
    longitude: 25.737464,
  },
  "spaso-preobrazhenska-tserkva": {
    latitude: 50.4146407,
    longitude: 25.7348006,
  },
  "kostel-yana-nepomuka": {
    // OSM place_of_worship «Костел Святого Яна Непомука»
    latitude: 50.420341,
    longitude: 25.7433243,
  },
  "dubenskyi-zamok": {
    latitude: 50.41954,
    longitude: 25.74808,
  },
  "kraieznavchyi-muzei": {
    // Inside castle complex
    latitude: 50.41954,
    longitude: 25.74808,
  },
  // OSM «ЗОШ №3» on Стара (was wrongly street-centroid shared with NP №4)
  "litsey-3-dubno": {
    latitude: 50.4178663,
    longitude: 25.7374917,
  },

  // —— Medical college: must NOT share kostel pin ——
  "medychnyi-koledzh-dubno": {
    title: "Дубенський медичний коледж",
    address: "вул. Князя Острозького, 25, Дубно",
    // East of kostel (№18) along Ostrozkoho toward №25; no OSM POI yet
    latitude: 50.42048,
    longitude: 25.74412,
    phone: "+380365632382",
    website: "https://dmk.edu.ua/",
    description:
      "Повна назва: Відокремлений підрозділ «Дубенський фаховий медичний коледж» комунального закладу вищої освіти «Рівненська медична академія» Рівненської обласної ради. Підготовка фахівців медичної галузі. Адреса: вул. Князя Острозького, 25 (окремо від костелу Яна Непомука, №18).",
  },

  // —— Schools contacts ——
  "diuss-dubno": {
    phone: "+380365642472",
    website: "https://ddys.school.org.ua/",
    description:
      "Повна назва: Дитячо-юнацька спортивна школа Дубенської міської ради Рівненської області. Спортивні секції для дітей та підлітків.",
  },
  "spetsialna-shkola-dubno": {
    phone: "+380365645222",
    website: "http://dubno-speczosh.rv.sch.in.ua/",
    description:
      "Повна назва: Спеціальна школа в м. Дубно Рівненської обласної ради. Спеціальний заклад загальної середньої освіти для дітей з особливими освітніми потребами (1–9 класи).",
  },
  "litsey-7-dubno": {
    website: "https://dubno7.licey.org.ua/",
  },
  "pedahohichnyi-koledzh-rdgu-dubno": {
    phone: "+380365632517",
  },
  "koledzh-kultury-mystetstv-dubno": {
    phone: "+380365649443",
    website: "https://kulturedubno.com.ua/",
  },
  "profesiynyi-litsey-dubno": {
    phone: "+380365622040",
    website: "http://dpl.in.ua/",
  },
  "budynok-ditei-molodi-dubno": {
    address: "вул. Свободи, 1, Дубно",
    phone: "+380365632217",
    website: "https://bdmd.osv.org.ua/",
    // Same registered complex as ЦНПВТ; share pin is intentional until separate entrance verified
    latitude: 50.418893,
    longitude: 25.744262,
    description:
      "Повна назва: Будинок дітей та молоді Дубенської міської ради Рівненської області. Заклад позашкільної освіти: художньо-естетичні, туристсько-краєзнавчі, еколого-натуралістичні та спортивні гуртки. Адреса: вул. Свободи, 1 (спільний комплекс з Центром національно-патріотичного виховання).",
  },
  "tsentr-natsionalno-patriotychnoho-vykhovannia-dubno": {
    address: "вул. Свободи, 1, Дубно",
    latitude: 50.418893,
    longitude: 25.744262,
    facebook: "https://www.facebook.com/groups/1977753339153183",
    description:
      "Повна назва: Дубенський Центр національно-патріотичного виховання та туризму. Комунальний заклад позашкільної освіти Дубенської міської ради. Адреса: вул. Свободи, 1 (спільний комплекс з Будинком дітей та молоді).",
  },
  "tsentr-naukovo-tekhnichnoi-tvorchosti-dubno": {
    address: "вул. Запорізька, 24А, Дубно",
    website: "https://cntdut.osv.org.ua/",
  },
  "litsey-8-dubno": {
    phone: "+380666466481",
  },
  "sobor-proroka-illii": {
    phone: "+380365643230",
    website: "https://www.dubnosobor.com.ua/",
  },
  "sobor-rizdva-bohorodytsi": {
    phone: "+380365633174",
    description:
      "Величний пʼятибаневий мурований храм, «перлина» Дубна, що поєднує візантійські й українсько-барокові мотиви. Розташований у південній частині міста (колишнє с. Страклів), вул. Полуботка, 17 — тому на мапі значно південніше центру. Історія сягає монастиря, який тут існував раніше.",
  },
};

async function main() {
  let updated = 0;
  for (const [slug, patch] of Object.entries(FIXES)) {
    const existing = await prisma.place.findUnique({ where: { slug } });
    if (!existing) {
      console.warn("missing", slug);
      continue;
    }
    await prisma.place.update({ where: { slug }, data: patch });
    updated++;
    console.log("↻", slug, Object.keys(patch).join(","));
  }

  // Also refresh MANUAL_COORDS file advice printout
  console.log("\nMANUAL_COORDS in code for comparison:");
  for (const slug of Object.keys(FIXES)) {
    if (MANUAL_COORDS[slug]) {
      console.log("  code", slug, MANUAL_COORDS[slug]);
    }
  }
  console.log("Done updates:", updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
