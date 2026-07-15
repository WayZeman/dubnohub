import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getCurrentUser } from "@/lib/session";

export default async function AdminIndexPage() {
  const user = await getCurrentUser();
  if (user?.role === Role.ADMIN) redirect("/admin/places");
  redirect("/admin/places");
}
