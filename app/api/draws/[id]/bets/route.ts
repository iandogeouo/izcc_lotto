import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const drawId = Number(id);

  const draw = await prisma.draw.findUnique({ where: { id: drawId } });
  if (!draw) {
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }
  if (draw.status !== "PENDING") {
    return NextResponse.json({ error: "此期已開獎，無法清空下注" }, { status: 409 });
  }

  const result = await prisma.bet.deleteMany({ where: { drawId } });
  return NextResponse.json({ success: true, deletedCount: result.count });
}
