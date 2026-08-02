-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "drawTime" DATETIME NOT NULL,
    "drawnAt" DATETIME,
    "numbers" JSONB,
    "specialNumber" INTEGER,
    "basePoolAmount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "drawId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "numbers" JSONB NOT NULL,
    "betAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedCount" INTEGER,
    "matchedSpecial" BOOLEAN,
    "prizeTier" TEXT,
    "prizeAmount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bet_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "betPrice" INTEGER NOT NULL DEFAULT 50,
    "baseJackpotAmount" INTEGER NOT NULL DEFAULT 5000000,
    "prize2Amount" INTEGER NOT NULL DEFAULT 3000000,
    "prize3Amount" INTEGER NOT NULL DEFAULT 200000,
    "prize4Amount" INTEGER NOT NULL DEFAULT 20000,
    "prize5Amount" INTEGER NOT NULL DEFAULT 2000,
    "prize6Amount" INTEGER NOT NULL DEFAULT 400,
    "prize7Amount" INTEGER NOT NULL DEFAULT 400
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");

-- CreateIndex
CREATE INDEX "Draw_status_idx" ON "Draw"("status");

-- CreateIndex
CREATE INDEX "Bet_drawId_idx" ON "Bet"("drawId");

-- CreateIndex
CREATE INDEX "Bet_playerId_idx" ON "Bet"("playerId");
