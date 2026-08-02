import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/queries";
import { updateBetSchema, validateNumbersWithinPool } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateBetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const bet = await prisma.bet.findUnique({
    where: { id: Number(id) },
    include: { draw: true },
  });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  if (bet.draw.status !== "PENDING") {
    return NextResponse.json({ error: "此期已開獎，無法編輯下注" }, { status: 409 });
  }

  const settings = await getSettings();
  if (!validateNumbersWithinPool(parsed.data.numbers, settings.numberPoolSize)) {
    return NextResponse.json(
      { error: `號碼不能超過 ${settings.numberPoolSize}` },
      { status: 400 }
    );
  }

  const updated = await prisma.bet.update({
    where: { id: Number(id) },
    data: { numbers: [...parsed.data.numbers].sort((a, b) => a - b) },
    include: { player: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bet = await prisma.bet.findUnique({
    where: { id: Number(id) },
    include: { draw: true },
  });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  if (bet.draw.status !== "PENDING") {
    return NextResponse.json({ error: "此期已開獎，無法刪除下注" }, { status: 409 });
  }

  await prisma.bet.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
