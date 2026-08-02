import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDraw, getDrawHistory, getSettings } from "@/lib/queries";
import { getNextDrawTime } from "@/lib/draw";

export async function GET() {
  const draws = await getDrawHistory();
  const withCounts = await Promise.all(
    draws.map(async (draw) => ({
      ...draw,
      totalBets: await prisma.bet.count({ where: { drawId: draw.id } }),
    }))
  );
  return NextResponse.json(withCounts);
}

// 手動開一個新期別：僅在目前沒有任何「尚未開獎」的期別時可用（例如資料庫被清空、初次啟動）
export async function POST() {
  const existing = await getCurrentDraw();
  if (existing) {
    return NextResponse.json(
      { error: `已經有進行中的第 ${existing.id} 期，無法重複建立` },
      { status: 409 }
    );
  }

  const settings = await getSettings();
  const draw = await prisma.draw.create({
    data: {
      status: "PENDING",
      drawTime: getNextDrawTime(),
      basePoolAmount: settings.baseJackpotAmount,
    },
  });
  return NextResponse.json(draw, { status: 201 });
}
