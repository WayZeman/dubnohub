import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import {
  CalendarDays,
  LogOut,
  Mail,
  Shield,
  Star,
  UserRound,
} from "lucide-react";
import { signOut } from "@/lib/auth";

import { UserAvatar } from "@/components/user-avatar";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { ROLE_LABELS, canManageContent } from "@/lib/roles";
import { displayName, splitGoogleName } from "@/lib/user-display";
import { getCurrentUser } from "@/lib/session";
import { getUserProfile, getUserReviews } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Профіль",
};

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?callbackUrl=/profile");

  const user = await getUserProfile(sessionUser.id);
  if (!user) redirect("/login?callbackUrl=/profile");

  const reviews = await getUserReviews(user.id);
  const fromGoogle = splitGoogleName(user.name);
  const firstName = user.firstName ?? fromGoogle.firstName ?? "";
  const lastName = user.lastName ?? fromGoogle.lastName ?? "";
  const name = displayName(user);

  return (
    <div className="page-shell section-pad mx-auto max-w-2xl space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
          Профіль
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Ваш кабінет
        </h1>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <UserAvatar name={name} image={user.image} size="lg" />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="font-display truncate text-2xl font-semibold tracking-tight">
                {name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {user.profession ? `${user.profession} · ` : null}
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" aria-hidden />
                <dd className="truncate text-foreground">{user.email}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" aria-hidden />
                <dd className="text-foreground">
                  З нами з {formatDate(user.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <UserRound className="size-4" aria-hidden />
          Особисті дані
        </h2>
        <div className="rounded-2xl border border-border/60 p-5 sm:p-6">
          <ProfileSettingsForm
            initial={{
              firstName,
              lastName,
              profession: user.profession ?? "",
            }}
          />
        </div>
      </section>

      {canManageContent(user.role) || user.role === Role.ADMIN ? (
        <section className="rounded-2xl border border-border/60 p-5">
          <Button asChild>
            <Link href="/admin">
              <Shield className="size-4" />
              {user.role === Role.ADMIN ? "Адмін панель" : "Панель редактора"}
            </Link>
          </Button>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Star className="size-4" aria-hidden />
          Ваші відгуки
        </h2>
        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-border/60 p-5 text-sm text-muted-foreground">
            Ви ще не залишали відгуків.{" "}
            <Link href="/places" className="text-primary underline">
              Переглянути місця
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60">
            {reviews.map((review) => (
              <li key={review.id}>
                <Link
                  href={`/places/${review.place.slug}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{review.place.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-primary">
                    {review.rating}★
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" variant="outline">
          <LogOut className="size-4" />
          Вийти
        </Button>
      </form>
    </div>
  );
}
