import { prisma } from "../lib/prisma";
import { generateDrawNumbers, getNextDrawTime, pickUniqueRandomNumbers } from "../lib/draw";
import { executeDrawForRound } from "../lib/drawService";

const PLAYER_NAMES = ["零小", "一小", "二小", "三小", "四小"];

async function main() {
  console.log("Seeding settings...");
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      betPrice: 50,
      baseJackpotAmount: 5_000_000,
      prize2Amount: 3_000_000,
      prize3Amount: 200_000,
      prize4Amount: 20_000,
      prize5Amount: 2_000,
      prize6Amount: 400,
      prize7Amount: 400,
    },
  });

  console.log("Seeding players...");
  const players: { id: number; name: string }[] = [];
  for (const name of PLAYER_NAMES) {
    const player = await prisma.player.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    players.push(player);
  }

  async function addRandomBets(drawId: number, count: number) {
    for (let i = 0; i < count; i++) {
      const player = players[Math.floor(Math.random() * players.length)];
      await prisma.bet.create({
        data: {
          drawId,
          playerId: player.id,
          numbers: pickUniqueRandomNumbers(6, 1, 49),
        },
      });
    }
  }

  // Round 1（已開獎，頭獎從缺，示範獎池累積到下一期）
  const draw1 = await prisma.draw.create({
    data: {
      status: "PENDING",
      drawTime: getNextDrawTime(),
      basePoolAmount: 5_000_000,
    },
  });
  await addRandomBets(draw1.id, 18);
  const result1 = await executeDrawForRound(draw1.id);
  console.log(
    `第 ${draw1.id} 期開獎：${result1.numbers.join(",")} + ${result1.specialNumber}（頭獎從缺，獎池累積）`
  );

  // Round 2（已開獎，埋一注保證中頭獎，示範獎池重置回底金）
  const draw2Id = result1.nextDrawId;
  const plantedDraw = generateDrawNumbers();
  await addRandomBets(draw2Id, 17);
  await prisma.bet.create({
    data: { drawId: draw2Id, playerId: players[0].id, numbers: plantedDraw.numbers },
  });
  const result2 = await executeDrawForRound(draw2Id, plantedDraw);
  console.log(
    `第 ${draw2Id} 期開獎：${result2.numbers.join(",")} + ${result2.specialNumber}（${players[0].name} 中頭獎，獎池重置）`
  );

  // Round 3（已開獎，正常情況）
  const draw3Id = result2.nextDrawId;
  await addRandomBets(draw3Id, 18);
  const result3 = await executeDrawForRound(draw3Id);
  console.log(`第 ${draw3Id} 期開獎：${result3.numbers.join(",")} + ${result3.specialNumber}`);

  // Round 4（目前期，尚未開獎，已有下注）
  const draw4Id = result3.nextDrawId;
  await addRandomBets(draw4Id, 12);
  console.log(`第 ${draw4Id} 期為目前期，尚未開獎，已有 12 注下注資料`);

  console.log("Seed 完成。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
