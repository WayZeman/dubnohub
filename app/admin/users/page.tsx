import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Shield, UserCog, Users } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { Badge } from "@/components/ui/badge";
import { getAdminUserStats, getAdminUsers } from "@/actions/users";
import { getCurrentUser } from "@/lib/session";
import { formatCountLabel, formatDate } from "@/lib/format";
import { ROLE_LABELS, roleBadgeVariant } from "@/lib/roles";

export default async function AdminUsersPage() {
  const current = await getCurrentUser();
  if (current?.role !== Role.ADMIN) redirect("/admin/places");

  const [users, stats] = await Promise.all([getAdminUsers(), getAdminUserStats()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Користувачі</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Переглядайте всіх зареєстрованих користувачів і призначайте ролі:
          користувач, редактор або адмін.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Усього
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="size-4" />
            Адміни
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.admins}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="size-4" />
            Редактори
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.editors}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Користувачі
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {stats.regularUsers}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70">
        <div className="hidden border-b border-border/60 bg-muted/40 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto_auto] sm:gap-4">
          <span>Користувач</span>
          <span>Email</span>
          <span>Активність</span>
          <span>Роль</span>
        </div>

        {users.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Поки немає зареєстрованих користувачів.
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {users.map((user) => (
              <li
                key={user.id}
                className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={user.name} image={user.image} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{user.name}</p>
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                      {user.id === current.id ? (
                        <Badge variant="outline">Ви</Badge>
                      ) : null}
                    </div>
                    {user.profession ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {user.profession}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {user.email}
                    </p>
                  </div>
                </div>

                <p className="hidden truncate text-sm text-muted-foreground sm:block">
                  {user.email ?? "—"}
                </p>

                <div className="text-xs text-muted-foreground">
                  <p>
                    {formatCountLabel(user.reviewsCount, [
                      "відгук",
                      "відгуки",
                      "відгуків",
                    ])}
                  </p>
                  <p>з {formatDate(user.createdAt)}</p>
                </div>

                <UserRoleSelect
                  userId={user.id}
                  role={user.role}
                  disabled={user.id === current.id}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
