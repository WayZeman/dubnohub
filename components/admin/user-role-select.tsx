"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Role } from "@prisma/client";
import { toast } from "sonner";

import { updateUserRole } from "@/actions/users";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "@/lib/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      disabled={disabled || pending}
      value={role}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await updateUserRole({
            userId,
            role: value as Role,
          });
          if (!result.success) {
            toast.error(result.error ?? "Помилка");
            return;
          }
          toast.success("Роль оновлено");
          router.refresh();
        });
      }}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNABLE_ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {ROLE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
