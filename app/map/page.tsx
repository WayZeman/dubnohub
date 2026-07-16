import type { Metadata } from "next";

import { CityMapSection } from "@/components/city-map-section";
import { APP_CITY } from "@/lib/constants";

export const revalidate = 120;

export const metadata: Metadata = {
  title: `Мапа ${APP_CITY}`,
  description: `Інтерактивна мапа ${APP_CITY}: памʼятки, пошта, кафе, аптеки та інші місця з фільтрами категорій.`,
  alternates: { canonical: "/map" },
  openGraph: {
    title: `Мапа ${APP_CITY}`,
    description: `Інтерактивна мапа місць ${APP_CITY}.`,
    url: "/map",
  },
};

export default function MapPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CityMapSection showHeader={false} fullHeight />
    </div>
  );
}
