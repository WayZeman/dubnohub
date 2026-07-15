import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { UserAvatar } from "@/components/user-avatar";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { getAdminUsers } from "@/actions/users";
import { getCurrentUser } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/roles";
import { formatDate } from "@/lib/format";

export default async function AdminUsersPage() {
  const current = await getCurrentUser();
  if (current?.role !== Role.ADMIN) redirect("/admin/places");

  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Користувачі та редактори</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Призначте роль EDITOR для створення та редагування місць.
        </p>
      </div>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} image={user.image} />
              <div>
                <p className="font-medium">{user.name ?? "Без імені"}</p>
                <p className="text-xs text-muted-foreground">
                  {user.email} · {user.reviewsCount} відгуків ·{" "}
                  {formatDate(user.createdAt)} · зараз: {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
            <UserRoleSelect
              userId={user.id}
              role={user.role}
              disabled={user.id === current.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
