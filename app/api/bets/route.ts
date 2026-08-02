import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/queries";
import { createBetSchema, validateNumbersWithinPool } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drawId = searchParams.get("drawId");
  const playerId = searchParams.get("playerId");
  const take = searchParams.get("take");

  const where = {
    ...(drawId ? { drawId: Number(drawId) } : {}),
    ...(playerId ? { playerId: Number(playerId) } : {}),
  };

  // 有帶 take 時代表呼叫端想限制筆數（例如後台下注紀錄清單），改成「最新 N 筆」；
  // 沒帶 take（例如玩家查詢自己的下注）維持原本回傳全部、依下注順序排序的行為
  const [items, totalCount] = await Promise.all([
    prisma.bet.findMany({
      where,
      include: { player: true },
      orderBy: { id: take ? "desc" : "asc" },
      ...(take ? { take: Number(take) } : {}),
    }),
    prisma.bet.count({ where }),
  ]);

  if (take) items.reverse(); // 維持畫面上由舊到新排序，只是筆數被限制在「最新 N 筆」

  return NextResponse.json({ items, totalCount });
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

  const settings = await getSettings();
  if (!validateNumbersWithinPool(parsed.data.numbers, settings.numberPoolSize)) {
    return NextResponse.json(
      { error: `號碼不能超過 ${settings.numberPoolSize}` },
      { status: 400 }
    );
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
