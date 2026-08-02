import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const claimAllSchema = z.object({
  playerId: z.number().int().positive(),
  claimed: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = claimAllSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await prisma.bet.updateMany({
    where: {
      drawId: Number(id),
      playerId: parsed.data.playerId,
      prizeTier: { not: null },
    },
    data: { claimed: parsed.data.claimed ?? true },
  });

  return NextResponse.json({ success: true, updatedCount: result.count });
}
