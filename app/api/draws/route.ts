import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDrawHistory } from "@/lib/queries";

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
