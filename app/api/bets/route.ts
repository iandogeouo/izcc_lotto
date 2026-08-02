import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBetSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drawId = searchParams.get("drawId");
  const playerId = searchParams.get("playerId");

  const bets = await prisma.bet.findMany({
    where: {
      ...(drawId ? { drawId: Number(drawId) } : {}),
      ...(playerId ? { playerId: Number(playerId) } : {}),
    },
    include: { player: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(bets);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createBetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const draw = await prisma.draw.findUnique({ where: { id: parsed.data.drawId } });
  if (!draw) {
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }
  if (draw.status !== "PENDING") {
    return NextResponse.json({ error: "此期已開獎，無法新增下注" }, { status: 409 });
  }

  const player = await prisma.player.findUnique({ where: { id: parsed.data.playerId } });
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const bet = await prisma.bet.create({
    data: {
      drawId: parsed.data.drawId,
      playerId: parsed.data.playerId,
      numbers: [...parsed.data.numbers].sort((a, b) => a - b),
    },
    include: { player: true },
  });
  return NextResponse.json(bet, { status: 201 });
}
