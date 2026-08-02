import { NextResponse } from "next/server";
import { getDrawStats } from "@/lib/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stats = await getDrawStats(Number(id));
  return NextResponse.json(stats);
}
