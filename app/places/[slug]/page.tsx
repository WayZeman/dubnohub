import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Globe,
  MapPinned,
  Phone,
  Send,
  Star,
  Video,
} from "lucide-react";

import { PlaceCard } from "@/components/place-card";
import { PlaceRow } from "@/components/place-row";
import { PlaceViewTracker } from "@/components/place-view-tracker";
import { PostalBrandCover } from "@/components/postal-brand-cover";
import { ReviewForm } from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/user-avatar";
import { APP_CITY, googleMapsUrl } from "@/lib/constants";
import { formatAddress, formatCountLabel, formatDate } from "@/lib/format";
import { isPlacePopular } from "@/lib/place-popularity";
import { getPostalBrandInfo } from "@/lib/postal-brand";
import { displayName } from "@/lib/user-display";
import { getPlaceBySlug, getSimilarPlaces } from "@/lib/queries";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return { title: "Місце не знайдено" };
  return {
    title: `${place.title} — ${place.category.name} ${APP_CITY}`,
    description: place.description.slice(0, 160),
  };
}

function ContactAside({
  place,
  mapsUrl,
}: {
  place: {
    title: string;
    address: string;
    phone: string | null;
    workingHours: string | null;
    website: string | null;
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
    telegram: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  mapsUrl: string | null;
}) {
  return (
    <aside className="h-fit space-y-5 rounded-[1.35rem] border border-border/70 bg-card p-5 elevated sm:p-6 lg:sticky lg:top-20">
      <div className="space-y-4 text-sm">
        <div className="flex gap-3">
          <MapPinned className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="font-medium">Адреса</p>
            <p className="mt-0.5 leading-relaxed text-muted-foreground">
              {formatAddress(place.address)}
            </p>
          </div>
        </div>
        {place.phone ? (
          <div className="flex gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Телефон</p>
              <a
                href={`tel:${place.phone}`}
                className="mt-0.5 inline-block text-primary hover:underline"
              >
                {place.phone}
              </a>
            </div>
          </div>
        ) : null}
        {place.workingHours ? (
          <div className="flex gap-3">
            <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Години роботи</p>
              <p className="mt-0.5 whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {place.workingHours}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <Separator />

      <div className="flex flex-wrap gap-2">
        {place.website ? (
          <Button asChild variant="outline" size="sm" className="h-9">
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="size-4" />
              Сайт
            </a>
          </Button>
        ) : null}
        {place.facebook ? (
          <Button asChild variant="outline" size="sm" className="h-9">
            <a
              href={place.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </Button>
        ) : null}
        {place.instagram ? (
          <Button asChild variant="outline" size="sm" className="h-9">
            <a
              href={place.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </Button>
        ) : null}
        {place.youtube ? (
          <Button asChild variant="outline" size="sm" className="h-9">
            <a
              href={place.youtube}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Video className="size-4" />
              YouTube
            </a>
          </Button>
        ) : null}
        {place.telegram ? (
          <Button asChild variant="outline" size="sm" className="h-9">
            <a
              href={place.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send className="size-4" />
              Telegram
            </a>
          </Button>
        ) : null}
      </div>

      {mapsUrl ? (
        <Button asChild className="h-11 w-full rounded-xl" size="lg">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Відкрити в Google Maps
            <ExternalLink className="size-4" />
          </a>
        </Button>
      ) : null}

      {place.latitude != null && place.longitude != null ? (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <iframe
            title={`Карта: ${place.title}`}
            className="h-48 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=15&output=embed`}
          />
        </div>
      ) : null}
    </aside>
  );
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  const postal = getPostalBrandInfo(place.slug);

  const similar = await getSimilarPlaces(
    place.id,
    place.categoryId,
    postal ? 8 : 4
  );

  const mapsUrl = googleMapsUrl({
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    title: place.title,
  });

  const gallery = place.images.slice(0, 4);
  const hasGallery = gallery.length > 0;
  const hasRating = place.rating > 0;
  const reviewCount = place.reviews.length;
  const popular = isPlacePopular({
    rating: place.rating,
    reviewsCount: reviewCount,
    viewCount: place.viewCount,
    clickCount: place.clickCount,
  });
  const backHref = `/categories/${place.category.slug}`;
  const backLabel = place.category.name;
  const displayTitle = postal
    ? `${postal.brandLabel} №${postal.number}`
    : place.title;

  return (
    <div>
      <PlaceViewTracker placeId={place.id} />
      <div className="page-shell pt-5 sm:pt-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      </div>

      {postal ? (
        <section className="page-shell mt-4 sm:mt-5">
          <div className="flex items-center gap-5 overflow-hidden rounded-[1.25rem] border border-border/60 bg-card p-5 sm:gap-6 sm:p-6">
            <div className="relative h-20 w-28 shrink-0 sm:h-24 sm:w-36">
              <PostalBrandCover info={postal} className="min-h-0 rounded-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{postal.kindLabel}</p>
              <h1 className="font-display mt-1 text-2xl font-medium tracking-tight sm:text-3xl">
                {displayTitle}
              </h1>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPinned className="mt-0.5 size-3.5 shrink-0 opacity-70" />
                <span>{formatAddress(place.address)}</span>
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="page-shell mt-4 sm:mt-5">
          {hasGallery ? (
            <div
              className={cn(
                "grid gap-2 overflow-hidden rounded-[1.35rem] sm:gap-3 sm:rounded-[1.6rem]",
                gallery.length === 1 && "grid-cols-1",
                gallery.length === 2 && "grid-cols-2",
                gallery.length === 3 && "grid-cols-1 sm:grid-cols-3",
                gallery.length >= 4 &&
                  "grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
              )}
            >
              {gallery.map((src, index) => (
                <div
                  key={src}
                  className={cn(
                    "relative overflow-hidden bg-muted",
                    gallery.length === 1 && "aspect-video",
                    gallery.length === 2 && "aspect-4/3",
                    gallery.length === 3 && "aspect-4/3",
                    gallery.length >= 4 &&
                      (index === 0
                        ? "col-span-2 aspect-16/10 lg:row-span-2 lg:min-h-80 lg:aspect-auto"
                        : "aspect-4/3 lg:min-h-38 lg:aspect-auto")
                  )}
                >
                  <Image
                    src={src}
                    alt={`${place.title} — фото ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes={
                      index === 0
                        ? "(max-width: 1024px) 100vw, 55vw"
                        : "(max-width: 1024px) 50vw, 22vw"
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-[1.35rem] border border-dashed border-border/70 bg-secondary/50 text-sm text-muted-foreground sm:rounded-[1.6rem]">
              Немає фото
            </div>
          )}
        </section>
      )}

      <div className="page-shell py-8 sm:py-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.8fr)] lg:gap-12">
          <header className="space-y-3.5 lg:col-start-1 lg:row-start-1">
            {!postal ? (
              <>
                <p className="section-eyebrow">
                  <Link
                    href={`/categories/${place.category.slug}`}
                    className="hover:text-foreground"
                  >
                    {place.category.name}
                  </Link>
                </p>
                <h1 className="font-display wrap-break-word text-3xl font-medium tracking-tight text-balance sm:text-4xl lg:text-[2.6rem]">
                  {place.title}
                </h1>
              </>
            ) : null}
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              {hasRating ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-semibold">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {place.rating.toFixed(1)}
                </span>
              ) : null}
              {reviewCount > 0 ? (
                <span className="text-muted-foreground">
                  {formatCountLabel(reviewCount, [
                    "відгук",
                    "відгуки",
                    "відгуків",
                  ])}
                </span>
              ) : (
                <span className="text-muted-foreground">Поки без відгуків</span>
              )}
              {popular ? (
                <span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
                  Популярне місце
                </span>
              ) : null}
            </div>
            {place.description?.trim() ? (
              <p className="wrap-break-word max-w-2xl text-[15px] leading-relaxed text-muted-foreground whitespace-pre-wrap sm:text-base">
                {place.description}
              </p>
            ) : null}
          </header>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <ContactAside place={place} mapsUrl={mapsUrl} />
          </div>

          <div className="space-y-10 lg:col-start-1 lg:row-start-2">
            <section className="space-y-5">
              <h2 className="font-display text-2xl font-medium tracking-tight">
                Відгуки
              </h2>
              <ReviewForm
                placeId={place.id}
                placeSlug={place.slug}
                existingReviews={place.reviews.map((review) => ({
                  userId: review.userId,
                  rating: review.rating,
                  comment: review.comment,
                }))}
              />
              {reviewCount === 0 ? (
                <p className="rounded-2xl border border-dashed border-border/80 bg-secondary/40 px-5 py-8 text-center text-sm text-muted-foreground">
                  Відгуків ще немає — будьте першими.
                </p>
              ) : (
                <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
                  {place.reviews.map((review) => (
                    <li key={review.id} className="space-y-2.5 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={displayName(review.user)}
                            image={review.user.image}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {displayName(review.user)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="inline-flex items-center gap-1 text-sm font-semibold">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {review.rating}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {similar.length > 0 ? (
              <section className="space-y-5">
                <h2 className="font-display text-2xl font-medium tracking-tight">
                  Схожі місця
                </h2>
                {postal ? (
                  <div className="rounded-2xl border border-border/70 bg-card px-2 sm:px-3">
                    {similar.map((item) => (
                      <PlaceRow key={item.id} place={item} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {similar.map((item) => (
                      <PlaceCard key={item.id} place={item} />
                    ))}
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
