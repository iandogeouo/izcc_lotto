import { NextResponse } from "next/server";
import { computePoolAmount, getCurrentDraw, getDrawStats } from "@/lib/queries";

export async function GET() {
  const draw = await getCurrentDraw();
  if (!draw) {
    return NextResponse.json({ draw: null, pool: 0, stats: { totalBets: 0 } });
  }
  const [pool, stats] = await Promise.all([
    computePoolAmount(draw.id, draw.basePoolAmount),
    getDrawStats(draw.id),
  ]);
  return NextResponse.json({ draw, pool, stats });
}
