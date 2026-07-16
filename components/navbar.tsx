"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Role } from "@prisma/client";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { canManageContent } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/user-avatar";

const links = [
  { href: "/", label: "Головна" },
  { href: "/map", label: "Мапа" },
  { href: "/places", label: "Місця" },
  { href: "/categories", label: "Категорії" },
];

function NavLinks({
  mobile = false,
  pathname,
  overlay,
  showAdmin,
  role,
  onNavigate,
}: {
  mobile?: boolean;
  pathname: string;
  overlay: boolean;
  showAdmin: boolean;
  role?: Role;
  onNavigate: () => void;
}) {
  return (
    <nav
      className={cn(
        mobile ? "flex flex-col gap-1" : "hidden items-center gap-0.5 md:flex"
      )}
      aria-label="Основна навігація"
    >
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors duration-300 md:py-2 md:text-sm",
              mobile
                ? active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                : overlay
                  ? active
                    ? "bg-white/18 text-white"
                    : "text-white/75 hover:text-white"
                  : active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      {showAdmin ? (
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            mobile
              ? "text-muted-foreground hover:text-foreground"
              : overlay
                ? "text-white/75 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
          )}
        >
          {role === Role.ADMIN ? "Адмін" : "Редактор"}
        </Link>
      ) : null}
    </nav>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const overlay = isHome && !scrolled;
  const showAdmin = canManageContent(session?.user?.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter,color] duration-500",
        overlay
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72"
      )}
    >
      <div className="page-shell flex h-[4.25rem] items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/"
          className={cn(
            "font-display truncate text-lg font-semibold tracking-tight transition-colors duration-500 hover:opacity-80 sm:text-xl",
            overlay ? "text-white" : "text-primary"
          )}
        >
          {APP_NAME}
        </Link>

        <NavLinks
          pathname={pathname}
          overlay={overlay}
          showAdmin={showAdmin}
          role={session?.user?.role}
          onNavigate={() => setOpen(false)}
        />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Пошук"
            className={cn(
              overlay &&
                "text-white hover:bg-white/15 hover:text-white"
            )}
          >
            <Link href="/places">
              <Search className="size-5" />
            </Link>
          </Button>

          {status === "loading" ? (
            <div
              className={cn(
                "size-8 animate-pulse rounded-full",
                overlay ? "bg-white/25" : "bg-muted"
              )}
            />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="hidden sm:block">
                <UserAvatar
                  name={session.user.name}
                  image={session.user.image}
                  size="sm"
                />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hidden sm:inline-flex",
                  overlay && "text-white hover:bg-white/15 hover:text-white"
                )}
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Вийти
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className={cn(
                "hidden sm:inline-flex",
                overlay && "bg-white text-primary hover:bg-white/90"
              )}
              onClick={() => signIn("google")}
            >
              Увійти
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "md:hidden",
                  overlay && "text-white hover:bg-white/15 hover:text-white"
                )}
                aria-label="Відкрити меню"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100%,20rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-primary">
                  {APP_NAME}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-6">
                <NavLinks
                  mobile
                  pathname={pathname}
                  overlay={overlay}
                  showAdmin={showAdmin}
                  role={session?.user?.role}
                  onNavigate={() => setOpen(false)}
                />
                {session?.user ? (
                  <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3"
                    >
                      <UserAvatar
                        name={session.user.name}
                        image={session.user.image}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {session.user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Вийти
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => signIn("google")}>
                    Увійти через Google
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
