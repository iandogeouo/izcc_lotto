import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const claimed = Boolean(body.claimed);

  const bet = await prisma.bet.findUnique({ where: { id: Number(id) } });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  if (!bet.prizeTier) {
    return NextResponse.json({ error: "這注沒有中獎，無法標記領獎狀態" }, { status: 409 });
  }

  const updated = await prisma.bet.update({
    where: { id: Number(id) },
    data: { claimed },
  });
  return NextResponse.json(updated);
}
