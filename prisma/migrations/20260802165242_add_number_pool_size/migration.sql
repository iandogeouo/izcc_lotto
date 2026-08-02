-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "numberPoolSize" INTEGER NOT NULL DEFAULT 20,
    "betPrice" INTEGER NOT NULL DEFAULT 50,
    "baseJackpotAmount" INTEGER NOT NULL DEFAULT 5000000,
    "prize2Amount" INTEGER NOT NULL DEFAULT 3000000,
    "prize3Amount" INTEGER NOT NULL DEFAULT 200000,
    "prize4Amount" INTEGER NOT NULL DEFAULT 20000,
    "prize5Amount" INTEGER NOT NULL DEFAULT 2000,
    "prize6Amount" INTEGER NOT NULL DEFAULT 400,
    "prize7Amount" INTEGER NOT NULL DEFAULT 400
);
INSERT INTO "new_Settings" ("baseJackpotAmount", "betPrice", "id", "prize2Amount", "prize3Amount", "prize4Amount", "prize5Amount", "prize6Amount", "prize7Amount") SELECT "baseJackpotAmount", "betPrice", "id", "prize2Amount", "prize3Amount", "prize4Amount", "prize5Amount", "prize6Amount", "prize7Amount" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
