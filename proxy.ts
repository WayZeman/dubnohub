import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const PRODUCTION_CANONICAL_HOST = "dubnohub.vercel.app";

function getCanonicalHost() {
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_CANONICAL_HOST;
  }

  const url =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL;

  if (!url) return null;

  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export default auth((req) => {
  const canonicalHost = getCanonicalHost();
  const isProduction = process.env.VERCEL_ENV === "production";

  if (
    isProduction &&
    canonicalHost &&
    req.nextUrl.host !== canonicalHost
  ) {
    const redirectUrl = new URL(req.nextUrl);
    redirectUrl.host = canonicalHost;
    return NextResponse.redirect(redirectUrl, 307);
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
