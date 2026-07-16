import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { APP_NAME } from "@/lib/constants";

const PRODUCTION_CANONICAL_URL = "https://dubnohub.vercel.app";

export const metadata: Metadata = {
  title: "Увійти",
};

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const { callbackUrl } = await searchParams;
  const canonicalUrl =
    process.env.VERCEL_ENV === "production"
      ? PRODUCTION_CANONICAL_URL
      : process.env.AUTH_URL ??
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL;
  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (process.env.VERCEL_ENV === "production" && canonicalUrl && requestHost) {
    const canonical = new URL(canonicalUrl);
    if (requestHost !== canonical.host) {
      const target = new URL("/login", canonical);
      if (callbackUrl) {
        target.searchParams.set("callbackUrl", callbackUrl);
      }
      redirect(target.toString());
    }
  }

  if (user) redirect(callbackUrl || "/profile");

  return (
    <div className="page-shell flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-sm font-medium tracking-[0.2em] text-primary uppercase">
        {APP_NAME}
      </p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Увійти в кабінет
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
        Лише Google Authentication — швидко, безпечно, без паролів.
      </p>
      <form
        className="mt-8 w-full max-w-xs"
        action={async () => {
          "use server";
          await signIn("google", {
            redirectTo: callbackUrl || "/profile",
          });
        }}
      >
        <Button type="submit" size="lg" className="h-12 w-full text-base">
          Продовжити з Google
        </Button>
      </form>
    </div>
  );
}
