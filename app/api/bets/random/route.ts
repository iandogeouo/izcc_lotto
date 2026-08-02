import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pickUniqueRandomNumbers } from "@/lib/draw";
import { getSettings } from "@/lib/queries";
import { LOTTO_MIN_NUMBER } from "@/lib/types";
import { randomBetsSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = randomBetsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { drawId, playerId, count } = parsed.data;

  const draw = await prisma.draw.findUnique({ where: { id: drawId } });
  if (!draw) {
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }
  if (draw.status !== "PENDING") {
    return NextResponse.json({ error: "此期已開獎，無法新增下注" }, { status: 409 });
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const settings = await getSettings();

  await prisma.bet.createMany({
    data: Array.from({ length: count }, () => ({
      drawId,
      playerId,
      numbers: pickUniqueRandomNumbers(6, LOTTO_MIN_NUMBER, settings.numberPoolSize),
    })),
  });

  return NextResponse.json({ success: true, createdCount: count }, { status: 201 });
}
