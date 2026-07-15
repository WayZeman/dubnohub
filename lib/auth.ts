import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function enrichToken(token: JWT): Promise<JWT> {
  if (!token.sub && !token.id) return token;

  const userId = (token.id as string | undefined) ?? (token.sub as string);
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      createdAt: true,
      name: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!dbUser) return token;

  token.id = dbUser.id;
  token.role = dbUser.role;
  token.createdAt = dbUser.createdAt.toISOString();
  const composed = [dbUser.firstName, dbUser.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  if (composed || dbUser.name) {
    token.name = composed || dbUser.name || undefined;
  }
  return token;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // JWT is required so Edge middleware can read the session without Prisma
  session: { strategy: "jwt" },
  events: {
    async createUser({ user }) {
      const adminEmails = getAdminEmails();
      const isAdmin =
        !!user.email && adminEmails.includes(user.email.toLowerCase());

      const parts = (user.name ?? "").trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] ?? null;
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;

      await prisma.user.update({
        where: { id: user.id! },
        data: {
          ...(isAdmin ? { role: Role.ADMIN } : {}),
          ...(firstName ? { firstName, lastName } : {}),
        },
      });
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? Role.USER;
        token.createdAt =
          user.createdAt instanceof Date
            ? user.createdAt.toISOString()
            : user.createdAt;
      }

      // Always sync role from DB so admin promotions apply without re-login
      return enrichToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as Role) ?? Role.USER;
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (token.createdAt) {
          session.user.createdAt = new Date(token.createdAt);
        }
      }
      return session;
    },
  },
});
