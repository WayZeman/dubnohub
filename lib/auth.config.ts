import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
const productionAuthBase = "https://dubnohub.vercel.app/api/auth";

export const authConfig = {
  // Required for stable JWT/cookie encryption across deployments.
  secret: authSecret,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectProxyUrl:
        process.env.VERCEL_ENV === "production" ? productionAuthBase : undefined,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProfile = nextUrl.pathname.startsWith("/profile");
      const isAdmin = nextUrl.pathname.startsWith("/admin");

      if ((isProfile || isAdmin) && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
