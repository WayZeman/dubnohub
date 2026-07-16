import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const engagementSchema = new Set(["view", "click"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { type?: string }
    | null;

  if (!body?.type || !engagementSchema.has(body.type)) {
    return NextResponse.json({ error: "Некоректний тип події" }, { status: 400 });
  }

  const data =
    body.type === "view" ? { viewCount: { increment: 1 } } : { clickCount: { increment: 1 } };

  await prisma.place.update({
    where: { id },
    data,
    select: { id: true },
  });

  return NextResponse.json({ success: true });
}
