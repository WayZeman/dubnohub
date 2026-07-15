"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Map } from "lucide-react";

import { HomeWeather } from "@/components/home-weather";
import { Button } from "@/components/ui/button";
import { fadeUp, transition } from "@/lib/motion";
import type { WeatherSnapshot } from "@/lib/weather";

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/75/56-103-0213_Dubno_Castle_RB_24.jpg";

type HomeHeroProps = {
  weather?: WeatherSnapshot | null;
};

export function HomeHero({ weather }: HomeHeroProps) {
  return (
    <section className="relative isolate -mt-17 min-h-[min(100svh,56rem)] overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="Дубенський замок над річкою Іква"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_42%]"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.18_0.04_155/0.55)_0%,oklch(0.16_0.05_155/0.42)_42%,oklch(0.14_0.04_155/0.78)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_18%_30%,oklch(0.42_0.1_155/0.28),transparent_62%)]"
        aria-hidden
      />

      <div className="page-shell relative flex min-h-[min(100svh,56rem)] flex-col justify-end pb-14 pt-32 sm:pb-16 sm:pt-36 lg:pb-20">
        <div className="max-w-2xl">
          {weather ? (
            <motion.div
              {...fadeUp}
              transition={transition(0.02, 0.55)}
              className="mb-4"
            >
              <HomeWeather weather={weather} />
            </motion.div>
          ) : null}
          <motion.h1
            {...fadeUp}
            transition={transition(0.05, 0.6)}
            className="font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Знай своє місто
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={transition(0.14, 0.6)}
            className="mt-4 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg"
          >
            Сучасний довідник міста, який вартий твоєї уваги.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={transition(0.24, 0.6)}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 bg-white px-5 text-[15px] text-primary hover:bg-white/92 sm:h-12 sm:px-6 sm:text-base"
            >
              <Link href="/map">
                <Map className="size-5" />
                Мапа міста
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 gap-2 border-white/35 bg-white/10 px-5 text-[15px] text-white backdrop-blur-sm hover:bg-white/18 hover:text-white sm:h-12 sm:px-6 sm:text-base"
            >
              <Link href="/places">
                Усі місця
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
