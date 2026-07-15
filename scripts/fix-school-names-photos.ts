import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/**
 * Short card title + full official name in description.
 * Local façades (no text overlays) from /tmp/school-covers when present.
 */
type Patch = {
  title: string;
  fullName: string;
  blurb: string;
  website?: string;
  phone?: string;
  /** Local cover path under /tmp/school-covers or absolute */
  localCover?: string;
  /** Remote fallback if local missing */
  photoUrls?: string[];
};

const UPDATES: Record<string, Patch> = {
  "litsey-1-dubno": {
    title: "Дубенський ліцей №1",
    fullName:
      "Дубенський ліцей №1 Дубенської міської ради Рівненської області",
    blurb:
      "Комунальний заклад загальної середньої освіти. Ліцей з початковою школою та гімназією (1–12 класи).",
    website: "https://znz-1.blogspot.com/",
    localCover: "/tmp/school-covers/litsey-1-dubno.jpg",
  },
  "litsey-2-dubno": {
    title: "Дубенський ліцей №2",
    fullName:
      "Дубенський ліцей №2 Дубенської міської ради Рівненської області",
    blurb:
      "Комунальний заклад загальної середньої освіти. Ліцей з повним циклом навчання.",
    website: "http://dubnolyceum2.softbi.info/",
  },
  "litsey-3-dubno": {
    title: "Дубенський ліцей №3",
    fullName:
      "Дубенський ліцей №3 Дубенської міської ради Рівненської області",
    blurb:
      "Комунальний заклад загальної середньої освіти. Ліцей з початковою школою та гімназією (1–12 класи).",
    website: "https://sites.google.com/view/lyceum3dubno",
  },
  "pochatkova-shkola-dubno": {
    title: "Дубенська початкова школа",
    fullName:
      "Дубенська початкова школа Дубенської міської ради Рівненської області",
    blurb: "Комунальний заклад загальної середньої освіти (1–4 класи).",
    website: "https://dubno.school.org.ua/",
    localCover: "/tmp/school-covers/pochatkova-shkola-dubno.jpg",
  },
  "litsey-5-dubno": {
    title: "Дубенський ліцей №5",
    fullName:
      "Дубенський ліцей №5 Дубенської міської ради Рівненської області",
    blurb:
      "Комунальний заклад загальної середньої освіти. Ліцей з початковою школою та гімназією (1–12 класи).",
    website: "https://www.liceym5.net/",
    localCover: "/tmp/school-covers/litsey-5-dubno.jpg",
  },
  "litsey-6-dubno": {
    title: "Дубенський ліцей №6",
    fullName:
      "Дубенський ліцей №6 Дубенської міської ради Рівненської області",
    blurb:
      "Комунальний заклад загальної середньої освіти. Ліцей з повним циклом навчання.",
    website: "http://www.dubnoschool6.com.ua/",
    localCover: "/tmp/school-covers/litsey-6-dubno.jpg",
  },
  "litsey-7-dubno": {
    title: "Дубенський ліцей №7",
    fullName:
      "Дубенський ліцей №7 Дубенської міської ради Рівненської області",
    blurb:
      "Комунальний заклад загальної середньої освіти. Ліцей з початковою школою та гімназією (1–12 класи).",
    website: "http://dubno-school7.at.ua/",
    localCover: "/tmp/school-covers/litsey-7-dubno.png",
  },
  "litsey-8-dubno": {
    title: "Дубенський ліцей №8",
    fullName:
      "Дубенський ліцей №8 Дубенської міської ради Рівненської області",
    blurb:
      "Комунальний заклад загальної середньої освіти. Колишня гімназія №2; ліцей з гімназією.",
    website: "http://gymnasium2.com.ua/",
    phone: "+380665997724",
  },
  "spetsialna-shkola-dubno": {
    title: "Спеціальна школа Дубно",
    fullName: "Спеціальна школа в м. Дубно Рівненської обласної ради",
    blurb:
      "Спеціальний заклад загальної середньої освіти для дітей з особливими освітніми потребами (1–9 класи).",
  },
  "litsey-premudrist-dubno": {
    title: "Ліцей «Премудрість»",
    fullName: "Приватний заклад «Дубенський ліцей «Премудрість»»",
    blurb:
      "Приватний ліцей з початковою школою та гімназією (1–12 класи).",
    website: "https://www.premudrist.com.ua/",
    phone: "+380974378703",
    localCover: "/tmp/school-covers/litsey-premudrist-dubno.jpg",
  },
  "zdo-2-dubno": {
    title: "ЗДО №2 «Малятко»",
    fullName:
      "Комунальний заклад дошкільної освіти №2 Дубенської міської територіальної громади Рівненської області",
    blurb: "Дитячий садок. Електронна черга: reg.isuo.org.",
    website: "http://dubno2.dytsadok.org.ua/",
    localCover: "/tmp/school-covers/zdo-2-dubno.jpg",
  },
  "zdo-3-dubno": {
    title: "ЗДО №3 «Дзвіночок»",
    fullName:
      "Комунальний заклад дошкільної освіти №3 комбінованого типу Дубенської міської територіальної громади Рівненської області",
    blurb: "Дитячий садок комбінованого типу.",
    website: "http://dubno3.dytsadok.org.ua/",
    localCover: "/tmp/school-covers/zdo-3-dubno.jpg",
  },
  "zdo-4-dubno": {
    title: "ЗДО №4 «Сонечко»",
    fullName:
      "Комунальний заклад дошкільної освіти №4 Дубенської міської територіальної громади Рівненської області",
    blurb: "Дитячий садок.",
    website: "http://dubno4.dytsadok.org.ua/",
    localCover: "/tmp/school-covers/zdo-4-dubno.jpg",
  },
  "zdo-5-dubno": {
    title: "ЗДО №5",
    fullName:
      "Комунальний заклад дошкільної освіти №5 Дубенської міської територіальної громади Рівненської області",
    blurb: "Дитячий садок.",
    website: "http://dubno5.dytsadok.org.ua/",
  },
  "zdo-6-dubno": {
    title: "ЗДО №6",
    fullName:
      "Комунальний заклад дошкільної освіти №6 комбінованого типу Дубенської міської територіальної громади Рівненської області",
    blurb: "Дитячий садок комбінованого типу.",
    website: "http://dubno6.dytsadok.org.ua/",
    localCover: "/tmp/school-covers/zdo-6-dubno.jpg",
  },
  "zdo-7-dubno": {
    title: "ЗДО №7",
    fullName:
      "Комунальний заклад дошкільної освіти №7 комбінованого типу Дубенської міської територіальної громади Рівненської області",
    blurb: "Дитячий садок комбінованого типу.",
    website: "http://dubno7.dytsadok.org.ua/",
  },
  "medychnyi-koledzh-dubno": {
    title: "Дубенський медичний коледж",
    fullName: "Дубенський фаховий медичний коледж",
    blurb:
      "Вищий комунальний заклад «Дубенський фаховий медичний коледж» Рівненської обласної ради. Підготовка фахівців медичної галузі.",
    website: "https://dmk.edu.ua/",
    phone: "+380365632382",
    localCover: "/tmp/school-covers/medychnyi-koledzh-dubno.jpg",
  },
  "pedahohichnyi-koledzh-rdgu-dubno": {
    title: "Педагогічний коледж РДГУ",
    fullName:
      "Відокремлений структурний підрозділ «Дубенський педагогічний фаховий коледж Рівненського державного гуманітарного університету»",
    blurb:
      "Шкільне відділення — підготовка педагогів. Адреса: вул. Тараса Шевченка, 54.",
    website: "https://dubnopk.com.ua/",
  },
  "pedahohichnyi-koledzh-doshkilne-dubno": {
    title: "Педколедж РДГУ (дошкільне)",
    fullName:
      "ВСП «Дубенський педагогічний фаховий коледж РДГУ» — дошкільне відділення",
    blurb: "Дошкільне відділення педагогічного фахового коледжу РДГУ.",
    website: "https://dubnopk.com.ua/",
  },
  "koledzh-kultury-mystetstv-dubno": {
    title: "Коледж культури і мистецтв РДГУ",
    fullName:
      "ВСП «Дубенський фаховий коледж культури і мистецтв Рівненського державного гуманітарного університету»",
    blurb:
      "Фаховий коледж культури і мистецтв РДГУ. Підготовка фахівців у сфері культури та мистецтва.",
    website: "http://collegeculture.at.ua/",
    localCover: "/tmp/school-covers/koledzh-kultury-mystetstv-dubno.jpg",
  },
  "profesiynyi-litsey-dubno": {
    title: "Дубенське ВХПТУ",
    fullName:
      "ДНЗ «Дубенське вище художнє професійно-технічне училище»",
    blurb:
      "Заклад професійної (професійно-технічної) освіти. Підготовка кваліфікованих робітників.",
    website: "http://dpl.in.ua/",
  },
  "universytet-ukraina-dubno": {
    title: "Філія Університету «Україна»",
    fullName: "Дубенська філія Університету «Україна»",
    blurb:
      "Відокремлений структурний підрозділ Відкритого міжнародного університету розвитку людини «Україна» (та Дубенський фаховий коледж Університету «Україна»). Право, фінанси, IT, бібліотечна справа, менеджмент.",
    website: "http://dubno.uu.edu.ua/",
    phone: "+380365649499",
  },
  "budynok-ditei-molodi-dubno": {
    title: "Будинок дітей та молоді",
    fullName:
      "Будинок дітей та молоді Дубенської міської ради Рівненської області",
    blurb:
      "Заклад позашкільної освіти: художньо-естетичні, туристсько-краєзнавчі, еколого-натуралістичні та спортивні гуртки.",
    website: "https://bdmd.osv.org.ua/",
  },
  "tsentr-naukovo-tekhnichnoi-tvorchosti-dubno": {
    title: "Центр НТДТ",
    fullName:
      "Центр науково-технічної дитячої та юнацької творчості Дубенської міської ради Рівненської області",
    blurb:
      "Заклад позашкільної освіти. Гуртки технічної творчості, моделювання, конструювання.",
    website: "https://cntdut.osv.org.ua/",
    localCover:
      "/tmp/school-covers/tsentr-naukovo-tekhnichnoi-tvorchosti-dubno.jpg",
  },
  "tsentr-natsionalno-patriotychnoho-vykhovannia-dubno": {
    title: "Центр патріотичного виховання",
    fullName:
      "Дубенський Центр національно-патріотичного виховання та туризму",
    blurb: "Комунальний заклад позашкільної освіти Дубенської міської ради.",
    website: "http://www.dubno-rsut.rv.sch.in.ua/",
  },
  "diuss-dubno": {
    title: "ДЮСШ Дубно",
    fullName:
      "Дитячо-юнацька спортивна школа Дубенської міської ради Рівненської області",
    blurb: "Спортивні секції для дітей та підлітків.",
  },
  "shkola-mystetstv-dubno": {
    title: "Школа мистецтв Дубно",
    fullName: "Школа мистецтв Дубенської міської ради",
    blurb:
      "Музичне, хореографічне та образотворче відділення. Утворена шляхом об’єднання музичної та художньої шкіл.",
    localCover: "/tmp/school-covers/shkola-mystetstv-dubno.jpg",
  },
};

function descriptionFor(patch: Patch): string {
  return `Повна назва: ${patch.fullName}. ${patch.blurb}`;
}

function guessContentType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function uploadBuffer(
  slug: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing");
  }
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  const blob = await put(`places/${slug}/cover.${ext}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
  return blob.url;
}

async function uploadRemote(slug: string, url: string): Promise<string | null> {
  try {
    await new Promise((r) => setTimeout(r, 300));
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DubnoHub/1.0 school photos",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < 2000) throw new Error("too small");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return await uploadBuffer(
      slug,
      buffer,
      contentType.startsWith("image/")
        ? contentType.split(";")[0]!
        : "image/jpeg"
    );
  } catch (error) {
    console.warn(
      `  remote fail ${slug}`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function resolveImages(slug: string, patch: Patch): Promise<string[]> {
  const local =
    patch.localCover ||
    join("/tmp/school-covers", `${slug}.jpg`);
  if (existsSync(local)) {
    const buffer = readFileSync(local);
    const url = await uploadBuffer(slug, buffer, guessContentType(local));
    console.log(`  blob local ${slug}`);
    return [url];
  }
  const png = join("/tmp/school-covers", `${slug}.png`);
  if (existsSync(png)) {
    const buffer = readFileSync(png);
    const url = await uploadBuffer(slug, buffer, "image/png");
    console.log(`  blob local ${slug}`);
    return [url];
  }
  if (patch.photoUrls?.length) {
    const out: string[] = [];
    for (const source of patch.photoUrls) {
      const uploaded = await uploadRemote(slug, source);
      if (uploaded) out.push(uploaded);
    }
    return out;
  }
  return [];
}

async function main() {
  let updated = 0;
  let withPhoto = 0;
  for (const [slug, patch] of Object.entries(UPDATES)) {
    const images = await resolveImages(slug, patch);
    const data: Record<string, unknown> = {
      title: patch.title,
      description: descriptionFor(patch),
    };
    if (patch.website) data.website = patch.website;
    if (patch.phone) data.phone = patch.phone;
    if (images.length) {
      data.images = images;
      withPhoto++;
    }

    await prisma.place.update({ where: { slug }, data });
    updated++;
    console.log(
      `↻ ${slug} · ${images.length ? "photo" : "names only"} · ${patch.title}`
    );
  }
  console.log("Done:", { updated, withPhoto });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
