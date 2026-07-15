import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

import { geocodeAddress } from "../lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type School = {
  slug: string;
  title: string;
  description: string;
  address: string;
  phone?: string | null;
  website?: string | null;
  facebook?: string | null;
  workingHours?: string | null;
  featured?: boolean;
  photoUrls?: string[];
};

/**
 * Навчальні заклади Дубна.
 * Джерела: dubno-adm.gov.ua (ЗЗСО, ЗДО, ВНЗ, позашкільна),
 * education.ua, dmk.edu.ua, dubnopk.com.ua, registry.edbo.gov.ua.
 */
const SCHOOLS: School[] = [
  // —— ЗЗСО ——
  {
    slug: "litsey-1-dubno",
    title: "Дубенський ліцей №1",
    description:
      "Комунальний заклад загальної середньої освіти Дубенської міської ради. Ліцей з початковою школою та гімназією (1–12 класи).",
    address: "вул. Тараса Шевченка, 23, Дубно",
    phone: "+380667344237",
    website: "https://znz-1.blogspot.com/",
    featured: true,
  },
  {
    slug: "litsey-2-dubno",
    title: "Дубенський ліцей №2",
    description:
      "Комунальний заклад загальної середньої освіти Дубенської міської ради. Ліцей з повним циклом навчання.",
    address: "вул. Пекарська, 14, Дубно",
    phone: "+380999270254",
    website: "http://dubnolyceum2.softbi.info/",
    featured: true,
  },
  {
    slug: "litsey-3-dubno",
    title: "Дубенський ліцей №3",
    description:
      "Комунальний заклад загальної середньої освіти Дубенської міської ради. Ліцей з початковою школою та гімназією (1–12 класи).",
    address: "вул. Стара, 20, Дубно",
    phone: "+380500773335",
    website: "https://sites.google.com/view/lyceum3dubno",
  },
  {
    slug: "pochatkova-shkola-dubno",
    title: "Дубенська початкова школа",
    description:
      "Комунальний заклад загальної середньої освіти (1–4 класи) Дубенської міської ради.",
    address: "вул. Венецька, 11а, Дубно",
    phone: "+380506250694",
    website: "https://dubno.school.org.ua/",
  },
  {
    slug: "litsey-5-dubno",
    title: "Дубенський ліцей №5",
    description:
      "Комунальний заклад загальної середньої освіти Дубенської міської ради. Ліцей з початковою школою та гімназією (1–12 класи).",
    address: "вул. Митрополита Шептицького, 3, Дубно",
    phone: "+380997093753",
    website: "https://www.lyceum5.com/",
    featured: true,
  },
  {
    slug: "litsey-6-dubno",
    title: "Дубенський ліцей №6",
    description:
      "Комунальний заклад загальної середньої освіти Дубенської міської ради. Ліцей з повним циклом навчання.",
    address: "вул. Михайла Грушевського, 182, Дубно",
    phone: "+380502771331",
    website: "http://www.dubnoschool6.com.ua/",
  },
  {
    slug: "litsey-7-dubno",
    title: "Дубенський ліцей №7",
    description:
      "Комунальний заклад загальної середньої освіти Дубенської міської ради. Ліцей з початковою школою та гімназією (1–12 класи).",
    address: "пров. Шкільний, 2, Дубно",
    phone: "+380506629610",
    website: "http://dubno-school7.at.ua/",
  },
  {
    slug: "litsey-8-dubno",
    title: "Дубенський ліцей №8",
    description:
      "Комунальний заклад загальної середньої освіти Дубенської міської ради. Колишня гімназія №2; ліцей з повним циклом навчання.",
    address: "вул. Станіслава Морозенка, 34, Дубно",
    phone: "+380666466481",
    website: "http://gymnasium2.com.ua/",
    featured: true,
  },
  {
    slug: "spetsialna-shkola-dubno",
    title: "Спеціальна школа Дубно",
    description:
      "Спеціальна школа Рівненської обласної ради для дітей з особливими освітніми потребами (1–9 класи).",
    address: "вул. Фабрична, 6, Дубно",
  },
  {
    slug: "litsey-premudrist-dubno",
    title: "Ліцей «Премудрість»",
    description:
      "Приватний заклад загальної середньої освіти з навчанням у 1–12 класах.",
    address: "вул. Гірницька, 40, Дубно",
  },

  // —— ЗДО (садки) ——
  {
    slug: "zdo-2-dubno",
    title: "ЗДО №2 «Малятко»",
    description:
      "Заклад дошкільної освіти №2 Дубенської міської ради. Дитячий садок для вихованців дошкільного віку.",
    address: "пров. Центральний, 5, Дубно",
    phone: "+380956482413",
    website: "http://dubno2.dytsadok.org.ua/",
  },
  {
    slug: "zdo-3-dubno",
    title: "ЗДО №3 «Дзвіночок»",
    description:
      "Заклад дошкільної освіти №3 комбінованого типу Дубенської міської ради.",
    address: "вул. Миколи Лисенка, 13, Дубно",
    phone: "+380958403528",
    website: "http://dubno3.dytsadok.org.ua/",
  },
  {
    slug: "zdo-4-dubno",
    title: "ЗДО №4 «Сонечко»",
    description:
      "Заклад дошкільної освіти №4 Дубенської міської ради. Дитячий садок.",
    address: "вул. Скарбова, 7, Дубно",
    phone: "+380959265126",
    website: "http://dubno4.dytsadok.org.ua/",
  },
  {
    slug: "zdo-5-dubno",
    title: "ЗДО №5",
    description:
      "Заклад дошкільної освіти №5 Дубенської міської ради. Дитячий садок.",
    address: "вул. Якова Щоголіва, 2/4, Дубно",
    phone: "+380954543963",
    website: "http://dubno5.dytsadok.org.ua/",
  },
  {
    slug: "zdo-6-dubno",
    title: "ЗДО №6",
    description:
      "Заклад дошкільної освіти №6 комбінованого типу Дубенської міської ради.",
    address: "вул. Станіслава Морозенка, 75, Дубно",
    phone: "+380668016706",
    website: "http://dubno6.dytsadok.org.ua/",
  },
  {
    slug: "zdo-7-dubno",
    title: "ЗДО №7",
    description:
      "Заклад дошкільної освіти №7 комбінованого типу Дубенської міської ради.",
    address: "вул. Мирогощанська, 63, Дубно",
    phone: "+380992024232",
    website: "http://dubno7.dytsadok.org.ua/",
  },

  // —— Коледжі / університет / профтехосвіта ——
  {
    slug: "medychnyi-koledzh-dubno",
    title: "Дубенський медичний коледж",
    description:
      "Вищий комунальний заклад «Дубенський медичний коледж» Рівненської обласної ради. Підготовка фахівців медичної галузі.",
    address: "вул. Князя Острозького, 25, Дубно",
    phone: "+380365632382",
    website: "http://dmk.edu.ua/",
    featured: true,
  },
  {
    slug: "pedahohichnyi-koledzh-rdgu-dubno",
    title: "Педагогічний коледж РДГУ",
    description:
      "Відокремлений структурний підрозділ «Дубенський педагогічний фаховий коледж Рівненського державного гуманітарного університету». Шкільне відділення — підготовка педагогів.",
    address: "вул. Тараса Шевченка, 54, Дубно",
    phone: "+380365642555",
    website: "https://dubnopk.com.ua/",
    featured: true,
  },
  {
    slug: "pedahohichnyi-koledzh-doshkilne-dubno",
    title: "Педколедж РДГУ (дошкільне)",
    description:
      "Дошкільне відділення Відокремленого структурного підрозділу «Дубенський педагогічний фаховий коледж РДГУ».",
    address: "вул. Свободи, 44, Дубно",
    phone: "+380365642669",
    website: "https://dubnopk.com.ua/",
  },
  {
    slug: "koledzh-kultury-mystetstv-dubno",
    title: "Коледж культури і мистецтв РДГУ",
    description:
      "Фаховий коледж культури і мистецтв Рівненського державного гуманітарного університету. Підготовка фахівців у сфері культури та мистецтва.",
    address: "вул. Замкова, 6, Дубно",
    phone: "+380365641743",
    website: "http://collegeculture.at.ua/",
  },
  {
    slug: "profesiynyi-litsey-dubno",
    title: "Дубенське ВХПТУ",
    description:
      "Заклад професійно-технічної освіти. Колишнє Дубенське вище художнє професійно-технічне училище; підготовка кваліфікованих робітників.",
    address: "вул. Шашкевича, 3, Дубно",
    phone: "+380365621869",
    website: "http://dpl.in.ua/",
  },
  {
    slug: "universytet-ukraina-dubno",
    title: "Філія Університету «Україна»",
    description:
      "Відокремлений структурний підрозділ Відкритого міжнародного університету розвитку людини «Україна». Вища та фахова передвища освіта (фінанси, право, IT, бібліотечна справа).",
    address: "вул. Тараса Шевченка, 14, Дубно",
    phone: "+380365649499",
    website: "http://dubno.uu.edu.ua/",
    featured: true,
  },

  // —— Позашкільна ——
  {
    slug: "budynok-ditei-molodi-dubno",
    title: "Будинок дітей та молоді",
    description:
      "Центр позашкільної освіти Дубенської міської ради: художньо-естетичні, туристсько-краєзнавчі, еколого-натуралістичні та спортивні гуртки.",
    address: "майдан Незалежності, 1, Дубно",
    phone: "+380365642198",
    website: "https://bdm-dubno.at.ua/",
  },
  {
    slug: "tsentr-naukovo-tekhnichnoi-tvorchosti-dubno",
    title: "Центр НТДТ",
    description:
      "Центр науково-технічної дитячої та юнацької творчості Дубенської міської ради. Гуртки технічної творчості, моделювання, конструювання.",
    address: "вул. Запорізька, 24, Дубно",
    phone: "+380993116558",
    website: "http://msutd.osv.org.ua/",
  },
  {
    slug: "tsentr-natsionalno-patriotychnoho-vykhovannia-dubno",
    title: "Центр патріотичного виховання",
    description:
      "Комунальний заклад «Дубенський Центр національно-патріотичного виховання та туризму» Дубенської міської ради.",
    address: "вул. Свободи, 1, Дубно",
    phone: "+380667357864",
    website: "http://www.dubno-rsut.rv.sch.in.ua/",
  },
  {
    slug: "diuss-dubno",
    title: "ДЮСШ Дубно",
    description:
      "Дитячо-юнацька спортивна школа Дубенської міської ради. Спортивні секції для дітей та підлітків.",
    address: "вул. Семидубська, 16А, Дубно",
  },
  {
    slug: "shkola-mystetstv-dubno",
    title: "Школа мистецтв Дубно",
    description:
      "Школа мистецтв Дубенської міської ради (музичне, хореографічне та образотворче відділення). Утворена шляхом об’єднання музичної та художньої шкіл.",
    address: "вул. Миколи Лисенка, 17, Дубно",
    phone: "+380365643262",
  },
];

async function ensureCategory() {
  const legacy = await prisma.category.findUnique({
    where: { slug: "shkoly" },
  });

  if (legacy) {
    return prisma.category.update({
      where: { slug: "shkoly" },
      data: {
        name: "Навчальні заклади",
        slug: "navchalni-zaklady",
        icon: "GraduationCap",
        description:
          "Школи, садочки, ліцеї, коледжі, університетські підрозділи та позашкільна освіта Дубна",
        sortOrder: 8,
      },
    });
  }

  return prisma.category.upsert({
    where: { slug: "navchalni-zaklady" },
    create: {
      name: "Навчальні заклади",
      slug: "navchalni-zaklady",
      icon: "GraduationCap",
      description:
        "Школи, садочки, ліцеї, коледжі, університетські підрозділи та позашкільна освіта Дубна",
      sortOrder: 8,
    },
    update: {
      name: "Навчальні заклади",
      icon: "GraduationCap",
      description:
        "Школи, садочки, ліцеї, коледжі, університетські підрозділи та позашкільна освіта Дубна",
      sortOrder: 8,
    },
  });
}

async function main() {
  const category = await ensureCategory();

  let created = 0;
  let updated = 0;
  let geocoded = 0;

  for (const school of SCHOOLS) {
    const geo = await geocodeAddress(school.address, {
      slug: school.slug,
      delayMs: 1100,
    });
    if (geo) geocoded++;

    const data = {
      title: school.title,
      slug: school.slug,
      description: school.description,
      categoryId: category.id,
      address: school.address,
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
      phone: school.phone ?? null,
      website: school.website ?? null,
      facebook: school.facebook ?? null,
      instagram: null,
      workingHours: school.workingHours ?? null,
      featured: Boolean(school.featured),
      images: school.photoUrls ?? [],
    };

    const existing = await prisma.place.findUnique({
      where: { slug: school.slug },
      select: { id: true, images: true, latitude: true, longitude: true },
    });

    if (existing) {
      const images =
        existing.images.length > 0 ? existing.images : data.images;
      await prisma.place.update({
        where: { slug: school.slug },
        data: {
          ...data,
          images,
          latitude: geo?.latitude ?? existing.latitude,
          longitude: geo?.longitude ?? existing.longitude,
        },
      });
      updated++;
      console.log(`↻ ${school.title}${geo ? ` (${geo.source})` : " (no geo)"}`);
    } else {
      await prisma.place.create({ data });
      created++;
      console.log(`+ ${school.title}${geo ? ` (${geo.source})` : " (no geo)"}`);
    }
  }

  console.log("Schools import done:", {
    total: SCHOOLS.length,
    created,
    updated,
    geocoded,
    category: category.slug,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
