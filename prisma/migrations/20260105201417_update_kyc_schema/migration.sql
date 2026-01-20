-- CreateTable
CREATE TABLE "KYCDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "url" TEXT NOT NULL,
    "metadata" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KYCDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "KYCProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KYCProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "documentType" TEXT,
    "documentUrl" TEXT,
    "selfieUrl" TEXT,
    "verifiedAt" DATETIME,
    "lastCheckAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KYCProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KYCProfile" ("createdAt", "documentType", "documentUrl", "id", "riskLevel", "selfieUrl", "status", "updatedAt", "userId", "verifiedAt") SELECT "createdAt", "documentType", "documentUrl", "id", "riskLevel", "selfieUrl", "status", "updatedAt", "userId", "verifiedAt" FROM "KYCProfile";
DROP TABLE "KYCProfile";
ALTER TABLE "new_KYCProfile" RENAME TO "KYCProfile";
CREATE UNIQUE INDEX "KYCProfile_userId_key" ON "KYCProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
