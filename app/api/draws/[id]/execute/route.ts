import { NextResponse } from "next/server";
import { DrawNotPendingError, executeDrawForRound } from "@/lib/drawService";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const summary = await executeDrawForRound(Number(id));
    return NextResponse.json(summary);
  } catch (err) {
    if (err instanceof DrawNotPendingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof Error && err.message.includes("not found")) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
