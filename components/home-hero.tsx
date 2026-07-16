import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Map } from "lucide-react";

import { HomeWeather } from "@/components/home-weather";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import type { WeatherSnapshot } from "@/lib/weather";

const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/75/56-103-0213_Dubno_Castle_RB_24.jpg";

type HomeHeroProps = {
  weather?: WeatherSnapshot | null;
};

export function HomeHero({ weather }: HomeHeroProps) {
  return (
    <section className="relative isolate -mt-[4.25rem] h-dvh max-h-dvh overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt="Дубенський замок над річкою Іква"
        fill
        priority
        quality={78}
        sizes="100vw"
        className="object-cover object-[center_38%] sm:object-[center_42%]"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 via-black/30 to-transparent sm:h-[48%] sm:from-black/60 sm:via-black/25"
        aria-hidden
      />

      <div className="page-shell relative flex h-full flex-col justify-end pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[4.25rem]">
        <div className="hero-reveal max-w-2xl pb-8 sm:pb-12">
          {weather ? (
            <div className="mb-3 sm:mb-5">
              <HomeWeather weather={weather} />
            </div>
          ) : null}
          <p className="font-display text-[clamp(2.35rem,9vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            {APP_NAME}
          </p>
          <h1 className="mt-2 max-w-md text-[clamp(0.95rem,3.2vw,1.25rem)] font-medium leading-snug text-white/90 sm:mt-3">
            {APP_TAGLINE}
          </h1>
          <p className="mt-2 max-w-md text-[clamp(0.8125rem,2.6vw,1rem)] leading-relaxed text-white/70 sm:mt-3">
            Знай потрібне місце за секунди — з адресою, контактами та рейтингом.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 w-full gap-2 bg-white px-5 text-[15px] text-primary shadow-sm hover:bg-white/92 sm:w-auto sm:px-6 sm:text-base"
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
              className="h-12 w-full gap-2 border-white/30 bg-white/10 px-5 text-[15px] text-white backdrop-blur-[2px] hover:bg-white/18 hover:text-white sm:w-auto sm:px-6 sm:text-base"
            >
              <Link href="/places">
                Усі місця
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>

        <a
          href="#katalog"
          className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-0.5 text-white/55 transition-colors hover:text-white/85 sm:bottom-3 sm:inline-flex"
          aria-label="Прокрутити далі"
        >
          <ChevronDown className="size-5 animate-bounce" strokeWidth={1.75} />
        </a>
      </div>
    </section>
  );
}
