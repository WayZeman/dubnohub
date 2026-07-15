import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";

config({ path: ".env.local" });

type Place = {
  slug: string;
  title: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  workingHours: string | null;
  images: string[];
  descLen: number;
  photoCount: number;
};

type Cat = {
  category: { name: string; slug: string };
  places: Place[];
};

const DUBNO = { minLat: 50.3, maxLat: 50.48, minLng: 25.65, maxLng: 25.85 };

function deepIssues(p: Place, catSlug: string): string[] {
  const issues: string[] = [];
  if (!p.title?.trim()) issues.push("NO_TITLE");
  if (!p.description?.trim()) issues.push("NO_DESC");
  else if (p.description.length < 60) issues.push("SHORT_DESC");
  if (!p.address?.trim()) issues.push("NO_ADDRESS");
  if (p.latitude == null || p.longitude == null) issues.push("NO_COORDS");
  else if (
    p.latitude < DUBNO.minLat ||
    p.latitude > DUBNO.maxLat ||
    p.longitude < DUBNO.minLng ||
    p.longitude > DUBNO.maxLng
  ) {
    issues.push("COORDS_OUT_OF_BBOX");
  }
  if (!p.images?.length) issues.push("NO_PHOTO");
  else if (p.images.some((u) => !u.startsWith("http"))) issues.push("BAD_PHOTO_URL");

  if (catSlug === "navchalni-zaklady") {
    if (!p.phone) issues.push("NO_PHONE");
    if (!p.website) issues.push("NO_WEBSITE");
  }
  if (catSlug === "poshta" && !p.website) issues.push("NO_WEBSITE");

  if (p.phone && p.phone.replace(/\D/g, "").length < 9) issues.push("PHONE_TOO_SHORT");
  if (p.website && !/^https?:\/\//i.test(p.website)) issues.push("WEBSITE_NO_SCHEME");

  return issues;
}

const data = JSON.parse(
  readFileSync("/tmp/dubno-audit-full.json", "utf8")
) as Cat[];

const report = [];
for (const cat of data) {
  const rows = cat.places.map((p) => {
    const issues = deepIssues(p, cat.category.slug);
    return {
      slug: p.slug,
      title: p.title,
      address: p.address,
      lat: p.latitude,
      lng: p.longitude,
      phone: p.phone,
      website: p.website,
      fb: p.facebook,
      ig: p.instagram,
      hours: p.workingHours,
      photos: p.photoCount,
      descLen: p.descLen,
      desc: p.description?.slice(0, 120),
      issues,
    };
  });
  const problem = rows.filter((r) => r.issues.length);
  const byIssue: Record<string, number> = {};
  for (const r of problem) {
    for (const k of r.issues) byIssue[k] = (byIssue[k] || 0) + 1;
  }
  report.push({
    category: cat.category.name,
    slug: cat.category.slug,
    total: rows.length,
    ok: rows.length - problem.length,
    problems: problem.length,
    byIssue,
    items: problem,
    all: rows,
  });
  console.log(`\n=== ${cat.category.name} ===`);
  console.log(`ok ${rows.length - problem.length}/${rows.length}`);
  console.log("byIssue", byIssue);
  for (const r of problem) {
    console.log(`  [${r.issues.join("|")}] ${r.title}`);
  }
}

writeFileSync("/tmp/dubno-audit-deep.json", JSON.stringify(report, null, 2));
console.log("\nWrote /tmp/dubno-audit-deep.json");
