import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getCurrentUser } from "@/lib/session";
import { canManageContent } from "@/lib/roles";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (!canManageContent(user.role)) redirect("/");

  const isAdmin = user.role === Role.ADMIN;

  const links = [
    { href: "/admin/places", label: "Місця", roles: ["ADMIN", "EDITOR"] },
    { href: "/admin/categories", label: "Категорії", roles: ["ADMIN"] },
    { href: "/admin/reviews", label: "Відгуки", roles: ["ADMIN"] },
    { href: "/admin/users", label: "Користувачі", roles: ["ADMIN"] },
  ].filter((link) => link.roles.includes(user.role));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Адмін" : "Редактор"}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Керування довідником
          </h1>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Адмін навігація">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg border border-border/70 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
