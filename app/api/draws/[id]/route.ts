import { NextResponse } from "next/server";
import { computePoolAmount, getDrawById } from "@/lib/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const draw = await getDrawById(Number(id));
  if (!draw) {
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }
  const pool = await computePoolAmount(draw.id, draw.basePoolAmount);
  return NextResponse.json({ ...draw, pool });
}
