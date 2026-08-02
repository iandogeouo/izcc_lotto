-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "drawId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "numbers" JSONB NOT NULL,
    "betAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedCount" INTEGER,
    "matchedSpecial" BOOLEAN,
    "prizeTier" TEXT,
    "prizeAmount" INTEGER,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bet_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bet" ("betAt", "createdAt", "drawId", "id", "matchedCount", "matchedSpecial", "numbers", "playerId", "prizeAmount", "prizeTier", "updatedAt") SELECT "betAt", "createdAt", "drawId", "id", "matchedCount", "matchedSpecial", "numbers", "playerId", "prizeAmount", "prizeTier", "updatedAt" FROM "Bet";
DROP TABLE "Bet";
ALTER TABLE "new_Bet" RENAME TO "Bet";
CREATE INDEX "Bet_drawId_idx" ON "Bet"("drawId");
CREATE INDEX "Bet_playerId_idx" ON "Bet"("playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
