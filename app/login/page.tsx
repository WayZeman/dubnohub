import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Увійти",
};

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const { callbackUrl } = await searchParams;
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
